import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, ArrowUpDown, TrendingUp, TrendingDown, Pin } from 'lucide-react';

import PageHeader from '../components/shared/PageHeader';
import LoadingState from '../components/shared/LoadingState';
import ErrorState from '../components/shared/ErrorState';
import useApi from '../hooks/useApi';
import { companies } from '../services/api';
import usePin from '../hooks/usePin';

function MiniSparkline({ name, positive }) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;

  const points = Array.from({ length: 12 }, (_, i) => {
    const seed = Math.abs(hash * (i + 1) * 9301 + 49297) % 233280;
    const rand = seed / 233280;
    const base = positive ? 20 - (i * 0.8) : 10 + (i * 0.5);
    return Math.max(2, Math.min(22, base + (rand - 0.5) * 10));
  });

  const w = 48, h = 24;
  const stepX = w / (points.length - 1);
  const d = points.map((y, i) => `${i === 0 ? 'M' : 'L'}${(i * stepX).toFixed(1)},${y.toFixed(1)}`).join(' ');

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="flex-shrink-0">
      <path d={d} fill="none" stroke={positive ? '#00C896' : '#FF4B6E'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const COUNTRIES = [
  { id: 'all', label: 'All' },
  { id: 'saudi', label: 'Saudi Arabia', flag: 'SA' },
  { id: 'uae', label: 'UAE', flag: 'AE' },
  { id: 'kuwait', label: 'Kuwait', flag: 'KW' },
  { id: 'qatar', label: 'Qatar', flag: 'QA' },
  { id: 'bahrain', label: 'Bahrain', flag: 'BH' },
  { id: 'oman', label: 'Oman', flag: 'OM' },
];

const SORT_OPTIONS = [
  { key: 'name', label: 'Name' },
  { key: 'price', label: 'Price' },
  { key: 'change', label: 'Change' },
  { key: 'marketCap', label: 'Market Cap' },
  { key: 'pe', label: 'P/E' },
  { key: 'roe', label: 'ROE' },
];

export default function ScreenerPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [showSort, setShowSort] = useState(false);
  const { isPinned, addPin, removePin, createPin } = usePin();

  const fetchCompanies = useCallback(
    () => {
      const params = {};
      if (country !== 'all') params.country = country;
      if (search.trim()) params.search = search.trim();
      return companies.list(params);
    },
    [country, search]
  );

  const { data, loading, error, refetch } = useApi(fetchCompanies, [country, search]);

  const results = Array.isArray(data) ? data : data?.companies || data?.data || [];

  const sorted = [...results].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    const av = a[sortBy] ?? a[sortBy + 'Ratio'] ?? 0;
    const bv = b[sortBy] ?? b[sortBy + 'Ratio'] ?? 0;
    if (typeof av === 'string') return dir * av.localeCompare(bv);
    return dir * (av - bv);
  });

  function toggleSort(key) {
    if (sortBy === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setSortDir('asc');
    }
    setShowSort(false);
  }

  function formatNum(n) {
    if (n == null) return '--';
    if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    return Number(n).toLocaleString();
  }

  return (
    <div className="animate-fade-in" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <PageHeader title="Company Screener" subtitle="Filter 820+ GCC companies" backTo="/" />

      {/* Search */}
      <div className="px-4 pt-4 pb-2">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-3)' }} />
          <input
            type="text"
            placeholder="Search company or ticker..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs font-body rounded-md transition-colors outline-none"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              color: 'var(--text-1)',
            }}
            onFocus={e => { e.target.style.borderColor = 'var(--blue)'; e.target.style.boxShadow = '0 0 0 3px var(--blue-light)'; }}
            onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
          />
        </div>
      </div>

      {/* Country filter chips */}
      <div className="px-4 pb-3 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {COUNTRIES.map(c => (
            <button
              key={c.id}
              onClick={() => setCountry(c.id)}
              className="px-3 py-1.5 rounded-md text-[10px] font-semibold font-body whitespace-nowrap transition-colors"
              style={{
                background: country === c.id ? 'var(--navy)' : 'var(--card)',
                color: country === c.id ? '#fff' : 'var(--text-2)',
                border: `1px solid ${country === c.id ? 'var(--navy)' : 'var(--border)'}`,
              }}
            >
              {c.flag && <span className="mr-1">{c.flag}</span>}
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sort control */}
      <div className="px-4 pb-2 flex items-center justify-between">
        <p className="text-[10px] font-body" style={{ color: 'var(--text-3)' }}>{sorted.length} companies</p>
        <div className="relative">
          <button
            onClick={() => setShowSort(!showSort)}
            className="flex items-center gap-1 text-[10px] font-semibold font-body hover:opacity-80 transition-opacity"
            style={{ color: 'var(--blue)' }}
          >
            <ArrowUpDown size={12} />
            Sort: {SORT_OPTIONS.find(s => s.key === sortBy)?.label}
          </button>
          {showSort && (
            <div
              className="absolute right-0 top-6 z-20 rounded-md py-1 min-w-[120px]"
              style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
            >
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.key}
                  onClick={() => toggleSort(opt.key)}
                  className="w-full text-left px-3 py-1.5 text-[10px] font-body transition-colors"
                  style={{
                    color: sortBy === opt.key ? 'var(--navy)' : 'var(--text-2)',
                    fontWeight: sortBy === opt.key ? 700 : 400,
                    background: 'transparent',
                  }}
                  onMouseEnter={e => { e.target.style.background = 'var(--bg)'; }}
                  onMouseLeave={e => { e.target.style.background = 'transparent'; }}
                >
                  {opt.label} {sortBy === opt.key && (sortDir === 'asc' ? '\u2191' : '\u2193')}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="px-4 pb-4">
        {loading && <LoadingState message="Screening companies..." />}
        {error && <ErrorState message={error} onRetry={refetch} />}
        {!loading && !error && sorted.length === 0 && (
          <div className="text-center py-12">
            <SlidersHorizontal size={24} className="mx-auto mb-2" style={{ color: 'var(--text-3)' }} />
            <p className="text-xs font-body" style={{ color: 'var(--text-3)' }}>No companies match your filters</p>
          </div>
        )}
        {!loading && !error && sorted.length > 0 && (
          <div className="space-y-2">
            {sorted.map(c => {
              const pinIdVal = 'company-' + c.id;
              const pinned = isPinned(pinIdVal);
              return (
              <div
                key={c.id}
                className="w-full text-left p-3 relative rounded-md transition-all duration-150"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              >
                {/* Pin button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (pinned) removePin(pinIdVal);
                    else addPin(createPin('company', { companyId: c.id, name: c.name, ticker: c.symbol || c.ticker, sector: c.sector }));
                  }}
                  className="absolute top-2 right-2 p-1 rounded-md transition-colors active:scale-90 z-10"
                  style={{ background: 'transparent' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  aria-label={pinned ? 'Unpin' : 'Pin to My Screen'}
                >
                  <Pin size={11} style={{ color: pinned ? 'var(--green)' : 'var(--text-3)' }} />
                </button>

                <button onClick={() => navigate(`/companies/${c.id}`)} className="w-full text-left">
                  <div className="flex items-start justify-between gap-2 pr-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span
                          className="px-1.5 py-0.5 rounded text-[10px] font-semibold font-body"
                          style={{ background: 'var(--blue-light)', color: 'var(--navy)' }}
                        >
                          {(c.country || '').slice(0, 2).toUpperCase()}
                        </span>
                        <span className="text-xs font-bold font-body truncate" style={{ color: 'var(--navy)' }}>{c.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-body" style={{ color: 'var(--text-2)' }}>
                        <span className="font-mono">{c.ticker || c.symbol || '--'}</span>
                        <span className="w-px h-3" style={{ background: 'var(--border)' }} />
                        <span className="truncate">{c.industry || c.sector || '--'}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold font-body" style={{ color: 'var(--navy)' }}>
                        {c.price != null ? c.price.toFixed(2) : '--'}
                      </p>
                      <div className="flex items-center justify-end gap-0.5 text-[10px] font-semibold font-body" style={{ color: (c.change ?? 0) >= 0 ? 'var(--green)' : 'var(--red)' }}>
                        {(c.change ?? 0) >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                        {c.change != null ? `${c.change >= 0 ? '+' : ''}${c.change.toFixed(2)}%` : '--'}
                      </div>
                      <div className="flex justify-end mt-1">
                        <MiniSparkline name={c.name || ''} positive={(c.change ?? 0) >= 0} />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-2 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                    <span className="text-[10px] font-body" style={{ color: 'var(--text-3)' }}>
                      MCap <span className="font-semibold" style={{ color: 'var(--text-2)' }}>{formatNum(c.market_cap || c.marketCap)}</span>
                    </span>
                    <span className="text-[10px] font-body" style={{ color: 'var(--text-3)' }}>{c.sector}</span>
                  </div>
                </button>
              </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
