# 🧪 Testando o Sistema Localmente

Guia completo para testar o sistema de checkout e webhook localmente antes do deploy.

## 📋 Pré-requisitos

- Node.js instalado
- Conta no Supabase configurada
- Credenciais do SigiloPay

## 🚀 Passo 1: Instalar Dependências

```bash
npm install
```

## 🔧 Passo 2: Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` com:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
SIGILOPAY_PUBLIC_KEY=sua_public_key
SIGILOPAY_SECRET_KEY=sua_secret_key
```

## 🏃 Passo 3: Iniciar Servidor Local

```bash
npm run dev
```

O servidor estará disponível em `http://localhost:5173`

## 🧪 Passo 4: Testar Checkout

1. Abra `http://localhost:5173/checkout-premium.html`
2. Preencha o formulário com dados de teste:
   - Nome: João Silva Teste
   - Email: teste@example.com
   - CPF: 123.456.789-00
   - WhatsApp: (11) 99999-9999
3. Selecione um plano (Standard ou Premium)
4. Clique em "Comprar Agora"
5. Verifique se o QR Code é gerado

### ✅ O que verificar:

- [ ] QR Code é exibido
- [ ] Código PIX pode ser copiado
- [ ] Console do navegador não mostra erros
- [ ] No Supabase, verifique:
  - [ ] Cliente criado na tabela `customers`
  - [ ] Assinatura criada com status `pending` na tabela `subscriptions`
  - [ ] Pagamento criado com status `pending` na tabela `payments`

## 🔗 Passo 5: Testar Webhook (Simulação)

### Opção A: Usando o Script de Teste

```bash
# Testar evento payment.approved
node test-webhook.js http://localhost:3000/api/webhook-sigilopay sua_secret_key payment.approved

# Testar evento payment.rejected
node test-webhook.js http://localhost:3000/api/webhook-sigilopay sua_secret_key payment.rejected
```

### Opção B: Usando cURL

```bash
# 1. Criar payload
PAYLOAD='{"event":"payment.approved","transactionId":"test123","status":"approved","amount":97.00,"customer":{"name":"Test","email":"test@test.com","document":"12345678900"},"paidAt":"2024-01-15T10:30:00Z"}'

# 2. Gerar assinatura HMAC (Linux/Mac)
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "sua_secret_key" | cut -d' ' -f2)

# 3. Enviar webhook
curl -X POST http://localhost:3000/api/webhook-sigilopay \
  -H "Content-Type: application/json" \
  -H "x-sigilopay-signature: $SIGNATURE" \
  -d "$PAYLOAD"
```

### Opção C: Usando Postman

1. Crie uma requisição POST para `http://localhost:3000/api/webhook-sigilopay`
2. Headers:
   - `Content-Type: application/json`
   - `x-sigilopay-signature: <calcular_hmac>`
3. Body (raw JSON):

```json
{
  "event": "payment.approved",
  "transactionId": "SEU_TRANSACTION_ID_DO_TESTE",
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

**IMPORTANTE**: Substitua `SEU_TRANSACTION_ID_DO_TESTE` pelo `sigilopay_id` do pagamento criado no Passo 4.

### ✅ O que verificar após webhook:

- [ ] Resposta HTTP 200 OK
- [ ] No Supabase:
  - [ ] Payment status mudou para `approved`
  - [ ] Payment `paid_at` foi preenchido
  - [ ] Subscription status mudou para `active`
  - [ ] Subscription `started_at` foi preenchido

## 🌐 Passo 6: Testar com ngrok (Webhook Real)

Para testar com o SigiloPay real, você precisa expor seu localhost:

### 1. Instalar ngrok

```bash
# Windows (com Chocolatey)
choco install ngrok

# Mac (com Homebrew)
brew install ngrok

# Linux
snap install ngrok
```

### 2. Iniciar ngrok

```bash
ngrok http 3000
```

Você receberá uma URL pública, exemplo: `https://abc123.ngrok.io`

### 3. Configurar Webhook no SigiloPay

1. Acesse o painel do SigiloPay
2. Vá em Configurações > Webhooks
3. Adicione a URL: `https://abc123.ngrok.io/api/webhook-sigilopay`
4. Habilite os eventos: `payment.approved`, `payment.rejected`, `payment.expired`

### 4. Fazer Pagamento Real de Teste

1. Acesse `http://localhost:5173/checkout-premium.html`
2. Preencha com seus dados reais
3. Gere o QR Code
4. Pague usando PIX (valor de teste)
5. Aguarde o webhook ser chamado automaticamente

### ✅ O que verificar:

- [ ] Webhook é chamado automaticamente após pagamento
- [ ] Logs aparecem no console do ngrok
- [ ] Assinatura é ativada automaticamente
- [ ] Email de confirmação é enviado (se configurado)

## 🐛 Troubleshooting

### Erro: "Payment not found"

**Causa**: O `transactionId` no webhook não corresponde ao `sigilopay_id` no banco.

**Solução**: 
1. Verifique o `sigilopay_id` na tabela `payments`
2. Use esse ID no campo `transactionId` do webhook de teste

### Erro: "HMAC signature validation failed"

**Causa**: A assinatura HMAC está incorreta.

**Solução**:
1. Verifique se está usando a mesma `SIGILOPAY_SECRET_KEY` no webhook e no teste
2. Certifique-se de que o payload está exatamente igual (sem espaços extras)
3. Use o script `test-webhook.js` que calcula a assinatura automaticamente

### Erro: "Database unavailable"

**Causa**: Não consegue conectar ao Supabase.

**Solução**:
1. Verifique se `VITE_SUPABASE_URL` está correto
2. Verifique se `SUPABASE_SERVICE_ROLE_KEY` está correto
3. Teste a conexão no painel do Supabase

### QR Code não aparece

**Causa**: Erro na API do SigiloPay ou credenciais incorretas.

**Solução**:
1. Abra o console do navegador (F12)
2. Verifique erros na aba Network
3. Verifique se `SIGILOPAY_PUBLIC_KEY` e `SIGILOPAY_SECRET_KEY` estão corretos
4. Teste as credenciais diretamente na API do SigiloPay

## 📊 Monitorando Logs

### Logs do Frontend (Navegador)

Abra o console do navegador (F12) e veja:
- ✅ Resposta do servidor após criar pagamento
- 📦 Assinatura criada
- ❌ Erros de validação

### Logs do Backend (Terminal)

No terminal onde rodou `npm run dev`, veja:
- 📥 Requisições recebidas
- 📤 Chamadas ao SigiloPay
- ✅ Dados salvos no Supabase
- ❌ Erros de processamento

### Logs do Webhook (Terminal)

Quando testar o webhook, veja:
- 🔐 Validação HMAC
- 📦 Evento processado
- ✅ Subscription ativada
- ❌ Erros de processamento

## ✅ Checklist Final

Antes de fazer deploy, verifique:

- [ ] Checkout gera QR Code corretamente
- [ ] Dados são salvos no Supabase
- [ ] Subscription é criada com status `pending`
- [ ] Payment é criado com `sigilopay_id`
- [ ] Webhook valida HMAC corretamente
- [ ] Webhook ativa subscription após pagamento
- [ ] Webhook é idempotente (pode processar múltiplas vezes)
- [ ] Logs estruturados funcionam
- [ ] Tratamento de erros funciona

## 🎉 Pronto para Deploy!

Se todos os testes passaram, você está pronto para fazer deploy no Vercel!

```bash
vercel --prod
```

Não esqueça de:
1. Configurar as variáveis de ambiente no Vercel
2. Atualizar a URL do webhook no painel do SigiloPay
3. Fazer um teste final em produção
