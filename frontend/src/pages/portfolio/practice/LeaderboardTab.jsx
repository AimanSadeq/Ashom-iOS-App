import { Trophy, TrendingUp, ShieldCheck, Flame } from 'lucide-react';
import { formatCurrency } from '../hooks/formatters';

const SORT_OPTIONS = [
  { id: 'totalReturnPct', label: 'Return %', icon: TrendingUp },
  { id: 'sharpeRatio',    label: 'Sharpe',   icon: ShieldCheck },
  { id: 'winStreak',      label: 'Win Streak', icon: Flame },
];

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
  margin: 0,
};

export default function LeaderboardTab({ leaderboard, sortBy, setSortBy }) {
  const chipBase = {
    padding: '5px 10px',
    borderRadius: 20,
    fontSize: 10,
    fontWeight: 600,
    fontFamily: 'var(--font-body)',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    transition: 'all 0.2s',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <Trophy size={16} style={{ color: '#F59E0B' }} />
        <p style={sectionLabel}>Leaderboard</p>
      </div>

      {/* Sort chips */}
      <div style={{ display: 'flex', gap: 6 }}>
        {SORT_OPTIONS.map(opt => {
          const Icon = opt.icon;
          return (
            <button
              key={opt.id}
              onClick={() => setSortBy(opt.id)}
              style={{
                ...chipBase,
                background: sortBy === opt.id ? 'var(--navy)' : 'var(--card)',
                color: sortBy === opt.id ? '#fff' : 'var(--text-2)',
                border: sortBy === opt.id ? 'none' : '1px solid var(--border)',
              }}
            >
              <Icon size={10} />
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Rankings */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {leaderboard.map(entry => {
          const isUser = entry.isCurrentUser;
          const medalColors = { 1: '#F59E0B', 2: '#9CA3AF', 3: '#92400E' };
          return (
            <div
              key={entry.userId}
              style={{
                ...card,
                padding: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                transition: 'all 0.2s',
                ...(isUser ? {
                  border: '2px solid var(--blue-mid)',
                  background: 'var(--blue-light)',
                } : {}),
              }}
            >
              {/* Rank */}
              <div style={{ width: 28, textAlign: 'center', flexShrink: 0 }}>
                {entry.rank <= 3 ? (
                  <Trophy size={16} style={{ color: medalColors[entry.rank] }} />
                ) : (
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-3)', fontFamily: 'var(--font-head)' }}>#{entry.rank}</span>
                )}
              </div>

              {/* Avatar */}
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                background: isUser ? 'linear-gradient(135deg, var(--navy), var(--navy-soft))' : 'var(--bg)',
                color: isUser ? '#fff' : 'var(--text-2)',
              }}>
                <span style={{ fontSize: 10, fontWeight: 700 }}>{entry.initials}</span>
              </div>

              {/* Name */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--navy)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--font-body)' }}>
                  {isUser ? 'You' : entry.name}
                </p>
                <p style={{ fontSize: 10, color: 'var(--text-3)', margin: 0 }}>{entry.totalTrades} trades</p>
              </div>

              {/* Stats */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{
                  fontSize: 14, fontWeight: 700, fontVariantNumeric: 'tabular-nums', margin: 0, fontFamily: 'var(--font-head)',
                  color: entry.totalReturnPct >= 0 ? 'var(--green)' : 'var(--red)',
                }}>
                  {entry.totalReturnPct >= 0 ? '+' : ''}{entry.totalReturnPct.toFixed(1)}%
                </p>
                <p style={{ fontSize: 10, color: 'var(--text-3)', fontVariantNumeric: 'tabular-nums', margin: 0 }}>{formatCurrency(entry.portfolioValue)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
