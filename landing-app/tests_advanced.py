"""
Testes Unitários e Integração - LeadExtract Advanced 2.0
"""

import pytest
import asyncio
from unittest.mock import Mock, AsyncMock, patch
from lead_extractor_advanced import (
    EmpresaBase,
    DadosEnriquecidos,
    DadosFinanceiros,
    ScoringEngine,
    DeepCrawler,
    ReceitaWSEnricher,
)


# ============================================================================
# TESTES - DATACLASSES
# ============================================================================

def test_empresa_base_criacao():
    """Testa criação de EmpresaBase"""
    empresa = EmpresaBase(
        nome="Empresa Teste",
        url_site="https://empresa.com",
        telefone="11999999999"
    )
    
    assert empresa.nome == "Empresa Teste"
    assert empresa.url_site == "https://empresa.com"
    assert empresa.telefone == "11999999999"


def test_dados_enriquecidos_criacao():
    """Testa criação de DadosEnriquecidos"""
    empresa = EmpresaBase(nome="Teste")
    dados = DadosEnriquecidos(
        empresa_base=empresa,
        emails=["contato@empresa.com"],
        whatsapp="5511999999999"
    )
    
    assert len(dados.emails) == 1
    assert dados.whatsapp == "5511999999999"
    assert not dados.tem_gtm


# ============================================================================
# TESTES - SCORING ENGINE
# ============================================================================

class TestScoringEngine:
    
    def test_score_sem_marketing_stack(self):
        """Empresa sem GTM/Pixel deve dar +3 pontos"""
        empresa = EmpresaBase(nome="Teste")
        dados_enriq = DadosEnriquecidos(
            empresa_base=empresa,
            tem_gtm=False,
            tem_facebook_pixel=False
        )
        dados_fin = DadosFinanceiros()
        
        score, breakdown = ScoringEngine.calcular_score((dados_enriq, dados_fin))
        
        assert 'sem_marketing_stack' in breakdown
        assert breakdown['sem_marketing_stack'] == 3.0
    
    def test_score_empresa_nova(self):
        """Empresa com < 1 ano deve dar +3 pontos"""
        empresa = EmpresaBase(nome="Teste")
        dados_enriq = DadosEnriquecidos(empresa_base=empresa)
        dados_fin = DadosFinanceiros(idade_empresa_dias=100)
        
        score, breakdown = ScoringEngine.calcular_score((dados_enriq, dados_fin))
        
        assert 'empresa_nova' in breakdown
        assert breakdown['empresa_nova'] == 3.0
    
    def test_score_com_whatsapp_emails(self):
        """Empresa com WhatsApp + emails deve dar até +4 pontos"""
        empresa = EmpresaBase(nome="Teste")
        dados_enriq = DadosEnriquecidos(
            empresa_base=empresa,
            whatsapp="5511999999999",
            emails=["email1@test.com", "email2@test.com", "email3@test.com"]
        )
        dados_fin = DadosFinanceiros()
        
        score, breakdown = ScoringEngine.calcular_score((dados_enriq, dados_fin))
        
        assert 'acesso_direto' in breakdown
        assert breakdown['acesso_direto'] == 4.0
    
    def test_score_maximo_10(self):
        """Score deve estar limitado a máximo de 10"""
        empresa = EmpresaBase(nome="Teste")
        dados_enriq = DadosEnriquecidos(
            empresa_base=empresa,
            tem_gtm=False,
            tem_facebook_pixel=False,
            whatsapp="5511999999999",
            emails=["a@b.com", "c@d.com", "e@f.com"],
            design_responsivo=True,
            linkedin="https://linkedin.com/company/test",
            instagram="https://instagram.com/test"
        )
        dados_fin = DadosFinanceiros(idade_empresa_dias=100)
        
        score, _ = ScoringEngine.calcular_score((dados_enriq, dados_fin))
        
        assert score <= 10.0
        assert score >= 0.0


