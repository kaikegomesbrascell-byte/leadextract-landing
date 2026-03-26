#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Debug avancado: Inspecionar estrutura HTML do Google Maps
Verificar exatamente onde estao os nomes das empresas
"""

import asyncio
import sys
import io
from playwright.async_api import async_playwright
import json

# Força UTF-8 em Windows
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

async def debug_structure():
    """Inspeciona a estrutura HTML do Google Maps"""
    
    print("\n" + "="*80)
    print("DEBUG: Estrutura HTML do Google Maps")
    print("="*80 + "\n")
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()
        
        url = "https://www.google.com/maps/search/Consultoria+de+Marketing+em+Sao+Paulo"
        print(f"[1] Acessando: {url}\n")
        
        await page.goto(url, wait_until="domcontentloaded", timeout=90000)
        await asyncio.sleep(3)
        
        # Inspecionar feed
        print("[2] Analisando Feed Role ([role='feed']):")
        print("-" * 80)
        
        feed_data = await page.evaluate("""
            () => {
                const feed = document.querySelector('[role="feed"]');
                if (!feed) return null;
                
                return {
                    exists: true,
                    childCount: feed.children.length,
                    children: Array.from(feed.children).slice(0, 5).map((child, idx) => {
                        // Procurar por texto que pareca nome de empresa
                        const texts = [];
                        const buttons = child.querySelectorAll('button');
                        const divs = child.querySelectorAll('div');
                        
                        // Coletar todos os textos
                        buttons.forEach(btn => {
                            const text = btn.getAttribute('aria-label') || btn.textContent?.trim();
                            if (text && text.length > 3) texts.push(text);
                        });
                        
                        return {
                            index: idx,
                            tagName: child.tagName,
                            className: child.className,
                            childrenCount: child.children.length,
                            firstButton: child.querySelector('button')?.getAttribute('aria-label') || null,
                            buttonCount: buttons.length,
                            textSample: texts.slice(0, 3)
                        };
                    })
                };
            }
        """)
        
        if feed_data:
            print(f"Feed encontrado com {feed_data['childCount']} filhos\n")
            for child in feed_data['children']:
                print(f"  Filho {child['index']}: {child['tagName']} ({child['childrenCount']} filhos internos)")
                print(f"    - Botoes: {child['buttonCount']}")
                if child['firstButton']:
                    print(f"    - Primeiro botao: {child['firstButton'][:60]}...")
                if child['textSample']:
                    for text in child['textSample']:
                        print(f"    - Texto: {text[:70]}")
                print()
        
        # Tentativa 2: Procurar por div dentro de feed com h3
        print("[3] Procurando por H3 (titulos) dentro do Feed:")
        print("-" * 80)
        
        h3_data = await page.evaluate("""
            () => {
                const feed = document.querySelector('[role="feed"]');
                if (!feed) return null;
                
                const h3s = feed.querySelectorAll('h3');
                return {
                    count: h3s.length,
                    samples: Array.from(h3s).slice(0, 10).map(h3 => ({
                        text: h3.textContent?.trim() || '',
                        parent: h3.parentElement?.tagName,
                        parentClass: h3.parentElement?.className
                    }))
                };
            }
        """)
        
        if h3_data and h3_data['count'] > 0:
            print(f"Encontrados {h3_data['count']} elementos H3\n")
            for idx, h3 in enumerate(h3_data['samples'][:5], 1):
                print(f"  {idx}. {h3['text']}")
        else:
            print("Nenhum H3 encontrado\n")
        
        # Tentativa 3: Procurar por divs com role=button
        print("[4] Procurando por [role='button'] com texto:")
        print("-" * 80)
        
        role_button = await page.evaluate("""
            () => {
                const feed = document.querySelector('[role="feed"]');
                if (!feed) return null;
                
                const buttons = feed.querySelectorAll('[role="button"]');
                return {
                    count: buttons.length,
                    samples: Array.from(buttons).slice(0, 10).map((btn, idx) => {
                        const text = btn.textContent?.trim() || '';
                        const ariaLabel = btn.getAttribute('aria-label') || '';
                        
                        // Filtrar botoes com mais de 5 chars
                        if (text.length > 5) {
                            return {
                                index: idx,
                                text: text.substring(0, 100),
                                ariaLabel: ariaLabel.substring(0, 100),
                                length: text.length
                            };
                        }
                        return null;
                    }).filter(x => x)
                };
            }
        """)
        
        if role_button and role_button['count'] > 0:
            print(f"Encontrados {role_button['count']} elementos com [role='button']\n")
            for sample in role_button['samples'][:10]:
                print(f"  [{sample['length']} chars] {sample['text']}")
        
        await browser.close()
    
    print("\n" + "="*80 + "\n")

if __name__ == "__main__":
    asyncio.run(debug_structure())
