# 🚀 Como Transformar o Lead Extractor em .EXE

## 📋 Pré-requisitos

- Python 3.9 ou superior instalado
- Todas as dependências do projeto instaladas

## 🔧 Passo 1: Instalar PyInstaller

Abra o terminal/prompt de comando na pasta `lead-extractor-app` e execute:

```bash
pip install pyinstaller
```

**Aguarde a instalação concluir.** Você verá algo como:
```
Successfully installed pyinstaller-X.X.X
```

## 📦 Passo 2: Gerar o Executável

Depois que o PyInstaller estiver instalado, execute:

```bash
pyinstaller --onefile --windowed --name="LeadExtractor" --add-data="license.key;." main.py
```

### O que cada parâmetro faz:

- `--onefile` - Cria um único arquivo .exe (mais fácil de distribuir)
- `--windowed` - Não mostra o console (janela preta) ao executar
- `--name="LeadExtractor"` - Nome do arquivo .exe
- `--add-data="license.key;."` - Inclui o arquivo de licença no executável
- `main.py` - Arquivo principal do programa

**IMPORTANTE:** O arquivo `license.key` deve estar na mesma pasta que `main.py` ao executar este comando.

## ⏳ Aguarde a Compilação

O processo pode demorar alguns minutos. Você verá várias mensagens no terminal.

**Mensagens normais:**
```
INFO: PyInstaller: 6.x.x
INFO: Python: 3.x.x
INFO: Platform: Windows-10-...
INFO: Building EXE from EXE-00.toc
INFO: Building EXE from EXE-00.toc completed successfully.
```

## 📁 Localizar o Arquivo .EXE

Após a compilação, o arquivo estará em:

```
lead-extractor-app/dist/LeadExtractor.exe
```

**Estrutura de pastas criada:**
```
lead-extractor-app/
├── build/              (pasta temporária - pode deletar)
├── dist/               (PASTA COM O .EXE)
│   └── LeadExtractor.exe  ← ESTE É O ARQUIVO!
├── LeadExtractor.spec  (arquivo de configuração)
└── ... (outros arquivos)
```

## ✅ Testar o Executável

1. Navegue até a pasta `dist/`
2. Dê duplo clique em `LeadExtractor.exe`
3. A interface gráfica deve abrir

## 📦 Distribuir para Clientes

Para distribuir, você precisa apenas do arquivo:
```
LeadExtractor.exe
```

**IMPORTANTE:** O arquivo .exe é grande (~150-200MB) porque inclui:
- Python embutido
- Todas as bibliotecas
- Navegador Chromium do Playwright

## 🐛 Problemas Comuns

### Erro: "pyinstaller não é reconhecido"

**Solução:** Instale o PyInstaller:
```bash
pip install pyinstaller
```

### Erro: "Failed to execute script"

**Solução:** Use o modo console para ver o erro:
```bash
pyinstaller --onefile --name="LeadExtractor" --add-data="license.key;." main.py
```
(Sem o `--windowed`)

### Erro: "Arquivo de licença não encontrado"

**Solução:** Certifique-se de que:
1. O arquivo `license.key` está na mesma pasta que `main.py`
2. Você incluiu o parâmetro `--add-data="license.key;."` no comando PyInstaller
3. Regenere o executável com o comando correto

### Erro: "No module named 'playwright'"

**Solução:** Instale as dependências:
```bash
pip install -r requirements.txt
playwright install chromium
```

### Executável muito grande

**Normal!** O arquivo tem ~150-200MB porque inclui:
- Python completo
- Todas as bibliotecas
- Navegador Chromium

### Antivírus bloqueia o .exe

**Normal!** Executáveis gerados pelo PyInstaller podem ser detectados como falso positivo.

**Soluções:**
1. Adicione exceção no antivírus
2. Assine digitalmente o executável (requer certificado)
3. Distribua o código-fonte Python ao invés do .exe

## 🎯 Alternativa: Auto-py-to-exe (Interface Gráfica)

Se preferir uma interface gráfica:

### 1. Instalar Auto-py-to-exe

```bash
pip install auto-py-to-exe
```

### 2. Abrir a Interface

```bash
auto-py-to-exe
```

### 3. Configurar

- **Script Location:** Clique em "Browse" e selecione `main.py`
- **Onefile:** Selecione "One File"
- **Console Window:** Selecione "Window Based (hide the console)"
- **Icon:** (Opcional) Adicione um ícone .ico

### 4. Converter

Clique em "CONVERT .PY TO .EXE" e aguarde.

O arquivo estará em `output/LeadExtractor.exe`

## 📝 Notas Importantes

### Tamanho do Executável

O arquivo .exe será grande (~150-200MB) porque inclui:
- Python completo embutido
- Todas as bibliotecas (playwright, customtkinter, pandas, etc.)
- Navegador Chromium completo

**Isso é normal e esperado!**

### Primeira Execução

Na primeira execução, o programa pode demorar alguns segundos para iniciar enquanto descompacta os arquivos temporários.

### Distribuição

Para distribuir para clientes:
1. Copie apenas o arquivo `LeadExtractor.exe`
2. Não precisa de Python instalado no computador do cliente
3. Não precisa de dependências instaladas
4. Funciona em qualquer Windows 10/11

### Atualização

Para atualizar o executável:
1. Faça as alterações no código Python
2. Execute novamente o PyInstaller
3. Distribua o novo .exe

## 🎉 Pronto!

Agora você tem um executável profissional do Lead Extractor que pode ser distribuído para seus clientes!

---

**Dúvidas?** Consulte a documentação oficial do PyInstaller:
https://pyinstaller.org/en/stable/
