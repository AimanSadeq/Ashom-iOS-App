// Companies API Routes
const express = require('express');
const router = express.Router();
const supabaseService = require('../supabaseService');

// GET /api/companies/stats/coverage - Get coverage statistics (MUST be before /:id route)
router.get('/stats/coverage', async (req, res) => {
  try {
    const stats = await supabaseService.getCompanyStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// GET /api/companies - Get all companies with optional filters
router.get('/', async (req, res) => {
  try {
    const { country, sector, industry, search } = req.query;

    // Build filters object
    const filters = {};
    if (country) filters.country = country;
    if (sector) filters.sector = sector;
    if (industry) filters.industry = industry;
    if (search) filters.search = search;

    // Get companies from Supabase service (with SQLite fallback)
    const companies = await supabaseService.getAllCompanies(filters);

    res.json({
      companies,
      pagination: {
        total: companies.length,
        limit: companies.length,
        offset: 0,
        hasMore: false
      }
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

// GET /api/companies/:id - Get company by ID with financial data
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get company from Supabase service
    const company = await supabaseService.getCompanyById(id);

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Get latest financial metrics
    const metrics = await supabaseService.getFinancialMetrics(id);

    // Get annual reports
    const reports = await supabaseService.getAllReports({ company_id: id });

    res.json({
      ...company,
      financial_metrics: metrics,
      annual_reports: reports
    });
  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({ error: 'Failed to fetch company' });
  }
});

module.exports = router;
