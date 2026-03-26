# Requirements Document

## Introduction

O Google Maps Lead Extractor é um software comercial B2B para extração automatizada de dados de empresas do Google Maps. O sistema permite que usuários busquem leads por nicho e localização, visualizem os dados em tempo real através de uma interface gráfica moderna, e exportem os resultados em formatos profissionais. O software inclui sistema de licenciamento para controle de uso comercial e revenda.

## Glossary

- **Lead_Extractor**: O sistema completo de extração de leads do Google Maps
- **Automation_Engine**: Componente responsável pela automação do navegador usando Playwright
- **GUI_Manager**: Componente responsável pela interface gráfica usando CustomTkinter
- **License_Validator**: Componente responsável pela validação de licenças de uso
- **Data_Exporter**: Componente responsável pela exportação de dados em formatos Excel/CSV
- **Lead**: Registro de dados de uma empresa extraída do Google Maps
- **Search_Query**: Combinação de nicho/palavra-chave e localização para busca
- **Lead_Limit**: Número máximo de leads a serem extraídos em uma busca

## Requirements

### Requirement 1: Automação de Busca no Google Maps

**User Story:** Como usuário comercial, eu quero buscar empresas no Google Maps por nicho e localização, para que eu possa gerar listas de leads qualificados.

#### Acceptance Criteria

1. WHEN uma Search_Query é fornecida, THE Automation_Engine SHALL acessar o Google Maps com User-Agent de dispositivo real
2. THE Automation_Engine SHALL utilizar Playwright em modo Chromium com asyncio
3. WHEN a página de resultados é carregada, THE Automation_Engine SHALL executar scroll infinito na barra lateral até não haver mais registros ou atingir o Lead_Limit
4. WHILE o scroll está em execução, THE Automation_Engine SHALL aplicar delays aleatórios entre 1 e 3 segundos para simular comportamento humano
5. THE Automation_Engine SHALL manter o navegador em modo headless configurável

### Requirement 2: Extração de Dados de Empresas

**User Story:** Como usuário comercial, eu quero extrair dados completos de cada empresa, para que eu possa ter informações de contato e qualificação dos leads.

#### Acceptance Criteria

1. FOR cada empresa encontrada, THE Automation_Engine SHALL extrair Nome da Empresa
2. FOR cada empresa encontrada, THE Automation_Engine SHALL extrair Telefone com tratamento de formatação de string
3. FOR cada empresa encontrada, THE Automation_Engine SHALL extrair Site com URL limpa e validada
4. FOR cada empresa encontrada, THE Automation_Engine SHALL extrair Nota/Rating numérico
5. FOR cada empresa encontrada, THE Automation_Engine SHALL extrair Quantidade de Comentários
6. FOR cada empresa encontrada, THE Automation_Engine SHALL extrair Endereço Completo
7. IF um campo de dados não estiver disponível, THEN THE Automation_Engine SHALL marcar o campo como 'N/A'
8. WHEN ocorrer um erro durante a extração de um lead, THE Automation_Engine SHALL registrar o erro e continuar com o próximo lead

### Requirement 3: Interface Gráfica Moderna

**User Story:** Como usuário comercial, eu quero uma interface gráfica intuitiva e moderna, para que eu possa operar o sistema facilmente sem conhecimento técnico.

#### Acceptance Criteria

1. THE GUI_Manager SHALL utilizar CustomTkinter com tema Dark Mode nativo
2. THE GUI_Manager SHALL fornecer campo de input para Nicho/Palavra-Chave
3. THE GUI_Manager SHALL fornecer campo de input para Localização/Cidade
4. THE GUI_Manager SHALL fornecer slider para seleção de Lead_Limit com opções 50, 100 e 500
5. THE GUI_Manager SHALL exibir barra de progresso em tempo real durante a extração
6. THE GUI_Manager SHALL exibir tabela (Treeview) mostrando os dados dos leads conforme são extraídos
7. THE GUI_Manager SHALL fornecer botão "Iniciar Extração" para começar o processo
8. THE GUI_Manager SHALL fornecer botão "Parar" para interromper a extração em andamento
9. THE GUI_Manager SHALL fornecer botão "Exportar" para salvar os dados em Excel ou CSV
10. THE GUI_Manager SHALL manter responsividade durante todo o processo de extração

### Requirement 4: Gerenciamento de Threads

**User Story:** Como usuário, eu quero que a interface permaneça responsiva durante a extração, para que eu possa monitorar e controlar o processo sem travamentos.

#### Acceptance Criteria

1. WHEN a extração é iniciada, THE GUI_Manager SHALL executar o Automation_Engine em thread separada
2. WHILE a extração está em execução, THE GUI_Manager SHALL atualizar a interface com dados em tempo real
3. WHEN o usuário clica em "Parar", THE GUI_Manager SHALL sinalizar a thread de extração para encerrar graciosamente
4. THE GUI_Manager SHALL prevenir múltiplas execuções simultâneas de extração

### Requirement 5: Sistema de Licenciamento

**User Story:** Como desenvolvedor/revendedor, eu quero controlar o acesso ao software através de licenças, para que eu possa comercializar o produto de forma segura.

#### Acceptance Criteria

