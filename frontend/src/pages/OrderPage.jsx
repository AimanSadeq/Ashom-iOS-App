import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ShoppingCart, Minus, Plus, ArrowUpDown, Check, X,
  TrendingUp, TrendingDown,
} from 'lucide-react';

import PageHeader from '../components/shared/PageHeader';

/* ───── Mock stock data ───── */
const STOCKS = {
  '2222.SR': { name: 'Saudi Aramco', price: 28.45, change: 1.24, currency: 'SAR' },
  '1120.SR': { name: 'Al Rajhi Bank', price: 95.20, change: -0.38, currency: 'SAR' },
  'EMAAR.AE': { name: 'Emaar Properties', price: 8.76, change: 2.11, currency: 'AED' },
  'QNBK.QA': { name: 'Qatar National Bank', price: 14.30, change: 0.67, currency: 'QAR' },
  'NBK.KW': { name: 'National Bank of Kuwait', price: 1.02, change: 0.15, currency: 'KWD' },
  '2010.SR': { name: 'SABIC', price: 72.10, change: -1.85, currency: 'SAR' },
  '7010.SR': { name: 'Saudi Telecom', price: 42.80, change: 0.92, currency: 'SAR' },
  'DIB.AE': { name: 'Dubai Islamic Bank', price: 6.22, change: -0.33, currency: 'AED' },
};

const MOCK_BALANCE = 100000;

/* ───── Order book generator ───── */
function generateOrderBook(ticker, currentPrice) {
  let hash = 0;
  for (let i = 0; i < ticker.length; i++) hash = ((hash << 5) - hash + ticker.charCodeAt(i)) | 0;

  const bids = Array.from({ length: 5 }, (_, i) => ({
    price: +(currentPrice - (i + 1) * 0.05 * (1 + (Math.abs(hash * (i + 1)) % 10) / 20)).toFixed(2),
    quantity: 100 + (Math.abs(hash * (i + 7)) % 900),
  }));
  const asks = Array.from({ length: 5 }, (_, i) => ({
    price: +(currentPrice + (i + 1) * 0.05 * (1 + (Math.abs(hash * (i + 3)) % 10) / 20)).toFixed(2),
    quantity: 100 + (Math.abs(hash * (i + 13)) % 900),
  }));
  return { bids, asks };
}

/* ───── Mini sparkline SVG ───── */
function MiniSparkline({ ticker }) {
  let hash = 0;
  for (let i = 0; i < ticker.length; i++) hash = ((hash << 5) - hash + ticker.charCodeAt(i)) | 0;

  const points = Array.from({ length: 12 }, (_, i) => {
    const seed = Math.abs(hash * (i + 1) * 9301 + 49297) % 233280;
    return (seed / 233280) * 20 + 2;
  });

  const maxY = Math.max(...points);
  const minY = Math.min(...points);
  const range = maxY - minY || 1;

  const pathData = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * 48;
      const y = 24 - ((p - minY) / range) * 20;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const isUp = points[points.length - 1] >= points[0];
  return (
    <svg width="48" height="24" viewBox="0 0 48 24" fill="none">
      <path d={pathData} stroke={isUp ? '#00C896' : '#FF4B6E'} strokeWidth="1.5" fill="none" />
    </svg>
  );
}

