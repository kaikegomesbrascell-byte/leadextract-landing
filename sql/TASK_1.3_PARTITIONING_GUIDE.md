# Task 1.3: Access Logs Table Partitioning Implementation

## Overview

This document describes the implementation of monthly partitioning for the `access_logs` table to improve query performance as the table grows over time.

## What Was Implemented

### 1. Partitioned Table Structure
- Converted `access_logs` from a regular table to a **range-partitioned table** based on `created_at` timestamp
- Each partition contains one month of data
- Primary key includes both `id` and `created_at` (required for partitioning)

### 2. Initial Partitions
Created 6 months of partitions (January 2025 - June 2025):
- `access_logs_y2025m01` (Jan 2025)
- `access_logs_y2025m02` (Feb 2025)
- `access_logs_y2025m03` (Mar 2025)
- `access_logs_y2025m04` (Apr 2025)
- `access_logs_y2025m05` (May 2025)
- `access_logs_y2025m06` (Jun 2025)

### 3. Indexes
All indexes from the original table were recreated:
- `idx_access_logs_user_id` - For filtering by user
- `idx_access_logs_created_at` - For time-based queries
- `idx_access_logs_success` - For filtering by success status
- `idx_access_logs_endpoint` - For filtering by endpoint

### 4. Row Level Security (RLS)
RLS policies were preserved:
- Users can view their own access logs
- Service role can manage all access logs

### 5. Partition Management Function
Created `create_monthly_access_logs_partition()` function that automatically creates the next month's partition.

## Benefits of Partitioning

1. **Improved Query Performance**: Queries with date filters only scan relevant partitions
2. **Easier Data Management**: Old partitions can be archived or dropped independently
3. **Better Maintenance**: Vacuum and analyze operations are faster on smaller partitions
4. **Scalability**: Table can grow to millions of rows without significant performance degradation

## Maintenance Requirements

### Monthly Partition Creation

**IMPORTANT**: New partitions must be created before the current month ends to avoid insert failures.

#### Option 1: Manual Creation (Recommended for now)
Run this query at the beginning of each month:
```sql
SELECT create_monthly_access_logs_partition();
```

#### Option 2: Automated with pg_cron (If available)
If Supabase has pg_cron extension enabled, uncomment the cron job in the migration file:
```sql
SELECT cron.schedule(
  'create-monthly-access-logs-partition',
  '0 0 1 * *', -- Run at midnight on the 1st of every month
  'SELECT create_monthly_access_logs_partition();'
);
```

### Checking Existing Partitions
```sql
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE tablename LIKE 'access_logs_y%'
ORDER BY tablename;
```

### Archiving Old Partitions
After 12+ months, consider archiving old partitions:
```sql
-- Example: Archive January 2025 data
-- 1. Export data (optional)
COPY (SELECT * FROM access_logs_y2025m01) TO '/path/to/backup/access_logs_2025_01.csv' CSV HEADER;

-- 2. Detach partition (makes it a standalone table)
ALTER TABLE access_logs DETACH PARTITION access_logs_y2025m01;

-- 3. Drop the detached table (or keep for archival)
DROP TABLE access_logs_y2025m01;
```

## Migration Instructions

### To Apply This Migration

1. **Backup**: Ensure you have a backup of the database
2. **Run Migration**: Execute `sql/004_add_access_logs_partitioning.sql`
3. **Verify**: Check that partitions were created successfully
4. **Test**: Insert a test record and verify it goes to the correct partition

### Verification Queries

```sql
-- Check if table is partitioned
SELECT 
  tablename, 
  partitioned 
FROM pg_tables 
WHERE tablename = 'access_logs';

-- List all partitions
SELECT 
  child.relname AS partition_name,
  pg_get_expr(child.relpartbound, child.oid) AS partition_range
FROM pg_inherits
JOIN pg_class parent ON pg_inherits.inhparent = parent.oid
JOIN pg_class child ON pg_inherits.inhrelid = child.oid
WHERE parent.relname = 'access_logs'
ORDER BY partition_name;

-- Test insert
INSERT INTO access_logs (
  user_id, endpoint, method, success, status_code, created_at
) VALUES (
  (SELECT id FROM auth.users LIMIT 1),
  '/api/test',
  'GET',
  true,
  200,
  '2025-01-15'::timestamp
);

-- Verify which partition contains the record
SELECT 
  tableoid::regclass AS partition_name,
  *
FROM access_logs
WHERE endpoint = '/api/test';
```

## Requirements Satisfied

- **Requirement 7.7**: Access logging with timestamp tracking
- **Requirement 10.4**: Persistent storage of access logs with performance optimization

## Performance Considerations

### Query Optimization
Always include `created_at` in WHERE clauses to leverage partition pruning:

```sql
-- Good: Uses partition pruning
SELECT * FROM access_logs 
WHERE user_id = 'xxx' 
  AND created_at >= '2025-01-01' 
  AND created_at < '2025-02-01';

-- Less optimal: Scans all partitions
SELECT * FROM access_logs 
WHERE user_id = 'xxx';
```

### Expected Performance
- **Without partitioning**: Full table scan on millions of rows
- **With partitioning**: Only scans relevant month partition (typically 1/12th of data)

## Troubleshooting

### Error: "no partition of relation found for row"
**Cause**: Trying to insert data for a month that doesn't have a partition yet.
**Solution**: Run `SELECT create_monthly_access_logs_partition();` to create the missing partition.

### Error: "partition already exists"
**Cause**: Trying to create a partition that already exists.
**Solution**: This is safe to ignore. The function checks for existence before creating.

## Future Enhancements

1. **Automatic Partition Creation**: Set up pg_cron job if extension becomes available
2. **Partition Retention Policy**: Automatically archive/drop partitions older than X months
3. **Compression**: Enable compression on older partitions to save storage
4. **Partition by User**: Consider sub-partitioning by user_id for very high-volume scenarios
