# Access Logger Middleware - Usage Examples

## Quick Start

The access logger middleware is already integrated in `server.js` and logs all requests automatically.

## Example 1: Basic Usage (Already Configured)

```javascript
const express = require('express');
const { accessLogger } = require('./middleware/auth');

const app = express();

// Apply globally to all routes
app.use(accessLogger);

// All routes below will be logged automatically
app.get('/api/users', (req, res) => {
  res.json({ users: [] });
});
```

## Example 2: With Authentication

```javascript
const { verifyToken, accessLogger } = require('./middleware/auth');

// Access logger captures user data from verifyToken
app.get('/api/profile', verifyToken, (req, res) => {
  // req.user is available from verifyToken
  // accessLogger will log user_id automatically
  res.json({ user: req.user });
});
```

## Example 3: With Payment Verification

```javascript
const { verifyToken, checkPaymentStatus, accessLogger } = require('./middleware/auth');

// Access logger captures payment verification results
app.get('/api/premium', verifyToken, checkPaymentStatus, (req, res) => {
  // req.subscription is available from checkPaymentStatus
  // accessLogger will log payment_status_checked = "yes"
  // and payment_status_result = req.subscription.status
  res.json({ data: 'premium content' });
});
```

## Example 4: Viewing Logs

### SQL Query - Recent Logs

```sql
SELECT 
  user_id,
  endpoint,
  method,
  status_code,
  success,
  payment_status_result,
  created_at
FROM access_logs
ORDER BY created_at DESC
LIMIT 20;
```

### SQL Query - Failed Requests

```sql
SELECT 
  endpoint,
  method,
  status_code,
  error_message,
  COUNT(*) as count
FROM access_logs
WHERE success = false
  AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY endpoint, method, status_code, error_message
ORDER BY count DESC;
```

### SQL Query - User Activity

```sql
SELECT 
  user_id,
  COUNT(*) as total_requests,
  SUM(CASE WHEN success THEN 1 ELSE 0 END) as successful,
  SUM(CASE WHEN NOT success THEN 1 ELSE 0 END) as failed,
  MAX(created_at) as last_access
FROM access_logs
WHERE user_id = 'YOUR_USER_ID_HERE'
GROUP BY user_id;
```

## Example 5: Testing the Middleware

### Manual Test

```bash
# Start the server
cd backend
npm start

# Make a test request
curl http://localhost:3001/api/public

# Check the logs in Supabase
# You should see a new entry in access_logs table
```

### Integration Test

```bash
# Run the integration test
node backend/middleware/accessLogger.integration.test.js
```

## Example 6: Log Output

### Console Output

When a request is logged, you'll see output like:

```
📝 Access log: GET /api/users - 200 (45ms) - User: a1b2c3d4-e5f6-7890-abcd-ef1234567890
📝 Access log: POST /api/payment/pix - 200 (123ms) - User: anonymous
📝 Access log: GET /api/protected - 401 (12ms) - User: anonymous
```

### Database Entry

```json
{
  "id": "f1e2d3c4-b5a6-7890-1234-567890abcdef",
  "user_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "endpoint": "/api/lead-extractor/extract",
  "method": "POST",
  "ip_address": "192.168.1.100",
  "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "success": true,
  "status_code": 200,
  "error_message": null,
  "payment_status_checked": "yes",
  "payment_status_result": "ativo",
  "created_at": "2025-01-15T10:30:00.000Z"
}
```

## Example 7: Analytics Dashboard Query

```sql
-- Daily request statistics
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_requests,
  SUM(CASE WHEN success THEN 1 ELSE 0 END) as successful,
  SUM(CASE WHEN NOT success THEN 1 ELSE 0 END) as failed,
  ROUND(100.0 * SUM(CASE WHEN success THEN 1 ELSE 0 END) / COUNT(*), 2) as success_rate
FROM access_logs
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

## Example 8: Security Monitoring

```sql
-- Detect suspicious activity (multiple failed attempts)
SELECT 
  ip_address,
  user_agent,
  COUNT(*) as failed_attempts,
  MAX(created_at) as last_attempt
FROM access_logs
WHERE success = false
  AND created_at > NOW() - INTERVAL '1 hour'
GROUP BY ip_address, user_agent
HAVING COUNT(*) > 10
ORDER BY failed_attempts DESC;
```

## Example 9: Payment Verification Tracking

```sql
-- Track payment verification results
SELECT 
  payment_status_result,
  COUNT(*) as count,
  SUM(CASE WHEN success THEN 1 ELSE 0 END) as allowed,
  SUM(CASE WHEN NOT success THEN 1 ELSE 0 END) as blocked
FROM access_logs
WHERE payment_status_checked = 'yes'
  AND created_at > NOW() - INTERVAL '7 days'
GROUP BY payment_status_result
ORDER BY count DESC;
```

## Example 10: Custom Middleware Chain

```javascript
// Custom middleware that uses access logger
const { accessLogger, verifyToken, checkPaymentStatus } = require('./middleware/auth');
const { rateLimiter } = require('./middleware/rateLimiter');

// Apply in specific order
app.use(accessLogger);      // 1. Log all requests
app.use(rateLimiter);       // 2. Rate limiting

// Protected route with full middleware chain
app.get('/api/premium/data',
  verifyToken,              // 3. Verify authentication
  checkPaymentStatus,       // 4. Check payment status
  (req, res) => {
    // All middleware data is logged by accessLogger
    res.json({ data: 'premium' });
  }
);
```

## Troubleshooting

### Issue: Logs not appearing in database

**Solution:**
1. Check Supabase connection:
```javascript
// Test Supabase connection
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(supabaseUrl, supabaseServiceKey);

supabase.from('access_logs').select('count').then(console.log);
```

2. Check table exists:
```sql
SELECT * FROM information_schema.tables WHERE table_name = 'access_logs';
```

3. Check RLS policies:
```sql
SELECT * FROM pg_policies WHERE tablename = 'access_logs';
```

### Issue: Duplicate logs

**Solution:**
- The middleware has built-in duplicate prevention
- Check if middleware is applied multiple times
- Verify only one instance of the server is running

### Issue: Performance degradation

**Solution:**
1. Check table size:
```sql
SELECT pg_size_pretty(pg_total_relation_size('access_logs'));
```

2. Implement retention policy:
```sql
DELETE FROM access_logs WHERE created_at < NOW() - INTERVAL '90 days';
```

3. Add partitioning for large tables (see ACCESS_LOGGER_GUIDE.md)

## Best Practices

1. ✅ Apply accessLogger early in middleware chain
2. ✅ Apply after CORS and body parser
3. ✅ Apply before authentication middleware
4. ✅ Implement log retention policies
5. ✅ Monitor database size regularly
6. ✅ Use indexes for common queries
7. ✅ Consider partitioning for high-volume applications

## Additional Resources

- **Full Documentation:** `ACCESS_LOGGER_GUIDE.md`
- **Implementation Details:** `TASK_3.4_IMPLEMENTATION_SUMMARY.md`
- **Integration Tests:** `accessLogger.integration.test.js`
- **Unit Tests:** `accessLogger.test.js`
