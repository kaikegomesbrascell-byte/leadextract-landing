"""
Data Models - Modelos de Dados
Define as estruturas de dados utilizadas no sistema.
"""

from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Dict, Optional


@dataclass
class Lead:
    """Modelo de dados para um lead extraído do Google Maps."""

    nome: str
    telefone: str
    site: str
    nota: str
    comentarios: str
    endereco: str

    def to_dict(self) -> Dict[str, str]:
        """
        Converte lead para dicionário.

        Returns:
            Dicionário com chaves em português para exportação.

        Exemplo:
            >>> lead = Lead(nome="Empresa A", telefone="(11) 1234-5678", ...)
            >>> dados = lead.to_dict()
            >>> print(dados['Nome'])
            'Empresa A'
        """
        return {
            "Nome": self.nome,
            "Telefone": self.telefone,
            "Site": self.site,
            "Nota": self.nota,
            "Comentários": self.comentarios,
            "Endereço": self.endereco
        }

    @staticmethod
    def from_dict(data: Dict[str, str]) -> 'Lead':
        """
        Cria Lead a partir de dicionário.

        Args:
            data: Dicionário com dados do lead (chaves em minúsculas).

        Returns:
            Instância de Lead com dados validados.

        Exemplo:
            >>> dados = {'nome': 'Empresa A', 'telefone': '(11) 1234-5678', ...}
            >>> lead = Lead.from_dict(dados)
            >>> print(lead.nome)
            'Empresa A'
        """
        return Lead(
            nome=data.get("nome", "N/A").strip() if data.get("nome") else "N/A",
            telefone=data.get("telefone", "N/A").strip() if data.get("telefone") else "N/A",
            site=data.get("site", "N/A").strip() if data.get("site") else "N/A",
            nota=data.get("nota", "N/A").strip() if data.get("nota") else "N/A",
            comentarios=data.get(
                "comentarios", "N/A").strip() if data.get("comentarios") else "N/A",
            endereco=data.get("endereco", "N/A").strip() if data.get("endereco") else "N/A"
        )

    def validar(self) -> bool:
        """
        Valida se o lead possui pelo menos o campo nome preenchido.

        Returns:
            True se o lead é válido, False caso contrário.

        Exemplo:
            >>> lead = Lead(nome="Empresa A", telefone="N/A", ...)
            >>> lead.validar()
            True
            >>> lead_invalido = Lead(nome="", telefone="N/A", ...)
            >>> lead_invalido.validar()
            False
        """
        if not self.nome:
            return False
        nome_limpo = self.nome.strip()
        return nome_limpo != "" and nome_limpo != "N/A"


@dataclass
class SearchQuery:
    """Modelo para parâmetros de busca no Google Maps."""

    nicho: str
    localizacao: str
    limite: int

    def to_google_maps_url(self) -> str:
        """
        Gera URL de busca do Google Maps com encoding adequado.

        Returns:
            URL completa do Google Maps com query encoded.

        Exemplo:
            >>> query = SearchQuery(nicho="restaurantes", localizacao="São Paulo", limite=50)
            >>> url = query.to_google_maps_url()
            >>> print(url)
            'https://www.google.com/maps/search/restaurantes%20em%20S%C3%A3o%20Paulo'
        """
        import urllib.parse

        query = f"{self.nicho} em {self.localizacao}"
        encoded_query = urllib.parse.quote(query)
        return f"https://www.google.com/maps/search/{encoded_query}"

    def validar(self) -> tuple[bool, str]:
        """
        Valida parâmetros de busca.

        Returns:
            Tupla (is_valid, mensagem) indicando se a query é válida e mensagem descritiva.

        Exemplo:
            >>> query = SearchQuery(nicho="restaurantes", localizacao="São Paulo", limite=50)
            >>> is_valid, msg = query.validar()
            >>> print(is_valid, msg)
            True 'Válido'
            >>> query_invalida = SearchQuery(nicho="", localizacao="São Paulo", limite=50)
            >>> is_valid, msg = query_invalida.validar()
            >>> print(is_valid, msg)
            False 'Nicho não pode estar vazio'
        """
        # Validar nicho
        if not self.nicho or len(self.nicho.strip()) == 0:
            return False, "Nicho não pode estar vazio"

        # Validar localização
        if not self.localizacao or len(self.localizacao.strip()) == 0:
            return False, "Localização não pode estar vazia"

        # Validar limite
        if self.limite not in [50, 100, 500]:
            return False, "Limite deve ser 50, 100 ou 500"

        return True, "Válido"


@dataclass
class ExtractionState:
    """Modelo para estado da extração em andamento."""

    is_running: bool = False
    leads_extraidos: int = 0
    total_esperado: int = 0
    tempo_inicio: Optional[datetime] = None
    tempo_fim: Optional[datetime] = None

    def calcular_progresso(self) -> float:
        """
        Calcula percentual de progresso da extração.

        Returns:
            Float entre 0.0 e 1.0 representando o progresso (0% a 100%).
            Retorna 0.0 se total_esperado for 0.

        Exemplo:
            >>> state = ExtractionState(leads_extraidos=25, total_esperado=100)
            >>> progresso = state.calcular_progresso()
            >>> print(f"{progresso*100:.1f}%")
            '25.0%'
        """
        if self.total_esperado == 0:
            return 0.0
        return min(self.leads_extraidos / self.total_esperado, 1.0)

    def calcular_tempo_decorrido(self) -> Optional[timedelta]:
        """
        Calcula tempo decorrido desde o início da extração.

        Returns:
            timedelta com o tempo decorrido, ou None se a extração não foi iniciada.
            Se a extração ainda está em andamento, calcula até o momento atual.
            Se já finalizou, calcula até tempo_fim.

        Exemplo:
            >>> from datetime import datetime, timedelta
            >>> state = ExtractionState(tempo_inicio=datetime.now() - timedelta(minutes=5))
            >>> tempo = state.calcular_tempo_decorrido()
            >>> print(f"Tempo decorrido: {tempo.seconds // 60} minutos")
            'Tempo decorrido: 5 minutos'
        """
        if self.tempo_inicio is None:
            return None

        fim = self.tempo_fim if self.tempo_fim else datetime.now()
        return fim - self.tempo_inicio
