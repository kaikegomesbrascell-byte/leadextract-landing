"""
License Validator - Validador de Licenças
Gerencia a validação de licenças comerciais do software.
"""

from datetime import datetime
from typing import Optional


class LicenseValidator:
    """
    Validador de licenças para controle de acesso comercial.
    Suporta validação por chave de API e data de expiração.
    """

    def __init__(self, license_file: str = "license.key"):
        """
        Inicializa validador com arquivo de licença.

        Args:
            license_file: Caminho para o arquivo de licença (padrão: "license.key")

        Exemplo:
            >>> validator = LicenseValidator()
            >>> # Usa arquivo padrão "license.key"
            >>> validator_custom = LicenseValidator("minha_licenca.key")
            >>> # Usa arquivo customizado
        """
        self.license_file: str = self._get_resource_path(license_file)
        self.is_valid: bool = False
        self.expiration_date: Optional[datetime] = None
        self.api_key: Optional[str] = None

    def _get_resource_path(self, relative_path: str) -> str:
        """
        Obtém o caminho absoluto para um recurso, funcionando tanto em desenvolvimento
        quanto quando empacotado pelo PyInstaller.

        Args:
            relative_path: Caminho relativo do recurso

        Returns:
            Caminho absoluto do recurso

        Exemplo:
            >>> validator = LicenseValidator()
            >>> path = validator._get_resource_path("license.key")
            >>> # Retorna caminho correto independente de ser .exe ou script
        """
        import sys
        import os

        try:
            # PyInstaller cria uma pasta temporária e armazena o caminho em _MEIPASS
            base_path = sys._MEIPASS
        except AttributeError:
            # Se não estiver rodando como executável, usa o diretório atual
            base_path = os.path.abspath(".")

        return os.path.join(base_path, relative_path)

    def validar_licenca(self) -> tuple[bool, str]:
        """
        Valida a licença do software.

        Verifica a existência do arquivo de licença, valida a estrutura JSON,
        e chama os métodos de verificação de expiração e chave de API.

        Returns:
            Tupla (is_valid, mensagem) onde is_valid indica se a licença é válida
            e mensagem contém detalhes sobre o status da validação

        Exemplo:
            >>> validator = LicenseValidator()
            >>> is_valid, mensagem = validator.validar_licenca()
            >>> if is_valid:
            ...     print(f"Sucesso: {mensagem}")
            ... else:
            ...     print(f"Erro: {mensagem}")
        """
        import json
        import os
        from error_logger import ErrorLogger

        logger = ErrorLogger()

        try:
            # Verificar existência do arquivo
            if not os.path.exists(self.license_file):
                mensagem = f"Arquivo de licença '{self.license_file}' não encontrado"
                logger.log_erro(mensagem)
                self.is_valid = False
                return False, mensagem

            # Ler e parsear arquivo JSON
            try:
                with open(self.license_file, 'r', encoding='utf-8') as f:
                    license_data = json.load(f)
            except json.JSONDecodeError as e:
                mensagem = f"Erro ao ler arquivo de licença: formato JSON inválido - {str(e)}"
                logger.log_erro(mensagem, e)
                self.is_valid = False
                return False, mensagem

            # Validar estrutura JSON
            if 'api_key' not in license_data:
                mensagem = "Licença inválida: campo 'api_key' não encontrado"
                logger.log_erro(mensagem)
                self.is_valid = False
                return False, mensagem

            if 'expiration_date' not in license_data:
                mensagem = "Licença inválida: campo 'expiration_date' não encontrado"
                logger.log_erro(mensagem)
                self.is_valid = False
                return False, mensagem

            # Armazenar dados da licença
            self.api_key = license_data.get('api_key')
            expiration_str = license_data.get('expiration_date')

            # Parsear data de expiração
            try:
                self.expiration_date = datetime.strptime(expiration_str, '%Y-%m-%d')
            except ValueError as e:
                mensagem = f"Formato de data inválido: esperado YYYY-MM-DD, recebido '{expiration_str}'"
                logger.log_erro(mensagem, e)
                self.is_valid = False
                return False, mensagem

            # Verificar expiração
            if not self.verificar_expiracao():
                mensagem = f"Licença expirada em {expiration_str}"
                logger.log_warning(mensagem)
                self.is_valid = False
                return False, mensagem

            # Verificar chave de API
            if not self.verificar_api_key():
                mensagem = f"Chave de API inválida: '{self.api_key}'"
                logger.log_erro(mensagem)
                self.is_valid = False
                return False, mensagem

            # Licença válida
            self.is_valid = True
            mensagem = f"Licença válida até {expiration_str}"
            logger.log_info(mensagem)
            return True, mensagem

        except Exception as e:
            mensagem = f"Erro inesperado ao validar licença: {str(e)}"
            logger.log_erro(mensagem, e)
            self.is_valid = False
            return False, mensagem

    def verificar_expiracao(self) -> bool:
        """
        Verifica se a licença está dentro da validade.

        Compara a data de expiração armazenada com a data atual.

        Returns:
            True se a licença está válida (não expirada), False caso contrário

        Exemplo:
            >>> validator = LicenseValidator()
            >>> validator.expiration_date = datetime(2025, 12, 31)
            >>> validator.verificar_expiracao()
            True  # Se a data atual for antes de 31/12/2025
        """
        if self.expiration_date is None:
            return False

        # Comparar com data atual
        data_atual = datetime.now()
        return self.expiration_date >= data_atual

    def verificar_api_key(self) -> bool:
        """
        Verifica se a chave de API é válida.

        Valida o formato da chave (GMLE-XXXX-XXXX-XXXX-XXXX) e verifica
        se não está vazia.

        Returns:
            True se a chave é válida, False caso contrário

        Exemplo:
            >>> validator = LicenseValidator()
            >>> validator.api_key = "GMLE-1234-ABCD-5678-EFGH"
            >>> validator.verificar_api_key()
            True
        """
        import re

        if not self.api_key or len(self.api_key.strip()) == 0:
            return False

        # Validar formato: GMLE-XXXX-XXXX-XXXX-XXXX
        # Padrão: GMLE seguido de 4 grupos de 4 caracteres alfanuméricos
        # separados por hífen
        pattern = (r'^GMLE-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-'
                   r'[A-Z0-9]{4}$')

        if re.match(pattern, self.api_key):
            return True

        return False

    def obter_status_licenca(self) -> str:
        """
        Retorna mensagem descritiva do status da licença.

        Inclui a data de expiração se a licença for válida,
        ou o motivo da invalidade caso contrário.

        Returns:
            String com mensagem descritiva do status da licença

        Exemplo:
            >>> validator = LicenseValidator()
            >>> validator.validar_licenca()
            >>> status = validator.obter_status_licenca()
            >>> print(status)
            'Status: Licença válida até 31/12/2025 (365 dias restantes)'
        """
        if not self.is_valid:
            # Licença inválida - determinar motivo
            if self.expiration_date is None and self.api_key is None:
                return "Status: Licença não validada ou arquivo não encontrado"

            if self.api_key and not self.verificar_api_key():
                return f"Status: Licença inválida - Chave de API com formato incorreto ('{self.api_key}')"

            if self.expiration_date and not self.verificar_expiracao():
                data_formatada = self.expiration_date.strftime('%d/%m/%Y')
                return f"Status: Licença expirada em {data_formatada}"

            return "Status: Licença inválida - Motivo desconhecido"

        # Licença válida
        if self.expiration_date:
            data_formatada = self.expiration_date.strftime('%d/%m/%Y')
            dias_restantes = (self.expiration_date - datetime.now()).days
            return f"Status: Licença válida até {data_formatada} ({dias_restantes} dias restantes)"

        return "Status: Licença válida"
