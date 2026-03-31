# Implementation Plan: Executable Packaging and Distribution System

## Overview

Este plano implementa o sistema completo de empacotamento e distribuição do LeadExtract, transformando o código Python em executável standalone, empacotando-o em .zip, e disponibilizando para download através de API serverless integrada ao fluxo de pagamento SigiloPay.

A implementação será dividida em três componentes principais:
1. **Build System** (Python): Compilação, empacotamento e geração de manifests
2. **Distribution API** (TypeScript): Endpoints serverless para validação e download
3. **Database & Integration**: Tabelas, webhooks e email service

## Tasks

- [x] 1. Configurar estrutura do Build System
  - Criar diretório `build_system/` na raiz do projeto
  - Criar arquivo `build_system/build.py` com estrutura básica da classe BuildSystem
  - Criar arquivo `build_system/requirements.txt` com dependências (PyInstaller, vercel-blob)
  - Criar arquivo `build_system/config.py` para configurações (versão, paths, etc)
  - _Requirements: 11.1, 11.2_

- [x] 2. Implementar compilação do executável com PyInstaller
  - [x] 2.1 Implementar método `compile_executable()` no BuildSystem
    - Configurar PyInstaller com flags: --onefile, --windowed, --name=LeadExtractor
    - Adicionar --add-data para license.key
    - Adicionar hidden imports para playwright, pandas, openpyxl
    - Executar PyInstaller e capturar output
    - Validar que dist/LeadExtractor.exe foi criado
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.9_

  - [ ]* 2.2 Escrever testes unitários para compile_executable()
    - Testar que executável é criado em dist/
    - Testar que erro é lançado se compilação falhar
    - _Requirements: 1.7_

- [x] 3. Implementar validação de build
  - [x] 3.1 Implementar método `validate_build()` no BuildSystem
    - Verificar que arquivo .exe existe
    - Verificar tamanho do executável (deve estar entre 100MB e 250MB)
    - Lançar BuildError com código BUILD_SIZE_INVALID se tamanho inválido
    - _Requirements: 1.8, 12.7_

  - [ ]* 3.2 Escrever testes unitários para validate_build()
    - Testar validação com executável de tamanho válido
    - Testar erro com executável muito pequeno (<100MB)
    - _Requirements: 12.7_

- [x] 4. Implementar geração de BUILD_MANIFEST.json
  - [x] 4.1 Implementar método `generate_manifest()` no BuildSystem
    - Calcular checksum SHA-256 do executável
    - Obter tamanho do arquivo em bytes
    - Obter versão do Python atual
    - Coletar versões das dependências principais (playwright, pandas, openpyxl)
    - Criar estrutura JSON com todos os campos obrigatórios
    - Salvar BUILD_MANIFEST.json em dist/
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

  - [ ]* 4.2 Escrever property test para manifest structure
    - **Property 9: Manifest Structure Completeness**
    - **Validates: Requirements 2.2, 2.3, 2.4, 2.5, 2.6, 2.7**

  - [ ]* 4.3 Escrever property test para file size accuracy
    - **Property 10: Manifest File Size Accuracy**
    - **Validates: Requirements 2.5**


- [x] 5. Implementar geração do arquivo LEIA-ME.txt
  - [x] 5.1 Implementar método `generate_readme()` no PackageManager
    - Criar conteúdo em português brasileiro com seções: Como Usar, Dados Extraídos, Solução de Problemas
    - Incluir informações sobre proteção anti-ban e intervalos humanos
    - Incluir seção Garantia de 7 Dias
    - Incluir número de versão e data de build
    - Usar formatação clara com emojis
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_

  - [ ]* 5.2 Escrever testes unitários para generate_readme()
    - Testar que todas as seções obrigatórias estão presentes
    - Testar que versão e data são incluídas corretamente
    - _Requirements: 4.7_

