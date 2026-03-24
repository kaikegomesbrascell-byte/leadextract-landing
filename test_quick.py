"""
Teste rápido do LeadExtract Core
Versão simplificada para validação
"""

import asyncio
from lead_extractor_core import Lead, DeepCrawler, LeadScorer


async def test_crawler():
    """Testa o Deep Crawler"""
    print("\n" + "="*60)
    print("TESTE: Deep Crawler")
    print("="*60)
    
    # Criar lead de teste
    lead = Lead(
        nome_empresa="Empresa Teste",
        url_site="https://example.com"
    )
    
    crawler = DeepCrawler()
    lead_enriquecido = await crawler.crawl_website(lead)
    
    print(f"\n✅ Lead processado:")
    print(f"   Nome: {lead_enriquecido.nome_empresa}")
    print(f"   URL: {lead_enriquecido.url_site}")
    print(f"   LinkedIn: {lead_enriquecido.linkedin}")
    print(f"   Instagram: {lead_enriquecido.instagram}")
    print(f"   Email: {lead_enriquecido.email_contato}")
    print(f"   WhatsApp: {lead_enriquecido.whatsapp}")
    print(f"   GTM: {lead_enriquecido.tem_gtm}")
    print(f"   FB Pixel: {lead_enriquecido.tem_facebook_pixel}")


def test_scorer():
    """Testa o Motor de Scoring"""
    print("\n" + "="*60)
    print("TESTE: Motor de Scoring")
    print("="*60)
    
    scorer = LeadScorer()
    
    # Teste 1: Lead sem marketing + WhatsApp
    lead1 = Lead(
        nome_empresa="Lead 1",
        tem_gtm=False,
        tem_facebook_pixel=False,
        whatsapp="5511999999999"
    )
    score1 = scorer.calculate_score(lead1)
    print(f"\n✅ Lead 1 (sem marketing + WhatsApp): Score = {score1}/10")
    
    # Teste 2: Lead com tudo
    lead2 = Lead(
        nome_empresa="Lead 2",
        tem_gtm=True,
        tem_facebook_pixel=True,
        email_contato="contato@empresa.com"
    )
    score2 = scorer.calculate_score(lead2)
    print(f"✅ Lead 2 (com marketing + email): Score = {score2}/10")
    
    # Teste 3: Lead ideal
    lead3 = Lead(
        nome_empresa="Lead 3",
        tem_gtm=False,
        tem_facebook_pixel=False,
        whatsapp="5511999999999",
        data_abertura="01/01/2026"  # Empresa nova
    )
    score3 = scorer.calculate_score(lead3)
    print(f"✅ Lead 3 (ideal: sem marketing + WhatsApp + nova): Score = {score3}/10")


async def main():
    """Executa testes"""
    print("""
    ╔═══════════════════════════════════════════════════════════╗
    ║         LeadExtract Core - Teste Rápido                  ║
    ╚═══════════════════════════════════════════════════════════╝
    """)
    
    # Teste 1: Scorer (síncrono)
    test_scorer()
    
    # Teste 2: Crawler (assíncrono)
    await test_crawler()
    
    print("\n" + "="*60)
    print("✅ TESTES CONCLUÍDOS")
    print("="*60)
    print("\nPara executar o pipeline completo:")
    print("  python lead_extractor_core.py")


if __name__ == "__main__":
    asyncio.run(main())
