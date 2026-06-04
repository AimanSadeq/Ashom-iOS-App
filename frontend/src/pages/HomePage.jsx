import { useState, useMemo, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  Cpu, FileText, Building2, BarChart2,
  FileSpreadsheet, Monitor, Zap,
  Bitcoin, Star, Users, Download, ArrowDownUp, Crown, Layers,
  Settings2, Pin, PinOff, GripVertical, Plus, X, Search,
  ChevronRight, Gamepad2, BookOpen, DollarSign,
  Calendar, TrendingUp, Landmark, PieChart, Shield, Rocket, Calculator, GraduationCap
} from 'lucide-react';

import OnboardingModal from '../components/onboarding/OnboardingModal';
import usePin from '../hooks/usePin';
import useApi from '../hooks/useApi';
import { companies, markets } from '../services/api';

const TAB_KEY = 'vifm-home-tab';

/* ─── GCC Market Index Data ─── */
const GCC_MARKETS = [
  { id: 'tasi',   flag: '🇸🇦', code: 'SA', symbol: 'TASI',   value: 12484, change: 1.24,  up: true,  sparkline: '0,20 15,18 30,16 45,14 60,15 75,12 90,10 105,8 130,6' },
  { id: 'dfm',    flag: '🇦🇪', code: 'AE', symbol: 'DFM',    value: 4521,  change: -0.38, up: false, sparkline: '0,8 20,10 40,9 60,12 80,14 100,16 115,18 130,20' },
  { id: 'qe',     flag: '🇶🇦', code: 'QA', symbol: 'QE',     value: 10246, change: 0.67,  up: true,  sparkline: '0,18 20,16 40,17 55,14 75,12 95,10 115,9 130,7' },
  { id: 'boursa', flag: '🇰🇼', code: 'KW', symbol: 'Boursa', value: 7892,  change: 0.15,  up: true,  sparkline: '0,15 25,14 50,13 75,14 95,12 115,11 130,10' },
  { id: 'bax',    flag: '🇧🇭', code: 'BH', symbol: 'BAX',    value: 1985,  change: -0.12, up: false, sparkline: '0,10 30,11 55,12 80,13 100,15 120,16 130,18' },
  { id: 'msm',    flag: '🇴🇲', code: 'OM', symbol: 'MSM30',  value: 4678,  change: 0.89,  up: true,  sparkline: '0,20 20,18 45,15 65,13 85,11 105,8 130,5' },
];

/* ─── Icon lookup for serialized pins ─── */
const ICON_MAP = {
  Building2, BarChart2, Zap, Bitcoin, Star, FileText, FileSpreadsheet,
  Monitor, Users, Layers, Crown, ArrowDownUp, Cpu, BookOpen,
  Search, Download, Gamepad2, DollarSign, Calendar, TrendingUp,
  Landmark, PieChart, Shield, Rocket, Calculator, GraduationCap,
};

/* ─── Quick shortcuts for picker ─── */
const QUICK_SHORTCUTS = [
  { label: 'My Portfolio',      subtitle: 'Live portfolio value', route: '/portfolio',      iconName: 'Monitor',       color: 'navy',   pinType: 'portfolio' },
  { label: 'Screener',          subtitle: 'Filter companies',     route: '/screener',       iconName: 'Search',        color: 'blue' },
  { label: 'Quant Lab',         subtitle: 'Factor models & risk', route: '/quant',          iconName: 'Zap',           color: 'purple' },
  { label: 'Currency Converter', subtitle: 'GCC cross rates',     route: '/currency',       iconName: 'ArrowDownUp',   color: 'green' },
  { label: 'Sector Dashboard',  subtitle: 'Industry analysis',    route: '/sectors',        iconName: 'Layers',        color: 'blue' },
  { label: 'Curated Lists',     subtitle: 'Smart picks',          route: '/curated',        iconName: 'Crown',         color: 'amber' },
  { label: 'PDF Reports',       subtitle: 'Export portfolio',     route: '/reports/export',  iconName: 'Download',     color: 'green' },
  { label: 'Watchlist',         subtitle: 'Tracked companies',    route: '/watchlist',       iconName: 'Star',          color: 'amber' },
  { label: 'Classroom',         subtitle: 'Compete with class',   route: '/classroom',       iconName: 'Users',         color: 'teal' },
  { label: 'Practice Simulator', subtitle: '$100K virtual cash',  route: '/portfolio',       iconName: 'Gamepad2',      color: 'purple' },
  { label: 'Earnings Calendar', subtitle: 'Upcoming reports',     route: '/earnings',        iconName: 'Calendar',      color: 'blue' },
  { label: 'Dividend Calendar', subtitle: 'Ex-dividend dates',    route: '/dividends',       iconName: 'DollarSign',    color: 'green' },
  { label: 'IPO Calendar',      subtitle: 'New listings',         route: '/ipo-calendar',    iconName: 'TrendingUp',    color: 'orange' },
  { label: 'Central Bank Rates', subtitle: 'GCC monetary policy', route: '/rates',           iconName: 'Building2',     color: 'navy' },
  { label: 'Options Screener',  subtitle: 'Derivatives market',   route: '/options',         iconName: 'BarChart2',     color: 'purple' },
  { label: 'Cross-Listings',    subtitle: 'Multi-exchange stocks', route: '/cross-listings', iconName: 'ArrowDownUp',   color: 'blue' },
  { label: 'Sharia Screening',  subtitle: 'AAOIFI compliance',    route: '/sharia',          iconName: 'Star',          color: 'green' },
  { label: 'Fractional Shares', subtitle: 'Learn about fractions', route: '/fractional-shares', iconName: 'BookOpen',   color: 'amber' },
  { label: 'Zakat Report',      subtitle: 'Wealth obligation',    route: '/zakat',           iconName: 'DollarSign',    color: 'green' },
  { label: 'Net Worth',         subtitle: 'Total asset view',     route: '/net-worth',       iconName: 'DollarSign',    color: 'navy' },
  { label: 'Copy Trading',      subtitle: 'Mirror top investors', route: '/copy-trading',    iconName: 'Users',         color: 'purple' },
  { label: 'Community',         subtitle: 'Social feed',          route: '/community',       iconName: 'Users',         color: 'teal' },
  { label: 'Family Hub',        subtitle: 'Family portfolios',    route: '/family',          iconName: 'Users',         color: 'teal' },
];

