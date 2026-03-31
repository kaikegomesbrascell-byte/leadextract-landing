# Requirements Document

## Introduction

Este documento especifica os requisitos para o sistema de empacotamento e distribuição do LeadExtract. O objetivo é transformar o sistema Python em um executável standalone (.exe), empacotá-lo em um arquivo .zip com arquivos necessários, e disponibilizar esse pacote para download após confirmação de pagamento do cliente.

O sistema automatizará o processo de build, empacotamento e distribuição, integrando-se com o fluxo de pagamento existente (SigiloPay) para liberar o download apenas para clientes que completaram o pagamento com sucesso.

## Glossary

- **Build_System**: Sistema automatizado que compila o código Python em executável usando PyInstaller
- **Package_Manager**: Componente que cria o arquivo .zip contendo executável e arquivos adicionais
- **Distribution_API**: Endpoint serverless que valida pagamento e fornece link de download
- **LeadExtract_Engine**: Sistema Python principal (automation_engine.py, config_advanced.py, data_exporter.py)
- **Executable**: Arquivo .exe standalone gerado pelo PyInstaller contendo Python e dependências
- **Download_Package**: Arquivo .zip final contendo executável, documentação e bônus
- **Payment_Verification**: Processo de validação de pagamento aprovado antes de liberar download
- **Supabase_Client**: Cliente configurado para acessar banco de dados de pagamentos e subscriptions
- **Download_Token**: Token temporário único gerado para autorizar download do pacote
- **Build_Manifest**: Arquivo JSON contendo metadados do build (versão, data, checksum)

## Requirements

### Requirement 1: Compilar Python em Executável

**User Story:** Como desenvolvedor, eu quero compilar o sistema Python em um executável standalone, para que clientes possam executar o software sem instalar Python ou dependências.

#### Acceptance Criteria

1. THE Build_System SHALL usar PyInstaller para compilar o código Python em executável
2. THE Executable SHALL incluir Python runtime, todas as bibliotecas e o navegador Playwright Chromium
3. THE Executable SHALL ser gerado no modo --onefile para criar um único arquivo .exe
4. THE Executable SHALL ser gerado no modo --windowed para ocultar o console durante execução
5. THE Build_System SHALL incluir o arquivo license.key no executável usando --add-data
6. THE Executable SHALL ter nome "LeadExtractor.exe"
7. WHEN o build é concluído, THE Build_System SHALL gerar o executável em dist/LeadExtractor.exe
8. THE Executable SHALL ter tamanho entre 150MB e 250MB incluindo todas as dependências
9. THE Build_System SHALL validar que todos os arquivos Python principais estão incluídos (automation_engine.py, gui_manager.py, data_exporter.py)

### Requirement 2: Gerar Build Manifest

**User Story:** Como desenvolvedor, eu quero gerar um manifest com metadados do build, para que eu possa rastrear versões e validar integridade dos pacotes.

#### Acceptance Criteria

1. WHEN o build é concluído, THE Build_System SHALL gerar arquivo BUILD_MANIFEST.json
2. THE Build_Manifest SHALL incluir campo version com número de versão semântica (ex: "3.0.0")
3. THE Build_Manifest SHALL incluir campo build_date com timestamp ISO 8601 do build
4. THE Build_Manifest SHALL incluir campo checksum_sha256 com hash SHA-256 do executável
5. THE Build_Manifest SHALL incluir campo file_size com tamanho do executável em bytes
6. THE Build_Manifest SHALL incluir campo python_version com versão do Python usada no build
7. THE Build_Manifest SHALL incluir campo dependencies com lista de bibliotecas principais e versões
8. THE Build_Manifest SHALL ser salvo no mesmo diretório que o executável

### Requirement 3: Criar Pacote ZIP de Distribuição

**User Story:** Como desenvolvedor, eu quero empacotar o executável e arquivos adicionais em um .zip, para que clientes recebam um pacote completo pronto para uso.

#### Acceptance Criteria

