import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Crown, TrendingUp, DollarSign, Shield, Zap, ChevronRight, Building2, Star,
  BarChart2, ArrowLeft
} from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';
import LoadingState from '../components/shared/LoadingState';
import ErrorState from '../components/shared/ErrorState';
import useApi from '../hooks/useApi';
import { companies } from '../services/api';
import useWatchlist from '../hooks/useWatchlist';

const CURATED_LISTS = [
  {
    id: 'largest',
    title: 'Largest by Market Cap',
    subtitle: 'GCC blue chips',
    icon: Crown,
    ic: { bg: 'var(--ic-amber-bg)', fg: 'var(--ic-amber-fg)' },
    sortFn: (a, b) => (b.market_cap || 0) - (a.market_cap || 0),
    limit: 15,
  },
  {
    id: 'dividend',
    title: 'Top Dividend Payers',
    subtitle: 'Highest yield companies',
    icon: DollarSign,
    ic: { bg: 'var(--ic-green-bg)', fg: 'var(--ic-green-fg)' },
    metricKey: 'dividend_yield',
    metricLabel: 'Div Yield',
    metricSuffix: '%',
    sortDesc: true,
    limit: 10,
  },
  {
    id: 'undervalued',
    title: 'Most Undervalued',
    subtitle: 'Lowest P/E ratios',
    icon: TrendingUp,
    ic: { bg: 'var(--ic-purple-bg)', fg: 'var(--ic-purple-fg)' },
    metricKey: 'pe_ratio',
    metricLabel: 'P/E',
    metricSuffix: 'x',
    sortDesc: false,
    limit: 10,
  },
  {
    id: 'profitable',
    title: 'Most Profitable',
    subtitle: 'Highest ROE companies',
    icon: Zap,
    ic: { bg: 'var(--ic-red-bg)', fg: 'var(--ic-red-fg)' },
    metricKey: 'roe',
    metricLabel: 'ROE',
    metricSuffix: '%',
    sortDesc: true,
    limit: 10,
  },
  {
    id: 'safe',
    title: 'Lowest Risk',
    subtitle: 'Best debt-to-equity ratios',
    icon: Shield,
    ic: { bg: 'var(--ic-blue-bg)', fg: 'var(--ic-blue-fg)' },
    metricKey: 'debt_to_equity',
    metricLabel: 'D/E',
    metricSuffix: 'x',
    sortDesc: false,
    limit: 10,
  },
];

function formatNum(n) {
  if (n == null || isNaN(n)) return '--';
  if (n >= 1e12) return '$' + (n / 1e12).toFixed(1) + 'T';
  if (n >= 1e9) return '$' + (n / 1e9).toFixed(0) + 'B';
  if (n >= 1e6) return '$' + (n / 1e6).toFixed(0) + 'M';
  return n.toFixed(2);
}

