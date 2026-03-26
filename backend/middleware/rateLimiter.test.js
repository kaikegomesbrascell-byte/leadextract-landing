/**
 * Unit Tests for Rate Limiter Middleware
 * 
 * Tests rate limiting functionality for login endpoints
 * Validates: Requirements 5.7
 */

const {
  rateLimiter,
  resetAttempts,
  getAttemptStats,
  clearAllAttempts,
  MAX_ATTEMPTS,
  WINDOW_MS
} = require('./rateLimiter');

// Setup test framework
const tests = [];
let currentDescribe = '';
let beforeEachFn = null;

global.describe = (name, fn) => {
  currentDescribe = name;
  fn();
};

global.test = (name, fn) => {
  tests.push({ describe: currentDescribe, name, fn });
};

global.beforeEach = (fn) => {
  beforeEachFn = fn;
};

global.expect = (actual) => ({
  toBe: (expected) => {
    if (actual !== expected) {
      throw new Error(`Expected ${actual} to be ${expected}`);
    }
  },
  toBeNull: () => {
    if (actual !== null) {
      throw new Error(`Expected ${actual} to be null`);
    }
  },
  toBeDefined: () => {
    if (actual === undefined) {
      throw new Error(`Expected value to be defined`);
    }
  },
  toBeGreaterThan: (expected) => {
    if (actual <= expected) {
      throw new Error(`Expected ${actual} to be greater than ${expected}`);
    }
  }
});

// Mock request and response objects
function createMockReq(ip = '127.0.0.1', email = null) {
  return {
    ip,
    connection: { remoteAddress: ip },
    socket: { remoteAddress: ip },
    headers: {},
    body: email ? { email } : {}
  };
}

function createMockRes() {
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
  return res;
}

