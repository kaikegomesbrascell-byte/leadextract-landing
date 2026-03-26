# ⚡ Quick Start - LeadExtract 6.0

Guia rápido para colocar sua landing page no ar em 10 minutos.

---

## 🚀 Deploy em 3 Passos

### 1️⃣ Configure (2 minutos)

**Windows:**
```bash
cd landing-page-v6
setup.bat
```

**Linux/Mac:**
```bash
cd landing-page-v6
chmod +x setup.sh
./setup.sh
```

**Manual:**
- Abra `index.html` em um editor
- Procure e substitua:
  - `5516994260416` → Seu número WhatsApp
  - `YOUR_GA_ID` → Seu Google Analytics ID
  - `YOUR_PIXEL_ID` → Seu Facebook Pixel ID

### 2️⃣ Teste Localmente (1 minuto)

Abra `index.html` no navegador e verifique:
- ✅ Número do WhatsApp correto nos botões
- ✅ Design carregando corretamente
- ✅ Animações funcionando
- ✅ Responsivo no mobile

### 3️⃣ Deploy (5 minutos)

**Opção A - Vercel (Mais Rápido):**
1. Acesse: https://vercel.com
2. Login com GitHub
3. Import → `leadextract-landing`
4. Root: `landing-page-v6`
5. Deploy 🚀

**Opção B - Netlify:**
1. Acesse: https://netlify.com
2. Login com GitHub
3. New site → `leadextract-landing`
4. Base: `landing-page-v6`
5. Deploy 🚀

**Opção C - GitHub Pages:**
1. Repo → Settings → Pages
2. Source: main branch
3. Folder: `/landing-page-v6`
4. Save 🚀

---

## 📋 Checklist Pré-Lançamento

### Configuração
- [ ] Número do WhatsApp atualizado
- [ ] Google Analytics configurado
- [ ] Facebook Pixel configurado
- [ ] Domínio personalizado (opcional)

### Testes
- [ ] Testado no Chrome
- [ ] Testado no Safari
- [ ] Testado no mobile
- [ ] Todos os CTAs funcionando
- [ ] Links do WhatsApp abrindo corretamente

### SEO
- [ ] Título otimizado
- [ ] Meta description preenchida
- [ ] Open Graph tags configuradas
- [ ] Favicon adicionado

### Analytics
- [ ] Google Analytics rastreando
- [ ] Facebook Pixel rastreando
- [ ] Eventos de CTA funcionando
- [ ] Scroll depth tracking ativo

---

## 🎯 Estrutura da Página

```
┌─────────────────────────────────┐
│  Header (Logo)                  │
├─────────────────────────────────┤
│  Hero Section                   │
│  - Headline matadora            │
│  - CTA principal                │
├─────────────────────────────────┤
│  Dashboard Mockup               │
│  - Visualização do produto      │
├─────────────────────────────────┤
│  Features Section               │
│  - 3 pilares principais         │
├─────────────────────────────────┤
│  Social Proof                   │ ⭐ NOVO
│  - Resultados reais             │
├─────────────────────────────────┤
│  Comparison (Antes vs Depois)   │ ⭐ NOVO
├─────────────────────────────────┤
│  Guarantee (7 dias)             │ ⭐ NOVO
├─────────────────────────────────┤
│  FAQ (6 perguntas)              │ ⭐ NOVO
├─────────────────────────────────┤
│  Exclusivity Section            │
│  - Escassez territorial         │
├─────────────────────────────────┤
│  Final CTA                      │ ⭐ NOVO
│  - Urgência máxima              │
├─────────────────────────────────┤
│  Footer                         │
└─────────────────────────────────┘

Extras:
• Exit Intent Popup ⭐
• Scroll Progress Bar ⭐
• Fade-in Animations ⭐
```

---

## 🔧 Customizações Rápidas

### Alterar Cores
```css
/* Procure por :root no index.html */
:root {
    --neon-blue: #00D9FF;    /* Cor primária */
    --emerald: #10B981;      /* Cor secundária */
}
```

