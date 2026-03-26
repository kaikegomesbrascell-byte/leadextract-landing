# Requirements Document

## Introduction

Este documento define os requisitos para o core engine de scraping do LeadExtract, um sistema B2B de extração massiva de dados de empresas brasileiras. O sistema implementa um pipeline assíncrono de 4 módulos que realiza coleta stealth de dados públicos, enriquecimento via APIs governamentais brasileiras, e scoring inteligente de leads para vendas B2B high-ticket.

## Glossary

- **Scraping_Engine**: O sistema Python assíncrono que orquestra os 4 módulos de extração
- **Maps_Scraper**: Módulo 1 que extrai dados básicos de empresas de plataformas de mapas
- **Deep_Crawler**: Módulo 2 que acessa sites de empresas para extrair contatos e tecnologias
- **Enrichment_Module**: Módulo 3 que busca dados financeiros via APIs governamentais brasileiras
- **Scoring_Module**: Módulo 4 que calcula pontuação de qualidade de leads
- **Stealth_Mode**: Técnicas de evasão de detecção (playwright-stealth, delays humanos, user agents)
- **Search_Term**: Termo de busca fornecido pelo usuário (ex: "Energia Solar em São Paulo")
- **Lead_Record**: Registro de dados de uma empresa no DataFrame pandas
- **CNPJ**: Cadastro Nacional da Pessoa Jurídica, identificador único de empresas brasileiras
- **QSA**: Quadro de Sócios e Administradores, lista de sócios de uma empresa
- **ReceitaWS_API**: API pública brasileira para consulta de dados da Receita Federal
- **Lead_Score**: Pontuação de 0 a 10 que indica qualidade do lead para conversão
- **Marketing_Stack**: Conjunto de tecnologias de marketing detectadas no site (GTM, Facebook Pixel)
- **Contact_Data**: Dados de contato extraídos (emails, WhatsApp, redes sociais)
- **CSV_Output**: Arquivo CSV final com todos os leads enriquecidos
- **Exponential_Backoff**: Estratégia de retry com aumento exponencial de delay entre tentativas
- **Human_Behavior**: Simulação de comportamento humano (scroll gradual, delays aleatórios)
- **Regex_Pattern**: Expressão regular para extração de emails, telefones e WhatsApp
- **DataFrame**: Estrutura de dados pandas para manipulação tabular
- **Async_Pipeline**: Pipeline assíncrono usando asyncio e aiohttp

## Requirements

### Requirement 1: Scraper de Maps Stealth (Módulo 1)

**User Story:** Como usuário do LeadExtract, eu quero extrair dados básicos de empresas de plataformas de mapas, para que eu tenha uma lista inicial de prospects na minha região.

#### Acceptance Criteria

1. WHEN a Search_Term is provided, THE Maps_Scraper SHALL extract company name, website URL, public address, and public phone number
2. THE Maps_Scraper SHALL use Playwright with playwright-stealth plugin to bypass detection
3. THE Maps_Scraper SHALL simulate Human_Behavior by scrolling the page gradually with random delays between 1.5 and 3.5 seconds
4. THE Maps_Scraper SHALL set viewport size to 1920x1080 and use realistic user agent string
5. WHEN the page requires scrolling to load more results, THE Maps_Scraper SHALL scroll until no new results appear for 5 consecutive scroll attempts
6. THE Maps_Scraper SHALL store extracted data in a pandas DataFrame with columns: empresa, url_site, endereco, telefone_publico
7. IF a company does not have a website URL, THE Maps_Scraper SHALL store empty string in url_site column
8. THE Maps_Scraper SHALL handle network timeouts with 30 second timeout per page load
9. THE Maps_Scraper SHALL log extraction progress every 10 companies processed

### Requirement 2: Deep Crawler de Sites (Módulo 2)

**User Story:** Como usuário do LeadExtract, eu quero extrair contatos diretos e tecnologias de marketing dos sites das empresas, para que eu tenha informações de contato qualificadas e insights sobre maturidade digital.

#### Acceptance Criteria

