import { useState, useMemo } from 'react';
import { DollarSign, Wallet } from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';

const DIVIDENDS = [
  { company: 'Saudi Aramco', ticker: '2222.SR', country: 'SA', exDate: '2026-04-14', amount: 0.3105, currency: 'SAR', yield: 4.2, payDate: '2026-05-05' },
  { company: 'Al Rajhi Bank', ticker: '1120.SR', country: 'SA', exDate: '2026-04-20', amount: 4.00, currency: 'SAR', yield: 3.8, payDate: '2026-05-10' },
  { company: 'Qatar National Bank', ticker: 'QNBK.QA', country: 'QA', exDate: '2026-04-28', amount: 1.00, currency: 'QAR', yield: 5.1, payDate: '2026-05-15' },
  { company: 'Emirates NBD', ticker: 'ENBD.AE', country: 'AE', exDate: '2026-05-05', amount: 0.75, currency: 'AED', yield: 4.5, payDate: '2026-05-25' },
  { company: 'Kuwait Finance House', ticker: 'KFH.KW', country: 'KW', exDate: '2026-05-12', amount: 0.025, currency: 'KWD', yield: 3.2, payDate: '2026-06-01' },
  { company: 'National Bank of Kuwait', ticker: 'NBK.KW', country: 'KW', exDate: '2026-05-18', amount: 0.035, currency: 'KWD', yield: 4.8, payDate: '2026-06-08' },
  { company: 'First Abu Dhabi Bank', ticker: 'FAB.AE', country: 'AE', exDate: '2026-05-22', amount: 0.52, currency: 'AED', yield: 3.9, payDate: '2026-06-12' },
  { company: 'SABIC', ticker: '2010.SR', country: 'SA', exDate: '2026-05-28', amount: 3.00, currency: 'SAR', yield: 3.4, payDate: '2026-06-18' },
  { company: 'Ooredoo', ticker: 'ORDS.QA', country: 'QA', exDate: '2026-06-05', amount: 0.40, currency: 'QAR', yield: 2.8, payDate: '2026-06-25' },
  { company: 'Bank Muscat', ticker: 'BKMB.OM', country: 'OM', exDate: '2026-06-10', amount: 0.020, currency: 'OMR', yield: 5.5, payDate: '2026-06-30' },
  { company: 'Ahli United Bank', ticker: 'AUB.BH', country: 'BH', exDate: '2026-06-15', amount: 0.015, currency: 'BHD', yield: 4.1, payDate: '2026-07-05' },
  { company: 'Saudi Telecom', ticker: '7010.SR', country: 'SA', exDate: '2026-06-20', amount: 2.40, currency: 'SAR', yield: 3.6, payDate: '2026-07-10' },
];

const MONTHS = [
  { key: '2026-04', label: 'Apr 2026' },
  { key: '2026-05', label: 'May 2026' },
  { key: '2026-06', label: 'Jun 2026' },
];

const COUNTRY_LABELS = { SA: 'Saudi', AE: 'UAE', QA: 'Qatar', KW: 'Kuwait', BH: 'Bahrain', OM: 'Oman' };

function formatDay(dateStr) {
  return new Date(dateStr + 'T00:00:00').getDate();
}

function formatMonth(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { month: 'short' });
}

function formatPayDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function isInPortfolio(ticker) {
  try {
    const data = JSON.parse(localStorage.getItem('vifm-portfolio') || '[]');
    return data.some(h => h.ticker === ticker || h.symbol === ticker || h.name?.includes(ticker.split('.')[0]));
  } catch { return false; }
}

