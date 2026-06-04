import { useState } from 'react';
import { X } from 'lucide-react';
import { TABS, SAMPLE_HOLDINGS } from './hooks/constants';
import { STORAGE_KEYS } from './hooks/storageKeys';
import usePortfolioData from './hooks/usePortfolioData';
import useLivePrices from './hooks/useLivePrices';
import OverviewTab from './tabs/OverviewTab';
import HoldingsTab from './tabs/HoldingsTab';
import PerformanceTab from './tabs/PerformanceTab';
import AnalyticsTab from './tabs/AnalyticsTab';

export default function RealPortfolio() {
  const [tab, setTab] = useState('overview');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ type: 'stock', name: '', symbol: '', quantity: '', costPrice: '', notes: '' });

  const portfolio = usePortfolioData(STORAGE_KEYS.REAL_HOLDINGS, SAMPLE_HOLDINGS);
  useLivePrices(portfolio.holdings, portfolio.setHoldings);

  function handleAddHolding(e) {
    e.preventDefault();
    portfolio.addHolding({
      type: form.type, name: form.name, symbol: form.symbol,
      quantity: parseFloat(form.quantity) || 0,
      costPrice: parseFloat(form.costPrice) || 0,
      currentPrice: parseFloat(form.costPrice) || 0,
      notes: form.notes,
      purchaseDate: new Date().toISOString().split('T')[0],
    });
    setForm({ type: 'stock', name: '', symbol: '', quantity: '', costPrice: '', notes: '' });
    setShowModal(false);
  }

  const tabBarStyle = {
    display: 'flex',
    borderBottom: '1px solid var(--border)',
    padding: '0 16px',
  };

  const tabBtnBase = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    padding: '10px 0',
    fontSize: 10,
    fontWeight: 500,
    fontFamily: 'var(--font-body)',
    border: 'none',
    borderBottom: '2px solid transparent',
    background: 'none',
    cursor: 'pointer',
    transition: 'color 0.2s',
  };

  const inputStyle = {
    width: '100%',
    fontSize: 12,
    fontFamily: 'var(--font-body)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--r-sm)',
    padding: '8px 12px',
    outline: 'none',
    color: 'var(--text-1)',
    background: 'var(--card)',
  };

  const labelStyle = {
    fontSize: 10,
    color: 'var(--text-3)',
    display: 'block',
    marginBottom: 4,
    fontFamily: 'var(--font-head)',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '1.2px',
  };

  return (
    <>
      {/* Tabs */}
      <div style={tabBarStyle}>
        {TABS.map(t => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{
                ...tabBtnBase,
                borderBottomColor: active ? 'var(--navy)' : 'transparent',
                color: active ? 'var(--navy)' : 'var(--text-3)',
                fontWeight: active ? 700 : 500,
              }}
            >
              <Icon size={14} />
              {t.label}
            </button>
          );
        })}
      </div>

      <div style={{ padding: '12px 16px' }}>
        {tab === 'overview' && (
          <OverviewTab {...portfolio} onAdd={() => setShowModal(true)} />
        )}
        {tab === 'holdings' && (
          <HoldingsTab holdings={portfolio.holdings} onAdd={() => setShowModal(true)} onDelete={portfolio.deleteHolding} />
        )}
        {tab === 'performance' && (
          <PerformanceTab holdings={portfolio.holdings} totalValue={portfolio.totalValue} totalCost={portfolio.totalCost} totalGain={portfolio.totalGain} totalGainPct={portfolio.totalGainPct} />
        )}
        {tab === 'analytics' && (
          <AnalyticsTab holdings={portfolio.holdings} totalValue={portfolio.totalValue} allocationByType={portfolio.allocationByType} onAdd={() => setShowModal(true)} />
        )}
      </div>

      {/* Add Holding Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(1,1,49,0.4)',
            zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: 'var(--card)',
              borderRadius: 'var(--r-xl) var(--r-xl) 0 0',
              width: '100%',
              maxWidth: 430,
              padding: 20,
              animation: 'fadeIn 0.2s ease',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)', fontFamily: 'var(--font-head)' }}>Add Holding</h3>
              <button onClick={() => setShowModal(false)} style={{ padding: 4, borderRadius: 'var(--r-sm)', border: 'none', background: 'none', cursor: 'pointer' }}>
                <X size={16} style={{ color: 'var(--text-3)' }} />
              </button>
            </div>
            <form onSubmit={handleAddHolding} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={labelStyle}>Asset Type</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={inputStyle}>
                  <option value="stock">Stock</option><option value="metal">Metal</option><option value="oil">Oil</option>
                  <option value="crypto">Crypto</option><option value="bond">Bond</option><option value="cash">Cash</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Name</label>
                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Saudi Aramco" required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Symbol</label>
                <input type="text" value={form.symbol} onChange={e => setForm(f => ({ ...f, symbol: e.target.value }))} placeholder="e.g. 2222.SR" style={inputStyle} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <label style={labelStyle}>Quantity</label>
                  <input type="number" step="any" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} placeholder="0" required style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Cost Price ($)</label>
                  <input type="number" step="any" value={form.costPrice} onChange={e => setForm(f => ({ ...f, costPrice: e.target.value }))} placeholder="0.00" required style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Notes (optional)</label>
                <input type="text" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any notes..." style={inputStyle} />
              </div>
              <button type="submit" style={{
                width: '100%',
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
              }}>
                Add to Portfolio
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