/* ─── Price mapping ─── */
const PRICE_MAP = {
  'XAU': 'gold', 'XAG': 'silver', 'XPT': 'platinum', 'XPD': 'palladium',
  'CL': 'wti', 'BZ': 'brent',
  'BTC': 'bitcoin', 'ETH': 'ethereum', 'BNB': 'binancecoin', 'SOL': 'solana',
  'ADA': 'cardano', 'XRP': 'ripple', 'DOT': 'polkadot', 'DOGE': 'dogecoin',
  'AVAX': 'avalanche-2', 'MATIC': 'matic-network',
};
const INDEX_DATA = {
  tasi: { label: 'TASI', country: 'SA', value: 12483, change: 1.24 },
  dfm: { label: 'DFM', country: 'AE', value: 4521, change: -0.38 },
  qe: { label: 'QE', country: 'QA', value: 10245, change: 0.67 },
  boursa: { label: 'Boursa', country: 'KW', value: 7892, change: 0.15 },
  bax: { label: 'BAX', country: 'BH', value: 1985, change: -0.12 },
  msm: { label: 'MSM30', country: 'OM', value: 4678, change: 0.89 },
};

/* ─── Top Movers Mock Data ─── */
const TOP_MOVERS = {
  gainers: [
    { name: 'Saudi Aramco', ticker: '2222.SR', country: 'SA', price: 28.45, change: 3.82 },
    { name: 'Al Rajhi Bank', ticker: '1120.SR', country: 'SA', price: 95.20, change: 2.54 },
    { name: 'Emaar Properties', ticker: 'EMAAR.AE', country: 'AE', price: 8.76, change: 2.11 },
    { name: 'Qatar National Bank', ticker: 'QNBK.QA', country: 'QA', price: 14.30, change: 1.89 },
    { name: 'National Bank of Kuwait', ticker: 'NBK.KW', country: 'KW', price: 1.02, change: 1.52 },
  ],
  losers: [
    { name: 'SABIC', ticker: '2010.SR', country: 'SA', price: 72.10, change: -2.41 },
    { name: 'Dubai Islamic Bank', ticker: 'DIB.AE', country: 'AE', price: 6.22, change: -1.85 },
    { name: 'Ooredoo', ticker: 'ORDS.QA', country: 'QA', price: 9.45, change: -1.33 },
    { name: 'Zain Group', ticker: 'ZAIN.KW', country: 'KW', price: 0.58, change: -1.12 },
    { name: 'Ahli United Bank', ticker: 'AUB.BH', country: 'BH', price: 0.81, change: -0.94 },
  ],
};

const COLOR_MAP = {
  red:    { bg: '#FFF0F3', fg: '#FF4B6E' },
  orange: { bg: '#FFF5ED', fg: '#FF8A35' },
  blue:   { bg: '#EAF2FC', fg: '#5391D5' },
  amber:  { bg: '#FFF8E6', fg: '#F2A600' },
  navy:   { bg: '#EAEBF7', fg: '#010131' },
  purple: { bg: '#F0EEFE', fg: '#7C5FDB' },
  green:  { bg: '#E6FAF5', fg: '#00C896' },
  teal:   { bg: '#E3F6F5', fg: '#00A8A0' },
};

function formatPinPrice(p) {
  if (!p) return '--';
  if (p >= 1000) return p.toLocaleString();
  if (p >= 100) return p.toFixed(0);
  if (p >= 1) return '$' + p.toFixed(2);
  return '$' + p.toFixed(4);
}

function getPortfolioValue() {
  try {
    const holdings = JSON.parse(localStorage.getItem('vifm-portfolio')) || [];
    const totalValue = holdings.reduce((sum, h) => sum + (h.quantity * (h.currentPrice || h.costPrice)), 0);
    const totalCost = holdings.reduce((sum, h) => sum + (h.quantity * h.costPrice), 0);
    const gain = totalCost > 0 ? ((totalValue - totalCost) / totalCost * 100) : 0;
    return { value: totalValue, gain, count: holdings.length };
  } catch { return { value: 0, gain: 0, count: 0 }; }
}

/* ═══════════════════════════════════════════════════════
   SHARED COMPONENTS
   ═══════════════════════════════════════════════════════ */

function SectionHeader({ title, link, onLink }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <span className="font-head text-[11px] font-bold uppercase tracking-[1.2px]" style={{ color: 'var(--text-3)' }}>{title}</span>
      {link && (
        <button onClick={onLink} className="text-[12px] font-semibold" style={{ color: 'var(--blue)' }}>{link}</button>
      )}
    </div>
  );
}

function PinButton({ pinned, onToggle, size = 11 }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      className="p-1 rounded-full transition-all active:scale-90 flex-shrink-0"
      style={{ background: pinned ? 'var(--blue-light)' : 'transparent' }}
      aria-label={pinned ? 'Unpin' : 'Pin to My Screen'}
    >
      {pinned
        ? <PinOff size={size} style={{ color: 'var(--blue)' }} />
        : <Pin size={size} style={{ color: 'var(--text-3)' }} />}
    </button>
  );
}

const COUNTRY_TINTS = {
  tasi:   'rgba(0, 200, 150, 0.06)',
  dfm:    'rgba(83, 145, 213, 0.06)',
  qe:     'rgba(128, 0, 0, 0.06)',
  boursa: 'rgba(0, 122, 61, 0.06)',
  bax:    'rgba(206, 17, 38, 0.06)',
  msm:    'rgba(0, 128, 0, 0.06)',
};
const COUNTRY_BORDERS = {
  tasi:   '#00C896',
  dfm:    '#5391D5',
  qe:     '#8B0000',
  boursa: '#007A3D',
  bax:    '#CE1126',
  msm:    '#008000',
};

