// Vercel Serverless Function para pagamento PIX
import axios from 'axios';

// Credenciais SigiloPay
const SIGILOPAY_CONFIG = {
  baseURL: 'https://app.sigilopay.com.br/api/v1',
  publicKey: process.env.SIGILOPAY_PUBLIC_KEY || 'kaikegomesbrascell_dj5xs7rlxoaoew4z',
  secretKey: process.env.SIGILOPAY_SECRET_KEY || 'nvt3mku331xhv1d8oxmqfnp20tjecpacan3v5gk0n276u5kkhexqieuz8y3cmc9f',
};

const SIGILOPAY_PIX_ENDPOINTS = ['/gateway/pix/receive', '/gateway/pix'];

const requestPixWithRetry = async (payload) => {
  let lastError;
  
  for (const endpoint of SIGILOPAY_PIX_ENDPOINTS) {
    try {
      console.log(`📤 Tentando SigiloPay endpoint: ${endpoint}`);
      
      const response = await axios.post(
        `${SIGILOPAY_CONFIG.baseURL}${endpoint}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-public-key': SIGILOPAY_CONFIG.publicKey,
            'x-secret-key': SIGILOPAY_CONFIG.secretKey,
          },
          timeout: 12000,
        }
      );
      
      if (response?.data) {
        console.log('✅ Resposta SigiloPay recebida');
        return response.data;
      }
    } catch (error) {
      lastError = error;
      console.warn(`⚠️ Falha SigiloPay endpoint ${endpoint}:`, error?.response?.status, error?.response?.data || error.message);
    }
  }
  
  throw lastError || new Error('Não foi possível conectar com SigiloPay');
};

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    console.log('📥 Recebendo requisição PIX');

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

    console.log('📤 Enviando para SigiloPay');

    // Fazer requisição para SigiloPay com retry
    const sigiloResponseData = await requestPixWithRetry(payload);

    console.log('✅ Resposta SigiloPay recebida com sucesso');

    // Retornar resposta para o frontend
    return res.status(200).json({
      success: true,
      pix: sigiloResponseData,
    });

  } catch (error) {
    console.error('❌ Erro ao processar PIX:', error.response?.data || error.message);

    return res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || 'Erro ao processar pagamento PIX',
      error: error.response?.data || error.message,
    });
  }
}
