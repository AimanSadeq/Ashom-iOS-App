import { useState } from 'react';
import { Plus, Trash2, Wallet, ShoppingCart } from 'lucide-react';
import { ASSET_TYPES, TYPE_COLORS } from '../hooks/constants';
import { formatCurrency } from '../hooks/formatters';

const card = {
  background: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--r-md)',
};

// Map TYPE_COLORS tailwind to inline styles
const TYPE_STYLE_MAP = {
  stock:  { background: 'var(--blue-light)', color: 'var(--navy)' },
  metal:  { background: '#FFFBEB', color: '#D97706' },
  oil:    { background: '#F5F3FF', color: '#7C3AED' },
  crypto: { background: 'var(--green-bg)', color: 'var(--green)' },
  bond:   { background: '#ECFDF5', color: '#059669' },
  cash:   { background: 'var(--bg)', color: 'var(--text-3)' },
};

function EmptyState({ onAdd, label }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 0' }}>
      <div style={{
        width: 48, height: 48, borderRadius: 'var(--r-lg)',
        background: 'var(--blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
      }}>
        <Wallet size={20} style={{ color: 'var(--blue)' }} />
      </div>
      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--navy)', marginBottom: 4, fontFamily: 'var(--font-head)' }}>No holdings yet</p>
      <p style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 16 }}>Add your first holding to get started.</p>
      <button
        onClick={onAdd}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 16px', borderRadius: 'var(--r-md)',
          background: 'var(--navy)', color: '#fff',
          fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer',
          fontFamily: 'var(--font-body)',
        }}
      >
        <Plus size={14} /> {label}
      </button>
    </div>
  );
}

export default function HoldingsTab({
  holdings, onAdd, onDelete, onSell,
  addLabel = 'Add Holding', isPractice,
}) {
  const [typeFilter, setTypeFilter] = useState('All');

  const filteredHoldings = typeFilter === 'All'
    ? holdings
    : holdings.filter(h => (h.type || 'stock').toLowerCase() === typeFilter.toLowerCase().replace(/s$/, ''));

  const chipBase = {
    padding: '5px 12px',
    borderRadius: 20,
    fontSize: 10,
    fontWeight: 600,
    fontFamily: 'var(--font-body)',
    border: 'none',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Filter chips */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
        {ASSET_TYPES.map(t => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            style={{
              ...chipBase,
              background: typeFilter === t ? 'var(--navy)' : 'var(--card)',
              color: typeFilter === t ? '#fff' : 'var(--text-2)',
              border: typeFilter === t ? 'none' : '1px solid var(--border)',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {filteredHoldings.length === 0 ? (
        <EmptyState onAdd={onAdd} label={addLabel} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filteredHoldings.map(h => {
            const currentVal = h.quantity * (h.currentPrice || h.costPrice);
            const costVal    = h.quantity * h.costPrice;
            const gain       = currentVal - costVal;
            const gainPct    = costVal > 0 ? ((gain / costVal) * 100) : 0;
            const isUp = gain >= 0;
            const typeStyle = TYPE_STYLE_MAP[h.type] || TYPE_STYLE_MAP.cash;

            return (
              <div key={h.id} style={{ ...card, padding: 12, transition: 'box-shadow 0.2s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 'var(--r-sm)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    ...typeStyle,
                  }}>
                    <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>{(h.symbol || h.name || '?').slice(0, 3)}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--font-body)' }}>{h.name}</p>
                    <p style={{ fontSize: 10, color: 'var(--text-3)', margin: 0 }}>{h.quantity} units @ {formatCurrency(h.costPrice)}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', fontVariantNumeric: 'tabular-nums', margin: 0, fontFamily: 'var(--font-head)' }}>{formatCurrency(currentVal)}</p>
                    <span style={{
                      fontSize: 10, fontWeight: 600,
                      color: isUp ? 'var(--green)' : 'var(--red)',
                      background: isUp ? 'var(--green-bg)' : 'var(--red-bg)',
                      padding: '1px 6px',
                      borderRadius: 10,
                      display: 'inline-block',
                    }}>
                      {isUp ? '+' : ''}{gainPct.toFixed(1)}%
                    </span>
                  </div>
                  {isPractice && onSell ? (
                    <button
                      onClick={() => onSell(h)}
                      style={{ padding: 6, borderRadius: 'var(--r-sm)', border: 'none', background: 'none', cursor: 'pointer' }}
                      title="Sell"
                    >
                      <ShoppingCart size={13} style={{ color: '#F59E0B' }} />
                    </button>
                  ) : (
                    <button
                      onClick={() => onDelete(h.id)}
                      style={{ padding: 6, borderRadius: 'var(--r-sm)', border: 'none', background: 'none', cursor: 'pointer' }}
                    >
                      <Trash2 size={13} style={{ color: 'var(--text-3)' }} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button
        onClick={onAdd}
        style={{
          width: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          padding: '12px 0',
          borderRadius: 'var(--r-md)',
          background: 'var(--navy)',
          color: '#fff',
          fontSize: 13,
          fontWeight: 600,
          fontFamily: 'var(--font-body)',
          border: 'none',
          cursor: 'pointer',
          transition: 'opacity 0.2s',
        }}
      >
        <Plus size={14} /> {addLabel}
      </button>
    </div>
  );
}
