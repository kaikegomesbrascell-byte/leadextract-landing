# 🧪 Como Testar Localmente - Guia Windows

## ⚠️ Por Que o Erro?

Quando você abre `checkout.html` direto (clicando duas vezes), o navegador usa `file://` que não permite requisições de API por segurança.

## ✅ 3 Soluções Simples

### Solução 1: Usar Live Server (Mais Fácil)

#### Se você tem VSCode:
1. Instale a extensão "Live Server"
2. Clique direito em `index.html`
3. Selecione "Open with Live Server"
4. Pronto! Abrirá em `http://localhost:5500`

### Solução 2: Usar Python (Se tiver instalado)
```cmd
REM Na pasta do projeto
python -m http.server 8000

REM Depois abra no navegador:
REM http://localhost:8000
```

### Solução 3: Usar Node.js
```cmd
REM Instalar serve
npm install -g serve

REM Rodar servidor
serve .

REM Abrirá automaticamente no navegador
```

### Solução 4: Apenas Visualizar (SEM TESTAR PAGAMENTO)
```cmd
REM Abrir apenas para ver o design
start index.html

REM O checkout não funcionará, mas você pode ver o visual
```

## 🎯 Recomendação: Fazer Deploy Direto!

Como o teste local precisa de servidor, é mais fácil fazer deploy direto na Vercel:

### Opção A: Vercel CLI (Recomendado)
```cmd
REM Instalar
npm install -g vercel

REM Login
vercel login

REM Deploy
vercel --prod
```

### Opção B: Aguardar GitHub Voltar
```cmd
REM Tentar push novamente
git push origin main
```

## 📱 Teste Apenas o Visual

Para ver como ficou a landing page SEM testar o pagamento:

```cmd
REM Abrir landing page
start index.html

REM Você verá:
✅ Design profissional
✅ Carrossel funcionando
✅ Animações
✅ Vídeo
✅ Todos os elementos visuais

❌ Checkout não funcionará (precisa de servidor)
```

## 🚀 Melhor Opção: Deploy na Vercel

1. **Instalar Vercel CLI**
   ```cmd
   npm install -g vercel
   ```

2. **Fazer Login**
   ```cmd
   vercel login
   ```
   Escolha email e confirme no link que receberá

3. **Deploy**
   ```cmd
   vercel --prod
   ```

4. **Adicionar Variáveis de Ambiente**
   ```cmd
   vercel env add VITE_SUPABASE_URL
   vercel env add VITE_SUPABASE_ANON_KEY
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   vercel env add SIGILOPAY_PUBLIC_KEY
   vercel env add SIGILOPAY_SECRET_KEY
   ```

5. **Pronto!**
   Seu site estará em: `https://seu-projeto.vercel.app`

## 💡 Resumo

| Opção | Dificuldade | Funciona Checkout? |
|-------|-------------|-------------------|
| Abrir direto (file://) | Fácil | ❌ Não |
| Live Server (VSCode) | Fácil | ⚠️ Parcial* |
| Python/Node servidor | Média | ⚠️ Parcial* |
| Deploy Vercel | Fácil | ✅ Sim |

*Parcial = Precisa configurar backend local também

## 🎯 Minha Recomendação

**Faça deploy direto na Vercel!**

É mais rápido e você testa tudo funcionando de verdade, incluindo:
- ✅ Landing page
- ✅ Checkout
- ✅ Pagamento PIX
- ✅ Geração de QR Code

```cmd
npm install -g vercel
vercel login
vercel --prod
```

---

**Quer que eu crie uma versão demo do checkout que funciona sem servidor?**
