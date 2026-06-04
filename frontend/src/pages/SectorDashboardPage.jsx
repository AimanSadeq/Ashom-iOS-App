import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, TrendingUp, TrendingDown, ChevronRight, BarChart3,
  Zap, Landmark, Wifi, ShoppingCart, Home as HomeIcon, Heart,
  Factory, Cpu, ShoppingBag, Wheat, HardHat
} from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';
import LoadingState from '../components/shared/LoadingState';
import ErrorState from '../components/shared/ErrorState';
import useApi from '../hooks/useApi';
import { companies } from '../services/api';

const SECTOR_ICONS = {
  'Energy': Zap,
  'Financials': Landmark,
  'Communication Services': Wifi,
  'Materials': Factory,
  'Utilities': Building2,
  'Real Estate': HomeIcon,
  'Consumer Staples': Wheat,
  'Information Technology': Cpu,
  'Industrials': HardHat,
  'Consumer Discretionary': ShoppingBag,
  'Healthcare': Heart,
};

const SECTOR_IC = {
  'Energy':                   { bg: 'var(--ic-red-bg)',    fg: 'var(--ic-red-fg)' },
  'Financials':               { bg: 'var(--ic-navy-bg)',   fg: 'var(--ic-navy-fg)' },
  'Communication Services':   { bg: 'var(--ic-purple-bg)', fg: 'var(--ic-purple-fg)' },
  'Materials':                { bg: 'var(--ic-orange-bg)', fg: 'var(--ic-orange-fg)' },
  'Utilities':                { bg: 'var(--ic-blue-bg)',   fg: 'var(--ic-blue-fg)' },
  'Real Estate':              { bg: 'var(--ic-green-bg)',  fg: 'var(--ic-green-fg)' },
  'Consumer Staples':         { bg: 'var(--ic-amber-bg)',  fg: 'var(--ic-amber-fg)' },
  'Information Technology':   { bg: 'var(--ic-purple-bg)', fg: 'var(--ic-purple-fg)' },
  'Industrials':              { bg: 'var(--ic-blue-bg)',   fg: 'var(--ic-blue-fg)' },
  'Consumer Discretionary':   { bg: 'var(--ic-orange-bg)', fg: 'var(--ic-orange-fg)' },
  'Healthcare':               { bg: 'var(--ic-teal-bg)',   fg: 'var(--ic-teal-fg)' },
};

function formatNum(n) {
  if (n == null || isNaN(n)) return '--';
  if (n >= 1e12) return '$' + (n / 1e12).toFixed(1) + 'T';
  if (n >= 1e9) return '$' + (n / 1e9).toFixed(0) + 'B';
  if (n >= 1e6) return '$' + (n / 1e6).toFixed(0) + 'M';
  return n.toFixed(2);
}

