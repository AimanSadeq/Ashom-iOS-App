import { Sparkles, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const INSIGHTS_POOL = [
  {
    bullets: [
      { text: 'Saudi banking sector up 2.1% — likely boosting your Al Rajhi position', sentiment: 'up' },
      { text: 'Oil steady above $82 supporting your energy holdings', sentiment: 'up' },
      { text: 'Consider rebalancing: tech allocation is 5% above target', sentiment: 'neutral' },
    ],
  },
  {
    bullets: [
      { text: 'Your portfolio gained 1.3% today, outperforming TASI by 0.4%', sentiment: 'up' },
      { text: 'Dubai real estate stocks rallied on strong tourism data', sentiment: 'up' },
      { text: 'Gold allocation providing downside hedge — working as intended', sentiment: 'neutral' },
    ],
  },
  {
    bullets: [
      { text: 'Aramco dividend ex-date approaching — your holding qualifies', sentiment: 'up' },
      { text: 'Crypto positions down 3.2% — Bitcoin testing support at $67K', sentiment: 'down' },
      { text: 'Suggestion: Saudi telecom sector showing relative strength', sentiment: 'neutral' },
    ],
  },
  {
    bullets: [
      { text: 'Kuwait financials outperforming — NBK leading the rally', sentiment: 'up' },
      { text: 'Brent crude slipped 1.4% on inventory build, watch oil exposure', sentiment: 'down' },
      { text: 'Portfolio Sharpe ratio improved to 1.12 over the past month', sentiment: 'neutral' },
    ],
  },
  {
    bullets: [
      { text: 'QE Index up 0.9% — Qatar Gas holdings benefiting', sentiment: 'up' },
      { text: 'USD/SAR peg holding firm, no currency risk on Saudi positions', sentiment: 'neutral' },
      { text: 'Emerging market outflows may pressure GCC small caps', sentiment: 'down' },
    ],
  },
];

function getDayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

const SentimentIcon = ({ sentiment }) => {
  if (sentiment === 'up') return <TrendingUp size={12} style={{ color: '#6EE7B7', flexShrink: 0 }} />;
  if (sentiment === 'down') return <TrendingDown size={12} style={{ color: '#FCA5A5', flexShrink: 0 }} />;
  return <Minus size={12} style={{ color: 'rgba(255,255,255,0.5)', flexShrink: 0 }} />;
};

export default function AIInsightsCard() {
  const navigate = useNavigate();
  const dayIndex = getDayOfYear() % INSIGHTS_POOL.length;
  const insight = INSIGHTS_POOL[dayIndex];

  return (
    <div
      style={{
        borderRadius: 'var(--r-lg)',
        background: 'linear-gradient(135deg, var(--navy), var(--navy-soft))',
        padding: 16,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative circles */}
      <div
        style={{
          position: 'absolute',
          top: -30,
          right: -30,
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: -20,
          left: -20,
          width: 70,
          height: 70,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.03)',
          pointerEvents: 'none',
        }}
      />

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, position: 'relative' }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Sparkles size={14} style={{ color: '#fff' }} />
        </div>
        <span
          style={{
            fontFamily: 'var(--font-head)',
            fontSize: 14,
            fontWeight: 700,
            color: '#fff',
          }}
        >
          AI Portfolio Insights
        </span>
      </div>

      {/* Insight bullets */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12, position: 'relative' }}>
        {insight.bullets.map((b, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
            <SentimentIcon sentiment={b.sentiment} />
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', lineHeight: 1.4 }}>
              {b.text}
            </span>
          </div>
        ))}
      </div>

      {/* CTA link */}
      <button
        onClick={() => navigate('/ai')}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          fontSize: 12,
          fontWeight: 600,
          color: 'rgba(255,255,255,0.6)',
          fontFamily: 'var(--font-body)',
          position: 'relative',
          transition: 'color 0.2s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.9)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
      >
        Ask AI Analyst &rarr;
      </button>
    </div>
  );
}
