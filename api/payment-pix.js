const axios = require('axios');
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

// Credenciais SigiloPay
const SIGILOPAY_CONFIG = {
  baseURL: 'https://app.sigilopay.com.br/api/v1',
  publicKey: process.env.SIGILOPAY_PUBLIC_KEY || 'kaikegomesbrascell_dj5xs7rlxoaoew4z',
  secretKey: process.env.SIGILOPAY_SECRET_KEY || 'nvt3mku331xhv1d8oxmqfnp20tjecpacan3v5gk0n276u5kkhexqieuz8y3cmc9f',
};

// Criar instância do axios com configuração padrão para SigiloPay
const sigilopayAPI = axios.create({
  baseURL: SIGILOPAY_CONFIG.baseURL,
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json',
    'x-public-key': SIGILOPAY_CONFIG.publicKey,
    'x-secret-key': SIGILOPAY_CONFIG.secretKey,
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
    }
  }
  throw lastError || new Error('Não foi possível conectar com SigiloPay');
};

module.exports = async (req, res) => {
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

      if (findError && findError.code !== 'PGRST116') {
        console.error('Erro ao buscar cliente:', findError);
      }

      if (existingCustomer) {
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

    // Fazer requisição para SigiloPay com retry
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
};
