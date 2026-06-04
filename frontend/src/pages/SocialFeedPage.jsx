import { useState, useMemo, useCallback } from 'react';
import { Heart, MessageCircle, Share2, TrendingUp, Send, AtSign, X, Search, Users } from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';
import EmptyState from '../components/shared/EmptyState';

/* ─── Mock Posts ─── */
const MOCK_POSTS = [
  { id: 1, user: 'Mohammed Al-Rashid', initials: 'MR', time: '2h ago', text: 'Saudi Aramco Q1 results looking strong. Revenue beat expectations by 8%. Holding my position.', ticker: '2222.SR', sentiment: 'bullish', likes: 24, comments: 7 },
  { id: 2, user: 'Fatima Hassan', initials: 'FH', time: '4h ago', text: 'Anyone watching the Dubai real estate sector? Emaar up 3% this week on tourism data.', ticker: 'EMAAR.AE', sentiment: 'bullish', likes: 18, comments: 12 },
  { id: 3, user: 'Ahmad Al-Kuwait', initials: 'AK', time: '6h ago', text: 'Gold hitting resistance at $2,350. Might take profits on my metals position and rotate into GCC banks.', ticker: null, sentiment: 'neutral', likes: 31, comments: 9 },
  { id: 4, user: 'Sara Al-Qatari', initials: 'SQ', time: '8h ago', text: 'QNB earnings next week. Expecting strong loan growth given Qatar infrastructure spending.', ticker: 'QNBK.QA', sentiment: 'bullish', likes: 15, comments: 5 },
  { id: 5, user: 'Khalid Bahraini', initials: 'KB', time: '12h ago', text: 'Be cautious on SABIC — petrochemical margins compressing globally. Downgrading my outlook.', ticker: '2010.SR', sentiment: 'bearish', likes: 22, comments: 14 },
  { id: 6, user: 'Noura Al-Omani', initials: 'NO', time: '1d ago', text: 'Just completed the CFA Level 1 prep on Ashom! The quant tools are incredibly helpful for practice.', ticker: null, sentiment: 'neutral', likes: 45, comments: 8 },
  { id: 7, user: 'VIFM Research', initials: 'VR', time: '1d ago', text: 'Weekly GCC Market Wrap: TASI +1.2%, DFM -0.4%, QE +0.7%. Banking sector leading gains across the region.', ticker: null, sentiment: 'bullish', likes: 67, comments: 21 },
];

/* ─── Trending Tickers ─── */
const TRENDING_TICKERS = [
  { ticker: '2222.SR', name: 'Saudi Aramco', posts: 42, positive: true },
  { ticker: 'EMAAR.AE', name: 'Emaar Properties', posts: 31, positive: true },
  { ticker: 'QNBK.QA', name: 'QNB Group', posts: 28, positive: true },
  { ticker: '2010.SR', name: 'SABIC', posts: 19, positive: false },
  { ticker: 'FAB.AE', name: 'First Abu Dhabi Bank', posts: 16, positive: true },
];

/* ─── Stock Tag Search Options ─── */
const STOCK_OPTIONS = [
  '2222.SR', 'EMAAR.AE', 'QNBK.QA', '2010.SR', 'FAB.AE',
  'STC.SR', 'ALDAR.AE', 'NBK.KW', 'BATELCO.BH', 'OMANTEL.OM',
];

const TABS = ['Feed', 'Trending', 'Following'];
const SENTIMENTS = ['bullish', 'bearish', 'neutral'];

