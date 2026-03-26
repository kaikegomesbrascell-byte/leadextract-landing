#!/usr/bin/env python3
"""
Script de Diagnóstico: Teste de Timeout do Google Maps
Valida se o novo timeout de 90s é suficiente
"""

import asyncio
import logging
from pathlib import Path
from playwright.async_api import async_playwright
from datetime import datetime

# Configurar logging
log_dir = Path.home() / "Downloads"
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_dir / "test_maps_timeout.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("MapsDiagnostic")

async def test_maps_loading():
    """Testa carregamento do Google Maps com diferentes estratégias"""
    
    logger.info("=" * 60)
    logger.info("TESTE DE TIMEOUT - GOOGLE MAPS")
    logger.info("=" * 60)
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()
        
        # Injetar user-agent realista
        await page.set_extra_http_headers({
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        })
        
        test_cases = [
            {
                "nome": "Teste 1: domcontentloaded (90s)",
                "url": "https://www.google.com/maps/search/Consultoria+de+Marketing+em+São+Paulo",
                "wait_until": "domcontentloaded",
                "timeout": 90000
            },
            {
                "nome": "Teste 2: load (60s)",
                "url": "https://www.google.com/maps/search/Energia+Solar+em+Rio+de+Janeiro",
                "wait_until": "load",
                "timeout": 60000
            },
            {
                "nome": "Teste 3: networkidle (120s)",
                "url": "https://www.google.com/maps/search/Escritório+de+Advocacia+em+Belo+Horizonte",
                "wait_until": "networkidle",
                "timeout": 120000
            }
        ]
        
        for test in test_cases:
            logger.info(f"\n{test['nome']}")
            logger.info(f"URL: {test['url']}")
            logger.info(f"Estratégia: {test['wait_until']} | Timeout: {test['timeout']}ms")
            
            inicio = datetime.now()
            try:
                await page.goto(
                    test['url'],
                    wait_until=test['wait_until'],
                    timeout=test['timeout']
                )
                tempo_decorrido = (datetime.now() - inicio).total_seconds()
                
                # Verificar se página carregou
                title = await page.title()
                logger.info(f"[OK] SUCESSO em {tempo_decorrido:.2f}s | Titulo: {title[:50]}")
                
                # Contar resultados
                try:
                    count = await page.evaluate("""
                        () => document.querySelectorAll('div[data-item-id]').length
                    """)
                    logger.info(f"  >> {count} resultados encontrados")
                except:
                    logger.info(f"  >> Nao foi possivel contar resultados")
                    
            except Exception as e:
                tempo_decorrido = (datetime.now() - inicio).total_seconds()
                logger.error(f"[ERRO] FALHOU em {tempo_decorrido:.2f}s | Erro: {str(e)[:100]}")
            
            # Esperar entre testes
            await asyncio.sleep(5)
        
        await browser.close()
    
    logger.info("\n" + "=" * 60)
    logger.info("TESTE CONCLUÍDO")
    logger.info(f"Log salvo em: {log_dir / 'test_maps_timeout.log'}")
    logger.info("=" * 60)

if __name__ == "__main__":
    asyncio.run(test_maps_loading())
