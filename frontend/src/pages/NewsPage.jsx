import { useState, useEffect, useRef, useCallback } from 'react';
import { Circle, RefreshCw, Search, ExternalLink, Newspaper, X, Clock, Share2 } from 'lucide-react';

import PageHeader from '../components/shared/PageHeader';
import LoadingState from '../components/shared/LoadingState';
import { news } from '../services/api';

const CATEGORIES = ['All', 'Business', 'Finance', 'Tech', 'Investment', 'Real Estate', 'Banking'];

const CATEGORY_API_MAP = {
  'All': 'all', 'Business': 'business', 'Finance': 'finance', 'Tech': 'technology',
  'Investment': 'investment', 'Real Estate': 'realestate', 'Banking': 'banking',
};

const CATEGORY_COLORS = {
  all: { bg: 'var(--blue-light)', text: 'var(--blue)' },
  business: { bg: 'var(--green-bg)', text: 'var(--green)' },
  finance: { bg: '#F3EEFF', text: '#7C3AED' },
  tech: { bg: '#FFF7ED', text: '#D97706' },
  investment: { bg: 'var(--green-bg)', text: 'var(--green)' },
  'real estate': { bg: 'var(--red-bg)', text: 'var(--red)' },
  banking: { bg: 'var(--blue-light)', text: 'var(--blue)' },
};

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  } catch { return dateStr; }
}

function formatFullDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return dateStr; }
}

