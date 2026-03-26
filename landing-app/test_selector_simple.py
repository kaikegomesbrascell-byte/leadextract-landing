#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import asyncio
from playwright.async_api import async_playwright

async def test_selector():
    """Testa o seletor refinado"""
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        url = "https://www.google.com/maps/search/Consultoria+de+Marketing+em+Sao+Paulo"
        await page.goto(url, wait_until="domcontentloaded", timeout=90000)
        await asyncio.sleep(3)
        
        # Testar diferentes formas de selecionar
        tests = [
            ('Feed > DIV diretos', 'const feed = document.querySelector("[role=\\"feed\\"]"); return feed ? feed.querySelectorAll("> div").length : 0;'),
            ('Botoes Ver rotas', 'return document.querySelectorAll("button[aria-label*=\\"Ver rotas\\"]").length;'),
            ('Feed + Ver rotas', 'const feed = document.querySelector("[role=\\"feed\\"]"); return feed ? feed.querySelectorAll("button[aria-label*=\\"Ver rotas\\"]").length : 0;'),
            ('Todos os buttons', 'return document.querySelectorAll("button").length;'),
        ]
        
        print("\nTestes de Seletores:")
        print("=" * 60)
        
        for nome, codigo in tests:
            try:
                resultado = await page.evaluate(codigo)
                print(f"[OK] {nome:40} -> {resultado}")
            except Exception as e:
                print(f"[ERRO] {nome:40} -> {str(e)[:50]}")
        
        # Listar exatamente o que encontrou
        print("\n" + "=" * 60)
        print("Amostra de botoes encontrados:")
        print("=" * 60)
        
        samples = await page.evaluate("""
            () => {
                const botoes = document.querySelectorAll('button[aria-label]');
                return Array.from(botoes).slice(0, 20).map(btn => (
                    btn.getAttribute('aria-label').substring(0, 80)
                ));
            }
        """)
        
        for idx, label in enumerate(samples, 1):
            print(f"{idx:2}. {label}")
        
        await browser.close()

asyncio.run(test_selector())
