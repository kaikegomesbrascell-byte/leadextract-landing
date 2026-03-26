import subprocess
import os

# Mudar para o diretório landing-page
os.chdir('landing-page')

print("📦 Atualizando arquivo ZIP no GitHub...")

# Comandos git
commands = [
    ['git', 'add', 'downloads/lead-extractor.zip'],
    ['git', 'commit', '-m', 'chore: Atualiza executável com correção de bug de feedback visual'],
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
            print("✅ Nada para commitar - arquivo ZIP já está atualizado!")
            continue
        break

print("\n✅ Arquivo ZIP atualizado no GitHub!")
