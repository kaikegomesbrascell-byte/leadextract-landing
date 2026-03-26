"""
Exemplos Práticos - LeadExtract Advanced 2.0
Casos de uso realistas e personalizáveis
"""

import asyncio
import pandas as pd
from pathlib import Path
from lead_extractor_advanced import (
    PipelineLeadExtractor,
    DeepCrawler,
    ReceitaWSEnricher,
    ScoringEngine,
    DadosEnriquecidos,
    DadosFinanceiros,
    EmpresaBase,
)


# ============================================================================
# EXEMPLO 1: Extração Básica - Um nicho simples
# ============================================================================

async def exemplo_1_extracao_basica():
    """
    Exemplo: Extrair todas as consultoras de marketing em São Paulo
    Resultado: leads_enriquecidos_brutal.csv
    """
    print("\n" + "=" * 80)
    print("EXEMPLO 1: Extração Básica - Consultoras de Marketing em SP")
    print("=" * 80)
    
    pipeline = PipelineLeadExtractor(max_concurrent=5)
    
    df = await pipeline.extrair_e_enriquecer(
        termo_busca="Consultoria de Marketing em São Paulo",
        limite_empresas=30
    )
    
    if not df.empty:
        print(f"\n[OK] Extraidas {len(df)} empresas")
        print("\nTop 5 leads por score:")
        print(df[['nome_empresa', 'lead_score', 'emails', 'whatsapp']].head())
        
        print("\nEstatísticas:")
        print(f"Score médio: {df['lead_score'].mean():.2f}")
        print(f"Com WhatsApp: {df['whatsapp'].notna().sum()}")
        print(f"Com emails: {(df['emails'] != '').sum()}")


# ============================================================================
# EXEMPLO 2: Multi-nicho - Vários segmentos em paralelo
# ============================================================================

async def exemplo_2_multi_nicho():
    """
    Executar extração para múltiplos nichos simultaneamente
    Mesclar resultados em um único CSV
    """
    print("\n" + "=" * 80)
    print("EXEMPLO 2: Multi-Nicho - Vários Segmentos em Paralelo")
    print("=" * 80)
    
    nichos = [
        "Agência de Viagens em São Paulo",
        "Consultoria Jurídica em Rio de Janeiro",
        "Consultoria de RH em Belo Horizonte",
    ]
    
    all_results = []
    
    for nicho in nichos:
        print(f"\n▶ Processando: {nicho}")
        
        pipeline = PipelineLeadExtractor(max_concurrent=3)
        df = await pipeline.extrair_e_enriquecer(
            termo_busca=nicho,
            limite_empresas=20
        )
        
        # Adicionar coluna de nicho
        df['nicho'] = nicho
        all_results.append(df)
    
    # Consolidar
    df_final = pd.concat(all_results, ignore_index=True)
    df_final = df_final.sort_values('lead_score', ascending=False)
    
    print(f"\n[OK] Total consolidado: {len(df_final)} leads")
    downloads_path = Path.home() / "Downloads" / 'leads_multi_nicho.csv'
    df_final.to_csv(str(downloads_path), index=False, encoding='utf-8')
    print(f"[OK] Salvo em: {downloads_path}")


# ============================================================================
# EXEMPLO 3: Filtragem e Segmentação
# ============================================================================

