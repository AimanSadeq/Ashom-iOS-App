# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VIFM GCC Financial Analysis Platform - A mobile-first financial analysis application for Gulf Cooperation Council (GCC) capital markets, covering 820+ companies across 6 countries (Saudi Arabia, UAE, Kuwait, Qatar, Bahrain, Oman).

**Current Status:** Production-ready with 23 screens, live market data (CoinGecko crypto, Yahoo Finance commodities with fallback), multi-asset portfolio tracker, gamification system (25 achievements), and comprehensive financial analysis tools.

**Tech Stack:**
- Backend: Node.js (>=16.0.0) + Express.js 4.18
- Database: Supabase (PostgreSQL) with SQLite fallback
- Authentication: Supabase Auth with JWT tokens
- Frontend: Static HTML pages with vanilla JavaScript, Chart.js 4.4.0 (CDN), Font Awesome 6.5 (CDN)
- Shared JS: `vifm-theme.js` (dark mode), `vifm-gamification.js` (achievements), `vifm-design-system.css`
- Architecture: Hybrid - Express serves static HTML files with client-side rendering
- Security: Helmet, CORS, bcrypt, JWT
- Dev Tools: Nodemon for hot-reload

## Development Commands

```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Seed Supabase database (PostgreSQL)
node server/seedSupabase.js

# Initialize SQLite database (fallback only)
npm run init-db

# Populate SQLite database (fallback only)
npm run seed-db

# Change port (default: 3000)
PORT=3001 npm start
```

**Important:**
- The server listens on `0.0.0.0` to allow mobile device testing on local network
- Server automatically detects Supabase or falls back to SQLite
- See `SUPABASE_SETUP.md` for Supabase configuration instructions

## Architecture

### Hybrid Static + API Architecture

This is NOT a traditional SPA or server-rendered app. It's a hybrid:

1. **Express serves static HTML files** from the root directory
2. **Each HTML file** is a complete, standalone page with its own inline CSS and JS
3. **Navigation** happens via full page loads (`window.location.href`)
4. **API endpoints** at `/api/*` provide data to frontend pages
5. **Shared JS modules** loaded via `<script>` tags in `<head>`: `vifm-theme.js`, `vifm-gamification.js`

### Project Structure

```
Ashom/
├── index.html                    # Login screen (demo@vifm.com / demo123)
├── index-vifm.html               # Development portal (all screens)
├── 01_Dashboard_Home.html        # Main dashboard with quick actions
├── 02_Analytics_Tab.html         # 9 comparison types grid
├── 03_Comparison_Results.html    # Side-by-side comparison results
├── 04_Screener_Interface.html    # Company screener with filters
├── 05_Annual_Reports.html        # Reports library with search
├── 06_Company_Profile.html       # Detailed company view (9 CFA metric categories)
├── 07_PDF_Viewer.html            # In-app PDF viewer
├── 08-12_Wizard_*.html           # 5-step comparison wizard
├── 13_Login.html                 # Email/password + social login
├── 14_Registration.html          # User registration
├── 15_Reset_Password.html        # Password recovery
├── 16_Settings_Profile.html      # Account settings (5 sections)
├── 17_Listed_Companies.html      # 820+ GCC companies by country
├── 18_Capital_Market_Authorities.html  # 6 GCC regulatory body links
├── 19_Precious_Metals_Oil.html   # Live metals & oil tracking (Yahoo Finance API)
├── 20_Cryptocurrencies.html      # Live crypto tracking (CoinGecko API)
├── 21_Excel_Download.html        # Excel data download
├── 22_Portfolio_Tracker.html     # Multi-asset portfolio tracker (4-tab UI)
├── 23_Achievements.html          # Gamification achievements page
│
├── vifm-theme.js                 # Dark mode toggle (loaded on all pages)
├── vifm-gamification.js          # Achievement tracking engine (loaded on all pages)
├── vifm-design-system.css        # Shared design tokens and component styles
├── styles.css                    # Legacy styles
├── manifest.json                 # PWA manifest
│
├── js/
│   ├── portfolio-engine.js       # Portfolio data model, CRUD, PriceService, calculations
│   └── portfolio-ui.js           # Portfolio DOM rendering, tabs, modals, Chart.js
│
└── server/
    ├── index.js                  # Main Express server
    ├── supabaseClient.js         # Supabase config
    ├── supabaseService.js        # DB service layer (Supabase + SQLite fallback)
    ├── supabase_schema.sql       # PostgreSQL schema
    ├── seedSupabase.js           # Supabase data seeding
    ├── database.js               # SQLite connection helper
    ├── initDatabase.js           # SQLite schema creation
    ├── seedDatabase.js           # SQLite data seeding
    └── routes/
        ├── auth.js               # Authentication (Supabase Auth)
        ├── companies.js          # Company data
        ├── comparisons.js        # Comparison CRUD
        ├── reports.js            # Annual reports metadata
        ├── screener.js           # Company screening
        ├── analytics.js          # Analytics and metrics
        ├── commodities.js        # Yahoo Finance proxy (metals & oil)
        └── coingecko.js          # CoinGecko proxy (crypto)
```

