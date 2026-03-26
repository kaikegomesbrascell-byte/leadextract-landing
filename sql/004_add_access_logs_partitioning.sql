-- Migration: Add monthly partitioning to access_logs table
-- Requirements: 7.7, 10.4
-- Description: Converts access_logs to a partitioned table for better performance with large datasets

-- Step 1: Rename the existing table
ALTER TABLE access_logs RENAME TO access_logs_old;

-- Step 2: Create the new partitioned table with the same structure
CREATE TABLE access_logs (
  id UUID DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Dados do acesso
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  
  -- Resultado
  success BOOLEAN NOT NULL,
  status_code INTEGER,
  error_message TEXT,
  
  -- Verificação de pagamento
  payment_status_checked TEXT,
  payment_status_result TEXT,
  
  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Step 3: Create partitions for current and upcoming months
-- January 2025
CREATE TABLE access_logs_y2025m01 PARTITION OF access_logs
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- February 2025
CREATE TABLE access_logs_y2025m02 PARTITION OF access_logs
  FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

-- March 2025
CREATE TABLE access_logs_y2025m03 PARTITION OF access_logs
  FOR VALUES FROM ('2025-03-01') TO ('2025-04-01');

-- April 2025
CREATE TABLE access_logs_y2025m04 PARTITION OF access_logs
  FOR VALUES FROM ('2025-04-01') TO ('2025-05-01');

-- May 2025
CREATE TABLE access_logs_y2025m05 PARTITION OF access_logs
  FOR VALUES FROM ('2025-05-01') TO ('2025-06-01');

-- June 2025
CREATE TABLE access_logs_y2025m06 PARTITION OF access_logs
  FOR VALUES FROM ('2025-06-01') TO ('2025-07-01');

-- Step 4: Copy data from old table to new partitioned table (if any exists)
INSERT INTO access_logs 
SELECT * FROM access_logs_old;

-- Step 5: Drop the old table
DROP TABLE access_logs_old;

-- Step 6: Recreate indexes on the partitioned table
CREATE INDEX idx_access_logs_user_id ON access_logs(user_id);
CREATE INDEX idx_access_logs_created_at ON access_logs(created_at);
CREATE INDEX idx_access_logs_success ON access_logs(success);
CREATE INDEX idx_access_logs_endpoint ON access_logs(endpoint);

-- Step 7: Re-enable RLS for access_logs
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;

-- Step 8: Recreate RLS policies
CREATE POLICY "Users can view own access logs"
  ON access_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all access logs"
  ON access_logs FOR ALL
  USING (auth.role() = 'service_role');

-- Step 9: Create a function to automatically create new partitions
CREATE OR REPLACE FUNCTION create_monthly_access_logs_partition()
RETURNS void AS $$
DECLARE
  partition_date DATE;
  partition_name TEXT;
  start_date TEXT;
  end_date TEXT;
BEGIN
  -- Create partition for next month
  partition_date := DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month');
  partition_name := 'access_logs_y' || TO_CHAR(partition_date, 'YYYY') || 'm' || TO_CHAR(partition_date, 'MM');
  start_date := TO_CHAR(partition_date, 'YYYY-MM-DD');
  end_date := TO_CHAR(partition_date + INTERVAL '1 month', 'YYYY-MM-DD');
  
  -- Check if partition already exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_class WHERE relname = partition_name
  ) THEN
    EXECUTE format(
      'CREATE TABLE %I PARTITION OF access_logs FOR VALUES FROM (%L) TO (%L)',
      partition_name, start_date, end_date
    );
    RAISE NOTICE 'Created partition: %', partition_name;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Step 10: Create a scheduled job to create partitions monthly (requires pg_cron extension)
-- Note: This requires pg_cron extension to be enabled in Supabase
-- Uncomment the following lines if pg_cron is available:
-- SELECT cron.schedule(
--   'create-monthly-access-logs-partition',
--   '0 0 1 * *', -- Run at midnight on the 1st of every month
--   'SELECT create_monthly_access_logs_partition();'
-- );

-- Alternative: Manual partition creation reminder
COMMENT ON FUNCTION create_monthly_access_logs_partition() IS 
  'Run this function monthly to create the next month partition. 
   Example: SELECT create_monthly_access_logs_partition();';
