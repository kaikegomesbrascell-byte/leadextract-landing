# 🚀 Guia para Subir para o GitHub

## ✅ Status Atual

Repositório Git inicializado e primeiro commit criado com sucesso!

```
✅ Git inicializado
✅ .gitignore configurado
✅ README.md criado
✅ Primeiro commit realizado (387 arquivos)
```

## 📝 Próximos Passos

### 1. Criar Repositório no GitHub

1. Acesse: https://github.com/new
2. Preencha:
   - **Repository name**: `leadextract` (ou nome de sua preferência)
   - **Description**: "Sistema Inteligente de Prospecção B2B com IA"
   - **Visibility**: 
     - ✅ **Private** (recomendado - código proprietário)
     - ⚠️ Public (apenas se quiser código aberto)
3. **NÃO** marque "Initialize with README" (já temos um)
4. Clique em "Create repository"

### 2. Conectar Repositório Local ao GitHub

Após criar o repositório, o GitHub mostrará comandos. Use estes:

```bash
# Adicionar remote (substitua SEU-USUARIO pelo seu username do GitHub)
git remote add origin https://github.com/SEU-USUARIO/leadextract.git

# Renomear branch para main (padrão do GitHub)
git branch -M main

# Fazer push do código
git push -u origin main
```

### 3. Comandos Completos (Copie e Cole)

```bash
# 1. Adicionar remote
git remote add origin https://github.com/SEU-USUARIO/leadextract.git

# 2. Renomear branch
git branch -M main

# 3. Push inicial
git push -u origin main
```

**⚠️ IMPORTANTE**: Substitua `SEU-USUARIO` pelo seu username do GitHub!

## 🔐 Autenticação

### Opção 1: Personal Access Token (Recomendado)

1. Acesse: https://github.com/settings/tokens
2. Clique em "Generate new token" → "Generate new token (classic)"
3. Dê um nome: "LeadExtract"
4. Marque: `repo` (acesso completo ao repositório)
5. Clique em "Generate token"
6. **COPIE O TOKEN** (não poderá ver novamente!)

Quando fizer o push, use:
- **Username**: seu username do GitHub
- **Password**: cole o token gerado

### Opção 2: SSH (Alternativa)

Se preferir SSH:

```bash
# Gerar chave SSH
ssh-keygen -t ed25519 -C "seu-email@exemplo.com"

# Adicionar ao ssh-agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Copiar chave pública
cat ~/.ssh/id_ed25519.pub
```

Depois adicione a chave em: https://github.com/settings/keys

E use URL SSH:
```bash
git remote add origin git@github.com:SEU-USUARIO/leadextract.git
```

## 📦 Estrutura que Será Enviada

```
leadextract/
├── lead-extractor-app/          # Aplicação Python
│   ├── intelligence_modules.py  # Módulos de IA ✨
│   ├── automation_engine.py
│   ├── gui_manager.py
│   └── ...
├── backend/                     # API de pagamentos
│   ├── server.js
│   └── package.json
├── landing-page/                # Landing page React
├── docs/                        # Documentação
├── .gitignore                   # Arquivos ignorados
└── README.md                    # Documentação principal
```

## ⚠️ Arquivos Ignorados (Não Serão Enviados)

Graças ao `.gitignore`, estes arquivos NÃO serão enviados:

- ❌ `node_modules/` (dependências Node)
- ❌ `__pycache__/` (cache Python)
- ❌ `*.pyc` (bytecode Python)
- ❌ `.env` (variáveis de ambiente)
- ❌ `*.csv` (dados de leads)
- ❌ `*.log` (logs)
- ❌ Credenciais e chaves

## 🔄 Comandos Futuros (Após Push Inicial)

### Adicionar Novos Arquivos

```bash
# Ver status
git status

# Adicionar arquivos
git add .

# Commit
git commit -m "feat: adiciona nova funcionalidade"

# Push
git push
```

### Tipos de Commit (Convenção)

- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Documentação
- `style:` - Formatação
- `refactor:` - Refatoração
- `test:` - Testes
- `chore:` - Manutenção

Exemplos:
```bash
git commit -m "feat: adiciona módulo de análise de sentimento"
git commit -m "fix: corrige erro no cálculo de score"
git commit -m "docs: atualiza README com novos exemplos"
```

## 📊 Verificar Status do Repositório

```bash
# Ver status local
git status

# Ver histórico de commits
git log --oneline

# Ver remote configurado
git remote -v

# Ver branch atual
git branch
```

## 🎯 Checklist Final

Antes de fazer o push, verifique:

- [ ] Repositório criado no GitHub
- [ ] Remote adicionado (`git remote -v`)
- [ ] Credenciais prontas (Token ou SSH)
- [ ] Sem arquivos sensíveis (`.env`, credenciais)
- [ ] README.md atualizado com suas informações

## 🚨 Troubleshooting

### Erro: "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/SEU-USUARIO/leadextract.git
```

### Erro: "Authentication failed"
- Verifique se o token está correto
- Token deve ter permissão `repo`
- Use token como senha, não sua senha do GitHub

### Erro: "Permission denied (publickey)"
- Verifique se a chave SSH está adicionada no GitHub
- Teste: `ssh -T git@github.com`

## 📞 Próximos Passos Após Push

1. ✅ Verificar repositório no GitHub
2. ✅ Adicionar descrição e tags
3. ✅ Configurar GitHub Pages (se quiser)
4. ✅ Adicionar colaboradores (se necessário)
5. ✅ Configurar GitHub Actions (CI/CD)

## 🎉 Pronto!

Após o push, seu código estará no GitHub e você poderá:
- Acessar de qualquer lugar
- Compartilhar com colaboradores
- Fazer backup automático
- Versionar mudanças
- Colaborar com outros desenvolvedores

---

**Dúvidas?** Consulte: https://docs.github.com/pt/get-started
