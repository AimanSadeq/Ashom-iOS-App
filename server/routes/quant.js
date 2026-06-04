// =============================================================================
// Quantitative Finance API Routes
// VIFM GCC Financial Analysis Platform
// =============================================================================
// Provides endpoints for factor models, risk analytics, portfolio optimization,
// valuation models, and financial scoring for 180 GCC-listed companies.
// =============================================================================

'use strict';

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Import computation engine and seed data
const quant = require('../quant-engine');
const { companies, generateMetrics } = require('../gcc-seed-data');

// ---------------------------------------------------------------------------
// In-memory data caches (lazy-loaded on first request)
// ---------------------------------------------------------------------------

let priceCache = null;
let factorCache = null;
let macroCache = null;

function loadPriceHistory() {
  if (!priceCache) {
    const dataPath = path.join(__dirname, '..', 'data', 'price-history.json');
    if (fs.existsSync(dataPath)) {
      priceCache = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    } else {
      console.warn('price-history.json not found, using empty dataset');
      priceCache = [];
    }
  }
  return priceCache;
}

function loadFactorReturns() {
  if (!factorCache) {
    const dataPath = path.join(__dirname, '..', 'data', 'factor-returns.json');
    if (fs.existsSync(dataPath)) {
      factorCache = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    } else {
      console.warn('factor-returns.json not found, using empty dataset');
      factorCache = [];
    }
  }
  return factorCache;
}

function loadMacroData() {
  if (!macroCache) {
    const dataPath = path.join(__dirname, '..', 'data', 'macro-data.json');
    if (fs.existsSync(dataPath)) {
      macroCache = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    } else {
      console.warn('macro-data.json not found, using empty dataset');
      macroCache = [];
    }
  }
  return macroCache;
}

// ---------------------------------------------------------------------------
// Date range helper
// ---------------------------------------------------------------------------

function getDateCutoff(range) {
  const now = new Date('2025-12-31'); // End of generated data
  const cutoffs = {
    '1M': 30, '3M': 90, '6M': 180,
    '1Y': 365, '3Y': 1095, '5Y': 1825, 'ALL': 99999
  };
  const days = cutoffs[range] || 365;
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - days);
  return cutoff.toISOString().split('T')[0];
}

function filterByDateRange(data, range, dateField = 'date') {
  if (range === 'ALL') return data;
  const cutoff = getDateCutoff(range);
  return data.filter(row => row[dateField] >= cutoff);
}

// ---------------------------------------------------------------------------
// Company lookup helper
// ---------------------------------------------------------------------------

function findCompany(symbol) {
  return companies.find(
    c => c.symbol === symbol || c.symbol.toLowerCase() === symbol.toLowerCase()
  );
}

// ---------------------------------------------------------------------------
// Route 1: GET /price-history/:symbol
// Returns historical price data for a single company
// ---------------------------------------------------------------------------

