import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, BriefcaseBusiness, Trash2, X, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';

const STORAGE_KEY = 'vifm-multi-portfolios';

function loadPortfolios() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }

  // Seed with default portfolio from existing data
  const existingHoldings = (() => {
    try { return JSON.parse(localStorage.getItem('vifm-portfolio')) || []; }
    catch { return []; }
  })();

  const defaults = [{
    id: 'default',
    name: 'My Portfolio',
    description: 'Personal holdings',
    color: 'brand',
    storageKey: 'vifm-portfolio',
    createdAt: new Date().toISOString(),
  }];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
  return defaults;
}

function savePortfolios(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function formatCurrency(n) {
  if (n == null) return '--';
  return '$' + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const PORTFOLIO_COLORS = [
  { id: 'brand', label: 'Blue', gradient: 'linear-gradient(135deg, var(--navy), var(--navy-soft))' },
  { id: 'teal', label: 'Teal', gradient: 'linear-gradient(135deg, #0D9488, #14B8A6)' },
  { id: 'violet', label: 'Violet', gradient: 'linear-gradient(135deg, #6D28D9, #8B5CF6)' },
  { id: 'amber', label: 'Amber', gradient: 'linear-gradient(135deg, #D97706, #F59E0B)' },
  { id: 'coral', label: 'Coral', gradient: 'linear-gradient(135deg, #DC2626, #F87171)' },
];

const PORTFOLIO_SWATCH = {
  brand: 'linear-gradient(135deg, var(--navy), var(--navy-soft))',
  teal: 'linear-gradient(135deg, #0D9488, #14B8A6)',
  violet: 'linear-gradient(135deg, #6D28D9, #8B5CF6)',
  amber: 'linear-gradient(135deg, #D97706, #F59E0B)',
  coral: 'linear-gradient(135deg, #DC2626, #F87171)',
};

const card = {
  background: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--r-md)',
  overflow: 'hidden',
};

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

export default function MultiPortfolioPage() {
  const navigate = useNavigate();
  const [portfolios, setPortfolios] = useState(loadPortfolios);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', color: 'brand' });

  function getHoldingsForPortfolio(storageKey) {
    try { return JSON.parse(localStorage.getItem(storageKey)) || []; }
    catch { return []; }
  }

  function handleCreate(e) {
    e.preventDefault();
    const id = Date.now().toString();
    const storageKey = `vifm-portfolio-${id}`;
    const newPortfolio = {
      id,
      name: form.name,
      description: form.description,
      color: form.color,
      storageKey,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(storageKey, JSON.stringify([]));
    const updated = [...portfolios, newPortfolio];
    setPortfolios(updated);
    savePortfolios(updated);
    setShowCreate(false);
    setForm({ name: '', description: '', color: 'brand' });
  }

  function handleDelete(id) {
    if (!window.confirm('Delete this portfolio and all its holdings?')) return;
    const portfolio = portfolios.find(p => p.id === id);
    if (portfolio && portfolio.id !== 'default') {
      localStorage.removeItem(portfolio.storageKey);
      const updated = portfolios.filter(p => p.id !== id);
      setPortfolios(updated);
      savePortfolios(updated);
    }
  }

  function handleSelectPortfolio(portfolio) {
    localStorage.setItem('vifm-active-portfolio', portfolio.storageKey);
    localStorage.setItem('vifm-portfolio-mode', 'real');
    navigate('/portfolio');
  }

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <PageHeader title="Portfolios" subtitle="Manage multiple portfolios" backTo="/" />

      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Portfolio cards */}
        {portfolios.map(p => {
          const holdings = getHoldingsForPortfolio(p.storageKey);
          const totalValue = holdings.reduce((sum, h) => sum + (h.quantity * (h.currentPrice || h.costPrice)), 0);
          const totalCost = holdings.reduce((sum, h) => sum + (h.quantity * h.costPrice), 0);
          const gain = totalValue - totalCost;
          const gainPct = totalCost > 0 ? ((gain / totalCost) * 100) : 0;
          const gradient = PORTFOLIO_SWATCH[p.color] || PORTFOLIO_SWATCH.brand;

          return (
            <button
              key={p.id}
              onClick={() => handleSelectPortfolio(p)}
              style={{ ...card, width: '100%', textAlign: 'left', cursor: 'pointer', padding: 0 }}
            >
              <div style={{ padding: 16, background: gradient, color: '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, margin: 0, fontFamily: 'var(--font-head)' }}>{p.name}</p>
                    {p.description && <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 2, margin: 0 }}>{p.description}</p>}
                  </div>
                  <ChevronRight size={16} style={{ color: 'rgba(255,255,255,0.5)', marginTop: 4 }} />
                </div>
                <div style={{ marginTop: 12 }}>
                  <p style={{ fontSize: 22, fontWeight: 700, fontVariantNumeric: 'tabular-nums', margin: 0, fontFamily: 'var(--font-head)' }}>{formatCurrency(totalValue)}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                    {gain >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    <span style={{
                      fontSize: 12, fontWeight: 500,
                      color: gain >= 0 ? '#6EE7B7' : '#FCA5A5',
                    }}>
                      {gain >= 0 ? '+' : ''}{formatCurrency(gain)} ({gainPct.toFixed(2)}%)
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>{holdings.length} holdings</span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>|</span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>{new Set(holdings.map(h => h.type)).size} asset types</span>
                </div>
              </div>
              {p.id !== 'default' && (
                <div style={{ padding: '8px 16px', background: 'var(--bg)', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}
                    style={{
                      fontSize: 10, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4,
                      background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)',
                    }}
                  >
                    <Trash2 size={11} /> Remove
                  </button>
                </div>
              )}
            </button>
          );
        })}

        {/* Create new portfolio */}
        <button
          onClick={() => setShowCreate(true)}
          style={{
            ...card,
            width: '100%',
            padding: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            borderStyle: 'dashed',
            borderWidth: 2,
            borderColor: 'var(--border)',
            cursor: 'pointer',
          }}
        >
          <Plus size={16} style={{ color: 'var(--text-3)' }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', fontFamily: 'var(--font-body)' }}>Create New Portfolio</span>
        </button>

        <p style={{ fontSize: 10, color: 'var(--text-3)', textAlign: 'center' }}>
          Create separate portfolios for different clients, strategies, or asset classes.
        </p>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(1,1,49,0.4)',
            zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          }}
          onClick={() => setShowCreate(false)}
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
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)', fontFamily: 'var(--font-head)', margin: 0 }}>New Portfolio</h3>
              <button onClick={() => setShowCreate(false)} style={{ padding: 4, borderRadius: 'var(--r-sm)', border: 'none', background: 'none', cursor: 'pointer' }}>
                <X size={16} style={{ color: 'var(--text-3)' }} />
              </button>
            </div>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={labelStyle}>Portfolio Name</label>
                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Client A - Growth" required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Description (optional)</label>
                <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="e.g. Aggressive growth strategy" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Color</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {PORTFOLIO_COLORS.map(c => (
                    <button key={c.id} type="button" onClick={() => setForm(f => ({ ...f, color: c.id }))}
                      style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: c.gradient,
                        border: 'none', cursor: 'pointer',
                        outline: form.color === c.id ? '2px solid var(--blue)' : 'none',
                        outlineOffset: 2,
                      }}
                    />
                  ))}
                </div>
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
                Create Portfolio
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
