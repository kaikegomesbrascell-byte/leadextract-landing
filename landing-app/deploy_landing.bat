@echo off
echo ========================================
echo Deploy do Lead Extractor para GitHub
echo ========================================
echo.

cd landing-page

echo Verificando status do Git...
git status

echo.
echo Adicionando arquivos...
git add .

echo.
echo Fazendo commit...
git commit -m "fix: Atualizado executável com license_validator.py correto - versão 1.0.3"

echo.
echo Fazendo push para GitHub...
git push origin main

echo.
echo ========================================
echo Deploy concluído!
echo ========================================
echo.
pause
