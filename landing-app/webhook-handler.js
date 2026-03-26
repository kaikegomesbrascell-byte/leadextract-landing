import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

// Configurar transporte de email (Gmail)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'seu-email@gmail.com', // CONFIGURE SEU EMAIL AQUI
    pass: 'sua-senha-app',        // CONFIGURE SUA SENHA DE APP AQUI
  },
});

// Armazenar pagamentos aprovados (em produção, use banco de dados)
const pagamentosAprovados = new Map();

// Armazenar tokens de download
const tokensDownload = new Map();

// Webhook da SigiloPay
app.post('/webhook/sigilopay', async (req, res) => {
  try {
    console.log('📥 Webhook recebido da SigiloPay:', JSON.stringify(req.body, null, 2));

    const { event, transactionId, status, customer } = req.body;

    // Verificar se é evento de pagamento aprovado
    if (event === 'payment.approved' || status === 'APPROVED') {
      console.log(`✅ Pagamento aprovado: ${transactionId}`);

      // Salvar pagamento aprovado
      pagamentosAprovados.set(transactionId, {
        transactionId,
        customer,
        approvedAt: new Date().toISOString(),
        emailSent: false
      });

      // Gerar token de download único
      const downloadToken = crypto.randomBytes(32).toString('hex');
      tokensDownload.set(downloadToken, {
        transactionId,
        customer,
        createdAt: new Date().toISOString(),
        downloads: 0,
        maxDownloads: 3 // Permitir 3 downloads
      });

      // Enviar email com link de download
      const downloadUrl = `http://localhost:5173/download?token=${downloadToken}`;
      
      const emailEnviado = await enviarEmailComDownload(
        customer.email,
        customer.name || 'Cliente',
        downloadUrl
      );

      if (emailEnviado) {
        pagamentosAprovados.get(transactionId).emailSent = true;
        console.log(`📧 Email enviado para: ${customer.email}`);
      }

      res.json({ success: true, message: 'Webhook processado com sucesso' });
    } else {
      console.log(`ℹ️  Evento ignorado: ${event || status}`);
      res.json({ success: true, message: 'Evento ignorado' });
    }
  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error);
    res.status(500).json({ error: 'Erro ao processar webhook' });
  }
});

// Função para enviar email com link de download
async function enviarEmailComDownload(email, nome, downloadUrl) {
  try {
    const mailOptions = {
      from: '"Lead Extractor" <seu-email@gmail.com>',
      to: email,
      subject: '🎉 Seu Lead Extractor está pronto para download!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .button {
              display: inline-block;
              background: #00c853;
              color: white;
              padding: 15px 30px;
              text-decoration: none;
              border-radius: 5px;
              font-weight: bold;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              color: #666;
              font-size: 12px;
            }
            .info-box {
              background: #e3f2fd;
              border-left: 4px solid #2196f3;
              padding: 15px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🚀 Pagamento Confirmado!</h1>
          </div>
          <div class="content">
            <p>Olá <strong>${nome}</strong>,</p>
            
            <p>Seu pagamento foi confirmado com sucesso! 🎉</p>
            
            <p>Agora você pode baixar o <strong>Google Maps Lead Extractor</strong> e começar a extrair leads ilimitados.</p>
            
            <div style="text-align: center;">
              <a href="${downloadUrl}" class="button">📥 BAIXAR LEAD EXTRACTOR</a>
            </div>
            
            <div class="info-box">
              <strong>📋 O que você vai receber:</strong>
              <ul>
                <li>✅ Software completo Lead Extractor</li>
                <li>✅ Todos os arquivos necessários</li>
                <li>✅ Instruções de instalação</li>
                <li>✅ Suporte técnico</li>
              </ul>
            </div>
            
            <p><strong>⚠️ Importante:</strong></p>
            <ul>
              <li>Este link é válido para 3 downloads</li>
              <li>Guarde este email para referência futura</li>
              <li>Se tiver problemas, entre em contato conosco</li>
            </ul>
            
            <p>Obrigado pela sua compra!</p>
            
            <p>Atenciosamente,<br><strong>Equipe Lead Extractor</strong></p>
          </div>
          <div class="footer">
            <p>Este é um email automático. Por favor, não responda.</p>
            <p>Se precisar de ajuda, entre em contato conosco.</p>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error);
    return false;
  }
}

// Endpoint para download do arquivo
app.get('/api/download/:token', async (req, res) => {
  try {
    const { token } = req.params;

    // Verificar se o token é válido
    const tokenData = tokensDownload.get(token);

    if (!tokenData) {
      return res.status(404).send('Link de download inválido ou expirado');
    }

    // Verificar limite de downloads
    if (tokenData.downloads >= tokenData.maxDownloads) {
      return res.status(403).send('Limite de downloads atingido. Entre em contato com o suporte.');
    }

    // Caminho do arquivo ZIP
    const filePath = path.join(__dirname, 'downloads', 'lead-extractor.zip');

    // Verificar se o arquivo existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).send('Arquivo não encontrado. Entre em contato com o suporte.');
    }

    // Incrementar contador de downloads
    tokenData.downloads++;
    tokensDownload.set(token, tokenData);

    console.log(`📦 Download iniciado: ${tokenData.customer.email} (${tokenData.downloads}/${tokenData.maxDownloads})`);

    // Enviar arquivo
    res.download(filePath, 'lead-extractor.zip', (err) => {
      if (err) {
        console.error('❌ Erro ao enviar arquivo:', err);
      } else {
        console.log(`✅ Download concluído: ${tokenData.customer.email}`);
      }
    });
  } catch (error) {
    console.error('❌ Erro no endpoint de download:', error);
    res.status(500).send('Erro ao processar download');
  }
});

// Endpoint para consultar status do pagamento
app.get('/api/payment/status/:transactionId', (req, res) => {
  const { transactionId } = req.params;
  const pagamento = pagamentosAprovados.get(transactionId);

  if (pagamento) {
    res.json({
      status: 'approved',
      emailSent: pagamento.emailSent,
      approvedAt: pagamento.approvedAt
    });
  } else {
    res.json({
      status: 'pending',
      message: 'Pagamento não encontrado ou ainda não aprovado'
    });
  }
});

// Endpoint para verificar token de download
app.get('/api/download/verify/:token', (req, res) => {
  try {
    const { token } = req.params;
    const tokenData = tokensDownload.get(token);

    if (!tokenData) {
      return res.json({
        valid: false,
        message: 'Token inválido ou expirado'
      });
    }

    const remainingDownloads = tokenData.maxDownloads - tokenData.downloads;

    if (remainingDownloads <= 0) {
      return res.json({
        valid: false,
        message: 'Limite de downloads atingido'
      });
    }

    res.json({
      valid: true,
      customer: tokenData.customer,
      downloads: tokenData.downloads,
      maxDownloads: tokenData.maxDownloads,
      remainingDownloads: remainingDownloads,
      createdAt: tokenData.createdAt
    });
  } catch (error) {
    console.error('❌ Erro ao verificar token:', error);
    res.status(500).json({ valid: false, message: 'Erro ao verificar token' });
  }
});

// Endpoint de teste
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Webhook handler está rodando',
    pagamentosAprovados: pagamentosAprovados.size,
    tokensAtivos: tokensDownload.size
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Webhook Handler rodando em http://localhost:${PORT}`);
  console.log(`📧 Configure seu email em webhook-handler.js (linhas 16-22)`);
  console.log(`🔗 URL do webhook: http://localhost:${PORT}/webhook/sigilopay`);
});
