# Requirements Document

## Introduction

Este documento especifica os requisitos para implementação do sistema de webhook do SigiloPay no LeadExtract. O objetivo é automatizar a ativação de assinaturas após confirmação de pagamento PIX, substituindo o comportamento atual onde assinaturas são ativadas imediatamente ao gerar o QR Code PIX.

O sistema receberá notificações do SigiloPay quando pagamentos forem confirmados, validará a autenticidade dessas notificações usando assinatura HMAC, atualizará o status das assinaturas no banco de dados e registrará os pagamentos para auditoria.

## Glossary

- **Webhook_Handler**: Endpoint serverless que recebe notificações HTTP POST do SigiloPay
- **SigiloPay**: Gateway de pagamento que processa transações PIX e envia notificações de status
- **Subscription**: Registro na tabela subscriptions do Supabase que representa o plano do usuário
- **Payment**: Registro na tabela payments do Supabase que representa uma transação financeira
- **HMAC_Signature**: Hash criptográfico usado para validar autenticidade das notificações do webhook
- **Transaction_ID**: Identificador único da transação no SigiloPay (campo transactionId)
- **Supabase_Client**: Cliente configurado com service_role_key para operações administrativas no banco
- **Checkout_Flow**: Processo de criação de pagamento PIX no frontend

## Requirements

### Requirement 1: Modificar Fluxo de Checkout

**User Story:** Como desenvolvedor, eu quero modificar o fluxo de checkout para criar assinaturas com status 'pending', para que elas sejam ativadas apenas após confirmação de pagamento.

#### Acceptance Criteria

1. WHEN o Checkout_Flow cria uma nova assinatura, THE Subscription SHALL ter status 'pending'
2. WHEN o Checkout_Flow cria um pagamento PIX, THE Payment SHALL incluir o Transaction_ID retornado pelo SigiloPay
3. THE Checkout_Flow SHALL armazenar o user_id associado ao Transaction_ID para posterior ativação
4. WHEN o pagamento PIX é criado, THE Checkout_Flow SHALL retornar o QR Code e código PIX para o usuário
5. THE Subscription SHALL permanecer com status 'pending' até receber confirmação via webhook

### Requirement 2: Receber Notificações do Webhook

**User Story:** Como sistema, eu quero receber notificações HTTP do SigiloPay, para que eu possa processar atualizações de status de pagamento.

#### Acceptance Criteria

1. THE Webhook_Handler SHALL aceitar requisições HTTP POST na rota /api/webhook/sigilopay
2. WHEN uma requisição é recebida, THE Webhook_Handler SHALL extrair o payload JSON do corpo da requisição
3. THE Webhook_Handler SHALL aceitar os campos: event, transactionId, status, amount, customer, paidAt
4. WHEN o método HTTP não é POST, THE Webhook_Handler SHALL retornar status 405 Method Not Allowed
5. THE Webhook_Handler SHALL configurar CORS para aceitar requisições do domínio do SigiloPay
6. WHEN o payload está malformado ou incompleto, THE Webhook_Handler SHALL retornar status 400 Bad Request

### Requirement 3: Validar Assinatura HMAC

**User Story:** Como sistema de segurança, eu quero validar a assinatura HMAC das notificações, para que apenas requisições autênticas do SigiloPay sejam processadas.

#### Acceptance Criteria

1. WHEN uma notificação é recebida, THE Webhook_Handler SHALL extrair a assinatura do header x-sigilopay-signature
2. THE Webhook_Handler SHALL calcular o HMAC-SHA256 do payload usando a secret_key do SigiloPay
3. THE Webhook_Handler SHALL comparar a assinatura calculada com a assinatura recebida usando comparação segura
4. IF as assinaturas não correspondem, THEN THE Webhook_Handler SHALL retornar status 401 Unauthorized e registrar tentativa suspeita
5. IF o header x-sigilopay-signature está ausente, THEN THE Webhook_Handler SHALL retornar status 401 Unauthorized
6. THE Webhook_Handler SHALL usar a mesma secret_key configurada no arquivo .env (SIGILOPAY_SECRET_KEY)

### Requirement 4: Processar Evento de Pagamento Aprovado

