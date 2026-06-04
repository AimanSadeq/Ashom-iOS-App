import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Copy, Share2, Check } from 'lucide-react';
import { CHART_PALETTE } from '../../components/shared/ChartSetup';

const PERIODS = ['1M', '3M', 'YTD', '1Y'];

function fmt(n) {
  if (n == null) return '--';
  return '$' + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function SharePerformanceModal({
  open, onClose, totalValue, totalGain, totalGainPct, allocationByType,
}) {
  const [period, setPeriod] = useState('YTD');
  const [copied, setCopied] = useState(false);

  const allocationEntries = useMemo(() => {
    if (!allocationByType) return [];
    const total = Object.values(allocationByType).reduce((s, v) => s + v, 0);
    return Object.entries(allocationByType).map(([type, value]) => ({
      type, value, pct: total > 0 ? (value / total) * 100 : 0,
    }));
  }, [allocationByType]);

  const textSummary = useMemo(() => {
    const gain = totalGain >= 0 ? `+${fmt(totalGain)}` : fmt(totalGain);
    const pct = totalGain >= 0 ? `+${totalGainPct.toFixed(2)}%` : `${totalGainPct.toFixed(2)}%`;
    const alloc = allocationEntries.map(a => `${a.type}: ${a.pct.toFixed(1)}%`).join(', ');
    return [
      `My Portfolio Performance (${period})`,
      `Total Value: ${fmt(totalValue)}`,
      `Return: ${gain} (${pct})`,
      alloc ? `Allocation: ${alloc}` : '',
      '',
      'Powered by Ashom - GCC Financial Intelligence',
    ].filter(Boolean).join('\n');
  }, [totalValue, totalGain, totalGainPct, allocationEntries, period]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(textSummary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = textSummary;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'My Portfolio Performance', text: textSummary });
      } catch { /* user cancelled */ }
    } else {
      handleCopy();
    }
  }

  if (!open) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }}
      />

      {/* Bottom Sheet */}
      <div style={{
        position: 'relative', background: 'var(--card, #fff)',
        borderRadius: '20px 20px 0 0', padding: '8px 16px 24px',
        maxHeight: '85vh', overflowY: 'auto',
        animation: 'slideUp 0.3s ease-out',
      }}>
        {/* Handle bar */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border)' }} />
        </div>

        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)', fontFamily: 'var(--font-head)', margin: 0 }}>
            Share Performance
          </p>
          <button
            onClick={onClose}
            style={{
              width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--bg)', border: '1px solid var(--border)', cursor: 'pointer',
            }}
          >
            <X size={14} style={{ color: 'var(--text-3)' }} />
          </button>
        </div>

        {/* Period selector */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {PERIODS.map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                flex: 1, padding: '6px 0', borderRadius: 'var(--r-sm)', fontSize: 11, fontWeight: 600,
                fontFamily: 'var(--font-head)', cursor: 'pointer', transition: 'all 0.15s',
                border: p === period ? '1px solid var(--navy)' : '1px solid var(--border)',
                background: p === period ? 'var(--navy)' : 'var(--bg)',
                color: p === period ? '#fff' : 'var(--text-2)',
              }}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Preview Card */}
        <div style={{
          borderRadius: 'var(--r-lg)', overflow: 'hidden',
          border: '1px solid var(--border)',
          marginBottom: 16,
        }}>
          {/* Navy header */}
          <div style={{
            background: 'var(--navy)', padding: '10px 14px',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ fontSize: 16 }}>&#1571;&#1587;&#1607;&#1605;</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-head)' }}>Ashom</span>
          </div>

          {/* Content */}
          <div style={{ padding: 16, background: 'var(--card)' }}>
            <p style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 4px' }}>
              My Portfolio Performance ({period})
            </p>
            <p style={{
              fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-head)',
              color: 'var(--navy)', fontVariantNumeric: 'tabular-nums', margin: '0 0 4px',
            }}>
              {fmt(totalValue)}
            </p>
            <span style={{
              display: 'inline-block', fontSize: 11, fontWeight: 600,
              padding: '2px 8px', borderRadius: 12,
              background: totalGain >= 0 ? 'var(--green-bg, rgba(0,200,150,0.1))' : 'var(--red-bg, rgba(255,75,110,0.1))',
              color: totalGain >= 0 ? 'var(--green, #00C896)' : 'var(--red, #FF4B6E)',
            }}>
              {totalGain >= 0 ? '+' : ''}{totalGainPct.toFixed(2)}%
            </span>

            {/* Allocation bars */}
            {allocationEntries.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
                  {allocationEntries.map((a, i) => (
                    <div key={a.type} style={{
                      width: `${a.pct}%`,
                      background: CHART_PALETTE[i % CHART_PALETTE.length],
                    }} />
                  ))}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 10px' }}>
                  {allocationEntries.map((a, i) => (
                    <div key={a.type} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: CHART_PALETTE[i % CHART_PALETTE.length], display: 'inline-block' }} />
                      <span style={{ fontSize: 9, color: 'var(--text-2)', textTransform: 'capitalize' }}>{a.type} {a.pct.toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{
            padding: '8px 14px', background: 'var(--bg)',
            borderTop: '1px solid var(--border)',
          }}>
            <p style={{ fontSize: 9, color: 'var(--text-3)', margin: 0, textAlign: 'center' }}>
              Powered by Ashom &middot; GCC Financial Intelligence
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleCopy}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '12px 0', borderRadius: 'var(--r-md)',
              background: 'var(--bg)', border: '1px solid var(--border)',
              color: 'var(--navy)', fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-body)',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </button>
          <button
            onClick={handleShare}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '12px 0', borderRadius: 'var(--r-md)',
              background: 'var(--navy)', border: 'none',
              color: '#fff', fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-body)',
              cursor: 'pointer', transition: 'opacity 0.15s',
            }}
          >
            <Share2 size={14} /> Share
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>,
    document.body
  );
}
