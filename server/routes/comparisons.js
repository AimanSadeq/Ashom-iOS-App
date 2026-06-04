// Comparisons API Routes
const express = require('express');
const router = express.Router();
const supabaseService = require('../supabaseService');

// POST /api/comparisons - Create a new comparison
router.post('/', async (req, res) => {
  try {
    const { type, entity_ids, metrics } = req.body;

    // Get companies data with their latest financial metrics
    const companies = await supabaseService.getCompaniesWithMetrics(entity_ids);

    res.json({
      comparison_type: type,
      entities: companies,
      metrics_compared: metrics
    });
  } catch (error) {
    console.error('Error creating comparison:', error);
    res.status(500).json({ error: 'Failed to create comparison' });
  }
});

// GET /api/comparisons - Get saved comparisons
router.get('/', async (req, res) => {
  try {
    const comparisons = await supabaseService.getSavedComparisons(20);
    res.json({ comparisons });
  } catch (error) {
    console.error('Error fetching comparisons:', error);
    res.status(500).json({ error: 'Failed to fetch comparisons' });
  }
});

// POST /api/comparisons/generate - Generate real comparison data for two entities
router.post('/generate', async (req, res) => {
  try {
    const { firstEntity, secondEntity, selectedMetrics, comparisonType } = req.body;

    if (!firstEntity || !secondEntity) {
      return res.status(400).json({ success: false, error: 'Both entities are required' });
    }

    // Fetch data for each entity based on type
    const entity1Data = await fetchEntityData(firstEntity);
    const entity2Data = await fetchEntityData(secondEntity);

    res.json({
      success: true,
      data: {
        comparisonType: comparisonType || 'company-company',
        entities: [entity1Data, entity2Data],
        selectedMetrics: selectedMetrics || []
      }
    });
  } catch (error) {
    console.error('Error generating comparison:', error);
    res.status(500).json({ success: false, error: 'Failed to generate comparison data' });
  }
});

// Fetch data for a single entity (company, industry, index, or country)
async function fetchEntityData(entity) {
  const entityType = entity.type || 'company';

  if (entityType === 'company') {
    return await fetchCompanyData(entity);
  } else if (entityType === 'industry') {
    return await fetchIndustryData(entity);
  } else if (entityType === 'index') {
    return await fetchIndexData(entity);
  } else if (entityType === 'country') {
    return await fetchCountryData(entity);
  }

  return { name: entity.name, type: entityType, metrics: {} };
}

// Fetch company data with all financial metrics
async function fetchCompanyData(entity) {
  // Search for the company by name
  const companies = await supabaseService.getAllCompanies({ search: entity.name });

  if (!companies || companies.length === 0) {
    return {
      name: entity.name,
      ticker: entity.ticker || '',
      type: 'company',
      country: entity.country || '',
      sector: entity.industry || entity.sector || '',
      flag: entity.flag || '',
      market_cap: 0,
      metrics: {},
      dataAvailable: false
    };
  }

  // Use the best match (first result, ordered by market_cap desc)
  const company = companies[0];

  // Fetch financial metrics for this company
  const allMetrics = await supabaseService.getFinancialMetrics(company.id);

  // Get the latest fiscal year's metrics
  let latest = null;
  if (allMetrics && allMetrics.length > 0) {
    allMetrics.sort((a, b) => (b.fiscal_year || b.year || 0) - (a.fiscal_year || a.year || 0));
    latest = allMetrics[0];
  }

  // Structure metrics into CFA categories
  const metrics = buildMetricsFromData(latest, company);

  return {
    name: company.name,
    ticker: company.symbol || entity.ticker || '',
    type: 'company',
    country: company.country || '',
    sector: company.sector || '',
    industry: company.industry || '',
    flag: entity.flag || getCountryCode(company.country),
    market_cap: company.market_cap || 0,
    currency: company.currency || 'USD',
    metrics: metrics,
    dataAvailable: !!latest,
    fiscalYear: latest ? (latest.fiscal_year || latest.year) : null,
    rawData: latest || {}
  };
}

// Fetch aggregated industry data
async function fetchIndustryData(entity) {
  try {
    const detail = await supabaseService.getIndustryDetail(entity.name);

    if (!detail || !detail.aggregate) {
      return {
        name: entity.name,
        type: 'industry',
        flag: entity.flag || '',
        metrics: {},
        dataAvailable: false
      };
    }

    const agg = detail.aggregate;
    return {
      name: entity.name,
      type: 'industry',
      sector: agg.sector || '',
      flag: entity.flag || '',
      companyCount: agg.company_count || 0,
      totalMarketCap: agg.total_market_cap || 0,
      countries: agg.countries || [],
      metrics: buildMetricsFromAggregated(agg.avg_metrics),
      dataAvailable: true,
      label: `Industry Average (${agg.company_count} companies)`
    };
  } catch (err) {
    console.error('Error fetching industry data:', err);
    return { name: entity.name, type: 'industry', metrics: {}, dataAvailable: false };
  }
}