**User Story:** Como sistema de assinaturas, eu quero processar eventos de pagamento aprovado, para que eu possa ativar assinaturas pendentes automaticamente.

#### Acceptance Criteria

1. WHEN o evento é "payment.approved", THE Webhook_Handler SHALL buscar o Payment pelo Transaction_ID
2. IF o Payment não existe, THEN THE Webhook_Handler SHALL retornar status 404 Not Found e registrar erro
3. WHEN o Payment é encontrado, THE Webhook_Handler SHALL atualizar o status do Payment para 'approved'
4. THE Webhook_Handler SHALL registrar o timestamp paidAt no Payment
5. WHEN o Payment é atualizado, THE Webhook_Handler SHALL buscar a Subscription associada ao customer_id
6. IF a Subscription tem status 'pending', THEN THE Webhook_Handler SHALL atualizar status para 'active'
7. WHEN a Subscription é ativada, THE Webhook_Handler SHALL definir started_at como NOW()
8. WHERE o plano é 'premium', THE Subscription SHALL ter expires_at como NULL (vitalício)
9. WHERE o plano é 'standard', THE Subscription SHALL ter expires_at como NULL (vitalício)
10. THE Webhook_Handler SHALL retornar status 200 OK com mensagem de sucesso

### Requirement 5: Processar Outros Eventos de Pagamento

**User Story:** Como sistema de auditoria, eu quero processar eventos de pagamento rejeitado e expirado, para que eu possa manter registros precisos de todas as transações.

#### Acceptance Criteria

1. WHEN o evento é "payment.rejected", THE Webhook_Handler SHALL atualizar o Payment status para 'failed'
2. WHEN o evento é "payment.expired", THE Webhook_Handler SHALL atualizar o Payment status para 'cancelled'
3. WHEN o evento é "payment.pending", THE Webhook_Handler SHALL manter o Payment status como 'pending'
4. WHEN eventos de falha são processados, THE Subscription SHALL permanecer com status 'pending'
5. THE Webhook_Handler SHALL registrar todos os eventos recebidos para auditoria
6. THE Webhook_Handler SHALL retornar status 200 OK para todos os eventos reconhecidos

### Requirement 6: Garantir Idempotência

**User Story:** Como sistema resiliente, eu quero garantir que notificações duplicadas não causem efeitos colaterais, para que o sistema seja robusto contra reenvios do webhook.

#### Acceptance Criteria

1. WHEN uma notificação é processada, THE Webhook_Handler SHALL verificar se o Payment já tem status 'approved'
2. IF o Payment já está aprovado, THEN THE Webhook_Handler SHALL retornar status 200 OK sem modificar dados
3. THE Webhook_Handler SHALL usar transações do banco de dados para garantir atomicidade
4. WHEN múltiplas notificações idênticas são recebidas, THE Subscription SHALL ser ativada apenas uma vez
5. THE Webhook_Handler SHALL registrar tentativas de reprocessamento para monitoramento

### Requirement 7: Registrar Logs e Auditoria

**User Story:** Como administrador do sistema, eu quero ter logs detalhados de todas as operações do webhook, para que eu possa diagnosticar problemas e auditar transações.

#### Acceptance Criteria

1. WHEN uma notificação é recebida, THE Webhook_Handler SHALL registrar o payload completo em log
2. WHEN a validação HMAC falha, THE Webhook_Handler SHALL registrar o IP de origem e timestamp
3. WHEN uma Subscription é ativada, THE Webhook_Handler SHALL registrar user_id, plan e timestamp
4. WHEN erros ocorrem, THE Webhook_Handler SHALL registrar stack trace completo e contexto
5. THE Webhook_Handler SHALL incluir Transaction_ID em todas as mensagens de log para rastreabilidade
6. THE Webhook_Handler SHALL usar níveis de log apropriados: INFO para sucesso, WARN para validação falha, ERROR para exceções

### Requirement 8: Tratar Erros e Casos Excepcionais

**User Story:** Como sistema robusto, eu quero tratar erros graciosamente, para que falhas temporárias não causem perda de dados ou inconsistências.

#### Acceptance Criteria

