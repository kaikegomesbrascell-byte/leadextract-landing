# LeadExtract Advanced 2.0 - Documentação Técnica

## 📋 Índice
1. Visão Geral Arquitetural
2. Módulos
3. Instalação e Configuração
4. Uso e Exemplos
5. Personalização
6. Troubleshooting

---

## 1. Visão Geral Arquitetural

**LeadExtract Advanced** é um pipeline de extração de dados B2B totalmente assíncrono com 4 módulos independentes:

```
┌─────────────────┐
│  Maps Scraper   │ (Módulo 1)
│  (Extração)     │
└────────┬────────┘
         │ Lista de Empresas
         ▼
┌─────────────────┐
│  Deep Crawler   │ (Módulo 2)
│  (Invasão Site) │
└────────┬────────┘
         │ Emails, WhatsApp, Stack Tech
         ▼
┌─────────────────────────┐
│ ReceitaWS Enricher      │ (Módulo 3)
│ (Raio-X Financeiro)     │
└────────┬────────────────┘
         │ CNPJ, Idade, Capital, Sócios
         ▼
┌─────────────────┐
│ Scoring Engine  │ (Módulo 4)
│ (Lead Score)    │
└────────┬────────┘
         │ Score 0-10
         ▼
   leads_enriquecidos_brutal.csv
```

### Características Principais:
- ✅ **Fully Async**: asyncio + aiohttp para velocidade máxima
- ✅ **Stealth Mode**: Playwright com injeção de código anti-detecção
- ✅ **Type Hints**: 100% tipado com Type Hints para segurança
- ✅ **Error Handling**: Try/Except robusto com retry exponencial
- ✅ **Rate Limiting**: Respeita APIs com backoff inteligente
- ✅ **Modular**: Cada módulo pode rodar independentemente

---

## 2. Módulos em Detalhes

### 📍 Módulo 1: Maps Stealth Scraper

Extrai empresas do Google Maps com simulação perfeita de comportamento humano.

**Classe**: `MapStealthScraper`

**Métodos Principais**:
```python
# Inicializa browser Playwright com stealth
await scraper.inicializar()

# Busca empresas
empresas = await scraper.buscar_empresas(
    termo_busca="Energia Solar em São Paulo",
    limite=50,
    scroll_count=5
)

# Cleanup
await scraper.fechar()
```

**O que Extrai**:
- Nome da empresa
- URL do site (quando disponível)
- Rating do Google Maps
- Endereço
- Telefone público

**Técnicas Anti-Bot**:
- User-Agent rotativo
- Viewport realista 1920x1080
- Timezone e locale brasileiros
- Injeção de code para disfarçar webdriver
- Delays humanos entre ações

---

### 🕵️ Módulo 2: Deep Crawler

Acessa o site da empresa e extrai dados profundos.

**Classe**: `DeepCrawler`

**Métodos Principais**:
```python
await crawler.inicializar_session()

# Crawl um site
dados = await crawler.crawl_site(
    url="https://empresa.com.br",
    timeout=10
)

await crawler.fechar()
```

**O que Extrai**:
- **Emails**: Via regex rigoroso (RH, Contato, Comercial)
  - Filtra automático de noreply, notification
  - Busca em href=mailto: também
  
- **WhatsApp**: API wa.me + regex para números
  - Valida formato brasileiro (11 dígitos)
  
- **Redes Sociais**: LinkedIn, Instagram, Facebook
  
- **Stack Tecnológico**:
  - Google Tag Manager (gtm.js)
  - Facebook Pixel (fbevents.js)
  - Google Analytics
  - Hotjar
  - Design Responsivo (meta viewport)
  - HTTPS validado

**Tratamento de Erros**:
- Timeout: 10 segundos padrão
- Retry automático em falhas de conexão
- Fallback gracioso se site não responder
- Captura de informações parciais

---

### 💰 Módulo 3: ReceitaWS Enricher

Consulta API pública para dados financeiros brasileiros.

**Classe**: `ReceitaWSEnricher`

**Métodos Principais**:
```python
await enricher.inicializar()

dados = await enricher.enriquecer_por_cnpj("12345678000190")

await enricher.fechar()
```

**O que Extrai** (via API ReceitaWS):
- CNPJ validado
- Data de abertura (calcula idade em dias)
- Capital social
- Sócios (QSA - até 5 primeiros)
- Atividade principal
- Situação cadastral (Ativa/Inativa)

