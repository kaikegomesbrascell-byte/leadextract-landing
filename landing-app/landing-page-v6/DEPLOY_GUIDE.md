# 🚀 Guia Completo de Deploy - LeadExtract 6.0

## 📋 Pré-requisitos

Antes de fazer o deploy, você precisa:

1. ✅ Conta no GitHub (já tem)
2. ✅ Código commitado no repositório
3. ⚠️ Configurar Analytics (opcional mas recomendado)

---

## 🎯 Opção 1: Vercel (Recomendado - Mais Rápido)

### Por que Vercel?
- Deploy em 2 minutos
- HTTPS automático
- CDN global
- Zero configuração
- Domínio grátis (.vercel.app)

### Passo a Passo:

1. **Acesse**: https://vercel.com
2. **Login com GitHub**
3. **Import Project** → Selecione `leadextract-landing`
4. **Configure**:
   - Framework Preset: Other
   - Root Directory: `landing-page-v6`
   - Build Command: (deixe vazio)
   - Output Directory: (deixe vazio)
5. **Deploy** 🚀

**Pronto!** Sua landing page estará no ar em: `https://seu-projeto.vercel.app`

### Domínio Personalizado (Opcional):
1. Compre um domínio (ex: leadextract.com.br)
2. No Vercel: Settings → Domains → Add Domain
3. Configure os DNS conforme instruções

---

## 🎯 Opção 2: Netlify (Alternativa Excelente)

### Por que Netlify?
- Deploy automático
- HTTPS grátis
- Formulários integrados
- Analytics built-in

### Passo a Passo:

1. **Acesse**: https://netlify.com
2. **Login com GitHub**
3. **New site from Git** → GitHub → `leadextract-landing`
4. **Configure**:
   - Base directory: `landing-page-v6`
   - Build command: (deixe vazio)
   - Publish directory: `.`
5. **Deploy site** 🚀

**Pronto!** Sua landing page estará no ar em: `https://seu-projeto.netlify.app`

---

## 🎯 Opção 3: GitHub Pages (Grátis e Simples)

### Passo a Passo:

1. **No seu repositório GitHub**:
   - Settings → Pages
   - Source: Deploy from a branch
   - Branch: `main`
   - Folder: `/landing-page-v6`
   - Save

2. **Aguarde 2-3 minutos**

**Pronto!** Sua landing page estará em: `https://kaikegomesbrascell-byte.github.io/leadextract-landing/`

---

## ⚙️ Configurações Pós-Deploy

### 1. Google Analytics

1. **Crie uma conta**: https://analytics.google.com
2. **Crie uma propriedade** para seu site
3. **Copie o ID** (formato: G-XXXXXXXXXX)
4. **Edite o arquivo `index.html`**:
   - Procure por `YOUR_GA_ID`
   - Substitua pelo seu ID real
5. **Commit e push** as alterações

```bash
# No arquivo index.html, linha ~580
gtag('config', 'G-XXXXXXXXXX');  # Substitua aqui
```

### 2. Facebook Pixel

1. **Acesse**: https://business.facebook.com
2. **Events Manager** → Create Pixel
3. **Copie o Pixel ID** (número de 15 dígitos)
4. **Edite o arquivo `index.html`**:
   - Procure por `YOUR_PIXEL_ID`
   - Substitua pelo seu Pixel ID
5. **Commit e push** as alterações

```bash
# No arquivo index.html, linha ~595
fbq('init', '123456789012345');  # Substitua aqui
```

### 3. Domínio Personalizado

#### Registrar Domínio:
- **Registro.br** (para .com.br): https://registro.br
- **Hostinger** (internacional): https://hostinger.com.br
- **GoDaddy**: https://godaddy.com

#### Configurar DNS:

**Para Vercel:**
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**Para Netlify:**
```
Type: A
Name: @
Value: 75.2.60.5

Type: CNAME
Name: www
Value: seu-site.netlify.app
```

---

## 🔧 Customizações Importantes

### Alterar Número do WhatsApp

Procure por `5516994260416` no arquivo `index.html` e substitua:

```bash
# Buscar e substituir
5516994260416 → SEU_NUMERO_COM_DDI_DDD
```

Exemplo: `5511999998888` (55 = Brasil, 11 = SP, 999998888 = número)

### Alterar Preço

Procure por `R$ 1.000/mês` e ajuste conforme necessário.

### Alterar Cores

No arquivo `index.html`, procure por `:root` e edite:

```css
:root {
    --neon-blue: #00D9FF;    /* Cor primária */
    --emerald: #10B981;      /* Cor secundária */
}
```

---

## 📊 Monitoramento e Otimização

### Métricas para Acompanhar:

1. **Taxa de Conversão** (cliques no CTA / visitantes)
2. **Tempo na Página** (ideal: 2-3 minutos)
3. **Scroll Depth** (quantos % da página foram vistos)
4. **Taxa de Rejeição** (ideal: abaixo de 60%)
5. **Conversões no WhatsApp** (mensagens recebidas)

### Ferramentas Recomendadas:

- **Google Analytics**: Tráfego e comportamento
- **Hotjar**: Mapas de calor e gravações
- **Google Search Console**: SEO e indexação
- **PageSpeed Insights**: Performance

---

## 🎨 Testes A/B Sugeridos

### Teste 1: Headlines
- **Versão A**: "Pare de bater na porta de quem não quer comprar"
- **Versão B**: "Descubra quais empresas têm dinheiro para fechar HOJE"

### Teste 2: CTA
- **Versão A**: "Quero o Raio-X da minha Região"
- **Versão B**: "Garantir Minha Exclusividade Agora"

### Teste 3: Preço
- **Versão A**: R$ 1.000/mês
- **Versão B**: R$ 997/mês (psicologia de preço)

---

## 🚨 Checklist Pré-Lançamento

- [ ] Número do WhatsApp correto
- [ ] Google Analytics configurado
- [ ] Facebook Pixel configurado
- [ ] Domínio personalizado (se aplicável)
- [ ] Testado em mobile
- [ ] Testado em desktop
- [ ] Links funcionando
- [ ] Velocidade de carregamento OK (< 3s)
- [ ] SEO básico configurado
- [ ] Open Graph tags configuradas

---

## 🔥 Dicas de Conversão

### 1. Tráfego Pago
- **Google Ads**: Palavras-chave como "leads energia solar", "prospecção b2b"
- **Facebook Ads**: Segmentação por cargo (CEO, Diretor Comercial)
- **LinkedIn Ads**: Ideal para B2B high-ticket

### 2. Tráfego Orgânico
- Crie conteúdo no blog sobre prospecção B2B
- Faça guest posts em sites do nicho
- Participe de grupos no LinkedIn/Facebook

### 3. Remarketing
- Instale o Pixel do Facebook
- Crie audiências personalizadas
- Mostre anúncios para quem visitou mas não converteu

### 4. Email Marketing
- Capture emails com lead magnet
- Sequência de emails automatizada
- Ofereça consultoria gratuita

---

## 📞 Suporte

Dúvidas sobre o deploy? Entre em contato via WhatsApp.

---

**Desenvolvido para converter e escalar vendas B2B High-Ticket** 🚀
