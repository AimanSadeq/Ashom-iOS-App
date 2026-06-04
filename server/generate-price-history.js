// =============================================================================
// Historical Price Data Generator
// VIFM GCC Financial Analysis Platform
// =============================================================================
// Generates 5 years of synthetic daily OHLC price data (Jan 2021 - Dec 2025)
// for 180 GCC companies + 6 stock exchange indexes using Geometric Brownian
// Motion (GBM). Also produces Fama-French factor returns and macroeconomic
// time series. All output is deterministic (seeded PRNG) and saved to JSON.
//
// Usage:
//   node server/generate-price-history.js
//
// Output:
//   server/data/price-history.json   ~  233,000 rows  (186 symbols x ~1,260 days)
//   server/data/factor-returns.json  ~    1,260 rows
//   server/data/macro-data.json      ~    1,260 rows
// =============================================================================

'use strict';

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Import companies and indexes from the shared seed-data module
// ---------------------------------------------------------------------------
const {
  companies,
  indexes,
  SECTOR_PROFILES,
  generateMetrics
} = require('./gcc-seed-data');

// ---------------------------------------------------------------------------
// Deterministic PRNG — identical algorithm to gcc-seed-data.js
// ---------------------------------------------------------------------------
function seededRandom(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return function () {
    hash = (hash * 1664525 + 1013904223) & 0x7fffffff;
    return hash / 0x7fffffff;
  };
}

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------

