# Implementation Plan: SigiloPay Webhook Integration

## Overview

Este plano implementa o sistema de webhook do SigiloPay para automatizar a ativação de assinaturas após confirmação de pagamento PIX. A implementação inclui modificações no banco de dados, alterações no fluxo de checkout, criação do webhook handler com validação HMAC, processamento de eventos, sistema de logs e testes.

## Tasks

- [ ] 1. Criar e modificar schema do banco de dados
  - [ ] 1.1 Criar tabela customers
    - Criar arquivo SQL com definição da tabela customers
    - Incluir campos: id, name, email, document, phone, created_at, updated_at
    - Adicionar constraint UNIQUE em email
    - Criar índices em email e document
    - _Requirements: 11.2_
  
  - [ ] 1.2 Criar tabela payments
    - Criar arquivo SQL com definição da tabela payments
    - Incluir campos: id, customer_id, subscription_id, amount, method, status, sigilopay_id, pix_qr_code, pix_key, paid_at, created_at, updated_at
    - Adicionar foreign keys com ON DELETE SET NULL
    - Adicionar constraint UNIQUE em sigilopay_id
    - Criar índices em customer_id, subscription_id, sigilopay_id, status
    - _Requirements: 1.2, 11.1, 11.6_
  
  - [ ] 1.3 Modificar tabela subscriptions
    - Criar arquivo SQL para alterar constraint de status incluindo 'pending'
    - Alterar coluna started_at para permitir NULL
    - _Requirements: 1.1, 1.5_
  
  - [ ]* 1.4 Executar migrations no Supabase
    - Executar scripts SQL no Supabase (staging e production)
    - Verificar integridade referencial
    - _Requirements: 11.6_

- [ ] 2. Modificar fluxo de checkout
  - [ ] 2.1 Atualizar API de criação de pagamento PIX
    - Modificar /api/payment-pix.js para criar subscription com status 'pending'
    - Criar registro em customers (se não existir)
    - Criar registro em payments com subscription_id e status 'pending'
    - Armazenar transaction_id retornado pelo SigiloPay no campo sigilopay_id
    - Retornar QR Code e código PIX para o frontend
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 11.2_
  
  - [ ]* 2.2 Escrever testes unitários para fluxo de checkout
    - Testar criação de subscription com status 'pending'
    - Testar criação de payment com subscription_id
    - Testar armazenamento de transaction_id
    - Testar retorno de QR Code e código PIX
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  
  - [ ]* 2.3 Escrever property test para checkout
    - **Property 1: Subscriptions criadas no checkout têm status pending**
    - **Validates: Requirements 1.1**

- [ ] 3. Implementar validação HMAC
  - [ ] 3.1 Criar módulo de validação HMAC
    - Criar função validateHMAC que recebe signature, payload e secretKey
    - Calcular HMAC-SHA256 do payload usando crypto.createHmac
    - Comparar assinaturas usando crypto.timingSafeEqual
    - Retornar boolean indicando se assinatura é válida
    - _Requirements: 3.2, 3.3_
  
  - [ ]* 3.2 Escrever testes unitários para validação HMAC
    - Testar validação de assinaturas corretas
    - Testar rejeição de assinaturas incorretas
    - Testar uso de comparação timing-safe
    - _Requirements: 3.2, 3.3_
  
  - [ ]* 3.3 Escrever property test para validação HMAC
    - **Property 8: Validação HMAC rejeita assinaturas inválidas**
    - **Validates: Requirements 3.2, 3.3, 3.4**

- [ ] 4. Implementar webhook handler principal
  - [ ] 4.1 Criar estrutura base do webhook handler
    - Criar arquivo /api/webhook-sigilopay.js
    - Exportar função handler async (req, res)
    - Validar método HTTP (apenas POST, retornar 405 para outros)
    - Extrair payload JSON do corpo da requisição
    - Configurar CORS para aceitar requisições do SigiloPay
    - _Requirements: 2.1, 2.2, 2.4, 2.5_
  
  - [ ] 4.2 Adicionar validação de payload
    - Validar presença de campos obrigatórios: event, transactionId, status, amount, customer
    - Retornar 400 Bad Request se payload malformado ou campos ausentes
    - _Requirements: 2.3, 2.6_
  
  - [ ] 4.3 Integrar validação HMAC no handler
    - Extrair assinatura do header x-sigilopay-signature
    - Chamar validateHMAC com signature, payload e SIGILOPAY_SECRET_KEY
    - Retornar 401 Unauthorized se assinatura inválida ou header ausente
    - Registrar tentativas suspeitas com IP e timestamp
    - _Requirements: 3.1, 3.4, 3.5, 3.6_
  
  - [ ] 4.4 Configurar cliente Supabase com service role
    - Criar cliente Supabase usando SUPABASE_SERVICE_ROLE_KEY
    - Configurar URL usando VITE_SUPABASE_URL
    - Validar variáveis de ambiente na inicialização
    - _Requirements: 9.1, 9.2, 9.3, 9.5, 9.6_
  
  - [ ]* 4.5 Escrever testes unitários para webhook handler base
    - Testar aceitação de requisições POST válidas
    - Testar rejeição de métodos não-POST com 405
    - Testar validação de campos obrigatórios
    - Testar retorno 400 para payload malformado
    - Testar retorno 401 para assinatura HMAC inválida
    - Testar retorno 401 quando header ausente
    - _Requirements: 2.1, 2.4, 2.6, 3.4, 3.5_
  
  - [ ]* 4.6 Escrever property tests para webhook handler
    - **Property 6: Webhook aceita apenas método POST**
    - **Validates: Requirements 2.4**
    - **Property 7: Webhook valida schema do payload**
    - **Validates: Requirements 2.3, 2.6**

