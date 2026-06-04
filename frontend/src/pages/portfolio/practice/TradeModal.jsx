import { useState, useMemo } from 'react';
import { X, Search, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { TRADEABLE_ASSETS } from './practiceData';
import { TYPE_COLORS } from '../hooks/constants';
import { formatCurrency } from '../hooks/formatters';

const TYPE_STYLE_MAP = {
  stock:  { background: 'var(--blue-light)', color: 'var(--navy)' },
  metal:  { background: '#FFFBEB', color: '#D97706' },
  oil:    { background: '#F5F3FF', color: '#7C3AED' },
  crypto: { background: 'var(--green-bg)', color: 'var(--green)' },
  bond:   { background: '#ECFDF5', color: '#059669' },
  cash:   { background: 'var(--bg)', color: 'var(--text-3)' },
};

const card = {
  background: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--r-md)',
};

export default function TradeModal({ onClose, onBuy, onSell, virtualCash, holdings, livePrices }) {
  const [tradeType, setTradeType] = useState('buy');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [quantity, setQuantity] = useState('');

  const filteredAssets = useMemo(() => {
    if (tradeType === 'sell') {
      return holdings.filter(h =>
        !search || h.name.toLowerCase().includes(search.toLowerCase()) || h.symbol.toLowerCase().includes(search.toLowerCase())
      );
    }
    return TRADEABLE_ASSETS.filter(a =>
      !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.symbol.toLowerCase().includes(search.toLowerCase())
    );
  }, [tradeType, search, holdings]);

  // Get live price for selected asset
  const currentPrice = useMemo(() => {
    if (!selected) return 0;
    const sym = (selected.symbol || '').toLowerCase();
    const SYMBOL_MAP = {
      'xau': 'gold', 'xag': 'silver', 'bz': 'brent', 'cl': 'wti',
      'btc': 'bitcoin', 'eth': 'ethereum', 'sol': 'solana', 'xrp': 'ripple',
    };
    const mapped = SYMBOL_MAP[sym];
    if (livePrices && (mapped && livePrices[mapped])) return livePrices[mapped];
    if (livePrices && livePrices[sym]) return livePrices[sym];
    return selected.currentPrice || selected.price || selected.costPrice || 0;
  }, [selected, livePrices]);

  const qty = parseFloat(quantity) || 0;
  const estimatedTotal = qty * currentPrice;
  const canExecute = selected && qty > 0 && (
    tradeType === 'buy' ? estimatedTotal <= virtualCash : qty <= selected.quantity
  );

  function handleExecute() {
    if (!canExecute) return;
    if (tradeType === 'buy') {
      onBuy(selected, qty, currentPrice);
    } else {
      onSell(selected, qty, currentPrice);
    }
    onClose();
  }

  const inputStyle = {
    width: '100%',
    fontSize: 12,
    fontFamily: 'var(--font-body)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--r-sm)',
    padding: '10px 12px',
    outline: 'none',
    color: 'var(--text-1)',
    background: 'var(--card)',
  };

  const toggleBase = {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: '8px 0',
    borderRadius: 'var(--r-sm)',
    fontSize: 12,
    fontWeight: 600,
    fontFamily: 'var(--font-body)',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(1,1,49,0.4)',
        zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--card)',
          borderRadius: 'var(--r-xl) var(--r-xl) 0 0',
          width: '100%',
          maxWidth: 430,
          padding: 20,
          animation: 'fadeIn 0.2s ease',
          maxHeight: '85vh',
          overflowY: 'auto',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)', fontFamily: 'var(--font-head)', margin: 0 }}>Execute Trade</h3>
          <button onClick={onClose} style={{ padding: 4, borderRadius: 'var(--r-sm)', border: 'none', background: 'none', cursor: 'pointer' }}>
            <X size={16} style={{ color: 'var(--text-3)' }} />
          </button>
        </div>

        {/* Buy / Sell toggle */}
        <div style={{
          display: 'flex', gap: 4, marginBottom: 12,
          background: 'var(--bg)', borderRadius: 'var(--r-md)', padding: 3,
        }}>
          <button
            onClick={() => { setTradeType('buy'); setSelected(null); setQuantity(''); }}
            style={{
              ...toggleBase,
              background: tradeType === 'buy' ? 'var(--green)' : 'transparent',
              color: tradeType === 'buy' ? '#fff' : 'var(--text-2)',
              boxShadow: tradeType === 'buy' ? '0 1px 4px rgba(0,200,150,0.3)' : 'none',
            }}
          >
            <ArrowDownCircle size={14} /> Buy
          </button>
          <button
            onClick={() => { setTradeType('sell'); setSelected(null); setQuantity(''); }}
            style={{
              ...toggleBase,
              background: tradeType === 'sell' ? 'var(--red)' : 'transparent',
              color: tradeType === 'sell' ? '#fff' : 'var(--text-2)',
              boxShadow: tradeType === 'sell' ? '0 1px 4px rgba(255,75,110,0.3)' : 'none',
            }}
          >
            <ArrowUpCircle size={14} /> Sell
          </button>
        </div>

        {/* Available cash */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, padding: '0 4px' }}>
          <span style={{ fontSize: 10, color: 'var(--text-3)' }}>Available Cash</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--navy)', fontVariantNumeric: 'tabular-nums', fontFamily: 'var(--font-head)' }}>{formatCurrency(virtualCash)}</span>
        </div>

        {/* Asset search */}
        {!selected ? (
          <>
            <div style={{ position: 'relative', marginBottom: 8 }}>
              <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
              <input
                type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder={tradeType === 'buy' ? 'Search assets to buy...' : 'Search your holdings...'}
                style={{ ...inputStyle, paddingLeft: 36 }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 240, overflowY: 'auto' }}>
              {filteredAssets.map((a, i) => {
                const typeStyle = TYPE_STYLE_MAP[a.type] || TYPE_STYLE_MAP.cash;
                return (
                  <button
                    key={a.symbol + i}
                    onClick={() => setSelected(a)}
                    style={{
                      ...card,
                      padding: 10,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      textAlign: 'left',
                      cursor: 'pointer',
                      width: '100%',
                    }}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: 'var(--r-sm)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      ...typeStyle,
                    }}>
                      <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>{(a.symbol || '').slice(0, 3)}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--navy)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</p>
                      <p style={{ fontSize: 10, color: 'var(--text-3)', margin: 0 }}>{a.symbol}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--navy)', fontVariantNumeric: 'tabular-nums', margin: 0, fontFamily: 'var(--font-head)' }}>{formatCurrency(a.currentPrice || a.price || a.costPrice)}</p>
                      {tradeType === 'sell' && <p style={{ fontSize: 10, color: 'var(--text-3)', margin: 0 }}>{a.quantity} units</p>}
                    </div>
                  </button>
                );
              })}
              {filteredAssets.length === 0 && (
                <p style={{ fontSize: 10, color: 'var(--text-3)', textAlign: 'center', padding: '16px 0' }}>
                  {tradeType === 'sell' ? 'No holdings to sell' : 'No matching assets'}
                </p>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Selected asset */}
            <div style={{ ...card, padding: 12, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 'var(--r-sm)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                ...(TYPE_STYLE_MAP[selected.type] || TYPE_STYLE_MAP.cash),
              }}>
                <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>{(selected.symbol || '').slice(0, 3)}</span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--navy)', margin: 0, fontFamily: 'var(--font-head)' }}>{selected.name}</p>
                <p style={{ fontSize: 10, color: 'var(--text-3)', margin: 0 }}>{selected.symbol}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--navy)', fontVariantNumeric: 'tabular-nums', margin: 0, fontFamily: 'var(--font-head)' }}>{formatCurrency(currentPrice)}</p>
                <p style={{ fontSize: 10, color: 'var(--text-3)', margin: 0 }}>per unit</p>
              </div>
              <button onClick={() => setSelected(null)} style={{
                fontSize: 10, fontWeight: 600, color: 'var(--blue)',
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-body)',
              }}>Change</button>
            </div>

            {/* Quantity */}
            <div style={{ marginBottom: 12 }}>
              <label style={{
                fontSize: 10, color: 'var(--text-3)', display: 'block', marginBottom: 4,
                fontFamily: 'var(--font-head)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px',
              }}>
                Quantity {tradeType === 'sell' && selected.quantity ? `(max: ${selected.quantity})` : ''}
              </label>
              <input
                type="number" step="any" value={quantity} onChange={e => setQuantity(e.target.value)}
                placeholder="0" autoFocus
                style={inputStyle}
              />
            </div>

            {/* Estimated total */}
            <div style={{ ...card, padding: 12, marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 10, color: 'var(--text-3)' }}>Estimated {tradeType === 'buy' ? 'Cost' : 'Proceeds'}</span>
                <span style={{
                  fontSize: 14, fontWeight: 700, fontVariantNumeric: 'tabular-nums', fontFamily: 'var(--font-head)',
                  color: tradeType === 'buy' && estimatedTotal > virtualCash ? 'var(--red)' : 'var(--navy)',
                }}>
                  {formatCurrency(estimatedTotal)}
                </span>
              </div>
              {tradeType === 'buy' && estimatedTotal > virtualCash && (
                <p style={{ fontSize: 10, color: 'var(--red)', marginTop: 4 }}>Insufficient cash</p>
              )}
              {tradeType === 'sell' && qty > (selected.quantity || 0) && (
                <p style={{ fontSize: 10, color: 'var(--red)', marginTop: 4 }}>Exceeds available quantity</p>
              )}
            </div>

            {/* Execute button */}
            <button
              onClick={handleExecute}
              disabled={!canExecute}
              style={{
                width: '100%',
                padding: '12px 0',
                borderRadius: 'var(--r-md)',
                color: '#fff',
                fontSize: 13,
                fontWeight: 600,
                fontFamily: 'var(--font-body)',
                border: 'none',
                cursor: canExecute ? 'pointer' : 'not-allowed',
                transition: 'opacity 0.2s',
                background: canExecute
                  ? (tradeType === 'buy' ? 'var(--green)' : 'var(--red)')
                  : 'var(--border)',
              }}
            >
              {tradeType === 'buy' ? 'Buy' : 'Sell'} {selected.name}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
