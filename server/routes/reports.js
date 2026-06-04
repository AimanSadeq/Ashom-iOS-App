// Annual Reports API Routes
const express = require('express');
const router = express.Router();
const supabaseService = require('../supabaseService');

// GET /api/reports - Get all annual reports with filters
router.get('/', async (req, res) => {
  try {
    const { country, sector, year, search, limit = 50 } = req.query;

    const reports = await supabaseService.getReportsFiltered({
      country,
      sector,
      year,
      search,
      limit: parseInt(limit)
    });

    res.json({ reports });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// GET /api/reports/:id - Get specific report
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const report = await supabaseService.getReportById(id);

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json(report);
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

module.exports = router;
