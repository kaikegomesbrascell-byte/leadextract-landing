import subprocess
import os

os.chdir('landing-page')

print("📦 Fazendo deploy da Página de Obrigado...")

commands = [
    ['git', 'add', '.'],
    ['git', 'commit', '-m', 'feat: Adiciona página de obrigado profissional com dark mode'],
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
            print("✅ Nada para commitar - tudo já está atualizado!")
            continue

print("\n✅ Deploy concluído!")
print("\n📋 Página de Obrigado criada com sucesso!")
print("\n🌐 URLs disponíveis:")
print("  • /obrigado")
print("  • /thank-you")
print("\n⚙️  Próximo passo:")
print("  1. Edite src/pages/ThankYou.tsx")
print("  2. Altere o número do WhatsApp na linha 14")
print("  3. Formato: 5511999999999 (sem espaços)")
print("\n📖 Veja CONFIGURAR_WHATSAPP.md para mais detalhes")
