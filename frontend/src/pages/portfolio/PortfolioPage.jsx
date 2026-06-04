import { useState } from 'react';
import PageHeader from '../../components/shared/PageHeader';
import PortfolioModeSelector from './PortfolioModeSelector';
import RealPortfolio from './RealPortfolio';
import PracticePortfolio from './PracticePortfolio';
import { STORAGE_KEYS } from './hooks/storageKeys';

export default function PortfolioPage({ user }) {
  const [mode, setMode] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.PORTFOLIO_MODE) || 'real';
  });

  function handleModeChange(newMode) {
    setMode(newMode);
    localStorage.setItem(STORAGE_KEYS.PORTFOLIO_MODE, newMode);
  }

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <PageHeader
        title="Portfolio Tracker"
        backTo="/"
        subtitle={mode === 'practice' ? 'Practice Simulator' : 'Track Your Holdings'}
      />

      {/* Live price indicator */}
      <div style={{ padding: '6px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: 'var(--green)',
            animation: 'pulse 2s infinite',
            display: 'inline-block',
          }} />
          <span style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--font-body)' }}>Live prices</span>
        </div>
      </div>

      {/* Mode selector */}
      <PortfolioModeSelector mode={mode} setMode={handleModeChange} />

      {/* Content */}
      {mode === 'real' ? (
        <RealPortfolio />
      ) : (
        <PracticePortfolio user={user} />
      )}
    </div>
  );
}
