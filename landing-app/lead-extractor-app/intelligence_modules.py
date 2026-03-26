"""
LeadExtract - Módulos de Inteligência Avançada
Sistema de análise B2B para prospecção qualificada
"""

import requests
from bs4 import BeautifulSoup
import re
import time
from typing import Dict, Optional, List
from urllib.parse import urlparse
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class RadarExpansao:
    """
    Módulo A: Radar de Expansão (News & Growth)
    Identifica sinais de crescimento da empresa através de notícias
    """
    
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        self.keywords = [
            "inaugura", "expande", "expansão", "contrata", "vagas",
            "abre", "novo", "investimento", "crescimento", "filial"
        ]
    
    def buscar_noticias(self, nome_empresa: str) -> Dict:
        """
        Busca notícias de expansão da empresa
        
        Args:
            nome_empresa: Nome da empresa para buscar
            
        Returns:
            Dict com título, link e data da notícia mais recente
        """
        try:
            # Construir query de busca
            keywords_query = " OR ".join(self.keywords)
            query = f'"{nome_empresa}" {keywords_query} site:*.com.br OR site:*.com'
            
            # Buscar no Google News (simulação via requests)
            search_url = f"https://www.google.com/search?q={query}&tbm=nws"
            
            response = requests.get(search_url, headers=self.headers, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extrair primeira notícia
            news_items = soup.find_all('div', class_='SoaBEf')
            
            if news_items:
                first_news = news_items[0]
                title_elem = first_news.find('div', role='heading')
                link_elem = first_news.find('a')
                
                titulo = title_elem.get_text() if title_elem else "Notícia encontrada"
                link = link_elem.get('href') if link_elem else ""
                
                return {
                    'status': 'encontrado',
                    'titulo': titulo,
                    'link': link,
                    'relevancia': 'alta' if any(kw in titulo.lower() for kw in ['inaugura', 'expande', 'contrata']) else 'média'
                }
            
            return {
                'status': 'nao_encontrado',
                'titulo': 'Nenhuma notícia recente de expansão',
                'link': '',
                'relevancia': 'baixa'
            }
            
        except requests.Timeout:
            logger.warning(f"Timeout ao buscar notícias para {nome_empresa}")
            return self._resultado_erro("Timeout na busca")
            
        except requests.RequestException as e:
            logger.error(f"Erro ao buscar notícias: {e}")
            return self._resultado_erro("Erro na conexão")
            
        except Exception as e:
            logger.error(f"Erro inesperado no Radar de Expansão: {e}")
            return self._resultado_erro("Erro desconhecido")
    
    def _resultado_erro(self, mensagem: str) -> Dict:
        """Retorna resultado padrão em caso de erro"""
        return {
            'status': 'erro',
            'titulo': mensagem,
            'link': '',
            'relevancia': 'indisponivel'
        }


class RaioXTecnologia:
    """
    Módulo B: Raio-X de Tecnologia (Ads & Pixel Spy)
    Analisa tecnologias de marketing e maturidade digital
    """
    
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    
    def analisar_site(self, url: str) -> Dict:
        """
        Analisa tecnologias presentes no site
        
        Args:
            url: URL do site para analisar
            
        Returns:
            Dict com tecnologias encontradas e score de oportunidade
        """
        try:
            # Garantir que URL tem protocolo
            if not url.startswith(('http://', 'https://')):
                url = 'https://' + url
            
            response = requests.get(url, headers=self.headers, timeout=15)
            response.raise_for_status()
            
            html_content = response.text.lower()
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Detectar tecnologias
            tecnologias = {
                'facebook_pixel': self._detectar_facebook_pixel(html_content),
                'google_tag_manager': self._detectar_gtm(html_content),
                'google_analytics': self._detectar_ga(html_content),
                'hotjar': self._detectar_hotjar(html_content),
                'responsivo': self._detectar_responsivo(soup),
                'https': url.startswith('https://'),
            }
            
            # Calcular score de oportunidade (0-10)
            score = self._calcular_score(tecnologias)
            
            # Gerar diagnóstico
            diagnostico = self._gerar_diagnostico(tecnologias, score)
            
            return {
                'status': 'sucesso',
                'tecnologias': tecnologias,
                'score_oportunidade': score,
                'diagnostico': diagnostico,
                'nivel_maturidade': self._classificar_maturidade(score)
            }
            
        except requests.Timeout:
            logger.warning(f"Timeout ao analisar {url}")
            return self._resultado_erro("Timeout ao acessar site")
            
        except requests.RequestException as e:
            logger.error(f"Erro ao acessar site: {e}")
            return self._resultado_erro("Site inacessível")
            
        except Exception as e:
            logger.error(f"Erro inesperado no Raio-X: {e}")
            return self._resultado_erro("Erro na análise")
    
    def _detectar_facebook_pixel(self, html: str) -> bool:
        """Detecta Facebook Pixel"""
        patterns = ['fbq(', 'facebook.com/tr', 'fbevents.js', 'connect.facebook.net']
        return any(pattern in html for pattern in patterns)
    
    def _detectar_gtm(self, html: str) -> bool:
        """Detecta Google Tag Manager"""
        patterns = ['googletagmanager.com/gtm.js', 'gtm.start', 'gtm-']
        return any(pattern in html for pattern in patterns)
    
    def _detectar_ga(self, html: str) -> bool:
        """Detecta Google Analytics"""
        patterns = ['google-analytics.com/analytics.js', 'ga(', 'gtag(', '_gaq.push']
        return any(pattern in html for pattern in patterns)
    
    def _detectar_hotjar(self, html: str) -> bool:
        """Detecta Hotjar"""
        patterns = ['hotjar.com', 'hj(', '_hjSettings']
        return any(pattern in html for pattern in patterns)
    
    def _detectar_responsivo(self, soup: BeautifulSoup) -> bool:
        """Detecta se site é responsivo"""
        viewport = soup.find('meta', attrs={'name': 'viewport'})
        return viewport is not None
    
    def _calcular_score(self, tecnologias: Dict) -> int:
        """
        Calcula score de oportunidade (0-10)
        Score alto = Maior oportunidade de venda
        """
        score = 10
        
        # Penalizar por cada tecnologia presente (cliente já tem)
        if tecnologias['facebook_pixel']:
            score -= 2
        if tecnologias['google_tag_manager']:
            score -= 2
        if tecnologias['google_analytics']:
            score -= 1
        if tecnologias['hotjar']:
            score -= 2
        if tecnologias['responsivo']:
            score -= 1
        if tecnologias['https']:
            score -= 1
        
        return max(0, score)
    
    def _classificar_maturidade(self, score: int) -> str:
        """Classifica nível de maturidade digital"""
        if score >= 8:
            return "Iniciante - Alto Potencial"
        elif score >= 5:
            return "Intermediário - Bom Potencial"
        elif score >= 3:
            return "Avançado - Potencial Moderado"
        else:
            return "Maduro - Baixo Potencial"
    
    def _gerar_diagnostico(self, tecnologias: Dict, score: int) -> str:
        """Gera diagnóstico para abordagem comercial"""
        faltando = []
        
        if not tecnologias['facebook_pixel']:
            faltando.append("Facebook Pixel")
        if not tecnologias['google_tag_manager']:
            faltando.append("Google Tag Manager")
        if not tecnologias['hotjar']:
            faltando.append("Hotjar")
        if not tecnologias['responsivo']:
            faltando.append("Design Responsivo")
        
        if score >= 7:
            return f"🔥 LEAD QUENTE: Faltam {len(faltando)} tecnologias essenciais ({', '.join(faltando)})"
        elif score >= 4:
            return f"⚡ BOM POTENCIAL: Pode melhorar em {len(faltando)} áreas"
        else:
            return "✅ Cliente já possui boa estrutura digital"
    
    def _resultado_erro(self, mensagem: str) -> Dict:
        """Retorna resultado padrão em caso de erro"""
        return {
            'status': 'erro',
            'tecnologias': {},
            'score_oportunidade': 0,
            'diagnostico': mensagem,
            'nivel_maturidade': 'Indisponível'
        }


class IdentificadorTomVoz:
    """
    Módulo C: Identificador de Tom de Voz (Brand Personality)
    Analisa personalidade da marca através do conteúdo do site
    """
    
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        # Palavras-chave para classificação
        self.keywords_institucional = [
            'tradição', 'experiência', 'anos', 'confiança', 'segurança',
            'excelência', 'qualidade', 'compromisso', 'líder', 'referência'
        ]
        
        self.keywords_moderno = [
            'inovação', 'tecnologia', 'digital', 'inteligente', 'smart',
            'futuro', 'revolucionário', 'disruptivo', 'startup', 'ágil'
        ]
        
        self.keywords_preco = [
            'promoção', 'desconto', 'oferta', 'barato', 'econômico',
            'preço', 'economia', 'grátis', 'free', 'cupom', 'cashback'
        ]
    
    def analisar_tom(self, url: str) -> Dict:
        """
        Analisa tom de voz da marca
        
        Args:
            url: URL do site para analisar
            
        Returns:
            Dict com classificação do tom e insights
        """
        try:
            # Garantir que URL tem protocolo
            if not url.startswith(('http://', 'https://')):
                url = 'https://' + url
            
            response = requests.get(url, headers=self.headers, timeout=15)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extrair meta description
            meta_desc = self._extrair_meta_description(soup)
            
            # Extrair H1s
            h1_tags = self._extrair_h1s(soup)
            
            # Combinar textos para análise
            texto_completo = f"{meta_desc} {' '.join(h1_tags)}".lower()
            
            # Classificar tom
            classificacao = self._classificar_tom(texto_completo)
            
            # Gerar insights
            insights = self._gerar_insights(classificacao, meta_desc, h1_tags)
            
            return {
                'status': 'sucesso',
                'meta_description': meta_desc,
                'h1_tags': h1_tags,
                'tom_voz': classificacao['tom_principal'],
                'confianca': classificacao['confianca'],
                'caracteristicas': classificacao['caracteristicas'],
                'insights': insights
            }
            
        except requests.Timeout:
            logger.warning(f"Timeout ao analisar tom de {url}")
            return self._resultado_erro("Timeout ao acessar site")
            
        except requests.RequestException as e:
            logger.error(f"Erro ao acessar site: {e}")
            return self._resultado_erro("Site inacessível")
            
        except Exception as e:
            logger.error(f"Erro inesperado no Identificador de Tom: {e}")
            return self._resultado_erro("Erro na análise")
    
    def _extrair_meta_description(self, soup: BeautifulSoup) -> str:
        """Extrai meta description"""
        meta = soup.find('meta', attrs={'name': 'description'})
        if not meta:
            meta = soup.find('meta', attrs={'property': 'og:description'})
        return meta.get('content', '') if meta else 'Não encontrada'
    
    def _extrair_h1s(self, soup: BeautifulSoup) -> List[str]:
        """Extrai todas as tags H1"""
        h1_tags = soup.find_all('h1')
        return [h1.get_text(strip=True) for h1 in h1_tags[:5]]  # Limitar a 5
    
    def _classificar_tom(self, texto: str) -> Dict:
        """Classifica o tom de voz baseado em palavras-chave"""
        scores = {
            'institucional': 0,
            'moderno': 0,
            'preco': 0
        }
        
        # Contar ocorrências de palavras-chave
        for keyword in self.keywords_institucional:
            if keyword in texto:
                scores['institucional'] += 1
        
        for keyword in self.keywords_moderno:
            if keyword in texto:
                scores['moderno'] += 1
        
        for keyword in self.keywords_preco:
            if keyword in texto:
                scores['preco'] += 1
        
        # Determinar tom principal
        total_score = sum(scores.values())
        
        if total_score == 0:
            tom_principal = "Neutro/Genérico"
            confianca = "baixa"
            caracteristicas = ["Sem identidade clara"]
        else:
            tom_principal = max(scores, key=scores.get)
            confianca_pct = (scores[tom_principal] / total_score) * 100
            
            if confianca_pct >= 60:
                confianca = "alta"
            elif confianca_pct >= 40:
                confianca = "média"
            else:
                confianca = "baixa"
            
            # Mapear características
            caracteristicas_map = {
                'institucional': ["Formal", "Tradicional", "Confiável"],
                'moderno': ["Inovador", "Tecnológico", "Disruptivo"],
                'preco': ["Promocional", "Acessível", "Competitivo"]
            }
            
            caracteristicas = caracteristicas_map.get(tom_principal, [])
        
        return {
            'tom_principal': tom_principal.title(),
            'confianca': confianca,
            'scores': scores,
            'caracteristicas': caracteristicas
        }
    
    def _gerar_insights(self, classificacao: Dict, meta_desc: str, h1s: List[str]) -> str:
        """Gera insights para abordagem comercial"""
        tom = classificacao['tom_principal'].lower()
        
        insights_map = {
            'institucional': "Empresa valoriza tradição e confiança. Abordagem: Enfatize cases de sucesso e ROI comprovado.",
            'moderno': "Empresa busca inovação. Abordagem: Destaque tecnologias de ponta e diferenciais competitivos.",
            'preco': "Empresa focada em custo-benefício. Abordagem: Apresente economia e resultados mensuráveis.",
            'neutro/genérico': "Identidade de marca pouco definida. Oportunidade: Oferecer consultoria de branding."
        }
        
        return insights_map.get(tom, "Análise inconclusiva")
    
    def _resultado_erro(self, mensagem: str) -> Dict:
        """Retorna resultado padrão em caso de erro"""
        return {
            'status': 'erro',
            'meta_description': 'Indisponível',
            'h1_tags': [],
            'tom_voz': 'Indisponível',
            'confianca': 'baixa',
            'caracteristicas': [],
            'insights': mensagem
        }


def scan_lead(nome_empresa: str, url: str) -> Dict:
    """
    Função principal que executa todos os módulos de inteligência
    
    Args:
        nome_empresa: Nome da empresa para análise
        url: URL do site da empresa
        
    Returns:
        Dict com relatório completo estruturado
    """
    logger.info(f"Iniciando scan completo para: {nome_empresa}")
    
    # Inicializar módulos
    radar = RadarExpansao()
    raio_x = RaioXTecnologia()
    tom_voz = IdentificadorTomVoz()
    
    # Executar análises
    logger.info("Executando Radar de Expansão...")
    noticias = radar.buscar_noticias(nome_empresa)
    time.sleep(1)  # Delay para não sobrecarregar
    
    logger.info("Executando Raio-X de Tecnologia...")
    tecnologias = raio_x.analisar_site(url)
    time.sleep(1)
    
    logger.info("Executando Identificador de Tom de Voz...")
    tom = tom_voz.analisar_tom(url)
    
    # Compilar relatório
    relatorio = {
        'empresa': nome_empresa,
        'url': url,
        'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
        
        # Módulo A: Radar de Expansão
        'expansao_status': noticias['status'],
        'expansao_noticia': noticias['titulo'],
        'expansao_link': noticias['link'],
        'expansao_relevancia': noticias['relevancia'],
        
        # Módulo B: Raio-X Tecnologia
        'tech_score': tecnologias['score_oportunidade'],
        'tech_facebook_pixel': tecnologias.get('tecnologias', {}).get('facebook_pixel', False),
        'tech_gtm': tecnologias.get('tecnologias', {}).get('google_tag_manager', False),
        'tech_hotjar': tecnologias.get('tecnologias', {}).get('hotjar', False),
        'tech_responsivo': tecnologias.get('tecnologias', {}).get('responsivo', False),
        'tech_diagnostico': tecnologias['diagnostico'],
        'tech_maturidade': tecnologias['nivel_maturidade'],
        
        # Módulo C: Tom de Voz
        'tom_voz': tom['tom_voz'],
        'tom_confianca': tom['confianca'],
        'tom_meta_description': tom['meta_description'],
        'tom_h1s': ', '.join(tom['h1_tags']) if tom['h1_tags'] else 'Não encontrado',
        'tom_insights': tom['insights'],
        
        # Score geral de oportunidade
        'score_geral': _calcular_score_geral(noticias, tecnologias, tom)
    }
    
    logger.info(f"Scan completo finalizado. Score geral: {relatorio['score_geral']}/10")
    
    return relatorio


def _calcular_score_geral(noticias: Dict, tecnologias: Dict, tom: Dict) -> int:
    """Calcula score geral de oportunidade (0-10)"""
    score = 0
    
    # Notícias de expansão aumentam score
    if noticias['relevancia'] == 'alta':
        score += 3
    elif noticias['relevancia'] == 'média':
        score += 1
    
    # Score de tecnologia (já vem de 0-10)
    score += tecnologias['score_oportunidade'] * 0.5
    
    # Tom de voz com baixa confiança indica oportunidade
    if tom['confianca'] == 'baixa':
        score += 2
    
    return min(10, int(score))


# Exemplo de uso
if __name__ == "__main__":
    # Teste com empresa exemplo
    resultado = scan_lead(
        nome_empresa="Magazine Luiza",
        url="https://www.magazineluiza.com.br"
    )
    
    print("\n" + "="*80)
    print("RELATÓRIO DE INTELIGÊNCIA - LEADEXTRACT")
    print("="*80)
    print(f"\nEmpresa: {resultado['empresa']}")
    print(f"URL: {resultado['url']}")
    print(f"Data: {resultado['timestamp']}")
    print(f"\n🎯 SCORE GERAL DE OPORTUNIDADE: {resultado['score_geral']}/10")
    
    print("\n📰 RADAR DE EXPANSÃO:")
    print(f"   Status: {resultado['expansao_status']}")
    print(f"   Notícia: {resultado['expansao_noticia']}")
    print(f"   Link: {resultado['expansao_link']}")
    
    print("\n🔍 RAIO-X TECNOLOGIA:")
    print(f"   Score: {resultado['tech_score']}/10")
    print(f"   Diagnóstico: {resultado['tech_diagnostico']}")
    print(f"   Maturidade: {resultado['tech_maturidade']}")
    
    print("\n💬 TOM DE VOZ:")
    print(f"   Classificação: {resultado['tom_voz']}")
    print(f"   Insights: {resultado['tom_insights']}")
    
    print("\n" + "="*80)
