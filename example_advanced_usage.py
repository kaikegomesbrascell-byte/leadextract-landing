"""
Exemplo de uso avançado do LeadExtract Core
Demonstra análise de dados, filtros e exportação customizada
"""

import asyncio
import pandas as pd
from lead_extractor_core import LeadExtractPipeline
from config_advanced import get_config


async def exemplo_basico():
    """Exemplo 1: Uso básico"""
    print("\n" + "="*60)
    print("EXEMPLO 1: Uso Básico")
    print("="*60)
    
    pipeline = LeadExtractPipeline()
    df = await pipeline.run("Energia Solar em São Paulo", max_resultados=10)
    
    print(f"\n✅ Extraídos {len(df)} leads")
    print(f"📊 Leads com score >= 7: {len(df[df['lead_score'] >= 7])}")
    
    df.to_csv("exemplo_basico.csv", index=False, encoding='utf-8-sig')


async def exemplo_multiplos_nichos():
    """Exemplo 2: Extrair múltiplos nichos em paralelo"""
    print("\n" + "="*60)
    print("EXEMPLO 2: Múltiplos Nichos em Paralelo")
    print("="*60)
    
    nichos = [
        "Clínicas de Estética em São Paulo",
        "Energia Solar em Rio de Janeiro",
        "Consultorias Empresariais em Belo Horizonte"
    ]
    
    pipeline = LeadExtractPipeline()
    
    # Executar em paralelo
    tasks = [pipeline.run(nicho, max_resultados=10) for nicho in nichos]
    resultados = await asyncio.gather(*tasks)
    
    # Combinar resultados
    df_final = pd.concat(resultados, ignore_index=True)
    
    print(f"\n✅ Total de leads: {len(df_final)}")
    print(f"📊 Distribuição por nicho:")
    
    # Adicionar coluna de nicho (simplificado)
    for i, nicho in enumerate(nichos):
        inicio = sum(len(r) for r in resultados[:i])
        fim = inicio + len(resultados[i])
        df_final.loc[inicio:fim-1, 'nicho'] = nicho.split(' em ')[0]
    
    print(df_final['nicho'].value_counts())
    
    df_final.to_csv("exemplo_multiplos_nichos.csv", index=False, encoding='utf-8-sig')


async def exemplo_analise_avancada():
    """Exemplo 3: Análise avançada de dados"""
    print("\n" + "="*60)
    print("EXEMPLO 3: Análise Avançada de Dados")
    print("="*60)
    
    pipeline = LeadExtractPipeline()
    df = await pipeline.run("Energia Solar em São Paulo", max_resultados=20)
    
    if df.empty:
        print("❌ Nenhum lead encontrado")
        return
    
    print("\n📊 ANÁLISE DE DADOS:")
    print("-" * 60)
    
    # 1. Estatísticas de Score
    print("\n1️⃣ Distribuição de Score:")
    print(f"   Média: {df['lead_score'].mean():.2f}")
    print(f"   Mediana: {df['lead_score'].median():.2f}")
    print(f"   Score >= 7: {len(df[df['lead_score'] >= 7])} leads ({len(df[df['lead_score'] >= 7])/len(df)*100:.1f}%)")
    
    # 2. Análise de Marketing Stack
    print("\n2️⃣ Stack de Marketing:")
    tem_gtm = df['tem_gtm'].sum()
    tem_pixel = df['tem_facebook_pixel'].sum()
    sem_stack = len(df[(~df['tem_gtm']) & (~df['tem_facebook_pixel'])])
    
    print(f"   Com GTM: {tem_gtm} ({tem_gtm/len(df)*100:.1f}%)")
    print(f"   Com Facebook Pixel: {tem_pixel} ({tem_pixel/len(df)*100:.1f}%)")
    print(f"   Sem stack: {sem_stack} ({sem_stack/len(df)*100:.1f}%) ⭐")
    
    # 3. Análise de Contato
    print("\n3️⃣ Canais de Contato:")
    com_whatsapp = df['whatsapp'].notna().sum()
    com_email = df['email_contato'].notna().sum()
    com_linkedin = df['linkedin'].notna().sum()
    
    print(f"   WhatsApp: {com_whatsapp} ({com_whatsapp/len(df)*100:.1f}%)")
    print(f"   E-mail: {com_email} ({com_email/len(df)*100:.1f}%)")
    print(f"   LinkedIn: {com_linkedin} ({com_linkedin/len(df)*100:.1f}%)")
    
    # 4. Segmentação por Score
    print("\n4️⃣ Segmentação:")
    leads_quentes = df[df['lead_score'] >= 7]
    leads_mornos = df[(df['lead_score'] >= 4) & (df['lead_score'] < 7)]
    leads_frios = df[df['lead_score'] < 4]
    
    print(f"   🔥 Quentes (7-10): {len(leads_quentes)} leads")
    print(f"   🌡️  Mornos (4-6): {len(leads_mornos)} leads")
    print(f"   ❄️  Frios (0-3): {len(leads_frios)} leads")
    
    # 5. Exportar segmentações
    if not leads_quentes.empty:
        leads_quentes.to_csv("leads_quentes.csv", index=False, encoding='utf-8-sig')
        print("\n✅ Arquivo 'leads_quentes.csv' criado")
    
    if not leads_mornos.empty:
        leads_mornos.to_csv("leads_mornos.csv", index=False, encoding='utf-8-sig')
        print("✅ Arquivo 'leads_mornos.csv' criado")


