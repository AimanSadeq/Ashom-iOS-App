import { useState, useMemo } from 'react';
import { Calendar, Bell, BellOff } from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';

const EARNINGS_DATA = [
  { company: 'Saudi Aramco', ticker: '2222.SR', country: 'SA', date: '2026-04-15', quarter: 'Q1 2026', expectedEPS: 2.85 },
  { company: 'Al Rajhi Bank', ticker: '1120.SR', country: 'SA', date: '2026-04-17', quarter: 'Q1 2026', expectedEPS: 3.12 },
  { company: 'Qatar National Bank', ticker: 'QNBK.QA', country: 'QA', date: '2026-04-20', quarter: 'Q1 2026', expectedEPS: 1.45 },
  { company: 'Emaar Properties', ticker: 'EMAAR.AE', country: 'AE', date: '2026-04-22', quarter: 'Q1 2026', expectedEPS: 0.78 },
  { company: 'National Bank of Kuwait', ticker: 'NBK.KW', country: 'KW', date: '2026-04-24', quarter: 'Q1 2026', expectedEPS: 0.62 },
  { company: 'SABIC', ticker: '2010.SR', country: 'SA', date: '2026-04-28', quarter: 'Q1 2026', expectedEPS: 1.95 },
  { company: 'Emirates NBD', ticker: 'ENBD.AE', country: 'AE', date: '2026-05-02', quarter: 'Q1 2026', expectedEPS: 1.33 },
  { company: 'Kuwait Finance House', ticker: 'KFH.KW', country: 'KW', date: '2026-05-05', quarter: 'Q1 2026', expectedEPS: 0.89 },
  { company: 'Ooredoo', ticker: 'ORDS.QA', country: 'QA', date: '2026-05-08', quarter: 'Q1 2026', expectedEPS: 0.55 },
  { company: 'Bank Muscat', ticker: 'BKMB.OM', country: 'OM', date: '2026-05-12', quarter: 'Q1 2026', expectedEPS: 0.42 },
  { company: 'Ahli United Bank', ticker: 'AUB.BH', country: 'BH', date: '2026-05-15', quarter: 'Q1 2026', expectedEPS: 0.35 },
  { company: 'Saudi Telecom', ticker: '7010.SR', country: 'SA', date: '2026-05-18', quarter: 'Q1 2026', expectedEPS: 2.10 },
  { company: 'First Abu Dhabi Bank', ticker: 'FAB.AE', country: 'AE', date: '2026-05-22', quarter: 'Q1 2026', expectedEPS: 1.75 },
  { company: 'Industries Qatar', ticker: 'IQCD.QA', country: 'QA', date: '2026-05-25', quarter: 'Q1 2026', expectedEPS: 1.20 },
  { company: 'Zain Group', ticker: 'ZAIN.KW', country: 'KW', date: '2026-06-01', quarter: 'Q2 2026', expectedEPS: 0.48 },
  { company: 'Dubai Islamic Bank', ticker: 'DIB.AE', country: 'AE', date: '2026-06-05', quarter: 'Q2 2026', expectedEPS: 0.92 },
  { company: 'Riyad Bank', ticker: '1010.SR', country: 'SA', date: '2026-06-10', quarter: 'Q2 2026', expectedEPS: 1.65 },
  { company: 'Omantel', ticker: 'OTEL.OM', country: 'OM', date: '2026-06-15', quarter: 'Q2 2026', expectedEPS: 0.38 },
];

const MONTHS = [
  { key: '2026-04', label: 'Apr 2026' },
  { key: '2026-05', label: 'May 2026' },
  { key: '2026-06', label: 'Jun 2026' },
];

function getWeekLabel(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const dayOfMonth = d.getDate();
  if (dayOfMonth <= 7) return 'Week 1';
  if (dayOfMonth <= 14) return 'Week 2';
  if (dayOfMonth <= 21) return 'Week 3';
  return 'Week 4';
}

function formatDay(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.getDate();
}

function formatMonthAbbr(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short' });
}

function formatWeekday(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short' });
}

function isToday(dateStr) {
  const today = new Date();
  const d = new Date(dateStr + 'T00:00:00');
  return d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();
}

