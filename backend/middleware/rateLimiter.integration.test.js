/**
 * Integration Tests for Rate Limiter Middleware
 * 
 * Tests rate limiting in the context of login endpoints
 * Validates: Requirements 5.7
 */

const { rateLimiter, clearAllAttempts, MAX_ATTEMPTS } = require('./rateLimiter');

// Simular um servidor Express simples
function createMockApp() {
  const routes = [];
  
  return {
    post(path, ...handlers) {
      routes.push({ method: 'POST', path, handlers });
    },
    simulateRequest(path, body, headers = {}) {
      const route = routes.find(r => r.path === path && r.method === 'POST');
      if (!route) {
        throw new Error(`Route not found: POST ${path}`);
      }

      const req = {
        method: 'POST',
        path,
        body,
        headers,
        ip: headers['x-forwarded-for'] || '127.0.0.1',
        connection: { remoteAddress: '127.0.0.1' },
        socket: { remoteAddress: '127.0.0.1' }
      };

      const res = {
        statusCode: null,
        headers: {},
        jsonData: null,
        status(code) {
          this.statusCode = code;
          return this;
        },
        json(data) {
          this.jsonData = data;
          return this;
        },
        setHeader(key, value) {
          this.headers[key] = value;
        }
      };

      return new Promise((resolve) => {
        let handlerIndex = 0;

        function next(error) {
          if (error) {
            res.status(500).json({ error: error.message });
            resolve(res);
            return;
          }

          if (handlerIndex >= route.handlers.length) {
            resolve(res);
            return;
          }

          const handler = route.handlers[handlerIndex++];
          
          try {
            handler(req, res, next);
          } catch (err) {
            res.status(500).json({ error: err.message });
            resolve(res);
          }
        }

        next();
      });
    }
  };
}

// Simular handler de login
function loginHandler(req, res) {
  const { email, password } = req.body;

  // Validação básica
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email e senha são obrigatórios'
    });
  }

  // Simular autenticação (sempre falha para teste de rate limiting)
  return res.status(401).json({
    success: false,
    message: 'Credenciais inválidas',
    code: 'INVALID_CREDENTIALS'
  });
}

