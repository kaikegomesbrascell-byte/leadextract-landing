"""
Exemplos de nichos B2B brasileiros para LeadExtract
Lista curada de termos de busca com alto potencial
"""

# Nichos de Alta Conversão (Ticket Alto)
NICHOS_PREMIUM = [
    # Energia e Sustentabilidade
    "Energia Solar em São Paulo",
    "Energia Solar em Rio de Janeiro",
    "Energia Solar em Belo Horizonte",
    "Energia Solar em Curitiba",
    "Energia Solar em Porto Alegre",
    
    # Saúde e Estética
    "Clínicas de Estética em São Paulo",
    "Clínicas de Estética em Rio de Janeiro",
    "Clínicas Odontológicas em São Paulo",
    "Clínicas de Fisioterapia em São Paulo",
    "Laboratórios de Análises Clínicas em São Paulo",
    
    # Construção e Engenharia
    "Construtoras em São Paulo",
    "Engenharia Civil em São Paulo",
    "Arquitetura em São Paulo",
    "Incorporadoras em São Paulo",
    
    # Tecnologia
    "Empresas de TI em São Paulo",
    "Desenvolvimento de Software em São Paulo",
    "Agências Digitais em São Paulo",
    "Consultorias de TI em São Paulo",
]

# Nichos de Serviços Profissionais
NICHOS_SERVICOS = [
    # Consultorias
    "Consultorias Empresariais em São Paulo",
    "Consultorias de RH em São Paulo",
    "Consultorias Financeiras em São Paulo",
    "Consultorias de Marketing em São Paulo",
    
    # Contabilidade e Jurídico
    "Escritórios de Contabilidade em São Paulo",
    "Escritórios de Advocacia em São Paulo",
    
    # Marketing e Comunicação
    "Agências de Marketing em São Paulo",
    "Agências de Publicidade em São Paulo",
    "Produtoras de Vídeo em São Paulo",
]

# Nichos de Varejo e Comércio
NICHOS_COMERCIO = [
    # Alimentação
    "Restaurantes em São Paulo",
    "Cafeterias em São Paulo",
    "Padarias em São Paulo",
    
    # Moda e Beleza
    "Salões de Beleza em São Paulo",
    "Barbearias em São Paulo",
    "Lojas de Roupas em São Paulo",
    
    # Fitness
    "Academias em São Paulo",
    "Estúdios de Pilates em São Paulo",
    "Personal Trainers em São Paulo",
]

# Nichos de Educação
NICHOS_EDUCACAO = [
    "Escolas de Idiomas em São Paulo",
    "Cursos Profissionalizantes em São Paulo",
    "Escolas de Música em São Paulo",
    "Escolas de Dança em São Paulo",
]

# Nichos de Indústria
NICHOS_INDUSTRIA = [
    "Indústrias Metalúrgicas em São Paulo",
    "Indústrias Alimentícias em São Paulo",
    "Indústrias Químicas em São Paulo",
    "Indústrias Têxteis em São Paulo",
]


def get_nichos_por_categoria(categoria: str) -> list:
    """
    Retorna lista de nichos por categoria
    
    Args:
        categoria: 'premium', 'servicos', 'comercio', 'educacao', 'industria'
    
    Returns:
        Lista de termos de busca
    """
    categorias = {
        'premium': NICHOS_PREMIUM,
        'servicos': NICHOS_SERVICOS,
        'comercio': NICHOS_COMERCIO,
        'educacao': NICHOS_EDUCACAO,
        'industria': NICHOS_INDUSTRIA
    }
    
    return categorias.get(categoria, [])


def get_nichos_por_cidade(cidade: str) -> list:
    """
    Gera lista de nichos para uma cidade específica
    
    Args:
        cidade: Nome da cidade (ex: 'Brasília')
    
    Returns:
        Lista de termos de busca
    """
    nichos_base = [
        "Energia Solar",
        "Clínicas de Estética",
        "Consultorias Empresariais",
        "Agências de Marketing",
        "Escritórios de Contabilidade",
        "Academias",
        "Restaurantes",
        "Salões de Beleza"
    ]
    
    return [f"{nicho} em {cidade}" for nicho in nichos_base]


def get_top_10_nichos() -> list:
    """
    Retorna os 10 nichos com maior potencial de conversão
    
    Returns:
        Lista dos 10 melhores nichos
    """
    return [
        "Energia Solar em São Paulo",
        "Clínicas de Estética em São Paulo",
        "Consultorias Empresariais em São Paulo",
        "Agências de Marketing em São Paulo",
        "Construtoras em São Paulo",
        "Empresas de TI em São Paulo",
        "Escritórios de Contabilidade em São Paulo",
        "Clínicas Odontológicas em São Paulo",
        "Academias em São Paulo",
        "Restaurantes em São Paulo"
    ]


# Exemplo de uso
if __name__ == "__main__":
    print("="*60)
    print("NICHOS B2B BRASILEIROS - LeadExtract Core")
    print("="*60)
    
    print("\n🔥 TOP 10 NICHOS (Maior Potencial):")
    for i, nicho in enumerate(get_top_10_nichos(), 1):
        print(f"   {i}. {nicho}")
    
    print("\n💎 NICHOS PREMIUM (Ticket Alto):")
    print(f"   Total: {len(NICHOS_PREMIUM)} nichos")
    for nicho in NICHOS_PREMIUM[:5]:
        print(f"   • {nicho}")
    print("   ...")
    
    print("\n🏢 NICHOS DE SERVIÇOS:")
    print(f"   Total: {len(NICHOS_SERVICOS)} nichos")
    for nicho in NICHOS_SERVICOS[:5]:
        print(f"   • {nicho}")
    print("   ...")
    
    print("\n🌆 EXEMPLO: Nichos para Brasília:")
    for nicho in get_nichos_por_cidade("Brasília")[:5]:
        print(f"   • {nicho}")
    print("   ...")
    
    print("\n" + "="*60)
    print("💡 DICA: Use esses nichos no lead_extractor_core.py")
    print("="*60)
