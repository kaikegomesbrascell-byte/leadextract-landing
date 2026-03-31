# 🥗 Landing Page - 100 Receitas Fit

Landing page moderna para venda do e-book "100 Receitas Fit de Apenas 3 Ingredientes".

## 🚀 Deploy na Vercel

### Configuração Rápida

1. Conecte seu repositório na Vercel
2. Configure as variáveis de ambiente (veja abaixo)
3. Deploy automático!

### Variáveis de Ambiente Necessárias

```env
# Supabase
VITE_SUPABASE_URL=https://blodznzrdzjsvaqabsvj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=sb_publishable_yctKLARtWlYpbZzk0dkx1w...

# SigiloPay
SIGILOPAY_PUBLIC_KEY=kaikegomesbrascell_dj5xs7rlxoaoew4z
SIGILOPAY_SECRET_KEY=nvt3mku331xhv1d8oxmqfnp20tjecpacan3v5gk0n276u5kkhexqieuz8y3cmc9f
```

Marque todas as variáveis para: **Production**, **Preview** e **Development**

## 💳 Integração de Pagamento - SigiloPay

### Criar Pagamento PIX

```javascript
POST https://app.sigilopay.com.br/api/v1/gateway/pix/receive

Headers:
{
  "Content-Type": "application/json",
  "x-public-key": "kaikegomesbrascell_dj5xs7rlxoaoew4z",
  "x-secret-key": "nvt3mku331xhv1d8oxmqfnp20tjecpacan3v5gk0n276u5kkhexqieuz8y3cmc9f"
}

Body:
{
  "identifier": "receitas-fit-123456",
  "amount": 47,
  "client": {
    "name": "Nome do Cliente",
    "email": "email@exemplo.com",
    "document": "12345678900"
  },
  "expiresIn": 3600
}
```

### Resposta

```json
{
  "pix": {
    "code": "00020126580014br.gov.bcb.pix...",
    "base64": "iVBORw0KGgoAAAANSUhEUgAAA..."
  },
  "transactionId": "cmn2310ly12ul1smm14put5uf",
  "status": "PENDING"
}
```

Use o QR Code: `data:image/png;base64,${pix.base64}`

## 📁 Estrutura do Projeto

```
/
├── index.html                          # Landing page principal
├── The_camera_slowly_202603311118.mp4  # Vídeo de demonstração
├── 100-Receitas-Fit-de-Apenas-3-Ingredientes - Copia.pdf  # E-book
├── vercel.json                         # Configuração Vercel
├── api/
│   ├── payment-pix.js                  # API serverless para PIX
│   └── package.json                    # Dependências da API
└── README.md                           # Este arquivo
```

## 🎯 Funcionalidades

- ✅ Design moderno e responsivo
- ✅ Vídeo de demonstração integrado
- ✅ Carrossel de benefícios automático
- ✅ Seção de preços com CTA
- ✅ Integração com SigiloPay (PIX)
- ✅ Deploy automático na Vercel

## 📚 Documentação Completa

- [Setup Vercel](./VERCEL_SETUP.md) - Guia completo de deploy
- [API SigiloPay](./SIGILOPAY_API_DOCS.md) - Documentação da API de pagamento

## 🔒 Segurança

- Todas as chamadas à API SigiloPay são feitas via serverless functions
- Credenciais protegidas por variáveis de ambiente
- CORS configurado corretamente
- Pagamentos processados de forma segura

## 📞 Suporte

Para dúvidas sobre:
- **Deploy**: Verifique os logs na Vercel
- **Pagamentos**: Consulte o painel SigiloPay
- **Código**: Abra uma issue no repositório

---

Desenvolvido com ❤️ para ajudar pessoas a terem uma vida mais saudável
