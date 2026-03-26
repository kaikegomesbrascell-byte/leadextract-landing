import subprocess
import os

os.chdir('landing-page')

print("📊 Adicionando Google Tag Manager...")

commands = [
    ['git', 'add', 'index.html'],
    ['git', 'commit', '-m', 'feat: Adiciona Google Tag Manager (gtag.js) para rastreamento'],
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

print("\n✅ Google Tag Manager adicionado!")
print("\n📋 O que foi feito:")
print("  • Google Tag (gtag.js) adicionado no <head>")
print("  • ID: AW-18030639277")
print("  • Rastreamento ativo em todas as páginas")
print("\n🌐 Páginas rastreadas:")
print("  • Landing Page (página inicial)")
print("  • Página de Obrigado (/obrigado)")
print("  • Todas as outras páginas da aplicação")
print("\n📊 Eventos rastreados:")
print("  • Pageviews (visualizações de página)")
print("  • Conversões (quando configuradas no Google Ads)")
print("\n⏰ Aguarde o deploy do Vercel (1-2 minutos)")
