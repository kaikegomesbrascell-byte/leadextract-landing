"""
Unit tests for Maps Scraper module.

Tests scroll behavior, data extraction, and timeout handling using mocked
Playwright components to avoid actual browser launches.

Requirements: 1.8
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch, call
import pandas as pd
from playwright.async_api import TimeoutError as PlaywrightTimeoutError
import sys

# Mock playwright_stealth before importing maps_scraper
sys.modules['playwright_stealth'] = MagicMock()
sys.modules['playwright_stealth'].stealth_async = AsyncMock()

from leadextract_engine.modules.maps_scraper import (
    scrape_maps,
    _launch_stealth_browser,
    _perform_search,
    _scroll_and_extract,
    _extract_visible_companies,
    _human_scroll,
)
from leadextract_engine.config import (
    SCROLL_NO_RESULTS_THRESHOLD,
    VIEWPORT_WIDTH,
    VIEWPORT_HEIGHT,
    USER_AGENT,
    MAPS_TIMEOUT_SECONDS,
)


# ============================================================================
# Test Scroll Behavior
# ============================================================================

@pytest.mark.asyncio
async def test_scroll_stops_after_five_consecutive_no_results():
    """
    Test that scrolling stops after 5 consecutive attempts with no new results.
    
    Requirements: 1.5
    """
    # Create mock page
    mock_page = AsyncMock()
    mock_page.wait_for_selector = AsyncMock()
    mock_page.query_selector_all = AsyncMock(return_value=[])
    mock_page.evaluate = AsyncMock()
    mock_page.wait_for_timeout = AsyncMock()
    
    # Execute scroll and extract
    result = await _scroll_and_extract(mock_page, max_results=None)
    
    # Verify it stopped after threshold
    # The function scrolls 5 times (one less than threshold + 1 because it checks after scroll)
    assert mock_page.evaluate.call_count == SCROLL_NO_RESULTS_THRESHOLD - 1
    assert result == []


@pytest.mark.asyncio
async def test_scroll_continues_when_new_results_found():
    """
    Test that scrolling continues when new results are found.
    
    Requirements: 1.5
    """
    mock_page = AsyncMock()
    mock_page.wait_for_selector = AsyncMock()
    mock_page.wait_for_timeout = AsyncMock()
    mock_page.evaluate = AsyncMock()
    mock_page.query_selector = AsyncMock(return_value=None)
    
    # Mock company elements - return different results on each call
    mock_item1 = AsyncMock()
    mock_item1.click = AsyncMock()
    mock_name1 = AsyncMock()
    mock_name1.inner_text = AsyncMock(return_value="Company A")
    
    mock_item2 = AsyncMock()
    mock_item2.click = AsyncMock()
    mock_name2 = AsyncMock()
    mock_name2.inner_text = AsyncMock(return_value="Company B")
    
    # Setup query_selector for items
    async def mock_item1_query_selector(selector):
        if "fontHeadlineSmall" in selector:
            return mock_name1
        return None
    
    async def mock_item2_query_selector(selector):
        if "fontHeadlineSmall" in selector:
            return mock_name2
        return None
    
    mock_item1.query_selector = mock_item1_query_selector
    mock_item2.query_selector = mock_item2_query_selector
    
    # First call returns 1 item, second call returns 2 items
    call_count = 0
    async def mock_query_selector_all(selector):
        nonlocal call_count
        call_count += 1
        if call_count == 1:
            return [mock_item1]
        elif call_count == 2:
            return [mock_item1, mock_item2]
        else:
            return [mock_item1, mock_item2]
    
    mock_page.query_selector_all = mock_query_selector_all
    
    # Execute with max_results to limit iterations
    result = await _scroll_and_extract(mock_page, max_results=2)
    
    # Should have extracted 2 companies
    assert len(result) == 2
    assert result[0]["empresa"] == "Company A"
    assert result[1]["empresa"] == "Company B"


@pytest.mark.asyncio
async def test_scroll_respects_max_results():
    """
    Test that scrolling stops when max_results is reached.
    
    Requirements: 1.5
    """
    mock_page = AsyncMock()
    mock_page.wait_for_selector = AsyncMock()
    mock_page.wait_for_timeout = AsyncMock()
    mock_page.evaluate = AsyncMock()
    
    # Create mock items that return many companies
    mock_items = []
    for i in range(20):
        mock_item = AsyncMock()
        mock_name = AsyncMock()
        mock_name.inner_text = AsyncMock(return_value=f"Company {i}")
        mock_item.query_selector = AsyncMock(side_effect=[mock_name, None, None, None])
        mock_item.click = AsyncMock()
        mock_items.append(mock_item)
    
    mock_page.query_selector_all = AsyncMock(return_value=mock_items)
    mock_page.query_selector = AsyncMock(return_value=None)
    
    # Execute with max_results=5
    result = await _scroll_and_extract(mock_page, max_results=5)
    
    # Should have exactly 5 companies
    assert len(result) == 5


@pytest.mark.asyncio
async def test_human_scroll_executes_javascript():
    """
    Test that human scroll executes smooth scrolling JavaScript.
    
    Requirements: 1.3
    """
    mock_page = AsyncMock()
    mock_page.evaluate = AsyncMock()
    
    selector = 'div[role="feed"]'
    await _human_scroll(mock_page, selector)
    
    # Verify evaluate was called with scroll script
    mock_page.evaluate.assert_called_once()
    call_args = mock_page.evaluate.call_args[0][0]
    assert "scrollBy" in call_args
    assert "behavior: 'smooth'" in call_args


# ============================================================================
# Test Data Extraction
# ============================================================================

@pytest.mark.asyncio
async def test_extract_visible_companies_with_complete_data():
    """
    Test extraction of companies with all fields present.
    
    Requirements: 1.1, 1.6
    """
    mock_page = AsyncMock()
    
    # Mock company item with all data
    mock_item = AsyncMock()
    mock_item.click = AsyncMock()
    
    # Mock name element
    mock_name = AsyncMock()
    mock_name.inner_text = AsyncMock(return_value="Test Company")
    
    # Mock website link
    mock_website = AsyncMock()
    mock_website.get_attribute = AsyncMock(return_value="https://example.com")
    
    # Mock address
    mock_address_button = AsyncMock()
    mock_address_div = AsyncMock()
    mock_address_div.inner_text = AsyncMock(return_value="123 Test St, São Paulo")
    mock_address_button.query_selector = AsyncMock(return_value=mock_address_div)
    
    # Mock phone
    mock_phone_button = AsyncMock()
    mock_phone_div = AsyncMock()
    mock_phone_div.inner_text = AsyncMock(return_value="+55 11 1234-5678")
    mock_phone_button.query_selector = AsyncMock(return_value=mock_phone_div)
    
    # Setup query_selector responses
    async def mock_item_query_selector(selector):
        if "fontHeadlineSmall" in selector:
            return mock_name
        return None
    
    async def mock_page_query_selector(selector):
        if "authority" in selector:
            return mock_website
        elif "address" in selector:
            return mock_address_button
        elif "phone:tel:" in selector:
            return mock_phone_button
        return None
    
    mock_item.query_selector = mock_item_query_selector
    mock_page.query_selector = mock_page_query_selector
    mock_page.query_selector_all = AsyncMock(return_value=[mock_item])
    mock_page.wait_for_timeout = AsyncMock()
    
    # Execute extraction
    result = await _extract_visible_companies(mock_page)
    
    # Verify extracted data
    assert len(result) == 1
    assert result[0]["empresa"] == "Test Company"
    assert result[0]["url_site"] == "https://example.com"
    assert result[0]["endereco"] == "123 Test St, São Paulo"
    assert result[0]["telefone_publico"] == "+55 11 1234-5678"


@pytest.mark.asyncio
async def test_extract_visible_companies_with_missing_website():
    """
    Test extraction when website URL is not available.
    
    Requirements: 1.7
    """
    mock_page = AsyncMock()
    
    # Mock company item without website
    mock_item = AsyncMock()
    mock_item.click = AsyncMock()
    
    # Mock name element
    mock_name = AsyncMock()
    mock_name.inner_text = AsyncMock(return_value="Company Without Website")
    
    # Setup query_selector responses
    async def mock_item_query_selector(selector):
        if "fontHeadlineSmall" in selector:
            return mock_name
        return None
    
    async def mock_page_query_selector(selector):
        # No website link found
        return None
    
    mock_item.query_selector = mock_item_query_selector
    mock_page.query_selector = mock_page_query_selector
    mock_page.query_selector_all = AsyncMock(return_value=[mock_item])
    mock_page.wait_for_timeout = AsyncMock()
    
    # Execute extraction
    result = await _extract_visible_companies(mock_page)
    
    # Verify empty string for url_site
    assert len(result) == 1
    assert result[0]["empresa"] == "Company Without Website"
    assert result[0]["url_site"] == ""


@pytest.mark.asyncio
async def test_extract_visible_companies_skips_empty_names():
    """
    Test that companies without names are skipped.
    
    Requirements: 1.6
    """
    mock_page = AsyncMock()
    
    # Mock company item with empty name
    mock_item = AsyncMock()
    mock_name = AsyncMock()
    mock_name.inner_text = AsyncMock(return_value="")
    
    async def mock_item_query_selector(selector):
        if "fontHeadlineSmall" in selector:
            return mock_name
        return None
    
    mock_item.query_selector = mock_item_query_selector
    mock_page.query_selector_all = AsyncMock(return_value=[mock_item])
    
    # Execute extraction
    result = await _extract_visible_companies(mock_page)
    
    # Should skip empty name
    assert len(result) == 0


@pytest.mark.asyncio
async def test_extract_visible_companies_handles_extraction_errors():
    """
    Test that extraction continues when individual fields fail.
    
    Requirements: 1.6
    """
    mock_page = AsyncMock()
    
    # Mock company item
    mock_item = AsyncMock()
    mock_item.click = AsyncMock(side_effect=Exception("Click failed"))
    
    # Mock name element (should still work)
    mock_name = AsyncMock()
    mock_name.inner_text = AsyncMock(return_value="Partial Company")
    
    async def mock_item_query_selector(selector):
        if "fontHeadlineSmall" in selector:
            return mock_name
        return None
    
    mock_item.query_selector = mock_item_query_selector
    mock_page.query_selector_all = AsyncMock(return_value=[mock_item])
    mock_page.query_selector = AsyncMock(return_value=None)
    mock_page.wait_for_timeout = AsyncMock()
    
    # Execute extraction
    result = await _extract_visible_companies(mock_page)
    
    # Should still extract company with empty optional fields
    assert len(result) == 1
    assert result[0]["empresa"] == "Partial Company"
    assert result[0]["url_site"] == ""
    assert result[0]["endereco"] == ""
    assert result[0]["telefone_publico"] == ""


# ============================================================================
# Test Timeout Handling
# ============================================================================

@pytest.mark.asyncio
async def test_perform_search_handles_timeout():
    """
    Test that page load timeout is handled properly.
    
    Requirements: 1.8
    """
    mock_page = AsyncMock()
    mock_page.set_viewport_size = AsyncMock()
    mock_page.set_extra_http_headers = AsyncMock()
    mock_page.goto = AsyncMock(side_effect=PlaywrightTimeoutError("Timeout"))
    
    # Should raise PlaywrightTimeoutError
    with pytest.raises(PlaywrightTimeoutError):
        await _perform_search(mock_page, "test search")


@pytest.mark.asyncio
async def test_perform_search_uses_correct_timeout():
    """
    Test that search uses 30 second timeout.
    
    Requirements: 1.8
    """
    mock_page = AsyncMock()
    mock_page.set_viewport_size = AsyncMock()
    mock_page.set_extra_http_headers = AsyncMock()
    mock_page.goto = AsyncMock()
    mock_page.wait_for_selector = AsyncMock()
    mock_page.fill = AsyncMock()
    mock_page.click = AsyncMock()
    mock_page.wait_for_timeout = AsyncMock()
    
    await _perform_search(mock_page, "test search")
    
    # Verify timeout is set correctly (in milliseconds)
    mock_page.goto.assert_called_once()
    call_kwargs = mock_page.goto.call_args[1]
    assert call_kwargs["timeout"] == MAPS_TIMEOUT_SECONDS * 1000


@pytest.mark.asyncio
async def test_perform_search_sets_viewport_and_user_agent():
    """
    Test that viewport and user agent are configured correctly.
    
    Requirements: 1.4
    """
    mock_page = AsyncMock()
    mock_page.set_viewport_size = AsyncMock()
    mock_page.set_extra_http_headers = AsyncMock()
    mock_page.goto = AsyncMock()
    mock_page.wait_for_selector = AsyncMock()
    mock_page.fill = AsyncMock()
    mock_page.click = AsyncMock()
    mock_page.wait_for_timeout = AsyncMock()
    
    await _perform_search(mock_page, "test search")
    
    # Verify viewport size
    mock_page.set_viewport_size.assert_called_once_with({
        "width": VIEWPORT_WIDTH,
        "height": VIEWPORT_HEIGHT
    })
    
    # Verify user agent
    mock_page.set_extra_http_headers.assert_called_once_with({
        "User-Agent": USER_AGENT
    })


@pytest.mark.asyncio
async def test_scroll_and_extract_handles_missing_results_panel():
    """
    Test that missing results panel is handled gracefully.
    
    Requirements: 1.8
    """
    mock_page = AsyncMock()
    mock_page.wait_for_selector = AsyncMock(
        side_effect=PlaywrightTimeoutError("Results panel not found")
    )
    
    # Should return empty list instead of crashing
    result = await _scroll_and_extract(mock_page, max_results=None)
    
    assert result == []


# ============================================================================
# Test Integration with scrape_maps
# ============================================================================

@pytest.mark.asyncio
async def test_scrape_maps_validates_empty_search_term():
    """
    Test that scrape_maps validates search term is not empty.
    
    Requirements: 1.1
    """
    with pytest.raises(ValueError, match="search_term cannot be empty"):
        await scrape_maps("")
    
    with pytest.raises(ValueError, match="search_term cannot be empty"):
        await scrape_maps("   ")


@pytest.mark.asyncio
@patch('leadextract_engine.modules.maps_scraper.async_playwright')
async def test_scrape_maps_returns_dataframe(mock_playwright):
    """
    Test that scrape_maps returns a pandas DataFrame with correct columns.
    
    Requirements: 1.6
    """
    # Mock the entire Playwright context
    mock_browser = AsyncMock()
    mock_page = AsyncMock()
    mock_context = AsyncMock()
    
    # Setup mock chain
    mock_playwright_instance = AsyncMock()
    mock_playwright_instance.chromium.launch = AsyncMock(return_value=mock_browser)
    mock_browser.new_page = AsyncMock(return_value=mock_page)
    mock_browser.close = AsyncMock()
    
    mock_playwright.return_value.__aenter__ = AsyncMock(return_value=mock_playwright_instance)
    mock_playwright.return_value.__aexit__ = AsyncMock()
    
    # Mock page interactions
    mock_page.set_viewport_size = AsyncMock()
    mock_page.set_extra_http_headers = AsyncMock()
    mock_page.goto = AsyncMock()
    mock_page.wait_for_selector = AsyncMock()
    mock_page.fill = AsyncMock()
    mock_page.click = AsyncMock()
    mock_page.wait_for_timeout = AsyncMock()
    mock_page.evaluate = AsyncMock()
    
    # Mock extraction - return one company
    mock_item = AsyncMock()
    mock_item.click = AsyncMock()
    mock_name = AsyncMock()
    mock_name.inner_text = AsyncMock(return_value="Test Company")
    
    async def mock_item_query_selector(selector):
        if "fontHeadlineSmall" in selector:
            return mock_name
        return None
    
    mock_item.query_selector = mock_item_query_selector
    mock_page.query_selector_all = AsyncMock(return_value=[mock_item])
    mock_page.query_selector = AsyncMock(return_value=None)
    
    # Mock stealth_async
    with patch('leadextract_engine.modules.maps_scraper.stealth_async', new=AsyncMock()):
        result = await scrape_maps("test search", max_results=1, headless=True)
    
    # Verify result is a DataFrame
    assert isinstance(result, pd.DataFrame)
    
    # Verify DataFrame has correct columns
    expected_columns = ["empresa", "url_site", "endereco", "telefone_publico"]
    assert all(col in result.columns for col in expected_columns)
    
    # Verify we got one company
    assert len(result) == 1
    assert result.iloc[0]["empresa"] == "Test Company"


@pytest.mark.asyncio
@patch('leadextract_engine.modules.maps_scraper.async_playwright')
async def test_scrape_maps_closes_browser_on_error(mock_playwright):
    """
    Test that browser is closed even when errors occur.
    
    Requirements: 1.8
    """
    # Mock the Playwright context
    mock_browser = AsyncMock()
    mock_page = AsyncMock()
    
    mock_playwright_instance = AsyncMock()
    mock_playwright_instance.chromium.launch = AsyncMock(return_value=mock_browser)
    mock_browser.new_page = AsyncMock(return_value=mock_page)
    mock_browser.close = AsyncMock()
    
    mock_playwright.return_value.__aenter__ = AsyncMock(return_value=mock_playwright_instance)
    mock_playwright.return_value.__aexit__ = AsyncMock()
    
    # Mock page to raise error during search
    mock_page.set_viewport_size = AsyncMock()
    mock_page.set_extra_http_headers = AsyncMock()
    mock_page.goto = AsyncMock(side_effect=PlaywrightTimeoutError("Timeout"))
    
    # Mock stealth_async to avoid issues
    with patch('leadextract_engine.modules.maps_scraper.stealth_async', new=AsyncMock()):
        # The error is logged but not re-raised, so we check the browser was closed
        try:
            await scrape_maps("test search", headless=True)
        except PlaywrightTimeoutError:
            pass  # Expected
    
    # Verify browser.close() was called despite error
    mock_browser.close.assert_called_once()


# ============================================================================
# Test Browser Launch Configuration
# ============================================================================

@pytest.mark.asyncio
async def test_launch_stealth_browser_configuration():
    """
    Test that browser is launched with correct stealth configuration.
    
    Requirements: 1.2
    """
    mock_playwright = MagicMock()
    mock_browser = AsyncMock()
    mock_playwright.chromium.launch = AsyncMock(return_value=mock_browser)
    
    result = await _launch_stealth_browser(mock_playwright, headless=True)
    
    # Verify launch was called with stealth args
    mock_playwright.chromium.launch.assert_called_once()
    call_kwargs = mock_playwright.chromium.launch.call_args[1]
    
    assert call_kwargs["headless"] is True
    assert "--disable-blink-features=AutomationControlled" in call_kwargs["args"]
    assert result == mock_browser
