#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
LeadExtract Advanced 2.0 - Entry Point (CLI)
Executável principal com interface de linha de comando
"""

import sys
import asyncio
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from lead_extractor_advanced import PipelineLeadExtractor
import pandas as pd

def main():
    """Função principal"""
    print("\n" + "="*80)
    print("LEADEXTRACT ADVANCED 2.0 - Sistema de Extracao e Enriquecimento de Leads")
    print("="*80 + "\n")
    
    print("Menu Principal:")
    print("1. Extrair leads (Google Maps + Enriquecimento)")
    print("2. Sair\n")
    
    escolha = input("Escolha uma opcao: ").strip()
    
    if escolha == "1":
        termo = input("\nTermo de busca (ex: 'Consultoria de Marketing em Sao Paulo'): ").strip()
        if not termo:
            termo = "Consultoria de Marketing em Sao Paulo"
        
        limite_str = input(f"Numero de leads (padrao 20): ").strip()
        limite = int(limite_str) if limite_str.isdigit() else 20
        
        print(f"\nProcessando: {termo}")
        print(f"Limite: {limite} leads\n")
        asyncio.run(executar_pipeline(termo, limite))
    
    else:
        print("Encerrando...")
        sys.exit(0)

async def executar_pipeline(termo: str, limite: int):
    """Executa o pipeline de extracao"""
    
    pipeline = PipelineLeadExtractor(max_concurrent=3)
    
    try:
        print("[INICIANDO] Pipeline de extracao...")
        df = await pipeline.extrair_e_enriquecer(
            termo_busca=termo,
            limite_empresas=limite
        )
        
        if not df.empty:
            downloads = Path.home() / "Downloads"
            csv_path = downloads / "leads_enriquecidos_brutal.csv"
            
            df.to_csv(csv_path, index=False, encoding='utf-8-sig')
            print(f"\n[OK] {len(df)} leads extraidos e salvos!")
            print(f"[OK] Arquivo: {csv_path}")
            
            print(f"\nEstatisticas:")
            print(f"  Total: {len(df)}")
            if 'lead_score' in df.columns:
                print(f"  Score medio: {df['lead_score'].mean():.2f}")
        else:
            print("[!] Nenhum lead foi gerado")
            
    except Exception as e:
        print(f"[ERRO] {e}")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nOperacao cancelada pelo usuario.")
        sys.exit(0)
    except Exception as e:
        print(f"\nErro fatal: {e}")
        sys.exit(1)
