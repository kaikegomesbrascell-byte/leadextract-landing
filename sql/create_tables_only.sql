-- =====================================================
-- TABELAS ESSENCIAIS - SISTEMA DE ASSINATURA
-- =====================================================
-- Execute APENAS este arquivo se o outro der erro
-- Este arquivo contém APENAS as tabelas, sem funções
-- =====================================================

-- 1. Tabela de Perfis de Usuário
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  document TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 2. Tabela de Assinaturas
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('standard', 'premium')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'expired', 'cancelled', 'pending')),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 3. Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires_at ON subscriptions(expires_at);

-- 4. Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- 5. Políticas RLS para user_profiles
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON user_profiles;
CREATE POLICY "Usuários podem ver seu próprio perfil"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON user_profiles;
CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem inserir seu próprio perfil" ON user_profiles;
CREATE POLICY "Usuários podem inserir seu próprio perfil"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 6. Políticas RLS para subscriptions
DROP POLICY IF EXISTS "Usuários podem ver sua própria assinatura" ON subscriptions;
CREATE POLICY "Usuários podem ver sua própria assinatura"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- 7. Política para service_role (backend) gerenciar tudo
DROP POLICY IF EXISTS "Service role pode gerenciar tudo em user_profiles" ON user_profiles;
CREATE POLICY "Service role pode gerenciar tudo em user_profiles"
  ON user_profiles FOR ALL
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role pode gerenciar tudo em subscriptions" ON subscriptions;
CREATE POLICY "Service role pode gerenciar tudo em subscriptions"
  ON subscriptions FOR ALL
  USING (auth.role() = 'service_role');

-- =====================================================
-- PRONTO! Tabelas criadas com sucesso
-- =====================================================
-- Agora você pode:
-- 1. Usar o sistema de autenticação
-- 2. Criar assinaturas via código TypeScript
-- 3. Gerenciar assinaturas no painel admin
-- =====================================================

-- EXEMPLO: Criar uma assinatura manualmente
-- INSERT INTO subscriptions (user_id, plan, status, started_at, expires_at)
-- VALUES (
--   'cole-o-user-id-aqui',
--   'premium',
--   'active',
--   NOW(),
--   NULL
-- );

-- EXEMPLO: Ver todas as assinaturas
-- SELECT * FROM subscriptions;

-- EXEMPLO: Ver perfis
-- SELECT * FROM user_profiles;
