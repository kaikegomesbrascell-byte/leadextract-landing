const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = 3001;

// Configuração Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://blodznzrdzjsvaqabsvj.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_publishable_yctKLARtWlYpbZzk0dkx1w_e9Udi8cA';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Middleware - Configuração CORS mais permissiva para desenvolvimento
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:8080', 'http://localhost:8081', 'https://leadextract-landing.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Credenciais SigiloPay
const SIGILOPAY_CONFIG = {
  baseURL: 'https://app.sigilopay.com.br/api/v1',
  publicKey: 'kaikegomesbrascell_dj5xs7rlxoaoew4z',
  secretKey: 'nvt3mku331xhv1d8oxmqfnp20tjecpacan3v5gk0n276u5kkhexqieuz8y3cmc9f',
};

// Criar instância do axios com configuração padrão para SigiloPay
const sigilopayAPI = axios.create({
  baseURL: SIGILOPAY_CONFIG.baseURL,
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json',
    'x-public-key': process.env.SIGILOPAY_PUBLIC_KEY || SIGILOPAY_CONFIG.publicKey,
    'x-secret-key': process.env.SIGILOPAY_SECRET_KEY || SIGILOPAY_CONFIG.secretKey,
  },
});

const SIGILOPAY_PIX_ENDPOINTS = ['/gateway/pix/receive', '/gateway/pix'];

const requestPixWithRetry = async (payload) => {
  let lastError;
  for (const endpoint of SIGILOPAY_PIX_ENDPOINTS) {
    try {
      console.log(`📤 Tentando SigiloPay endpoint: ${endpoint}`);
      const response = await sigilopayAPI.post(endpoint, payload);
      if (response?.data) {
        return response.data;
      }
    } catch (error) {
      lastError = error;
      console.warn(`⚠️ Falha SigiloPay endpoint ${endpoint}:`, error?.response?.status, error?.response?.data || error.message);
      // Continue para endpoint alternativo
    }
  }

  throw lastError || new Error('Não foi possível conectar com SigiloPay');
};
// Rota de teste
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Lead Extractor Payment API',
    version: '1.0.0',
  });
});

// Rota para criar pagamento PIX
app.post('/api/payment/pix', async (req, res) => {
  try {
    console.log('📥 Recebendo requisição PIX:', req.body);

    const { identifier, amount, client, expiresIn } = req.body;

    // Validar dados obrigatórios
    if (!identifier || !amount || !client) {
      return res.status(400).json({
        success: false,
        message: 'Dados obrigatórios faltando: identifier, amount, client',
      });
    }

    if (!client.name || !client.email || !client.document) {
      return res.status(400).json({
        success: false,
        message: 'Dados do cliente incompletos: name, email, document são obrigatórios',
      });
    }

    // Salvar ou atualizar cliente no Supabase
    let customerData;
    try {
      const { data: existingCustomer, error: findError } = await supabase
        .from('customers')
        .select('id')
        .eq('email', client.email)
        .single();

      if (findError && findError.code !== 'PGRST116') { // PGRST116 = not found
        console.error('Erro ao buscar cliente:', findError);
      }

      if (existingCustomer) {
        // Atualizar cliente existente
        const { data, error } = await supabase
          .from('customers')
          .update({
            name: client.name,
            document: client.document,
            phone: client.phone || null,
          })
          .eq('id', existingCustomer.id)
          .select()
          .single();

        if (error) throw error;
        customerData = data;
        console.log('✅ Cliente atualizado:', customerData.id);
      } else {
        // Criar novo cliente
        const { data, error } = await supabase
          .from('customers')
          .insert({
            name: client.name,
            email: client.email,
            document: client.document,
            phone: client.phone || null,
          })
          .select()
          .single();

        if (error) throw error;
        customerData = data;
        console.log('✅ Cliente criado:', customerData.id);
      }
    } catch (dbError) {
      console.error('❌ Erro no banco de dados:', dbError);
      // Continua mesmo com erro no DB para não quebrar o pagamento
    }

    // Preparar payload para SigiloPay
    const payload = {
      identifier,
      amount,
      client: {
        name: client.name,
        email: client.email,
        document: client.document,
        ...(client.phone && { phone: client.phone }),
      },
      expiresIn: expiresIn || 3600,
    };

    console.log('📤 Enviando para SigiloPay:', payload);

    // Fazer requisição para SigiloPay com retry endpoint/fallback
    const sigiloResponseData = await requestPixWithRetry(payload);

    console.log('✅ Resposta SigiloPay:', sigiloResponseData);

    // Salvar pagamento no Supabase
    if (customerData) {
      try {
        const { data: paymentData, error: paymentError } = await supabase
          .from('payments')
          .insert({
            customer_id: customerData.id,
            amount: amount,
            method: 'pix',
            status: 'pending',
            pix_qr_code: sigiloResponseData.qr_code || sigiloResponseData.pix?.qrCode || null,
            pix_key: sigiloResponseData.pix_key || sigiloResponseData.pix?.code || null,
            sigilopay_id: sigiloResponseData.id || identifier,
          })
          .select()
          .single();

        if (paymentError) {
          console.error('❌ Erro ao salvar pagamento:', paymentError);
        } else {
          console.log('✅ Pagamento salvo:', paymentData.id);
        }
      } catch (dbError) {
        console.error('❌ Erro ao salvar pagamento no DB:', dbError);
      }
    }

    // Retornar resposta para o frontend
    res.json({
      success: true,
      pix: sigiloResponseData,
    });

  } catch (error) {
    console.error('❌ Erro ao processar PIX:', error.response?.data || error.message);

    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || 'Erro ao processar pagamento PIX',
      error: error.response?.data || error.message,
    });
  }
});

