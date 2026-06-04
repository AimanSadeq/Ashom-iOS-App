const express = require('express');
const router = express.Router();

/**
 * @route   GET /api/commodities/yahoo
 * @desc    Proxy endpoint for Yahoo Finance commodity data (Gold, Silver, Oil, etc.)
 * @access  Public
 */
router.get('/yahoo', async (req, res) => {
  try {
    // Yahoo Finance symbols map
    const symbolMap = {
      'GC=F': 'gold',
      'SI=F': 'silver',
      'PL=F': 'platinum',
      'PA=F': 'palladium',
      'CL=F': 'wti',
      'BZ=F': 'brent'
    };
    
    const symbols = Object.keys(symbolMap).join(',');
    const url = `https://query2.finance.yahoo.com/v7/finance/quote?symbols=${symbols}`;

    console.log('Fetching Yahoo Finance data:', url);

    // Use dynamic import for node-fetch (ESM module)
    const fetch = (await import('node-fetch')).default;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Yahoo Finance API returned status: ${response.status}`);
    }

    const data = await response.json();

    // Check if response has valid data
    if (!data.quoteResponse || !data.quoteResponse.result) {
      throw new Error('Invalid response from Yahoo Finance');
    }

    // Normalize data
    const normalizedData = {};
    data.quoteResponse.result.forEach(quote => {
      const internalKey = symbolMap[quote.symbol];
      if (internalKey) {
        normalizedData[internalKey] = {
          price: quote.regularMarketPrice,
          change: quote.regularMarketChangePercent,
          symbol: quote.symbol
        };
      }
    });

    // Return the data
    res.json({
      success: true,
      data: normalizedData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching Yahoo Finance data:', error.message);
    // Return fallback data so the UI always works
    const fallbackData = {
      gold:      { price: 2340.50, change: 1.20,  symbol: 'GC=F' },
      silver:    { price: 30.15,   change: -0.80, symbol: 'SI=F' },
      platinum:  { price: 1020.00, change: 0.50,  symbol: 'PL=F' },
      palladium: { price: 980.00,  change: -1.10, symbol: 'PA=F' },
      wti:       { price: 78.50,   change: 0.30,  symbol: 'CL=F' },
      brent:     { price: 82.75,   change: 0.60,  symbol: 'BZ=F' },
    };
    res.json({
      success: true,
      data: fallbackData,
      timestamp: new Date().toISOString(),
      fallback: true
    });
  }
});

module.exports = router;