- [x] 6. Implementar criação do pacote .zip de distribuição
  - [x] 6.1 Implementar classe PackageManager em build_system/package_manager.py
    - Criar método `get_package_name()` que gera nome no formato LeadExtractPro_v{version}_{timestamp}.zip
    - Criar método `create_package()` que cria arquivo .zip
    - Adicionar LeadExtractor.exe na raiz do .zip
    - Adicionar BUILD_MANIFEST.json na raiz
    - Adicionar LEIA-ME.txt na raiz
    - Adicionar arquivos PDF de bônus (se disponíveis) em subdiretório bonus/
    - Usar compressão ZIP_DEFLATED com nível 9
    - Salvar .zip em dist/
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9_

  - [ ]* 6.2 Escrever property test para package naming convention
    - **Property 11: Package Naming Convention**
    - **Validates: Requirements 3.6**

  - [ ]* 6.3 Escrever testes unitários para create_package()
    - Testar que .zip contém todos os arquivos obrigatórios
    - Testar que compressão é aplicada corretamente
    - _Requirements: 3.2, 3.3, 3.4, 3.7_

- [x] 7. Implementar cálculo e validação de checksums
  - [x] 7.1 Adicionar cálculo de checksum do .zip no PackageManager
    - Calcular SHA-256 do arquivo .zip após criação
    - Adicionar checksum ao manifest em package_info.zip_checksum
    - Atualizar BUILD_MANIFEST.json com informações do pacote
    - _Requirements: 12.1, 12.2, 12.3, 12.4_

  - [ ]* 7.2 Escrever property test para executable checksum integrity
    - **Property 12: Executable Checksum Integrity**
    - **Validates: Requirements 12.1, 12.2**

  - [x] 7.3 Escrever property test para package checksum integrity
    - **Property 13: Package Checksum Integrity**
    - **Validates: Requirements 12.3, 12.4**

- [ ] 8. Checkpoint - Validar Build System completo
  - Executar build.py manualmente e verificar que:
    - LeadExtractor.exe é gerado em dist/
    - BUILD_MANIFEST.json contém todos os campos
    - Pacote .zip é criado com nome correto
    - Todos os arquivos estão dentro do .zip
  - Ensure all tests pass, ask the user if questions arise.

- [-] 9. Criar tabela downloads no banco de dados
  - [x] 9.1 Criar migration SQL em sql/create_downloads_table.sql
    - Criar tabela downloads com todos os campos especificados
    - Adicionar constraints: valid_download_count, valid_max_downloads, expires_after_creation
    - Criar índices: idx_downloads_token, idx_downloads_payment_id, idx_downloads_customer_id, idx_downloads_expires_at
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9, 8.10, 8.11, 8.12_

  - [ ] 9.2 Executar migration no Supabase
    - Conectar ao Supabase e executar SQL
    - Verificar que tabela foi criada corretamente
    - _Requirements: 8.1_

- [ ] 10. Implementar geração de tokens de download no webhook
  - [ ] 10.1 Criar função generateDownloadToken() em api/utils/download-tokens.ts
    - Gerar UUID v4 usando crypto.randomUUID()
    - Calcular expires_at = now() + 7 dias
    - Inserir registro na tabela downloads com payment_id, customer_id, token, expires_at
    - Retornar token gerado
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.6_

  - [ ]* 10.2 Escrever property test para token generation uniqueness
    - **Property 1: Token Generation Uniqueness**
    - **Validates: Requirements 5.1, 5.2**

  - [ ]* 10.3 Escrever property test para token expiration calculation
    - **Property 2: Token Expiration Calculation**
    - **Validates: Requirements 5.4**

  - [ ]* 10.4 Escrever property test para token-payment association
    - **Property 3: Token-Payment Association**
    - **Validates: Requirements 5.3, 5.6**

