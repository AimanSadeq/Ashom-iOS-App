import { useState, useCallback } from 'react';
import { PieChart, Wallet, LineChart, BarChart3, Trophy, RotateCcw, RefreshCw, Pause, Play, X } from 'lucide-react';
import usePracticePortfolio from './hooks/usePracticePortfolio';
import useLivePrices from './hooks/useLivePrices';
import useLeaderboard from './hooks/useLeaderboard';
import OverviewTab from './tabs/OverviewTab';
import HoldingsTab from './tabs/HoldingsTab';
import PerformanceTab from './tabs/PerformanceTab';
import AnalyticsTab from './tabs/AnalyticsTab';
import LeaderboardTab from './practice/LeaderboardTab';
import TradeModal from './practice/TradeModal';
import AutoInvestModal, { loadAutoInvestPlans, saveAutoInvestPlans } from './practice/AutoInvestModal';
import { ACHIEVEMENTS } from './practice/practiceData';

const PRACTICE_TABS = [
  { id: 'overview',    label: 'Overview',    icon: PieChart },
  { id: 'holdings',    label: 'Holdings',    icon: Wallet },
  { id: 'performance', label: 'Performance', icon: LineChart },
  { id: 'analytics',   label: 'Analytics',   icon: BarChart3 },
  { id: 'leaderboard', label: 'Ranking',     icon: Trophy },
];