export default function CuratedListsPage() {
  const navigate = useNavigate();
  const { isWatched, toggleWatchlist } = useWatchlist();
  const [selectedList, setSelectedList] = useState(null);
  const [listData, setListData] = useState([]);
  const [listLoading, setListLoading] = useState(false);

  const { data, loading, error, refetch } = useApi(() => companies.list(), []);

  const companyList = useMemo(() => {
    if (!data) return [];
    return Array.isArray(data) ? data : data.companies || data.data || [];
  }, [data]);

  async function handleSelectList(list) {
    setSelectedList(list);
    setListLoading(true);

    if (list.sortFn) {
      // Simple sort by company-level data (market cap)
      const sorted = [...companyList].sort(list.sortFn).slice(0, list.limit);
      setListData(sorted.map(c => ({ ...c, metricValue: c.market_cap, metricLabel: 'Market Cap' })));
      setListLoading(false);
    } else if (list.metricKey) {
      // Need to fetch financial metrics for each company
      const results = [];
      const subset = [...companyList].sort((a, b) => (b.market_cap || 0) - (a.market_cap || 0)).slice(0, 40);
      for (const c of subset) {
        try {
          const res = await companies.get(c.id);
          const metrics = res.financial_metrics || res.financials || [];
          const m = Array.isArray(metrics) ? metrics[0] : metrics;
          if (m && m[list.metricKey] != null && !isNaN(m[list.metricKey]) && m[list.metricKey] > 0) {
            results.push({ ...c, metricValue: m[list.metricKey] });
          }
        } catch { /* skip */ }
        if (results.length >= 25) break; // enough to sort from
      }
      results.sort((a, b) => list.sortDesc ? b.metricValue - a.metricValue : a.metricValue - b.metricValue);
      setListData(results.slice(0, list.limit));
      setListLoading(false);
    }
  }

  if (loading) return (
    <div className="animate-fade-in" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <PageHeader title="Curated Lists" backTo="/" subtitle="Smart Picks" />
      <LoadingState message="Loading companies..." />
    </div>
  );

  if (error) return (
    <div className="animate-fade-in" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <PageHeader title="Curated Lists" backTo="/" subtitle="Smart Picks" />
      <ErrorState message={error} onRetry={refetch} />
    </div>
  );

  // List detail view
  if (selectedList) {
    const Icon = selectedList.icon;
    return (
      <div className="animate-fade-in" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
        <PageHeader title={selectedList.title} subtitle={selectedList.subtitle} backTo="/curated" />

        <div className="px-4 py-4 space-y-4">
          {/* Hero */}
          <div className="rounded-md p-4 text-white" style={{ background: 'var(--navy)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.12)' }}>
                <Icon size={20} />
              </div>
              <div>
                <p className="font-head text-sm font-bold">{selectedList.title}</p>
                <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.5)' }}>{selectedList.subtitle} across GCC markets</p>
              </div>
            </div>
          </div>

          {listLoading ? (
            <LoadingState message="Analyzing companies..." />
          ) : (
            <div className="space-y-2">
              {listData.map((c, i) => (
                <div
                  key={c.id}
                  className="rounded-md p-3 transition-all hover:-translate-y-0.5"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold w-5 text-center" style={{ color: 'var(--text-3)' }}>#{i + 1}</span>
                    <div
                      className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
                      style={{ background: 'var(--ic-blue-bg)', color: 'var(--ic-blue-fg)' }}
                    >
                      <Building2 size={14} />
                    </div>
                    <button className="flex-1 min-w-0 text-left" onClick={() => navigate(`/companies/${c.id}`)}>
                      <p className="font-head text-[12px] font-bold truncate" style={{ color: 'var(--navy)' }}>{c.name}</p>
                      <p className="text-[10px]" style={{ color: 'var(--text-3)' }}>{c.symbol} &middot; {c.country}</p>
                    </button>
                    <div className="text-right flex-shrink-0">
                      <p className="font-head text-[12px] font-bold tabular-nums" style={{ color: 'var(--navy)' }}>
                        {selectedList.metricKey
                          ? c.metricValue?.toFixed(2) + (selectedList.metricSuffix || '')
                          : formatNum(c.metricValue)
                        }
                      </p>
                      <p className="text-[10px]" style={{ color: 'var(--text-3)' }}>{selectedList.metricLabel || selectedList.metricKey}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleWatchlist(c); }}
                      className="p-1 rounded-md hover:opacity-80 transition-colors"
                    >
                      <Star
                        size={13}
                        fill={isWatched(c.id) ? 'var(--ic-amber-fg)' : 'none'}
                        style={{ color: isWatched(c.id) ? 'var(--ic-amber-fg)' : 'var(--text-3)' }}
                      />
                    </button>
                  </div>
                </div>
              ))}
              {listData.length === 0 && !listLoading && (
                <p className="text-[10px] text-center py-8" style={{ color: 'var(--text-3)' }}>No data available for this list.</p>
              )}
            </div>
          )}

          <p className="text-[10px] italic text-center" style={{ color: 'var(--text-3)' }}>
            Lists are informational only and do not constitute investment advice.
          </p>
        </div>
      </div>
    );
  }

  // Lists menu
  return (
    <div className="animate-fade-in" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <PageHeader title="Curated Lists" backTo="/" subtitle="Smart Picks" />

      <div className="px-4 py-4 space-y-4">
        <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-2)' }}>
          Discover top GCC companies ranked by key financial metrics. Tap a list to explore.
        </p>

        <div className="space-y-2.5">
          {CURATED_LISTS.map(list => {
            const Icon = list.icon;
            return (
              <button
                key={list.id}
                onClick={() => handleSelectList(list)}
                className="rounded-md w-full text-left p-3.5 flex items-center gap-3.5 transition-all hover:-translate-y-0.5"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              >
                <div
                  className="w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0"
                  style={{ background: list.ic.bg, color: list.ic.fg }}
                >
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-head text-sm font-bold" style={{ color: 'var(--navy)' }}>{list.title}</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-3)' }}>{list.subtitle}</p>
                </div>
                <ChevronRight size={14} style={{ color: 'var(--text-3)' }} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