**Rate Limiting Inteligente**:
- Backoff exponencial: 2^n + random(0,1)
- Detecta HTTP 429 e aguarda
- Máximo 3 retentativas por CNPJ
- Delay de 1 segundo entre requisições (configurável)

**Exemplo de Resposta**:
```json
{
  "cnpj": "12345678000190",
  "data_abertura": "2023-06-15",
  "idade_empresa_dias": 280,
  "capital_social": 50000.00,
  "socios": ["João Silva", "Maria Santos"],
  "atividade_principal": "Consultoria em Tecnologia"
}
```

---

### 📊 Módulo 4: Scoring Engine

Calcula lead score inteligente de 0 a 10.

**Classe**: `ScoringEngine`

**Fórmula de Scoring**:

| Critério | Pontos | Lógica |
|----------|--------|--------|
| **Stack Marketing** | +3 | Sem GTM/Pixel = precisam de ajuda |
| | +1.5 | Com algumas ferramentas |
| **Idade Empresa** | +3 | < 1 ano (expandindo) |
| | +1.5 | 1-2 anos (jovem) |
| **Contato Direto** | +4 | WhatsApp + 3+ emails |
| | +2 | WhatsApp OU 3+ emails |
| | +1 | 1-2 emails |
| **Design Moderno** | +0.5 | Responsive design |
| **Redes Sociais** | +1 | 2+ redes ativas |
| **TOTAL** | **0-10** | Score final normalizado |

**Score Breakdown**:
Cada lead retorna um dicionário explicando como chegou ao score:
```python
{
    'sem_marketing_stack': 3.0,
    'empresa_nova': 3.0,
    'acesso_direto': 4.0,
    'redes_ativas': 1.0
}
# Total: 11 (normalizado para 10)
```

---

## 3. Instalação e Configuração

### Pré-requisitos:
- Python 3.10+
- pip ou Poetry
- ~500MB para downloads (Playwright, deps)

### Instalação:

```bash
# 1. Clonar / ir para o diretório
cd /path/to/leadextract

# 2. Criar venv (opcional mas recomendado)
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# 3. Instalar dependências
pip install -r requirements_advanced.txt

# 4. Instalar browsers Playwright
playwright install chromium

# 5. Verificar instalação
python -c "import playwright; print('✓ OK')"
```

### Configuração de Variáveis:

Edite `lead_extractor_advanced.py`:

```python
# Na função main():
TERMO_BUSCA = "Consultoria de Marketing em São Paulo"  # Mude para seu nicho
LIMITE = 50  # Número de empresas a extrair

# Para aumentar velocidade
pipeline = PipelineLeadExtractor(max_concurrent=10)  # Default: 5

# Para debug (mais logs)
logger.setLevel(logging.DEBUG)
```

---

## 4. Uso e Exemplos

### Exemplo 1: Uso Básico

```python
import asyncio
from lead_extractor_advanced import PipelineLeadExtractor

async def main():
    pipeline = PipelineLeadExtractor()
    
    df = await pipeline.extrair_e_enriquecer(
        termo_busca="Energia Solar em São Paulo",
        limite_empresas=50
    )
    
    # Salva CSV automaticamente
    print(df.head())

asyncio.run(main())
```

### Exemplo 2: Filtragem e Processamento

```python
# Após executar pipeline

# Top 10 melhores leads
top_10 = df_leads.nlargest(10, 'lead_score')[
    ['nome_empresa', 'whatsapp', 'emails', 'lead_score']
]
print(top_10)

# Empresas sem marketing stack
sem_stack = df_leads[df_leads['tem_gtm'] == False]

# Empresas com WhatsApp
com_whatsapp = df_leads[df_leads['whatsapp'].notna()]
```

### Exemplo 3: Exportação Avançada

```python
# Adicionar coluna de prioridade
df_leads['prioridade'] = pd.cut(
    df_leads['lead_score'],
    bins=[0, 3, 6, 10],
    labels=['Baixa', 'Média', 'Alta']
)

# Exportar por prioridade
for prioridade in ['Alta', 'Média', 'Baixa']:
    subset = df_leads[df_leads['prioridade'] == prioridade]
    subset.to_csv(f'leads_{prioridade.lower()}.csv')
```

