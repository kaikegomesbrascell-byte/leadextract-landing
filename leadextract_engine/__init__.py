"""
LeadExtract Core Scraping Engine

A Python-based asynchronous data extraction system for B2B lead generation
in the Brazilian market.
"""

__version__ = "1.0.0"
__author__ = "LeadExtract Team"

from .models import LeadRecord
from .config import *

__all__ = ["LeadRecord"]
