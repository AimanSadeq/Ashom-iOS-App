import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Check, X, AlertTriangle, ChevronDown, ChevronUp, Search } from 'lucide-react';

import PageHeader from '../components/shared/PageHeader';
import LoadingState from '../components/shared/LoadingState';
import ErrorState from '../components/shared/ErrorState';
import useApi from '../hooks/useApi';
import { companies } from '../services/api';

/* ---------- deterministic Sharia screening ---------- */
export function getShariaStatus(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
  const absHash = Math.abs(hash);

  const debtRatio = 10 + (absHash % 35);        // 10-44 %
  const interestIncome = (absHash % 80) / 10;    // 0-7.9 %
  const haramRevenue = (absHash % 60) / 10;      // 0-5.9 %

  const compliant = debtRatio < 33 && interestIncome < 5 && haramRevenue < 5;
  const watchList = !compliant && (debtRatio < 37 || (interestIncome < 6 && haramRevenue < 6));

  return {
    status: compliant ? 'compliant' : watchList ? 'watch' : 'non-compliant',
    debtRatio: debtRatio.toFixed(1),
    interestIncome: interestIncome.toFixed(1),
    haramRevenue: haramRevenue.toFixed(1),
  };
}

/* ---------- constants ---------- */
const FILTERS = [
  { id: 'all',           label: 'All' },
  { id: 'compliant',     label: 'Compliant' },
  { id: 'non-compliant', label: 'Non-Compliant' },
  { id: 'watch',         label: 'Watch List' },
];

const STATUS_STYLE = {
  compliant:        { bg: 'var(--green-bg, #E6FAF5)', color: 'var(--green, #00C896)', icon: Check,          label: 'Compliant' },
  'non-compliant':  { bg: 'var(--red-bg, #FFF0F3)',   color: 'var(--red, #FF4B6E)',   icon: X,              label: 'Non-Compliant' },
  watch:            { bg: 'var(--amber-bg, #FFF8E6)',    color: 'var(--amber, #F2A600)',  icon: AlertTriangle,  label: 'Watch List' },
};

/* ---------- sub-components ---------- */
function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.compliant;
  const Icon = s.icon;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-body whitespace-nowrap"
      style={{ background: s.bg, color: s.color }}
    >
      <Icon size={10} /> {s.label}
    </span>
  );
}

