"""
Data models for LeadExtract Core Scraping Engine.

This module defines the core data structures used throughout the pipeline.
"""

from dataclasses import dataclass, field
from typing import Optional
from datetime import date


@dataclass
class LeadRecord:
    """
    Represents a complete lead record with data from all 4 modules.
    
    Attributes:
        # Module 1: Maps Scraper
        empresa: Company name
        url_site: Company website URL
        endereco: Public address
        telefone_publico: Public phone number
        
        # Module 2: Deep Crawler
        linkedin: LinkedIn company page URL
        instagram: Instagram profile URL
        emails: Email addresses (semicolon-separated)
        whatsapp: WhatsApp number in +55DDNNNNNNNNN format
        tem_gtm: Has Google Tag Manager
        tem_facebook_pixel: Has Facebook Pixel
        tem_ga4: Has Google Analytics 4
        tem_facebook_sdk: Has Facebook SDK
        stack_marketing_count: Total marketing technologies detected
        erro_crawler: Error flag for crawling failures
        
        # Module 3: ReceitaWS Enrichment
        cnpj: Brazilian company ID (14 digits)
        data_abertura: Company founding date
        idade_anos: Company age in years
        capital_social: Share capital
        socios: Partner names (semicolon-separated)
        erro_enriquecimento: Error flag for enrichment failures
        
        # Module 4: Lead Scoring
        lead_score: Quality score (0-10)
        score_justificativa: Score explanation
        
        # Validation
        dados_validos: Overall data validity flag
    """
    
    # Module 1: Maps Scraper
    empresa: str
    url_site: Optional[str] = None
    endereco: Optional[str] = None
    telefone_publico: Optional[str] = None
    
    # Module 2: Deep Crawler
    linkedin: Optional[str] = None
    instagram: Optional[str] = None
    emails: Optional[str] = None  # Semicolon-separated
    whatsapp: Optional[str] = None
    tem_gtm: bool = False
    tem_facebook_pixel: bool = False
    tem_ga4: bool = False
    tem_facebook_sdk: bool = False
    stack_marketing_count: int = 0
    erro_crawler: bool = False
    
    # Module 3: ReceitaWS Enrichment
    cnpj: Optional[str] = None
    data_abertura: Optional[date] = None
    idade_anos: Optional[int] = None
    capital_social: Optional[float] = None
    socios: Optional[str] = None  # Semicolon-separated
    erro_enriquecimento: bool = False
    
    # Module 4: Lead Scoring
    lead_score: int = 0
    score_justificativa: str = ""
    
    # Validation
    dados_validos: bool = False
