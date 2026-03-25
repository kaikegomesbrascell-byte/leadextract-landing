# LeadExtract Advanced 2.0 - Arquitetura Técnica Detalhada

## Fluxo de Dados Completo

```
ENTRADA DO USUÁRIO
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│ PipelineLeadExtractor.extrair_e_enriquecer()                │
│ (Parâmetros: termo_busca, limite_empresas, max_concurrent)  │
└─────────────────────────────────────────────────────────────┘
        │
        ├──────────────────────────────────────────────────────┐
        │                                                      │
        ▼                                                      ▼
    FASE 1                                              Async/Await
    Mapas                                               Concorrência
    ┌──────────────────────────────────────────────────────────┐
    │ MapStealthScraper.buscar_empresas()                      │
    │                                                           │
    │  1. Playwright init com stealth mode                     │
    │  2. User-Agent rotativo + timezone BR                    │
    │  3. Injeção de código anti-detecção                      │
    │  4. Navigate to Google Maps                              │
    │  5. Auto-scroll simulando humano (delays)                │
    │  6. Extract JavaScript: nomes + ratings                  │
    │                                                           │
    │  → Output: List[EmpresaBase]                             │
    │           (nome, url_site, endereco, telefone, rating)   │
    └──────────────────────────────────────────────────────────┘
        │
        ▼ (50 empresas em paralelo com Semaphore)
    FASE 2
    Deep Crawl
    ┌──────────────────────────────────────────────────────────┐
    │ DeepCrawler.crawl_site() para cada URL                   │
    │                                                           │
    │  Para cada URL:                                           │
    │  ┌──────────────────────────────────────────────────┐    │
    │  │ 1. aiohttp.get(url, timeout=10s)                │    │
    │  │    - Se timeout → erro gracioso                 │    │
    │  │    - Se success → parseHTML                     │    │
    │  │                                                   │    │
    │  │ 2. BeautifulSoup4 parsing                        │    │
    │  │    ├─ EMAIL_REGEX (rigoroso)                     │    │
    │  │    │  Filtra: noreply, notification             │    │
    │  │    │  → List[str] max 10 emails                 │    │
    │  │    │                                             │    │
    │  │    ├─ WHATSAPP_REGEX                            │    │
    │  │    │  Busca: wa.me, tel:, +55 (11 dígitos BR)   │    │
    │  │    │  → Optional[str]                           │    │
    │  │    │                                             │    │
    │  │    ├─ Redes Sociais                             │    │
    │  │    │  Procura em <a href> por:                  │    │
    │  │    │  linkedin.com, instagram.com, facebook.com │    │
    │  │    │  → linkedin, instagram, facebook URLs      │    │
    │  │    │                                             │    │
    │  │    └─ Stack Tecnológico                         │    │
    │  │       gtm.js → tem_gtm: bool                    │    │
    │  │       fbevents.js → tem_facebook_pixel: bool    │    │
    │  │       analytics.google.com → tem_google_analytics    │
    │  │       hotjar → tem_hotjar: bool                 │    │
    │  │       viewport meta → design_responsivo         │    │
    │  │       https → https: bool                       │    │
    │  │                                                   │    │
    │  │ 3. Retorna: DadosEnriquecidos                   │    │
    │  │    (emails, whatsapp, redes, stack_tech)        │    │
    │  └──────────────────────────────────────────────────┘    │
    │                                                           │
    │  Error Handling:                                         │
    │  - Status != 200 → erro_crawl field                      │
    │  - Timeout → retry com aiohttp                          │
    │  - HTML parse fail → retorna dados parciais             │
    │  - Conexão recusada → erro_crawl + continue             │
    │                                                           │
    │  → Output: List[DadosEnriquecidos]                       │
    └──────────────────────────────────────────────────────────┘
        │
        ▼ (Paralelo com rate limiting)
    FASE 3
    Enriquecimento
    ┌──────────────────────────────────────────────────────────┐
    │ ReceitaWSEnricher.enriquecer_por_cnpj()                  │
    │                                                           │
    │  Para cada empresa:                                      │
    │  ┌──────────────────────────────────────────────────┐    │
    │  │ 1. Validar CNPJ (14 dígitos)                    │    │
    │  │                                                   │    │
    │  │ 2. HTTP GET a ReceitaWS API                      │    │
    │  │    URL: https://receitaws.com.br/v1/cnpj/{cnpj} │    │
    │  │                                                   │    │
    │  │ 3. Backoff Exponencial (se 429):                │    │
    │  │    delay = 2^retry + random(0, 1)              │    │
    │  │    max_retries = 3                              │    │
    │  │                                                   │    │
    │  │ 4. JSON Parsing:                                 │    │
    │  │    ├─ status → situacao_cadastral               │    │
    │  │    ├─ abertura (DD/MM/YYYY) → data + idade_dias │    │
    │  │    ├─ capital_social → float                     │    │
    │  │    ├─ qsa[] → socios: List[str]                │    │
    │  │    ├─ atividade_principal → str                 │    │
    │  │    └─ Treat errors gracefully                    │    │
    │  │                                                   │    │
    │  │ → Output: DadosFinanceiros                      │    │
    │  │    (cnpj, data_abertura, idade_dias,           │    │
    │  │     capital_social, socios)                     │    │
    │  └──────────────────────────────────────────────────┘    │
    │                                                           │
    │  Rate Limiting:                                          │
    │  - 1s delay entre requests (configurável)                │
    │  - Detecta HTTP 429                                      │
    │  - Retry automático com exponential backoff             │
    │                                                           │
    │  → Output: List[DadosFinanceiros]                        │
    └──────────────────────────────────────────────────────────┘
        │
        ▼
    FASE 4
    Scoring
    ┌──────────────────────────────────────────────────────────┐
    │ ScoringEngine.calcular_score()                           │
    │                                                           │
    │  Para cada lead (DadosEnriquecidos + DadosFinanceiros):  │
    │                                                           │
    │  Critério 1: Marketing Stack                            │
    │  ┌────────────────────────────────────────────────┐    │
    │  │ if not (tem_gtm OR tem_facebook_pixel):       │    │
    │  │     score += 3.0  # Precisam de marketing     │    │
    │  │ elif tem_gtm OR tem_facebook_pixel:           │    │
    │  │     score += 1.5  # Tem algo mas incompleto   │    │
    │  └────────────────────────────────────────────────┘    │
    │                                                          │
    │  Critério 2: Idade da Empresa                           │
    │  ┌────────────────────────────────────────────────┐    │
    │  │ if idade_dias < 365:                          │    │
    │  │     score += 3.0  # Empresa nova = expandindo │    │
    │  │ elif idade_dias < 730:                        │    │
    │  │     score += 1.5  # Ainda jovem               │    │
    │  └────────────────────────────────────────────────┘    │
    │                                                          │
    │  Critério 3: Acesso Direto (Contato)                   │
    │  ┌────────────────────────────────────────────────┐    │
    │  │ contato_score = 0                             │    │
    │  │ if whatsapp:                                  │    │
    │  │     contato_score += 2.0                      │    │
    │  │ if len(emails) >= 3:                          │    │
    │  │     contato_score += 2.0                      │    │
    │  │ elif len(emails) >= 1:                        │    │
    │  │     contato_score += 1.0                      │    │
    │  │ score += min(contato_score, 4.0)  # Max 4    │    │
    │  └────────────────────────────────────────────────┘    │
    │                                                          │
    │  Critério 4: Design Responsivo                          │
    │  ┌────────────────────────────────────────────────┐    │
    │  │ if design_responsivo:                         │    │
    │  │     score += 0.5  # Moderno/Website atualizado│    │
    │  └────────────────────────────────────────────────┘    │
    │                                                          │
    │  Critério 5: Redes Sociais Ativas                       │
    │  ┌────────────────────────────────────────────────┐    │
    │  │ redes_ativas = count(linkedin, instagram,     │    │
    │  │                     facebook)                  │    │
    │  │ if redes_ativas >= 2:                         │    │
    │  │     score += 1.0  # Presença digital forte    │    │
    │  └────────────────────────────────────────────────┘    │
    │                                                          │
    │  Normalização Final:                                    │
    │  score = min(max(score, 0.0), 10.0)                     │
    │                                                          │
    │  → Output: (score: float, breakdown: Dict[str, float])  │
    │  Exemplo breakdown:                                     │
    │  {                                                      │
    │    'sem_marketing_stack': 3.0,                          │
    │    'empresa_nova': 3.0,                                 │
    │    'acesso_direto': 4.0,                               │
    │    'redes_ativas': 1.0                                 │
    │  }  # Total: 11 → normalizado para 10                  │
    │                                                          │
    │  → Output: List[LeadFinal]                              │
    │    (empresa_base, dados_enriquecidos,                  │
    │     dados_financeiros, lead_score, score_breakdown)    │
    └──────────────────────────────────────────────────────────┘
        │
        ▼
    CONSOLIDAÇÃO
    ┌──────────────────────────────────────────────────────────┐
    │ PipelineLeadExtractor._leads_para_dataframe()            │
    │                                                           │
    │ Converter List[LeadFinal] para Pandas DataFrame           │
    │ Colunas finais:                                          │
    │ ├─ nome_empresa         (str)                           │
    │ ├─ url_site             (str)                           │
    │ ├─ endereco              (str)                           │
    │ ├─ telefone              (str)                           │
    │ ├─ rating                (float)                         │
    │ ├─ emails                (str, comma-separated)          │
    │ ├─ whatsapp              (str)                           │
    │ ├─ linkedin              (str)                           │
    │ ├─ instagram             (str)                           │
    │ ├─ facebook              (str)                           │
    │ ├─ tem_gtm               (bool)                          │
    │ ├─ tem_facebook_pixel    (bool)                          │
    │ ├─ tem_google_analytics  (bool)                          │
    │ ├─ design_responsivo     (bool)                          │
    │ ├─ cnpj                  (str)                           │
    │ ├─ data_abertura         (str ISO)                       │
    │ ├─ idade_dias            (int)                           │
    │ ├─ capital_social        (float)                         │
    │ ├─ socios                (str, comma-separated)          │
    │ ├─ lead_score            (float 0-10)                    │
    │ ├─ score_breakdown       (str JSON)                      │
    │ └─ erro                  (str, None se OK)               │
    │                                                           │
    │ Ordenar por lead_score DESC                              │
    │ → Output: pd.DataFrame                                   │
    └──────────────────────────────────────────────────────────┘
        │
        ▼
    EXPORTAÇÃO
    ┌──────────────────────────────────────────────────────────┐
    │ df.to_csv('leads_enriquecidos_brutal.csv')               │
    │                                                           │
    │ Arquivo CSV com:                                         │
    │ - Headers com nomes descritivos                          │
    │ - Encoding UTF-8 (suporta acentos)                       │
    │ - Sorted by lead_score (melhores no topo)                │
    │ - Todos os 22 campos preenchidos                         │
    │                                                           │
    │ Ready para:                                              │
    │ ✓ Abrir no Excel                                         │
    │ ✓ Importar em CRM                                        │
    │ ✓ Processar em Python                                    │
    │ ✓ Análise em BI Tools                                    │
    └──────────────────────────────────────────────────────────┘
        │
        ▼
    SAÍDA DO USUÁRIO
    leads_enriquecidos_brutal.csv
```

