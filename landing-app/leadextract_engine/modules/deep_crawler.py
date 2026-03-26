"""
Deep Crawler Module (Module 2)

This module implements stealth website crawling to extract contact information
and marketing technology stack from company websites.

Extracts:
- Social media links (LinkedIn, Instagram, Facebook)
- Email addresses with prioritization logic
- WhatsApp numbers from multiple patterns
- Marketing stack (GTM, Facebook Pixel, GA4, Facebook SDK)

Uses Playwright with stealth mode and BeautifulSoup for HTML parsing.
Implements exponential backoff retry logic and random delays between visits.

Installation Requirements:
    pip install playwright playwright-stealth beautifulsoup4 lxml aiohttp
    playwright install chromium
"""

import asyncio
import logging
import random
import re
from typing import Optional, List, Dict, Any, Set
import pandas as pd
from playwright.async_api import async_playwright, Page, Browser, TimeoutError as PlaywrightTimeoutError
from playwright_stealth.stealth import Stealth
from bs4 import BeautifulSoup
import aiohttp

from leadextract_engine.config import (
    USER_AGENT,
    VIEWPORT_WIDTH,
    VIEWPORT_HEIGHT,
    CRAWLER_TIMEOUT_SECONDS,
    MAX_RETRIES,
    BACKOFF_BASE_SECONDS,
    BACKOFF_MAX_SECONDS,
    CRAWLER_MIN_DELAY_SECONDS,
    CRAWLER_MAX_DELAY_SECONDS,
    EMAIL_PATTERN,
    WHATSAPP_PATTERNS,
    SOCIAL_PATTERNS,
    PRIORITY_EMAIL_KEYWORDS,
    EXCLUDED_EMAIL_PATTERNS,
    MARKETING_STACK_SIGNATURES,
    MAX_EMAILS_PER_LEAD,
    WHATSAPP_LENGTH,
)

logger = logging.getLogger(__name__)


async def deep_crawl(
    df: pd.DataFrame,
    session: Optional[aiohttp.ClientSession] = None,
    semaphore: Optional[asyncio.Semaphore] = None
) -> pd.DataFrame:
    """
    Extract contact information and marketing stack from company websites.
    
    This function visits each company website using Playwright stealth mode,
    extracts social media links, emails, WhatsApp numbers, and detects
    marketing technologies.
    
    Args:
        df: DataFrame with at least 'empresa' and 'url_site' columns
        session: Optional aiohttp ClientSession for connection pooling
        semaphore: Optional asyncio Semaphore for concurrency control
    
    Returns:
        DataFrame with added columns: linkedin, instagram, emails, whatsapp,
        tem_gtm, tem_facebook_pixel, tem_ga4, tem_facebook_sdk,
        stack_marketing_count, erro_crawler
    
    Requirements:
        2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11,
        7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7,
        8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7,
        9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7,
        14.1, 14.2, 14.3, 14.4, 14.5, 14.6
    """
    logger.info(f"Starting Deep Crawler for {len(df)} companies")
    
    # Initialize new columns
    df['linkedin'] = ""
    df['instagram'] = ""
    df['emails'] = ""
    df['whatsapp'] = ""
    df['tem_gtm'] = False
    df['tem_facebook_pixel'] = False
    df['tem_ga4'] = False
    df['tem_facebook_sdk'] = False
    df['stack_marketing_count'] = 0
    df['erro_crawler'] = False
    
    # Create semaphore if not provided (default: 5 concurrent)
    if semaphore is None:
        from leadextract_engine.config import CONCURRENT_LIMIT
        semaphore = asyncio.Semaphore(CONCURRENT_LIMIT)
    
    # Launch browser once for all crawls
    async with async_playwright() as p:
        browser = await _launch_stealth_browser(p, headless=True)
        
        try:
            # Process each company
            for idx, row in df.iterrows():
                empresa = row.get('empresa', '')
                url_site = row.get('url_site', '')
                
                # Skip if no website URL
                if not url_site or not url_site.strip():
                    logger.debug(f"Skipping {empresa}: No website URL")
                    df.at[idx, 'erro_crawler'] = False  # Not an error, just no URL
                    continue
                
                # Crawl website with semaphore control
                async with semaphore:
                    crawl_data = await _crawl_website_with_retry(
                        browser, empresa, url_site
                    )
                    
                    # Update DataFrame with extracted data
                    df.at[idx, 'linkedin'] = crawl_data.get('linkedin', '')
                    df.at[idx, 'instagram'] = crawl_data.get('instagram', '')
                    df.at[idx, 'emails'] = crawl_data.get('emails', '')
                    df.at[idx, 'whatsapp'] = crawl_data.get('whatsapp', '')
                    df.at[idx, 'tem_gtm'] = crawl_data.get('tem_gtm', False)
                    df.at[idx, 'tem_facebook_pixel'] = crawl_data.get('tem_facebook_pixel', False)
                    df.at[idx, 'tem_ga4'] = crawl_data.get('tem_ga4', False)
                    df.at[idx, 'tem_facebook_sdk'] = crawl_data.get('tem_facebook_sdk', False)
                    df.at[idx, 'stack_marketing_count'] = crawl_data.get('stack_marketing_count', 0)
                    df.at[idx, 'erro_crawler'] = crawl_data.get('erro_crawler', False)
                    
                    # Random delay between visits (2-5 seconds)
                    delay = random.uniform(CRAWLER_MIN_DELAY_SECONDS, CRAWLER_MAX_DELAY_SECONDS)
                    await asyncio.sleep(delay)
        
        finally:
            await browser.close()
    
    logger.info(f"Deep Crawler completed. Processed {len(df)} companies.")
    
    return df


