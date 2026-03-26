"""
Error Logger - Sistema de Logging
Gerencia logs de erros, avisos e informações do sistema.
Implementado como Singleton para uso global.
"""

import logging
import sys
from typing import Optional


class ErrorLogger:
    """
    Sistema de logging para rastreamento de erros e eventos.
    Implementado como Singleton para garantir instância única em toda a aplicação.

    Registra logs em arquivo (lead_extractor.log) e console simultaneamente,
    com formatação de timestamp e níveis de log apropriados.
    """

    _instance = None

    def __new__(cls):
        """
        Implementa padrão Singleton.
        Garante que apenas uma instância do logger existe na aplicação.

        Returns:
            ErrorLogger: Instância única do logger
        """
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._inicializar_logger()
        return cls._instance

    def _inicializar_logger(self) -> None:
        """
        Configura o logger com handlers para arquivo e console.

        Configurações:
        - Arquivo: lead_extractor.log (modo append)
        - Console: sys.stdout
        - Formato: timestamp - nível - mensagem
        - Nível: DEBUG (captura todos os níveis)
        """
        # Criar logger
        self.logger = logging.getLogger('LeadExtractor')
        self.logger.setLevel(logging.DEBUG)

        # Evitar duplicação de handlers se já inicializado
        if self.logger.handlers:
            return

        # Formato de log com timestamp
        formato = logging.Formatter(
            '%(asctime)s - %(levelname)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )

        # Handler para arquivo
        file_handler = logging.FileHandler(
            'lead_extractor.log',
            mode='a',
            encoding='utf-8'
        )
        file_handler.setLevel(logging.DEBUG)
        file_handler.setFormatter(formato)

        # Handler para console
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(logging.INFO)
        console_handler.setFormatter(formato)

        # Adicionar handlers ao logger
        self.logger.addHandler(file_handler)
        self.logger.addHandler(console_handler)

    def log_erro(self, mensagem: str, exception: Optional[Exception] = None) -> None:
        """
        Registra erro com traceback opcional.

        Args:
            mensagem: Descrição do erro
            exception: Exceção capturada (opcional) para incluir traceback

        Exemplo:
            >>> logger = ErrorLogger()
            >>> try:
            ...     resultado = 10 / 0
            ... except Exception as e:
            ...     logger.log_erro("Falha ao calcular divisão", exception=e)
        """
        if exception:
            self.logger.error(f"{mensagem}: {str(exception)}", exc_info=True)
        else:
            self.logger.error(mensagem)

    def log_info(self, mensagem: str) -> None:
        """
        Registra informação.

        Args:
            mensagem: Mensagem informativa

        Exemplo:
            >>> logger = ErrorLogger()
            >>> logger.log_info("Extração iniciada: nicho=restaurantes, local=São Paulo")
        """
        self.logger.info(mensagem)

    def log_warning(self, mensagem: str) -> None:
        """
        Registra aviso.

        Args:
            mensagem: Mensagem de aviso

        Exemplo:
            >>> logger = ErrorLogger()
            >>> logger.log_warning("Uso de memória acima de 500MB")
        """
        self.logger.warning(mensagem)
