# 📈 Ashom — GCC Financial Intelligence Platform

**Mobile-first financial analysis & intelligence platform for the Gulf Cooperation Council (GCC) capital markets**, covering 820+ companies across Saudi Arabia, UAE, Kuwait, Qatar, Bahrain, and Oman.

![Status](https://img.shields.io/badge/Status-Active-brightgreen)
![Node.js](https://img.shields.io/badge/Node.js-16%2B-339933?logo=node.js)
![Express](https://img.shields.io/badge/Express-4.18-000000?logo=express)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Flutter](https://img.shields.io/badge/Flutter-3.10%2B-02569B?logo=flutter)
![Supabase](https://img.shields.io/badge/Supabase-Postgres-3FCF8E?logo=supabase)

---

## 🧱 Repository Layout

This repo is a monorepo with three deployable components:

```
Ashom-iOS-App/
├── server/        # Node.js + Express API (also serves the built web app)
├── frontend/      # React 19 web app (SPA, served by the server in production)
├── mobile_app/    # Flutter app (iOS + Android), native client for the same API
├── *.html         # Legacy static screens (served in development as a fallback)
├── render.yaml    # Render.com deployment config
└── CLAUDE.md      # Guidance for AI coding assistants
```

| Component | Stack | Notes |
|-----------|-------|-------|
| **Backend** (`server/`) | Node.js ≥16, Express 4.18, Supabase (Postgres) with SQLite fallback | 15 API route groups, JWT auth via Supabase, market-data proxies |
| **Web** (`frontend/`) | React 19, React Router 7, Tailwind CSS 3, Chart.js 4 | 60+ routes; built to `frontend/build` and served by the API in production |
| **Mobile** (`mobile_app/`) | Flutter 3.10+, go_router, Provider, fl_chart | Native iOS/Android client (`v1.39.0`), talks to the same API |

> **Note:** The legacy numbered HTML screens (`01_*.html` … `37_*.html`) predate the React rewrite. In production the server serves `frontend/build`; in development it falls back to the legacy static HTML.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** ≥ 16 and **npm** ≥ 8 — https://nodejs.org/
- **Flutter** 3.10+ (only if working on the mobile app) — https://flutter.dev/

### 1. Install backend dependencies

```bash
npm install
```

### 2. Configure environment (optional)

Create a `.env` file in the project root. Without Supabase config the server automatically falls back to SQLite.

```env
PORT=3000
NODE_ENV=development

# Supabase (production). Omit to use the SQLite fallback.
SUPABASE_URL=your-project-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
```

See [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md) for full Supabase configuration.

### 3. (Optional) Initialize the SQLite fallback database

```bash
npm run init-db    # create tables
npm run seed-db    # load GCC seed data
```

For Supabase, seed instead with:

```bash
node server/seedSupabase.js
```

### 4. Run the backend

```bash
npm run dev    # auto-reload (nodemon)
# or
npm start      # production mode
```

The server listens on `0.0.0.0:3000` (override with `PORT=3001 npm start`) so you can reach it from a phone on the same network.

### 5. Run the React web app (development)

In a second terminal:

```bash
cd frontend
npm install
npm start          # http://localhost:3000 (CRA dev server, proxies API calls)
```

> The web app's dev server proxies API requests to the backend (see `proxy` in `frontend/package.json`). For a production build, run `npm run build` from the repo root, which builds the frontend and lets the backend serve it.

### 6. Run the Flutter mobile app

```bash
cd mobile_app
flutter pub get
flutter run        # select an iOS simulator / Android emulator / device
```

**Demo login (all clients):** `demo@vifm.com` / `demo123`

---

## 🌐 API Endpoints

All endpoints are mounted under `/api` (see `server/index.js`):

| Route group | Path | Purpose |
|-------------|------|---------|
| Auth | `/api/auth` | Signup, login, logout, current user, password reset (Supabase Auth + JWT) |
| Companies | `/api/companies` | 820+ GCC companies, profiles, coverage stats |
| Screener | `/api/screener` | Filter companies by financial criteria |
| Comparisons | `/api/comparisons` | Create/retrieve saved comparisons |
| Analytics | `/api/analytics` | Comparison types & financial metrics |
| Reports | `/api/reports` | Annual report metadata & filings |
| Commodities | `/api/commodities` | Yahoo Finance proxy — gold, silver, platinum, palladium, WTI, Brent |
| Crypto | `/api/coingecko` | CoinGecko proxy — live cryptocurrency prices |
| News | `/api/news` | Market news (RSS aggregation) |
| AI Analyst | `/api/analyst` | AI-powered analysis (Anthropic SDK) |
| Quant | `/api/quant` | Quant lab — factor models, risk, optimizer, valuation |
| Ingest | `/api/ingest` | Document/data ingestion (PDF/DOCX/Excel parsing) |
| University | `/api/university` | Learning content & courses |
| Certificates | `/api/certificates` | Course certificate issuance & verification |
| Preferences | `/api/preferences` | User preferences |
| Health | `/api/health` | Health check |

---

## ✨ Key Features

- **Market data** — Live crypto (CoinGecko), commodities & oil (Yahoo Finance, with hardcoded fallback), central bank rates, currency converter.
- **Company intelligence** — Profiles with CFA-style metric categories, screener, side-by-side comparison wizard, annual reports & in-app PDF viewer.
- **Portfolio** — Multi-asset tracker (stocks, metals, oil, crypto, bonds, cash), multi-portfolio & family views, net worth, Zakat report.
- **Quant Lab** — Factor models, risk analytics, portfolio optimizer, valuation, regression, relative value, Vision 2030 tools.
- **AI Analyst** — On-demand AI analysis via the Anthropic SDK.
- **Sharia & GCC-specific** — Sharia screening, IPO/dividend/earnings calendars, cross-listings, fractional shares.
- **Learning** — University courses, learning paths, glossary, classroom, verifiable certificates.
- **Gamification** — Achievement tracking across the experience.

---

## 🛠️ Scripts (root `package.json`)

```bash
npm start          # start production server (node server/index.js)
npm run dev        # start server with nodemon auto-reload
npm run build      # build the React frontend (cd frontend && npm install && npm run build)
npm run init-db    # create SQLite tables (fallback DB)
npm run seed-db    # seed the SQLite fallback DB
npm run lint       # eslint server/**/*.js
npm run lint:fix   # eslint --fix
npm run ios:sync   # npx cap sync ios   (Capacitor)
npm run ios:open   # npx cap open ios
npm run ios:run    # npx cap run ios
```

---

## ☁️ Deployment

Deployed to **Render.com** via [`render.yaml`](./render.yaml):

```yaml
buildCommand: yarn install && cd frontend && yarn install && CI=false yarn build
startCommand: node server/index.js
```

In production (`NODE_ENV=production`), the Express server serves the built React app from `frontend/build` and exposes the API under `/api`.

---

## 🗄️ Database

- **Supabase (Postgres)** — production. RLS + Supabase Auth. Configure via `.env` and seed with `node server/seedSupabase.js`. Schema: `server/supabase_schema.sql`.
- **SQLite** — automatic fallback when Supabase is not configured. Initialize with `npm run init-db && npm run seed-db`.

The service layer (`server/supabaseService.js`) abstracts over both backends.

---

## 🐛 Troubleshooting

**Port already in use** — change the port: `PORT=3001 npm start`, or stop the process on 3000.

**Yahoo Finance returns 401** — expected; commodity prices fall back to hardcoded values.

**Web app shows nothing** — confirm the backend is running, and in development run the CRA dev server from `frontend/` (it proxies API calls). Check the browser console (F12).

**Changes not showing** — the server sends aggressive no-cache headers in development; hard-refresh the browser (Ctrl/Cmd+Shift+R).

---

## 📄 License

ISC License — free to use and modify.

---

**Ashom** — by VIFM (Virginia Institute of Finance and Management)
</content>
</invoke>