1. WHEN o banco de dados está indisponível, THE Webhook_Handler SHALL retornar status 503 Service Unavailable
2. WHEN ocorre timeout na conexão com Supabase, THE Webhook_Handler SHALL retornar status 504 Gateway Timeout
3. IF o Transaction_ID não corresponde a nenhum Payment, THEN THE Webhook_Handler SHALL retornar status 404 Not Found
4. WHEN exceções não tratadas ocorrem, THE Webhook_Handler SHALL retornar status 500 Internal Server Error
5. THE Webhook_Handler SHALL incluir mensagens de erro descritivas no response body para debugging
6. WHEN o SigiloPay reenvia notificações após erro 5xx, THE Webhook_Handler SHALL processar corretamente na próxima tentativa

### Requirement 9: Configurar Variáveis de Ambiente

**User Story:** Como desenvolvedor, eu quero configurar o webhook usando variáveis de ambiente, para que credenciais sensíveis não sejam expostas no código.

#### Acceptance Criteria

1. THE Webhook_Handler SHALL ler SIGILOPAY_SECRET_KEY do arquivo .env para validação HMAC
2. THE Webhook_Handler SHALL ler SUPABASE_SERVICE_ROLE_KEY do arquivo .env para operações administrativas
3. THE Webhook_Handler SHALL ler VITE_SUPABASE_URL do arquivo .env para conexão com banco
4. WHERE SIGILOPAY_WEBHOOK_SECRET está definido, THE Webhook_Handler SHALL usar esse valor para HMAC ao invés de SIGILOPAY_SECRET_KEY
5. IF variáveis obrigatórias estão ausentes, THEN THE Webhook_Handler SHALL falhar na inicialização com erro descritivo
6. THE Webhook_Handler SHALL validar formato das variáveis de ambiente na inicialização

### Requirement 10: Integrar com Vercel Serverless Functions

**User Story:** Como desenvolvedor, eu quero deployar o webhook como Vercel Serverless Function, para que o sistema seja escalável e tenha baixa latência.

#### Acceptance Criteria

1. THE Webhook_Handler SHALL ser implementado como módulo Node.js exportando função handler padrão
2. THE Webhook_Handler SHALL estar localizado em /api/webhook-sigilopay.js
3. THE Webhook_Handler SHALL ter timeout configurado para 10 segundos
4. THE Webhook_Handler SHALL usar runtime nodejs20.x ou superior
5. THE Webhook_Handler SHALL ser acessível via URL https://dominio.com/api/webhook-sigilopay
6. THE Webhook_Handler SHALL funcionar corretamente no ambiente serverless sem estado persistente

### Requirement 11: Adicionar Tabela de Relacionamento Payment-Subscription

**User Story:** Como desenvolvedor, eu quero relacionar pagamentos com assinaturas, para que o webhook possa localizar a assinatura correta a partir do Transaction_ID.

#### Acceptance Criteria

1. THE Payment SHALL incluir campo subscription_id como UUID referenciando subscriptions(id)
2. WHEN o Checkout_Flow cria um Payment, THE Payment SHALL armazenar o subscription_id associado
3. THE Webhook_Handler SHALL usar subscription_id do Payment para localizar a Subscription a ativar
4. THE Payment SHALL permitir subscription_id NULL para pagamentos não relacionados a assinaturas
5. THE Payment SHALL ter índice no campo subscription_id para performance
6. WHEN uma Subscription é deletada, THE Payment subscription_id SHALL ser definido como NULL (ON DELETE SET NULL)

### Requirement 12: Documentar Configuração do Webhook no SigiloPay

**User Story:** Como administrador, eu quero documentação clara de como configurar o webhook no painel do SigiloPay, para que a integração seja ativada corretamente.

#### Acceptance Criteria

1. THE Documentation SHALL incluir URL completa do webhook para configuração no SigiloPay
2. THE Documentation SHALL listar eventos que devem ser habilitados: payment.approved, payment.rejected, payment.expired
3. THE Documentation SHALL explicar como obter e configurar a secret_key para HMAC
4. THE Documentation SHALL incluir exemplos de payloads de webhook para cada tipo de evento
5. THE Documentation SHALL descrever como testar o webhook usando ferramentas como curl ou Postman
6. THE Documentation SHALL incluir troubleshooting para problemas comuns de configuração