// Rota para criar pagamento com Cartão
app.post('/api/payment/card', async (req, res) => {
  try {
    console.log('📥 Recebendo requisição Cartão:', req.body);

    const { product, customer, payment } = req.body;

    // Validar dados obrigatórios
    if (!product || !customer || !payment) {
      return res.status(400).json({
        success: false,
        message: 'Dados obrigatórios faltando: product, customer, payment',
      });
    }

    // Salvar ou atualizar cliente no Supabase
    let customerData;
    try {
      const { data: existingCustomer, error: findError } = await supabase
        .from('customers')
        .select('id')
        .eq('email', customer.email)
        .single();

      if (findError && findError.code !== 'PGRST116') { // PGRST116 = not found
        console.error('Erro ao buscar cliente:', findError);
      }

      if (existingCustomer) {
        // Atualizar cliente existente
        const { data, error } = await supabase
          .from('customers')
          .update({
            name: customer.name,
            document: customer.document,
            phone: customer.phone || null,
          })
          .eq('id', existingCustomer.id)
          .select()
          .single();

        if (error) throw error;
        customerData = data;
        console.log('✅ Cliente atualizado:', customerData.id);
      } else {
        // Criar novo cliente
        const { data, error } = await supabase
          .from('customers')
          .insert({
            name: customer.name,
            email: customer.email,
            document: customer.document,
            phone: customer.phone || null,
          })
          .select()
          .single();

        if (error) throw error;
        customerData = data;
        console.log('✅ Cliente criado:', customerData.id);
      }
    } catch (dbError) {
      console.error('❌ Erro no banco de dados:', dbError);
      // Continua mesmo com erro no DB para não quebrar o pagamento
    }

    // Preparar payload para SigiloPay
    const payload = {
      identifier: `card-${Date.now()}`,
      amount: product.price,
      client: {
        name: customer.name,
        email: customer.email,
        document: customer.document,
        ...(customer.phone && { phone: customer.phone }),
      },
      payment: {
        method: 'credit_card',
        card: {
          number: payment.card.number,
          holder_name: payment.card.holder_name,
          exp_month: payment.card.exp_month,
          exp_year: payment.card.exp_year,
          cvv: payment.card.cvv,
        },
      },
    };

    console.log('📤 Enviando para SigiloPay (Cartão):', {
      ...payload,
      payment: {
        ...payload.payment,
        card: {
          ...payload.payment.card,
          number: '****' + payload.payment.card.number.slice(-4),
          cvv: '***',
        },
      },
    });

    // Fazer requisição para SigiloPay
    const response = await sigilopayAPI.post('/gateway/card/charge', payload);

    console.log('✅ Resposta SigiloPay (Cartão):', response.data);

    // Salvar pagamento no Supabase
    if (customerData) {
      try {
        const { data: paymentData, error: paymentError } = await supabase
          .from('payments')
          .insert({
            customer_id: customerData.id,
            amount: product.price,
            method: 'card',
            status: 'pending',
            sigilopay_id: response.data.id || payload.identifier,
          })
          .select()
          .single();

        if (paymentError) {
          console.error('❌ Erro ao salvar pagamento:', paymentError);
        } else {
          console.log('✅ Pagamento salvo:', paymentData.id);
        }
      } catch (dbError) {
        console.error('❌ Erro ao salvar pagamento no DB:', dbError);
      }
    }

    // Retornar resposta para o frontend
    res.json({
      success: true,
      payment: response.data,
    });

  } catch (error) {
    console.error('❌ Erro ao processar Cartão:', error.response?.data || error.message);
    
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || 'Erro ao processar pagamento com cartão',
      error: error.response?.data || error.message,
    });
  }
});

