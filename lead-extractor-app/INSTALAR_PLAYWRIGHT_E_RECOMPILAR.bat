@echo off
chcp 65001 >nul
echo ========================================
echo Instalando Playwright Chromium
echo ========================================
echo.
echo Este script vai:
echo 1. Instalar o navegador Chromium (~150MB)
echo 2. Recompilar o executável com as correções
echo 3. Criar o arquivo ZIP atualizado
echo.
echo Tempo estimado: 5-10 minutos
echo.
pause
echo.

echo ========================================
echo PASSO 1: Instalando Chromium
echo ========================================
echo.
python -m playwright install chromium
if errorlevel 1 (
    echo.
    echo ❌ ERRO: Falha ao instalar Chromium
    echo.
    echo Verifique se Python está instalado corretamente.
    echo.
    pause
    exit /b 1
)
echo.
echo ✅ Chromium instalado com sucesso!
echo.

echo ========================================
echo PASSO 2: Recompilando executável
echo ========================================
echo.
pyinstaller LeadExtractor.spec --clean --noconfirm
if errorlevel 1 (
    echo.
    echo ❌ ERRO: Falha ao recompilar
    echo.
    echo Verifique se PyInstaller está instalado:
    echo   pip install pyinstaller
    echo.
    pause
    exit /b 1
)
echo.
echo ✅ Executável recompilado com sucesso!
echo.

echo ========================================
echo PASSO 3: Criando arquivo ZIP
echo ========================================
echo.
python create_zip_from_here.py
if errorlevel 1 (
    echo.
    echo ❌ ERRO: Falha ao criar ZIP
    echo.
    pause
    exit /b 1
)
echo.
echo ✅ ZIP criado com sucesso!
echo.

echo ========================================
echo ✅ PROCESSO CONCLUÍDO!
echo ========================================
echo.
echo O executável está em:
echo   dist\LeadExtractor.exe
echo.
echo O arquivo ZIP está em:
echo   ..\landing-page\public\lead-extractor.zip
echo.
echo IMPORTANTE: Antes de usar o executável, você precisa:
echo   1. Executar o comando: python -m playwright install chromium
echo   2. Isso instala o navegador no sistema do usuário
echo.
echo Pressione qualquer tecla para sair...
pause >nul
