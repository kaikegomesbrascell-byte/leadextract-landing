"""
Google Maps Lead Extractor - Arquivo Principal
Ponto de entrada da aplicação.

Este módulo inicializa a aplicação, configura o logging e
inicia a interface gráfica do Lead Extractor.

Exemplo de uso:
    python main.py
"""

import sys
from error_logger import ErrorLogger
from gui_manager import LeadExtractorGUI


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
