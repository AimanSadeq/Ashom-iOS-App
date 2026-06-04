import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, TrendingUp, TrendingDown, Minus, ChevronRight } from 'lucide-react';

// Simulated daily digest — in production this would come from the AI Analyst API
const DIGEST_POOL = [
  {
    headline: 'GCC markets mixed as oil steadies above $82',
    bullets: [
      { text: 'TASI gained 1.2% led by banking sector strength', sentiment: 'up' },
      { text: 'DFM pulled back 0.4% on profit-taking in real estate', sentiment: 'down' },
      { text: 'Gold holds near $2,340 as markets await Fed signals', sentiment: 'neutral' },
    ],
    insight: 'Saudi banking stocks showing momentum — Al Rajhi and SNB both up over 2% this week.',
  },
  {
    headline: 'Aramco earnings beat expectations, lifts Saudi market',
    bullets: [
      { text: 'Saudi Aramco Q1 net income up 8% year-over-year', sentiment: 'up' },
      { text: 'Qatar Exchange steady ahead of QNB results', sentiment: 'neutral' },
      { text: 'Bitcoin retreats to $67K after touching weekly highs', sentiment: 'down' },
    ],
    insight: 'Energy sector strength may continue as OPEC+ maintains production cuts through Q2.',
  },
  {
    headline: 'UAE markets advance on strong tourism data',
    bullets: [
      { text: 'Dubai tourism hits record, boosting hospitality stocks', sentiment: 'up' },
      { text: 'Kuwait Finance House reports solid loan growth', sentiment: 'up' },
      { text: 'Brent crude dips below $82 on demand concerns', sentiment: 'down' },
    ],
    insight: 'UAE diversification story gaining traction — non-oil GDP growth tracking at 4.5% annualized.',
  },
];

export default function DailyDigest() {
  const navigate = useNavigate();
  const [digest, setDigest] = useState(null);

  useEffect(() => {
    // Select digest based on day of year for consistency within a day
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    setDigest(DIGEST_POOL[dayOfYear % DIGEST_POOL.length]);
  }, []);

  if (!digest) return null;

  const SentimentIcon = { up: TrendingUp, down: TrendingDown, neutral: Minus };
  const sentimentColor = { up: 'text-teal-600', down: 'text-danger-400', neutral: 'text-gray-400' };

  return (
    <button
      onClick={() => navigate('/ai')}
      className="card card-hover p-4 w-full text-left relative overflow-hidden group"
    >
      {/* AI sparkle indicator */}
      <div className="flex items-center gap-1.5 mb-2">
        <Sparkles size={12} className="text-violet-500" />
        <span className="text-2xs font-bold uppercase tracking-wider text-violet-600">AI Daily Digest</span>
        <span className="text-2xs text-gray-300 ml-auto">Today</span>
      </div>

      {/* Headline */}
      <p className="text-sm font-bold text-brand-900 leading-snug mb-2.5">{digest.headline}</p>

      {/* Bullet points */}
      <div className="space-y-1.5 mb-3">
        {digest.bullets.map((b, i) => {
          const Icon = SentimentIcon[b.sentiment];
          return (
            <div key={i} className="flex items-start gap-2">
              <Icon size={11} className={`mt-0.5 flex-shrink-0 ${sentimentColor[b.sentiment]}`} />
              <p className="text-2xs text-gray-500 leading-relaxed">{b.text}</p>
            </div>
          );
        })}
      </div>

      {/* AI Insight */}
      <div className="bg-violet-50/50 rounded-lg px-3 py-2 border border-violet-100/50">
        <p className="text-2xs text-violet-700 leading-relaxed">
          <span className="font-bold">AI Insight:</span> {digest.insight}
        </p>
      </div>

      {/* CTA */}
      <div className="flex items-center justify-end mt-2 gap-1 text-2xs font-semibold text-violet-600 group-hover:text-violet-700">
        Ask AI Analyst <ChevronRight size={12} />
      </div>
    </button>
  );
}
