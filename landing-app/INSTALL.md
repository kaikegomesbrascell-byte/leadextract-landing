# Guia de Instalação - Google Maps Lead Extractor

## 🚀 Instalação Rápida

### Para Usuários Finais (Executável)

1. Baixe o arquivo executável `LeadExtractor.exe`
2. Coloque o arquivo `license.key` no mesmo diretório
3. Execute o arquivo `.exe`
4. Pronto! O software está pronto para uso

**Não é necessário instalar Python ou qualquer dependência.**

---

## 👨‍💻 Instalação para Desenvolvimento

### Pré-requisitos

- Python 3.9 ou superior
- pip (gerenciador de pacotes Python)
- Git (opcional)
- Conexão com internet

### Passo 1: Obter o Código

**Opção A - Com Git:**
```bash
git clone <url-do-repositorio>
cd google-maps-lead-extractor
```

**Opção B - Download Manual:**
1. Baixe o arquivo ZIP do projeto
2. Extraia para uma pasta
3. Abra o terminal na pasta extraída

### Passo 2: Criar Ambiente Virtual

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**Linux/Mac:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### Passo 3: Instalar Dependências

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### Passo 4: Instalar Navegadores Playwright

```bash
playwright install chromium
```

Este comando baixa o navegador Chromium necessário para a automação (~100MB).

### Passo 5: Configurar Licença

Crie ou edite o arquivo `license.key` com suas credenciais:

```json
{
    "api_key": "GMLE-XXXX-XXXX-XXXX-XXXX",
    "expiration_date": "2025-12-31",
    "customer_name": "Seu Nome",
    "license_type": "commercial"
}
```

### Passo 6: Executar

```bash
python main.py
```

---

## 🔧 Verificação da Instalação

### Verificar Versão do Python

```bash
python --version
```

Deve retornar Python 3.9 ou superior.

### Verificar Dependências Instaladas

```bash
pip list
```

Deve listar: playwright, customtkinter, pandas, openpyxl

### Verificar Playwright

```bash
playwright --version
```

---

## 🐛 Solução de Problemas na Instalação

### Erro: "python não é reconhecido"

**Windows:**
- Reinstale o Python marcando "Add Python to PATH"
- Ou use `py` ao invés de `python`

**Linux/Mac:**
- Use `python3` ao invés de `python`

### Erro: "pip não é reconhecido"

```bash
python -m pip install --upgrade pip
```

### Erro ao instalar playwright

```bash
pip install playwright --force-reinstall
playwright install chromium --force
```

### Erro: "tkinter não encontrado"

**Ubuntu/Debian:**
```bash
sudo apt-get install python3-tk
```

**Fedora:**
```bash
sudo dnf install python3-tkinter
```

**Windows/Mac:**
tkinter já vem incluído no Python.

### Erro de permissão no Linux/Mac

Use `sudo` antes dos comandos ou ajuste permissões:
```bash
sudo pip install -r requirements.txt
```

### Erro: "Não foi possível encontrar uma versão"

Atualize o pip:
```bash
pip install --upgrade pip setuptools wheel
```

---

## 📦 Gerando Executável (Avançado)

### Instalar PyInstaller

```bash
pip install pyinstaller
```

### Gerar Executável

```bash
pyinstaller --name="LeadExtractor" --onefile --windowed main.py
```

O executável estará em `dist/LeadExtractor.exe`

### Incluir Dependências

Para incluir todas as dependências do Playwright e CustomTkinter, use o arquivo `.spec` (será criado na Task 14).

---

## 🔄 Atualizando o Software

### Atualizar Código

```bash
git pull origin main
```

### Atualizar Dependências

```bash
pip install -r requirements.txt --upgrade
```

### Atualizar Playwright

```bash
playwright install chromium
```

---

## 🗑️ Desinstalação

### Remover Ambiente Virtual

**Windows:**
```bash
deactivate
rmdir /s venv
```

**Linux/Mac:**
```bash
deactivate
rm -rf venv
```

### Remover Dependências Globais (não recomendado)

```bash
pip uninstall playwright customtkinter pandas openpyxl
```

---

## 📞 Suporte

Se encontrar problemas durante a instalação:

1. Verifique os logs em `lead_extractor.log`
2. Consulte a seção de Solução de Problemas no README.md
3. Entre em contato com o suporte técnico

---

**Última Atualização**: 2024
