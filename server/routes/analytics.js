// Analytics API Routes
const express = require('express');
const router = express.Router();
const supabaseService = require('../supabaseService');

// GET /api/analytics/types - Get available comparison types
router.get('/types', (req, res) => {
  const types = [
    { id: 'company-vs-company', name: 'Company vs Company', icon: 'fa-users' },
    { id: 'company-vs-industry', name: 'Company vs Industry', icon: 'fa-chart-pie' },
    { id: 'company-vs-market', name: 'Company vs Market', icon: 'fa-globe' },
    { id: 'sector-analysis', name: 'Sector Analysis', icon: 'fa-building' },
    { id: 'country-analysis', name: 'Country Analysis', icon: 'fa-flag' },
    { id: 'peer-group', name: 'Peer Group', icon: 'fa-user-group' },
    { id: 'historical-trends', name: 'Historical Trends', icon: 'fa-chart-line' },
    { id: 'ratio-analysis', name: 'Ratio Analysis', icon: 'fa-chart-bar' },
    { id: 'custom', name: 'Custom Comparison', icon: 'fa-gears' }
  ];

  res.json({ types });
});

// GET /api/analytics/metrics - Get available metrics
router.get('/metrics', (req, res) => {
  const metrics = {
    profitability: ['ROE', 'ROA', 'Net Profit Margin', 'Operating Margin', 'Gross Margin'],
    liquidity: ['Current Ratio', 'Quick Ratio', 'Cash Ratio'],
    leverage: ['Debt to Equity', 'Debt Ratio', 'Interest Coverage'],
    efficiency: ['Asset Turnover', 'Inventory Turnover', 'Receivables Turnover'],
    valuation: ['P/E Ratio', 'P/B Ratio', 'EV/EBITDA', 'P/S Ratio'],
    cashflow: ['Operating Cash Flow', 'Free Cash Flow', 'Cash Flow to Debt'],
    dividend: ['Dividend Yield', 'Payout Ratio', 'Dividend Coverage'],
    growth: ['Revenue Growth', 'Earnings Growth', 'Asset Growth'],
    dupont: ['ROE Decomposition', '3-Factor Analysis', '5-Factor Analysis']
  };

  res.json({ metrics });
});

// GET /api/analytics/industries - Industry aggregation endpoint
// Returns industries with aggregated metrics from their constituent companies
// Optional query params: country, sector
router.get('/industries', async (req, res) => {
  try {
    const { country, sector } = req.query;
    const industries = await supabaseService.getIndustryAggregation({ country, sector });
    res.json({ industries });
  } catch (error) {
    console.error('Error fetching industry aggregation:', error);
    res.status(500).json({ error: 'Failed to fetch industry aggregation' });
  }
});

// GET /api/analytics/industries/:name - Get specific industry detail with companies
router.get('/industries/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const detail = await supabaseService.getIndustryDetail(name);
    if (!detail || detail.companies.length === 0) {
      return res.status(404).json({ error: 'Industry not found' });
    }
    res.json(detail);
  } catch (error) {
    console.error('Error fetching industry detail:', error);
    res.status(500).json({ error: 'Failed to fetch industry detail' });
  }
});

module.exports = router;
