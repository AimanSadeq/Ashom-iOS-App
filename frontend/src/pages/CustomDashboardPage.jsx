import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Plus, X, GripVertical, Lock, Check,
  TrendingUp, BarChart2, PieChart, DollarSign, Shield, Zap, Building2, Users
} from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';
import useSubscription from '../hooks/useSubscription';

const STORAGE_KEY = 'vifm-custom-dashboard';

const AVAILABLE_WIDGETS = [
  { id: 'market-indices', name: 'GCC Market Indices', desc: 'Live index values for all 6 GCC markets', icon: TrendingUp, color: 'var(--green)',  bg: 'var(--green-bg)', size: 'full' },
  { id: 'sector-weights', name: 'Sector Weights', desc: 'Market cap allocation by sector', icon: PieChart, color: '#7C3AED', bg: '#F5F3FF', size: 'full' },
  { id: 'top-gainers', name: 'Top Gainers', desc: 'Companies with highest return today', icon: TrendingUp, color: 'var(--green)', bg: 'var(--green-bg)', size: 'half' },
  { id: 'top-losers', name: 'Top Losers', desc: 'Companies with largest decline today', icon: BarChart2, color: 'var(--red)', bg: 'var(--red-bg)', size: 'half' },
  { id: 'portfolio-value', name: 'Portfolio Value', desc: 'Your total portfolio value and return', icon: DollarSign, color: 'var(--blue)', bg: 'var(--blue-light)', size: 'half' },
  { id: 'watchlist-movers', name: 'Watchlist Movers', desc: 'Price changes in your watchlist', icon: Zap, color: '#D97706', bg: '#FFFBEB', size: 'half' },
  { id: 'sector-pe', name: 'Sector P/E Ratios', desc: 'Average P/E by sector', icon: BarChart2, color: 'var(--blue)', bg: 'var(--blue-light)', size: 'full' },
  { id: 'sector-roe', name: 'Sector ROE', desc: 'Average return on equity by sector', icon: Shield, color: 'var(--green)', bg: 'var(--green-bg)', size: 'full' },
  { id: 'country-mcap', name: 'Country Market Cap', desc: 'Market cap distribution by country', icon: Building2, color: '#7C3AED', bg: '#F5F3FF', size: 'full' },
  { id: 'commodity-prices', name: 'Commodity Prices', desc: 'Gold, silver, oil latest prices', icon: DollarSign, color: '#D97706', bg: '#FFFBEB', size: 'half' },
  { id: 'crypto-prices', name: 'Crypto Prices', desc: 'BTC, ETH, SOL latest prices', icon: Zap, color: 'var(--green)', bg: 'var(--green-bg)', size: 'half' },
  { id: 'gcc-stats', name: 'GCC Overview', desc: 'Total companies, sectors, market cap', icon: Users, color: 'var(--blue)', bg: 'var(--blue-light)', size: 'full' },
];

const MOCK_DATA = {
  'market-indices': [
    { name: 'TASI', value: '12,484', change: '+1.24%', up: true },
    { name: 'DFM', value: '4,521', change: '-0.38%', up: false },
    { name: 'QE', value: '10,246', change: '+0.67%', up: true },
  ],
  'portfolio-value': { value: '$132,131', change: '+2.25%', up: true },
  'commodity-prices': [
    { name: 'Gold', value: '$2,340', change: '+0.3%' },
    { name: 'Brent', value: '$82.10', change: '-0.5%' },
  ],
};

function loadDashboard() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return ['market-indices', 'portfolio-value', 'watchlist-movers', 'sector-weights'];
}

function saveDashboard(widgets) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets));
}

