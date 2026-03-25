# Implementation Plan: LeadExtract Core Scraping Engine

## Overview

This implementation plan breaks down the LeadExtract Core Scraping Engine into discrete, actionable coding tasks. The system is a Python 3.10+ async scraping engine with 4 modules: Maps Scraper (Playwright stealth), Deep Crawler (contact extraction + marketing stack detection), ReceitaWS Enrichment (Brazilian government API), and Lead Scoring (0-10 algorithm).

The implementation follows a bottom-up approach: core data structures first, then individual modules, then orchestration, and finally supporting systems (checkpoints, rate limiting, validation).

## Tasks

- [x] 1. Set up project structure and core data models
  - Create directory structure: leadextract_engine/ with subdirectories for modules, utils, and tests
  - Create requirements.txt with dependencies: playwright, playwright-stealth, aiohttp, beautifulsoup4, lxml, pandas, tqdm
  - Define LeadRecord dataclass with all fields from design (empresa, url_site, linkedin, emails, whatsapp, cnpj, lead_score, etc.)
  - Define configuration constants module with all timeouts, regex patterns, and limits
  - Create __init__.py files for proper package structure
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.6, 20.2, 20.6_

- [ ] 2. Implement Module 1: Maps Scraper
  - [x] 2.1 Create maps_scraper.py with async scrape_maps() function
    - Implement Playwright browser launch with stealth plugin and viewport configuration
    - Implement search term input and page navigation with 30s timeout
    - Implement scroll detection logic (stop after 5 consecutive attempts with no new results)
    - Extract company data: empresa, url_site, endereco, telefone_publico
    - Return pandas DataFrame with extracted data
    - Add progress logging every 10 companies
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9_
  
  - [x] 2.2 Write unit tests for maps_scraper
    - Test scroll behavior with mock Playwright page
    - Test data extraction with sample HTML
    - Test timeout handling
    - _Requirements: 1.8_

- [ ] 3. Implement Module 2: Deep Crawler
  - [x] 3.1 Create deep_crawler.py with async deep_crawl() function
    - Implement Playwright stealth mode website access with 20s timeout
    - Implement BeautifulSoup HTML parsing with lxml parser
    - Extract social media links using CSS selectors and regex patterns
    - Implement email extraction with regex and prioritization logic
    - Implement WhatsApp extraction with multiple patterns (wa.me, api.whatsapp, tel:)
    - Implement marketing stack detection (GTM, Facebook Pixel, GA4, Facebook SDK)
    - Add columns to DataFrame: linkedin, instagram, emails, whatsapp, tem_gtm, tem_facebook_pixel, tem_ga4, tem_facebook_sdk, stack_marketing_count
    - Implement exponential backoff retry logic (max 3 attempts)
    - Add random delays between visits (2-5 seconds)
    - Mark failed records with erro_crawler flag
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 14.1, 14.2, 14.3, 14.4, 14.5, 14.6_
  
  - [ ] 3.2 Write unit tests for deep_crawler
    - Test email regex with valid and invalid patterns
    - Test email prioritization logic
    - Test WhatsApp normalization to +55DDNNNNNNNNN format
    - Test marketing stack detection with sample HTML
    - Test error handling and retry logic
    - _Requirements: 7.5, 8.5, 9.5_

- [ ] 4. Implement Module 3: ReceitaWS Enrichment
  - [ ] 4.1 Create receita_enrichment.py with async enrich_receita() function
    - Implement CNPJ search using company name via ReceitaWS API
    - Implement company details fetch (data_abertura, capital_social, QSA)
    - Calculate company age in years from data_abertura
    - Extract partner names from QSA array
    - Add columns to DataFrame: cnpj, data_abertura, idade_anos, capital_social, socios
    - Implement HTTP 429 handling with exponential backoff (5s to 60s max)
    - Add random delays between API calls (1-3 seconds)
    - Handle not found cases gracefully (store empty values)
    - Mark failed records with erro_enriquecimento flag
    - Set 15s timeout per request
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10_
  
  - [ ] 4.2 Write unit tests for receita_enrichment
    - Test CNPJ search with mock API responses
    - Test age calculation logic
    - Test QSA partner extraction
    - Test HTTP 429 backoff behavior
    - Test not found handling
    - _Requirements: 3.3, 3.6, 3.7_

