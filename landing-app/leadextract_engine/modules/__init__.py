"""
Core modules for the LeadExtract scraping pipeline.

This package contains the four main modules:
- maps_scraper: Module 1 - Extract initial business data from map platforms
- deep_crawler: Module 2 - Extract contact info and marketing stack from websites
- enrichment: Module 3 - Enrich with financial data from ReceitaWS API
- scoring: Module 4 - Calculate lead quality scores
"""

from leadextract_engine.modules.maps_scraper import scrape_maps
from leadextract_engine.modules.deep_crawler import deep_crawl

__all__ = ['scrape_maps', 'deep_crawl']
