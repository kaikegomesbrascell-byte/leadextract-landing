#!/usr/bin/env python3
"""CLI for LeadExtract Advanced Pipeline"""

import asyncio
import argparse
import sys
from pathlib import Path
from lead_extractor_advanced import PipelineLeadExtractor
import pandas as pd

async def main():
    parser = argparse.ArgumentParser(description='LeadExtract Advanced - Extração B2B Brasil')
    parser.add_argument('termo_busca', help='Termo de busca (ex: Energia Solar SP)')
    parser.add_argument('--limite', type=int, default=50, help='Limite de empresas (default: 50)')
    parser.add_argument('--output', '-o', default=None, help='Arquivo CSV output (default: leads_[timestamp].csv)')
    parser.add_argument('--max-concurrent', type=int, default=5, help='Max concurrent crawls (default: 5)')
    
    args = parser.parse_args()
    
    if args.output is None:
        timestamp = pd.Timestamp.now().strftime('%Y%m%d_%H%M%S')
        args.output = f"leads_{args.termo_busca.replace(' ', '_')}_{timestamp}.csv"
    
    print(f"🚀 Iniciando extração: '{args.termo_busca}'")
    print(f"📊 Limite: {args.limite}")
    print(f"💾 Output: {args.output}")
    
    pipeline = PipelineLeadExtractor(max_concurrent=args.max_concurrent)
    df = await pipeline.extrair_e_enriquecer(args.termo_busca, args.limite)
    
    if not df.empty:
        output_path = Path(args.output)
        df.to_csv(output_path, index=False, encoding='utf-8')
        print(f"\n✅ SUCESSO! {len(df)} leads salvos em:")
        print(f"📂 {output_path.absolute()}")
        print(f"\n📈 Top 5 leads (score):")
        print(df[['nome_empresa', 'url_site', 'cnpj', 'telefone', 'lead_score']].head())
    else:
        print("❌ Nenhum lead gerado!")

if __name__ == '__main__':
    asyncio.run(main())

