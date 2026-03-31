/**
 * End-to-End Integration Tests for SigiloPay Webhook Integration
 * 
 * Feature: sigilopay-webhook-integration
 * Task 13: Testes de integração end-to-end
 * 
 * Sub-tasks:
 * - 13.1: Teste de fluxo completo (checkout → webhook → ativação)
 * - 13.2: Teste de integridade referencial (ON DELETE SET NULL)
 * - 13.3: Testes de segurança HMAC
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Configuração Supabase para testes
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const sigilopaySecretKey = process.env.SIGILOPAY_SECRET_KEY;

if (!supabaseUrl || !supabaseServiceKey || !sigilopaySecretKey) {
  console.error('❌ Variáveis de ambiente necessárias não configuradas para testes E2E');
  console.error('');
  console.error('Configure as seguintes variáveis no arquivo .env:');
  console.error('  - VITE_SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY');
  console.error('  - SIGILOPAY_SECRET_KEY');
  console.error('');
  console.error('Veja .env.test.example para um exemplo de configuração.');
  console.error('');
  console.error('⚠️  IMPORTANTE: Use credenciais de teste/staging, NUNCA credenciais de produção!');
  throw new Error('Variáveis de ambiente necessárias não configuradas para testes E2E');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Importar handlers do webhook
const webhookHandler = require('../webhook-sigilopay.js');
const paymentPixHandler = require('../payment-pix.js');

/**
 * Helper: Criar mock de requisição HTTP
 */
function createMockRequest(method, body, headers = {}) {
  return {
    method,
    body,
    headers: {
      'content-type': 'application/json',
      ...headers
    }
  };
}

/**
 * Helper: Criar mock de resposta HTTP
 */