router.get('/price-history/:symbol', (req, res) => {
  try {
    const { symbol } = req.params;
    const range = req.query.range || '1Y';

    const company = findCompany(symbol);
    const allPrices = loadPriceHistory();
    const symbolPrices = allPrices.filter(p => p.company_symbol === symbol);

    if (symbolPrices.length === 0) {
      return res.status(404).json({
        success: false,
        error: `No price history found for symbol: ${symbol}`
      });
    }

    const filtered = filterByDateRange(symbolPrices, range);

    res.json({
      success: true,
      data: {
        symbol,
        company_name: company ? company.name : symbol,
        prices: filtered,
        count: filtered.length
      }
    });
  } catch (error) {
    console.error('Quant API error (price-history):', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ---------------------------------------------------------------------------
// Route 2: GET /factor-returns
// Returns Fama-French / Carhart factor return time series
// ---------------------------------------------------------------------------

router.get('/factor-returns', (req, res) => {
  try {
    const range = req.query.range || '5Y';
    const allFactors = loadFactorReturns();
    const filtered = filterByDateRange(allFactors, range);

    const dates = filtered.map(r => r.date);

    res.json({
      success: true,
      data: {
        factors: filtered,
        count: filtered.length,
        dateRange: {
          from: dates.length ? dates[0] : null,
          to: dates.length ? dates[dates.length - 1] : null
        }
      }
    });
  } catch (error) {
    console.error('Quant API error (factor-returns):', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ---------------------------------------------------------------------------
// Route 3: GET /macro-data
// Returns macroeconomic indicator time series
// ---------------------------------------------------------------------------

router.get('/macro-data', (req, res) => {
  try {
    const range = req.query.range || '5Y';
    const allMacro = loadMacroData();
    const filtered = filterByDateRange(allMacro, range);

    res.json({
      success: true,
      data: {
        macroData: filtered,
        count: filtered.length
      }
    });
  } catch (error) {
    console.error('Quant API error (macro-data):', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ---------------------------------------------------------------------------
// Route 4: POST /factor-model
// Runs CAPM, Fama-French 3/5, or Carhart 4-factor regression
// ---------------------------------------------------------------------------

router.post('/factor-model', (req, res) => {
  try {
    const { symbol, model, range } = req.body;

    if (!symbol || !model) {
      return res.status(400).json({
        success: false,
        error: 'Required fields: symbol, model (capm|ff3|ff5|carhart)'
      });
    }

    const validModels = ['capm', 'ff3', 'ff5', 'carhart'];
    if (!validModels.includes(model)) {
      return res.status(400).json({
        success: false,
        error: `Invalid model. Must be one of: ${validModels.join(', ')}`
      });
    }

    const dateRange = range || '3Y';
    const allPrices = loadPriceHistory();
    const allFactors = loadFactorReturns();

    // Filter price history for the requested symbol and date range
    const stockPrices = filterByDateRange(
      allPrices.filter(p => p.company_symbol === symbol),
      dateRange
    );

    if (stockPrices.length === 0) {
      return res.status(404).json({
        success: false,
        error: `No price data found for symbol: ${symbol}`
      });
    }

    const factorData = filterByDateRange(allFactors, dateRange);

    // Build date-indexed lookup for alignment
    const factorByDate = {};
    factorData.forEach(f => { factorByDate[f.date] = f; });

    // Align: only use dates present in both datasets
    const alignedStock = [];
    const alignedFactors = [];

    stockPrices.forEach(p => {
      if (factorByDate[p.date] && p.daily_return !== undefined && p.daily_return !== null) {
        alignedStock.push(p);
        alignedFactors.push(factorByDate[p.date]);
      }
    });

    if (alignedStock.length < 30) {
      return res.status(400).json({
        success: false,
        error: `Insufficient aligned data points (${alignedStock.length}). Need at least 30.`
      });
    }

    // Calculate excess returns (stock return minus risk-free rate)
    const excessReturns = alignedStock.map((p, i) =>
      p.daily_return - (alignedFactors[i].risk_free_rate || 0)
    );

    const marketExcess = alignedFactors.map(f =>
      f.market_return - (f.risk_free_rate || 0)
    );

    // Run the appropriate model
    let result;
    switch (model) {
      case 'capm': {
        const beta = quant.calculateBeta(
          alignedStock.map(p => p.daily_return),
          alignedFactors.map(f => f.market_return)
        );
        // Pass marketExcess as flat array — olsRegression wraps each X[i] in [X[i]] when it's not an array
        result = quant.olsRegression(excessReturns, marketExcess);
        result.beta = beta;
        break;
      }
      case 'ff3': {
        // Build X matrix: rows = observations, columns = [market_excess, smb, hml]
        const ff3X = alignedFactors.map(f => [
          f.market_return - (f.risk_free_rate || 0),
          f.smb || 0,
          f.hml || 0
        ]);
        result = quant.olsRegression(excessReturns, ff3X);
        break;
      }
      case 'ff5': {
        const ff5X = alignedFactors.map(f => [
          f.market_return - (f.risk_free_rate || 0),
          f.smb || 0,
          f.hml || 0,
          f.rmw || 0,
          f.cma || 0
        ]);
        result = quant.olsRegression(excessReturns, ff5X);
        break;
      }
      case 'carhart': {
        const c4X = alignedFactors.map(f => [
          f.market_return - (f.risk_free_rate || 0),
          f.smb || 0,
          f.hml || 0,
          f.mom || 0
        ]);
        result = quant.olsRegression(excessReturns, c4X);
        break;
      }
    }

    const company = findCompany(symbol);

    res.json({
      success: true,
      data: {
        symbol,
        company_name: company ? company.name : symbol,
        model,
        observations: alignedStock.length,
        dateRange: {
          from: alignedStock[0].date,
          to: alignedStock[alignedStock.length - 1].date
        },
        regression: result
      }
    });
  } catch (error) {
    console.error('Quant API error (factor-model):', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ---------------------------------------------------------------------------
// Route 5: POST /regression
// Custom OLS regression with user-specified variables and diagnostics
// ---------------------------------------------------------------------------

router.post('/regression', (req, res) => {
  try {
    const { dependent, independents, range } = req.body;

    if (!dependent || !independents || !Array.isArray(independents) || independents.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Required: dependent (object), independents (array of objects)'
      });
    }

    const dateRange = range || '3Y';
    const allPrices = loadPriceHistory();
    const allFactors = loadFactorReturns();
    const allMacro = loadMacroData();

    // Build date-indexed lookups
    const factorByDate = {};
    filterByDateRange(allFactors, dateRange).forEach(f => { factorByDate[f.date] = f; });

    const macroByDate = {};
    filterByDateRange(allMacro, dateRange).forEach(m => { macroByDate[m.date] = m; });

    // Collect all available dates from factor data as the base timeline
    const allDates = Object.keys(factorByDate).sort();

    // Build dependent variable (Y)
    let yValues = [];
    let usableDates = [];

    if (dependent.type === 'stock_return' && dependent.symbol) {
      const stockPrices = filterByDateRange(
        allPrices.filter(p => p.company_symbol === dependent.symbol),
        dateRange
      );
      const priceByDate = {};
      stockPrices.forEach(p => { priceByDate[p.date] = p; });

      allDates.forEach(date => {
        if (priceByDate[date] && priceByDate[date].daily_return !== undefined) {
          usableDates.push(date);
          yValues.push(priceByDate[date].daily_return);
        }
      });
    } else if (dependent.type === 'factor' && dependent.name) {
      allDates.forEach(date => {
        const f = factorByDate[date];
        if (f && f[dependent.name] !== undefined) {
          usableDates.push(date);
          yValues.push(f[dependent.name]);
        }
      });
    } else {
      return res.status(400).json({
        success: false,
        error: 'Dependent variable must specify type (stock_return or factor) and symbol/name'
      });
    }

    // Build independent variables (X matrix columns)
    const xColumns = [];
    const xLabels = [];

    independents.forEach(ind => {
      const col = [];
      if (ind.type === 'factor' && ind.name) {
        xLabels.push(ind.name);
        usableDates.forEach(date => {
          const f = factorByDate[date];
          col.push(f ? (f[ind.name] || 0) : 0);
        });
      } else if (ind.type === 'macro' && ind.name) {
        xLabels.push(ind.name);
        usableDates.forEach(date => {
          const m = macroByDate[date];
          col.push(m ? (m[ind.name] || 0) : 0);
        });
      } else if (ind.type === 'stock_return' && ind.symbol) {
        xLabels.push(`return_${ind.symbol}`);
        const stockPrices = filterByDateRange(
          allPrices.filter(p => p.company_symbol === ind.symbol),
          dateRange
        );
        const priceByDate = {};
        stockPrices.forEach(p => { priceByDate[p.date] = p; });
        usableDates.forEach(date => {
          const p = priceByDate[date];
          col.push(p ? (p.daily_return || 0) : 0);
        });
      }
      xColumns.push(col);
    });

    if (yValues.length < 30) {
      return res.status(400).json({
        success: false,
        error: `Insufficient data points (${yValues.length}). Need at least 30.`
      });
    }

    // Transpose xColumns from column-major [k][n] to row-major [n][k]
    // olsRegression expects X[i] = row for observation i
    const nObs = yValues.length;
    const xRows = [];
    for (let i = 0; i < nObs; i++) {
      const row = [];
      for (let j = 0; j < xColumns.length; j++) {
        row.push(xColumns[j][i] || 0);
      }
      xRows.push(row);
    }

    // Run OLS regression
    const regressionResult = quant.olsRegression(yValues, xRows);

    // Run diagnostic tests
    const diagnostics = {};

    try {
      diagnostics.heteroscedasticity = quant.heteroscedasticityTest(
        regressionResult.residuals, xRows
      );
    } catch (e) {
      diagnostics.heteroscedasticity = { error: e.message };
    }

    try {
      diagnostics.jarqueBera = quant.jarqueBeraTest(regressionResult.residuals);
    } catch (e) {
      diagnostics.jarqueBera = { error: e.message };
    }

    try {
      diagnostics.vif = quant.vif(xRows);
    } catch (e) {
      diagnostics.vif = { error: e.message };
    }

    res.json({
      success: true,
      data: {
        dependent,
        independents: xLabels,
        observations: yValues.length,
        dateRange: {
          from: usableDates[0],
          to: usableDates[usableDates.length - 1]
        },
        regression: regressionResult,
        diagnostics
      }
    });
  } catch (error) {
    console.error('Quant API error (regression):', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ---------------------------------------------------------------------------
// Route 6: POST /var
// Value at Risk and Conditional VaR calculation
// ---------------------------------------------------------------------------

router.post('/var', (req, res) => {
  try {
    const {
      symbol, symbols,
      method = 'parametric',
      confidence = 0.95,
      horizon = 1,
      simulations = 10000,
      range = '1Y'
    } = req.body;

    const targetSymbols = symbols || (symbol ? [symbol] : []);

    if (targetSymbols.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Required: symbol (string) or symbols (array)'
      });
    }

    const validMethods = ['parametric', 'historical', 'montecarlo'];
    if (!validMethods.includes(method)) {
      return res.status(400).json({
        success: false,
        error: `Invalid method. Must be one of: ${validMethods.join(', ')}`
      });
    }

    const allPrices = loadPriceHistory();

    // Load returns for each symbol and align dates
    const returnsBySymbol = {};
    targetSymbols.forEach(sym => {
      const symPrices = filterByDateRange(
        allPrices.filter(p => p.company_symbol === sym),
        range
      );
      symPrices.forEach(p => {
        if (p.daily_return !== undefined && p.daily_return !== null) {
          if (!returnsBySymbol[sym]) returnsBySymbol[sym] = {};
          returnsBySymbol[sym][p.date] = p.daily_return;
        }
      });
    });

    // Find common dates across all symbols
    const dateSets = targetSymbols.map(sym => new Set(Object.keys(returnsBySymbol[sym] || {})));
    let commonDates = [...(dateSets[0] || [])].filter(
      date => dateSets.every(s => s.has(date))
    ).sort();

    if (commonDates.length < 20) {
      return res.status(400).json({
        success: false,
        error: `Insufficient aligned data (${commonDates.length} days). Need at least 20.`
      });
    }

    // Calculate portfolio returns (equal-weighted if multiple symbols)
    let returns;
    if (targetSymbols.length === 1) {
      returns = commonDates.map(d => returnsBySymbol[targetSymbols[0]][d]);
    } else {
      const weight = 1 / targetSymbols.length;
      returns = commonDates.map(d =>
        targetSymbols.reduce((sum, sym) => sum + returnsBySymbol[sym][d] * weight, 0)
      );
    }

    // Calculate VaR using the specified method
    let varResult;
    switch (method) {
      case 'parametric':
        varResult = quant.parametricVaR(returns, confidence, horizon);
        break;
      case 'historical':
        varResult = quant.historicalVaR(returns, confidence, horizon);
        break;
      case 'montecarlo':
        varResult = quant.monteCarloVaR(returns, confidence, horizon, simulations);
        break;
    }

    // Calculate CVaR (Expected Shortfall)
    const cvarResult = quant.cvar(returns, confidence);

    // Return statistics
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((a, b) => a + (b - mean) ** 2, 0) / (returns.length - 1);
    const stdDev = Math.sqrt(variance);
    const n = returns.length;
    const skewness = (returns.reduce((a, b) => a + ((b - mean) / stdDev) ** 3, 0)) / n;
    const kurtosis = (returns.reduce((a, b) => a + ((b - mean) / stdDev) ** 4, 0)) / n - 3;

    res.json({
      success: true,
      data: {
        symbols: targetSymbols,
        var: varResult,
        cvar: cvarResult,
        method,
        confidence,
        horizon,
        observations: returns.length,
        returnStats: {
          mean: +mean.toFixed(6),
          stdDev: +stdDev.toFixed(6),
          skewness: +skewness.toFixed(4),
          kurtosis: +kurtosis.toFixed(4)
        }
      }
    });
  } catch (error) {
    console.error('Quant API error (var):', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ---------------------------------------------------------------------------
// Route 7: POST /risk-metrics
// Comprehensive risk/performance metrics for a single stock
// ---------------------------------------------------------------------------

router.post('/risk-metrics', (req, res) => {
  try {
    const { symbol, range = '1Y' } = req.body;

    if (!symbol) {
      return res.status(400).json({ success: false, error: 'Required: symbol' });
    }

    const allPrices = loadPriceHistory();
    const allFactors = loadFactorReturns();

    const stockPrices = filterByDateRange(
      allPrices.filter(p => p.company_symbol === symbol),
      range
    );

    if (stockPrices.length < 20) {
      return res.status(404).json({
        success: false,
        error: `Insufficient price data for symbol: ${symbol} (found ${stockPrices.length} days)`
      });
    }

    // Align with factor data for market returns
    const factorByDate = {};
    filterByDateRange(allFactors, range).forEach(f => { factorByDate[f.date] = f; });

    const stockReturns = [];
    const marketReturns = [];
    const riskFreeRates = [];

    stockPrices.forEach(p => {
      const f = factorByDate[p.date];
      if (f && p.daily_return !== undefined && p.daily_return !== null) {
        stockReturns.push(p.daily_return);
        marketReturns.push(f.market_return);
        riskFreeRates.push(f.risk_free_rate || 0);
      }
    });

    if (stockReturns.length < 20) {
      return res.status(400).json({
        success: false,
        error: `Insufficient aligned data (${stockReturns.length} days). Need at least 20.`
      });
    }

    // Average annualized risk-free rate
    const avgRf = (riskFreeRates.reduce((a, b) => a + b, 0) / riskFreeRates.length) * 252;

    // Annualized return and volatility
    const meanDaily = stockReturns.reduce((a, b) => a + b, 0) / stockReturns.length;
    const annualizedReturn = meanDaily * 252;
    const dailyVar = stockReturns.reduce((a, b) => a + (b - meanDaily) ** 2, 0) / (stockReturns.length - 1);
    const annualizedVol = Math.sqrt(dailyVar * 252);

    // Calculate all risk metrics
    const beta = quant.calculateBeta(stockReturns, marketReturns);
    const annualizedMktReturn = (marketReturns.reduce((a, b) => a + b, 0) / marketReturns.length) * 252;
    // capmExpectedReturn(beta, marketReturn, riskFreeRate) — pass beta.beta since calculateBeta returns an object
    const alpha = annualizedReturn - quant.capmExpectedReturn(beta.beta, annualizedMktReturn, avgRf);

    const sharpe = quant.sharpeRatio(stockReturns, avgRf / 252);
    const sortino = quant.sortinoRatio(stockReturns, avgRf / 252);
    const treynor = quant.treynorRatio(stockReturns, marketReturns, avgRf / 252);
    const informationR = quant.informationRatio(stockReturns, marketReturns);
    const calmar = quant.calmarRatio(stockReturns);
    const omega = quant.omegaRatio(stockReturns, avgRf / 252);
    const trackingErr = quant.trackingError(stockReturns, marketReturns);
    const mdd = quant.maxDrawdown(stockReturns);
    const var95 = quant.parametricVaR(stockReturns, 0.95, 1);

    const company = findCompany(symbol);

    res.json({
      success: true,
      data: {
        symbol,
        company_name: company ? company.name : symbol,
        observations: stockReturns.length,
        metrics: {
          beta,
          alpha: +alpha.toFixed(4),
          sharpe,
          sortino,
          treynor,
          informationRatio: informationR,
          calmar,
          omega,
          trackingError: trackingErr,
          maxDrawdown: mdd,
          annualizedReturn: +annualizedReturn.toFixed(4),
          annualizedVolatility: +annualizedVol.toFixed(4),
          var95
        }
      }
    });
  } catch (error) {
    console.error('Quant API error (risk-metrics):', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ---------------------------------------------------------------------------
// Route 8: POST /optimize
// Mean-variance portfolio optimization (frontier, min-var, tangency, risk parity)
// ---------------------------------------------------------------------------

router.post('/optimize', (req, res) => {
  try {
    const {
      symbols,
      range = '3Y',
      riskFreeRate = 0.04,
      constraints = {},
      numFrontierPoints = 50
    } = req.body;

    if (!symbols || !Array.isArray(symbols) || symbols.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Required: symbols (array of at least 2 symbols)'
      });
    }

    const allPrices = loadPriceHistory();

    // Load daily returns for each symbol, indexed by date
    const returnsBySymbol = {};
    symbols.forEach(sym => {
      returnsBySymbol[sym] = {};
      const symPrices = filterByDateRange(
        allPrices.filter(p => p.company_symbol === sym),
        range
      );
      symPrices.forEach(p => {
        if (p.daily_return !== undefined && p.daily_return !== null) {
          returnsBySymbol[sym][p.date] = p.daily_return;
        }
      });
    });

    // Find common dates
    const dateSets = symbols.map(sym => new Set(Object.keys(returnsBySymbol[sym])));
    const commonDates = [...dateSets[0]].filter(
      d => dateSets.every(s => s.has(d))
    ).sort();

    if (commonDates.length < 60) {
      return res.status(400).json({
        success: false,
        error: `Insufficient aligned data (${commonDates.length} days). Need at least 60 for optimization.`
      });
    }

    // Build returns arrays per symbol (each is a time series)
    const returnsByAsset = symbols.map(sym =>
      commonDates.map(d => returnsBySymbol[sym][d])
    );

    // Annualized expected returns
    const expectedReturns = returnsByAsset.map(r => {
      const m = r.reduce((a, b) => a + b, 0) / r.length;
      return m * 252;
    });

    // Transpose to T×N matrix (rows = observations, columns = assets) for covarianceMatrix/correlationMatrix
    const T = commonDates.length;
    const returnsMatrix = [];
    for (let t = 0; t < T; t++) {
      const row = [];
      for (let j = 0; j < symbols.length; j++) {
        row.push(returnsByAsset[j][t]);
      }
      returnsMatrix.push(row);
    }

    const covMatrix = quant.covarianceMatrix(returnsMatrix);
    const corrMatrix = quant.correlationMatrix(returnsMatrix);

    // Scale covariance to annual
    const annualCov = covMatrix.map(row => row.map(v => v * 252));

    // Run optimizations
    const frontier = quant.efficientFrontier(
      expectedReturns, annualCov, numFrontierPoints, constraints
    );
    const minVariance = quant.minimumVariancePortfolio(annualCov, constraints);
    const tangency = quant.tangencyPortfolio(expectedReturns, annualCov, riskFreeRate, constraints);
    const riskParity = quant.riskParityPortfolio(annualCov);

    // Individual stock statistics
    const dailyRf = riskFreeRate / 252;
    const individualStats = symbols.map((sym, i) => {
      const r = returnsByAsset[i];
      const mean = r.reduce((a, b) => a + b, 0) / r.length;
      const vol = Math.sqrt(r.reduce((a, b) => a + (b - mean) ** 2, 0) / (r.length - 1));
      return {
        symbol: sym,
        company_name: (findCompany(sym) || {}).name || sym,
        annualizedReturn: +(mean * 252).toFixed(4),
        annualizedVolatility: +(vol * Math.sqrt(252)).toFixed(4),
        sharpe: quant.sharpeRatio(r, dailyRf)
      };
    });

    res.json({
      success: true,
      data: {
        symbols,
        observations: commonDates.length,
        frontier,
        minVariance,
        tangency,
        riskParity,
        correlationMatrix: corrMatrix,
        individualStats
      }
    });
  } catch (error) {
    console.error('Quant API error (optimize):', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ---------------------------------------------------------------------------
// Route 9: POST /valuation
// DCF, DDM (Gordon Growth, Multi-Stage), and Residual Income valuation
// ---------------------------------------------------------------------------

router.post('/valuation', (req, res) => {
  try {
    const { method, params } = req.body;

    if (!method || !params) {
      return res.status(400).json({
        success: false,
        error: 'Required: method (dcf|ddm|multiStageDDM|residualIncome), params (object)'
      });
    }

    let result;

    switch (method) {
      case 'dcf':
        if (!params.freeCashFlows || !params.wacc || params.terminalGrowthRate === undefined) {
          return res.status(400).json({
            success: false,
            error: 'DCF requires: freeCashFlows (array), wacc, terminalGrowthRate, sharesOutstanding'
          });
        }
        result = quant.dcf(
          params.freeCashFlows,
          params.wacc,
          params.terminalGrowthRate,
          params.sharesOutstanding
        );
        break;

      case 'ddm':
        if (!params.currentDividend || !params.growthRate || !params.requiredReturn) {
          return res.status(400).json({
            success: false,
            error: 'DDM requires: currentDividend, growthRate, requiredReturn'
          });
        }
        result = quant.gordonGrowthDDM(
          params.currentDividend,
          params.growthRate,
          params.requiredReturn
        );
        break;

      case 'multiStageDDM':
        if (!params.currentDividend || !params.stages || !params.requiredReturn) {
          return res.status(400).json({
            success: false,
            error: 'Multi-Stage DDM requires: currentDividend, stages (array of {years, growthRate}), requiredReturn'
          });
        }
        result = quant.multiStageDDM(
          params.currentDividend,
          params.stages,
          params.requiredReturn
        );
        break;

      case 'residualIncome':
        if (!params.bookValue || !params.roe || !params.costOfEquity) {
          return res.status(400).json({
            success: false,
            error: 'Residual Income requires: bookValue, roe, costOfEquity, fadeYears, terminalROE'
          });
        }
        result = quant.residualIncome(
          params.bookValue,
          params.roe,
          params.costOfEquity,
          params.fadeYears,
          params.terminalROE
        );
        break;

      default:
        return res.status(400).json({
          success: false,
          error: `Unknown valuation method: ${method}. Use dcf, ddm, multiStageDDM, or residualIncome.`
        });
    }

    // If sensitivity analysis params are provided for DCF, include it
    let sensitivity = null;
    if (method === 'dcf' && params.sensitivity) {
      sensitivity = quant.dcfSensitivity(
        params.freeCashFlows,
        params.wacc,
        params.terminalGrowthRate,
        params.sharesOutstanding,
        params.sensitivity
      );
    }

    res.json({
      success: true,
      data: {
        method,
        valuation: result,
        sensitivity
      }
    });
  } catch (error) {
    console.error('Quant API error (valuation):', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ---------------------------------------------------------------------------
// Route 10: POST /scoring
// Financial health scoring: Altman Z, Piotroski F, Beneish M, DuPont
// ---------------------------------------------------------------------------

router.post('/scoring', (req, res) => {
  try {
    const { symbol } = req.body;

    if (!symbol) {
      return res.status(400).json({ success: false, error: 'Required: symbol' });
    }

    const company = findCompany(symbol);
    if (!company) {
      return res.status(404).json({
        success: false,
        error: `Company not found: ${symbol}`
      });
    }

    const metrics = generateMetrics(company);

    // Map underscore-named fields to camelCase + derive missing fields
    const totalAssets = metrics.total_assets || 1;
    const totalDebt = metrics.total_debt || 0;
    const totalEquity = metrics.total_equity || 1;
    const netIncome = metrics.net_income || 0;
    const revenue = metrics.revenue || 0;
    const operatingCashFlow = metrics.operating_cash_flow || 0;
    const freeCashFlow = metrics.free_cash_flow || 0;
    const currentRatio = metrics.current_ratio || 1;
    const debtToEquity = metrics.debt_to_equity || 0;
    const roe = metrics.roe || 0;
    const roa = metrics.roa || 0;
    const peRatio = metrics.pe_ratio || 15;

    // Derived fields for Altman Z
    const workingCapital = totalAssets * (currentRatio > 1 ? 0.15 : -0.05); // approximate
    const retainedEarnings = totalEquity * 0.6; // approximate
    const ebit = netIncome * 1.3; // approximate pre-tax, pre-interest
    const marketCap = netIncome > 0 ? netIncome * peRatio : totalEquity * 1.5;
    const sales = revenue;

    // Build scoring input object
    const scoringData = {
      workingCapital, retainedEarnings, ebit, marketCap, totalDebt,
      totalAssets, sales, netIncome, operatingCashFlow,
      roa, roaPrior: roa * 0.95,
      currentRatio, currentRatioPrior: currentRatio * 0.98,
      longTermDebt: totalDebt * 0.7, longTermDebtPrior: totalDebt * 0.75,
      sharesOutstanding: 1000, sharesOutstandingPrior: 1000,
      grossMargin: 0.35, grossMarginPrior: 0.33,
      assetTurnover: revenue / totalAssets,
      assetTurnoverPrior: (revenue / totalAssets) * 0.97,
      // Beneish M-Score fields
      receivables: revenue * 0.12, receivablesPrior: revenue * 0.11,
      salesPrior: revenue * (1 - (metrics.revenue_growth || 10) / 100),
      cogs: revenue * 0.65, cogsPrior: revenue * 0.66,
      ppe: totalAssets * 0.3, ppePrior: totalAssets * 0.31,
      longTermAssets: totalAssets * 0.6, longTermAssetsPrior: totalAssets * 0.61,
      totalAssetsPrior: totalAssets * 0.97,
      depreciation: totalAssets * 0.03, depreciationPrior: totalAssets * 0.03,
      sga: revenue * 0.15, sgaPrior: revenue * 0.14
    };

    // Run all scoring models
    const altmanZ = quant.altmanZScore(scoringData);
    const altmanZEM = quant.altmanZScoreEM(scoringData);
    const piotroskiF = quant.piotroskiFScore(scoringData);
    const beneishM = quant.beneishMScore(scoringData);

    // DuPont takes individual arguments, not an object
    const dupont3 = quant.dupontAnalysis3(netIncome, revenue, totalAssets, totalEquity);

    // For DuPont 5, derive additional inputs
    const taxRate = 0.15; // GCC typical corporate tax
    const interestExpense = totalDebt * 0.05;
    const pretaxIncome = netIncome / (1 - taxRate);
    const dupont5 = quant.dupontAnalysis5(ebit, revenue, totalAssets, totalEquity, interestExpense, taxRate, pretaxIncome);

    res.json({
      success: true,
      data: {
        symbol,
        company_name: company.name,
        country: company.country,
        sector: company.sector,
        metrics,
        scores: {
          altmanZScore: altmanZ,
          altmanZScoreEM: altmanZEM,
          piotroskiFScore: piotroskiF,
          beneishMScore: beneishM,
          dupontAnalysis3: dupont3,
          dupontAnalysis5: dupont5
        }
      }
    });
  } catch (error) {
    console.error('Quant API error (scoring):', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ---------------------------------------------------------------------------
// Route 11: POST /vision2030
// Vision 2030 Diversification Score — single or batch mode
// ---------------------------------------------------------------------------

router.post('/vision2030', (req, res) => {
  try {
    const { symbol, batch, country } = req.body;

    if (!symbol && !batch) {
      return res.status(400).json({ success: false, error: 'Required: symbol (single) or batch: true' });
    }

    // --- Single company mode ---
    if (symbol && !batch) {
      const company = findCompany(symbol);
      if (!company) {
        return res.status(404).json({ success: false, error: `Company not found: ${symbol}` });
      }
      const metrics = generateMetrics(company);
      const scoreResult = quant.vision2030Score({
        sector: company.sector,
        country: company.country,
        currentRatio: metrics.current_ratio,
        debtToEquity: metrics.debt_to_equity,
        freeCashFlow: metrics.free_cash_flow,
        roa: metrics.roa,
        revenueGrowth: metrics.revenue_growth,
        roe: metrics.roe,
        dividendYield: metrics.dividend_yield,
        totalAssets: metrics.total_assets
      });
      return res.json({
        success: true,
        data: {
          symbol: company.symbol,
          company_name: company.name,
          country: company.country,
          sector: company.sector,
          ...scoreResult
        }
      });
    }

    // --- Batch mode ---
    let targetCompanies = companies;
    if (country) {
      targetCompanies = companies.filter(c => c.country === country);
    }

    const results = targetCompanies.map(company => {
      const metrics = generateMetrics(company);
      const scoreResult = quant.vision2030Score({
        sector: company.sector,
        country: company.country,
        currentRatio: metrics.current_ratio,
        debtToEquity: metrics.debt_to_equity,
        freeCashFlow: metrics.free_cash_flow,
        roa: metrics.roa,
        revenueGrowth: metrics.revenue_growth,
        roe: metrics.roe,
        dividendYield: metrics.dividend_yield,
        totalAssets: metrics.total_assets
      });
      return {
        symbol: company.symbol,
        company_name: company.name,
        country: company.country,
        sector: company.sector,
        ...scoreResult
      };
    });

    results.sort((a, b) => b.totalScore - a.totalScore);

    // Summary stats
    const avg = results.reduce((s, r) => s + r.totalScore, 0) / (results.length || 1);
    const distribution = { Leader: 0, Aligned: 0, Transitioning: 0, Lagging: 0 };
    results.forEach(r => { distribution[r.rating]++; });

    res.json({
      success: true,
      data: {
        summary: {
          totalCompanies: results.length,
          averageScore: Math.round(avg * 10) / 10,
          distribution
        },
        companies: results
      }
    });
  } catch (error) {
    console.error('Quant API error (vision2030):', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ---------------------------------------------------------------------------
// Route 12: POST /relative-value
// Cross-GCC Relative Value Scanner — sector or full-market scan
// ---------------------------------------------------------------------------

router.post('/relative-value', (req, res) => {
  try {
    const { sector } = req.body;

    // Build company data with metrics + P/B
    let targetCompanies = companies;
    if (sector) {
      targetCompanies = companies.filter(c => c.sector === sector);
      if (targetCompanies.length === 0) {
        return res.status(404).json({ success: false, error: `No companies found in sector: ${sector}` });
      }
    }

    const companiesData = targetCompanies.map(company => {
      const metrics = generateMetrics(company);
      const priceToBook = metrics.total_equity > 0
        ? Math.round((company.market_cap / metrics.total_equity) * 100) / 100
        : 0;
      return {
        symbol: company.symbol,
        name: company.name,
        country: company.country,
        sector: company.sector,
        peRatio: metrics.pe_ratio,
        priceToBook: priceToBook,
        roe: metrics.roe,
        dividendYield: metrics.dividend_yield,
        debtToEquity: metrics.debt_to_equity,
        revenueGrowth: metrics.revenue_growth
      };
    });

    const result = quant.gccRelativeValue(companiesData);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Quant API error (relative-value):', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ---------------------------------------------------------------------------
// Route 13: GET /correlation-matrix
// Cross-asset correlation and covariance matrices
// ---------------------------------------------------------------------------

router.get('/correlation-matrix', (req, res) => {
  try {
    const symbolsParam = req.query.symbols;
    const range = req.query.range || '1Y';

    if (!symbolsParam) {
      return res.status(400).json({
        success: false,
        error: 'Required query param: symbols (comma-separated, e.g., "2222,1120,1180")'
      });
    }

    const symbols = symbolsParam.split(',').map(s => s.trim()).filter(Boolean);

    if (symbols.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Need at least 2 symbols for correlation matrix'
      });
    }

    const allPrices = loadPriceHistory();

    // Load returns for each symbol
    const returnsBySymbol = {};
    symbols.forEach(sym => {
      returnsBySymbol[sym] = {};
      const symPrices = filterByDateRange(
        allPrices.filter(p => p.company_symbol === sym),
        range
      );
      symPrices.forEach(p => {
        if (p.daily_return !== undefined && p.daily_return !== null) {
          returnsBySymbol[sym][p.date] = p.daily_return;
        }
      });
    });

    // Find common dates
    const dateSets = symbols.map(sym => new Set(Object.keys(returnsBySymbol[sym])));
    const commonDates = [...dateSets[0]].filter(
      d => dateSets.every(s => s.has(d))
    ).sort();

    if (commonDates.length < 10) {
      return res.status(400).json({
        success: false,
        error: `Insufficient aligned data (${commonDates.length} days). Need at least 10.`
      });
    }

    // Build T×N returns matrix (rows = observations, columns = assets)
    const returnsMatrix = [];
    for (let t = 0; t < commonDates.length; t++) {
      const row = [];
      for (let j = 0; j < symbols.length; j++) {
        row.push(returnsBySymbol[symbols[j]][commonDates[t]]);
      }
      returnsMatrix.push(row);
    }

    const corrMatrix = quant.correlationMatrix(returnsMatrix);
    const covMatrix = quant.covarianceMatrix(returnsMatrix);

    res.json({
      success: true,
      data: {
        symbols,
        correlationMatrix: corrMatrix,
        covarianceMatrix: covMatrix,
        count: commonDates.length
      }
    });
  } catch (error) {
    console.error('Quant API error (correlation-matrix):', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ---------------------------------------------------------------------------
// Route 12: GET /companies
// Lightweight company list for dropdown/search selectors
// ---------------------------------------------------------------------------

router.get('/companies', (req, res) => {
  try {
    const companyList = companies.map(c => ({
      symbol: c.symbol,
      name: c.name,
      country: c.country,
      sector: c.sector
    }));

    res.json({
      success: true,
      data: companyList
    });
  } catch (error) {
    console.error('Quant API error (companies):', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
