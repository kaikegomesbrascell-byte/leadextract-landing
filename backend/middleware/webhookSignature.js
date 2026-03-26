const crypto = require('crypto');

/**
 * Webhook Signature Validation Middleware
 * 
 * Validates HMAC signatures for incoming SigiloPay webhooks to ensure
 * they are genuinely from the payment gateway and haven't been tampered with.
 * 
 * Requirements: 6.6 - Webhook validation and error handling
 * 
 * @param {Object} options - Configuration options
 * @param {string} options.secret - Secret key for HMAC validation (defaults to SIGILOPAY_SECRET_KEY)
 * @param {string} options.header - Header name containing the signature (default: 'x-signature')
 * @param {string} options.algorithm - HMAC algorithm (default: 'sha256')
 * @returns {Function} Express middleware function
 */
function validateWebhookSignature(options = {}) {
  const {
    secret = process.env.SIGILOPAY_WEBHOOK_SECRET || process.env.SIGILOPAY_SECRET_KEY,
    header = 'x-signature',
    algorithm = 'sha256'
  } = options;

  return (req, res, next) => {
    try {
      // Get signature from header
      const receivedSignature = req.headers[header.toLowerCase()];

      if (!receivedSignature) {
        console.warn('⚠️ Webhook signature missing in headers');
        return res.status(401).json({
          success: false,
          error: 'Webhook signature missing',
          message: 'Invalid webhook request: signature header not found'
        });
      }

      if (!secret) {
        console.error('❌ Webhook secret not configured');
        return res.status(500).json({
          success: false,
          error: 'Server configuration error',
          message: 'Webhook validation is not properly configured'
        });
      }

      // Get raw body for signature validation
      // Note: req.body should be the raw string, not parsed JSON
      // This requires using express.raw() or express.text() middleware before this one
      const payload = typeof req.body === 'string' 
        ? req.body 
        : JSON.stringify(req.body);

      // Calculate expected signature
      const hmac = crypto.createHmac(algorithm, secret);
      hmac.update(payload);
      const expectedSignature = hmac.digest('hex');

      // Compare signatures using timing-safe comparison
      const isValid = crypto.timingSafeEqual(
        Buffer.from(receivedSignature),
        Buffer.from(expectedSignature)
      );

      if (!isValid) {
        console.warn('⚠️ Invalid webhook signature received');
        console.debug('Expected:', expectedSignature);
        console.debug('Received:', receivedSignature);
        
        return res.status(401).json({
          success: false,
          error: 'Invalid signature',
          message: 'Webhook signature validation failed'
        });
      }

      // Signature is valid, proceed to next middleware
      console.log('✅ Webhook signature validated successfully');
      next();

    } catch (error) {
      console.error('❌ Error validating webhook signature:', error);
      
      // Handle buffer length mismatch in timingSafeEqual
      if (error.message.includes('Input buffers must have the same length')) {
        return res.status(401).json({
          success: false,
          error: 'Invalid signature format',
          message: 'Webhook signature validation failed'
        });
      }

      return res.status(500).json({
        success: false,
        error: 'Signature validation error',
        message: 'An error occurred while validating webhook signature'
      });
    }
  };
}

/**
 * Alternative validation for timestamp-based signatures
 * Some payment gateways include a timestamp to prevent replay attacks
 * 
 * @param {Object} options - Configuration options
 * @param {string} options.secret - Secret key for HMAC validation
 * @param {string} options.signatureHeader - Header name containing the signature
 * @param {string} options.timestampHeader - Header name containing the timestamp
 * @param {number} options.toleranceSeconds - Maximum age of webhook in seconds (default: 300)
 * @returns {Function} Express middleware function
 */
function validateWebhookSignatureWithTimestamp(options = {}) {
  const {
    secret = process.env.SIGILOPAY_WEBHOOK_SECRET || process.env.SIGILOPAY_SECRET_KEY,
    signatureHeader = 'x-signature',
    timestampHeader = 'x-timestamp',
    toleranceSeconds = 300 // 5 minutes
  } = options;

  return (req, res, next) => {
    try {
      const receivedSignature = req.headers[signatureHeader.toLowerCase()];
      const timestamp = req.headers[timestampHeader.toLowerCase()];

      if (!receivedSignature || !timestamp) {
        console.warn('⚠️ Webhook signature or timestamp missing');
        return res.status(401).json({
          success: false,
          error: 'Missing signature or timestamp',
          message: 'Invalid webhook request'
        });
      }

      // Check timestamp to prevent replay attacks
      const currentTime = Math.floor(Date.now() / 1000);
      const webhookTime = parseInt(timestamp, 10);

      if (isNaN(webhookTime)) {
        console.warn('⚠️ Invalid timestamp format');
        return res.status(401).json({
          success: false,
          error: 'Invalid timestamp',
          message: 'Webhook timestamp is not valid'
        });
      }

      const timeDifference = Math.abs(currentTime - webhookTime);

      if (timeDifference > toleranceSeconds) {
        console.warn(`⚠️ Webhook timestamp too old: ${timeDifference}s`);
        return res.status(401).json({
          success: false,
          error: 'Timestamp expired',
          message: 'Webhook request is too old'
        });
      }

      // Validate signature with timestamp included
      const payload = typeof req.body === 'string' 
        ? req.body 
        : JSON.stringify(req.body);
      
      const signedPayload = `${timestamp}.${payload}`;
      
      const hmac = crypto.createHmac('sha256', secret);
      hmac.update(signedPayload);
      const expectedSignature = hmac.digest('hex');

      const isValid = crypto.timingSafeEqual(
        Buffer.from(receivedSignature),
        Buffer.from(expectedSignature)
      );

      if (!isValid) {
        console.warn('⚠️ Invalid webhook signature with timestamp');
        return res.status(401).json({
          success: false,
          error: 'Invalid signature',
          message: 'Webhook signature validation failed'
        });
      }

      console.log('✅ Webhook signature with timestamp validated successfully');
      next();

    } catch (error) {
      console.error('❌ Error validating webhook signature with timestamp:', error);
      
      if (error.message.includes('Input buffers must have the same length')) {
        return res.status(401).json({
          success: false,
          error: 'Invalid signature format',
          message: 'Webhook signature validation failed'
        });
      }

      return res.status(500).json({
        success: false,
        error: 'Signature validation error',
        message: 'An error occurred while validating webhook signature'
      });
    }
  };
}

/**
 * Middleware to capture raw body for signature validation
 * Must be used before express.json() middleware
 * 
 * Usage:
 * app.use('/api/webhooks', captureRawBody);
 * app.use(express.json());
 * app.post('/api/webhooks/payment', validateWebhookSignature(), handler);
 */
function captureRawBody(req, res, next) {
  let data = '';
  
  req.on('data', chunk => {
    data += chunk;
  });
  
  req.on('end', () => {
    req.rawBody = data;
    next();
  });
}

module.exports = {
  validateWebhookSignature,
  validateWebhookSignatureWithTimestamp,
  captureRawBody
};
