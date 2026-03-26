# 🚀 Instruções de Deploy - LeadExtract Landing Page

## Configuração no Vercel

### 1. Variáveis de Ambiente

No painel da Vercel, adicione as seguintes variáveis de ambiente:

```
VITE_SUPABASE_URL=https://blodznzrdzjsvaqabsvj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsb2R6bnpyZHpqc3ZhcWFic3ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxNTkxNjMsImV4cCI6MjA4OTczNTE2M30.F7t6-JESd3__NjezKEmShUbXmcqGCIxWX_gnIefZPdc
SUPABASE_SERVICE_ROLE_KEY=sb_publishable_yctKLARtWlYpbZzk0dkx1w_e9Udi8cA
SIGILOPAY_PUBLIC_KEY=kaikegomesbrascell_dj5xs7rlxoaoew4z
SIGILOPAY_SECRET_KEY=nvt3mku331xhv1d8oxmqfnp20tjecpacan3v5gk0n276u5kkhexqieuz8y3cmc9f
```

### 2. Configuração do Projeto

1. Conecte seu repositório GitHub à Vercel
2. Configure o projeto:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 3. Deploy

Após configurar as variáveis de ambiente e o projeto, faça o deploy:

```bash
git add .
git commit -m "feat: configurar backend serverless na Vercel"
git push origin main
```

A Vercel irá automaticamente:
- Instalar as dependências
- Construir o frontend
- Configurar as Serverless Functions na pasta `/api`
- Fazer o deploy completo

### 4. Testar

Após o deploy, teste o pagamento PIX:
1. Acesse seu site na URL da Vercel
2. Clique em "Começar Agora"
3. Preencha os dados
4. Selecione PIX
5. Verifique se o QR Code é gerado corretamente

## Arquitetura

### Frontend (Vite + React)
- Hospedado na Vercel
- Build estático servido via CDN

### Backend (Serverless Functions)
- `/api/payment-pix.js` - Endpoint para criar pagamento PIX
- Executado como Serverless Function na Vercel
- Conecta com SigiloPay API e Supabase

### Fluxo de Pagamento

```
Frontend → /api/payment-pix → SigiloPay API
                            ↓
                         Supabase
                            ↓
                    QR Code + PIX Code
                            ↓
                         Frontend
```

## Troubleshooting

### Erro: "Failed to fetch"
- Verifique se as variáveis de ambiente estão configuradas na Vercel
- Verifique os logs da função serverless no painel da Vercel

### Erro: "SigiloPay API error"
- Verifique se as credenciais SigiloPay estão corretas
- Verifique se a API SigiloPay está online

### Erro: "Supabase error"
- Verifique se as credenciais Supabase estão corretas
- Verifique se as tabelas `customers` e `payments` existem

## Desenvolvimento Local

Para testar localmente com as Serverless Functions:

```bash
# Instalar Vercel CLI
npm i -g vercel

# Rodar em modo dev
vercel dev
```

Isso irá simular o ambiente da Vercel localmente, incluindo as Serverless Functions.
