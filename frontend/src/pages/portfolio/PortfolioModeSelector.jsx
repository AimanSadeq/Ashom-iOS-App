import { Gamepad2, Wallet } from 'lucide-react';

export default function PortfolioModeSelector({ mode, setMode }) {
  const baseBtn = {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: '10px 0',
    borderRadius: 'var(--r-sm)',
    fontSize: 12,
    fontWeight: 600,
    fontFamily: 'var(--font-body)',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
  };

  return (
    <div style={{
      display: 'flex',
      gap: 4,
      margin: '8px 16px 4px',
      background: 'var(--border)',
      borderRadius: 'var(--r-md)',
      padding: 3,
    }}>
      <button
        onClick={() => setMode('practice')}
        style={{
          ...baseBtn,
          background: mode === 'practice' ? 'var(--card)' : 'transparent',
          color: mode === 'practice' ? 'var(--navy)' : 'var(--text-3)',
          boxShadow: mode === 'practice' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
        }}
      >
        <Gamepad2 size={14} />
        Practice Mode
        {mode === 'practice' && (
          <span style={{
            fontSize: 7,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            padding: '2px 6px',
            borderRadius: 20,
            background: '#FEF3C7',
            color: '#92400E',
          }}>
            SIM
          </span>
        )}
      </button>
      <button
        onClick={() => setMode('real')}
        style={{
          ...baseBtn,
          background: mode === 'real' ? 'var(--card)' : 'transparent',
          color: mode === 'real' ? 'var(--navy)' : 'var(--text-3)',
          boxShadow: mode === 'real' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
        }}
      >
        <Wallet size={14} />
        Real Portfolio
      </button>
    </div>
  );
}
