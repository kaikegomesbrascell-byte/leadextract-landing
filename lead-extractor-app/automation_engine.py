"""
Automation Engine - Motor de Automação
Responsável pela automação do navegador e extração de dados do Google Maps.
"""

from typing import Optional, Dict, List, Callable
from playwright.async_api import Browser, Page, Playwright, async_playwright
import threading
import asyncio
import random
import psutil
import os
import sys
from pathlib import Path
from error_logger import ErrorLogger
from models import SearchQuery, Lead


def _get_playwright_browsers_path():
    """
    Retorna o caminho para os navegadores do Playwright.
    
    Se estiver rodando como executável PyInstaller, usa o caminho do sistema do usuário.
    Caso contrário, usa o caminho padrão do Playwright.
    """
    # Detectar se está rodando como executável PyInstaller
    if getattr(sys, 'frozen', False):
        # Rodando como executável - usar caminho do sistema do usuário
        if sys.platform == "win32":
            browsers_path = Path.home() / "AppData" / "Local" / "ms-playwright"
        elif sys.platform == "darwin":
            browsers_path = Path.home() / "Library" / "Caches" / "ms-playwright"
        else:  # Linux
            browsers_path = Path.home() / ".cache" / "ms-playwright"
        
        # Configurar variável de ambiente para o Playwright
        os.environ["PLAYWRIGHT_BROWSERS_PATH"] = str(browsers_path)
        
        return browsers_path
    else:
        # Rodando como script Python - usar caminho padrão
        return None


# Configurar caminho dos navegadores ao importar o módulo
_get_playwright_browsers_path()


# Dicionário de seletores CSS do Google Maps
GOOGLE_MAPS_SELECTORS = {
    # Barra lateral de resultados
    "results_panel": 'div[role="feed"]',
    "result_item": 'div[role="article"]',

    # Dados da empresa
    "nome": 'h1.DUwDvf',
    "telefone": 'button[data-item-id^="phone"]',
    "site": 'a[data-item-id="authority"]',
    "nota": 'span.MW4etd',
    "comentarios": 'span.UY7F9',
    "endereco": 'button[data-item-id^="address"]',
    "area": 'button[data-item-id^="area"]',  # Área em metros quadrados

    # Navegação
    "scroll_container": 'div[role="feed"]',
    "loading_indicator": 'div.fontBodyMedium'
}


