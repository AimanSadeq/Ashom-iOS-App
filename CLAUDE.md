# CLAUDE.md

Guidance for Claude Code (claude.ai/code) when working in this repository.

> This file was rewritten after a full audit. The previous version described a
> 23-page static-HTML app with `vifm-theme.js`, `vifm-gamification.js` and
> `js/portfolio-engine.js`. **None of those files exist.** If you find guidance
> anywhere that references them, it is stale.

## Project Overview

**Ashom / VIFM** — a mobile-first research, education and portfolio-simulation
platform for Gulf Cooperation Council (GCC) capital markets: Saudi Arabia, UAE,
Kuwait, Qatar, Bahrain, Oman.

There are **three separate clients** over one Express API:

| Tier | Location | Notes |
|---|---|---|
| React SPA (web) | `frontend/` | ~90 routes, CRA build, served by Express in production |
| Flutter app (iOS) | `mobile_app/` | 23 screens, v1.39.0+40, talks to `https://ashom.viftraining.com` |
| Express API | `server/` | 15 routers, Supabase (PostgreSQL) primary, SQLite fallback |

Legacy static HTML at the repo root (`37_Admin_University.html`,
`admin-upload.html`, `ashom-promo.html`) is **orphaned** — it is not served once
`frontend/build` exists. Do not extend it.

## ⚠️ Read this before touching data or auth

1. **Company financial figures are generated sample data, not real financials.**
   `server/gcc-seed-data.js` → `generateMetrics()` uses a seeded RNG, and
   `server/seedSupabase.js` writes that output into the production
   `financial_metrics` table. Every ROE / P/E / revenue / net-income figure
   attached to a real company name is illustrative.
   - The UI labels this via `frontend/src/components/shared/DataNotice.jsx` and a
     blocking `DisclaimerGate.jsx`. **Keep those labels on any new screen that
     surfaces these figures.**
   - The AI system prompts in `server/routes/analyst.js` also state it. Do not
     remove that instruction.
   - Real data does exist for anything uploaded through `/api/ingest/*`
     (`financial_statements`, `document_chunks`). Distinguish the two.

2. **Never add a static/demo bypass token.** A literal `'demo-token'` used to be
   accepted as a valid session by `routes/university.js` and
   `routes/preferences.js`, `demo@vifm.com` was hardcoded as an admin in
   `supabaseService.isAdmin()`, and the React `AuthContext` handed that token to
   every anonymous visitor. The combination made the entire admin API public.
   All of it has been removed. Admin status comes only from the `admin_users`
   table.

3. **`supabaseAdmin` uses the service-role key and bypasses Row Level Security.**
   The RLS policies in `server/supabase_schema.sql` do not protect anything
   reached through it. When you add a route that touches user-owned data, scope
   the query by `user_id` yourself, or use `createUserClient(token)` from
   `server/supabaseClient.js`, which runs under the user's identity so RLS
   applies.

## Development Commands

```bash
npm install                 # root (Express server)
npm --prefix frontend ci    # React app

npm run dev                 # server with nodemon
npm start                   # server, production mode
npm run lint                # ESLint over server/ (eslint.config.js)

npm --prefix frontend start # React dev server (proxies /api to :3000)
npm run build               # builds the React app into frontend/build

node server/seedSupabase.js           # seed companies + SAMPLE metrics
node server/generate-price-history.js # regenerate server/data/ (~42 MB, gitignored)
```

The server listens on `0.0.0.0` so a phone on the same network can reach it.
`PORT` defaults to 3000; `.env` no longer overrides real environment variables
(`dotenv` is called without `override`).

## Architecture Notes

### Request pipeline (`server/index.js`, order matters)

```
trust proxy → helmet(CSP on) → cors → compression → morgan → body parsers
→ cache-control policy → express.static(frontend/build)
→ /api/* routers  →  /api 404 (JSON)  →  SPA catch-all (index.html)
→ error handler
```

- The **`/api` 404 handler must stay before the SPA catch-all.** Without it,
  unknown `/api/*` paths return HTTP 200 with `index.html`, and clients cannot
  tell a missing endpoint from a success. The Flutter app hit exactly this with
  `/api/indices`, `/api/movers` and `/api/quote/*` — endpoints that **still do
  not exist** and are silently mocked client-side.