- [ ] 5. Checkpoint - Validar estrutura base do webhook
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implementar processamento de evento payment.approved
  - [ ] 6.1 Criar handler para payment.approved
    - Buscar payment pelo sigilopay_id = transactionId
    - Retornar 404 Not Found se payment não existe
    - Verificar se payment já está 'approved' (idempotência)
    - Retornar 200 OK sem modificar dados se já aprovado
    - Atualizar payment.status para 'approved' e payment.paid_at
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 6.1, 6.2_
  
  - [ ] 6.2 Implementar ativação de subscription
    - Buscar subscription pelo payment.subscription_id
    - Verificar se subscription.status = 'pending'
    - Atualizar subscription.status para 'active'
    - Definir subscription.started_at como NOW()
    - Manter subscription.expires_at como NULL (planos vitalícios)
    - Retornar 200 OK com mensagem de sucesso
    - _Requirements: 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 11.3_
  
  - [ ]* 6.3 Escrever testes unitários para payment.approved
    - Testar busca de payment por transaction ID
    - Testar atualização de payment status para 'approved'
    - Testar registro de paid_at timestamp
    - Testar busca de subscription por subscription_id
    - Testar ativação de subscription se status = 'pending'
    - Testar definição de started_at ao ativar
    - Testar expires_at NULL para planos vitalícios
    - Testar idempotência (não modificar subscription já ativa)
    - _Requirements: 4.1, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 6.1, 6.2_
  
  - [ ]* 6.4 Escrever property tests para payment.approved
    - **Property 9: Payment.approved atualiza payment e subscription**
    - **Validates: Requirements 4.1, 4.3, 4.4, 4.5, 4.6, 4.7**
    - **Property 15: Idempotência de payment.approved**
    - **Validates: Requirements 6.1, 6.2**
    - **Property 16: Múltiplas notificações ativam subscription apenas uma vez**
    - **Validates: Requirements 6.4**

- [ ] 7. Implementar processamento de outros eventos
  - [ ] 7.1 Criar handler para payment.rejected
    - Buscar payment pelo sigilopay_id = transactionId
    - Atualizar payment.status para 'failed'
    - Manter subscription.status como 'pending'
    - Retornar 200 OK
    - _Requirements: 5.1, 5.4, 5.6_
  
  - [ ] 7.2 Criar handler para payment.expired
    - Buscar payment pelo sigilopay_id = transactionId
    - Atualizar payment.status para 'cancelled'
    - Manter subscription.status como 'pending'
    - Retornar 200 OK
    - _Requirements: 5.2, 5.4, 5.6_
  
  - [ ] 7.3 Criar handler para payment.pending
    - Buscar payment pelo sigilopay_id = transactionId
    - Manter payment.status como 'pending' sem alterações
    - Retornar 200 OK
    - _Requirements: 5.3, 5.6_
  
  - [ ] 7.4 Implementar roteamento de eventos
    - Criar função processEvent que roteia eventos para handlers específicos
    - Usar switch/case para event type
    - Lançar erro para eventos desconhecidos
    - _Requirements: 5.5_
  
  - [ ]* 7.5 Escrever testes unitários para outros eventos
    - Testar roteamento correto de cada tipo de evento
    - Testar atualização de status para payment.rejected
    - Testar atualização de status para payment.expired
    - Testar manutenção de status para payment.pending
    - Testar erro para eventos desconhecidos
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.6_
  
  - [ ]* 7.6 Escrever property tests para outros eventos
    - **Property 12: Payment.rejected atualiza status para failed**
    - **Validates: Requirements 5.1, 5.4**
    - **Property 13: Payment.expired atualiza status para cancelled**
    - **Validates: Requirements 5.2, 5.4**
    - **Property 14: Payment.pending mantém status pending**
    - **Validates: Requirements 5.3**

