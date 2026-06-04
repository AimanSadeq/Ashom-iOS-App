import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, TrendingUp, TrendingDown, Wallet, Share2, DollarSign, Calculator, ChevronRight } from 'lucide-react';
import { Doughnut } from 'react-chartjs-2';
import { CHART_PALETTE, BASE_OPTIONS } from '../../../components/shared/ChartSetup';
import { formatCurrency } from '../hooks/formatters';
import AIInsightsCard from '../../../components/portfolio/AIInsightsCard';
import SharePerformanceModal from '../SharePerformanceModal';

const sectionLabel = {
  fontFamily: 'var(--font-head)',
  fontSize: 11,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '1.2px',
  color: 'var(--text-3)',
  margin: '0 0 8px',
};

const card = {
  background: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--r-md)',
};

function EmptyState({ onAdd, label = 'Add Holding' }) {
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

export default function OverviewTab({
  holdings, totalValue, totalCost, totalGain, totalGainPct,
  allocationByType, bestPerformer, onAdd, addLabel = 'Add Holding',
  virtualCash, isPractice, extraContent,
}) {
  const [shareOpen, setShareOpen] = useState(false);
  const navigate = useNavigate();

  if (holdings.length === 0 && !isPractice) {
    return <EmptyState onAdd={onAdd} label={addLabel} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Virtual cash card (practice mode only) */}
      {isPractice && (
        <div style={{
          borderRadius: 'var(--r-lg)',
          background: 'linear-gradient(135deg, #F59E0B, #D97706)',
          padding: 16,
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <span style={{
            position: 'absolute', top: 8, right: 8,
            fontSize: 7, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px',
            padding: '2px 8px', borderRadius: 20, background: 'rgba(255,255,255,0.2)', color: '#fff',
          }}>
            VIRTUAL
          </span>
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 4 }}>Available Cash</p>
          <p style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-head)', fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(virtualCash)}</p>
        </div>
      )}

      {/* Total value card */}
      <div style={{
        borderRadius: 'var(--r-lg)',
        background: 'linear-gradient(135deg, var(--navy), var(--navy-soft))',
        padding: 16,
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {isPractice && (
          <span style={{
            position: 'absolute', top: 8, right: 8,
            fontSize: 7, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px',
            padding: '2px 8px', borderRadius: 20, background: 'rgba(255,255,255,0.2)', color: '#fff',
          }}>
            VIRTUAL
          </span>
        )}
        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 4 }}>
          {isPractice ? 'Portfolio Value' : 'Total Portfolio Value'}
        </p>
        <p style={{ fontSize: 26, fontWeight: 700, fontFamily: 'var(--font-head)', fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(totalValue)}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
          {totalGain >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          <span style={{
            fontSize: 12, fontWeight: 500,
            color: totalGain >= 0 ? '#6EE7B7' : '#FCA5A5',
          }}>
            {totalGain >= 0 ? '+' : ''}{formatCurrency(totalGain)} ({totalGainPct.toFixed(2)}%)
          </span>
        </div>
        {isPractice && (
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
            Total: {formatCurrency((virtualCash || 0) + totalValue)}
          </p>
        )}
      </div>

      {/* Share button */}
      {holdings.length > 0 && (
        <button
          onClick={() => setShareOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '8px 0', borderRadius: 'var(--r-md)',
            background: 'var(--bg)', border: '1px solid var(--border)',
            color: 'var(--navy)', fontSize: 11, fontWeight: 600,
            fontFamily: 'var(--font-body)', cursor: 'pointer', transition: 'opacity 0.15s',
          }}
        >
          <Share2 size={12} /> Share Performance
        </button>
      )}

      {/* AI Portfolio Insights */}
      {holdings.length > 0 && <AIInsightsCard />}

      {/* Allocation donut */}
      {Object.keys(allocationByType).length > 0 && (
        <div style={{ ...card, padding: 12 }}>
          <p style={sectionLabel}>Allocation</p>
          <div style={{ height: 200, position: 'relative' }}>
            <Doughnut
              data={{
                labels: Object.keys(allocationByType).map(t => t.charAt(0).toUpperCase() + t.slice(1)),
                datasets: [{
                  data: Object.values(allocationByType),
                  backgroundColor: CHART_PALETTE.slice(0, Object.keys(allocationByType).length),
                  borderWidth: 0,
                }],
              }}
              options={{
                responsive: true, maintainAspectRatio: false, cutout: '65%',
                plugins: { legend: { display: false }, tooltip: BASE_OPTIONS.plugins.tooltip },
              }}
            />
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
              <p style={{ fontSize: 10, color: 'var(--text-3)', margin: 0 }}>Total</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)', fontVariantNumeric: 'tabular-nums', margin: 0, fontFamily: 'var(--font-head)' }}>{formatCurrency(totalValue)}</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', marginTop: 8, justifyContent: 'center' }}>
            {Object.entries(allocationByType).map(([type, value], i) => {
              const pct = totalValue > 0 ? ((value / totalValue) * 100) : 0;
              return (
                <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: CHART_PALETTE[i % CHART_PALETTE.length], display: 'inline-block' }} />
                  <span style={{ fontSize: 10, color: 'var(--text-2)', textTransform: 'capitalize', fontFamily: 'var(--font-body)' }}>{type} {pct.toFixed(1)}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div style={{ ...card, padding: 12 }}>
          <p style={{ fontSize: 10, color: 'var(--text-3)', margin: '0 0 2px' }}>Total Cost</p>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)', fontVariantNumeric: 'tabular-nums', margin: 0, fontFamily: 'var(--font-head)' }}>{formatCurrency(totalCost)}</p>
        </div>
        <div style={{ ...card, padding: 12 }}>
          <p style={{ fontSize: 10, color: 'var(--text-3)', margin: '0 0 2px' }}>Best Performer</p>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)', margin: 0, fontFamily: 'var(--font-head)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{bestPerformer?.name || '--'}</p>
        </div>
      </div>

      {/* Extra content (achievements row, etc.) */}
      {extraContent}

      {/* Action button */}
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

      {/* Share Performance Modal */}
      <SharePerformanceModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        totalValue={totalValue}
        totalGain={totalGain}
        totalGainPct={totalGainPct}
        allocationByType={allocationByType}
      />

      {/* Related Tools */}
      <div style={{ ...sectionLabel, marginTop: 24 }}>RELATED TOOLS</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { label: 'Dividend Calendar', subtitle: 'Upcoming ex-dates', route: '/dividends', icon: DollarSign },
          { label: 'Zakat Report', subtitle: 'Wealth obligation', route: '/zakat', icon: Calculator },
          { label: 'Net Worth', subtitle: 'All assets overview', route: '/net-worth', icon: TrendingUp },
        ].map(item => (
          <button key={item.route} onClick={() => navigate(item.route)} style={{...card, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', width: '100%', border: 'none', textAlign: 'left', fontFamily: 'var(--font-body)' }}>
            <div style={{ width: 32, height: 32, borderRadius: 'var(--r-sm)', background: 'var(--blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <item.icon size={14} style={{ color: 'var(--blue)' }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)', margin: 0 }}>{item.label}</p>
              <p style={{ fontSize: 10, color: 'var(--text-3)', margin: 0 }}>{item.subtitle}</p>
            </div>
            <ChevronRight size={14} style={{ color: 'var(--text-3)' }} />
          </button>
        ))}
      </div>
    </div>
  );
}
