const { createClient } = require('@supabase/supabase-js');

// Configuração Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://blodznzrdzjsvaqabsvj.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_publishable_yctKLARtWlYpbZzk0dkx1w_e9Udi8cA';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Middleware para registrar todos os acessos na tabela access_logs
 * Captura endpoint, método, IP, user agent, status de sucesso e resultados de verificação de pagamento
 * 
 * Validates: Requirements 7.7, 10.4
 * 
 * IMPORTANTE: Este middleware deve ser usado APÓS verifyToken para capturar dados do usuário
 * Mas funciona mesmo sem autenticação (para logs de tentativas de acesso não autorizadas)
 */
function accessLogger(req, res, next) {
  // Capturar dados da requisição
  const endpoint = req.originalUrl || req.url;
  const method = req.method;
  const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
  const userAgent = req.headers['user-agent'] || null;
  const userId = req.user?.id || null;

  // Armazenar timestamp de início para calcular duração
  const startTime = Date.now();

  // Interceptar o método res.json para capturar a resposta
  const originalJson = res.json.bind(res);
  const originalSend = res.send.bind(res);
  const originalEnd = res.end.bind(res);

  let responseLogged = false;

  // Função para registrar o log
  const logAccess = async (statusCode, responseBody = null) => {
    // Evitar logs duplicados
    if (responseLogged) return;
    responseLogged = true;

    try {
      // Determinar sucesso baseado no status code
      const success = statusCode >= 200 && statusCode < 400;

      // Extrair mensagem de erro se houver
      let errorMessage = null;
      if (!success && responseBody) {
        try {
          const parsed = typeof responseBody === 'string' ? JSON.parse(responseBody) : responseBody;
          errorMessage = parsed.message || parsed.error || null;
        } catch (e) {
          // Ignorar erros de parsing
        }
      }

      // Capturar dados de verificação de pagamento se disponíveis
      const paymentStatusChecked = req.subscription ? 'yes' : 'no';
      const paymentStatusResult = req.subscription?.status || null;

      // Preparar dados do log
      const logData = {
        user_id: userId,
        endpoint,
        method,
        ip_address: ipAddress,
        user_agent: userAgent,
        success,
        status_code: statusCode,
        error_message: errorMessage,
        payment_status_checked: paymentStatusChecked,
        payment_status_result: paymentStatusResult
      };

      // Inserir log no banco de dados de forma assíncrona (não bloqueia a resposta)
      supabase
        .from('access_logs')
        .insert(logData)
        .then(({ error }) => {
          if (error) {
            console.error('❌ Erro ao registrar access log:', error);
          } else {
            const duration = Date.now() - startTime;
            console.log(`📝 Access log: ${method} ${endpoint} - ${statusCode} (${duration}ms) - User: ${userId || 'anonymous'}`);
          }
        })
        .catch((err) => {
          console.error('❌ Erro ao inserir access log:', err);
        });

    } catch (error) {
      console.error('❌ Erro no middleware de logging:', error);
      // Não propagar erro para não afetar a resposta ao cliente
    }
  };

  // Interceptar res.json
  res.json = function(body) {
    logAccess(res.statusCode, body);
    return originalJson(body);
  };

  // Interceptar res.send
  res.send = function(body) {
    logAccess(res.statusCode, body);
    return originalSend(body);
  };

  // Interceptar res.end
  res.end = function(chunk, encoding) {
    logAccess(res.statusCode, chunk);
    return originalEnd(chunk, encoding);
  };

  // Continuar para o próximo middleware/rota
  next();
}

module.exports = {
  accessLogger
};
