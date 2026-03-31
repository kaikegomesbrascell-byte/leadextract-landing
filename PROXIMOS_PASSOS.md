# ✅ Sistema de Checkout SigiloPay - Próximos Passos

## 🎉 O que já está pronto:

- ✅ Páginas de checkout criadas e funcionando
- ✅ API de pagamento PIX implementada (`/api/payment-pix`)
- ✅ Webhook handler implementado (`/api/webhook-sigilopay`)
- ✅ Validação HMAC de segurança
- ✅ Sistema de logs estruturados
- ✅ Tratamento de erros completo
- ✅ Arquivos SQL para criar tabelas
- ✅ Documentação completa

## 🚀 O que você precisa fazer agora:

### 1️⃣ Criar Tabelas no Supabase (5 minutos)

1. Acesse: https://supabase.com
2. Abra o projeto: **blodznzrdzjsvaqabsvj**
3. Clique em **"SQL Editor"** → **"New Query"**
4. Abra o arquivo `sql/setup_complete_database.sql`
5. Copie todo o conteúdo e cole no SQL Editor
6. Clique em **"Run"**
7. Aguarde mensagem de sucesso

**Resultado esperado**: 3 tabelas criadas (customers, subscriptions, payments)

---

### 2️⃣ Configurar Variáveis de Ambiente no Vercel (10 minutos)

1. Acesse: https://vercel.com/kaikegomesbrascell-bytes-projects/leadextract-landing/settings/environment-variables

2. Adicione estas 5 variáveis (clique "Add New" para cada):

| Variável | Valor |
|----------|-------|
| `VITE_SUPABASE_URL` | `https://blodznzrdzjsvaqabsvj.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (do .env) |
| `SUPABASE_SERVICE_ROLE_KEY` | `sb_publishable_yctKLARtWlYpbZzk0dkx1w_e9Udi8cA` |
| `SIGILOPAY_PUBLIC_KEY` | `kaikegomesbrascell_dj5xs7rlxoaoew4z` |
| `SIGILOPAY_SECRET_KEY` | `nvt3mku331xhv1d8oxmqfnp20tjecpacan3v5gk0n276u5kkhexqieuz8y3cmc9f` |

3. Para cada variável, marque: **Production**, **Preview** e **Development**

**Guia detalhado**: Veja `GUIA_CONFIGURACAO_VERCEL.md`

---

### 3️⃣ Fazer Redeploy no Vercel (2 minutos)

Depois de adicionar as variáveis:

**Opção A - Pelo site:**
1. Vá em: https://vercel.com/kaikegomesbrascell-bytes-projects/leadextract-landing
2. Clique nos 3 pontinhos (...) no último deploy
3. Clique em **"Redeploy"**

**Opção B - Pelo terminal:**
```bash
vercel --prod
```

---

### 4️⃣ Testar o Sistema (5 minutos)

Após o redeploy:

1. **Teste da API**: https://leadextract-landing.vercel.app/test-api.html
   - Clique em "Testar API"
   - Deve aparecer: ✅ API funcionando!

2. **Teste do Checkout**: https://leadextract-landing.vercel.app/checkout.html
   - Preencha o formulário
   - Clique em "Comprar Agora"
   - Deve gerar QR Code PIX

3. **Verificar no Supabase**:
   - Vá em "Table Editor"
   - Verifique se apareceu:
     - 1 registro em `customers`
     - 1 registro em `subscriptions` (status: pending)
     - 1 registro em `payments` (status: pending)

---

### 5️⃣ Configurar Webhook no SigiloPay (5 minutos)

1. Acesse: https://app.sigilopay.com.br
2. Vá em **Configurações** → **Webhooks**
3. Adicione novo webhook:
   - **URL**: `https://leadextract-landing.vercel.app/api/webhook-sigilopay`
   - **Eventos**: payment.approved, payment.rejected, payment.expired
4. Salve e ative

**Guia detalhado**: Veja `CONFIGURAR_WEBHOOK_SIGILOPAY.md`

---


### 6️⃣ Testar Fluxo Completo (10 minutos)

