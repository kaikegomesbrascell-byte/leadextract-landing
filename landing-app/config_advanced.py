"""
Configurações avançadas para LeadExtract Core
Proxies, rate limiting, e otimizações de produção
"""

from dataclasses import dataclass
from typing import List, Optional


@dataclass
class ScraperConfig:
    """Configurações do scraper"""
    
    # Rate Limiting
    max_concurrent_requests: int = 5
    delay_between_requests: float = 1.0  # segundos
    max_retries: int = 3
    timeout: int = 30  # segundos
    
    # Proxies (opcional)
    use_proxies: bool = False
    proxy_list: List[str] = None
    
    # User Agents
    rotate_user_agents: bool = True
    user_agents: List[str] = None
    
    # Google Maps
    maps_max_scroll: int = 5
    maps_scroll_delay: float = 1.5
    
    # Deep Crawler
    crawler_max_pages: int = 3  # Páginas por site
    crawler_follow_links: bool = False
    
    # ReceitaWS
    receita_api_key: Optional[str] = None  # Para versão paga
    receita_max_retries: int = 3
    receita_backoff_factor: int = 2
    
    # Scoring
    score_weights: dict = None
    
    def __post_init__(self):
        """Inicializa valores padrão"""
        if self.proxy_list is None:
            self.proxy_list = []
        
        if self.user_agents is None:
            self.user_agents = [
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15'
            ]
        
        if self.score_weights is None:
            self.score_weights = {
                'sem_marketing_stack': 3,
                'empresa_jovem': 3,
                'contato_facil': 4
            }


# Configuração padrão
DEFAULT_CONFIG = ScraperConfig()

# Configuração para produção (mais conservadora)
PRODUCTION_CONFIG = ScraperConfig(
    max_concurrent_requests=3,
    delay_between_requests=2.0,
    max_retries=5,
    timeout=45,
    use_proxies=True,
    maps_max_scroll=10,
    maps_scroll_delay=2.0
)

# Configuração agressiva (use com proxies)
AGGRESSIVE_CONFIG = ScraperConfig(
    max_concurrent_requests=10,
    delay_between_requests=0.5,
    max_retries=2,
    timeout=20,
    use_proxies=True,
    maps_max_scroll=15,
    maps_scroll_delay=0.8
)


# Lista de proxies exemplo (substitua pelos seus)
PROXY_LIST_EXAMPLE = [
    "http://user:pass@proxy1.com:8080",
    "http://user:pass@proxy2.com:8080",
    "http://user:pass@proxy3.com:8080",
]


def get_config(mode: str = "default") -> ScraperConfig:
    """
    Retorna configuração baseada no modo
    
    Args:
        mode: 'default', 'production', ou 'aggressive'
        
    Returns:
        Objeto ScraperConfig
    """
    configs = {
        "default": DEFAULT_CONFIG,
        "production": PRODUCTION_CONFIG,
        "aggressive": AGGRESSIVE_CONFIG
    }
    
    return configs.get(mode, DEFAULT_CONFIG)
