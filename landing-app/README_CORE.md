# LeadExtract Core - Sistema de Extração B2B Indetectável

Sistema profissional de extração e enriquecimento de leads B2B para o mercado brasileiro, com arquitetura assíncrona e bypass de anti-bots.

## 🚀 Arquitetura

### Módulo 1: Maps Scraper Stealth
- Extração de leads do Google Maps com comportamento humano
- Scroll automático com variações de velocidade
- Bypass de detecção de automação
- Extrai: Nome, URL, Endereço, Telefone

### Módulo 2: Deep Crawler
- Invasão profunda dos sites das empresas
- Playwright Stealth para bypass de Cloudflare/Captcha
- Extração de:
  - E-mails categorizados (Contato, RH, Comercial)
  - WhatsApp (via regex de wa.me e tel:)
  - Redes sociais (LinkedIn, Instagram)
  - Stack de marketing (GTM, Facebook Pixel)

### Módulo 3: Enriquecimento ReceitaWS
- Busca de CNPJ por nome da empresa
- Extração de dados da Receita Federal:
  - Data de abertura (idade da empresa)
  - Capital social
  - Quadro de sócios (QSA)
- Backoff exponencial para evitar rate limit

### Módulo 4: Motor de Scoring
- Score de 0 a 10 baseado em:
  - **+3 pontos**: Sem GTM/Facebook Pixel (precisam de marketing)
  - **+3 pontos**: Empresa < 1 ano (estão expandindo)
  - **+4 pontos**: WhatsApp/Email encontrado (contato fácil)

## 📦 Instalação

### Requisitos
- Python 3.10+
- Windows/Linux/macOS

### Setup Automático

```bash
# 1. Clone ou baixe os arquivos
# 2. Execute o setup
python setup_core.py
```

### Setup Manual

```bash
# Instalar dependências
pip install -r requirements_core.txt

# Instalar navegador Chromium
playwright install chromium
```

## 🎯 Uso Básico

### Execução Simples

```python
python lead_extractor_core.py
```

### Personalização

Edite a função `main()` em `lead_extractor_core.py`:

```python
async def main():
    TERMO_BUSCA = "Clínicas de Estética em Rio de Janeiro"
    MAX_RESULTADOS = 50
    OUTPUT_FILE = "leads_clinicas_rj.csv"
    
    pipeline = LeadExtractPipeline()
    df = await pipeline.run(TERMO_BUSCA, MAX_RESULTADOS)
    df.to_csv(OUTPUT_FILE, index=False, encoding='utf-8-sig')
```

## 🔧 Configuração Avançada

### Usando Proxies

```python
from config_advanced import PRODUCTION_CONFIG

# Adicionar proxies
PRODUCTION_CONFIG.use_proxies = True
PRODUCTION_CONFIG.proxy_list = [
    "http://user:pass@proxy1.com:8080",
    "http://user:pass@proxy2.com:8080"
]

# Usar no pipeline
pipeline = LeadExtractPipeline(config=PRODUCTION_CONFIG)
```

### Modos de Operação

```python
from config_advanced import get_config

# Modo padrão (balanceado)
config = get_config("default")

# Modo produção (conservador, mais seguro)
config = get_config("production")

# Modo agressivo (requer proxies)
config = get_config("aggressive")
```

## 📊 Saída de Dados

### Arquivo CSV Gerado

`leads_enriquecidos_brutal.csv` contém:

| Coluna | Descrição |
|--------|-----------|
| nome_empresa | Nome da empresa |
| url_site | URL do site |
| endereco | Endereço físico |
| telefone_publico | Telefone do Maps |
| email_contato | E-mail de contato |
| email_rh | E-mail de RH/Vagas |
| email_comercial | E-mail comercial |
| whatsapp | Número de WhatsApp |
| linkedin | URL do LinkedIn |
| instagram | URL do Instagram |
| tem_gtm | Tem Google Tag Manager |
| tem_facebook_pixel | Tem Facebook Pixel |
| cnpj | CNPJ da empresa |
| data_abertura | Data de abertura |
| capital_social | Capital social |
| socios | Lista de sócios |
| **lead_score** | **Score de 0 a 10** |

### Exemplo de Uso do CSV

```python
import pandas as pd

# Carregar leads
df = pd.read_csv('leads_enriquecidos_brutal.csv')

# Filtrar leads quentes (score >= 7)
leads_quentes = df[df['lead_score'] >= 7]

# Filtrar empresas sem marketing
sem_marketing = df[(~df['tem_gtm']) & (~df['tem_facebook_pixel'])]

# Filtrar empresas jovens com WhatsApp
jovens_whatsapp = df[
    (df['data_abertura'].notna()) & 
    (df['whatsapp'].notna())
]
```

## ⚡ Performance

### Benchmarks

- **Maps Scraping**: ~2-3 segundos por lead
- **Deep Crawl**: ~3-5 segundos por site
- **Enriquecimento**: ~1-2 segundos por empresa
- **Total**: ~50 leads em 5-8 minutos

### Otimizações

```python
# Aumentar concorrência (use com proxies)
pipeline = LeadExtractPipeline()
pipeline.max_concurrent = 10  # Padrão: 5

# Reduzir timeout para sites lentos
config.timeout = 15  # Padrão: 30
```

## 🛡️ Evasão de Anti-Bots

### Técnicas Implementadas

1. **Playwright Stealth**
   - Remove propriedade `navigator.webdriver`
   - Injeta `window.chrome`
   - User-Agent rotativo

2. **Comportamento Humano**
   - Scroll com variações de velocidade
   - Delays aleatórios entre ações
   - Movimentos de mouse simulados

3. **Rate Limiting**
   - Semáforo para limitar concorrência
   - Backoff exponencial em erros
   - Delays configuráveis

## 🚨 Avisos Legais

### Uso Responsável

- ✅ Use para prospecção B2B legítima
- ✅ Respeite robots.txt e termos de serviço
- ✅ Implemente delays adequados
- ❌ Não use para spam ou atividades ilegais
- ❌ Não sobrecarregue servidores

### LGPD e Privacidade

- Dados públicos apenas
- Não armazene dados sensíveis sem consentimento
- Implemente opt-out para empresas
- Consulte um advogado para uso comercial

## 🔍 Troubleshooting

### Erro: "Playwright not installed"

```bash
playwright install chromium
```

### Erro: "Rate limit exceeded"

```python
# Aumentar delay entre requisições
config.delay_between_requests = 3.0
```

### Erro: "Timeout"

```python
# Aumentar timeout
config.timeout = 60
```

### Sites bloqueando

```python
# Usar proxies rotativos
config.use_proxies = True
config.proxy_list = ["proxy1", "proxy2"]
```

## 📈 Roadmap

- [ ] Integração com CRM (HubSpot, Pipedrive)
- [ ] Detecção de tecnologias (BuiltWith)
- [ ] Análise de sentimento em redes sociais
- [ ] Predição de churn
- [ ] Dashboard web em tempo real
- [ ] API REST para integração

## 🤝 Contribuindo

Pull requests são bem-vindos! Para mudanças grandes, abra uma issue primeiro.

## 📄 Licença

Uso comercial permitido. Atribuição apreciada.

## 💬 Suporte

Para dúvidas ou problemas:
1. Abra uma issue no GitHub
2. Consulte a documentação
3. Entre em contato com o desenvolvedor

---

**Desenvolvido com ❤️ para o mercado B2B brasileiro**

🚀 **Bom scraping e boas vendas!**
