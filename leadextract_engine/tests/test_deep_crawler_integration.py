"""
Integration tests for Deep Crawler module.

These tests verify the deep_crawl function works correctly with DataFrames
and handles various edge cases.
"""

import pytest
import pandas as pd
import asyncio
from leadextract_engine.modules.deep_crawler import deep_crawl


@pytest.mark.asyncio
async def test_deep_crawl_with_empty_dataframe():
    """Test deep_crawl with an empty DataFrame."""
    df = pd.DataFrame(columns=['empresa', 'url_site'])
    
    result = await deep_crawl(df)
    
    # Should return DataFrame with new columns
    assert 'linkedin' in result.columns
    assert 'instagram' in result.columns
    assert 'emails' in result.columns
    assert 'whatsapp' in result.columns
    assert 'tem_gtm' in result.columns
    assert 'tem_facebook_pixel' in result.columns
    assert 'tem_ga4' in result.columns
    assert 'tem_facebook_sdk' in result.columns
    assert 'stack_marketing_count' in result.columns
    assert 'erro_crawler' in result.columns
    
    assert len(result) == 0


@pytest.mark.asyncio
async def test_deep_crawl_with_no_urls():
    """Test deep_crawl with companies that have no website URLs."""
    df = pd.DataFrame({
        'empresa': ['Company A', 'Company B'],
        'url_site': ['', '']
    })
    
    result = await deep_crawl(df)
    
    # Should have new columns
    assert 'linkedin' in result.columns
    assert 'erro_crawler' in result.columns
    
    # Should not mark as error (just no URL to crawl)
    assert result.iloc[0]['erro_crawler'] == False
    assert result.iloc[1]['erro_crawler'] == False
    
    # Should have empty values
    assert result.iloc[0]['linkedin'] == ''
    assert result.iloc[0]['emails'] == ''


@pytest.mark.asyncio
async def test_deep_crawl_adds_all_columns():
    """Test that deep_crawl adds all required columns."""
    df = pd.DataFrame({
        'empresa': ['Test Company'],
        'url_site': ['']
    })
    
    result = await deep_crawl(df)
    
    expected_columns = [
        'empresa', 'url_site',  # Original columns
        'linkedin', 'instagram', 'emails', 'whatsapp',  # Social/contact
        'tem_gtm', 'tem_facebook_pixel', 'tem_ga4', 'tem_facebook_sdk',  # Marketing stack
        'stack_marketing_count', 'erro_crawler'  # Metadata
    ]
    
    for col in expected_columns:
        assert col in result.columns, f"Missing column: {col}"


@pytest.mark.asyncio
async def test_deep_crawl_with_semaphore():
    """Test deep_crawl respects semaphore for concurrency control."""
    df = pd.DataFrame({
        'empresa': ['Company A', 'Company B', 'Company C'],
        'url_site': ['', '', '']
    })
    
    # Create a semaphore with limit of 2
    semaphore = asyncio.Semaphore(2)
    
    result = await deep_crawl(df, semaphore=semaphore)
    
    # Should complete successfully
    assert len(result) == 3
    assert 'erro_crawler' in result.columns


def test_deep_crawl_column_types():
    """Test that deep_crawl creates columns with correct types."""
    df = pd.DataFrame({
        'empresa': ['Test Company'],
        'url_site': ['']
    })
    
    # Run synchronously for type checking
    import asyncio
    result = asyncio.run(deep_crawl(df))
    
    # String columns (can be object or string dtype)
    assert result['linkedin'].dtype in [object, 'string', pd.StringDtype()]
    assert result['instagram'].dtype in [object, 'string', pd.StringDtype()]
    assert result['emails'].dtype in [object, 'string', pd.StringDtype()]
    assert result['whatsapp'].dtype in [object, 'string', pd.StringDtype()]
    
    # Boolean columns
    assert result['tem_gtm'].dtype == bool
    assert result['tem_facebook_pixel'].dtype == bool
    assert result['tem_ga4'].dtype == bool
    assert result['tem_facebook_sdk'].dtype == bool
    assert result['erro_crawler'].dtype == bool
    
    # Integer column
    assert result['stack_marketing_count'].dtype in [int, 'int64', 'int32']