- [ ] 8. Implementar sistema de logs estruturados
  - [ ] 8.1 Criar módulo de logging
    - Criar objeto logger com métodos info, warn, error
    - Formatar logs como JSON estruturado
    - Incluir timestamp, level, message e contexto
    - Incluir stack trace para erros
    - _Requirements: 7.1, 7.4, 7.6_
  
  - [ ] 8.2 Adicionar logs em pontos críticos
    - Registrar payload completo ao receber notificação
    - Registrar falhas de validação HMAC com IP e timestamp
    - Registrar ativação de subscription com user_id, plan e timestamp
    - Incluir transactionId em todas as mensagens de log
    - _Requirements: 7.1, 7.2, 7.3, 7.5_
  
  - [ ]* 8.3 Escrever testes para sistema de logs
    - Testar formatação JSON dos logs
    - Testar inclusão de contexto relevante
    - Testar níveis de log apropriados
    - _Requirements: 7.6_

- [ ] 9. Implementar tratamento de erros
  - [ ] 9.1 Adicionar tratamento de erros de banco de dados
    - Capturar erros de conexão (ECONNREFUSED, ETIMEDOUT)
    - Retornar 503 Service Unavailable para banco indisponível
    - Retornar 504 Gateway Timeout para timeouts
    - _Requirements: 8.1, 8.2_
  
  - [ ] 9.2 Adicionar tratamento de erros de negócio
    - Retornar 404 Not Found quando transaction ID não existe
    - Incluir mensagens de erro descritivas no response body
    - _Requirements: 8.3, 8.5_
  
  - [ ] 9.3 Adicionar handler global de exceções
    - Capturar exceções não tratadas
    - Retornar 500 Internal Server Error
    - Registrar stack trace completo e contexto
    - _Requirements: 8.4, 8.5_
  
  - [ ]* 9.4 Escrever testes para tratamento de erros
    - Testar retorno 503 quando banco indisponível
    - Testar retorno 504 para timeouts
    - Testar retorno 404 quando transaction ID não existe
    - Testar retorno 500 para exceções não tratadas
    - Testar inclusão de mensagens descritivas
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [ ]* 9.5 Escrever property test para resiliência
    - **Property 18: Resiliência a reenvios após falha**
    - **Validates: Requirements 8.6**

- [ ] 10. Checkpoint - Validar processamento completo de eventos
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Configurar ambiente Vercel
  - [ ] 11.1 Configurar variáveis de ambiente no Vercel
    - Adicionar SIGILOPAY_SECRET_KEY no painel do Vercel
    - Adicionar SUPABASE_SERVICE_ROLE_KEY no painel do Vercel
    - Adicionar VITE_SUPABASE_URL no painel do Vercel
    - Verificar variáveis em staging e production
    - _Requirements: 9.1, 9.2, 9.3, 9.4_
  
  - [ ] 11.2 Configurar função serverless no vercel.json
    - Adicionar configuração para /api/webhook-sigilopay
    - Definir timeout de 10 segundos
    - Definir runtime nodejs20.x ou superior
    - _Requirements: 10.1, 10.2, 10.3, 10.4_
  
  - [ ]* 11.3 Testar deploy em staging
    - Fazer deploy em ambiente de staging
    - Testar URL do webhook
    - Verificar logs no Vercel
    - _Requirements: 10.5, 10.6_

- [ ] 12. Criar documentação
  - [ ] 12.1 Documentar configuração do webhook no SigiloPay
    - Incluir URL completa do webhook
    - Listar eventos a habilitar: payment.approved, payment.rejected, payment.expired
    - Explicar como obter e configurar secret_key
    - Incluir exemplos de payloads para cada evento
    - Incluir instruções de teste com curl/Postman
    - Adicionar seção de troubleshooting
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

- [ ] 13. Testes de integração end-to-end
  - [ ]* 13.1 Criar teste de fluxo completo
    - Criar usuário no Supabase Auth
    - Iniciar checkout com plano premium
    - Verificar subscription criada com status 'pending'
    - Simular webhook payment.approved
    - Verificar subscription ativada com status 'active'
    - Verificar payment atualizado para 'approved'
    - _Requirements: 1.1, 1.5, 4.6, 4.7, 4.10_
  
  - [ ]* 13.2 Criar teste de integridade referencial
    - Criar subscription e payment
    - Deletar subscription
    - Verificar payment.subscription_id = NULL
    - _Requirements: 11.6_
  
  - [ ]* 13.3 Criar testes de segurança HMAC
    - Enviar webhook com assinatura válida → aceito
    - Enviar webhook com assinatura inválida → rejeitado
    - Enviar webhook sem header de assinatura → rejeitado
    - Enviar webhook com secret key incorreta → rejeitado
    - _Requirements: 3.1, 3.4, 3.5_

- [ ] 14. Final checkpoint - Validação completa do sistema
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples, edge cases, and error conditions
- The implementation uses JavaScript/Node.js with Vercel Serverless Functions
- Database operations use Supabase with service_role_key for administrative access
- HMAC validation uses crypto module with timing-safe comparison
- All logs are structured JSON for easy parsing and monitoring
