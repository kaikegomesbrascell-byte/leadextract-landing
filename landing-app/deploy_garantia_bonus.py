import subprocess
import os

os.chdir('landing-page')

print("📦 Fazendo deploy da Garantia de 7 Dias e Bônus...")

commands = [
    ['git', 'add', '.'],
    ['git', 'commit', '-m', 'feat: Adiciona garantia de 7 dias, seção de bônus e PDFs no pacote'],
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
print("\n📋 Resumo das atualizações:")
print("  ✅ Nova seção: Garantia de 7 Dias")
print("  ✅ Nova seção: Bônus Exclusivos")
print("  ✅ Garantia adicionada no Pricing")
print("  ✅ ZIP atualizado com 2 PDFs bônus")
print("  ✅ LEIA-ME.txt atualizado")
print("\n🎁 Bônus incluídos no ZIP:")
print("  • BONUS-1-Guia-Anti-Ban-WhatsApp.pdf")
print("  • BONUS-2-Scripts-de-Vendas.pdf")
