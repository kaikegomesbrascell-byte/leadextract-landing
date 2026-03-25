// Script para testar a API de pagamento PIX
import http from 'http';

// Primeiro teste: verificar se servidor está online
console.log('🔍 Testando conexão com API...\n');

const testGetRoot = () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('✅ Status do servidor:', res.statusCode);
        console.log('📋 Resposta:', data);
        resolve();
      });
    });

    req.on('error', (e) => {
      console.error('❌ Erro ao conectar:', e.message);
      reject(e);
    });

    req.end();
  });
};

// Segundo teste: enviar requisição PIX de teste
const testPixPayment = () => {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      identifier: `test-${Date.now()}`,
      amount: 1000,
      client: {
        name: "Teste Lead Extractor",
        email: "teste@leadextract.com",
        document: "12345678901",
        phone: "1199999999"
      },
      expiresIn: 3600
    });

    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/payment/pix',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('\n📤 Teste de Pagamento PIX');
        console.log('Status HTTP:', res.statusCode);
        try {
          const parsed = JSON.parse(data);
          console.log('Resposta:', JSON.stringify(parsed, null, 2));
        } catch (e) {
          console.log('Resposta bruta:', data);
        }
        resolve();
      });
    });

    req.on('error', (e) => {
      console.error('❌ Erro ao enviar PIX:', e.message);
      reject(e);
    });

    req.write(payload);
    req.end();
  });
};

// Executar testes
async function runTests() {
  try {
    await testGetRoot();
    await new Promise(r => setTimeout(r, 1000)); // Aguardar 1 segundo
    await testPixPayment();
    console.log('\n✅ Testes completados!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro durante testes:', error.message);
    process.exit(1);
  }
}

runTests();
