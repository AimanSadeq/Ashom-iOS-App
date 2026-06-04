import { useState, useEffect, useRef, useCallback } from 'react';
import { RefreshCw, TrendingUp, TrendingDown, Pin } from 'lucide-react';

import PageHeader from '../components/shared/PageHeader';
import LoadingState from '../components/shared/LoadingState';
import ErrorState  from '../components/shared/ErrorState';
import { markets } from '../services/api';
import usePin from '../hooks/usePin';

const CRYPTO_IDS = 'bitcoin,ethereum,binancecoin,solana,cardano,ripple,polkadot,dogecoin,avalanche-2,matic-network';

const CRYPTO_META = {
  bitcoin:        { symbol: 'BTC',   icon: { bg: '#FFF8E6', fg: '#F2A600' } },
  ethereum:       { symbol: 'ETH',   icon: { bg: '#EAF2FC', fg: '#5391D5' } },
  binancecoin:    { symbol: 'BNB',   icon: { bg: '#FFF5ED', fg: '#FF8A35' } },
  solana:         { symbol: 'SOL',   icon: { bg: '#EAF2FC', fg: '#5391D5' } },
  cardano:        { symbol: 'ADA',   icon: { bg: '#E6FAF5', fg: '#00C896' } },
  ripple:         { symbol: 'XRP',   icon: { bg: '#EAF2FC', fg: '#5391D5' } },
  polkadot:       { symbol: 'DOT',   icon: { bg: '#FFF0F3', fg: '#FF4B6E' } },
  dogecoin:       { symbol: 'DOGE',  icon: { bg: '#FFF8E6', fg: '#F2A600' } },
  'avalanche-2':  { symbol: 'AVAX',  icon: { bg: '#FFF0F3', fg: '#FF4B6E' } },
  'matic-network':{ symbol: 'MATIC', icon: { bg: '#EAF2FC', fg: '#5391D5' } },
};

const CRYPTO_ORDER = CRYPTO_IDS.split(',');

export default function CryptoPage() {
  const [cryptos, setCryptos]         = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const { isPinned, addPin, removePin, createPin } = usePin();
  const intervalRef = useRef(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await markets.crypto(CRYPTO_IDS);
      const items = res?.data || res;
      setCryptos(items);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

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
    if (price >= 1000) return '$' + price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (price >= 1) return '$' + price.toFixed(2);
    return '$' + price.toFixed(4);
  }

  function formatMarketCap(mc) {
    if (mc == null) return '--';
    if (mc >= 1e12) return '$' + (mc / 1e12).toFixed(2) + 'T';
    if (mc >= 1e9)  return '$' + (mc / 1e9).toFixed(1) + 'B';
    if (mc >= 1e6)  return '$' + (mc / 1e6).toFixed(1) + 'M';
    return '$' + mc.toLocaleString();
  }

  function formatChange(change) {
    if (change == null) return '--';
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  }

  if (loading && !cryptos) return (
    <div className="animate-fade-in">
      <PageHeader title="Cryptocurrencies" subtitle="Live Prices" backTo="/" />
      <LoadingState message="Fetching crypto prices..." />
    </div>
  );

  if (error && !cryptos) return (
    <div className="animate-fade-in">
      <PageHeader title="Cryptocurrencies" subtitle="Live Prices" backTo="/" />
      <ErrorState message={error} onRetry={fetchData} />
    </div>
  );

  return (
    <div className="animate-fade-in">
      <PageHeader title="Cryptocurrencies" subtitle="Live Prices" backTo="/" />

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
          Live data unavailable. {error}
        </div>
      )}

      {/* Section label */}
      <div className="px-5 pb-2">
        <p className="font-head text-[11px] font-bold uppercase tracking-[1.2px]" style={{ color: 'var(--text-3)' }}>
          Top Cryptocurrencies
        </p>
      </div>

      {/* Crypto cards */}
      <div className="px-4 space-y-2.5 pb-6">
        {CRYPTO_ORDER.map(id => {
          const item = cryptos?.[id];
          if (!item) return null;

          const meta = CRYPTO_META[id] || { symbol: id.toUpperCase(), icon: { bg: '#F4F6FB', fg: '#9AA3BD' } };
          const change = item.change ?? item.price_change_percentage_24h ?? 0;
          const isPositive = change >= 0;

          const cryptoName = item.name || id.charAt(0).toUpperCase() + id.slice(1).replace('-', ' ');
          const pinId = 'crypto-' + meta.symbol;
          const pinned = isPinned(pinId);

          return (
            <div
              key={id}
              className="rounded-md p-3.5"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-3.5">
                {/* Symbol badge */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: meta.icon.bg }}
                >
                  <span className="text-xs font-bold" style={{ color: meta.icon.fg }}>
                    {meta.symbol.slice(0, 3)}
                  </span>
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p className="font-head text-sm font-bold truncate" style={{ color: 'var(--navy)' }}>
                    {cryptoName}
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-3)' }}>
                    {meta.symbol}
                  </p>
                </div>

                {/* Price + change */}
                <div className="text-right mr-1">
                  <p className="font-head text-sm font-bold tabular-nums" style={{ color: 'var(--navy)' }}>
                    {formatPrice(item.price ?? item.current_price)}
                  </p>
                  <span
                    className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded mt-0.5 tabular-nums"
                    style={{
                      background: isPositive ? 'var(--green-bg)' : 'var(--red-bg)',
                      color: isPositive ? 'var(--green)' : 'var(--red)',
                    }}
                  >
                    {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {formatChange(change)}
                  </span>
                </div>

                {/* Pin button */}
                <button
                  onClick={() => {
                    if (pinned) removePin(pinId);
                    else addPin(createPin('crypto', { name: cryptoName, symbol: meta.symbol }));
                  }}
                  className="p-1.5 rounded-lg transition-colors active:scale-90 flex-shrink-0"
                  style={{ color: pinned ? 'var(--blue)' : 'var(--text-3)' }}
                  aria-label={pinned ? 'Unpin' : 'Pin to My Screen'}
                >
                  <Pin size={14} />
                </button>
              </div>

              {/* Market cap row */}
              <div
                className="flex items-center justify-between mt-2.5 pt-2.5"
                style={{ borderTop: '1px solid var(--border)' }}
              >
                <span className="text-[11px]" style={{ color: 'var(--text-3)' }}>Market Cap</span>
                <span className="text-[11px] font-semibold tabular-nums" style={{ color: 'var(--text-2)' }}>
                  {formatMarketCap(item.marketCap ?? item.market_cap)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
