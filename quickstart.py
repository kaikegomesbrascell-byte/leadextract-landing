#!/usr/bin/env python3
"""
LeadExtract Advanced 2.0 - Quick Start Script
Configuração e primeiro uso rápido
"""

import os
import sys
import subprocess
import asyncio
import logging

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)

# Cores para terminal
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'


def print_header(title: str):
    """Printa um header formatado"""
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'=' * 80}")
    print(f"{title}")
    print(f"{'=' * 80}{Colors.ENDC}\n")


def print_success(msg: str):
    """Printa mensagem de sucesso"""
    print(f"{Colors.GREEN}✓ {msg}{Colors.ENDC}")


def print_error(msg: str):
    """Printa mensagem de erro"""
    print(f"{Colors.RED}✗ {msg}{Colors.ENDC}")


def print_info(msg: str):
    """Printa mensagem de info"""
    print(f"{Colors.CYAN}→ {msg}{Colors.ENDC}")


def check_python_version():
    """Verifica se Python 3.10+ está instalado"""
    print_header("VERIFICAÇÃO DE REQUISITOS")
    
    version = sys.version_info
    print_info(f"Python version: {version.major}.{version.minor}.{version.micro}")
    
    if version.major < 3 or (version.major == 3 and version.minor < 10):
        print_error(f"Python 3.10+ é necessário (encontrado: {version.major}.{version.minor})")
        sys.exit(1)
    
    print_success("Python 3.10+ detectado")


def install_dependencies():
    """Instala dependências"""
    print_header("INSTALANDO DEPENDÊNCIAS")
    
    requirements_file = "requirements_advanced.txt"
    
    if not os.path.exists(requirements_file):
        print_error(f"Arquivo '{requirements_file}' não encontrado")
        print_info("Certifique-se de estar no diretório correto")
        sys.exit(1)
    
    print_info("Instalando pacotes Python...")
    
    try:
        subprocess.run(
            [sys.executable, "-m", "pip", "install", "-r", requirements_file, "-q"],
            check=True
        )
        print_success("Dependências Python instaladas")
    except subprocess.CalledProcessError as e:
        print_error(f"Erro ao instalar: {e}")
        sys.exit(1)
    
    # Instalar browsers Playwright
    print_info("Instalando browsers Playwright (isso pode levar alguns minutos)...")
    
    try:
        subprocess.run(
            [sys.executable, "-m", "playwright", "install", "chromium"],
            check=True
        )
        print_success("Browser Chromium instalado")
    except subprocess.CalledProcessError as e:
        print_error(f"Erro ao instalar Playwright: {e}")
        print_info("Tente manualmente: playwright install chromium")
        sys.exit(1)


def verify_installation():
    """Verifica se tudo está instalado corretamente"""
    print_header("VERIFICANDO INSTALAÇÃO")
    
    packages = {
        'asyncio': 'asyncio',
        'aiohttp': 'aiohttp',
        'playwright': 'playwright',
        'bs4': 'BeautifulSoup4',
        'pandas': 'pandas',
    }
    
    all_ok = True
    
    for import_name, display_name in packages.items():
        try:
            __import__(import_name)
            print_success(f"{display_name} verificado")
        except ImportError:
            print_error(f"{display_name} não encontrado")
            all_ok = False
    
    if not all_ok:
        print_error("Alguns pacotes estão faltando!")
        sys.exit(1)
    
    print_success("Todas as dependências verificadas!")


def create_example_config():
    """Cria um arquivo de configuração de exemplo"""
    print_header("CONFIGURAÇÃO INICIAL")
    
    config_template = """
# LeadExtract Advanced 2.0 - Configuração
# Modifique este arquivo com seus parâmetros

TERMO_BUSCA = "Consultoria de Marketing em São Paulo"
LIMITE_EMPRESAS = 50
MAX_CONCURRENT = 5

# Timeouts
TIMEOUT_CRAWL = 10  # segundos
TIMEOUT_MAPS = 30   # segundos

# Rate Limiting (ReceitaWS)
RATE_LIMIT_DELAY = 1.0  # segundos entre requisições

# Logging
LOG_LEVEL = "INFO"  # DEBUG, INFO, WARNING, ERROR

# Selecione o modo de execução
# 1. Por termo de busca (Google Maps)
# 2. Por lista de URLs (Deep Crawl manual)
MODO = 1
"""
    
    config_file = "config_leadextract.py"
    
    if not os.path.exists(config_file):
        with open(config_file, 'w') as f:
            f.write(config_template)
        print_success(f"Arquivo de configuração criado: {config_file}")
        print_info("Edite este arquivo para customizar seus parámetros")
    else:
        print_info(f"Configuração já existe: {config_file}")


async def run_quick_test():
    """Executa um teste rápido do pipeline"""
    print_header("TESTE RÁPIDO DO PIPELINE")
    
    try:
        from lead_extractor_advanced import PipelineLeadExtractor
        
        print_info("Iniciando pipeline de teste...")
        print_info("Termo: 'Consultoria em São Paulo' (limite: 10)")
        
        pipeline = PipelineLeadExtractor(max_concurrent=3)
        
        df = await pipeline.extrair_e_enriquecer(
            termo_busca="Consultoria em São Paulo",
            limite_empresas=10
        )
        
        if not df.empty:
            print_success(f"Pipeline testado com sucesso!")
            print_info(f"Extraídas {len(df)} empresas")
            
            if 'lead_score' in df.columns:
                print_info(f"Score médio: {df['lead_score'].mean():.2f}")
            
            # Mostrar amostra
            print_info("\nAmostra dos resultados:")
            print(df[['nome_empresa', 'lead_score']].head(3).to_string())
        else:
            print_error("Nenhuma empresa foi extraída")
            print_info("Verifique sua conexão e tente novamente")
    
    except ImportError as e:
        print_error(f"Erro ao importar: {e}")
        sys.exit(1)
    except Exception as e:
        print_error(f"Erro no teste: {e}")
        print_info("Verifique os logs para mais detalhes")


def show_next_steps():
    """Mostra próximos passos"""
    print_header("PRÓXIMOS PASSOS")
    
    print(f"""
{Colors.BOLD}1. EDITAR CONFIGURAÇÃO:{Colors.ENDC}
   Modifique 'config_leadextract.py' com seus parâmetros
   
{Colors.BOLD}2. EXECUTAR PIPELINE:{Colors.ENDC}
   Python básico:
   $ python -c "import asyncio; from lead_extractor_advanced import PipelineLeadExtractor; asyncio.run(PipelineLeadExtractor().extrair_e_enriquecer('seu termo', 50))"
   
   Ou use os exemplos:
   $ python exemplos_avancado.py 1    # Exemplo 1 (Extração Básica)
   $ python exemplos_avancado.py 2    # Exemplo 2 (Multi-Nicho)
   $ python exemplos_avancado.py 3    # Exemplo 3 (Filtragem)
   
{Colors.BOLD}3. EXECUTAR TESTES:{Colors.ENDC}
   $ pytest tests_advanced.py -v
   
{Colors.BOLD}4. DOCUMENTAÇÃO:{Colors.ENDC}
   Leia: LEAD_EXTRACTOR_ADVANCED_DOCS.md
   
{Colors.BOLD}5. CUSTOMIZAÇÕES:{Colors.ENDC}
   - Editar critérios de score em ScoringEngine
   - Adicionar novos regex patterns em DeepCrawler
   - Integrar com APIs externas em ReceitaWSEnricher

{Colors.BOLD}📊 SAÍDA:{Colors.ENDC}
   Arquivo CSV com leads enriquecidos será salvo como:
   leads_enriquecidos_brutal.csv
    """)
    
    print(f"{Colors.BOLD}Para dúvidas ou bugs, consulte os logs em:{Colors.ENDC}")
    print("   lead_extractor_advanced.log\n")


def main():
    """Função principal"""
    
    print(f"\n{Colors.BOLD}{Colors.CYAN}")
    print(r"""
    ╔═══════════════════════════════════════════════════════════════════╗
    ║                                                                   ║
    ║          LeadExtract Advanced 2.0 - Quick Start Setup             ║
    ║                                                                   ║
    ║         Pipeline Assíncrono B2B com 4 Módulos Avançados          ║
    ║                                                                   ║
    ╚═══════════════════════════════════════════════════════════════════╝
    """)
    print(Colors.ENDC)
    
    try:
        # 1. Verificar Python
        check_python_version()
        
        # 2. Instalar dependências
        install_dependencies()
        
        # 3. Verificar instalação
        verify_installation()
        
        # 4. Criar config
        create_example_config()
        
        # 5. Teste rápido
        print_info("Executar teste rápido? (S/n): ", end="")
        resposta = input().lower()
        
        if resposta != 'n':
            try:
                asyncio.run(run_quick_test())
            except Exception as e:
                print_error(f"Erro no teste: {e}")
                print_info("Você pode continuar mesmo assim. O pipeline está instalado.")
        
        # 6. Próximos passos
        show_next_steps()
        
        print_success("Setup concluído com sucesso!")
        print(f"{Colors.BOLD}Você está pronto para usar LeadExtract Advanced 2.0!{Colors.ENDC}\n")
    
    except KeyboardInterrupt:
        print_error("\nSetup cancelado pelo usuário")
        sys.exit(0)
    except Exception as e:
        print_error(f"Erro fatal: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
