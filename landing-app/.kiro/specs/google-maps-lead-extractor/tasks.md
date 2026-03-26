# Implementation Plan: Google Maps Lead Extractor

## Overview

Este plano de implementação detalha as tarefas para construir o Google Maps Lead Extractor, um software comercial B2B de extração de leads. O sistema será desenvolvido em Python utilizando Playwright para automação, CustomTkinter para interface gráfica moderna, e incluirá sistema de licenciamento comercial e exportação profissional de dados.

A implementação seguirá uma abordagem incremental, começando pela estrutura base, depois os componentes core (automação e GUI), seguido por funcionalidades comerciais (licenciamento e exportação), e finalizando com integração e polimento.

## Tasks

- [x] 1. Configurar estrutura do projeto e dependências
  - Criar estrutura de diretórios do projeto
  - Criar arquivo requirements.txt com todas as dependências (playwright, customtkinter, pandas, openpyxl, asyncio)
  - Criar arquivo README.md com instruções de instalação e uso
  - Criar arquivo .gitignore para Python
  - Criar arquivo de exemplo license.key para testes
  - _Requirements: 10.5, 10.6_

- [x] 2. Implementar Error Logger (error_logger.py)
  - [x] 2.1 Criar classe ErrorLogger com padrão Singleton
    - Implementar __new__ para garantir instância única
    - Configurar logging para arquivo lead_extractor.log e console
    - Implementar métodos log_erro(), log_info(), log_warning()
    - Adicionar formatação de timestamp e níveis de log
    - _Requirements: 7.5, 10.1, 10.3_

- [x] 3. Implementar Data Models (models.py)
  - [x] 3.1 Criar dataclass Lead
    - Definir campos: nome, telefone, site, nota, comentarios, endereco
    - Implementar método to_dict() para conversão
    - Implementar método estático from_dict() para criação
    - Adicionar validação básica de campos
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_
  
  - [x] 3.2 Criar dataclass SearchQuery
    - Definir campos: nicho, localizacao, limite
    - Implementar método to_google_maps_url() com encoding de URL
    - Implementar método validar() com regras de validação
    - _Requirements: 1.1, 3.2, 3.3, 3.4_
  
  - [x] 3.3 Criar dataclass ExtractionState
    - Definir campos de estado: is_running, leads_extraidos, total_esperado, tempo_inicio, tempo_fim
    - Implementar método calcular_progresso() retornando float 0.0-1.0
    - Implementar método calcular_tempo_decorrido() retornando timedelta
    - _Requirements: 3.5, 11.4_

- [x] 4. Implementar Automation Engine (automation_engine.py)
  - [x] 4.1 Criar classe GoogleMapsAutomation com inicialização
    - Definir __init__ com parâmetro headless
    - Criar atributos para browser, page, playwright
    - Definir dicionário GOOGLE_MAPS_SELECTORS com seletores CSS
    - _Requirements: 1.2, 1.5_
  
  - [x] 4.2 Implementar método inicializar_navegador()
    - Inicializar Playwright async
    - Configurar Chromium com User-Agent realista
    - Configurar viewport 1920x1080
    - Abrir nova página do navegador
    - Adicionar tratamento de erros com retry (3 tentativas)
    - _Requirements: 1.1, 7.2, 8.3, 8.4_
  
  - [x] 4.3 Implementar método buscar_empresas()
    - Receber parâmetros: nicho, localizacao, limite, callback, stop_flag
    - Criar SearchQuery e validar parâmetros
    - Navegar para URL do Google Maps
    - Chamar scroll_resultados() para carregar empresas
    - Iterar sobre empresas e extrair dados
    - Chamar callback a cada 5 leads para atualizar UI
    - Verificar stop_flag em cada iteração
    - Retornar lista de leads extraídos
    - _Requirements: 1.1, 1.3, 2.8, 4.3, 11.2, 11.4_
  
  - [x] 4.4 Implementar método scroll_resultados()
    - Localizar container de resultados com seletor CSS
    - Executar scroll infinito com JavaScript
    - Aplicar delays aleatórios entre 1-3 segundos
    - Detectar fim dos resultados ou atingir limite
    - Verificar stop_flag durante scroll
    - _Requirements: 1.3, 1.4, 8.1, 8.2_
  
  - [x] 4.5 Implementar método extrair_dados_empresa()
    - Extrair nome usando seletor h1.DUwDvf
    - Extrair telefone com tratamento de formatação
    - Extrair site com limpeza de URL
    - Extrair nota numérica
    - Extrair quantidade de comentários
    - Extrair endereço completo
    - Retornar 'N/A' para campos não disponíveis
    - Adicionar try-except para cada campo com log de erro
    - Aplicar delay aleatório 2-5 segundos após extração
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 8.1_
  
  - [x] 4.6 Implementar método aplicar_delay_humano()
    - Gerar delay aleatório entre min_sec e max_sec
    - Usar asyncio.sleep() para delay assíncrono
    - _Requirements: 1.4, 8.1, 8.2_
  
  - [x] 4.7 Implementar método fechar_navegador()
    - Fechar página do navegador
    - Fechar browser
    - Parar Playwright
    - Liberar recursos
    - _Requirements: 11.5_

