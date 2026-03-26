"""
Exemplo de Integração dos Módulos de Inteligência com a GUI do LeadExtract
Este arquivo mostra como adicionar as colunas de inteligência na tabela da GUI
"""

from intelligence_modules import scan_lead
import time


def adicionar_intelligence_ao_lead(lead_dict: dict) -> dict:
    """
    Adiciona dados de inteligência a um lead existente
    
    Args:
        lead_dict: Dicionário com dados básicos do lead (nome, website, etc)
        
    Returns:
        Dicionário enriquecido com dados de inteligência
    """
    try:
        # Executar scan de inteligência
        intelligence = scan_lead(
            nome_empresa=lead_dict.get('nome', ''),
            url=lead_dict.get('website', '')
        )
        
        # Adicionar campos de inteligência ao lead
        lead_dict['score_oportunidade'] = intelligence['score_geral']
        lead_dict['tech_score'] = intelligence['tech_score']
        lead_dict['tom_voz'] = intelligence['tom_voz']
        lead_dict['noticia_expansao'] = intelligence['expansao_noticia'][:100]  # Limitar tamanho
        lead_dict['diagnostico'] = intelligence['tech_diagnostico'][:150]
        
        # Classificar prioridade baseado no score
        if intelligence['score_geral'] >= 7:
            lead_dict['prioridade'] = '🔥 QUENTE'
        elif intelligence['score_geral'] >= 4:
            lead_dict['prioridade'] = '⚡ MORNO'
        else:
            lead_dict['prioridade'] = '❄️ FRIO'
        
        return lead_dict
        
    except Exception as e:
        print(f"Erro ao adicionar inteligência: {e}")
        # Retornar lead sem inteligência em caso de erro
        lead_dict['score_oportunidade'] = 0
        lead_dict['prioridade'] = '❓ N/A'
        return lead_dict


# ============================================================================
# EXEMPLO DE INTEGRAÇÃO COM GUI_MANAGER.PY
# ============================================================================

"""
No arquivo gui_manager.py, você pode adicionar as novas colunas assim:

1. Adicionar colunas na definição da tabela:

# ANTES:
self.colunas = ["Nome", "Telefone", "Website", "Endereço", "Avaliação", "Total Avaliações"]

# DEPOIS:
self.colunas = [
    "Nome", 
    "Telefone", 
    "Website", 
    "Endereço", 
    "Avaliação", 
    "Total Avaliações",
    "Score", 
    "Prioridade", 
    "Tom de Voz",
    "Diagnóstico"
]

2. Modificar a função que adiciona leads à tabela:

def adicionar_lead_na_tabela(self, lead):
    # Adicionar inteligência ao lead
    from integracao_gui_intelligence import adicionar_intelligence_ao_lead
    lead_enriquecido = adicionar_intelligence_ao_lead(lead)
    
    # Inserir na tabela
    self.tree.insert("", "end", values=(
        lead_enriquecido.get('nome', ''),
        lead_enriquecido.get('telefone', ''),
        lead_enriquecido.get('website', ''),
        lead_enriquecido.get('endereco', ''),
        lead_enriquecido.get('rating', ''),
        lead_enriquecido.get('total_reviews', ''),
        lead_enriquecido.get('score_oportunidade', 0),
        lead_enriquecido.get('prioridade', ''),
        lead_enriquecido.get('tom_voz', ''),
        lead_enriquecido.get('diagnostico', '')
    ))

3. Adicionar botão para ordenar por score:

def ordenar_por_score(self):
    # Obter todos os itens
    items = [(self.tree.set(item, "Score"), item) for item in self.tree.get_children('')]
    
    # Ordenar por score (decrescente)
    items.sort(reverse=True)
    
    # Reorganizar
    for index, (val, item) in enumerate(items):
        self.tree.move(item, '', index)
"""


# ============================================================================
# EXEMPLO DE INTEGRAÇÃO COM AUTOMATION_ENGINE.PY
# ============================================================================

"""
No arquivo automation_engine.py, você pode integrar assim:

def extrair_leads_com_intelligence(self, termo_busca, quantidade=10):
    leads = []
    
    # Buscar estabelecimentos no Google Maps (código existente)
    estabelecimentos = self.buscar_no_google_maps(termo_busca, quantidade)
    
    for estabelecimento in estabelecimentos:
        # Extrair dados básicos (código existente)
        lead_basico = self.extrair_dados_basicos(estabelecimento)
        
        # Adicionar inteligência avançada
        lead_completo = adicionar_intelligence_ao_lead(lead_basico)
        
        leads.append(lead_completo)
        
        # Delay para não sobrecarregar
        time.sleep(2)
    
    return leads
"""


