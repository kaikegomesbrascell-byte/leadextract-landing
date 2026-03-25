#!/usr/bin/env python3
"""
Script de Teste Rápido: Extração Google Maps
Testa apenas Phase 1 para validar seletores CSS
"""

import asyncio
from pathlib import Path
from lead_extractor_advanced import PipelineLeadExtractor

async def test_maps_extraction():
    """Testa extração do Google Maps"""
    
    print("\n" + "="*70)
    print("TESTE: Extração Google Maps (Fase 1 apenas)")
    print("="*70 + "\n")
    
    pipeline = PipelineLeadExtractor()
    
    # Registrar em modo verbose
    import logging
    logging.basicConfig(level=logging.INFO)
    
    # Testar extração
    termo = "Consultoria de Marketing em Sao Paulo"
    print(f"[1] Buscando: {termo}")
    
    try:
        # Usar a funcao de busca do scraper do Maps
        await pipeline.maps_scraper.inicializar()
        
        empresas = await pipeline.maps_scraper.buscar_empresas(
            termo_busca=termo,
            limite=15,
            scroll_count=2
        )
        
        print(f"\n[OK] Extraidas {len(empresas)} empresas!\n")
        
        if empresas:
            print("Primeiras empresas encontradas:")
            print("-" * 70)
            for idx, emp in enumerate(empresas[:10], 1):
                print(f"{idx}. {emp.nome}")
                if emp.rating:
                    print(f"   Rating: {emp.rating}")
                if emp.endereco:
                    print(f"   Endereco: {emp.endereco}")
            print("-" * 70)
            
            # Salvar simples
            downloads = Path.home() / "Downloads"
            csv_path = downloads / "leads_teste_maps.csv"
            
            import pandas as pd
            df = pd.DataFrame([
                {
                    "nome": e.nome,
                    "rating": e.rating,
                    "endereco": e.endereco,
                    "telefone": e.telefone,
                    "url_site": e.url_site,
                }
                for e in empresas
            ])
            
            df.to_csv(csv_path, index=False, encoding='utf-8-sig')
            print(f"\n[OK] CSV salvo: {csv_path}\n")
        else:
            print("[!] NENHUMA empresa foi extraida!")
            
    except Exception as e:
        print(f"[ERRO] {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        await pipeline.maps_scraper.fechar()
    
    print("="*70 + "\n")

if __name__ == "__main__":
    asyncio.run(test_maps_extraction())