1. THE Package_Manager SHALL criar arquivo .zip contendo o executável e arquivos adicionais
2. THE Download_Package SHALL incluir LeadExtractor.exe na raiz do arquivo
3. THE Download_Package SHALL incluir arquivo LEIA-ME.txt com instruções de uso em português
4. THE Download_Package SHALL incluir arquivo BUILD_MANIFEST.json com metadados do build
5. WHERE bônus estão disponíveis, THE Download_Package SHALL incluir arquivos PDF de bônus
6. THE Download_Package SHALL ter nome no formato "LeadExtractPro_v{version}_{timestamp}.zip"
7. THE Package_Manager SHALL usar compressão ZIP_DEFLATED com nível 9 (máxima compressão)
8. WHEN o empacotamento é concluído, THE Package_Manager SHALL salvar o .zip em dist/
9. THE Download_Package SHALL ter tamanho final entre 140MB e 230MB após compressão

### Requirement 4: Gerar Arquivo de Instruções

**User Story:** Como cliente, eu quero receber instruções claras de uso, para que eu possa começar a usar o software imediatamente após o download.

#### Acceptance Criteria

1. THE Package_Manager SHALL gerar arquivo LEIA-ME.txt em português brasileiro
2. THE LEIA-ME.txt SHALL incluir seção "Como Usar" com passo a passo de execução
3. THE LEIA-ME.txt SHALL incluir seção "Dados Extraídos" listando campos capturados
4. THE LEIA-ME.txt SHALL incluir seção "Solução de Problemas" com erros comuns e soluções
5. THE LEIA-ME.txt SHALL incluir informações sobre proteção anti-ban e intervalos humanos
6. THE LEIA-ME.txt SHALL incluir seção "Garantia de 7 Dias" com política de reembolso
7. THE LEIA-ME.txt SHALL incluir número de versão e data de build
8. THE LEIA-ME.txt SHALL usar formatação clara com emojis e seções bem definidas

### Requirement 5: Integrar com Fluxo de Pagamento

**User Story:** Como sistema, eu quero integrar o download com o fluxo de pagamento, para que apenas clientes com pagamento aprovado possam baixar o software.

#### Acceptance Criteria

1. WHEN um pagamento é aprovado via webhook SigiloPay, THE Distribution_API SHALL gerar Download_Token único
2. THE Download_Token SHALL ser UUID v4 válido e único por pagamento
3. THE Download_Token SHALL ser armazenado na tabela downloads com referência ao payment_id
4. THE Download_Token SHALL ter validade de 7 dias após geração
5. WHEN o webhook ativa uma subscription, THE Distribution_API SHALL criar registro de download autorizado
6. THE Distribution_API SHALL associar Download_Token ao customer_id do pagamento
7. THE Download_Token SHALL permitir apenas 3 downloads para evitar compartilhamento excessivo

### Requirement 6: Criar Endpoint de Download

**User Story:** Como cliente, eu quero baixar o software após pagamento aprovado, para que eu possa começar a usar imediatamente.

#### Acceptance Criteria

1. THE Distribution_API SHALL expor endpoint GET /api/download/:token
2. WHEN uma requisição é recebida, THE Distribution_API SHALL validar formato do token (UUID v4)
3. THE Distribution_API SHALL buscar registro de download pelo token no banco de dados
4. IF o token não existe, THEN THE Distribution_API SHALL retornar status 404 Not Found
5. IF o token está expirado (>7 dias), THEN THE Distribution_API SHALL retornar status 410 Gone
6. IF o limite de downloads foi atingido (>3), THEN THE Distribution_API SHALL retornar status 429 Too Many Requests
7. WHEN o token é válido, THE Distribution_API SHALL incrementar contador de downloads
8. WHEN o token é válido, THE Distribution_API SHALL retornar o arquivo .zip com headers apropriados
9. THE Distribution_API SHALL definir header Content-Type como application/zip
10. THE Distribution_API SHALL definir header Content-Disposition com nome do arquivo

### Requirement 7: Armazenar Pacote de Distribuição

