@echo off
chcp 65001 >nul
cls
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║           LEAD EXTRACTOR - INSTALAÇÃO DO NAVEGADOR        ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo.
echo Este programa precisa do navegador Chromium para funcionar.
echo.
echo O navegador será instalado no seu computador (apenas uma vez).
echo.
echo ┌────────────────────────────────────────────────────────────┐
echo │ Tamanho do download: ~150 MB                              │
echo │ Tempo estimado: 2-5 minutos (depende da sua internet)     │
echo │ Esta instalação será feita APENAS UMA VEZ                 │
echo └────────────────────────────────────────────────────────────┘
echo.
echo.
pause
echo.
echo.
echo ════════════════════════════════════════════════════════════
echo  INICIANDO INSTALAÇÃO...
echo ════════════════════════════════════════════════════════════
echo.
python -m playwright install chromium
echo.
if errorlevel 1 (
    echo.
    echo ════════════════════════════════════════════════════════════
    echo  ❌ ERRO NA INSTALAÇÃO
    echo ════════════════════════════════════════════════════════════
    echo.
    echo Não foi possível instalar o navegador.
    echo.
    echo POSSÍVEIS CAUSAS:
    echo  - Python não está instalado no seu computador
    echo  - Sem conexão com a internet
    echo  - Firewall bloqueando o download
    echo.
    echo SOLUÇÃO:
    echo  1. Verifique se Python está instalado
    echo  2. Verifique sua conexão com a internet
    echo  3. Tente novamente
    echo.
    echo Se o problema persistir, entre em contato com o suporte.
    echo.
    pause
    exit /b 1
)
echo.
echo ════════════════════════════════════════════════════════════
echo  ✅ INSTALAÇÃO CONCLUÍDA COM SUCESSO!
echo ════════════════════════════════════════════════════════════
echo.
echo O navegador Chromium foi instalado com sucesso!
echo.
echo Agora você pode usar o Lead Extractor normalmente.
echo.
echo Para iniciar o programa, execute: LeadExtractor.exe
echo.
echo.
pause