export default function PracticePortfolio({ user }) {
  const [tab, setTab] = useState('overview');
  const [showTrade, setShowTrade] = useState(false);
  const [sellTarget, setSellTarget] = useState(null);
  const [showAutoInvest, setShowAutoInvest] = useState(false);
  const [autoInvestPlans, setAutoInvestPlans] = useState(() => loadAutoInvestPlans());

  const refreshPlans = useCallback(() => {
    setAutoInvestPlans(loadAutoInvestPlans());
  }, []);

  function togglePlan(planId) {
    const plans = autoInvestPlans.map(p =>
      p.id === planId ? { ...p, active: !p.active } : p
    );
    saveAutoInvestPlans(plans);
    setAutoInvestPlans(plans);
  }

  function deletePlan(planId) {
    const plans = autoInvestPlans.filter(p => p.id !== planId);
    saveAutoInvestPlans(plans);
    setAutoInvestPlans(plans);
  }

  const userId = user?.initials || 'U';
  const practice = usePracticePortfolio(userId);
  const { livePrices } = useLivePrices(practice.holdings, practice.setHoldings);
  const { leaderboard, sortBy, setSortBy } = useLeaderboard(user, practice);

  function handleSell(holding) {
    setSellTarget(holding);
    setShowTrade(true);
  }

  function handleOpenTrade() {
    setSellTarget(null);
    setShowTrade(true);
  }

  // Achievements row for overview
  const achievementsRow = (
    <div style={{
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--r-md)',
      padding: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <p style={{
          fontFamily: 'var(--font-head)', fontSize: 11, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--text-3)', margin: 0,
        }}>Achievements</p>
        <span style={{ fontSize: 10, color: 'var(--text-3)' }}>{practice.achievements.length}/{ACHIEVEMENTS.length}</span>
      </div>
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
        {ACHIEVEMENTS.map(a => {
          const unlocked = practice.achievements.includes(a.id);
          return (
            <div
              key={a.id}
              style={{
                flexShrink: 0, width: 64, textAlign: 'center',
                opacity: unlocked ? 1 : 0.3,
              }}
              title={a.desc}
            >
              <div style={{
                width: 40, height: 40, margin: '0 auto',
                borderRadius: 'var(--r-sm)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 4,
                background: unlocked ? '#FFFBEB' : 'var(--bg)',
                border: unlocked ? '1px solid #FDE68A' : 'none',
              }}>
                <span style={{ fontSize: 14 }}>{unlocked ? '\u{1F3C6}' : '\u{1F512}'}</span>
              </div>
              <p style={{ fontSize: 8, fontWeight: 500, color: 'var(--navy)', lineHeight: 1.2, margin: 0, fontFamily: 'var(--font-body)' }}>{a.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );

  const tabBarStyle = {
    display: 'flex',
    borderBottom: '1px solid var(--border)',
    padding: '0 8px',
  };

  const tabBtnBase = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    padding: '10px 0',
    fontSize: 9,
    fontWeight: 500,
    fontFamily: 'var(--font-body)',
    border: 'none',
    borderBottom: '2px solid transparent',
    background: 'none',
    cursor: 'pointer',
    transition: 'color 0.2s',
  };

  return (
    <>
      {/* Tabs */}
      <div style={tabBarStyle}>
        {PRACTICE_TABS.map(t => {
          const Icon = t.icon;
          const active = tab === t.id;
          const isLeaderboard = t.id === 'leaderboard';
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{
                ...tabBtnBase,
                borderBottomColor: active
                  ? (isLeaderboard ? '#F59E0B' : 'var(--navy)')
                  : 'transparent',
                color: active
                  ? (isLeaderboard ? '#D97706' : 'var(--navy)')
                  : 'var(--text-3)',
                fontWeight: active ? 700 : 500,
              }}
            >
              <Icon size={13} />
              {t.label}
            </button>
          );
        })}
      </div>

      <div style={{ padding: '12px 16px' }}>
        {tab === 'overview' && (
          <OverviewTab
            holdings={practice.holdings}
            totalValue={practice.totalValue}
            totalCost={practice.totalCost}
            totalGain={practice.totalGain}
            totalGainPct={practice.totalGainPct}
            allocationByType={practice.allocationByType}
            bestPerformer={practice.bestPerformer}
            onAdd={handleOpenTrade}
            addLabel="Buy Asset"
            virtualCash={practice.virtualCash}
            isPractice
            extraContent={achievementsRow}
          />
        )}
        {tab === 'holdings' && (
          <HoldingsTab
            holdings={practice.holdings}
            onAdd={handleOpenTrade}
            onSell={handleSell}
            addLabel="Buy Asset"
            isPractice
          />
        )}
        {tab === 'performance' && (
          <PerformanceTab
            holdings={practice.holdings}
            totalValue={practice.totalValue}
            totalCost={practice.totalCost}
            totalGain={practice.totalGain}
            totalGainPct={practice.totalGainPct}
          />
        )}
        {tab === 'analytics' && (
          <AnalyticsTab
            holdings={practice.holdings}
            totalValue={practice.totalValue}
            allocationByType={practice.allocationByType}
            onAdd={handleOpenTrade}
            addLabel="Buy Asset"
          />
        )}
        {tab === 'leaderboard' && (
          <LeaderboardTab leaderboard={leaderboard} sortBy={sortBy} setSortBy={setSortBy} />
        )}

        {/* Auto-Invest button */}
        <button
          onClick={() => setShowAutoInvest(true)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '10px 0',
            marginTop: 12,
            borderRadius: 'var(--r-md)',
            border: '1px solid var(--blue)',
            background: 'var(--blue-light)',
            fontSize: 12,
            color: 'var(--navy)',
            fontWeight: 600,
            fontFamily: 'var(--font-body)',
            cursor: 'pointer',
            transition: 'opacity 0.2s',
          }}
        >
          <RefreshCw size={14} /> Auto-Invest
        </button>

        {/* Active Auto-Invest Plans */}
        {autoInvestPlans.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <p style={{
              fontFamily: 'var(--font-head)', fontSize: 11, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--text-3)', margin: '0 0 8px',
            }}>Active Plans</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {autoInvestPlans.map(plan => (
                <div
                  key={plan.id}
                  style={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--r-md)',
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    opacity: plan.active ? 1 : 0.5,
                  }}
                >
                  <RefreshCw size={12} style={{ color: plan.active ? 'var(--green)' : 'var(--text-3)', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: 11, fontWeight: 600, color: 'var(--navy)', margin: 0,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>{plan.asset.name}</p>
                    <p style={{ fontSize: 9, color: 'var(--text-3)', margin: 0 }}>
                      {plan.amount} {plan.currency} / {plan.frequency}
                    </p>
                  </div>
                  <button
                    onClick={() => togglePlan(plan.id)}
                    title={plan.active ? 'Pause' : 'Resume'}
                    style={{
                      padding: 4, borderRadius: 'var(--r-sm)',
                      border: 'none', background: 'none', cursor: 'pointer', flexShrink: 0,
                    }}
                  >
                    {plan.active
                      ? <Pause size={12} style={{ color: 'var(--text-3)' }} />
                      : <Play size={12} style={{ color: 'var(--green)' }} />}
                  </button>
                  <button
                    onClick={() => deletePlan(plan.id)}
                    title="Delete plan"
                    style={{
                      padding: 4, borderRadius: 'var(--r-sm)',
                      border: 'none', background: 'none', cursor: 'pointer', flexShrink: 0,
                    }}
                  >
                    <X size={12} style={{ color: 'var(--red)' }} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reset button */}
        <button
          onClick={() => { if (window.confirm('Reset practice portfolio? This will clear all holdings and restore $100,000 virtual cash.')) practice.resetPortfolio(); }}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '8px 0',
            marginTop: 16,
            borderRadius: 'var(--r-md)',
            border: '1px solid var(--border)',
            background: 'none',
            fontSize: 10,
            color: 'var(--text-3)',
            fontWeight: 500,
            fontFamily: 'var(--font-body)',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
        >
          <RotateCcw size={12} /> Reset Practice Portfolio
        </button>
      </div>

      {/* Trade Modal */}
      {showTrade && (
        <TradeModal
          onClose={() => { setShowTrade(false); setSellTarget(null); }}
          onBuy={(asset, qty, price) => practice.buyAsset(asset, qty, price)}
          onSell={(holding, qty, price) => practice.sellAsset(holding, qty, price)}
          virtualCash={practice.virtualCash}
          holdings={practice.holdings}
          livePrices={livePrices}
          initialSell={sellTarget}
        />
      )}

      {/* Auto-Invest Modal */}
      {showAutoInvest && (
        <AutoInvestModal
          onClose={() => setShowAutoInvest(false)}
          onPlanCreated={refreshPlans}
        />
      )}
    </>
  );
}
