import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ChevronRight, Star, Pin, PinOff } from 'lucide-react';

import PageHeader from '../components/shared/PageHeader';
import LoadingState from '../components/shared/LoadingState';
import ErrorState from '../components/shared/ErrorState';
import useApi from '../hooks/useApi';
import useWatchlist from '../hooks/useWatchlist';
import usePin from '../hooks/usePin';
import { companies } from '../services/api';

const SWIPE_HINT_KEY = 'vifm-swipe-hint-seen';

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

const GCC_COUNTRIES = [
  { id: 'Saudi Arabia', name: 'Saudi Arabia', code: 'SA' },
  { id: 'UAE',          name: 'UAE',          code: 'AE' },
  { id: 'Kuwait',       name: 'Kuwait',       code: 'KW' },
  { id: 'Qatar',        name: 'Qatar',        code: 'QA' },
  { id: 'Bahrain',      name: 'Bahrain',      code: 'BH' },
  { id: 'Oman',         name: 'Oman',         code: 'OM' },
];

const FLAGS = { 'Saudi Arabia': '\u{1F1F8}\u{1F1E6}', UAE: '\u{1F1E6}\u{1F1EA}', Kuwait: '\u{1F1F0}\u{1F1FC}', Qatar: '\u{1F1F6}\u{1F1E6}', Bahrain: '\u{1F1E7}\u{1F1ED}', Oman: '\u{1F1F4}\u{1F1F2}' };

const COUNTRY_GRADIENTS = {
  'Saudi Arabia': 'linear-gradient(135deg, rgba(0,200,150,0.05), rgba(255,255,255,1))',
  UAE: 'linear-gradient(135deg, rgba(83,145,213,0.05), rgba(255,255,255,1))',
  Kuwait: 'linear-gradient(135deg, rgba(0,122,61,0.05), rgba(255,255,255,1))',
  Qatar: 'linear-gradient(135deg, rgba(128,0,0,0.05), rgba(255,255,255,1))',
  Bahrain: 'linear-gradient(135deg, rgba(206,17,38,0.05), rgba(255,255,255,1))',
  Oman: 'linear-gradient(135deg, rgba(0,128,0,0.05), rgba(255,255,255,1))',
};