---

## Estrutura de Concorrência

```
┌─────────────────────────────────────────────────────────────┐
│  ASYNCIO EVENT LOOP (single-threaded, non-blocking)         │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Fase 1: Google Maps (sequencial com browser)      │    │
│  │ - 1 browser + 1 page = processamento lento        │    │
│  │ - ~2 min para 50 empresas                         │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Fase 2: Deep Crawl (altamente concorrente)        │    │
│  │                                                    │    │
│  │ Semaphore(5):                                      │    │
│  │ max 5 aiohttp requests simultâneos                │    │
│  │ Total: 50 URLs → 10 batches de 5                  │    │
│  │ Tempo: ~1-2 min para 50 URLs                      │    │
│  │                                                    │    │
│  │ gather([crawl_1, crawl_2, ... crawl_50])          │    │
│  │ → await tudo em paralelo                          │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Fase 3: ReceitaWS API (com rate limit)            │    │
│  │                                                    │    │
│  │ Rate limit: 1 segundo entre requests              │    │
│  │ gather([enriquecer_1, enriquecer_2, ... 50])      │    │
│  │ Timeout por requisição: sleep(1s) + HTTP          │    │
│  │ Tempo: ~2-3 min para 50 CNPJs                     │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Fase 4: Scoring (CPU-bound)                       │    │
│  │                                                    │    │
│  │ Cálculos síncronos rápidos                        │    │
│  │ 50 cálculos = ~50ms                               │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  TOTAL: ~5-8 minutos para 50 empresas completas            │
└─────────────────────────────────────────────────────────────┘
```

