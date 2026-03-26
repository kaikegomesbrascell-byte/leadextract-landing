#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script Final: Executar Pipeline Completo e Salvar CSV
"""

import asyncio
from pathlib import Path
from lead_extractor_advanced import PipelineLeadExtractor
import pandas as pd

async def main():
    """Executa pipeline e salva CSV"""
    
    print("\n" + "="*80)
    print("LEADEXTRACT ADVANCED - Pipeline Completo com Saida CSV")
    print("="*80 + "\n")
    
    pipeline = PipelineLeadExtractor(max_concurrent=3)
    
    try:
        # Extrair e enriquecer
        df = await pipeline.extrair_e_enriquecer(
            termo_busca="Consultoria de Marketing em Sao Paulo",
            limite_empresas=20
        )
        
        if not df.empty:
            print(f"\n[OK] Extraidos e enriquecidos {len(df)} leads")
            
            # Salvar em CSV
            downloads = Path.home() / "Downloads"
            csv_path = downloads / "leads_enriquecidos_brutal.csv"
            
            df.to_csv(csv_path, index=False, encoding='utf-8-sig')
            print(f"[OK] CSV salvo em: {csv_path}\n")
            
            # Mostrar amostra
            print("Top 5 Leads por Score:")
            print("-" * 80)
            cols = ['nome_empresa', 'telefone', 'emails', 'lead_score']
            for col in cols:
                if col not in df.columns:
                    continue
            print(df[['nome_empresa', 'lead_score']].head().to_string())
            print("-" * 80)
            
            print(f"\nEstatisticas:")
            print(f"  Total de leads: {len(df)}")
            if 'lead_score' in df.columns:
                print(f"  Score medio: {df['lead_score'].mean():.2f}")
                print(f"  Score minimo: {df['lead_score'].min():.2f}")
                print(f"  Score maximo: {df['lead_score'].max():.2f}")
            
        else:
            print("[!] Nenhum lead foi gerado")
            
    finally:
        pass

if __name__ == "__main__":
    asyncio.run(main())