# ============================================================================
# EXEMPLO DE FILTROS INTELIGENTES
# ============================================================================

def filtrar_leads_quentes(leads: list) -> list:
    """
    Filtra apenas leads com alto score de oportunidade
    
    Args:
        leads: Lista de leads com dados de inteligência
        
    Returns:
        Lista filtrada de leads quentes (score >= 7)
    """
    return [lead for lead in leads if lead.get('score_oportunidade', 0) >= 7]


def ordenar_por_prioridade(leads: list) -> list:
    """
    Ordena leads por score de oportunidade (maior primeiro)
    
    Args:
        leads: Lista de leads com dados de inteligência
        
    Returns:
        Lista ordenada por score
    """
    return sorted(leads, key=lambda x: x.get('score_oportunidade', 0), reverse=True)


def gerar_relatorio_intelligence(leads: list) -> dict:
    """
    Gera relatório estatístico dos leads analisados
    
    Args:
        leads: Lista de leads com dados de inteligência
        
    Returns:
        Dicionário com estatísticas
    """
    total = len(leads)
    
    if total == 0:
        return {
            'total': 0,
            'quentes': 0,
            'mornos': 0,
            'frios': 0,
            'score_medio': 0
        }
    
    quentes = len([l for l in leads if l.get('score_oportunidade', 0) >= 7])
    mornos = len([l for l in leads if 4 <= l.get('score_oportunidade', 0) < 7])
    frios = len([l for l in leads if l.get('score_oportunidade', 0) < 4])
    
    scores = [l.get('score_oportunidade', 0) for l in leads]
    score_medio = sum(scores) / len(scores) if scores else 0
    
    return {
        'total': total,
        'quentes': quentes,
        'mornos': mornos,
        'frios': frios,
        'score_medio': round(score_medio, 1),
        'percentual_quentes': round((quentes / total) * 100, 1) if total > 0 else 0
    }


# ============================================================================
# EXEMPLO DE EXPORTAÇÃO ENRIQUECIDA
# ============================================================================

def exportar_com_intelligence(leads: list, filename: str):
    """
    Exporta leads com dados de inteligência para CSV
    
    Args:
        leads: Lista de leads enriquecidos
        filename: Nome do arquivo de saída
    """
    import csv
    
    # Definir colunas
    colunas = [
        'nome', 'telefone', 'website', 'endereco', 'rating', 'total_reviews',
        'score_oportunidade', 'prioridade', 'tech_score', 'tom_voz',
        'noticia_expansao', 'diagnostico'
    ]
    
    # Escrever CSV
    with open(filename, 'w', newline='', encoding='utf-8-sig') as f:
        writer = csv.DictWriter(f, fieldnames=colunas)
        writer.writeheader()
        
        for lead in leads:
            # Garantir que todas as colunas existem
            row = {col: lead.get(col, '') for col in colunas}
            writer.writerow(row)
    
    print(f"✅ Arquivo exportado: {filename}")


# ============================================================================
# EXEMPLO DE USO COMPLETO
# ============================================================================

if __name__ == "__main__":
    # Simular lead básico
    lead_exemplo = {
        'nome': 'Natura Cosméticos',
        'telefone': '(11) 1234-5678',
        'website': 'https://www.natura.com.br',
        'endereco': 'São Paulo, SP',
        'rating': '4.5',
        'total_reviews': '1250'
    }
    
    print("🔄 Adicionando inteligência ao lead...")
    lead_enriquecido = adicionar_intelligence_ao_lead(lead_exemplo)
    
    print("\n📊 LEAD ENRIQUECIDO:")
    print("="*80)
    for key, value in lead_enriquecido.items():
        print(f"{key:20s}: {value}")
    print("="*80)
    
    # Exemplo de lista de leads
    leads = [lead_enriquecido]
    
    # Gerar relatório
    relatorio = gerar_relatorio_intelligence(leads)
    print("\n📈 RELATÓRIO:")
    print(f"Total de leads: {relatorio['total']}")
    print(f"Leads quentes: {relatorio['quentes']} ({relatorio['percentual_quentes']}%)")
    print(f"Score médio: {relatorio['score_medio']}/10")
    
    # Exportar
    exportar_com_intelligence(leads, 'leads_intelligence_exemplo.csv')
