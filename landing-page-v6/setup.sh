#!/bin/bash

# LeadExtract 6.0 - Setup Script
# Este script ajuda a configurar rapidamente a landing page

echo "🚀 LeadExtract 6.0 - Setup Wizard"
echo "=================================="
echo ""

# Verificar se o arquivo index.html existe
if [ ! -f "index.html" ]; then
    echo "❌ Erro: index.html não encontrado!"
    echo "Execute este script dentro da pasta landing-page-v6"
    exit 1
fi

echo "✅ Arquivo index.html encontrado"
echo ""

# Perguntar o número do WhatsApp
echo "📱 Configuração do WhatsApp"
echo "----------------------------"
echo "Digite seu número com DDI e DDD (ex: 5511999998888):"
read whatsapp_number

if [ -z "$whatsapp_number" ]; then
    echo "⚠️  Número não fornecido. Mantendo padrão: 5516994260416"
else
    echo "Atualizando número do WhatsApp..."
    sed -i.bak "s/5516994260416/$whatsapp_number/g" index.html
    echo "✅ Número atualizado para: $whatsapp_number"
fi

echo ""

# Perguntar o Google Analytics ID
echo "📊 Configuração do Google Analytics"
echo "------------------------------------"
echo "Digite seu Google Analytics ID (ex: G-XXXXXXXXXX):"
echo "(Deixe em branco para pular)"
read ga_id

if [ -z "$ga_id" ]; then
    echo "⚠️  Google Analytics não configurado"
else
    echo "Atualizando Google Analytics ID..."
    sed -i.bak "s/YOUR_GA_ID/$ga_id/g" index.html
    echo "✅ Google Analytics configurado: $ga_id"
fi

echo ""

# Perguntar o Facebook Pixel ID
echo "📈 Configuração do Facebook Pixel"
echo "----------------------------------"
echo "Digite seu Facebook Pixel ID (ex: 123456789012345):"
echo "(Deixe em branco para pular)"
read pixel_id

if [ -z "$pixel_id" ]; then
    echo "⚠️  Facebook Pixel não configurado"
else
    echo "Atualizando Facebook Pixel ID..."
    sed -i.bak "s/YOUR_PIXEL_ID/$pixel_id/g" index.html
    echo "✅ Facebook Pixel configurado: $pixel_id"
fi

echo ""
echo "=================================="
echo "✅ Setup concluído!"
echo ""
echo "Próximos passos:"
echo "1. Abra index.html no navegador para testar"
echo "2. Faça o deploy usando Vercel, Netlify ou GitHub Pages"
echo "3. Veja o guia completo em DEPLOY_GUIDE.md"
echo ""
echo "🚀 Boa sorte com suas vendas!"