- [x] 5. Checkpoint - Testar Automation Engine isoladamente
  - Criar script de teste simples para validar extração
  - Executar busca de teste com 10 leads
  - Verificar se dados são extraídos corretamente
  - Validar delays e comportamento anti-bot
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implementar License Validator (license_validator.py)
  - [x] 6.1 Criar classe LicenseValidator
    - Definir __init__ com parâmetro license_file
    - Criar atributos: is_valid, expiration_date, api_key
    - _Requirements: 5.1_
  
  - [x] 6.2 Implementar método validar_licenca()
    - Ler arquivo license.key (JSON)
    - Verificar existência do arquivo
    - Validar estrutura JSON
    - Chamar verificar_expiracao() e verificar_api_key()
    - Retornar tupla (bool, mensagem)
    - Adicionar tratamento de erros para arquivo não encontrado
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  
  - [x] 6.3 Implementar método verificar_expiracao()
    - Parsear expiration_date do JSON
    - Comparar com data atual
    - Retornar True se válida, False se expirada
    - _Requirements: 5.2, 5.4_
  
  - [x] 6.4 Implementar método verificar_api_key()
    - Validar formato da chave (GMLE-XXXX-XXXX-XXXX-XXXX)
    - Verificar se não está vazia
    - Retornar True se válida
    - _Requirements: 5.3_
  
  - [x] 6.5 Implementar método obter_status_licenca()
    - Retornar mensagem descritiva do status
    - Incluir data de expiração se válida
    - Incluir motivo se inválida
    - _Requirements: 5.6_

- [x] 7. Implementar Data Exporter (data_exporter.py)
  - [x] 7.1 Criar classe DataExporter
    - Definir __init__ recebendo leads_data
    - Criar atributo df para DataFrame
    - _Requirements: 6.1_
  
  - [x] 7.2 Implementar método preparar_dataframe()
    - Converter lista de dicionários para pandas DataFrame
    - Definir colunas: Nome, Telefone, Site, Nota, Comentários, Endereço
    - _Requirements: 6.2, 6.5_
  
  - [x] 7.3 Implementar método exportar_excel()
    - Criar ExcelWriter com openpyxl
    - Escrever DataFrame para Excel
    - Chamar formatar_excel() para aplicar estilos
    - Salvar arquivo no filepath especificado
    - Retornar True em sucesso, False em erro
    - Adicionar try-except com log de erro
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 7.4_
  
  - [x] 7.4 Implementar método formatar_excel()
    - Aplicar negrito nos cabeçalhos
    - Ajustar largura das colunas automaticamente
    - Habilitar filtros automáticos
    - Congelar primeira linha
    - _Requirements: 6.3, 6.4_
  
  - [x] 7.5 Implementar método exportar_csv()
    - Usar DataFrame.to_csv() para exportar
    - Configurar encoding UTF-8
    - Salvar arquivo no filepath especificado
    - Retornar True em sucesso, False em erro
    - Adicionar try-except com log de erro
    - _Requirements: 6.1, 6.5, 7.4_

