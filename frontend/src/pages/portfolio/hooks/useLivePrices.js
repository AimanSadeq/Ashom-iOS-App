import { useState, useEffect, useCallback, useRef } from 'react';
import { markets } from '../../../services/api';
import { CRYPTO_IDS, SYMBOL_MAP } from './constants';

export default function useLivePrices(holdings, setHoldings) {
  const [livePrices, setLivePrices] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);
  const [pricesLive, setPricesLive] = useState(false);
  const refreshRef = useRef(null);

  const fetchLivePrices = useCallback(async () => {
    try {
      const prices = {};
      try {
        const commRes = await markets.commodities();
        const commData = commRes.data || commRes;
        Object.entries(commData).forEach(([key, val]) => {
          if (val?.price) prices[key.toLowerCase()] = val.price;
        });
      } catch (e) { /* commodities may fail */ }
      try {
        const cryptoRes = await markets.crypto(CRYPTO_IDS);
        const cryptoData = cryptoRes.data || cryptoRes;
        Object.entries(cryptoData).forEach(([key, val]) => {
          if (val?.price) prices[key.toLowerCase()] = val.price;
        });
      } catch (e) { /* crypto may fail */ }

      if (Object.keys(prices).length > 0) {
        setLivePrices(prices);
        setLastUpdated(new Date());
        setPricesLive(true);
        if (setHoldings) {
          setHoldings(prev => prev.map(h => {
            const key = (h.symbol || h.name || '').toLowerCase();
            const mappedKey = SYMBOL_MAP[key];
            const matchedPrice = (mappedKey && prices[mappedKey]) || prices[key];
            if (matchedPrice) return { ...h, currentPrice: matchedPrice };
            return h;
          }));
        }
      }
    } catch (e) {
      setPricesLive(false);
    }
  }, [setHoldings]);

  useEffect(() => {
    fetchLivePrices();
    function startInterval() {
      if (refreshRef.current) clearInterval(refreshRef.current);
      refreshRef.current = setInterval(fetchLivePrices, 30000);
    }
    function handleVisibility() {
      if (document.hidden) {
        if (refreshRef.current) clearInterval(refreshRef.current);
      } else {
        fetchLivePrices();
        startInterval();
      }
    }
    startInterval();
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      if (refreshRef.current) clearInterval(refreshRef.current);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [fetchLivePrices]);

  return { livePrices, lastUpdated, pricesLive, fetchLivePrices };
}
