import { useState, useMemo } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import { Building2, Bitcoin, Layers, DollarSign, Fuel, Landmark } from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';
import '../components/shared/ChartSetup';

/* ─── Asset class color map ─── */
const CLASS_COLORS = {
  stock:  '#010131',
  crypto: '#7C5FDB',
  metal:  '#F2A600',
  oil:    '#FF8A35',
  bond:   '#5391D5',
  cash:   '#00C896',
};

const CLASS_LABELS = {
  stock: 'Stocks', crypto: 'Crypto', metal: 'Metals',
  oil: 'Oil', bond: 'Bonds', cash: 'Cash',
};

const CLASS_ICONS = {
  stock: Building2, crypto: Bitcoin, metal: Layers,
  oil: Fuel, bond: Landmark, cash: DollarSign,
};

const CLASS_BG = {
  stock:  '#EAEBF7',
  crypto: '#F0ECFB',
  metal:  '#FFF4DC',
  oil:    '#FFF0E6',
  bond:   '#E8F1FB',
  cash:   '#E0F9EF',
};

const RANGES = ['1M', '3M', '6M', '1Y'];
const RANGE_WEEKS = { '1M': 4, '3M': 13, '6M': 26, '1Y': 52 };

/* ─── Helpers ─── */
function getPortfolioData() {
  try {
    const holdings = JSON.parse(localStorage.getItem('vifm-portfolio')) || [];
    const byType = {};
    let total = 0;
    holdings.forEach(h => {
      const value = h.quantity * (h.currentPrice || h.costPrice || 0);
      total += value;
      byType[h.type] = (byType[h.type] || 0) + value;
    });
    return { total, byType, count: holdings.length };
  } catch {
    return { total: 0, byType: {}, count: 0 };
  }
}

function generateHistory(total, weeks) {
  const points = [];
  const now = new Date();
  const base = total > 0 ? total * 0.82 : 50000;
  for (let i = weeks; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    const noise = (Math.random() - 0.4) * base * 0.03;
    const growth = (1 - i / weeks) * (total > 0 ? total - base : base * 0.22);
    points.push({
      date: d,
      label: d.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      value: Math.max(0, base + growth + noise),
    });
  }
  // ensure last point = actual total
  if (total > 0 && points.length) points[points.length - 1].value = total;
  return points;
}

function generateMonthly(total) {
  const months = [];
  const now = new Date();
  let val = total > 0 ? total : 62400;
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString('en', { month: 'long', year: 'numeric' });
    months.push({ label, value: val });
    val = val * (0.96 + Math.random() * 0.03); // slight decay going back
  }
  // compute change
  return months.map((m, i) => ({
    ...m,
    change: i < months.length - 1 ? m.value - months[i + 1].value : 0,
  }));
}

