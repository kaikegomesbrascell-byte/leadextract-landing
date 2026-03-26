# Deep Crawler Module (Module 2)

## Overview

The Deep Crawler module is the second module in the LeadExtract pipeline. It visits company websites to extract contact information and detect marketing technologies.

## Features

### Contact Information Extraction
- **Social Media Links**: LinkedIn, Instagram, Facebook company pages
- **Email Addresses**: Extracts and prioritizes emails with keywords (contato, comercial, vendas, rh, atendimento, suporte)
- **WhatsApp Numbers**: Extracts from multiple patterns (wa.me, api.whatsapp.com, tel: links)

### Marketing Stack Detection
- Google Tag Manager (GTM)
- Facebook Pixel
- Google Analytics 4 (GA4)
- Facebook SDK

## Usage

```python
import pandas as pd
from leadextract_engine.modules import deep_crawl

# Create a DataFrame with company data
df = pd.DataFrame({
    'empresa': ['Company A', 'Company B'],
    'url_site': ['https://companya.com', 'https://companyb.com']
})

# Run deep crawler
enriched_df = await deep_crawl(df)

# Access extracted data
print(enriched_df[['empresa', 'emails', 'whatsapp', 'tem_gtm']])
```

## Output Columns

The module adds the following columns to the DataFrame:

| Column | Type | Description |
|--------|------|-------------|
| `linkedin` | str | LinkedIn company page URL |
| `instagram` | str | Instagram profile URL |
| `emails` | str | Email addresses (semicolon-separated, max 5) |
| `whatsapp` | str | WhatsApp number in +55DDNNNNNNNNN format |
| `tem_gtm` | bool | Has Google Tag Manager |
| `tem_facebook_pixel` | bool | Has Facebook Pixel |
| `tem_ga4` | bool | Has Google Analytics 4 |
| `tem_facebook_sdk` | bool | Has Facebook SDK |
| `stack_marketing_count` | int | Total marketing technologies detected |
| `erro_crawler` | bool | Error flag for crawling failures |

## Configuration

The module uses configuration constants from `leadextract_engine.config`:

- **Timeout**: 20 seconds per website
- **Retry Logic**: Exponential backoff, max 3 attempts
- **Delays**: Random 2-5 seconds between visits
- **Concurrency**: 5 simultaneous connections (configurable via semaphore)

## Email Prioritization

Emails are prioritized based on keywords:
1. **Priority keywords**: contato, comercial, vendas, rh, atendimento, suporte
2. **Excluded patterns**: noreply@, no-reply@, postmaster@, abuse@
3. **Max emails**: 5 per company (semicolon-separated)

## WhatsApp Extraction

The module extracts WhatsApp numbers from multiple patterns:
- `wa.me/+55DDNNNNNNNNN`
- `api.whatsapp.com/send?phone=+55DDNNNNNNNNN`
- `href="tel:+55DDNNNNNNNNN"`

Numbers are normalized to the format: `+55DDNNNNNNNNN` (13-14 characters)

## Error Handling

- **Timeout**: If a website fails to load within 20 seconds, it's marked with `erro_crawler=True`
- **Retry Logic**: Failed requests are retried up to 3 times with exponential backoff
- **Graceful Degradation**: Errors on individual sites don't stop the entire pipeline

## Requirements Satisfied

This module satisfies the following requirements from the spec:
- 2.1-2.11: Deep crawler functionality
- 7.1-7.7: Email extraction with regex
- 8.1-8.7: WhatsApp extraction with multiple patterns
- 9.1-9.7: Marketing stack detection
- 14.1-14.6: HTML parsing with BeautifulSoup

## Testing

Run the tests with:

```bash
# Basic tests
python -m pytest leadextract_engine/tests/test_deep_crawler_basic.py -v

# Integration tests
python -m pytest leadextract_engine/tests/test_deep_crawler_integration.py -v

# All deep_crawler tests
python -m pytest leadextract_engine/tests/ -k "deep_crawler" -v
```

## Dependencies

- `playwright`: Browser automation
- `playwright-stealth`: Anti-detection
- `beautifulsoup4`: HTML parsing
- `lxml`: Fast HTML parser
- `aiohttp`: Async HTTP client
- `pandas`: Data manipulation

## Notes

- The module uses Playwright with stealth mode to avoid detection
- BeautifulSoup with lxml parser is used for fast HTML parsing
- All operations are asynchronous for maximum performance
- The module respects rate limiting and adds human-like delays