async def exemplo_3_filtragem_segmentacao():
    """
    Extração + análise profunda com múltiplos filtros
    """
    print("\n" + "=" * 80)
    print("EXEMPLO 3: Filtragem e Segmentação Avançada")
    print("=" * 80)
    
    pipeline = PipelineLeadExtractor(max_concurrent=5)
    df = await pipeline.extrair_e_enriquecer(
        termo_busca="Agência de Marketing Digital em São Paulo",
        limite_empresas=50
    )
    
    if df.empty:
        print("Nenhum resultado!")
        return
    
    # Criar coluna de prioridade baseada no score
    df['prioridade'] = pd.cut(
        df['lead_score'],
        bins=[0, 2, 5, 10],
        labels=['Baixa', 'Média', 'Alta'],
        include_lowest=True
    )
    
    # Contatabilidade
    df['contactavel'] = df.apply(
        lambda row: (row['whatsapp'] is not None or row['emails'] != ''),
        axis=1
    )
    
    # Stack tech score
    df['tech_score'] = df.apply(
        lambda row: int(
            (row['tem_gtm'] or row['tem_facebook_pixel']) + 
            row['tem_google_analytics'] +
            row['design_responsivo']
        ),
        axis=1
    )
    
    # Análise por prioridade
    print("\n📊 ANÁLISE POR PRIORIDADE:")
    for prioridade in ['Alta', 'Média', 'Baixa']:
        subset = df[df['prioridade'] == prioridade]
        if len(subset) > 0:
            print(f"\n{prioridade} ({len(subset)} leads):")
            print(f"  - Contactáveis: {subset['contactavel'].sum()}")
            print(f"  - Tech Score médio: {subset['tech_score'].mean():.1f}")
    
    # Exportar segmentações
    print("\n💾 EXPORTANDO SEGMENTAÇÕES:")
    downloads_path = Path.home() / "Downloads"
    for prioridade in ['Alta', 'Média', 'Baixa']:
        subset = df[df['prioridade'] == prioridade]
        if not subset.empty:
            arquivo = downloads_path / f'leads_prioridade_{prioridade.lower()}.csv'
            subset.to_csv(str(arquivo), index=False, encoding='utf-8')
            print(f"  [OK] {arquivo.name}")
    
    # Top contactáveis
    top_contactaveis = df[df['contactavel']].nlargest(10, 'lead_score')
    top_contactaveis.to_csv(str(downloads_path / 'leads_top_contactaveis.csv'), index=False, encoding='utf-8')
    print(f"  [OK] leads_top_contactaveis.csv")


# ============================================================================
# EXEMPLO 4: Só Crawling (sem maps)
# ============================================================================

async def exemplo_4_crawling_manual():
    """
    Usar apenas o módulo de Deep Crawler para uma lista manual de URLs
    Útil quando você já tem os URLs das empresas
    """
    print("\n" + "=" * 80)
    print("EXEMPLO 4: Deep Crawling de URLs Específicas")
    print("=" * 80)
    
    urls_empresas = [
        "https://agenciamarketing1.com.br",
        "https://consultoria2.com.br",
        "https://empresa3.com.br",
    ]
    
    crawler = DeepCrawler()
    await crawler.inicializar_session()
    
    resultados = []
    
    for url in urls_empresas:
        print(f"\n▶ Crawling: {url}")
        
        try:
            dados = await crawler.crawl_site(url, timeout=10)
            
            resultado = {
                'url': url,
                'emails': ', '.join(dados.emails),
                'whatsapp': dados.whatsapp,
                'linkedin': dados.linkedin,
                'instagram': dados.instagram,
                'tem_gtm': dados.tem_gtm,
                'tem_facebook_pixel': dados.tem_facebook_pixel,
                'design_responsivo': dados.design_responsivo,
                'erro': dados.erro_crawl
            }
            
            resultados.append(resultado)
            print(f"  [OK] Sucesso: {len(dados.emails)} emails, WhatsApp: {dados.whatsapp}")
        
        except Exception as e:
            print(f"  [ERRO] Falha: {e}")
    
    await crawler.fechar()
    
    # Salvar resultados
    df = pd.DataFrame(resultados)
    downloads_path = Path.home() / "Downloads" / 'crawl_resultados_manual.csv'
    df.to_csv(str(downloads_path), index=False, encoding='utf-8')
    print(f"\n[OK] Resultados salvos em: {downloads_path}")


# ============================================================================
# EXEMPLO 5: Score Breakdown - Entender o Scoring
# ============================================================================

async def exemplo_5_analise_score():
    """
    Análise detalhada de como cada lead chegou ao seu score
    """
    print("\n" + "=" * 80)
    print("EXEMPLO 5: Análise Detalhada do Score")
    print("=" * 80)
    
    pipeline = PipelineLeadExtractor(max_concurrent=5)
    df = await pipeline.extrair_e_enriquecer(
        termo_busca="Consultoria de Marketing em São Paulo",
        limite_empresas=20
    )
    
    if df.empty or 'score_breakdown' not in df.columns:
        print("Dados insuficientes!")
        return
    
    print("\n🎯 TOP 5 LEADS COM BREAKDOWN DO SCORE:\n")
    
    top_5 = df.nlargest(5, 'lead_score')
    
    for idx, row in top_5.iterrows():
        print(f"\n{idx + 1}. {row['nome_empresa']} - Score: {row['lead_score']:.2f}")
        print(f"   URL: {row['url_site']}")
        
        if pd.notna(row['score_breakdown']):
            import json
            try:
                breakdown = json.loads(row['score_breakdown'])
                for criterio, pontos in breakdown.items():
                    print(f"   + {criterio}: {pontos:.1f}")
            except:
                pass
        
        print(f"   Contato: WhatsApp={row['whatsapp']}, Emails={len(row['emails'].split(',')) if row['emails'] else 0}")


