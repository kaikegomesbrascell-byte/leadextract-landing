# 🔔 Configurar Webhook no SigiloPay

## 📋 O que é o Webhook?

O webhook permite que o SigiloPay notifique automaticamente seu sistema quando um pagamento é aprovado, rejeitado ou expira. Isso ativa a assinatura do usuário automaticamente após o pagamento.

## 🔗 URL do Webhook

```
https://leadextract-landing.vercel.app/api/webhook-sigilopay
```

## 🚀 Passo a Passo

### 1️⃣ Acessar Dashboard SigiloPay

1. Acesse: https://app.sigilopay.com.br
2. Faça login com suas credenciais
3. Vá em **Configurações** ou **Webhooks** no menu

### 2️⃣ Adicionar Novo Webhook

1. Clique em **"Adicionar Webhook"** ou **"Novo Webhook"**
2. Cole a URL: `https://leadextract-landing.vercel.app/api/webhook-sigilopay`

### 3️⃣ Selecionar Eventos

Marque os seguintes eventos:

- ✅ **payment.approved** - Pagamento aprovado (OBRIGATÓRIO)
- ✅ **payment.rejected** - Pagamento rejeitado
- ✅ **payment.expired** - Pagamento expirado
- ⬜ **payment.pending** - Pagamento pendente (opcional)

### 4️⃣ Configurar Secret Key

O SigiloPay deve fornecer uma **Secret Key** para validação HMAC.

- Se você já tem a secret key, ela está em `.env.local`: `nvt3mku331xhv1d8oxmqfnp20tjecpacan3v5gk0n276u5kkhexqieuz8y3cmc9f`
- Se o SigiloPay gerar uma nova, atualize a variável `SIGILOPAY_SECRET_KEY` no Vercel

### 5️⃣ Salvar Configuração

1. Clique em **"Salvar"** ou **"Ativar Webhook"**
2. Verifique se o status está **"Ativo"**


## 🧪 Testar o Webhook

### Opção 1: Teste Manual com curl

```bash
curl -X POST https://leadextract-landing.vercel.app/api/webhook-sigilopay \
  -H "Content-Type: application/json" \
  -H "x-sigilopay-signature: sua-assinatura-hmac" \
  -d '{
    "event": "payment.approved",
    "transactionId": "test-123",
    "status": "approved",
    "amount": 29.87,
    "paidAt": "2024-01-20T10:00:00Z",
    "customer": {
      "name": "João Silva",
      "email": "joao@email.com",
      "document": "12345678900"
    }
  }'
```

### Opção 2: Teste pelo Dashboard SigiloPay

1. No dashboard do SigiloPay, procure por **"Testar Webhook"**
2. Selecione o evento **payment.approved**
3. Clique em **"Enviar Teste"**
4. Verifique os logs no Vercel

### Opção 3: Fazer um Pagamento Real de Teste

1. Acesse: https://leadextract-landing.vercel.app/checkout.html
2. Preencha o formulário com dados de teste
3. Gere o QR Code PIX
4. Faça o pagamento (ou use ambiente de sandbox)
5. Aguarde a notificação do webhook

## 📊 Verificar Logs no Vercel

1. Acesse: https://vercel.com/kaikegomesbrascell-bytes-projects/leadextract-landing
2. Clique em **"Logs"** ou **"Functions"**
3. Procure por logs do webhook:
   - `Webhook recebido`
   - `Assinatura HMAC válida`
   - `Subscription ativada`

## 🔍 Exemplos de Payloads

### Payment Approved
```json
{
  "event": "payment.approved",
  "transactionId": "txn_abc123",
  "status": "approved",
  "amount": 29.87,
  "paidAt": "2024-01-20T10:00:00Z",
  "customer": {
    "name": "João Silva",
    "email": "joao@email.com",
    "document": "12345678900"
  }
}
```

### Payment Rejected
```json
{
  "event": "payment.rejected",
  "transactionId": "txn_abc123",
  "status": "rejected",
  "amount": 29.87,
  "customer": {
    "name": "João Silva",
    "email": "joao@email.com",
    "document": "12345678900"
  }
}
```

### Payment Expired
```json
{
  "event": "payment.expired",
  "transactionId": "txn_abc123",
  "status": "expired",
  "amount": 29.87,
  "customer": {
    "name": "João Silva",
    "email": "joao@email.com",
    "document": "12345678900"
  }
}
```


## ❌ Troubleshooting

### Erro: "HMAC signature validation failed"

**Causa**: A secret key está incorreta ou o payload foi modificado.

**Solução**:
1. Verifique se a `SIGILOPAY_SECRET_KEY` no Vercel está correta
2. Confirme que o SigiloPay está usando a mesma secret key
3. Verifique se não há espaços extras na secret key

### Erro: "Payment not found"

**Causa**: O `transactionId` não existe no banco de dados.

**Solução**:
1. Verifique se o pagamento foi criado corretamente no checkout
2. Confirme que o `sigilopay_id` no banco corresponde ao `transactionId`
3. Verifique os logs da API `/api/payment-pix`

### Erro: "Database unavailable" (503)

**Causa**: O Supabase está indisponível ou as credenciais estão incorretas.

**Solução**:
1. Verifique se o Supabase está online
2. Confirme as variáveis `VITE_SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`
3. Teste a conexão com o Supabase

### Webhook não está sendo chamado

**Causa**: O webhook não foi configurado corretamente no SigiloPay.

**Solução**:
1. Verifique se a URL está correta
2. Confirme que os eventos estão marcados
3. Verifique se o webhook está ativo
4. Teste com curl para confirmar que a URL funciona

### Subscription não é ativada

**Causa**: O payment não tem `subscription_id` ou a subscription não está `pending`.

**Solução**:
1. Verifique se o payment tem `subscription_id` no banco
2. Confirme que a subscription está com status `pending`
3. Verifique os logs do webhook para ver o que aconteceu

## ✅ Checklist Final

- [ ] Webhook configurado no SigiloPay
- [ ] URL correta: `https://leadextract-landing.vercel.app/api/webhook-sigilopay`
- [ ] Eventos selecionados: payment.approved, payment.rejected, payment.expired
- [ ] Secret key configurada no Vercel
- [ ] Webhook testado com sucesso
- [ ] Logs verificados no Vercel
- [ ] Pagamento de teste realizado
- [ ] Subscription ativada automaticamente

## 📞 Suporte

Se precisar de ajuda:
1. Verifique os logs no Vercel
2. Verifique os dados no Supabase (tabelas payments e subscriptions)
3. Teste o webhook com curl
4. Entre em contato com o suporte do SigiloPay se necessário
