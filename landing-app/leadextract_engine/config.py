"""
Configuration constants for LeadExtract Core Scraping Engine.

This module contains all timeouts, regex patterns, limits, and other
configuration constants used throughout the system.
"""

import re
from typing import Dict, List

# ============================================================================
# Browser Configuration
# ============================================================================

USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)
VIEWPORT_WIDTH = 1920
VIEWPORT_HEIGHT = 1080

# ============================================================================
# Timeout Configuration (in seconds)
# ============================================================================

MAPS_TIMEOUT_SECONDS = 30
CRAWLER_TIMEOUT_SECONDS = 20
API_TIMEOUT_SECONDS = 15

# ============================================================================
# Retry Configuration
# ============================================================================

MAX_RETRIES = 3
BACKOFF_BASE_SECONDS = 2
BACKOFF_MAX_SECONDS = 60

# ============================================================================
# Rate Limiting
# ============================================================================

CONCURRENT_LIMIT = 5
RECEITA_MAX_REQUESTS_PER_MINUTE = 20
CRAWLER_MIN_DELAY_SECONDS = 2
CRAWLER_MAX_DELAY_SECONDS = 5
ENRICHMENT_MIN_DELAY_SECONDS = 1
ENRICHMENT_MAX_DELAY_SECONDS = 3

# ============================================================================
# Human Behavior Simulation
# ============================================================================

SCROLL_MIN_DELAY_SECONDS = 1.5
SCROLL_MAX_DELAY_SECONDS = 3.5
SCROLL_NO_RESULTS_THRESHOLD = 5

# ============================================================================
# Checkpoint Configuration
# ============================================================================

CHECKPOINT_INTERVAL = 50
CHECKPOINT_MAX_AGE_HOURS = 24
CHECKPOINT_FILENAME = "leadextract_checkpoint.json"

# ============================================================================
# Validation Constants
# ============================================================================

CNPJ_LENGTH = 14
WHATSAPP_LENGTH = 13
MAX_EMAILS_PER_LEAD = 5

# ============================================================================
# Regex Patterns
# ============================================================================

# Email extraction pattern
EMAIL_PATTERN = re.compile(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}')

# WhatsApp extraction patterns
WHATSAPP_PATTERNS = [
    re.compile(r'wa\.me/(\+?55\d{10,11})'),
    re.compile(r'api\.whatsapp\.com/send\?phone=(\+?55\d{10,11})'),
    re.compile(r'href="tel:(\+55\d{10,11})"'),
]

# Social media patterns
SOCIAL_PATTERNS = {
    'linkedin': re.compile(r'linkedin\.com/company/[^/\s"]+'),
    'instagram': re.compile(r'instagram\.com/[^/\s"]+'),
    'facebook': re.compile(r'facebook\.com/[^/\s"]+'),
}

# ============================================================================
# Email Prioritization
# ============================================================================

PRIORITY_EMAIL_KEYWORDS = [
    'contato',
    'comercial',
    'vendas',
    'rh',
    'atendimento',
    'suporte'
]

EXCLUDED_EMAIL_PATTERNS = [
    'noreply@',
    'no-reply@',
    'postmaster@',
    'abuse@'
]

# ============================================================================
# Marketing Stack Detection
# ============================================================================

MARKETING_STACK_SIGNATURES = {
    'gtm': 'gtm.js',
    'facebook_pixel': 'fbevents.js',
    'ga4': 'googletagmanager.com/gtag/js',
    'facebook_sdk': 'connect.facebook.net'
}

# ============================================================================
# Output Configuration
# ============================================================================

DEFAULT_OUTPUT_FILENAME = "leads_enriquecidos_brutal.csv"
CSV_ENCODING = "utf-8-sig"  # UTF-8 with BOM for Excel compatibility
CSV_DELIMITER = ";"  # Brazilian Excel compatibility
LOG_FILENAME = "leadextract_execution.log"

# ============================================================================
# Logging Configuration
# ============================================================================

LOG_PROGRESS_INTERVAL = 10  # Log progress every N companies