1. WHEN o software é iniciado, THE License_Validator SHALL verificar a validade da licença
2. IF a licença é inválida ou expirada, THEN THE License_Validator SHALL bloquear o acesso às funcionalidades de extração
3. THE License_Validator SHALL suportar validação por Chave de API
4. THE License_Validator SHALL suportar validação por Data de Expiração
5. WHERE a licença é válida, THE License_Validator SHALL permitir uso completo do sistema
6. THE License_Validator SHALL exibir mensagem clara sobre o status da licença

### Requirement 6: Exportação Profissional de Dados

**User Story:** Como usuário comercial, eu quero exportar os leads em formato profissional, para que eu possa utilizar os dados em outras ferramentas e apresentá-los a clientes.

#### Acceptance Criteria

1. WHEN o usuário solicita exportação, THE Data_Exporter SHALL oferecer opções de formato Excel (.xlsx) e CSV
2. THE Data_Exporter SHALL utilizar pandas ou openpyxl para geração de arquivos
3. FOR arquivos Excel, THE Data_Exporter SHALL formatar cabeçalhos em negrito
4. FOR arquivos Excel, THE Data_Exporter SHALL ajustar largura das colunas automaticamente
5. THE Data_Exporter SHALL incluir todos os campos extraídos: Nome, Telefone, Site, Nota, Comentários, Endereço
6. THE Data_Exporter SHALL permitir que o usuário escolha o local e nome do arquivo
7. WHEN a exportação é concluída, THE Data_Exporter SHALL exibir mensagem de confirmação com o caminho do arquivo

### Requirement 7: Tratamento Robusto de Erros

**User Story:** Como usuário, eu quero que o sistema continue funcionando mesmo quando encontrar erros, para que eu não perca dados já coletados.

#### Acceptance Criteria

1. THE Lead_Extractor SHALL implementar blocos try-except em todas as operações críticas
2. WHEN ocorrer erro de conexão, THE Automation_Engine SHALL tentar reconectar até 3 vezes com intervalo de 5 segundos
3. IF o Google Maps alterar a estrutura da página, THEN THE Automation_Engine SHALL registrar erro detalhado e continuar
4. WHEN ocorrer erro durante exportação, THE Data_Exporter SHALL exibir mensagem de erro específica ao usuário
5. THE Lead_Extractor SHALL manter log de erros em arquivo para diagnóstico
6. IF ocorrer erro fatal, THEN THE Lead_Extractor SHALL salvar dados coletados antes de encerrar

### Requirement 8: Proteção Anti-Bot

**User Story:** Como usuário, eu quero que o sistema evite detecção como bot, para que eu possa extrair dados de forma confiável sem bloqueios.

#### Acceptance Criteria

1. WHEN o Automation_Engine abre uma empresa, THE Automation_Engine SHALL aplicar delay aleatório entre 2 e 5 segundos
2. THE Automation_Engine SHALL variar a velocidade de scroll para simular comportamento humano
3. THE Automation_Engine SHALL utilizar User-Agent de navegador real e atualizado
4. THE Automation_Engine SHALL configurar viewport com dimensões realistas de desktop
5. WHERE possível, THE Automation_Engine SHALL simular movimentos de mouse durante a navegação

### Requirement 9: Distribuição como Executável

**User Story:** Como desenvolvedor/revendedor, eu quero distribuir o software como executável standalone, para que clientes possam usar sem instalar Python.

#### Acceptance Criteria

1. THE Lead_Extractor SHALL ser compatível com PyInstaller para geração de executável
2. THE Lead_Extractor SHALL incluir todas as dependências do Playwright no executável
3. THE Lead_Extractor SHALL incluir todas as dependências do CustomTkinter no executável
4. THE Lead_Extractor SHALL funcionar em Windows 10 e 11 sem instalações adicionais
5. THE Lead_Extractor SHALL ter tamanho de executável otimizado (menor que 200MB quando possível)

### Requirement 10: Código Profissional e Documentado

**User Story:** Como desenvolvedor/revendedor, eu quero código limpo e bem documentado, para que eu possa manter e customizar o sistema facilmente.

#### Acceptance Criteria

1. THE Lead_Extractor SHALL ter todos os comentários em português brasileiro
2. THE Lead_Extractor SHALL seguir convenções PEP 8 de formatação de código Python
3. THE Lead_Extractor SHALL ter docstrings em todas as funções e classes principais
4. THE Lead_Extractor SHALL ter nomes de variáveis e funções descritivos e em português
5. THE Lead_Extractor SHALL incluir arquivo README.md com instruções de instalação e uso
6. THE Lead_Extractor SHALL incluir arquivo requirements.txt com todas as dependências

### Requirement 11: Performance e Escalabilidade

**User Story:** Como usuário comercial, eu quero extrair grandes volumes de leads rapidamente, para que eu possa maximizar minha produtividade.

#### Acceptance Criteria

1. THE Automation_Engine SHALL extrair no mínimo 50 leads em menos de 5 minutos
2. THE GUI_Manager SHALL atualizar a tabela de leads a cada 5 registros extraídos para otimizar performance
3. THE Lead_Extractor SHALL utilizar no máximo 500MB de memória RAM durante operação normal
4. WHEN o Lead_Limit é atingido, THE Automation_Engine SHALL encerrar a extração imediatamente
5. THE Lead_Extractor SHALL liberar recursos do navegador após conclusão da extração
