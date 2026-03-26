-- Migration: Create notification_queue and access_logs tables
-- Requirements: 10.2, 10.4
-- Description: Creates tables for email notifications and access logging

-- Tabela de fila de notificações por email
CREATE TABLE notification_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Tipo e conteúdo
  type TEXT NOT NULL CHECK (
    type IN ('welcome', 'payment_confirmed', 'expiration_warning', 'expired', 'password_reset')
  ),
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  
  -- Status de envio
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'sent', 'failed')
  ),
  attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para notification_queue
CREATE INDEX idx_notification_queue_status ON notification_queue(status);
CREATE INDEX idx_notification_queue_user_id ON notification_queue(user_id);
CREATE INDEX idx_notification_queue_created_at ON notification_queue(created_at);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_notification_queue_updated_at 
  BEFORE UPDATE ON notification_queue 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS para notification_queue
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;

-- Política RLS: usuários podem ver suas próprias notificações
CREATE POLICY "Users can view own notifications"
  ON notification_queue FOR SELECT
  USING (auth.uid() = user_id);

-- Política RLS: service role pode gerenciar todas as notificações
CREATE POLICY "Service role can manage all notifications"
  ON notification_queue FOR ALL
  USING (auth.role() = 'service_role');

-- Tabela de logs de acesso
CREATE TABLE access_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Dados do acesso
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  
  -- Resultado
  success BOOLEAN NOT NULL,
  status_code INTEGER,
  error_message TEXT,
  
  -- Verificação de pagamento
  payment_status_checked TEXT,
  payment_status_result TEXT,
  
  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para access_logs
CREATE INDEX idx_access_logs_user_id ON access_logs(user_id);
CREATE INDEX idx_access_logs_created_at ON access_logs(created_at);
CREATE INDEX idx_access_logs_success ON access_logs(success);
CREATE INDEX idx_access_logs_endpoint ON access_logs(endpoint);

-- Habilitar RLS para access_logs
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;

-- Política RLS: usuários podem ver seus próprios logs
CREATE POLICY "Users can view own access logs"
  ON access_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Política RLS: service role pode gerenciar todos os logs
CREATE POLICY "Service role can manage all access logs"
  ON access_logs FOR ALL
  USING (auth.role() = 'service_role');