---

## Tratamento de Erros (camadas)

```
┌─────────────────────────────────────────────────────────────┐
│ CAMADA 1: Pipeline Level (try/except geral)                │
│                                                              │
│ try:                                                         │
│     await maps_scraper.buscar_empresas()                    │
│     await deep_crawl.crawl em paralelo                      │
│     await api_enrich em paralelo                            │
│     calculate scores                                         │
│     df = convert to dataframe                               │
│ except Exception as e:                                       │
│     logger.error(e)                                         │
│     return pd.DataFrame()  # Vazio mas não quebra           │
│ finally:                                                     │
│     cleanup recursos                                        │
│────────────────────────────────────────────────────────────│
│ CAMADA 2: Módulo Level                                     │
│                                                              │
│ DeepCrawler.crawl_site():                                   │
│ try:                                                         │
│     async with session.get(url):  # pode timeout            │
│     soup = BeautifulSoup(html)    # pode falhar parsing    │
│ except asyncio.TimeoutError:                                │
│     dados.erro_crawl = "Timeout"                           │
│     # Retorna dados parciais, não quebra                    │
│ except Exception:                                           │
│     dados.erro_crawl = "erro parsing"                      │
│     # Graceful degradation                                  │
│────────────────────────────────────────────────────────────│
│ CAMADA 3: Regex/Parse Level                                │
│                                                              │
│ def extract_emails():                                       │
│     try:                                                     │
│         matches = EMAIL_REGEX.finditer(html)  # safe        │
│     except Exception:                                       │
│         return []  # Vazio é OK                            │
│                                                              │
│ Regex nunca quebra porque:                                  │
│ - Compilado uma vez (no __init__)                           │
│ - finditer() nunca lança exception                          │
│ - Retorna matches vazios se nada encontra                   │
│────────────────────────────────────────────────────────────│
│ CAMADA 4: API Level (ReceitaWS)                             │
│                                                              │
│ async with session.get(url):                                │
│   if 429: retry com backoff exponencial                     │
│   if timeout: retry 3 vezes                                │
│   if 404: retorna dados vazio                              │
│   if outros: ignora e continua                             │
│                                                              │
│ Never breaks chain, sempre retorna DadosFinanceiros()      │
└─────────────────────────────────────────────────────────────┘

Filosofia: FAIL GRACEFULLY
- Nunca quebra o pipeline por erro em 1 empresa
- Retorna dados parciais quando possível
- Registra todos os erros em logs
- Usuário vê o que funcionou + o que falhou (em coluna 'erro')
```

