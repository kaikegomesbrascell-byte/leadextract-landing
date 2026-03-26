"""
Maps Scraper Module (Module 1)

This module implements stealth web scraping of map platforms to extract
initial business data: company name, website URL, address, and public phone.

Uses Playwright with stealth plugin to bypass detection and simulates human
behavior with gradual scrolling and random delays.

Installation Requirements:
    pip install playwright playwright-stealth
    playwright install chromium

Note: This module requires playwright-stealth package from:
    https://github.com/Granitosaurus/playwright-stealth
"""

import asyncio
import logging
import random
from typing import Optional, List, Dict, Any
import pandas as pd
from playwright.async_api import async_playwright, Page, Browser, TimeoutError as PlaywrightTimeoutError
from playwright_stealth.stealth import Stealth

from leadextract_engine.config import (
    USER_AGENT,
    VIEWPORT_WIDTH,
    VIEWPORT_HEIGHT,
    MAPS_TIMEOUT_SECONDS,
    SCROLL_MIN_DELAY_SECONDS,
    SCROLL_MAX_DELAY_SECONDS,
    SCROLL_NO_RESULTS_THRESHOLD,
    LOG_PROGRESS_INTERVAL,
)

logger = logging.getLogger(__name__)


async def scrape_maps(
    search_term: str,
    max_results: Optional[int] = None,
    headless: bool = True
) -> pd.DataFrame:
    """
    Extract business data from map platforms using stealth scraping.
    
    This function launches a Playwright browser with stealth configuration,
    performs a search with the provided term, scrolls to load results with
    human-like behavior, and extracts company data.
    
    Args:
        search_term: Search query (e.g., "Energia Solar em São Paulo")
        max_results: Maximum number of companies to extract (None = unlimited)
        headless: Run browser in headless mode (default True)
    
    Returns:
        pandas DataFrame with columns: empresa, url_site, endereco, telefone_publico
    
    Raises:
        ValueError: If search_term is empty
        PlaywrightTimeoutError: If page load exceeds timeout
    
    Requirements:
        1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9
    """
    if not search_term or not search_term.strip():
        raise ValueError("search_term cannot be empty")
    
    logger.info(f"Starting Maps Scraper with search term: '{search_term}'")
    logger.info(f"Max results: {max_results if max_results else 'unlimited'}")
    logger.info(f"Headless mode: {headless}")
    
    companies: List[Dict[str, Any]] = []
    
    async with async_playwright() as p:
        # Launch browser with stealth configuration
        browser = await _launch_stealth_browser(p, headless)
        
        try:
            page = await browser.new_page()
            
            # Apply stealth plugin to page
            stealth = Stealth()
            await stealth.apply_stealth_async(page)
            
            # Navigate to Google Maps and perform search
            await _perform_search(page, search_term)
            
            # Scroll and extract company data
            companies = await _scroll_and_extract(page, max_results)
            
        finally:
            await browser.close()
    
    # Convert to DataFrame
    df = pd.DataFrame(companies)
    
    logger.info(f"Maps Scraper completed. Extracted {len(df)} companies.")
    
    return df


async def _launch_stealth_browser(playwright, headless: bool) -> Browser:
    """
    Launch Playwright browser with stealth plugin and viewport configuration.
    
    Args:
        playwright: Playwright instance
        headless: Run in headless mode
    
    Returns:
        Configured Browser instance
    
    Requirements: 1.2, 1.4
    """
    logger.info("Launching browser with stealth configuration...")
    
    # Launch Chromium with stealth args
    browser = await playwright.chromium.launch(
        headless=headless,
        args=[
            '--disable-blink-features=AutomationControlled',
            '--disable-dev-shm-usage',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-web-security',
        ]
    )
    
    return browser


async def _perform_search(page: Page, search_term: str) -> None:
    """
    Navigate to Google Maps and perform search with timeout.
    
    Args:
        page: Playwright Page instance
        search_term: Search query
    
    Requirements: 1.1, 1.4, 1.8
    """
    logger.info(f"Navigating to Google Maps...")
    
    # Set viewport size
    await page.set_viewport_size({
        "width": VIEWPORT_WIDTH,
        "height": VIEWPORT_HEIGHT
    })
    
    # Set user agent
    await page.set_extra_http_headers({
        "User-Agent": USER_AGENT
    })
    
    try:
        # Navigate to Google Maps
        await page.goto(
            "https://www.google.com/maps",
            timeout=MAPS_TIMEOUT_SECONDS * 1000,
            wait_until="domcontentloaded"
        )
        
        # Wait for search box and input search term
        search_box_selector = 'input[id="searchboxinput"]'
        await page.wait_for_selector(search_box_selector, timeout=10000)
        await page.fill(search_box_selector, search_term)
        
        # Click search button
        search_button_selector = 'button[id="searchbox-searchbutton"]'
        await page.click(search_button_selector)
        
        # Wait for results to load
        await page.wait_for_timeout(3000)
        
        logger.info("Search completed successfully")
        
    except PlaywrightTimeoutError as e:
        logger.error(f"Timeout during search: {e}")
        raise