1. WHEN a website URL is available in Lead_Record, THE Deep_Crawler SHALL access the URL using Playwright with stealth mode
2. THE Deep_Crawler SHALL extract social media links matching patterns: linkedin.com/company/, instagram.com/, facebook.com/
3. THE Deep_Crawler SHALL extract email addresses using Regex_Pattern: [a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}
4. THE Deep_Crawler SHALL prioritize emails containing keywords: contato, comercial, vendas, rh, atendimento
5. THE Deep_Crawler SHALL extract WhatsApp links matching patterns: wa.me/ OR href="tel:+55
6. THE Deep_Crawler SHALL detect Google Tag Manager by searching for gtm.js in page source
7. THE Deep_Crawler SHALL detect Facebook Pixel by searching for fbevents.js in page source
8. THE Deep_Crawler SHALL store extracted data in DataFrame columns: linkedin, instagram, emails, whatsapp, tem_gtm, tem_facebook_pixel
9. IF the website fails to load within 20 seconds, THE Deep_Crawler SHALL mark the Lead_Record with error flag and continue to next record
10. THE Deep_Crawler SHALL use exponential backoff with max 3 retries for failed requests
11. THE Deep_Crawler SHALL add random delay between 2 and 5 seconds between each website visit

### Requirement 3: Enriquecimento via ReceitaWS (Módulo 3)

**User Story:** Como usuário do LeadExtract, eu quero dados financeiros e societários das empresas, para que eu possa qualificar leads com base em saúde financeira e idade da empresa.

#### Acceptance Criteria

1. WHEN a company name is available, THE Enrichment_Module SHALL search for CNPJ using ReceitaWS_API search endpoint
2. WHEN a CNPJ is found, THE Enrichment_Module SHALL fetch company details including: data_abertura, capital_social, and QSA
3. THE Enrichment_Module SHALL calculate company age in years from data_abertura to current date
4. THE Enrichment_Module SHALL extract names of all partners from QSA array
5. THE Enrichment_Module SHALL store enrichment data in DataFrame columns: cnpj, data_abertura, idade_anos, capital_social, socios
6. IF the ReceitaWS_API returns rate limit error (HTTP 429), THE Enrichment_Module SHALL apply exponential backoff starting at 5 seconds with max 60 seconds
7. IF the company is not found in ReceitaWS_API, THE Enrichment_Module SHALL store empty values and continue processing
8. THE Enrichment_Module SHALL add random delay between 1 and 3 seconds between API calls to avoid rate limiting
9. THE Enrichment_Module SHALL handle API timeout with 15 second timeout per request
10. THE Enrichment_Module SHALL log API errors with company name and error message

### Requirement 4: Motor de Scoring de Leads (Módulo 4)

**User Story:** Como usuário do LeadExtract, eu quero uma pontuação automática de qualidade dos leads, para que eu priorize contatos com maior probabilidade de conversão.

#### Acceptance Criteria

1. THE Scoring_Module SHALL calculate Lead_Score from 0 to 10 based on weighted criteria
2. IF tem_gtm is False AND tem_facebook_pixel is False, THE Scoring_Module SHALL add 3 points to Lead_Score
3. IF idade_anos is less than 1, THE Scoring_Module SHALL add 3 points to Lead_Score
4. IF whatsapp is not empty OR emails contains at least one email, THE Scoring_Module SHALL add 4 points to Lead_Score
5. THE Scoring_Module SHALL store Lead_Score in DataFrame column: lead_score
6. THE Scoring_Module SHALL sort DataFrame by lead_score in descending order
7. THE Scoring_Module SHALL add column score_justificativa with text explanation of score calculation
8. IF Lead_Score is 10, THE score_justificativa SHALL contain "Lead Premium: Sem stack de marketing, empresa nova, contato direto disponível"
9. IF Lead_Score is between 7 and 9, THE score_justificativa SHALL contain "Lead Quente: Alta probabilidade de conversão"
10. IF Lead_Score is between 4 and 6, THE score_justificativa SHALL contain "Lead Morno: Necessita qualificação adicional"
11. IF Lead_Score is between 0 and 3, THE score_justificativa SHALL contain "Lead Frio: Baixa prioridade"

### Requirement 5: Orquestração Assíncrona do Pipeline

**User Story:** Como usuário do LeadExtract, eu quero que o pipeline execute de forma rápida e eficiente, para que eu receba resultados em tempo hábil mesmo com grandes volumes.

#### Acceptance Criteria

1. THE Scraping_Engine SHALL implement async main() function using asyncio
2. THE Scraping_Engine SHALL execute Maps_Scraper first and wait for completion before proceeding
3. WHEN Maps_Scraper completes, THE Scraping_Engine SHALL execute Deep_Crawler and Enrichment_Module concurrently using asyncio.gather()
4. WHEN Deep_Crawler and Enrichment_Module complete, THE Scraping_Engine SHALL execute Scoring_Module
5. THE Scraping_Engine SHALL use aiohttp.ClientSession with connection pooling for HTTP requests
6. THE Scraping_Engine SHALL limit concurrent requests to 5 simultaneous connections
7. THE Scraping_Engine SHALL display progress bar showing percentage of leads processed
8. THE Scraping_Engine SHALL log total execution time at completion
9. THE Scraping_Engine SHALL handle KeyboardInterrupt gracefully and save partial results

