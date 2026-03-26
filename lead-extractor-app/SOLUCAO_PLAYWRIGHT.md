# Solução para o Problema do Playwright

## Problema Identificado

O executável está tentando usar o navegador Chromium do Playwright, mas:
1. O navegador não está incluído no executável
2. O navegador não está instalado no sistema do usuário
3. PyInstaller extrai arquivos para uma pasta temporária (`_MEI...`) onde o Playwright não consegue encontrar o navegador

## Solução Implementada

Vamos usar uma abordagem diferente: **incluir os binários do Playwright diretamente no executável**.

### Passos:

1. **Baixar o navegador Chromium do Playwright** (uma vez, no ambiente de desenvolvimento)
2. **Incluir os binários no executável** usando PyInstaller
3. **Configurar o Playwright para usar os binários incluídos**

## Como Implementar

### Passo 1: Instalar o navegador Chromium localmente

Execute no terminal (dentro de `lead-extractor-app`):

```bash
python -m playwright install chromium
```

Isso vai baixar o navegador para:
- Windows: `C:\Users\[USER]\AppData\Local\ms-playwright\chromium-*`

### Passo 2: Atualizar o código para usar binários incluídos

Vamos modificar `automation_engine.py` para:
1. Detectar se está rodando como executável PyInstaller
2. Usar o caminho correto para os binários do Playwright

### Passo 3: Atualizar LeadExtractor.spec

Incluir os binários do Playwright no executável.

## Tamanho do Executável

⚠️ **AVISO**: Incluir o navegador Chromium vai aumentar significativamente o tamanho do executável:
- Tamanho atual: ~89 MB
- Tamanho com Chromium: ~250-300 MB
- Tamanho do ZIP: ~150-180 MB

Isso é normal para aplicações que incluem navegadores completos.

## Alternativa Mais Simples

Se o tamanho for um problema, podemos criar um **instalador** que:
1. Instala o executável
2. Baixa e instala o Chromium automaticamente na primeira execução
3. Mostra uma barra de progresso durante o download

Qual abordagem você prefere?
- **Opção A**: Incluir tudo no executável (mais simples, mas arquivo maior)
- **Opção B**: Criar instalador com download automático (arquivo menor, mas mais complexo)
