import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, TrendingDown, Minus, RefreshCw, Pin } from 'lucide-react';
import usePin from '../../hooks/usePin';

const MARKET_INDICES = [
  { id: 'tasi',    label: 'TASI',    country: 'SA', value: 12483.50, change: 1.24 },
  { id: 'dfm',     label: 'DFM',     country: 'AE', value: 4521.18,  change: -0.38 },
  { id: 'qe',      label: 'QE',      country: 'QA', value: 10245.72, change: 0.67 },
  { id: 'boursa',  label: 'Boursa',  country: 'KW', value: 7892.15,  change: 0.15 },
  { id: 'bax',     label: 'BAX',     country: 'BH', value: 1985.33,  change: -0.12 },
  { id: 'msm',     label: 'MSM30',   country: 'OM', value: 4678.41,  change: 0.89 },
];

function MiniSparkline({ positive }) {
  // Generate a simple SVG sparkline path
  const points = Array.from({ length: 12 }, (_, i) => {
    const base = positive ? 20 - (i * 0.6) : 12 + (i * 0.4);
    const noise = Math.sin(i * 1.8 + (positive ? 0 : 2)) * 4 + Math.cos(i * 0.9) * 2;
    return Math.max(4, Math.min(28, base + noise));
  });
  const w = 48, h = 32;
  const stepX = w / (points.length - 1);
  const d = points.map((y, i) => `${i === 0 ? 'M' : 'L'}${(i * stepX).toFixed(1)},${y.toFixed(1)}`).join(' ');

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="flex-shrink-0 opacity-60">
      <path d={d} fill="none" stroke={positive ? '#1d9e75' : '#e24b4a'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IndexPill({ index, pinFns }) {
  const positive = index.change > 0;
  const neutral = index.change === 0;
  const changeColor = neutral ? 'text-gray-400' : positive ? 'text-teal-600' : 'text-danger-400';
  const bgColor = neutral ? 'bg-gray-50' : positive ? 'bg-teal-50/60' : 'bg-danger-50/60';
  const ChangeIcon = neutral ? Minus : positive ? TrendingUp : TrendingDown;

  const pinId = 'index-' + index.id;
  const pinned = pinFns.isPinned(pinId);

  return (
    <div className={`flex-shrink-0 w-[140px] rounded-xl p-3 ${bgColor} border border-white/60 relative`}>
      {/* Pin button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (pinned) pinFns.removePin(pinId);
          else pinFns.addPin({
            id: pinId, type: 'index',
            label: index.label, subtitle: index.country,
            route: '/markets', color: 'brand', iconName: 'TrendingUp',
            indexId: index.id,
          });
        }}
        className="absolute top-1.5 right-1.5 p-0.5 rounded hover:bg-white/50 transition-colors active:scale-90"
      >
        <Pin size={8} className={pinned ? 'text-teal-500' : 'text-gray-300'} />
      </button>

      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-2xs font-bold text-gray-500 bg-white/80 px-1.5 py-0.5 rounded">{index.country}</span>
        <span className="text-xs font-bold text-brand-900">{index.label}</span>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm font-bold text-brand-900 font-mono tabular-nums">{index.value.toLocaleString('en', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
          <div className={`flex items-center gap-0.5 mt-0.5 ${changeColor}`}>
            <ChangeIcon size={10} strokeWidth={2.2} />
            <span className="text-2xs font-bold font-mono tabular-nums">{positive ? '+' : ''}{index.change.toFixed(2)}%</span>
          </div>
        </div>
        <MiniSparkline positive={positive} />
      </div>
    </div>
  );
}

export default function WelcomeHero({ user }) {
  const [indices, setIndices] = useState(MARKET_INDICES);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const simulateRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setIndices(prev => prev.map(idx => ({
        ...idx,
        value: idx.value * (1 + (Math.random() - 0.48) * 0.004),
        change: +(idx.change + (Math.random() - 0.5) * 0.3).toFixed(2),
      })));
      setLastUpdated(new Date());
      setRefreshing(false);
    }, 600);
  }, []);

  useEffect(() => {
    const interval = setInterval(simulateRefresh, 30000);
    return () => clearInterval(interval);
  }, [simulateRefresh]);

  const { isPinned, addPin, removePin } = usePin();
  const pinId = 'section-marketsHero';
  const pinned = isPinned(pinId);

  return (
    <div className="px-4 pt-3 pb-1 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-2xs text-gray-400 mt-0.5">GCC markets at a glance</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              if (pinned) removePin(pinId);
              else addPin({ id: pinId, type: 'section', sectionId: 'marketsHero' });
            }}
            className="w-7 h-7 rounded-lg border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-all active:scale-90"
            aria-label={pinned ? 'Unpin' : 'Pin to My Screen'}
          >
            <Pin size={11} className={pinned ? 'text-teal-500' : 'text-gray-300'} />
          </button>
          <button
            onClick={simulateRefresh}
            className={`w-7 h-7 rounded-lg border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-all ${refreshing ? 'animate-spin' : ''}`}
            aria-label="Refresh"
          >
            <RefreshCw size={12} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Scrollable Index Strip */}
      <div className="-mx-4 px-4 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 pb-2" style={{ width: 'max-content' }}>
          {indices.map(idx => (
            <IndexPill key={idx.id} index={idx} pinFns={{ isPinned, addPin, removePin }} />
          ))}
        </div>
      </div>

      {/* Last updated */}
      <div className="flex items-center gap-1.5 mt-1 mb-1">
        <span className="live-dot" />
        <span className="text-2xs text-gray-400">
          Updated {lastUpdated.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}
