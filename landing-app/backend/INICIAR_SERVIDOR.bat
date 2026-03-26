@echo off
chcp 65001 >nul
cls
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║           LEAD EXTRACTOR - SERVIDOR DE PAGAMENTO          ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo.
echo Verificando instalação do Node.js...
echo.

where node >nul 2>nul
if errorlevel 1 (
    echo ❌ Node.js não está instalado!
    echo.
    echo Por favor, instale o Node.js:
    echo https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js encontrado!
echo.
node --version
echo.
echo ════════════════════════════════════════════════════════════
echo  INSTALANDO DEPENDÊNCIAS...
echo ════════════════════════════════════════════════════════════
echo.

if not exist "node_modules" (
    echo Instalando pacotes pela primeira vez...
    echo.
    call npm install
    echo.
    if errorlevel 1 (
        echo.
        echo ❌ Erro ao instalar dependências!
        echo.
        pause
        exit /b 1
    )
    echo ✅ Dependências instaladas com sucesso!
    echo.
) else (
    echo ✅ Dependências já instaladas!
    echo.
)

echo ════════════════════════════════════════════════════════════
echo  INICIANDO SERVIDOR...
echo ════════════════════════════════════════════════════════════
echo.
echo O servidor será iniciado em http://localhost:3001
echo.
echo Pressione Ctrl+C para parar o servidor
echo.
echo ════════════════════════════════════════════════════════════
echo.

npm start