// Rota para webhook (receber notificações de pagamento)
app.post('/api/webhook/payment', async (req, res) => {
  try {
    console.log('🔔 Webhook recebido:', req.body);

    const { event, data } = req.body;

    // Processar diferentes tipos de eventos
    switch (event) {
      case 'payment.approved':
        console.log('✅ Pagamento aprovado:', data);
        // Atualizar status no Supabase
        if (data.id) {
          try {
            const { error } = await supabase
              .from('payments')
              .update({ status: 'approved' })
              .eq('sigilopay_id', data.id);

            if (error) {
              console.error('❌ Erro ao atualizar pagamento aprovado:', error);
            } else {
              console.log('✅ Status do pagamento atualizado para aprovado');
            }
          } catch (dbError) {
            console.error('❌ Erro no banco ao atualizar pagamento:', dbError);
          }
        }
        break;

      case 'payment.pending':
        console.log('⏳ Pagamento pendente:', data);
        break;

      case 'payment.failed':
        console.log('❌ Pagamento falhou:', data);
        // Atualizar status no Supabase
        if (data.id) {
          try {
            const { error } = await supabase
              .from('payments')
              .update({ status: 'failed' })
              .eq('sigilopay_id', data.id);

            if (error) {
              console.error('❌ Erro ao atualizar pagamento falhado:', error);
            } else {
              console.log('✅ Status do pagamento atualizado para falhado');
            }
          } catch (dbError) {
            console.error('❌ Erro no banco ao atualizar pagamento:', dbError);
          }
        }
        break;

      default:
        console.log('ℹ️ Evento desconhecido:', event);
    }

    // Sempre retornar 200 para o webhook
    res.status(200).json({ received: true });

  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error);
    res.status(500).json({ error: 'Erro ao processar webhook' });
  }
});

// Rotas para gerenciamento de clientes
app.get('/api/customers', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      customers: data,
    });
  } catch (error) {
    console.error('❌ Erro ao buscar clientes:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar clientes',
      error: error.message,
    });
  }
});

app.get('/api/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('customers')
      .select(`
        *,
        payments (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    res.json({
      success: true,
      customer: data,
    });
  } catch (error) {
    console.error('❌ Erro ao buscar cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar cliente',
      error: error.message,
    });
  }
});

// Rotas para gerenciamento de usuários
app.get('/api/users', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      users: data,
    });
  } catch (error) {
    console.error('❌ Erro ao buscar usuários:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar usuários',
      error: error.message,
    });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { email, name, role } = req.body;

    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email e nome são obrigatórios',
      });
    }

    const { data, error } = await supabase
      .from('users')
      .insert({
        email,
        name,
        role: role || 'user',
      })
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      user: data,
    });
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar usuário',
      error: error.message,
    });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { email, name, role } = req.body;

    const { data, error } = await supabase
      .from('users')
      .update({
        email,
        name,
        role,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      user: data,
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar usuário',
      error: error.message,
    });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Usuário deletado com sucesso',
    });
  } catch (error) {
    console.error('❌ Erro ao deletar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar usuário',
      error: error.message,
    });
  }
});

// Rota para estatísticas
app.get('/api/stats', async (req, res) => {
  try {
    // Buscar estatísticas dos clientes
    const { data: customersStats, error: customersError } = await supabase
      .from('customers')
      .select('id', { count: 'exact' });

    if (customersError) throw customersError;

    // Buscar estatísticas dos pagamentos
    const { data: paymentsStats, error: paymentsError } = await supabase
      .from('payments')
      .select('amount, status');

    if (paymentsError) throw paymentsError;

    // Calcular estatísticas
    const totalCustomers = customersStats?.length || 0;
    const totalPayments = paymentsStats?.length || 0;
    const totalRevenue = paymentsStats?.reduce((sum, payment) => sum + parseFloat(payment.amount), 0) || 0;
    const approvedPayments = paymentsStats?.filter(p => p.status === 'approved').length || 0;

    res.json({
      success: true,
      stats: {
        totalCustomers,
        totalPayments,
        totalRevenue,
        approvedPayments,
        conversionRate: totalPayments > 0 ? (approvedPayments / totalPayments * 100).toFixed(2) : 0,
      },
    });
  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar estatísticas',
      error: error.message,
    });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 ========================================');
  console.log('🚀 Lead Extractor Payment API');
  console.log('🚀 ========================================');
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log('🚀 ========================================');
  console.log('');
  console.log('📋 Rotas disponíveis:');
  console.log(`   GET  http://localhost:${PORT}/`);
  console.log(`   POST http://localhost:${PORT}/api/payment/pix`);
  console.log(`   POST http://localhost:${PORT}/api/payment/card`);
  console.log(`   POST http://localhost:${PORT}/api/webhook/payment`);
  console.log(`   GET  http://localhost:${PORT}/api/customers`);
  console.log(`   GET  http://localhost:${PORT}/api/customers/:id`);
  console.log(`   GET  http://localhost:${PORT}/api/users`);
  console.log(`   POST http://localhost:${PORT}/api/users`);
  console.log(`   PUT  http://localhost:${PORT}/api/users/:id`);
  console.log(`   DELETE http://localhost:${PORT}/api/users/:id`);
  console.log(`   GET  http://localhost:${PORT}/api/stats`);
  console.log('');
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (error) => {
  console.error('❌ Erro não tratado:', error);
});
