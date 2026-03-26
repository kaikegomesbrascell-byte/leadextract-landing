"""
LeadExtract Core - Sistema de Extração e Enriquecimento de Leads B2B
Arquitetura assíncrona com 4 módulos: Scraper, Crawler, Enriquecimento e Scoring
"""

import asyncio
import re
import random
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime
import aiohttp
from playwright.async_api import async_playwright, Page, Browser
from bs4 import BeautifulSoup
import pandas as pd
from urllib.parse import urljoin, urlparse
import logging

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@dataclass
class Lead:
    """Estrutura de dados do Lead"""
    nome_empresa: str
    url_site: Optional[str] = None
    endereco: Optional[str] = None
    telefone_publico: Optional[str] = None
    email_contato: Optional[str] = None
    email_rh: Optional[str] = None
    email_comercial: Optional[str] = None
    whatsapp: Optional[str] = None
    linkedin: Optional[str] = None
    instagram: Optional[str] = None
    tem_gtm: bool = False
    tem_facebook_pixel: bool = False
    cnpj: Optional[str] = None
    data_abertura: Optional[str] = None
    capital_social: Optional[float] = None
    socios: Optional[str] = None
    lead_score: int = 0


class MapsScraper:
    """Módulo 1: Scraper de Google Maps Stealth"""
    
    def __init__(self):
        self.user_agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ]
    
    async def _simulate_human_scroll(self, page: Page) -> None:
        """Simula scroll humano com variações de velocidade"""
        try:
            for _ in range(random.randint(3, 6)):
                await page.mouse.wheel(0, random.randint(300, 800))
                await asyncio.sleep(random.uniform(0.5, 1.5))
        except Exception as e:
            logger.warning(f"Erro ao simular scroll: {e}")
    
    async def scrape_maps(self, termo_busca: str, max_resultados: int = 50) -> List[Lead]:
        """
        Extrai leads do Google Maps com comportamento humano
        
        Args:
            termo_busca: Termo de busca (ex: 'Energia Solar em São Paulo')
            max_resultados: Número máximo de resultados
            
        Returns:
            Lista de objetos Lead com dados básicos
        """
        leads: List[Lead] = []
        
        try:
            async with async_playwright() as p:
                browser = await p.chromium.launch(
                    headless=True,
                    args=[
                        '--disable-blink-features=AutomationControlled',
                        '--disable-dev-shm-usage',
                        '--no-sandbox'
                    ]
                )
                
                context = await browser.new_context(
                    user_agent=random.choice(self.user_agents),
                    viewport={'width': 1920, 'height': 1080},
                    locale='pt-BR'
                )
                
                # Injetar playwright-stealth
                await context.add_init_script("""
                    Object.defineProperty(navigator, 'webdriver', {get: () => undefined});
                    window.chrome = {runtime: {}};
                """)
                
                page = await context.new_page()
                
                # Buscar no Google Maps
                search_url = f"https://www.google.com/maps/search/{termo_busca.replace(' ', '+')}"
                await page.goto(search_url, wait_until='networkidle', timeout=30000)
                await asyncio.sleep(random.uniform(2, 4))
                
                # Scroll para carregar mais resultados
                await self._simulate_human_scroll(page)
                
                # Extrair resultados
                await page.wait_for_selector('div[role="article"]', timeout=10000)
                resultados = await page.query_selector_all('div[role="article"]')
                
                for idx, resultado in enumerate(resultados[:max_resultados]):
                    try:
                        # Clicar no resultado
                        await resultado.click()
                        await asyncio.sleep(random.uniform(1, 2))
                        
                        # Extrair dados
                        nome = await page.locator('h1').first.inner_text() if await page.locator('h1').count() > 0 else "N/A"
                        
                        # URL do site
                        url_site = None
                        try:
                            url_element = page.locator('a[data-item-id="authority"]').first
                            if await url_element.count() > 0:
                                url_site = await url_element.get_attribute('href')
                        except:
                            pass
                        
                        # Endereço
                        endereco = None
                        try:
                            endereco_element = page.locator('button[data-item-id="address"]').first
                            if await endereco_element.count() > 0:
                                endereco = await endereco_element.inner_text()
                        except:
                            pass
                        
                        # Telefone
                        telefone = None
                        try:
                            telefone_element = page.locator('button[data-item-id^="phone"]').first
                            if await telefone_element.count() > 0:
                                telefone = await telefone_element.inner_text()
                        except:
                            pass
                        
                        lead = Lead(
                            nome_empresa=nome,
                            url_site=url_site,
                            endereco=endereco,
                            telefone_publico=telefone
                        )
                        
                        leads.append(lead)
                        logger.info(f"Lead {idx+1}/{max_resultados} extraído: {nome}")
                        
                    except Exception as e:
                        logger.error(f"Erro ao extrair resultado {idx}: {e}")
                        continue
                
                await browser.close()
                
        except Exception as e:
            logger.error(f"Erro crítico no scraper de Maps: {e}")
        
        return leads