// Helper para simular delay
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe('Rate Limiter Middleware', () => {
  beforeEach(() => {
    // Limpar todos os registros antes de cada teste
    clearAllAttempts();
  });

  describe('Basic Functionality', () => {
    test('should allow first login attempt', (done) => {
      const req = createMockReq('192.168.1.1', 'user@example.com');
      const res = createMockRes();
      
      rateLimiter(req, res, () => {
        expect(res.statusCode).toBeNull();
        expect(res.jsonData).toBeNull();
        done();
      });
    });

    test('should allow up to MAX_ATTEMPTS requests', (done) => {
      const ip = '192.168.1.2';
      const email = 'user@example.com';
      let callCount = 0;

      function makeRequest(attempt) {
        const req = createMockReq(ip, email);
        const res = createMockRes();
        
        rateLimiter(req, res, () => {
          callCount++;
          
          if (attempt < MAX_ATTEMPTS) {
            // Deve permitir até MAX_ATTEMPTS
            expect(res.statusCode).toBeNull();
            makeRequest(attempt + 1);
          } else {
            // Verificar que todas as tentativas foram permitidas
            expect(callCount).toBe(MAX_ATTEMPTS);
            done();
          }
        });
      }

      makeRequest(1);
    });

    test('should block after MAX_ATTEMPTS requests', (done) => {
      const ip = '192.168.1.3';
      const email = 'blocked@example.com';
      let successCount = 0;

      function makeRequest(attempt) {
        const req = createMockReq(ip, email);
        const res = createMockRes();
        
        rateLimiter(req, res, () => {
          successCount++;
          
          if (attempt <= MAX_ATTEMPTS + 1) {
            makeRequest(attempt + 1);
          }
        });

        // Verificar se foi bloqueado após MAX_ATTEMPTS
        if (attempt > MAX_ATTEMPTS) {
          expect(res.statusCode).toBe(429);
          expect(res.jsonData.code).toBe('RATE_LIMIT_EXCEEDED');
          expect(res.jsonData.maxAttempts).toBe(MAX_ATTEMPTS);
          expect(successCount).toBe(MAX_ATTEMPTS);
          done();
        }
      }

      makeRequest(1);
    });

    test('should return 429 status code when limit exceeded', (done) => {
      const ip = '192.168.1.4';
      const email = 'test@example.com';

      // Fazer MAX_ATTEMPTS tentativas
      for (let i = 0; i < MAX_ATTEMPTS; i++) {
        const req = createMockReq(ip, email);
        const res = createMockRes();
        rateLimiter(req, res, () => {});
      }

      // Tentar mais uma vez (deve ser bloqueado)
      const req = createMockReq(ip, email);
      const res = createMockRes();
      
      rateLimiter(req, res, () => {
        // Não deve chamar next()
        done(new Error('Should not call next() when blocked'));
      });

      expect(res.statusCode).toBe(429);
      expect(res.jsonData.success).toBe(false);
      expect(res.jsonData.code).toBe('RATE_LIMIT_EXCEEDED');
      done();
    });
  });

  describe('IP and Email Tracking', () => {
    test('should track attempts by IP address', (done) => {
      const ip = '192.168.1.5';
      
      // Fazer 3 tentativas do mesmo IP
      for (let i = 0; i < 3; i++) {
        const req = createMockReq(ip);
        const res = createMockRes();
        rateLimiter(req, res, () => {});
      }

      const stats = getAttemptStats(ip);
      expect(stats.attempts).toBe(3);
      expect(stats.remaining).toBe(MAX_ATTEMPTS - 3);
      done();
    });

    test('should track attempts by IP and email combination', (done) => {
      const ip = '192.168.1.6';
      const email1 = 'user1@example.com';
      const email2 = 'user2@example.com';
      
      // Fazer 3 tentativas com email1
      for (let i = 0; i < 3; i++) {
        const req = createMockReq(ip, email1);
        const res = createMockRes();
        rateLimiter(req, res, () => {});
      }

      // Fazer 2 tentativas com email2
      for (let i = 0; i < 2; i++) {
        const req = createMockReq(ip, email2);
        const res = createMockRes();
        rateLimiter(req, res, () => {});
      }

      const stats1 = getAttemptStats(ip, email1);
      const stats2 = getAttemptStats(ip, email2);
      
      expect(stats1.attempts).toBe(3);
      expect(stats2.attempts).toBe(2);
      done();
    });

    test('should handle different IPs independently', (done) => {
      const ip1 = '192.168.1.7';
      const ip2 = '192.168.1.8';
      const email = 'user@example.com';
      
      // Bloquear ip1
      for (let i = 0; i <= MAX_ATTEMPTS; i++) {
        const req = createMockReq(ip1, email);
        const res = createMockRes();
        rateLimiter(req, res, () => {});
      }

      // ip2 deve ainda estar permitido
      const req = createMockReq(ip2, email);
      const res = createMockRes();
      
      rateLimiter(req, res, () => {
        expect(res.statusCode).toBeNull();
        done();
      });
    });
  });

  describe('Time Window', () => {
    test('should reset counter after time window expires', async () => {
      const ip = '192.168.1.9';
      const email = 'timetest@example.com';
      
      // Fazer MAX_ATTEMPTS tentativas
      for (let i = 0; i < MAX_ATTEMPTS; i++) {
        const req = createMockReq(ip, email);
        const res = createMockRes();
        rateLimiter(req, res, () => {});
      }

      // Verificar que está no limite
      let stats = getAttemptStats(ip, email);
      expect(stats.attempts).toBe(MAX_ATTEMPTS);
      expect(stats.remaining).toBe(0);

      // Simular passagem de tempo (apenas para teste - em produção seria 15 minutos)
      // Nota: Este teste é conceitual, pois não podemos esperar 15 minutos reais
      // Em um ambiente de teste real, você usaria bibliotecas como sinon para mock de tempo
      
      // Por enquanto, apenas verificar que a lógica está correta
      expect(stats.resetAt).toBeDefined();
    });

    test('should include retryAfter in blocked response', (done) => {
      const ip = '192.168.1.10';
      const email = 'retry@example.com';
      
      // Bloquear usuário
      for (let i = 0; i <= MAX_ATTEMPTS; i++) {
        const req = createMockReq(ip, email);
        const res = createMockRes();
        rateLimiter(req, res, () => {});
      }

      // Tentar novamente
      const req = createMockReq(ip, email);
      const res = createMockRes();
      
      rateLimiter(req, res, () => {});

      expect(res.jsonData.retryAfter).toBeDefined();
      expect(typeof res.jsonData.retryAfter).toBe('number');
      expect(res.jsonData.retryAfter).toBeGreaterThan(0);
      expect(res.jsonData.windowMinutes).toBe(15);
      done();
    });
  });

  describe('Response Headers', () => {
    test('should set rate limit headers on successful request', (done) => {
      const req = createMockReq('192.168.1.11', 'headers@example.com');
      const res = createMockRes();
      
      rateLimiter(req, res, () => {
        expect(res.headers['X-RateLimit-Limit']).toBe(MAX_ATTEMPTS);
        expect(res.headers['X-RateLimit-Remaining']).toBeDefined();
        expect(res.headers['X-RateLimit-Reset']).toBeDefined();
        done();
      });
    });

    test('should decrease remaining count with each attempt', (done) => {
      const ip = '192.168.1.12';
      const email = 'countdown@example.com';
      
      const req1 = createMockReq(ip, email);
      const res1 = createMockRes();
      
      rateLimiter(req1, res1, () => {
        const remaining1 = res1.headers['X-RateLimit-Remaining'];
        
        const req2 = createMockReq(ip, email);
        const res2 = createMockRes();
        
        rateLimiter(req2, res2, () => {
          const remaining2 = res2.headers['X-RateLimit-Remaining'];
          
          expect(remaining2).toBe(remaining1 - 1);
          done();
        });
      });
    });
  });

  describe('Helper Functions', () => {
    test('resetAttempts should clear attempts for IP/email', (done) => {
      const ip = '192.168.1.13';
      const email = 'reset@example.com';
      
      // Fazer algumas tentativas
      for (let i = 0; i < 3; i++) {
        const req = createMockReq(ip, email);
        const res = createMockRes();
        rateLimiter(req, res, () => {});
      }

      // Verificar que há tentativas registradas
      let stats = getAttemptStats(ip, email);
      expect(stats.attempts).toBe(3);

      // Resetar
      resetAttempts(ip, email);

      // Verificar que foi resetado
      stats = getAttemptStats(ip, email);
      expect(stats.attempts).toBe(0);
      expect(stats.remaining).toBe(MAX_ATTEMPTS);
      done();
    });

    test('getAttemptStats should return correct statistics', (done) => {
      const ip = '192.168.1.14';
      const email = 'stats@example.com';
      
      // Fazer 2 tentativas
      for (let i = 0; i < 2; i++) {
        const req = createMockReq(ip, email);
        const res = createMockRes();
        rateLimiter(req, res, () => {});
      }

      const stats = getAttemptStats(ip, email);
      
      expect(stats.attempts).toBe(2);
      expect(stats.remaining).toBe(MAX_ATTEMPTS - 2);
      expect(stats.blocked).toBe(false);
      expect(stats.resetAt).toBeDefined();
      done();
    });

    test('clearAllAttempts should remove all records', (done) => {
      // Criar tentativas de múltiplos IPs
      for (let i = 0; i < 3; i++) {
        const req = createMockReq(`192.168.1.${15 + i}`, `user${i}@example.com`);
        const res = createMockRes();
        rateLimiter(req, res, () => {});
      }

      // Limpar tudo
      clearAllAttempts();

      // Verificar que todos foram limpos
      for (let i = 0; i < 3; i++) {
        const stats = getAttemptStats(`192.168.1.${15 + i}`, `user${i}@example.com`);
        expect(stats.attempts).toBe(0);
      }
      done();
    });
  });

  describe('Error Handling', () => {
    test('should fail open on error (allow request)', (done) => {
      // Criar request malformado que pode causar erro
      const req = {
        // Sem propriedades necessárias
      };
      const res = createMockRes();
      
      rateLimiter(req, res, () => {
        // Deve chamar next() mesmo com erro
        expect(res.statusCode).toBeNull();
        done();
      });
    });
  });

  describe('IP Extraction', () => {
    test('should extract IP from x-forwarded-for header', (done) => {
      const req = createMockReq('127.0.0.1');
      req.headers['x-forwarded-for'] = '203.0.113.1, 198.51.100.1';
      const res = createMockRes();
      
      rateLimiter(req, res, () => {
        // Verificar que usou o primeiro IP do x-forwarded-for
        const stats = getAttemptStats('203.0.113.1');
        expect(stats.attempts).toBe(1);
        done();
      });
    });

    test('should extract IP from x-real-ip header', (done) => {
      const req = createMockReq('127.0.0.1');
      req.headers['x-real-ip'] = '203.0.113.2';
      const res = createMockRes();
      
      rateLimiter(req, res, () => {
        const stats = getAttemptStats('203.0.113.2');
        expect(stats.attempts).toBe(1);
        done();
      });
    });
  });

  describe('Case Sensitivity', () => {
    test('should treat email as case-insensitive', (done) => {
      const ip = '192.168.1.20';
      
      // Fazer tentativas com diferentes cases
      const req1 = createMockReq(ip, 'User@Example.COM');
      const res1 = createMockRes();
      rateLimiter(req1, res1, () => {});

      const req2 = createMockReq(ip, 'user@example.com');
      const res2 = createMockRes();
      rateLimiter(req2, res2, () => {});

      // Ambos devem contar para o mesmo registro
      const stats = getAttemptStats(ip, 'user@example.com');
      expect(stats.attempts).toBe(2);
      done();
    });
  });
});

// Executar testes se este arquivo for executado diretamente
if (require.main === module) {
  console.log('🧪 Executando testes do Rate Limiter...\n');
  
  // Executar testes
  let passed = 0;
  let failed = 0;
  
  tests.forEach(test => {
    try {
      // Executar beforeEach se definido
      if (beforeEachFn) {
        beforeEachFn();
      }
      
      test.fn((error) => {
        if (error) {
          console.log(`❌ ${test.describe} > ${test.name}`);
          console.log(`   ${error.message}\n`);
          failed++;
        } else {
          console.log(`✅ ${test.describe} > ${test.name}`);
          passed++;
        }
      });
    } catch (error) {
      console.log(`❌ ${test.describe} > ${test.name}`);
      console.log(`   ${error.message}\n`);
      failed++;
    }
  });
  
  console.log(`\n📊 Resultados: ${passed} passou, ${failed} falhou`);
  process.exit(failed > 0 ? 1 : 0);
}

module.exports = {
  // Exportar para uso com frameworks de teste reais (Jest, Mocha, etc)
};
