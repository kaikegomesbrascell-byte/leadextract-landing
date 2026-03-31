# 🛒 Sistema de Checkout com SigiloPay

Sistema completo de checkout com integração ao gateway de pagamento SigiloPay, incluindo webhook para ativação automática de assinaturas.

## 📋 Arquivos Criados

### Frontend
- `checkout.html` - Checkout simples (produto único)
- `checkout-premium.html` - Checkout com seleção de planos (Standard/Premium)

### Backend (Vercel Serverless Functions)
- `api/payment-pix.js` - Endpoint para criar pagamentos PIX
- `api/webhook-sigilopay.js` - Webhook para receber notificações do SigiloPay

## 🔧 Configuração

### 1. Variáveis de Ambiente

Adicione as seguintes variáveis no arquivo `.env`:

```env
# Supabase
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key

# SigiloPay
SIGILOPAY_PUBLIC_KEY=sua_public_key
SIGILOPAY_SECRET_KEY=sua_secret_key
SIGILOPAY_WEBHOOK_SECRET=sua_webhook_secret (opcional, usa SECRET_KEY se não definido)
```

### 2. Configurar Webhook no SigiloPay

1. Acesse o painel do SigiloPay
2. Vá em Configurações > Webhooks
3. Adicione a URL do webhook: `https://seu-dominio.com/api/webhook-sigilopay`
4. Habilite os seguintes eventos:
   - `payment.approved`
   - `payment.rejected`
   - `payment.expired`
   - `payment.pending`
5. Copie a Secret Key gerada e adicione em `SIGILOPAY_WEBHOOK_SECRET`

### 3. Estrutura do Banco de Dados (Supabase)

Execute os seguintes comandos SQL no Supabase:

```sql
-- Tabela de clientes
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  document TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_document ON customers(document);

-- Tabela de assinaturas
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('standard', 'premium')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'expired', 'cancelled', 'pending')),
  started_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Tabela de pagamentos
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('pix', 'credit_card', 'boleto')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'failed', 'cancelled')),
  sigilopay_id TEXT UNIQUE,
  pix_qr_code TEXT,
  pix_key TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_subscription_id ON payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payments_sigilopay_id ON payments(sigilopay_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
```

## 🚀 Como Funciona

### Fluxo de Checkout

1. **Cliente preenche formulário** → Nome, email, CPF, telefone
2. **Seleciona plano** → Standard (R$ 97) ou Premium (R$ 197)
3. **Clica em "Comprar Agora"** → Frontend chama `/api/payment-pix`
4. **Backend cria:**
   - Cliente no Supabase (tabela `customers`)
   - Usuário no Supabase Auth (se não existir)
   - Assinatura com status `pending` (tabela `subscriptions`)
   - Pagamento com status `pending` (tabela `payments`)
5. **Backend chama SigiloPay** → Gera QR Code PIX
6. **Frontend exibe QR Code** → Cliente escaneia e paga

### Fluxo de Webhook (Ativação Automática)

1. **Cliente paga via PIX** → Banco confirma pagamento
2. **SigiloPay detecta pagamento** → Envia webhook para `/api/webhook-sigilopay`
3. **Webhook valida HMAC** → Garante autenticidade da notificação
4. **Webhook atualiza banco:**
   - Payment: `status = 'approved'`, `paid_at = timestamp`
   - Subscription: `status = 'active'`, `started_at = timestamp`
5. **Cliente recebe acesso** → Assinatura ativada automaticamente

## 🔐 Segurança

### Validação HMAC

O webhook valida todas as notificações usando HMAC-SHA256:

```javascript
const signature = req.headers['x-sigilopay-signature'];
const expectedSignature = crypto
  .createHmac('sha256', SIGILOPAY_SECRET_KEY)
  .update(JSON.stringify(payload))
  .digest('hex');

// Comparação timing-safe
const isValid = crypto.timingSafeEqual(
  Buffer.from(signature),
  Buffer.from(expectedSignature)
);
```

### Idempotência

O webhook é idempotente - processar a mesma notificação múltiplas vezes não causa efeitos colaterais:

```javascript
if (payment.status === 'approved') {
  return { alreadyProcessed: true };
}
```

## 📊 Logs Estruturados

Todos os eventos são registrados com logs estruturados:

```json
{
  "level": "INFO",
  "timestamp": "2024-01-15T10:30:00Z",
  "message": "Subscription ativada",
  "subscriptionId": "uuid-here",
  "plan": "premium",
  "userId": "uuid-here"
}
```

## 🧪 Testando o Webhook

### Usando cURL

```bash
# Gerar assinatura HMAC
PAYLOAD='{"event":"payment.approved","transactionId":"test123","status":"approved","amount":97.00,"customer":{"name":"Test","email":"test@test.com","document":"12345678900"},"paidAt":"2024-01-15T10:30:00Z"}'
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "sua_secret_key" | cut -d' ' -f2)

# Enviar webhook
curl -X POST https://seu-dominio.com/api/webhook-sigilopay \
  -H "Content-Type: application/json" \
  -H "x-sigilopay-signature: $SIGNATURE" \
  -d "$PAYLOAD"
```

### Usando Postman

1. Crie uma requisição POST para `https://seu-dominio.com/api/webhook-sigilopay`
2. Adicione header `Content-Type: application/json`
3. Adicione header `x-sigilopay-signature` com a assinatura HMAC
4. No body (raw JSON):

```json
{
  "event": "payment.approved",
  "transactionId": "test123",
  "status": "approved",
  "amount": 97.00,
  "customer": {
    "name": "Test User",
    "email": "test@test.com",
    "document": "12345678900"
  },
  "paidAt": "2024-01-15T10:30:00Z"
}
```

## 📱 Páginas de Checkout

### checkout.html
- Checkout simples para produto único
- Preço fixo: R$ 29,87
- Ideal para e-books, cursos simples

### checkout-premium.html
- Seleção de planos (Standard/Premium)
- Preços: R$ 97,00 e R$ 197,00
- Ideal para SaaS, assinaturas

## 🎯 Eventos do Webhook

| Evento | Ação | Status Payment | Status Subscription |
|--------|------|----------------|---------------------|
| `payment.approved` | Ativa assinatura | `approved` | `active` |
| `payment.rejected` | Mantém pendente | `failed` | `pending` |
| `payment.expired` | Cancela pagamento | `cancelled` | `pending` |
| `payment.pending` | Sem ação | `pending` | `pending` |

## 🔄 Códigos de Resposta HTTP

| Código | Significado | Quando ocorre |
|--------|-------------|---------------|
| 200 | Sucesso | Webhook processado com sucesso |
| 400 | Bad Request | Payload malformado ou campos faltando |
| 401 | Unauthorized | Assinatura HMAC inválida |
| 404 | Not Found | Transaction ID não encontrado |
| 405 | Method Not Allowed | Método HTTP diferente de POST |
| 500 | Internal Error | Erro no servidor |
| 503 | Service Unavailable | Banco de dados indisponível |

## 📞 Suporte

Para dúvidas sobre:
- **SigiloPay**: Acesse o painel ou documentação oficial
- **Supabase**: Consulte a documentação do Supabase
- **Implementação**: Revise os logs estruturados no console

## ✅ Checklist de Deploy

- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] Tabelas criadas no Supabase
- [ ] Webhook configurado no painel do SigiloPay
- [ ] URL do webhook testada com cURL/Postman
- [ ] Teste completo: checkout → pagamento → ativação
- [ ] Logs estruturados funcionando
- [ ] Validação HMAC ativa

## 🎉 Pronto!

Seu sistema de checkout com SigiloPay está configurado e pronto para receber pagamentos!
