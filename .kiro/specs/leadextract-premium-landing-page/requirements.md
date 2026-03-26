# Requirements Document

## Introduction

Este documento define os requisitos para a nova landing page premium do LeadExtract 6.0, uma plataforma de inteligência comercial B2B focada em vendas high-ticket para empresas de Energia Solar e Clínicas de Luxo. A landing page deve substituir ou melhorar a implementação React atual, incorporando design dark mode premium (estilo Linear/Vercel/Apple), copy agressivo de vendas B2B, e funcionalidades avançadas de conversão da versão HTML v6.

## Glossary

- **Landing_Page_System**: O sistema React/TypeScript/Vite/Tailwind que renderiza a landing page premium
- **Visitor**: Usuário que acessa a landing page (dono de empresa B2B)
- **CTA**: Call-to-Action, botão ou link que direciona para conversão (WhatsApp)
- **Exit_Intent**: Comportamento do usuário de mover o cursor para fora da janela do navegador
- **Scroll_Progress**: Indicador visual da porcentagem de scroll da página
- **Glassmorphism**: Efeito visual de vidro fosco com backdrop-filter blur
- **Dashboard_Mockup**: Visualização simulada do produto mostrando dados de leads
- **Conversion_Tracking**: Sistema de rastreamento de eventos de conversão (GA4, Facebook Pixel)
- **Social_Proof**: Seção com resultados reais de clientes para credibilidade
- **Exclusivity_Section**: Seção destacando escassez territorial (apenas 1 empresa por região)
- **Guarantee_Section**: Seção com garantia de 7 dias sem risco
- **FAQ_Section**: Seção de perguntas frequentes para superar objeções
- **Comparison_Section**: Seção "Antes vs Depois" mostrando benefícios
- **Mental_Trigger**: Gatilho psicológico de vendas (autoridade, escassez, urgência, prova social)
- **Responsive_Design**: Design adaptável para mobile, tablet e desktop
- **Animation_System**: Sistema de animações ao scroll e interações

## Requirements

### Requirement 1: Design System Dark Mode Premium

**User Story:** Como visitante da landing page, eu quero uma experiência visual premium e moderna, para que eu perceba o produto como high-ticket e profissional.

#### Acceptance Criteria

