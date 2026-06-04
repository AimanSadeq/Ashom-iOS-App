import { useState, useMemo, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, FileText, ExternalLink,
  BarChart2, DollarSign, Percent, Activity, ShieldCheck, PieChart, Star, Pin, ShoppingCart
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
import '../components/shared/ChartSetup';

import PageHeader from '../components/shared/PageHeader';
import LoadingState from '../components/shared/LoadingState';
import ErrorState from '../components/shared/ErrorState';
import useApi from '../hooks/useApi';
import { companies } from '../services/api';
import useWatchlist from '../hooks/useWatchlist';
import usePin from '../hooks/usePin';
import { getShariaStatus } from './ShariaScreeningPage';

const TIMEFRAMES = [
  { label: '1D', days: 1 },
  { label: '1W', days: 7 },
  { label: '1M', days: 30 },
  { label: '3M', days: 90 },
  { label: '1Y', days: 365 },
  { label: 'ALL', days: 730 },
];

function generatePriceHistory(name, days) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;

  const basePrice = 10 + (Math.abs(hash) % 200);
  const points = [];
  let price = basePrice;
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const seed = Math.abs(hash * (i + 1) * 9301 + 49297) % 233280;
    const change = ((seed / 233280) - 0.48) * basePrice * 0.03;
    price = Math.max(basePrice * 0.5, price + change);
    points.push({ date: date.toISOString().split('T')[0], price: +price.toFixed(2) });
  }
  return points;
}