### Requirement 6: Tratamento de Erros e Resiliência

**User Story:** Como usuário do LeadExtract, eu quero que o sistema continue funcionando mesmo quando sites individuais falham, para que eu não perca todo o trabalho por causa de um erro isolado.

#### Acceptance Criteria

1. WHEN any module encounters an exception, THE Scraping_Engine SHALL log the error with traceback and continue processing next record
2. THE Scraping_Engine SHALL wrap all network operations in try/except blocks catching aiohttp.ClientError and asyncio.TimeoutError
3. THE Scraping_Engine SHALL wrap all parsing operations in try/except blocks catching AttributeError and IndexError
4. WHEN a Lead_Record fails in Deep_Crawler, THE Scraping_Engine SHALL mark it with erro_crawler flag and continue
5. WHEN a Lead_Record fails in Enrichment_Module, THE Scraping_Engine SHALL mark it with erro_enriquecimento flag and continue
6. THE Scraping_Engine SHALL generate error summary report at end showing count of errors by type
7. THE Scraping_Engine SHALL save partial results every 50 records processed to temporary CSV file
8. IF the Scraping_Engine crashes, THE Scraping_Engine SHALL allow resuming from last saved checkpoint

### Requirement 7: Extração de Emails com Regex Rigoroso

**User Story:** Como usuário do LeadExtract, eu quero emails válidos e relevantes, para que eu possa fazer contato direto com departamentos-chave.

#### Acceptance Criteria

1. THE Deep_Crawler SHALL use Regex_Pattern to extract all email addresses from page HTML and visible text
2. THE Deep_Crawler SHALL exclude generic emails matching patterns: noreply@, no-reply@, postmaster@, abuse@
3. THE Deep_Crawler SHALL prioritize emails containing keywords: contato, comercial, vendas, rh, atendimento, suporte
4. THE Deep_Crawler SHALL store up to 5 unique emails per Lead_Record separated by semicolon
5. THE Deep_Crawler SHALL validate email format by checking for @ symbol and valid domain extension
6. THE Deep_Crawler SHALL extract emails from mailto: links in addition to plain text
7. IF no emails are found, THE Deep_Crawler SHALL store empty string in emails column

### Requirement 8: Extração de WhatsApp com Múltiplos Padrões

**User Story:** Como usuário do LeadExtract, eu quero números de WhatsApp válidos, para que eu possa fazer contato direto via mensagem.

#### Acceptance Criteria

1. THE Deep_Crawler SHALL extract WhatsApp numbers from wa.me/ links
2. THE Deep_Crawler SHALL extract WhatsApp numbers from api.whatsapp.com/send?phone= links
3. THE Deep_Crawler SHALL extract phone numbers from href="tel: links that start with +55
4. THE Deep_Crawler SHALL normalize WhatsApp numbers to format +55DDNNNNNNNNN (country code + area code + number)
5. THE Deep_Crawler SHALL validate that extracted numbers have 13 digits total (including +55)
6. THE Deep_Crawler SHALL store first valid WhatsApp number found in whatsapp column
7. IF multiple WhatsApp numbers are found, THE Deep_Crawler SHALL prioritize numbers from wa.me links

### Requirement 9: Detecção de Marketing Stack

**User Story:** Como usuário do LeadExtract, eu quero saber quais empresas não usam ferramentas de marketing digital, para que eu identifique oportunidades de venda de serviços de marketing.

#### Acceptance Criteria

1. THE Deep_Crawler SHALL search page source for string "gtm.js" to detect Google Tag Manager
2. THE Deep_Crawler SHALL search page source for string "fbevents.js" to detect Facebook Pixel
3. THE Deep_Crawler SHALL search page source for string "googletagmanager.com/gtag/js" to detect Google Analytics 4
4. THE Deep_Crawler SHALL search page source for string "connect.facebook.net" to detect Facebook SDK
5. THE Deep_Crawler SHALL store boolean values in columns: tem_gtm, tem_facebook_pixel, tem_ga4, tem_facebook_sdk
6. THE Deep_Crawler SHALL add column stack_marketing_count with total count of detected technologies
7. IF stack_marketing_count is 0, THE Deep_Crawler SHALL flag the Lead_Record as high priority for marketing services

### Requirement 10: Exportação de CSV Enriquecido

**User Story:** Como usuário do LeadExtract, eu quero um arquivo CSV completo e bem formatado, para que eu possa importar os dados em meu CRM ou planilha.

#### Acceptance Criteria

