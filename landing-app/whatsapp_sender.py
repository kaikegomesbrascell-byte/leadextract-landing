"""
WhatsApp Sender - Módulo de Disparo Automático de Mensagens
Envia mensagens personalizadas via WhatsApp Web para os leads extraídos.
"""

import asyncio
import random
import time
import urllib.parse
from typing import List, Dict, Callable, Optional
from playwright.async_api import async_playwright, Browser, Page, Playwright
from error_logger import ErrorLogger
import threading


class WhatsAppSender:
    """
    Classe para envio automático de mensagens via WhatsApp Web.
    
    Utiliza Playwright para automatizar o WhatsApp Web e enviar
    mensagens personalizadas para os leads extraídos.
    """
    
    def __init__(self, headless: bool = False):
        """
        Inicializa o WhatsApp Sender.
        
        Args:
            headless: Se True, executa navegador em modo headless (sem interface)
        """
        self.headless = headless
        self.browser: Optional[Browser] = None
        self.page: Optional[Page] = None
        self.playwright: Optional[Playwright] = None
        self.logger = ErrorLogger()
        
    async def inicializar_navegador(self) -> None:
        """
        Inicializa o navegador e abre o WhatsApp Web.
        
        O usuário precisará escanear o QR Code para fazer login.
        """
        try:
            self.logger.log_info("Inicializando navegador para WhatsApp Web...")
            
            # Inicializar Playwright
            self.playwright = await async_playwright().start()
            
            # Configurar navegador com perfil persistente para manter sessão
            self.browser = await self.playwright.chromium.launch(
                headless=self.headless,
                args=[
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-blink-features=AutomationControlled'
                ]
            )
            
            # Criar contexto do navegador
            context = await self.browser.new_context(
                viewport={'width': 1920, 'height': 1080},
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            )
            
            # Criar nova página
            self.page = await context.new_page()
            
            # Navegar para WhatsApp Web
            await self.page.goto('https://web.whatsapp.com', wait_until='domcontentloaded', timeout=60000)
            
            self.logger.log_info("WhatsApp Web aberto. Aguardando login do usuário...")
            
        except Exception as e:
            self.logger.log_erro("Erro ao inicializar navegador para WhatsApp", e)
            raise
    
    async def aguardar_login(self, timeout: int = 120) -> bool:
        """
        Aguarda o usuário fazer login no WhatsApp Web (escanear QR Code).
        
        Args:
            timeout: Tempo máximo de espera em segundos (padrão: 120s)
            
        Returns:
            True se login foi bem-sucedido, False caso contrário
        """
        try:
            self.logger.log_info("Aguardando login no WhatsApp Web...")
            
            # Aguardar elemento que indica que o usuário está logado
            # O elemento de busca só aparece após o login
            await self.page.wait_for_selector(
                'div[contenteditable="true"][data-tab="3"]',
                timeout=timeout * 1000,
                state='visible'
            )
            
            self.logger.log_info("Login no WhatsApp Web realizado com sucesso!")
            
            # Aguardar mais um pouco para garantir que tudo carregou
            await asyncio.sleep(3)
            
            return True
            
        except Exception as e:
            self.logger.log_erro("Timeout ou erro ao aguardar login no WhatsApp", e)
            return False
    
    async def enviar_mensagem(
        self,
        telefone: str,
        mensagem: str,
        nome_empresa: str = ""
    ) -> bool:
        """
        Envia uma mensagem para um número de telefone via WhatsApp Web.
        
        Args:
            telefone: Número de telefone (formato: +5516999999999 ou 16999999999)
            mensagem: Texto da mensagem a ser enviada
            nome_empresa: Nome da empresa (para personalização)
            
        Returns:
            True se mensagem foi enviada com sucesso, False caso contrário
        """
        try:
            # Limpar e formatar telefone
            telefone_limpo = self._limpar_telefone(telefone)
            
            if not telefone_limpo:
                self.logger.log_warning(f"Telefone inválido: {telefone}")
                return False
            
            # Personalizar mensagem com nome da empresa
            mensagem_personalizada = mensagem.replace("{nome}", nome_empresa)
            mensagem_personalizada = mensagem_personalizada.replace("{empresa}", nome_empresa)
            
            # Codificar mensagem para URL
            mensagem_encoded = urllib.parse.quote(mensagem_personalizada)
            
            # Criar URL do WhatsApp
            url = f"https://web.whatsapp.com/send?phone={telefone_limpo}&text={mensagem_encoded}"
            
            self.logger.log_info(f"Enviando mensagem para {telefone_limpo} ({nome_empresa})...")
            
            # Navegar para URL do WhatsApp
            await self.page.goto(url, wait_until='domcontentloaded', timeout=30000)
            
            # Aguardar a página carregar
            await asyncio.sleep(5)
            
            # Aguardar o campo de mensagem aparecer
            try:
                await self.page.wait_for_selector(
                    'div[contenteditable="true"][data-tab="10"]',
                    timeout=15000,
                    state='visible'
                )
            except:
                self.logger.log_warning(f"Campo de mensagem não encontrado para {telefone_limpo}")
                return False
            
            # Aguardar um pouco mais para garantir que a mensagem foi preenchida
            await asyncio.sleep(2)
            
            # Pressionar Enter para enviar
            await self.page.keyboard.press('Enter')
            
            self.logger.log_info(f"✓ Mensagem enviada para {telefone_limpo} ({nome_empresa})")
            
            # Aguardar confirmação de envio
            await asyncio.sleep(2)
            
            return True
            
        except Exception as e:
            self.logger.log_erro(f"Erro ao enviar mensagem para {telefone}", e)
            return False
    
    async def enviar_mensagens_em_lote(
        self,
        leads: List[Dict[str, str]],
        mensagem_template: str,
        callback: Callable[[int, int, str], None],
        stop_flag: threading.Event,
        delay_min: int = 45,
        delay_max: int = 120
    ) -> Dict[str, int]:
        """
        Envia mensagens para múltiplos leads com delay aleatório entre envios.
        
        Args:
            leads: Lista de leads com telefone e nome
            mensagem_template: Template da mensagem (use {nome} para personalizar)
            callback: Função para atualizar progresso (enviados, total, status)
            stop_flag: Flag para parar o envio
            delay_min: Delay mínimo entre mensagens em segundos (padrão: 45s)
            delay_max: Delay máximo entre mensagens em segundos (padrão: 120s)
            
        Returns:
            Dicionário com estatísticas: {'enviados': X, 'falhas': Y, 'total': Z}
        """
        estatisticas = {
            'enviados': 0,
            'falhas': 0,
            'total': len(leads)
        }
        
        try:
            self.logger.log_info(f"Iniciando envio em lote para {len(leads)} leads...")
            
            for index, lead in enumerate(leads, 1):
                # Verificar se foi solicitado parar
                if stop_flag.is_set():
                    self.logger.log_info("Envio interrompido pelo usuário")
                    break
                
                telefone = lead.get('telefone', 'N/A')
                nome = lead.get('nome', 'Cliente')
                
                # Pular se não tiver telefone válido
                if telefone == 'N/A' or not telefone:
                    self.logger.log_warning(f"Lead sem telefone válido: {nome}")
                    estatisticas['falhas'] += 1
                    callback(estatisticas['enviados'], estatisticas['total'], f"❌ Sem telefone: {nome}")
                    continue
                
                # Atualizar status
                callback(estatisticas['enviados'], estatisticas['total'], f"📤 Enviando para: {nome}...")
                
                # Enviar mensagem
                sucesso = await self.enviar_mensagem(telefone, mensagem_template, nome)
                
                if sucesso:
                    estatisticas['enviados'] += 1
                    callback(estatisticas['enviados'], estatisticas['total'], f"✅ Enviado: {nome}")
                else:
                    estatisticas['falhas'] += 1
                    callback(estatisticas['enviados'], estatisticas['total'], f"❌ Falha: {nome}")
                
                # Aplicar delay aleatório entre mensagens (exceto na última)
                if index < len(leads):
                    delay = random.randint(delay_min, delay_max)
                    self.logger.log_info(f"Aguardando {delay} segundos antes da próxima mensagem...")
                    callback(estatisticas['enviados'], estatisticas['total'], f"⏳ Aguardando {delay}s...")
                    
                    # Aguardar com verificação de stop_flag
                    for _ in range(delay):
                        if stop_flag.is_set():
                            break
                        await asyncio.sleep(1)
            
            self.logger.log_info(
                f"Envio em lote concluído. Enviados: {estatisticas['enviados']}, "
                f"Falhas: {estatisticas['falhas']}, Total: {estatisticas['total']}"
            )
            
            return estatisticas
            
        except Exception as e:
            self.logger.log_erro("Erro durante envio em lote", e)
            return estatisticas
    
    def _limpar_telefone(self, telefone: str) -> str:
        """
        Limpa e formata o número de telefone para o formato do WhatsApp.
        
        Args:
            telefone: Número de telefone em qualquer formato
            
        Returns:
            Número limpo no formato internacional (ex: 5516999999999)
        """
        # Remover caracteres não numéricos
        telefone_limpo = ''.join(filter(str.isdigit, telefone))
        
        # Se não tiver código do país, adicionar 55 (Brasil)
        if len(telefone_limpo) == 11:  # DDD + número (ex: 16999999999)
            telefone_limpo = '55' + telefone_limpo
        elif len(telefone_limpo) == 10:  # DDD + número sem 9 (ex: 1699999999)
            # Adicionar 9 após o DDD
            ddd = telefone_limpo[:2]
            numero = telefone_limpo[2:]
            telefone_limpo = '55' + ddd + '9' + numero
        
        # Validar tamanho (deve ter 13 dígitos: 55 + DDD + 9 dígitos)
        if len(telefone_limpo) != 13:
            return ""
        
        return telefone_limpo
    
    async def fechar_navegador(self) -> None:
        """Fecha o navegador e libera recursos."""
        try:
            if self.page:
                await self.page.close()
                self.logger.log_info("Página do WhatsApp fechada")
            
            if self.browser:
                await self.browser.close()
                self.logger.log_info("Navegador fechado")
            
            if self.playwright:
                await self.playwright.stop()
                self.logger.log_info("Playwright encerrado")
                
        except Exception as e:
            self.logger.log_erro("Erro ao fechar navegador do WhatsApp", e)