1. THE Landing_Page_System SHALL use dark mode color scheme with background #0A0A0A
2. THE Landing_Page_System SHALL use Neon Blue (#00D9FF) OR Emerald Green (#10B981) as accent colors
3. THE Landing_Page_System SHALL use Inter OR Geist sans-serif typography
4. THE Landing_Page_System SHALL apply glassmorphism effects (backdrop-filter blur with rgba backgrounds) to card components
5. THE Landing_Page_System SHALL display clean grid layouts with consistent spacing
6. THE Landing_Page_System SHALL use gradient text effects for headlines using accent colors
7. WHEN a card component is hovered, THE Landing_Page_System SHALL apply smooth transform and border-color transitions
8. THE Landing_Page_System SHALL maintain visual hierarchy with font sizes from 14px to 72px (responsive)

### Requirement 2: Hero Section com Copy Agressivo

**User Story:** Como visitante B2B, eu quero entender imediatamente o valor único do produto, para que eu decida se vale a pena continuar lendo.

#### Acceptance Criteria

1. THE Landing_Page_System SHALL display headline "Pare de bater na porta de quem não quer comprar. Domine o mercado com Inteligência de Estado."
2. THE Landing_Page_System SHALL display subheadline "O LeadExtract 6.0 não entrega listas. Ele entrega o diagnóstico financeiro, técnico e o contato direto do dono das empresas que têm dinheiro para fechar com você HOJE."
3. THE Landing_Page_System SHALL display a badge with text "🔥 Inteligência de Estado para Vendas B2B"
4. THE Landing_Page_System SHALL display primary CTA button with text "📱 Quero o Raio-X da minha Região"
5. WHEN the primary CTA is clicked, THE Landing_Page_System SHALL redirect to WhatsApp with pre-filled message "Quero o Raio-X da minha Região"
6. THE Landing_Page_System SHALL apply gradient animation to background with radial gradients using accent colors at 10% opacity

### Requirement 3: Dashboard Mockup Interativo

**User Story:** Como visitante, eu quero ver uma prévia visual do produto, para que eu entenda o que vou receber.

#### Acceptance Criteria

1. THE Landing_Page_System SHALL display a Dashboard_Mockup with glassmorphism card styling
2. THE Dashboard_Mockup SHALL display a table with columns: "Empresa", "Saúde Digital", "Gatilho de Expansão", "WhatsApp do Dono", "Status"
3. THE Dashboard_Mockup SHALL display at least 3 example rows with realistic data
4. THE Dashboard_Mockup SHALL display status badges with colors: red (#EF4444) for "QUENTE", yellow (#FBBF24) for "MORNO", blue (#3B82F6) for "FRIO"
5. THE Dashboard_Mockup SHALL display browser window chrome (3 dots) at the top
6. WHEN the Dashboard_Mockup is in viewport, THE Landing_Page_System SHALL apply float animation (translateY -20px over 6 seconds)

### Requirement 4: Features Section com Benefícios Transformados

**User Story:** Como visitante, eu quero entender os diferenciais do produto, para que eu veja valor além de uma simples lista de leads.

#### Acceptance Criteria

1. THE Landing_Page_System SHALL display section title "Não é uma lista. É Espionagem Comercial"
2. THE Landing_Page_System SHALL display 3 feature cards with titles: "Não é Scraping", "Não é E-mail", "Não é Telefone"
3. THE Landing_Page_System SHALL display feature card 1 with description "É Espionagem Comercial. Analisamos 6 tecnologias de marketing, maturidade digital e gaps de investimento. Você sabe exatamente onde a empresa está sangrando dinheiro."
4. THE Landing_Page_System SHALL display feature card 2 with description "É WhatsApp do Tomador de Decisão. Nada de secretária ou email genérico. Você fala direto com quem assina o cheque."
5. THE Landing_Page_System SHALL display feature card 3 with description "É Gatilho de Contratação e Expansão. Notícias de inauguração, contratação em massa, investimentos recebidos. Você liga no momento exato em que eles precisam de você."
6. WHEN a feature card is hovered, THE Landing_Page_System SHALL apply translateY(-8px) transform and change border color to accent
7. THE Landing_Page_System SHALL display icon (64x64px) with gradient background for each feature card

### Requirement 5: Exclusivity Section com Escassez

**User Story:** Como visitante, eu quero entender a exclusividade territorial, para que eu sinta urgência em garantir minha região.

#### Acceptance Criteria

1. THE Landing_Page_System SHALL display Exclusivity_Section with title "⚠️ Exclusividade Territorial"
2. THE Landing_Page_System SHALL display text "Eu não vendo para todos. Mapeio sua região e entrego a chave do mercado para apenas UMA empresa por setor. Se o seu concorrente fechar primeiro, você fica no escuro."
3. THE Landing_Page_System SHALL apply 2px border with Neon Blue color to Exclusivity_Section card
4. THE Landing_Page_System SHALL apply box-shadow with Neon Blue glow (0 0 80px rgba(0, 217, 255, 0.2))
5. THE Landing_Page_System SHALL display CTA button with text "🔒 Garantir Minha Exclusividade Agora"
6. WHEN the exclusivity CTA is clicked, THE Landing_Page_System SHALL redirect to WhatsApp with pre-filled message "Quero garantir minha exclusividade"

### Requirement 6: Social Proof Section

**User Story:** Como visitante, eu quero ver resultados reais de outros clientes, para que eu confie na eficácia do produto.

#### Acceptance Criteria

1. THE Landing_Page_System SHALL display Social_Proof section with title "Resultados que Falam por Si"
2. THE Landing_Page_System SHALL display at least 3 result cards with metrics
3. THE Landing_Page_System SHALL display result card 1 with number "R$ 847K", label "Faturado em 90 dias", company "Empresa de Energia Solar - SP"
4. THE Landing_Page_System SHALL display result card 2 with number "23", label "Contratos fechados", company "Clínica de Estética - RJ"
5. THE Landing_Page_System SHALL display result card 3 with number "67%", label "Taxa de conversão", company "Média dos clientes ativos"
6. THE Landing_Page_System SHALL apply gradient text effect to result numbers
7. WHEN a result card is hovered, THE Landing_Page_System SHALL apply translateY(-8px) transform and change border to Emerald color

### Requirement 7: Comparison Section (Antes vs Depois)

**User Story:** Como visitante, eu quero comparar minha situação atual com os benefícios do produto, para que eu veja claramente o valor da mudança.

#### Acceptance Criteria

1. THE Landing_Page_System SHALL display Comparison_Section with title "Antes vs Depois"
2. THE Landing_Page_System SHALL display 2 comparison cards side by side (responsive: stacked on mobile)
3. THE Landing_Page_System SHALL display "Antes" card with red border (rgba(239, 68, 68, 0.3)) and list of pain points
4. THE Landing_Page_System SHALL display "Depois" card with Emerald border and box-shadow glow
5. THE Landing_Page_System SHALL display at least 6 comparison items per card
6. THE Landing_Page_System SHALL display "Antes" items: "Ligar para 100 empresas aleatórias", "Ouvir 'não tenho interesse' 95 vezes", "Perder tempo com secretárias", "Não saber se a empresa tem dinheiro", "Competir com 20 concorrentes", "Taxa de conversão: 2-5%"
7. THE Landing_Page_System SHALL display "Depois" items: "Ligar para 20 empresas pré-qualificadas", "Conversar com quem PRECISA do seu serviço", "WhatsApp direto do dono/decisor", "Saber exatamente onde eles estão sangrando", "Exclusividade territorial garantida", "Taxa de conversão: 40-70%"

### Requirement 8: Guarantee Section

**User Story:** Como visitante, eu quero ter garantia de resultados, para que eu reduza o risco percebido da compra.

#### Acceptance Criteria

1. THE Landing_Page_System SHALL display Guarantee_Section with icon "🛡️"
2. THE Landing_Page_System SHALL display title "Garantia Blindada de 7 Dias" in Emerald color
3. THE Landing_Page_System SHALL display text "Se em 7 dias você não conseguir pelo menos 3 conversas qualificadas com tomadores de decisão, eu devolvo 100% do seu investimento. Sem perguntas, sem burocracia."
4. THE Landing_Page_System SHALL display subtext "Eu assumo o risco. Você só colhe os resultados."
5. THE Landing_Page_System SHALL apply 2px Emerald border to Guarantee_Section card
6. THE Landing_Page_System SHALL apply box-shadow with Emerald glow (0 0 60px rgba(16, 185, 129, 0.2))

### Requirement 9: FAQ Section

**User Story:** Como visitante, eu quero ter minhas objeções respondidas, para que eu me sinta confortável em avançar para a conversão.

#### Acceptance Criteria

1. THE Landing_Page_System SHALL display FAQ_Section with title "Perguntas Frequentes"
2. THE Landing_Page_System SHALL display at least 6 FAQ items in grid layout
3. THE Landing_Page_System SHALL display FAQ 1: question "💰 Qual o investimento?", answer "R$ 1.000/mês com exclusividade territorial. Você fecha 1 contrato e já pagou o ano inteiro."
4. THE Landing_Page_System SHALL display FAQ 2: question "🎯 Funciona para o meu nicho?", answer "Sim. Energia Solar, Clínicas, Consultorias, Agências, SaaS B2B. Qualquer negócio que venda para empresas com ticket acima de R$ 5K."
5. THE Landing_Page_System SHALL display FAQ 3: question "⏱️ Quanto tempo para ver resultados?", answer "Primeiros leads qualificados em 24-48h. Primeiras conversas em 72h. Primeiros contratos em 7-14 dias (depende do seu ciclo de venda)."
6. THE Landing_Page_System SHALL display FAQ 4: question "🔒 Como funciona a exclusividade?", answer "Apenas 1 cliente por setor/região. Se você vende energia solar em SP, nenhum outro concorrente terá acesso aos mesmos dados."
7. THE Landing_Page_System SHALL display FAQ 5: question "📱 Preciso de conhecimento técnico?", answer "Zero. Você recebe um dashboard simples com os leads prontos. É só copiar o WhatsApp e começar a conversar."
8. THE Landing_Page_System SHALL display FAQ 6: question "🚀 Quantos leads vou receber?", answer "Depende da sua região, mas a média é 50-200 leads qualificados/mês. Qualidade > Quantidade."
9. WHEN an FAQ item is hovered, THE Landing_Page_System SHALL apply translateY(-4px) transform and change border to Neon Blue

### Requirement 10: Final CTA Section

**User Story:** Como visitante que chegou ao final da página, eu quero um último empurrão para conversão, para que eu tome a decisão de contato.

#### Acceptance Criteria

1. THE Landing_Page_System SHALL display final CTA section with title "Seu concorrente está lendo isso agora" in Neon Blue color
2. THE Landing_Page_System SHALL display text "A diferença entre você e ele é que ele vai clicar no botão abaixo e garantir a exclusividade da região antes de você."
3. THE Landing_Page_System SHALL display large CTA button with text "⚡ Garantir Minha Vaga Agora"
4. THE Landing_Page_System SHALL display subtext "⏰ Apenas 3 vagas disponíveis por região"
5. WHEN the final CTA is clicked, THE Landing_Page_System SHALL redirect to WhatsApp with pre-filled message "Quero garantir minha exclusividade AGORA"
6. THE Landing_Page_System SHALL apply gradient background (0 to 5% Neon Blue opacity) to final CTA section

### Requirement 11: Exit Intent Popup

**User Story:** Como visitante que está prestes a sair da página, eu quero ser lembrado da urgência, para que eu reconsidere minha decisão.

#### Acceptance Criteria

1. WHEN the Visitor moves cursor outside the browser viewport (clientY < 0), THE Landing_Page_System SHALL display exit intent popup
2. THE Landing_Page_System SHALL display exit popup only once per session
3. THE Landing_Page_System SHALL display popup with title "⚠️ Espera!" in Neon Blue color
4. THE Landing_Page_System SHALL display popup text "Seu concorrente está a 1 clique de dominar sua região. Não deixe ele fechar antes de você."
5. THE Landing_Page_System SHALL display CTA button with text "Garantir Minha Exclusividade"
6. THE Landing_Page_System SHALL display close button (✕) in top-right corner
7. WHEN the close button is clicked, THE Landing_Page_System SHALL hide the popup
8. WHEN the popup background is clicked, THE Landing_Page_System SHALL hide the popup
9. THE Landing_Page_System SHALL apply backdrop-filter blur(10px) to popup overlay
10. THE Landing_Page_System SHALL apply 2px Neon Blue border to popup content

### Requirement 12: Scroll Progress Indicator

**User Story:** Como visitante, eu quero ver meu progresso de leitura, para que eu saiba quanto conteúdo ainda resta.

#### Acceptance Criteria

1. THE Landing_Page_System SHALL display a Scroll_Progress bar fixed at top of viewport
2. THE Landing_Page_System SHALL set Scroll_Progress bar height to 4px
3. THE Landing_Page_System SHALL apply gradient background (Neon Blue to Emerald) to Scroll_Progress bar
4. WHEN the Visitor scrolls, THE Landing_Page_System SHALL update Scroll_Progress bar width to match scroll percentage
5. THE Landing_Page_System SHALL calculate scroll percentage as (scrollTop / (scrollHeight - clientHeight)) * 100
6. THE Landing_Page_System SHALL set z-index to 1000 for Scroll_Progress bar

### Requirement 13: Scroll-Based Animations

**User Story:** Como visitante, eu quero ver elementos aparecerem suavemente ao scrollar, para que a experiência seja mais engajante.

#### Acceptance Criteria

1. WHEN a card element enters the viewport, THE Landing_Page_System SHALL apply fade-in animation
2. THE Landing_Page_System SHALL use Intersection Observer API with threshold 0.1
3. THE Landing_Page_System SHALL apply fade-in animation to feature cards, result cards, comparison cards, and FAQ items
4. THE Landing_Page_System SHALL animate from opacity 0 and translateY(20px) to opacity 1 and translateY(0)
5. THE Landing_Page_System SHALL set animation duration to 0.6 seconds with ease-out timing
6. THE Landing_Page_System SHALL unobserve element after animation is triggered

### Requirement 14: Conversion Tracking

**User Story:** Como proprietário do produto, eu quero rastrear eventos de conversão, para que eu possa otimizar a landing page.

#### Acceptance Criteria

1. WHEN a CTA button is clicked, THE Landing_Page_System SHALL send event to Google Analytics 4 with event_category "CTA" and event_label matching button text
2. WHEN a CTA button is clicked, THE Landing_Page_System SHALL send event to Facebook Pixel with event name "Lead" and content_name matching button text
3. WHEN the Visitor scrolls to 25%, 50%, 75%, or 100% of page, THE Landing_Page_System SHALL send scroll_depth event to Google Analytics 4
4. WHEN the exit intent popup is triggered, THE Landing_Page_System SHALL send exit_intent event to Google Analytics 4
5. WHEN the Visitor leaves the page, THE Landing_Page_System SHALL send time_on_page event to Google Analytics 4 with value in seconds
6. THE Landing_Page_System SHALL initialize Google Analytics 4 with configurable tracking ID
7. THE Landing_Page_System SHALL initialize Facebook Pixel with configurable pixel ID

### Requirement 15: Responsive Design

**User Story:** Como visitante mobile, eu quero uma experiência otimizada para meu dispositivo, para que eu possa navegar confortavelmente.

#### Acceptance Criteria

1. WHEN viewport width is less than 768px, THE Landing_Page_System SHALL stack grid layouts to single column
2. WHEN viewport width is less than 768px, THE Landing_Page_System SHALL reduce hero padding from 120px to 80px
3. WHEN viewport width is less than 768px, THE Landing_Page_System SHALL reduce headline font size using clamp(40px, 6vw, 72px)
4. WHEN viewport width is less than 768px, THE Landing_Page_System SHALL reduce dashboard table font size to 12px
5. WHEN viewport width is less than 768px, THE Landing_Page_System SHALL reduce card padding from 40px to 24px
6. THE Landing_Page_System SHALL use responsive container with max-width 1200px and horizontal padding 24px
7. THE Landing_Page_System SHALL maintain touch-friendly button sizes (minimum 44x44px tap target)

### Requirement 16: SEO Optimization

**User Story:** Como proprietário do produto, eu quero que a landing page seja encontrada em buscas, para que eu aumente o tráfego orgânico.

#### Acceptance Criteria

1. THE Landing_Page_System SHALL set page title to "LeadExtract 6.0 - Inteligência de Estado para Vendas B2B"
2. THE Landing_Page_System SHALL set meta description to "Pare de bater na porta de quem não quer comprar. Domine o mercado com Inteligência de Estado."
3. THE Landing_Page_System SHALL set meta keywords including "leads b2b, prospecção b2b, vendas b2b, energia solar, clínicas, inteligência comercial, whatsapp decisor"
4. THE Landing_Page_System SHALL set Open Graph tags for social sharing (og:title, og:description, og:image, og:url)
5. THE Landing_Page_System SHALL set Twitter Card tags (twitter:card, twitter:title, twitter:description, twitter:image)
6. THE Landing_Page_System SHALL use semantic HTML5 elements (header, section, footer)
7. THE Landing_Page_System SHALL set canonical URL
8. THE Landing_Page_System SHALL set viewport meta tag for mobile optimization

### Requirement 17: Performance Optimization

**User Story:** Como visitante, eu quero que a página carregue rapidamente, para que eu não abandone por lentidão.

#### Acceptance Criteria

1. THE Landing_Page_System SHALL preconnect to Google Fonts domain
2. THE Landing_Page_System SHALL use font-display: swap for web fonts
3. THE Landing_Page_System SHALL lazy load images below the fold
4. THE Landing_Page_System SHALL minimize use of external dependencies
5. THE Landing_Page_System SHALL use CSS transforms for animations (not layout properties)
6. THE Landing_Page_System SHALL debounce scroll event handlers
7. THE Landing_Page_System SHALL achieve Lighthouse performance score above 90

### Requirement 18: Accessibility Compliance

**User Story:** Como visitante com necessidades de acessibilidade, eu quero navegar a landing page com tecnologias assistivas, para que eu tenha acesso igual ao conteúdo.

#### Acceptance Criteria

1. THE Landing_Page_System SHALL provide alt text for all images
2. THE Landing_Page_System SHALL maintain color contrast ratio of at least 4.5:1 for normal text
3. THE Landing_Page_System SHALL maintain color contrast ratio of at least 3:1 for large text
4. THE Landing_Page_System SHALL support keyboard navigation for all interactive elements
5. THE Landing_Page_System SHALL provide focus indicators for interactive elements
6. THE Landing_Page_System SHALL use semantic HTML for proper screen reader support
7. THE Landing_Page_System SHALL set lang attribute on html element
8. THE Landing_Page_System SHALL provide ARIA labels for icon-only buttons

### Requirement 19: Configuration Management

**User Story:** Como desenvolvedor, eu quero configurar facilmente números de WhatsApp e IDs de tracking, para que eu possa adaptar a landing page sem modificar código.

#### Acceptance Criteria

1. THE Landing_Page_System SHALL accept WhatsApp number as configuration parameter
2. THE Landing_Page_System SHALL accept Google Analytics tracking ID as configuration parameter
3. THE Landing_Page_System SHALL accept Facebook Pixel ID as configuration parameter
4. THE Landing_Page_System SHALL accept accent color (Neon Blue or Emerald) as configuration parameter
5. THE Landing_Page_System SHALL format WhatsApp links as "https://wa.me/{number}?text={encoded_message}"
6. THE Landing_Page_System SHALL validate WhatsApp number format (digits only with country code)

### Requirement 20: Component Architecture

**User Story:** Como desenvolvedor, eu quero uma arquitetura de componentes modular, para que eu possa manter e evoluir a landing page facilmente.

#### Acceptance Criteria

1. THE Landing_Page_System SHALL separate each section into individual React components
2. THE Landing_Page_System SHALL create reusable components for: CTAButton, FeatureCard, ResultCard, ComparisonCard, FAQItem
3. THE Landing_Page_System SHALL use TypeScript for type safety
4. THE Landing_Page_System SHALL use Tailwind CSS for styling
5. THE Landing_Page_System SHALL use Framer Motion for animations
6. THE Landing_Page_System SHALL follow React best practices (hooks, functional components)
7. THE Landing_Page_System SHALL organize components in /components/landing directory
8. THE Landing_Page_System SHALL export main landing page from /pages/Index.tsx