function createMockResponse() {
  const res = {
    statusCode: 200,
    headers: {},
    body: null,
    setHeader(key, value) {
      this.headers[key] = value;
      return this;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
    end() {
      return this;
    }
  };
  return res;
}

/**
 * Helper: Calcular assinatura HMAC
 */
function calculateHMAC(payload, secretKey) {
  const payloadString = JSON.stringify(payload);
  return crypto
    .createHmac('sha256', secretKey)
    .update(payloadString)
    .digest('hex');
}

/**
 * Helper: Limpar dados de teste do banco
 */
async function cleanupTestData(email) {
  // Deletar em ordem para respeitar foreign keys
  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('email', email)
    .single();
  
  if (customer) {
    await supabase.from('payments').delete().eq('customer_id', customer.id);
    await supabase.from('subscriptions').delete().eq('user_id', customer.id);
    await supabase.from('customers').delete().eq('id', customer.id);
  }
}

describe('Task 13.1: Teste de fluxo completo end-to-end', () => {
  const testEmail = `e2e-test-${Date.now()}@example.com`;
  let testUserId;
  let testSubscriptionId;
  let testPaymentId;
  let testTransactionId;

  beforeEach(async () => {
    await cleanupTestData(testEmail);
  });

  afterAll(async () => {
    await cleanupTestData(testEmail);
  });

  it('deve completar fluxo: checkout → subscription pending → webhook → subscription active', async () => {
    // **Validates: Requirements 1.1, 1.5, 4.6, 4.7, 4.10**
    
    // ETAPA 1: Criar usuário no Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      email_confirm: true,
      user_metadata: {
        name: 'E2E Test User'
      }
    });

    expect(authError).toBeNull();
    expect(authUser.user).toBeDefined();
    testUserId = authUser.user.id;

    // ETAPA 2: Simular checkout - criar customer
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .insert({
        name: 'E2E Test User',
        email: testEmail,
        document: '12345678900',
        phone: '11999999999'
      })
      .select()
      .single();

    expect(customerError).toBeNull();
    expect(customer).toBeDefined();

    // ETAPA 3: Criar subscription com status 'pending'
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: testUserId,
        plan: 'premium',
        status: 'pending',
        started_at: null,
        expires_at: null
      })
      .select()
      .single();

    expect(subError).toBeNull();
    expect(subscription).toBeDefined();
    expect(subscription.status).toBe('pending');
    expect(subscription.started_at).toBeNull();
    testSubscriptionId = subscription.id;

    // ETAPA 4: Criar payment com subscription_id
    testTransactionId = `e2e_test_${Date.now()}`;
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        customer_id: customer.id,
        subscription_id: testSubscriptionId,
        amount: 97.00,
        method: 'pix',
        status: 'pending',
        sigilopay_id: testTransactionId,
        pix_qr_code: 'mock_qr_code',
        pix_key: 'mock_pix_key'
      })
      .select()
      .single();

    expect(paymentError).toBeNull();
    expect(payment).toBeDefined();
    expect(payment.status).toBe('pending');
    expect(payment.subscription_id).toBe(testSubscriptionId);
    testPaymentId = payment.id;

    // ETAPA 5: Simular webhook payment.approved
    const webhookPayload = {
      event: 'payment.approved',
      transactionId: testTransactionId,
      status: 'approved',
      amount: 97.00,
      customer: {
        name: 'E2E Test User',
        email: testEmail,
        document: '12345678900'
      },
      paidAt: new Date().toISOString()
    };

    const signature = calculateHMAC(webhookPayload, sigilopaySecretKey);
    const req = createMockRequest('POST', webhookPayload, {
      'x-sigilopay-signature': signature
    });
    const res = createMockResponse();

    await webhookHandler(req, res);

    // ETAPA 6: Verificar resposta do webhook
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    // ETAPA 7: Verificar payment atualizado para 'approved'
    const { data: updatedPayment } = await supabase
      .from('payments')
      .select('*')
      .eq('id', testPaymentId)
      .single();

    expect(updatedPayment.status).toBe('approved');
    expect(updatedPayment.paid_at).toBeDefined();
    expect(updatedPayment.paid_at).not.toBeNull();

    // ETAPA 8: Verificar subscription ativada com status 'active'
    const { data: updatedSubscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', testSubscriptionId)
      .single();

    expect(updatedSubscription.status).toBe('active');
    expect(updatedSubscription.started_at).toBeDefined();
    expect(updatedSubscription.started_at).not.toBeNull();
    expect(updatedSubscription.expires_at).toBeNull(); // Plano vitalício
  });

  it('deve manter subscription pending quando payment é rejeitado', async () => {
    // Setup: criar estrutura básica
    const { data: authUser } = await supabase.auth.admin.createUser({
      email: testEmail,
      email_confirm: true
    });
    testUserId = authUser.user.id;

    const { data: customer } = await supabase
      .from('customers')
      .insert({
        name: 'Test User',
        email: testEmail,
        document: '12345678900'
      })
      .select()
      .single();

    const { data: subscription } = await supabase
      .from('subscriptions')
      .insert({
        user_id: testUserId,
        plan: 'standard',
        status: 'pending'
      })
      .select()
      .single();

    testTransactionId = `e2e_rejected_${Date.now()}`;
    await supabase
      .from('payments')
      .insert({
        customer_id: customer.id,
        subscription_id: subscription.id,
        amount: 47.00,
        method: 'pix',
        status: 'pending',
        sigilopay_id: testTransactionId
      });

    // Simular webhook payment.rejected
    const webhookPayload = {
      event: 'payment.rejected',
      transactionId: testTransactionId,
      status: 'rejected',
      amount: 47.00,
      customer: {
        name: 'Test User',
        email: testEmail,
        document: '12345678900'
      }
    };

    const signature = calculateHMAC(webhookPayload, sigilopaySecretKey);
    const req = createMockRequest('POST', webhookPayload, {
      'x-sigilopay-signature': signature
    });
    const res = createMockResponse();

    await webhookHandler(req, res);

    // Verificar: payment failed, subscription ainda pending
    const { data: updatedPayment } = await supabase
      .from('payments')
      .select('*')
      .eq('sigilopay_id', testTransactionId)
      .single();

    expect(updatedPayment.status).toBe('failed');

    const { data: updatedSubscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', subscription.id)
      .single();

    expect(updatedSubscription.status).toBe('pending');
    expect(updatedSubscription.started_at).toBeNull();
  });
});

