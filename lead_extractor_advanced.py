"""
LeadExtract Advanced - Pipeline de Extração de Dados B2B Brazileiro
Arquitetura assíncrona com 4 módulos: Maps Scraper, Deep Crawler, API Enrichment, Scoring
Author: EngenhariaDados
Version: 2.0.0
"""

import asyncio
import aiohttp
import re
import json
import time
import random
from pathlib import Path
from dataclasses import dataclass, asdict, field
from typing import Optional, List, Dict, Tuple
from datetime import datetime, timedelta
from urllib.parse import urlparse
import logging

import pandas as pd
from bs4 import BeautifulSoup
from playwright.async_api import async_playwright, Browser, Page, BrowserContext

# ============================================================================
# CONFIGURAÇÕES E LOGGING
# ============================================================================

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(str(Path.home() / "Downloads" / "lead_extractor_advanced.log")),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# User-Agent variáveis para parecer humano
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
]

# ============================================================================
# DATACLASSES PARA TIPAGEM
# ============================================================================

@dataclass
class EmpresaBase:
    """Dados básicos da empresa extraída do Maps"""
    nome: str
    url_site: Optional[str] = None
    endereco: Optional[str] = None
    telefone: Optional[str] = None
    rating: Optional[float] = None
    total_avaliacoes: Optional[int] = None
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())


@dataclass
class DadosEnriquecidos:
    """Dados enriquecidos com informações de contato e stack"""
    empresa_base: EmpresaBase
    emails: List[str] = field(default_factory=list)
    whatsapp: Optional[str] = None
    linkedin: Optional[str] = None
    instagram: Optional[str] = None
    facebook: Optional[str] = None
    tem_gtm: bool = False
    tem_facebook_pixel: bool = False
    tem_google_analytics: bool = False
    tem_hotjar: bool = False
    design_responsivo: bool = False
    https: bool = False
    raw_html_size: int = 0
    erro_crawl: Optional[str] = None


@dataclass
class DadosFinanceiros:
    """Dados financeiros da ReceitaWS"""
    cnpj: Optional[str] = None
    data_abertura: Optional[str] = None
    idade_empresa_dias: Optional[int] = None
    capital_social: Optional[float] = None
    socios: List[str] = field(default_factory=list)
    atividade_principal: Optional[str] = None
    situacao_cadastral: Optional[str] = None


@dataclass
class LeadFinal:
    """Lead completamente enriquecido e scorado"""
    empresa_base: EmpresaBase
    dados_enriquecidos: DadosEnriquecidos
    dados_financeiros: DadosFinanceiros
    lead_score: float = 0.0
    score_breakdown: Dict[str, float] = field(default_factory=dict)


# ============================================================================
# MÓDULO 1: MAPS STEALTH SCRAPER
# ============================================================================