### Exemplo 4: Usar Só Um Módulo

```python
from lead_extractor_advanced import DeepCrawler

# Crawl todos os sites
crawler = DeepCrawler()
await crawler.inicializar_session()

urls = [
    "https://empresa1.com.br",
    "https://empresa2.com.br",
]

for url in urls:
    dados = await crawler.crawl_site(url)
    print(f"{url}: {len(dados.emails)} emails, WhatsApp: {dados.whatsapp}")

await crawler.fechar()
```

---

## 5. Personalização

### 5.1 Modificar Critérios de Score

Edite a função `calcular_score()` em `ScoringEngine`:

```python
# Aumentar peso de encontrar emails
if emails_count >= 5:
    contato_score += 3.0  # Era 2.0
```

### 5.2 Adicionar Novos Regex

Em `DeepCrawler`:

```python
# Adicionar telefone formato específico
TELEFONE_COMERCIAL_REGEX = re.compile(r'comercial:[0-9]{10,11}')

# No método _extrair_dados_html():
for match in self.TELEFONE_COMERCIAL_REGEX.finditer(html):
    dados.telefone_comercial = match.group()
```

### 5.3 Integrar Outras APIs

Adicione métodos no `ReceitaWSEnricher`:

```python
async def enriquecer_linkedin(self, nome_empresa):
    """Buscar perfil LinkedIn da empresa"""
    # Seu código aqui
    pass
```

### 5.4 Aumentar Concorrência

```python
# 5 concurrent é default (safe)
# Increase para 20 se tiver servidor rápido
pipeline = PipelineLeadExtractor(max_concurrent=20)
```

---

## 6. Troubleshooting

### ❌ Erro: "Chromium not found"

```bash
playwright install chromium
```

### ❌ Erro: "aiohttp.ClientSSLError"

Adicionar ao código:
```python
connector = aiohttp.TCPConnector(ssl=False)
self.session = aiohttp.ClientSession(connector=connector)
```

### ❌ Timeout em muitos sites

Aumentar timeout:
```python
dados = await crawler.crawl_site(url, timeout=20)  # Era 10
```

### ❌ CPU 100%, muitas requisições simultâneas

Reduzir concorrência:
```python
pipeline = PipelineLeadExtractor(max_concurrent=3)
```

### ❌ "429 Too Many Requests" da ReceitaWS

É normal! O algoritmo de retry exponencial vai lidar. Aumentar delay:
```python
enricher.rate_limit_delay = 2.0  # 2 segundos entre requis
```

### ❌ CSV vazio ou poucas linhas extraídas

1. Verificar term_busca (Google Maps pode ter poucos resultados)
2. Ajustar scroll_count para deixar mais tempo de loading
3. Aumentar timeout nos crawls

---

## 📈 Benchmarks (Esperado)

| Métrica | Esperado |
|---------|----------|
| Empresas extraídas/min | 12-15 |
| Taxa de sucesso crawl | 75-85% |
| Tempo total 50 empresas | 5-8 min |
| Memória usada | 150-300MB |
| CPU | 40-60% (depende do sistema) |

---

## 🔒 Considerações de Segurança

✅ **Implementado**:
- Stealth mode contra detecção
- Delays aleatórios humanizados
- Rate limiting respeitoso
- SSL verification (opcional desabilitar)
- User-Agent rotativo

⚠️ **Responsabilidades do Usuário**:
- Respeitar `robots.txt` e ToS dos sites
- Não fazer requisições excessivas
- Usar para propósitos legais (B2B legítimo)
- Registrar atividade em logs para auditoria

---

## 📞 Contato / Support

- Logs detalhados em: `lead_extractor_advanced.log`
- Debug mode: Editar setLevel() para DEBUG
- Salva CSV automaticamente em: `leads_enriquecidos_brutal.csv`

---

## 🚀 Próximas Melhorias (Roadmap)

- [ ] Integração com API paga (Clearbit, Hunter.io)
- [ ] Dashboard web para monitorar progresso
- [ ] PostgreSQL backend para persistência
- [ ] Webhook para notificações em tempo real
- [ ] OCR para extrair dados de imagens
- [ ] Machine Learning para predictor de conversão

---

**Versão**: 2.0.0 | **Última atualização**: 2025-03-24 | **Status**: Production-Ready
