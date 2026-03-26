import subprocess
import os

os.chdir('landing-page')

print("📦 Fazendo deploy das atualizações de Intervalos Humanos Inteligentes...")

commands = [
    ['git', 'add', '.'],
    ['git', 'commit', '-m', 'feat: Adiciona destaque para Intervalos Humanos Inteligentes e pagamento único'],
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
print("  ✅ Nova seção: Intervalos Humanos Inteligentes")
print("  ✅ Destaque em Features com badge de proteção")
print("  ✅ Pagamento único em letras garrafais")
print("  ✅ Benefício principal atualizado no Pricing")
print("  ✅ Nova pergunta no FAQ sobre proteção")