- [ ] 11. Integrar geração de token no webhook SigiloPay
  - [ ] 11.1 Modificar api/webhooks/sigilopay.ts para gerar token após criar subscription
    - Importar generateDownloadToken()
    - Chamar generateDownloadToken() após subscription ser criada
    - Adicionar campo download_token no response do webhook
    - Implementar try-catch para não bloquear webhook se geração falhar
    - _Requirements: 5.5, 9.1, 9.2_

  - [ ]* 11.2 Escrever property test para webhook response token inclusion
    - **Property 14: Webhook Response Token Inclusion**
    - **Validates: Requirements 9.2**

  - [ ]* 11.3 Escrever testes unitários para webhook integration
    - Testar que token é gerado em pagamento aprovado
    - Testar que webhook continua se geração de token falhar
    - _Requirements: 9.2_

- [ ] 12. Implementar endpoint de download
  - [ ] 12.1 Criar api/download/[token].ts com handler GET
    - Extrair token do path parameter
    - Validar formato do token (UUID v4 regex)
    - Buscar registro na tabela downloads pelo token
    - Implementar validações: token existe, não expirado, limite não atingido
    - Retornar erros apropriados: 404, 410, 429
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [ ]* 12.2 Escrever property test para download token format validation
    - **Property 4: Download Token Format Validation**
    - **Validates: Requirements 6.2**

  - [ ]* 12.3 Escrever testes unitários para validações de token
    - Testar retorno 404 para token inexistente
    - Testar retorno 410 para token expirado
    - Testar retorno 429 para limite excedido
    - _Requirements: 6.4, 6.5, 6.6_

- [ ] 13. Implementar incremento de contador e servir arquivo
  - [ ] 13.1 Completar handler de download em api/download/[token].ts
    - Incrementar download_count na tabela downloads
    - Atualizar last_downloaded_at com timestamp atual
    - Buscar arquivo .zip do Vercel Blob Storage
    - Definir headers: Content-Type, Content-Disposition, X-Checksum-SHA256
    - Retornar arquivo como stream
    - _Requirements: 6.7, 6.8, 6.9, 6.10, 7.4_

  - [ ]* 13.2 Escrever property test para download counter increment
    - **Property 5: Download Counter Increment**
    - **Validates: Requirements 6.7**

  - [ ]* 13.3 Escrever property test para download limit enforcement
    - **Property 6: Download Limit Enforcement**
    - **Validates: Requirements 5.7, 6.6, 13.1**

  - [ ]* 13.4 Escrever property test para expired token rejection
    - **Property 7: Expired Token Rejection**
    - **Validates: Requirements 6.5**

  - [ ]* 13.5 Escrever property test para download response headers
    - **Property 8: Download Response Headers**
    - **Validates: Requirements 6.9, 6.10, 12.5**

- [ ] 14. Implementar upload para Vercel Blob Storage
  - [ ] 14.1 Adicionar método upload_to_storage() no BuildSystem
    - Instalar e configurar @vercel/blob SDK
    - Fazer upload do .zip para Blob Storage com retry (3 tentativas)
    - Retornar URL do arquivo no storage
    - Logar erro mas não falhar se upload falhar (fallback para public/downloads/)
    - _Requirements: 7.3, 11.6, 11.7_

  - [ ] 14.2 Copiar .zip para public/downloads/ como fallback
    - Criar diretório public/downloads/ se não existir
    - Copiar arquivo .zip para public/downloads/
    - _Requirements: 7.1, 7.2_

  - [ ]* 14.3 Escrever testes unitários para upload_to_storage()
    - Testar upload bem-sucedido
    - Testar retry em caso de falha
    - Testar que fallback funciona se upload falhar
    - _Requirements: 7.3_