class DeepCrawler:
    """Módulo 2: Deep Crawler para invasão de sites"""
    
    def __init__(self):
        self.email_regex = re.compile(
            r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        )
        self.whatsapp_regex = re.compile(
            r'(?:wa\.me/|whatsapp\.com/send\?phone=|tel:)(\d{10,15})'
        )
    
    async def _extract_social_links(self, soup: BeautifulSoup, base_url: str) -> Tuple[Optional[str], Optional[str]]:
        """Extrai links de redes sociais"""
        linkedin = None
        instagram = None
        
        for link in soup.find_all('a', href=True):
            href = link['href'].lower()
            if 'linkedin.com' in href and not linkedin:
                linkedin = urljoin(base_url, link['href'])
            elif 'instagram.com' in href and not instagram:
                instagram = urljoin(base_url, link['href'])
        
        return linkedin, instagram
    
    async def _extract_emails(self, html: str) -> Dict[str, Optional[str]]:
        """Extrai e-mails categorizados"""
        emails = self.email_regex.findall(html.lower())
        
        email_contato = None
        email_rh = None
        email_comercial = None
        
        for email in emails:
            if not email_contato and any(x in email for x in ['contato', 'contact', 'info']):
                email_contato = email
            elif not email_rh and any(x in email for x in ['rh', 'recrutamento', 'vagas', 'hr']):
                email_rh = email
            elif not email_comercial and any(x in email for x in ['comercial', 'vendas', 'sales']):
                email_comercial = email
        
        # Se não encontrou categorizados, pega o primeiro genérico
        if not email_contato and emails:
            email_contato = emails[0]
        
        return {
            'email_contato': email_contato,
            'email_rh': email_rh,
            'email_comercial': email_comercial
        }
    
    async def _extract_whatsapp(self, html: str) -> Optional[str]:
        """Extrai número de WhatsApp"""
        matches = self.whatsapp_regex.findall(html)
        return matches[0] if matches else None
    
    async def _detect_marketing_stack(self, html: str) -> Tuple[bool, bool]:
        """Detecta Google Tag Manager e Facebook Pixel"""
        tem_gtm = 'gtm.js' in html or 'googletagmanager.com' in html
        tem_fb_pixel = 'fbevents.js' in html or 'facebook.com/tr' in html
        return tem_gtm, tem_fb_pixel
    
    async def crawl_website(self, lead: Lead) -> Lead:
        """
        Faz deep crawl no site da empresa
        
        Args:
            lead: Objeto Lead com URL do site
            
        Returns:
            Lead enriquecido com dados do site
        """
        if not lead.url_site:
            logger.warning(f"Lead {lead.nome_empresa} sem URL de site")
            return lead
        
        try:
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                context = await browser.new_context(
                    user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                )
                
                # Stealth mode
                await context.add_init_script("""
                    Object.defineProperty(navigator, 'webdriver', {get: () => undefined});
                """)
                
                page = await context.new_page()
                
                try:
                    await page.goto(lead.url_site, wait_until='networkidle', timeout=20000)
                    await asyncio.sleep(random.uniform(1, 2))
                    
                    html = await page.content()
                    soup = BeautifulSoup(html, 'html.parser')
                    
                    # Extrair dados
                    linkedin, instagram = await self._extract_social_links(soup, lead.url_site)
                    emails = await self._extract_emails(html)
                    whatsapp = await self._extract_whatsapp(html)
                    tem_gtm, tem_fb_pixel = await self._detect_marketing_stack(html)
                    
                    # Atualizar lead
                    lead.linkedin = linkedin
                    lead.instagram = instagram
                    lead.email_contato = emails['email_contato']
                    lead.email_rh = emails['email_rh']
                    lead.email_comercial = emails['email_comercial']
                    lead.whatsapp = whatsapp
                    lead.tem_gtm = tem_gtm
                    lead.tem_facebook_pixel = tem_fb_pixel
                    
                    logger.info(f"Crawl completo: {lead.nome_empresa}")
                    
                except Exception as e:
                    logger.error(f"Erro ao crawlear {lead.url_site}: {e}")
                
                await browser.close()
                
        except Exception as e:
            logger.error(f"Erro crítico no crawler: {e}")
        
        return lead