function fmt(n) {
  if (n >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return '$' + (n / 1e3).toFixed(1) + 'K';
  return '$' + n.toFixed(0);
}

function fmtFull(n) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

/* ─── Page ─── */
export default function NetWorthPage() {
  const [range, setRange] = useState('6M');

  const { total, byType } = useMemo(getPortfolioData, []);

  const history = useMemo(() => generateHistory(total, RANGE_WEEKS[range]), [total, range]);
  const monthly = useMemo(() => generateMonthly(total), [total]);

  const firstVal = history[0]?.value || 0;
  const changeAmt = total - firstVal;
  const changePct = firstVal > 0 ? ((total - firstVal) / firstVal) * 100 : 0;
  const isUp = changeAmt >= 0;

  // Ordered asset classes present in portfolio
  const classes = ['stock', 'crypto', 'metal', 'oil', 'bond', 'cash'].filter(c => byType[c] > 0);
  const displayTotal = total > 0 ? total : 0;

  /* ─── Chart data ─── */
  const chartData = {
    labels: history.map(p => p.label),
    datasets: [{
      data: history.map(p => p.value),
      borderColor: '#5391D5',
      backgroundColor: (ctx) => {
        const chart = ctx.chart;
        const { ctx: c, chartArea } = chart;
        if (!chartArea) return 'rgba(83,145,213,0.08)';
        const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        g.addColorStop(0, 'rgba(83,145,213,0.18)');
        g.addColorStop(1, 'rgba(83,145,213,0.01)');
        return g;
      },
      fill: true,
      tension: 0.35,
      pointRadius: 0,
      pointHoverRadius: 4,
      borderWidth: 2,
    }],
  };

  const chartOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#010131',
        titleFont: { family: 'Sora', size: 11, weight: '600' },
        bodyFont: { family: 'DM Sans', size: 11 },
        cornerRadius: 8,
        padding: 10,
        callbacks: { label: (c) => fmtFull(c.parsed.y) },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { family: 'DM Sans', size: 9 }, color: 'var(--text-3)', maxTicksLimit: 6 } },
      y: { grid: { color: 'var(--border)' }, ticks: { font: { family: 'DM Sans', size: 9 }, color: 'var(--text-3)', callback: v => fmt(v) } },
    },
  };

  /* ─── Stacked bar widths ─── */
  const barSegments = classes.map(c => ({
    type: c,
    pct: displayTotal > 0 ? (byType[c] / displayTotal) * 100 : 0,
  }));

  return (
    <div className="animate-fade-in pb-28">
      <PageHeader title="Net Worth" subtitle="Total Asset Value" backTo="/" />

      {/* ── Total Net Worth Card ── */}
      <div className="mx-5 mt-4 rounded-lg p-5" style={{ background: 'linear-gradient(135deg, #010131 0%, #1A2460 100%)' }}>
        <p className="text-[11px] font-bold uppercase tracking-[1.2px] text-white/60 mb-1">Total Net Worth</p>
        <p className="font-head text-[26px] font-bold text-white leading-tight">
          {displayTotal > 0 ? fmtFull(displayTotal) : '$0'}
        </p>
        {displayTotal > 0 && (
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-[12px] font-bold px-2 py-0.5 rounded-full ${isUp ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
              {isUp ? '+' : ''}{fmtFull(changeAmt)} ({changePct.toFixed(1)}%)
            </span>
            <span className="text-[10px] text-white/50">Updated just now</span>
          </div>
        )}
        {displayTotal === 0 && (
          <p className="text-[11px] text-white/50 mt-2">Add holdings in your portfolio to track net worth</p>
        )}
      </div>

      {/* ── Line Chart ── */}
      <div className="mx-5 mt-4 rounded-md p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-3">
          <p className="font-head text-[11px] font-bold uppercase tracking-[1.2px]" style={{ color: 'var(--text-3)' }}>Net Worth Over Time</p>
          <div className="flex gap-1">
            {RANGES.map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className="text-[10px] font-bold px-2.5 py-1 rounded-full transition-all"
                style={{
                  background: range === r ? 'var(--navy)' : 'var(--bg)',
                  color: range === r ? '#fff' : 'var(--text-3)',
                  border: range === r ? 'none' : '1px solid var(--border)',
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <div style={{ height: 200 }}>
          <Line data={chartData} options={chartOpts} />
        </div>
      </div>

      {/* ── Asset Breakdown Bar ── */}
      {classes.length > 0 && (
        <div className="mx-5 mt-4 rounded-md p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <p className="font-head text-[11px] font-bold uppercase tracking-[1.2px] mb-3" style={{ color: 'var(--text-3)' }}>Asset Breakdown</p>

          {/* Stacked bar */}
          <div className="flex rounded-full overflow-hidden h-3 mb-4">
            {barSegments.map(s => (
              <div key={s.type} style={{ width: s.pct + '%', background: CLASS_COLORS[s.type], minWidth: s.pct > 0 ? 4 : 0 }} />
            ))}
          </div>

          {/* Legend list */}
          <div className="space-y-2">
            {classes.map(c => (
              <div key={c} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: CLASS_COLORS[c] }} />
                  <span className="text-[12px] font-medium" style={{ color: 'var(--text-2)' }}>{CLASS_LABELS[c]}</span>
                </div>
                <div className="text-right">
                  <span className="text-[12px] font-bold mr-2" style={{ color: 'var(--navy)' }}>{fmtFull(byType[c])}</span>
                  <span className="text-[10px] font-medium" style={{ color: 'var(--text-3)' }}>
                    {((byType[c] / displayTotal) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Asset Class Cards (2-col grid) ── */}
      {classes.length > 0 && (
        <div className="mx-5 mt-4">
          <p className="font-head text-[11px] font-bold uppercase tracking-[1.2px] mb-3" style={{ color: 'var(--text-3)' }}>By Asset Class</p>
          <div className="grid grid-cols-2 gap-2.5">
            {classes.map(c => {
              const Icon = CLASS_ICONS[c];
              const pct = ((byType[c] / displayTotal) * 100).toFixed(1);
              return (
                <div key={c} className="rounded-md p-3.5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                  <div className="w-9 h-9 rounded-sm flex items-center justify-center mb-2" style={{ background: CLASS_BG[c], borderRadius: 'var(--r-sm)' }}>
                    <Icon size={18} style={{ color: CLASS_COLORS[c] }} />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.8px] mb-0.5" style={{ color: 'var(--text-3)' }}>{CLASS_LABELS[c]}</p>
                  <p className="font-head text-[16px] font-bold leading-tight" style={{ color: 'var(--navy)' }}>{fmt(byType[c])}</p>
                  <p className="text-[10px] font-medium mt-0.5" style={{ color: 'var(--text-3)' }}>{pct}% of total</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Monthly Summary ── */}
      <div className="mx-5 mt-4 rounded-md p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <p className="font-head text-[11px] font-bold uppercase tracking-[1.2px] mb-3" style={{ color: 'var(--text-3)' }}>Monthly Summary</p>
        <div className="space-y-2.5">
          {monthly.map((m, i) => (
            <div key={i} className="flex items-center justify-between py-1.5" style={{ borderBottom: i < monthly.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <span className="text-[12px] font-medium" style={{ color: 'var(--text-2)' }}>{m.label}</span>
              <div className="text-right">
                <span className="text-[12px] font-bold mr-2" style={{ color: 'var(--navy)' }}>{fmtFull(Math.round(m.value))}</span>
                {i < monthly.length - 1 && (
                  <span className={`text-[10px] font-bold ${m.change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {m.change >= 0 ? '+' : ''}{fmtFull(Math.round(m.change))}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