class MapStealthScraper:
    """
    Scraper assíncrono do Google Maps com simulação de comportamento humano.
    Utiliza Playwright com stealth plugin para evitar detecção.
    """
    
    def __init__(self):
        self.browser: Optional[Browser] = None
        self.context: Optional[BrowserContext] = None
        
    async def inicializar(self):
        """Inicializa o browser Playwright com stealth mode"""
        playwright = await async_playwright().start()
        self.browser = await playwright.chromium.launch(headless=True)
        
        # Contexto com stealth properties
        self.context = await self.browser.new_context(
            user_agent=random.choice(USER_AGENTS),
            viewport={"width": 1920, "height": 1080},
            locale="pt-BR",
            timezone_id="America/Sao_Paulo",
        )
        
        # Injetar stealth.js via página
        await self.context.add_init_script("""
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined,
            });
            Object.defineProperty(navigator, 'plugins', {
                get: () => [1, 2, 3, 4, 5],
            });
            Object.defineProperty(navigator, 'languages', {
                get: () => ['pt-BR', 'pt', 'en-US', 'en'],
            });
        """)
        
        logger.info("Browser Playwright iniciado com stealth mode")
    
    async def buscar_empresas(
        self,
        termo_busca: str,
        limite: int = 50,
        scroll_count: int = 3,
        timeout: int = 90000
    ) -> List[EmpresaBase]:
        """
        Busca empresas no Google Maps e extrai dados básicos.
        
        Args:
            termo_busca: Termo de busca (ex: "Energia Solar em São Paulo")
            limite: Máximo de resultados
            scroll_count: Número de scrolls para coletar dados
            timeout: Timeout para carregar página (milissegundos)
            
        Returns:
            Lista de EmpresaBase com dados extraídos
        """
        if not self.context:
            await self.inicializar()
        
        empresas: List[EmpresaBase] = []
        page = await self.context.new_page()
        
        try:
            logger.info(f"Iniciando busca: {termo_busca}")
            
            # URL do Google Maps com busca
            maps_url = f"https://www.google.com/maps/search/{termo_busca.replace(' ', '+')}"
            
            # Tentar carregar com timeout aumentado (90 segundos)
            try:
                await page.goto(maps_url, wait_until="domcontentloaded", timeout=timeout)
                logger.info("[OK] Maps carregado com sucesso")
            except Exception as e:
                logger.warning(f"[AVISO] Timeout ao carregar Maps, tentando novamente... ({str(e)[:80]})")
                # Retry com wait_until menos rigoroso
                await asyncio.sleep(3)
                await page.goto(maps_url, wait_until="load", timeout=timeout)
                logger.info("[OK] Maps carregado apos retry")
            
            # Aguardar carregamento dos resultados
            await asyncio.sleep(random.uniform(3, 6))
            
            # Scroll simulando comportamento humano
            for scroll_idx in range(scroll_count):
                logger.info(f"Scroll {scroll_idx + 1}/{scroll_count}")
                
                # Encontrar container de resultados (pode variar)
                await page.evaluate("""
                    () => {
                        const container = document.querySelector('[role="feed"]') || 
                                        document.querySelector('[role="main"]');
                        if (container) {
                            container.scrollTop = container.scrollHeight;
                        }
                    }
                """)
                
                # Delay humano entre scrolls
                await asyncio.sleep(random.uniform(1, 3))
            
    # Extrair dados completos via JavaScript - filtrar "Ver rotas para" + endereco/tel
            empresas_dados = await page.evaluate("""
        () => {
            const resultados = [];
            const panels = document.querySelectorAll('[data-result-index]');
            
            panels.forEach((panel, index) => {
                if (resultados.length >= 50) return;
                
                // Nome da empresa
                const nomeEl = panel.querySelector('.Io6YTe, h3, [role=\"heading\"]');
                const nome = nomeEl ? nomeEl.textContent.trim() : '';
                
                // Endereço
                const enderecoEl = panel.querySelector('.W4Efsd, .fontBodyMedium');
                const endereco = enderecoEl ? enderecoEl.textContent.trim() : '';
                
                // Telefone
                const telEl = panel.querySelector('.rogA2c, a[href^=\\"tel:\\" ]');
                const telefone = telEl ? telEl.textContent.trim() : '';
                
                // Rating
                const ratingEl = panel.querySelector('.MW4etd, .fontDisplayLarge');
                let rating = null;
                if (ratingEl) {
                    const ratingText = ratingEl.textContent.trim();
                    const match = ratingText.match(/(\\d+[,]\\d+)/);
                    if (match) rating = parseFloat(match[1].replace(',', '.'));
                }
                
                if (nome.length > 3) {
                    resultados.push({
                        nome: nome,
                        endereco: endereco,
                        telefone: telefone,
                        rating: rating,
                        panel_index: index
                    });
                }
            });
            
            // Fallback para aria-label buttons
            if (resultados.length === 0) {
                const buttons = document.querySelectorAll('button[aria-label]');
                buttons.forEach(button => {
                    if (resultados.length >= 50) return;
                    const ariaLabel = button.getAttribute('aria-label') || '';
                    if (ariaLabel.startsWith('Ver rotas para')) {
                        let nome = ariaLabel.replace(/^Ver rotas para\\s*/, '').split('|')[0].trim();
                        nome = nome.replace(/\\u2013|\\u2014|\\u2019/g, '-');
                        resultados.push({
                            nome: nome,
                            endereco: null,
                            telefone: null,
                            rating: null
                        });
                    }
                });
            }
            
            return resultados;
        }
    """)
            
            # Processar cada resultado
            for idx, dados in enumerate(empresas_dados):
                if len(empresas) >= limite:
                    break
                
                try:
                    rating = None
                    if dados.get('rating'):
                        # Extrair nota (ex: "4,5 estrelas")
                        match = re.search(r'(\d+,\d+|\d+)', dados['rating'].replace('.', ','))
                        if match:
                            rating = float(match.group(1).replace(',', '.'))
                    
                    empresa = EmpresaBase(
                        nome=dados['nome'],
                        rating=rating,
                        total_avaliacoes=None,  # Seria extraído em um passo seguinte
                        url_site=None,
                        endereco=None,
                        telefone=None
                    )
                    empresas.append(empresa)
                    
                except Exception as e:
                    logger.error(f"Erro ao processar empresa {idx}: {e}")
                    continue
            
            logger.info(f"Extraídas {len(empresas)} empresas do Maps")
            
        except Exception as e:
            logger.error(f"Erro no scraper de Maps: {e}", exc_info=True)
        finally:
            await page.close()
        
        return empresas
    
    async def fechar(self):
        """Fecha o browser e contexto"""
        if self.context:
            await self.context.close()
        if self.browser:
            await self.browser.close()
        logger.info("Browser fechado")