// Article Detail Modal
function ArticleModal({ article, onClose }) {
  if (!article) return null;

  const catKey = (article.category || 'business').toLowerCase();
  const catCol = CATEGORY_COLORS[catKey] || CATEGORY_COLORS.all;
  const content = article.content || article.body || article.snippet || article.description || '';
  const paragraphs = content.split(/\n\n|\n/).filter(p => p.trim());

  return (
    <div
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-lg)',
        overflow: 'hidden',
        minHeight: 'calc(100vh - 280px)',
      }}
    >
      {/* Header bar */}
      <div style={{ background: 'var(--navy)', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px',
            padding: '2px 8px', borderRadius: 20, background: 'rgba(255,255,255,0.15)', color: '#fff',
            fontFamily: 'var(--font-head)',
          }}>
            {article.category || 'Business'}
          </span>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{formatDate(article.date || article.publishedAt)}</span>
        </div>
        <button onClick={onClose} style={{ padding: 4, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <X size={14} style={{ color: 'rgba(255,255,255,0.6)' }} />
        </button>
      </div>

      {/* Article image */}
      {article.image && (
        <div style={{ width: '100%', height: 128, overflow: 'hidden' }}>
          <img src={article.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}

      {/* Content */}
      <div style={{ padding: '14px 16px' }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)', lineHeight: 1.4, marginBottom: 8, fontFamily: 'var(--font-head)' }}>
          {article.title}
        </h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 10, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Newspaper size={9} /> {article.source || 'Unknown'}
          </span>
          <span style={{ fontSize: 10, color: 'var(--text-3)' }}>|</span>
          <span style={{ fontSize: 10, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={9} /> {formatFullDate(article.date || article.publishedAt)}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {paragraphs.length > 0 ? (
            paragraphs.map((p, i) => (
              <p key={i} style={{ fontSize: 11, color: 'var(--text-2)', lineHeight: 1.6, margin: 0, fontFamily: 'var(--font-body)' }}>{p.trim()}</p>
            ))
          ) : (
            <p style={{ fontSize: 11, color: 'var(--text-2)', lineHeight: 1.6, margin: 0 }}>
              {article.snippet || article.description || 'Full article content is not available in the app.'}
            </p>
          )}
        </div>

        {article.url && (
          <a href={article.url} target="_blank" rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              marginTop: 14, padding: '10px 0', borderRadius: 'var(--r-md)',
              background: 'var(--blue-light)', color: 'var(--blue)',
              fontSize: 11, fontWeight: 600, textDecoration: 'none',
              fontFamily: 'var(--font-head)',
            }}>
            <ExternalLink size={10} /> Read Full Article
          </a>
        )}
      </div>
    </div>
  );
}

export default function NewsPage() {
  const [articles, setArticles]     = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [category, setCategory]     = useState('All');
  const [search, setSearch]         = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const intervalRef = useRef(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const cat = CATEGORY_API_MAP[category] || category.toLowerCase();
      const res = await news.list(cat);
      const items = res?.data?.articles || res?.data || res?.articles || res || [];
      setArticles(Array.isArray(items) ? items : []);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err.message);
      if (!articles) setArticles([]);
    } finally {
      setLoading(false);
    }
  }, [category]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchData();
    intervalRef.current = setInterval(fetchData, 60000);
    const handleVisibility = () => {
      if (document.hidden) { clearInterval(intervalRef.current); }
      else { fetchData(); intervalRef.current = setInterval(fetchData, 60000); }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => { clearInterval(intervalRef.current); document.removeEventListener('visibilitychange', handleVisibility); };
  }, [fetchData]);

  const filteredArticles = (articles || []).filter(a => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (a.title || '').toLowerCase().includes(q) || (a.source || '').toLowerCase().includes(q) || (a.snippet || a.description || '').toLowerCase().includes(q);
  });

  const sectionLabel = {
    fontFamily: 'var(--font-head)', fontSize: 11, fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--text-3)',
  };

  const chipBase = {
    padding: '6px 14px', borderRadius: 20, fontSize: 11, fontWeight: 600,
    border: '1px solid var(--border)', cursor: 'pointer', whiteSpace: 'nowrap',
    fontFamily: 'var(--font-body)', transition: 'all 0.15s',
  };

  return (
    <div>
      <PageHeader title="News Stream" subtitle="GCC & Global Financial News" backTo="/" />

      {/* Live indicator */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Circle size={8} style={{ color: 'var(--green)', fill: 'var(--green)' }} className="animate-pulse" />
          <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Live</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {lastUpdated && <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Updated {lastUpdated.toLocaleTimeString()}</span>}
          <button onClick={fetchData} aria-label="Refresh"
            style={{ padding: 4, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer' }}>
            <RefreshCw size={12} style={{ color: 'var(--text-3)' }} />
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{ padding: '0 20px', marginBottom: 10 }}>
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search articles..."
            style={{
              width: '100%', fontSize: 13, border: '1px solid var(--border)', borderRadius: 'var(--r-md)',
              paddingLeft: 36, paddingRight: 12, paddingTop: 10, paddingBottom: 10,
              outline: 'none', background: 'var(--card)', color: 'var(--text-1)',
              fontFamily: 'var(--font-body)',
            }} />
        </div>
      </div>

      {/* Category chips */}
      <div style={{ display: 'flex', gap: 6, padding: '0 20px 10px', overflowX: 'auto' }} className="scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)}
            style={{
              ...chipBase,
              background: category === cat ? 'var(--navy)' : 'var(--card)',
              color: category === cat ? '#fff' : 'var(--text-2)',
              borderColor: category === cat ? 'var(--navy)' : 'var(--border)',
            }}>
            {cat}
          </button>
        ))}
      </div>

      {error && (
        <div style={{
          margin: '0 20px 10px', padding: '8px 12px', borderRadius: 'var(--r-sm)',
          background: '#FFF7ED', color: '#D97706', fontSize: 11,
        }}>
          {error}
        </div>
      )}

      {/* Articles */}
      <div style={{ padding: '0 20px 20px' }}>
        {loading && !articles ? (
          <LoadingState message="Loading news..." />
        ) : filteredArticles.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 0' }}>
            <div style={{ width: 48, height: 48, borderRadius: 'var(--r-lg)', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <Newspaper size={20} style={{ color: 'var(--text-3)' }} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--navy)', marginBottom: 4, fontFamily: 'var(--font-head)' }}>No articles found</p>
            <p style={{ fontSize: 11, color: 'var(--text-3)' }}>{search.trim() ? 'Try a different search term.' : 'No news available for this category.'}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filteredArticles.map((article, idx) => {
              const catKey = (article.category || 'business').toLowerCase();
              const catCol = CATEGORY_COLORS[catKey] || CATEGORY_COLORS.all;
              const isSelected = selectedArticle && (selectedArticle.id || selectedArticle.title) === (article.id || article.title);

              if (isSelected) {
                return (
                  <ArticleModal key={article.id || idx} article={article} onClose={() => setSelectedArticle(null)} />
                );
              }

              return (
                <button
                  key={article.id || idx}
                  onClick={() => setSelectedArticle(article)}
                  style={{
                    background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)',
                    padding: 14, width: '100%', textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                      background: catCol.bg, color: catCol.text, flexShrink: 0,
                    }}>
                      {article.category || 'Business'}
                    </span>
                    <span style={{ fontSize: 10, color: 'var(--text-3)', marginLeft: 'auto', flexShrink: 0 }}>
                      {formatDate(article.date || article.publishedAt)}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)', lineHeight: 1.4, marginBottom: 4, fontFamily: 'var(--font-head)' }}>
                    {article.title}
                  </p>
                  {(article.snippet || article.description) && (
                    <p style={{ fontSize: 11, color: 'var(--text-3)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {article.snippet || article.description}
                    </p>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{article.source || 'Unknown'}</span>
                    <span style={{ fontSize: 11, color: 'var(--blue)', fontWeight: 600 }}>Read more</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
