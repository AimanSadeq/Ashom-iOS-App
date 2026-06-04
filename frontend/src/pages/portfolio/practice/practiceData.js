export const MOCK_COMPETITORS = [
  { userId: 'MK', name: 'Mohammed Al-Khalid', initials: 'MK', totalReturnPct: 12.7,  portfolioValue: 112700, sharpeRatio: 1.52, winStreak: 7, totalTrades: 34 },
  { userId: 'FA', name: 'Fatima Al-Rashid',   initials: 'FA', totalReturnPct: 9.3,   portfolioValue: 109300, sharpeRatio: 1.18, winStreak: 3, totalTrades: 28 },
  { userId: 'AH', name: 'Ahmed Hassan',       initials: 'AH', totalReturnPct: 7.8,   portfolioValue: 107800, sharpeRatio: 0.95, winStreak: 5, totalTrades: 41 },
  { userId: 'NB', name: 'Noor Bakri',         initials: 'NB', totalReturnPct: 6.1,   portfolioValue: 106100, sharpeRatio: 1.31, winStreak: 2, totalTrades: 19 },
  { userId: 'SK', name: 'Sultan Al-Kuwaiti',  initials: 'SK', totalReturnPct: 4.5,   portfolioValue: 104500, sharpeRatio: 0.72, winStreak: 4, totalTrades: 52 },
  { userId: 'LM', name: 'Layla Mansour',      initials: 'LM', totalReturnPct: 3.2,   portfolioValue: 103200, sharpeRatio: 1.05, winStreak: 1, totalTrades: 15 },
  { userId: 'OQ', name: 'Omar Al-Qatari',     initials: 'OQ', totalReturnPct: 1.9,   portfolioValue: 101900, sharpeRatio: 0.55, winStreak: 0, totalTrades: 37 },
  { userId: 'RA', name: 'Reem Al-Ansari',     initials: 'RA', totalReturnPct: -1.4,  portfolioValue: 98600,  sharpeRatio: -0.3, winStreak: 0, totalTrades: 22 },
  { userId: 'YD', name: 'Yusuf Al-Dosari',    initials: 'YD', totalReturnPct: -3.8,  portfolioValue: 96200,  sharpeRatio: -0.7, winStreak: 0, totalTrades: 45 },
  { userId: 'HT', name: 'Huda Al-Tamimi',     initials: 'HT', totalReturnPct: -5.2,  portfolioValue: 94800,  sharpeRatio: -1.1, winStreak: 0, totalTrades: 8 },
];

export const TRADEABLE_ASSETS = [
  { type: 'stock',  name: 'Saudi Aramco',     symbol: '2222.SR',  price: 28.90 },
  { type: 'stock',  name: 'Al Rajhi Bank',    symbol: '1120.SR',  price: 79.50 },
  { type: 'stock',  name: 'STC',              symbol: '7010.SR',  price: 46.10 },
  { type: 'stock',  name: 'SABIC',            symbol: '2010.SR',  price: 92.30 },
  { type: 'stock',  name: 'Emirates NBD',     symbol: 'ENBD.DU',  price: 15.20 },
  { type: 'stock',  name: 'First Abu Dhabi Bank', symbol: 'FAB.DU', price: 13.80 },
  { type: 'stock',  name: 'QNB Group',        symbol: 'QNB.QA',   price: 14.50 },
  { type: 'stock',  name: 'Kuwait Finance House', symbol: 'KFH.KW', price: 8.70 },
  { type: 'metal',  name: 'Gold',             symbol: 'XAU',      price: 2340.00 },
  { type: 'metal',  name: 'Silver',           symbol: 'XAG',      price: 28.50 },
  { type: 'oil',    name: 'Brent Crude',      symbol: 'BZ',       price: 82.10 },
  { type: 'oil',    name: 'WTI Crude',        symbol: 'CL',       price: 78.50 },
  { type: 'crypto', name: 'Bitcoin',          symbol: 'BTC',      price: 67500 },
  { type: 'crypto', name: 'Ethereum',         symbol: 'ETH',      price: 3450 },
  { type: 'crypto', name: 'Solana',           symbol: 'SOL',      price: 148 },
  { type: 'crypto', name: 'Ripple',           symbol: 'XRP',      price: 0.58 },
];

export const ACHIEVEMENTS = [
  { id: 'first_trade',    label: 'First Trade',         desc: 'Execute your first trade',             icon: 'Zap' },
  { id: 'diversified_3',  label: 'Diversified',         desc: 'Hold 3 different asset types',         icon: 'Layers' },
  { id: 'diversified_5',  label: 'Well Diversified',    desc: 'Hold 5 different asset types',         icon: 'Shield' },
  { id: 'profit_5pct',    label: 'In the Green',        desc: 'Achieve 5% total return',              icon: 'TrendingUp' },
  { id: 'profit_10pct',   label: 'Double Digits',       desc: 'Achieve 10% total return',             icon: 'Rocket' },
  { id: 'streak_3',       label: 'Winning Streak',      desc: '3 consecutive profitable trades',      icon: 'Flame' },
  { id: 'streak_5',       label: 'Hot Streak',          desc: '5 consecutive profitable trades',      icon: 'Flame' },
  { id: 'trader_10',      label: 'Active Trader',       desc: 'Execute 10 trades',                    icon: 'Activity' },
  { id: 'trader_50',      label: 'Pro Trader',          desc: 'Execute 50 trades',                    icon: 'Award' },
  { id: 'big_win',        label: 'Big Win',             desc: 'Make $5,000+ on a single trade',       icon: 'Star' },
];

export const STARTING_CASH = 100000;