async def _launch_stealth_browser(playwright, headless: bool) -> Browser:
    """
    Launch Playwright browser with stealth configuration.
    
    Args:
        playwright: Playwright instance
        headless: Run in headless mode
    
    Returns:
        Configured Browser instance
    
    Requirements: 2.1
    """
    logger.info("Launching browser with stealth configuration for deep crawling...")
    
    browser = await playwright.chromium.launch(
        headless=headless,
        args=[
            '--disable-blink-features=AutomationControlled',
            '--disable-dev-shm-usage',
            '--no-sandbox',
            '--disable-setuid-sandbox',
        ]
    )
    
    return browser


async def _crawl_website_with_retry(
    browser: Browser,
    empresa: str,
    url_site: str
) -> Dict[str, Any]:
    """
    Crawl a website with exponential backoff retry logic.
    
    Args:
        browser: Playwright Browser instance
        empresa: Company name (for logging)
        url_site: Website URL to crawl
    
    Returns:
        Dictionary with extracted data
    
    Requirements: 2.9, 2.10
    """
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            logger.info(f"Crawling {empresa} ({url_site}) - Attempt {attempt}/{MAX_RETRIES}")
            
            crawl_data = await _crawl_website(browser, empresa, url_site)
            
            # Success
            logger.info(f"Successfully crawled {empresa}")
            return crawl_data
            
        except Exception as e:
            logger.warning(f"Attempt {attempt}/{MAX_RETRIES} failed for {empresa}: {e}")
            
            if attempt < MAX_RETRIES:
                # Exponential backoff
                backoff_delay = min(
                    BACKOFF_BASE_SECONDS * (2 ** (attempt - 1)),
                    BACKOFF_MAX_SECONDS
                )
                logger.debug(f"Retrying in {backoff_delay} seconds...")
                await asyncio.sleep(backoff_delay)
            else:
                # Max retries reached
                logger.error(f"Failed to crawl {empresa} after {MAX_RETRIES} attempts")
                return {
                    'linkedin': '',
                    'instagram': '',
                    'emails': '',
                    'whatsapp': '',
                    'tem_gtm': False,
                    'tem_facebook_pixel': False,
                    'tem_ga4': False,
                    'tem_facebook_sdk': False,
                    'stack_marketing_count': 0,
                    'erro_crawler': True
                }