async def exemplo_filtros_customizados():
    """Exemplo 4: Filtros customizados"""
    print("\n" + "="*60)
    print("EXEMPLO 4: Filtros Customizados")
    print("="*60)
    
    pipeline = LeadExtractPipeline()
    df = await pipeline.run("Clínicas de Estética em São Paulo", max_resultados=20)
    
    if df.empty:
        print("❌ Nenhum lead encontrado")
        return
    
    # Filtro 1: Empresas sem marketing + WhatsApp
    filtro1 = df[
        (~df['tem_gtm']) & 
        (~df['tem_facebook_pixel']) & 
        (df['whatsapp'].notna())
    ]
    print(f"\n🎯 Filtro 1: Sem marketing + WhatsApp")
    print(f"   Resultado: {len(filtro1)} leads")
    if not filtro1.empty:
        filtro1.to_csv("filtro_sem_marketing_whatsapp.csv", index=False, encoding='utf-8-sig')
    
    # Filtro 2: Empresas com LinkedIn mas sem e-mail
    filtro2 = df[
        (df['linkedin'].notna()) & 
        (df['email_contato'].isna())
    ]
    print(f"\n🎯 Filtro 2: LinkedIn mas sem e-mail")
    print(f"   Resultado: {len(filtro2)} leads")
    
    # Filtro 3: Score alto + Dados da Receita
    filtro3 = df[
        (df['lead_score'] >= 7) & 
        (df['cnpj'].notna())
    ]
    print(f"\n🎯 Filtro 3: Score alto + Dados da Receita")
    print(f"   Resultado: {len(filtro3)} leads")


async def exemplo_exportacao_excel():
    """Exemplo 5: Exportação para Excel com formatação"""
    print("\n" + "="*60)
    print("EXEMPLO 5: Exportação Excel Formatada")
    print("="*60)
    
    pipeline = LeadExtractPipeline()
    df = await pipeline.run("Energia Solar em São Paulo", max_resultados=15)
    
    if df.empty:
        print("❌ Nenhum lead encontrado")
        return
    
    # Criar Excel com múltiplas abas
    with pd.ExcelWriter('leads_completo.xlsx', engine='openpyxl') as writer:
        # Aba 1: Todos os leads
        df.to_excel(writer, sheet_name='Todos', index=False)
        
        # Aba 2: Leads quentes
        leads_quentes = df[df['lead_score'] >= 7]
        if not leads_quentes.empty:
            leads_quentes.to_excel(writer, sheet_name='Quentes', index=False)
        
        # Aba 3: Sem marketing
        sem_marketing = df[(~df['tem_gtm']) & (~df['tem_facebook_pixel'])]
        if not sem_marketing.empty:
            sem_marketing.to_excel(writer, sheet_name='Sem Marketing', index=False)
        
        # Aba 4: Resumo
        resumo = pd.DataFrame({
            'Métrica': [
                'Total de Leads',
                'Leads Quentes (>=7)',
                'Leads com WhatsApp',
                'Leads sem Marketing',
                'Score Médio'
            ],
            'Valor': [
                len(df),
                len(df[df['lead_score'] >= 7]),
                df['whatsapp'].notna().sum(),
                len(df[(~df['tem_gtm']) & (~df['tem_facebook_pixel'])]),
                f"{df['lead_score'].mean():.2f}"
            ]
        })
        resumo.to_excel(writer, sheet_name='Resumo', index=False)
    
    print("✅ Arquivo 'leads_completo.xlsx' criado com múltiplas abas")


async def exemplo_modo_producao():
    """Exemplo 6: Modo produção com configuração conservadora"""
    print("\n" + "="*60)
    print("EXEMPLO 6: Modo Produção (Conservador)")
    print("="*60)
    
    # Usar configuração de produção
    config = get_config("production")
    
    print(f"⚙️  Configuração:")
    print(f"   Max concurrent: {config.max_concurrent_requests}")
    print(f"   Delay: {config.delay_between_requests}s")
    print(f"   Timeout: {config.timeout}s")
    print(f"   Max retries: {config.max_retries}")
    
    # TODO: Passar config para o pipeline
    # pipeline = LeadExtractPipeline(config=config)
    pipeline = LeadExtractPipeline()
    
    df = await pipeline.run("Consultorias em São Paulo", max_resultados=10)
    
    print(f"\n✅ Extraídos {len(df)} leads em modo produção")
    df.to_csv("leads_producao.csv", index=False, encoding='utf-8-sig')


async def main():
    """Menu de exemplos"""
    print("""
    ╔═══════════════════════════════════════════════════════════╗
    ║       LeadExtract Core - Exemplos de Uso Avançado        ║
    ╚═══════════════════════════════════════════════════════════╝
    
    Escolha um exemplo para executar:
    
    1. Uso Básico
    2. Múltiplos Nichos em Paralelo
    3. Análise Avançada de Dados
    4. Filtros Customizados
    5. Exportação Excel Formatada
    6. Modo Produção
    7. Executar Todos
    
    """)
    
    escolha = input("Digite o número do exemplo (1-7): ").strip()
    
    exemplos = {
        "1": exemplo_basico,
        "2": exemplo_multiplos_nichos,
        "3": exemplo_analise_avancada,
        "4": exemplo_filtros_customizados,
        "5": exemplo_exportacao_excel,
        "6": exemplo_modo_producao,
    }
    
    if escolha == "7":
        # Executar todos
        for func in exemplos.values():
            await func()
            await asyncio.sleep(2)
    elif escolha in exemplos:
        await exemplos[escolha]()
    else:
        print("❌ Opção inválida")


if __name__ == "__main__":
    asyncio.run(main())
