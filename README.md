# LeadExtract Landing + Pro Monorepo 🚀

**Landing Page (React/Vite) + LeadExtract Pro (Python CLI) + Backend**

[![Landing Demo](landing-app/public/placeholder.svg)](https://github.com/kaikegomesbrascell-byte/leadextract-landing)

## 📁 Structure (Cleaned)

```
.
├── landing-app/          # React 18 Vite + Tailwind + Supabase (PIX Checkout)
│   ├── src/             # Components (Hero, Pricing, CheckoutModal)
│   ├── public/          # Assets
│   ├── backend/         # Express server (webhooks, SigiloPay)
│   ├── package.json     # npm run dev
├── leadextract-pro/     # Python Lead Extractor 3.0 (Maps + Crawler + ReceitaWS)
│   ├── src/core.py      # Pipeline
│   ├── main.py          # python main.py
│   └── requirements.txt
├── docs/                # Guides (ARQUITETURA, SETUP_SUPABASE)
├── .gitignore           # Clean (no node_modules/.venv)
└── TODO.md              # Progress
```

## 🚀 Quick Start

### Landing App
```bash
cd landing-app
npm install
npm run dev  # http://localhost:5173
npm run server  # backend:3001
```

### LeadExtract Pro
```bash
cd leadextract-pro
python -m venv venv && venv/Scripts/activate
pip install -r requirements.txt
python main.py  # Interactive CLI
```

## Features

- **Landing**: Professional PIX checkout, testimonials, stats, mobile-responsive.
- **Extractor**: Google Maps → Deep crawl → CNPJ enrich → Lead score 0-10 → CSV.
- **Backend**: Express + CORS + SigiloPay webhooks.

See [leadextract-pro/README.md](leadextract-pro/README.md) for full docs.

## Deploy

- **Vercel**: landing-app/vercel.json ready.
- **PyInstaller**: leadextract-pro/build.py.

## License
MIT

**Stars & PRs welcome!** ⭐