export default function SectorDashboardPage() {
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useApi(() => companies.list(), []);
  const [selectedSector, setSelectedSector] = useState(null);
  const [sectorMetrics, setSectorMetrics] = useState({});

  const companyList = useMemo(() => {
    if (!data) return [];
    return Array.isArray(data) ? data : data.companies || data.data || [];
  }, [data]);

  // Build sector aggregates
  const sectors = useMemo(() => {
    if (companyList.length === 0) return [];
    const sectorMap = {};
    companyList.forEach(c => {
      const sector = c.sector || 'Other';
      if (sector === 'Index') return;
      if (!sectorMap[sector]) {
        sectorMap[sector] = { name: sector, companies: [], totalMarketCap: 0, countries: new Set() };
      }
      sectorMap[sector].companies.push(c);
      sectorMap[sector].totalMarketCap += (c.market_cap || 0);
      if (c.country) sectorMap[sector].countries.add(c.country);
    });
    return Object.values(sectorMap).sort((a, b) => b.totalMarketCap - a.totalMarketCap);
  }, [companyList]);

  const totalMarketCap = sectors.reduce((sum, s) => sum + s.totalMarketCap, 0);

  // Fetch metrics for selected sector's companies
  useEffect(() => {
    if (!selectedSector) return;
    const sectorCompanies = selectedSector.companies.slice(0, 10);
    const fetchMetrics = async () => {
      const results = {};
      for (const c of sectorCompanies) {
        try {
          const res = await companies.get(c.id);
          const metrics = res.financial_metrics || res.financials || [];
          const m = Array.isArray(metrics) ? metrics[0] : metrics;
          if (m) results[c.id] = m;
        } catch { /* skip */ }
      }
      setSectorMetrics(results);
    };
    fetchMetrics();
  }, [selectedSector]);

  // Calculate sector averages from fetched metrics
  const sectorAvg = useMemo(() => {
    const values = Object.values(sectorMetrics);
    if (values.length === 0) return null;
    const avg = (key) => {
      const nums = values.map(m => m[key]).filter(v => v != null && !isNaN(v));
      return nums.length > 0 ? nums.reduce((a, b) => a + b, 0) / nums.length : null;
    };
    return {
      pe_ratio: avg('pe_ratio'),
      pb_ratio: avg('pb_ratio'),
      roe: avg('roe'),
      roa: avg('roa'),
      debt_to_equity: avg('debt_to_equity'),
      dividend_yield: avg('dividend_yield'),
      net_margin: avg('net_profit_margin'),
      current_ratio: avg('current_ratio'),
    };
  }, [sectorMetrics]);

  if (loading) return (
    <div className="animate-fade-in" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <PageHeader title="Sector Dashboard" backTo="/" subtitle="Industry Analysis" />
      <LoadingState message="Loading sector data..." />
    </div>
  );

  if (error) return (
    <div className="animate-fade-in" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <PageHeader title="Sector Dashboard" backTo="/" subtitle="Industry Analysis" />
      <ErrorState message={error} onRetry={refetch} />
    </div>
  );

  // Sector detail view
  if (selectedSector) {
    const Icon = SECTOR_ICONS[selectedSector.name] || Building2;
    const ic = SECTOR_IC[selectedSector.name] || { bg: 'var(--ic-blue-bg)', fg: 'var(--ic-blue-fg)' };
    const topCompanies = [...selectedSector.companies].sort((a, b) => (b.market_cap || 0) - (a.market_cap || 0)).slice(0, 10);
    const weight = totalMarketCap > 0 ? ((selectedSector.totalMarketCap / totalMarketCap) * 100) : 0;

    return (
      <div className="animate-fade-in" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
        <PageHeader title={selectedSector.name} subtitle="Sector Analysis" backTo="/sectors" />

        <div className="px-4 py-4 space-y-4">
          {/* Sector hero */}
          <div className="rounded-md p-4 text-white" style={{ background: 'var(--navy)' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-md flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.12)' }}>
                <Icon size={20} />
              </div>
              <div>
                <p className="font-head text-sm font-bold">{selectedSector.name}</p>
                <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.5)' }}>{selectedSector.companies.length} companies &middot; {selectedSector.countries.size} markets</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="font-head text-[10px] font-bold uppercase tracking-[1px]" style={{ color: 'rgba(255,255,255,0.45)' }}>Total Market Cap</p>
                <p className="text-lg font-bold">{formatNum(selectedSector.totalMarketCap)}</p>
              </div>
              <div>
                <p className="font-head text-[10px] font-bold uppercase tracking-[1px]" style={{ color: 'rgba(255,255,255,0.45)' }}>GCC Weight</p>
                <p className="text-lg font-bold">{weight.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          {/* Sector averages */}
          {sectorAvg && (
            <>
              <p className="font-head text-[11px] font-bold uppercase tracking-[1.2px]" style={{ color: 'var(--text-3)' }}>Sector Averages</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Avg P/E', value: sectorAvg.pe_ratio, suffix: 'x' },
                  { label: 'Avg P/B', value: sectorAvg.pb_ratio, suffix: 'x' },
                  { label: 'Avg ROE', value: sectorAvg.roe, suffix: '%' },
                  { label: 'Avg ROA', value: sectorAvg.roa, suffix: '%' },
                  { label: 'Avg D/E', value: sectorAvg.debt_to_equity, suffix: 'x' },
                  { label: 'Avg Div Yield', value: sectorAvg.dividend_yield, suffix: '%' },
                ].map(m => (
                  <div key={m.label} className="rounded-md p-3" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                    <p className="text-[10px]" style={{ color: 'var(--text-3)' }}>{m.label}</p>
                    <p className="font-head text-sm font-bold tabular-nums mt-0.5" style={{ color: 'var(--navy)' }}>
                      {m.value != null ? m.value.toFixed(2) + (m.suffix || '') : '--'}
                    </p>
                  </div>
                ))}
              </div>
              <p className="text-[10px] italic text-center" style={{ color: 'var(--text-3)' }}>* Based on top {Object.keys(sectorMetrics).length} companies by market cap</p>
            </>
          )}

          {/* Top companies in sector */}
          <p className="font-head text-[11px] font-bold uppercase tracking-[1.2px]" style={{ color: 'var(--text-3)' }}>Top Companies</p>
          <div className="space-y-2">
            {topCompanies.map((c, i) => (
              <button
                key={c.id}
                onClick={() => navigate(`/companies/${c.id}`)}
                className="rounded-md w-full text-left p-3 flex items-center gap-3 transition-all hover:-translate-y-0.5"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              >
                <span className="text-[10px] font-bold w-5 text-center" style={{ color: 'var(--text-3)' }}>#{i + 1}</span>
                <div className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: 'var(--ic-blue-bg)', color: 'var(--ic-blue-fg)' }}>
                  <Building2 size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-head text-[12px] font-bold truncate" style={{ color: 'var(--navy)' }}>{c.name}</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-3)' }}>{c.symbol} &middot; {c.country}</p>
                </div>
                <div className="text-right">
                  <p className="font-head text-[12px] font-bold tabular-nums" style={{ color: 'var(--navy)' }}>{formatNum(c.market_cap)}</p>
                </div>
                <ChevronRight size={14} style={{ color: 'var(--text-3)' }} />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Sector list view
  return (
    <div className="animate-fade-in" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <PageHeader title="Sector Dashboard" backTo="/" subtitle="Industry Analysis" />

      <div className="px-4 py-4 space-y-4">
        {/* Overview card */}
        <div className="rounded-md p-4 text-white" style={{ background: 'var(--navy)' }}>
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 size={16} />
            <p className="font-head text-[12px] font-bold">GCC Market Overview</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.45)' }}>Total Market Cap</p>
              <p className="text-lg font-bold tabular-nums">{formatNum(totalMarketCap)}</p>
            </div>
            <div>
              <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.45)' }}>Sectors</p>
              <p className="text-lg font-bold">{sectors.length}</p>
            </div>
            <div>
              <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.45)' }}>Companies</p>
              <p className="text-lg font-bold">{companyList.filter(c => c.sector !== 'Index').length}</p>
            </div>
          </div>
        </div>

        {/* Sector cards */}
        <p className="font-head text-[11px] font-bold uppercase tracking-[1.2px]" style={{ color: 'var(--text-3)' }}>Sectors by Market Cap</p>
        <div className="space-y-2.5">
          {sectors.map(s => {
            const Icon = SECTOR_ICONS[s.name] || Building2;
            const ic = SECTOR_IC[s.name] || { bg: 'var(--ic-blue-bg)', fg: 'var(--ic-blue-fg)' };
            const weight = totalMarketCap > 0 ? ((s.totalMarketCap / totalMarketCap) * 100) : 0;
            return (
              <button
                key={s.name}
                onClick={() => { setSelectedSector(s); setSectorMetrics({}); }}
                className="rounded-md w-full text-left p-3.5 overflow-hidden transition-all hover:-translate-y-0.5"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className="w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{ background: ic.bg, color: ic.fg }}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-head text-sm font-bold" style={{ color: 'var(--navy)' }}>{s.name}</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-3)' }}>{s.companies.length} companies &middot; {s.countries.size} markets</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-head text-[12px] font-bold tabular-nums" style={{ color: 'var(--navy)' }}>{formatNum(s.totalMarketCap)}</p>
                    <p className="text-[10px] tabular-nums" style={{ color: 'var(--text-3)' }}>{weight.toFixed(1)}%</p>
                  </div>
                  <ChevronRight size={14} style={{ color: 'var(--text-3)' }} />
                </div>
                {/* Weight bar */}
                <div className="mt-2.5 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg)' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${Math.min(weight, 100)}%`, background: 'var(--blue)' }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
