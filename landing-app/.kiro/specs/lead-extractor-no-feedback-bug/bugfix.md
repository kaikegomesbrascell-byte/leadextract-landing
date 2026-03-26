# Bugfix Requirements Document

## Introduction

Este documento descreve o bug no Lead Extractor onde clicar no botão "Iniciar Extração" não mostra mensagens de status e a extração parece não iniciar. O problema é causado por um messagebox.showinfo() que bloqueia a thread da UI antes que as atualizações de status possam ser exibidas. Este bug impede que o usuário receba feedback visual de que a extração está em andamento, criando uma experiência ruim onde parece que nada está acontecendo.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN o usuário clica no botão "Iniciar Extração" THEN o sistema exibe um messagebox.showinfo() bloqueante antes que as mensagens de status possam ser renderizadas na UI

1.2 WHEN o messagebox.showinfo() é exibido na thread principal da UI THEN o sistema bloqueia todas as atualizações de status que foram agendadas com root.after()

1.3 WHEN o usuário fecha o messagebox THEN o sistema já iniciou a thread de extração em background, mas o usuário não viu nenhuma mensagem de status inicial

1.4 WHEN a extração está em andamento THEN o sistema não mostra as mensagens de status "🚀 Iniciando extração...", "🌐 Inicializando navegador...", "🚀 Abrindo navegador Chromium...", "🗺️ Navegando para o Google Maps..." porque o messagebox bloqueou a UI

### Expected Behavior (Correct)

2.1 WHEN o usuário clica no botão "Iniciar Extração" THEN o sistema SHALL exibir imediatamente a mensagem de status "🚀 Iniciando extração... Abrindo navegador..." sem bloqueios

2.2 WHEN a extração é iniciada THEN o sistema SHALL exibir as mensagens de status progressivas ("🌐 Inicializando navegador...", "🚀 Abrindo navegador Chromium...", "🗺️ Navegando para o Google Maps...") de forma visível e não bloqueada

2.3 WHEN o messagebox de confirmação precisa ser exibido THEN o sistema SHALL agendá-lo com root.after() para execução após as mensagens de status iniciais serem renderizadas

2.4 WHEN a thread de extração é iniciada THEN o sistema SHALL garantir que todas as atualizações de UI sejam visíveis antes de exibir qualquer dialog bloqueante

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a extração é concluída com sucesso THEN o sistema SHALL CONTINUE TO exibir o messagebox de conclusão com o total de leads extraídos

3.2 WHEN ocorre um erro de validação nos inputs THEN o sistema SHALL CONTINUE TO exibir o messagebox de erro antes de iniciar a extração

3.3 WHEN o usuário clica em "Parar" durante a extração THEN o sistema SHALL CONTINUE TO interromper a extração corretamente

3.4 WHEN a barra de progresso é atualizada THEN o sistema SHALL CONTINUE TO refletir o progresso da extração em tempo real

3.5 WHEN os leads são extraídos THEN o sistema SHALL CONTINUE TO adicioná-los à tabela de dados em lotes de 5

3.6 WHEN a extração termina THEN o sistema SHALL CONTINUE TO gerar o arquivo de texto automaticamente na pasta Downloads