export default function DividendCalendarPage() {
  const [selectedMonth, setSelectedMonth] = useState('2026-04');

  const filtered = useMemo(() =>
    DIVIDENDS.filter(d => d.exDate.startsWith(selectedMonth)),
    [selectedMonth]
  );

  return (
    <div className="animate-fade-in">
      <PageHeader title="Dividend Calendar" subtitle="Upcoming Ex-Dividend Dates" backTo="/portfolio" />

      {/* Month selector */}
      <div className="flex gap-2 px-5 py-3">
        {MONTHS.map(m => {
          const active = selectedMonth === m.key;
          return (
            <button
              key={m.key}
              onClick={() => setSelectedMonth(m.key)}
              className="px-3.5 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-colors"
              style={{
                background: active ? 'var(--navy)' : 'var(--card)',
                color: active ? '#fff' : 'var(--text-2)',
                border: `1px solid ${active ? 'var(--navy)' : 'var(--border)'}`,
              }}
            >
              {m.label}
            </button>
          );
        })}
      </div>

      {/* Count */}
      <div className="px-5 pb-2">
        <p className="font-head text-[11px] font-bold uppercase tracking-[1.2px]" style={{ color: 'var(--text-3)' }}>
          {filtered.length} Dividend{filtered.length !== 1 ? 's' : ''} in {MONTHS.find(m => m.key === selectedMonth)?.label}
        </p>
      </div>

      {/* Dividend cards */}
      <div className="px-4 space-y-2.5 pb-6">
        {filtered.length === 0 && (
          <div className="text-center py-10">
            <DollarSign size={28} style={{ color: 'var(--text-3)', margin: '0 auto 8px' }} />
            <p className="text-[12px]" style={{ color: 'var(--text-3)' }}>No dividends scheduled this month.</p>
          </div>
        )}

        {filtered.map(div => {
          const inPortfolio = isInPortfolio(div.ticker);

          return (
            <div
              key={div.ticker + div.exDate}
              className="rounded-md p-3.5 relative"
              style={{
                background: 'var(--card)',
                border: `1px solid ${inPortfolio ? 'var(--green)' : 'var(--border)'}`,
              }}
            >
              {/* In-portfolio badge */}
              {inPortfolio && (
                <div
                  className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold"
                  style={{ background: 'var(--green-bg)', color: 'var(--green)' }}
                >
                  <Wallet size={9} />
                  In Portfolio
                </div>
              )}

              <div className="flex items-start gap-3">
                {/* Date badge */}
                <div
                  className="flex flex-col items-center justify-center w-12 h-12 rounded-lg flex-shrink-0"
                  style={{ background: 'var(--blue-light)' }}
                >
                  <span className="font-head text-lg font-bold leading-none" style={{ color: 'var(--blue)' }}>
                    {formatDay(div.exDate)}
                  </span>
                  <span className="text-[9px] font-semibold uppercase" style={{ color: 'var(--blue)' }}>
                    {formatMonth(div.exDate)}
                  </span>
                </div>

                {/* Company info */}
                <div className="flex-1 min-w-0">
                  <p className="font-head text-sm font-bold truncate" style={{ color: 'var(--navy)' }}>
                    {div.company}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] font-medium" style={{ color: 'var(--text-3)' }}>
                      {div.ticker}
                    </span>
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                      style={{ background: 'var(--blue-light)', color: 'var(--blue)' }}
                    >
                      {COUNTRY_LABELS[div.country] || div.country}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dividend details */}
              <div
                className="grid grid-cols-3 gap-3 mt-3 pt-3"
                style={{ borderTop: '1px solid var(--border)' }}
              >
                <div>
                  <p className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-3)' }}>Amount</p>
                  <p className="font-head text-[13px] font-bold tabular-nums" style={{ color: 'var(--navy)' }}>
                    {div.currency} {div.amount.toFixed(div.amount < 1 ? 4 : 2)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-3)' }}>Yield</p>
                  <p className="font-head text-[13px] font-bold tabular-nums" style={{ color: 'var(--green)' }}>
                    {div.yield.toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-3)' }}>Pay Date</p>
                  <p className="text-[11px] font-semibold" style={{ color: 'var(--text-2)' }}>
                    {formatPayDate(div.payDate)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