function TickerCard({ market, delay, onClick }) {
  const strokeColor = market.up ? '#00C896' : '#FF4B6E';
  return (
    <div
      onClick={onClick}
      className="min-w-[130px] rounded-md p-3.5 flex-shrink-0 cursor-pointer transition-all duration-150 hover:-translate-y-0.5"
      style={{
        background: COUNTRY_TINTS[market.id] || 'var(--card)',
        borderLeft: `3px solid ${COUNTRY_BORDERS[market.id] || 'var(--border)'}`,
        border: '1px solid var(--border)',
        borderLeft: `3px solid ${COUNTRY_BORDERS[market.id] || 'var(--border)'}`,
        animation: `slideIn 0.4s ease ${delay}s both`,
      }}
    >
      <div className="flex items-center gap-[5px] mb-2">
        <div className="w-[18px] h-[18px] rounded-full text-[11px] flex items-center justify-center flex-shrink-0" style={{ background: 'var(--blue-light)' }}>
          {market.flag}
        </div>
        <span className="text-[10px] font-bold tracking-[0.5px]" style={{ color: 'var(--text-3)' }}>{market.code}</span>
        <span className="font-head text-[12px] font-bold ml-auto" style={{ color: 'var(--text-2)' }}>{market.symbol}</span>
      </div>
      <div className="font-head text-[20px] font-bold leading-none" style={{ color: 'var(--navy)', letterSpacing: '-0.5px' }}>
        {market.value.toLocaleString()}
      </div>
      <span
        className="inline-flex items-center gap-[3px] text-[11px] font-bold mt-[5px] px-[7px] py-[3px] rounded-[6px]"
        style={{
          color: market.up ? '#00A878' : 'var(--red)',
          background: market.up ? 'var(--green-bg)' : 'var(--red-bg)',
        }}
      >
        <svg viewBox="0 0 12 12" fill="currentColor" width="10" height="10">
          {market.up
            ? <path d="M6 2L10 8H2L6 2Z"/>
            : <path d="M6 10L2 4H10L6 10Z"/>}
        </svg>
        {market.up ? '+' : ''}{market.change.toFixed(2)}%
      </span>
      <div className="mt-2">
        <svg viewBox="0 0 130 28" preserveAspectRatio="none" style={{ width: '100%', height: 28 }}>
          <polyline points={market.sparkline} fill="none" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
}

function FeatureCardGrid({ icon: Icon, category, title, subtitle, badge, color, onClick }) {
  const c = COLOR_MAP[color] || COLOR_MAP.blue;
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-md p-4 cursor-pointer relative overflow-hidden transition-all duration-150 hover:-translate-y-0.5 animate-fade-up"
      style={{ border: '1px solid var(--border)' }}
    >
      {badge && (
        <span className={`absolute top-2.5 right-2.5 text-[9px] font-extrabold tracking-[0.5px] uppercase px-[7px] py-[3px] rounded-full text-white ${
          badge === 'LIVE' ? 'bg-[#00C896]' : badge === 'HOT' ? 'bg-[#FF4B6E]' : 'bg-[#5391D5]'
        }`}>{badge}</span>
      )}
      <div className="w-10 h-10 rounded-sm flex items-center justify-center mb-3" style={{ background: c.bg, borderRadius: 'var(--r-sm)' }}>
        <Icon size={20} style={{ color: c.fg }} strokeWidth={2} />
      </div>
      <p className="text-[10px] font-bold uppercase tracking-[0.8px] mb-[3px]" style={{ color: 'var(--text-3)' }}>{category}</p>
      <p className="font-head text-[14px] font-bold leading-tight" style={{ color: 'var(--navy)' }}>{title}</p>
      {subtitle && <p className="text-[11px] font-medium mt-[3px]" style={{ color: 'var(--text-3)' }}>{subtitle}</p>}
    </div>
  );
}

function FeatureCardRow({ icon: Icon, category, title, subtitle, badge, color, onClick }) {
  const c = COLOR_MAP[color] || COLOR_MAP.blue;
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-md p-3.5 px-4 flex items-center gap-3.5 cursor-pointer relative overflow-hidden transition-all duration-150 hover:-translate-y-0.5 animate-fade-up"
      style={{ border: '1px solid var(--border)' }}
    >
      {badge && (
        <span className={`absolute top-2.5 right-2.5 text-[9px] font-extrabold tracking-[0.5px] uppercase px-[7px] py-[3px] rounded-full text-white ${
          badge === 'NEW' ? 'bg-[#5391D5]' : badge === 'HOT' ? 'bg-[#FF4B6E]' : 'bg-[#00C896]'
        }`}>{badge}</span>
      )}
      <div className="w-10 h-10 rounded-sm flex items-center justify-center flex-shrink-0" style={{ background: c.bg, borderRadius: 'var(--r-sm)' }}>
        <Icon size={20} style={{ color: c.fg }} strokeWidth={2} />
      </div>
      <div className="flex-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.8px] mb-[3px]" style={{ color: 'var(--text-3)' }}>{category}</p>
        <p className="font-head text-[14px] font-bold leading-tight" style={{ color: 'var(--navy)' }}>{title}</p>
        {subtitle && <p className="text-[11px] font-medium mt-[3px]" style={{ color: 'var(--text-3)' }}>{subtitle}</p>}
      </div>
      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
        <ChevronRight size={14} style={{ color: 'var(--text-2)' }} />
      </div>
    </div>
  );
}

