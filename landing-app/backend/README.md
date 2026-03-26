# Lead Extractor - Backend API

Backend para processar pagamentos do Lead Extractor via SigiloPay.

## 🚀 Como Usar

### 1. Instalar Dependências

```bash
cd backend
npm install
```

### 2. Iniciar o Servidor

```bash
npm start
```

Ou em modo desenvolvimento (com auto-reload):

```bash
npm run dev
```

O servidor estará rodando em: `http://localhost:3001`

## 📋 Rotas Disponíveis

### GET /
Rota de teste para verificar se o servidor está online.

**Resposta:**
```json
{
  "status": "online",
  "message": "Lead Extractor Payment API",
  "version": "1.0.0"
}
```

### POST /api/payment/pix
Cria um pagamento PIX via SigiloPay.

**Request Body:**
```json
{
  "identifier": "lead-extractor-1234567890",
  "amount": 1000,
  "client": {
    "name": "Nome do Cliente",
    "email": "email@exemplo.com",
    "document": "12345678900",
    "phone": "11999999999"
  },
  "expiresIn": 3600
}
```

**Resposta (Sucesso):**
```json
{
  "success": true,
  "pix": {
    "base64": "iVBORw0KGgoAAAANS...",
    "code": "00020126580014br.gov.bcb.pix...",
    "expiresAt": "2024-03-23T20:00:00Z"
  }
}
```

### POST /api/payment/card
Processa pagamento com cartão de crédito via SigiloPay.

**Request Body:**
```json
{
  "product": {
    "name": "Lead Extractor - Assinatura Mensal",
    "price": 1000
  },
  "customer": {
    "name": "Nome do Cliente",
    "email": "email@exemplo.com",
    "document": "12345678900",
    "phone": "11999999999"
  },
  "payment": {
    "method": "credit_card",
    "card": {
      "number": "4111111111111111",
      "holder_name": "NOME NO CARTAO",
      "exp_month": "12",
      "exp_year": "25",
      "cvv": "123"
    }
  }
}
```

**Resposta (Sucesso):**
```json
{
  "success": true,
  "payment": {
    "status": "approved",
    "transactionId": "abc123",
    "message": "Pagamento aprovado"
  }
}
```

### POST /api/webhook/payment
Recebe notificações de pagamento da SigiloPay.

**Request Body:**
```json
{
  "event": "payment.approved",
  "data": {
    "transactionId": "abc123",
    "amount": 1000,
    "status": "approved"
  }
}
```

## 🔐 Credenciais SigiloPay

As credenciais estão configuradas diretamente no código:

- **Public Key**: `kaikegomesbrascell_dj5xs7rlxoaoew4z`
- **Secret Key**: `nvt3mku331xhv1d8oxmqfnp20tjecpacan3v5gk0n276u5kkhexqieuz8y3cmc9f`

## 🧪 Testando o Servidor

### 1. Verificar se está online:
```bash
curl http://localhost:3001
```

### 2. Testar pagamento PIX:
```bash
curl -X POST http://localhost:3001/api/payment/pix \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "test-123",
    "amount": 1000,
    "client": {
      "name": "Teste",
      "email": "teste@teste.com",
      "document": "12345678900"
    }
  }'
```

## 📦 Dependências

- **express**: Framework web
- **cors**: Habilita CORS para o frontend
- **axios**: Cliente HTTP para chamar a API SigiloPay
- **nodemon**: Auto-reload em desenvolvimento (dev dependency)

## 🔧 Troubleshooting

### Erro: "Cannot find module 'express'"
Execute: `npm install`

### Erro: "Port 3001 already in use"
Outro processo está usando a porta 3001. Mate o processo ou mude a porta no código.

### Erro: "Failed to fetch"
Verifique se o servidor está rodando e se o CORS está habilitado.

## 📝 Logs

O servidor exibe logs detalhados de todas as requisições:

- 📥 Requisições recebidas
- 📤 Requisições enviadas para SigiloPay
- ✅ Respostas bem-sucedidas
- ❌ Erros
- 🔔 Webhooks recebidos

## 🚀 Deploy em Produção

Para deploy em produção, você pode usar:

- **Heroku**: `git push heroku main`
- **Railway**: Conectar repositório GitHub
- **Vercel**: Suporta Node.js
- **AWS EC2**: Servidor próprio

Lembre-se de configurar as variáveis de ambiente em produção!