async def _crawl_website(
    browser: Browser,
    empresa: str,
    url_site: str
) -> Dict[str, Any]:
    """
    Crawl a single website and extract all data.
    
    Args:
        browser: Playwright Browser instance
        empresa: Company name
        url_site: Website URL
    
    Returns:
        Dictionary with extracted data
    
    Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9
    """
    page = await browser.new_page()
    
    try:
        # Apply stealth plugin
        stealth = Stealth()
        await stealth.apply_stealth_async(page)
        
        # Set viewport and user agent
        await page.set_viewport_size({
            "width": VIEWPORT_WIDTH,
            "height": VIEWPORT_HEIGHT
        })
        
        await page.set_extra_http_headers({
            "User-Agent": USER_AGENT
        })
        
        # Navigate to website with timeout
        await page.goto(
            url_site,
            timeout=CRAWLER_TIMEOUT_SECONDS * 1000,
            wait_until="domcontentloaded"
        )
        
        # Wait a bit for JavaScript to render
        await page.wait_for_timeout(2000)
        
        # Get page content and HTML
        page_content = await page.content()
        page_text = await page.evaluate("() => document.body.innerText")
        
        # Parse HTML with BeautifulSoup
        soup = BeautifulSoup(page_content, 'lxml')
        
        # Extract data
        linkedin = _extract_social_media(soup, 'linkedin')
        instagram = _extract_social_media(soup, 'instagram')
        emails = _extract_emails(soup, page_text)
        whatsapp = _extract_whatsapp(soup, page_content)
        
        # Detect marketing stack
        tem_gtm = _detect_marketing_tech(page_content, 'gtm')
        tem_facebook_pixel = _detect_marketing_tech(page_content, 'facebook_pixel')
        tem_ga4 = _detect_marketing_tech(page_content, 'ga4')
        tem_facebook_sdk = _detect_marketing_tech(page_content, 'facebook_sdk')
        
        stack_marketing_count = sum([
            tem_gtm,
            tem_facebook_pixel,
            tem_ga4,
            tem_facebook_sdk
        ])
        
        return {
            'linkedin': linkedin,
            'instagram': instagram,
            'emails': emails,
            'whatsapp': whatsapp,
            'tem_gtm': tem_gtm,
            'tem_facebook_pixel': tem_facebook_pixel,
            'tem_ga4': tem_ga4,
            'tem_facebook_sdk': tem_facebook_sdk,
            'stack_marketing_count': stack_marketing_count,
            'erro_crawler': False
        }
        
    except PlaywrightTimeoutError:
        logger.warning(f"Timeout crawling {empresa} ({url_site})")
        raise
    except Exception as e:
        logger.error(f"Error crawling {empresa}: {e}")
        raise
    finally:
        await page.close()


def _extract_social_media(soup: BeautifulSoup, platform: str) -> str:
    """
    Extract social media link for specified platform.
    
    Args:
        soup: BeautifulSoup parsed HTML
        platform: 'linkedin', 'instagram', or 'facebook'
    
    Returns:
        Social media URL or empty string
    
    Requirements: 2.2, 14.3
    """
    try:
        pattern = SOCIAL_PATTERNS.get(platform)
        if not pattern:
            return ""
        
        # Find all anchor tags
        links = soup.find_all('a', href=True)
        
        for link in links:
            href = link.get('href', '')
            match = pattern.search(href)
            if match:
                # Return the full matched URL
                return match.group(0) if not href.startswith('http') else href
        
        return ""
    
    except Exception as e:
        logger.debug(f"Error extracting {platform}: {e}")
        return ""


