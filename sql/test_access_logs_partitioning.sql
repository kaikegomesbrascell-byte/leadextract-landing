-- Test script for access_logs partitioning
-- This script verifies that the partitioning is working correctly

-- 1. Check if table is partitioned
SELECT 
  tablename, 
  'Is partitioned: ' || CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_partitioned_table 
      WHERE partrelid = (SELECT oid FROM pg_class WHERE relname = 'access_logs')
    ) THEN 'YES' 
    ELSE 'NO' 
  END AS status
FROM pg_tables 
WHERE tablename = 'access_logs';

-- 2. List all partitions with their ranges
SELECT 
  child.relname AS partition_name,
  pg_get_expr(child.relpartbound, child.oid) AS partition_range,
  pg_size_pretty(pg_total_relation_size(child.oid)) AS size
FROM pg_inherits
JOIN pg_class parent ON pg_inherits.inhparent = parent.oid
JOIN pg_class child ON pg_inherits.inhrelid = child.oid
WHERE parent.relname = 'access_logs'
ORDER BY partition_name;

-- 3. Test insert into different months
DO $$
DECLARE
  test_user_id UUID;
BEGIN
  -- Get a test user (or create one if needed)
  SELECT id INTO test_user_id FROM auth.users LIMIT 1;
  
  IF test_user_id IS NULL THEN
    RAISE NOTICE 'No users found in auth.users. Skipping insert tests.';
  ELSE
    -- Insert test records for different months
    INSERT INTO access_logs (
      user_id, endpoint, method, success, status_code, created_at
    ) VALUES 
      (test_user_id, '/api/test/jan', 'GET', true, 200, '2025-01-15'::timestamp),
      (test_user_id, '/api/test/feb', 'GET', true, 200, '2025-02-15'::timestamp),
      (test_user_id, '/api/test/mar', 'GET', true, 200, '2025-03-15'::timestamp);
    
    RAISE NOTICE 'Test records inserted successfully';
  END IF;
END $$;

-- 4. Verify which partition contains each record
SELECT 
  tableoid::regclass AS partition_name,
  endpoint,
  created_at
FROM access_logs
WHERE endpoint LIKE '/api/test/%'
ORDER BY created_at;

-- 5. Test partition pruning with EXPLAIN
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM access_logs 
WHERE created_at >= '2025-01-01' 
  AND created_at < '2025-02-01';

-- 6. Count records per partition
SELECT 
  tableoid::regclass AS partition_name,
  COUNT(*) AS record_count
FROM access_logs
GROUP BY tableoid::regclass
ORDER BY partition_name;

-- 7. Test the partition creation function
SELECT create_monthly_access_logs_partition();

-- 8. Verify new partition was created (if applicable)
SELECT 
  child.relname AS partition_name,
  pg_get_expr(child.relpartbound, child.oid) AS partition_range
FROM pg_inherits
JOIN pg_class parent ON pg_inherits.inhparent = parent.oid
JOIN pg_class child ON pg_inherits.inhrelid = child.oid
WHERE parent.relname = 'access_logs'
ORDER BY partition_name DESC
LIMIT 1;

-- 9. Test RLS policies
SET ROLE authenticated;
SELECT COUNT(*) AS accessible_logs FROM access_logs;
RESET ROLE;

-- 10. Cleanup test data
DELETE FROM access_logs WHERE endpoint LIKE '/api/test/%';

-- Summary
SELECT 
  'Partitioning Test Complete' AS status,
  COUNT(DISTINCT child.relname) AS total_partitions
FROM pg_inherits
JOIN pg_class parent ON pg_inherits.inhparent = parent.oid
JOIN pg_class child ON pg_inherits.inhrelid = child.oid
WHERE parent.relname = 'access_logs';