describe('Task 13.2: Teste de integridade referencial', () => {
  const testEmail = `integrity-test-${Date.now()}@example.com`;

  beforeEach(async () => {
    await cleanupTestData(testEmail);
  });

  afterAll(async () => {
    await cleanupTestData(testEmail);
  });

  it('deve definir payment.subscription_id como NULL quando subscription é deletada (ON DELETE SET NULL)', async () => {
    // **Validates: Requirements 11.6**
    
    // ETAPA 1: Criar estrutura completa
    const { data: authUser } = await supabase.auth.admin.createUser({
      email: testEmail,
      email_confirm: true
    });

    const { data: customer } = await supabase
      .from('customers')
      .insert({
        name: 'Integrity Test User',
        email: testEmail,
        document: '99988877766'
      })
      .select()
      .single();

    const { data: subscription } = await supabase
      .from('subscriptions')
      .insert({
        user_id: authUser.user.id,
        plan: 'premium',
        status: 'active',
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    const { data: payment } = await supabase
      .from('payments')
      .insert({
        customer_id: customer.id,
        subscription_id: subscription.id,
        amount: 97.00,
        method: 'pix',
        status: 'approved',
        sigilopay_id: `integrity_test_${Date.now()}`
      })
      .select()
      .single();

    // Verificar que subscription_id está definido
    expect(payment.subscription_id).toBe(subscription.id);

    // ETAPA 2: Deletar subscription
    const { error: deleteError } = await supabase
      .from('subscriptions')
      .delete()
      .eq('id', subscription.id);

    expect(deleteError).toBeNull();

    // ETAPA 3: Verificar que payment.subscription_id foi definido como NULL
    const { data: updatedPayment } = await supabase
      .from('payments')
      .select('*')
      .eq('id', payment.id)
      .single();

    expect(updatedPayment).toBeDefined();
    expect(updatedPayment.subscription_id).toBeNull();
  });

  it('deve manter payment quando customer é deletado (ON DELETE SET NULL)', async () => {
    // Criar estrutura
    const { data: customer } = await supabase
      .from('customers')
      .insert({
        name: 'Customer Delete Test',
        email: testEmail,
        document: '11122233344'
      })
      .select()
      .single();

    const { data: payment } = await supabase
      .from('payments')
      .insert({
        customer_id: customer.id,
        subscription_id: null,
        amount: 47.00,
        method: 'pix',
        status: 'pending',
        sigilopay_id: `customer_delete_${Date.now()}`
      })
      .select()
      .single();

    expect(payment.customer_id).toBe(customer.id);

    // Deletar customer
    await supabase
      .from('customers')
      .delete()
      .eq('id', customer.id);

    // Verificar payment ainda existe com customer_id NULL
    const { data: updatedPayment } = await supabase
      .from('payments')
      .select('*')
      .eq('id', payment.id)
      .single();

    expect(updatedPayment).toBeDefined();
    expect(updatedPayment.customer_id).toBeNull();
  });
});

describe('Task 13.3: Testes de segurança HMAC', () => {
  const testTransactionId = `hmac_test_${Date.now()}`;
  const testEmail = `hmac-test-${Date.now()}@example.com`;

  beforeEach(async () => {
    await cleanupTestData(testEmail);
    
    // Criar payment de teste para os testes HMAC
    const { data: customer } = await supabase
      .from('customers')
      .insert({
        name: 'HMAC Test User',
        email: testEmail,
        document: '55566677788'
      })
      .select()
      .single();

    await supabase
      .from('payments')
      .insert({
        customer_id: customer.id,
        subscription_id: null,
        amount: 97.00,
        method: 'pix',
        status: 'pending',
        sigilopay_id: testTransactionId
      });
  });

  afterAll(async () => {
    await cleanupTestData(testEmail);
  });

  it('deve aceitar webhook com assinatura HMAC válida', async () => {
    // **Validates: Requirements 3.1, 3.4, 3.5**
    
    const webhookPayload = {
      event: 'payment.approved',
      transactionId: testTransactionId,
      status: 'approved',
      amount: 97.00,
      customer: {
        name: 'HMAC Test User',
        email: testEmail,
        document: '55566677788'
      },
      paidAt: new Date().toISOString()
    };

    // Calcular assinatura HMAC correta
    const validSignature = calculateHMAC(webhookPayload, sigilopaySecretKey);

    const req = createMockRequest('POST', webhookPayload, {
      'x-sigilopay-signature': validSignature
    });
    const res = createMockResponse();

    await webhookHandler(req, res);

    // Webhook deve ser aceito
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('deve rejeitar webhook com assinatura HMAC inválida', async () => {
    // **Validates: Requirements 3.4**
    
    const webhookPayload = {
      event: 'payment.approved',
      transactionId: testTransactionId,
      status: 'approved',
      amount: 97.00,
      customer: {
        name: 'HMAC Test User',
        email: testEmail,
        document: '55566677788'
      },
      paidAt: new Date().toISOString()
    };

    // Usar assinatura inválida
    const invalidSignature = 'invalid_signature_12345';

    const req = createMockRequest('POST', webhookPayload, {
      'x-sigilopay-signature': invalidSignature
    });
    const res = createMockResponse();

    await webhookHandler(req, res);

    // Webhook deve ser rejeitado com 401
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_SIGNATURE');
  });

  it('deve rejeitar webhook sem header de assinatura', async () => {
    // **Validates: Requirements 3.5**
    
    const webhookPayload = {
      event: 'payment.approved',
      transactionId: testTransactionId,
      status: 'approved',
      amount: 97.00,
      customer: {
        name: 'HMAC Test User',
        email: testEmail,
        document: '55566677788'
      },
      paidAt: new Date().toISOString()
    };

    // Não incluir header x-sigilopay-signature
    const req = createMockRequest('POST', webhookPayload, {});
    const res = createMockResponse();

    await webhookHandler(req, res);

    // Webhook deve ser rejeitado com 401
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('MISSING_SIGNATURE');
  });

  it('deve rejeitar webhook com secret key incorreta', async () => {
    const webhookPayload = {
      event: 'payment.approved',
      transactionId: testTransactionId,
      status: 'approved',
      amount: 97.00,
      customer: {
        name: 'HMAC Test User',
        email: testEmail,
        document: '55566677788'
      },
      paidAt: new Date().toISOString()
    };

    // Calcular assinatura com secret key incorreta
    const wrongSecretKey = 'wrong_secret_key_123';
    const wrongSignature = calculateHMAC(webhookPayload, wrongSecretKey);

    const req = createMockRequest('POST', webhookPayload, {
      'x-sigilopay-signature': wrongSignature
    });
    const res = createMockResponse();

    await webhookHandler(req, res);

    // Webhook deve ser rejeitado com 401
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_SIGNATURE');
  });

  it('deve rejeitar webhook com payload modificado após assinatura', async () => {
    const originalPayload = {
      event: 'payment.approved',
      transactionId: testTransactionId,
      status: 'approved',
      amount: 97.00,
      customer: {
        name: 'HMAC Test User',
        email: testEmail,
        document: '55566677788'
      },
      paidAt: new Date().toISOString()
    };

    // Calcular assinatura do payload original
    const validSignature = calculateHMAC(originalPayload, sigilopaySecretKey);

    // Modificar payload após calcular assinatura (ataque)
    const modifiedPayload = {
      ...originalPayload,
      amount: 1.00 // Tentar mudar o valor
    };

    const req = createMockRequest('POST', modifiedPayload, {
      'x-sigilopay-signature': validSignature
    });
    const res = createMockResponse();

    await webhookHandler(req, res);

    // Webhook deve ser rejeitado porque assinatura não corresponde ao payload modificado
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_SIGNATURE');
  });
});
