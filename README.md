# 🚀 LeadExtract - Sistema Inteligente de Prospecção B2B

Sistema completo de extração e qualificação de leads B2B com módulos de inteligência avançada.

## 📋 Visão Geral

LeadExtract é uma solução completa para prospecção B2B que combina:
- Extração automatizada de dados do Google Maps
- 3 módulos de inteligência avançada (IA)
- Sistema de pagamentos integrado (PIX e Cartão)
- Interface gráfica intuitiva
- Exportação para CSV/Excel

## ✨ Funcionalidades

### Extração Básica
- ✅ Nome da empresa
- ✅ Telefone
- ✅ Website
- ✅ Endereço completo
- ✅ Avaliação (rating)
- ✅ Total de avaliações
- ✅ Área em m² (quando disponível)

### 🧠 Módulos de Inteligência Avançada

#### Módulo A: Radar de Expansão 📰
Identifica sinais de crescimento através de notícias:
- Inaugurações
- Expansões
- Contratações
- Investimentos recebidos

**Valor**: Fornece o momento ideal e motivo real para contato

#### Módulo B: Raio-X Tecnologia 🔍
Analisa maturidade digital da empresa:
- Facebook Pixel
- Google Tag Manager
- Google Analytics
- Hotjar
- Design Responsivo
- HTTPS

**Score de Oportunidade**: 0-10 (quanto maior, melhor a oportunidade)

#### Módulo C: Tom de Voz 💬
Classifica personalidade da marca:
- Institucional/Sério
- Moderno/Inovador
- Focado em Preço/Promoção

**Valor**: Personaliza abordagem comercial

### 💳 Sistema de Pagamentos
- PIX (QR Code + Código Copia e Cola)
- Cartão de Crédito/Débito
- Integração com SigiloPay
- Modelo de assinatura mensal

## 🛠️ Tecnologias

### Backend
- Python 3.8+
- Playwright (automação web)
- BeautifulSoup4 (parsing HTML)
- Requests (HTTP)
- Tkinter (GUI)

### Frontend (Landing Page)
- React + TypeScript
- Vite
- TailwindCSS
- Shadcn/ui
- Framer Motion

### Backend API (Pagamentos)
- Node.js + Express
- SigiloPay API
- CORS habilitado

## 📦 Instalação

### 1. Clonar Repositório
```bash
git clone https://github.com/seu-usuario/leadextract.git
cd leadextract
```

### 2. Instalar Dependências Python
```bash
cd lead-extractor-app
pip install -r requirements.txt
pip install -r requirements_intelligence.txt
```

### 3. Instalar Playwright
```bash
playwright install chromium
```

### 4. Instalar Dependências Node.js (Backend API)
```bash
cd ../backend
npm install
```

### 5. Instalar Dependências Frontend (Landing Page)
```bash
cd ../landing-page
npm install
```

## 🚀 Como Usar

### Aplicação Principal (Lead Extractor)
```bash
cd lead-extractor-app
python main.py
```

### Backend API (Pagamentos)
```bash
cd backend
npm start
```
Servidor rodará em: http://localhost:3001

### Landing Page
```bash
cd landing-page
npm run dev
```
Página rodará em: http://localhost:8081

## 📊 Módulos de Inteligência

### Uso Básico
```python
from intelligence_modules import scan_lead

# Analisar uma empresa
resultado = scan_lead(
    nome_empresa="Natura",
    url="https://www.natura.com.br"
)

print(f"Score de Oportunidade: {resultado['score_geral']}/10")
print(f"Diagnóstico: {resultado['tech_diagnostico']}")
print(f"Tom de Voz: {resultado['tom_voz']}")
```

### Processamento em Lote
```python
from exemplo_uso_intelligence import processar_leads_com_intelligence

df_enriquecido = processar_leads_com_intelligence(
    leads_csv='meus_leads.csv',
    output_csv='leads_enriquecidos.csv'
)
```

## 📁 Estrutura do Projeto

```
leadextract/
├── lead-extractor-app/          # Aplicação principal Python
│   ├── main.py                  # Ponto de entrada
│   ├── automation_engine.py     # Motor de automação
│   ├── gui_manager.py           # Interface gráfica
│   ├── intelligence_modules.py  # Módulos de IA
│   ├── data_exporter.py         # Exportação de dados
│   └── models.py                # Modelos de dados
│
├── backend/                     # API de pagamentos
│   ├── server.js                # Servidor Express
│   └── package.json             # Dependências Node
│
├── landing-page/                # Landing page React
│   ├── src/                     # Código fonte
│   └── package.json             # Dependências React
│
└── docs/                        # Documentação
    ├── MODULOS_INTELLIGENCE_README.md
    ├── GUIA_IMPLEMENTACAO_INTELLIGENCE.md
    └── SCRIPTS_VENDA_INTELLIGENCE.md
```

## 🎯 Casos de Uso

### 1. Prospecção Qualificada
Extraia leads com score de oportunidade para priorizar abordagem

### 2. Timing Perfeito
Identifique empresas em expansão para contato no momento ideal

### 3. Abordagem Personalizada
Use análise de tom de voz para personalizar mensagens

### 4. Análise de Mercado
Entenda maturidade digital do seu segmento

## 💰 Modelo de Negócio

- **Plano Básico**: R$ 1.000/mês (extração básica)
- **Plano Premium**: R$ 1.000/mês (com módulos de inteligência)

## 📈 Resultados Esperados

- +40% taxa de conversão
- +60% taxa de resposta
- +3x fechamento de vendas
- -50% tempo de prospecção

## 🔐 Segurança

- Credenciais em variáveis de ambiente
- HTTPS obrigatório em produção
- Dados sensíveis não versionados
- CORS configurado adequadamente

## 🧪 Testes

### Testar Módulos de Inteligência
```bash
cd lead-extractor-app
python teste_rapido_intelligence.py
```

### Testar API de Pagamentos
```bash
curl http://localhost:3001
```

## 📚 Documentação

- [Módulos de Inteligência](MODULOS_INTELLIGENCE_README.md)
- [Guia de Implementação](GUIA_IMPLEMENTACAO_INTELLIGENCE.md)
- [Scripts de Venda](SCRIPTS_VENDA_INTELLIGENCE.md)
- [Resumo Executivo](RESUMO_MODULOS_INTELLIGENCE.md)

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:
1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto é proprietário. Todos os direitos reservados.

## 👨‍💻 Autor

Desenvolvido por [Seu Nome]

## 📞 Suporte

Para dúvidas ou suporte:
- Email: [seu-email@exemplo.com]
- WhatsApp: [seu-numero]

## 🎉 Agradecimentos

- Playwright Team
- React Community
- SigiloPay

---

**⭐ Se este projeto te ajudou, deixe uma estrela!**
