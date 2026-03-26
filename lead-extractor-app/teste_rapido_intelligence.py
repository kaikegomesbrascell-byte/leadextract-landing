"""
Teste Rápido dos Módulos de Inteligência
Execute este arquivo para validar se tudo está funcionando
"""

import sys
from intelligence_modules import RadarExpansao, RaioXTecnologia, IdentificadorTomVoz, scan_lead

def teste_modulo_a():
    """Testa Radar de Expansão"""
    print("\n" + "="*80)
    print("🧪 TESTE MÓDULO A: RADAR DE EXPANSÃO")
    print("="*80)
    
    radar = RadarExpansao()
    
    try:
        resultado = radar.buscar_noticias("Magazine Luiza")
        
        print(f"✅ Status: {resultado['status']}")
        print(f"📰 Notícia: {resultado['titulo'][:100]}...")
        print(f"🔗 Link: {resultado['link'][:80]}..." if resultado['link'] else "🔗 Link: N/A")
        print(f"⭐ Relevância: {resultado['relevancia']}")
        
        return True
    except Exception as e:
        print(f"❌ ERRO: {e}")
        return False


def teste_modulo_b():
    """Testa Raio-X Tecnologia"""
    print("\n" + "="*80)
    print("🧪 TESTE MÓDULO B: RAIO-X TECNOLOGIA")
    print("="*80)
    
    raio_x = RaioXTecnologia()
    
    try:
        resultado = raio_x.analisar_site("https://www.magazineluiza.com.br")
        
        print(f"✅ Status: {resultado['status']}")
        print(f"🎯 Score: {resultado['score_oportunidade']}/10")
        print(f"📊 Diagnóstico: {resultado['diagnostico']}")
        print(f"📈 Maturidade: {resultado['nivel_maturidade']}")
        
        if 'tecnologias' in resultado:
            print("\n🔍 Tecnologias Detectadas:")
            for tech, presente in resultado['tecnologias'].items():
                emoji = "✅" if presente else "❌"
                print(f"   {emoji} {tech}: {presente}")
        
        return True
    except Exception as e:
        print(f"❌ ERRO: {e}")
        return False


def teste_modulo_c():
    """Testa Identificador de Tom de Voz"""
    print("\n" + "="*80)
    print("🧪 TESTE MÓDULO C: TOM DE VOZ")
    print("="*80)
    
    tom_voz = IdentificadorTomVoz()
    
    try:
        resultado = tom_voz.analisar_tom("https://www.magazineluiza.com.br")
        
        print(f"✅ Status: {resultado['status']}")
        print(f"💬 Tom: {resultado['tom_voz']}")
        print(f"📊 Confiança: {resultado['confianca']}")
        print(f"📝 Meta Description: {resultado['meta_description'][:100]}...")
        print(f"💡 Insights: {resultado['insights']}")
        
        if resultado['h1_tags']:
            print(f"\n📌 H1s Encontrados:")
            for h1 in resultado['h1_tags'][:3]:
                print(f"   • {h1}")
        
        return True
    except Exception as e:
        print(f"❌ ERRO: {e}")
        return False


def teste_scan_completo():
    """Testa função principal scan_lead"""
    print("\n" + "="*80)
    print("🧪 TESTE COMPLETO: SCAN_LEAD")
    print("="*80)
    
    try:
        resultado = scan_lead(
            nome_empresa="Magazine Luiza",
            url="https://www.magazineluiza.com.br"
        )
        
        print(f"\n🏢 Empresa: {resultado['empresa']}")
        print(f"🌐 URL: {resultado['url']}")
        print(f"📅 Timestamp: {resultado['timestamp']}")
        
        print(f"\n🎯 SCORE GERAL: {resultado['score_geral']}/10")
        
        if resultado['score_geral'] >= 7:
            print("   🔥 LEAD QUENTE - Alta prioridade!")
        elif resultado['score_geral'] >= 4:
            print("   ⚡ LEAD MORNO - Bom potencial")
        else:
            print("   ❄️ LEAD FRIO - Baixa prioridade")
        
        print(f"\n📰 Expansão:")
        print(f"   Status: {resultado['expansao_status']}")
        print(f"   Notícia: {resultado['expansao_noticia'][:80]}...")
        
        print(f"\n🔍 Tecnologia:")
        print(f"   Score: {resultado['tech_score']}/10")
        print(f"   Diagnóstico: {resultado['tech_diagnostico']}")
        
        print(f"\n💬 Tom de Voz:")
        print(f"   Classificação: {resultado['tom_voz']}")
        print(f"   Insights: {resultado['tom_insights'][:80]}...")
        
        return True
    except Exception as e:
        print(f"❌ ERRO: {e}")
        import traceback
        traceback.print_exc()
        return False


def verificar_dependencias():
    """Verifica se todas as dependências estão instaladas"""
    print("\n" + "="*80)
    print("🔍 VERIFICANDO DEPENDÊNCIAS")
    print("="*80)
    
    dependencias = {
        'requests': 'requests',
        'bs4': 'beautifulsoup4',
        'lxml': 'lxml'
    }
    
    todas_ok = True
    
    for modulo, nome_pacote in dependencias.items():
        try:
            __import__(modulo)
            print(f"✅ {nome_pacote}: Instalado")
        except ImportError:
            print(f"❌ {nome_pacote}: NÃO instalado")
            print(f"   Instale com: pip install {nome_pacote}")
            todas_ok = False
    
    return todas_ok


def main():
    """Executa todos os testes"""
    print("""
    ╔══════════════════════════════════════════════════════════════╗
    ║     TESTE RÁPIDO - MÓDULOS DE INTELIGÊNCIA LEADEXTRACT       ║
    ╚══════════════════════════════════════════════════════════════╝
    """)
    
    # Verificar dependências
    if not verificar_dependencias():
        print("\n❌ Instale as dependências primeiro:")
        print("   pip install -r requirements_intelligence.txt")
        sys.exit(1)
    
    # Executar testes
    resultados = {
        'Módulo A (Radar Expansão)': teste_modulo_a(),
        'Módulo B (Raio-X Tech)': teste_modulo_b(),
        'Módulo C (Tom de Voz)': teste_modulo_c(),
        'Scan Completo': teste_scan_completo()
    }
    
    # Resumo
    print("\n" + "="*80)
    print("📊 RESUMO DOS TESTES")
    print("="*80)
    
    total = len(resultados)
    sucesso = sum(resultados.values())
    
    for teste, passou in resultados.items():
        emoji = "✅" if passou else "❌"
        print(f"{emoji} {teste}")
    
    print(f"\n🎯 Resultado: {sucesso}/{total} testes passaram")
    
    if sucesso == total:
        print("\n🎉 PARABÉNS! Todos os módulos estão funcionando!")
        print("\n📚 Próximos passos:")
        print("   1. Leia MODULOS_INTELLIGENCE_README.md")
        print("   2. Veja exemplos em exemplo_uso_intelligence.py")
        print("   3. Siga GUIA_IMPLEMENTACAO_INTELLIGENCE.md")
    else:
        print("\n⚠️ Alguns testes falharam. Verifique os erros acima.")
        print("\n💡 Dicas:")
        print("   - Verifique sua conexão com internet")
        print("   - Alguns sites podem bloquear requisições")
        print("   - Tente com outras URLs")
    
    print("\n" + "="*80)


if __name__ == "__main__":
    main()
