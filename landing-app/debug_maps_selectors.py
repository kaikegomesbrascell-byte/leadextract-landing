#!/usr/bin/env python3
"""
Script de Debug: Inspecionar seletores CSS do Google Maps
Descobre quais seletores funcionam na pagina atual
"""

import asyncio
import logging
from pathlib import Path
from playwright.async_api import async_playwright

# Configurar logging
log_dir = Path.home() / "Downloads"
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(message)s',
    handlers=[
        logging.FileHandler(log_dir / "debug_maps_selectors.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("MapsSelectorDebug")

async def test_selectors():
    """Testa diferentes seletores CSS no Google Maps"""
    
    logger.info("="*70)
    logger.info("DEBUG: Testando Seletores CSS do Google Maps")
    logger.info("="*70)
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()
        
        # Maps URL para teste
        url = "https://www.google.com/maps/search/Consultoria+de+Marketing+em+Sao+Paulo"
        logger.info(f"[1] Acessando: {url}")
        
        await page.goto(url, wait_until="domcontentloaded", timeout=90000)
        await asyncio.sleep(3)
        
        # Testar diferentes seletores
        seletores = [
            ("div[data-item-id]", "Seletor original (data-item-id)"),
            ("div[jsname]", "Seletor por jsname"),
            ("[role='option']", "Seletor por role=option"),
            ("[role='listitem']", "Seletor por role=listitem"),
            ("div[class*='result']", "Seletor por class contendo 'result'"),
            ("div[class*='item']", "Seletor por class contendo 'item'"),
            ("h3", "Titulos H3"),
            ("[role='heading']", "Elementos com role=heading"),
            ("div[aria-label]", "Divs com aria-label"),
            ("button[aria-label]", "Botoes com aria-label"),
        ]
        
        logger.info("\n" + "="*70)
        logger.info("[2] Testando seletores CSS:")
        logger.info("="*70)
        
        results = {}
        for seletor, descricao in seletores:
            try:
                count = await page.evaluate(f"""
                    () => {{
                        const elements = document.querySelectorAll('{seletor}');
                        console.log('Seletor: {seletor}, Encontrados: ' + elements.length);
                        return elements.length;
                    }}
                """)
                
                results[seletor] = count
                status = "[OK]" if count > 0 else "[X]"
                logger.info(f"{status} {descricao:45} | {seletor:30} -> {count} elementos")
                
                # Se encontrou, mostrar mais detalhes
                if count > 0 and count <= 10:
                    logger.info(f"     Primeiros elemento(s):")
                    detalhes = await page.evaluate(f"""
                        () => {{
                            const items = document.querySelectorAll('{seletor}');
                            return Array.from(items.slice(0, 3)).map((item, idx) => ({{
                                index: idx,
                                text: item.innerText?.substring(0, 60) || item.textContent?.substring(0, 60) || '(vazio)',
                                html: item.outerHTML.substring(0, 100) + '...'
                            }}));
                        }}
                    """)
                    for detalhe in detalhes:
                        logger.info(f"       [{detalhe['index']}] {detalhe['text']}")
                        
            except Exception as e:
                logger.error(f"[ERRO] {descricao:45} | {seletor:30} -> {str(e)[:60]}")
        
        # Analisar estrutura do feed
        logger.info("\n" + "="*70)
        logger.info("[3] Inspecionando container de feed:")
        logger.info("="*70)
        
        feed_info = await page.evaluate("""
            () => {
                const feed = document.querySelector('[role="feed"]');
                const main = document.querySelector('[role="main"]');
                const dialog = document.querySelector('[role="dialog"]');
                
                return {
                    feed_existe: !!feed,
                    feed_filhos: feed ? feed.children.length : 0,
                    main_existe: !!main,
                    main_filhos: main ? main.children.length : 0,
                    dialog_existe: !!dialog,
                    dialog_filhos: dialog ? dialog.children.length : 0,
                };
            }
        """)
        
        logger.info(f"Feed role: existe={feed_info['feed_existe']}, filhos={feed_info['feed_filhos']}")
        logger.info(f"Main role: existe={feed_info['main_existe']}, filhos={feed_info['main_filhos']}")
        logger.info(f"Dialog role: existe={feed_info['dialog_existe']}, filhos={feed_info['dialog_filhos']}")
        
        # Encontrar melhor seletor
        logger.info("\n" + "="*70)
        logger.info("[4] Resumo:")
        logger.info("="*70)
        
        melhores = [(s, c) for s, c in results.items() if c > 0]
        if melhores:
            melhores.sort(key=lambda x: x[1], reverse=True)
            logger.info(f"Seletores funcionais encontrados: {len(melhores)}")
            for seletor, count in melhores[:5]:
                logger.info(f"  >> {seletor} ({count} elementos)")
        else:
            logger.warning("[!] NENHUM seletor retornou resultados!")
            logger.warning("[!] Pode ser que o Google Maps nao tenha carregado os resultados")
        
        await browser.close()
    
    logger.info("\nDebug concluido - verifique o log: {log_dir / 'debug_maps_selectors.log'}")

if __name__ == "__main__":
    asyncio.run(test_selectors())
