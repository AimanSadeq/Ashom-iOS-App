// CoinGecko API Routes for Crypto
const express = require('express');
const router = express.Router();

// Multi-key cache — stores results per ids query
const cacheMap = {};
const CACHE_DURATION = 90 * 1000; // 90 seconds (generous to avoid rate limits)
let lastFetchTime = 0;
const MIN_FETCH_INTERVAL = 10 * 1000; // 10 second minimum between ANY CoinGecko calls

/**
 * @route   GET /api/coingecko/crypto
 * @desc    Get cryptocurrency prices from CoinGecko
 * @access  Public
 */
router.get('/crypto', async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;

    let ids = req.query.ids;
    if (!ids) {
      ids = 'bitcoin,ethereum,binancecoin,cardano,solana,tether,usd-coin,ripple,dogecoin,polkadot';
    }

    // Normalize and sort ids for consistent cache key
    const sortedIds = ids.split(',').map(s => s.trim()).sort().join(',');

    // Check cache
    const cached = cacheMap[sortedIds];
    if (cached && cached.timestamp > Date.now() - CACHE_DURATION) {
      return res.json(cached.data);
    }

    // Throttle: don't hit CoinGecko more than once per MIN_FETCH_INTERVAL across ALL requests
    const now = Date.now();
    if (now - lastFetchTime < MIN_FETCH_INTERVAL) {
      // Return any cached data (even expired) or from a superset cache
      if (cached) return res.json(cached.data);
      // Try to find data in any cache entry
      for (const key of Object.keys(cacheMap)) {
        if (cacheMap[key].data) return res.json(cacheMap[key].data);
      }
    }

    lastFetchTime = now;

    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${sortedIds}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`;

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      timeout: 8000,
    });

    if (!response.ok) {
      // Rate limited — return any cached data
      if (response.status === 429) {
        console.warn('CoinGecko rate limited, serving cached data');
        if (cached) return res.json(cached.data);
        for (const key of Object.keys(cacheMap)) {
          if (cacheMap[key].data) return res.json(cacheMap[key].data);
        }
      }
      throw new Error(`CoinGecko API returned status: ${response.status}`);
    }

    const data = await response.json();

    // Transform to standard format
    const formattedData = {};
    Object.keys(data).forEach(key => {
      formattedData[key] = {
        price: data[key].usd,
        change: data[key].usd_24h_change,
        marketCap: data[key].usd_market_cap
      };
    });

    const responseData = {
      success: true,
      data: formattedData,
      timestamp: new Date().toISOString()
    };

    // Store in cache
    cacheMap[sortedIds] = { data: responseData, timestamp: now };

    res.json(responseData);

  } catch (error) {
    console.error('CoinGecko error:', error.message);

    // Return any cached data on error
    const ids = req.query.ids || '';
    const sortedIds = ids.split(',').map(s => s.trim()).sort().join(',');
    const cached = cacheMap[sortedIds];
    if (cached) return res.json({ ...cached.data, fallback: true });

    // Last resort: return fallback
    res.json({
      success: true,
      data: {
        bitcoin:  { price: 67000, change: 0.5, marketCap: 1340000000000 },
        ethereum: { price: 2050,  change: -0.3, marketCap: 247000000000 },
      },
      timestamp: new Date().toISOString(),
      fallback: true
    });
  }
});

module.exports = router;
