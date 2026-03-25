const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 3001;

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

// Criar instância do axios com configuração padrão
const sigilopayAPI = axios.create({
  baseURL: SIGILOPAY_CONFIG.baseURL,
  headers: {
    'Content-Type': 'application/json',
    'x-public-key': SIGILOPAY_CONFIG.publicKey,
    'x-secret-key': SIGILOPAY_CONFIG.secretKey,
  },
});

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

    // Fazer requisição para SigiloPay
    const response = await sigilopayAPI.post('/gateway/pix/receive', payload);

    console.log('✅ Resposta SigiloPay:', response.data);

    // Retornar resposta para o frontend
    res.json({
      success: true,
      pix: response.data,
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
        // Aqui você pode enviar email, liberar acesso, etc.
        break;

      case 'payment.pending':
        console.log('⏳ Pagamento pendente:', data);
        break;

      case 'payment.failed':
        console.log('❌ Pagamento falhou:', data);
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
  console.log('');
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (error) => {
  console.error('❌ Erro não tratado:', error);
});