**User Story:** Como sistema, eu quero armazenar o pacote .zip de forma acessível, para que o endpoint de download possa servir o arquivo rapidamente.

#### Acceptance Criteria

1. THE Package_Manager SHALL copiar o .zip final para diretório public/downloads/
2. THE Distribution_API SHALL servir arquivos do diretório public/downloads/
3. WHERE Vercel está configurado, THE Package_Manager SHALL fazer upload do .zip para Vercel Blob Storage
4. THE Distribution_API SHALL buscar arquivo do Vercel Blob Storage quando disponível
5. IF o arquivo não existe no storage, THEN THE Distribution_API SHALL retornar status 503 Service Unavailable
6. THE Distribution_API SHALL implementar cache de 24 horas para o arquivo .zip
7. THE Distribution_API SHALL registrar cada download em logs para auditoria

### Requirement 8: Criar Tabela de Downloads

**User Story:** Como desenvolvedor, eu quero rastrear downloads autorizados, para que eu possa controlar acesso e prevenir abuso.

#### Acceptance Criteria

1. THE Supabase_Client SHALL criar tabela downloads no banco de dados
2. THE downloads SHALL ter campo id como UUID primary key
3. THE downloads SHALL ter campo token como UUID unique not null
4. THE downloads SHALL ter campo payment_id como UUID referenciando payments(id)
5. THE downloads SHALL ter campo customer_id como UUID referenciando customers(id)
6. THE downloads SHALL ter campo download_count como INTEGER default 0
7. THE downloads SHALL ter campo max_downloads como INTEGER default 3
8. THE downloads SHALL ter campo expires_at como TIMESTAMP not null
9. THE downloads SHALL ter campo created_at como TIMESTAMP default NOW()
10. THE downloads SHALL ter campo last_downloaded_at como TIMESTAMP nullable
11. THE downloads SHALL ter índice único em token para busca rápida
12. THE downloads SHALL ter índice em payment_id para relacionamento

### Requirement 9: Gerar Link de Download na Thank You Page

**User Story:** Como cliente, eu quero receber o link de download imediatamente após pagamento, para que eu possa baixar o software sem esperar.

#### Acceptance Criteria

1. WHEN o webhook ativa uma subscription, THE Distribution_API SHALL gerar Download_Token
2. THE Distribution_API SHALL retornar o token no response do webhook para o frontend
3. THE Thank_You_Page SHALL receber o token via query parameter ou state
4. THE Thank_You_Page SHALL exibir botão "Baixar LeadExtractor" com link para /api/download/:token
5. THE Thank_You_Page SHALL exibir mensagem informando validade de 7 dias e limite de 3 downloads
6. THE Thank_You_Page SHALL exibir instruções de instalação e primeiros passos
7. WHERE o download falha, THE Thank_You_Page SHALL exibir mensagem de erro e link de suporte

### Requirement 10: Enviar Email com Link de Download

**User Story:** Como cliente, eu quero receber email com link de download, para que eu possa baixar o software posteriormente se necessário.

#### Acceptance Criteria

1. WHEN um Download_Token é gerado, THE Distribution_API SHALL enviar email ao customer
2. THE Email SHALL incluir link completo para /api/download/:token
3. THE Email SHALL incluir instruções de como descompactar e executar o software
4. THE Email SHALL incluir informações sobre validade (7 dias) e limite (3 downloads)
5. THE Email SHALL incluir link para página de suporte técnico
6. THE Email SHALL ter assunto "Seu LeadExtractor está pronto para download"
7. THE Email SHALL usar template HTML responsivo com branding do LeadExtract
8. IF o envio de email falha, THEN THE Distribution_API SHALL registrar erro mas não bloquear o webhook

### Requirement 11: Automatizar Build e Deploy

**User Story:** Como desenvolvedor, eu quero automatizar o processo de build e deploy, para que novas versões sejam distribuídas rapidamente.

#### Acceptance Criteria

