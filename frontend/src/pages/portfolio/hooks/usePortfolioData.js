import { useState, useEffect } from 'react';

export default function usePortfolioData(storageKey, sampleData) {
  const [holdings, setHoldings] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.length > 0) return parsed;
      }
      if (sampleData) {
        localStorage.setItem(storageKey, JSON.stringify(sampleData));
        return sampleData;
      }
      return [];
    } catch { return sampleData || []; }
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(holdings));
  }, [holdings, storageKey]);

  const totalValue = holdings.reduce((sum, h) => sum + (h.quantity * (h.currentPrice || h.costPrice)), 0);
  const totalCost  = holdings.reduce((sum, h) => sum + (h.quantity * h.costPrice), 0);
  const totalGain  = totalValue - totalCost;
  const totalGainPct = totalCost > 0 ? ((totalGain / totalCost) * 100) : 0;

  const allocationByType = holdings.reduce((acc, h) => {
    const type = h.type || 'stock';
    acc[type] = (acc[type] || 0) + (h.quantity * (h.currentPrice || h.costPrice));
    return acc;
  }, {});

  const bestPerformer = holdings.length > 0
    ? holdings.reduce((best, h) => {
        const gain = ((h.currentPrice || h.costPrice) - h.costPrice) / h.costPrice;
        const bestGain = ((best.currentPrice || best.costPrice) - best.costPrice) / best.costPrice;
        return gain > bestGain ? h : best;
      })
    : null;

  function addHolding(holding) {
    setHoldings(prev => [...prev, { id: Date.now(), ...holding }]);
  }

  function deleteHolding(id) {
    setHoldings(prev => prev.filter(h => h.id !== id));
  }

  return {
    holdings, setHoldings,
    totalValue, totalCost, totalGain, totalGainPct,
    allocationByType, bestPerformer,
    addHolding, deleteHolding,
  };
}