### API Endpoints

**Authentication:**
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login (demo: demo@vifm.com / demo123)
- `POST /api/auth/logout` - Logout
- `GET /api/auth/user` - Get current user (requires Bearer token)
- `POST /api/auth/reset-password` - Request password reset

**Companies & Data:**
- `GET /api/health` - Health check
- `GET /api/companies` - List companies (filters: country, sector, search)
- `GET /api/companies/:id` - Company details with financials
- `GET /api/companies/stats/coverage` - Stats by country/sector
- `POST /api/screener` - Screen companies by criteria
- `GET /api/reports` - Annual reports with filters
- `POST /api/comparisons` - Create comparison
- `GET /api/analytics/types` - Comparison types
- `GET /api/analytics/metrics` - Financial metrics

**Market Data:**
- `GET /api/commodities/yahoo` - Gold, Silver, Platinum, Palladium, WTI, Brent prices
- `GET /api/coingecko/crypto?ids=bitcoin,ethereum,...` - Cryptocurrency prices

## Design System

**VIFM Brand Colors:**
```css
--off-white: #FEFFF9     /* Background */
--dark-blue: #000032     /* Primary text */
--primary-blue: #000032  /* Headers */
--accent-blue: #3878BE   /* Buttons, links, highlights */
--navy-blue: #000032     /* Secondary backgrounds */
```

**Dark Mode:** Toggle via `vifm-theme.js`. Uses `[data-theme="dark"]` CSS selectors. Dark palette:
```css
background: #0F1117
card-bg: #1A1C24
border: #2A2D35
text-primary: #E5E7EB
text-secondary: #9CA3AF
accent: #5190D5
```

**Mobile-First:** All pages optimized for 430px max-width (iPhone 16 Pro Max).

**Bottom Navigation:** 5-tab bar (Home, Markets, Analytics, Portfolio, More). Fixed at bottom, consistent across all pages.

**Country Flags:** Use `<span class="country-code">SA</span>` badge elements (not emoji — they render inconsistently).

## Critical Implementation Details

### Page Navigation

Navigation uses full page loads, not SPA routing:
```javascript
window.location.href = '/02_Analytics_Tab.html';
```

### Shared Scripts (loaded in `<head>` on every page)

```html
<link rel="stylesheet" href="/vifm-design-system.css">
<script src="/vifm-theme.js"></script>
<script src="/vifm-gamification.js"></script>
```

**Note:** `vifm-gamification.js` runs before `<body>` exists. It checks `document.body` before appending toast notifications and defers to `DOMContentLoaded` if body isn't ready.

### Live Data Auto-Refresh Pattern

Market data pages and the portfolio tracker use auto-refresh with Visibility API cleanup:
```javascript
autoRefreshInterval = setInterval(fetchLiveData, 30000); // 30 seconds

document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        clearInterval(autoRefreshInterval);
    } else {
        fetchLiveData();
        autoRefreshInterval = setInterval(fetchLiveData, 30000);
    }
});
```

### No-Cache Configuration

All responses include aggressive no-cache headers for development. Static files served with `{ etag: false, lastModified: false, maxAge: 0 }`.

### Country Filtering with Hash Navigation

