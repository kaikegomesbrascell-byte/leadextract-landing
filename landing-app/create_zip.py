import zipfile
import os
from pathlib import Path

# Criar pasta de downloads se não existir
downloads_dir = Path('landing-page/downloads')
downloads_dir.mkdir(exist_ok=True)

# Arquivos para incluir no ZIP
files_to_include = [
    ('lead-extractor-app/dist/LeadExtractor.exe', 'LeadExtractor.exe'),
    ('Guia-Mestre-Anti-Ban-Proteja-seu-WhatsApp.pdf', 'BONUS-1-Guia-Anti-Ban-WhatsApp.pdf'),
    ('3-Scripts-de-Vendas-de-Alta-Conversao.pdf', 'BONUS-2-Scripts-de-Vendas.pdf'),
]

# Criar arquivo ZIP
zip_path = downloads_dir / 'lead-extractor.zip'
print(f'📦 Criando {zip_path}...')

with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for source, dest in files_to_include:
        if os.path.exists(source):
            zipf.write(source, dest)
            print(f'✅ Adicionado: {dest}')
        else:
            print(f'⚠️  Arquivo não encontrado: {source}')
    
    # Adicionar README com instruções
    readme_content = """# Lead Extractor - Google Maps

## 🎉 Bem-vindo!

Obrigado por usar o Lead Extractor!

## 📦 Conteúdo do Pacote

Este pacote inclui:

1. **LeadExtractor.exe** - Software principal de extração de leads
2. **BONUS-1-Guia-Anti-Ban-WhatsApp.pdf** - Guia completo para proteger seu WhatsApp
3. **BONUS-2-Scripts-de-Vendas.pdf** - 3 scripts de vendas de alta conversão

## 🚀 Como Usar

### Executando o Software

1. **Descompacte o arquivo ZIP**
2. **Dê duplo clique em LeadExtractor.exe**
3. **Pronto!** A interface gráfica vai abrir

**IMPORTANTE:** Não precisa instalar Python ou dependências. O executável já contém tudo!

### Fluxo de Uso

1. **Preencha os campos**:
   - Nicho/Palavra-chave (ex: "restaurantes", "dentistas")
   - Localização/Cidade (ex: "São Paulo", "Rio de Janeiro")
   - Limite de leads (50, 100 ou 500)

2. **Clique em "Iniciar Extração"**:
   - A extração começará automaticamente
   - Os dados aparecerão em tempo real na tabela
   - Sistema usa Intervalos Humanos Inteligentes para proteção

3. **Acompanhe o progresso**:
   - Barra de progresso mostra o andamento
   - Tabela é atualizada conforme leads são extraídos
   - Use o botão "Parar" se necessário

4. **Exporte os dados**:
   - Clique em "Exportar"
   - Escolha o formato (Excel ou CSV)
   - Selecione o local e nome do arquivo
   - Pronto! Seus leads estão salvos

## 🛡️ Intervalos Humanos Inteligentes

O sistema possui proteção integrada que:
- Simula comportamento humano com delays naturais
- Protege seu número de WhatsApp contra banimento
- Evita bloqueios do Google Maps
- Garante extrações seguras a longo prazo

## 📊 Dados Extraídos

Para cada empresa, o sistema extrai:
- Nome da Empresa
- Telefone
- Site
- Nota/Rating
- Quantidade de Comentários
- Endereço Completo

## 🎁 Bônus Incluídos

### Bônus 1: Guia Anti-Ban WhatsApp
Aprenda a proteger seu número de WhatsApp ao fazer prospecção em massa. 
Técnicas comprovadas para evitar banimentos e manter sua conta segura.

### Bônus 2: Scripts de Vendas
3 scripts de vendas de alta conversão prontos para usar com seus leads extraídos.
Aumente suas taxas de conversão desde o primeiro contato.

## 🐛 Solução de Problemas

### Antivírus bloqueia o executável

**Normal!** Alguns antivírus detectam executáveis Python como falso positivo.

**Solução:**
- Adicione exceção no antivírus
- Ou execute mesmo assim (o arquivo é seguro)

### Interface não responde

- Aguarde o término da extração
- Use o botão "Parar" se necessário

### Dados não são extraídos

- Verifique sua conexão com a internet
- O Google Maps pode ter mudado a estrutura da página

## 🛡️ Garantia de 7 Dias

Se em 7 dias você não extrair seus primeiros 500 leads, devolvemos 100% do seu dinheiro.
Sem perguntas, sem burocracia.

## 📞 Suporte

Para suporte técnico, entre em contato conosco.

---

**Versão**: 1.0.1 (Bugfix: Feedback visual melhorado)
**Atualização**: Corrigido bug onde mensagens de status não apareciam imediatamente

**IMPORTANTE:** Este software é licenciado para uso pessoal ou comercial.
"""
    
    zipf.writestr('LEIA-ME.txt', readme_content)
    print('✅ Adicionado: LEIA-ME.txt')

print(f'\n✅ Arquivo ZIP criado com sucesso!')
print(f'📍 Local: {zip_path.absolute()}')
print(f'📦 Tamanho: {os.path.getsize(zip_path) / 1024 / 1024:.2f} MB')
print(f'\n📋 Conteúdo:')
print(f'  • LeadExtractor.exe')
print(f'  • BONUS-1-Guia-Anti-Ban-WhatsApp.pdf')
print(f'  • BONUS-2-Scripts-de-Vendas.pdf')
print(f'  • LEIA-ME.txt')

# Copiar para pasta public/ do Vercel
public_dir = Path('landing-page/public')
public_dir.mkdir(exist_ok=True)
public_zip = public_dir / 'lead-extractor.zip'

import shutil
shutil.copy2(zip_path, public_zip)
print(f'\n✅ Copiado para: {public_zip.absolute()}')
print(f'🌐 Pronto para deploy no Vercel!')