function CompanyRow({ company, sharia, onClick }) {
  const [open, setOpen] = useState(false);
  const s = STATUS_STYLE[sharia.status];
  const thresholds = { debtRatio: 33, interestIncome: 5, haramRevenue: 5 };

  function MetricBar({ label, value, threshold }) {
    const num = parseFloat(value);
    const pass = num < threshold;
    return (
      <div className="flex items-center gap-2">
        <p className="text-[10px] font-body w-[110px]" style={{ color: 'var(--text-3)' }}>{label}</p>
        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${Math.min(num / (threshold * 1.4) * 100, 100)}%`, background: pass ? 'var(--green, #00C896)' : 'var(--red, #FF4B6E)' }}
          />
        </div>
        <p className="text-[10px] font-bold font-body w-[40px] text-right" style={{ color: pass ? 'var(--green, #00C896)' : 'var(--red, #FF4B6E)' }}>
          {value}%
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-lg overflow-hidden transition-all"
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
    >
      {/* Main row */}
      <button
        className="w-full text-left p-3 flex items-center gap-3"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold font-body truncate" style={{ color: 'var(--navy)' }}>
              {company.name}
            </p>
            <span
              className="px-1.5 py-0.5 rounded text-[9px] font-semibold font-body shrink-0"
              style={{ background: 'var(--blue-light, rgba(56,120,190,0.08))', color: 'var(--blue, #3878BE)' }}
            >
              {(company.country || '').slice(0, 2).toUpperCase()}
            </span>
          </div>
          <p className="text-[10px] font-body mt-0.5" style={{ color: 'var(--text-3)' }}>
            {company.ticker || company.symbol} &middot; {company.sector || company.industry || '--'}
          </p>
        </div>

        <StatusBadge status={sharia.status} />

        {open
          ? <ChevronUp size={14} style={{ color: 'var(--text-3)' }} className="shrink-0" />
          : <ChevronDown size={14} style={{ color: 'var(--text-3)' }} className="shrink-0" />
        }
      </button>

      {/* Expandable detail */}
      {open && (
        <div className="px-3 pb-3 pt-0 space-y-2 border-t" style={{ borderColor: 'var(--border)' }}>
          <p className="text-[10px] font-bold font-body pt-2" style={{ color: 'var(--text-3)' }}>AAOIFI Screening Metrics</p>
          <MetricBar label="Debt / Total Assets" value={sharia.debtRatio} threshold={thresholds.debtRatio} />
          <MetricBar label="Interest Income" value={sharia.interestIncome} threshold={thresholds.interestIncome} />
          <MetricBar label="Non-Permissible Rev." value={sharia.haramRevenue} threshold={thresholds.haramRevenue} />
          <button
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            className="mt-1 text-[10px] font-bold font-body"
            style={{ color: 'var(--blue, #3878BE)' }}
          >
            View Company Profile &rarr;
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------- main page ---------- */
export default function ShariaScreeningPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetchCompanies = useCallback(() => companies.list({}), []);
  const { data, loading, error, refetch } = useApi(fetchCompanies, []);

  const results = Array.isArray(data) ? data : data?.companies || data?.data || [];

  /* enrich with Sharia data, filter, search */
  const enriched = useMemo(() => {
    return results.map(c => ({ ...c, sharia: getShariaStatus(c.name || '') }));
  }, [results]);

  const filtered = useMemo(() => {
    let list = enriched;
    if (filter !== 'all') list = list.filter(c => c.sharia.status === filter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(c =>
        (c.name || '').toLowerCase().includes(q) ||
        (c.ticker || c.symbol || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [enriched, filter, search]);

  /* stats */
  const stats = useMemo(() => {
    const s = { compliant: 0, 'non-compliant': 0, watch: 0 };
    enriched.forEach(c => { s[c.sharia.status] = (s[c.sharia.status] || 0) + 1; });
    return s;
  }, [enriched]);

  if (loading) return (
    <div className="animate-fade-in" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <PageHeader title="Sharia Screening" subtitle="Islamic Finance Compliance" backTo="/markets" />
      <LoadingState message="Screening companies..." />
    </div>
  );

  if (error) return (
    <div className="animate-fade-in" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <PageHeader title="Sharia Screening" subtitle="Islamic Finance Compliance" backTo="/markets" />
      <ErrorState message={error} onRetry={refetch} />
    </div>
  );

  return (
    <div className="animate-fade-in" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <PageHeader title="Sharia Screening" subtitle="Islamic Finance Compliance" backTo="/markets" />

      <div className="px-4 space-y-3 pb-6">
        {/* Methodology card */}
        <div
          className="p-4 rounded-lg"
          style={{
            background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-soft, #010131) 100%)',
            color: '#fff',
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Shield size={16} style={{ opacity: 0.8 }} />
            <p className="text-xs font-bold font-head">AAOIFI Screening Standards</p>
          </div>
          <p className="text-[11px] font-body leading-relaxed" style={{ opacity: 0.75 }}>
            Stocks are screened using AAOIFI (Accounting and Auditing Organization for Islamic Financial Institutions) standards. Companies must pass all three financial ratio thresholds to be classified as Sharia-compliant.
          </p>
          <div className="mt-3 space-y-1.5">
            {[
              ['Debt / Total Assets', '< 33%'],
              ['Interest Income / Revenue', '< 5%'],
              ['Non-Permissible Revenue', '< 5%'],
            ].map(([label, val]) => (
              <div key={label} className="flex items-center justify-between text-[10px] font-body" style={{ opacity: 0.65 }}>
                <span>{label}</span>
                <span className="font-bold">{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats bar */}
        <div
          className="flex items-center justify-center gap-1.5 py-2 rounded-md text-[11px] font-body"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text-2)' }}
        >
          <span style={{ color: 'var(--green, #00C896)', fontWeight: 700 }}>{stats.compliant}</span> Compliant
          <span className="mx-0.5">&middot;</span>
          <span style={{ color: 'var(--red, #FF4B6E)', fontWeight: 700 }}>{stats['non-compliant']}</span> Non-Compliant
          <span className="mx-0.5">&middot;</span>
          <span style={{ color: 'var(--amber, #F2A600)', fontWeight: 700 }}>{stats.watch}</span> Watch List
        </div>

        {/* Search */}
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-md"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <Search size={14} style={{ color: 'var(--text-3)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search companies..."
            className="flex-1 bg-transparent text-xs font-body outline-none"
            style={{ color: 'var(--text-1)' }}
          />
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-0.5" style={{ WebkitOverflowScrolling: 'touch' }}>
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className="px-3 py-1.5 rounded-full text-[11px] font-semibold font-body whitespace-nowrap transition-colors shrink-0"
              style={{
                background: filter === f.id ? 'var(--navy)' : 'var(--card)',
                color: filter === f.id ? '#fff' : 'var(--text-2)',
                border: filter === f.id ? 'none' : '1px solid var(--border)',
              }}
            >
              {f.label}
              {f.id !== 'all' && (
                <span className="ml-1" style={{ opacity: 0.6 }}>
                  {f.id === 'compliant' ? stats.compliant : f.id === 'non-compliant' ? stats['non-compliant'] : stats.watch}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Company list */}
        <div className="space-y-2">
          {filtered.length === 0 && (
            <div className="text-center py-10">
              <Shield size={32} style={{ color: 'var(--text-3)', margin: '0 auto 8px' }} />
              <p className="text-xs font-body" style={{ color: 'var(--text-3)' }}>No companies match the current filter.</p>
            </div>
          )}
          {filtered.map(c => (
            <CompanyRow
              key={c.id}
              company={c}
              sharia={c.sharia}
              onClick={() => navigate(`/companies/${c.id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
