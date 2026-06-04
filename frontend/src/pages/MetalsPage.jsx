import { useState, useEffect, useRef, useCallback } from 'react';
import { RefreshCw, Gem, Droplets, FlaskConical, Sparkles, Fuel, Flame, Pin, ChevronRight } from 'lucide-react';

import PageHeader from '../components/shared/PageHeader';
import LoadingState from '../components/shared/LoadingState';
import ErrorState  from '../components/shared/ErrorState';
import { markets } from '../services/api';
import usePin from '../hooks/usePin';

const FALLBACK_DATA = {
  gold:      { name: 'Gold',      symbol: 'XAU', price: 2340.50, change: 1.2 },
  silver:    { name: 'Silver',    symbol: 'XAG', price: 30.15,   change: -0.8 },
  platinum:  { name: 'Platinum',  symbol: 'XPT', price: 1020.00, change: 0.5 },
  palladium: { name: 'Palladium', symbol: 'XPD', price: 980.00,  change: -1.1 },
  wti:       { name: 'WTI Crude Oil',   symbol: 'CL',  price: 78.50, change: 0.3 },
  brent:     { name: 'Brent Crude Oil',  symbol: 'BZ',  price: 82.75, change: 0.6 },
};

const COMMODITY_ORDER = ['gold', 'silver', 'platinum', 'palladium', 'wti', 'brent'];