- [x] 8. Implementar GUI Manager (gui_manager.py) - Parte 1: Estrutura Base
  - [x] 8.1 Criar classe LeadExtractorGUI com inicialização
    - Definir __init__ criando janela CTk
    - Configurar tema dark mode
    - Definir título e dimensões da janela (1200x800)
    - Inicializar atributos: extraction_thread, stop_flag, leads_data
    - _Requirements: 3.1, 3.10_
  
  - [x] 8.2 Implementar método criar_interface() - Seção de Inputs
    - Criar frame para inputs
    - Criar CTkEntry para nicho com label
    - Criar CTkEntry para localização com label
    - Criar CTkSlider para limite com valores 50, 100, 500
    - Criar CTkLabel para exibir valor do slider
    - _Requirements: 3.2, 3.3, 3.4_
  
  - [x] 8.3 Implementar método criar_interface() - Seção de Controles
    - Criar frame para botões
    - Criar CTkButton "Iniciar Extração" vinculado a iniciar_extracao()
    - Criar CTkButton "Parar" vinculado a parar_extracao()
    - Criar CTkButton "Exportar" vinculado a exportar_dados()
    - Configurar estados iniciais dos botões
    - _Requirements: 3.7, 3.8, 3.9_
  
  - [x] 8.4 Implementar método criar_interface() - Seção de Progresso
    - Criar CTkProgressBar para exibir progresso
    - Configurar valor inicial em 0
    - Criar CTkLabel para exibir status textual
    - _Requirements: 3.5_
  
  - [x] 8.5 Implementar método criar_interface() - Tabela de Dados
    - Criar Treeview com colunas: Nome, Telefone, Site, Nota, Comentários, Endereço
    - Configurar cabeçalhos das colunas
    - Adicionar scrollbar vertical
    - Configurar larguras das colunas
    - _Requirements: 3.6_

- [x] 9. Implementar GUI Manager (gui_manager.py) - Parte 2: Lógica de Negócio
  - [x] 9.1 Implementar método validar_licenca()
    - Criar instância de LicenseValidator
    - Chamar validar_licenca()
    - Exibir messagebox com status da licença
    - Retornar True se válida, False se inválida
    - _Requirements: 5.1, 5.2, 5.6_
  
  - [x] 9.2 Implementar método iniciar_extracao()
    - Validar licença antes de iniciar
    - Obter valores dos inputs (nicho, localização, limite)
    - Criar SearchQuery e validar
    - Limpar tabela de dados anteriores
    - Resetar progress bar
    - Criar threading.Event para stop_flag
    - Criar thread passando _executar_extracao_async como target
    - Iniciar thread
    - Atualizar estados dos botões (desabilitar Iniciar, habilitar Parar)
    - _Requirements: 4.1, 4.4, 5.1_
  
  - [x] 9.3 Implementar método _executar_extracao_async()
    - Criar novo event loop asyncio
    - Criar instância de GoogleMapsAutomation
    - Chamar inicializar_navegador()
    - Chamar buscar_empresas() passando callback atualizar_progresso_thread_safe
    - Chamar fechar_navegador()
    - Notificar GUI sobre conclusão via root.after()
    - Adicionar try-except global com log de erro
    - _Requirements: 4.1, 4.2, 7.1, 7.6_
  
  - [x] 9.4 Implementar método atualizar_progresso_thread_safe()
    - Receber lead e progresso como parâmetros
    - Usar root.after(0, lambda) para executar na GUI thread
    - Chamar _atualizar_ui() com os dados
    - _Requirements: 4.2, 3.10_
  
  - [x] 9.5 Implementar método _atualizar_ui()
    - Atualizar progress bar com valor de progresso
    - Inserir novo lead na Treeview
    - Adicionar lead à lista self.leads_data
    - Atualizar label de status com contagem de leads
    - _Requirements: 3.5, 3.6, 3.10_
  
  - [x] 9.6 Implementar método parar_extracao()
    - Setar stop_flag.set()
    - Desabilitar botão Parar
    - Atualizar label de status para "Parando..."
    - _Requirements: 3.8, 4.3_
  
  - [x] 9.7 Implementar método exportar_dados()
    - Verificar se há dados para exportar
    - Abrir filedialog para escolher formato (Excel ou CSV)
    - Criar instância de DataExporter com self.leads_data
    - Chamar exportar_excel() ou exportar_csv() conforme escolha
    - Exibir messagebox de confirmação com caminho do arquivo
    - Adicionar try-except com messagebox de erro
    - _Requirements: 3.9, 6.1, 6.6, 6.7, 7.4_

- [x] 10. Checkpoint - Testar integração GUI + Automation
  - Executar aplicação completa
  - Testar fluxo completo: validação → extração → exportação
  - Verificar responsividade da UI durante extração
  - Testar botão Parar durante extração
  - Validar exportação Excel e CSV
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Criar arquivo principal main.py
  - [x] 11.1 Implementar função main()
    - Configurar logging inicial
    - Criar instância de LeadExtractorGUI
    - Chamar criar_interface()
    - Iniciar mainloop do CustomTkinter
    - Adicionar try-except global para erros não tratados
    - _Requirements: 10.1, 10.3_
  
  - [x] 11.2 Adicionar bloco if __name__ == "__main__"
    - Chamar main()
    - _Requirements: 10.2_

