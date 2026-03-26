# Updated_at Triggers - Quick Reference Guide

## Overview

The `update_updated_at_column()` function automatically updates the `updated_at` timestamp whenever a record is modified. This guide explains how it works and how to use it.

## How It Works

### The Function

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$ LANGUAGE plpgsql;
```

**What it does**: Sets the `updated_at` column to the current timestamp before any UPDATE operation.

### Tables Using This Trigger

| Table | Trigger Name | Created In |
|-------|-------------|------------|
| `subscriptions` | `update_subscriptions_updated_at` | 001_create_subscriptions_table.sql |
| `notification_queue` | `update_notification_queue_updated_at` | 003_create_notification_and_access_tables.sql |
| `customers` | `update_customers_updated_at` | setup.sql |
| `payments` | `update_payments_updated_at` | setup.sql |
| `users` | `update_users_updated_at` | setup.sql |

## Usage in Application Code

### ✅ DO: Just update the record

```javascript
// Node.js with Supabase client
const { data, error } = await supabase
  .from('subscriptions')
  .update({ status: 'ativo' })
  .eq('id', subscriptionId);

// updated_at is automatically set by the trigger
```

```sql
-- Direct SQL
UPDATE subscriptions 
SET status = 'ativo'
WHERE id = '123e4567-e89b-12d3-a456-426614174000';

-- updated_at is automatically set to NOW()
```

### ❌ DON'T: Manually set updated_at

```javascript
// NOT NEEDED - the trigger handles this
const { data, error } = await supabase
  .from('subscriptions')
  .update({ 
    status: 'ativo',
    updated_at: new Date() // ❌ Unnecessary
  })
  .eq('id', subscriptionId);
```

## Adding Triggers to New Tables

### Step 1: Add updated_at column to table

```sql
CREATE TABLE my_new_table (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  -- ... other columns ...
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Step 2: Create the trigger

```sql
CREATE TRIGGER update_my_new_table_updated_at 
  BEFORE UPDATE ON my_new_table
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
```

**That's it!** The trigger will now automatically update `updated_at` on every UPDATE.

## Testing

### Quick Test

```sql
-- 1. Insert a record
INSERT INTO subscriptions (user_id, plan_id, status)
VALUES ('<user-id>', 'start', 'pendente')
RETURNING id, created_at, updated_at;

-- Note the timestamps

-- 2. Wait a moment, then update
SELECT pg_sleep(1);

UPDATE subscriptions 
SET status = 'ativo'
WHERE id = '<subscription-id>'
RETURNING created_at, updated_at;

-- updated_at should be newer than created_at
```

### Comprehensive Test

Run the full test suite:

```sql
\i sql/test_updated_at_triggers.sql
```

## Troubleshooting

### Problem: Trigger not firing

**Check if trigger exists:**
```sql
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND event_object_table = 'your_table_name';
```

**Check if function exists:**
```sql
SELECT proname 
FROM pg_proc 
WHERE proname = 'update_updated_at_column';
```

**Solution:** Run the migration:
```sql
\i sql/005_create_updated_at_function.sql
```

### Problem: updated_at not changing

**Possible causes:**
1. No actual changes to the row (PostgreSQL optimizes away no-op updates)
2. Trigger is disabled
3. Function doesn't exist

**Check trigger status:**
```sql
SELECT tgname, tgenabled
FROM pg_trigger
WHERE tgname LIKE '%updated_at%';
```

- `tgenabled = 'O'` means enabled
- `tgenabled = 'D'` means disabled

**Enable trigger:**
```sql
ALTER TABLE your_table ENABLE TRIGGER update_your_table_updated_at;
```

### Problem: Timezone confusion

**Remember:**
- `NOW()` returns `TIMESTAMP WITH TIME ZONE`
- PostgreSQL stores timestamps in UTC
- Display timezone is handled by client/application

**Check current timezone:**
```sql
SHOW timezone;
```

**Convert to specific timezone:**
```sql
SELECT updated_at AT TIME ZONE 'America/Sao_Paulo' 
FROM subscriptions;
```

## Performance Considerations

### Impact

- **Minimal overhead**: Triggers execute at database level, very fast
- **No network round-trip**: Unlike application-level updates
- **Atomic**: Guaranteed to execute with the UPDATE

### Bulk Operations

For large bulk updates where you don't need updated_at tracking:

```sql
-- Temporarily disable trigger
ALTER TABLE subscriptions DISABLE TRIGGER update_subscriptions_updated_at;

-- Perform bulk operation
UPDATE subscriptions SET extractions_used = 0;

-- Re-enable trigger
ALTER TABLE subscriptions ENABLE TRIGGER update_subscriptions_updated_at;
```

**⚠️ Warning**: Only disable triggers if you understand the implications!

## Best Practices

### ✅ DO

- Let the trigger handle `updated_at` automatically
- Use `TIMESTAMP WITH TIME ZONE` for all timestamp columns
- Test triggers after creating new tables
- Document which tables have the trigger

### ❌ DON'T

- Manually set `updated_at` in application code
- Disable triggers without good reason
- Use `TIMESTAMP` without timezone
- Forget to create the trigger on new tables with `updated_at` column

## Examples

### Example 1: Subscription Activation

```javascript
// Backend webhook handler
async function activateSubscription(userId, planId) {
  const { data, error } = await supabase
    .from('subscriptions')
    .update({
      status: 'ativo',
      activated_at: new Date(),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    })
    .eq('user_id', userId)
    .eq('plan_id', planId);
  
  // updated_at is automatically set by trigger
  return data;
}
```

### Example 2: Notification Status Update

```javascript
// Email worker
async function markNotificationSent(notificationId) {
  const { data, error } = await supabase
    .from('notification_queue')
    .update({
      status: 'sent',
      sent_at: new Date()
    })
    .eq('id', notificationId);
  
  // updated_at is automatically set by trigger
  return data;
}
```

### Example 3: Querying Recent Updates

```sql
-- Find subscriptions updated in the last hour
SELECT id, user_id, status, updated_at
FROM subscriptions
WHERE updated_at > NOW() - INTERVAL '1 hour'
ORDER BY updated_at DESC;
```

## Related Documentation

- [TASK_2.3_IMPLEMENTATION_SUMMARY.md](./TASK_2.3_IMPLEMENTATION_SUMMARY.md) - Detailed implementation notes
- [README.md](./README.md) - Migration execution order
- [PostgreSQL Trigger Documentation](https://www.postgresql.org/docs/current/sql-createtrigger.html)

## Summary

The `update_updated_at_column()` function and its triggers provide automatic timestamp management for database tables. Simply create the trigger on any table with an `updated_at` column, and the timestamp will be automatically maintained without any application code changes.

**Key Takeaway**: You never need to manually set `updated_at` in your application code - the database handles it automatically! 🎉
