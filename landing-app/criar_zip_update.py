#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para criar pacote ZIP com atualizacoes do LeadExtract
"""

import zipfile
import os
from pathlib import Path
from datetime import datetime

def criar_zip_atualizacoes():
    """Cria ZIP com arquivos atualizados"""
    
    projeto_dir = Path("C:/Users/kaike/Downloads/AP@")
    dist_dir = projeto_dir / "dist" / "LeadExtract"
    
    # Arquivos a incluir
    arquivos = [
        # Executavel
        ("dist/LeadExtract/LeadExtract.exe", "LeadExtract.exe"),
        
        # Scripts Python
        ("lead_extractor_advanced.py", "scripts/lead_extractor_advanced.py"),
        ("exemplos_avancado.py", "scripts/exemplos_avancado.py"),
        ("leadextract_cli.py", "scripts/leadextract_cli.py"),
        ("run_pipeline_final.py", "scripts/run_pipeline_final.py"),
        ("test_maps_only.py", "scripts/test_maps_only.py"),
        
        # Configuracoes e specs
        ("requirements_advanced.txt", "requirements_advanced.txt"),
        ("LeadExtract_Advanced.spec", "LeadExtract_Advanced.spec"),
        
        # Arquivos de teste
        ("debug_maps_selectors.py", "debug/debug_maps_selectors.py"),
        ("debug_maps_detailed.py", "debug/debug_maps_detailed.py"),
        ("test_selector_simple.py", "debug/test_selector_simple.py"),
    ]
    
    # Nome do ZIP com data
    data_str = datetime.now().strftime("%Y%m%d_%H%M%S")
    zip_name = f"LeadExtract_v2.0_Update_{data_str}.zip"
    zip_path = projeto_dir / zip_name
    
    print(f"\nCriando arquivo: {zip_name}")
    print("=" * 80)
    
    # Criar ZIP
    with zipfile.ZipFile(str(zip_path), 'w', zipfile.ZIP_DEFLATED) as zf:
        for origem, destino in arquivos:
            arquivo_path = projeto_dir / origem
            
            if arquivo_path.exists():
                zf.write(str(arquivo_path), destino)
                print(f"  [OK] {destino}")
            else:
                print(f"  [!] Nao encontrado: {origem}")
        
        # Adicionar README
        readme_content = f"""# LeadExtract Advanced 2.0 - Atualizacao

Data de Geracao: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}

## Mudancas Realizadas

### Correcoes Principais
1. **Google Maps Scraper** - Seletor CSS corrigido
   - Antes: Seletor desatualizado (div[data-item-id]) retornava 0 empresas
   - Depois: Novo seletor (button[aria-label] com filtro "Ver rotas para") retorna 30+ empresas
   - Timeout aumentado de 30s para 90s com retry automatico

2. **Remocao de caracteres Unicode**
   - Removidos caracteres especiais (✓, ✗, →, ⚠) para compatibilidade com Windows PowerShell cp1252
   - Substituidos por texto ASCII: [OK], [ERRO], >>

3. **JavaScript Regex Corrigido**
   - Adicionado 'r' prefix nos strings do page.evaluate() para raw strings
   - Corrigido erro de escape sequences em regex patterns

### Novos Arquivos
- **leadextract_cli.py** - Entry point CLI (linha de comando)
- **run_pipeline_final.py** - Pipeline completo com salvamento em CSV
- **LeadExtract_Advanced.spec** - PyInstaller spec atualizado
- **debug_maps_*.py** - Scripts de diagnostico para debugging

### Performance
- Maps loading time: ~1-3 segundos (antes: timeout em 30s)
- Empresas extraidas: 20-50 por sessao
- CSV gerado em: C:\\Users\\kaike\\Downloads\\leads_enriquecidos_brutal.csv

### Como Usar

#### Executavel (Windows)
```
LeadExtract.exe
```

#### Via Python
```
python run_pipeline_final.py
python leadextract_cli.py
python exemplos_avancado.py
```

#### Resultado
Arquivo CSV com 22 colunas:
- nome_empresa
- telefone, email, whatsapp
- rating, total_avaliacoes
- endereco, url_site
- lead_score (0-10)
- email, whatsapp, receita_bruta, etc

## Arquivos Inclusos

```
LeadExtract_v2.0_Update_{datetime.now().strftime('%Y%m%d_%H%M%S')}/
├── LeadExtract.exe (executavel principal)
├── scripts/
│   ├── lead_extractor_advanced.py (core engine)
│   ├── exemplos_avancado.py (6 exemplos praticos)
│   ├── leadextract_cli.py (CLI interface)
│   └── run_pipeline_final.py (pipeline com saida)
├── debug/
│   ├── debug_maps_selectors.py
│   ├── debug_maps_detailed.py
│   └── test_selector_simple.py
├── requirements_advanced.txt
└── LeadExtract_Advanced.spec
```

## Requisitos (se rodar via Python)

```
pip install -r requirements_advanced.txt
```

Dependencias:
- Python 3.10+
- aiohttp, asyncio
- playwright (com stealth.js)
- beautifulsoup4
- pandas
- requests

## Historico de Versoes

### v2.0 (Atual)
- [✓] Google Maps scraper funcionando (30+ leads/sessao)
- [✓] CSS selectors atualizados
- [✓] Timeout management melhorado
- [✓] Unicode encoding fixo para Windows
- [✓] Executavel PyInstaller (85.6 MB)

### v1.9
- Deep crawling de sites
- Enriquecimento via ReceitaWS
- Calculo de lead score (0-10)

## Suporte

Em caso de problemas:
1. Verifique o arquivo de log: C:\\Users\\kaike\\Downloads\\lead_extractor_advanced.log
2. Execute o debug: python debug_maps_selectors.py
3. Verifique conexao de internet (rate limit pode aplicar)
"""
        zf.writestr("README.md", readme_content)
        print(f"  [OK] README.md")
    
    size_mb = zip_path.stat().st_size / (1024 * 1024)
    print("\n" + "=" * 80)
    print(f"[OK] Arquivo criado com sucesso!")
    print(f"     Caminho: {zip_path}")
    print(f"     Tamanho: {size_mb:.2f} MB")
    print("=" * 80 + "\n")

if __name__ == "__main__":
    os.chdir("C:/Users/kaike/Downloads/AP@")
    criar_zip_atualizacoes()