- [x] 12. Implementar tratamento robusto de erros em todos os componentes
  - [x] 12.1 Adicionar retry logic no Automation Engine
    - Implementar retry com 3 tentativas para erros de conexão
    - Adicionar intervalo de 5 segundos entre tentativas
    - Log detalhado de cada tentativa
    - _Requirements: 7.2_
  
  - [x] 12.2 Adicionar tratamento de mudanças de estrutura do Google Maps
    - Envolver extrações de seletores em try-except
    - Log erro detalhado quando seletor não encontrado
    - Continuar extração com 'N/A' para campo faltante
    - _Requirements: 7.3_
  
  - [x] 12.3 Implementar salvamento de dados em caso de erro fatal
    - Detectar erros fatais no _executar_extracao_async()
    - Salvar leads_data em arquivo JSON de emergência
    - Exibir messagebox informando sobre salvamento
    - _Requirements: 7.6_

- [x] 13. Otimizações de performance
  - [x] 13.1 Implementar atualização em lote da UI
    - Modificar atualizar_progresso_thread_safe para acumular 5 leads
    - Atualizar Treeview em lote a cada 5 registros
    - _Requirements: 11.2_
  
  - [x] 13.2 Adicionar monitoramento de memória
    - Implementar verificação de uso de memória
    - Log warning se ultrapassar 500MB
    - _Requirements: 11.3_
  
  - [x] 13.3 Implementar encerramento imediato ao atingir limite
    - Verificar leads_extraidos == limite em buscar_empresas()
    - Break imediato do loop quando atingir
    - _Requirements: 11.4_

- [x] 14. Preparar para distribuição como executável
  - [x] 14.1 Criar arquivo de configuração do PyInstaller
    - Criar arquivo lead_extractor.spec
    - Configurar inclusão de dependências do Playwright
    - Configurar inclusão de dependências do CustomTkinter
    - Configurar ícone da aplicação (se disponível)
    - Configurar modo one-file ou one-folder
    - _Requirements: 9.1, 9.2, 9.3_
  
  - [x] 14.2 Testar build do executável
    - Executar PyInstaller com arquivo .spec
    - Testar executável em ambiente limpo (sem Python)
    - Verificar tamanho do executável
    - Validar funcionamento completo
    - _Requirements: 9.4, 9.5_
  
  - [x] 14.3 Criar documentação de distribuição
    - Atualizar README.md com instruções de build
    - Criar guia de uso para usuários finais
    - Documentar requisitos de sistema
    - _Requirements: 10.5_

- [x] 15. Polimento final e documentação
  - [x] 15.1 Revisar todos os comentários e docstrings
    - Garantir que todos os comentários estão em português
    - Verificar docstrings em todas as funções e classes
    - Adicionar exemplos de uso onde apropriado
    - _Requirements: 10.1, 10.3_
  
  - [x] 15.2 Revisar conformidade com PEP 8
    - Executar linter (pylint ou flake8)
    - Corrigir problemas de formatação
    - Verificar nomes de variáveis e funções
    - _Requirements: 10.2, 10.4_
  
  - [x] 15.3 Criar arquivo de licença de exemplo completo
    - Criar license.key com dados de exemplo válidos
    - Documentar formato do arquivo no README
    - _Requirements: 5.1, 10.5_
  
  - [x] 15.4 Validar requirements.txt
    - Verificar todas as dependências listadas
    - Adicionar versões específicas para estabilidade
    - Testar instalação em ambiente virtual limpo
    - _Requirements: 10.6_

- [x] 16. Checkpoint final - Validação completa do sistema
  - Executar teste end-to-end completo
  - Validar todos os requisitos funcionais
  - Testar cenários de erro e recuperação
  - Validar performance (50 leads em < 5 minutos)
  - Testar executável em múltiplas máquinas Windows
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Todas as tarefas devem ser implementadas em Python 3.9+
- Comentários e documentação devem estar em português brasileiro
- O sistema deve manter a UI responsiva durante toda a extração usando threading
- Delays aleatórios são críticos para evitar detecção como bot
- O tratamento de erros deve ser robusto para lidar com mudanças no Google Maps
- A validação de licença deve bloquear funcionalidades se inválida
- A exportação Excel deve ter formatação profissional para uso comercial
- O executável final deve funcionar sem instalação de Python
