-- Test script for update_updated_at_column() function and triggers
-- This script verifies that the updated_at timestamp is automatically updated
-- when records in subscriptions and notification_queue tables are modified.

-- Test 1: Verify function exists
SELECT 
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as arguments,
    l.lanname as language
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
JOIN pg_language l ON p.prolang = l.oid
WHERE n.nspname = 'public' 
AND p.proname = 'update_updated_at_column';

-- Test 2: Verify triggers exist
SELECT 
    trigger_name,
    event_object_table as table_name,
    action_timing,
    event_manipulation as event
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND trigger_name IN (
    'update_subscriptions_updated_at',
    'update_notification_queue_updated_at'
)
ORDER BY event_object_table;

-- Test 3: Test subscriptions trigger (requires a test user)
-- Note: This test requires auth.users to have at least one user
-- You may need to create a test user first via Supabase Auth

DO $
DECLARE
    test_user_id UUID;
    test_subscription_id UUID;
    initial_updated_at TIMESTAMP WITH TIME ZONE;
    new_updated_at TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get a test user (or create one if needed)
    SELECT id INTO test_user_id FROM auth.users LIMIT 1;
    
    IF test_user_id IS NULL THEN
        RAISE NOTICE 'No users found in auth.users. Skipping subscriptions trigger test.';
        RAISE NOTICE 'Create a user via Supabase Auth to test the trigger.';
    ELSE
        -- Insert a test subscription
        INSERT INTO subscriptions (user_id, plan_id, status)
        VALUES (test_user_id, 'start', 'pendente')
        RETURNING id, updated_at INTO test_subscription_id, initial_updated_at;
        
        RAISE NOTICE 'Created test subscription with id: %', test_subscription_id;
        RAISE NOTICE 'Initial updated_at: %', initial_updated_at;
        
        -- Wait a moment to ensure timestamp difference
        PERFORM pg_sleep(1);
        
        -- Update the subscription
        UPDATE subscriptions 
        SET status = 'ativo'
        WHERE id = test_subscription_id
        RETURNING updated_at INTO new_updated_at;
        
        RAISE NOTICE 'New updated_at: %', new_updated_at;
        
        -- Verify the trigger worked
        IF new_updated_at > initial_updated_at THEN
            RAISE NOTICE 'SUCCESS: subscriptions trigger is working correctly!';
        ELSE
            RAISE WARNING 'FAILED: subscriptions trigger did not update updated_at';
        END IF;
        
        -- Clean up test data
        DELETE FROM subscriptions WHERE id = test_subscription_id;
        RAISE NOTICE 'Cleaned up test subscription';
    END IF;
END;
$;

-- Test 4: Test notification_queue trigger
DO $
DECLARE
    test_user_id UUID;
    test_notification_id UUID;
    initial_updated_at TIMESTAMP WITH TIME ZONE;
    new_updated_at TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get a test user
    SELECT id INTO test_user_id FROM auth.users LIMIT 1;
    
    IF test_user_id IS NULL THEN
        RAISE NOTICE 'No users found in auth.users. Skipping notification_queue trigger test.';
        RAISE NOTICE 'Create a user via Supabase Auth to test the trigger.';
    ELSE
        -- Insert a test notification
        INSERT INTO notification_queue (user_id, type, subject, body)
        VALUES (test_user_id, 'welcome', 'Test Subject', 'Test Body')
        RETURNING id, updated_at INTO test_notification_id, initial_updated_at;
        
        RAISE NOTICE 'Created test notification with id: %', test_notification_id;
        RAISE NOTICE 'Initial updated_at: %', initial_updated_at;
        
        -- Wait a moment to ensure timestamp difference
        PERFORM pg_sleep(1);
        
        -- Update the notification
        UPDATE notification_queue 
        SET status = 'sent'
        WHERE id = test_notification_id
        RETURNING updated_at INTO new_updated_at;
        
        RAISE NOTICE 'New updated_at: %', new_updated_at;
        
        -- Verify the trigger worked
        IF new_updated_at > initial_updated_at THEN
            RAISE NOTICE 'SUCCESS: notification_queue trigger is working correctly!';
        ELSE
            RAISE WARNING 'FAILED: notification_queue trigger did not update updated_at';
        END IF;
        
        -- Clean up test data
        DELETE FROM notification_queue WHERE id = test_notification_id;
        RAISE NOTICE 'Cleaned up test notification';
    END IF;
END;
$;

-- Summary
SELECT 
    'Test Complete' as status,
    'Check the NOTICE messages above for test results' as message;
