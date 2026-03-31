# 🗄️ Configuração do Supabase - Passo a Passo

## 📋 O que você precisa fazer:

### 1️⃣ Acessar o Supabase

1. Acesse: https://supabase.com
2. Faça login na sua conta
3. Abra o projeto: **blodznzrdzjsvaqabsvj** (já está configurado no .env)

---

### 2️⃣ Criar as Tabelas no Banco de Dados

1. No painel do Supabase, clique em **"SQL Editor"** no menu lateral
2. Clique em **"New Query"**
3. Cole o SQL abaixo e clique em **"Run"**:

```sql
-- ============================================
-- TABELA: customers
-- ============================================
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

-- ============================================
-- TABELA: subscriptions
-- ============================================
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

-- ============================================
-- TABELA: payments
-- ============================================
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

4. Aguarde a mensagem **"Success. No rows returned"**

---

### 3️⃣ Configurar Políticas de Segurança (RLS)

**IMPORTANTE**: As APIs serverless usam `service_role_key` que bypassa o RLS, então não precisa configurar políticas agora. Mas se quiser permitir que usuários vejam seus próprios dados:

1. No SQL Editor, execute:

```sql
-- Habilitar RLS nas tabelas
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver suas próprias subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Usuários podem ver seus próprios payments
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  USING (
    customer_id IN (
      SELECT id FROM customers WHERE email = auth.email()
    )
  );
```

---

### 4️⃣ Verificar se as Tabelas Foram Criadas

1. No menu lateral, clique em **"Table Editor"**
2. Você deve ver 3 tabelas:
   - ✅ **customers**
   - ✅ **subscriptions**
   - ✅ **payments**

---

### 5️⃣ Configurar Variáveis de Ambiente no Vercel

Agora você precisa adicionar as credenciais no Vercel:

1. Acesse: https://vercel.com/kaikegomesbrascell-bytes-projects/leadextract-landing/settings/environment-variables

2. Adicione as seguintes variáveis (uma por vez):

| Nome da Variável | Valor | Onde encontrar |
|------------------|-------|----------------|
| `VITE_SUPABASE_URL` | `https://blodznzrdzjsvaqabsvj.supabase.co` | Já está no .env |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Já está no .env |
| `SUPABASE_SERVICE_ROLE_KEY` | `sb_publishable_yctKLARtWlYpbZzk0dkx1w_e9Udi8cA` | Já está no .env |
| `SIGILOPAY_PUBLIC_KEY` | `kaikegomesbrascell_dj5xs7rlxoaoew4z` | Já está no .env.local |
| `SIGILOPAY_SECRET_KEY` | `nvt3mku331xhv1d8oxmqfnp20tjecpacan3v5gk0n276u5kkhexqieuz8y3cmc9f` | Já está no .env.local |

3. Para cada variável:
   - Clique em **"Add New"**
   - Cole o **Nome** e o **Valor**
   - Selecione **"Production"**, **"Preview"** e **"Development"**
   - Clique em **"Save"**

---

### 6️⃣ Fazer Redeploy no Vercel

Depois de adicionar as variáveis, você precisa fazer redeploy:

**Opção A - Pelo site:**
1. Vá em: https://vercel.com/kaikegomesbrascell-bytes-projects/leadextract-landing
2. Clique nos 3 pontinhos (...) no último deploy
3. Clique em **"Redeploy"**
4. Confirme

**Opção B - Pelo terminal:**
```bash
vercel --prod
```

---

### 7️⃣ Testar o Sistema

Depois do redeploy, teste:

1. **Teste da API**: https://leadextract-landing.vercel.app/test-api.html
   - Clique em "Testar API"
   - Deve aparecer: ✅ API funcionando corretamente!

2. **Checkout**: https://leadextract-landing.vercel.app/checkout.html
   - Preencha o formulário
   - Clique em "Comprar Agora"
   - Deve gerar o QR Code PIX

---

## 🔍 Verificar se Funcionou

### No Supabase:

1. Vá em **"Table Editor"**
2. Clique na tabela **"customers"**
3. Você deve ver o cliente de teste criado
4. Clique na tabela **"subscriptions"**
5. Você deve ver uma subscription com status **"pending"**
6. Clique na tabela **"payments"**
7. Você deve ver um payment com status **"pending"**

---

## ❌ Problemas Comuns

### Erro: "relation does not exist"
- **Solução**: As tabelas não foram criadas. Execute o SQL novamente.

### Erro: "permission denied"
- **Solução**: Verifique se está usando a `SUPABASE_SERVICE_ROLE_KEY` correta.

### Erro: "invalid input syntax for type uuid"
- **Solução**: O `user_id` pode ser NULL. Isso é normal se o usuário não foi criado no Auth.

### QR Code não aparece
- **Solução**: 
  1. Verifique se as variáveis de ambiente estão no Vercel
  2. Faça redeploy
  3. Verifique as credenciais do SigiloPay

---

## 📞 Próximos Passos

Depois que tudo estiver funcionando:

1. **Configure o Webhook no SigiloPay**:
   - URL: `https://leadextract-landing.vercel.app/api/webhook-sigilopay`
   - Eventos: `payment.approved`, `payment.rejected`, `payment.expired`

2. **Teste o fluxo completo**:
   - Faça um pagamento de teste
   - Verifique se a subscription muda de `pending` para `active`

---

## ✅ Checklist Final

- [ ] Tabelas criadas no Supabase
- [ ] Variáveis de ambiente adicionadas no Vercel
- [ ] Redeploy feito
- [ ] Teste da API funcionando
- [ ] Checkout gerando QR Code
- [ ] Dados sendo salvos no Supabase
- [ ] Webhook configurado no SigiloPay

---

**🎉 Pronto! Seu sistema de checkout está configurado!**
