import { useState, useEffect } from 'react';
import { STORAGE_KEYS } from './storageKeys';
import { MOCK_COMPETITORS, STARTING_CASH } from '../practice/practiceData';

export default function useLeaderboard(user, practiceData) {
  const [sortBy, setSortBy] = useState('totalReturnPct');

  // Build user's leaderboard entry from practice data
  const userEntry = {
    userId: user?.initials || 'U',
    name: user?.name || 'You',
    initials: user?.initials || 'U',
    totalReturnPct: practiceData?.totalGainPct || 0,
    portfolioValue: (practiceData?.virtualCash || 0) + (practiceData?.totalValue || 0),
    sharpeRatio: practiceData?.totalGainPct > 0 ? +(practiceData.totalGainPct / 8).toFixed(2) : 0,
    winStreak: practiceData?.winStreak || 0,
    totalTrades: practiceData?.transactions?.length || 0,
    isCurrentUser: true,
  };

  // Add daily variance to mock competitors (deterministic by date)
  const today = new Date().toISOString().split('T')[0];
  const seed = today.split('-').reduce((a, b) => a + parseInt(b), 0);

  const competitors = MOCK_COMPETITORS.map((c, i) => {
    const variance = ((Math.sin(seed * (i + 1) * 0.7) + Math.cos(seed * (i + 2) * 0.3)) * 0.8);
    return {
      ...c,
      totalReturnPct: +(c.totalReturnPct + variance).toFixed(2),
      portfolioValue: Math.round(STARTING_CASH * (1 + (c.totalReturnPct + variance) / 100)),
    };
  });

  // Merge user with competitors
  const allEntries = [...competitors, userEntry];

  // Sort
  const sorted = [...allEntries].sort((a, b) => {
    if (sortBy === 'totalReturnPct') return b.totalReturnPct - a.totalReturnPct;
    if (sortBy === 'sharpeRatio') return b.sharpeRatio - a.sharpeRatio;
    if (sortBy === 'winStreak') return b.winStreak - a.winStreak;
    return b.totalReturnPct - a.totalReturnPct;
  });

  // Add rank
  const ranked = sorted.map((entry, i) => ({ ...entry, rank: i + 1 }));

  return { leaderboard: ranked, sortBy, setSortBy };
}