class ReceitaWSEnricher:
    """Módulo 3: Enriquecimento via API ReceitaWS"""
    
    def __init__(self):
        self.base_url = "https://www.receitaws.com.br/v1/cnpj/"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def _get_session(self) -> aiohttp.ClientSession:
        """Cria ou retorna sessão HTTP"""
        if not self.session:
            self.session = aiohttp.ClientSession()
        return self.session
    
    async def _search_cnpj_by_name(self, nome_empresa: str) -> Optional[str]:
        """
        Busca CNPJ pelo nome da empresa (simulação - API real requer CNPJ)
        Na produção, use uma API de busca de CNPJ ou scraping da Receita Federal
        """
        # TODO: Implementar busca real de CNPJ por nome
        # Por enquanto, retorna None para simular que não encontrou
        return None
    
    async def enrich_with_receita(self, lead: Lead, max_retries: int = 3) -> Lead:
        """
        Enriquece lead com dados da Receita Federal
        
        Args:
            lead: Objeto Lead
            max_retries: Número máximo de tentativas
            
        Returns:
            Lead enriquecido com dados da Receita
        """
        # Buscar CNPJ pelo nome
        cnpj = await self._search_cnpj_by_name(lead.nome_empresa)
        
        if not cnpj:
            logger.warning(f"CNPJ não encontrado para {lead.nome_empresa}")
            return lead
        
        session = await self._get_session()
        
        for attempt in range(max_retries):
            try:
                # Backoff exponencial
                if attempt > 0:
                    await asyncio.sleep(2 ** attempt)
                
                async with session.get(f"{self.base_url}{cnpj}") as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        lead.cnpj = cnpj
                        lead.data_abertura = data.get('abertura')
                        lead.capital_social = float(data.get('capital_social', '0').replace('.', '').replace(',', '.'))
                        
                        # Extrair sócios
                        qsa = data.get('qsa', [])
                        if qsa:
                            socios = ', '.join([s.get('nome', '') for s in qsa[:3]])
                            lead.socios = socios
                        
                        logger.info(f"Enriquecido com Receita: {lead.nome_empresa}")
                        break
                        
                    elif response.status == 429:
                        logger.warning(f"Rate limit atingido, tentativa {attempt+1}/{max_retries}")
                        continue
                    else:
                        logger.error(f"Erro na API ReceitaWS: {response.status}")
                        break
                        
            except Exception as e:
                logger.error(f"Erro ao enriquecer {lead.nome_empresa}: {e}")
                if attempt == max_retries - 1:
                    break
        
        return lead
    
    async def close(self):
        """Fecha a sessão HTTP"""
        if self.session:
            await self.session.close()


