import { PieChart, Wallet, LineChart, BarChart3 } from 'lucide-react';

export const TABS = [
  { id: 'overview',    label: 'Overview',    icon: PieChart },
  { id: 'holdings',    label: 'Holdings',    icon: Wallet },
  { id: 'performance', label: 'Performance', icon: LineChart },
  { id: 'analytics',   label: 'Analytics',   icon: BarChart3 },
];

export const ASSET_TYPES = ['All', 'Stocks', 'Metals', 'Oil', 'Crypto', 'Bonds', 'Cash'];

export const TIME_RANGES = ['1W', '1M', '3M', '6M', '1Y'];

export const TYPE_COLORS = {
  stock:  'bg-brand-50 text-brand-700',
  metal:  'bg-amber-50 text-amber-600',
  oil:    'bg-violet-50 text-violet-600',
  crypto: 'bg-teal-50 text-teal-600',
  bond:   'bg-emerald-50 text-emerald-600',
  cash:   'bg-gray-50 text-gray-500',
};

export const SYMBOL_MAP = {
  'xau': 'gold', 'gold': 'gold',
  'xag': 'silver', 'silver': 'silver',
  'xpt': 'platinum', 'platinum': 'platinum',
  'xpd': 'palladium', 'palladium': 'palladium',
  'cl': 'wti', 'wti': 'wti',
  'bz': 'brent', 'brent': 'brent',
  'btc': 'bitcoin', 'bitcoin': 'bitcoin',
  'eth': 'ethereum', 'ethereum': 'ethereum',
  'bnb': 'binancecoin',
  'sol': 'solana',
  'ada': 'cardano',
  'xrp': 'ripple',
  'dot': 'polkadot',
  'doge': 'dogecoin',
};

export const CRYPTO_IDS = 'bitcoin,ethereum,binancecoin,solana,ripple,cardano,dogecoin,polkadot,avalanche-2,chainlink';

export const SAMPLE_HOLDINGS = [
  { id: 1, type: 'stock',  name: 'Saudi Aramco',    symbol: '2222.SR',  quantity: 500,  costPrice: 28.50,  currency: 'SAR', purchaseDate: '2024-06-15', sector: 'Energy',       country: 'saudi' },
  { id: 2, type: 'stock',  name: 'Al Rajhi Bank',   symbol: '1120.SR',  quantity: 300,  costPrice: 78.00,  currency: 'SAR', purchaseDate: '2024-03-10', sector: 'Financials',   country: 'saudi' },
  { id: 3, type: 'stock',  name: 'Emirates NBD',    symbol: 'ENBD.DU',  quantity: 400,  costPrice: 14.80,  currency: 'AED', purchaseDate: '2024-08-22', sector: 'Financials',   country: 'uae' },
  { id: 4, type: 'stock',  name: 'STC',             symbol: '7010.SR',  quantity: 200,  costPrice: 45.20,  currency: 'SAR', purchaseDate: '2024-01-05', sector: 'Telecom',      country: 'saudi' },
  { id: 5, type: 'metal',  name: 'Gold',            symbol: 'XAU',      quantity: 2,    costPrice: 2150.00, currency: 'USD', purchaseDate: '2024-04-18' },
  { id: 6, type: 'metal',  name: 'Silver',          symbol: 'XAG',      quantity: 50,   costPrice: 26.50,  currency: 'USD', purchaseDate: '2024-05-20' },
  { id: 7, type: 'oil',    name: 'Brent Crude',     symbol: 'BZ',       quantity: 100,  costPrice: 78.40,  currency: 'USD', purchaseDate: '2024-07-01' },
  { id: 8, type: 'crypto', name: 'Bitcoin',         symbol: 'BTC',      quantity: 0.15, costPrice: 42000,  currency: 'USD', purchaseDate: '2024-02-14' },
  { id: 9, type: 'crypto', name: 'Ethereum',        symbol: 'ETH',      quantity: 2.5,  costPrice: 2800,   currency: 'USD', purchaseDate: '2024-03-25' },
  { id: 10, type: 'bond',  name: 'Saudi Govt Bond 2029', symbol: 'KSA29', quantity: 10, costPrice: 985,    currency: 'USD', purchaseDate: '2024-01-20', couponRate: 4.75, maturityDate: '2029-06-15' },
  { id: 11, type: 'cash',  name: 'USD Cash',        symbol: 'USD',      quantity: 15000, costPrice: 1,     currency: 'USD', purchaseDate: '2024-01-01' },
  { id: 12, type: 'cash',  name: 'SAR Cash',        symbol: 'SAR',      quantity: 25000, costPrice: 1,     currency: 'SAR', purchaseDate: '2024-01-01' },
];