- **Caching:** content-hashed assets get `immutable`; HTML and `/api/*` get
  `no-store`. Do not reinstate blanket `no-store` — it forced a re-download of
  the ~1 MB bundle on every navigation.

### Data layer

`server/supabaseService.js` is the single data access layer. It picks Supabase
when credentials are valid, else SQLite.

- **The two backends have different column names.** Supabase uses `fiscal_year`;
  the SQLite schema (`server/initDatabase.js`) uses `year`. Querying `year`
  against Supabase throws `column ... does not exist` — this took out
  `/api/screener` and `/api/reports` with HTTP 500 until it was fixed. Check
  which branch you are editing.
- **Country values are normalised at the query boundary.** The DB stores display
  names (`Saudi Arabia`), clients send slugs (`saudi`) and ISO codes (`SA`). Use
  `normalizeCountry()`; do not pass raw client values to `.eq('country', ...)`.
- SQLite is **lazily** initialised. Do not move `require('better-sqlite3')` back
  to module scope — every router imports this file, so a native-binding failure
  there crashes the whole server at boot even when Supabase is in use.

### Quant module

`server/quant-engine.js` (~2,250 lines) is the real analytical core: OLS with
diagnostics, VaR (parametric/historical/Monte Carlo), efficient frontier, risk
parity, Altman Z / Piotroski F / Beneish M, DuPont, DCF/DDM/RI.

`server/routes/quant.js` reads `server/data/*.json`, which is **gitignored and
generated on first use** (`ensureDataGenerated()`). The schema also defines
`price_history`, `factor_returns` and `macro_data` tables — these are **not
wired up**; migrating the loaders to read from them is the intended next step.

### Quant Lab request contracts — do not drift from these

The Quant Lab once shipped entirely broken: every page sent `{company: …}`
while every endpoint required `{symbol: …}`, so 8 of 9 tools returned HTTP 400
the moment a user pressed Run. Endpoint tests passed throughout, because they
used the correct shape rather than the one the UI actually sends.

`tests/smoke.mjs` now contains a **CONTRACT** block that replays each page's
exact payload. If you change a request shape on either side, run `npm test`.

| Page | Endpoint | Required shape |
|---|---|---|
| RiskAnalytics | `/risk-metrics` | `{symbol, range}` |
| RiskAnalytics | `/var` | `{symbol, method, confidence}` |
| RiskAnalytics | `/stress-test` | `{symbol, scenario, range}` |
| RiskAnalytics | `/correlation-matrix` | `?symbols=a,b&range=` (GET) |
| FactorModels | `/factor-model` | `{symbol, model, range}` |
| Optimizer | `/optimize` | `{symbols[], range, constraints}` |
| Valuation | `/valuation` | `{method, params}` — rates as **decimals** |
| Vision2030 | `/vision2030` | `{symbol}` or `{batch:true}` |
| Regression | `/regression` | `{dependent:{type,symbol\|name}, independents[], range}` |
| RelativeValue | `/relative-value` | `{sector}` |

Two further traps in this area:

- **`maxDrawdown()` takes an equity curve, not a returns series.** Passing
  returns produced a 376% drawdown. Use `buildEquityCurve()` first — as
  `calmarRatio()` does internally. `tests/smoke.mjs` asserts `0 ≤ mdd ≤ 1`.
- **`/risk-metrics` returns `maxDrawdown` as an object**
  (`{maxDrawdown, peakIndex, troughIndex, recoveryIndex}`), not a number.
  Rendering it directly produced `NaN%`.

## Frontend Conventions

- **Mobile-first, 430px max width.** `AppShell` provides the frame and 5-tab
  bottom nav.
- Styling is CSS custom properties (`--navy`, `--card`, `--text-2`, `--r-md`)
  applied via inline style objects; Tailwind is configured but used
  inconsistently. Match the file you are editing.
- Shared components live in `frontend/src/components/shared/`:
  `PageHeader`, `LoadingState`, `ErrorState`, `EmptyState`, `DataNotice`,
  `DisclaimerGate`.
