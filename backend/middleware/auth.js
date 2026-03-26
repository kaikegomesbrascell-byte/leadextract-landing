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
 * Middleware para verificar token JWT do Supabase
 * Valida o token, extrai dados do usuário e anexa ao objeto request
 * 
 * Validates: Requirements 5.2, 5.3, 5.4, 9.2
 */
async function verifyToken(req, res, next) {
  try {
    // Extrair token do header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Token de autenticação não fornecido',
        code: 'NO_TOKEN'
      });
    }

    // Verificar formato "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        success: false,
        message: 'Formato de token inválido. Use: Bearer <token>',
        code: 'INVALID_TOKEN_FORMAT'
      });
    }

    const token = parts[1];

    // Validar token com Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error) {
      // Tratar erros específicos do Supabase
      if (error.message.includes('expired') || error.message.includes('JWT expired')) {
        return res.status(401).json({
          success: false,
          message: 'Token expirado. Faça login novamente.',
          code: 'TOKEN_EXPIRED'
        });
      }

      if (error.message.includes('invalid') || error.message.includes('malformed')) {
        return res.status(401).json({
          success: false,
          message: 'Token inválido',
          code: 'INVALID_TOKEN'
        });
      }

      // Erro genérico de autenticação
      return res.status(401).json({
        success: false,
        message: 'Falha na autenticação',
        code: 'AUTH_FAILED',
        details: error.message
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado',
        code: 'USER_NOT_FOUND'
      });
    }

    // Anexar dados do usuário ao request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role || 'user',
      email_confirmed_at: user.email_confirmed_at,
      created_at: user.created_at
    };

    // Continuar para o próximo middleware/rota
    next();

  } catch (error) {
    console.error('❌ Erro no middleware de autenticação:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao verificar autenticação',
      code: 'INTERNAL_ERROR'
    });
  }
}

/**
 * Middleware para verificar status de pagamento do usuário
 * Consulta a tabela subscriptions e verifica se o usuário tem assinatura ativa
 * Anexa dados da subscription ao objeto request
 * 
 * Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 7.6
 * 
 * IMPORTANTE: Este middleware deve ser usado APÓS verifyToken
 */
async function checkPaymentStatus(req, res, next) {
  try {
    // Verificar se o usuário foi autenticado pelo middleware anterior
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado. Use verifyToken antes deste middleware.',
        code: 'NOT_AUTHENTICATED'
      });
    }

    const userId = req.user.id;

    // Consultar subscription ativa do usuário
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'ativo')
      .single();

    if (error) {
      // Se não encontrou subscription ativa, verificar se existe alguma subscription
      if (error.code === 'PGRST116') { // PostgreSQL error: no rows returned
        // Buscar qualquer subscription do usuário para fornecer mensagem contextual
        const { data: anySubscription } = await supabase
          .from('subscriptions')
          .select('status')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (anySubscription) {
          // Usuário tem subscription, mas não está ativa
          const statusMessages = {
            'expirado': 'Sua assinatura expirou. Renove para continuar acessando a plataforma.',
            'pendente': 'Seu pagamento está pendente. Complete o pagamento para acessar a plataforma.',
            'cancelado': 'Sua assinatura foi cancelada. Reative para continuar acessando a plataforma.'
          };

          return res.status(403).json({
            success: false,
            message: statusMessages[anySubscription.status] || 'Acesso negado',
            code: 'PAYMENT_INACTIVE',
            status: anySubscription.status
          });
        }

        // Usuário não tem nenhuma subscription
        return res.status(403).json({
          success: false,
          message: 'Nenhuma assinatura encontrada. Adquira um plano para acessar a plataforma.',
          code: 'NO_SUBSCRIPTION'
        });
      }

      // Erro ao consultar banco de dados
      console.error('❌ Erro ao consultar subscription:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao verificar status de pagamento',
        code: 'DATABASE_ERROR'
      });
    }

    // Verificar se a subscription está realmente ativa e não expirada
    if (subscription.expires_at) {
      const expirationDate = new Date(subscription.expires_at);
      const now = new Date();

      if (expirationDate < now) {
        // Subscription expirou (o trigger do banco deveria ter atualizado, mas verificamos aqui também)
        return res.status(403).json({
          success: false,
          message: 'Sua assinatura expirou. Renove para continuar acessando a plataforma.',
          code: 'SUBSCRIPTION_EXPIRED',
          expired_at: subscription.expires_at
        });
      }
    }

    // Anexar dados da subscription ao request
    req.subscription = {
      id: subscription.id,
      plan_id: subscription.plan_id,
      status: subscription.status,
      extraction_limit: subscription.extraction_limit,
      extractions_used: subscription.extractions_used,
      activated_at: subscription.activated_at,
      expires_at: subscription.expires_at,
      created_at: subscription.created_at
    };

    // Registrar timestamp da verificação (Requirement 7.7)
    // Nota: O middleware de logging (Task 3.4) irá registrar isso em access_logs

    // Continuar para o próximo middleware/rota
    next();

  } catch (error) {
    console.error('❌ Erro no middleware de verificação de pagamento:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao verificar status de pagamento',
      code: 'INTERNAL_ERROR'
    });
  }
}

// Importar rate limiter e access logger
const { rateLimiter } = require('./rateLimiter');
const { accessLogger } = require('./accessLogger');

module.exports = {
  verifyToken,
  checkPaymentStatus,
  rateLimiter,
  accessLogger
};
