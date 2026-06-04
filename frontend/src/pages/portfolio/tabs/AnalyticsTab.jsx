import { Plus, ShieldCheck, TrendingDown, BarChart3, Wallet } from 'lucide-react';
import { formatCurrency } from '../hooks/formatters';

const card = {
  background: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--r-md)',
};

const sectionLabel = {
  fontFamily: 'var(--font-head)',
  fontSize: 11,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '1.2px',
  color: 'var(--text-3)',
  margin: '0 0 8px',
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
      <p style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 16 }}>Add holdings to see analytics.</p>
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

export default function AnalyticsTab({
  holdings, totalValue, allocationByType, onAdd, addLabel = 'Add Holding',
}) {
  if (holdings.length === 0) {
    return <EmptyState onAdd={onAdd} label={addLabel} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Risk metrics */}
      <p style={sectionLabel}>Risk Metrics</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        <div style={{ ...card, padding: 12, textAlign: 'center' }}>
          <ShieldCheck size={14} style={{ margin: '0 auto 4px', color: 'var(--green)' }} />
          <p style={{ fontSize: 10, color: 'var(--text-3)', margin: '0 0 2px' }}>Sharpe Ratio</p>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)', margin: 0, fontFamily: 'var(--font-head)' }}>1.24</p>
        </div>
        <div style={{ ...card, padding: 12, textAlign: 'center' }}>
          <TrendingDown size={14} style={{ margin: '0 auto 4px', color: 'var(--red)' }} />
          <p style={{ fontSize: 10, color: 'var(--text-3)', margin: '0 0 2px' }}>Max Drawdown</p>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--red)', margin: 0, fontFamily: 'var(--font-head)' }}>-8.3%</p>
        </div>
        <div style={{ ...card, padding: 12, textAlign: 'center' }}>
          <BarChart3 size={14} style={{ margin: '0 auto 4px', color: '#7C3AED' }} />
          <p style={{ fontSize: 10, color: 'var(--text-3)', margin: '0 0 2px' }}>Volatility</p>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)', margin: 0, fontFamily: 'var(--font-head)' }}>12.5%</p>
        </div>
      </div>
      <p style={{ fontSize: 10, color: 'var(--text-3)', fontStyle: 'italic', marginTop: 4 }}>* Estimated values based on sample data</p>

      {/* Allocation bars */}
      <p style={sectionLabel}>Allocation by Asset Class</p>
      <div style={{ ...card, padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {Object.entries(allocationByType).map(([type, value]) => {
          const pct = totalValue > 0 ? ((value / totalValue) * 100) : 0;
          return (
            <div key={type}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--navy)', textTransform: 'capitalize', fontFamily: 'var(--font-body)' }}>{type}</span>
                <span style={{ fontSize: 10, color: 'var(--text-3)', fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(value)} ({pct.toFixed(1)}%)</span>
              </div>
              <div style={{ height: 8, background: 'var(--bg)', borderRadius: 20, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  background: 'var(--blue)',
                  borderRadius: 20,
                  transition: 'width 0.3s',
                  width: `${pct}%`,
                }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Zakat calculator */}
      <p style={sectionLabel}>Zakat Estimate (2.5%)</p>
      <div style={{ ...card, padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, color: 'var(--text-2)', fontFamily: 'var(--font-body)' }}>Annual Zakat Due</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)', fontVariantNumeric: 'tabular-nums', fontFamily: 'var(--font-head)' }}>
          {formatCurrency(totalValue * 0.025)}
        </span>
      </div>
    </div>
  );
}