def _extract_emails(soup: BeautifulSoup, page_text: str) -> str:
    """
    Extract and prioritize email addresses from page.
    
    Extracts emails from:
    - HTML content (including mailto: links)
    - Visible text
    
    Prioritizes emails with keywords: contato, comercial, vendas, rh, atendimento, suporte
    Excludes generic emails: noreply@, no-reply@, postmaster@, abuse@
    
    Args:
        soup: BeautifulSoup parsed HTML
        page_text: Visible page text
    
    Returns:
        Semicolon-separated email addresses (max 5)
    
    Requirements: 2.3, 2.4, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 14.5, 14.6
    """
    try:
        emails_found: Set[str] = set()
        
        # Extract from mailto: links
        mailto_links = soup.find_all('a', href=re.compile(r'^mailto:', re.IGNORECASE))
        for link in mailto_links:
            href = link.get('href', '')
            email_match = EMAIL_PATTERN.search(href)
            if email_match:
                emails_found.add(email_match.group(0).lower())
        
        # Extract from page HTML
        html_content = str(soup)
        for match in EMAIL_PATTERN.finditer(html_content):
            emails_found.add(match.group(0).lower())
        
        # Extract from visible text
        for match in EMAIL_PATTERN.finditer(page_text):
            emails_found.add(match.group(0).lower())
        
        # Filter out excluded patterns
        filtered_emails = []
        for email in emails_found:
            if not any(excluded in email for excluded in EXCLUDED_EMAIL_PATTERNS):
                filtered_emails.append(email)
        
        # Prioritize emails with keywords
        priority_emails = []
        regular_emails = []
        
        for email in filtered_emails:
            if any(keyword in email for keyword in PRIORITY_EMAIL_KEYWORDS):
                priority_emails.append(email)
            else:
                regular_emails.append(email)
        
        # Combine: priority first, then regular
        all_emails = priority_emails + regular_emails
        
        # Limit to MAX_EMAILS_PER_LEAD
        all_emails = all_emails[:MAX_EMAILS_PER_LEAD]
        
        # Return semicolon-separated
        return ";".join(all_emails)
    
    except Exception as e:
        logger.debug(f"Error extracting emails: {e}")
        return ""


def _extract_whatsapp(soup: BeautifulSoup, page_content: str) -> str:
    """
    Extract WhatsApp number from multiple patterns.
    
    Patterns:
    - wa.me/+55DDNNNNNNNNN
    - api.whatsapp.com/send?phone=+55DDNNNNNNNNN
    - href="tel:+55DDNNNNNNNNN"
    
    Args:
        soup: BeautifulSoup parsed HTML
        page_content: Raw HTML content
    
    Returns:
        WhatsApp number in +55DDNNNNNNNNN format or empty string
    
    Requirements: 2.5, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7
    """
    try:
        # Try each pattern in priority order
        for pattern in WHATSAPP_PATTERNS:
            match = pattern.search(page_content)
            if match:
                number = match.group(1)
                
                # Normalize to +55DDNNNNNNNNN format
                normalized = _normalize_whatsapp(number)
                
                if normalized:
                    return normalized
        
        return ""
    
    except Exception as e:
        logger.debug(f"Error extracting WhatsApp: {e}")
        return ""


def _normalize_whatsapp(number: str) -> str:
    """
    Normalize WhatsApp number to +55DDNNNNNNNNN format.
    
    Args:
        number: Raw phone number string
    
    Returns:
        Normalized number or empty string if invalid
    
    Requirements: 8.4, 8.5
    """
    try:
        # Remove all non-digit characters except +
        cleaned = re.sub(r'[^\d+]', '', number)
        
        # Ensure it starts with +55
        if not cleaned.startswith('+55'):
            if cleaned.startswith('55'):
                cleaned = '+' + cleaned
            else:
                return ""
        
        # Validate length (should be 13 or 14: +55 + 10 or 11 digits)
        # 13 chars: +55 + 2 digit area code + 8 digit number (landline)
        # 14 chars: +55 + 2 digit area code + 9 digit number (mobile with 9 prefix)
        if len(cleaned) not in [13, 14]:
            return ""
        
        return cleaned
    
    except Exception as e:
        logger.debug(f"Error normalizing WhatsApp: {e}")
        return ""


def _detect_marketing_tech(page_content: str, tech: str) -> bool:
    """
    Detect marketing technology in page source.
    
    Technologies:
    - gtm: Google Tag Manager (gtm.js)
    - facebook_pixel: Facebook Pixel (fbevents.js)
    - ga4: Google Analytics 4 (googletagmanager.com/gtag/js)
    - facebook_sdk: Facebook SDK (connect.facebook.net)
    
    Args:
        page_content: Raw HTML content
        tech: Technology key ('gtm', 'facebook_pixel', 'ga4', 'facebook_sdk')
    
    Returns:
        True if technology detected, False otherwise
    
    Requirements: 2.6, 2.7, 9.1, 9.2, 9.3, 9.4, 9.5
    """
    try:
        signature = MARKETING_STACK_SIGNATURES.get(tech)
        if not signature:
            return False
        
        return signature in page_content
    
    except Exception as e:
        logger.debug(f"Error detecting {tech}: {e}")
        return False
