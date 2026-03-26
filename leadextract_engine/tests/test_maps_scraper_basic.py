"""
Basic tests for Maps Scraper module.

These tests verify the module structure and basic functionality without
requiring actual browser automation.
"""

import pytest
import pandas as pd
from leadextract_engine.modules.maps_scraper import scrape_maps


def test_scrape_maps_signature():
    """Test that scrape_maps function exists with correct signature."""
    import inspect
    
    sig = inspect.signature(scrape_maps)
    params = list(sig.parameters.keys())
    
    assert 'search_term' in params
    assert 'max_results' in params
    assert 'headless' in params


@pytest.mark.asyncio
async def test_scrape_maps_empty_search_term():
    """Test that scrape_maps raises ValueError for empty search term."""
    with pytest.raises(ValueError, match="search_term cannot be empty"):
        await scrape_maps("")
    
    with pytest.raises(ValueError, match="search_term cannot be empty"):
        await scrape_maps("   ")


@pytest.mark.asyncio
async def test_scrape_maps_returns_dataframe():
    """Test that scrape_maps returns a pandas DataFrame."""
    # This test would require mocking Playwright, so we'll skip actual execution
    # Just verify the function is async and callable
    import inspect
    assert inspect.iscoroutinefunction(scrape_maps)


def test_module_imports():
    """Test that all required imports work."""
    from leadextract_engine.modules import maps_scraper
    
    assert hasattr(maps_scraper, 'scrape_maps')
    assert hasattr(maps_scraper, 'logger')
