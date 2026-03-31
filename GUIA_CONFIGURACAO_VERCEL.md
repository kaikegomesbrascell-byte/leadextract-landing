# 🚀 Guia de Configuração Vercel - Sistema SigiloPay

## 📋 Passo 1: Acessar Configurações do Vercel

1. Acesse: https://vercel.com/kaikegomesbrascell-bytes-projects/leadextract-landing/settings/environment-variables
2. Faça login se necessário

## 🔑 Passo 2: Adicionar Variáveis de Ambiente

Adicione as seguintes variáveis (clique em "Add New" para cada uma):

### Variável 1: VITE_SUPABASE_URL
- **Nome**: `VITE_SUPABASE_URL`
- **Valor**: `https://blodznzrdzjsvaqabsvj.supabase.co`
- **Ambientes**: Production, Preview, Development (marcar todos)

### Variável 2: VITE_SUPABASE_ANON_KEY
- **Nome**: `VITE_SUPABASE_ANON_KEY`
- **Valor**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsb2R6bnpyZHpqc3ZhcWFic3ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxNTkxNjMsImV4cCI6MjA4OTczNTE2M30.F7t6-JESd3__NjezKEmShUbXmcqGCIxWX_gnIefZPdc`
- **Ambientes**: Production, Preview, Development (marcar todos)

### Variável 3: SUPABASE_SERVICE_ROLE_KEY
- **Nome**: `SUPABASE_SERVICE_ROLE_KEY`
- **Valor**: `sb_publishable_yctKLARtWlYpbZzk0dkx1w_e9Udi8cA`
- **Ambientes**: Production, Preview, Development (marcar todos)

### Variável 4: SIGILOPAY_PUBLIC_KEY
- **Nome**: `SIGILOPAY_PUBLIC_KEY`
- **Valor**: `kaikegomesbrascell_dj5xs7rlxoaoew4z`
- **Ambientes**: Production, Preview, Development (marcar todos)

### Variável 5: SIGILOPAY_SECRET_KEY
- **Nome**: `SIGILOPAY_SECRET_KEY`
- **Valor**: `nvt3mku331xhv1d8oxmqfnp20tjecpacan3v5gk0n276u5kkhexqieuz8y3cmc9f`
- **Ambientes**: Production, Preview, Development (marcar todos)


## ✅ Passo 3: Verificar Variáveis

Após adicionar todas as variáveis, você deve ver 5 variáveis listadas:
- ✅ VITE_SUPABASE_URL
- ✅ VITE_SUPABASE_ANON_KEY
- ✅ SUPABASE_SERVICE_ROLE_KEY
- ✅ SIGILOPAY_PUBLIC_KEY
- ✅ SIGILOPAY_SECRET_KEY

## 🔄 Passo 4: Fazer Redeploy

Depois de adicionar as variáveis, você PRECISA fazer redeploy:

### Opção A - Pelo Site Vercel:
1. Vá em: https://vercel.com/kaikegomesbrascell-bytes-projects/leadextract-landing
2. Clique nos 3 pontinhos (...) no último deploy
3. Clique em "Redeploy"
4. Confirme

### Opção B - Pelo Terminal:
```bash
vercel --prod
```

## 🧪 Passo 5: Testar o Sistema

Após o redeploy, teste:

1. **Teste da API**: https://leadextract-landing.vercel.app/test-api.html
2. **Checkout**: https://leadextract-landing.vercel.app/checkout.html

## 📊 Passo 6: Executar SQL no Supabase

1. Acesse: https://supabase.com
2. Abra o projeto: blodznzrdzjsvaqabsvj
3. Clique em "SQL Editor"
4. Clique em "New Query"
5. Cole o conteúdo do arquivo `sql/setup_complete_database.sql`
6. Clique em "Run"
7. Aguarde mensagem de sucesso

## 🎯 Próximos Passos

Depois que tudo estiver funcionando:

1. Configure o webhook no SigiloPay
2. Teste o fluxo completo de pagamento
3. Verifique se a subscription é ativada após pagamento