---

## Memory Usage Projection

```
Para 50 empresas com 50 URLs cada:

┌─────────────────────────────┐
│ Maps Scraper                │
│ - Browser: ~200 MB          │
│ - Cache de páginas: ~50 MB  │
└─────────────────────────────┘
       50 MB  (empresas obj)
       ↓
┌─────────────────────────────┐
│ Deep Crawl                  │
│ - aiohttp session: ~30 MB   │
│ - HTML em cache: ~100 MB    │
│ - Parsed soup objects: ~20 MB
└─────────────────────────────┘
       200 MB (dados enriquecidos)
       ↓
┌─────────────────────────────┐
│ ReceitaWS API               │
│ - Respostas JSON: ~10 MB    │
│ - Parsed objects: ~10 MB    │
└─────────────────────────────┘
       100 MB (dados financeiros)
       ↓
┌─────────────────────────────┐
│ Scoring + Pandas DF         │
│ - DataFrame em RAM: ~50 MB  │
└─────────────────────────────┘

TOTAL: ~250-300 MB (normal)
Maximum observed: ~350 MB (com browser)
Minimum: ~150 MB (após cleanup)
```

---

## Performance Characteristics

```
Operation                    Time      Variability
─────────────────────────────────────────────────
Google Maps (50 cos)        2-3 min   ±30% (site latency)
Deep Crawl (50 URLs)        1-2 min   ±50% (site size)
ReceitaWS (50 CNPJs)        2-3 min   ±100% (rate limit)
Scoring (50 leads)          0.05 sec  ±0% (determinístico)
Pandas export               0.1 sec   ±0% (determinístico)
─────────────────────────────────────────────────────
TOTAL                       5-8 min   ±45% (esperado)

Bottleneck: Google Maps scraping (sequential)
Opportunity: Paralelizar com múltiplos browsers
```

---

## Dataclass Relationships

```
EmpresaBase
├─ nome: str
├─ url_site: str
├─ endereco: str
├─ telefone: str
├─ rating: float
└─ total_avaliacoes: int

DadosEnriquecidos
├─ empresa_base: EmpresaBase ──────┐
├─ emails: List[str]               │
├─ whatsapp: str                   │
├─ linkedin/instagram/facebook: str │
├─ tem_gtm/pixel/analytics: bool    │
├─ design_responsivo: bool         │
└─ erro_crawl: str                 │

DadosFinanceiros
├─ cnpj: str
├─ data_abertura: str
├─ idade_empresa_dias: int
├─ capital_social: float
└─ socios: List[str]

LeadFinal ──────────────┐
├─ empresa_base         │ ◄─ Referência
├─ dados_enriquecidos   │ ◄─ Contém EmpresaBase
├─ dados_financeiros    │
├─ lead_score: float    │
└─ score_breakdown: Dict│

LeadFinal → pandas.DataFrame (22 colunas flattened)
```

---

Documento gerado automaticamente. Version: 2.0.0