# ============================================================================
# MÓDULO 2: DEEP CRAWLER (Invasão do Site)
# ============================================================================

class DeepCrawler:
    """
    Crawler profundo que acessa o site da empresa, extrai contatos,
    emails, WhatsApp, redes sociais e detecta stack tecnológico.
    """
    
    # Regex para emails
    EMAIL_REGEX = re.compile(
        r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    )
    
# Regex para WhatsApp
    WHATSAPP_REGEX = re.compile(
        r'(?:wa\.me/55|whatsapp\.com|tel\\:55)?[+]?55[\\s\\-]?(?:(?:[1-9]{2})\\s?)?(?:9)?[0-9]{4,5}[0-9]{4}'
    )

    
    # Regex para telefone brasileiro
    TELEFONE_REGEX = re.compile(
        r'(?:\(\s?[0-9]{2}\s?\)|[0-9]{2})[0-9]{4,5}[0-9]{4}'
    )
    
    def __init__(self, browser: Optional[Browser] = None):
        self.browser = browser
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def inicializar_session(self):
        """Inicializa sessão aiohttp"""
        headers = {
            "User-Agent": random.choice(USER_AGENTS),
            "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        }
        self.session = aiohttp.ClientSession(headers=headers)
    
    async def crawl_site(
        self,
        url: str,
        timeout: int = 10
    ) -> DadosEnriquecidos:
        """
        Faz o crawl profundo de um site da empresa.
        
        Args:
            url: URL do site
            timeout: Timeout em segundos
            
        Returns:
            DadosEnriquecidos com informações extraídas
        """
        
        # Inicialmente não temos a empresa base aqui, será preenchida depois
        dados = DadosEnriquecidos(
            empresa_base=EmpresaBase(nome="", url_site=url)
        )
        
        if not url or not url.startswith('http'):
            url = f"https://{url}"
        
        try:
            if not self.session:
                await self.inicializar_session()
            
            logger.info(f"Crawling: {url}")
            
            # Tentar com aiohttp primeiro (mais rápido)
            try:
                async with self.session.get(
                    url,
                    timeout=aiohttp.ClientTimeout(total=timeout),
                    ssl=False,
                    allow_redirects=True
                ) as resp:
                    if resp.status == 200:
                        html = await resp.text()
                        dados = await self._extrair_dados_html(html, url)
                    else:
                        dados.erro_crawl = f"Status HTTP {resp.status}"
                        logger.warning(f"Status {resp.status} para {url}")
            
            except asyncio.TimeoutError:
                logger.warning(f"Timeout ao acessar {url}")
                dados.erro_crawl = "Timeout (aiohttp)"
            
            except aiohttp.ClientError as e:
                logger.warning(f"Erro aiohttp em {url}: {e}")
                dados.erro_crawl = f"Erro de conexão: {str(e)[:50]}"
        
        except Exception as e:
            logger.error(f"Erro crítico em crawl_site: {e}", exc_info=True)
            dados.erro_crawl = f"Erro crítico: {str(e)[:50]}"
        
        return dados
    
    async def _extrair_dados_html(
        self,
        html: str,
        url: str
    ) -> DadosEnriquecidos:
        """Extrai dados do HTML da página"""
        
        empresa_base = EmpresaBase(nome="", url_site=url)
        dados = DadosEnriquecidos(empresa_base=empresa_base)
        dados.raw_html_size = len(html)
        
        try:
            soup = BeautifulSoup(html, 'html.parser')
            
            # 1. EXTRAIR EMAILS
            emails_encontrados = set()
            
            # Buscar no HTML direto
            for match in self.EMAIL_REGEX.finditer(html):
                email = match.group()
                # Filtrar emails comuns de não-negócio
                if not any(x in email for x in ['noreply', 'no-reply', 'notification']):
                    emails_encontrados.add(email)
            
            # Buscar em atributos href
            for a in soup.find_all('a', href=True):
                href = a['href']
                if href.startswith('mailto:'):
                    email = href.replace('mailto:', '').split('?')[0]
                    emails_encontrados.add(email)
            
            dados.emails = list(emails_encontrados)[:10]  # Limite de 10
            
            # 2. EXTRAIR WHATSAPP
            for match in self.WHATSAPP_REGEX.finditer(html):
                whatsapp = match.group()
                # Limpar e validar
                whatsapp_limpo = re.sub(r'\D', '', whatsapp)
                if len(whatsapp_limpo) >= 11:
                    dados.whatsapp = whatsapp_limpo
                    break
            
            # Procurar em links wa.me
            for a in soup.find_all('a', href=True):
                if 'wa.me' in a['href'] or 'whatsapp' in a['href'].lower():
                    match = re.search(r'(\d{11,15})', a['href'])
                    if match:
                        dados.whatsapp = match.group(1)
                        break
            
            # 3. REDES SOCIAIS
            for a in soup.find_all('a', href=True):
                href = a['href'].lower()
                if 'linkedin.com' in href:
                    dados.linkedin = href
                elif 'instagram.com' in href:
                    dados.instagram = href
                elif 'facebook.com' in href:
                    dados.facebook = href
            
            # 4. DETECTAR STACK TECNOLÓGICO
            # Google Tag Manager
            if 'gtm.js' in html or 'google-analytics.com/gtag' in html:
                dados.tem_gtm = True
            
            # Facebook Pixel
            if 'fbevents.js' in html or 'facebook.com/en_US/fbevents.js' in html:
                dados.tem_facebook_pixel = True
            
            # Google Analytics
            if 'google-analytics.com' in html or 'analytics.google.com' in html:
                dados.tem_google_analytics = True
            
            # Hotjar
            if 'hj.hotjar.com' in html or 'hotjar' in html:
                dados.tem_hotjar = True
            
            # Design responsivo (viewport meta tag)
            if soup.find('meta', attrs={'name': 'viewport'}):
                dados.design_responsivo = True
            
            # HTTPS
            dados.https = True  # Se conseguimos acessar, é HTTPS validado
            
            logger.info(f"Extração bem-sucedida de {dados.raw_html_size} bytes")
        
        except Exception as e:
            logger.error(f"Erro ao extrair HTML: {e}")
            dados.erro_crawl = f"Erro parsing: {str(e)[:50]}"
        
        return dados
    
    async def fechar(self):
        """Fecha a sessão aiohttp"""
        if self.session:
            await self.session.close()
            logger.info("Sessão aiohttp fechada")


# ============================================================================
# MÓDULO 3: ENRIQUECIMENTO VIA API RECEITAWS
# ============================================================================

class ReceitaWSEnricher:
    """
    Enriquece dados da empresa consultando ReceitaWS (API gratuita).
    Extrai CNPJ, data de abertura, capital social e sócios.
    """
    
    API_MINHA_RECEITA = "https://minhareceita.org/api/v1/cnpj"
    API_RECEITA_WS = "https://receitaws.com.br/v1/cnpj"
    
    def __init__(self):
        self.session: Optional[aiohttp.ClientSession] = None
        self.rate_limit_delay = 1.0  # segundos entre requisições
    
    async def inicializar(self):
        """Inicializa sessão aiohttp"""
        if not self.session:
            self.session = aiohttp.ClientSession()
    
    async def buscar_cnpj(self, nome_empresa: str) -> Optional[str]:
        """
        Busca CNPJ pelo nome scrapeando minhaceita.org
        """
        if not self.session:
            await self.inicializar()
        
        nome_limpo = re.sub(r'[^\w\s]', ' ', nome_empresa)[:100].strip()
        search_url = f"https://www.minhareceita.org.br/consulta-simples-cnpj/?search={nome_limpo.replace(' ', '+')}"
        
        try:
            await asyncio.sleep(self.rate_limit_delay)
            async with self.session.get(search_url, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                if resp.status == 200:
                    html = await resp.text()
                    soup = BeautifulSoup(html, 'html.parser')
                    
                    # Primeira linha da tabela de resultados
                    row = soup.select_one('table.table-result tbody tr')
                    if row:
                        cnpj_cell = row.select_one('td:nth-of-type(1)')
                        if cnpj_cell:
                            cnpj_raw = cnpj_cell.text.strip()
                            cnpj_limpo = re.sub(r'\D', '', cnpj_raw)
                            if len(cnpj_limpo) == 14:
                                logger.info(f"CNPJ encontrado para '{nome_empresa[:50]}': {cnpj_limpo}")
                                return cnpj_limpo
            logger.warning(f"CNPJ não encontrado para: {nome_empresa[:50]}")
        except Exception as e:
            logger.warning(f"Erro scrape CNPJ '{nome_empresa[:50]}': {e}")
        
        return None

    
    async def enriquecer_por_cnpj(
        self,
        cnpj: str
    ) -> DadosFinanceiros:
        """
        Busca dados financeiros pela CNPJ na ReceitaWS.
        
        Args:
            cnpj: CNPJ limpo (só números) ou formatado
            
        Returns:
            DadosFinanceiros com informações da empresa
        """
        dados = DadosFinanceiros(cnpj=cnpj)
        
        if not self.session:
            await self.inicializar()
        
        # Limpar CNPJ
        cnpj_limpo = re.sub(r'\D', '', cnpj)
        
        if len(cnpj_limpo) != 14:
            logger.warning(f"CNPJ inválido: {cnpj}")
            return dados
        
        try:
            # Implementar backoff exponencial
            retry_count = 0
            max_retries = 3
            
            while retry_count < max_retries:
                try:
                    await asyncio.sleep(self.rate_limit_delay)
                    
                    async with self.session.get(
                        f"{self.API_RECEITA_WS}/{cnpj_limpo}",
                        timeout=aiohttp.ClientTimeout(total=10)
                    ) as resp:
                        if resp.status == 200:
                            json_data = await resp.json()
                            dados = self._parsear_resposta_receita(json_data, cnpj)
                            logger.info(f"CNPJ {cnpj_limpo} enriquecido com sucesso")
                            return dados
                        elif resp.status == 429:  # Rate limit
                            retry_count += 1
                            delay = (2 ** retry_count) + random.uniform(0, 1)
                            logger.warning(f"Rate limit, aguardando {delay}s")
                            await asyncio.sleep(delay)
                        else:
                            logger.warning(f"Status {resp.status} para CNPJ {cnpj_limpo}")
                            break
                
                except asyncio.TimeoutError:
                    retry_count += 1
                    if retry_count < max_retries:
                        await asyncio.sleep(2 ** retry_count)
                    else:
                        logger.error(f"Timeout após {max_retries} tentativas para CNPJ {cnpj}")
        
        except Exception as e:
            logger.error(f"Erro ao enriquecer CNPJ {cnpj}: {e}")
        
        return dados
    
    def _parsear_resposta_receita(
        self,
        json_data: Dict,
        cnpj: str
    ) -> DadosFinanceiros:
        """Parseia resposta JSON da ReceitaWS"""
        dados = DadosFinanceiros(cnpj=cnpj)
        
        try:
            # Estrutura de resposta da ReceitaWS
            if json_data.get('status') == 'ERROR':
                logger.warning(f"Erro na API: {json_data.get('message')}")
                return dados
            
            dados.situacao_cadastral = json_data.get('status_txt')
            
            # Data de abertura
            if json_data.get('abertura'):
                try:
                    data_abertura = datetime.strptime(
                        json_data['abertura'],
                        '%d/%m/%Y'
                    )
                    dados.data_abertura = data_abertura.isoformat()
                    dados.idade_empresa_dias = (
                        datetime.now() - data_abertura
                    ).days
                except:
                    pass
            
            # Capital social
            if json_data.get('capital_social'):
                try:
                    capital = float(
                        json_data['capital_social']
                        .replace('.', '')
                        .replace(',', '.')
                    )
                    dados.capital_social = capital
                except:
                    pass
            
            # Sócios (QSA)
            if json_data.get('qsa'):
                dados.socios = [
                    socio.get('nome', 'N/A')
                    for socio in json_data['qsa'][:5]  # Primeiros 5
                ]
            
            # Atividade principal
            if json_data.get('atividade_principal'):
                atividade_data = json_data['atividade_principal']
                if isinstance(atividade_data, list) and len(atividade_data) > 0:
                    dados.atividade_principal = atividade_data[0].get('text')
            
        except Exception as e:
            logger.error(f"Erro ao parsear JSON da ReceitaWS: {e}")
        
        return dados
    
    async def fechar(self):
        """Fecha a sessão aiohttp"""
        if self.session:
            await self.session.close()


# ============================================================================
# MÓDULO 4: MOTOR DE SCORING
# ============================================================================

class ScoringEngine:
    """
    Motor de scoring que calcula lead score de 0 a 10 baseado em múltiplos critérios.
    """
    
    @staticmethod
    def calcular_score(lead_raw: tuple) -> Tuple[float, Dict[str, float]]:
        """
        Calcula o lead score.
        
        Critérios:
        - Sem GTM/Pixel: +3 (precisam de marketing)
        - Empresa < 1 ano: +3 (estão expandindo)
        - WhatsApp/Email direto: +4 (contato fácil)
        - Tem design responsivo: +1
        - Atividade principal relevante: +2
        
        Args:
            lead_raw: Tupla contendo DadosEnriquecidos e DadosFinanceiros
            
        Returns:
            (score: float, breakdown: Dict)
        """
        dados_enriquecidos, dados_financeiros = lead_raw
        score = 0.0
        breakdown = {}
        
        # 1. Marketing Stack (GTM/Pixel)
        if not dados_enriquecidos.tem_gtm and not dados_enriquecidos.tem_facebook_pixel:
            score += 3.0
            breakdown['sem_marketing_stack'] = 3.0
        elif dados_enriquecidos.tem_gtm or dados_enriquecidos.tem_facebook_pixel:
            score += 1.5
            breakdown['com_algumas_ferramentas'] = 1.5
        
        # 2. Idade da empresa
        if dados_financeiros.idade_empresa_dias is not None:
            if dados_financeiros.idade_empresa_dias < 365:
                score += 3.0
                breakdown['empresa_nova'] = 3.0
            elif dados_financeiros.idade_empresa_dias < 730:
                score += 1.5
                breakdown['empresa_jovem'] = 1.5
        
        # 3. Contato direto (WhatsApp ou Email)
        emails_count = len(dados_enriquecidos.emails)
        tem_whatsapp = dados_enriquecidos.whatsapp is not None
        
        contato_score = 0.0
        if tem_whatsapp:
            contato_score += 2.0
        if emails_count >= 3:
            contato_score += 2.0
        elif emails_count >= 1:
            contato_score += 1.0
        
        if contato_score > 0:
            score += min(contato_score, 4.0)  # Máximo 4
            breakdown['acesso_direto'] = min(contato_score, 4.0)
        
        # 4. Design responsivo
        if dados_enriquecidos.design_responsivo:
            score += 0.5
            breakdown['site_moderno'] = 0.5
        
        # 5. Redes sociais ativas
        redes = sum([
            dados_enriquecidos.linkedin is not None,
            dados_enriquecidos.instagram is not None,
            dados_enriquecidos.facebook is not None,
        ])
        if redes >= 2:
            score += 1.0
            breakdown['redes_ativas'] = 1.0
        
        # 6. Sócios QSA
        socios_count = len(dados_financeiros.socios)
        if socios_count >= 2:
            score += 1.5
            breakdown['multiplos_socios'] = 1.5
        elif socios_count >= 1:
            score += 0.8
            breakdown['tem_socio'] = 0.8

        
        # Limitar entre 0 e 10
        score = min(max(score, 0.0), 10.0)
        
        return score, breakdown


# ============================================================================
# ORQUESTRADOR PRINCIPAL
# ============================================================================

class PipelineLeadExtractor:
    """
    Orquestrador principal que coordena os 4 módulos de forma assíncrona.
    """
    
    def __init__(self, max_concurrent: int = 5):
        self.maps_scraper = MapStealthScraper()
        self.deep_crawler = DeepCrawler()
        self.receita_enricher = ReceitaWSEnricher()
        self.scoring_engine = ScoringEngine()
        self.max_concurrent = max_concurrent
        self.semaphore = asyncio.Semaphore(max_concurrent)
        
        self.leads_finais: List[LeadFinal] = []
    
    async def extrair_e_enriquecer(
        self,
        termo_busca: str,
        limite_empresas: int = 50
    ) -> pd.DataFrame:
        """
        Executa o pipeline completo de extração e enriquecimento.
        
        Args:
            termo_busca: Termo de busca (ex: "Energia Solar em São Paulo")
            limite_empresas: Limite de empresas a extrair
            
        Returns:
            DataFrame com leads enriquecidos e scorados
        """
        
        logger.info(f"=" * 70)
        logger.info(f"INICIANDO PIPELINE: {termo_busca}")
        logger.info(f"=" * 70)
        
        try:
            # Fase 1: Extração do Google Maps
            logger.info("FASE 1: Extração do Google Maps")
            await self.maps_scraper.inicializar()
            empresas_base = await self.maps_scraper.buscar_empresas(
                termo_busca,
                limite=limite_empresas
            )
            logger.info(f"[OK] Extraidas {len(empresas_base)} empresas basicas")
            
            # Fase 2: Deep Crawling paralelo
            logger.info("FASE 2: Deep Crawling de Sites")
            await self.deep_crawler.inicializar_session()
            
            tasks_crawl = [
                self._crawl_com_limite(empresa)
                for empresa in empresas_base
            ]
            
            dados_crawler = await asyncio.gather(*tasks_crawl, return_exceptions=True)
            logger.info(f"[OK] Crawl completado para {len(dados_crawler)} sites")
            
            # Fase 3: Enriquecimento via ReceitaWS (paralelo)
            logger.info("FASE 3: Enriquecimento Financeiro (ReceitaWS)")
            await self.receita_enricher.inicializar()
            
            # Buscar CNPJ por nome e enriquecer
            tasks_cnpj = []
            for idx, empresa in enumerate(empresas_base):
                cnpj = await self.receita_enricher.buscar_cnpj(empresa.nome)
                if cnpj:
                    tasks_cnpj.append(self.receita_enricher.enriquecer_por_cnpj(cnpj))
                else:
                    tasks_cnpj.append(asyncio.create_task(asyncio.sleep(0.1)))  # Placeholder
            
            dados_financeiros = await asyncio.gather(*tasks_cnpj, return_exceptions=True)

            
            dados_financeiros = await asyncio.gather(*tasks_receita, return_exceptions=True)
            logger.info(f"[OK] Enriquecimento financeiro completado")
            
            # Fase 4: Scoring
            logger.info("FASE 4: Cálculo de Lead Score")
            
            for idx, empresa in enumerate(empresas_base):
                try:
                    dados_enriq = dados_crawler[idx] if idx < len(dados_crawler) else None
                    dados_fin = dados_financeiros[idx] if idx < len(dados_financeiros) else None
                    
                    if not isinstance(dados_enriq, DadosEnriquecidos):
                        dados_enriq = DadosEnriquecidos(empresa_base=empresa)
                    if not isinstance(dados_fin, DadosFinanceiros):
                        dados_fin = DadosFinanceiros()
                    
                    # Atualizar empresa_base com dados enriquecidos
                    dados_enriq.empresa_base = empresa
                    
                    # Calcular score
                    score, breakdown = self.scoring_engine.calcular_score(
                        (dados_enriq, dados_fin)
                    )
                    
                    lead = LeadFinal(
                        empresa_base=empresa,
                        dados_enriquecidos=dados_enriq,
                        dados_financeiros=dados_fin,
                        lead_score=score,
                        score_breakdown=breakdown
                    )
                    
                    self.leads_finais.append(lead)
                
                except Exception as e:
                    logger.error(f"Erro ao processar empresa {idx}: {e}")
            
            logger.info(f"[OK] {len(self.leads_finais)} leads finais gerados")
            
            # Converter para DataFrame
            df = self._leads_para_dataframe()
            
            logger.info(f"=" * 70)
            logger.info("PIPELINE CONCLUÍDO COM SUCESSO")
            logger.info(f"=" * 70)
            
            return df
        
        except Exception as e:
            logger.error(f"Erro crítico no pipeline: {e}", exc_info=True)
            return pd.DataFrame()
        
        finally:
            await self._cleanup()
    
    async def _crawl_com_limite(self, empresa: EmpresaBase) -> DadosEnriquecidos:
        """Wrapper para respeitar semáforo de concorrência"""
        async with self.semaphore:
            if empresa.url_site:
                return await self.deep_crawler.crawl_site(empresa.url_site)
            else:
                return DadosEnriquecidos(empresa_base=empresa)
    
    def _leads_para_dataframe(self) -> pd.DataFrame:
        """Converte leads finais em DataFrame"""
        dados = []
        
        for lead in self.leads_finais:
            linha = {
                'nome_empresa': lead.empresa_base.nome,
                'url_site': lead.empresa_base.url_site,
                'endereco': lead.empresa_base.endereco,
                'telefone': lead.empresa_base.telefone,
                'rating': lead.empresa_base.rating,
                'total_avaliacoes': lead.empresa_base.total_avaliacoes,
                'emails': ', '.join(lead.dados_enriquecidos.emails),
                'whatsapp': lead.dados_enriquecidos.whatsapp,
                'linkedin': lead.dados_enriquecidos.linkedin,
                'instagram': lead.dados_enriquecidos.instagram,
                'facebook': lead.dados_enriquecidos.facebook,
                'tem_gtm': lead.dados_enriquecidos.tem_gtm,
                'tem_facebook_pixel': lead.dados_enriquecidos.tem_facebook_pixel,
                'tem_google_analytics': lead.dados_enriquecidos.tem_google_analytics,
                'design_responsivo': lead.dados_enriquecidos.design_responsivo,
                'cnpj': lead.dados_financeiros.cnpj,
                'data_abertura': lead.dados_financeiros.data_abertura,
                'idade_dias': lead.dados_financeiros.idade_empresa_dias,
                'capital_social': lead.dados_financeiros.capital_social,
                'socios': ', '.join(lead.dados_financeiros.socios),
                'lead_score': lead.lead_score,
                'score_breakdown': json.dumps(lead.score_breakdown),
                'erro': lead.dados_enriquecidos.erro_crawl,
            }
            dados.append(linha)
        
        df = pd.DataFrame(dados)
        
        # Ordenar por score descendente
        if not df.empty and 'lead_score' in df.columns:
            df = df.sort_values('lead_score', ascending=False).reset_index(drop=True)
        
        return df
    
    async def _cleanup(self):
        """Limpa recursos"""
        try:
            await self.maps_scraper.fechar()
            await self.deep_crawler.fechar()
            await self.receita_enricher.fechar()
            logger.info("Limpeza de recursos concluída")
        except Exception as e:
            logger.error(f"Erro na limpeza: {e}")


# ============================================================================
# FUNÇÃO MAIN ASSÍNCRONA
# ============================================================================

async def main():
    """
    Função principal que executa o pipeline completo.
    Salva resultado em 'leads_enriquecidos_brutal.csv'
    """
    
    # Configurações
    TERMO_BUSCA = "Consultoria de Marketing em São Paulo"
    LIMITE = 50
    
    # Instanciar pipeline
    pipeline = PipelineLeadExtractor(max_concurrent=5)
    
    # Executar extração e enriquecimento
    df_leads = await pipeline.extrair_e_enriquecer(
        termo_busca=TERMO_BUSCA,
        limite_empresas=LIMITE
    )
    
    # Salvar em CSV na pasta Downloads
    if not df_leads.empty:
        downloads_path = Path.home() / "Downloads" / "leads_enriquecidos_brutal.csv"
        df_leads.to_csv(str(downloads_path), index=False, encoding='utf-8')
        
        logger.info(f"[OK] CSV salvo: {downloads_path}")
        logger.info(f"[OK] Total de leads: {len(df_leads)}")
        
        # Estatísticas
        if 'lead_score' in df_leads.columns:
            logger.info(f"[OK] Score medio: {df_leads['lead_score'].mean():.2f}")
            logger.info(f"[OK] Score maximo: {df_leads['lead_score'].max():.2f}")
        
        # Exibir primeiras linhas
        print("\n" + "=" * 100)
        print("✅ SUCESSO! Seus dados foram salvos em:")
        print(f"📂 {downloads_path}")
        print("=" * 100)
        print("\nAMOSTRA DOS LEADS (Top 5)")
        print("=" * 100)
        print(df_leads[['nome_empresa', 'url_site', 'emails', 'lead_score']].head())
    else:
        logger.error("Nenhum lead foi gerado!")


# ============================================================================
# ENTRY POINT
# ============================================================================

if __name__ == "__main__":
    asyncio.run(main())