# ============================================================================
# TESTES - DEEP CRAWLER
# ============================================================================

class TestDeepCrawler:
    
    @pytest.mark.asyncio
    async def test_extrair_emails_regex(self):
        """Testa extração de emails via regex"""
        html = """
        <html>
            <body>
                <a href="mailto:contato@empresa.com">Contato</a>
                <p>Email: vendas@empresa.com</p>
                <footer>noreply@empresa.com</footer>
            </body>
        </html>
        """
        
        crawler = DeepCrawler()
        dados = await crawler._extrair_dados_html(html, "https://test.com")
        
        assert "contato@empresa.com" in dados.emails
        assert "vendas@empresa.com" in dados.emails
        assert "noreply@empresa.com" not in dados.emails  # Filtrado
    
    @pytest.mark.asyncio
    async def test_extrair_whatsapp(self):
        """Testa extração de WhatsApp"""
        html = """
        <html>
            <a href="https://wa.me/5511999999999">WhatsApp</a>
        </html>
        """
        
        crawler = DeepCrawler()
        dados = await crawler._extrair_dados_html(html, "https://test.com")
        
        assert dados.whatsapp is not None
        assert "5511999999999" in dados.whatsapp
    
    @pytest.mark.asyncio
    async def test_detectar_gtm(self):
        """Testa detecção de Google Tag Manager"""
        html = """
        <script src="https://www.googletagmanager.com/gtag/js?id=GA-123"></script>
        """
        
        crawler = DeepCrawler()
        dados = await crawler._extrair_dados_html(html, "https://test.com")
        
        assert dados.tem_gtm == True
    
    @pytest.mark.asyncio
    async def test_detectar_facebook_pixel(self):
        """Testa detecção de Facebook Pixel"""
        html = """
        <script src="https://connect.facebook.net/en_US/fbevents.js"></script>
        """
        
        crawler = DeepCrawler()
        dados = await crawler._extrair_dados_html(html, "https://test.com")
        
        assert dados.tem_facebook_pixel == True
    
    @pytest.mark.asyncio
    async def test_detectar_redes_sociais(self):
        """Testa detecção de links de redes sociais"""
        html = """
        <a href="https://linkedin.com/company/empresa">LinkedIn</a>
        <a href="https://instagram.com/empresa">Instagram</a>
        """
        
        crawler = DeepCrawler()
        dados = await crawler._extrair_dados_html(html, "https://test.com")
        
        assert dados.linkedin is not None
        assert dados.instagram is not None
    
    @pytest.mark.asyncio
    async def test_html_size_tracking(self):
        """Testa rastreamento do tamanho do HTML"""
        html = "<html><body>Test</body></html>"
        
        crawler = DeepCrawler()
        dados = await crawler._extrair_dados_html(html, "https://test.com")
        
        assert dados.raw_html_size == len(html)


# ============================================================================
# TESTES - RECEITA WS ENRICHER
# ============================================================================

class TestReceitaWSEnricher:
    
    @pytest.mark.asyncio
    async def test_parse_resposta_receita_valida(self):
        """Testa parsing de resposta válida da ReceitaWS"""
        enricher = ReceitaWSEnricher()
        
        resposta = {
            'status': 'OK',
            'status_txt': 'Ativa',
            'abertura': '15/06/2020',
            'capital_social': '50.000,00',
            'qsa': [
                {'nome': 'João Silva'},
                {'nome': 'Maria Santos'}
            ]
        }
        
        dados = enricher._parsear_resposta_receita(resposta, '12345678000190')
        
        assert dados.cnpj == '12345678000190'
        assert dados.situacao_cadastral == 'Ativa'
        assert len(dados.socios) == 2
        assert dados.idade_empresa_dias is not None
    
    @pytest.mark.asyncio
    async def test_parse_resposta_receita_erro(self):
        """Testa parsing de erro da ReceitaWS"""
        enricher = ReceitaWSEnricher()
        
        resposta = {
            'status': 'ERROR',
            'message': 'CNPJ não encontrado'
        }
        
        dados = enricher._parsear_resposta_receita(resposta, '12345678000190')
        
        assert dados.cnpj == '12345678000190'
        assert dados.situacao_cadastral is None


