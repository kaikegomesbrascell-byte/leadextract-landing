#!/usr/bin/env node

/**
 * Script de teste para o webhook do SigiloPay
 * 
 * Uso:
 *   node test-webhook.js <url> <secret_key> [event_type]
 * 
 * Exemplos:
 *   node test-webhook.js http://localhost:3000/api/webhook-sigilopay sua_secret_key
 *   node test-webhook.js https://seu-site.vercel.app/api/webhook-sigilopay sua_secret_key payment.approved
 */

const crypto = require('crypto');
const https = require('https');
const http = require('http');

// Argumentos da linha de comando
const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('❌ Uso: node test-webhook.js <url> <secret_key> [event_type]');
  console.error('');
  console.error('Exemplos:');
  console.error('  node test-webhook.js http://localhost:3000/api/webhook-sigilopay sua_secret_key');
  console.error('  node test-webhook.js https://seu-site.vercel.app/api/webhook-sigilopay sua_secret_key payment.approved');
  process.exit(1);
}

const webhookUrl = args[0];
const secretKey = args[1];
const eventType = args[2] || 'payment.approved';

// Payloads de teste para diferentes eventos
const testPayloads = {
  'payment.approved': {
    event: 'payment.approved',
    transactionId: `test_${Date.now()}`,
    status: 'approved',
    amount: 97.00,
    customer: {
      name: 'João Silva Teste',
      email: 'teste@example.com',
      document: '12345678900'
    },
    paidAt: new Date().toISOString()
  },
  'payment.rejected': {
    event: 'payment.rejected',
    transactionId: `test_${Date.now()}`,
    status: 'rejected',
    amount: 97.00,
    customer: {
      name: 'João Silva Teste',
      email: 'teste@example.com',
      document: '12345678900'
    }
  },
  'payment.expired': {
    event: 'payment.expired',
    transactionId: `test_${Date.now()}`,
    status: 'expired',
    amount: 97.00,
    customer: {
      name: 'João Silva Teste',
      email: 'teste@example.com',
      document: '12345678900'
    }
  },
  'payment.pending': {
    event: 'payment.pending',
    transactionId: `test_${Date.now()}`,
    status: 'pending',
    amount: 97.00,
    customer: {
      name: 'João Silva Teste',
      email: 'teste@example.com',
      document: '12345678900'
    }
  }
};

const payload = testPayloads[eventType];

if (!payload) {
  console.error(`❌ Evento inválido: ${eventType}`);
  console.error('Eventos válidos:', Object.keys(testPayloads).join(', '));
  process.exit(1);
}

// Gerar assinatura HMAC
const payloadString = JSON.stringify(payload);
const signature = crypto
  .createHmac('sha256', secretKey)
  .update(payloadString)
  .digest('hex');

console.log('🧪 Testando Webhook do SigiloPay');
console.log('================================');
console.log('');
console.log('📍 URL:', webhookUrl);
console.log('🔑 Secret Key:', secretKey.substring(0, 10) + '...');
console.log('📦 Evento:', eventType);
console.log('🔐 Assinatura HMAC:', signature);
console.log('');
console.log('📤 Payload:');
console.log(JSON.stringify(payload, null, 2));
console.log('');

// Fazer requisição HTTP
const url = new URL(webhookUrl);
const isHttps = url.protocol === 'https:';
const httpModule = isHttps ? https : http;

const options = {
  hostname: url.hostname,
  port: url.port || (isHttps ? 443 : 80),
  path: url.pathname,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-sigilopay-signature': signature,
    'Content-Length': Buffer.byteLength(payloadString)
  }
};

console.log('⏳ Enviando requisição...');
console.log('');

const req = httpModule.request(options, (res) => {
  let responseBody = '';

  res.on('data', (chunk) => {
    responseBody += chunk;
  });

  res.on('end', () => {
    console.log('📥 Resposta recebida:');
    console.log('================================');
    console.log('');
    console.log('Status:', res.statusCode, res.statusMessage);
    console.log('');
    console.log('Headers:');
    Object.keys(res.headers).forEach(key => {
      console.log(`  ${key}: ${res.headers[key]}`);
    });
    console.log('');
    console.log('Body:');
    try {
      const jsonBody = JSON.parse(responseBody);
      console.log(JSON.stringify(jsonBody, null, 2));
    } catch (e) {
      console.log(responseBody);
    }
    console.log('');

    if (res.statusCode === 200) {
      console.log('✅ Webhook processado com sucesso!');
    } else if (res.statusCode === 401) {
      console.log('❌ Falha na validação HMAC. Verifique a secret key.');
    } else if (res.statusCode === 404) {
      console.log('❌ Transaction ID não encontrado no banco de dados.');
    } else if (res.statusCode === 400) {
      console.log('❌ Payload inválido ou campos faltando.');
    } else {
      console.log(`⚠️ Status inesperado: ${res.statusCode}`);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Erro ao enviar requisição:', error.message);
  process.exit(1);
});

req.write(payloadString);
req.end();