class GoogleMapsAutomation:
    """
    Motor de automação para extração de leads do Google Maps.
    Utiliza Playwright com asyncio para controle assíncrono do navegador.
    """

    def __init__(self, headless: bool = True):
        """
        Inicializa o motor de automação.

        Args:
            headless: Se True, executa navegador em modo headless (sem interface gráfica).
                     Se False, exibe o navegador durante a execução.

        Exemplo:
            >>> automation = GoogleMapsAutomation(headless=True)
            >>> # Navegador será executado em modo headless (sem interface)
        """
        self.headless: bool = headless
        self.browser: Optional[Browser] = None
        self.page: Optional[Page] = None
        self.playwright: Optional[Playwright] = None
        self.logger = ErrorLogger()
        self.process = psutil.Process(os.getpid())
        self.memory_threshold_mb = 500  # Limite de 500MB conforme requisito 11.3

    async def inicializar_navegador(self) -> None:
        """
        Inicializa Playwright e abre navegador Chromium com configurações anti-bot.

        Configura:
        - User-Agent realista de navegador moderno
        - Viewport de desktop (1920x1080)
        - Chromium em modo headless configurável

        Implementa retry logic com 3 tentativas em caso de falha.

        Raises:
            Exception: Se falhar após 3 tentativas de inicialização

        Exemplo:
            >>> automation = GoogleMapsAutomation()
            >>> await automation.inicializar_navegador()
            >>> # Navegador Chromium inicializado e pronto para uso
        """
        max_tentativas = 3
        tentativa_atual = 0

        while tentativa_atual < max_tentativas:
            try:
                tentativa_atual += 1
                self.logger.log_info(
                    f"Inicializando navegador (tentativa {tentativa_atual}/{max_tentativas})...")

                # Inicializar Playwright async
                self.playwright = await async_playwright().start()

                # Configurar User-Agent realista
                user_agent = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                             "AppleWebKit/537.36 (KHTML, like Gecko) "
                             "Chrome/120.0.0.0 Safari/537.36")

                # Inicializar Chromium com configurações
                self.browser = await self.playwright.chromium.launch(
                    headless=self.headless,
                    args=[
                        '--disable-blink-features=AutomationControlled',  # Evita detecção de automação
                        '--disable-dev-shm-usage',  # Evita problemas de memória compartilhada
                        '--no-sandbox',  # Necessário em alguns ambientes
                    ]
                )

                # Criar contexto do navegador com User-Agent e viewport
                context = await self.browser.new_context(
                    user_agent=user_agent,
                    viewport={'width': 1920, 'height': 1080}
                )

                # Abrir nova página do navegador
                self.page = await context.new_page()

                # Remover propriedades que indicam automação
                await self.page.add_init_script("""
                    Object.defineProperty(navigator, 'webdriver', {
                        get: () => undefined
                    });
                """)

                self.logger.log_info("Navegador inicializado com sucesso!")
                return  # Sucesso - sair do loop

            except Exception as e:
                self.logger.log_erro(
                    f"Erro ao inicializar navegador (tentativa {tentativa_atual}/{max_tentativas})",
                    e
                )

                # Limpar recursos em caso de erro
                if self.browser:
                    try:
                        await self.browser.close()
                    except Exception:
                        pass
                if self.playwright:
                    try:
                        await self.playwright.stop()
                    except Exception:
                        pass

                # Se não for a última tentativa, aguardar antes de tentar novamente
                if tentativa_atual < max_tentativas:
                    self.logger.log_info("Aguardando 5 segundos antes de tentar novamente...")
                    await asyncio.sleep(5)
                else:
                    # Última tentativa falhou - lançar exceção
                    self.logger.log_erro(
                        "Falha ao inicializar navegador após todas as tentativas", e)
                    raise Exception(
                        f"Não foi possível inicializar o navegador após {max_tentativas} tentativas: {
                            str(e)}")

    async def buscar_empresas(
        self,
        nicho: str,
        localizacao: str,
        limite: int,
        callback: Callable[[Dict, float], None],
        stop_flag: threading.Event
    ) -> List[Dict[str, str]]:
        """
        Busca empresas no Google Maps e extrai dados.

        Este método coordena todo o processo de extração:
        1. Valida os parâmetros de busca
        2. Navega para o Google Maps
        3. Realiza scroll para carregar resultados
        4. Extrai dados de cada empresa
        5. Atualiza a UI via callback a cada 5 leads
        6. Verifica stop_flag para permitir cancelamento

        Args:
            nicho: Palavra-chave ou nicho de negócio (ex: "restaurantes", "dentistas")
            localizacao: Cidade ou região (ex: "São Paulo", "Rio de Janeiro")
            limite: Número máximo de leads a extrair (50, 100 ou 500)
            callback: Função para atualizar progresso na UI. Recebe (lead_dict, progresso_float)
            stop_flag: threading.Event para sinalizar parada da extração

        Returns:
            Lista de dicionários com dados das empresas extraídas.
            Cada dicionário contém: nome, telefone, site, nota, comentarios, endereco, area

        Raises:
            Exception: Se ocorrer erro durante a navegação ou extração

        Exemplo:
            >>> automation = GoogleMapsAutomation()
            >>> await automation.inicializar_navegador()
            >>> stop_flag = threading.Event()
            >>> def callback(lead, progresso):
            ...     print(f"Lead extraído: {lead['nome']} - Progresso: {progresso*100:.1f}%")
            >>> leads = await automation.buscar_empresas(
            ...     nicho="restaurantes",
            ...     localizacao="São Paulo",
            ...     limite=50,
            ...     callback=callback,
            ...     stop_flag=stop_flag
            ... )
            >>> print(f"Total de leads: {len(leads)}")
        """
        leads_extraidos: List[Dict[str, str]] = []
        telefones_vistos: set = set()  # Conjunto para rastrear telefones únicos

        try:
            # 1. Criar SearchQuery e validar parâmetros
            self.logger.log_info(
                f"Iniciando busca: nicho='{nicho}', localização='{localizacao}', limite={limite}")

            search_query = SearchQuery(
                nicho=nicho.strip(),
                localizacao=localizacao.strip(),
                limite=limite
            )

            # Validar parâmetros
            is_valid, mensagem = search_query.validar()
            if not is_valid:
                self.logger.log_erro(f"Parâmetros de busca inválidos: {mensagem}")
                raise ValueError(f"Parâmetros de busca inválidos: {mensagem}")

            # 2. Navegar para URL do Google Maps
            url = search_query.to_google_maps_url()
            self.logger.log_info(f"Navegando para: {url}")

            # Usar domcontentloaded ao invés de networkidle para Google Maps
            # Google Maps é uma SPA que nunca atinge networkidle devido a requisições contínuas
            await self.page.goto(url, wait_until="domcontentloaded", timeout=60000)
            self.logger.log_info("Página do Google Maps carregada")

            # Aguardar explicitamente pelo painel de resultados aparecer
            try:
                await self.page.wait_for_selector(
                    GOOGLE_MAPS_SELECTORS["results_panel"],
                    timeout=15000,
                    state="visible"
                )
                self.logger.log_info("Painel de resultados detectado")
            except Exception as e:
                self.logger.log_warning(f"Painel de resultados demorou para carregar: {str(e)}")

            # Aguardar um pouco para garantir que a página está totalmente carregada
            await asyncio.sleep(3)

            # 3. Chamar scroll_resultados() para carregar empresas
            self.logger.log_info("Iniciando scroll de resultados...")
            await self.scroll_resultados(limite, stop_flag)

            # Verificar se foi interrompido durante o scroll
            if stop_flag.is_set():
                self.logger.log_info("Extração interrompida pelo usuário durante o scroll")
                return leads_extraidos

            # 4. Iterar sobre empresas e extrair dados
            self.logger.log_info("Iniciando extração de dados das empresas...")

            # Verificar uso de memória antes de iniciar extração
            self.verificar_uso_memoria()

            # Localizar todos os elementos de empresas na barra lateral
            results_panel = await self.page.query_selector(GOOGLE_MAPS_SELECTORS["results_panel"])

            if not results_panel:
                self.logger.log_erro("Painel de resultados não encontrado")
                raise Exception("Não foi possível localizar o painel de resultados do Google Maps")

            # Obter todos os itens de resultado
            result_items = await results_panel.query_selector_all(GOOGLE_MAPS_SELECTORS["result_item"])
            total_items = len(result_items)

            self.logger.log_info(f"Encontrados {total_items} itens de resultado")

            # Limitar ao número solicitado
            items_to_process = min(total_items, limite)

            for index, item in enumerate(result_items[:items_to_process]):
                # 6. Verificar stop_flag em cada iteração
                if stop_flag.is_set():
                    self.logger.log_info(
                        f"Extração interrompida pelo usuário. Leads extraídos: {
                            len(leads_extraidos)}")
                    break

                # Verificar se já atingiu o limite antes de processar próximo item
                if len(leads_extraidos) >= limite:
                    self.logger.log_info(
                        f"Limite de {limite} leads atingido. Encerrando extração imediatamente.")
                    break

                try:
                    self.logger.log_info(f"Processando empresa {index + 1}/{items_to_process}")

                    # Clicar no item para abrir os detalhes
                    await item.click()

                    # Aguardar delay humano antes de extrair dados (OTIMIZADO - MAIS RÁPIDO)
                    await self.aplicar_delay_humano(0.2, 0.4)

                    # Extrair dados da empresa
                    dados_empresa = await self.extrair_dados_empresa(item)

                    # Validar se o lead é válido (tem pelo menos o nome)
                    lead = Lead.from_dict(dados_empresa)
                    if lead.validar():
                        # Verificar se é duplicata (baseado no telefone)
                        telefone = dados_empresa.get('telefone', 'N/A')
                        
                        # Criar identificador único (telefone + nome para maior precisão)
                        identificador = f"{telefone}_{dados_empresa.get('nome', '')}"
                        
                        if identificador not in telefones_vistos:
                            # Lead único - adicionar
                            telefones_vistos.add(identificador)
                            leads_extraidos.append(dados_empresa)
                            
                            self.logger.log_info(f"Lead único adicionado: {dados_empresa.get('nome', 'N/A')}")

                            # 5. Chamar callback a cada 5 leads para atualizar UI
                            # Também chama no último lead para garantir atualização final
                            if len(leads_extraidos) % 5 == 0 or index == items_to_process - 1:
                                progresso = min(len(leads_extraidos) / limite, 1.0)
                                callback(dados_empresa, progresso)
                                self.logger.log_info(
                                    f"Progresso: {len(leads_extraidos)}/{limite} leads extraídos ({progresso * 100:.1f}%)")

                                # Verificar uso de memória a cada 5 leads
                                self.verificar_uso_memoria()
                        else:
                            self.logger.log_warning(f"Lead duplicado ignorado: {dados_empresa.get('nome', 'N/A')} - {telefone}")
                    else:
                        self.logger.log_warning("Lead inválido ignorado (sem nome válido)")

                except Exception as e:
                    self.logger.log_erro(f"Erro ao processar empresa {index + 1}", e)
                    # Continuar com a próxima empresa
                    continue

            # 7. Retornar lista de leads extraídos
            total_processados = index + 1 if 'index' in locals() else 0
            duplicatas_removidas = total_processados - len(leads_extraidos)
            
            self.logger.log_info(
                f"Extração concluída. Total de leads únicos extraídos: {len(leads_extraidos)}")
            
            if duplicatas_removidas > 0:
                self.logger.log_info(
                    f"Duplicatas removidas: {duplicatas_removidas} leads duplicados foram ignorados")

            # Verificar uso de memória final
            self.verificar_uso_memoria()

            return leads_extraidos

        except Exception as e:
            self.logger.log_erro("Erro durante a busca de empresas", e)
            raise

    async def scroll_resultados(self, limite: int, stop_flag: threading.Event) -> None:
        """
        Realiza scroll infinito na barra lateral de resultados do Google Maps.

        Este método simula comportamento humano com delays aleatórios e
        velocidade de scroll variável para evitar detecção como bot.

        Args:
            limite: Número máximo de resultados a carregar
            stop_flag: threading.Event para permitir cancelamento

        Raises:
            Exception: Se não conseguir localizar o container de scroll

        Exemplo:
            >>> stop_flag = threading.Event()
            >>> await automation.scroll_resultados(limite=100, stop_flag=stop_flag)
            >>> # Scroll executado até carregar 100 resultados ou atingir o fim
        """
        try:
            self.logger.log_info(f"Iniciando scroll de resultados (limite: {limite})")

            # 1. Localizar container de resultados com seletor CSS
            scroll_container = await self.page.query_selector(GOOGLE_MAPS_SELECTORS["scroll_container"])

            if not scroll_container:
                self.logger.log_erro("Container de scroll não encontrado")
                raise Exception("Não foi possível localizar o container de resultados para scroll")

            self.logger.log_info("Container de scroll localizado com sucesso")

            # Variáveis para controle do scroll
            scroll_count = 0
            max_scrolls = limite * 2  # Limite de scrolls para evitar loop infinito
            previous_height = 0
            no_change_count = 0  # Contador de scrolls sem mudança de altura
            max_no_change = 3  # Número máximo de scrolls sem mudança antes de considerar fim

            # 2. Executar scroll infinito com JavaScript
            while scroll_count < max_scrolls:
                # 5. Verificar stop_flag durante scroll
                if stop_flag.is_set():
                    self.logger.log_info("Scroll interrompido pelo usuário")
                    break

                try:
                    # Obter altura atual do scroll container

                    # Executar scroll até o final do container
                    # Usa scrollTo com behavior smooth para simular comportamento humano
                    await scroll_container.evaluate("""
                        element => {
                            element.scrollTo({
                                top: element.scrollHeight,
                                behavior: 'smooth'
                            });
                        }
                    """)

                    scroll_count += 1
                    self.logger.log_info(f"Scroll {scroll_count}/{max_scrolls} executado")

                    # 3. Aplicar delays aleatórios entre 0.5-1.5 segundos (OTIMIZADO - MAIS RÁPIDO)
                    await self.aplicar_delay_humano(0.5, 1.5)

                    # Aguardar um pouco mais para o conteúdo carregar
                    await asyncio.sleep(0.5)

                    # Verificar nova altura após o scroll
                    new_height = await scroll_container.evaluate("element => element.scrollHeight")

                    # 4. Detectar fim dos resultados
                    if new_height == previous_height:
                        no_change_count += 1
                        self.logger.log_info(
                            f"Altura não mudou ({no_change_count}/{max_no_change})")

                        if no_change_count >= max_no_change:
                            self.logger.log_info(
                                "Fim dos resultados detectado (altura não mudou após múltiplos scrolls)")
                            break
                    else:
                        # Altura mudou - resetar contador
                        no_change_count = 0
                        previous_height = new_height

                    # Verificar quantos resultados foram carregados até agora
                    results_panel = await self.page.query_selector(GOOGLE_MAPS_SELECTORS["results_panel"])
                    if results_panel:
                        result_items = await results_panel.query_selector_all(GOOGLE_MAPS_SELECTORS["result_item"])
                        total_loaded = len(result_items)
                        self.logger.log_info(f"Resultados carregados: {total_loaded}")

                        # 4. Atingir limite de resultados
                        if total_loaded >= limite:
                            self.logger.log_info(f"Limite de {limite} resultados atingido")
                            break

                except Exception as e:
                    self.logger.log_erro(f"Erro durante scroll {scroll_count}", e)
                    # Continuar tentando - pode ser erro temporário
                    continue

            self.logger.log_info(f"Scroll concluído após {scroll_count} iterações")

        except Exception as e:
            self.logger.log_erro("Erro crítico durante scroll_resultados", e)
            raise

    async def extrair_dados_empresa(self, elemento) -> Dict[str, str]:
        """
        Extrai dados de uma empresa específica do Google Maps.

        Extrai os seguintes campos:
        - Nome da empresa
        - Telefone (com tratamento de formatação)
        - Site (URL limpa e validada)
        - Nota/Rating numérico
        - Quantidade de comentários
        - Endereço completo

        Se um campo não estiver disponível, retorna 'N/A'.

        Args:
            elemento: Elemento Playwright da empresa

        Returns:
            Dicionário com dados da empresa (chaves em minúsculas)

        Raises:
            Exception: Se ocorrer erro crítico durante a extração

        Exemplo:
            >>> dados = await automation.extrair_dados_empresa(elemento)
            >>> print(dados)
            {
                'nome': 'Restaurante Exemplo',
                'telefone': '(11) 1234-5678',
                'site': 'https://exemplo.com.br',
                'nota': '4.5',
                'comentarios': '123',
                'endereco': 'Rua Exemplo, 123 - São Paulo, SP'
            }
        """
        dados = {
            "nome": "N/A",
            "telefone": "N/A",
            "site": "N/A",
            "nota": "N/A",
            "comentarios": "N/A",
            "endereco": "N/A",
            "area": "N/A"
        }

        # 1. Extrair nome usando seletor h1.DUwDvf
        try:
            nome_element = await self.page.query_selector(GOOGLE_MAPS_SELECTORS["nome"])
            if nome_element:
                nome_text = await nome_element.inner_text()
                if nome_text and nome_text.strip():
                    dados["nome"] = nome_text.strip()
                    self.logger.log_info(f"Nome extraído: {dados['nome']}")
            else:
                self.logger.log_warning("Elemento de nome não encontrado")
        except Exception as e:
            self.logger.log_erro("Erro ao extrair nome da empresa", e)

        # 2. Extrair telefone com tratamento de formatação
        try:
            telefone_element = await self.page.query_selector(GOOGLE_MAPS_SELECTORS["telefone"])
            if telefone_element:
                # Tentar obter o texto do botão de telefone
                telefone_text = await telefone_element.inner_text()
                if telefone_text and telefone_text.strip():
                    # Limpar formatação: remover espaços extras, manter apenas números e
                    # caracteres relevantes
                    telefone_limpo = telefone_text.strip()
                    # Remover prefixos comuns como "Telefone:", "Tel:", etc.
                    telefone_limpo = telefone_limpo.replace(
                        "Telefone:", "").replace("Tel:", "").strip()
                    dados["telefone"] = telefone_limpo
                    self.logger.log_info(f"Telefone extraído: {dados['telefone']}")
            else:
                self.logger.log_warning("Elemento de telefone não encontrado")
        except Exception as e:
            self.logger.log_erro("Erro ao extrair telefone da empresa", e)

        # 3. Extrair site com limpeza de URL
        try:
            site_element = await self.page.query_selector(GOOGLE_MAPS_SELECTORS["site"])
            if site_element:
                # Obter o atributo href que contém a URL
                site_href = await site_element.get_attribute("href")
                if site_href:
                    # Limpar URL: remover parâmetros de rastreamento do Google
                    # URLs do Google Maps geralmente redirecionam através de /url?q=
                    if "/url?q=" in site_href:
                        # Extrair a URL real do parâmetro q
                        import urllib.parse
                        parsed = urllib.parse.urlparse(site_href)
                        params = urllib.parse.parse_qs(parsed.query)
                        if 'q' in params and params['q']:
                            site_limpo = params['q'][0]
                            dados["site"] = site_limpo
                        else:
                            dados["site"] = site_href
                    else:
                        dados["site"] = site_href
                    self.logger.log_info(f"Site extraído: {dados['site']}")
            else:
                self.logger.log_warning("Elemento de site não encontrado")
        except Exception as e:
            self.logger.log_erro("Erro ao extrair site da empresa", e)

        # 4. Extrair nota numérica
        try:
            nota_element = await self.page.query_selector(GOOGLE_MAPS_SELECTORS["nota"])
            if nota_element:
                nota_text = await nota_element.inner_text()
                if nota_text and nota_text.strip():
                    # Extrair apenas o número da nota (pode estar em formato "4,5" ou "4.5")
                    nota_limpa = nota_text.strip().replace(",", ".")
                    dados["nota"] = nota_limpa
                    self.logger.log_info(f"Nota extraída: {dados['nota']}")
            else:
                self.logger.log_warning("Elemento de nota não encontrado")
        except Exception as e:
            self.logger.log_erro("Erro ao extrair nota da empresa", e)

        # 5. Extrair quantidade de comentários
        try:
            comentarios_element = await self.page.query_selector(GOOGLE_MAPS_SELECTORS["comentarios"])
            if comentarios_element:
                comentarios_text = await comentarios_element.inner_text()
                if comentarios_text and comentarios_text.strip():
                    # Limpar texto: pode estar em formato "(123)" ou "123 avaliações"
                    comentarios_limpo = comentarios_text.strip()
                    # Remover parênteses e texto extra
                    comentarios_limpo = comentarios_limpo.replace("(", "").replace(")", "")
                    # Extrair apenas números
                    import re
                    numeros = re.findall(r'\d+', comentarios_limpo)
                    if numeros:
                        dados["comentarios"] = numeros[0]
                    else:
                        dados["comentarios"] = comentarios_limpo
                    self.logger.log_info(f"Comentários extraídos: {dados['comentarios']}")
            else:
                self.logger.log_warning("Elemento de comentários não encontrado")
        except Exception as e:
            self.logger.log_erro("Erro ao extrair comentários da empresa", e)

        # 6. Extrair endereço completo
        try:
            endereco_element = await self.page.query_selector(GOOGLE_MAPS_SELECTORS["endereco"])
            if endereco_element:
                endereco_text = await endereco_element.inner_text()
                if endereco_text and endereco_text.strip():
                    # Limpar endereço: remover prefixos como "Endereço:"
                    endereco_limpo = endereco_text.strip()
                    endereco_limpo = endereco_limpo.replace("Endereço:", "").strip()
                    dados["endereco"] = endereco_limpo
                    self.logger.log_info(f"Endereço extraído: {dados['endereco']}")
            else:
                self.logger.log_warning("Elemento de endereço não encontrado")
        except Exception as e:
            self.logger.log_erro("Erro ao extrair endereço da empresa", e)

        # 7. Extrair área em metros quadrados
        try:
            # Tentar encontrar área usando diferentes seletores possíveis
            area_element = await self.page.query_selector(GOOGLE_MAPS_SELECTORS["area"])
            if area_element:
                area_text = await area_element.inner_text()
                if area_text and area_text.strip():
                    # Limpar texto: pode estar em formato "150 m²" ou "150m²"
                    area_limpa = area_text.strip()
                    # Extrair apenas números
                    import re
                    numeros = re.findall(r'\d+', area_limpa)
                    if numeros:
                        dados["area"] = f"{numeros[0]} m²"
                    else:
                        dados["area"] = area_limpa
                    self.logger.log_info(f"Área extraída: {dados['area']}")
            else:
                # Se não encontrar com o seletor específico, tentar buscar no texto geral
                # Procurar por padrões como "150 m²", "150m²", "150 metros quadrados"
                page_content = await self.page.content()
                import re
                area_patterns = [
                    r'(\d+)\s*m²',
                    r'(\d+)\s*metros?\s*quadrados?',
                    r'(\d+)\s*m2'
                ]
                for pattern in area_patterns:
                    match = re.search(pattern, page_content, re.IGNORECASE)
                    if match:
                        dados["area"] = f"{match.group(1)} m²"
                        self.logger.log_info(f"Área extraída (padrão): {dados['area']}")
                        break
                
                if dados["area"] == "N/A":
                    self.logger.log_warning("Elemento de área não encontrado")
        except Exception as e:
            self.logger.log_erro("Erro ao extrair área da empresa", e)

        # 9. Aplicar delay aleatório após extração (OTIMIZADO - MAIS RÁPIDO)
        await self.aplicar_delay_humano(0.1, 0.3)

        return dados

    async def aplicar_delay_humano(self, min_sec: float = 0.3, max_sec: float = 0.8) -> None:
        """
        Aplica delay aleatório para simular comportamento humano (OTIMIZADO).

        Este método é crucial para evitar detecção como bot pelo Google Maps.
        Usa asyncio.sleep() para não bloquear o event loop.

        Args:
            min_sec: Tempo mínimo de delay em segundos (padrão: 0.3s)
            max_sec: Tempo máximo de delay em segundos (padrão: 0.8s)

        Exemplo:
            >>> await automation.aplicar_delay_humano(0.3, 0.8)
            >>> # Aguarda entre 0.3 e 0.8 segundos de forma assíncrona
        """
        # Gerar delay aleatório entre min_sec e max_sec
        delay = random.uniform(min_sec, max_sec)
        self.logger.log_info(f"Aplicando delay humano de {delay:.2f} segundos")

        # Usar asyncio.sleep() para delay assíncrono
        await asyncio.sleep(delay)

    def verificar_uso_memoria(self) -> None:
        """
        Verifica o uso de memória do processo atual.

        Log warning se o uso de memória ultrapassar 500MB conforme requisito 11.3.
        Este método monitora a memória RAM utilizada pelo processo Python
        para identificar potenciais vazamentos de memória ou uso excessivo.

        Exemplo:
            >>> automation.verificar_uso_memoria()
            >>> # Log: "Uso de memória atual: 245.32 MB"
        """
        try:
            # Obter informações de memória do processo
            memory_info = self.process.memory_info()

            # Converter de bytes para megabytes
            memory_mb = memory_info.rss / (1024 * 1024)

            # Log informação sobre uso atual
            self.logger.log_info(f"Uso de memória atual: {memory_mb:.2f} MB")

            # Verificar se ultrapassou o limite de 500MB
            if memory_mb > self.memory_threshold_mb:
                self.logger.log_warning(
                    f"ALERTA: Uso de memória ultrapassou {self.memory_threshold_mb}MB! "
                    f"Uso atual: {memory_mb:.2f} MB. "
                    f"Considere reduzir o limite de leads ou reiniciar a aplicação."
                )
        except Exception as e:
            self.logger.log_erro("Erro ao verificar uso de memória", e)

    async def fechar_navegador(self) -> None:
        """
        Fecha navegador e libera recursos do Playwright.

        Este método deve ser chamado ao final da extração para
        garantir que todos os recursos sejam liberados adequadamente.

        Realiza as seguintes operações:
        1. Fecha a página do navegador
        2. Fecha o browser
        3. Para o Playwright
        4. Libera todos os recursos
        """
        try:
            self.logger.log_info("Iniciando fechamento do navegador...")

            # 1. Fechar página do navegador
            if self.page:
                try:
                    await self.page.close()
                    self.logger.log_info("Página do navegador fechada")
                except Exception as e:
                    self.logger.log_erro("Erro ao fechar página do navegador", e)
                finally:
                    self.page = None

            # 2. Fechar browser
            if self.browser:
                try:
                    await self.browser.close()
                    self.logger.log_info("Browser fechado")
                except Exception as e:
                    self.logger.log_erro("Erro ao fechar browser", e)
                finally:
                    self.browser = None

            # 3. Parar Playwright
            if self.playwright:
                try:
                    await self.playwright.stop()
                    self.logger.log_info("Playwright parado")
                except Exception as e:
                    self.logger.log_erro("Erro ao parar Playwright", e)
                finally:
                    self.playwright = None

            # 4. Liberar recursos - confirmação final
            self.logger.log_info("Recursos do navegador liberados com sucesso")

        except Exception as e:
            self.logger.log_erro("Erro crítico ao fechar navegador", e)
            # Garantir que os atributos sejam resetados mesmo em caso de erro
            self.page = None
            self.browser = None
            self.playwright = None