async def _scroll_and_extract(
    page: Page,
    max_results: Optional[int]
) -> List[Dict[str, Any]]:
    """
    Scroll the results panel with human behavior and extract company data.
    
    Implements scroll detection logic: stops after 5 consecutive attempts
    with no new results.
    
    Args:
        page: Playwright Page instance
        max_results: Maximum number of results to extract
    
    Returns:
        List of company dictionaries
    
    Requirements: 1.1, 1.3, 1.5, 1.6, 1.7, 1.9
    """
    logger.info("Starting scroll and extraction process...")
    
    companies: List[Dict[str, Any]] = []
    previous_count = 0
    no_new_results_count = 0
    scroll_attempt = 0
    
    # Selector for the scrollable results panel
    results_panel_selector = 'div[role="feed"]'
    
    try:
        await page.wait_for_selector(results_panel_selector, timeout=10000)
    except PlaywrightTimeoutError:
        logger.warning("Results panel not found. No results to extract.")
        return companies
    
    while True:
        scroll_attempt += 1
        
        # Extract current visible companies
        current_companies = await _extract_visible_companies(page)
        
        # Add new companies (avoid duplicates)
        for company in current_companies:
            if company not in companies:
                companies.append(company)
        
        # Log progress every 10 companies
        if len(companies) % LOG_PROGRESS_INTERVAL == 0 and len(companies) > 0:
            logger.info(f"Progress: {len(companies)} companies extracted")
        
        # Check if we've reached max_results
        if max_results and len(companies) >= max_results:
            logger.info(f"Reached max_results limit: {max_results}")
            break
        
        # Check if we got new results
        if len(companies) == previous_count:
            no_new_results_count += 1
            logger.debug(f"No new results. Count: {no_new_results_count}/{SCROLL_NO_RESULTS_THRESHOLD}")
        else:
            no_new_results_count = 0
        
        # Stop if no new results for 5 consecutive attempts
        if no_new_results_count >= SCROLL_NO_RESULTS_THRESHOLD:
            logger.info(f"No new results after {SCROLL_NO_RESULTS_THRESHOLD} scroll attempts. Stopping.")
            break
        
        previous_count = len(companies)
        
        # Scroll the results panel with human-like behavior
        await _human_scroll(page, results_panel_selector)
        
        # Random delay between scrolls (1.5-3.5 seconds)
        delay = random.uniform(SCROLL_MIN_DELAY_SECONDS, SCROLL_MAX_DELAY_SECONDS)
        await page.wait_for_timeout(int(delay * 1000))
    
    logger.info(f"Extraction completed. Total scroll attempts: {scroll_attempt}")
    
    # Trim to max_results if needed
    if max_results and len(companies) > max_results:
        companies = companies[:max_results]
    
    return companies


async def _extract_visible_companies(page: Page) -> List[Dict[str, Any]]:
    """
    Extract company data from currently visible results.
    
    Extracts: empresa, url_site, endereco, telefone_publico
    
    Args:
        page: Playwright Page instance
    
    Returns:
        List of company dictionaries
    
    Requirements: 1.1, 1.6, 1.7
    """
    companies: List[Dict[str, Any]] = []
    
    # Selector for individual result items
    result_items_selector = 'div[role="feed"] > div > div[jsaction]'
    
    try:
        # Get all result items
        items = await page.query_selector_all(result_items_selector)
        
        for item in items:
            try:
                # Extract company name
                name_element = await item.query_selector('div.fontHeadlineSmall')
                empresa = await name_element.inner_text() if name_element else ""
                
                if not empresa:
                    continue
                
                # Extract website URL (if available)
                url_site = ""
                try:
                    # Click on the item to reveal details
                    await item.click()
                    await page.wait_for_timeout(500)
                    
                    # Look for website link
                    website_link = await page.query_selector('a[data-item-id="authority"]')
                    if website_link:
                        url_site = await website_link.get_attribute('href') or ""
                except Exception as e:
                    logger.debug(f"Could not extract website for {empresa}: {e}")
                
                # Extract address
                endereco = ""
                try:
                    address_button = await page.query_selector('button[data-item-id="address"]')
                    if address_button:
                        address_div = await address_button.query_selector('div.fontBodyMedium')
                        if address_div:
                            endereco = await address_div.inner_text()
                except Exception as e:
                    logger.debug(f"Could not extract address for {empresa}: {e}")
                
                # Extract public phone
                telefone_publico = ""
                try:
                    phone_button = await page.query_selector('button[data-item-id^="phone:tel:"]')
                    if phone_button:
                        phone_div = await phone_button.query_selector('div.fontBodyMedium')
                        if phone_div:
                            telefone_publico = await phone_div.inner_text()
                except Exception as e:
                    logger.debug(f"Could not extract phone for {empresa}: {e}")
                
                # Create company record
                company = {
                    "empresa": empresa.strip(),
                    "url_site": url_site.strip() if url_site else "",
                    "endereco": endereco.strip() if endereco else "",
                    "telefone_publico": telefone_publico.strip() if telefone_publico else "",
                }
                
                companies.append(company)
                
            except Exception as e:
                logger.debug(f"Error extracting company data: {e}")
                continue
    
    except Exception as e:
        logger.error(f"Error in _extract_visible_companies: {e}")
    
    return companies


async def _human_scroll(page: Page, selector: str) -> None:
    """
    Scroll the results panel with gradual, human-like behavior.
    
    Args:
        page: Playwright Page instance
        selector: CSS selector for scrollable element
    
    Requirements: 1.3
    """
    try:
        # Scroll by a random amount (simulate human scrolling)
        scroll_amount = random.randint(300, 600)
        
        await page.evaluate(f"""
            const element = document.querySelector('{selector}');
            if (element) {{
                element.scrollBy({{
                    top: {scroll_amount},
                    behavior: 'smooth'
                }});
            }}
        """)
    except Exception as e:
        logger.debug(f"Error during scroll: {e}")
