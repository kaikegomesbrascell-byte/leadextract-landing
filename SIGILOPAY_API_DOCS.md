# SigiloPay API - Documentação

## Base URL
```
https://app.sigilopay.com.br/api/v1
```

## Autenticação

Todas as requisições precisam dos seguintes headers:

```javascript
{
  "Content-Type": "application/json",
  "x-public-key": "sua_public_key",
  "x-secret-key": "sua_secret_key"
}
```

### Suas Credenciais
- **Public Key**: `kaikegomesbrascell_dj5xs7rlxoaoew4z`
- **Secret Key**: `nvt3mku331xhv1d8oxmqfnp20tjecpacan3v5gk0n276u5kkhexqieuz8y3cmc9f`

---

## 1. Criar Pagamento PIX

### Endpoint
```
POST /gateway/pix/receive
```

### Request Body
```json
{
  "identifier": "lead-extractor-1234567890",\n  "amount": 1000,
  "client": {
    "name": "Nome do Cliente",
    "email": "email@exemplo.com",
    "document": "12345678900",
    "phone": "11999999999"
  },
  "expiresIn": 3600
}
```

### Response (Sucesso - 200)
```json
{
  "responseType": "api",
  "fee": 20,
  "pix": {
    "code": "00020126580014br.gov.bcb.pix...",
    "base64": "iVBORw0KGgoAAAANSUhEUgAAAPQAAAD0..."
  },
  "transactionId": "cmn2310ly12ul1smm14put5uf",
  "status": "PENDING",
  "order": {
    "id": "cmn2310l812uj1smmm5qdi4v5",
    "url": "https://pay.checkoutpixes.com/order/...",
    "receiptUrl": "https://pay.checkoutpixes.com/order/.../receipt"
  }
}
```

### Notas
- ✅ **Status**: Funcionando (testado com sucesso)
- `identifier` é um ID único para a transação (use timestamp ou UUID)
- `amount` deve ser em reais (não centavos): `1000` = R$ 1.000,00
- O QR Code retorna em `pix.base64`, use: `data:image/png;base64,${pix.base64}`
- O código PIX copia e cola está em `pix.code`
- `expiresIn` é em segundos (3600 = 1 hora)
- `client.document` deve ser apenas números (sem pontos ou traços)
- `client.phone` deve ser apenas números (sem parênteses ou traços)
- `client.phone` é opcional
- A API cobra uma taxa de R$ 20,00 (campo `fee`)

---

## 2. Criar Pagamento com Cartão

### Endpoint
```
POST /gateway/checkout
```

### Request Body
```json
{
  "product": {
    "name": "Nome do Produto",
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
  },
  "trackProps": {
    "source": "landing-page",
    "product": "lead-extractor"
  }
}
```

### Response (Sucesso - 200)
```json
{
  "transactionId": "uuid",
  "status": "approved",
  "message": "Pagamento aprovado"
}
```

### Response (Erro - 4xx/5xx)
```json
{
  "error": "Mensagem de erro",
  "code": "ERROR_CODE"
}
```

### Notas
- ⚠️ **Status**: Não testado (endpoint pode requerer ativação)
- O campo `price` deve ser em reais: `1000` = R$ 1.000,00
- `payment.method` pode ser: `"credit_card"` ou `"debit_card"`
- `card.number` deve ser apenas números (sem espaços)
- `card.exp_month` e `card.exp_year` devem ser strings com 2 dígitos
- `card.holder_name` deve estar em MAIÚSCULAS

---

## 3. Consultar Status do Pagamento

### Endpoint
```
GET /gateway/transaction/{transactionId}
```

### Headers
```javascript
{
  "x-public-key": "sua_public_key",
  "x-secret-key": "sua_secret_key"
}
```

### Response
```json
{
  "transactionId": "uuid",
  "status": "pending|approved|rejected|expired",
  "amount": 297,
  "createdAt": "2024-03-20T10:00:00Z",
  "paidAt": "2024-03-20T10:05:00Z"
}
```

