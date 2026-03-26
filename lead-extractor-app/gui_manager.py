"""
GUI Manager - Gerenciador de Interface Gráfica
Gerencia toda a interface gráfica do usuário usando CustomTkinter.
"""

import customtkinter as ctk
from tkinter import ttk, messagebox, filedialog
import threading
from typing import List, Dict, Optional


class LeadExtractorGUI:
    """
    Gerenciador da interface gráfica principal do Lead Extractor.
    Utiliza CustomTkinter para criar uma UI moderna e responsiva.
    """

    def __init__(self):
        """
        Inicializa a janela principal e todos os atributos.

        Exemplo:
            >>> gui = LeadExtractorGUI()
            >>> gui.criar_interface()
            >>> gui.run()
        """
        # Configurar tema dark mode
        ctk.set_appearance_mode("dark")
        ctk.set_default_color_theme("blue")

        # Criar janela principal
        self.root = ctk.CTk()
        self.root.title("🚀 Google Maps Lead Extractor - Versão Pro")
        self.root.geometry("1400x900")
        
        # Centralizar janela na tela
        self.root.update_idletasks()
        width = 1400
        height = 900
        x = (self.root.winfo_screenwidth() // 2) - (width // 2)
        y = (self.root.winfo_screenheight() // 2) - (height // 2)
        self.root.geometry(f'{width}x{height}+{x}+{y}')

        # Atributos de controle
        self.extraction_thread: Optional[threading.Thread] = None
        self.stop_flag = threading.Event()
        self.leads_data: List[Dict[str, str]] = []

        # Buffer para atualização em lote da UI (acumula até 5 leads)
        self.leads_buffer: List[Dict[str, str]] = []
        self.buffer_lock: threading.Lock = threading.Lock()

        # Widgets (serão inicializados em criar_interface)
        self.nicho_entry: Optional[ctk.CTkEntry] = None
        self.localizacao_entry: Optional[ctk.CTkEntry] = None
        self.limite_slider: Optional[ctk.CTkSlider] = None
        self.limite_label: Optional[ctk.CTkLabel] = None
        self.progress_bar: Optional[ctk.CTkProgressBar] = None
        self.status_label: Optional[ctk.CTkLabel] = None
        self.data_table: Optional[ttk.Treeview] = None
        self.btn_iniciar: Optional[ctk.CTkButton] = None
        self.btn_parar: Optional[ctk.CTkButton] = None
        self.btn_exportar: Optional[ctk.CTkButton] = None
        
        # Widgets do WhatsApp
        self.mensagem_text: Optional[ctk.CTkTextbox] = None
        self.btn_whatsapp: Optional[ctk.CTkButton] = None
        self.whatsapp_status_label: Optional[ctk.CTkLabel] = None
        self.whatsapp_thread: Optional[threading.Thread] = None
        self.whatsapp_stop_flag = threading.Event()

    def criar_interface(self) -> None:
        """
        Cria todos os widgets da interface.

        Exemplo:
            >>> gui = LeadExtractorGUI()
            >>> gui.criar_interface()
            >>> # Interface gráfica completa criada e pronta para uso
        """
        # Seção de Inputs
        self._criar_secao_inputs()

        # Seção de Controles
        self._criar_secao_controles()
        
        # Seção de WhatsApp
        self._criar_secao_whatsapp()

        # Seção de Progresso
        self._criar_secao_progresso()

        # Tabela de Dados
        self._criar_tabela_dados()

    def _criar_secao_inputs(self) -> None:
        """Cria a seção de inputs (nicho, localização, limite) com design melhorado."""
        # Frame para inputs com cor de destaque
        frame_inputs = ctk.CTkFrame(self.root, fg_color=("#2b2b2b", "#1a1a1a"))
        frame_inputs.pack(pady=25, padx=25, fill="x")

        # Título da seção
        titulo = ctk.CTkLabel(
            frame_inputs, 
            text="🔍 Configuração da Busca", 
            font=("Arial", 18, "bold"),
            text_color=("#00d4ff", "#00d4ff")
        )
        titulo.grid(row=0, column=0, columnspan=3, pady=(15, 20))

        # Label e Entry para Nicho
        label_nicho = ctk.CTkLabel(
            frame_inputs, 
            text="Nicho/Palavra-Chave:", 
            font=("Arial", 15, "bold")
        )
        label_nicho.grid(row=1, column=0, padx=15, pady=12, sticky="w")

        self.nicho_entry = ctk.CTkEntry(
            frame_inputs, 
            width=350,
            height=40,
            font=("Arial", 13),
            placeholder_text="Ex: restaurantes, academias, dentistas",
            border_width=2,
            corner_radius=8
        )
        self.nicho_entry.grid(row=1, column=1, padx=15, pady=12)

        # Label e Entry para Localização
        label_localizacao = ctk.CTkLabel(
            frame_inputs, 
            text="Localização/Cidade:", 
            font=("Arial", 15, "bold")
        )
        label_localizacao.grid(row=2, column=0, padx=15, pady=12, sticky="w")

        self.localizacao_entry = ctk.CTkEntry(
            frame_inputs, 
            width=350,
            height=40,
            font=("Arial", 13),
            placeholder_text="Ex: São Paulo, Rio de Janeiro",
            border_width=2,
            corner_radius=8
        )
        self.localizacao_entry.grid(row=2, column=1, padx=15, pady=12)

        # Label e Slider para Limite
        label_limite = ctk.CTkLabel(
            frame_inputs, 
            text="Limite de Leads:", 
            font=("Arial", 15, "bold")
        )
        label_limite.grid(row=3, column=0, padx=15, pady=12, sticky="w")

        # Slider com valores 50, 100, 500
        self.limite_slider = ctk.CTkSlider(
            frame_inputs,
            from_=0,
            to=2,
            number_of_steps=2,
            width=350,
            height=20,
            button_color=("#00d4ff", "#00d4ff"),
            button_hover_color=("#00a8cc", "#00a8cc"),
            progress_color=("#00d4ff", "#00d4ff"),
            command=self._atualizar_label_limite
        )
        self.limite_slider.set(0)  # Valor inicial: 50
        self.limite_slider.grid(row=3, column=1, padx=15, pady=12)

        # Label para exibir valor do slider
        self.limite_label = ctk.CTkLabel(
            frame_inputs, 
            text="50 leads", 
            font=("Arial", 16, "bold"),
            text_color=("#00d4ff", "#00d4ff")
        )
        self.limite_label.grid(row=3, column=2, padx=15, pady=12)

    def _atualizar_label_limite(self, value: float) -> None:
        """Atualiza o label com o valor do slider."""
        valores = [50, 100, 500]
        indice = int(value)
        self.limite_label.configure(text=f"{valores[indice]} leads")

    def _criar_secao_controles(self) -> None:
        """Cria a seção de botões de controle com design melhorado."""
        # Frame para botões
        frame_controles = ctk.CTkFrame(self.root, fg_color="transparent")
        frame_controles.pack(pady=15, padx=25, fill="x")

        # Botão Iniciar Extração
        self.btn_iniciar = ctk.CTkButton(
            frame_controles,
            text="▶ Iniciar Extração",
            command=self.iniciar_extracao,
            width=220,
            height=50,
            font=("Arial", 16, "bold"),
            fg_color=("#00c853", "#00c853"),
            hover_color=("#00a843", "#00a843"),
            corner_radius=10,
            border_width=0
        )
        self.btn_iniciar.pack(side="left", padx=10)

        # Botão Parar
        self.btn_parar = ctk.CTkButton(
            frame_controles,
            text="⏸ Parar",
            command=self.parar_extracao,
            width=220,
            height=50,
            font=("Arial", 16, "bold"),
            fg_color=("#ff3d00", "#ff3d00"),
            hover_color=("#dd2c00", "#dd2c00"),
            corner_radius=10,
            border_width=0,
            state="disabled"
        )
        self.btn_parar.pack(side="left", padx=10)

        # Botão Exportar
        self.btn_exportar = ctk.CTkButton(
            frame_controles,
            text="💾 Exportar Dados",
            command=self.exportar_dados,
            width=220,
            height=50,
            font=("Arial", 16, "bold"),
            fg_color=("#2196f3", "#2196f3"),
            hover_color=("#1976d2", "#1976d2"),
            corner_radius=10,
            border_width=0
        )
        self.btn_exportar.pack(side="left", padx=10)

    def _criar_secao_whatsapp(self) -> None:
        """Cria a seção de disparo automático de mensagens no WhatsApp."""
        # Frame para WhatsApp
        frame_whatsapp = ctk.CTkFrame(self.root, fg_color=("#2b2b2b", "#1a1a1a"))
        frame_whatsapp.pack(pady=15, padx=25, fill="x")

        # Título da seção
        titulo_whatsapp = ctk.CTkLabel(
            frame_whatsapp,
            text="💬 Disparo Automático de Mensagens no WhatsApp",
            font=("Arial", 18, "bold"),
            text_color=("#25D366", "#25D366")  # Verde do WhatsApp
        )
        titulo_whatsapp.pack(pady=(15, 10))

        # Frame para mensagem
        frame_mensagem = ctk.CTkFrame(frame_whatsapp, fg_color="transparent")
        frame_mensagem.pack(pady=10, padx=15, fill="x")

        # Label da mensagem
        label_mensagem = ctk.CTkLabel(
            frame_mensagem,
            text="Mensagem Personalizada (use {nome} para incluir o nome da empresa):",
            font=("Arial", 13)
        )
        label_mensagem.pack(anchor="w", pady=(0, 5))

        # Campo de texto para mensagem
        self.mensagem_text = ctk.CTkTextbox(
            frame_mensagem,
            width=1300,
            height=100,
            font=("Arial", 12),
            border_width=2,
            corner_radius=8
        )
        self.mensagem_text.pack(pady=5)
        
        # Mensagem padrão
        mensagem_padrao = (
            "Olá {nome}! 👋\n\n"
            "Encontrei seu contato no Google Maps e gostaria de apresentar nossos serviços.\n\n"
            "Podemos conversar?"
        )
        self.mensagem_text.insert("1.0", mensagem_padrao)

        # Frame para botões do WhatsApp
        frame_btn_whatsapp = ctk.CTkFrame(frame_whatsapp, fg_color="transparent")
        frame_btn_whatsapp.pack(pady=10)

        # Botão de enviar mensagens
        self.btn_whatsapp = ctk.CTkButton(
            frame_btn_whatsapp,
            text="📱 Enviar Mensagens no WhatsApp",
            command=self.iniciar_envio_whatsapp,
            width=300,
            height=50,
            font=("Arial", 16, "bold"),
            fg_color=("#25D366", "#25D366"),  # Verde do WhatsApp
            hover_color=("#128C7E", "#128C7E"),
            corner_radius=10,
            border_width=0
        )
        self.btn_whatsapp.pack(side="left", padx=10)

        # Botão de parar envio
        self.btn_parar_whatsapp = ctk.CTkButton(
            frame_btn_whatsapp,
            text="⏸ Parar Envio",
            command=self.parar_envio_whatsapp,
            width=200,
            height=50,
            font=("Arial", 16, "bold"),
            fg_color=("#ff3d00", "#ff3d00"),
            hover_color=("#dd2c00", "#dd2c00"),
            corner_radius=10,
            border_width=0,
            state="disabled"
        )
        self.btn_parar_whatsapp.pack(side="left", padx=10)

        # Label de status do WhatsApp
        self.whatsapp_status_label = ctk.CTkLabel(
            frame_whatsapp,
            text="⏳ Aguardando início do envio...",
            font=("Arial", 13),
            text_color=("#25D366", "#25D366")
        )
        self.whatsapp_status_label.pack(pady=(5, 15))

    def _criar_secao_progresso(self) -> None:
        """Cria a seção de progresso (barra e status) com design melhorado."""
        # Frame para progresso
        frame_progresso = ctk.CTkFrame(self.root, fg_color=("#2b2b2b", "#1a1a1a"))
        frame_progresso.pack(pady=15, padx=25, fill="x")

        # Label de status
        self.status_label = ctk.CTkLabel(
            frame_progresso,
            text="⏳ Aguardando início da extração...",
            font=("Arial", 15, "bold"),
            text_color=("#00d4ff", "#00d4ff")
        )
        self.status_label.pack(pady=(15, 10))

        # Barra de progresso
        self.progress_bar = ctk.CTkProgressBar(
            frame_progresso, 
            width=1100,
            height=25,
            corner_radius=10,
            progress_color=("#00d4ff", "#00d4ff"),
            fg_color=("#404040", "#303030")
        )
        self.progress_bar.set(0)  # Valor inicial: 0
        self.progress_bar.pack(pady=(5, 15))

    def _criar_tabela_dados(self) -> None:
        """Cria a tabela de dados (Treeview) com scrollbar e design melhorado."""
        # Frame para tabela
        frame_tabela = ctk.CTkFrame(self.root, fg_color=("#2b2b2b", "#1a1a1a"))
        frame_tabela.pack(pady=15, padx=25, fill="both", expand=True)

        # Label da tabela
        label_tabela = ctk.CTkLabel(
            frame_tabela, 
            text="📊 Leads Extraídos:",
            font=("Arial", 16, "bold"),
            text_color=("#00d4ff", "#00d4ff")
        )
        label_tabela.pack(pady=(15, 10))

        # Frame interno para Treeview e Scrollbar
        frame_tree = ctk.CTkFrame(frame_tabela)
        frame_tree.pack(fill="both", expand=True, padx=10, pady=10)

        # Scrollbar vertical
        scrollbar = ttk.Scrollbar(frame_tree, orient="vertical")
        scrollbar.pack(side="right", fill="y")

        # Treeview com colunas
        colunas = ("Nome", "Telefone", "Site", "Nota", "Comentários", "Endereço", "Área (m²)")
        self.data_table = ttk.Treeview(
            frame_tree,
            columns=colunas,
            show="headings",
            yscrollcommand=scrollbar.set
        )
        scrollbar.config(command=self.data_table.yview)

        # Configurar cabeçalhos das colunas
        self.data_table.heading("Nome", text="Nome")
        self.data_table.heading("Telefone", text="Telefone")
        self.data_table.heading("Site", text="Site")
        self.data_table.heading("Nota", text="Nota")
        self.data_table.heading("Comentários", text="Comentários")
        self.data_table.heading("Endereço", text="Endereço")

        # Configurar larguras das colunas
        self.data_table.column("Nome", width=200, anchor="w")
        self.data_table.column("Telefone", width=120, anchor="center")
        self.data_table.column("Site", width=200, anchor="w")
        self.data_table.column("Nota", width=80, anchor="center")
        self.data_table.column("Comentários", width=100, anchor="center")
        self.data_table.column("Endereço", width=300, anchor="w")

        self.data_table.pack(fill="both", expand=True)

    def validar_licenca(self) -> bool:
        """
        Valida licença antes de permitir extração.

        Returns:
            True se licença é válida, False caso contrário

        Exemplo:
            >>> gui = LeadExtractorGUI()
            >>> if gui.validar_licenca():
            ...     print("Licença válida - pode iniciar extração")
            ... else:
            ...     print("Licença inválida - bloqueado")
        """
        from license_validator import LicenseValidator

        # Criar instância de LicenseValidator
        validator = LicenseValidator()

        # Chamar validar_licenca()
        is_valid, mensagem = validator.validar_licenca()

        # Exibir messagebox com status da licença
        if is_valid:
            messagebox.showinfo("Licença Válida", mensagem)
        else:
            messagebox.showerror("Licença Inválida", mensagem)

        # Retornar True se válida, False se inválida
        return is_valid

    def iniciar_extracao(self) -> None:
        """
        Inicia a extração em thread separada.

        Exemplo:
            >>> gui = LeadExtractorGUI()
            >>> gui.criar_interface()
            >>> gui.iniciar_extracao()
            >>> # Thread de extração iniciada em background
        """
        from models import SearchQuery
        from error_logger import ErrorLogger

        logger = ErrorLogger()

        # REMOVER VALIDAÇÃO DE LICENÇA PARA TESTES
        # if not self.validar_licenca():
        #     logger.log_warning("Tentativa de extração bloqueada: licença inválida")
        #     return

        # Obter valores dos inputs (nicho, localização, limite)
        nicho = self.nicho_entry.get().strip()
        localizacao = self.localizacao_entry.get().strip()

        # Converter valor do slider para limite
        valores_limite = [50, 100, 500]
        indice_limite = int(self.limite_slider.get())
        limite = valores_limite[indice_limite]

        # Criar SearchQuery e validar
        search_query = SearchQuery(nicho=nicho, localizacao=localizacao, limite=limite)
        is_valid, mensagem = search_query.validar()

        if not is_valid:
            messagebox.showerror("Erro de Validação", mensagem)
            logger.log_erro(f"Validação de busca falhou: {mensagem}")
            return

        # Limpar tabela de dados anteriores
        for item in self.data_table.get_children():
            self.data_table.delete(item)

        # Limpar lista de leads
        self.leads_data.clear()

        # Limpar buffer de leads para atualização em lote
        with self.buffer_lock:
            self.leads_buffer.clear()

        # Resetar progress bar
        self.progress_bar.set(0)
        self.status_label.configure(text="🚀 Iniciando extração... Abrindo navegador...")

        # Criar threading.Event para stop_flag
        self.stop_flag = threading.Event()
        self.stop_flag.clear()

        # Criar thread passando _executar_extracao_async como target
        self.extraction_thread = threading.Thread(
            target=self._executar_extracao_async,
            args=(nicho, localizacao, limite),
            daemon=True
        )

        # Iniciar thread
        self.extraction_thread.start()
        logger.log_info(
            f"Thread de extração iniciada: nicho='{nicho}', localização='{localizacao}', limite={limite}")

        # Atualizar estados dos botões (desabilitar Iniciar, habilitar Parar)
        self.btn_iniciar.configure(state="disabled")
        self.btn_parar.configure(state="normal")
        
        # Agendar messagebox de confirmação APÓS status inicial ser visível (800ms delay)
        # Isso permite que a UI renderize a mensagem "🚀 Iniciando extração..." antes do dialog bloqueante
        self.root.after(800, lambda: messagebox.showinfo(
            "Extração Iniciada",
            f"✅ Extração iniciada com sucesso!\n\n"
            f"📍 Nicho: {nicho}\n"
            f"📍 Localização: {localizacao}\n"
            f"📊 Limite: {limite} leads\n\n"
            f"⏳ Aguarde enquanto buscamos os leads...\n"
            f"O navegador será aberto em segundo plano."
        ))

    def _executar_extracao_async(self, nicho: str, localizacao: str, limite: int) -> None:
        """
        Executa a extração em thread separada com asyncio.

        Args:
            nicho: Palavra-chave ou nicho de negócio
            localizacao: Cidade ou região
            limite: Número máximo de leads
        """
        from automation_engine import GoogleMapsAutomation
        from error_logger import ErrorLogger
        import asyncio
        from datetime import datetime
        import os

        logger = ErrorLogger()

        try:
            # Atualizar status: Inicializando navegador
            self.root.after(0, lambda: self.status_label.configure(
                text="🌐 Inicializando navegador... Aguarde..."
            ))
            
            # Criar novo event loop asyncio
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)

            # Criar instância de GoogleMapsAutomation
            automation = GoogleMapsAutomation(headless=True)

            # Atualizar status: Abrindo navegador
            self.root.after(0, lambda: self.status_label.configure(
                text="🚀 Abrindo navegador Chromium..."
            ))

            # Chamar inicializar_navegador()
            loop.run_until_complete(automation.inicializar_navegador())

            # Atualizar status: Navegando para Google Maps
            self.root.after(0, lambda: self.status_label.configure(
                text="🗺️ Navegando para o Google Maps..."
            ))

            # Chamar buscar_empresas() passando callback atualizar_progresso_thread_safe
            leads = loop.run_until_complete(
                automation.buscar_empresas(
                    nicho=nicho,
                    localizacao=localizacao,
                    limite=limite,
                    callback=self.atualizar_progresso_thread_safe,
                    stop_flag=self.stop_flag
                )
            )

            # Atualizar status: Finalizando
            self.root.after(0, lambda: self.status_label.configure(
                text="✅ Finalizando extração..."
            ))

            # Chamar fechar_navegador()
            loop.run_until_complete(automation.fechar_navegador())

            # Fechar event loop
            loop.close()

            # Gerar arquivo de texto automaticamente
            if len(leads) > 0:
                self._gerar_arquivo_texto_automatico(leads, nicho, localizacao)

            # Notificar GUI sobre conclusão via root.after()
            self.root.after(0, lambda: self._on_extracao_concluida(len(leads)))

        except Exception as e:
            # Adicionar try-except global com log de erro
            logger.log_erro("Erro durante execução da extração", e)
            erro_msg = str(e)

            # Notificar GUI sobre erro
            self.root.after(0, lambda: self._on_extracao_erro(erro_msg))

    def _gerar_arquivo_texto_automatico(self, leads: list, nicho: str, localizacao: str) -> None:
        """
        Gera automaticamente um arquivo de texto com os leads extraídos na pasta Downloads.

        Args:
            leads: Lista de leads extraídos
            nicho: Nicho da busca
            localizacao: Localização da busca
        """
        from datetime import datetime
        from error_logger import ErrorLogger
        import os
        from pathlib import Path

        logger = ErrorLogger()

        try:
            # Obter pasta Downloads do usuário
            pasta_downloads = str(Path.home() / "Downloads")
            
            # Criar nome do arquivo com data e hora
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            nome_arquivo = f"leads_{nicho.replace(' ', '_')}_{localizacao.replace(' ', '_')}_{timestamp}.txt"
            
            caminho_completo = os.path.join(pasta_downloads, nome_arquivo)

            # Gerar conteúdo do arquivo
            with open(caminho_completo, 'w', encoding='utf-8') as f:
                # Cabeçalho
                f.write("=" * 80 + "\n")
                f.write("GOOGLE MAPS LEAD EXTRACTOR - RELATÓRIO DE EXTRAÇÃO\n")
                f.write("=" * 80 + "\n\n")
                
                # Informações da busca
                f.write(f"📍 Nicho: {nicho}\n")
                f.write(f"📍 Localização: {localizacao}\n")
                f.write(f"📊 Total de Leads Únicos: {len(leads)}\n")
                f.write(f"✅ Sem Duplicatas: Cada lead aparece apenas uma vez\n")
                f.write(f"📅 Data/Hora: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}\n")
                f.write("\n" + "=" * 80 + "\n\n")

                # Dados dos leads
                for i, lead in enumerate(leads, 1):
                    f.write(f"LEAD #{i}\n")
                    f.write("-" * 80 + "\n")
                    f.write(f"Nome: {lead.get('nome', 'N/A')}\n")
                    f.write(f"Telefone: {lead.get('telefone', 'N/A')}\n")
                    f.write(f"Site: {lead.get('site', 'N/A')}\n")
                    f.write(f"Nota: {lead.get('nota', 'N/A')}\n")
                    f.write(f"Comentários: {lead.get('comentarios', 'N/A')}\n")
                    f.write(f"Endereço: {lead.get('endereco', 'N/A')}\n")
                    f.write("\n")

                # Rodapé
                f.write("=" * 80 + "\n")
                f.write("Arquivo gerado automaticamente pelo Google Maps Lead Extractor\n")
                f.write("=" * 80 + "\n")

            logger.log_info(f"Arquivo de texto gerado automaticamente em Downloads: {caminho_completo}")
            
            # Notificar usuário via messagebox
            self.root.after(0, lambda: self._mostrar_notificacao_arquivo(caminho_completo))

        except Exception as e:
            logger.log_erro("Erro ao gerar arquivo de texto automático", e)

    def _mostrar_notificacao_arquivo(self, caminho: str) -> None:
        """Mostra notificação sobre o arquivo gerado."""
        from tkinter import messagebox
        import os
        
        # Extrair apenas o nome do arquivo
        nome_arquivo = os.path.basename(caminho)
        
        messagebox.showinfo(
            "✅ Arquivo Gerado com Sucesso!",
            f"Os leads foram salvos automaticamente!\n\n"
            f"📁 Pasta: Downloads\n"
            f"📄 Arquivo: {nome_arquivo}\n\n"
            f"Caminho completo:\n{caminho}\n\n"
            f"Você pode abrir o arquivo no Bloco de Notas."
        )

    def _on_extracao_concluida(self, total_leads: int) -> None:
        """
        Callback executado na GUI thread quando extração é concluída.

        Args:
            total_leads: Total de leads extraídos
        """
        from error_logger import ErrorLogger

        logger = ErrorLogger()
        logger.log_info(f"Extração concluída com sucesso: {total_leads} leads extraídos")

        # Atualizar status
        self.status_label.configure(text=f"Extração concluída! Total: {total_leads} leads")

        # Garantir que progress bar está em 100%
        self.progress_bar.set(1.0)

        # Reabilitar botões
        self.btn_iniciar.configure(state="normal")
        self.btn_parar.configure(state="disabled")

        # Exibir mensagem de sucesso com mais detalhes
        messagebox.showinfo(
            "🎉 Extração Concluída com Sucesso!",
            f"✅ Extração concluída!\n\n"
            f"📊 Total de leads extraídos: {total_leads}\n"
            f"💾 Arquivo salvo na pasta Downloads\n\n"
            f"Agora você pode:\n"
            f"• Exportar para Excel/CSV\n"
            f"• Enviar mensagens no WhatsApp\n"
            f"• Fazer uma nova busca"
        )

    def _on_extracao_erro(self, mensagem_erro: str) -> None:
        """
        Callback executado na GUI thread quando ocorre erro na extração.

        Args:
            mensagem_erro: Mensagem de erro
        """
        from error_logger import ErrorLogger

        logger = ErrorLogger()
        logger.log_erro(f"Erro na extração: {mensagem_erro}")

        # Atualizar status
        self.status_label.configure(text=f"Erro na extração: {mensagem_erro}")

        # Reabilitar botões
        self.btn_iniciar.configure(state="normal")
        self.btn_parar.configure(state="disabled")

        # Exibir mensagem de erro
        messagebox.showerror("Erro na Extração",
                             f"Ocorreu um erro durante a extração:\n\n{mensagem_erro}")

    def atualizar_progresso_thread_safe(self, lead: Dict[str, str], progresso: float) -> None:
        """
        Callback thread-safe para atualizar progresso na GUI.

        Este método é chamado pela thread de extração e acumula leads em um buffer.
        Quando o buffer atinge 5 leads, atualiza a UI em lote para otimizar performance.
        Usa root.after() para executar a atualização na GUI thread.

        Args:
            lead: Dicionário com dados do lead extraído
            progresso: Float entre 0.0 e 1.0 representando o progresso
        """
        # Adicionar lead ao buffer de forma thread-safe
        with self.buffer_lock:
            self.leads_buffer.append(lead)
            buffer_size = len(self.leads_buffer)

        # Atualizar UI em lote a cada 5 leads ou quando atingir 100% de progresso
        if buffer_size >= 5 or progresso >= 1.0:
            # Copiar buffer e limpar para próxima leva
            with self.buffer_lock:
                leads_to_update = self.leads_buffer.copy()
                self.leads_buffer.clear()

            # Usar root.after(0, lambda) para executar na GUI thread
            self.root.after(0, lambda: self._atualizar_ui_lote(leads_to_update, progresso))

    def _atualizar_ui_lote(self, leads: List[Dict[str, str]], progresso: float) -> None:
        """
        Atualiza a UI com múltiplos leads em lote.
        Executa na GUI thread - seguro para modificar widgets.

        Esta abordagem otimiza a performance ao atualizar a Treeview
        com vários leads de uma vez, reduzindo o overhead de atualização.

        Args:
            leads: Lista de dicionários com dados dos leads (chaves em minúsculas)
            progresso: Float entre 0.0 e 1.0 representando o progresso
        """
        # Atualizar progress bar com valor de progresso
        self.progress_bar.set(progresso)

        # Processar todos os leads do lote
        for lead in leads:
            # Converter lead para formato de exibição (chaves com maiúsculas)
            lead_display = {
                "Nome": lead.get("nome", "N/A"),
                "Telefone": lead.get("telefone", "N/A"),
                "Site": lead.get("site", "N/A"),
                "Nota": lead.get("nota", "N/A"),
                "Comentários": lead.get("comentarios", "N/A"),
                "Endereço": lead.get("endereco", "N/A")
            }

            # Inserir novo lead na Treeview
            self.data_table.insert("", "end", values=tuple(lead_display.values()))

            # Adicionar lead à lista self.leads_data (com chaves maiúsculas para exportação)
            self.leads_data.append(lead_display)

        # Atualizar label de status com contagem de leads
        total_leads = len(self.leads_data)
        self.status_label.configure(
            text=f"Extraindo leads... {total_leads} encontrados ({progresso * 100:.1f}%)")

    def _atualizar_ui(self, lead: Dict[str, str], progresso: float) -> None:
        """
        Atualiza a UI com novo lead e progresso (método legado).
        Executa na GUI thread - seguro para modificar widgets.

        NOTA: Este método é mantido para compatibilidade, mas o método
        _atualizar_ui_lote é preferido para melhor performance.

        Args:
            lead: Dicionário com dados do lead (chaves em minúsculas)
            progresso: Float entre 0.0 e 1.0 representando o progresso
        """
        # Atualizar progress bar com valor de progresso
        self.progress_bar.set(progresso)

        # Converter lead para formato de exibição (chaves com maiúsculas)
        lead_display = {
            "Nome": lead.get("nome", "N/A"),
            "Telefone": lead.get("telefone", "N/A"),
            "Site": lead.get("site", "N/A"),
            "Nota": lead.get("nota", "N/A"),
            "Comentários": lead.get("comentarios", "N/A"),
            "Endereço": lead.get("endereco", "N/A")
        }

        # Inserir novo lead na Treeview
        self.data_table.insert("", "end", values=tuple(lead_display.values()))

        # Adicionar lead à lista self.leads_data (com chaves maiúsculas para exportação)
        self.leads_data.append(lead_display)

        # Atualizar label de status com contagem de leads
        total_leads = len(self.leads_data)
        self.status_label.configure(
            text=f"Extraindo leads... {total_leads} encontrados ({progresso * 100:.1f}%)")

    def parar_extracao(self) -> None:
        """
        Sinaliza para parar a extração em andamento.

        Exemplo:
            >>> gui.parar_extracao()
            >>> # Sinal de parada enviado - extração será interrompida
        """
        from error_logger import ErrorLogger

        logger = ErrorLogger()

        # Setar stop_flag.set()
        self.stop_flag.set()
        logger.log_info("Sinal de parada enviado para thread de extração")

        # Desabilitar botão Parar
        self.btn_parar.configure(state="disabled")

        # Atualizar label de status para "Parando..."
        self.status_label.configure(text="Parando extração...")

    def exportar_dados(self) -> None:
        """
        Abre diálogo de exportação e salva dados.

        Exemplo:
            >>> gui.exportar_dados()
            >>> # Diálogo de salvamento aberto - usuário escolhe formato e local
        """
        from data_exporter import DataExporter
        from error_logger import ErrorLogger
        import os

        logger = ErrorLogger()

        try:
            # Verificar se há dados para exportar
            if not self.leads_data or len(self.leads_data) == 0:
                messagebox.showwarning(
                    "Sem Dados", "Não há dados para exportar. Execute uma extração primeiro.")
                logger.log_warning("Tentativa de exportação sem dados")
                return

            # Abrir filedialog para escolher formato (Excel ou CSV)
            # Primeiro, perguntar ao usuário qual formato deseja
            formato = messagebox.askquestion(
                "Escolher Formato",
                "Deseja exportar em formato Excel?\n\n(Clique 'Não' para exportar em CSV)",
                icon='question'
            )

            # Definir extensão e tipo de arquivo baseado na escolha
            if formato == 'yes':
                # Excel
                filetypes = [("Arquivo Excel", "*.xlsx"), ("Todos os arquivos", "*.*")]
                default_extension = ".xlsx"
                formato_nome = "Excel"
            else:
                # CSV
                filetypes = [("Arquivo CSV", "*.csv"), ("Todos os arquivos", "*.*")]
                default_extension = ".csv"
                formato_nome = "CSV"

            # Abrir diálogo para escolher local e nome do arquivo
            filepath = filedialog.asksaveasfilename(
                title="Salvar Arquivo",
                defaultextension=default_extension,
                filetypes=filetypes,
                initialfile=f"leads_google_maps{default_extension}"
            )

            # Verificar se usuário cancelou
            if not filepath:
                logger.log_info("Exportação cancelada pelo usuário")
                return

            # Criar instância de DataExporter com self.leads_data
            exporter = DataExporter(self.leads_data)

            # Chamar exportar_excel() ou exportar_csv() conforme escolha
            if formato == 'yes':
                sucesso = exporter.exportar_excel(filepath)
            else:
                sucesso = exporter.exportar_csv(filepath)

            # Exibir messagebox de confirmação com caminho do arquivo
            if sucesso:
                # Obter caminho absoluto para exibição
                filepath_absoluto = os.path.abspath(filepath)
                messagebox.showinfo(
                    "Exportação Concluída",
                    f"Dados exportados com sucesso!\n\nFormato: {formato_nome}\nArquivo: {filepath_absoluto}\n\nTotal de leads: {
                        len(
                            self.leads_data)}")
                logger.log_info(f"Exportação concluída: {filepath_absoluto}")
            else:
                messagebox.showerror(
                    "Erro na Exportação",
                    f"Ocorreu um erro ao exportar os dados para {formato_nome}.\n\nVerifique o arquivo de log para mais detalhes."
                )
                logger.log_erro(f"Falha na exportação para {formato_nome}")

        except Exception as e:
            # Adicionar try-except com messagebox de erro
            logger.log_erro("Erro durante exportação de dados", e)
            messagebox.showerror(
                "Erro na Exportação",
                f"Ocorreu um erro inesperado durante a exportação:\n\n{str(e)}"
            )

    def run(self) -> None:
        """
        Inicia o loop principal da aplicação.

        Exemplo:
            >>> gui = LeadExtractorGUI()
            >>> gui.criar_interface()
            >>> gui.run()  # Bloqueia até a janela ser fechada
        """
        self.root.mainloop()


    def iniciar_envio_whatsapp(self) -> None:
        """Inicia o envio automático de mensagens no WhatsApp."""
        from error_logger import ErrorLogger
        
        logger = ErrorLogger()
        
        try:
            # Verificar se há leads para enviar
            if not self.leads_data or len(self.leads_data) == 0:
                messagebox.showwarning(
                    "Sem Leads",
                    "Não há leads para enviar mensagens.\nExecute uma extração primeiro."
                )
                return
            
            # Obter mensagem personalizada
            mensagem = self.mensagem_text.get("1.0", "end-1c").strip()
            
            if not mensagem:
                messagebox.showwarning(
                    "Mensagem Vazia",
                    "Por favor, digite uma mensagem para enviar."
                )
                return
            
            # Confirmar com usuário
            confirmacao = messagebox.askyesno(
                "Confirmar Envio",
                f"Deseja enviar mensagens para {len(self.leads_data)} leads?\n\n"
                f"⚠️ IMPORTANTE:\n"
                f"• Você precisará escanear o QR Code do WhatsApp Web\n"
                f"• O envio terá delay aleatório de 45-120 segundos entre mensagens\n"
                f"• Mantenha o navegador aberto durante todo o processo\n\n"
                f"Continuar?"
            )
            
            if not confirmacao:
                return
            
            # Resetar stop flag
            self.whatsapp_stop_flag.clear()
            
            # Desabilitar botão de enviar e habilitar botão de parar
            self.btn_whatsapp.configure(state="disabled")
            self.btn_parar_whatsapp.configure(state="normal")
            
            # Atualizar status
            self.whatsapp_status_label.configure(text="🔄 Iniciando WhatsApp Web...")
            
            # Criar thread para envio
            self.whatsapp_thread = threading.Thread(
                target=self._executar_envio_whatsapp_async,
                args=(mensagem,),
                daemon=True
            )
            self.whatsapp_thread.start()
            
            logger.log_info(f"Envio de mensagens WhatsApp iniciado para {len(self.leads_data)} leads")
            
        except Exception as e:
            logger.log_erro("Erro ao iniciar envio WhatsApp", e)
            messagebox.showerror("Erro", f"Erro ao iniciar envio: {str(e)}")
    
    def _executar_envio_whatsapp_async(self, mensagem: str) -> None:
        """Executa o envio de mensagens em thread separada."""
        from whatsapp_sender import WhatsAppSender
        from error_logger import ErrorLogger
        import asyncio
        
        logger = ErrorLogger()
        
        try:
            # Criar novo event loop
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
            # Criar instância do WhatsAppSender
            sender = WhatsAppSender(headless=False)
            
            # Inicializar navegador
            loop.run_until_complete(sender.inicializar_navegador())
            
            # Atualizar status
            self.root.after(0, lambda: self.whatsapp_status_label.configure(
                text="📱 Escaneie o QR Code do WhatsApp Web para fazer login..."
            ))
            
            # Aguardar login do usuário
            login_sucesso = loop.run_until_complete(sender.aguardar_login(timeout=180))
            
            if not login_sucesso:
                self.root.after(0, lambda: messagebox.showerror(
                    "Erro de Login",
                    "Não foi possível fazer login no WhatsApp Web.\n"
                    "Por favor, tente novamente e escaneie o QR Code."
                ))
                loop.run_until_complete(sender.fechar_navegador())
                loop.close()
                self.root.after(0, self._on_envio_whatsapp_concluido)
                return
            
            # Atualizar status
            self.root.after(0, lambda: self.whatsapp_status_label.configure(
                text="✅ Login realizado! Iniciando envio de mensagens..."
            ))
            
            # Enviar mensagens em lote
            estatisticas = loop.run_until_complete(
                sender.enviar_mensagens_em_lote(
                    leads=self.leads_data,
                    mensagem_template=mensagem,
                    callback=self._atualizar_status_whatsapp_thread_safe,
                    stop_flag=self.whatsapp_stop_flag,
                    delay_min=45,
                    delay_max=120
                )
            )
            
            # Fechar navegador
            loop.run_until_complete(sender.fechar_navegador())
            loop.close()
            
            # Notificar conclusão
            self.root.after(0, lambda: self._on_envio_whatsapp_concluido(estatisticas))
            
        except Exception as e:
            logger.log_erro("Erro durante envio WhatsApp", e)
            self.root.after(0, lambda: messagebox.showerror(
                "Erro",
                f"Erro durante envio de mensagens:\n{str(e)}"
            ))
            self.root.after(0, self._on_envio_whatsapp_concluido)
    
    def _atualizar_status_whatsapp_thread_safe(self, enviados: int, total: int, status: str) -> None:
        """Atualiza o status do envio WhatsApp de forma thread-safe."""
        self.root.after(0, lambda: self.whatsapp_status_label.configure(
            text=f"{status} ({enviados}/{total})"
        ))
    
    def _on_envio_whatsapp_concluido(self, estatisticas: dict = None) -> None:
        """Callback executado quando o envio WhatsApp é concluído."""
        from error_logger import ErrorLogger
        
        logger = ErrorLogger()
        
        # Reabilitar botões
        self.btn_whatsapp.configure(state="normal")
        self.btn_parar_whatsapp.configure(state="disabled")
        
        if estatisticas:
            # Atualizar status
            self.whatsapp_status_label.configure(
                text=f"✅ Envio concluído! Enviados: {estatisticas['enviados']}, "
                f"Falhas: {estatisticas['falhas']}, Total: {estatisticas['total']}"
            )
            
            logger.log_info(
                f"Envio WhatsApp concluído. Enviados: {estatisticas['enviados']}, "
                f"Falhas: {estatisticas['falhas']}"
            )
            
            # Mostrar mensagem de conclusão
            messagebox.showinfo(
                "Envio Concluído",
                f"✅ Envio de mensagens concluído!\n\n"
                f"📤 Mensagens enviadas: {estatisticas['enviados']}\n"
                f"❌ Falhas: {estatisticas['falhas']}\n"
                f"📊 Total de leads: {estatisticas['total']}"
            )
        else:
            self.whatsapp_status_label.configure(text="⏳ Aguardando início do envio...")
    
    def parar_envio_whatsapp(self) -> None:
        """Para o envio de mensagens WhatsApp."""
        from error_logger import ErrorLogger
        
        logger = ErrorLogger()
        
        # Setar stop flag
        self.whatsapp_stop_flag.set()
        
        # Desabilitar botão de parar
        self.btn_parar_whatsapp.configure(state="disabled")
        
        # Atualizar status
        self.whatsapp_status_label.configure(text="⏸ Parando envio...")
        
        logger.log_info("Envio WhatsApp interrompido pelo usuário")