- Data fetching goes through `frontend/src/services/api.js`. Do not call `fetch`
  directly from a page.
- Dark mode uses `[data-theme="dark"]`; new components need both themes.

### Things the UI claims but the backend does not do

Be careful not to treat these as working:

- **Subscriptions/pricing** (`useSubscription.js`, `/pricing`) are entirely
  localStorage. There is **no payment integration anywhere in the repo** and no
  server-side entitlement check. Upgrading is free and client-side.
- **Watchlist, portfolio, orders, alerts** are localStorage only, even though
  `watchlist` and `portfolios` tables and service methods exist.
- **Price alerts** are stored but never evaluated. **Notification settings**
  toggle nothing. There is no email/SMS/push provider.
- Several pages are wholly illustrative and carry a `DataNotice variant="demo"`:
  Social Feed, Copy Trading, IPO/Earnings/Dividend calendars, Options Screener,
  Cross-Listings, Central Bank Rates.
- `ScreenerPage` calls `GET /api/companies`, **not** `POST /api/screener`. The
  screener endpoint exists and works but is currently unused by the web UI, so
  the page filters by country/search only — its Price / Change / P/E / ROE sort
  options are inert because `/api/companies` does not return those fields.
- `GCCToolsPage`'s **Islamic Finance** and **Sovereign Wealth** tools have no
  data source (AAOIFI screening inputs and SWF ownership registers are not in
  the dataset). They render an explicit "not available" message rather than
  issuing a request that cannot succeed. Wire them up only when a provider is
  connected.
- `ComparisonResultsPage` has **no mock fallback any more**. It used to render
  `generateMockResults()` — random numbers — whenever the adapter found nothing,
  which meant the wizard's real API results were fetched, stored, and then
  silently discarded. It now shows an empty state instead. Do not reintroduce a
  synthetic fallback on a results screen.

## API Surface

Mounted in `server/index.js` under `/api`:

`auth` · `companies` · `comparisons` · `reports` · `screener` · `analytics` ·
`commodities` · `coingecko` · `news` · `analyst` · `ingest` · `quant` ·
`certificates` · `university` · `preferences` · `health`

Auth model:
- **Public:** companies, analytics, comparisons, reports, screener, news,
  commodities, coingecko, quant, health.
- **Bearer JWT:** `/api/preferences/*`, `/api/university/enroll|enrollment|progress`.
- **Bearer JWT + `admin_users` row:** `/api/university/admin/*`.
- **`x-admin-password` header:** `/api/ingest/*`. There is **no fallback
  password** — if `ADMIN_PASSWORD` is unset these endpoints return 503.
- `/api/analyst/*` is **unauthenticated** and spends the server's Anthropic key.
  It is rate-limited only. Adding auth here is an open task.

Rate limits live in `server/middleware/rateLimit.js` (in-process; replace the
store with Redis before scaling beyond one instance).

## External Services

| Service | Status |
|---|---|
| Supabase | Connected. Several tables empty (`annual_reports` has data; university/ingest tables do not). |
| CoinGecko | Working, real live prices. 90s cache. |
| Yahoo Finance (commodities) | **Failing** — always serves the hardcoded `fallback` block. UI shows `DataNotice variant="fallback"`. |
| Anthropic | **Key invalid (401)** — AI Analyst errors until it is rotated. |
| RSS feeds | Working. Relevance is mixed. |
| Payments / email / SMS / push | **Do not exist.** |

## Testing

There are **no tests** and no CI. `npm test` exits 1. `playwright` is installed
but unused. If you add tests, start with: rejection of static bypass tokens on
every protected route, per-user data isolation, and `quant-engine.js` against
known-good reference values.

## Conventions

1. Three clients — a feature change usually means React **and** Flutter.
2. Never introduce a hardcoded credential, bypass token, or admin allowlist.
3. Fail closed. Do not return `success: true` for an operation that did not
   happen — `routes/certificates.js` used to, and it made certificate
   verification permanently impossible.
4. Surface degraded data. If a fallback is served, say so in the response
   (`fallback: true`) **and** in the UI.
5. Keep `DataNotice`/`DisclaimerGate` on any screen showing generated figures.
6. New API routes return JSON with a consistent shape and a correct status code.