- [ ] 5. Implement Module 4: Lead Scoring
  - [ ] 5.1 Create lead_scoring.py with calculate_scores() function
    - Implement scoring algorithm: +3 for no marketing stack, +3 for age < 1 year, +4 for contact available
    - Calculate lead_score (0-10) for each record
    - Generate score_justificativa based on score ranges (Premium 10, Quente 7-9, Morno 4-6, Frio 0-3)
    - Add columns to DataFrame: lead_score, score_justificativa
    - Sort DataFrame by lead_score descending
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 4.11_
  
  - [ ] 5.2 Write unit tests for lead_scoring
    - Test scoring calculation with various combinations
    - Test score justification text generation
    - Test DataFrame sorting
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 6. Checkpoint - Ensure core modules work independently
  - Test each module in isolation with sample data
  - Verify DataFrame schema matches design specification
  - Ensure all tests pass, ask the user if questions arise

- [ ] 7. Implement rate limiting system
  - [ ] 7.1 Create rate_limiter.py with RateLimiter class
    - Implement token bucket algorithm for rate limiting
    - Implement adaptive rate limiting (increase delay by 50% when avg response time > 5s)
    - Implement HTTP 429 handler (pause 60 seconds)
    - Track request count per minute (max 20 for ReceitaWS)
    - Add logging for rate limiting events
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5, 18.6_
  
  - [ ] 7.2 Write unit tests for rate_limiter
    - Test token bucket behavior
    - Test adaptive rate adjustment
    - Test HTTP 429 handling
    - _Requirements: 18.2, 18.3, 18.4_

- [ ] 8. Implement checkpoint and recovery system
  - [ ] 8.1 Create checkpoint_manager.py with save/load/delete functions
    - Implement save_checkpoint() to write JSON file every 50 records
    - Implement load_checkpoint() to read and validate checkpoint (< 24 hours old)
    - Implement delete_checkpoint() to remove file on completion
    - Store: processed_companies list, current_module, timestamp
    - Add user prompt to resume or start fresh
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 17.6, 17.7_
  
  - [ ] 8.2 Write unit tests for checkpoint_manager
    - Test checkpoint save and load round-trip
    - Test age validation (reject > 24 hours)
    - Test file deletion
    - _Requirements: 17.2, 17.4_

- [ ] 9. Implement data validation system
  - [ ] 9.1 Create data_validator.py with validate_lead() function
    - Validate empresa is not empty
    - Validate url_site starts with http:// or https:// (if not empty)
    - Validate CNPJ has exactly 14 digits (if not empty)
    - Validate emails contain @ and valid domain
    - Validate WhatsApp starts with +55 and has 13 digits
    - Implement duplicate detection based on empresa name
    - Return validation result and error messages
    - Add dados_validos column to DataFrame
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 19.6, 19.7_
  
  - [ ] 9.2 Write unit tests for data_validator
    - Test each validation rule with valid and invalid data
    - Test duplicate detection
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5_

- [ ] 10. Implement CSV export with Brazilian formatting
  - [ ] 10.1 Create csv_exporter.py with export_to_csv() function
    - Export DataFrame to CSV with UTF-8 BOM encoding
    - Use semicolon (;) as delimiter for Brazilian Excel
    - Format capital_social as Brazilian currency (R$ X.XXX,XX)
    - Format data_abertura as DD/MM/YYYY
    - Escape special characters in text fields
    - Include all columns in correct order from design
    - Validate CSV is not empty before completing
    - Log file path and row count
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9_
  
  - [ ] 10.2 Write unit tests for csv_exporter
    - Test Brazilian currency formatting
    - Test date formatting
    - Test UTF-8 BOM encoding
    - Test semicolon delimiter
    - _Requirements: 10.4, 10.6, 10.7_

- [ ] 11. Implement orchestration engine
  - [ ] 11.1 Create main.py with async main() orchestration function
    - Implement parameter validation (search_term, max_results, headless, output_filename, enable_enrichment)
    - Create aiohttp.ClientSession with connection pooling
    - Implement semaphore for concurrent limit (5 connections)
    - Execute Phase 1: Maps Scraper (sequential)
    - Execute Phase 2: Deep Crawler + ReceitaWS Enrichment (parallel with asyncio.gather)
    - Execute Phase 3: Lead Scoring (sequential)
    - Execute Phase 4: CSV Export (sequential)
    - Integrate checkpoint system (save every 50 records)
    - Integrate rate limiter for API calls
    - Integrate data validator
    - Display progress bar with tqdm
    - Handle KeyboardInterrupt gracefully
    - Log execution time and statistics
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7_
  
  - [ ] 11.2 Write integration tests for orchestration
    - Test full pipeline with mock data
    - Test parallel execution of Phase 2
    - Test checkpoint integration
    - Test KeyboardInterrupt handling
    - _Requirements: 5.3, 5.9_

