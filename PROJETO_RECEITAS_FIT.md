# 🥗 Projeto: Landing Page Receitas Fit

## 📋 Resumo do Projeto

Landing page profissional para venda do e-book "100 Receitas Fit de Apenas 3 Ingredientes" com integração de pagamento via SigiloPay.

## 🎯 Arquivos Principais

### Landing Page
- **index.html** - Página principal com vídeo e carrossel de vendas
- **checkout.html** - Página de checkout com formulário e integração PIX

### Mídia
- **The_camera_slowly_202603311118.mp4** - Vídeo de demonstração
- **100-Receitas-Fit-de-Apenas-3-Ingredientes - Copia.pdf** - E-book para entrega

### Configuração
- **vercel.json** - Configuração de deploy na Vercel
- **VERCEL_SETUP.md** - Guia completo de setup
- **SIGILOPAY_API_DOCS.md** - Documentação da API de pagamento

### API
- **api/payment-pix.js** - Função serverless para processar pagamentos PIX
- **api/package.json** - Dependências da API (axios)

## ✨ Funcionalidades Implementadas

### Landing Page (index.html)
✅ Design moderno e responsivo
✅ Seção hero com CTA destacado
✅ Vídeo de demonstração integrado
✅ Carrossel automático com 4 slides:
   - Café da Manhã Turbinado
   - Almoços Práticos
   - Sobremesas Sem Culpa
   - Lanches e Snacks
✅ Seção de benefícios (6 cards)
✅ Seção de preços com oferta especial
✅ Navegação suave entre seções
✅ Totalmente responsivo

### Checkout (checkout.html)
✅ Formulário de dados do cliente
✅ Validação de campos
✅ Máscara para CPF e telefone
✅ Seleção de método de pagamento (PIX/Cartão)
✅ Integração com API SigiloPay
✅ Exibição de QR Code PIX
✅ Botão para copiar código PIX
✅ Loading durante processamento
✅ Design responsivo

### Integração de Pagamento
✅ API serverless na Vercel
✅ Processamento de pagamento PIX via SigiloPay
✅ Geração de QR Code
✅ Código PIX copia e cola
✅ Tratamento de erros
✅ CORS configurado

## 🚀 Como Fazer Deploy

### 1. Configurar Variáveis de Ambiente na Vercel

```env
VITE_SUPABASE_URL=https://blodznzrdzjsvaqabsvj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=sb_publishable_yctKLARtWlYpbZzk0dkx1w...
SIGILOPAY_PUBLIC_KEY=kaikegomesbrascell_dj5xs7rlxoaoew4z
SIGILOPAY_SECRET_KEY=nvt3mku331xhv1d8oxmqfnp20tjecpacan3v5gk0n276u5kkhexqieuz8y3cmc9f
```

### 2. Fazer Deploy

```bash
git add .
git commit -m "Nova landing page receitas fit"
git push origin main
```

A Vercel fará o deploy automaticamente!

### 3. Testar

1. Acesse: `https://seu-projeto.vercel.app`
2. Clique em "Quero Emagrecer Agora"
3. Preencha o formulário
4. Clique em "Finalizar Compra"
5. Verifique se o QR Code PIX aparece

## 💡 Fluxo de Compra

1. **Landing Page** → Cliente vê o vídeo e benefícios
2. **CTA** → Cliente clica em "Quero Emagrecer Agora"
3. **Checkout** → Cliente preenche dados (nome, email, CPF)
4. **Pagamento** → Cliente escolhe PIX
5. **QR Code** → Sistema gera QR Code via SigiloPay
6. **Confirmação** → Cliente paga e recebe e-book por email

## 🎨 Design

### Cores
- **Primary**: #10B981 (Verde)
- **Secondary**: #F59E0B (Laranja)
- **Dark**: #1F2937
- **Light**: #F9FAFB
- **White**: #FFFFFF

### Tipografia
- **Fonte**: Poppins (Google Fonts)
- **Pesos**: 300, 400, 500, 600, 700, 800, 900

### Componentes
- Cards com hover effect
- Botões com animação
- Carrossel com transição suave
- Formulário com validação visual
- Loading spinner
- QR Code responsivo

## 📱 Responsividade

✅ Desktop (1200px+)
✅ Tablet (768px - 1199px)
✅ Mobile (< 768px)

## 🔒 Segurança

- Credenciais protegidas por variáveis de ambiente
- API serverless para evitar exposição de chaves
- CORS configurado corretamente
- Validação de dados no frontend
- Processamento seguro via SigiloPay

## 📊 Métricas de Conversão

Para acompanhar:
- Taxa de cliques no CTA
- Taxa de preenchimento do formulário
- Taxa de conclusão de pagamento
- Tempo médio na página
- Taxa de rejeição

## 🔄 Próximos Passos (Opcional)

- [ ] Adicionar Google Analytics
- [ ] Implementar Facebook Pixel
- [ ] Criar página de obrigado
- [ ] Configurar webhook para entrega automática
- [ ] Adicionar depoimentos de clientes
- [ ] Criar sistema de cupons de desconto
- [ ] Implementar pagamento com cartão
- [ ] Adicionar chat de suporte

## 📞 Suporte Técnico

### Logs da Vercel
https://vercel.com/seu-projeto/logs

### Painel SigiloPay
https://app.sigilopay.com.br

### Documentação
- [Vercel](https://vercel.com/docs)
- [SigiloPay](./SIGILOPAY_API_DOCS.md)

---

✅ **Projeto Concluído e Pronto para Deploy!**
