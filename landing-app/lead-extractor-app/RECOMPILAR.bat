@echo off
echo ========================================
echo  RECOMPILANDO LEAD EXTRACTOR
echo ========================================
echo.

echo [1/4] Limpando arquivos antigos...
if exist build rmdir /s /q build
if exist dist rmdir /s /q dist
if exist LeadExtractor.spec del LeadExtractor.spec
echo OK!
echo.

echo [2/4] Compilando com PyInstaller...
python -m PyInstaller --onefile --windowed --name="LeadExtractor" Extractor.py
echo.

echo [3/4] Verificando se o executavel foi criado...
if exist dist\LeadExtractor.exe (
    echo OK! Executavel criado com sucesso!
) else (
    echo ERRO! Executavel nao foi criado.
    pause
    exit /b 1
)
echo.

echo [4/4] Abrindo pasta do executavel...
explorer dist
echo.

echo ========================================
echo  COMPILACAO CONCLUIDA!
echo ========================================
echo.
echo O executavel esta em: dist\LeadExtractor.exe
echo.
echo Agora voce pode:
echo 1. Testar o executavel (duplo clique em LeadExtractor.exe)
echo 2. Preparar o ZIP para distribuicao (npm run prepare-download)
echo.
pause