describe('Rate Limiter Integration Tests', () => {
  let app;

  beforeEach(() => {
    clearAllAttempts();
    app = createMockApp();
    
    // Configurar rota de login com rate limiter
    app.post('/api/auth/login', rateLimiter, loginHandler);
  });

  describe('Login Endpoint Protection', () => {
    test('should allow first 5 login attempts', async () => {
      const email = 'user@example.com';
      const password = 'wrongpassword';

      for (let i = 1; i <= MAX_ATTEMPTS; i++) {
        const res = await app.simulateRequest('/api/auth/login', 
          { email, password },
          { 'x-forwarded-for': '192.168.1.100' }
        );

        // Deve permitir a tentativa (mas falhar na autenticação)
        expect(res.statusCode).toBe(401);
        expect(res.jsonData.code).toBe('INVALID_CREDENTIALS');
        
        // Verificar headers de rate limit
        expect(res.headers['X-RateLimit-Limit']).toBe(MAX_ATTEMPTS);
        expect(res.headers['X-RateLimit-Remaining']).toBe(MAX_ATTEMPTS - i);
      }
    });

    test('should block 6th login attempt', async () => {
      const email = 'blocked@example.com';
      const password = 'wrongpassword';
      const ip = '192.168.1.101';

      // Fazer 5 tentativas
      for (let i = 0; i < MAX_ATTEMPTS; i++) {
        await app.simulateRequest('/api/auth/login', 
          { email, password },
          { 'x-forwarded-for': ip }
        );
      }

      // 6ª tentativa deve ser bloqueada
      const res = await app.simulateRequest('/api/auth/login', 
        { email, password },
        { 'x-forwarded-for': ip }
      );

      expect(res.statusCode).toBe(429);
      expect(res.jsonData.code).toBe('RATE_LIMIT_EXCEEDED');
      expect(res.jsonData.maxAttempts).toBe(MAX_ATTEMPTS);
      expect(res.jsonData.retryAfter).toBeGreaterThan(0);
    });

    test('should track attempts per IP/email combination', async () => {
      const ip = '192.168.1.102';
      const email1 = 'user1@example.com';
      const email2 = 'user2@example.com';
      const password = 'wrongpassword';

      // Fazer 3 tentativas com email1
      for (let i = 0; i < 3; i++) {
        const res = await app.simulateRequest('/api/auth/login', 
          { email: email1, password },
          { 'x-forwarded-for': ip }
        );
        expect(res.statusCode).toBe(401);
      }

      // Fazer 3 tentativas com email2 (deve ser permitido)
      for (let i = 0; i < 3; i++) {
        const res = await app.simulateRequest('/api/auth/login', 
          { email: email2, password },
          { 'x-forwarded-for': ip }
        );
        expect(res.statusCode).toBe(401);
      }

      // Ambos ainda devem ter tentativas restantes
      // (cada combinação IP+email é rastreada separadamente)
    });

    test('should handle multiple IPs independently', async () => {
      const email = 'user@example.com';
      const password = 'wrongpassword';

      // Bloquear IP1
      for (let i = 0; i <= MAX_ATTEMPTS; i++) {
        await app.simulateRequest('/api/auth/login', 
          { email, password },
          { 'x-forwarded-for': '192.168.1.103' }
        );
      }

      // IP2 deve ainda estar permitido
      const res = await app.simulateRequest('/api/auth/login', 
        { email, password },
        { 'x-forwarded-for': '192.168.1.104' }
      );

      expect(res.statusCode).toBe(401); // Falha de autenticação, não rate limit
      expect(res.jsonData.code).toBe('INVALID_CREDENTIALS');
    });
  });

  describe('Rate Limit Response Format', () => {
    test('should return proper error message when blocked', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';
      const ip = '192.168.1.105';

      // Bloquear usuário
      for (let i = 0; i <= MAX_ATTEMPTS; i++) {
        await app.simulateRequest('/api/auth/login', 
          { email, password },
          { 'x-forwarded-for': ip }
        );
      }

      const res = await app.simulateRequest('/api/auth/login', 
        { email, password },
        { 'x-forwarded-for': ip }
      );

      expect(res.statusCode).toBe(429);
      expect(res.jsonData).toMatchObject({
        success: false,
        code: 'RATE_LIMIT_EXCEEDED',
        maxAttempts: MAX_ATTEMPTS,
        windowMinutes: 15
      });
      expect(res.jsonData.message).toContain('tentativas de login');
      expect(res.jsonData.retryAfter).toBeDefined();
    });

    test('should include retry information in response', async () => {
      const email = 'retry@example.com';
      const password = 'wrongpassword';
      const ip = '192.168.1.106';

      // Bloquear usuário
      for (let i = 0; i <= MAX_ATTEMPTS; i++) {
        await app.simulateRequest('/api/auth/login', 
          { email, password },
          { 'x-forwarded-for': ip }
        );
      }

      const res = await app.simulateRequest('/api/auth/login', 
        { email, password },
        { 'x-forwarded-for': ip }
      );

      expect(res.jsonData.retryAfter).toBeGreaterThan(0);
      expect(res.jsonData.windowMinutes).toBe(15);
      expect(typeof res.jsonData.message).toBe('string');
    });
  });

  describe('Real-world Scenarios', () => {
    test('should handle brute force attack attempt', async () => {
      const email = 'victim@example.com';
      const ip = '192.168.1.107';
      const passwords = ['pass1', 'pass2', 'pass3', 'pass4', 'pass5', 'pass6', 'pass7'];

      let blockedCount = 0;
      let allowedCount = 0;

      for (const password of passwords) {
        const res = await app.simulateRequest('/api/auth/login', 
          { email, password },
          { 'x-forwarded-for': ip }
        );

        if (res.statusCode === 429) {
          blockedCount++;
        } else {
          allowedCount++;
        }
      }

      // Deve permitir 5 tentativas e bloquear 2
      expect(allowedCount).toBe(MAX_ATTEMPTS);
      expect(blockedCount).toBe(passwords.length - MAX_ATTEMPTS);
    });

    test('should handle concurrent requests from same IP', async () => {
      const email = 'concurrent@example.com';
      const password = 'wrongpassword';
      const ip = '192.168.1.108';

      // Simular múltiplas requisições simultâneas
      const requests = [];
      for (let i = 0; i < 10; i++) {
        requests.push(
          app.simulateRequest('/api/auth/login', 
            { email, password },
            { 'x-forwarded-for': ip }
          )
        );
      }

      const responses = await Promise.all(requests);

      // Contar quantas foram permitidas vs bloqueadas
      const allowed = responses.filter(r => r.statusCode === 401).length;
      const blocked = responses.filter(r => r.statusCode === 429).length;

      // Deve permitir no máximo MAX_ATTEMPTS
      expect(allowed).toBeLessThanOrEqual(MAX_ATTEMPTS);
      expect(blocked).toBeGreaterThan(0);
    });

    test('should handle requests without email (IP-only tracking)', async () => {
      const ip = '192.168.1.109';
      const password = 'wrongpassword';

      // Fazer tentativas sem email
      for (let i = 0; i < MAX_ATTEMPTS; i++) {
        const res = await app.simulateRequest('/api/auth/login', 
          { password }, // Sem email
          { 'x-forwarded-for': ip }
        );
        
        // Deve falhar por falta de email, mas rate limiter deve funcionar
        expect(res.statusCode).toBe(400);
      }

      // Próxima tentativa deve ser bloqueada por rate limit
      const res = await app.simulateRequest('/api/auth/login', 
        { password },
        { 'x-forwarded-for': ip }
      );

      expect(res.statusCode).toBe(429);
    });
  });

  describe('Security Considerations', () => {
    test('should handle proxy headers correctly', async () => {
      const email = 'proxy@example.com';
      const password = 'wrongpassword';

      // Simular requisição através de proxy
      const res = await app.simulateRequest('/api/auth/login', 
        { email, password },
        { 
          'x-forwarded-for': '203.0.113.1, 198.51.100.1',
          'x-real-ip': '203.0.113.1'
        }
      );

      expect(res.statusCode).toBe(401);
      expect(res.headers['X-RateLimit-Remaining']).toBe(MAX_ATTEMPTS - 1);
    });

    test('should be case-insensitive for email', async () => {
      const ip = '192.168.1.110';
      const password = 'wrongpassword';

      // Fazer tentativas com diferentes cases
      await app.simulateRequest('/api/auth/login', 
        { email: 'User@Example.COM', password },
        { 'x-forwarded-for': ip }
      );

      await app.simulateRequest('/api/auth/login', 
        { email: 'user@example.com', password },
        { 'x-forwarded-for': ip }
      );

      await app.simulateRequest('/api/auth/login', 
        { email: 'USER@EXAMPLE.COM', password },
        { 'x-forwarded-for': ip }
      );

      // Todas devem contar para o mesmo limite
      const res = await app.simulateRequest('/api/auth/login', 
        { email: 'user@example.com', password },
        { 'x-forwarded-for': ip }
      );

      expect(res.headers['X-RateLimit-Remaining']).toBe(MAX_ATTEMPTS - 4);
    });
  });
});

