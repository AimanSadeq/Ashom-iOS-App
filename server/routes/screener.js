// Screener API Routes
const express = require('express');
const router = express.Router();
const supabaseService = require('../supabaseService');

// POST /api/screener - Screen companies with filters
router.post('/', async (req, res) => {
  try {
    const { countries, sectors, roe_min, roe_max, pe_min, pe_max, market_cap_min, market_cap_max } = req.body;

    const results = await supabaseService.screenCompanies({
      countries,
      sectors,
      roe_min,
      roe_max,
      pe_min,
      pe_max,
      market_cap_min,
      market_cap_max
    });

    res.json({
      results,
      count: results.length,
      filters_applied: { countries, sectors, roe_min, roe_max, pe_min, pe_max }
    });
  } catch (error) {
    console.error('Error screening companies:', error);
    res.status(500).json({ error: 'Failed to screen companies' });
  }
});

module.exports = router;
