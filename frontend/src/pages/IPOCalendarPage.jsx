import { useState } from 'react';
import { Bell, BellOff, Calendar, Building2 } from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';

const IPOS = [
  { name: 'Arabian Mills', sector: 'Consumer Staples', exchange: 'TASI', date: '2026-04-25', priceRange: 'SAR 62-68', status: 'open', raised: '2.1B SAR' },
  { name: 'ADNOC Logistics', sector: 'Energy', exchange: 'ADX', date: '2026-05-10', priceRange: 'AED 3.80-4.20', status: 'upcoming', raised: null },
  { name: 'Lulu Retail', sector: 'Consumer Disc.', exchange: 'ADX', date: '2026-04-08', priceRange: 'AED 2.04', status: 'listed', raised: '6.3B AED' },
  { name: 'Beyout Investment', sector: 'Financials', exchange: 'Boursa', date: '2026-05-20', priceRange: 'KWD 0.150-0.180', status: 'upcoming', raised: null },
  { name: 'Alef Education', sector: 'Technology', exchange: 'ADX', date: '2026-04-12', priceRange: 'AED 1.35', status: 'listed', raised: '1.1B AED' },
  { name: 'SAL Saudi Logistics', sector: 'Industrials', exchange: 'TASI', date: '2026-06-01', priceRange: 'SAR 26-30', status: 'upcoming', raised: null },
  { name: 'Talabat Holdings', sector: 'Technology', exchange: 'DFM', date: '2026-04-18', priceRange: 'AED 1.60', status: 'listed', raised: '2.0B AED' },
  { name: 'Oman Chlorine', sector: 'Materials', exchange: 'MSM', date: '2026-05-28', priceRange: 'OMR 0.320-0.360', status: 'upcoming', raised: null },
  { name: 'Qatar Solar', sector: 'Utilities', exchange: 'QSE', date: '2026-06-15', priceRange: 'QAR 8.50-9.20', status: 'upcoming', raised: null },
  { name: 'Bahrain Fintech', sector: 'Financials', exchange: 'BAX', date: '2026-04-20', priceRange: 'BHD 0.450-0.520', status: 'open', raised: null },
];

const STATUS_CONFIG = {
  upcoming: { label: 'Upcoming', bg: 'var(--blue-light)', color: 'var(--blue)' },
  open:     { label: 'Open',     bg: 'var(--green-bg)',    color: 'var(--green)' },
  listed:   { label: 'Listed',   bg: 'var(--bg)',            color: 'var(--navy)' },
};

const FILTERS = ['all', 'upcoming', 'open', 'listed'];

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function IPOCalendarPage() {
  const [filter, setFilter] = useState('all');
  const [reminders, setReminders] = useState(() => {
    try { return JSON.parse(localStorage.getItem('vifm-ipo-reminders') || '{}'); }
    catch { return {}; }
  });

  const toggleReminder = (name) => {
    const next = { ...reminders, [name]: !reminders[name] };
    setReminders(next);
    localStorage.setItem('vifm-ipo-reminders', JSON.stringify(next));
  };

  const filtered = filter === 'all' ? IPOS : IPOS.filter(i => i.status === filter);

  return (
    <div className="animate-fade-in">
      <PageHeader title="IPO Calendar" subtitle="Upcoming GCC Listings" backTo="/markets" />

      {/* Filter chips */}
      <div className="flex gap-2 px-5 py-3 overflow-x-auto">
        {FILTERS.map(f => {
          const active = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3.5 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-colors"
              style={{
                background: active ? 'var(--navy)' : 'var(--card)',
                color: active ? '#fff' : 'var(--text-2)',
                border: `1px solid ${active ? 'var(--navy)' : 'var(--border)'}`,
              }}
            >
              {f === 'all' ? 'All' : STATUS_CONFIG[f]?.label || f}
            </button>
          );
        })}
      </div>

      {/* Count */}
      <div className="px-5 pb-2">
        <p className="font-head text-[11px] font-bold uppercase tracking-[1.2px]" style={{ color: 'var(--text-3)' }}>
          {filtered.length} IPO{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* IPO cards */}
      <div className="px-4 space-y-2.5 pb-6">
        {filtered.map(ipo => {
          const cfg = STATUS_CONFIG[ipo.status];
          const reminded = !!reminders[ipo.name];

          return (
            <div
              key={ipo.name}
              className="rounded-md p-3.5"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  {/* Company name */}
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 size={14} style={{ color: 'var(--blue)', flexShrink: 0 }} />
                    <p className="font-head text-sm font-bold truncate" style={{ color: 'var(--navy)' }}>
                      {ipo.name}
                    </p>
                  </div>

                  {/* Sector + exchange */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded"
                      style={{ background: 'var(--blue-light)', color: 'var(--blue)' }}
                    >
                      {ipo.sector}
                    </span>
                    <span className="text-[10px] font-semibold" style={{ color: 'var(--text-3)' }}>
                      {ipo.exchange}
                    </span>
                  </div>
                </div>

                {/* Status pill */}
                <span
                  className="text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0"
                  style={{ background: cfg.bg, color: cfg.color }}
                >
                  {cfg.label}
                </span>
              </div>

              {/* Details row */}
              <div
                className="flex items-center justify-between mt-3 pt-3 flex-wrap gap-y-2"
                style={{ borderTop: '1px solid var(--border)' }}
              >
                <div className="flex items-center gap-1.5">
                  <Calendar size={12} style={{ color: 'var(--text-3)' }} />
                  <span className="text-[11px] font-medium" style={{ color: 'var(--text-2)' }}>
                    {formatDate(ipo.date)}
                  </span>
                </div>

                <span className="text-[11px] font-semibold tabular-nums" style={{ color: 'var(--navy)' }}>
                  {ipo.priceRange}
                </span>
              </div>

              {/* Raised + reminder row */}
              <div className="flex items-center justify-between mt-2">
                {ipo.raised ? (
                  <span className="text-[10px] font-medium" style={{ color: 'var(--green)' }}>
                    Raised {ipo.raised}
                  </span>
                ) : (
                  <span />
                )}

                {ipo.status !== 'listed' && (
                  <button
                    onClick={() => toggleReminder(ipo.name)}
                    className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold transition-colors active:scale-95"
                    style={{
                      background: reminded ? 'var(--blue-light)' : 'transparent',
                      color: reminded ? 'var(--blue)' : 'var(--text-3)',
                      border: `1px solid ${reminded ? 'var(--blue)' : 'var(--border)'}`,
                    }}
                  >
                    {reminded ? <BellOff size={10} /> : <Bell size={10} />}
                    {reminded ? 'Reminded' : 'Set Reminder'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