1. WHEN all modules complete, THE Scraping_Engine SHALL export DataFrame to CSV file named "leads_enriquecidos_brutal.csv"
2. THE CSV_Output SHALL include columns in order: empresa, url_site, endereco, telefone_publico, linkedin, instagram, emails, whatsapp, cnpj, data_abertura, idade_anos, capital_social, socios, tem_gtm, tem_facebook_pixel, stack_marketing_count, lead_score, score_justificativa
3. THE CSV_Output SHALL use UTF-8 encoding with BOM for Excel compatibility
4. THE CSV_Output SHALL use semicolon (;) as delimiter for Brazilian Excel compatibility
5. THE CSV_Output SHALL escape special characters in text fields
6. THE CSV_Output SHALL format capital_social as Brazilian currency (R$ X.XXX,XX)
7. THE CSV_Output SHALL format data_abertura as DD/MM/YYYY
8. THE Scraping_Engine SHALL log file path and row count after successful export
9. THE Scraping_Engine SHALL validate that CSV file is not empty before completing

### Requirement 11: Type Hints e Modularização

**User Story:** Como desenvolvedor, eu quero código bem tipado e modular, para que eu possa manter e evoluir o sistema facilmente.

#### Acceptance Criteria

1. THE Scraping_Engine SHALL use Python type hints for all function parameters and return values
2. THE Scraping_Engine SHALL define separate async functions for each module: scrape_maps(), deep_crawl(), enrich_receita(), calculate_scores()
3. THE Scraping_Engine SHALL define dataclass or TypedDict for Lead_Record structure
4. THE Scraping_Engine SHALL use type hints from typing module: List, Dict, Optional, Tuple
5. THE Scraping_Engine SHALL organize code into logical sections with clear comments
6. THE Scraping_Engine SHALL define constants at module level for: USER_AGENT, TIMEOUT_SECONDS, MAX_RETRIES, CONCURRENT_LIMIT
7. THE Scraping_Engine SHALL follow PEP 8 style guidelines

### Requirement 12: Logging e Monitoramento

**User Story:** Como usuário do LeadExtract, eu quero acompanhar o progresso da extração em tempo real, para que eu saiba quanto tempo falta e se há problemas.

#### Acceptance Criteria

1. THE Scraping_Engine SHALL configure logging with level INFO to console
2. THE Scraping_Engine SHALL log start message with Search_Term and timestamp
3. THE Scraping_Engine SHALL log completion of each module with count of records processed
4. THE Scraping_Engine SHALL log errors with ERROR level including company name and error type
5. THE Scraping_Engine SHALL display progress bar using tqdm library showing percentage and ETA
6. THE Scraping_Engine SHALL log final statistics: total leads, successful enrichments, errors, execution time
7. THE Scraping_Engine SHALL log memory usage at start and end of execution
8. THE Scraping_Engine SHALL create log file "leadextract_execution.log" with detailed logs

### Requirement 13: Configuração via Parâmetros

**User Story:** Como usuário do LeadExtract, eu quero configurar o comportamento do scraper, para que eu possa adaptar a extração às minhas necessidades.

#### Acceptance Criteria

1. THE Scraping_Engine SHALL accept Search_Term as command line argument or function parameter
2. THE Scraping_Engine SHALL accept optional parameter max_results to limit number of companies scraped
3. THE Scraping_Engine SHALL accept optional parameter headless (default True) to control browser visibility
4. THE Scraping_Engine SHALL accept optional parameter output_filename to customize CSV output name
5. THE Scraping_Engine SHALL accept optional parameter enable_enrichment (default True) to skip ReceitaWS module
6. THE Scraping_Engine SHALL validate that Search_Term is not empty before starting
7. THE Scraping_Engine SHALL provide default values for all optional parameters

### Requirement 14: Parser de HTML com BeautifulSoup

**User Story:** Como desenvolvedor, eu quero parsing rápido e confiável de HTML, para que eu extraia dados estruturados de forma eficiente.

#### Acceptance Criteria

1. THE Deep_Crawler SHALL use BeautifulSoup4 with lxml parser for HTML parsing
2. THE Deep_Crawler SHALL parse page HTML after Playwright renders JavaScript
3. THE Deep_Crawler SHALL use CSS selectors to find social media links: a[href*="linkedin.com"], a[href*="instagram.com"]
4. THE Deep_Crawler SHALL use find_all() to extract all anchor tags for link analysis
5. THE Deep_Crawler SHALL use get_text() to extract visible text for email regex matching
6. THE Deep_Crawler SHALL handle malformed HTML gracefully without crashing
7. THE Deep_Crawler SHALL extract meta tags for additional contact information