export default function CustomDashboardPage() {
  const navigate = useNavigate();
  const { canUseFeature, plan } = useSubscription();
  const [widgets, setWidgets] = useState(loadDashboard);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  const hasAccess = canUseFeature('customDashboards');

  if (!hasAccess) {
    return (
      <div className="animate-fade-in" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
        <PageHeader title="Custom Dashboard" subtitle="Build your view" backTo="/settings" />
        <div style={{ padding: '48px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 'var(--r-lg)',
              background: '#FFFBEB',
              border: '1px solid #FDE68A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}
          >
            <Lock size={22} style={{ color: '#D97706' }} />
          </div>
          <p style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 16, color: 'var(--text-1)', margin: '0 0 4px' }}>Enterprise Feature</p>
          <p style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center', maxWidth: 240, lineHeight: 1.5 }}>
            Custom dashboards are available on the Enterprise plan ($99.99/mo).
          </p>
        </div>
      </div>
    );
  }

  function addWidget(widgetId) {
    if (widgets.includes(widgetId)) return;
    const updated = [...widgets, widgetId];
    setWidgets(updated);
    saveDashboard(updated);
  }

  function removeWidget(widgetId) {
    const updated = widgets.filter(w => w !== widgetId);
    setWidgets(updated);
    saveDashboard(updated);
  }

  function moveWidget(index, direction) {
    const updated = [...widgets];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= updated.length) return;
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setWidgets(updated);
    saveDashboard(updated);
  }

  const activeWidgets = widgets.map(id => AVAILABLE_WIDGETS.find(w => w.id === id)).filter(Boolean);
  const inactiveWidgets = AVAILABLE_WIDGETS.filter(w => !widgets.includes(w.id));

  return (
    <div className="animate-fade-in" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <PageHeader title="Custom Dashboard" subtitle="Build your view" backTo="/" />

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Edit toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p
            style={{
              fontFamily: 'var(--font-head)',
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1.2px',
              color: 'var(--text-3)',
              margin: 0,
            }}
          >
            Your Widgets ({widgets.length})
          </p>
          <button
            onClick={() => setEditing(e => !e)}
            style={{
              fontSize: 11,
              fontWeight: 600,
              fontFamily: 'var(--font-body)',
              padding: '5px 12px',
              borderRadius: 'var(--r-sm)',
              border: editing ? 'none' : '1px solid var(--border)',
              background: editing ? 'var(--navy)' : 'var(--card)',
              color: editing ? '#fff' : 'var(--blue)',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {editing ? 'Done' : 'Edit Layout'}
          </button>
        </div>

        {/* Active widgets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {activeWidgets.map((w, i) => {
            const Icon = w.icon;
            return (
              <div
                key={w.id}
                style={{
                  background: 'var(--card)',
                  border: editing ? '2px dashed var(--blue-mid)' : '1px solid var(--border)',
                  borderRadius: 'var(--r-md)',
                  padding: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {editing && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <button
                        onClick={() => moveWidget(i, -1)}
                        disabled={i === 0}
                        style={{ border: 'none', background: 'none', cursor: i === 0 ? 'default' : 'pointer', padding: 0 }}
                      >
                        <GripVertical size={14} style={{ color: i === 0 ? 'var(--border)' : 'var(--text-3)' }} />
                      </button>
                    </div>
                  )}
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 'var(--r-sm)',
                      background: w.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={16} style={{ color: w.color }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 13, color: 'var(--text-1)', margin: 0 }}>{w.name}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-3)', margin: '1px 0 0' }}>{w.desc}</p>
                  </div>
                  {editing && (
                    <button
                      onClick={() => removeWidget(w.id)}
                      style={{
                        padding: 6,
                        borderRadius: 'var(--r-sm)',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <X size={14} style={{ color: 'var(--red)' }} />
                    </button>
                  )}
                </div>

                {/* Widget preview (when not editing) */}
                {!editing && w.id === 'market-indices' && MOCK_DATA['market-indices'] && (
                  <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)', display: 'flex', gap: 12 }}>
                    {MOCK_DATA['market-indices'].map(idx => (
                      <div key={idx.name} style={{ flex: 1, textAlign: 'center' }}>
                        <p style={{ fontSize: 10, color: 'var(--text-3)', margin: 0 }}>{idx.name}</p>
                        <p style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 12, color: 'var(--text-1)', margin: '2px 0', fontVariantNumeric: 'tabular-nums' }}>{idx.value}</p>
                        <p style={{ fontSize: 10, fontWeight: 500, color: idx.up ? 'var(--green)' : 'var(--red)', margin: 0 }}>{idx.change}</p>
                      </div>
                    ))}
                  </div>
                )}
                {!editing && w.id === 'portfolio-value' && (
                  <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 14, color: 'var(--text-1)', margin: 0, fontVariantNumeric: 'tabular-nums' }}>{MOCK_DATA['portfolio-value'].value}</p>
                    <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--green)', margin: 0 }}>{MOCK_DATA['portfolio-value'].change}</p>
                  </div>
                )}
                {!editing && w.id === 'commodity-prices' && (
                  <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)', display: 'flex', gap: 16 }}>
                    {MOCK_DATA['commodity-prices'].map(c => (
                      <div key={c.name}>
                        <p style={{ fontSize: 10, color: 'var(--text-3)', margin: 0 }}>{c.name}</p>
                        <p style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 12, color: 'var(--text-1)', margin: '2px 0', fontVariantNumeric: 'tabular-nums' }}>{c.value}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Available widgets (when editing) */}
        {editing && inactiveWidgets.length > 0 && (
          <>
            <p
              style={{
                fontFamily: 'var(--font-head)',
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1.2px',
                color: 'var(--text-3)',
                margin: '4px 0 0 4px',
              }}
            >
              Add Widgets
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {inactiveWidgets.map(w => {
                const Icon = w.icon;
                return (
                  <button
                    key={w.id}
                    onClick={() => addWidget(w.id)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      background: 'var(--card)',
                      border: '2px dashed var(--border)',
                      borderRadius: 'var(--r-md)',
                      padding: 12,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      cursor: 'pointer',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 'var(--r-sm)',
                        background: w.bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={14} style={{ color: w.color }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)', margin: 0 }}>{w.name}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-3)', margin: '1px 0 0' }}>{w.desc}</p>
                    </div>
                    <Plus size={14} style={{ color: 'var(--blue)' }} />
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
