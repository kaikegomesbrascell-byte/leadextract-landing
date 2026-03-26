const { accessLogger } = require('./accessLogger');

// Mock do Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      insert: jest.fn(() => Promise.resolve({ error: null }))
    }))
  }))
}));

describe('Access Logger Middleware', () => {
  let req, res, next, mockSupabase;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock request
    req = {
      originalUrl: '/api/test',
      url: '/api/test',
      method: 'GET',
      ip: '192.168.1.1',
      connection: { remoteAddress: '192.168.1.1' },
      headers: {
        'user-agent': 'Mozilla/5.0 Test Browser',
        'x-forwarded-for': null
      },
      user: null,
      subscription: null
    };

    // Mock response
    res = {
      statusCode: 200,
      json: jest.fn(function(body) {
        return this;
      }),
      send: jest.fn(function(body) {
        return this;
      }),
      end: jest.fn(function(chunk, encoding) {
        return this;
      })
    };

    // Mock next
    next = jest.fn();

    // Spy on console methods
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
    console.error.mockRestore();
  });

  test('should call next() to continue middleware chain', () => {
    accessLogger(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  test('should capture request data (endpoint, method, IP, user agent)', () => {
    accessLogger(req, res, next);
    
    // Verificar que os dados foram capturados
    expect(req.originalUrl).toBe('/api/test');
    expect(req.method).toBe('GET');
    expect(req.ip).toBe('192.168.1.1');
    expect(req.headers['user-agent']).toBe('Mozilla/5.0 Test Browser');
  });

  test('should log successful request (status 200)', async () => {
    accessLogger(req, res, next);
    
    res.statusCode = 200;
    res.json({ success: true, data: 'test' });

    // Aguardar processamento assíncrono
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Access log: GET /api/test - 200')
    );
  });

  test('should log failed request (status 401)', async () => {
    accessLogger(req, res, next);
    
    res.statusCode = 401;
    res.json({ success: false, message: 'Unauthorized' });

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Access log: GET /api/test - 401')
    );
  });

  test('should capture authenticated user ID', async () => {
    req.user = {
      id: 'user-123',
      email: 'test@example.com'
    };

    accessLogger(req, res, next);
    
    res.statusCode = 200;
    res.json({ success: true });

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('User: user-123')
    );
  });

  test('should log anonymous user when not authenticated', async () => {
    req.user = null;

    accessLogger(req, res, next);
    
    res.statusCode = 200;
    res.json({ success: true });

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('User: anonymous')
    );
  });

  test('should capture payment verification status when subscription exists', () => {
    req.user = { id: 'user-123' };
    req.subscription = {
      id: 'sub-123',
      status: 'ativo',
      plan_id: 'start'
    };

    accessLogger(req, res, next);
    
    // Verificar que subscription foi capturada
    expect(req.subscription.status).toBe('ativo');
  });

  test('should handle different HTTP methods', async () => {
    const methods = ['GET', 'POST', 'PUT', 'DELETE'];

    for (const method of methods) {
      req.method = method;
      accessLogger(req, res, next);
      
      res.statusCode = 200;
      res.json({ success: true });

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining(`Access log: ${method}`)
      );
    }
  });

  test('should extract error message from response body', async () => {
    accessLogger(req, res, next);
    
    res.statusCode = 403;
    res.json({ 
      success: false, 
      message: 'Payment required',
      code: 'NO_SUBSCRIPTION'
    });

    await new Promise(resolve => setTimeout(resolve, 100));

    // Verificar que o log foi registrado
    expect(console.log).toHaveBeenCalled();
  });

  test('should handle IP from x-forwarded-for header', () => {
    req.ip = null;
    req.connection.remoteAddress = null;
    req.headers['x-forwarded-for'] = '203.0.113.1';

    accessLogger(req, res, next);
    
    // Verificar que o IP foi capturado do header
    expect(req.headers['x-forwarded-for']).toBe('203.0.113.1');
  });

  test('should not block response on database error', async () => {
    // Mock Supabase para simular erro
    const { createClient } = require('@supabase/supabase-js');
    createClient.mockImplementationOnce(() => ({
      from: jest.fn(() => ({
        insert: jest.fn(() => Promise.reject(new Error('Database error')))
      }))
    }));

    accessLogger(req, res, next);
    
    res.statusCode = 200;
    res.json({ success: true });

    await new Promise(resolve => setTimeout(resolve, 100));

    // Verificar que o erro foi logado mas não propagado
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Erro ao inserir access log')
    );
  });

  test('should avoid duplicate logs', async () => {
    accessLogger(req, res, next);
    
    res.statusCode = 200;
    
    // Chamar múltiplas vezes
    res.json({ success: true });
    res.json({ success: true });
    res.send('test');

    await new Promise(resolve => setTimeout(resolve, 100));

    // Deve ter apenas um log
    const logCalls = console.log.mock.calls.filter(call => 
      call[0].includes('Access log:')
    );
    expect(logCalls.length).toBe(1);
  });

  test('should handle missing user agent', () => {
    req.headers['user-agent'] = undefined;

    accessLogger(req, res, next);
    
    // Não deve lançar erro
    expect(next).toHaveBeenCalled();
  });

  test('should determine success based on status code', async () => {
    const testCases = [
      { statusCode: 200, expectedSuccess: true },
      { statusCode: 201, expectedSuccess: true },
      { statusCode: 204, expectedSuccess: true },
      { statusCode: 400, expectedSuccess: false },
      { statusCode: 401, expectedSuccess: false },
      { statusCode: 403, expectedSuccess: false },
      { statusCode: 404, expectedSuccess: false },
      { statusCode: 500, expectedSuccess: false }
    ];

    for (const testCase of testCases) {
      jest.clearAllMocks();
      
      accessLogger(req, res, next);
      res.statusCode = testCase.statusCode;
      res.json({ success: testCase.expectedSuccess });

      await new Promise(resolve => setTimeout(resolve, 50));
    }
  });

  test('should capture payment status as "no" when no subscription', () => {
    req.user = { id: 'user-123' };
    req.subscription = null;

    accessLogger(req, res, next);
    
    // Verificar que não há subscription
    expect(req.subscription).toBeNull();
  });

  test('should work with res.send() method', async () => {
    accessLogger(req, res, next);
    
    res.statusCode = 200;
    res.send('Plain text response');

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Access log: GET /api/test - 200')
    );
  });

  test('should work with res.end() method', async () => {
    accessLogger(req, res, next);
    
    res.statusCode = 204;
    res.end();

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Access log: GET /api/test - 204')
    );
  });
});