/* ─── Gradient Avatar Helper ─── */
function avatarGradient(initials) {
  const GRADIENTS = [
    'linear-gradient(135deg, #010131, #5391D5)',
    'linear-gradient(135deg, #7C5FDB, #5391D5)',
    'linear-gradient(135deg, #00C896, #5391D5)',
    'linear-gradient(135deg, #FF4B6E, #FF8A35)',
    'linear-gradient(135deg, #F2A600, #FF8A35)',
    'linear-gradient(135deg, #010131, #7C5FDB)',
    'linear-gradient(135deg, #00A8A0, #00C896)',
    'linear-gradient(135deg, #5391D5, #00C896)',
  ];
  let hash = 0;
  for (let i = 0; i < initials.length; i++) hash = ((hash << 5) - hash + initials.charCodeAt(i)) | 0;
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

/* ─── Deterministic Sparkline ─── */
function MiniSparkline({ name, positive }) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
  const points = Array.from({ length: 12 }, (_, i) => {
    const seed = Math.abs(hash * (i + 1) * 9301 + 49297) % 233280;
    const rand = seed / 233280;
    const base = positive ? 20 - (i * 0.8) : 10 + (i * 0.5);
    return Math.max(2, Math.min(22, base + (rand - 0.5) * 10));
  });
  const w = 60, h = 24;
  const stepX = w / (points.length - 1);
  const d = points.map((y, i) => `${i === 0 ? 'M' : 'L'}${(i * stepX).toFixed(1)},${y.toFixed(1)}`).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <path d={d} stroke={positive ? 'var(--green)' : 'var(--red)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── Sentiment Badge ─── */
function SentimentBadge({ sentiment }) {
  const cfg = {
    bullish: { dot: 'var(--green)', label: 'Bullish' },
    bearish: { dot: 'var(--red)', label: 'Bearish' },
    neutral: { dot: 'var(--text-3)', label: 'Neutral' },
  }[sentiment] || { dot: 'var(--text-3)', label: 'Neutral' };
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold" style={{ color: cfg.dot }}>
      <span className="w-[6px] h-[6px] rounded-full inline-block" style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  );
}

/* ─── Post Card ─── */
function PostCard({ post, onLike, liked }) {
  return (
    <div
      className="p-4 animate-fade-up"
      style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-2.5">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-bold text-white"
          style={{ background: avatarGradient(post.initials), boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
        >
          {post.initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-head text-[13px] font-bold leading-tight truncate" style={{ color: 'var(--navy)' }}>{post.user}</p>
          <p className="text-[10px]" style={{ color: 'var(--text-3)' }}>{post.time}</p>
        </div>
        <SentimentBadge sentiment={post.sentiment} />
      </div>

      {/* Body */}
      <p className="text-[13px] leading-[1.55] mb-2.5" style={{ color: 'var(--navy)' }}>{post.text}</p>

      {/* Ticker tag */}
      {post.ticker && (
        <span
          className="inline-block text-[11px] font-bold px-2.5 py-1 mb-3"
          style={{ background: 'var(--blue-light)', color: 'var(--blue)', borderRadius: 'var(--r-sm)' }}
        >
          {post.ticker}
        </span>
      )}

      {/* Actions */}
      <div className="flex items-center gap-5 pt-2.5" style={{ borderTop: '1px solid var(--border)' }}>
        <button
          onClick={onLike}
          className="flex items-center gap-1.5 text-[12px] font-medium transition-all duration-150 active:scale-90"
          style={{ color: liked ? 'var(--red)' : 'var(--text-3)' }}
        >
          <Heart size={14} fill={liked ? 'var(--red)' : 'none'} />
          {post.likes + (liked ? 1 : 0)}
        </button>
        <span className="flex items-center gap-1.5 text-[12px] font-medium" style={{ color: 'var(--text-3)' }}>
          <MessageCircle size={14} /> {post.comments}
        </span>
        <span className="flex items-center gap-1.5 text-[12px] font-medium" style={{ color: 'var(--text-3)' }}>
          <Share2 size={14} /> Share
        </span>
      </div>
    </div>
  );
}

/* ─── Compose Modal ─── */
function ComposeModal({ onClose, onPost }) {
  const [text, setText] = useState('');
  const [ticker, setTicker] = useState('');
  const [sentiment, setSentiment] = useState('neutral');
  const [showStockSearch, setShowStockSearch] = useState(false);
  const [stockQuery, setStockQuery] = useState('');

  const filteredStocks = useMemo(() =>
    stockQuery ? STOCK_OPTIONS.filter(s => s.toLowerCase().includes(stockQuery.toLowerCase())) : STOCK_OPTIONS,
    [stockQuery]
  );

  const handlePost = useCallback(() => {
    if (!text.trim()) return;
    onPost({ text: text.trim(), ticker: ticker || null, sentiment });
    onClose();
  }, [text, ticker, sentiment, onPost, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.4)' }}>
      <div
        className="w-full max-w-[430px] animate-slide-up"
        style={{ background: 'var(--card)', borderRadius: 'var(--r-md) var(--r-md) 0 0', maxHeight: '80vh', overflow: 'auto' }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="font-head text-[15px] font-bold" style={{ color: 'var(--navy)' }}>Create Post</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
            <X size={14} style={{ color: 'var(--text-2)' }} />
          </button>
        </div>

        <div className="px-4 py-4 flex flex-col gap-3">
          {/* Textarea */}
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Share your market insight..."
            className="w-full text-[13px] leading-relaxed p-3 outline-none resize-none"
            style={{
              background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)',
              minHeight: 120, color: 'var(--navy)', fontFamily: 'inherit',
            }}
          />

          {/* Tag stock */}
          <div className="relative">
            <button
              onClick={() => setShowStockSearch(v => !v)}
              className="flex items-center gap-1.5 text-[12px] font-bold px-3 py-2 transition-all active:scale-95"
              style={{
                background: ticker ? 'var(--blue-light)' : 'var(--bg)',
                color: ticker ? 'var(--blue)' : 'var(--text-3)',
                border: '1px solid var(--border)', borderRadius: 'var(--r-sm)',
              }}
            >
              <AtSign size={13} />
              {ticker || 'Tag a stock'}
              {ticker && (
                <X size={11} className="ml-1 cursor-pointer" onClick={e => { e.stopPropagation(); setTicker(''); }} />
              )}
            </button>

            {showStockSearch && (
              <div
                className="absolute left-0 top-full mt-1 w-56 shadow-lg z-10 overflow-hidden"
                style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)' }}
              >
                <div className="px-3 py-2 flex items-center gap-2" style={{ borderBottom: '1px solid var(--border)' }}>
                  <Search size={13} style={{ color: 'var(--text-3)' }} />
                  <input
                    value={stockQuery}
                    onChange={e => setStockQuery(e.target.value)}
                    placeholder="Search ticker..."
                    className="text-[12px] flex-1 outline-none bg-transparent"
                    style={{ color: 'var(--navy)' }}
                    autoFocus
                  />
                </div>
                <div className="max-h-36 overflow-auto">
                  {filteredStocks.map(s => (
                    <button
                      key={s}
                      onClick={() => { setTicker(s); setShowStockSearch(false); setStockQuery(''); }}
                      className="w-full text-left text-[12px] font-medium px-3 py-2 hover:bg-gray-50 transition-colors"
                      style={{ color: 'var(--navy)' }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sentiment */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.5px]" style={{ color: 'var(--text-3)' }}>Sentiment</span>
            {SENTIMENTS.map(s => (
              <button
                key={s}
                onClick={() => setSentiment(s)}
                className="text-[11px] font-bold px-2.5 py-1 capitalize transition-all active:scale-95"
                style={{
                  borderRadius: 'var(--r-sm)',
                  background: sentiment === s ? (s === 'bullish' ? 'var(--green-bg, #E6FAF5)' : s === 'bearish' ? 'var(--red-bg, #FFF0F3)' : 'var(--bg)') : 'var(--bg)',
                  color: sentiment === s ? (s === 'bullish' ? 'var(--green)' : s === 'bearish' ? 'var(--red)' : 'var(--text-2)') : 'var(--text-3)',
                  border: `1px solid ${sentiment === s ? 'transparent' : 'var(--border)'}`,
                }}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Post button */}
          <button
            onClick={handlePost}
            disabled={!text.trim()}
            className="w-full py-3 text-[13px] font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40"
            style={{ background: 'var(--navy)', borderRadius: 'var(--r-md)' }}
          >
            <Send size={14} /> Post
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Main Page
   ═══════════════════════════════════════════════ */
export default function SocialFeedPage() {
  const [tab, setTab] = useState('Feed');
  const [composing, setComposing] = useState(false);
  const [likedIds, setLikedIds] = useState({});
  const [userPosts, setUserPosts] = useState(() => {
    try { return JSON.parse(localStorage.getItem('vifm-social-posts') || '[]'); } catch { return []; }
  });

  const toggleLike = useCallback((id) => {
    setLikedIds(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const addPost = useCallback((data) => {
    const post = {
      id: Date.now(),
      user: 'Aiman Sadeq',
      initials: 'AS',
      time: 'Just now',
      text: data.text,
      ticker: data.ticker,
      sentiment: data.sentiment,
      likes: 0,
      comments: 0,
    };
    const updated = [post, ...userPosts];
    setUserPosts(updated);
    try { localStorage.setItem('vifm-social-posts', JSON.stringify(updated)); } catch {}
  }, [userPosts]);

  const allPosts = useMemo(() => [...userPosts, ...MOCK_POSTS], [userPosts]);

  return (
    <div className="animate-fade-in">
      <PageHeader title="Community" subtitle="GCC Market Discussions" backTo="/" />

      {/* ─── Tab Row ─── */}
      <div className="flex items-center gap-1.5 px-5 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="text-[12px] font-bold px-4 py-1.5 transition-all duration-150"
            style={{
              borderRadius: '999px',
              background: tab === t ? 'var(--navy)' : 'transparent',
              color: tab === t ? '#fff' : 'var(--text-3)',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ─── Feed Tab ─── */}
      {tab === 'Feed' && (
        <div className="px-5 py-4 flex flex-col gap-3">
          {/* Create Post */}
          <div
            onClick={() => setComposing(true)}
            className="p-3.5 flex items-center gap-3 cursor-pointer transition-all hover:-translate-y-0.5"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)' }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-bold text-white"
              style={{ background: avatarGradient('AS'), boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
            >
              AS
            </div>
            <span className="text-[13px]" style={{ color: 'var(--text-3)' }}>What's on your mind?</span>
          </div>

          {/* Posts */}
          {allPosts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              liked={!!likedIds[post.id]}
              onLike={() => toggleLike(post.id)}
            />
          ))}
        </div>
      )}

      {/* ─── Trending Tab ─── */}
      {tab === 'Trending' && (
        <div className="px-5 py-4 flex flex-col gap-2.5">
          <p className="text-[11px] font-bold uppercase tracking-[0.8px] mb-1" style={{ color: 'var(--text-3)' }}>Most Discussed This Week</p>
          {TRENDING_TICKERS.map((t, i) => (
            <div
              key={t.ticker}
              className="p-3.5 flex items-center gap-3 animate-fade-up"
              style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', animationDelay: `${i * 60}ms` }}
            >
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                style={{ background: 'var(--blue-light)', color: 'var(--blue)' }}
              >
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-head text-[13px] font-bold leading-tight" style={{ color: 'var(--navy)' }}>
                  <span
                    className="inline-block text-[11px] font-bold px-1.5 py-0.5 mr-1.5"
                    style={{ background: 'var(--blue-light)', color: 'var(--blue)', borderRadius: 'var(--r-sm)' }}
                  >
                    {t.ticker}
                  </span>
                  {t.name}
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-3)' }}>{t.posts} posts this week</p>
              </div>
              <MiniSparkline name={t.ticker} positive={t.positive} />
            </div>
          ))}
        </div>
      )}

      {/* ─── Following Tab ─── */}
      {tab === 'Following' && (
        <EmptyState
          type="search"
          title="Follow analysts to see their posts here"
          description="Discover top analysts in the GCC market and follow their insights."
          actionLabel="Discover Analysts"
          onAction={() => setTab('Feed')}
        />
      )}

      {/* ─── Compose Modal ─── */}
      {composing && <ComposeModal onClose={() => setComposing(false)} onPost={addPost} />}
    </div>
  );
}