- [ ] 15. Checkpoint - Validar fluxo de download básico
  - Criar token manualmente no banco de dados
  - Fazer upload de arquivo .zip de teste para Blob Storage
  - Testar endpoint /api/download/:token
  - Verificar que arquivo é baixado corretamente
  - Verificar que contador é incrementado
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 16. Implementar rate limiting por IP
  - [ ] 16.1 Criar middleware de rate limiting em api/middleware/rate-limiter.ts
    - Implementar checkIpLimit() usando Vercel KV ou cache em memória
    - Limitar a 1 requisição por IP por minuto
    - Retornar 429 com header Retry-After se limite excedido
    - _Requirements: 13.2, 13.3, 13.4_

  - [ ] 16.2 Integrar rate limiter no endpoint de download
    - Aplicar checkIpLimit() antes de processar download
    - Registrar tentativas de rate limit excedido
    - _Requirements: 13.5_

  - [ ]* 16.3 Escrever property test para IP rate limiting
    - **Property 16: IP Rate Limiting**
    - **Validates: Requirements 13.2, 13.4**

  - [ ]* 16.4 Escrever property test para rate limit logging
    - **Property 17: Rate Limit Logging**
    - **Validates: Requirements 13.5**

- [ ] 17. Implementar sistema de logs de download
  - [ ] 17.1 Criar função logDownload() em api/utils/download-logger.ts
    - Criar estrutura de log com campos: timestamp, level, event, token, customer_id, ip_address, user_agent
    - Implementar logs para eventos: download_started, download_completed, download_failed
    - Usar console.log estruturado (JSON) para integração com Vercel Logs
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 7.7_

  - [ ] 17.2 Integrar logging no endpoint de download
    - Logar download_started ao iniciar processamento
    - Logar download_completed ao finalizar com sucesso
    - Logar download_failed em caso de erro
    - Incluir file_size e duration_ms nos logs de sucesso
    - _Requirements: 14.3, 14.4_

  - [ ]* 17.3 Escrever property test para download success logging
    - **Property 18: Download Success Logging**
    - **Validates: Requirements 14.1, 14.2, 14.3, 14.4**

  - [ ]* 17.4 Escrever property test para download failure logging
    - **Property 19: Download Failure Logging**
    - **Validates: Requirements 14.5, 14.6**

  - [ ]* 17.5 Escrever property test para audit trail completeness
    - **Property 21: Audit Trail Completeness**
    - **Validates: Requirements 7.7, 14.1, 14.5**

- [ ] 18. Implementar serviço de email com link de download
  - [ ] 18.1 Criar template de email em api/templates/download-email.html
    - Criar template HTML responsivo com branding LeadExtract
    - Incluir link de download com token
    - Incluir instruções de uso (descompactar, executar)
    - Incluir informações sobre validade (7 dias) e limite (3 downloads)
    - Incluir link para suporte técnico
    - _Requirements: 10.2, 10.3, 10.4, 10.5, 10.7_

  - [ ] 18.2 Criar função sendDownloadEmail() em api/utils/email-service.ts
    - Configurar serviço de email (usar serviço existente do projeto)
    - Renderizar template com dados do cliente e token
    - Enviar email com assunto "Seu LeadExtractor está pronto para download"
    - Implementar try-catch para não bloquear webhook se email falhar
    - _Requirements: 10.1, 10.6, 10.8_

  - [ ]* 18.3 Escrever property test para email download link correctness
    - **Property 15: Email Download Link Correctness**
    - **Validates: Requirements 10.1, 10.2**

  - [ ]* 18.4 Escrever property test para email failure non-blocking
    - **Property 20: Email Failure Non-Blocking**
    - **Validates: Requirements 10.8**

- [ ] 19. Integrar envio de email no webhook
  - [ ] 19.1 Modificar api/webhooks/sigilopay.ts para enviar email após gerar token
    - Importar sendDownloadEmail()
    - Chamar sendDownloadEmail() com customer_email, token, customer_name
    - Usar try-catch para não bloquear webhook se email falhar
    - Logar erro se email falhar mas continuar processamento
    - _Requirements: 10.1, 10.8_

  - [ ]* 19.2 Escrever testes unitários para email integration
    - Testar que email é enviado após token ser gerado
    - Testar que webhook continua se envio de email falhar
    - _Requirements: 10.8_

