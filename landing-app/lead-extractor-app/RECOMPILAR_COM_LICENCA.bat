@echo off
echo ========================================
echo Recompilando LeadExtractor.exe
echo Com arquivo de licenca incluido
echo ========================================
echo.

cd /d "%~dp0"

echo Verificando se license.key existe...
if not exist "license.key" (
    echo ERRO: Arquivo license.key nao encontrado!
    echo Certifique-se de que license.key esta na pasta lead-extractor-app
    pause
    exit /b 1
)

echo Arquivo license.key encontrado!
echo.

echo Executando PyInstaller...
echo.

pyinstaller LeadExtractor.spec

echo.
echo ========================================
echo Compilacao concluida!
echo ========================================
echo.
echo O arquivo LeadExtractor.exe esta em:
echo %~dp0dist\LeadExtractor.exe
echo.
echo Agora o executavel inclui o arquivo de licenca.
echo.
pause
