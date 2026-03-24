# 🚀 LeadExtract Core - Guia Rápido

## ✅ Sistema Instalado e Funcionando!

Os testes confirmaram que todos os módulos estão operacionais:
- ✅ Motor de Scoring: Funcionando (10/10 para leads ideais)
- ✅ Deep Crawler: Funcionando (Playwright + BeautifulSoup)
- ✅ Pipeline Assíncrono: Funcionando

## 📝 Como Usar

### 1. Execução Básica

```bash
python lead_extractor_core.py
```

Isso vai:
1. Buscar "Energia Solar em São Paulo" no Google Maps
2. Extrair até 20 leads
3. Fazer deep crawl em cada site
4. Enriquecer com dados da Receita (se disponível)
5. Calcular score de 0 a 10
6. Salvar em `leads_enriquecidos_brutal.csv`

### 2. Personalizar a Busca

Edite o arquivo `lead_extractor_core.py`, função `main()`:

```python
async def main():
    # PERSONALIZE AQUI
    TERMO_BUSCA = "Clínicas de Estética em Rio de Janeiro"
    MAX_RESULTADOS = 50
    OUTPUT_FILE = "leads_clinicas_rj.csv"
    
    pipeline = LeadExtractPipeline()
    df = await pipeline.run(TERMO_BUSCA, MAX_RESULTADOS)
    df.to_csv(OUTPUT_FILE, index=False, encoding='utf-8-sig')
```

### 3. Exemplos Avançados

```bash
python example_advanced_usage.py
```

Menu interativo com 6 exemplos:
1. Uso Básico
2. Múltiplos Nichos em Paralelo
3. Análise Avançada de Dados
4. Filtros Customizados
5. Exportação Excel Formatada
6. Modo Produção

### 4. Teste Rápido

```bash
python test_quick.py
```

Valida que todos os módulos estão funcionando.

## 📊 Entendendo o Score

O sistema calcula um score de 0 a 10 para cada lead:

| Score | Significado | Ação Recomendada |
|-------|-------------|------------------|
| 10 | 🔥 Lead Perfeito | Contatar AGORA |
| 7-9 | 🔥 Lead Quente | Prioridade alta |
| 4-6 | 🌡️ Lead Morno | Nutrir antes |
| 0-3 | ❄️ Lead Frio | Baixa prioridade |

### Como o Score é Calculado

```
+3 pontos: Sem GTM/Facebook Pixel (precisam de marketing)
+3 pontos: Empresa < 1 ano (estão expandindo)
+4 pontos: WhatsApp/Email encontrado (contato fácil)
```

**Exemplo de Lead 10/10:**
- ✅ Sem stack de marketing (precisa de ajuda)
- ✅ Empresa nova (está crescendo)
- ✅ WhatsApp direto (fácil de contatar)

## 📁 Arquivos Gerados

### leads_enriquecidos_brutal.csv

Contém todas as colunas:
- Dados básicos (nome, endereço, telefone)
- Contatos (emails, WhatsApp, redes sociais)
- Stack técnica (GTM, Facebook Pixel)
- Dados da Receita (CNPJ, sócios, capital)
- **Lead Score** (0-10)

### Como Usar o CSV

```python
import pandas as pd

# Carregar
df = pd.read_csv('leads_enriquecidos_brutal.csv')

# Filtrar leads quentes
quentes = df[df['lead_score'] >= 7]

# Filtrar empresas sem marketing
sem_marketing = df[(~df['tem_gtm']) & (~df['tem_facebook_pixel'])]

# Exportar para Excel
quentes.to_excel('leads_quentes.xlsx', index=False)
```

## ⚡ Dicas de Performance

### 1. Aumentar Velocidade (use com proxies)

```python
# Em lead_extractor_core.py, linha ~450
semaphore = asyncio.Semaphore(10)  # Padrão: 5
```

### 2. Reduzir Timeout

```python
# Em lead_extractor_core.py, linha ~200
await page.goto(lead.url_site, wait_until='networkidle', timeout=10000)
```

### 3. Usar Proxies

```python
from config_advanced import PRODUCTION_CONFIG

PRODUCTION_CONFIG.use_proxies = True
PRODUCTION_CONFIG.proxy_list = [
    "http://user:pass@proxy1.com:8080"
]
```

## 🎯 Casos de Uso

### 1. Prospecção de Energia Solar

```python
TERMO_BUSCA = "Energia Solar em São Paulo"
# Foco: Empresas sem marketing digital
```

### 2. Clínicas de Estética

```python
TERMO_BUSCA = "Clínicas de Estética em Rio de Janeiro"
# Foco: Empresas novas com WhatsApp
```

### 3. Consultorias

```python
TERMO_BUSCA = "Consultorias Empresariais em Belo Horizonte"
# Foco: Empresas com LinkedIn mas sem e-mail
```

## 🔧 Troubleshooting

### Erro: "Playwright not installed"

```bash
playwright install chromium
```

### Erro: "Module not found"

```bash
pip install aiohttp playwright beautifulsoup4 pandas lxml openpyxl
```

### Script muito lento

- Reduza `MAX_RESULTADOS` para 10-20
- Aumente `semaphore` para 10 (com proxies)
- Use `timeout=10000` em vez de 30000

### Sites bloqueando

- Use proxies rotativos
- Aumente delays entre requisições
- Use modo "production" (mais conservador)

## 📈 Próximos Passos

1. **Teste com 10 leads primeiro**
   ```python
   MAX_RESULTADOS = 10
   ```

2. **Analise os resultados**
   ```bash
   python example_advanced_usage.py
   # Escolha opção 3: Análise Avançada
   ```

3. **Escale gradualmente**
   - 10 leads → 20 leads → 50 leads → 100 leads

4. **Configure proxies para volume alto**
   - Use serviços como Bright Data, Oxylabs, etc.

## 🚨 Avisos Importantes

⚠️ **Use com responsabilidade**
- Respeite robots.txt
- Não sobrecarregue servidores
- Use delays adequados
- Configure proxies para volume alto

⚠️ **LGPD**
- Dados públicos apenas
- Implemente opt-out
- Consulte um advogado para uso comercial

## 💡 Dicas Profissionais

1. **Segmente por Score**
   - Score 10: Contato imediato
   - Score 7-9: Sequência de e-mails
   - Score 4-6: Nutrição de leads
   - Score 0-3: Lista de remarketing

2. **Priorize Empresas Sem Marketing**
   - Elas precisam de ajuda
   - Menos concorrência
   - Maior chance de conversão

3. **Empresas Novas São Ouro**
   - Estão investindo
   - Precisam de fornecedores
   - Menos resistência a mudanças

4. **WhatsApp > E-mail**
   - Taxa de resposta 10x maior
   - Conversas mais rápidas
   - Menos formal

## 🎉 Pronto para Começar!

```bash
# Execute agora
python lead_extractor_core.py

# Aguarde 5-10 minutos
# Abra leads_enriquecidos_brutal.csv
# Comece a prospectar! 🚀
```

---

**Desenvolvido para o mercado B2B brasileiro**

🔥 **Bom scraping e boas vendas!**