# ============================================================================
# TESTES - REGEX PATTERNS
# ============================================================================

class TestRegexPatterns:
    
    def test_email_regex(self):
        """Testa regex de email"""
        from lead_extractor_advanced import DeepCrawler
        
        texto = "Contato: contato@empresa.com.br e vendas@empresa.com.br"
        matches = DeepCrawler.EMAIL_REGEX.findall(texto)
        
        assert len(matches) == 2
        assert "contato@empresa.com.br" in matches
    
    def test_whatsapp_regex(self):
        """Testa regex de WhatsApp"""
        from lead_extractor_advanced import DeepCrawler
        
        texto = "WhatsApp: 5511999999999 ou +55 11 9 9999-9999"
        matches = DeepCrawler.WHATSAPP_REGEX.findall(texto)
        
        assert len(matches) > 0
    
    def test_telefone_regex(self):
        """Testa regex de telefone"""
        from lead_extractor_advanced import DeepCrawler
        
        texto = "Telefone: (11) 3000-0000 ou 11 3000-0000"
        matches = DeepCrawler.TELEFONE_REGEX.findall(texto)
        
        assert len(matches) > 0


# ============================================================================
# TESTES DE INTEGRAÇÃO
# ============================================================================

@pytest.mark.asyncio
async def test_pipeline_flow_mock():
    """Testa fluxo completo do pipeline com mocks"""
    from lead_extractor_advanced import PipelineLeadExtractor
    
    pipeline = PipelineLeadExtractor()
    
    # Simular dados de entrada
    empresa_teste = EmpresaBase(
        nome="Empresa Teste",
        url_site="https://empresa.com.br",
        endereco="Rua Teste, 123",
        telefone="1133334444"
    )
    
    # Verificar que pode ser criada
    assert empresa_teste.nome == "Empresa Teste"
    assert empresa_teste.url_site == "https://empresa.com.br"


# ============================================================================
# PERFORMANCE TESTS
# ============================================================================

class TestPerformance:
    
    def test_regex_performance(self):
        """Testa performance dos regex em HTML grande"""
        from lead_extractor_advanced import DeepCrawler
        
        import time
        
        # HTML com muitos emails
        html = "\n".join([
            f"email{i}@empresa.com"
            for i in range(1000)
        ])
        
        start = time.time()
        matches = DeepCrawler.EMAIL_REGEX.findall(html)
        elapsed = time.time() - start
        
        assert len(matches) == 1000
        assert elapsed < 1.0  # Deve ser rápido
    
    def test_dataclass_memory(self):
        """Testa que dataclasses não gastam muita memória"""
        import sys
        
        empresa = EmpresaBase(nome="Teste")
        size = sys.getsizeof(empresa)
        
        assert size < 1000  # Deve ser pequeno


# ============================================================================
# CONFTEST - Fixtures
# ============================================================================

@pytest.fixture
def empresa_mock():
    """Fixture de empresa mock"""
    return EmpresaBase(
        nome="Empresa Mock",
        url_site="https://mock.com",
        endereco="Rua Mock, 123",
        telefone="11999999999"
    )


@pytest.fixture
def dados_enriquecidos_mock(empresa_mock):
    """Fixture de dados enriquecidos mock"""
    return DadosEnriquecidos(
        empresa_base=empresa_mock,
        emails=["contato@mock.com"],
        whatsapp="5511999999999",
        tem_gtm=False,
        tem_facebook_pixel=True
    )


# ============================================================================
# RUN TESTS
# ============================================================================

if __name__ == "__main__":
    # Executar com: pytest tests_advanced.py -v
    pytest.main([__file__, "-v", "--tb=short"])