1. THE Build_System SHALL ter script build.py que executa todo o processo automaticamente
2. WHEN build.py é executado, THE Build_System SHALL limpar diretórios dist/ e build/ anteriores
3. THE Build_System SHALL executar PyInstaller com configuração correta
4. THE Build_System SHALL gerar BUILD_MANIFEST.json após compilação
5. THE Build_System SHALL criar Download_Package com todos os arquivos
6. THE Build_System SHALL copiar .zip para public/downloads/
7. WHERE Vercel Blob Storage está configurado, THE Build_System SHALL fazer upload do .zip
8. THE Build_System SHALL exibir resumo do build (tamanho, checksum, localização)
9. IF qualquer etapa falha, THEN THE Build_System SHALL exibir erro claro e interromper processo

### Requirement 12: Validar Integridade do Executável

**User Story:** Como sistema de segurança, eu quero validar integridade do executável, para que clientes recebam arquivos não corrompidos.

#### Acceptance Criteria

1. WHEN o executável é gerado, THE Build_System SHALL calcular checksum SHA-256
2. THE Build_System SHALL armazenar checksum no BUILD_MANIFEST.json
3. WHEN o .zip é criado, THE Package_Manager SHALL calcular checksum do arquivo .zip
4. THE Package_Manager SHALL armazenar checksum do .zip no manifest
5. WHEN um download é solicitado, THE Distribution_API SHALL incluir header X-Checksum-SHA256
6. THE Distribution_API SHALL permitir que clientes validem integridade após download
7. THE Build_System SHALL falhar se o executável gerado tiver tamanho menor que 100MB (indicando erro)

### Requirement 13: Implementar Rate Limiting

**User Story:** Como sistema de segurança, eu quero limitar taxa de downloads, para que o sistema não seja abusado por bots ou scrapers.

#### Acceptance Criteria

1. THE Distribution_API SHALL limitar downloads a 3 requisições por token (total)
2. THE Distribution_API SHALL limitar downloads a 1 requisição por IP por minuto
3. IF o rate limit é excedido, THEN THE Distribution_API SHALL retornar status 429 Too Many Requests
4. THE Distribution_API SHALL incluir header Retry-After indicando quando tentar novamente
5. THE Distribution_API SHALL registrar tentativas de rate limit excedido para monitoramento
6. THE Distribution_API SHALL usar Redis ou Vercel KV para armazenar contadores de rate limit

### Requirement 14: Registrar Logs de Download

**User Story:** Como administrador, eu quero logs detalhados de downloads, para que eu possa monitorar uso e diagnosticar problemas.

#### Acceptance Criteria

1. WHEN um download é iniciado, THE Distribution_API SHALL registrar log com nível INFO
2. THE Log SHALL incluir token, customer_id, IP address e user agent
3. THE Log SHALL incluir timestamp de início e fim do download
4. THE Log SHALL incluir tamanho do arquivo transferido
5. WHEN um download falha, THE Distribution_API SHALL registrar log com nível ERROR
6. THE Log SHALL incluir motivo da falha (token inválido, expirado, limite excedido)
7. THE Distribution_API SHALL agregar logs para análise de métricas (total downloads, taxa de sucesso)

### Requirement 15: Criar Documentação de Build

**User Story:** Como desenvolvedor, eu quero documentação clara do processo de build, para que outros desenvolvedores possam gerar builds facilmente.

#### Acceptance Criteria

1. THE Build_System SHALL incluir arquivo BUILD_INSTRUCTIONS.md
2. THE BUILD_INSTRUCTIONS.md SHALL listar pré-requisitos (Python, PyInstaller, dependências)
3. THE BUILD_INSTRUCTIONS.md SHALL incluir passo a passo de como executar build.py
4. THE BUILD_INSTRUCTIONS.md SHALL explicar estrutura do BUILD_MANIFEST.json
5. THE BUILD_INSTRUCTIONS.md SHALL incluir seção de troubleshooting para erros comuns
6. THE BUILD_INSTRUCTIONS.md SHALL explicar como fazer upload para Vercel Blob Storage
7. THE BUILD_INSTRUCTIONS.md SHALL incluir exemplos de comandos e outputs esperados