/* ───── Main OrderPage ───── */
export default function OrderPage() {
  const { ticker } = useParams();
  const navigate = useNavigate();

  const stock = STOCKS[ticker] || { name: ticker, price: 25.00, change: 0.00, currency: 'SAR' };

  const [side, setSide] = useState('buy'); // 'buy' | 'sell'
  const [orderType, setOrderType] = useState('market'); // 'market' | 'limit' | 'stop'
  const [quantity, setQuantity] = useState(10);
  const [limitPrice, setLimitPrice] = useState(stock.price.toFixed(2));
  const [showConfirmation, setShowConfirmation] = useState(false);

  const effectivePrice = orderType === 'market' ? stock.price : parseFloat(limitPrice) || stock.price;
  const estimatedCost = quantity * effectivePrice;
  const isPositive = stock.change >= 0;

  const orderBook = useMemo(() => generateOrderBook(ticker, stock.price), [ticker, stock.price]);
  const maxBookQty = useMemo(
    () => Math.max(...orderBook.bids.map(b => b.quantity), ...orderBook.asks.map(a => a.quantity)),
    [orderBook],
  );

  function handlePlaceOrder() {
    // Save to localStorage
    const history = JSON.parse(localStorage.getItem('vifm-order-history') || '[]');
    history.unshift({
      id: Date.now(),
      ticker,
      name: stock.name,
      side,
      orderType,
      quantity,
      price: effectivePrice,
      currency: stock.currency,
      total: estimatedCost,
      timestamp: new Date().toISOString(),
      status: 'filled',
    });
    localStorage.setItem('vifm-order-history', JSON.stringify(history));
    setShowConfirmation(true);
  }

  const isBuy = side === 'buy';
  const accentColor = isBuy ? '#00C896' : '#FF4B6E';
  const accentBg = isBuy ? 'rgba(0,200,150,0.08)' : 'rgba(255,75,110,0.08)';

  return (
    <div className="animate-fade-in" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <PageHeader title="Trade" subtitle={ticker} backTo={-1} />

      <div className="px-4 pt-4 space-y-4 pb-8">
        {/* ── Stock Header ── */}
        <div
          className="p-4 rounded-lg flex items-center justify-between"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-base font-bold font-head truncate" style={{ color: 'var(--navy)' }}>
                {stock.name}
              </h2>
              <span
                className="px-2 py-0.5 rounded text-[10px] font-semibold font-body shrink-0"
                style={{ background: 'var(--blue-light)', color: 'var(--blue)' }}
              >
                {ticker}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold font-head" style={{ color: 'var(--navy)' }}>
                {stock.price.toFixed(2)}
              </span>
              <span
                className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold font-body"
                style={{
                  background: isPositive ? 'rgba(0,200,150,0.1)' : 'rgba(255,75,110,0.1)',
                  color: isPositive ? '#00C896' : '#FF4B6E',
                }}
              >
                {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {isPositive ? '+' : ''}{stock.change.toFixed(2)}%
              </span>
            </div>
            <p className="text-[10px] font-body mt-0.5" style={{ color: 'var(--text-3)' }}>{stock.currency}</p>
          </div>
          <MiniSparkline ticker={ticker} />
        </div>

        {/* ── Buy / Sell Toggle ── */}
        <div
          className="flex rounded-lg overflow-hidden"
          style={{ border: '1px solid var(--border)' }}
        >
          {['buy', 'sell'].map(s => (
            <button
              key={s}
              onClick={() => setSide(s)}
              className="flex-1 py-2.5 text-sm font-bold font-head transition-all duration-200"
              style={{
                background: side === s
                  ? (s === 'buy' ? '#00C896' : '#FF4B6E')
                  : 'var(--card)',
                color: side === s ? '#fff' : 'var(--text-2)',
              }}
            >
              {s === 'buy' ? 'Buy' : 'Sell'}
            </button>
          ))}
        </div>

        {/* ── Order Type Selector ── */}
        <div className="flex gap-2">
          {[
            { key: 'market', label: 'Market' },
            { key: 'limit', label: 'Limit' },
            { key: 'stop', label: 'Stop Loss' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setOrderType(t.key)}
              className="px-3 py-1.5 rounded-full text-[11px] font-semibold font-body transition-colors"
              style={{
                background: orderType === t.key ? 'var(--navy)' : 'var(--card)',
                color: orderType === t.key ? '#fff' : 'var(--text-2)',
                border: orderType === t.key ? 'none' : '1px solid var(--border)',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Order Form ── */}
        <div
          className="p-4 rounded-lg space-y-4"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          {/* Limit / Stop price input */}
          {orderType !== 'market' && (
            <div>
              <label className="text-[10px] font-body font-semibold block mb-1" style={{ color: 'var(--text-3)' }}>
                {orderType === 'limit' ? 'Limit Price' : 'Stop Price'} ({stock.currency})
              </label>
              <input
                type="number"
                step="0.01"
                value={limitPrice}
                onChange={e => setLimitPrice(e.target.value)}
                className="w-full px-3 py-2 rounded-md text-sm font-body font-semibold"
                style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  color: 'var(--navy)',
                  outline: 'none',
                }}
              />
            </div>
          )}

          {/* Quantity */}
          <div>
            <label className="text-[10px] font-body font-semibold block mb-1" style={{ color: 'var(--text-3)' }}>
              Quantity (Shares)
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-9 h-9 rounded-md flex items-center justify-center active:scale-90 transition-transform"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
              >
                <Minus size={14} style={{ color: 'var(--text-2)' }} />
              </button>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="flex-1 px-3 py-2 rounded-md text-center text-sm font-body font-bold"
                style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  color: 'var(--navy)',
                  outline: 'none',
                }}
              />
              <button
                onClick={() => setQuantity(q => q + 1)}
                className="w-9 h-9 rounded-md flex items-center justify-center active:scale-90 transition-transform"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
              >
                <Plus size={14} style={{ color: 'var(--text-2)' }} />
              </button>
            </div>
          </div>

          {/* Estimated cost */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-body" style={{ color: 'var(--text-3)' }}>Estimated Cost</span>
            <span className="text-sm font-bold font-body" style={{ color: 'var(--navy)' }}>
              {stock.currency} {estimatedCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {/* Available balance */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-body" style={{ color: 'var(--text-3)' }}>Available Balance</span>
            <span className="text-sm font-semibold font-body" style={{ color: 'var(--text-2)' }}>
              SAR {MOCK_BALANCE.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* ── Order Book ── */}
        <div
          className="p-4 rounded-lg"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <ArrowUpDown size={14} style={{ color: 'var(--blue)' }} />
            <p className="text-[11px] font-bold font-head uppercase tracking-[1.2px]" style={{ color: 'var(--text-3)' }}>
              Order Book
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Bids */}
            <div>
              <div className="flex items-center justify-between text-[9px] font-body font-semibold mb-1.5" style={{ color: 'var(--text-3)' }}>
                <span>Price</span>
                <span>Qty</span>
              </div>
              {orderBook.bids.map((b, i) => (
                <div key={i} className="relative flex items-center justify-between py-1 text-[11px] font-body">
                  <div
                    className="absolute inset-y-0 left-0 rounded-sm"
                    style={{
                      width: `${(b.quantity / maxBookQty) * 100}%`,
                      background: 'rgba(0,200,150,0.1)',
                    }}
                  />
                  <span className="relative font-semibold" style={{ color: '#00C896' }}>{b.price.toFixed(2)}</span>
                  <span className="relative" style={{ color: 'var(--text-2)' }}>{b.quantity}</span>
                </div>
              ))}
            </div>

            {/* Asks */}
            <div>
              <div className="flex items-center justify-between text-[9px] font-body font-semibold mb-1.5" style={{ color: 'var(--text-3)' }}>
                <span>Price</span>
                <span>Qty</span>
              </div>
              {orderBook.asks.map((a, i) => (
                <div key={i} className="relative flex items-center justify-between py-1 text-[11px] font-body">
                  <div
                    className="absolute inset-y-0 right-0 rounded-sm"
                    style={{
                      width: `${(a.quantity / maxBookQty) * 100}%`,
                      background: 'rgba(255,75,110,0.1)',
                    }}
                  />
                  <span className="relative font-semibold" style={{ color: '#FF4B6E' }}>{a.price.toFixed(2)}</span>
                  <span className="relative" style={{ color: 'var(--text-2)' }}>{a.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Place Order Button ── */}
        <button
          onClick={handlePlaceOrder}
          disabled={quantity < 1}
          className="w-full py-3 rounded-lg text-sm font-bold font-head transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
          style={{
            background: accentColor,
            color: '#fff',
            opacity: quantity < 1 ? 0.5 : 1,
            height: 48,
          }}
        >
          <ShoppingCart size={16} />
          {isBuy ? 'Buy' : 'Sell'} {quantity} share{quantity !== 1 ? 's' : ''}
        </button>
      </div>

      {/* ── Confirmation Modal ── */}
      {showConfirmation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-6"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
        >
          <div
            className="w-full max-w-sm rounded-xl p-6 animate-fade-in"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            {/* Close */}
            <button
              onClick={() => setShowConfirmation(false)}
              className="absolute top-3 right-3 p-1"
              style={{ color: 'var(--text-3)' }}
            >
              <X size={18} />
            </button>

            {/* Checkmark animation */}
            <div className="flex justify-center mb-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(0,200,150,0.12)' }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ background: '#00C896' }}
                >
                  <Check size={24} color="#fff" strokeWidth={3} />
                </div>
              </div>
            </div>

            <h3 className="text-center text-base font-bold font-head mb-1" style={{ color: 'var(--navy)' }}>
              Order Placed Successfully
            </h3>
            <p className="text-center text-[11px] font-body mb-4" style={{ color: 'var(--text-3)' }}>
              Your {orderType} order has been executed
            </p>

            {/* Summary */}
            <div
              className="rounded-lg p-3 space-y-2 mb-5"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
            >
              {[
                ['Stock', `${stock.name} (${ticker})`],
                ['Side', side === 'buy' ? 'Buy' : 'Sell'],
                ['Type', orderType.charAt(0).toUpperCase() + orderType.slice(1)],
                ['Quantity', `${quantity} shares`],
                ['Price', `${stock.currency} ${effectivePrice.toFixed(2)}`],
                ['Total', `${stock.currency} ${estimatedCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-[10px] font-body" style={{ color: 'var(--text-3)' }}>{label}</span>
                  <span className="text-[11px] font-bold font-body" style={{ color: 'var(--navy)' }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/portfolio')}
                className="flex-1 py-2.5 rounded-lg text-xs font-bold font-head"
                style={{ background: 'var(--navy)', color: '#fff' }}
              >
                View Portfolio
              </button>
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 py-2.5 rounded-lg text-xs font-bold font-head"
                style={{ background: 'var(--bg)', color: 'var(--navy)', border: '1px solid var(--border)' }}
              >
                Place Another
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
