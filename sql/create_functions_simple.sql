-- =====================================================
-- FUNÇÕES AUXILIARES - EXECUTE SEPARADAMENTE
-- =====================================================
-- Execute este arquivo DEPOIS de criar as tabelas
-- Se der erro, não tem problema - as funções são opcionais
-- =====================================================

-- Função 1: Verificar se assinatura está ativa
-- Esta função pode ser chamada do código TypeScript
CREATE OR REPLACE FUNCTION is_subscription_active(p_user_id UUID)
RETURNS BOOLEAN AS '
DECLARE
  v_subscription RECORD;
BEGIN
  SELECT * INTO v_subscription
  FROM subscriptions
  WHERE user_id = p_user_id
    AND status = ''active''
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  IF v_subscription.expires_at IS NULL THEN
    RETURN TRUE;
  END IF;

  RETURN v_subscription.expires_at > NOW();
END;
' LANGUAGE plpgsql SECURITY DEFINER;

-- Função 2: Expirar assinaturas automaticamente
-- Esta função pode ser chamada por um cron job
CREATE OR REPLACE FUNCTION expire_subscriptions()
RETURNS INTEGER AS '
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE subscriptions
  SET status = ''expired''
  WHERE status = ''active''
    AND expires_at IS NOT NULL
    AND expires_at < NOW();
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
' LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TESTE DAS FUNÇÕES
-- =====================================================

-- Testar função de verificação (substitua o UUID)
-- SELECT is_subscription_active('seu-user-id-aqui');

-- Testar função de expiração
-- SELECT expire_subscriptions();

-- =====================================================
-- NOTA IMPORTANTE
-- =====================================================
-- Se estas funções não funcionarem, não tem problema!
-- A verificação de assinatura ativa pode ser feita
-- diretamente no código TypeScript usando:
-- subscriptionService.isSubscriptionActive(userId)
-- =====================================================