# ============================================================================
# EXEMPLO 6: Integração com Planilha Google Sheets (pseudo-código)
# ============================================================================

async def exemplo_6_exportacao_avancada():
    """
    Após extração, salvar em múltiplos formatos
    """
    print("\n" + "=" * 80)
    print("EXEMPLO 6: Exportação em Múltiplos Formatos")
    print("=" * 80)
    
    pipeline = PipelineLeadExtractor(max_concurrent=5)
    df = await pipeline.extrair_e_enriquecer(
        termo_busca="Consultoria de Marketing em São Paulo",
        limite_empresas=30
    )
    
    if df.empty:
        print("Nenhum resultado!")
        return
    
    # 1. CSV básico
    downloads_path = Path.home() / "Downloads"
    df.to_csv(str(downloads_path / 'leads_bruto.csv'), index=False, encoding='utf-8')
    print("[OK] leads_bruto.csv")
    
    # 2. Excel com múltiplas abas
    with pd.ExcelWriter(str(downloads_path / 'leads_completo.xlsx'), engine='openpyxl') as writer:
        # Aba 1: Todos os leads
        df.to_excel(writer, sheet_name='Todos', index=False)
        
        # Aba 2: Apenas contactáveis
        contactaveis = df[df['whatsapp'].notna() | (df['emails'] != '')]
        contactaveis.to_excel(writer, sheet_name='Contactáveis', index=False)
        
        # Aba 3: Com marketing completo
        advanced_tech = df[
            (df['tem_gtm'] == True) & 
            (df['tem_facebook_pixel'] == True) &
            (df['design_responsivo'] == True)
        ]
        if not advanced_tech.empty:
            advanced_tech.to_excel(writer, sheet_name='Tech Avançado', index=False)
    
    print("[OK] leads_completo.xlsx")
    
    # 3. JSON para integração com APIs
    import json
    df_json = df.to_dict('records')
    with open(str(downloads_path / 'leads.json'), 'w', encoding='utf-8') as f:
        json.dump(df_json, f, ensure_ascii=False, indent=2)
    print("[OK] leads.json")
    
    # 4. CSV simplificado para vendas
    vendas_df = df[['nome_empresa', 'whatsapp', 'emails', 'lead_score', 'linkedin']].copy()
    vendas_df.to_csv(str(downloads_path / 'leads_para_vendas.csv'), index=False, encoding='utf-8')
    print("[OK] leads_para_vendas.csv")


# ============================================================================
# LAUNCHER
# ============================================================================

async def main():
    """Menu principal de exemplos"""
    
    print("\n" + "=" * 80)
    print("LEADEXTRACT ADVANCED 2.0 - EXEMPLOS PRÁTICOS")
    print("=" * 80)
    
    exemplos = {
        '1': ('Extração Básica', exemplo_1_extracao_basica),
        '2': ('Multi-Nicho', exemplo_2_multi_nicho),
        '3': ('Filtragem Avançada', exemplo_3_filtragem_segmentacao),
        '4': ('Crawling Manual', exemplo_4_crawling_manual),
        '5': ('Análise de Score', exemplo_5_analise_score),
        '6': ('Exportação Avançada', exemplo_6_exportacao_avancada),
    }
    
    print("\nEscolha um exemplo:")
    for key, (nome, _) in exemplos.items():
        print(f"  {key}. {nome}")
    
    # Para usar via linha de comando
    import sys
    if len(sys.argv) > 1:
        escolha = sys.argv[1]
    else:
        escolha = input("\nDigite o número: ").strip()
    
    if escolha in exemplos:
        print(f"\n▶ Executando: {exemplos[escolha][0]}")
        await exemplos[escolha][1]()
    else:
        print("Opção inválida!")
        
        print("\nExecutando todos os exemplos...")
        for key, (nome, func) in exemplos.items():
            try:
                print(f"\n▶ {nome}...")
                await func()
            except Exception as e:
                print(f"[ERRO] Falha: {e}")


if __name__ == "__main__":
    # Executar com: python exemplos_avancado.py [1-6]
    asyncio.run(main())
