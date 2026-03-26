-- Migration: Create subscriptions table with RLS policies
-- Requirements: 6.2, 6.3, 6.4, 10.2, 10.3
-- Description: Creates subscriptions table to manage user subscription lifecycle,
--              including plan limits, status tracking, and access control

-- Create subscriptions table
CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL CHECK (plan_id IN ('start', 'sovereign')),
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (
    status IN ('ativo', 'expirado', 'pendente', 'cancelado')
  ),
  
  -- Limites do plano
  extraction_limit INTEGER, -- NULL = ilimitado (Sovereign)
  extractions_used INTEGER DEFAULT 0,
  
  -- Datas
  activated_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint: apenas uma subscription ativa por usuário
  CONSTRAINT unique_active_subscription UNIQUE (user_id, status) 
    WHERE status = 'ativo'
);

-- Criar índices para performance
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_expires_at ON subscriptions(expires_at);

-- Habilitar Row Level Security
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Política RLS: usuários podem ver apenas suas próprias subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Política RLS: service role pode gerenciar todas as subscriptions
CREATE POLICY "Service role can manage all subscriptions"
  ON subscriptions FOR ALL
  USING (auth.role() = 'service_role');

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_subscriptions_updated_at 
  BEFORE UPDATE ON subscriptions 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Função para verificar e expirar subscriptions automaticamente
CREATE OR REPLACE FUNCTION check_and_expire_subscription()
RETURNS TRIGGER AS $
BEGIN
  -- Se a subscription está ativa mas expirou
  IF NEW.status = 'ativo' AND NEW.expires_at < NOW() THEN
    NEW.status = 'expirado';
    NEW.updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Trigger para verificar expiração antes de atualizar
CREATE TRIGGER trigger_check_expiration
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION check_and_expire_subscription();

-- Tabela de histórico de mudanças de status
CREATE TABLE subscription_status_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by TEXT, -- 'system', 'webhook', 'admin', 'user'
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para histórico
CREATE INDEX idx_subscription_status_history_subscription_id 
  ON subscription_status_history(subscription_id);
CREATE INDEX idx_subscription_status_history_created_at 
  ON subscription_status_history(created_at);

-- Função para registrar mudanças de status
CREATE OR REPLACE FUNCTION log_subscription_status_change()
RETURNS TRIGGER AS $
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO subscription_status_history (
      subscription_id, old_status, new_status, changed_by
    ) VALUES (
      NEW.id, OLD.status, NEW.status, 'system'
    );
  END IF;
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Trigger para registrar mudanças de status
CREATE TRIGGER trigger_log_status_change
  AFTER UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION log_subscription_status_change();

-- Habilitar RLS para subscription_status_history
ALTER TABLE subscription_status_history ENABLE ROW LEVEL SECURITY;

-- Política RLS: usuários podem ver histórico de suas próprias subscriptions
CREATE POLICY "Users can view own subscription history"
  ON subscription_status_history FOR SELECT
  USING (
    subscription_id IN (
      SELECT id FROM subscriptions WHERE user_id = auth.uid()
    )
  );

-- Política RLS: service role pode gerenciar todo o histórico
CREATE POLICY "Service role can manage all subscription history"
  ON subscription_status_history FOR ALL
  USING (auth.role() = 'service_role');