function MiniSparkline({ name, positive }) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
  const points = Array.from({ length: 12 }, (_, i) => {
    const seed = Math.abs(hash * (i + 1) * 9301 + 49297) % 233280;
    const rand = seed / 233280;
    const base = positive ? 20 - (i * 0.8) : 10 + (i * 0.5);
    return Math.max(2, Math.min(22, base + (rand - 0.5) * 10));
  });
  const w = 40, h = 20;
  const stepX = w / (points.length - 1);
  const d = points.map((y, i) => `${i === 0 ? 'M' : 'L'}${(i * stepX).toFixed(1)},${y.toFixed(1)}`).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="flex-shrink-0">
      <path d={d} fill="none" stroke={positive ? '#00C896' : '#FF4B6E'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AIPromoCard({ onClick }) {
  return (
    <div
      onClick={onClick}
      className="rounded-lg p-5 flex items-center gap-4 cursor-pointer overflow-hidden relative animate-fade-up"
      style={{ background: 'var(--navy)', borderRadius: 'var(--r-lg)' }}
    >
      {/* Decorative circles */}
      <div className="absolute -top-[30px] -right-[30px] w-[120px] h-[120px] rounded-full" style={{ background: 'rgba(83,145,213,0.25)' }} />
      <div className="absolute -bottom-[20px] right-[60px] w-[80px] h-[80px] rounded-full" style={{ background: 'rgba(83,145,213,0.12)' }} />

      <div className="w-[52px] h-[52px] rounded-md flex items-center justify-center flex-shrink-0 relative z-10" style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 'var(--r-md)' }}>
        <Cpu size={26} className="text-white" />
      </div>
      <div className="flex-1 relative z-10">
        <p className="text-[10px] font-bold uppercase tracking-[1px] mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>AI Financial Analyst</p>
        <p className="font-head text-[16px] font-bold text-white leading-tight mb-1">Ask about GCC markets</p>
        <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.55)' }}>820+ companies · Live data</p>
      </div>
      <button onClick={onClick} className="flex-shrink-0 relative z-10 text-[12px] font-bold text-white px-3.5 py-2 rounded-sm" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 'var(--r-sm)' }}>
        Ask AI
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SHORTCUT PICKER MODAL (preserved from original)
   ═══════════════════════════════════════════════════════ */
