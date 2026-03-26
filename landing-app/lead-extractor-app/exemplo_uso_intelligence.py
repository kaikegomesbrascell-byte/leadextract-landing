"""
Exemplo de Integração dos Módulos de Inteligência com LeadExtract
"""

import pandas as pd
from intelligence_modules import scan_lead
import time

def processar_leads_com_intelligence(leads_csv: str, output_csv: str):
    """
    Processa uma lista de leads e adiciona inteligência avançada
    
    Args:
        leads_csv: Caminho para CSV com leads (deve ter colunas 'nome' e 'website')
        output_csv: Caminho para salvar CSV enriquecido
    """
    # Carregar leads
    df = pd.read_csv(leads_csv)
    
    # Verificar colunas necessárias
    if 'nome' not in df.columns or 'website' not in df.columns:
        raise ValueError("CSV deve conter colunas 'nome' e 'website'")
    
    # Lista para armazenar resultados
    resultados = []
    
    # Processar cada lead
    total = len(df)
    for idx, row in df.iterrows():
        print(f"\nProcessando {idx+1}/{total}: {row['nome']}")
        
        try:
            # Executar scan completo
            relatorio = scan_lead(
                nome_empresa=row['nome'],
                url=row['website']
            )
            
            resultados.append(relatorio)
            
            # Delay para não sobrecarregar
            time.sleep(2)
            
        except Exception as e:
            print(f"Erro ao processar {row['nome']}: {e}")
            # Adicionar resultado vazio em caso de erro
            resultados.append({
                'empresa': row['nome'],
                'url': row['website'],
                'score_geral': 0,
                'tech_diagnostico': 'Erro na análise'
            })
    
    # Converter para DataFrame
    df_enriquecido = pd.DataFrame(resultados)
    
    # Salvar resultado
    df_enriquecido.to_csv(output_csv, index=False, encoding='utf-8-sig')
    print(f"\n✅ Análise completa! Arquivo salvo em: {output_csv}")
    
    # Estatísticas
    print("\n📊 ESTATÍSTICAS:")
    print(f"   Total de leads: {len(df_enriquecido)}")
    print(f"   Score médio: {df_enriquecido['score_geral'].mean():.1f}/10")
    print(f"   Leads quentes (score >= 7): {len(df_enriquecido[df_enriquecido['score_geral'] >= 7])}")
    
    return df_enriquecido


def exemplo_lead_unico():
    """Exemplo de análise de um único lead"""
    
    print("🚀 EXEMPLO: Análise de Lead Único\n")
    
    # Analisar uma empresa
    resultado = scan_lead(
        nome_empresa="Natura",
        url="https://www.natura.com.br"
    )
    
    # Exibir resultado formatado
    print("="*80)
    print(f"EMPRESA: {resultado['empresa']}")
    print("="*80)
    
    print(f"\n🎯 SCORE DE OPORTUNIDADE: {resultado['score_geral']}/10")
    
    if resultado['score_geral'] >= 7:
        print("   ✅ LEAD QUENTE - Alta prioridade!")
    elif resultado['score_geral'] >= 4:
        print("   ⚡ LEAD MORNO - Bom potencial")
    else:
        print("   ❄️ LEAD FRIO - Baixa prioridade")
    
    print(f"\n📰 NOTÍCIAS DE EXPANSÃO:")
    print(f"   {resultado['expansao_noticia']}")
    if resultado['expansao_link']:
        print(f"   🔗 {resultado['expansao_link']}")
    
    print(f"\n🔍 ANÁLISE TECNOLÓGICA:")
    print(f"   Score: {resultado['tech_score']}/10")
    print(f"   {resultado['tech_diagnostico']}")
    print(f"   Nível: {resultado['tech_maturidade']}")
    
    print(f"\n💬 PERSONALIDADE DA MARCA:")
    print(f"   Tom: {resultado['tom_voz']}")
    print(f"   {resultado['tom_insights']}")
    
    print("\n" + "="*80)
    
    # Sugestão de abordagem
    print("\n💡 SUGESTÃO DE ABORDAGEM:")
    if resultado['tech_score'] >= 7:
        print("   'Olá! Notei que seu site ainda não utiliza ferramentas como")
        print("   Facebook Pixel e Google Tag Manager. Posso mostrar como isso")
        print("   pode aumentar suas conversões em até 40%?'")
    
    if resultado['expansao_relevancia'] == 'alta':
        print(f"\n   'Vi que vocês estão {resultado['expansao_noticia'].lower()}.")
        print("   Esse é o momento ideal para otimizar sua geração de leads!'")


def exemplo_csv_batch():
    """Exemplo de processamento em lote"""
    
    print("🚀 EXEMPLO: Processamento em Lote\n")
    
    # Criar CSV de exemplo
    leads_exemplo = pd.DataFrame({
        'nome': ['Natura', 'Magazine Luiza', 'Nubank'],
        'website': [
            'https://www.natura.com.br',
            'https://www.magazineluiza.com.br',
            'https://www.nubank.com.br'
        ],
        'telefone': ['(11) 1234-5678', '(11) 8765-4321', '(11) 5555-5555'],
        'cidade': ['São Paulo', 'São Paulo', 'São Paulo']
    })
    
    # Salvar CSV de exemplo
    leads_exemplo.to_csv('leads_exemplo.csv', index=False)
    print("✅ Arquivo 'leads_exemplo.csv' criado")
    
    # Processar com inteligência
    print("\n🔄 Processando leads com inteligência avançada...")
    df_enriquecido = processar_leads_com_intelligence(
        'leads_exemplo.csv',
        'leads_enriquecidos.csv'
    )
    
    # Exibir primeiras linhas
    print("\n📋 PREVIEW DOS DADOS ENRIQUECIDOS:")
    print(df_enriquecido[['empresa', 'score_geral', 'tech_score', 'tom_voz']].head())


if __name__ == "__main__":
    print("""
    ╔══════════════════════════════════════════════════════════════╗
    ║         LEADEXTRACT - MÓDULOS DE INTELIGÊNCIA AVANÇADA       ║
    ║                                                              ║
    ║  Escolha uma opção:                                          ║
    ║  1 - Analisar lead único (exemplo)                           ║
    ║  2 - Processar CSV em lote (exemplo)                         ║
    ║  3 - Sair                                                    ║
    ╚══════════════════════════════════════════════════════════════╝
    """)
    
    opcao = input("Digite sua opção: ").strip()
    
    if opcao == "1":
        exemplo_lead_unico()
    elif opcao == "2":
        exemplo_csv_batch()
    else:
        print("Saindo...")
