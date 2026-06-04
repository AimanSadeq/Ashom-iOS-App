import { useState } from 'react';
import { Landmark, ExternalLink, ChevronRight, Calendar, DollarSign, TrendingUp, Percent } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/shared/PageHeader';
import { companies } from '../services/api';

const COUNTRY_FLAGS = {
  SA: '\u{1F1F8}\u{1F1E6}',
  AE: '\u{1F1E6}\u{1F1EA}',
  KW: '\u{1F1F0}\u{1F1FC}',
  QA: '\u{1F1F6}\u{1F1E6}',
  BH: '\u{1F1E7}\u{1F1ED}',
  OM: '\u{1F1F4}\u{1F1F2}',
};

const GCC_AUTHORITIES = [
  { code: 'SA', abbr: 'CMA',  name: 'Capital Market Authority',              country: 'Saudi Arabia', website: 'https://cma.org.sa',   description: 'Regulates and develops the Saudi Arabian capital market, overseeing the Tadawul stock exchange.' },
  { code: 'AE', abbr: 'SCA',  name: 'Securities & Commodities Authority',    country: 'UAE',          website: 'https://www.sca.gov.ae', description: 'Regulates securities and commodities markets in the UAE, including DFM and ADX exchanges.' },
  { code: 'KW', abbr: 'CMA',  name: 'Capital Markets Authority',             country: 'Kuwait',       website: 'https://www.cma.gov.kw', description: 'Oversees the Boursa Kuwait stock exchange and regulates securities activities in Kuwait.' },
  { code: 'QA', abbr: 'QFMA', name: 'Qatar Financial Markets Authority',     country: 'Qatar',        website: 'https://www.qfma.org.qa', description: 'Regulates and supervises the Qatar Stock Exchange and financial markets in Qatar.' },
  { code: 'BH', abbr: 'CBB',  name: 'Central Bank of Bahrain',               country: 'Bahrain',      website: 'https://www.cbb.gov.bh', description: 'Regulates the Bahrain Bourse and all financial institutions in the Kingdom of Bahrain.' },
  { code: 'OM', abbr: 'CMA',  name: 'Capital Market Authority',              country: 'Oman',         website: 'https://www.cma.gov.om', description: 'Regulates the Muscat Securities Market and capital market activities in Oman.' },
];

const MARKET_TOOLS = [
  { label: 'Earnings Calendar', subtitle: 'Upcoming GCC reports', route: '/earnings', icon: Calendar },
  { label: 'IPO Calendar', subtitle: 'Upcoming GCC listings', route: '/ipo-calendar', icon: TrendingUp },
  { label: 'Dividend Calendar', subtitle: 'Upcoming ex-dates', route: '/dividends', icon: DollarSign },
  { label: 'Central Bank Rates', subtitle: 'GCC monetary policy', route: '/rates', icon: Percent },
];

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

export default function MarketsOverviewPage() {
  const navigate = useNavigate();
  const [moversTab, setMoversTab] = useState('gainers');

  async function handleMoverClick(item) {
    try {
      const res = await companies.list({ search: item.name });
      const list = Array.isArray(res) ? res : res.companies || res.data || [];
      if (list.length > 0) { navigate(`/companies/${list[0].id}`); return; }
    } catch {}
    navigate('/companies');
  }

  return (
    <div className="animate-fade-in">
      <PageHeader title="Markets" backTo="/" subtitle="GCC Equities & Pricing" />

      {/* ── Top Movers ── */}
      <div className="px-5 pt-5">
        <div className="flex items-center justify-between mb-3">
          <span className="font-head text-[11px] font-bold uppercase tracking-[1.2px]" style={{ color: 'var(--text-3)' }}>Top Movers</span>
          <div className="flex gap-1 p-0.5 rounded-full" style={{ background: 'var(--bg)' }}>
            <button
              onClick={() => setMoversTab('gainers')}
              className="px-3 py-1 rounded-full text-[10px] font-bold transition-all"
              style={moversTab === 'gainers' ? { background: 'var(--green-bg)', color: 'var(--green)' } : { background: 'transparent', color: 'var(--text-3)' }}
            >Gainers</button>
            <button
              onClick={() => setMoversTab('losers')}
              className="px-3 py-1 rounded-full text-[10px] font-bold transition-all"
              style={moversTab === 'losers' ? { background: 'var(--red-bg)', color: 'var(--red)' } : { background: 'transparent', color: 'var(--text-3)' }}
            >Losers</button>
          </div>
        </div>
        <div className="rounded-md overflow-hidden" style={{ border: '1px solid var(--border)', background: 'var(--card)' }}>
          {TOP_MOVERS[moversTab].map((item, i) => {
            const isGainer = item.change > 0;
            return (
              <div
                key={item.ticker}
                onClick={() => handleMoverClick(item)}
                className="flex items-center gap-2.5 px-3 py-2.5 cursor-pointer hover:bg-gray-50/50 transition-colors"
                style={{
                  borderTop: i > 0 ? '1px solid var(--border)' : undefined,
                  borderLeft: `3px solid ${isGainer ? 'var(--green)' : 'var(--red)'}`,
                  background: isGainer ? 'rgba(0, 200, 150, 0.03)' : 'rgba(255, 75, 110, 0.03)',
                }}
              >
                <div className="w-[28px] h-[28px] rounded-md flex items-center justify-center flex-shrink-0 text-[10px] font-bold" style={{ background: 'var(--blue-light)', color: 'var(--blue)' }}>
                  {item.country}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold truncate" style={{ color: 'var(--navy)' }}>{item.name}</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-3)' }}>{item.ticker}</p>
                </div>
                <MiniSparkline name={item.name} positive={isGainer} />
                <div className="flex flex-col items-end flex-shrink-0">
                  <span className="text-[12px] font-bold" style={{ color: 'var(--navy)' }}>{item.price.toFixed(2)}</span>
                  <span className="text-[14px] font-bold px-1.5 py-0.5 rounded-md" style={{ color: isGainer ? 'var(--green)' : 'var(--red)', background: isGainer ? 'var(--green-bg)' : 'var(--red-bg)' }}>
                    {isGainer ? '+' : ''}{item.change.toFixed(2)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Market Tools */}
      <div className="px-5 pt-4 pb-2">
        <p className="font-head text-[11px] font-bold uppercase tracking-[1.2px]" style={{ color: 'var(--text-3)' }}>
          Market Tools
        </p>
      </div>
      <div className="px-4 space-y-2.5 pb-6">
        {MARKET_TOOLS.map((tool) => (
          <button
            key={tool.route}
            onClick={() => navigate(tool.route)}
            className="rounded-md flex items-center gap-3.5 p-4 w-full text-left transition-all hover:opacity-80"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <div
              className="w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--blue-light)' }}
            >
              <tool.icon size={16} style={{ color: 'var(--blue)' }} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-head text-sm font-bold" style={{ color: 'var(--navy)' }}>
                {tool.label}
              </h3>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-3)' }}>
                {tool.subtitle}
              </p>
            </div>
            <ChevronRight size={14} style={{ color: 'var(--text-3)' }} />
          </button>
        ))}
      </div>
    </div>
  );
}
