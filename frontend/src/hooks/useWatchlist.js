import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'vifm-watchlist';
const ALERTS_KEY = 'vifm-price-alerts';

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

export default function useWatchlist() {
  const [watchlist, setWatchlist] = useState(() => load(STORAGE_KEY, []));
  const [alerts, setAlerts] = useState(() => load(ALERTS_KEY, []));

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist)); }, [watchlist]);
  useEffect(() => { localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts)); }, [alerts]);

  const isWatched = useCallback((companyId) => {
    return watchlist.some(w => w.id === companyId || w.companyId === companyId);
  }, [watchlist]);

  function addToWatchlist(company) {
    if (isWatched(company.id)) return;
    setWatchlist(prev => [...prev, {
      id: company.id,
      companyId: company.id,
      name: company.name,
      ticker: company.ticker || company.symbol || '',
      sector: company.sector || company.industry || '',
      country: company.country || '',
      price: company.price || company.current_price || null,
      addedAt: new Date().toISOString(),
    }]);
  }

  function removeFromWatchlist(companyId) {
    setWatchlist(prev => prev.filter(w => w.id !== companyId && w.companyId !== companyId));
  }

  function toggleWatchlist(company) {
    if (isWatched(company.id)) removeFromWatchlist(company.id);
    else addToWatchlist(company);
  }

  function addAlert(companyId, companyName, type, targetPrice) {
    setAlerts(prev => [...prev, {
      id: Date.now(),
      companyId,
      companyName,
      type, // 'above' | 'below'
      targetPrice,
      active: true,
      createdAt: new Date().toISOString(),
    }]);
  }

  function removeAlert(alertId) {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  }

  function toggleAlert(alertId) {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, active: !a.active } : a));
  }

  return {
    watchlist, alerts,
    isWatched, addToWatchlist, removeFromWatchlist, toggleWatchlist,
    addAlert, removeAlert, toggleAlert,
  };
}