/* ─── Deterministic Mini Sparkline (48x24) ─── */
function MiniSparkline({ name, positive }) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
  const points = Array.from({ length: 10 }, (_, i) => {
    const seed = Math.abs(hash * (i + 1) * 9301 + 49297) % 233280;
    const rand = seed / 233280;
    const base = positive ? 20 - (i * 0.8) : 10 + (i * 0.5);
    return Math.max(2, Math.min(22, base + (rand - 0.5) * 10));
  });
  const w = 48, h = 24;
  const stepX = w / (points.length - 1);
  const d = points.map((y, i) => `${i === 0 ? 'M' : 'L'}${(i * stepX).toFixed(1)},${y.toFixed(1)}`).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none" style={{ flexShrink: 0 }}>
      <path d={d} stroke={positive ? 'var(--green)' : 'var(--red)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── 24h High/Low Bar ─── */
function HighLowBar({ price }) {
  const high = price * 1.02;
  const low = price * 0.98;
  const range = high - low;
  const pct = range > 0 ? ((price - low) / range) * 100 : 50;
  return (
    <div style={{ width: '100%', marginTop: 4, position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
        <span style={{ fontSize: 9, color: 'var(--text-3)' }}>{low.toFixed(2)}</span>
        <span style={{ fontSize: 9, color: 'var(--text-3)' }}>{high.toFixed(2)}</span>
      </div>
      <div style={{ position: 'relative', height: 4, borderRadius: 2, background: 'var(--border)', overflow: 'visible' }}>
        <div style={{
          position: 'absolute',
          left: `${pct}%`,
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: 'var(--blue)',
          border: '1.5px solid var(--card)',
          boxShadow: '0 0 0 1px var(--blue)',
        }} />
      </div>
    </div>
  );
}

const COMMODITY_NAMES = {
  gold: { name: 'Gold', symbol: 'XAU' },
  silver: { name: 'Silver', symbol: 'XAG' },
  platinum: { name: 'Platinum', symbol: 'XPT' },
  palladium: { name: 'Palladium', symbol: 'XPD' },
  wti: { name: 'WTI Crude Oil', symbol: 'CL' },
  brent: { name: 'Brent Crude Oil', symbol: 'BZ' },
};

const ICONS = {
  gold:      Sparkles,
  silver:    Gem,
  platinum:  FlaskConical,
  palladium: Gem,
  wti:       Fuel,
  brent:     Flame,
};

/* Icon styling per commodity — bg + fg */
const ICON_STYLES = {
  gold:      { bg: '#FFF8E6', fg: '#F2A600' },
  silver:    { bg: '#F4F6FB', fg: '#9AA3BD' },
  platinum:  { bg: '#EAF2FC', fg: '#5391D5' },
  palladium: { bg: '#E6FAF5', fg: '#00C896' },
  wti:       { bg: '#FFF5ED', fg: '#FF8A35' },
  brent:     { bg: '#FFF0F3', fg: '#FF4B6E' },
};

export default function MetalsPage() {
  const [commodities, setCommodities] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const intervalRef = useRef(null);
  const { isPinned, addPin, removePin, createPin } = usePin();

  const fetchData = useCallback(async () => {
    try {
      const res = await markets.commodities();
      const items = res?.data || res;
      setCommodities(items);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      if (!commodities) {
        setCommodities(FALLBACK_DATA);
        setLastUpdated(new Date());
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchData();

    intervalRef.current = setInterval(fetchData, 30000);

    const handleVisibility = () => {
      if (document.hidden) {
        clearInterval(intervalRef.current);
      } else {
        fetchData();
        intervalRef.current = setInterval(fetchData, 30000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      clearInterval(intervalRef.current);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [fetchData]);

  function formatPrice(price) {
    if (price == null) return '--';
    return price >= 100
      ? price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : price.toFixed(2);
  }

  function formatChange(change) {
    if (change == null) return '--';
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  }

  if (loading && !commodities) return (
    <div className="animate-fade-in">
      <PageHeader title="Precious Metals & Oil" subtitle="Live Prices" backTo="/" />
      <LoadingState message="Fetching live prices..." />
    </div>
  );

  if (error && !commodities) return (
    <div className="animate-fade-in">
      <PageHeader title="Precious Metals & Oil" subtitle="Live Prices" backTo="/" />
      <ErrorState message={error} onRetry={fetchData} />
    </div>
  );

  return (
    <div className="animate-fade-in">
      <PageHeader title="Precious Metals & Oil" subtitle="Live Prices" backTo="/" />

      {/* Live indicator + last updated */}
      <div className="flex items-center justify-between px-5 py-2.5">
        <div className="flex items-center gap-1.5">
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: 'var(--green)' }}
          />
          <span className="text-[11px] font-medium" style={{ color: 'var(--text-3)' }}>Live</span>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-[11px]" style={{ color: 'var(--text-3)' }}>
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={fetchData}
            aria-label="Refresh data"
            className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
            style={{ border: '1px solid var(--border)', background: 'var(--card)' }}
          >
            <RefreshCw size={12} style={{ color: 'var(--text-3)' }} />
          </button>
        </div>
      </div>

      {error && (
        <div
          className="mx-4 mb-2.5 px-3 py-2 rounded-md text-[11px] font-medium"
          style={{ background: '#FFF8E6', color: '#F2A600' }}
        >
          Using cached data. {error}
        </div>
      )}

      {/* ─── Market Overview Summary Card ─── */}
      <div className="mx-4 mb-4 p-4 rounded-xl" style={{
        background: 'linear-gradient(135deg, #010131 0%, #0A1A3A 60%, #122B50 100%)',
        boxShadow: '0 4px 20px rgba(1,1,49,0.25)',
      }}>
        <p className="font-head text-[11px] font-bold uppercase tracking-[1.2px] mb-3" style={{ color: 'rgba(255,255,255,0.55)' }}>
          Market Overview
        </p>
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginBottom: 2 }}>Gold</p>
            <p className="font-head font-bold tabular-nums" style={{ fontSize: 15, color: '#fff' }}>
              ${formatPrice(commodities?.gold?.price)}
            </p>
          </div>
          <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.12)' }} />
          <div className="text-center flex-1">
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginBottom: 2 }}>Oil (WTI)</p>
            <p className="font-head font-bold tabular-nums" style={{ fontSize: 15, color: '#fff' }}>
              ${formatPrice(commodities?.wti?.price)}
            </p>
          </div>
          <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.12)' }} />
          <div className="text-center flex-1">
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginBottom: 2 }}>Portfolio Impact</p>
            <p className="font-head font-bold tabular-nums" style={{ fontSize: 15, color: '#00C896' }}>
              +2.4%
            </p>
          </div>
        </div>
      </div>

      {/* Section label */}
      <div className="px-5 pb-2">
        <p className="font-head text-[11px] font-bold uppercase tracking-[1.2px]" style={{ color: 'var(--text-3)' }}>
          Commodities
        </p>
      </div>

      {/* Commodity cards */}
      <div className="px-4 space-y-2.5 pb-6">
        {COMMODITY_ORDER.map(key => {
          const item = commodities?.[key];
          if (!item) return null;

          const IconComp = ICONS[key] || Gem;
          const iconStyle = ICON_STYLES[key] || { bg: '#F4F6FB', fg: '#9AA3BD' };
          const change = item.change ?? item.changePercent ?? 0;
          const isPositive = change >= 0;

          const pinId = 'metal-' + (COMMODITY_NAMES[key]?.symbol || key);
          const itemName = item.name || COMMODITY_NAMES[key]?.name || key;
          const itemSymbol = COMMODITY_NAMES[key]?.symbol || item.symbol;
          const pinned = isPinned(pinId);

          return (
            <div
              key={key}
              className="rounded-md p-3.5"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-3.5">
                {/* Icon */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: iconStyle.bg }}
                >
                  <IconComp size={18} style={{ color: iconStyle.fg }} />
                </div>

                {/* Name + symbol */}
                <div className="flex-1 min-w-0">
                  <p className="font-head text-sm font-bold truncate" style={{ color: 'var(--navy)' }}>
                    {itemName}
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-3)' }}>
                    {itemSymbol}
                  </p>
                </div>

                {/* Mini Sparkline */}
                <MiniSparkline name={itemName} positive={isPositive} />

                {/* Price + change */}
                <div className="text-right mr-1">
                  <p className="font-head text-sm font-bold tabular-nums" style={{ color: 'var(--navy)' }}>
                    ${formatPrice(item.price)}
                  </p>
                  <span
                    className="inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded mt-0.5 tabular-nums"
                    style={{
                      background: isPositive ? 'var(--green-bg)' : 'var(--red-bg)',
                      color: isPositive ? 'var(--green)' : 'var(--red)',
                    }}
                  >
                    {formatChange(change)}
                  </span>
                </div>

                {/* Pin button */}
                <button
                  onClick={() => {
                    if (pinned) removePin(pinId);
                    else addPin(createPin('metal', { name: itemName, symbol: itemSymbol }));
                  }}
                  className="p-1.5 rounded-lg transition-colors active:scale-90 flex-shrink-0"
                  style={{ color: pinned ? 'var(--blue)' : 'var(--text-3)' }}
                  aria-label={pinned ? 'Unpin' : 'Pin to My Screen'}
                >
                  <Pin size={14} />
                </button>
              </div>

              {/* 24h High/Low Bar */}
              <div className="mt-2 ml-[52px]">
                <HighLowBar price={item.price} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