/** Clamp a value between min and max */
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/** Round to N decimal places */
function roundTo(value, decimals) {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/** Uniform random in [min, max) */
function randomInRange(rng, min, max) {
  return min + rng() * (max - min);
}

/**
 * Box-Muller transform: convert two uniform samples into a standard normal.
 * Returns a single N(0,1) value; the second value is discarded for simplicity.
 */
function normalRandom(rng) {
  let u1 = rng();
  let u2 = rng();
  // Prevent log(0)
  if (u1 < 1e-10) u1 = 1e-10;
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

/**
 * Generate the list of Mon-Fri trading dates between startDate and endDate
 * (inclusive). Returns ISO date strings (YYYY-MM-DD).
 */
function generateTradingDates(startDate, endDate) {
  const dates = [];
  const current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    const day = current.getDay(); // 0=Sun, 6=Sat
    if (day !== 0 && day !== 6) {
      dates.push(current.toISOString().slice(0, 10));
    }
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

// ---------------------------------------------------------------------------
// Sector volatility calibration (annualized)
// ---------------------------------------------------------------------------
const SECTOR_VOL = {
  'Energy':                   { drift: 0.08, vol: 0.28, oilBeta: 0.70 },
  'Financials':               { drift: 0.10, vol: 0.22, oilBeta: 0.30 },
  'Materials':                { drift: 0.07, vol: 0.26, oilBeta: 0.50 },
  'Communication Services':   { drift: 0.09, vol: 0.20, oilBeta: 0.10 },
  'Consumer Staples':         { drift: 0.06, vol: 0.16, oilBeta: 0.10 },
  'Consumer Discretionary':   { drift: 0.08, vol: 0.24, oilBeta: 0.20 },
  'Real Estate':              { drift: 0.07, vol: 0.22, oilBeta: 0.20 },
  'Utilities':                { drift: 0.05, vol: 0.18, oilBeta: 0.15 },
  'Industrials':              { drift: 0.07, vol: 0.22, oilBeta: 0.30 },
  'Healthcare':               { drift: 0.09, vol: 0.20, oilBeta: 0.05 },
  'Information Technology':   { drift: 0.12, vol: 0.30, oilBeta: 0.05 }
};

const DEFAULT_VOL = { drift: 0.07, vol: 0.22, oilBeta: 0.15 };

// ---------------------------------------------------------------------------
// Market regime shocks — injected as additive drift adjustments
// Each regime is defined by a date range and per-sector drift bump
// ---------------------------------------------------------------------------
const REGIME_SHOCKS = [
  {
    // 2022 Q1: Oil price spike — energy surges, broad market modest bump
    start: '2022-01-01',
    end: '2022-03-31',
    sectorBumps: {
      'Energy': 0.40,
      'Materials': 0.10,
      'Industrials': 0.05,
      '_default': 0.02
    }
  },
  {
    // 2022 Q3-Q4: Global rate hikes — financials benefit, real estate drops
    start: '2022-07-01',
    end: '2022-12-31',
    sectorBumps: {
      'Financials': 0.15,
      'Real Estate': -0.20,
      'Consumer Discretionary': -0.08,
      '_default': -0.03
    }
  },
  {
    // 2023 full year: GCC reform rally — broad market +15%
    start: '2023-01-01',
    end: '2023-12-31',
    sectorBumps: {
      'Energy': 0.10,
      'Financials': 0.12,
      'Communication Services': 0.18,
      'Consumer Discretionary': 0.15,
      'Real Estate': 0.12,
      'Information Technology': 0.20,
      'Healthcare': 0.15,
      '_default': 0.15
    }
  },
  {
    // 2024 H2: Tech/diversification theme — IT, healthcare outperform
    start: '2024-07-01',
    end: '2024-12-31',
    sectorBumps: {
      'Information Technology': 0.30,
      'Healthcare': 0.20,
      'Communication Services': 0.12,
      '_default': 0.03
    }
  }
];

/**
 * Determine the annualized drift adjustment for a given sector on a given date
 * by summing all active regime shocks.
 */
function getRegimeDriftBump(sector, dateStr) {
  let bump = 0;
  for (const regime of REGIME_SHOCKS) {
    if (dateStr >= regime.start && dateStr <= regime.end) {
      bump += (regime.sectorBumps[sector] !== undefined)
        ? regime.sectorBumps[sector]
        : (regime.sectorBumps['_default'] || 0);
    }
  }
  return bump;
}

// ---------------------------------------------------------------------------
// Macroeconomic series generators
// ---------------------------------------------------------------------------

/**
 * Generate a GBM macro series given start value, target end value, volatility,
 * and number of steps. Returns an array of values.
 */
function generateMacroGBM(rng, startVal, endVal, vol, numSteps) {
  // Compute the drift that gets us from startVal to endVal on average
  const totalTime = numSteps / 252;
  const annualDrift = Math.log(endVal / startVal) / totalTime;
  const dt = 1 / 252;
  const values = [startVal];
  let current = startVal;

  for (let i = 1; i < numSteps; i++) {
    const z = normalRandom(rng);
    const regimeFraction = i / numSteps;
    // Slowly pull drift toward the target trajectory
    const targetAtStep = startVal * Math.exp(annualDrift * (i * dt));
    const pullStrength = 0.002; // mean reversion strength
    const pull = pullStrength * (targetAtStep - current);
    current = current * Math.exp((annualDrift - 0.5 * vol * vol) * dt + vol * Math.sqrt(dt) * z) + pull;
    current = Math.max(current, startVal * 0.3); // floor at 30% of start
    values.push(current);
  }
  return values;
}

/**
 * Generate a mean-reverting series (Ornstein-Uhlenbeck process) for rates.
 * Useful for interest rates and FX that revert to a target.
 */
function generateOUProcess(rng, startVal, targets, vol, kappa, numSteps) {
  // targets is an array of {step, value} waypoints; we interpolate the mean
  const dt = 1 / 252;
  const values = [startVal];
  let current = startVal;

  for (let i = 1; i < numSteps; i++) {
    // Find the current target via linear interpolation between waypoints
    let target = targets[targets.length - 1].value;
    for (let j = 0; j < targets.length - 1; j++) {
      if (i >= targets[j].step && i < targets[j + 1].step) {
        const frac = (i - targets[j].step) / (targets[j + 1].step - targets[j].step);
        target = targets[j].value + frac * (targets[j + 1].value - targets[j + 1].value + targets[j + 1].value - targets[j].value);
        break;
      }
    }
    const z = normalRandom(rng);
    current = current + kappa * (target - current) * dt + vol * Math.sqrt(dt) * z;
    current = Math.max(current, 0.001);
    values.push(current);
  }
  return values;
}

// ---------------------------------------------------------------------------
// MAIN: Generate all data
// ---------------------------------------------------------------------------

console.log('='.repeat(72));
console.log('  VIFM GCC Historical Price Data Generator');
console.log('  Generating 5 years of daily OHLC data (2021-01-04 to 2025-12-31)');
console.log('='.repeat(72));
console.log();

const tradingDates = generateTradingDates('2021-01-04', '2025-12-31');
const numDays = tradingDates.length;
console.log(`Trading days generated: ${numDays}`);
console.log(`Date range: ${tradingDates[0]} to ${tradingDates[numDays - 1]}`);
console.log();

// ===== STEP 1: Generate macro data first (oil needed for correlated stock moves) =====

console.log('[1/4] Generating macroeconomic time series...');

const macroRng = seededRandom('MACRO_GCC_VIFM_2021');

// Oil WTI: $55 (2021) -> peak $85 (mid-2022) -> settle $75-80 (2023-2025)
const oilWtiRaw = generateMacroGBM(macroRng, 55, 78, 0.30, numDays);

// Oil Brent: WTI + $2-5 premium
const oilBrentRaw = oilWtiRaw.map((v, i) => v + 2 + macroRng() * 3);

// Gold: $1800 (2021) -> $2100 (2025) with modest vol
const goldRaw = generateMacroGBM(macroRng, 1800, 2100, 0.12, numDays);

// US 10Y yield: 1.5% (2021) -> 4.5% (2023) -> 4.0% (2025)
const us10yTargets = [
  { step: 0, value: 1.5 },
  { step: Math.floor(numDays * 0.20), value: 2.0 },   // mid 2021
  { step: Math.floor(numDays * 0.40), value: 3.0 },   // mid 2022
  { step: Math.floor(numDays * 0.55), value: 4.3 },   // early 2023
  { step: Math.floor(numDays * 0.65), value: 4.5 },   // mid 2023
  { step: Math.floor(numDays * 0.80), value: 4.2 },   // mid 2024
  { step: numDays - 1, value: 4.0 }                    // end 2025
];
const us10yRaw = generateOUProcess(macroRng, 1.5, us10yTargets, 0.5, 3.0, numDays);

// GCC interbank rate: US 10Y + 0.5% spread
const gccInterbankRaw = us10yRaw.map((v, i) => v + 0.4 + macroRng() * 0.2);

// FX rates — GCC pegs (tiny noise for non-pegged currencies)
const fxUsdSar = 3.75;   // Fixed
const fxUsdAed = 3.6725; // Fixed
const fxUsdQar = 3.64;   // Fixed
const fxUsdBhd = 0.376;  // Fixed
const fxUsdOmr = 0.385;  // Fixed

// KWD is a basket peg with slight movement
const kwdRng = seededRandom('KWD_FX_BASKET');
const kwdBase = 0.305;
const kwdSeries = [];
let kwdCurrent = kwdBase;
for (let i = 0; i < numDays; i++) {
  kwdCurrent += (kwdBase - kwdCurrent) * 0.01 + normalRandom(kwdRng) * 0.0002;
  kwdCurrent = clamp(kwdCurrent, 0.300, 0.310);
  kwdSeries.push(roundTo(kwdCurrent, 6));
}

// Compute daily oil returns for correlation with stocks
const oilDailyReturns = [0]; // first day has no return
for (let i = 1; i < numDays; i++) {
  oilDailyReturns.push((oilWtiRaw[i] - oilWtiRaw[i - 1]) / oilWtiRaw[i - 1]);
}

// Assemble macro data
const macroData = tradingDates.map((date, i) => ({
  date,
  oil_wti:            roundTo(oilWtiRaw[i], 2),
  oil_brent:          roundTo(oilBrentRaw[i], 2),
  gold_price:         roundTo(goldRaw[i], 2),
  us_10y_yield:       roundTo(clamp(us10yRaw[i], 0.1, 8.0), 4),
  gcc_interbank_rate: roundTo(clamp(gccInterbankRaw[i], 0.5, 8.5), 4),
  usd_sar:            fxUsdSar,
  usd_aed:            fxUsdAed,
  usd_kwd:            kwdSeries[i],
  usd_qar:            fxUsdQar,
  usd_bhd:            fxUsdBhd,
  usd_omr:            fxUsdOmr
}));

console.log(`  Macro data rows: ${macroData.length}`);

// ===== STEP 2: Generate price history for all companies + indexes =====

console.log('[2/4] Generating OHLC price history for companies and indexes...');

// We need company metrics for factor sorts (ROE, revenue_growth, equity)
const allMetrics = companies.map(generateMetrics);
const metricsMap = {};
allMetrics.forEach(m => { metricsMap[m.company_symbol] = m; });

/**
 * Derive a realistic starting price from market_cap.
 * We use a deterministic number of shares outstanding seeded by the symbol.
 */
function deriveStartPrice(entity) {
  const rng = seededRandom(entity.symbol + '_PRICE_START');
  const marketCap = entity.market_cap || 5000000000; // default for indexes

  // Shares outstanding: target a price in a "nice" range for the currency
  // For SAR/AED/QAR: ~5–300 range; KWD/BHD/OMR: ~0.1–5 range
  let priceFloor, priceCeil;
  switch (entity.currency) {
    case 'KWD': priceFloor = 0.10; priceCeil = 3.00; break;
    case 'BHD': priceFloor = 0.05; priceCeil = 2.00; break;
    case 'OMR': priceFloor = 0.05; priceCeil = 2.50; break;
    default:    priceFloor = 3.00; priceCeil = 300.00; break;
  }

  // Pick a price in range deterministically
  const rawPrice = priceFloor + rng() * (priceCeil - priceFloor);
  return roundTo(rawPrice, 4);
}

/**
 * Generate OHLC time series for a single entity using GBM.
 *
 * @param {Object} entity - Company or index object
 * @param {string} sectorOverride - Sector (for indexes we use 'Financials'-like moderate vol)
 * @param {boolean} isIndex - If true, use reduced volatility
 * @returns {Array} Array of {company_symbol, date, open, high, low, close, adjusted_close, volume, daily_return}
 */
function generateOHLC(entity, sectorOverride, isIndex) {
  const symbol = entity.symbol;
  const sector = sectorOverride || entity.sector || 'Financials';
  const sectorParams = SECTOR_VOL[sector] || DEFAULT_VOL;

  const rng = seededRandom(symbol + '_OHLC_DAILY');
  const dt = 1 / 252;

  let baseDrift = sectorParams.drift;
  let baseVol = sectorParams.vol;
  const oilBeta = sectorParams.oilBeta;

  // Indexes have ~60% the volatility of individual stocks
  if (isIndex) {
    baseVol *= 0.60;
    baseDrift *= 0.85;
  }

  // Add a small company-specific idiosyncratic component
  const idioVol = baseVol * randomInRange(rng, 0.85, 1.15);
  const idioDrift = baseDrift * randomInRange(rng, 0.80, 1.20);

  // Starting price
  let price;
  if (isIndex) {
    // Index levels are typically large numbers (e.g., 8000-12000 for TASI)
    const indexRng = seededRandom(symbol + '_INDEX_LEVEL');
    price = roundTo(randomInRange(indexRng, 4000, 12000), 4);
  } else {
    price = deriveStartPrice(entity);
  }

  // Base volume derived from market cap / price
  const marketCap = entity.market_cap || 5000000000;
  const baseVolume = Math.max(Math.round(marketCap / price / 100), 10000);

  const rows = [];
  let prevClose = price;

  for (let day = 0; day < numDays; day++) {
    const dateStr = tradingDates[day];

    // Regime-adjusted drift (annualized)
    const regimeBump = getRegimeDriftBump(sector, dateStr);
    const adjustedDrift = idioDrift + regimeBump;

    // Oil correlation component
    const oilReturn = oilDailyReturns[day];
    const oilComponent = oilBeta * oilReturn;

    // GBM step: S(t+1) = S(t) * exp((mu - sigma^2/2)*dt + sigma*sqrt(dt)*Z)
    const z = normalRandom(rng);
    const logReturn = (adjustedDrift - 0.5 * idioVol * idioVol) * dt
                    + idioVol * Math.sqrt(dt) * z
                    + oilComponent;
    const close = Math.max(prevClose * Math.exp(logReturn), 0.01);

    // Open: previous close with small gap
    const gapNoise = normalRandom(rng) * idioVol * Math.sqrt(dt) * 0.3;
    const open = Math.max(prevClose * (1 + gapNoise), 0.01);

    // Intraday vol for high/low
    const intradayVol = idioVol * Math.sqrt(dt) * 0.5;
    const high = Math.max(open, close) * (1 + Math.abs(normalRandom(rng) * intradayVol));
    const low  = Math.min(open, close) * (1 - Math.abs(normalRandom(rng) * intradayVol));
    const safeLow = Math.max(low, 0.01);

    // Volume with random variation
    const volMultiplier = 1 + normalRandom(rng) * 0.5;
    const volume = Math.max(Math.round(baseVolume * Math.abs(volMultiplier)), 1000);

    // Daily return
    const dailyReturn = (day === 0) ? 0 : (close - prevClose) / prevClose;

    rows.push({
      company_symbol: symbol,
      date: dateStr,
      open:           roundTo(open, 4),
      high:           roundTo(Math.max(high, Math.max(open, close)), 4),
      low:            roundTo(Math.min(safeLow, Math.min(open, close)), 4),
      close:          roundTo(close, 4),
      adjusted_close: roundTo(close, 4), // no splits/dividends in synthetic data
      volume:         volume,
      daily_return:   roundTo(dailyReturn, 8)
    });

    prevClose = close;
  }

  return rows;
}

// Generate for all 180 companies
const priceHistory = [];
const companyCloses = {}; // symbol -> array of close prices (for factor computation)

for (let i = 0; i < companies.length; i++) {
  const company = companies[i];
  const rows = generateOHLC(company, company.sector, false);
  priceHistory.push(...rows);
  companyCloses[company.symbol] = rows.map(r => r.close);

  if ((i + 1) % 30 === 0) {
    console.log(`  Companies processed: ${i + 1} / ${companies.length}`);
  }
}

// Generate for 6 indexes
for (const idx of indexes) {
  // Use a blended "Financials" profile for indexes (moderate vol)
  const rows = generateOHLC(idx, 'Financials', true);
  priceHistory.push(...rows);
  companyCloses[idx.symbol] = rows.map(r => r.close);
}

console.log(`  Total price rows: ${priceHistory.length.toLocaleString()}`);
console.log(`  Symbols: ${Object.keys(companyCloses).length} (${companies.length} companies + ${indexes.length} indexes)`);

// ===== STEP 3: Compute Fama-French factor returns =====

console.log('[3/4] Computing Fama-French factor returns...');

// Pre-compute daily returns for each company
const companyDailyReturns = {};
for (const company of companies) {
  const closes = companyCloses[company.symbol];
  const returns = [0]; // day 0 has no return
  for (let d = 1; d < numDays; d++) {
    returns.push((closes[d] - closes[d - 1]) / closes[d - 1]);
  }
  companyDailyReturns[company.symbol] = returns;
}

// Pre-compute sorting characteristics for each company
const companyCharacteristics = companies.map(company => {
  const metrics = metricsMap[company.symbol];
  return {
    symbol: company.symbol,
    marketCap: company.market_cap,
    // Book-to-market: equity / market_cap
    bookToMarket: metrics ? metrics.total_equity / company.market_cap : 0.5,
    // ROE for profitability sort
    roe: metrics ? metrics.roe : 10,
    // Revenue growth (inverse for CMA: conservative = low growth)
    revenueGrowth: metrics ? metrics.revenue_growth : 5
  };
});

/**
 * Compute a long-short factor return for a given day by sorting companies
 * on a characteristic and computing top 30% minus bottom 30% equal-weighted return.
 *
 * @param {number} dayIndex - Index into the trading day array
 * @param {string} sortKey - Key in companyCharacteristics to sort by
 * @param {boolean} reverse - If true, high values are "good" (default: high values go long)
 * @returns {number} Daily factor return
 */
function computeLongShortReturn(dayIndex, sortKey, reverse) {
  // Sort companies by the characteristic
  const sorted = [...companyCharacteristics].sort((a, b) => {
    return reverse ? (b[sortKey] - a[sortKey]) : (a[sortKey] - b[sortKey]);
  });

  const n = sorted.length;
  const cutoff = Math.floor(n * 0.3);

  // Bottom 30% (short leg) and top 30% (long leg)
  const shortLeg = sorted.slice(0, cutoff);
  const longLeg  = sorted.slice(n - cutoff);

  let shortReturn = 0;
  let longReturn  = 0;

  for (const c of shortLeg) {
    shortReturn += (companyDailyReturns[c.symbol]?.[dayIndex] || 0);
  }
  for (const c of longLeg) {
    longReturn += (companyDailyReturns[c.symbol]?.[dayIndex] || 0);
  }

  shortReturn /= shortLeg.length;
  longReturn  /= longLeg.length;

  return longReturn - shortReturn;
}

/**
 * Compute market-cap-weighted return of all companies for a given day.
 */
function computeMarketReturn(dayIndex) {
  let totalWeight = 0;
  let weightedReturn = 0;

  for (const company of companies) {
    const ret = companyDailyReturns[company.symbol]?.[dayIndex] || 0;
    const w = company.market_cap;
    weightedReturn += ret * w;
    totalWeight += w;
  }

  return totalWeight > 0 ? weightedReturn / totalWeight : 0;
}

// Risk-free rate schedule (annualized, varying over time)
// 2021: ~2%, rising to ~4% by mid-2023, plateauing
function getRiskFreeRate(dayIndex) {
  const frac = dayIndex / numDays;
  if (frac < 0.20) return 0.02;                              // 2021
  if (frac < 0.40) return 0.02 + (frac - 0.20) * 10;        // 2022: ramp 2% -> 4%
  if (frac < 0.60) return 0.04 + (frac - 0.40) * 2.5;       // 2023 H1: 4% -> 4.5%
  return 0.04;                                                // 2024-2025: ~4%
}

// Pre-compute 12-month trailing returns for momentum (need at least 252 days of history)
function computeMomentumReturn(dayIndex) {
  if (dayIndex < 252) {
    // Not enough history — use a placeholder
    return computeMarketReturn(dayIndex) * 0.02;
  }

  // Sort by 12-month trailing return
  const momChars = companies.map(company => {
    const closes = companyCloses[company.symbol];
    const trailingReturn = (closes[dayIndex] - closes[dayIndex - 252]) / closes[dayIndex - 252];
    return { symbol: company.symbol, mom: trailingReturn };
  });

  momChars.sort((a, b) => a.mom - b.mom);
  const n = momChars.length;
  const cutoff = Math.floor(n * 0.3);

  const shortLeg = momChars.slice(0, cutoff);
  const longLeg  = momChars.slice(n - cutoff);

  let shortReturn = 0;
  let longReturn  = 0;

  for (const c of shortLeg) {
    shortReturn += (companyDailyReturns[c.symbol]?.[dayIndex] || 0);
  }
  for (const c of longLeg) {
    longReturn += (companyDailyReturns[c.symbol]?.[dayIndex] || 0);
  }

  return (longReturn / longLeg.length) - (shortReturn / shortLeg.length);
}

// Build the factor returns array
const factorReturns = [];

for (let d = 0; d < numDays; d++) {
  const rfAnnual = getRiskFreeRate(d);
  const rfDaily  = rfAnnual / 252;

  const marketReturn = computeMarketReturn(d);

  // SMB: Small Minus Big (sort by marketCap ascending, top 30% small minus bottom 30% big)
  const smb = computeLongShortReturn(d, 'marketCap', false); // low cap long, high cap short

  // HML: High Minus Low book-to-market
  const hml = computeLongShortReturn(d, 'bookToMarket', true); // high B/M long

  // RMW: Robust Minus Weak profitability (high ROE long)
  const rmw = computeLongShortReturn(d, 'roe', true);

  // CMA: Conservative Minus Aggressive (low growth long, high growth short)
  const cma = computeLongShortReturn(d, 'revenueGrowth', false); // low growth long

  // MOM: Momentum
  const mom = computeMomentumReturn(d);

  // Oil factor: daily return of WTI
  const oilFactor = oilDailyReturns[d];

  factorReturns.push({
    date:           tradingDates[d],
    market_return:  roundTo(marketReturn - rfDaily, 8),  // Excess market return (Rm - Rf)
    smb:            roundTo(smb, 8),
    hml:            roundTo(hml, 8),
    rmw:            roundTo(rmw, 8),
    cma:            roundTo(cma, 8),
    mom:            roundTo(mom, 8),
    oil_factor:     roundTo(oilFactor, 8),
    risk_free_rate: roundTo(rfDaily, 8)
  });

  if ((d + 1) % 252 === 0) {
    console.log(`  Factor returns computed: day ${d + 1} / ${numDays}`);
  }
}

console.log(`  Factor return rows: ${factorReturns.length}`);

// ===== STEP 4: Save to JSON files =====

console.log('[4/4] Saving to JSON files...');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log(`  Created directory: ${dataDir}`);
}

// Helper to write JSON with progress
function writeJSON(filename, data, description) {
  const filePath = path.join(dataDir, filename);
  const jsonStr = JSON.stringify(data, null, 0); // compact (no pretty-print for large files)
  fs.writeFileSync(filePath, jsonStr, 'utf8');
  const sizeMB = (Buffer.byteLength(jsonStr, 'utf8') / (1024 * 1024)).toFixed(2);
  console.log(`  ${description}: ${filePath}`);
  console.log(`    Rows: ${data.length.toLocaleString()}, Size: ${sizeMB} MB`);
}

writeJSON('price-history.json', priceHistory, 'Price History');
writeJSON('factor-returns.json', factorReturns, 'Factor Returns');
writeJSON('macro-data.json', macroData, 'Macro Data');

// ===== Summary statistics =====

console.log();
console.log('='.repeat(72));
console.log('  Summary Statistics');
console.log('='.repeat(72));
console.log();

// Price history stats
const symbols = [...new Set(priceHistory.map(r => r.company_symbol))];
const companySymbols = symbols.filter(s => companies.find(c => c.symbol === s));
const indexSymbols = symbols.filter(s => indexes.find(idx => idx.symbol === s));

console.log(`  Total symbols:     ${symbols.length} (${companySymbols.length} companies, ${indexSymbols.length} indexes)`);
console.log(`  Trading days:      ${numDays}`);
console.log(`  Price data points: ${priceHistory.length.toLocaleString()}`);
console.log(`  Date range:        ${tradingDates[0]} to ${tradingDates[numDays - 1]}`);
console.log();

// Sample price trajectories (first and last close for a few companies)
console.log('  Sample price trajectories (close):');
const sampleSymbols = ['2222', 'FAB', 'QNBK', 'NBK', 'ALBA', 'BKMB'];
for (const sym of sampleSymbols) {
  const closes = companyCloses[sym];
  if (closes) {
    const name = companies.find(c => c.symbol === sym)?.name || sym;
    console.log(`    ${sym.padEnd(10)} ${name.padEnd(35)} ${roundTo(closes[0], 2)} -> ${roundTo(closes[numDays - 1], 2)} (${roundTo(((closes[numDays - 1] / closes[0]) - 1) * 100, 1)}%)`);
  }
}
console.log();

// Factor return stats
console.log('  Factor return annualized means:');
const factorKeys = ['market_return', 'smb', 'hml', 'rmw', 'cma', 'mom', 'oil_factor'];
for (const key of factorKeys) {
  const mean = factorReturns.reduce((sum, r) => sum + r[key], 0) / factorReturns.length;
  const annualized = roundTo(mean * 252 * 100, 2);
  console.log(`    ${key.padEnd(16)} ${annualized > 0 ? '+' : ''}${annualized}%`);
}
console.log();

// Macro data range
console.log('  Macro data ranges:');
const macroKeys = ['oil_wti', 'oil_brent', 'gold_price', 'us_10y_yield', 'gcc_interbank_rate'];
for (const key of macroKeys) {
  const values = macroData.map(r => r[key]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  console.log(`    ${key.padEnd(22)} ${roundTo(min, 2)} - ${roundTo(max, 2)}`);
}

console.log();
console.log('Done. Files saved to server/data/');
console.log('='.repeat(72));