### Requirement 15: Pretty Printer para Dados Estruturados

**User Story:** Como desenvolvedor, eu quero visualizar dados estruturados de forma legível durante desenvolvimento, para que eu possa debugar facilmente.

#### Acceptance Criteria

1. THE Scraping_Engine SHALL implement pretty_print_lead() function that formats Lead_Record for console display
2. THE pretty_print_lead() function SHALL display all fields with labels and proper indentation
3. THE pretty_print_lead() function SHALL use colors for different field types (green for found data, red for missing)
4. THE pretty_print_lead() function SHALL format lists (emails, socios) with bullet points
5. THE pretty_print_lead() function SHALL be called in verbose mode for debugging

### Requirement 16: Round-Trip de Dados (Parser e Serializer)

**User Story:** Como desenvolvedor, eu quero garantir integridade dos dados, para que nenhuma informação seja perdida durante processamento.

#### Acceptance Criteria

1. THE Scraping_Engine SHALL implement serialize_lead() function that converts Lead_Record to JSON string
2. THE Scraping_Engine SHALL implement deserialize_lead() function that converts JSON string back to Lead_Record
3. FOR ALL valid Lead_Record objects, deserializing then serializing then deserializing SHALL produce equivalent object (round-trip property)
4. THE Scraping_Engine SHALL validate round-trip integrity in test suite
5. THE Scraping_Engine SHALL handle special characters and Unicode in serialization

### Requirement 17: Checkpoint e Recuperação

**User Story:** Como usuário do LeadExtract, eu quero poder retomar execuções interrompidas, para que eu não perca horas de trabalho se algo der errado.

#### Acceptance Criteria

1. THE Scraping_Engine SHALL save checkpoint file "leadextract_checkpoint.json" every 50 records processed
2. THE checkpoint file SHALL contain: processed_companies list, current_module, timestamp
3. WHEN starting execution, THE Scraping_Engine SHALL check for existing checkpoint file
4. IF checkpoint file exists and is less than 24 hours old, THE Scraping_Engine SHALL ask user to resume or start fresh
5. WHEN resuming, THE Scraping_Engine SHALL skip companies already in processed_companies list
6. THE Scraping_Engine SHALL delete checkpoint file after successful completion
7. THE Scraping_Engine SHALL include checkpoint data in error recovery

### Requirement 18: Rate Limiting Inteligente

**User Story:** Como usuário do LeadExtract, eu quero evitar bloqueios por rate limiting, para que a extração complete com sucesso.

#### Acceptance Criteria

1. THE Scraping_Engine SHALL implement adaptive rate limiting based on response times
2. WHEN average response time exceeds 5 seconds, THE Scraping_Engine SHALL increase delay between requests by 50%
3. WHEN receiving HTTP 429 status, THE Scraping_Engine SHALL pause for 60 seconds before retrying
4. THE Scraping_Engine SHALL track request count per minute and limit to maximum 20 requests/minute for ReceitaWS_API
5. THE Scraping_Engine SHALL use token bucket algorithm for rate limiting
6. THE Scraping_Engine SHALL log rate limiting events with timestamp

### Requirement 19: Validação de Dados Extraídos

**User Story:** Como usuário do LeadExtract, eu quero dados validados e limpos, para que eu não perca tempo com informações inválidas.

#### Acceptance Criteria

1. THE Scraping_Engine SHALL validate that empresa field is not empty before adding to DataFrame
2. THE Scraping_Engine SHALL validate that url_site starts with http:// or https:// if not empty
3. THE Scraping_Engine SHALL validate that CNPJ has exactly 14 digits
4. THE Scraping_Engine SHALL validate that email addresses contain @ and valid domain
5. THE Scraping_Engine SHALL validate that WhatsApp numbers start with +55 and have 13 digits
6. THE Scraping_Engine SHALL remove duplicate Lead_Record entries based on empresa name
7. THE Scraping_Engine SHALL add column dados_validos (boolean) indicating if all required fields are valid

### Requirement 20: Documentação e Exemplos de Uso

**User Story:** Como novo usuário do LeadExtract, eu quero documentação clara, para que eu possa começar a usar o sistema rapidamente.

#### Acceptance Criteria

1. THE Scraping_Engine SHALL include docstrings for all public functions following Google style
2. THE Scraping_Engine SHALL include README.md with installation instructions
3. THE README.md SHALL include example usage with sample Search_Term
4. THE README.md SHALL document all configuration parameters
5. THE README.md SHALL include troubleshooting section for common errors
6. THE Scraping_Engine SHALL include example output CSV with sample data
7. THE README.md SHALL document required Python version (3.10+) and dependencies