// Helper para executar testes
function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected) {
        throw new Error(`Expected ${actual} to be ${expected}`);
      }
    },
    toBeGreaterThan(expected) {
      if (actual <= expected) {
        throw new Error(`Expected ${actual} to be greater than ${expected}`);
      }
    },
    toBeLessThanOrEqual(expected) {
      if (actual > expected) {
        throw new Error(`Expected ${actual} to be less than or equal to ${expected}`);
      }
    },
    toBeDefined() {
      if (actual === undefined) {
        throw new Error('Expected value to be defined');
      }
    },
    toContain(substring) {
      if (!actual.includes(substring)) {
        throw new Error(`Expected "${actual}" to contain "${substring}"`);
      }
    },
    toMatchObject(expected) {
      for (const key in expected) {
        if (actual[key] !== expected[key]) {
          throw new Error(`Expected ${key} to be ${expected[key]}, got ${actual[key]}`);
        }
      }
    }
  };
}

// Executar testes se este arquivo for executado diretamente
if (require.main === module) {
  console.log('🧪 Executando testes de integração do Rate Limiter...\n');
  
  const tests = [];
  let currentDescribe = '';
  
  global.describe = (name, fn) => {
    currentDescribe = name;
    fn();
  };
  
  global.test = (name, fn) => {
    tests.push({ describe: currentDescribe, name, fn });
  };
  
  global.beforeEach = (fn) => {
    tests.forEach(test => {
      const originalFn = test.fn;
      test.fn = async () => {
        fn();
        await originalFn();
      };
    });
  };
  
  global.expect = expect;
  
  // Executar testes
  (async () => {
    let passed = 0;
    let failed = 0;
    
    for (const test of tests) {
      try {
        await test.fn();
        console.log(`✅ ${test.describe} > ${test.name}`);
        passed++;
      } catch (error) {
        console.log(`❌ ${test.describe} > ${test.name}`);
        console.log(`   ${error.message}\n`);
        failed++;
      }
    }
    
    console.log(`\n📊 Resultados: ${passed} passou, ${failed} falhou`);
    process.exit(failed > 0 ? 1 : 0);
  })();
}
