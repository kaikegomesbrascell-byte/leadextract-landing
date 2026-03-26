const crypto = require('crypto');
const { validateWebhookSignature, validateWebhookSignatureWithTimestamp, captureRawBody } = require('./webhookSignature');

describe('Webhook Signature Validation', () => {
  let req, res, next;
  const testSecret = 'test-webhook-secret-key';
  const testPayload = JSON.stringify({ event: 'payment.approved', transactionId: '123' });

  beforeEach(() => {
    req = {
      headers: {},
      body: testPayload
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
    
    // Set environment variable for tests
    process.env.SIGILOPAY_WEBHOOK_SECRET = testSecret;
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.SIGILOPAY_WEBHOOK_SECRET;
  });

  describe('validateWebhookSignature', () => {
    function generateSignature(payload, secret) {
      const hmac = crypto.createHmac('sha256', secret);
      hmac.update(payload);
      return hmac.digest('hex');
    }

    test('should accept valid signature', () => {
      const validSignature = generateSignature(testPayload, testSecret);
      req.headers['x-signature'] = validSignature;

      const middleware = validateWebhookSignature();
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should reject missing signature', () => {
      const middleware = validateWebhookSignature();
      middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Webhook signature missing',
        message: 'Invalid webhook request: signature header not found'
      });
    });

    test('should reject invalid signature', () => {
      req.headers['x-signature'] = 'invalid-signature-12345';

      const middleware = validateWebhookSignature();
      middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid signature format',
        message: 'Webhook signature validation failed'
      });
    });

    test('should reject tampered payload', () => {
      const validSignature = generateSignature(testPayload, testSecret);
      req.headers['x-signature'] = validSignature;
      req.body = JSON.stringify({ event: 'payment.approved', transactionId: '999' }); // Different payload

      const middleware = validateWebhookSignature();
      middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid signature',
        message: 'Webhook signature validation failed'
      });
    });

    test('should use custom header name', () => {
      const customHeader = 'x-custom-signature';
      const validSignature = generateSignature(testPayload, testSecret);
      req.headers[customHeader] = validSignature;

      const middleware = validateWebhookSignature({ header: customHeader });
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should use custom secret', () => {
      const customSecret = 'custom-secret-key';
      const validSignature = generateSignature(testPayload, customSecret);
      req.headers['x-signature'] = validSignature;

      const middleware = validateWebhookSignature({ secret: customSecret });
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should handle missing secret configuration', () => {
      delete process.env.SIGILOPAY_WEBHOOK_SECRET;
      delete process.env.SIGILOPAY_SECRET_KEY;
      
      req.headers['x-signature'] = 'some-signature';

      const middleware = validateWebhookSignature();
      middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Server configuration error',
        message: 'Webhook validation is not properly configured'
      });
    });

    test('should handle JSON object body', () => {
      const jsonBody = { event: 'payment.approved', transactionId: '123' };
      req.body = jsonBody;
      
      const validSignature = generateSignature(JSON.stringify(jsonBody), testSecret);
      req.headers['x-signature'] = validSignature;

      const middleware = validateWebhookSignature();
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should fallback to SIGILOPAY_SECRET_KEY if WEBHOOK_SECRET not set', () => {
      delete process.env.SIGILOPAY_WEBHOOK_SECRET;
      process.env.SIGILOPAY_SECRET_KEY = testSecret;
      
      const validSignature = generateSignature(testPayload, testSecret);
      req.headers['x-signature'] = validSignature;

      const middleware = validateWebhookSignature();
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('validateWebhookSignatureWithTimestamp', () => {
    function generateSignatureWithTimestamp(payload, timestamp, secret) {
      const signedPayload = `${timestamp}.${payload}`;
      const hmac = crypto.createHmac('sha256', secret);
      hmac.update(signedPayload);
      return hmac.digest('hex');
    }

    test('should accept valid signature with timestamp', () => {
      const timestamp = Math.floor(Date.now() / 1000);
      const validSignature = generateSignatureWithTimestamp(testPayload, timestamp, testSecret);
      
      req.headers['x-signature'] = validSignature;
      req.headers['x-timestamp'] = timestamp.toString();

      const middleware = validateWebhookSignatureWithTimestamp();
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should reject missing timestamp', () => {
      const timestamp = Math.floor(Date.now() / 1000);
      const validSignature = generateSignatureWithTimestamp(testPayload, timestamp, testSecret);
      req.headers['x-signature'] = validSignature;
      // Missing timestamp header

      const middleware = validateWebhookSignatureWithTimestamp();
      middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Missing signature or timestamp',
        message: 'Invalid webhook request'
      });
    });

    test('should reject expired timestamp', () => {
      const oldTimestamp = Math.floor(Date.now() / 1000) - 400; // 400 seconds ago (> 300s tolerance)
      const validSignature = generateSignatureWithTimestamp(testPayload, oldTimestamp, testSecret);
      
      req.headers['x-signature'] = validSignature;
      req.headers['x-timestamp'] = oldTimestamp.toString();

      const middleware = validateWebhookSignatureWithTimestamp();
      middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Timestamp expired',
        message: 'Webhook request is too old'
      });
    });

    test('should reject future timestamp beyond tolerance', () => {
      const futureTimestamp = Math.floor(Date.now() / 1000) + 400; // 400 seconds in future
      const validSignature = generateSignatureWithTimestamp(testPayload, futureTimestamp, testSecret);
      
      req.headers['x-signature'] = validSignature;
      req.headers['x-timestamp'] = futureTimestamp.toString();

      const middleware = validateWebhookSignatureWithTimestamp();
      middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Timestamp expired',
        message: 'Webhook request is too old'
      });
    });

    test('should reject invalid timestamp format', () => {
      req.headers['x-signature'] = 'some-signature';
      req.headers['x-timestamp'] = 'not-a-number';

      const middleware = validateWebhookSignatureWithTimestamp();
      middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid timestamp',
        message: 'Webhook timestamp is not valid'
      });
    });

    test('should use custom tolerance', () => {
      const oldTimestamp = Math.floor(Date.now() / 1000) - 100; // 100 seconds ago
      const validSignature = generateSignatureWithTimestamp(testPayload, oldTimestamp, testSecret);
      
      req.headers['x-signature'] = validSignature;
      req.headers['x-timestamp'] = oldTimestamp.toString();

      // With default tolerance (300s), this should pass
      const middleware1 = validateWebhookSignatureWithTimestamp();
      middleware1(req, res, next);
      expect(next).toHaveBeenCalled();

      // Reset mocks
      jest.clearAllMocks();

      // With custom tolerance (50s), this should fail
      const middleware2 = validateWebhookSignatureWithTimestamp({ toleranceSeconds: 50 });
      middleware2(req, res, next);
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
    });

    test('should use custom header names', () => {
      const timestamp = Math.floor(Date.now() / 1000);
      const validSignature = generateSignatureWithTimestamp(testPayload, timestamp, testSecret);
      
      req.headers['x-custom-sig'] = validSignature;
      req.headers['x-custom-time'] = timestamp.toString();

      const middleware = validateWebhookSignatureWithTimestamp({
        signatureHeader: 'x-custom-sig',
        timestampHeader: 'x-custom-time'
      });
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('captureRawBody', () => {
    test('should capture raw body from request stream', (done) => {
      const mockReq = {
        on: jest.fn((event, handler) => {
          if (event === 'data') {
            handler(Buffer.from('{"test":'));
            handler(Buffer.from('"data"}'));
          } else if (event === 'end') {
            handler();
          }
        })
      };
      
      const mockRes = {};
      const mockNext = jest.fn(() => {
        expect(mockReq.rawBody).toBe('{"test":"data"}');
        done();
      });

      captureRawBody(mockReq, mockRes, mockNext);
    });
  });

  describe('Integration scenarios', () => {
    test('should handle replay attack with timestamp validation', () => {
      const oldTimestamp = Math.floor(Date.now() / 1000) - 600; // 10 minutes ago
      const validSignature = generateSignatureWithTimestamp(testPayload, oldTimestamp, testSecret);
      
      req.headers['x-signature'] = validSignature;
      req.headers['x-timestamp'] = oldTimestamp.toString();

      const middleware = validateWebhookSignatureWithTimestamp({ toleranceSeconds: 300 });
      middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Timestamp expired'
        })
      );
    });

    test('should prevent signature reuse with different payload', () => {
      const originalPayload = JSON.stringify({ amount: 100 });
      const tamperedPayload = JSON.stringify({ amount: 1000 });
      
      const validSignature = generateSignature(originalPayload, testSecret);
      
      req.body = tamperedPayload;
      req.headers['x-signature'] = validSignature;

      const middleware = validateWebhookSignature();
      middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
    });

    function generateSignature(payload, secret) {
      const hmac = crypto.createHmac('sha256', secret);
      hmac.update(payload);
      return hmac.digest('hex');
    }

    function generateSignatureWithTimestamp(payload, timestamp, secret) {
      const signedPayload = `${timestamp}.${payload}`;
      const hmac = crypto.createHmac('sha256', secret);
      hmac.update(signedPayload);
      return hmac.digest('hex');
    }
  });
});
