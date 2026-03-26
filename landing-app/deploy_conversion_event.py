import subprocess
import os

os.chdir('landing-page')

print("🎯 Adicionando evento de conversão de compra...")

commands = [
    ['git', 'add', 'src/pages/ThankYou.tsx'],
    ['git', 'commit', '-m', 'feat: Adiciona evento de conversão de compra na página de obrigado'],
    ['git', 'push', 'origin', 'main']
]

for cmd in commands:
    print(f"\n🔄 Executando: {' '.join(cmd)}")
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        print(result.stdout)
        if result.stderr:
            print(result.stderr)
    except subprocess.CalledProcessError as e:
        print(f"❌ Erro: {e}")
        print(f"Saída: {e.stdout}")
        print(f"Erro: {e.stderr}")
        if 'nothing to commit' in e.stdout or 'nothing to commit' in e.stderr:
            print("✅ Nada para commitar!")
            continue

print("\n✅ Evento de conversão adicionado!")
print("\n📋 Configuração:")
print("  • Evento: conversion (Compra)")
print("  • ID: AW-18030639277/mg8YCPyF4Y0cEK3x1pVD")
print("  • Valor: R$ 1.000,00")
print("  • Moeda: BRL")
print("\n📍 Localização:")
print("  • Página: /obrigado e /thank-you")
print("  • Dispara: Quando a página carrega")
print("\n🎯 O que será rastreado:")
print("  • Toda vez que um cliente acessa a página de obrigado")
print("  • O Google Ads registra como uma conversão de compra")
print("  • Valor de R$ 1.000,00 é atribuído à conversão")
print("\n⏰ Aguarde o deploy do Vercel (1-2 minutos)")
print("\n🧪 Como testar:")
print("  1. Acesse: https://seu-dominio.vercel.app/obrigado")
print("  2. Abra o Console (F12)")
print("  3. Veja se aparece o evento de conversão")
print("  4. Verifique no Google Ads em 24-48 horas")
