-- Migration: Extend payments table for subscription integration
-- Requirements: 6.2, 10.2
-- Description: Adds columns to payments table to link with subscriptions and users

-- Adicionar colunas à tabela payments para integração com subscriptions
ALTER TABLE payments ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES subscriptions(id);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS plan_id TEXT CHECK (plan_id IN ('start', 'sovereign'));
ALTER TABLE payments ADD COLUMN IF NOT EXISTS webhook_received_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS webhook_payload JSONB;

-- Criar índices para as novas colunas
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_subscription_id ON payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payments_plan_id ON payments(plan_id);
