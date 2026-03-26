# Estrutura do Projeto - Google Maps Lead Extractor

## 📁 Visão Geral dos Arquivos

```
google-maps-lead-extractor/
│
├── 📄 main.py                      # Ponto de entrada da aplicação
├── 🤖 automation_engine.py         # Motor de automação Playwright
├── 🎨 gui_manager.py               # Interface gráfica CustomTkinter
├── 🔐 license_validator.py         # Validador de licenças
├── 💾 data_exporter.py             # Exportador Excel/CSV
├── 📝 error_logger.py              # Sistema de logging
├── 📊 models.py                    # Modelos de dados (Lead, SearchQuery, etc.)
│
├── 📋 requirements.txt             # Dependências Python
├── 🔑 license.key                  # Arquivo de licença (exemplo)
├── 📖 README.md                    # Documentação principal
├── 🚀 INSTALL.md                   # Guia de instalação
├── 📁 PROJECT_STRUCTURE.md         # Este arquivo
├── 🚫 .gitignore                   # Arquivos ignorados pelo Git
│
├── 📂 .kiro/                       # Diretório de especificações
│   └── specs/
│       └── google-maps-lead-extractor/
│           ├── requirements.md     # Requisitos do sistema
│           ├── design.md          # Documento de design
│           └── tasks.md           # Plano de implementação
│
└── 📜 lead_extractor.log           # Log de erros (gerado automaticamente)
```

## 🔧 Descrição dos Módulos

### main.py
**Responsabilidade**: Ponto de entrada da aplicação
- Inicializa o sistema de logging
- Cria e inicia a interface gráfica
- Gerencia o loop principal da aplicação

**Dependências**: 
- gui_manager.py
- error_logger.py

---

### automation_engine.py
**Responsabilidade**: Automação do navegador e extração de dados
- Controla o Playwright/Chromium
- Navega no Google Maps
- Extrai dados das empresas
- Implementa proteção anti-bot

**Classe Principal**: `GoogleMapsAutomation`

**Métodos Principais**:
- `inicializar_navegador()` - Configura Playwright
- `buscar_empresas()` - Executa busca completa
- `scroll_resultados()` - Scroll infinito na sidebar
- `extrair_dados_empresa()` - Extrai dados de uma empresa
- `aplicar_delay_humano()` - Delays aleatórios
- `fechar_navegador()` - Limpa recursos

**Dependências**:
- playwright.async_api
- asyncio
- models.py
- error_logger.py

---

### gui_manager.py
**Responsabilidade**: Interface gráfica do usuário
- Cria e gerencia todos os widgets
- Coordena threads de extração
- Atualiza UI em tempo real
- Gerencia eventos do usuário

**Classe Principal**: `LeadExtractorGUI`

**Componentes da UI**:
- Campos de entrada (nicho, localização)
- Slider de limite de leads
- Botões (Iniciar, Parar, Exportar)
- Barra de progresso
- Tabela de dados (Treeview)

**Dependências**:
- customtkinter
- tkinter.ttk
- threading
- automation_engine.py
- license_validator.py
- data_exporter.py
- error_logger.py

---

### license_validator.py
**Responsabilidade**: Validação de licenças comerciais
- Lê e valida arquivo license.key
- Verifica data de expiração
- Valida formato da chave de API
- Retorna status da licença

**Classe Principal**: `LicenseValidator`

**Métodos Principais**:
- `validar_licenca()` - Validação completa
- `verificar_expiracao()` - Checa data
- `verificar_api_key()` - Valida formato da chave
- `obter_status_licenca()` - Retorna mensagem descritiva

**Dependências**:
- json
- datetime
- error_logger.py

---

### data_exporter.py
**Responsabilidade**: Exportação de dados
- Converte leads para DataFrame
- Exporta para Excel com formatação
- Exporta para CSV
- Aplica estilos profissionais

**Classe Principal**: `DataExporter`

**Métodos Principais**:
- `preparar_dataframe()` - Cria DataFrame pandas
- `exportar_excel()` - Exporta para .xlsx
- `exportar_csv()` - Exporta para .csv
- `formatar_excel()` - Aplica formatação profissional

**Dependências**:
- pandas
- openpyxl
- error_logger.py

---

### error_logger.py
**Responsabilidade**: Sistema de logging
- Registra erros, avisos e informações
- Escreve em arquivo e console
- Implementa padrão Singleton
- Formata logs com timestamp

**Classe Principal**: `ErrorLogger`

**Métodos Principais**:
- `log_erro()` - Registra erro com traceback
- `log_info()` - Registra informação
- `log_warning()` - Registra aviso

**Dependências**:
- logging
- datetime

---

### models.py
**Responsabilidade**: Modelos de dados
- Define estruturas de dados do sistema
- Implementa validações
- Fornece métodos de conversão

**Classes**:
- `Lead` - Dados de uma empresa
- `SearchQuery` - Parâmetros de busca
- `ExtractionState` - Estado da extração

**Dependências**:
- dataclasses
- typing
- datetime
- urllib.parse

---

## 🔄 Fluxo de Dados

```
[Usuário] → [GUI Manager] → [License Validator]
                ↓
         [Automation Engine] → [Google Maps]
                ↓
         [Lead Models] → [GUI Manager] (atualização em tempo real)
                ↓
         [Data Exporter] → [Arquivo Excel/CSV]
```

## 🧵 Arquitetura de Threading

```
Main Thread (GUI)
    │
    ├─> CustomTkinter Event Loop
    │   └─> Atualização de widgets
    │
    └─> Extraction Thread
        └─> asyncio Event Loop
            └─> Playwright Automation
                └─> Callbacks para Main Thread
```

## 📦 Dependências Externas

### Produção
- **playwright** (1.40.0) - Automação de navegador
- **customtkinter** (5.2.1) - Interface gráfica moderna
- **pandas** (2.1.4) - Manipulação de dados
- **openpyxl** (3.1.2) - Exportação Excel

### Desenvolvimento
- **pyinstaller** - Geração de executável
- **pylint/flake8** - Linting de código

### Padrão Python (incluídos)
- **asyncio** - Programação assíncrona
- **threading** - Execução paralela
- **tkinter** - Base do CustomTkinter
- **json** - Leitura de licenças
- **logging** - Sistema de logs
- **datetime** - Manipulação de datas
- **urllib** - Encoding de URLs

## 🎯 Padrões de Design Utilizados

1. **MVC Adaptado**: Separação View/Controller/Model
2. **Singleton**: ErrorLogger compartilhado
3. **Observer**: Callbacks para atualização de UI
4. **Strategy**: Diferentes estratégias de exportação
5. **Thread-Safe Communication**: root.after() para GUI updates

## 📝 Convenções de Código

- **Idioma**: Português brasileiro (comentários, variáveis, funções)
- **Estilo**: PEP 8
- **Docstrings**: Todas as classes e funções principais
- **Type Hints**: Utilizados onde apropriado
- **Nomes**: Descritivos e em português

## 🔐 Arquivos Sensíveis (não commitar)

- `license.key` - Licenças reais de clientes
- `lead_extractor.log` - Logs com possíveis dados sensíveis
- `*.xlsx`, `*.csv` - Dados exportados de clientes
- `venv/` - Ambiente virtual

## 📊 Tamanhos Aproximados

- **Código fonte**: ~50KB
- **Dependências instaladas**: ~200MB
- **Executável final**: ~150-200MB
- **Navegador Chromium**: ~100MB

---

**Última Atualização**: 2024