### Status Possíveis
- `pending`: Aguardando pagamento
- `approved`: Pagamento aprovado
- `rejected`: Pagamento rejeitado
- `expired`: Pagamento expirado

---

## 4. Webhook (Callback)

A SigiloPay pode enviar notificações automáticas quando o status do pagamento mudar.

### Configuração
Configure a URL do webhook no painel da SigiloPay ou via variável de ambiente:
```
SIGILOPAY_WEBHOOK_URL=https://seu-dominio.com/webhook/sigilopay
```

### Request (POST para sua URL)
```json
{
  "event": "payment.approved",
  "transactionId": "uuid",
  "status": "approved",
  "amount": 297,
  "customer": {
    "email": "email@exemplo.com"
  },
  "paidAt": "2024-03-20T10:05:00Z"
}
```

### Eventos Possíveis
- `payment.pending`: Pagamento criado
- `payment.approved`: Pagamento aprovado
- `payment.rejected`: Pagamento rejeitado
- `payment.expired`: Pagamento expirado

---

## Erros Comuns

### CORS Error
```
Access to fetch at 'https://app.sigilopay.com.br/api/v1/...' from origin 'http://localhost:8080' 
has been blocked by CORS policy
```

**Solução**: Use um backend intermediário (Node.js/Express) para fazer as chamadas à API.

### 401 Unauthorized
```json
{
  "error": "Invalid credentials"
}
```

**Solução**: Verifique se os headers `x-public-key` e `x-secret-key` estão corretos.

### 400 Bad Request
```json
{
  "error": "Invalid request body"
}
```

**Solução**: Verifique se todos os campos obrigatórios estão presentes e no formato correto.

---

## Exemplo de Integração (Backend Node.js)

```javascript
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
app.use(cors());
app.use(express.json());

const SIGILOPAY_CONFIG = {
  publicKey: 'kaikegomesbrascell_dj5xs7rlxoaoew4z',
  secretKey: 'nvt3mku331xhv1d8oxmqfnp20tjecpacan3v5gk0n276u5kkhexqieuz8y3cmc9f',
  baseUrl: 'https://app.sigilopay.com.br/api/v1'
};

// Criar pagamento PIX
app.post('/api/payment/pix', async (req, res) => {
  try {
    const response = await fetch(`${SIGILOPAY_CONFIG.baseUrl}/gateway/pix/receive`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-public-key': SIGILOPAY_CONFIG.publicKey,
        'x-secret-key': SIGILOPAY_CONFIG.secretKey,
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao processar pagamento PIX' });
  }
});

// Criar pagamento com cartão
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
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao processar pagamento com cartão' });
  }
});

app.listen(3001, () => {
  console.log('🚀 Servidor rodando em http://localhost:3001');
});
```

---

## Ambiente de Testes

A SigiloPay pode ter um ambiente de sandbox/testes. Verifique no painel se há:
- Credenciais de teste separadas
- URL base diferente para testes
- Cartões de teste para simular aprovações/rejeições

---

## Suporte

Se precisar de mais informações sobre a API:
1. Acesse o painel: https://app.sigilopay.com.br
2. Procure por "Documentação" ou "API" no menu
3. Entre em contato com o suporte da SigiloPay

---

## Checklist de Implementação

- [x] Configurar credenciais (public_key e secret_key)
- [x] Criar backend intermediário para evitar CORS
- [x] Implementar endpoint de pagamento PIX
- [ ] Implementar endpoint de pagamento com cartão
- [ ] Implementar webhook para receber notificações
- [ ] Implementar consulta de status do pagamento
- [ ] Testar fluxo completo de pagamento PIX
- [ ] Testar fluxo completo de pagamento com cartão
- [ ] Implementar entrega do produto após pagamento aprovado
- [ ] Configurar ambiente de produção