// Fetch index data (uses country aggregation as proxy)
async function fetchIndexData(entity) {
  try {
    // Use country from the index entity to get country-wide aggregation
    const countryCode = entity.flag ? entity.flag.toLowerCase() : '';
    const countryMapping = { sa: 'saudi', ae: 'uae', kw: 'kuwait', qa: 'qatar', bh: 'bahrain', om: 'oman' };
    const country = countryMapping[countryCode] || '';

    if (!country) {
      return { name: entity.name, type: 'index', metrics: {}, dataAvailable: false };
    }

    const industries = await supabaseService.getIndustryAggregation({ country: country });

    if (!industries || industries.length === 0) {
      return { name: entity.name, type: 'index', metrics: {}, dataAvailable: false };
    }

    // Aggregate all industries in this country
    const totals = aggregateIndustries(industries);

    return {
      name: entity.name,
      symbol: entity.symbol || '',
      type: 'index',
      country: country,
      flag: entity.flag || '',
      companyCount: totals.companyCount,
      totalMarketCap: totals.totalMarketCap,
      metrics: buildMetricsFromAggregated(totals.avgMetrics),
      dataAvailable: true,
      label: `Index Aggregate (${totals.companyCount} companies)`
    };
  } catch (err) {
    console.error('Error fetching index data:', err);
    return { name: entity.name, type: 'index', metrics: {}, dataAvailable: false };
  }
}

// Fetch country-wide aggregated data
async function fetchCountryData(entity) {
  try {
    const countryMapping = { SA: 'saudi', AE: 'uae', KW: 'kuwait', QA: 'qatar', BH: 'bahrain', OM: 'oman' };
    const country = countryMapping[entity.code || entity.flag] || entity.name.toLowerCase().replace(/\s+/g, '');

    const industries = await supabaseService.getIndustryAggregation({ country: country });

    if (!industries || industries.length === 0) {
      return { name: entity.name, type: 'country', metrics: {}, dataAvailable: false };
    }

    const totals = aggregateIndustries(industries);

    return {
      name: entity.name,
      type: 'country',
      flag: entity.flag || entity.code || '',
      companyCount: totals.companyCount,
      totalMarketCap: totals.totalMarketCap,
      sectors: industries.map(i => i.industry),
      metrics: buildMetricsFromAggregated(totals.avgMetrics),
      dataAvailable: true,
      label: `Country Average (${totals.companyCount} companies)`
    };
  } catch (err) {
    console.error('Error fetching country data:', err);
    return { name: entity.name, type: 'country', metrics: {}, dataAvailable: false };
  }
}

// Build structured metrics from a financial_metrics DB row
function buildMetricsFromData(data, company) {
  if (!data) return {};

  const r = (val) => val != null ? Math.round(val * 10000) / 10000 : null;
  const pct = (val) => val != null ? Math.round(val * 10000) / 100 : null; // Convert decimal to percentage * 100

  // Calculate derived metrics where possible
  const revenue = data.revenue || 0;
  const netIncome = data.net_income || 0;
  const totalAssets = data.total_assets || 0;
  const totalEquity = data.total_equity || data.shareholders_equity || 0;

  const netProfitMargin = revenue > 0 ? netIncome / revenue : null;
  const roe = totalEquity > 0 ? netIncome / totalEquity : data.roe;
  const roa = totalAssets > 0 ? netIncome / totalAssets : data.roa;
  const debtToEquity = data.debt_to_equity;
  const debtToAssets = totalAssets > 0 && debtToEquity != null ? (debtToEquity * totalEquity) / totalAssets : null;
  const equityMultiplier = totalEquity > 0 ? totalAssets / totalEquity : null;

  return {
    profitability: {
      roe: pct(roe || data.roe),
      roa: pct(roa || data.roa),
      net_profit_margin: pct(netProfitMargin),
      operating_margin: pct(data.operating_margin || null),
      gross_margin: pct(data.gross_margin || null),
      ebitda_margin: pct(data.ebitda_margin || null)
    },
    liquidity: {
      current_ratio: r(data.current_ratio),
      quick_ratio: r(data.quick_ratio || null),
      cash_ratio: r(data.cash_ratio || null)
    },
    leverage: {
      debt_to_equity: r(data.debt_to_equity),
      debt_to_assets: r(debtToAssets),
      interest_coverage: r(data.interest_coverage || null),
      equity_multiplier: r(equityMultiplier)
    },
    efficiency: {
      asset_turnover: revenue > 0 && totalAssets > 0 ? r(revenue / totalAssets) : null,
      inventory_turnover: r(data.inventory_turnover || null),
      receivables_turnover: r(data.receivables_turnover || null)
    },
    valuation: {
      pe_ratio: r(data.pe_ratio),
      pb_ratio: r(data.pb_ratio || null),
      ev_ebitda: r(data.ev_ebitda || null),
      ps_ratio: r(data.ps_ratio || null)
    },
    growth: {
      revenue_growth: pct(data.revenue_growth || null),
      earnings_growth: pct(data.earnings_growth || null),
      eps_growth: pct(data.eps_growth || null),
      book_value_growth: pct(data.book_value_growth || null)
    },
    cashflow: {
      operating_cash_flow: data.operating_cash_flow || null,
      free_cash_flow: data.free_cash_flow || null,
      cash_flow_margin: pct(data.cash_flow_margin || null),
      fcf_per_share: r(data.fcf_per_share || null)
    },
    dividend: {
      dividend_yield: pct(data.dividend_yield || null),
      payout_ratio: pct(data.payout_ratio || null),
      dividend_per_share: r(data.dividend_per_share || data.eps ? (data.eps * (data.payout_ratio || 0)) : null)
    },
    market: {
      market_cap: company ? company.market_cap : null,
      beta: r(data.beta || null),
      eps: r(data.eps),
      shares_outstanding: data.shares_outstanding || null
    },
    // Include raw financials for the AI analyst
    financials: {
      revenue: revenue || null,
      net_income: netIncome || null,
      total_assets: totalAssets || null,
      total_equity: totalEquity || null,
      eps: data.eps || null
    }
  };
}

