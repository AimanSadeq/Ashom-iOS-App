import { useState, useCallback } from 'react';
import { Users, Copy, Check, Shield, TrendingUp, ChevronDown, ChevronUp, BadgeCheck } from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';

/* ── Mock investor data ── */
const INVESTORS = [
  { id: 1, name: 'Abdullah Al-Saud', initials: 'AS', color: '#010131', bio: 'Saudi banking & energy specialist. 8 years experience.', return: 32.5, winRate: 71, copiers: 1247, risk: 'Medium', holdings: ['2222.SR', '1120.SR', '7010.SR'], ytdReturn: 32.5, featured: true,
    portfolio: [{ asset: '2222.SR', weight: 40, ret: 18.2 }, { asset: '1120.SR', weight: 35, ret: 42.6 }, { asset: '7010.SR', weight: 25, ret: 28.1 }] },
  { id: 2, name: 'Mariam Al-Falasi', initials: 'MF', color: '#5391D5', bio: 'UAE real estate & hospitality focus. CFA charterholder.', return: 28.1, winRate: 68, copiers: 892, risk: 'Medium', holdings: ['EMAAR.AE', 'DIB.AE', 'FAB.AE'], ytdReturn: 28.1, featured: true,
    portfolio: [{ asset: 'EMAAR.AE', weight: 45, ret: 31.4 }, { asset: 'DIB.AE', weight: 30, ret: 22.7 }, { asset: 'FAB.AE', weight: 25, ret: 26.0 }] },
  { id: 3, name: 'Hassan Al-Thani', initials: 'HT', color: '#7C5FDB', bio: 'Qatar gas & infrastructure. Former QIA analyst.', return: 24.7, winRate: 74, copiers: 634, risk: 'Low', holdings: ['QNBK.QA', 'ORDS.QA', 'IQCD.QA'], ytdReturn: 24.7, featured: true,
    portfolio: [{ asset: 'QNBK.QA', weight: 40, ret: 20.3 }, { asset: 'ORDS.QA', weight: 35, ret: 28.9 }, { asset: 'IQCD.QA', weight: 25, ret: 24.1 }] },
  { id: 4, name: 'Fatima Al-Balushi', initials: 'FB', color: '#00C896', bio: 'Oman & Bahrain small caps. High growth strategy.', return: 41.2, winRate: 62, copiers: 421, risk: 'High', holdings: ['BKMB.OM', 'AUB.BH', 'OTEL.OM'], ytdReturn: 41.2,
    portfolio: [{ asset: 'BKMB.OM', weight: 35, ret: 52.1 }, { asset: 'AUB.BH', weight: 40, ret: 34.8 }, { asset: 'OTEL.OM', weight: 25, ret: 38.6 }] },
  { id: 5, name: 'Omar Al-Sabah', initials: 'OS', color: '#F2A600', bio: 'Kuwait blue chips. Conservative dividend strategy.', return: 18.3, winRate: 79, copiers: 1563, risk: 'Low', holdings: ['NBK.KW', 'KFH.KW', 'ZAIN.KW'], ytdReturn: 18.3,
    portfolio: [{ asset: 'NBK.KW', weight: 40, ret: 15.2 }, { asset: 'KFH.KW', weight: 35, ret: 22.1 }, { asset: 'ZAIN.KW', weight: 25, ret: 16.8 }] },
  { id: 6, name: 'VIFM Quant Bot', initials: 'VQ', color: '#FF4B6E', bio: 'AI-driven GCC momentum strategy. Automated rebalancing.', return: 35.8, winRate: 66, copiers: 2104, risk: 'Medium', holdings: ['2222.SR', 'EMAAR.AE', 'QNBK.QA'], ytdReturn: 35.8,
    portfolio: [{ asset: '2222.SR', weight: 35, ret: 18.2 }, { asset: 'EMAAR.AE', weight: 35, ret: 31.4 }, { asset: 'QNBK.QA', weight: 30, ret: 20.3 }] },
  { id: 7, name: 'Nadia Al-Rashid', initials: 'NR', color: '#FF8A35', bio: 'GCC crypto & digital assets specialist.', return: 52.3, winRate: 58, copiers: 356, risk: 'High', holdings: ['BTC', 'ETH', 'SOL'], ytdReturn: 52.3,
    portfolio: [{ asset: 'BTC', weight: 50, ret: 48.2 }, { asset: 'ETH', weight: 30, ret: 61.5 }, { asset: 'SOL', weight: 20, ret: 55.8 }] },
  { id: 8, name: 'Khalid Bin Zayed', initials: 'KZ', color: '#00A8A0', bio: 'Sharia-compliant portfolio. AAOIFI screened holdings only.', return: 21.6, winRate: 73, copiers: 789, risk: 'Low', holdings: ['2222.SR', 'ACWA.SR', 'DEWA.AE'], ytdReturn: 21.6,
    portfolio: [{ asset: '2222.SR', weight: 35, ret: 18.2 }, { asset: 'ACWA.SR', weight: 35, ret: 26.4 }, { asset: 'DEWA.AE', weight: 30, ret: 19.8 }] },
];

