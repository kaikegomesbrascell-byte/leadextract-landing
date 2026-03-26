import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const SIGILOPAY_CONFIG = {
  publicKey: 'kaikegomesbrascell_dj5xs7rlxoaoew4z',
  secretKey: 'nvt3mku331xhv1d8oxmqfnp20tjecpacan3v5gk0n276u5kkhexqieuz8y3cmc9f',
  baseUrl: 'https://app.sigilopay.com.br/api/v1'
};

// Endpoint para criar pagamento PIX
app.post('/api/payment/pix', async (req, res) => {
  try {
    console.log('📥 Recebendo requisição PIX:', JSON.stringify(req.body, null, 2));
    
    // Transformar dados do frontend para o formato da API SigiloPay
    const { product, customer, settings } = req.body;
    
    const sigilopayPayload = {
      identifier: `lead-extractor-${Date.now()}`, // ID único para a transação
      amount: product.price, // Valor em reais
      client: {
        name: customer.name,
        email: customer.email,
        document: customer.document.replace(/\D/g, ''), // Remove formatação
        phone: customer.phone?.replace(/\D/g, '') // Remove formatação (opcional)
      },
      expiresIn: settings?.expiresIn || 3600 // Padrão: 1 hora
    };
    
    console.log('📤 Enviando para SigiloPay:', JSON.stringify(sigilopayPayload, null, 2));
    
    const response = await fetch(`${SIGILOPAY_CONFIG.baseUrl}/gateway/pix/receive`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-public-key': SIGILOPAY_CONFIG.publicKey,
        'x-secret-key': SIGILOPAY_CONFIG.secretKey,
      },
      body: JSON.stringify(sigilopayPayload),
    });

    const data = await response.json();
    
    console.log('📥 Resposta da SigiloPay:', {
      status: response.status,
      statusText: response.statusText,
      data: JSON.stringify(data, null, 2)
    });
    
    if (!response.ok) {
      console.error('❌ Erro da API SigiloPay:', data);
      return res.status(response.status).json(data);
    }

    console.log('✅ Pagamento PIX criado com sucesso');
    res.json(data);
  } catch (error) {
    console.error('❌ Erro ao processar pagamento PIX:', error);
    res.status(500).json({ error: 'Erro ao processar pagamento PIX', details: error.message });
  }
});

// Endpoint para criar pagamento com cartão
app.post('/api/payment/card', async (req, res) => {
  try {
    const response = await fetch(`${SIGILOPAY_CONFIG.baseUrl}/gateway/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-public-key': SIGILOPAY_CONFIG.publicKey,
        'x-secret-key': SIGILOPAY_CONFIG.secretKey,
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (error) {
    console.error('Erro ao processar pagamento com cartão:', error);
    res.status(500).json({ error: 'Erro ao processar pagamento com cartão' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
