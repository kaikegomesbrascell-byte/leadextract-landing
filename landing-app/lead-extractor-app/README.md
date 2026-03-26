# Google Maps Lead Extractor

Software comercial B2B para extração automatizada de dados de empresas do Google Maps.

## 📋 Descrição

O Google Maps Lead Extractor é uma aplicação desktop profissional que permite extrair dados de empresas do Google Maps de forma automatizada. Com uma interface gráfica moderna e intuitiva, o sistema busca leads por nicho e localização, exibindo os resultados em tempo real e permitindo exportação em formatos profissionais (Excel/CSV).

## ✨ Funcionalidades

- 🔍 **Busca Automatizada**: Extração de leads por nicho e localização
- 🎨 **Interface Moderna**: GUI em dark mode com CustomTkinter
- 📊 **Visualização em Tempo Real**: Tabela atualizada durante a extração
- 📈 **Barra de Progresso**: Acompanhamento visual do processo
- 💾 **Exportação Profissional**: Formatos Excel (.xlsx) e CSV
- 🤖 **Proteção Anti-Bot**: Delays aleatórios e comportamento humanizado
- ⚡ **Performance**: Interface responsiva com threading

## 📦 Dados Extraídos

Para cada empresa, o sistema extrai:
- Nome da Empresa
- Telefone
- Site
- Nota/Rating
- Quantidade de Comentários
- Endereço Completo

## 🚀 Como Usar

### Executando o Software

```bash
python main.py
```

### Fluxo de Uso

1. **Preencha os campos**:
   - Nicho/Palavra-chave (ex: "restaurantes", "dentistas")
   - Localização/Cidade (ex: "São Paulo", "Rio de Janeiro")
   - Limite de leads (50, 100 ou 500)

2. **Clique em "Iniciar Extração"**:
   - A extração começará automaticamente
   - Os dados aparecerão em tempo real na tabela

3. **Acompanhe o progresso**:
   - Barra de progresso mostra o andamento
   - Tabela é atualizada conforme leads são extraídos
   - Use o botão "Parar" se necessário

4. **Exporte os dados**:
   - Clique em "Exportar"
   - Escolha o formato (Excel ou CSV)
   - Selecione o local e nome do arquivo
   - Pronto! Seus leads estão salvos

## 📥 Instalação

### 1. Instale o Python 3.9 ou superior

Baixe em: https://www.python.org/downloads/

### 2. Instale as dependências

```bash
pip install -r requirements.txt
```

### 3. Instale os navegadores do Playwright

```bash
playwright install chromium
```

## 📞 Suporte

Para suporte técnico, entre em contato conosco.

---

**Versão**: 1.0.0
