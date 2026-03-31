const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

// Configuração Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Secret key do SigiloPay para validação HMAC
const SIGILOPAY_SECRET_KEY = process.env.SIGILOPAY_WEBHOOK_SECRET || process.env.SIGILOPAY_SECRET_KEY;

// Logger estruturado
const logger = {
  info: (message, context = {}) => {
    console.log(JSON.stringify({
      level: 'INFO',
      timestamp: new Date().toISOString(),
      message,
      ...context
    }));
  },
  
  warn: (message, context = {}) => {
    console.warn(JSON.stringify({
      level: 'WARN',
      timestamp: new Date().toISOString(),
      message,
      ...context
    }));
  },
  
  error: (message, error, context = {}) => {
    console.error(JSON.stringify({
      level: 'ERROR',
      timestamp: new Date().toISOString(),
      message,
      error: error?.message || error,
      stack: error?.stack,
      ...context
    }));
  }
};

/**
 * Valida assinatura HMAC do webhook
 */
function validateHMAC(signature, payload, secretKey) {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(payload)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    logger.error('Erro ao validar HMAC', error);
    return false;
  }
}

/**
 * Processa evento payment.approved
 */
async function handlePaymentApproved(payload, supabase) {
  const { transactionId, paidAt, amount } = payload;
  
  logger.info('Processando payment.approved', { transactionId });
  
  // 1. Buscar payment pelo transaction ID
  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .select('*, subscription_id')
    .eq('sigilopay_id', transactionId)
    .single();
  
  if (paymentError || !payment) {
    logger.error('Payment não encontrado', paymentError, { transactionId });
    throw new Error(`Payment not found: ${transactionId}`);
  }
  
  // 2. Verificar idempotência
  if (payment.status === 'approved') {
    logger.info('Payment já aprovado (idempotência)', { 
      transactionId, 
      paymentId: payment.id 
    });
    return { 
      alreadyProcessed: true, 
      payment,
      message: 'Payment already approved'
    };
  }
  
  // 3. Atualizar payment
  const { error: updatePaymentError } = await supabase
    .from('payments')
    .update({
      status: 'approved',
      paid_at: paidAt || new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', payment.id);
  
  if (updatePaymentError) {
    logger.error('Erro ao atualizar payment', updatePaymentError, { transactionId });
    throw updatePaymentError;
  }
  
  logger.info('Payment atualizado para approved', { 
    transactionId, 
    paymentId: payment.id 
  });
  
  // 4. Ativar subscription se existir e estiver pending
  if (payment.subscription_id) {
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', payment.subscription_id)
      .single();
    
    if (subError) {
      logger.error('Erro ao buscar subscription', subError, { 
        subscriptionId: payment.subscription_id 
      });
      throw subError;
    }
    
    if (subscription && subscription.status === 'pending') {
      const { error: updateSubError } = await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          started_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', subscription.id);
      
      if (updateSubError) {
        logger.error('Erro ao ativar subscription', updateSubError, { 
          subscriptionId: subscription.id 
        });
        throw updateSubError;
      }
      
      logger.info('Subscription ativada', { 
        subscriptionId: subscription.id,
        plan: subscription.plan,
        userId: subscription.user_id
      });
      
      return { 
        subscriptionActivated: true, 
        subscription,
        payment
      };
    } else {
      logger.info('Subscription não está pending', { 
        subscriptionId: subscription?.id,
        status: subscription?.status
      });
    }
  }
  
  return { paymentUpdated: true, payment };
}

/**
 * Processa evento payment.rejected
 */
async function handlePaymentRejected(payload, supabase) {
  const { transactionId } = payload;
  
  logger.info('Processando payment.rejected', { transactionId });
  
  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .select('*')
    .eq('sigilopay_id', transactionId)
    .single();
  
  if (paymentError || !payment) {
    logger.error('Payment não encontrado', paymentError, { transactionId });
    throw new Error(`Payment not found: ${transactionId}`);
  }
  
  await supabase
    .from('payments')
    .update({
      status: 'failed',
      updated_at: new Date().toISOString()
    })
    .eq('id', payment.id);
  
  logger.info('Payment marcado como failed', { transactionId, paymentId: payment.id });
  
  return { paymentRejected: true, payment };
}

/**
 * Processa evento payment.expired
 */
async function handlePaymentExpired(payload, supabase) {
  const { transactionId } = payload;
  
  logger.info('Processando payment.expired', { transactionId });
  
  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .select('*')
    .eq('sigilopay_id', transactionId)
    .single();
  
  if (paymentError || !payment) {
    logger.error('Payment não encontrado', paymentError, { transactionId });
    throw new Error(`Payment not found: ${transactionId}`);
  }
  
  await supabase
    .from('payments')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString()
    })
    .eq('id', payment.id);
  
  logger.info('Payment marcado como cancelled', { transactionId, paymentId: payment.id });
  
  return { paymentExpired: true, payment };
}