/* ─── Swipeable Company Row ─── */
function SwipeableCompanyRow({ company, onNavigate, isWatched, onToggleWatchlist, isPinned, onTogglePin }) {
  const touchRef = useRef({ startX: 0, startY: 0, swiping: false });
  const [offsetX, setOffsetX] = useState(0);
  const [swiped, setSwiped] = useState(false);

  const watched = isWatched(company.id);

  function handleTouchStart(e) {
    const t = e.touches[0];
    touchRef.current = { startX: t.clientX, startY: t.clientY, swiping: false };
  }

  function handleTouchMove(e) {
    const t = e.touches[0];
    const dx = touchRef.current.startX - t.clientX;
    const dy = Math.abs(t.clientY - touchRef.current.startY);

    // If vertical scroll dominates, ignore
    if (!touchRef.current.swiping && dy > 15) {
      touchRef.current.startX = -9999; // cancel
      return;
    }

    if (dx > 10) {
      touchRef.current.swiping = true;
      const clamped = Math.min(Math.max(dx, 0), 80);
      setOffsetX(-clamped);
    } else if (dx < -10 && swiped) {
      // Swiping right to close
      const clamped = Math.min(Math.max(-dx, 0), 80);
      setOffsetX(-(80 - clamped));
    }
  }

  function handleTouchEnd() {
    if (touchRef.current.swiping) {
      if (offsetX < -40) {
        setOffsetX(-80);
        setSwiped(true);
      } else {
        setOffsetX(0);
        setSwiped(false);
      }
    }
  }

  function handleClick() {
    if (touchRef.current.swiping) return;
    onNavigate(company.id);
  }

  function handleWatchlistClick(e) {
    e.stopPropagation();
    onToggleWatchlist(company);
    // Close swipe after action
    setTimeout(() => {
      setOffsetX(0);
      setSwiped(false);
    }, 300);
  }

  return (
    <div className="relative overflow-hidden rounded-md" style={{ border: '1px solid var(--border)' }}>
      {/* Watchlist action panel behind the row */}
      <div
        className="absolute right-0 top-0 bottom-0 flex items-center justify-center"
        style={{
          width: 80,
          background: watched ? 'var(--text-3)' : '#F2A600',
        }}
      >
        <button
          onClick={handleWatchlistClick}
          className="flex flex-col items-center gap-1"
          style={{ color: '#fff', border: 'none', background: 'none', cursor: 'pointer' }}
        >
          <Star size={18} fill={watched ? '#fff' : 'none'} />
          <span style={{ fontSize: 9, fontWeight: 600, fontFamily: 'var(--font-body)' }}>
            {watched ? 'Remove' : 'Watchlist'}
          </span>
        </button>
      </div>

      {/* Slideable row */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
        className="w-full text-left p-3 flex items-center gap-3 transition-transform duration-200"
        style={{
          background: 'var(--card)',
          transform: `translateX(${offsetX}px)`,
          cursor: 'pointer',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div
          className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
          style={{ background: 'var(--blue-light)' }}
        >
          <Building2 size={16} style={{ color: 'var(--blue)' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold font-body truncate" style={{ color: 'var(--navy)' }}>{company.name}</p>
          <div className="flex items-center gap-2 text-[10px] font-body" style={{ color: 'var(--text-2)' }}>
            <span className="font-mono">{company.ticker || company.symbol || '--'}</span>
            <span className="w-px h-3" style={{ background: 'var(--border)' }} />
            <span className="truncate">{company.sector || company.industry || '--'}</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[10px] font-body" style={{ color: 'var(--text-2)' }}>
            {company.market_cap ? (company.market_cap >= 1e9 ? '$' + (company.market_cap / 1e9).toFixed(0) + 'B' : '$' + (company.market_cap / 1e6).toFixed(0) + 'M') : '--'}
          </p>
        </div>
        <MiniSparkline name={company.name || ''} positive={company.change != null ? company.change >= 0 : (company.name || '').length % 2 === 0} />
        <button
          onClick={(e) => { e.stopPropagation(); onTogglePin(company); }}
          className="p-1 rounded-full transition-all active:scale-90 shrink-0"
          style={{ background: isPinned ? 'var(--blue-light)' : 'transparent' }}
          aria-label={isPinned ? 'Unpin' : 'Pin to My Screen'}
        >
          {isPinned
            ? <PinOff size={12} style={{ color: 'var(--blue)' }} />
            : <Pin size={12} style={{ color: 'var(--text-3)' }} />}
        </button>
        <ChevronRight size={14} style={{ color: 'var(--text-3)' }} className="shrink-0" />
      </div>
    </div>
  );
}

export default function CompaniesPage() {
  const navigate = useNavigate();
  const [selectedCountry, setSelectedCountry] = useState(null);
  const { isWatched, toggleWatchlist } = useWatchlist();
  const { pins, addPin, removePin, isPinned, createPin } = usePin();
  const [showSwipeHint, setShowSwipeHint] = useState(() => !localStorage.getItem(SWIPE_HINT_KEY));

  function handleTogglePin(company) {
    const pinId = 'company-' + company.id;
    if (isPinned(pinId)) {
      removePin(pinId);
    } else {
      addPin(createPin('company', { companyId: company.id, name: company.name, ticker: company.symbol || company.ticker, sector: company.sector }));
    }
  }

  useEffect(() => {
    if (showSwipeHint) {
      const timer = setTimeout(() => {
        setShowSwipeHint(false);
        localStorage.setItem(SWIPE_HINT_KEY, '1');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showSwipeHint]);

  // Fetch coverage stats for country cards
  const { data: coverage } = useApi(() => companies.coverage(), []);

  // Fetch filtered company list
  const fetchList = useCallback(
    () => {
      const params = {};
      if (selectedCountry) params.country = selectedCountry;
      return companies.list(params);
    },
    [selectedCountry]
  );
  const { data: listData, loading, error, refetch } = useApi(fetchList, [selectedCountry]);

  const companyList = Array.isArray(listData) ? listData : listData?.companies || listData?.data || [];

  // Build country counts from coverage data
  const countryCounts = {};
  if (coverage) {
    const stats = coverage.by_country || coverage.countries || coverage.data || [];
    if (Array.isArray(stats)) {
      stats.forEach(s => {
        const id = s.country || s.id;
        countryCounts[id] = s.count || s.companies || 0;
      });
    } else if (typeof stats === 'object') {
      Object.assign(countryCounts, stats);
    }
  }

  function handleCountryClick(countryId) {
    setSelectedCountry(prev => (prev === countryId ? null : countryId));
  }

  return (
    <div className="animate-fade-in" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <PageHeader title="Listed Companies" subtitle="Browse GCC Markets" backTo="/" />

      {/* Country grid */}
      <div className="px-4 pt-5 pb-3">
        <p
          className="font-head text-[11px] font-bold uppercase tracking-[1.2px] mb-3"
          style={{ color: 'var(--text-3)' }}
        >
          Markets
        </p>
        <div className="grid grid-cols-3 gap-2.5">
          {GCC_COUNTRIES.map(c => {
            const isActive = selectedCountry === c.id;
            return (
              <button
                key={c.id}
                onClick={() => handleCountryClick(c.id)}
                className="rounded-md p-3 text-center transition-all duration-150 active:scale-[0.97]"
                style={{
                  background: isActive ? 'var(--navy)' : COUNTRY_GRADIENTS[c.id] || 'var(--card)',
                  border: `1px solid ${isActive ? 'var(--navy)' : 'var(--border)'}`,
                  boxShadow: isActive ? '0 2px 8px rgba(1,1,49,0.15)' : 'none',
                }}
              >
                <span className="text-lg block mb-0.5">{FLAGS[c.id]}</span>
                <span
                  className="text-base font-bold block mb-0.5 font-head"
                  style={{ color: isActive ? '#fff' : 'var(--navy)' }}
                >
                  {c.code}
                </span>
                <p
                  className="text-[10px] font-semibold leading-tight font-body"
                  style={{ color: isActive ? 'rgba(255,255,255,0.85)' : 'var(--text-1)' }}
                >
                  {c.name}
                </p>
                <p
                  className="text-[10px] mt-0.5 font-body"
                  style={{ color: isActive ? 'rgba(255,255,255,0.5)' : 'var(--text-3)' }}
                >
                  {countryCounts[c.id] ?? '--'} companies
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active filter chip */}
      {selectedCountry && (
        <div className="px-4 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-body" style={{ color: 'var(--text-3)' }}>Filtered:</span>
            <span
              className="px-2 py-0.5 rounded-md text-[10px] font-semibold font-body"
              style={{ background: 'var(--blue-light)', color: 'var(--navy)' }}
            >
              {GCC_COUNTRIES.find(c => c.id === selectedCountry)?.name}
            </span>
            <button
              onClick={() => setSelectedCountry(null)}
              className="text-[10px] font-semibold font-body hover:opacity-80 transition-opacity"
              style={{ color: 'var(--blue)' }}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Company list */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between mb-2.5">
          <p
            className="font-head text-[11px] font-bold uppercase tracking-[1.2px]"
            style={{ color: 'var(--text-3)' }}
          >
            {selectedCountry
              ? GCC_COUNTRIES.find(c => c.id === selectedCountry)?.name
              : 'All Companies'}
          </p>
          <span className="text-[10px] font-body" style={{ color: 'var(--text-3)' }}>{companyList.length} results</span>
        </div>

        {loading && <LoadingState message="Loading companies..." />}
        {error && <ErrorState message={error} onRetry={refetch} />}

        {!loading && !error && companyList.length === 0 && (
          <div className="text-center py-12">
            <Building2 size={24} className="mx-auto mb-2" style={{ color: 'var(--text-3)' }} />
            <p className="text-xs font-body" style={{ color: 'var(--text-3)' }}>No companies found</p>
          </div>
        )}

        {!loading && !error && companyList.length > 0 && (
          <div className="space-y-2">
            {/* Swipe hint - shown once */}
            {showSwipeHint && (
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-md mb-1"
                style={{ background: 'var(--blue-light)', border: '1px solid var(--border)' }}
              >
                <Star size={12} style={{ color: '#F2A600' }} />
                <p className="text-[11px] font-body" style={{ color: 'var(--navy)' }}>
                  Swipe left on any company to add to watchlist
                </p>
                <button
                  onClick={() => { setShowSwipeHint(false); localStorage.setItem(SWIPE_HINT_KEY, '1'); }}
                  style={{ marginLeft: 'auto', color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, lineHeight: 1 }}
                >
                  &times;
                </button>
              </div>
            )}
            {companyList.map(c => (
              <SwipeableCompanyRow
                key={c.id}
                company={c}
                onNavigate={(id) => navigate(`/companies/${id}`)}
                isWatched={isWatched}
                onToggleWatchlist={toggleWatchlist}
                isPinned={isPinned('company-' + c.id)}
                onTogglePin={handleTogglePin}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
