import { useState, useEffect, useCallback } from 'react';
import { STORAGE_KEYS } from './storageKeys';
import { STARTING_CASH, ACHIEVEMENTS } from '../practice/practiceData';

function createInitialState(userId) {
  return {
    userId,
    virtualCash: STARTING_CASH,
    holdings: [],
    transactions: [],
    achievements: [],
    createdAt: new Date().toISOString(),
  };
}

function loadState(userId) {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRACTICE_STATE(userId));
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return createInitialState(userId);
}

function saveState(userId, state) {
  localStorage.setItem(STORAGE_KEYS.PRACTICE_STATE(userId), JSON.stringify(state));
}

export default function usePracticePortfolio(userId) {
  const [state, setState] = useState(() => loadState(userId));

  useEffect(() => {
    saveState(userId, state);
  }, [state, userId]);

  const holdings = state.holdings;
  const virtualCash = state.virtualCash;
  const transactions = state.transactions;

  const totalValue = holdings.reduce((sum, h) => sum + (h.quantity * (h.currentPrice || h.costPrice)), 0);
  const totalCost  = holdings.reduce((sum, h) => sum + (h.quantity * h.costPrice), 0);
  const totalGain  = totalValue - totalCost;
  const totalGainPct = STARTING_CASH > 0 ? (((virtualCash + totalValue - STARTING_CASH) / STARTING_CASH) * 100) : 0;

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

  // Calculate win streak from transactions
  const winStreak = (() => {
    let streak = 0;
    for (let i = transactions.length - 1; i >= 0; i--) {
      if (transactions[i].type === 'sell' && (transactions[i].profit || 0) > 0) streak++;
      else if (transactions[i].type === 'sell') break;
    }
    return streak;
  })();

  const setHoldings = useCallback((updater) => {
    setState(prev => {
      const newHoldings = typeof updater === 'function' ? updater(prev.holdings) : updater;
      return { ...prev, holdings: newHoldings };
    });
  }, []);

  function checkAchievements(newState) {
    const unlocked = [...newState.achievements];
    const txns = newState.transactions;
    const holdingTypes = new Set(newState.holdings.map(h => h.type));
    const totalReturn = ((newState.virtualCash + newState.holdings.reduce((s, h) => s + h.quantity * (h.currentPrice || h.costPrice), 0) - STARTING_CASH) / STARTING_CASH) * 100;

    const checks = {
      first_trade: txns.length >= 1,
      diversified_3: holdingTypes.size >= 3,
      diversified_5: holdingTypes.size >= 5,
      profit_5pct: totalReturn >= 5,
      profit_10pct: totalReturn >= 10,
      trader_10: txns.length >= 10,
      trader_50: txns.length >= 50,
      streak_3: (() => { let s = 0; for (let i = txns.length - 1; i >= 0; i--) { if (txns[i].type === 'sell' && (txns[i].profit || 0) > 0) s++; else if (txns[i].type === 'sell') break; } return s >= 3; })(),
      streak_5: (() => { let s = 0; for (let i = txns.length - 1; i >= 0; i--) { if (txns[i].type === 'sell' && (txns[i].profit || 0) > 0) s++; else if (txns[i].type === 'sell') break; } return s >= 5; })(),
      big_win: txns.some(t => t.type === 'sell' && (t.profit || 0) >= 5000),
    };

    Object.entries(checks).forEach(([id, met]) => {
      if (met && !unlocked.includes(id)) unlocked.push(id);
    });

    return unlocked;
  }

  function buyAsset(asset, quantity, price) {
    const total = quantity * price;
    if (total > state.virtualCash) return false;

    setState(prev => {
      const tx = {
        id: Date.now(), type: 'buy', assetType: asset.type,
        name: asset.name, symbol: asset.symbol,
        quantity, price, total,
        timestamp: new Date().toISOString(),
      };
      // Check if already holding this asset
      const existing = prev.holdings.find(h => h.symbol === asset.symbol);
      let newHoldings;
      if (existing) {
        const newQty = existing.quantity + quantity;
        const newCost = ((existing.costPrice * existing.quantity) + total) / newQty;
        newHoldings = prev.holdings.map(h =>
          h.symbol === asset.symbol
            ? { ...h, quantity: newQty, costPrice: newCost }
            : h
        );
      } else {
        newHoldings = [...prev.holdings, {
          id: Date.now(), type: asset.type, name: asset.name, symbol: asset.symbol,
          quantity, costPrice: price, currentPrice: price,
          purchaseDate: new Date().toISOString().split('T')[0],
        }];
      }

      const newState = {
        ...prev,
        virtualCash: prev.virtualCash - total,
        holdings: newHoldings,
        transactions: [...prev.transactions, tx],
      };
      newState.achievements = checkAchievements(newState);
      return newState;
    });
    return true;
  }

  function sellAsset(holding, quantity, price) {
    if (quantity > holding.quantity) return false;
    const total = quantity * price;
    const profit = (price - holding.costPrice) * quantity;

    setState(prev => {
      const tx = {
        id: Date.now(), type: 'sell', assetType: holding.type,
        name: holding.name, symbol: holding.symbol,
        quantity, price, total, profit,
        timestamp: new Date().toISOString(),
      };

      let newHoldings;
      if (quantity >= holding.quantity) {
        newHoldings = prev.holdings.filter(h => h.id !== holding.id);
      } else {
        newHoldings = prev.holdings.map(h =>
          h.id === holding.id ? { ...h, quantity: h.quantity - quantity } : h
        );
      }

      const newState = {
        ...prev,
        virtualCash: prev.virtualCash + total,
        holdings: newHoldings,
        transactions: [...prev.transactions, tx],
      };
      newState.achievements = checkAchievements(newState);
      return newState;
    });
    return true;
  }

  function resetPortfolio() {
    setState(createInitialState(userId));
  }

  return {
    holdings, setHoldings, virtualCash, transactions,
    totalValue, totalCost, totalGain, totalGainPct,
    allocationByType, bestPerformer, winStreak,
    achievements: state.achievements,
    buyAsset, sellAsset, resetPortfolio,
  };
}