const FILTERS = ['All', 'Top Returns', 'Low Risk', 'GCC Focus', 'Crypto'];

const RISK_COLORS = {
  Low:    { bg: 'var(--green-bg, #E6FAF5)', fg: 'var(--green, #00C896)' },
  Medium: { bg: 'var(--amber-bg, #FFF8E6)', fg: 'var(--amber, #F2A600)' },
  High:   { bg: 'var(--red-bg, #FFF0F3)',   fg: 'var(--red, #FF4B6E)' },
};

/* ── Helpers ── */
function investorGradient(color) {
  return `linear-gradient(135deg, ${color}, ${color}dd)`;
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
  const w = 60, h = 24;
  const stepX = w / (points.length - 1);
  const d = points.map((y, i) => `${i === 0 ? 'M' : 'L'}${(i * stepX).toFixed(1)},${y.toFixed(1)}`).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="flex-shrink-0">
      <path d={d} fill="none" stroke={positive ? 'var(--green, #00C896)' : 'var(--red, #FF4B6E)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function loadCopied() {
  try { return JSON.parse(localStorage.getItem('vifm-copy-trading') || '[]'); } catch { return []; }
}
function saveCopied(ids) { localStorage.setItem('vifm-copy-trading', JSON.stringify(ids)); }

function filterInvestors(list, filter) {
  if (filter === 'All') return list;
  if (filter === 'Top Returns') return [...list].sort((a, b) => b.return - a.return);
  if (filter === 'Low Risk') return list.filter(i => i.risk === 'Low');
  if (filter === 'GCC Focus') return list.filter(i => !['BTC', 'ETH', 'SOL'].includes(i.holdings[0]));
  if (filter === 'Crypto') return list.filter(i => ['BTC', 'ETH', 'SOL'].some(c => i.holdings.includes(c)));
  return list;
}

/* ── Featured card (horizontal scroll) ── */
function FeaturedCard({ inv, isCopied, onToggle }) {
  const rc = RISK_COLORS[inv.risk];
  return (
    <div className="flex-shrink-0 w-[260px] rounded-lg p-4 relative overflow-hidden" style={{
      background: investorGradient(inv.color),
      border: `1px solid ${inv.color}30`,
    }}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-11 h-11 rounded-full flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0"
          style={{ background: inv.color }}>
          {inv.initials}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-[13px] font-bold truncate" style={{ color: '#fff' }}>{inv.name}</p>
            <BadgeCheck size={13} style={{ color: 'rgba(255,255,255,0.7)' }} className="flex-shrink-0" />
          </div>
          <span className="text-[9px] font-bold uppercase tracking-[0.5px] px-[6px] py-[2px] rounded-full"
            style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>{inv.risk} Risk</span>
        </div>
      </div>
      <div className="flex items-center gap-2 mb-0.5">
        <p className="text-[24px] font-bold" style={{ color: '#fff' }}>
          +{inv.ytdReturn}%
        </p>
      </div>
      <p className="text-[10px] mb-3" style={{ color: 'rgba(255,255,255,0.7)' }}>YTD Return &middot; {inv.copiers.toLocaleString()} copiers</p>
      <button
        onClick={(e) => { e.stopPropagation(); onToggle(inv.id); }}
        className="w-full py-2 rounded-md text-[12px] font-bold transition-all duration-150 active:scale-95"
        style={isCopied
          ? { background: 'rgba(255,255,255,0.25)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }
          : { background: 'rgba(255,255,255,0.95)', color: inv.color, border: 'none' }
        }
      >
        {isCopied ? <><Check size={13} className="inline -mt-0.5 mr-1" />Copying</> : <><Copy size={13} className="inline -mt-0.5 mr-1" />Copy</>}
      </button>
    </div>
  );
}

/* ── Investor list card ── */
function InvestorCard({ inv, isCopied, isExpanded, onToggle, onExpand }) {
  const rc = RISK_COLORS[inv.risk];
  return (
    <div
      className="bg-white rounded-lg overflow-hidden transition-all duration-200 animate-fade-up"
      style={{ border: '1px solid var(--border)' }}
    >
      {/* Main row */}
      <div className="p-4 cursor-pointer" onClick={() => onExpand(inv.id)}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0"
            style={{ background: inv.color }}>
            {inv.initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <p className="text-[14px] font-bold truncate" style={{ color: 'var(--navy)' }}>{inv.name}</p>
              <BadgeCheck size={13} style={{ color: '#5391D5' }} className="flex-shrink-0" />
            </div>
            <p className="text-[11px] leading-snug" style={{ color: 'var(--text-3)' }}>{inv.bio}</p>
          </div>
          <div className="flex-shrink-0 ml-1">
            {isExpanded ? <ChevronUp size={16} style={{ color: 'var(--text-3)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text-3)' }} />}
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <TrendingUp size={12} style={{ color: inv.return >= 0 ? '#00C896' : '#FF4B6E' }} />
            <span className="text-[12px] font-bold" style={{ color: inv.return >= 0 ? '#00C896' : '#FF4B6E' }}>
              {inv.return >= 0 ? '+' : ''}{inv.return}%
            </span>
            <MiniSparkline name={inv.name} positive={inv.return >= 0} />
          </div>
          <span className="text-[11px]" style={{ color: 'var(--text-3)' }}>Win {inv.winRate}%</span>
          <span className="text-[11px]" style={{ color: 'var(--text-3)' }}>
            <Users size={11} className="inline -mt-0.5 mr-0.5" />{inv.copiers.toLocaleString()}
          </span>
          <span className="text-[9px] font-bold uppercase tracking-[0.3px] px-[6px] py-[2px] rounded-full"
            style={{ background: rc.bg, color: rc.fg }}>{inv.risk}</span>
        </div>

        {/* Top holdings pills */}
        <div className="flex gap-1.5 mt-2.5 flex-wrap">
          {inv.holdings.map(h => (
            <span key={h} className="text-[10px] font-semibold px-2 py-[3px] rounded-full"
              style={{ background: 'var(--bg)', color: 'var(--text-2)', border: '1px solid var(--border)' }}>
              {h}
            </span>
          ))}
        </div>
      </div>

      {/* Copy button row */}
      <div className="px-4 pb-3">
        <button
          onClick={(e) => { e.stopPropagation(); onToggle(inv.id); }}
          className="w-full py-2 rounded-md text-[12px] font-bold transition-all duration-150 active:scale-95"
          style={isCopied
            ? { background: '#E6FAF5', color: '#00C896', border: '1px solid #00C89640' }
            : { background: 'var(--navy)', color: '#fff', border: 'none' }
          }
        >
          {isCopied ? <><Check size={13} className="inline -mt-0.5 mr-1" />Copying</> : <><Copy size={13} className="inline -mt-0.5 mr-1" />Copy</>}
        </button>
      </div>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-1" style={{ borderTop: '1px solid var(--border)' }}>
          <p className="text-[11px] font-bold uppercase tracking-[0.5px] mb-2" style={{ color: 'var(--text-3)' }}>Portfolio Breakdown</p>
          <table className="w-full text-[12px]">
            <thead>
              <tr style={{ color: 'var(--text-3)' }}>
                <th className="text-left font-semibold pb-1.5">Asset</th>
                <th className="text-right font-semibold pb-1.5">Weight</th>
                <th className="text-right font-semibold pb-1.5">Return</th>
              </tr>
            </thead>
            <tbody>
              {(inv.portfolio || []).map(p => (
                <tr key={p.asset} style={{ borderTop: '1px solid var(--bg)' }}>
                  <td className="py-1.5 font-semibold" style={{ color: 'var(--navy)' }}>{p.asset}</td>
                  <td className="py-1.5 text-right" style={{ color: 'var(--text-2)' }}>{p.weight}%</td>
                  <td className="py-1.5 text-right font-semibold" style={{ color: p.ret >= 0 ? '#00C896' : '#FF4B6E' }}>
                    {p.ret >= 0 ? '+' : ''}{p.ret}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-3 rounded-md p-3 text-center" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
            <p className="text-[11px] font-semibold" style={{ color: 'var(--text-3)' }}>Performance chart coming soon</p>
          </div>

          {isCopied && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggle(inv.id); }}
              className="w-full mt-3 py-2 rounded-md text-[12px] font-bold transition-all duration-150 active:scale-95"
              style={{ background: 'transparent', color: '#FF4B6E', border: '1px solid #FF4B6E40' }}
            >
              Stop Copying
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Main page ── */
export default function CopyTradingPage() {
  const [copiedIds, setCopiedIds] = useState(loadCopied);
  const [filter, setFilter] = useState('All');
  const [expandedId, setExpandedId] = useState(null);

  const toggleCopy = useCallback((id) => {
    setCopiedIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      saveCopied(next);
      return next;
    });
  }, []);

  const toggleExpand = useCallback((id) => {
    setExpandedId(prev => prev === id ? null : id);
  }, []);

  const featured = INVESTORS.filter(i => i.featured);
  const filtered = filterInvestors(INVESTORS, filter);

  return (
    <div className="animate-fade-in pb-8">
      <PageHeader title="Copy Trading" subtitle="Mirror Top Investors" backTo="/" />

      {/* ── Top Performers Banner ── */}
      <div className="px-5 pt-5 pb-2">
        <div className="flex items-center gap-2 mb-3">
          <Shield size={14} style={{ color: 'var(--blue)' }} />
          <p className="text-[11px] font-bold uppercase tracking-[0.8px]" style={{ color: 'var(--text-3)' }}>Top Performers</p>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5" style={{ scrollbarWidth: 'none' }}>
          {featured.map(inv => (
            <FeaturedCard key={inv.id} inv={inv} isCopied={copiedIds.includes(inv.id)} onToggle={toggleCopy} />
          ))}
        </div>
      </div>

      {/* ── Filter chips ── */}
      <div className="px-5 pt-3 pb-1">
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-semibold transition-all duration-150 active:scale-95"
              style={f === filter
                ? { background: 'var(--navy)', color: '#fff' }
                : { background: 'var(--bg)', color: 'var(--text-2)', border: '1px solid var(--border)' }
              }
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── Investor list ── */}
      <div className="px-5 pt-3 space-y-3">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.8px]" style={{ color: 'var(--text-3)' }}>
            {filtered.length} Investor{filtered.length !== 1 ? 's' : ''}
          </p>
          <p className="text-[10px]" style={{ color: 'var(--text-3)' }}>Sorted by return</p>
        </div>

        {filtered.map(inv => (
          <InvestorCard
            key={inv.id}
            inv={inv}
            isCopied={copiedIds.includes(inv.id)}
            isExpanded={expandedId === inv.id}
            onToggle={toggleCopy}
            onExpand={toggleExpand}
          />
        ))}
      </div>
    </div>
  );
}
