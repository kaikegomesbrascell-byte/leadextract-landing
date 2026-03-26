-- =====================================================
-- SISTEMA DE AUTENTICAÇÃO E ASSINATURA - LEADEXTRACT
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
  expires_at TIMESTAMP WITH TIME ZONE, -- NULL = nunca expira (controle manual)
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id) -- Um usuário só pode ter uma assinatura ativa por vez
);

-- 3. Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires_at ON subscriptions(expires_at);

-- 4. Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Triggers para updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 6. Row Level Security (RLS)

-- Habilitar RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Políticas para user_profiles
CREATE POLICY "Usuários podem ver seu próprio perfil"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seu próprio perfil"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Políticas para subscriptions
CREATE POLICY "Usuários podem ver sua própria assinatura"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Admins podem ver e gerenciar todas as assinaturas
-- (Você precisará criar uma tabela de admins ou usar metadata do auth.users)

-- 7. Função para verificar se assinatura está ativa
CREATE OR REPLACE FUNCTION is_subscription_active(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_subscription RECORD;
BEGIN
  SELECT * INTO v_subscription
  FROM subscriptions
  WHERE user_id = p_user_id
    AND status = 'active'
  LIMIT 1;

  -- Se não encontrou assinatura ativa
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Se não tem data de expiração, está sempre ativo
  IF v_subscription.expires_at IS NULL THEN
    RETURN TRUE;
  END IF;

  -- Verificar se não expirou
  RETURN v_subscription.expires_at > NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Função para expirar assinaturas automaticamente (pode ser chamada por cron)
CREATE OR REPLACE FUNCTION expire_subscriptions()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE subscriptions
  SET status = 'expired'
  WHERE status = 'active'
    AND expires_at IS NOT NULL
    AND expires_at < NOW();
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Dados de exemplo (REMOVER EM PRODUÇÃO)
-- Inserir perfil de teste
-- INSERT INTO user_profiles (user_id, name, phone, document)
-- VALUES (
--   'user-uuid-aqui',
--   'Usuário Teste',
--   '(11) 99999-9999',
--   '123.456.789-00'
-- );

-- Inserir assinatura de teste
-- INSERT INTO subscriptions (user_id, plan, status, started_at, expires_at)
-- VALUES (
--   'user-uuid-aqui',
--   'premium',
--   'active',
--   NOW(),
--   NULL -- Sem expiração (controle manual)
-- );

-- =====================================================
-- INSTRUÇÕES DE USO
-- =====================================================
-- 
-- 1. Execute este script no SQL Editor do Supabase
-- 2. Configure as variáveis de ambiente no seu projeto:
--    - VITE_SUPABASE_URL
--    - VITE_SUPABASE_ANON_KEY
-- 
-- 3. Para criar um admin, adicione metadata ao usuário:
--    UPDATE auth.users
--    SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
--    WHERE email = 'admin@example.com';
-- 
-- 4. Para expirar assinaturas automaticamente, configure um cron job:
--    SELECT cron.schedule(
--      'expire-subscriptions',
--      '0 0 * * *', -- Todo dia à meia-noite
--      $$ SELECT expire_subscriptions(); $$
--    );
-- 
-- =====================================================
