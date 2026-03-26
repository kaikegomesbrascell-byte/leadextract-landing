# Database Migrations

Este diretório contém os scripts SQL para configurar o banco de dados Supabase para o sistema de pricing page com autenticação.

## Ordem de Execução

Execute os scripts na seguinte ordem:

### 1. Setup Inicial (se ainda não executado)
```sql
-- Execute primeiro se o banco estiver vazio
\i sql/setup.sql
```

### 2. Migrations para Sistema de Subscriptions

Execute as migrations na ordem numérica:

```sql
-- 0. (Opcional) Criar função update_updated_at_column se não existir
-- Esta migration é opcional se setup.sql já foi executado
\i sql/005_create_updated_at_function.sql

-- 1. Criar tabela de subscriptions com RLS
\i sql/001_create_subscriptions_table.sql

-- 2. Estender tabela payments para integração
\i sql/002_extend_payments_table.sql

-- 3. Criar tabelas de notificações e logs de acesso
\i sql/003_create_notification_and_access_tables.sql

-- 4. Adicionar particionamento mensal à tabela access_logs
\i sql/004_add_access_logs_partitioning.sql
```

## Aplicando via Supabase Dashboard

1. Acesse o Supabase Dashboard
2. Vá para **SQL Editor**
3. Crie uma nova query
4. Copie e cole o conteúdo de cada arquivo na ordem especificada
5. Execute cada script

## Aplicando via Supabase CLI

```bash
# Instalar Supabase CLI (se necessário)
npm install -g supabase

# Login
supabase login

# Link ao projeto
supabase link --project-ref <seu-project-ref>

# Executar migrations
supabase db push
```

## Estrutura das Tabelas

### subscriptions
Gerencia o ciclo de vida das assinaturas dos usuários.

**Campos principais:**
- `user_id`: Referência ao usuário (auth.users)
- `plan_id`: 'start' ou 'sovereign'
- `status`: 'ativo', 'expirado', 'pendente', 'cancelado'
- `extraction_limit`: Limite de extrações (NULL = ilimitado)
- `extractions_used`: Contador de extrações utilizadas
- `activated_at`, `expires_at`, `cancelled_at`: Timestamps do ciclo de vida

**Constraints:**
- CHECK em plan_id e status
- UNIQUE constraint para garantir apenas uma subscription ativa por usuário

**Triggers:**
- Auto-expiração quando expires_at < NOW()
- Log automático de mudanças de status
- Atualização automática de updated_at

### subscription_status_history
Registra todas as mudanças de status das subscriptions para auditoria.

### payments (extensão)
Adiciona colunas para integração com subscriptions:
- `user_id`: Link com auth.users
- `subscription_id`: Link com subscriptions
- `plan_id`: Plano adquirido
- `webhook_received_at`: Timestamp do webhook
- `webhook_payload`: Dados completos do webhook

### notification_queue
Fila de emails para envio assíncrono.

**Tipos de notificação:**
- welcome
- payment_confirmed
- expiration_warning
- expired
- password_reset

### access_logs
Registra todos os acessos a recursos protegidos para auditoria e segurança.

**Particionamento:**
- Tabela particionada por mês (RANGE partitioning em created_at)
- Melhora performance de queries com filtros de data
- Facilita arquivamento de dados antigos
- Requer criação mensal de novas partições (ver TASK_1.3_PARTITIONING_GUIDE.md)

## Row Level Security (RLS)

Todas as tabelas têm RLS habilitado com as seguintes políticas:

1. **Usuários autenticados**: Podem ver apenas seus próprios dados
2. **Service role**: Acesso completo para operações do backend

## Verificação

Após executar as migrations, verifique se tudo foi criado corretamente:

```sql
-- Verificar tabelas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'subscriptions', 
    'subscription_status_history',
    'notification_queue',
    'access_logs'
  );

-- Verificar índices
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename LIKE '%subscription%' 
  OR tablename IN ('notification_queue', 'access_logs');

-- Verificar triggers
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';

-- Verificar políticas RLS
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

## Rollback

Se necessário reverter as migrations:

```sql
-- Remover em ordem reversa

-- 4. Remover particionamento de access_logs
DROP FUNCTION IF EXISTS create_monthly_access_logs_partition() CASCADE;
DROP TABLE IF EXISTS access_logs CASCADE;

-- 3. Remover tabelas de notificações e logs
DROP TABLE IF EXISTS notification_queue CASCADE;

-- 2. Remover histórico de status
DROP TABLE IF EXISTS subscription_status_history CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;

-- 1. Remover colunas adicionadas em payments
ALTER TABLE payments 
  DROP COLUMN IF EXISTS user_id,
  DROP COLUMN IF EXISTS subscription_id,
  DROP COLUMN IF EXISTS plan_id,
  DROP COLUMN IF EXISTS webhook_received_at,
  DROP COLUMN IF EXISTS webhook_payload;

-- Remover funções
DROP FUNCTION IF EXISTS check_and_expire_subscription() CASCADE;
DROP FUNCTION IF EXISTS log_subscription_status_change() CASCADE;
```

## Requisitos Atendidos

- **6.2**: Registro de data de ativação e plano no Supabase
- **6.3**: Definição de limites de extração por plano
- **6.4**: Armazenamento de ID da transação
- **10.2**: Persistência de dados de pagamento com timestamps
- **10.3**: Histórico de status com timestamps