function PriceChart({ companyName }) {
  const [activeTimeframe, setActiveTimeframe] = useState(2); // default 1M
  const chartRef = useRef(null);

  const { days } = TIMEFRAMES[activeTimeframe];
  const history = useMemo(() => generatePriceHistory(companyName || 'Company', days), [companyName, days]);

  const currentPrice = history[history.length - 1]?.price ?? 0;
  const startPrice = history[0]?.price ?? currentPrice;
  const priceChange = currentPrice - startPrice;
  const pctChange = startPrice ? ((priceChange / startPrice) * 100) : 0;
  const isUp = priceChange >= 0;

  // Thin out labels for readability
  const labelInterval = days <= 7 ? 1 : days <= 30 ? 5 : days <= 90 ? 15 : days <= 365 ? 60 : 120;
  const labels = history.map((p, i) => {
    if (days <= 1) return p.date.slice(5); // MM-DD
    if (i % labelInterval === 0 || i === history.length - 1) {
      return days <= 30 ? p.date.slice(5) : p.date.slice(2, 7); // YY-MM or MM-DD
    }
    return '';
  });

  const getGradient = useCallback((ctx) => {
    const chart = ctx.chart;
    const { ctx: context, chartArea } = chart;
    if (!chartArea) return 'rgba(83,145,213,0.15)';
    const gradient = context.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
    gradient.addColorStop(0, 'rgba(83,145,213,0.25)');
    gradient.addColorStop(1, 'rgba(83,145,213,0.02)');
    return gradient;
  }, []);

  const chartData = useMemo(() => ({
    labels,
    datasets: [{
      data: history.map(p => p.price),
      borderColor: '#5391D5',
      borderWidth: 2,
      pointRadius: 0,
      pointHitRadius: 8,
      pointHoverRadius: 4,
      pointHoverBackgroundColor: '#5391D5',
      fill: true,
      backgroundColor: getGradient,
      tension: 0.3,
    }],
  }), [labels, history, getGradient]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#010131',
        titleFont: { family: 'Sora', size: 11, weight: '600' },
        bodyFont: { family: 'DM Sans', size: 11 },
        cornerRadius: 8,
        padding: 10,
        callbacks: {
          title: (items) => {
            const idx = items[0]?.dataIndex;
            return idx != null ? history[idx]?.date : '';
          },
          label: (item) => `Price: ${item.raw.toFixed(2)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          font: { family: 'DM Sans', size: 9 },
          color: '#9AA3BD',
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 6,
        },
      },
      y: {
        grid: { color: '#E8ECF4', drawBorder: false },
        ticks: {
          font: { family: 'DM Sans', size: 10 },
          color: '#9AA3BD',
          padding: 8,
        },
      },
    },
  }), [history]);

  return (
    <div
      className="rounded-md overflow-hidden"
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
    >
      {/* Price header */}
      <div className="px-3 pt-3 pb-1 flex items-end justify-between">
        <div>
          <p className="text-[10px] font-body" style={{ color: 'var(--text-3)' }}>Current Price</p>
          <p className="text-xl font-bold font-head" style={{ color: 'var(--navy)' }}>
            {currentPrice.toFixed(2)}
          </p>
        </div>
        <div
          className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold font-body"
          style={{
            background: isUp ? 'rgba(0,200,150,0.1)' : 'rgba(255,75,110,0.1)',
            color: isUp ? 'var(--green)' : 'var(--red)',
          }}
        >
          {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {isUp ? '+' : ''}{pctChange.toFixed(2)}%
        </div>
      </div>

      {/* Timeframe toggles */}
      <div className="px-3 pt-1 pb-2 flex gap-1.5">
        {TIMEFRAMES.map((tf, i) => (
          <button
            key={tf.label}
            onClick={() => setActiveTimeframe(i)}
            className="px-2.5 py-1 rounded-full text-[10px] font-semibold font-body transition-colors"
            style={{
              background: i === activeTimeframe ? 'var(--navy)' : 'var(--card)',
              color: i === activeTimeframe ? '#fff' : 'var(--text-2)',
              border: i === activeTimeframe ? 'none' : '1px solid var(--border)',
            }}
          >
            {tf.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="px-2 pb-3" style={{ height: 200 }}>
        <Line ref={chartRef} data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}

const METRIC_SECTIONS = [
  {
    title: 'Valuation',
    icon: DollarSign,
    metrics: [
      { key: 'pe_ratio', label: 'P/E Ratio' },
      { key: 'pb_ratio', label: 'P/B Ratio' },
      { key: 'ps_ratio', label: 'P/S Ratio' },
      { key: 'ev_ebitda', label: 'EV/EBITDA' },
    ],
  },
  {
    title: 'Profitability',
    icon: BarChart2,
    metrics: [
      { key: 'roe', label: 'ROE', suffix: '%' },
      { key: 'roa', label: 'ROA', suffix: '%' },
      { key: 'net_profit_margin', label: 'Net Margin', suffix: '%' },
      { key: 'gross_margin', label: 'Gross Margin', suffix: '%' },
    ],
  },
  {
    title: 'Risk & Leverage',
    icon: ShieldCheck,
    metrics: [
      { key: 'debt_to_equity', label: 'D/E Ratio' },
      { key: 'beta', label: 'Beta' },
      { key: 'current_ratio', label: 'Current Ratio' },
      { key: 'interest_coverage', label: 'Interest Coverage' },
    ],
  },
  {
    title: 'Dividends & Growth',
    icon: PieChart,
    metrics: [
      { key: 'dividend_yield', label: 'Div Yield', suffix: '%' },
      { key: 'payout_ratio', label: 'Payout Ratio', suffix: '%' },
      { key: 'revenue_growth', label: 'Rev Growth', suffix: '%' },
      { key: 'earnings_growth', label: 'EPS Growth', suffix: '%' },
    ],
  },
];

function generateRatings(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
  const absHash = Math.abs(hash);

  const totalAnalysts = 8 + (absHash % 8);
  const buyPct = 40 + (absHash % 35);
  const sellPct = 5 + ((absHash >> 4) % 15);

  const buy = Math.round(totalAnalysts * buyPct / 100);
  const sell = Math.max(1, Math.round(totalAnalysts * sellPct / 100));
  const hold = totalAnalysts - buy - sell;

  const consensus = buy > hold + sell ? 'Buy' : hold > buy ? 'Hold' : 'Buy';
  const currentPrice = 10 + (absHash % 200);
  const targetPrice = currentPrice * (1 + (0.05 + (absHash % 25) / 100));

  return { buy, hold, sell, total: totalAnalysts, consensus, targetPrice: +targetPrice.toFixed(2), currentPrice };
}

const CONSENSUS_COLORS = {
  Buy:  { bg: '#E6FAF5', text: '#00C896' },
  Hold: { bg: '#FFF8E6', text: '#F2A600' },
  Sell: { bg: '#FFF0F3', text: '#FF4B6E' },
};

function AnalystConsensus({ companyName, currency }) {
  const ratings = generateRatings(companyName || 'Unknown');
  const { buy, hold, sell, total, consensus, targetPrice, currentPrice } = ratings;
  const colors = CONSENSUS_COLORS[consensus] || CONSENSUS_COLORS.Buy;
  const upside = ((targetPrice - currentPrice) / currentPrice * 100).toFixed(1);
  const isUpside = targetPrice >= currentPrice;

  const buyW = (buy / total * 100).toFixed(1);
  const holdW = (hold / total * 100).toFixed(1);
  const sellW = (sell / total * 100).toFixed(1);

  return (
    <div
      className="p-4 rounded-lg"
      style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r-md, 8px)' }}
    >
      <p
        className="font-head text-[11px] font-bold uppercase tracking-[1.2px] mb-3"
        style={{ color: 'var(--text-3)' }}
      >
        Analyst Consensus
      </p>

      {/* Overall badge + target */}
      <div className="flex items-center justify-between mb-3">
        <span
          className="px-3 py-1 rounded-full text-xs font-bold font-head"
          style={{ background: colors.bg, color: colors.text }}
        >
          {consensus}
        </span>
        <div className="text-right">
          <p className="text-[10px] font-body" style={{ color: 'var(--text-3)' }}>Avg Target</p>
          <p className="text-sm font-bold font-body" style={{ color: 'var(--navy)' }}>
            {currency || 'SAR'} {targetPrice.toFixed(2)}
            <span
              className="ml-1.5 text-[10px] font-semibold"
              style={{ color: isUpside ? '#00C896' : '#FF4B6E' }}
            >
              {isUpside ? '+' : ''}{upside}%
            </span>
          </p>
        </div>
      </div>

      {/* Stacked bar */}
      <div className="flex w-full h-2 rounded-full overflow-hidden mb-2">
        <div style={{ width: `${buyW}%`, background: '#00C896' }} />
        <div style={{ width: `${holdW}%`, background: '#F2A600' }} />
        <div style={{ width: `${sellW}%`, background: '#FF4B6E' }} />
      </div>

      {/* Counts */}
      <div className="flex items-center justify-center gap-1 text-[10px] font-body" style={{ color: 'var(--text-3)' }}>
        <span style={{ color: '#00C896', fontWeight: 700 }}>{buy}</span> Buy
        <span className="mx-0.5">&middot;</span>
        <span style={{ color: '#F2A600', fontWeight: 700 }}>{hold}</span> Hold
        <span className="mx-0.5">&middot;</span>
        <span style={{ color: '#FF4B6E', fontWeight: 700 }}>{sell}</span> Sell
      </div>

      {/* Updated label */}
      <p className="text-[9px] font-body mt-2 text-center" style={{ color: 'var(--text-3)', opacity: 0.6 }}>
        Updated 3 days ago &middot; {total} analysts
      </p>
    </div>
  );
}

export default function CompanyProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useApi(() => companies.get(id), [id]);
  const { isWatched, toggleWatchlist } = useWatchlist();
  const { isPinned, addPin, removePin, createPin } = usePin();
  const pinId = 'company-' + id;

  const company = data?.company || data?.data || data || {};
  const finArr = company.financial_metrics || company.financials || company.metrics || [];
  const financials = Array.isArray(finArr) ? (finArr[0] || {}) : finArr;
  const reportsList = company.annual_reports || company.reports || company.annualReports || [];

  function formatMetric(val, suffix) {
    if (val == null) return '--';
    const num = Number(val);
    if (isNaN(num)) return '--';
    return num.toFixed(2) + (suffix || '');
  }

  if (loading) return (
    <div className="animate-fade-in" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <PageHeader title="Company" backTo="/companies" />
      <LoadingState message="Loading company profile..." />
    </div>
  );

  if (error) return (
    <div className="animate-fade-in" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <PageHeader title="Company" backTo="/companies" />
      <ErrorState message={error} onRetry={refetch} />
    </div>
  );

  const change = company.change ?? company.priceChange ?? 0;
  const isPositive = change >= 0;

  return (
    <div className="animate-fade-in" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <PageHeader
        title={company.name || 'Company Profile'}
        subtitle={company.ticker || company.symbol}
        backTo="/companies"
      />

      {/* Hero card */}
      <div className="px-4 pt-4">
        <div
          className="p-4 rounded-lg relative"
          style={{
            background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-soft) 100%)',
            color: '#fff',
          }}
        >
          {/* Action buttons */}
          <div className="absolute top-3 right-3 flex gap-1.5">
            <button
              onClick={() => {
                if (isPinned(pinId)) removePin(pinId);
                else addPin(createPin('company', { companyId: company.id, name: company.name, ticker: company.ticker || company.symbol, sector: company.sector }));
              }}
              className="p-1.5 rounded-md transition-colors active:scale-90"
              style={{ background: 'rgba(255,255,255,0.1)' }}
              aria-label={isPinned(pinId) ? 'Unpin from My Screen' : 'Pin to My Screen'}
            >
              <Pin size={14} style={{ color: isPinned(pinId) ? 'var(--green)' : 'rgba(255,255,255,0.4)' }} />
            </button>
            <button
              onClick={() => toggleWatchlist(company)}
              className="p-1.5 rounded-md transition-colors active:scale-90"
              style={{ background: 'rgba(255,255,255,0.1)' }}
              aria-label={isWatched(company.id) ? 'Remove from watchlist' : 'Add to watchlist'}
            >
              <Star size={14} style={{ color: isWatched(company.id) ? '#F5A623' : 'rgba(255,255,255,0.4)' }} fill={isWatched(company.id) ? 'currentColor' : 'none'} />
            </button>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold font-body" style={{ opacity: 0.7 }}>{company.ticker || company.symbol}</p>
              <h2 className="text-lg font-bold mt-0.5 leading-tight font-head">{company.name}</h2>
              <div className="flex items-center gap-2 mt-1.5">
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-semibold font-body"
                  style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}
                >
                  {(company.country || '').slice(0, 2).toUpperCase()}
                </span>
                <span className="text-[10px] font-body" style={{ opacity: 0.6 }}>{company.sector || company.industry}</span>
                {company.name && (() => {
                  const sharia = getShariaStatus(company.name);
                  const isCompliant = sharia.status === 'compliant';
                  const isWatch = sharia.status === 'watch';
                  return (
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold font-body"
                      style={{
                        background: isCompliant ? 'rgba(0,200,150,0.2)' : isWatch ? 'rgba(242,166,0,0.2)' : 'rgba(255,75,110,0.2)',
                        color: isCompliant ? '#00C896' : isWatch ? '#F2A600' : '#FF4B6E',
                      }}
                    >
                      <ShieldCheck size={9} />
                      {isCompliant ? 'Sharia Compliant' : isWatch ? 'Watch List' : 'Non-Compliant'}
                    </span>
                  );
                })()}
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold font-head">
                {company.price != null ? company.price.toFixed(2) : '--'}
              </p>
              <div className="flex items-center justify-end gap-1 text-sm font-semibold font-body" style={{ color: isPositive ? 'var(--green)' : 'var(--red)' }}>
                {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {change != null ? `${isPositive ? '+' : ''}${change.toFixed(2)}%` : '--'}
              </div>
              <p className="text-[10px] mt-0.5 font-body" style={{ opacity: 0.5 }}>{company.currency || ''}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Trade button */}
      <div className="px-4 pt-3">
        <button
          onClick={() => navigate(`/order/${company.ticker || company.symbol}`)}
          className="w-full py-2.5 rounded-lg text-xs font-bold font-head flex items-center justify-center gap-2 active:scale-[0.98] transition-all duration-150"
          style={{ background: 'var(--navy)', color: '#fff' }}
        >
          <ShoppingCart size={14} />
          Trade {company.ticker || company.symbol}
        </button>
      </div>

      {/* Price chart */}
      {company.name && (
        <div className="px-4 pt-4">
          <PriceChart companyName={company.name} />
        </div>
      )}

      {/* Analyst consensus */}
      {company.name && (
        <div className="px-4 pt-4">
          <AnalystConsensus companyName={company.name} currency={company.currency} />
        </div>
      )}

      {/* Financial metrics */}
      <div className="px-4 pt-5 pb-2 space-y-5">
        {METRIC_SECTIONS.map(section => {
          const Icon = section.icon;
          return (
            <div key={section.title}>
              <div className="flex items-center gap-2 mb-2.5">
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center"
                  style={{ background: 'var(--blue-light)' }}
                >
                  <Icon size={12} style={{ color: 'var(--blue)' }} />
                </div>
                <p className="text-xs font-bold font-head" style={{ color: 'var(--navy)' }}>{section.title}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {section.metrics.map(m => (
                  <div
                    key={m.key}
                    className="p-2.5 rounded-md"
                    style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                  >
                    <p className="text-[10px] font-body" style={{ color: 'var(--text-3)' }}>{m.label}</p>
                    <p className="text-sm font-bold font-body mt-0.5" style={{ color: 'var(--navy)' }}>
                      {formatMetric(financials[m.key], m.suffix)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Annual reports */}
      {reportsList.length > 0 && (
        <div className="px-4 pt-3 pb-4">
          <p
            className="font-head text-[11px] font-bold uppercase tracking-[1.2px] mb-2.5"
            style={{ color: 'var(--text-3)' }}
          >
            Annual Reports
          </p>
          <div className="space-y-2">
            {reportsList.map((r, i) => (
              <button
                key={r.id || i}
                onClick={() => navigate(`/reports/${r.id}`)}
                className="w-full text-left p-3 flex items-center gap-3 rounded-md transition-all duration-150 hover:shadow-sm active:scale-[0.99]"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              >
                <div
                  className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
                  style={{ background: 'var(--blue-light)' }}
                >
                  <FileText size={16} style={{ color: 'var(--blue)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold font-body truncate" style={{ color: 'var(--navy)' }}>
                    {r.title || `${company.name} - ${r.year || 'Report'}`}
                  </p>
                  <p className="text-[10px] font-body" style={{ color: 'var(--text-3)' }}>{r.year || r.date || '--'}</p>
                </div>
                <ExternalLink size={14} style={{ color: 'var(--text-3)' }} className="shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="h-4" />
    </div>
  );
}