```javascript
// From CMA page to filtered companies
href="/17_Listed_Companies.html#saudi"  // Auto-filters to Saudi companies
```

## Multi-Asset Portfolio Tracker (Page 22)

The portfolio tracker (`22_Portfolio_Tracker.html`) is a modular system split into 3 files:

### Architecture
- **`22_Portfolio_Tracker.html`** — HTML shell with 4-tab layout and inline CSS (~900 lines)
- **`js/portfolio-engine.js`** — Data model, localStorage CRUD, PriceService, return calculations, risk metrics (~400 lines)
- **`js/portfolio-ui.js`** — DOM rendering, tab system, modals, Chart.js integration, auto-refresh (~1,060 lines)

### 6 Asset Types

| Type | Price Source | Symbol Key |
|------|-------------|------------|
| Stock | `STOCK_DATA` mock object (20 GCC companies) | Company name |
| Metal | `/api/commodities/yahoo` with `FALLBACK_COMMODITIES` | `gold`, `silver`, etc. |
| Oil | `/api/commodities/yahoo` with `FALLBACK_COMMODITIES` | `wti`, `brent` |
| Crypto | `/api/coingecko/crypto` (live) | CoinGecko ID |
| Bond | Coupon calculation (manual entry) | User-defined |
| Cash | Fixed 1:1 | Currency code |

### Data Model (localStorage)
```javascript
// Holding
{
    id: Date.now(),
    type: 'stock' | 'metal' | 'oil' | 'crypto' | 'bond' | 'cash',
    name: 'Saudi Aramco',
    symbol: '2222.SE',
    ticker: '2222.SR',       // stocks only
    quantity: 1000,
    costPrice: 26.50,
    costCurrency: 'SAR',
    purchaseDate: '2024-06-15',
    notes: '',
    sector: 'Energy',        // stocks only
    country: 'saudi',        // stocks only
    couponRate: 5.25,         // bonds only
    maturityDate: '2029-12-31' // bonds only
}
```

### 4-Tab Interface
1. **Overview** — Summary card (gradient), allocation donut chart (Chart.js), top holdings, quick actions
2. **Holdings** — Type-grouped table with filter chips (All/Stocks/Metals/Oil/Crypto/Bonds/Cash), delete buttons
3. **Performance** — Chart.js line chart with time range buttons (1W/1M/3M/6M/1Y/ALL), daily snapshots in localStorage
4. **Analytics** — Risk metrics (Sharpe Ratio, Max Drawdown, Volatility), allocation bars (by class/country/currency), Zakat calculator (2.5%)

### Key Classes
- `PriceService` — Batch price fetching with 30s cache TTL, fallback for API failures
- `PortfolioEngine` — CRUD, calculations, migration from old stock-only format, CSV export
- `PortfolioUI` — Tab switching, rendering, multi-step Add Holding modal, auto-refresh

## Gamification System

`vifm-gamification.js` — Loaded on every page. Tracks 25 achievements across 5 categories.

### Categories
- **Explorer** (5): Page visits, country filtering, dark mode toggle
- **Analyst** (5): Comparisons, screener, reports
- **Portfolio** (5): Create portfolios, add holdings, export data
- **Market** (5): Visit metals/crypto pages, refresh market data
- **Consistency** (5): Login streaks (3/7/30 day), session actions, settings changes

### Tracking API
```javascript
// From any page's JavaScript
if (window.VIFM && window.VIFM.trackAction) {
    window.VIFM.trackAction('holding-added');
    window.VIFM.trackAction('portfolio-created');
    window.VIFM.trackAction('excel-downloaded');
    window.VIFM.trackAction('dark-mode-toggled');
    window.VIFM.trackAction('comparison-created');
}
```

### Public API
```javascript
VIFM.getStats()                  // { stats, unlocked, totalAchievements, unlockedCount, streak }
VIFM.getAchievementsByCategory() // { Explorer: [...], Analyst: [...], ... }
VIFM.getRecentUnlocks(3)         // Last 3 unlocked achievements
VIFM.resetProgress()             // Reset all (with confirm dialog)
```

## External APIs