function ShortcutPicker({ onClose, onAddTool, onAddCompany, pins }) {
  const [tab, setTab] = useState('shortcuts');
  const [search, setSearch] = useState('');
  const { data } = useApi(() => companies.list(), []);
  const companyList = useMemo(() => {
    if (!data) return [];
    const list = Array.isArray(data) ? data : data.companies || [];
    if (!search) return list.slice(0, 20);
    return list.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || (c.symbol || '').toLowerCase().includes(search.toLowerCase())).slice(0, 20);
  }, [data, search]);

  const filteredShortcuts = QUICK_SHORTCUTS.filter(s =>
    !search || s.label.toLowerCase().includes(search.toLowerCase())
  );

  return createPortal(
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="bg-white rounded-t-2xl w-full max-w-[430px] animate-fade-in max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Sticky header */}
        <div className="p-4 pb-0 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-head text-[14px] font-bold" style={{ color: 'var(--navy)' }}>Add to My Screen</h3>
            <div className="flex items-center gap-2">
              <button onClick={onClose} className="px-3 py-1.5 rounded-sm text-[12px] font-bold text-white active:scale-95 transition-all" style={{ background: 'var(--navy)', borderRadius: 'var(--r-sm)' }}>Done</button>
              <button onClick={onClose} className="p-2 -mr-1 rounded-lg hover:bg-gray-100 active:scale-90 transition-all"><X size={18} style={{ color: 'var(--text-2)' }} /></button>
            </div>
          </div>

          <div className="flex gap-1 p-0.5 rounded-md mb-3" style={{ background: 'var(--bg)' }}>
            <button onClick={() => setTab('shortcuts')} className={`flex-1 py-2 rounded-sm text-[12px] font-semibold transition-all ${tab === 'shortcuts' ? 'bg-white shadow-sm' : ''}`} style={{ color: tab === 'shortcuts' ? 'var(--navy)' : 'var(--text-3)' }}>Shortcuts</button>
            <button onClick={() => setTab('companies')} className={`flex-1 py-2 rounded-sm text-[12px] font-semibold transition-all ${tab === 'companies' ? 'bg-white shadow-sm' : ''}`} style={{ color: tab === 'companies' ? 'var(--navy)' : 'var(--text-3)' }}>Companies</button>
          </div>

          <div className="relative mb-3">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-3)' }} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder={tab === 'shortcuts' ? 'Search tools...' : 'Search companies...'}
              className="w-full text-[12px] rounded-md pl-9 pr-3 py-2.5 focus:outline-none"
              style={{ border: '1px solid var(--border)', color: 'var(--text-1)' }}
            />
          </div>
        </div>

        {/* Scrollable list */}
        <div className="overflow-y-auto px-4 pb-4 flex-1">

        {tab === 'shortcuts' && (
          <div className="space-y-2">
            {filteredShortcuts.map(s => {
              const pinId = s.pinType === 'portfolio' ? 'portfolio-real' : 'tool-' + s.route.replace(/\//g, '-');
              const alreadyPinned = pins.some(p => p.id === pinId);
              const Icon = ICON_MAP[s.iconName] || Zap;
              const c = COLOR_MAP[s.color] || COLOR_MAP.blue;
              return (
                <button key={s.route} onClick={() => { if (!alreadyPinned) onAddTool(s); }} disabled={alreadyPinned}
                  className={`w-full bg-white rounded-md p-3 flex items-center gap-3 text-left transition-all ${alreadyPinned ? 'opacity-40' : 'hover:-translate-y-0.5'}`}
                  style={{ border: '1px solid var(--border)' }}>
                  <div className="w-8 h-8 rounded-sm flex items-center justify-center flex-shrink-0" style={{ background: c.bg, borderRadius: 'var(--r-sm)' }}>
                    <Icon size={14} style={{ color: c.fg }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold" style={{ color: 'var(--navy)' }}>{s.label}</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-3)' }}>{s.subtitle}</p>
                  </div>
                  {alreadyPinned ? <span className="text-[10px]" style={{ color: 'var(--text-3)' }}>Pinned</span> : <Pin size={13} style={{ color: 'var(--blue)' }} />}
                </button>
              );
            })}
          </div>
        )}

        {tab === 'companies' && (
          <div className="space-y-2">
            {companyList.map(c => {
              const pinId = 'company-' + c.id;
              const alreadyPinned = pins.some(p => p.id === pinId);
              return (
                <button key={c.id} onClick={() => { if (!alreadyPinned) onAddCompany(c); }} disabled={alreadyPinned}
                  className={`w-full bg-white rounded-md p-3 flex items-center gap-3 text-left transition-all ${alreadyPinned ? 'opacity-40' : 'hover:-translate-y-0.5'}`}
                  style={{ border: '1px solid var(--border)' }}>
                  <div className="w-8 h-8 rounded-sm flex items-center justify-center flex-shrink-0" style={{ background: '#EAF2FC', borderRadius: 'var(--r-sm)' }}>
                    <Building2 size={14} style={{ color: '#5391D5' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold truncate" style={{ color: 'var(--navy)' }}>{c.name}</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-3)' }}>{c.symbol} · {c.sector || '--'}</p>
                  </div>
                  {alreadyPinned ? <span className="text-[10px]" style={{ color: 'var(--text-3)' }}>Pinned</span> : <Pin size={13} style={{ color: 'var(--blue)' }} />}
                </button>
              );
            })}
          </div>
        )}
        </div>{/* end scrollable list */}
      </div>
    </div>,
    document.body
  );
}


/* ═══════════════════════════════════════════════════════
   HOME PAGE
   ═══════════════════════════════════════════════════════ */
export default function HomePage({ user }) {
  const navigate = useNavigate();
  const { pins, addPin, removePin, isPinned, reorderPins, createPin } = usePin();

  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem('vifm-onboarding-done'));
  const [tab, setTab] = useState(() => localStorage.getItem(TAB_KEY) || 'my');
  const [editing, setEditing] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [livePrices, setLivePrices] = useState({});


  // Fetch live prices for pinned metals/crypto
  const hasLivePins = pins.some(p => p.type === 'metal' || p.type === 'crypto');
  useEffect(() => {
    if (!hasLivePins) return;
    async function fetchPrices() {
      const prices = {};
      try {
        const commRes = await markets.commodities();
        const commData = commRes.data || commRes;
        Object.entries(commData).forEach(([key, val]) => { if (val) prices[key.toLowerCase()] = val; });
      } catch { /* ignore */ }
      try {
        const cryptoRes = await markets.crypto('bitcoin,ethereum,binancecoin,solana,ripple,cardano,dogecoin,polkadot,avalanche-2,matic-network');
        const cryptoData = cryptoRes.data || cryptoRes;
        Object.entries(cryptoData).forEach(([key, val]) => { if (val) prices[key.toLowerCase()] = val; });
      } catch { /* ignore */ }
      setLivePrices(prices);
    }
    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, [hasLivePins]);

  function handleTabChange(t) {
    setTab(t);
    localStorage.setItem(TAB_KEY, t);
    setEditing(false);
  }

  // Pin helpers
  const pinHelper = useCallback((route, label, subtitle, color, iconName) => {
    const pinId = 'tool-' + route.replace(/\//g, '-');
    return {
      pinned: isPinned(pinId),
      toggle: () => {
        if (isPinned(pinId)) removePin(pinId);
        else addPin(createPin('tool', { route, label, subtitle, color, iconName }));
      },
    };
  }, [isPinned, addPin, removePin, createPin]);

  function getItemPinData(pin) {
    let price = null, change = null;
    if (pin.type === 'index' && pin.indexId && INDEX_DATA[pin.indexId]) {
      const idx = INDEX_DATA[pin.indexId]; price = idx.value; change = idx.change;
    } else if ((pin.type === 'metal' || pin.type === 'crypto') && livePrices) {
      const priceKey = PRICE_MAP[pin.subtitle] || pin.subtitle?.toLowerCase();
      const priceData = livePrices[priceKey];
      price = priceData?.price || (typeof priceData === 'number' ? priceData : null);
      change = priceData?.change || priceData?.changePercent || 0;
    } else if (pin.type === 'portfolio') {
      const pf = getPortfolioValue(); price = pf.value; change = pf.gain;
    }
    return { price, change };
  }

  /* ─── Render pinned items on My Screen ─── */
  function renderPinnedContent() {
    if (pins.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-14 h-14 rounded-md flex items-center justify-center mb-4" style={{ background: 'var(--blue-light)', borderRadius: 'var(--r-md)' }}>
            <Pin size={22} style={{ color: 'var(--blue)' }} />
          </div>
          <p className="font-head text-[14px] font-bold mb-1" style={{ color: 'var(--navy)' }}>No items pinned</p>
          <p className="text-[12px] text-center max-w-[240px]" style={{ color: 'var(--text-3)' }}>Go to Explore and tap the pin icon on any tile to add it here.</p>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-md overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <table className="w-full">
          <thead>
            <tr style={{ background: 'var(--bg)' }}>
              <th className="text-left px-3 py-1.5 text-[8px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>Asset</th>
              <th className="text-right px-3 py-1.5 text-[8px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>Price</th>
              <th className="text-right px-3 py-1.5 w-[50px] text-[8px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>Change</th>
              <th className="w-[30px]"></th>
            </tr>
          </thead>
          <tbody>
            {pins.map(pin => {
              const { price, change } = getItemPinData(pin);
              const Icon = ICON_MAP[pin.iconName] || Building2;
              const c = COLOR_MAP[pin.color] || COLOR_MAP.blue;
              const isPositive = (change || 0) >= 0;
              return (
                <tr key={pin.id} onClick={() => navigate(pin.route)} className="cursor-pointer hover:bg-gray-50/50 transition-colors" style={{ borderTop: '1px solid var(--bg)' }}>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: c.bg }}>
                        <Icon size={11} style={{ color: c.fg }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] font-bold truncate" style={{ color: 'var(--navy)' }}>{pin.label}</p>
                        <p className="text-[8px]" style={{ color: 'var(--text-3)' }}>{pin.subtitle}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <p className="text-[12px] font-bold tabular-nums" style={{ color: 'var(--navy)' }}>{price != null ? formatPinPrice(price) : '--'}</p>
                  </td>
                  <td className="px-3 py-2 text-right">
                    {typeof change === 'number' && change !== 0 ? (
                      <span className="text-[9px] font-bold tabular-nums" style={{ color: isPositive ? '#00C896' : '#FF4B6E' }}>
                        {isPositive ? '+' : ''}{change.toFixed(2)}%
                      </span>
                    ) : <span className="text-[9px]" style={{ color: 'var(--text-3)' }}>--</span>}
                  </td>
                  <td className="py-2 pr-2">
                    <button onClick={e => { e.stopPropagation(); removePin(pin.id); }} className="p-1 rounded hover:bg-red-50 transition-colors active:scale-90" aria-label="Unpin">
                      <X size={10} className="text-gray-300 hover:text-red-400" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  /* ─── Render editing view ─── */
  function renderEditingView() {
    return (
      <div className="space-y-2">
        <p className="text-[10px]" style={{ color: 'var(--text-3)' }}>Reorder or unpin. Tap "Add Shortcut" to pin any page or company.</p>
        {pins.map((pin, i) => (
          <div key={pin.id} className="bg-white rounded-md p-3 flex items-center gap-3" style={{ border: '1px dashed var(--blue-mid)' }}>
            <button onClick={() => reorderPins(i, -1)} disabled={i === 0} className="disabled:opacity-20" style={{ color: 'var(--text-3)' }}><GripVertical size={14} /></button>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-bold" style={{ color: 'var(--navy)' }}>{pin.label}</p>
              <p className="text-[10px]" style={{ color: 'var(--text-3)' }}>{pin.subtitle || pin.type}</p>
            </div>
            <button onClick={() => removePin(pin.id)} className="p-1.5 rounded-lg hover:bg-red-50"><PinOff size={13} style={{ color: 'var(--text-3)' }} /></button>
          </div>
        ))}
      </div>
    );
  }

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  return (
    <div className="animate-fade-in">

      {showOnboarding && <OnboardingModal onComplete={() => setShowOnboarding(false)} />}

      {/* ── TOGGLE (My Screen / Explore) ── */}
      <div className="px-5 pt-3">
        <div className="flex bg-white rounded-md p-1" style={{ border: '1px solid var(--border)' }}>
          <button
            onClick={() => handleTabChange('my')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-sm text-[13px] font-semibold transition-all duration-200"
            style={tab === 'my'
              ? { background: 'var(--navy)', color: '#fff', boxShadow: '0 2px 8px rgba(1,1,49,0.25)' }
              : { background: 'transparent', color: 'var(--text-3)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
            My Screen
          </button>
          <button
            onClick={() => handleTabChange('explore')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-sm text-[13px] font-semibold transition-all duration-200"
            style={tab === 'explore'
              ? { background: 'var(--navy)', color: '#fff', boxShadow: '0 2px 8px rgba(1,1,49,0.25)' }
              : { background: 'transparent', color: 'var(--text-3)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            Explore
          </button>
        </div>
      </div>

      {/* ══════════ MY SCREEN TAB ══════════ */}
      {tab === 'my' && (
        <div className="px-5 pt-4 space-y-4">
          <div className="flex justify-end gap-2">
            {editing && (
              <button onClick={() => setShowPicker(true)}
                className="flex items-center gap-1 text-[10px] font-semibold px-3 py-1.5 rounded-sm"
                style={{ background: 'var(--green-bg)', color: 'var(--green)' }}>
                <Plus size={11} /> Add Shortcut
              </button>
            )}
            <button onClick={() => setEditing(e => !e)}
              className="flex items-center gap-1 text-[10px] font-semibold px-3 py-1.5 rounded-sm transition-all"
              style={editing ? { background: 'var(--navy)', color: '#fff' } : { background: 'var(--bg)', color: 'var(--text-2)', border: '1px solid var(--border)' }}>
              <Settings2 size={11} /> {editing ? 'Done' : 'Customize'}
            </button>
          </div>

          {editing ? renderEditingView() : renderPinnedContent()}
          <div className="h-4" />
        </div>
      )}

      {/* ══════════ EXPLORE TAB ══════════ */}
      {tab === 'explore' && (
        <div className="space-y-0">

          {/* ── 1. GCC Markets Ticker ── */}
          <div className="px-5 pt-[18px]">
            <div className="flex items-center justify-between mb-3">
              <span className="font-head text-[11px] font-bold uppercase tracking-[1.2px]" style={{ color: 'var(--text-3)' }}>GCC Markets</span>
              <div className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--text-3)' }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ background: 'var(--green)' }} />
                <span>Live · {timeStr}</span>
              </div>
            </div>
            <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-1">
              {GCC_MARKETS.map((m, i) => <TickerCard key={m.id} market={m} delay={0.05 + i * 0.05} onClick={() => navigate('/markets')} />)}
            </div>
          </div>

          {/* ── 2. AI Financial Analyst Promo ── */}
          <div className="px-5 pt-4">
            <AIPromoCard onClick={() => navigate('/ai')} />
          </div>

          {/* ── 3. Quick Access (2x3 grid) ── */}
          <div className="px-5 pt-5">
            <SectionHeader title="Quick Access" />
            <div className="grid grid-cols-3 gap-2 stagger-children">
              {[
                { icon: Zap, label: 'Metals & Oil', route: '/metals', bg: '#FFF0F3', fg: '#FF4B6E', iconName: 'Zap', color: 'red' },
                { icon: Bitcoin, label: 'Crypto', route: '/crypto', bg: '#FFF5ED', fg: '#FF8A35', iconName: 'Bitcoin', color: 'orange' },
                { icon: Building2, label: 'Companies', route: '/companies', bg: '#EAF2FC', fg: '#5391D5', iconName: 'Building2', color: 'blue' },
                { icon: Monitor, label: 'Portfolio', route: '/portfolio', bg: '#EAEBF7', fg: '#010131', iconName: 'Monitor', color: 'navy' },
                { icon: BarChart2, label: 'Analytics', route: '/analytics', bg: '#F0EEFE', fg: '#7C5FDB', iconName: 'BarChart2', color: 'purple' },
                { icon: Cpu, label: 'AI Analyst', route: '/ai', bg: '#E3F6F5', fg: '#00A8A0', iconName: 'Cpu', color: 'teal' },
              ].map(item => {
                const ph = pinHelper(item.route, item.label, '', item.color, item.iconName);
                return (
                  <div key={item.route} onClick={() => navigate(item.route)}
                    className="bg-white rounded-md p-3 flex flex-col items-center gap-2 cursor-pointer relative transition-all duration-150 hover:-translate-y-0.5"
                    style={{ border: '1px solid var(--border)', background: 'var(--card)' }}>
                    <div className="absolute top-1 right-1"><PinButton pinned={ph.pinned} onToggle={ph.toggle} size={10} /></div>
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: item.bg }}>
                      <item.icon size={18} style={{ color: item.fg }} />
                    </div>
                    <span className="text-[11px] font-semibold text-center" style={{ color: 'var(--navy)' }}>{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Top-Level Pages ── */}
          <div className="px-5 pt-5">
            <div className="flex flex-col gap-2.5">
              {[
                { icon: TrendingUp, label: 'Markets', subtitle: 'GCC indices, top movers & live data', route: '/markets', bg: 'linear-gradient(135deg, rgba(83,145,213,0.08), rgba(0,200,150,0.05))', iconBg: '#EAF2FC', iconFg: '#5391D5', iconName: 'TrendingUp', color: 'blue' },
                { icon: Landmark, label: 'Capital Market Authorities', subtitle: '6 GCC regulatory bodies & resources', route: '/cma', bg: 'linear-gradient(135deg, rgba(1,1,49,0.06), rgba(124,95,219,0.04))', iconBg: '#EAEBF7', iconFg: '#010131', iconName: 'Landmark', color: 'navy' },
                { icon: GraduationCap, label: 'Learning', subtitle: 'Courses, university programs & glossary', route: '/learning', bg: 'linear-gradient(135deg, rgba(0,168,160,0.06), rgba(0,200,150,0.04))', iconBg: '#E3F6F5', iconFg: '#00A8A0', iconName: 'GraduationCap', color: 'teal' },
              ].map(item => {
                const ph = pinHelper(item.route, item.label, item.subtitle, item.color, item.iconName);
                return (
                  <div key={item.label} onClick={() => navigate(item.route)}
                    className="w-full rounded-md p-4 flex items-center gap-3.5 text-left cursor-pointer transition-all duration-150 hover:-translate-y-0.5"
                    style={{ border: '1px solid var(--border)', background: item.bg }}>
                    <div className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: item.iconBg }}>
                      <item.icon size={20} style={{ color: item.iconFg }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-head text-[14px] font-bold" style={{ color: 'var(--navy)' }}>{item.label}</p>
                      <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-2)' }}>{item.subtitle}</p>
                    </div>
                    <PinButton pinned={ph.pinned} onToggle={ph.toggle} />
                    <ChevronRight size={16} style={{ color: 'var(--text-3)' }} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── 4. For You (3 row cards) ── */}
          <div className="px-5 pt-5">
            <SectionHeader title="For You" />
            <div className="flex flex-col gap-2">
              {[
                { icon: Users, category: 'Trading', title: 'Copy Trading', subtitle: "Mirror top investors' portfolios", badge: 'NEW', color: 'purple', route: '/copy-trading', iconName: 'Users' },
                { icon: Users, category: 'Community', title: 'Social Feed', subtitle: 'Discuss stocks & follow analysts', badge: 'NEW', color: 'teal', route: '/community', iconName: 'Users' },
                { icon: Crown, category: 'Curated', title: 'Smart Picks', subtitle: 'Top lists & AI-curated ideas', badge: null, color: 'amber', route: '/curated', iconName: 'Crown' },
              ].map(item => {
                const c = COLOR_MAP[item.color] || COLOR_MAP.blue;
                const ph = pinHelper(item.route, item.title, item.subtitle, item.color, item.iconName);
                return (
                  <div key={item.route} onClick={() => navigate(item.route)}
                    className="bg-white rounded-md p-3.5 px-4 flex items-center gap-3.5 cursor-pointer relative overflow-hidden transition-all duration-150 hover:-translate-y-0.5 animate-fade-up"
                    style={{ border: '1px solid var(--border)' }}>
                    {item.badge && (
                      <span className={`absolute top-2.5 right-2.5 text-[9px] font-extrabold tracking-[0.5px] uppercase px-[7px] py-[3px] rounded-full text-white ${
                        item.badge === 'NEW' ? 'bg-[#5391D5]' : item.badge === 'HOT' ? 'bg-[#FF4B6E]' : 'bg-[#00C896]'
                      }`}>{item.badge}</span>
                    )}
                    <div className="w-10 h-10 rounded-sm flex items-center justify-center flex-shrink-0" style={{ background: c.bg, borderRadius: 'var(--r-sm)' }}>
                      <item.icon size={20} style={{ color: c.fg }} strokeWidth={2} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-[0.8px] mb-[3px]" style={{ color: 'var(--text-3)' }}>{item.category}</p>
                      <p className="font-head text-[14px] font-bold leading-tight" style={{ color: 'var(--navy)' }}>{item.title}</p>
                      <p className="text-[11px] font-medium mt-[3px]" style={{ color: 'var(--text-3)' }}>{item.subtitle}</p>
                    </div>
                    <PinButton pinned={ph.pinned} onToggle={ph.toggle} />
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                      <ChevronRight size={14} style={{ color: 'var(--text-2)' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── 5. More Tools (grouped by category) ── */}
          <div className="px-5 pt-5 pb-4 space-y-4">
            {[
              { title: 'Markets', items: [
                { icon: Star, label: 'Watchlist', subtitle: 'Track favorites', route: '/watchlist', iconName: 'Star', color: 'amber' },
                { icon: Calendar, label: 'Earnings Calendar', subtitle: 'Upcoming reports', route: '/earnings', iconName: 'Calendar', color: 'blue' },
                { icon: DollarSign, label: 'Dividend Calendar', subtitle: 'Ex-dividend dates', route: '/dividends', iconName: 'DollarSign', color: 'green' },
                { icon: TrendingUp, label: 'IPO Calendar', subtitle: 'New GCC listings', route: '/ipo-calendar', iconName: 'TrendingUp', color: 'orange' },
                { icon: Building2, label: 'Central Bank Rates', subtitle: 'GCC monetary policy', route: '/rates', iconName: 'Building2', color: 'navy' },
                { icon: ArrowDownUp, label: 'Cross-Listings', subtitle: 'Multi-exchange stocks', route: '/cross-listings', iconName: 'ArrowDownUp', color: 'blue' },
                { icon: Shield, label: 'Sharia Screening', subtitle: 'AAOIFI compliance', route: '/sharia', iconName: 'Shield', color: 'green' },
                { icon: ArrowDownUp, label: 'Currency Converter', subtitle: 'GCC exchange rates', route: '/currency', iconName: 'ArrowDownUp', color: 'green' },
              ]},
              { title: 'Portfolio', items: [
                { icon: Monitor, label: 'Practice Simulator', subtitle: '$100K virtual cash', route: '/portfolio', iconName: 'Gamepad2', color: 'purple' },
                { icon: DollarSign, label: 'Net Worth', subtitle: 'All assets overview', route: '/net-worth', iconName: 'DollarSign', color: 'navy' },
                { icon: Users, label: 'Family Hub', subtitle: 'Track family investments', route: '/family', iconName: 'Users', color: 'teal' },
                { icon: Users, label: 'Copy Trading', subtitle: 'Mirror top investors', route: '/copy-trading', iconName: 'Users', color: 'purple' },
                { icon: Calculator, label: 'Zakat Report', subtitle: 'Wealth obligation', route: '/zakat', iconName: 'Calculator', color: 'green' },
                { icon: Download, label: 'PDF Export', subtitle: 'Portfolio reports', route: '/reports/export', iconName: 'Download', color: 'green' },
              ]},
              { title: 'Analytics', items: [
                { icon: Search, label: 'Screener', subtitle: 'Filter 820+ companies', route: '/screener', iconName: 'Search', color: 'blue' },
                { icon: Zap, label: 'Quant Lab', subtitle: 'Factor models & risk', route: '/quant', iconName: 'Zap', color: 'purple' },
                { icon: FileText, label: 'Annual Reports', subtitle: 'SEC & CMA filings', route: '/filings', iconName: 'FileText', color: 'blue' },
                { icon: BarChart2, label: 'Options Screener', subtitle: 'Derivatives market', route: '/options', iconName: 'BarChart2', color: 'purple' },
                { icon: Layers, label: 'Sector Dashboard', subtitle: 'Industry analysis', route: '/sectors', iconName: 'Layers', color: 'blue' },
              ]},
              { title: 'Learning', items: [
                { icon: Users, label: 'Classroom', subtitle: 'Compete with classmates', route: '/classroom', iconName: 'Users', color: 'teal' },
                { icon: PieChart, label: 'Fractional Shares', subtitle: 'Invest any amount', route: '/fractional-shares', iconName: 'PieChart', color: 'amber' },
                { icon: BookOpen, label: 'Glossary', subtitle: 'Financial terms A–Z', route: '/glossary', iconName: 'BookOpen', color: 'blue' },
              ]},
            ].map(group => (
              <div key={group.title}>
                <SectionHeader title={group.title} />
                <div className="rounded-md overflow-hidden" style={{ border: '1px solid var(--border)', background: 'var(--card)' }}>
                  {group.items.map((item, i, arr) => {
                    const ph = pinHelper(item.route, item.label, item.subtitle, item.color, item.iconName);
                    return (
                      <div key={item.route} onClick={() => navigate(item.route)}
                        className="w-full flex items-center gap-3 px-3.5 py-2.5 text-left transition-colors hover:bg-gray-50/50 cursor-pointer"
                        style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none', fontFamily: 'var(--font-body)' }}>
                        <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: 'var(--bg)' }}>
                          <item.icon size={13} style={{ color: 'var(--text-2)' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[12px] font-semibold" style={{ color: 'var(--navy)' }}>{item.label}</span>
                          <span className="text-[10px] ml-2" style={{ color: 'var(--text-3)' }}>{item.subtitle}</span>
                        </div>
                        <PinButton pinned={ph.pinned} onToggle={ph.toggle} />
                        <ChevronRight size={12} style={{ color: 'var(--text-3)' }} />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

        </div>
      )}
      {/* ── Shortcut Picker Modal ── */}
      {showPicker && (
        <ShortcutPicker
          onClose={() => setShowPicker(false)}
          pins={pins}
          onAddTool={(s) => {
            if (s.pinType === 'portfolio') {
              addPin({ id: 'portfolio-real', type: 'portfolio', label: 'My Portfolio', subtitle: 'Live value', route: '/portfolio', color: 'navy', iconName: 'Monitor' });
            } else {
              addPin(createPin('tool', s));
            }
          }}
          onAddCompany={(c) => {
            addPin(createPin('company', { companyId: c.id, name: c.name, ticker: c.symbol, sector: c.sector }));
          }}
        />
      )}
    </div>
  );
}
