"""
Playwright Installer - Instalador Automático do Playwright
Verifica e instala o navegador Chromium do Playwright automaticamente.
"""

import subprocess
import sys
import os
from pathlib import Path


def verificar_playwright_instalado() -> bool:
    """
    Verifica se o Playwright Chromium está instalado.
    
    Returns:
        True se instalado, False caso contrário
    """
    try:
        # Verificar se o diretório de browsers do Playwright existe
        if sys.platform == "win32":
            playwright_dir = Path.home() / "AppData" / "Local" / "ms-playwright"
        elif sys.platform == "darwin":
            playwright_dir = Path.home() / "Library" / "Caches" / "ms-playwright"
        else:  # Linux
            playwright_dir = Path.home() / ".cache" / "ms-playwright"
        
        # Verificar se existe algum navegador instalado
        if playwright_dir.exists():
            # Procurar por diretórios de chromium
            chromium_dirs = list(playwright_dir.glob("chromium-*"))
            if chromium_dirs:
                return True
        
        return False
    except Exception:
        return False


def instalar_playwright() -> bool:
    """
    Instala o navegador Chromium do Playwright.
    
    Returns:
        True se instalação bem-sucedida, False caso contrário
    """
    try:
        print("=" * 60)
        print("INSTALAÇÃO DO NAVEGADOR CHROMIUM")
        print("=" * 60)
        print()
        print("O Lead Extractor precisa instalar o navegador Chromium")
        print("para funcionar corretamente.")
        print()
        print("Tamanho do download: ~150MB")
        print("Tempo estimado: 2-5 minutos (depende da sua internet)")
        print()
        print("Esta instalação será feita apenas UMA VEZ.")
        print()
        print("Iniciando instalação...")
        print()
        
        # Executar comando de instalação do Playwright
        result = subprocess.run(
            [sys.executable, "-m", "playwright", "install", "chromium"],
            capture_output=True,
            text=True,
            timeout=600  # 10 minutos de timeout
        )
        
        if result.returncode == 0:
            print()
            print("=" * 60)
            print("✅ INSTALAÇÃO CONCLUÍDA COM SUCESSO!")
            print("=" * 60)
            print()
            print("O navegador Chromium foi instalado.")
            print("O Lead Extractor está pronto para uso!")
            print()
            return True
        else:
            print()
            print("=" * 60)
            print("❌ ERRO NA INSTALAÇÃO")
            print("=" * 60)
            print()
            print("Erro:", result.stderr)
            print()
            return False
            
    except subprocess.TimeoutExpired:
        print()
        print("=" * 60)
        print("❌ TIMEOUT NA INSTALAÇÃO")
        print("=" * 60)
        print()
        print("A instalação demorou muito tempo.")
        print("Verifique sua conexão com a internet e tente novamente.")
        print()
        return False
    except Exception as e:
        print()
        print("=" * 60)
        print("❌ ERRO INESPERADO")
        print("=" * 60)
        print()
        print(f"Erro: {str(e)}")
        print()
        return False


def garantir_playwright_instalado() -> bool:
    """
    Garante que o Playwright está instalado, instalando se necessário.
    
    Returns:
        True se Playwright está disponível, False caso contrário
    """
    if verificar_playwright_instalado():
        return True
    
    # Playwright não está instalado - perguntar ao usuário
    print()
    print("=" * 60)
    print("NAVEGADOR NÃO ENCONTRADO")
    print("=" * 60)
    print()
    print("O Lead Extractor precisa do navegador Chromium para funcionar.")
    print()
    
    resposta = input("Deseja instalar agora? (S/N): ").strip().upper()
    
    if resposta == "S" or resposta == "SIM" or resposta == "Y" or resposta == "YES":
        return instalar_playwright()
    else:
        print()
        print("Instalação cancelada pelo usuário.")
        print()
        print("Para instalar manualmente, execute:")
        print("  python -m playwright install chromium")
        print()
        return False