### Alterar Preço
```html
<!-- Procure por "R$ 1.000/mês" -->
R$ 1.000/mês → R$ 997/mês
```

### Alterar Headline
```html
<!-- Procure por: -->
Pare de bater na porta<br>
de quem <span class="gradient-text">não quer comprar</span>

<!-- Substitua por sua headline -->
```

### Adicionar/Remover Seções
```html
<!-- Cada seção está em um <section> -->
<!-- Comente ou delete o bloco inteiro -->

<!-- Exemplo: Remover FAQ -->
<!-- <section class="faq">...</section> -->
```

---

## 📊 Métricas para Acompanhar

### Essenciais
1. **Taxa de Conversão**: Cliques CTA / Visitantes
2. **Tempo na Página**: Ideal 2-3 minutos
3. **Bounce Rate**: Ideal < 60%

### Avançadas
4. **Scroll Depth**: % da página vista
5. **Exit Intent**: Quantos viram o popup
6. **Conversões WhatsApp**: Mensagens recebidas

### Onde Ver
- **Google Analytics**: Comportamento → Eventos
- **Facebook Pixel**: Events Manager
- **WhatsApp Business**: Estatísticas

---

## 🎨 Testes A/B Rápidos

### Teste 1: Headline (Fácil)
```
A: "Pare de bater na porta de quem não quer comprar"
B: "Descubra quais empresas têm dinheiro para fechar HOJE"
```

### Teste 2: CTA (Fácil)
```
A: "Quero o Raio-X da minha Região"
B: "Garantir Minha Exclusividade Agora"
```

### Teste 3: Preço (Médio)
```
A: R$ 1.000/mês
B: R$ 997/mês
C: R$ 33/dia (fracionado)
```

### Como Testar
1. Crie 2 versões da página (index-a.html, index-b.html)
2. Direcione 50% do tráfego para cada
3. Acompanhe conversões por 7-14 dias
4. Escolha a vencedora

---

## 🚨 Troubleshooting

### WhatsApp não abre
- Verifique se o número está no formato: `5511999998888`
- Teste em: https://wa.me/5511999998888

### Analytics não rastreia
- Verifique se substituiu `YOUR_GA_ID`
- Aguarde 24-48h para dados aparecerem
- Use Google Tag Assistant para debug

### Página não carrega
- Verifique console do navegador (F12)
- Teste em modo anônimo
- Limpe cache do navegador

### Mobile quebrado
- Verifique viewport meta tag
- Teste em: https://responsivedesignchecker.com
- Use DevTools mobile emulator

---

## 📞 Suporte Rápido

### Documentação Completa
- `README.md` - Visão geral
- `DEPLOY_GUIDE.md` - Deploy detalhado
- `CHANGELOG.md` - Histórico de mudanças

### Recursos Externos
- **Vercel Docs**: https://vercel.com/docs
- **Netlify Docs**: https://docs.netlify.com
- **Google Analytics**: https://analytics.google.com
- **Facebook Pixel**: https://business.facebook.com

### Contato
WhatsApp: (16) 99426-0416

---

## 🎁 Bônus

### Scripts Úteis

**Abrir no navegador (Windows):**
```bash
start index.html
```

**Abrir no navegador (Mac):**
```bash
open index.html
```

**Servidor local rápido:**
```bash
# Python
python -m http.server 8000

# Node.js
npx serve

# PHP
php -S localhost:8000
```

### Atalhos de Teclado

- `Ctrl + F` - Buscar no código
- `Ctrl + H` - Buscar e substituir
- `F12` - Abrir DevTools
- `Ctrl + Shift + M` - Mobile view

---

## ✅ Próximos Passos

1. ✅ Configure a página (setup.bat/sh)
2. ✅ Teste localmente
3. ✅ Faça o deploy
4. 📊 Configure Analytics
5. 🎯 Direcione tráfego
6. 📈 Acompanhe métricas
7. 🔄 Otimize baseado em dados
8. 💰 Escale vendas

---

**Tempo total**: ~10 minutos  
**Dificuldade**: Fácil  
**Resultado**: Landing page profissional no ar 🚀

Boa sorte com suas vendas! 💪
