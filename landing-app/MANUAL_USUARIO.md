# Manual do Usuário - Google Maps Lead Extractor

## 📖 Bem-vindo ao Lead Extractor

O Google Maps Lead Extractor é uma ferramenta profissional para extração automatizada de dados de empresas do Google Maps. Este manual irá guiá-lo através de todas as funcionalidades do software.

---

## 📋 Índice

1. [Requisitos do Sistema](#requisitos-do-sistema)
2. [Instalação e Ativação](#instalação-e-ativação)
3. [Primeira Execução](#primeira-execução)
4. [Como Usar o Software](#como-usar-o-software)
5. [Exportação de Dados](#exportação-de-dados)
6. [Solução de Problemas](#solução-de-problemas)
7. [Perguntas Frequentes](#perguntas-frequentes)
8. [Suporte Técnico](#suporte-técnico)

---

## 🖥️ Requisitos do Sistema

### Requisitos Mínimos

- **Sistema Operacional**: Windows 10 (64-bit) ou superior
- **Processador**: Intel Core i3 ou equivalente
- **Memória RAM**: 4GB
- **Espaço em Disco**: 500MB livres
- **Resolução de Tela**: 1280x720 pixels
- **Conexão com Internet**: Banda larga estável

### Requisitos Recomendados

- **Sistema Operacional**: Windows 11 (64-bit)
- **Processador**: Intel Core i5 ou superior
- **Memória RAM**: 8GB ou mais
- **Espaço em Disco**: 1GB livre
- **Resolução de Tela**: 1920x1080 pixels (Full HD)
- **Conexão com Internet**: Banda larga de alta velocidade

---

## 📥 Instalação e Ativação

### Passo 1: Receber os Arquivos

Você receberá dois arquivos essenciais:

1. **LeadExtractor.exe** - O programa principal
2. **license.key** - Seu arquivo de licença

### Passo 2: Organizar os Arquivos

1. Crie uma pasta no seu computador (ex: `C:\LeadExtractor\`)
2. Coloque ambos os arquivos na mesma pasta:
   ```
   C:\LeadExtractor\
   ├── LeadExtractor.exe
   └── license.key
   ```

### Passo 3: Verificar a Licença

⚠️ **IMPORTANTE**: O arquivo `license.key` deve estar na mesma pasta que o executável.

Seu arquivo de licença contém:
- **Chave de API**: Identificação única da sua licença
- **Data de Expiração**: Até quando a licença é válida
- **Nome do Cliente**: Seu nome ou empresa
- **Tipo de Licença**: Commercial, Trial, etc.

### Passo 4: Primeira Execução

1. Dê um duplo clique em `LeadExtractor.exe`
2. Aguarde alguns segundos (primeira execução pode ser mais lenta)
3. A interface gráfica será exibida
4. O sistema validará automaticamente sua licença

**Se a licença for válida:**
- ✅ Você verá a mensagem "Licença válida"
- ✅ Todas as funcionalidades estarão disponíveis

**Se a licença for inválida:**
- ❌ Você verá uma mensagem de erro
- ❌ As funcionalidades de extração estarão bloqueadas
- 📞 Entre em contato com o suporte

---

## 🎯 Primeira Execução

### Interface do Software

Ao abrir o Lead Extractor, você verá:

```
┌─────────────────────────────────────────────────────┐
│  Google Maps Lead Extractor                         │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Nicho/Palavra-chave: [________________]            │
│  Localização/Cidade:  [________________]            │
│  Limite de Leads:     [====●====] 100               │
│                                                      │
│  [Iniciar Extração] [Parar] [Exportar]             │
│                                                      │
│  Progresso: [████████░░░░░░░░░░] 40%               │
│  Status: 40 leads extraídos de 100                  │
│                                                      │
│  ┌─────────────────────────────────────────────┐   │
│  │ Nome    │ Telefone │ Site │ Nota │ ...      │   │
│  ├─────────────────────────────────────────────┤   │
│  │ Empresa │ (11)...  │ www. │ 4.5  │ ...      │   │
│  │ ...     │ ...      │ ...  │ ...  │ ...      │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### Elementos da Interface

1. **Campos de Entrada**:
   - Nicho/Palavra-chave
   - Localização/Cidade
   - Slider de limite (50, 100 ou 500 leads)

2. **Botões de Controle**:
   - **Iniciar Extração**: Começa o processo
   - **Parar**: Interrompe a extração em andamento
   - **Exportar**: Salva os dados em Excel ou CSV

3. **Área de Progresso**:
   - Barra de progresso visual
   - Status textual com contagem de leads

4. **Tabela de Dados**:
   - Exibe os leads conforme são extraídos
   - Colunas: Nome, Telefone, Site, Nota, Comentários, Endereço

---

## 🚀 Como Usar o Software

### Passo a Passo Completo

#### 1. Preencher os Campos de Busca

**Nicho/Palavra-chave:**
- Digite o tipo de negócio que você procura
- Exemplos:
  - "restaurantes"
  - "dentistas"
  - "academias"
  - "pet shops"
  - "salões de beleza"
  - "advogados"

**Localização/Cidade:**
- Digite a cidade ou região
- Exemplos:
  - "São Paulo"
  - "Rio de Janeiro"
  - "Belo Horizonte"
  - "Curitiba"
  - "Porto Alegre"

**Limite de Leads:**
- Use o slider para escolher: **50**, **100** ou **500** leads
- Recomendação:
  - 50 leads: Teste rápido (~2-3 minutos)
  - 100 leads: Uso padrão (~5-7 minutos)
  - 500 leads: Extração completa (~20-30 minutos)

#### 2. Iniciar a Extração

1. Clique no botão **"Iniciar Extração"**
2. O sistema validará sua licença automaticamente
3. Se válida, a extração começará imediatamente

**O que acontece durante a extração:**
- ✅ O navegador abre em segundo plano (invisível)
- ✅ O Google Maps é acessado automaticamente
- ✅ A busca é realizada com seus parâmetros
- ✅ Os dados são extraídos empresa por empresa
- ✅ A tabela é atualizada em tempo real
- ✅ A barra de progresso mostra o andamento

#### 3. Acompanhar o Progresso

**Indicadores visuais:**
- **Barra de Progresso**: Mostra percentual concluído
- **Status Textual**: "X leads extraídos de Y"
- **Tabela**: Novos leads aparecem conforme são extraídos

**Tempo estimado:**
- 50 leads: 2-5 minutos
- 100 leads: 5-10 minutos
- 500 leads: 20-40 minutos

⏱️ **Nota**: O tempo varia conforme a velocidade da internet e disponibilidade de dados no Google Maps.

#### 4. Parar a Extração (Opcional)

Se precisar interromper:
1. Clique no botão **"Parar"**
2. A extração será encerrada graciosamente
3. Os dados já coletados serão mantidos
4. Você poderá exportar os leads parciais

#### 5. Visualizar os Dados

**Dados extraídos para cada empresa:**
- 📌 **Nome**: Nome completo da empresa
- 📞 **Telefone**: Número de contato (se disponível)
- 🌐 **Site**: Website da empresa (se disponível)
- ⭐ **Nota**: Rating/avaliação (0.0 a 5.0)
- 💬 **Comentários**: Quantidade de avaliações
- 📍 **Endereço**: Endereço completo

**Campos com "N/A":**
- Significa que o dado não está disponível no Google Maps
- Isso é normal para algumas empresas

---

## 💾 Exportação de Dados

### Formatos Disponíveis

O Lead Extractor oferece dois formatos profissionais:

#### 1. Excel (.xlsx) - Recomendado

**Vantagens:**
- ✅ Formatação profissional
- ✅ Cabeçalhos em negrito
- ✅ Colunas ajustadas automaticamente
- ✅ Filtros automáticos habilitados
- ✅ Primeira linha congelada
- ✅ Ideal para apresentações e análises

**Quando usar:**
- Apresentar para clientes
- Análise de dados no Excel
- Compartilhar com equipe

#### 2. CSV (.csv)

**Vantagens:**
- ✅ Formato universal
- ✅ Compatível com qualquer software
- ✅ Importação fácil em CRMs
- ✅ Tamanho de arquivo menor

**Quando usar:**
- Importar em CRM ou sistema
- Processar com scripts
- Compatibilidade máxima

### Como Exportar

1. **Aguarde a extração terminar** (ou pare quando quiser)
2. Clique no botão **"Exportar"**
3. Escolha o formato:
   - **Excel (.xlsx)** - Recomendado
   - **CSV (.csv)** - Universal
4. Escolha o local e nome do arquivo
5. Clique em **"Salvar"**
6. Aguarde a confirmação: "Dados exportados com sucesso!"

### Exemplo de Arquivo Exportado

**Excel:**
```
┌──────────────┬────────────┬──────────────┬──────┬────────────┬─────────────┐
│ Nome         │ Telefone   │ Site         │ Nota │ Comentários│ Endereço    │
├──────────────┼────────────┼──────────────┼──────┼────────────┼─────────────┤
│ Restaurante A│ (11) 1234  │ www.rest.com │ 4.5  │ 120        │ Rua X, 123  │
│ Restaurante B│ (11) 5678  │ N/A          │ 4.2  │ 85         │ Av. Y, 456  │
└──────────────┴────────────┴──────────────┴──────┴────────────┴─────────────┘
```

---

## 🔧 Solução de Problemas

### Problema: "Licença inválida ou expirada"

**Causas possíveis:**
- ❌ Arquivo `license.key` não está na mesma pasta do executável
- ❌ Licença expirou
- ❌ Arquivo de licença corrompido

**Soluções:**
1. Verifique se `license.key` está na mesma pasta que `LeadExtractor.exe`
2. Abra `license.key` e verifique a data de expiração
3. Entre em contato com o suporte para renovar a licença

---

### Problema: Software não abre ou fecha imediatamente

**Causas possíveis:**
- ❌ Antivírus bloqueando o executável
- ❌ Falta de permissões
- ❌ Arquivo corrompido

**Soluções:**
1. **Adicione exceção no antivírus:**
   - Abra seu antivírus
   - Adicione `LeadExtractor.exe` às exceções
   - Tente executar novamente

2. **Execute como Administrador:**
   - Clique com botão direito em `LeadExtractor.exe`
   - Selecione "Executar como administrador"

3. **Baixe novamente:**
   - O arquivo pode estar corrompido
   - Solicite novo download ao fornecedor

---

### Problema: Interface não responde durante extração

**Isso é normal!**
- ✅ A interface pode parecer "travada" durante extração
- ✅ Isso acontece porque o processo é intensivo
- ✅ Aguarde o término ou use o botão "Parar"

**Se realmente travou:**
1. Aguarde 2-3 minutos
2. Se não responder, feche pelo Gerenciador de Tarefas
3. Execute novamente
4. Verifique o arquivo `lead_extractor.log` para erros

---

### Problema: Poucos dados extraídos

**Causas possíveis:**
- ❌ Nicho muito específico
- ❌ Localização com poucas empresas
- ❌ Google Maps limitou requisições

**Soluções:**
1. **Tente nicho mais amplo:**
   - ❌ "restaurantes veganos orgânicos"
   - ✅ "restaurantes"

2. **Tente localização maior:**
   - ❌ "Bairro específico"
   - ✅ "São Paulo"

3. **Aguarde e tente novamente:**
   - O Google Maps pode ter limitado temporariamente
   - Aguarde 30-60 minutos

---

### Problema: Dados com muitos "N/A"

**Isso é normal!**
- ✅ Nem todas as empresas têm todos os dados no Google Maps
- ✅ Telefone e site são os mais comuns de estar ausentes
- ✅ Nome, nota e endereço geralmente estão disponíveis

**Não é um erro do software!**

---

### Problema: Erro ao exportar Excel

**Causas possíveis:**
- ❌ Arquivo Excel já está aberto
- ❌ Sem permissão para salvar no local escolhido
- ❌ Espaço em disco insuficiente

**Soluções:**
1. Feche o arquivo Excel se estiver aberto
2. Escolha outro local para salvar (ex: Desktop)
3. Verifique espaço em disco disponível

---

### Problema: Extração muito lenta

**Causas possíveis:**
- ❌ Internet lenta
- ❌ Computador com poucos recursos
- ❌ Muitos programas abertos

**Soluções:**
1. Verifique sua conexão com internet
2. Feche outros programas
3. Use limite menor (50 ao invés de 500)
4. Aguarde - o processo é naturalmente lento para evitar bloqueios

---

## ❓ Perguntas Frequentes

### 1. Quantos leads posso extrair por dia?

**Resposta:** Não há limite técnico, mas recomendamos:
- Máximo 3-5 extrações de 500 leads por dia
- Aguarde 30-60 minutos entre extrações grandes
- Isso evita bloqueios temporários do Google Maps

### 2. O software funciona sem internet?

**Resposta:** Não. É necessária conexão com internet para:
- Acessar o Google Maps
- Extrair dados das empresas
- Validar a licença (primeira execução)

### 3. Posso usar em múltiplos computadores?

**Resposta:** Depende da sua licença:
- Licenças padrão: 1 computador
- Licenças empresariais: Múltiplos computadores
- Consulte seu fornecedor para detalhes

### 4. Os dados são salvos automaticamente?

**Resposta:** Não. Você deve:
- Aguardar a extração terminar
- Clicar em "Exportar"
- Salvar manualmente

**Dica:** Se ocorrer erro fatal, o sistema tenta salvar automaticamente em arquivo de emergência.

### 5. Posso extrair de outros países?

**Resposta:** Sim! Basta digitar a localização:
- "New York, USA"
- "London, UK"
- "Tokyo, Japan"

### 6. O Google pode bloquear meu IP?

**Resposta:** Improvável, mas possível se:
- Extrair volumes muito grandes
- Fazer extrações muito frequentes

**Proteções do software:**
- ✅ Delays aleatórios entre ações
- ✅ Comportamento humanizado
- ✅ User-Agent de navegador real

### 7. Posso editar os dados na tabela?

**Resposta:** Não diretamente no software. Mas você pode:
1. Exportar para Excel
2. Editar no Excel
3. Salvar as alterações

### 8. Como renovar minha licença?

**Resposta:**
1. Entre em contato com seu fornecedor
2. Receba novo arquivo `license.key`
3. Substitua o arquivo antigo
4. Execute o software normalmente

### 9. O software coleta meus dados?

**Resposta:** Não. O software:
- ✅ Funciona 100% localmente
- ✅ Não envia dados para servidores externos
- ✅ Não coleta informações pessoais
- ✅ Apenas valida a licença (primeira execução)

### 10. Posso revender os leads extraídos?

**Resposta:** Sim, os dados extraídos são seus. Mas:
- ⚠️ Respeite as leis de proteção de dados (LGPD/GDPR)
- ⚠️ Use os dados de forma ética e legal
- ⚠️ Respeite os Termos de Serviço do Google Maps

---

## 📞 Suporte Técnico

### Antes de Entrar em Contato

1. **Consulte este manual** - A maioria dos problemas está documentada
2. **Verifique o arquivo de log** - `lead_extractor.log` contém detalhes de erros
3. **Tente reiniciar** - Feche e abra o software novamente

### Informações para Fornecer ao Suporte

Ao entrar em contato, tenha em mãos:
- ✅ Versão do Windows (10 ou 11)
- ✅ Descrição detalhada do problema
- ✅ Mensagem de erro (se houver)
- ✅ Conteúdo do arquivo `lead_extractor.log`
- ✅ Número da sua licença

### Canais de Suporte

Entre em contato com seu fornecedor através dos canais fornecidos no momento da compra.

---

## 📝 Dicas e Boas Práticas

### Para Melhores Resultados

1. **Use termos amplos:**
   - ✅ "restaurantes" ao invés de "restaurantes italianos veganos"
   - ✅ "dentistas" ao invés de "dentistas especializados em implantes"

2. **Comece com limites menores:**
   - Teste com 50 leads primeiro
   - Depois aumente para 100 ou 500

3. **Aguarde entre extrações:**
   - Espere 30-60 minutos entre extrações grandes
   - Isso evita bloqueios temporários

4. **Exporte regularmente:**
   - Não confie apenas nos dados na tela
   - Exporte e faça backup dos arquivos

5. **Organize seus arquivos:**
   - Crie pastas por nicho: "Leads_Restaurantes", "Leads_Dentistas"
   - Use nomes descritivos: "Restaurantes_SP_2024-01-15.xlsx"

### Para Melhor Performance

1. **Feche outros programas** durante extração
2. **Use conexão estável** (evite Wi-Fi instável)
3. **Não minimize** a janela durante extração
4. **Aguarde pacientemente** - o processo é naturalmente lento

---

## 📄 Informações Legais

### Uso Responsável

Este software é uma ferramenta profissional. Use de forma:
- ✅ Ética e legal
- ✅ Respeitando a LGPD e leis de proteção de dados
- ✅ Respeitando os Termos de Serviço do Google Maps
- ✅ Para fins comerciais legítimos

### Limitações

- O software extrai dados **públicos** do Google Maps
- Não garante 100% de precisão dos dados
- Não é responsável por mudanças no Google Maps
- Não garante disponibilidade contínua do serviço

---

## 🎓 Conclusão

Parabéns! Você agora sabe usar o Google Maps Lead Extractor.

**Lembre-se:**
- 📖 Consulte este manual sempre que tiver dúvidas
- 💾 Faça backup dos seus leads exportados
- 📞 Entre em contato com suporte se precisar de ajuda
- ⚖️ Use o software de forma ética e legal

**Boas extrações e sucesso nos seus negócios! 🚀**

---

**Versão do Manual:** 1.0.0  
**Última Atualização:** 2024  
**Software:** Google Maps Lead Extractor v1.0.0