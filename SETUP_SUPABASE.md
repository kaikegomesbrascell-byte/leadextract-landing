# Configuração do Supabase - Lead Extractor

Este documento explica como configurar o Supabase para armazenar informações dos clientes e gerenciar usuários no Lead Extractor.

## 📋 Pré-requisitos

- Conta no [Supabase](https://supabase.com)
- Projeto criado no Supabase
- Credenciais do projeto (URL e chaves)

## 🚀 Configuração Inicial

### 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e faça login
2. Clique em "New Project"
3. Preencha os dados do projeto:
   - Name: `lead-extractor`
   - Database Password: (escolha uma senha segura)
   - Region: (escolha a mais próxima)

### 2. Executar SQL Setup

1. No painel do Supabase, vá para "SQL Editor"
2. Execute o conteúdo do arquivo `sql/setup.sql`
3. Isso criará todas as tabelas necessárias:
   - `customers` - Informações dos clientes
   - `payments` - Histórico de pagamentos
   - `users` - Usuários do sistema

### 3. Configurar Variáveis de Ambiente

As variáveis já estão configuradas no arquivo `.env`:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://blodznzrdzjsvaqabsvj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsb2R6bnpyZHpqc3ZhcWFic3ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxNTkxNjMsImV4cCI6MjA4OTczNTE2M30.F7t6-JESd3__NjezKEmShUbXmcqGCIxWX_gnIefZPdc

# Service Role Key (para operações administrativas no backend)
SUPABASE_SERVICE_ROLE_KEY=sb_publishable_yctKLARtWlYpbZzk0dkx1w_e9Udi8cA
```

## 📊 Funcionalidades Implementadas

### 💾 Salvamento de Clientes

- **Automático**: Quando um cliente faz um pagamento (PIX ou cartão), suas informações são automaticamente salvas
- **Dados salvos**:
  - Nome completo
  - Email
  - CPF/CNPJ
  - Telefone (se informado)
  - Data de cadastro

### 💳 Histórico de Pagamentos

- **Rastreamento completo**: Todos os pagamentos são registrados
- **Dados salvos**:
  - ID do cliente
  - Valor do pagamento
  - Método (PIX ou cartão)
  - Status (pendente/aprovado/falhou/cancelado)
  - QR Code PIX (quando aplicável)
  - Chave PIX (quando aplicável)
  - ID do SigiloPay

### 👥 Gerenciamento de Usuários

- **CRUD completo**: Criar, ler, atualizar e deletar usuários
- **Funções**:
  - `admin`: Acesso total ao sistema
  - `user`: Acesso limitado
- **Dashboard**: Interface web para gerenciamento em `/dashboard`

## 🔧 API Endpoints

### Clientes
- `GET /api/customers` - Listar todos os clientes
- `GET /api/customers/:id` - Detalhes de um cliente específico

### Usuários
- `GET /api/users` - Listar todos os usuários
- `POST /api/users` - Criar novo usuário
- `PUT /api/users/:id` - Atualizar usuário
- `DELETE /api/users/:id` - Deletar usuário

### Estatísticas
- `GET /api/stats` - Estatísticas gerais do sistema

## 🎯 Como Usar

### 1. Iniciar o Servidor

```bash
# Backend
cd backend
npm start

# Frontend
npm run dev
```

### 2. Acessar o Dashboard

- URL: `http://localhost:5173/dashboard`
- Funcionalidades:
  - **Visão Geral**: Estatísticas do sistema
  - **Clientes**: Lista de todos os clientes cadastrados
  - **Usuários**: Gerenciamento completo de usuários

### 3. Fluxo de Pagamento

1. Cliente acessa a landing page
2. Preenche dados e escolhe método de pagamento
3. Sistema processa pagamento via SigiloPay
4. **Automático**: Dados do cliente são salvos no Supabase
5. **Automático**: Pagamento é registrado no histórico
6. Webhook atualiza status do pagamento quando aprovado

## 🔒 Segurança

- **Row Level Security (RLS)**: Políticas configuradas para proteger dados
- **Chaves separadas**: Anon key para frontend, Service key para backend
- **Validação**: Todos os dados são validados antes de salvar

## 📈 Monitoramento

O dashboard fornece estatísticas em tempo real:
- Total de clientes
- Total de pagamentos
- Receita total
- Taxa de conversão de pagamentos

## 🐛 Troubleshooting

### Erro de Conexão
- Verifique se as variáveis de ambiente estão corretas
- Confirme se o projeto Supabase está ativo
- Verifique as chaves de API

### Dados não Aparecem
- Execute novamente o script SQL `sql/setup.sql`
- Verifique se as tabelas foram criadas corretamente
- Confirme se o backend está rodando

### Pagamentos não Salvam
- Verifique logs do backend
- Confirme conectividade com Supabase
- Verifique se as chaves de API têm permissões corretas

## 📝 Próximos Passos

- [ ] Implementar autenticação de usuários
- [ ] Adicionar filtros avançados no dashboard
- [ ] Implementar notificações por email
- [ ] Adicionar relatórios detalhados
- [ ] Implementar backup automático