/**
 * Processa evento payment.pending
 */
async function handlePaymentPending(payload, supabase) {
  const { transactionId } = payload;
  
  logger.info('Processando payment.pending', { transactionId });
  
  return { paymentPending: true, transactionId };
}

/**
 * Processa evento de webhook
 */
async function processEvent(payload, supabase) {
  const { event, transactionId } = payload;
  
  logger.info('Processando evento', { event, transactionId });
  
  switch (event) {
    case 'payment.approved':
      return await handlePaymentApproved(payload, supabase);
    case 'payment.rejected':
      return await handlePaymentRejected(payload, supabase);
    case 'payment.expired':
      return await handlePaymentExpired(payload, supabase);
    case 'payment.pending':
      return await handlePaymentPending(payload, supabase);
    default:
      throw new Error(`Unknown event type: ${event}`);
  }
}

/**
 * Vercel Serverless Function Handler
 */
module.exports = async (req, res) => {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-sigilopay-signature');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Apenas POST é permitido
  if (req.method !== 'POST') {
    logger.warn('Método HTTP não permitido', { method: req.method });
    return res.status(405).json({
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Only POST method is allowed'
      }
    });
  }

  try {
    // Extrair payload
    const payload = req.body;
    const payloadString = JSON.stringify(payload);
    
    logger.info('Webhook recebido', { 
      event: payload.event,
      transactionId: payload.transactionId 
    });

    // Validar campos obrigatórios
    if (!payload.event || !payload.transactionId || !payload.status || !payload.amount || !payload.customer) {
      logger.warn('Payload incompleto', { payload });
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PAYLOAD',
          message: 'Missing required fields: event, transactionId, status, amount, customer'
        }
      });
    }

    // Extrair e validar assinatura HMAC
    const signature = req.headers['x-sigilopay-signature'];
    
    if (!signature) {
      logger.warn('Assinatura HMAC ausente', {
        ip: req.headers['x-forwarded-for'] || req.connection?.remoteAddress,
        transactionId: payload.transactionId
      });
      return res.status(401).json({
        success: false,
        error: {
          code: 'MISSING_SIGNATURE',
          message: 'x-sigilopay-signature header is required'
        }
      });
    }

    // Validar HMAC
    const isValidSignature = validateHMAC(signature, payloadString, SIGILOPAY_SECRET_KEY);
    
    if (!isValidSignature) {
      logger.warn('Validação HMAC falhou', {
        ip: req.headers['x-forwarded-for'] || req.connection?.remoteAddress,
        transactionId: payload.transactionId,
        timestamp: new Date().toISOString()
      });
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_SIGNATURE',
          message: 'HMAC signature validation failed',
          transactionId: payload.transactionId
        }
      });
    }

    logger.info('Assinatura HMAC válida', { transactionId: payload.transactionId });

    // Processar evento
    const result = await processEvent(payload, supabase);

    logger.info('Evento processado com sucesso', { 
      transactionId: payload.transactionId,
      result 
    });

    return res.status(200).json({
      success: true,
      message: 'Webhook processed successfully',
      ...result
    });

  } catch (error) {
    logger.error('Erro ao processar webhook', error, {
      transactionId: req.body?.transactionId
    });

    // Determinar código de status apropriado
    let statusCode = 500;
    let errorCode = 'INTERNAL_ERROR';

    if (error.message?.includes('not found')) {
      statusCode = 404;
      errorCode = 'PAYMENT_NOT_FOUND';
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      statusCode = 503;
      errorCode = 'DATABASE_UNAVAILABLE';
    }

    return res.status(statusCode).json({
      success: false,
      error: {
        code: errorCode,
        message: error.message || 'Internal server error',
        transactionId: req.body?.transactionId
      }
    });
  }
};