- [ ] 12. Implement error handling and resilience
  - [ ] 12.1 Create error_handler.py with error handling utilities
    - Wrap all network operations in try/except for aiohttp.ClientError and asyncio.TimeoutError
    - Wrap all parsing operations in try/except for AttributeError and IndexError
    - Implement error logging with traceback
    - Generate error summary report (count by type)
    - Save partial results every 50 records
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8_
  
  - [ ] 12.2 Write unit tests for error_handler
    - Test network error handling
    - Test parsing error handling
    - Test error summary generation
    - _Requirements: 6.2, 6.3, 6.6_

- [ ] 13. Implement logging and monitoring
  - [ ] 13.1 Create logger.py with logging configuration
    - Configure logging with INFO level to console
    - Create log file "leadextract_execution.log"
    - Log start message with search term and timestamp
    - Log completion of each module with record count
    - Log errors with ERROR level including company name and error type
    - Log final statistics: total leads, successful enrichments, errors, execution time
    - Log memory usage at start and end
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8_
  
  - [ ] 13.2 Write unit tests for logger
    - Test log message formatting
    - Test log file creation
    - Test error logging
    - _Requirements: 12.2, 12.4_

- [ ] 14. Checkpoint - Ensure all components integrate correctly
  - Run full pipeline with small dataset (10 companies)
  - Verify checkpoint save/load works
  - Verify rate limiting prevents API blocks
  - Verify error handling continues processing on failures
  - Ensure all tests pass, ask the user if questions arise

- [ ] 15. Implement utility functions
  - [ ] 15.1 Create utils.py with helper functions
    - Implement pretty_print_lead() for console display with colors
    - Implement serialize_lead() to convert LeadRecord to JSON
    - Implement deserialize_lead() to convert JSON to LeadRecord
    - Validate round-trip integrity (serialize -> deserialize -> serialize produces same result)
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 16.1, 16.2, 16.3, 16.4, 16.5_
  
  - [ ] 15.2 Write property test for round-trip integrity
    - **Property 1: Round-trip consistency**
    - **Validates: Requirements 16.3**
    - Generate random valid LeadRecord objects
    - Verify deserialize(serialize(deserialize(serialize(lead)))) == deserialize(serialize(lead))
    - Test with special characters and Unicode
    - _Requirements: 16.3, 16.5_

- [ ] 16. Create command-line interface
  - [ ] 16.1 Create cli.py with argparse configuration
    - Add argument: search_term (required, positional)
    - Add argument: --max-results (optional, integer)
    - Add argument: --headless (optional, boolean, default True)
    - Add argument: --output (optional, string, default "leads_enriquecidos_brutal.csv")
    - Add argument: --no-enrichment (optional, flag to disable ReceitaWS)
    - Add argument: --verbose (optional, flag for debug logging)
    - Validate search_term is not empty
    - Call main() with parsed arguments
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7_
  
  - [ ] 16.2 Write unit tests for CLI
    - Test argument parsing
    - Test validation
    - Test default values
    - _Requirements: 13.6, 13.7_

- [ ] 17. Create documentation
  - [ ] 17.1 Create README.md with comprehensive documentation
    - Add installation instructions (Python 3.10+, pip install -r requirements.txt, playwright install)
    - Add example usage with sample search term
    - Document all configuration parameters
    - Add troubleshooting section for common errors (rate limiting, timeouts, parsing failures)
    - Document required dependencies and versions
    - Add example output CSV structure
    - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5, 20.6, 20.7_
  
  - [ ] 17.2 Add docstrings to all public functions
    - Use Google style docstrings
    - Document parameters, return values, and exceptions
    - Add usage examples in docstrings
    - _Requirements: 20.1_

- [ ] 18. Final integration and testing
  - [ ] 18.1 Run full pipeline with real search term
    - Test with "Energia Solar em São Paulo" (50 results)
    - Verify all modules execute successfully
    - Verify CSV export is correct
    - Verify checkpoint recovery works
    - Verify rate limiting prevents blocks
    - Check log file for errors
    - _Requirements: All_
  
  - [ ] 18.2 Write end-to-end integration test
    - Test complete pipeline with mock data
    - Verify all DataFrame columns are present
    - Verify scoring algorithm produces correct results
    - Verify CSV formatting is correct
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 10.2_

- [ ] 19. Final checkpoint - Ensure production readiness
  - Verify all required dependencies are in requirements.txt
  - Verify README.md is complete and accurate
  - Verify all error cases are handled gracefully
  - Verify logging provides sufficient debugging information
  - Run full pipeline with 100+ results to test performance
  - Ensure all tests pass, ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- The implementation follows bottom-up approach: data models → modules → orchestration → supporting systems
- All async functions use asyncio and aiohttp for concurrent processing
- Playwright with stealth mode ensures anti-detection for web scraping
- Rate limiting and error handling ensure resilience against API blocks and failures
- Brazilian formatting (UTF-8 BOM, semicolon delimiter, R$ currency) ensures Excel compatibility
