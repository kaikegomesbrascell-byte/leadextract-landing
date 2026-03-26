/**
 * Integration Tests for Access Logger Middleware
 * 
 * These tests verify the access logger middleware works correctly with Express
 * and logs requests to the Supabase access_logs table.
 * 
 * To run these tests:
 * 1. Ensure Supabase is configured with proper credentials
 * 2. Ensure access_logs table exists in the database
 * 3. Run: node backend/middleware/accessLogger.integration.test.js
 */

const express = require('express');
const { accessLogger } = require('./accessLogger');
const { verifyToken } = require('./auth');
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

// Criar app Express para testes
const app = express();
app.use(express.json());

// Aplicar middleware de logging em todas as rotas
app.use(accessLogger);

// Rota pública (sem autenticação)
app.get('/api/public', (req, res) => {
  res.json({ success: true, message: 'Public endpoint' });
});

// Rota protegida (com autenticação)
app.get('/api/protected', verifyToken, (req, res) => {
  res.json({ success: true, message: 'Protected endpoint', user: req.user });
});

// Rota com verificação de pagamento
app.get('/api/premium', verifyToken, (req, res) => {
  // Simular verificação de pagamento
  req.subscription = {
    id: 'sub-test-123',
    status: 'ativo',
    plan_id: 'start'
  };
  
  res.json({ success: true, message: 'Premium endpoint', subscription: req.subscription });
});

// Rota que retorna erro
app.get('/api/error', (req, res) => {
  res.status(403).json({ 
    success: false, 
    message: 'Access denied',
    code: 'FORBIDDEN'
  });
});

// Função auxiliar para fazer requisições
async function makeRequest(path, token = null) {
  return new Promise((resolve, reject) => {
    const http = require('http');
    const options = {
      hostname: 'localhost',
      port: 3002,
      path: path,
      method: 'GET',
      headers: {
        'User-Agent': 'Integration Test Client',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          body: JSON.parse(data)
        });
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// Função para verificar logs no banco
async function checkAccessLog(endpoint, expectedCount = 1) {
  const { data, error } = await supabase
    .from('access_logs')
    .select('*')
    .eq('endpoint', endpoint)
    .order('created_at', { ascending: false })
    .limit(expectedCount);

  if (error) {
    console.error('❌ Erro ao buscar logs:', error);
    return null;
  }

  return data;
}

// Executar testes
async function runTests() {
  console.log('🧪 Iniciando testes de integração do Access Logger\n');

  // Iniciar servidor
  const server = app.listen(3002, () => {
    console.log('✅ Servidor de teste iniciado na porta 3002\n');
  });

  try {
    // Aguardar servidor iniciar
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Teste 1: Requisição pública
    console.log('📝 Teste 1: Requisição pública');
    const response1 = await makeRequest('/api/public');
    console.log(`   Status: ${response1.statusCode}`);
    console.log(`   Body: ${JSON.stringify(response1.body)}`);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    const logs1 = await checkAccessLog('/api/public');
    if (logs1 && logs1.length > 0) {
      console.log('   ✅ Log registrado no banco de dados');
      console.log(`   - Endpoint: ${logs1[0].endpoint}`);
      console.log(`   - Method: ${logs1[0].method}`);
      console.log(`   - Success: ${logs1[0].success}`);
      console.log(`   - Status Code: ${logs1[0].status_code}`);
    } else {
      console.log('   ❌ Log não encontrado no banco de dados');
    }
    console.log('');

    // Teste 2: Requisição com erro
    console.log('📝 Teste 2: Requisição com erro (403)');
    const response2 = await makeRequest('/api/error');
    console.log(`   Status: ${response2.statusCode}`);
    console.log(`   Body: ${JSON.stringify(response2.body)}`);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    const logs2 = await checkAccessLog('/api/error');
    if (logs2 && logs2.length > 0) {
      console.log('   ✅ Log de erro registrado no banco de dados');
      console.log(`   - Success: ${logs2[0].success}`);
      console.log(`   - Status Code: ${logs2[0].status_code}`);
      console.log(`   - Error Message: ${logs2[0].error_message}`);
    } else {
      console.log('   ❌ Log não encontrado no banco de dados');
    }
    console.log('');

    // Teste 3: Requisição protegida sem token
    console.log('📝 Teste 3: Requisição protegida sem token');
    const response3 = await makeRequest('/api/protected');
    console.log(`   Status: ${response3.statusCode}`);
    console.log(`   Body: ${JSON.stringify(response3.body)}`);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    const logs3 = await checkAccessLog('/api/protected');
    if (logs3 && logs3.length > 0) {
      console.log('   ✅ Log de acesso não autorizado registrado');
      console.log(`   - Success: ${logs3[0].success}`);
      console.log(`   - User ID: ${logs3[0].user_id || 'null (anonymous)'}`);
    } else {
      console.log('   ❌ Log não encontrado no banco de dados');
    }
    console.log('');

    // Teste 4: Verificar múltiplas requisições
    console.log('📝 Teste 4: Múltiplas requisições');
    await makeRequest('/api/public');
    await makeRequest('/api/public');
    await makeRequest('/api/public');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    const logs4 = await checkAccessLog('/api/public', 4); // 1 do teste 1 + 3 novas
    console.log(`   ✅ Total de logs para /api/public: ${logs4?.length || 0}`);
    console.log('');

    console.log('✅ Testes de integração concluídos!\n');

  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
  } finally {
    // Fechar servidor
    server.close(() => {
      console.log('🛑 Servidor de teste encerrado');
      process.exit(0);
    });
  }
}

// Executar testes se este arquivo for executado diretamente
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };
