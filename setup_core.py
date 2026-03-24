"""
Script de setup para LeadExtract Core
Instala dependências e configura o ambiente
"""

import subprocess
import sys
import os


def run_command(command: str, description: str):
    """Executa comando e exibe progresso"""
    print(f"\n{'='*60}")
    print(f"🔧 {description}")
    print(f"{'='*60}")
    
    try:
        result = subprocess.run(
            command,
            shell=True,
            check=True,
            capture_output=True,
            text=True
        )
        print(f"✅ {description} - Concluído")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Erro: {e}")
        print(f"Output: {e.output}")
        return False


def main():
    """Setup principal"""
    print("""
    ╔═══════════════════════════════════════════════════════════╗
    ║         LeadExtract Core - Setup Automático               ║
    ║         Sistema de Extração B2B Indetectável             ║
    ╚═══════════════════════════════════════════════════════════╝
    """)
    
    # Verificar Python
    python_version = sys.version_info
    if python_version.major < 3 or (python_version.major == 3 and python_version.minor < 10):
        print("❌ Python 3.10+ é necessário")
        sys.exit(1)
    
    print(f"✅ Python {python_version.major}.{python_version.minor}.{python_version.micro} detectado")
    
    # Instalar dependências
    steps = [
        ("pip install -r requirements_core.txt", "Instalando dependências Python"),
        ("playwright install chromium", "Instalando navegador Chromium para Playwright"),
    ]
    
    for command, description in steps:
        if not run_command(command, description):
            print(f"\n❌ Falha no setup: {description}")
            sys.exit(1)
    
    print("""
    ╔═══════════════════════════════════════════════════════════╗
    ║                  ✅ SETUP CONCLUÍDO                       ║
    ╚═══════════════════════════════════════════════════════════╝
    
    📝 Próximos passos:
    
    1. Execute o pipeline:
       python lead_extractor_core.py
    
    2. Personalize a busca editando a função main():
       TERMO_BUSCA = "Seu nicho em Sua cidade"
       MAX_RESULTADOS = 50
    
    3. O arquivo leads_enriquecidos_brutal.csv será gerado
    
    ⚠️  IMPORTANTE:
    - Use com responsabilidade e respeite os termos de serviço
    - Implemente delays entre requisições em produção
    - Configure proxies rotativos para volume alto
    
    🚀 Bom scraping!
    """)


if __name__ == "__main__":
    main()
