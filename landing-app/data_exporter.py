"""
Data Exporter - Exportador de Dados
Responsável pela exportação de leads em formatos Excel e CSV.
"""

import pandas as pd
from typing import List, Dict, Optional
from error_logger import ErrorLogger


class DataExporter:
    """
    Exportador de dados de leads para formatos Excel e CSV.
    Utiliza pandas e openpyxl para formatação profissional.
    """

    def __init__(self, leads_data: List[Dict[str, str]]):
        """
        Inicializa exportador com dados de leads.

        Args:
            leads_data: Lista de dicionários contendo dados dos leads

        Exemplo:
            >>> leads = [
            ...     {'Nome': 'Empresa A', 'Telefone': '(11) 1234-5678', ...},
            ...     {'Nome': 'Empresa B', 'Telefone': '(11) 8765-4321', ...}
            ... ]
            >>> exporter = DataExporter(leads)
        """
        self.leads_data: List[Dict[str, str]] = leads_data
        self.df: Optional[pd.DataFrame] = None
        self.logger = ErrorLogger()

    def preparar_dataframe(self) -> None:
        """
        Converte lista de dicionários para pandas DataFrame.
        Define colunas: Nome, Telefone, Site, Nota, Comentários, Endereço.

        Exemplo:
            >>> exporter = DataExporter(leads_data)
            >>> exporter.preparar_dataframe()
            >>> print(exporter.df.shape)
            (50, 6)  # 50 leads, 6 colunas
        """
        try:
            # Converter lista de dicionários para DataFrame
            self.df = pd.DataFrame(self.leads_data)

            # Garantir que as colunas estão na ordem correta
            colunas_ordenadas = ['Nome', 'Telefone', 'Site', 'Nota', 'Comentários', 'Endereço']

            # Reordenar colunas se todas existirem
            if all(col in self.df.columns for col in colunas_ordenadas):
                self.df = self.df[colunas_ordenadas]

            self.logger.log_info(f"DataFrame preparado com {len(self.df)} registros")

        except Exception as e:
            self.logger.log_erro(f"Erro ao preparar DataFrame: {str(e)}", e)
            raise

    def exportar_excel(self, filepath: str) -> bool:
        """
        Exporta dados para arquivo Excel com formatação profissional.

        Args:
            filepath: Caminho completo do arquivo de destino

        Returns:
            True se exportação foi bem-sucedida, False em caso de erro

        Exemplo:
            >>> exporter = DataExporter(leads_data)
            >>> sucesso = exporter.exportar_excel("leads.xlsx")
            >>> if sucesso:
            ...     print("Arquivo Excel criado com sucesso!")
        """
        try:
            # Preparar DataFrame se ainda não foi preparado
            if self.df is None:
                self.preparar_dataframe()

            # Criar ExcelWriter com openpyxl
            with pd.ExcelWriter(filepath, engine='openpyxl') as writer:
                # Escrever DataFrame para Excel
                self.df.to_excel(writer, index=False, sheet_name='Leads')

                # Aplicar formatação profissional
                self.formatar_excel(writer)

            self.logger.log_info(f"Dados exportados com sucesso para Excel: {filepath}")
            return True

        except Exception as e:
            self.logger.log_erro(f"Erro ao exportar para Excel: {str(e)}", e)
            return False

    def formatar_excel(self, writer: pd.ExcelWriter) -> None:
        """
        Aplica formatação profissional ao arquivo Excel.
        - Negrito nos cabeçalhos
        - Ajuste automático de largura das colunas
        - Filtros automáticos
        - Congelamento da primeira linha

        Args:
            writer: ExcelWriter do pandas
        """
        try:
            # Obter worksheet
            worksheet = writer.sheets['Leads']

            # Aplicar negrito nos cabeçalhos (primeira linha)
            from openpyxl.styles import Font
            for cell in worksheet[1]:
                cell.font = Font(bold=True)

            # Ajustar largura das colunas automaticamente
            for column in worksheet.columns:
                max_length = 0
                column_letter = column[0].column_letter

                for cell in column:
                    try:
                        if cell.value:
                            max_length = max(max_length, len(str(cell.value)))
                    except Exception:
                        pass

                # Definir largura ajustada (com margem de 2)
                adjusted_width = min(max_length + 2, 50)  # Máximo de 50 caracteres
                worksheet.column_dimensions[column_letter].width = adjusted_width

            # Habilitar filtros automáticos
            worksheet.auto_filter.ref = worksheet.dimensions

            # Congelar primeira linha (cabeçalhos)
            worksheet.freeze_panes = 'A2'

            self.logger.log_info("Formatação Excel aplicada com sucesso")

        except Exception as e:
            self.logger.log_erro(f"Erro ao formatar Excel: {str(e)}", e)
            # Não propagar erro - formatação é opcional

    def exportar_csv(self, filepath: str) -> bool:
        """
        Exporta dados para arquivo CSV.

        Args:
            filepath: Caminho completo do arquivo de destino

        Returns:
            True se exportação foi bem-sucedida, False em caso de erro

        Exemplo:
            >>> exporter = DataExporter(leads_data)
            >>> sucesso = exporter.exportar_csv("leads.csv")
            >>> if sucesso:
            ...     print("Arquivo CSV criado com sucesso!")
        """
        try:
            # Preparar DataFrame se ainda não foi preparado
            if self.df is None:
                self.preparar_dataframe()

            # Exportar para CSV com encoding UTF-8
            self.df.to_csv(filepath, index=False, encoding='utf-8')

            self.logger.log_info(f"Dados exportados com sucesso para CSV: {filepath}")
            return True

        except Exception as e:
            self.logger.log_erro(f"Erro ao exportar para CSV: {str(e)}", e)
            return False
