-- Migration: Ensure update_updated_at_column() function exists
-- Requirements: 10.1, 10.2
-- Description: Creates the update_updated_at_column() function if it doesn't exist.
--              This function is used by triggers on subscriptions and notification_queue tables.
--              
-- Note: This function may already exist from setup.sql. This migration ensures
--       it exists before the triggers in 001 and 003 are created.

-- Create or replace the function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Verify the function was created
DO $
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public' 
        AND p.proname = 'update_updated_at_column'
    ) THEN
        RAISE NOTICE 'Function update_updated_at_column() created successfully';
    ELSE
        RAISE EXCEPTION 'Failed to create function update_updated_at_column()';
    END IF;
END;
$;
