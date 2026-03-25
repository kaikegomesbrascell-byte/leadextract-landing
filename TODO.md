# LeadExtract v6 Upgrade TODO
Current Working Directory: c:/Users/kaike/Downloads/AP@

## ✅ Plan Approved
- [x] User confirmed overwrite landing-page/index.html with v6 standalone
- [x] Keep hardcoded WhatsApp CTAs (5516994260416)
- [x] Minimal code fixes plan confirmed (Maps, CNPJ nome, regex, scoring, CLI)

## 📋 Implementation Steps (Sequential)

### Phase 1: Landing Page Replacement [P0] - Complete
- [x] 1.1 Replace landing-page/index.html with v6 full HTML (w/ GTM AW-18030639277)
- [x] 1.2 Test: Open landing-page/index.html in browser

### Phase 2: Core Fixes [P0] - Progress 1/5
- [x] 2.1 Enhance Maps scraper selectors (JS eval improved, EmpresaBase populated)
- [x] 2.2 Add nome->CNPJ search (minhareceita.org scrape)

- [ ] 2.3 Update regex (DeepCrawler WhatsApp wa.me/tel:/href, BR phones)
- [x] 2.4 Scoring +QSA/socios points (>=2 socios +1.5, >=1 +0.8)

- [x] 2.5 Create leadextract_cli.py (CLI ready: python leadextract_cli.py \"termo\" --limite 50)


### Phase 3: Test & Polish [P1]
- [ ] 3.1 pip install -r requirements_advanced.txt && playwright install chromium
- [ ] 3.2 python leadextract_cli.py "test" --limite 10 → Verify CSV columns: nome/url/addr/tel/CNPJ/socios/score
- [ ] 3.3 Update tests_advanced.py with new fields
- [ ] 3.4 Build EXE: pyinstaller LeadExtract_Advanced.spec

### Phase 4: Deploy [P2]
- [ ] 4.1 Run criar_zip_update.py
- [ ] 4.2 Git PR (blackboxai/leadextract-v6-upgrade)
- [ ] 4.3 Deploy landing (deploy_landing.bat)

**Overall Progress: 6/19** | **Next: Phase 2.1 Maps scraper**

