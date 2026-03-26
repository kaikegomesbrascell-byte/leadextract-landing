/**
 * Rate Limiting Middleware
 * 
 * Implementa rate limiting para prevenir ataques de força bruta em endpoints de login.
 * Limita tentativas de login a 5 por 15 minutos por IP/email.
 * 
 * Validates: Requirements 5.7
 */

// Armazenamento em memória para tentativas de login
// Estrutura: { key: { count: number, firstAttempt: timestamp, blocked: boolean } }
const loginAttempts = new Map();

// Configurações
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutos em milissegundos
const CLEANUP_INTERVAL = 60 * 1000; // Limpar registros antigos a cada 1 minuto

/**
 * Gera chave única baseada em IP e email (se fornecido)
 */
function generateKey(ip, email = null) {
  if (email) {
    return `${ip}:${email.toLowerCase()}`;
  }
  return ip;
}

/**
 * Extrai IP real do request (considerando proxies)
 */
function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0].trim() ||
         req.headers['x-real-ip'] ||
         req.connection.remoteAddress ||
         req.socket.remoteAddress ||
         req.ip;
}

/**
 * Limpa registros expirados do armazenamento
 */
function cleanupExpiredRecords() {
  const now = Date.now();
  
  for (const [key, data] of loginAttempts.entries()) {
    // Remove registros mais antigos que a janela de tempo
    if (now - data.firstAttempt > WINDOW_MS) {
      loginAttempts.delete(key);
    }
  }
}

/**
 * Middleware de rate limiting para login
 * 
 * Rastreia tentativas de login por IP e email
 * Bloqueia após 5 tentativas em 15 minutos
 * Retorna 429 (Too Many Requests) quando limite é excedido
 */
function rateLimiter(req, res, next) {
  try {
    const ip = getClientIp(req);
    const email = req.body?.email || null;
    
    // Gerar chave única para este IP/email
    const key = generateKey(ip, email);
    const now = Date.now();
    
    // Buscar registro de tentativas
    let record = loginAttempts.get(key);
    
    if (!record) {
      // Primeira tentativa - criar novo registro
      record = {
        count: 1,
        firstAttempt: now,
        blocked: false
      };
      loginAttempts.set(key, record);
      
      // Adicionar headers informativos
      res.setHeader('X-RateLimit-Limit', MAX_ATTEMPTS);
      res.setHeader('X-RateLimit-Remaining', MAX_ATTEMPTS - 1);
      res.setHeader('X-RateLimit-Reset', new Date(now + WINDOW_MS).toISOString());
      
      // Permitir a requisição
      return next();
    }
    
    // Verificar se a janela de tempo expirou
    const timeElapsed = now - record.firstAttempt;
    
    if (timeElapsed > WINDOW_MS) {
      // Janela expirou - resetar contador
      record.count = 1;
      record.firstAttempt = now;
      record.blocked = false;
      loginAttempts.set(key, record);
      
      // Adicionar headers informativos
      res.setHeader('X-RateLimit-Limit', MAX_ATTEMPTS);
      res.setHeader('X-RateLimit-Remaining', MAX_ATTEMPTS - 1);
      res.setHeader('X-RateLimit-Reset', new Date(now + WINDOW_MS).toISOString());
      
      return next();
    }
    
    // Dentro da janela de tempo - verificar se está bloqueado
    if (record.blocked) {
      const remainingTime = Math.ceil((WINDOW_MS - timeElapsed) / 1000 / 60); // minutos
      
      return res.status(429).json({
        success: false,
        message: `Muitas tentativas de login. Tente novamente em ${remainingTime} minuto(s).`,
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil((WINDOW_MS - timeElapsed) / 1000), // segundos
        maxAttempts: MAX_ATTEMPTS,
        windowMinutes: 15
      });
    }
    
    // Incrementar contador
    record.count += 1;
    
    // Verificar se atingiu o limite
    if (record.count > MAX_ATTEMPTS) {
      record.blocked = true;
      loginAttempts.set(key, record);
      
      const remainingTime = Math.ceil((WINDOW_MS - timeElapsed) / 1000 / 60); // minutos
      
      return res.status(429).json({
        success: false,
        message: `Limite de tentativas de login excedido. Tente novamente em ${remainingTime} minuto(s).`,
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil((WINDOW_MS - timeElapsed) / 1000), // segundos
        maxAttempts: MAX_ATTEMPTS,
        windowMinutes: 15
      });
    }
    
    // Atualizar registro e permitir requisição
    loginAttempts.set(key, record);
    
    // Adicionar headers informativos
    res.setHeader('X-RateLimit-Limit', MAX_ATTEMPTS);
    res.setHeader('X-RateLimit-Remaining', MAX_ATTEMPTS - record.count);
    res.setHeader('X-RateLimit-Reset', new Date(record.firstAttempt + WINDOW_MS).toISOString());
    
    next();
    
  } catch (error) {
    console.error('❌ Erro no middleware de rate limiting:', error);
    
    // Em caso de erro, permitir a requisição (fail open)
    // Isso evita que um bug no rate limiter bloqueie todos os logins
    next();
  }
}

/**
 * Reseta o contador de tentativas para um IP/email específico
 * Útil para testes ou para resetar após login bem-sucedido
 */
function resetAttempts(ip, email = null) {
  const key = generateKey(ip, email);
  loginAttempts.delete(key);
}

/**
 * Obtém estatísticas de tentativas para um IP/email
 * Útil para debugging e monitoramento
 */
function getAttemptStats(ip, email = null) {
  const key = generateKey(ip, email);
  const record = loginAttempts.get(key);
  
  if (!record) {
    return {
      attempts: 0,
      blocked: false,
      remaining: MAX_ATTEMPTS
    };
  }
  
  const timeElapsed = Date.now() - record.firstAttempt;
  const isExpired = timeElapsed > WINDOW_MS;
  
  if (isExpired) {
    return {
      attempts: 0,
      blocked: false,
      remaining: MAX_ATTEMPTS
    };
  }
  
  return {
    attempts: record.count,
    blocked: record.blocked,
    remaining: Math.max(0, MAX_ATTEMPTS - record.count),
    resetAt: new Date(record.firstAttempt + WINDOW_MS).toISOString()
  };
}

/**
 * Limpa todos os registros de rate limiting
 * Útil para testes
 */
function clearAllAttempts() {
  loginAttempts.clear();
}

// Iniciar limpeza periódica de registros expirados
const cleanupTimer = setInterval(cleanupExpiredRecords, CLEANUP_INTERVAL);

// Permitir que o processo termine gracefully
if (cleanupTimer.unref) {
  cleanupTimer.unref();
}

module.exports = {
  rateLimiter,
  resetAttempts,
  getAttemptStats,
  clearAllAttempts,
  // Exportar constantes para testes
  MAX_ATTEMPTS,
  WINDOW_MS
};