- [ ] 20. Implementar script de build automatizado
  - [ ] 20.1 Criar método run() no BuildSystem que orquestra todo o processo
    - Limpar diretórios dist/ e build/
    - Executar compile_executable()
    - Executar validate_build()
    - Executar generate_manifest()
    - Executar create_distribution_package()
    - Executar upload_to_storage()
    - Copiar para public/downloads/
    - Exibir resumo do build (tamanho, checksum, localização)
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8_

  - [ ] 20.2 Adicionar tratamento de erros no run()
    - Capturar exceções em cada etapa
    - Exibir mensagem de erro clara com código de erro
    - Interromper processo se etapa crítica falhar
    - _Requirements: 11.9_

  - [ ]* 20.3 Escrever testes de integração para build completo
    - Testar que run() executa todas as etapas em ordem
    - Testar que processo é interrompido se etapa falhar
    - _Requirements: 11.1, 11.9_

- [ ] 21. Atualizar Thank You Page para exibir link de download
  - [ ] 21.1 Modificar Thank You Page para receber token via query parameter
    - Extrair download_token do state ou query params
    - Exibir botão "Baixar LeadExtractor" com link para /api/download/:token
    - Exibir mensagem sobre validade (7 dias) e limite (3 downloads)
    - Exibir instruções de instalação e primeiros passos
    - Exibir mensagem de erro e link de suporte se download falhar
    - _Requirements: 9.3, 9.4, 9.5, 9.6, 9.7_

  - [ ]* 21.2 Escrever testes E2E para Thank You Page
    - Testar que link de download é exibido corretamente
    - Testar que mensagens de validade e limite são exibidas
    - _Requirements: 9.4, 9.5_

- [ ] 22. Criar documentação de build
  - [ ] 22.1 Criar arquivo BUILD_INSTRUCTIONS.md na raiz do projeto
    - Listar pré-requisitos (Python 3.11+, PyInstaller, dependências)
    - Incluir passo a passo de como executar build.py
    - Explicar estrutura do BUILD_MANIFEST.json
    - Incluir seção de troubleshooting para erros comuns
    - Explicar como fazer upload para Vercel Blob Storage
    - Incluir exemplos de comandos e outputs esperados
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7_

- [ ] 23. Checkpoint final - Teste end-to-end completo
  - Executar build.py e gerar novo pacote
  - Fazer upload para Vercel Blob Storage
  - Simular pagamento aprovado via webhook
  - Verificar que token é gerado e email é enviado
  - Acessar Thank You Page e verificar link de download
  - Fazer download do arquivo via /api/download/:token
  - Verificar que arquivo é baixado corretamente
  - Verificar que contador é incrementado
  - Verificar logs de download
  - Testar limite de 3 downloads
  - Testar expiração de token após 7 dias (simular)
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 24. Implementar tratamento de erros e fallbacks
  - [ ] 24.1 Adicionar fallback para Blob Storage indisponível
    - Se Blob Storage falhar, servir arquivo de public/downloads/
    - Logar warning quando fallback é usado
    - _Requirements: 7.2_

  - [ ] 24.2 Adicionar tratamento para arquivo não encontrado
    - Retornar 503 Service Unavailable se arquivo não existe em nenhum storage
    - Incluir mensagem clara para o usuário
    - _Requirements: 6.5_

  - [ ]* 24.3 Escrever testes unitários para fallbacks
    - Testar que fallback para filesystem funciona
    - Testar retorno 503 quando arquivo não existe
    - _Requirements: 7.2_

## Notes

- Tasks marcadas com `*` são opcionais e podem ser puladas para MVP mais rápido
- Cada task referencia requisitos específicos para rastreabilidade
- Checkpoints garantem validação incremental do sistema
- Property tests validam propriedades universais de correção
- Unit tests validam exemplos específicos e casos extremos
- Build System usa Python, Distribution API usa TypeScript
- Sistema integra-se com infraestrutura existente (Supabase, Vercel, SigiloPay)