// Build metrics from aggregated industry data (avg_metrics format)
function buildMetricsFromAggregated(avg) {
  if (!avg) return {};

  return {
    profitability: {
      roe: avg.roe != null ? Math.round(avg.roe * 100) / 100 : null,
      roa: avg.roa != null ? Math.round(avg.roa * 100) / 100 : null,
      net_profit_margin: null,
      operating_margin: null,
      gross_margin: null,
      ebitda_margin: null
    },
    liquidity: {
      current_ratio: avg.current_ratio != null ? Math.round(avg.current_ratio * 100) / 100 : null,
      quick_ratio: null,
      cash_ratio: null
    },
    leverage: {
      debt_to_equity: avg.debt_to_equity != null ? Math.round(avg.debt_to_equity * 100) / 100 : null,
      debt_to_assets: null,
      interest_coverage: null,
      equity_multiplier: null
    },
    efficiency: {
      asset_turnover: null,
      inventory_turnover: null,
      receivables_turnover: null
    },
    valuation: {
      pe_ratio: avg.pe_ratio != null ? Math.round(avg.pe_ratio * 100) / 100 : null,
      pb_ratio: null,
      ev_ebitda: null,
      ps_ratio: null
    },
    growth: {
      revenue_growth: null,
      earnings_growth: null,
      eps_growth: null,
      book_value_growth: null
    },
    cashflow: {
      operating_cash_flow: null,
      free_cash_flow: null,
      cash_flow_margin: null,
      fcf_per_share: null
    },
    dividend: {
      dividend_yield: null,
      payout_ratio: null,
      dividend_per_share: null
    },
    market: {
      market_cap: null,
      beta: null,
      eps: null,
      shares_outstanding: null
    },
    financials: {
      revenue: avg.revenue || null,
      net_income: avg.net_income || null,
      total_assets: avg.total_assets || null,
      total_equity: avg.total_equity || null,
      eps: null
    }
  };
}

// Aggregate multiple industries into overall averages
function aggregateIndustries(industries) {
  let companyCount = 0;
  let totalMarketCap = 0;
  const metricSums = {};
  const metricCounts = {};

  industries.forEach(ind => {
    companyCount += ind.company_count || 0;
    totalMarketCap += ind.total_market_cap || 0;

    if (ind.avg_metrics) {
      Object.entries(ind.avg_metrics).forEach(([key, val]) => {
        if (val != null) {
          metricSums[key] = (metricSums[key] || 0) + val * (ind.company_count || 1);
          metricCounts[key] = (metricCounts[key] || 0) + (ind.company_count || 1);
        }
      });
    }
  });

  const avgMetrics = {};
  Object.keys(metricSums).forEach(key => {
    avgMetrics[key] = metricCounts[key] > 0 ? metricSums[key] / metricCounts[key] : null;
  });

  return { companyCount, totalMarketCap, avgMetrics };
}

// Get 2-letter country code from country name
function getCountryCode(country) {
  const codes = {
    saudi: 'SA', 'saudi arabia': 'SA',
    uae: 'AE', 'united arab emirates': 'AE',
    kuwait: 'KW',
    qatar: 'QA',
    bahrain: 'BH',
    oman: 'OM'
  };
  return codes[(country || '').toLowerCase()] || '';
}

module.exports = router;