class LeadScorer:
    """Módulo 4: Motor de Scoring"""
    
    @staticmethod
    def calculate_score(lead: Lead) -> int:
        """
        Calcula score do lead de 0 a 10
        
        Regras:
        - Sem Pixel/GTM = +3 pontos (precisam de marketing)
        - Idade < 1 ano = +3 pontos (estão expandindo)
        - WhatsApp/Email direto = +4 pontos (contato fácil)
        
        Args:
            lead: Objeto Lead
            
        Returns:
            Score de 0 a 10
        """
        score = 0
        
        # Sem stack de marketing
        if not lead.tem_gtm and not lead.tem_facebook_pixel:
            score += 3
        
        # Empresa jovem (< 1 ano)
        if lead.data_abertura:
            try:
                data_abertura = datetime.strptime(lead.data_abertura, '%d/%m/%Y')
                idade_dias = (datetime.now() - data_abertura).days
                if idade_dias < 365:
                    score += 3
            except:
                pass
        
        # Contato fácil
        if lead.whatsapp or lead.email_contato:
            score += 4
        
        return min(score, 10)  # Limitar a 10


class LeadExtractPipeline:
    """Pipeline principal orquestrando todos os módulos"""
    
    def __init__(self):
        self.maps_scraper = MapsScraper()
        self.deep_crawler = DeepCrawler()
        self.receita_enricher = ReceitaWSEnricher()
        self.scorer = LeadScorer()
    
    async def process_lead(self, lead: Lead) -> Lead:
        """Processa um lead individual através do pipeline"""
        try:
            # Módulo 2: Deep Crawl
            lead = await self.deep_crawler.crawl_website(lead)
            
            # Módulo 3: Enriquecimento Receita
            lead = await self.receita_enricher.enrich_with_receita(lead)
            
            # Módulo 4: Scoring
            lead.lead_score = self.scorer.calculate_score(lead)
            
        except Exception as e:
            logger.error(f"Erro ao processar lead {lead.nome_empresa}: {e}")
        
        return lead
    
    async def run(self, termo_busca: str, max_resultados: int = 50) -> pd.DataFrame:
        """
        Executa o pipeline completo
        
        Args:
            termo_busca: Termo de busca para o Maps
            max_resultados: Número máximo de leads
            
        Returns:
            DataFrame com leads enriquecidos
        """
        logger.info(f"Iniciando pipeline para: {termo_busca}")
        
        # Módulo 1: Scraping Maps
        logger.info("Módulo 1: Extraindo leads do Google Maps...")
        leads = await self.maps_scraper.scrape_maps(termo_busca, max_resultados)
        logger.info(f"Extraídos {len(leads)} leads do Maps")
        
        if not leads:
            logger.warning("Nenhum lead encontrado")
            return pd.DataFrame()
        
        # Processar leads em paralelo (com limite de concorrência)
        logger.info("Módulos 2-4: Processando leads em paralelo...")
        semaphore = asyncio.Semaphore(5)  # Máximo 5 requisições simultâneas
        
        async def process_with_semaphore(lead: Lead) -> Lead:
            async with semaphore:
                return await self.process_lead(lead)
        
        leads_enriquecidos = await asyncio.gather(
            *[process_with_semaphore(lead) for lead in leads],
            return_exceptions=True
        )
        
        # Filtrar exceções
        leads_validos = [l for l in leads_enriquecidos if isinstance(l, Lead)]
        
        # Converter para DataFrame
        df = pd.DataFrame([asdict(lead) for lead in leads_validos])
        
        # Ordenar por score
        df = df.sort_values('lead_score', ascending=False)
        
        # Fechar recursos
        await self.receita_enricher.close()
        
        logger.info(f"Pipeline concluído: {len(leads_validos)} leads processados")
        
        return df


async def main():
    """Função principal assíncrona"""
    # Configuração
    TERMO_BUSCA = "Energia Solar em São Paulo"
    MAX_RESULTADOS = 20
    OUTPUT_FILE = "leads_enriquecidos_brutal.csv"
    
    # Executar pipeline
    pipeline = LeadExtractPipeline()
    df = await pipeline.run(TERMO_BUSCA, MAX_RESULTADOS)
    
    # Salvar CSV
    if not df.empty:
        df.to_csv(OUTPUT_FILE, index=False, encoding='utf-8-sig')
        logger.info(f"✅ Arquivo salvo: {OUTPUT_FILE}")
        logger.info(f"📊 Total de leads: {len(df)}")
        logger.info(f"🏆 Leads com score >= 7: {len(df[df['lead_score'] >= 7])}")
    else:
        logger.warning("Nenhum dado para salvar")


if __name__ == "__main__":
    asyncio.run(main())
