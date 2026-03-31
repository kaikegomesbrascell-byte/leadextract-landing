# 🚀 Deploy Alternativo - Sem GitHub

## ⚠️ GitHub com Problema?

Não tem problema! Você pode fazer deploy direto na Vercel sem usar o GitHub.

## 🎯 Opção 1: Vercel CLI (Recomendado)

### Passo 1: Instalar Vercel CLI
```cmd
npm install -g vercel
```

### Passo 2: Fazer Login
```cmd
vercel login
```

Escolha uma opção:
- Email (receberá um link de confirmação)
- GitHub
- GitLab
- Bitbucket

### Passo 3: Deploy
```cmd
REM Na pasta do projeto
cd C:\Users\kaike\Downloads\AP@

REM Deploy
vercel
```

Responda as perguntas:
- Set up and deploy? **Y**
- Which scope? **Seu usuário**
- Link to existing project? **N** (primeira vez) ou **Y** (se já existe)
- What's your project's name? **receitas-fit** (ou outro nome)
- In which directory is your code located? **./** (Enter)

### Passo 4: Configurar Variáveis de Ambiente
```cmd
REM Adicionar variáveis
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add SIGILOPAY_PUBLIC_KEY
vercel env add SIGILOPAY_SECRET_KEY
```

Para cada variável:
1. Cole o valor (do seu .env)
2. Escolha: **Production, Preview, Development**
3. Pressione Enter

### Passo 5: Deploy para Produção
```cmd
vercel --prod
```

✅ Pronto! Seu site estará no ar em: `https://seu-projeto.vercel.app`

## 🎯 Opção 2: Vercel Dashboard (Arrastar e Soltar)

### Passo 1: Preparar Arquivos
```cmd
REM Criar um ZIP do projeto (sem node_modules)
REM Você pode usar o Windows Explorer:
REM 1. Selecione todos os arquivos EXCETO:
REM    - node_modules
REM    - .git
REM    - .env (não incluir!)
REM 2. Clique direito > Enviar para > Pasta compactada
```

### Passo 2: Acessar Vercel
1. Acesse: https://vercel.com/new
2. Clique em "Browse" ou arraste o ZIP

### Passo 3: Configurar
1. Nome do projeto: **receitas-fit**
2. Framework Preset: **Other**
3. Root Directory: **./** (deixe como está)
4. Clique em "Deploy"

### Passo 4: Adicionar Variáveis
1. Vá em: Settings → Environment Variables
2. Adicione cada variável (copie do seu .env):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SIGILOPAY_PUBLIC_KEY`
   - `SIGILOPAY_SECRET_KEY`
3. Marque: Production, Preview, Development

### Passo 5: Redeploy
1. Vá em: Deployments
2. Clique nos 3 pontinhos do último deploy
3. Clique em "Redeploy"

## 🎯 Opção 3: Aguardar GitHub e Usar Integração

### Quando o GitHub Voltar
```cmd
REM Tentar novamente
git push origin main
```

### Conectar Vercel ao GitHub
1. Acesse: https://vercel.com/new
2. Clique em "Import Git Repository"
3. Selecione seu repositório
4. Configure variáveis de ambiente
5. Deploy automático!

## 📊 Comparação das Opções

| Opção | Vantagens | Desvantagens |
|-------|-----------|--------------|
| **Vercel CLI** | Rápido, automático, fácil atualizar | Precisa instalar CLI |
| **Arrastar ZIP** | Não precisa CLI, visual | Manual, precisa recriar ZIP |
| **GitHub** | Deploy automático, versionamento | Depende do GitHub funcionar |

## 🔍 Verificar Deploy

### Ver Status
```cmd
REM Se usou CLI
vercel ls

REM Ver logs
vercel logs
```

### Testar Site
```cmd
REM Abrir no navegador
start https://seu-projeto.vercel.app
```

## ✅ Checklist Pós-Deploy

- [ ] Site acessível
- [ ] Landing page carrega
- [ ] Vídeo funciona
- [ ] Checkout abre
- [ ] Formulário valida
- [ ] QR Code PIX é gerado
- [ ] Código PIX pode ser copiado

## 🐛 Troubleshooting

### Erro: "vercel: command not found"
```cmd
REM Reinstalar
npm install -g vercel

REM Ou usar npx
npx vercel
```

### Erro: "Missing environment variables"
```cmd
REM Adicionar variáveis
vercel env add NOME_DA_VARIAVEL
```

### Erro: "Build failed"
```cmd
REM Ver logs
vercel logs

REM Verificar vercel.json
type vercel.json
```

## 💡 Dica: Deploy Rápido

Para atualizações futuras com Vercel CLI:

```cmd
REM 1. Fazer alterações no código
REM 2. Deploy direto (sem commit)
vercel --prod

REM Pronto! Atualização no ar em segundos
```

## 🎉 Resultado

Independente da opção escolhida, seu site estará no ar!

**URL:** `https://seu-projeto.vercel.app`

---

**Escolha a opção que preferir. Todas funcionam!** 🚀
