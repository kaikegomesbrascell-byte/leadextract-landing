@echo off
REM LeadExtract 6.0 - Setup Script (Windows)
REM Este script ajuda a configurar rapidamente a landing page

echo.
echo ========================================
echo   LeadExtract 6.0 - Setup Wizard
echo ========================================
echo.

REM Verificar se o arquivo index.html existe
if not exist "index.html" (
    echo [ERRO] index.html nao encontrado!
    echo Execute este script dentro da pasta landing-page-v6
    pause
    exit /b 1
)

echo [OK] Arquivo index.html encontrado
echo.

REM Perguntar o número do WhatsApp
echo ========================================
echo   Configuracao do WhatsApp
echo ========================================
echo Digite seu numero com DDI e DDD (ex: 5511999998888):
set /p whatsapp_number=

if "%whatsapp_number%"=="" (
    echo [AVISO] Numero nao fornecido. Mantendo padrao: 5516994260416
) else (
    echo Atualizando numero do WhatsApp...
    powershell -Command "(gc index.html) -replace '5516994260416', '%whatsapp_number%' | Out-File -encoding UTF8 index.html"
    echo [OK] Numero atualizado para: %whatsapp_number%
)

echo.

REM Perguntar o Google Analytics ID
echo ========================================
echo   Configuracao do Google Analytics
echo ========================================
echo Digite seu Google Analytics ID (ex: G-XXXXXXXXXX):
echo (Deixe em branco para pular)
set /p ga_id=

if "%ga_id%"=="" (
    echo [AVISO] Google Analytics nao configurado
) else (
    echo Atualizando Google Analytics ID...
    powershell -Command "(gc index.html) -replace 'YOUR_GA_ID', '%ga_id%' | Out-File -encoding UTF8 index.html"
    echo [OK] Google Analytics configurado: %ga_id%
)

echo.

REM Perguntar o Facebook Pixel ID
echo ========================================
echo   Configuracao do Facebook Pixel
echo ========================================
echo Digite seu Facebook Pixel ID (ex: 123456789012345):
echo (Deixe em branco para pular)
set /p pixel_id=

if "%pixel_id%"=="" (
    echo [AVISO] Facebook Pixel nao configurado
) else (
    echo Atualizando Facebook Pixel ID...
    powershell -Command "(gc index.html) -replace 'YOUR_PIXEL_ID', '%pixel_id%' | Out-File -encoding UTF8 index.html"
    echo [OK] Facebook Pixel configurado: %pixel_id%
)

echo.
echo ========================================
echo [OK] Setup concluido!
echo ========================================
echo.
echo Proximos passos:
echo 1. Abra index.html no navegador para testar
echo 2. Faca o deploy usando Vercel, Netlify ou GitHub Pages
echo 3. Veja o guia completo em DEPLOY_GUIDE.md
echo.
echo Boa sorte com suas vendas!
echo.
pause