1. Acesse: https://leadextract-landing.vercel.app/checkout.html
2. Preencha com dados reais
3. Gere o QR Code PIX
4. Faça o pagamento (ou use ambiente de teste)
5. Aguarde 1-2 minutos
6. Verifique no Supabase:
   - `payments` → status deve mudar para **"approved"**
   - `subscriptions` → status deve mudar para **"active"**

---

## 📁 Arquivos Importantes

### Documentação
- `PROXIMOS_PASSOS.md` - Este arquivo (guia rápido)
- `GUIA_CONFIGURACAO_VERCEL.md` - Configurar variáveis de ambiente
- `CONFIGURAR_WEBHOOK_SIGILOPAY.md` - Configurar webhook
- `CONFIGURAR_SUPABASE.md` - Configurar banco de dados (antigo)

### SQL
- `sql/setup_complete_database.sql` - Script completo para criar todas as tabelas
- `sql/create_customers_table.sql` - Criar tabela customers
- `sql/create_payments_table.sql` - Criar tabela payments
- `sql/modify_subscriptions_table.sql` - Modificar tabela subscriptions

### APIs
- `api/payment-pix.js` - Criar pagamento PIX
- `api/webhook-sigilopay.js` - Receber notificações do SigiloPay

### Frontend
- `public/checkout.html` - Página de checkout simples
- `public/checkout-premium.html` - Página de checkout com planos
- `public/test-api.html` - Página de teste da API

### Configuração
- `vercel.json` - Configuração do Vercel
- `.env` - Variáveis de ambiente (Supabase)
- `.env.local` - Variáveis de ambiente (SigiloPay)

---

## 🔍 Como Verificar se Está Funcionando

### ✅ Checkout Funcionando
- Página carrega sem erros
- Formulário aceita dados
- Botão "Comprar Agora" gera QR Code
- QR Code aparece na tela

### ✅ API Funcionando
- `/api/payment-pix` retorna status 200
- Cria registro em `customers`
- Cria registro em `subscriptions` (status: pending)
- Cria registro em `payments` (status: pending)

### ✅ Webhook Funcionando
- Recebe notificação do SigiloPay
- Valida assinatura HMAC
- Atualiza `payments` para "approved"
- Ativa `subscriptions` (status: active)
- Logs aparecem no Vercel

---

## ❌ Problemas Comuns

### Erro: "relation does not exist"
**Solução**: Execute o SQL no Supabase (Passo 1)

### Erro: "permission denied"
**Solução**: Verifique a `SUPABASE_SERVICE_ROLE_KEY` no Vercel

### QR Code não aparece
**Solução**: 
1. Verifique variáveis de ambiente no Vercel
2. Faça redeploy
3. Verifique credenciais do SigiloPay

### Webhook não funciona
**Solução**:
1. Configure webhook no SigiloPay
2. Verifique URL: `https://leadextract-landing.vercel.app/api/webhook-sigilopay`
3. Verifique secret key

### Subscription não ativa
**Solução**:
1. Verifique se webhook foi configurado
2. Verifique logs no Vercel
3. Confirme que payment tem `subscription_id`

---

## 📞 Suporte

Se precisar de ajuda:

1. **Logs do Vercel**: https://vercel.com/kaikegomesbrascell-bytes-projects/leadextract-landing
2. **Dados no Supabase**: https://supabase.com (projeto: blodznzrdzjsvaqabsvj)
3. **Teste a API**: https://leadextract-landing.vercel.app/test-api.html

---

## 🎯 Checklist Final

- [ ] Tabelas criadas no Supabase
- [ ] Variáveis de ambiente no Vercel
- [ ] Redeploy feito
- [ ] Teste da API funcionando
- [ ] Checkout gerando QR Code
- [ ] Dados salvos no Supabase
- [ ] Webhook configurado no SigiloPay
- [ ] Fluxo completo testado
- [ ] Subscription ativada após pagamento

---

**🎉 Quando todos os itens estiverem marcados, seu sistema estará 100% funcional!**
