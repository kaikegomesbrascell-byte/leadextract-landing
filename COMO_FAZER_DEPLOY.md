# 🚀 Como Fazer Deploy - Passo a Passo

## 1️⃣ Commit e Push para o GitHub

```bash
# Adicionar todos os arquivos
git add .

# Fazer commit
git commit -m "Landing Page Receitas Fit - Versão Final Limpa"

# Enviar para o GitHub
git push origin main
```

## 2️⃣ Configurar Variáveis de Ambiente na Vercel

Acesse: https://vercel.com/seu-projeto/settings/environment-variables

Adicione estas variáveis (uma por vez):

| Nome da Variável | Valor |
|------------------|-------|
| `VITE_SUPABASE_URL` | `https://blodznzrdzjsvaqabsvj.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsb2R6bnpyZHpqc3ZhcWFic3ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxNTkxNjMsImV4cCI6MjA4OTczNTE2M30.F7t6-JESd3__NjezKEmShUbXmcqGCIxWX_gnIefZPdc` |
| `SUPABASE_SERVICE_ROLE_KEY` | `sb_publishable_yctKLARtWlYpbZzk0dkx1w_e9Udi8cA` |
| `SIGILOPAY_PUBLIC_KEY` | `kaikegomesbrascell_dj5xs7rlxoaoew4z` |
| `SIGILOPAY_SECRET_KEY` | `nvt3mku331xhv1d8oxmqfnp20tjecpacan3v5gk0n276u5kkhexqieuz8y3cmc9f` |

**Importante:** Marque todas as variáveis para:
- ✅ Production
- ✅ Preview
- ✅ Development

## 3️⃣ Fazer Redeploy

1. Vá para: https://vercel.com/seu-projeto/deployments
2. Clique nos 3 pontinhos do último deploy
3. Clique em **"Redeploy"**
4. Aguarde o deploy completar (1-2 minutos)

## 4️⃣ Testar o Site

### Teste 1: Landing Page
1. Acesse: `https://seu-projeto.vercel.app`
2. Verifique se o vídeo carrega
3. Verifique se o carrossel funciona
4. Clique em "Quero Emagrecer Agora"

### Teste 2: Checkout
1. Preencha o formulário:
   - Nome: Teste Silva
   - Email: teste@teste.com
   - CPF: 123.456.789-00
   - WhatsApp: (11) 99999-9999
2. Clique em "Finalizar Compra - R$ 47,00"

### Teste 3: Pagamento PIX
1. Verifique se o QR Code aparece
2. Verifique se o código PIX pode ser copiado
3. ✅ Se tudo funcionar, está pronto!

## 🐛 Troubleshooting

### Erro: "Failed to fetch"
**Solução:** Verifique se as variáveis de ambiente foram salvas e faça um novo deploy.

### Erro: QR Code não aparece
**Solução:** 
1. Abra o Console do navegador (F12)
2. Vá na aba "Network"
3. Procure por `/api/payment-pix`
4. Veja o erro retornado
5. Verifique os logs na Vercel: https://vercel.com/seu-projeto/logs

### Vídeo não carrega
**Solução:** Verifique se o arquivo `The_camera_slowly_202603311118.mp4` foi commitado corretamente.

## 📊 Monitoramento

### Ver Logs em Tempo Real
https://vercel.com/seu-projeto/logs

### Ver Analytics
https://vercel.com/seu-projeto/analytics

### Ver Deployments
https://vercel.com/seu-projeto/deployments

## ✅ Checklist Final

- [ ] Código commitado e enviado ao GitHub
- [ ] Variáveis de ambiente configuradas na Vercel
- [ ] Deploy realizado com sucesso
- [ ] Landing page acessível
- [ ] Vídeo carregando corretamente
- [ ] Carrossel funcionando
- [ ] Checkout acessível
- [ ] Formulário validando dados
- [ ] QR Code PIX sendo gerado
- [ ] Código PIX pode ser copiado

## 🎉 Pronto!

Seu site está no ar e pronto para vender!

Compartilhe o link: `https://seu-projeto.vercel.app`

---

**Dúvidas?** Consulte:
- [README.md](./README.md) - Documentação geral
- [VERCEL_SETUP.md](./VERCEL_SETUP.md) - Setup detalhado
- [SIGILOPAY_API_DOCS.md](./SIGILOPAY_API_DOCS.md) - API de pagamento