**CoinGecko API** (Cryptocurrency prices):
- Proxy: `GET /api/coingecko/crypto?ids=bitcoin,ethereum,...`
- Returns: `{ success: true, data: { bitcoin: { price, change, marketCap } } }`
- 60-second server-side cache, rate limit fallback to expired cache
- Used in: `20_Cryptocurrencies.html`, `js/portfolio-engine.js`

**Yahoo Finance API** (Commodities):
- Proxy: `GET /api/commodities/yahoo`
- Returns: `{ success: true, data: { gold: { price, change, symbol } } }`
- **Currently returns 401** — portfolio uses `FALLBACK_COMMODITIES` hardcoded prices
- Used in: `19_Precious_Metals_Oil.html`, `js/portfolio-engine.js`

## Common Development Patterns

### Adding a New Page

1. Create HTML file with number prefix (e.g., `24_New_Feature.html`)
2. Include shared scripts in `<head>`:
   ```html
   <link rel="stylesheet" href="/vifm-design-system.css">
   <script src="/vifm-theme.js"></script>
   <script src="/vifm-gamification.js"></script>
   ```
3. Use inline `<style>` for page-specific CSS (styles are NOT shared across pages)
4. Copy the 5-tab bottom navigation from an existing page
5. Set `max-width: 430px` on `<body>` for mobile-first layout
6. For live data, implement auto-refresh with Visibility API cleanup

### Adding API Endpoint

1. Create route file in `server/routes/`
2. Import in `server/index.js`:
   ```javascript
   const newRouter = require('./routes/newroute');
   app.use('/api/newroute', newRouter);
   ```

### Working with GCC Data

**6 GCC Countries:**
- Saudi Arabia (id: `'saudi'`, currency: SAR)
- UAE (id: `'uae'`, currency: AED)
- Kuwait (id: `'kuwait'`, currency: KWD)
- Qatar (id: `'qatar'`, currency: QAR)
- Bahrain (id: `'bahrain'`, currency: BHD)
- Oman (id: `'oman'`, currency: OMR)

## Important Rules

1. **Don't create SPAs** — This is a multi-page app with full page loads
2. **Each page is independent** — Inline CSS and JS, minimal code sharing
3. **Mobile-first** — All designs are 430px max-width
4. **No build process** — Pure HTML/CSS/JS served statically
5. **Country flags** — Use `<span class="country-code">SA</span>` text badges, not emoji
6. **File naming** — Numbered prefixes (01-23) for screen organization
7. **Visibility API** — Always clean up intervals/timers when page is hidden
8. **Dark mode** — All new components need `[data-theme="dark"]` selectors
9. **Gamification** — Call `VIFM.trackAction()` for trackable user actions
10. **API failures** — Always provide fallback data or graceful error states
11. **Shared scripts** — `vifm-theme.js` and `vifm-gamification.js` run before `<body>` — never assume `document.body` exists in these scripts

## Server Configuration

### Middleware Stack (in order)
1. **Helmet** — Security headers (CSP and COEP disabled for CDN resources)
2. **CORS** — Cross-origin (allows all origins in dev)
3. **Compression** — Gzip
4. **Morgan** — HTTP request logging (dev mode)
5. **Body Parser** — JSON and URL-encoded
6. **No-Cache Headers** — Aggressive cache prevention

### Database
- **Supabase Mode** (Production) — PostgreSQL with RLS and authentication
- **SQLite Mode** (Fallback) — Local database, auto-detected when Supabase not configured
- **Seed Data:** 34+ GCC companies across all 6 countries
- **Config:** Set `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY` in `.env`

## Troubleshooting

**Port already in use:**
```bash
netstat -ano | findstr :3000
taskkill //F //PID <process_id>
npm start
```

**Yahoo Finance API returning 401:**
- This is expected — the API key may be expired or unauthorized
- Portfolio tracker uses `FALLBACK_COMMODITIES` in `js/portfolio-engine.js` as a graceful fallback
- `19_Precious_Metals_Oil.html` has its own fallback handling

**Changes not showing:**
- Hard refresh (Ctrl+F5) — server has no-cache headers but browser may still cache
- Check server console for errors

**Demo login:**
- Email: `demo@vifm.com` / Password: `demo123`
- Always works regardless of Supabase configuration