export default function EarningsCalendarPage() {
  const currentMonthKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState(
    MONTHS.find(m => m.key === currentMonthKey)?.key || MONTHS[0].key
  );
  const [reminders, setReminders] = useState({});

  const toggleReminder = (ticker, date) => {
    const key = `${ticker}-${date}`;
    setReminders(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const filtered = useMemo(() => {
    return EARNINGS_DATA.filter(e => e.date.startsWith(selectedMonth));
  }, [selectedMonth]);

  // Group by week
  const grouped = useMemo(() => {
    const groups = {};
    filtered.forEach(e => {
      const week = getWeekLabel(e.date);
      if (!groups[week]) groups[week] = [];
      groups[week].push(e);
    });
    // Sort entries within each week by date
    Object.values(groups).forEach(arr => arr.sort((a, b) => a.date.localeCompare(b.date)));
    return groups;
  }, [filtered]);

  const weekOrder = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];

  return (
    <div className="animate-fade-in">
      <PageHeader title="Earnings Calendar" subtitle="Upcoming GCC Reports" backTo="/analytics" />

      {/* Month selector */}
      <div
        className="flex gap-2 px-5 py-3 overflow-x-auto"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        {MONTHS.map(m => {
          const active = selectedMonth === m.key;
          return (
            <button
              key={m.key}
              onClick={() => setSelectedMonth(m.key)}
              className="font-head text-[12px] font-semibold whitespace-nowrap px-4 py-1.5 rounded-full transition-all duration-150 active:scale-95"
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

      {/* Calendar icon + count */}
      <div className="flex items-center gap-2 px-5 pt-4 pb-2">
        <Calendar size={14} style={{ color: 'var(--blue)' }} />
        <span className="text-[11px] font-semibold" style={{ color: 'var(--text-3)' }}>
          {filtered.length} earnings report{filtered.length !== 1 ? 's' : ''} this month
        </span>
      </div>

      {/* Grouped by week */}
      <div className="px-5 pb-24 flex flex-col gap-5">
        {weekOrder.map(week => {
          const entries = grouped[week];
          if (!entries || entries.length === 0) return null;
          return (
            <div key={week}>
              <p
                className="font-head text-[11px] font-bold uppercase tracking-[1.2px] mb-2"
                style={{ color: 'var(--text-3)' }}
              >
                {week}
              </p>
              <div className="flex flex-col gap-2">
                {entries.map(e => {
                  const reminderKey = `${e.ticker}-${e.date}`;
                  const hasReminder = !!reminders[reminderKey];
                  const today = isToday(e.date);

                  return (
                    <div
                      key={reminderKey}
                      style={{
                        background: 'var(--card)',
                        border: `1px solid ${today ? 'var(--green)' : 'var(--border)'}`,
                        borderRadius: 'var(--r-md)',
                      }}
                      className="p-3 flex items-start gap-3"
                    >
                      {/* Date block */}
                      <div className="flex flex-col items-center min-w-[40px]">
                        <span
                          className="font-head text-[22px] font-bold leading-none"
                          style={{ color: 'var(--navy)' }}
                        >
                          {formatDay(e.date)}
                        </span>
                        <span
                          className="text-[10px] font-medium"
                          style={{ color: 'var(--text-3)' }}
                        >
                          {formatMonthAbbr(e.date)}
                        </span>
                        <span
                          className="text-[9px]"
                          style={{ color: 'var(--text-3)' }}
                        >
                          {formatWeekday(e.date)}
                        </span>
                        {today && (
                          <div className="flex items-center gap-1 mt-1">
                            <span
                              style={{
                                width: 6, height: 6, borderRadius: '50%',
                                background: 'var(--green)', display: 'inline-block',
                              }}
                            />
                            <span className="text-[8px] font-bold" style={{ color: 'var(--green)' }}>
                              Today
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="font-head text-[13px] font-bold truncate"
                            style={{ color: 'var(--navy)' }}
                          >
                            {e.company}
                          </span>
                          <span
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                            style={{
                              background: 'var(--blue-light)',
                              color: 'var(--navy)',
                            }}
                          >
                            {e.country}
                          </span>
                        </div>
                        <p className="text-[11px] mb-1.5" style={{ color: 'var(--text-3)' }}>
                          {e.ticker}
                        </p>
                        <div className="flex items-center gap-3 flex-wrap">
                          <span
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                            style={{
                              background: 'var(--blue-light)',
                              color: 'var(--blue)',
                            }}
                          >
                            {e.quarter}
                          </span>
                          <span className="text-[10px]" style={{ color: 'var(--text-3)' }}>
                            Expected EPS:{' '}
                            <span className="font-semibold" style={{ color: 'var(--navy)' }}>
                              {e.expectedEPS.toFixed(2)}
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Reminder bell */}
                      <button
                        onClick={() => toggleReminder(e.ticker, e.date)}
                        className="p-1.5 rounded-full transition-all duration-150 active:scale-90 flex-shrink-0 mt-1"
                        style={{
                          background: hasReminder ? 'var(--blue-light)' : 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                        aria-label={hasReminder ? 'Remove reminder' : 'Set reminder'}
                      >
                        {hasReminder ? (
                          <Bell size={16} style={{ color: 'var(--blue)' }} />
                        ) : (
                          <BellOff size={16} style={{ color: 'var(--text-3)' }} />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Calendar size={32} style={{ color: 'var(--text-3)', margin: '0 auto 8px' }} />
            <p className="text-[13px] font-semibold" style={{ color: 'var(--text-2)' }}>
              No earnings scheduled
            </p>
            <p className="text-[11px]" style={{ color: 'var(--text-3)' }}>
              No GCC companies reporting this month.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
