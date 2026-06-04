import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';

const CENTRAL_BANKS = [
  { country: 'Saudi Arabia', flag: '\u{1F1F8}\u{1F1E6}', bank: 'SAMA', rate: 5.50, prevRate: 5.50, lastChange: '2025-09-18', history: [5.00, 5.25, 5.50, 5.75, 5.50] },
  { country: 'UAE', flag: '\u{1F1E6}\u{1F1EA}', bank: 'CBUAE', rate: 5.40, prevRate: 5.40, lastChange: '2025-09-18', history: [4.90, 5.15, 5.40, 5.65, 5.40] },
  { country: 'Qatar', flag: '\u{1F1F6}\u{1F1E6}', bank: 'QCB', rate: 5.50, prevRate: 5.50, lastChange: '2025-09-18', history: [5.00, 5.25, 5.50, 5.75, 5.50] },
  { country: 'Kuwait', flag: '\u{1F1F0}\u{1F1FC}', bank: 'CBK', rate: 4.25, prevRate: 4.00, lastChange: '2025-12-11', history: [3.50, 3.75, 4.00, 4.25, 4.25] },
  { country: 'Bahrain', flag: '\u{1F1E7}\u{1F1ED}', bank: 'CBB', rate: 5.50, prevRate: 5.50, lastChange: '2025-09-18', history: [5.00, 5.25, 5.50, 5.75, 5.50] },
  { country: 'Oman', flag: '\u{1F1F4}\u{1F1F2}', bank: 'CBO', rate: 5.50, prevRate: 5.50, lastChange: '2025-09-18', history: [5.00, 5.25, 5.50, 5.75, 5.50] },
];

function MiniChart({ history }) {
  const w = 80, h = 30, pad = 2;
  const min = Math.min(...history);
  const max = Math.max(...history);
  const range = max - min || 1;

  const points = history.map((v, i) => {
    const x = pad + (i / (history.length - 1)) * (w - 2 * pad);
    const y = h - pad - ((v - min) / range) * (h - 2 * pad);
    return `${x},${y}`;
  }).join(' ');

  const last = history[history.length - 1];
  const prev = history[history.length - 2];
  const color = last > prev ? 'var(--red)' : last < prev ? 'var(--green)' : 'var(--text-3)';

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none" style={{ display: 'block' }}>
      <polyline
        points={points}
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function CentralBankRatesPage() {
  const avgRate = useMemo(() => {
    const sum = CENTRAL_BANKS.reduce((a, b) => a + b.rate, 0);
    return (sum / CENTRAL_BANKS.length).toFixed(2);
  }, []);

  return (
    <div className="animate-fade-in">
      <PageHeader title="Central Bank Rates" subtitle="GCC Monetary Policy" backTo="/markets" />

      {/* Average rate summary */}
      <div
        className="mx-4 mt-3 mb-4 p-3.5 rounded-md"
        style={{ background: 'var(--navy)' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Average GCC Rate
            </p>
            <p className="font-head text-2xl font-bold mt-0.5" style={{ color: '#fff' }}>
              {avgRate}%
            </p>
          </div>
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.12)' }}
          >
            <span className="text-lg">%</span>
          </div>
        </div>
      </div>

      {/* Section label */}
      <div className="px-5 pb-2">
        <p className="font-head text-[11px] font-bold uppercase tracking-[1.2px]" style={{ color: 'var(--text-3)' }}>
          Rate by Country
        </p>
      </div>

      {/* Country cards */}
      <div className="px-4 space-y-2.5 pb-4">
        {CENTRAL_BANKS.map(cb => {
          const diff = cb.rate - cb.prevRate;
          const direction = diff > 0 ? 'up' : diff < 0 ? 'down' : 'unchanged';

          return (
            <div
              key={cb.bank}
              className="rounded-md p-3.5"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-start justify-between gap-3">
                {/* Flag + name */}
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <span className="text-xl flex-shrink-0">{cb.flag}</span>
                  <div className="min-w-0">
                    <p className="font-head text-sm font-bold truncate" style={{ color: 'var(--navy)' }}>
                      {cb.country}
                    </p>
                    <p className="text-[11px]" style={{ color: 'var(--text-3)' }}>
                      {cb.bank}
                    </p>
                  </div>
                </div>

                {/* Rate */}
                <div className="text-right flex-shrink-0">
                  <p className="font-head text-xl font-bold tabular-nums" style={{ color: 'var(--navy)' }}>
                    {cb.rate.toFixed(2)}%
                  </p>
                  <div className="flex items-center gap-1 justify-end mt-0.5">
                    {direction === 'up' && (
                      <span
                        className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded"
                        style={{ background: 'var(--red-bg)', color: 'var(--red)' }}
                      >
                        <TrendingUp size={10} />
                        +{Math.abs(diff).toFixed(2)}%
                      </span>
                    )}
                    {direction === 'down' && (
                      <span
                        className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded"
                        style={{ background: 'var(--green-bg)', color: 'var(--green)' }}
                      >
                        <TrendingDown size={10} />
                        -{Math.abs(diff).toFixed(2)}%
                      </span>
                    )}
                    {direction === 'unchanged' && (
                      <span
                        className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded"
                        style={{ background: '#F4F4F6', color: 'var(--text-3)' }}
                      >
                        <Minus size={10} />
                        No change
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* History + last change */}
              <div
                className="flex items-center justify-between mt-3 pt-3"
                style={{ borderTop: '1px solid var(--border)' }}
              >
                <div>
                  <p className="text-[10px] uppercase tracking-wide mb-1" style={{ color: 'var(--text-3)' }}>Last Change</p>
                  <p className="text-[11px] font-medium" style={{ color: 'var(--text-2)' }}>
                    {formatDate(cb.lastChange)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide mb-1 text-right" style={{ color: 'var(--text-3)' }}>History</p>
                  <MiniChart history={cb.history} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Impact Analysis */}
      <div className="px-4 pb-6">
        <div
          className="rounded-md p-3.5"
          style={{ background: 'var(--blue-light)', border: '1px solid var(--border)' }}
        >
          <p className="font-head text-[12px] font-bold mb-1.5" style={{ color: 'var(--navy)' }}>
            Impact Analysis
          </p>
          <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-2)' }}>
            Most GCC central banks peg their currencies to the USD and closely follow U.S. Federal Reserve policy moves. Saudi Arabia, UAE, Qatar, Bahrain, and Oman typically mirror Fed rate changes within days. Kuwait maintains an independent monetary policy tied to a currency basket, allowing for more flexibility. Higher rates tend to strengthen bank margins but may slow real estate and consumer lending growth across the region.
          </p>
        </div>
      </div>
    </div>
  );
}
