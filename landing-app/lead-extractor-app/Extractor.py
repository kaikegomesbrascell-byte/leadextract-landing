"""
Google Maps Lead Extractor - Arquivo Principal
Ponto de entrada da aplicação.

Este módulo inicializa a aplicação, configura o logging e
inicia a interface gráfica do Lead Extractor.

Exemplo de uso:
    python main.py
"""

import sys
import os
from pathlib import Path
from error_logger import ErrorLogger
from gui_manager import LeadExtractorGUI


def verificar_playwright_instalado() -> bool:
    """
    Verifica se o navegador Chromium do Playwright está instalado.
    
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


def main():
    """
    Função principal da aplicação.
    
    Inicializa o sistema de logging, cria a interface gráfica
    e inicia o loop principal do CustomTkinter.
    
    Returns:
        int: Código de saída (0 para sucesso, 1 para erro)
    
    Exemplo:
        >>> main()
        # Inicia a aplicação GUI
    """
    try:
        # Configurar logging inicial
        logger = ErrorLogger()
        logger.log_info("=" * 60)
        logger.log_info("Google Maps Lead Extractor - Iniciando aplicação")
        logger.log_info("=" * 60)
        
        # Verificar se Playwright está instalado (apenas se rodando como executável)
        if getattr(sys, 'frozen', False):
            logger.log_info("Verificando instalação do Playwright...")
            if not verificar_playwright_instalado():
                logger.log_erro("Navegador Chromium não está instalado")
                
                # Mostrar mensagem de erro amigável
                print("\n" + "=" * 70)
                print("❌ NAVEGADOR NÃO ENCONTRADO")
                print("=" * 70)
                print()
                print("O Lead Extractor precisa do navegador Chromium para funcionar.")
                print()
                print("COMO INSTALAR:")
                print()
                print("1. Abra o Prompt de Comando (CMD) ou PowerShell")
                print("2. Execute o seguinte comando:")
                print()
                print("   python -m playwright install chromium")
                print()
                print("3. Aguarde o download terminar (~150MB)")
                print("4. Execute o Lead Extractor novamente")
                print()
                print("=" * 70)
                print()
                
                input("Pressione ENTER para sair...")
                return 1
            
            logger.log_info("Playwright verificado com sucesso!")
        
        # Criar instância da GUI
        logger.log_info("Criando interface gráfica...")
        app = LeadExtractorGUI()
        
        # Criar interface
        logger.log_info("Construindo componentes da interface...")
        app.criar_interface()
        
        # Iniciar mainloop do CustomTkinter
        logger.log_info("Interface pronta! Iniciando aplicação...")
        logger.log_info("=" * 60)
        app.root.mainloop()
        
        # Aplicação encerrada normalmente
        logger.log_info("Aplicação encerrada pelo usuário")
        return 0
        
    except KeyboardInterrupt:
        # Usuário pressionou Ctrl+C
        logger = ErrorLogger()
        logger.log_warning("Aplicação interrompida pelo usuário (Ctrl+C)")
        return 0
        
    except Exception as e:
        # Erro não tratado
        logger = ErrorLogger()
        logger.log_erro("Erro fatal não tratado na aplicação", e)
        print(f"\n✗ Erro fatal: {str(e)}")
        print("Consulte o arquivo lead_extractor.log para mais detalhes.")
        return 1


if __name__ == "__main__":
    """
    Ponto de entrada quando o script é executado diretamente.
    """
    sys.exit(main())
