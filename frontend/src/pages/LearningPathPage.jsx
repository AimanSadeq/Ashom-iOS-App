import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, CheckCircle, Circle, Lock, ChevronRight, Award, ArrowLeft,
  TrendingUp, BarChart2, PieChart, DollarSign, Shield, Zap
} from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';

const PROGRESS_KEY = 'vifm-learning-progress';

function loadProgress() {
  try { return JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {}; }
  catch { return {}; }
}

function saveProgress(data) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(data));
}

const PATHS = [
  {
    id: 'fundamentals',
    title: 'Financial Analysis Fundamentals',
    subtitle: 'Perfect for beginners',
    icon: BookOpen,
    gradient: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-soft) 100%)',
    iconBg: 'var(--blue-light)', iconColor: 'var(--blue)',
    duration: '4 weeks',
    lessons: [
      { id: 'f1', title: 'What is a Stock?', desc: 'Understanding equity ownership, shares, and why companies go public.', duration: '8 min' },
      { id: 'f2', title: 'How Stock Markets Work', desc: 'Order types, exchanges, trading hours, and how prices are set.', duration: '10 min' },
      { id: 'f3', title: 'Reading Financial Statements', desc: 'Income statement, balance sheet, and cash flow — the basics.', duration: '15 min' },
      { id: 'f4', title: 'Key Financial Ratios', desc: 'P/E, P/B, ROE, D/E — what they mean and how to use them.', duration: '12 min', link: '/curated' },
      { id: 'f5', title: 'Understanding Risk', desc: 'Volatility, beta, diversification, and the risk-return tradeoff.', duration: '10 min' },
      { id: 'f6', title: 'Introduction to GCC Markets', desc: 'The 6 GCC exchanges, regulatory bodies, and market structure.', duration: '12 min', link: '/sectors' },
      { id: 'f7', title: 'Building Your First Watchlist', desc: 'How to screen, compare, and track companies you are interested in.', duration: '8 min', link: '/watchlist' },
      { id: 'f8', title: 'Your First Investment Decision', desc: 'Putting it all together — analyze a real GCC company step by step.', duration: '15 min', link: '/companies' },
    ],
  },
  {
    id: 'valuation',
    title: 'Company Valuation',
    subtitle: 'CFA Level I aligned',
    icon: DollarSign,
    gradient: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
    iconBg: '#FFF7ED', iconColor: '#D97706',
    duration: '6 weeks',
    lessons: [
      { id: 'v1', title: 'Intrinsic Value vs Market Price', desc: 'Why stocks can be overvalued or undervalued, and how to tell.', duration: '10 min' },
      { id: 'v2', title: 'Price-to-Earnings (P/E) Deep Dive', desc: 'Trailing vs forward P/E, sector comparisons, limitations.', duration: '12 min', link: '/curated' },
      { id: 'v3', title: 'Discounted Cash Flow (DCF)', desc: 'Projecting cash flows, WACC, terminal value, and sensitivity analysis.', duration: '20 min', link: '/quant/valuation' },
      { id: 'v4', title: 'Dividend Discount Model (DDM)', desc: 'Gordon Growth Model, multi-stage DDM, dividend sustainability.', duration: '15 min', link: '/quant/valuation' },
      { id: 'v5', title: 'Relative Valuation', desc: 'Comparable company analysis, EV/EBITDA multiples, peer groups.', duration: '15 min', link: '/quant/relative-value' },
      { id: 'v6', title: 'Valuing GCC Companies', desc: 'Apply valuation techniques to real Saudi, UAE, and Qatari companies.', duration: '20 min', link: '/companies' },
    ],
  },
  {
    id: 'portfolio-mgmt',
    title: 'Portfolio Management',
    subtitle: 'CFA Level III aligned',
    icon: PieChart,
    gradient: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
    iconBg: '#F3EEFF', iconColor: '#7C3AED',
    duration: '6 weeks',
    lessons: [
      { id: 'p1', title: 'Modern Portfolio Theory', desc: 'Markowitz, efficient frontier, and the power of diversification.', duration: '15 min' },
      { id: 'p2', title: 'Asset Allocation Strategies', desc: 'Strategic vs tactical, core-satellite, risk parity approaches.', duration: '12 min' },
      { id: 'p3', title: 'Risk Metrics', desc: 'Sharpe Ratio, Sortino, Max Drawdown, Value at Risk (VaR).', duration: '15 min', link: '/quant/risk' },
      { id: 'p4', title: 'Factor Investing', desc: 'Size, value, momentum, quality factors in GCC markets.', duration: '18 min', link: '/quant/factor-models' },
      { id: 'p5', title: 'Portfolio Optimization', desc: 'Build an optimal GCC portfolio using the optimizer tool.', duration: '20 min', link: '/quant/optimizer' },
      { id: 'p6', title: 'Practice: Build a Portfolio', desc: 'Use the simulator to build and track a $100K virtual portfolio.', duration: '30 min', link: '/portfolio' },
    ],
  },
  {
    id: 'gcc-markets',
    title: 'GCC Capital Markets',
    subtitle: 'Regional specialization',
    icon: Zap,
    gradient: 'linear-gradient(135deg, var(--green) 0%, #059669 100%)',
    iconBg: 'var(--green-bg)', iconColor: 'var(--green)',
    duration: '4 weeks',
    lessons: [
      { id: 'g1', title: 'Saudi Arabia (Tadawul)', desc: 'TASI index, Vision 2030, Aramco, banking sector overview.', duration: '12 min', link: '/sectors' },
      { id: 'g2', title: 'UAE (DFM & ADX)', desc: 'Dubai and Abu Dhabi exchanges, real estate, tourism sectors.', duration: '12 min' },
      { id: 'g3', title: 'Kuwait, Qatar, Bahrain, Oman', desc: 'Smaller GCC markets — key companies and investment themes.', duration: '15 min', link: '/companies' },
      { id: 'g4', title: 'Oil & Commodities Impact', desc: 'How oil prices drive GCC equity markets and fiscal policy.', duration: '10 min', link: '/metals' },
      { id: 'g5', title: 'Sharia-Compliant Investing', desc: 'Islamic finance principles, sukuk, halal screening criteria.', duration: '12 min' },
      { id: 'g6', title: 'Regulatory Landscape', desc: 'CMA, SCA, QFMA — understanding GCC market regulation.', duration: '10 min', link: '/markets' },
    ],
  },
];

const card = { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)' };
const sectionLabel = {
  fontFamily: 'var(--font-head)', fontSize: 11, fontWeight: 700,
  textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--text-3)',
  marginBottom: 10,
};

export default function LearningPathPage() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(loadProgress);
  const [selectedPath, setSelectedPath] = useState(null);

  function isCompleted(lessonId) {
    return progress[lessonId] === true;
  }

  function toggleLesson(lessonId) {
    const updated = { ...progress, [lessonId]: !progress[lessonId] };
    setProgress(updated);
    saveProgress(updated);
  }

  function getPathProgress(path) {
    const completed = path.lessons.filter(l => isCompleted(l.id)).length;
    return { completed, total: path.lessons.length, pct: path.lessons.length > 0 ? (completed / path.lessons.length * 100) : 0 };
  }

  const totalCompleted = Object.values(progress).filter(Boolean).length;
  const totalLessons = PATHS.reduce((sum, p) => sum + p.lessons.length, 0);

  // Path detail view
  if (selectedPath) {
    const pathProgress = getPathProgress(selectedPath);
    const Icon = selectedPath.icon;

    return (
      <div>
        <PageHeader title={selectedPath.title} subtitle={selectedPath.subtitle} backTo="/paths" />

        <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Path hero */}
          <div style={{ borderRadius: 'var(--r-lg)', background: selectedPath.gradient, padding: 16, color: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--r-sm)', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={20} />
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-head)' }}>{selectedPath.title}</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{selectedPath.duration} -- {selectedPath.lessons.length} lessons</p>
              </div>
            </div>
            {/* Progress bar */}
            <div style={{ marginTop: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{pathProgress.completed}/{pathProgress.total} completed</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}>{pathProgress.pct.toFixed(0)}%</span>
              </div>
              <div style={{ height: 8, background: 'rgba(255,255,255,0.2)', borderRadius: 20, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: '#fff', borderRadius: 20, transition: 'width 0.5s', width: `${pathProgress.pct}%` }} />
              </div>
            </div>
            {pathProgress.pct >= 100 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, background: 'rgba(255,255,255,0.15)', borderRadius: 'var(--r-sm)', padding: '8px 12px' }}>
                <Award size={14} />
                <span style={{ fontSize: 11, fontWeight: 700 }}>Path Complete! Certificate earned.</span>
              </div>
            )}
          </div>

          {/* Lessons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {selectedPath.lessons.map((lesson, i) => {
              const completed = isCompleted(lesson.id);
              const prevCompleted = i === 0 || isCompleted(selectedPath.lessons[i - 1].id);

              return (
                <div key={lesson.id} style={{ ...card, padding: 12, opacity: (!prevCompleted && !completed) ? 0.5 : 1 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    {/* Checkbox */}
                    <button onClick={() => toggleLesson(lesson.id)}
                      style={{ marginTop: 2, flexShrink: 0, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
                      {completed
                        ? <CheckCircle size={18} style={{ color: 'var(--green)' }} />
                        : prevCompleted
                          ? <Circle size={18} style={{ color: 'var(--text-3)' }} />
                          : <Lock size={16} style={{ color: 'var(--border)' }} />
                      }
                    </button>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <p style={{
                          fontSize: 12, fontWeight: 600, lineHeight: 1.3,
                          color: completed ? 'var(--text-3)' : 'var(--navy)',
                          textDecoration: completed ? 'line-through' : 'none',
                          fontFamily: 'var(--font-head)',
                        }}>
                          {lesson.title}
                        </p>
                        <span style={{ fontSize: 10, color: 'var(--text-3)' }}>{lesson.duration}</span>
                      </div>
                      <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2, lineHeight: 1.5 }}>{lesson.desc}</p>
                    </div>

                    {/* Link to tool */}
                    {lesson.link && prevCompleted && (
                      <button onClick={() => navigate(lesson.link)}
                        style={{
                          padding: 6, borderRadius: 'var(--r-sm)', background: 'var(--blue-light)',
                          border: 'none', cursor: 'pointer', flexShrink: 0,
                        }}>
                        <ChevronRight size={12} style={{ color: 'var(--blue)' }} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Paths list view
  return (
    <div>
      <PageHeader title="Learning Paths" subtitle="Structured courses" backTo="/learning" />

      <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Overall progress */}
        <div style={{
          ...card, padding: 16,
          background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-soft) 100%)',
          color: '#fff', border: 'none',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 'var(--r-sm)', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={20} />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-head)' }}>Your Progress</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{totalCompleted} of {totalLessons} lessons completed</p>
            </div>
          </div>
          <div style={{ height: 8, background: 'rgba(255,255,255,0.2)', borderRadius: 20, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: '#fff', borderRadius: 20, transition: 'width 0.3s', width: `${totalLessons > 0 ? (totalCompleted / totalLessons * 100) : 0}%` }} />
          </div>
        </div>

        {/* Paths */}
        <p style={sectionLabel}>Choose a Path</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {PATHS.map(path => {
            const Icon = path.icon;
            const prog = getPathProgress(path);
            return (
              <button
                key={path.id}
                onClick={() => setSelectedPath(path)}
                style={{ ...card, width: '100%', textAlign: 'left', padding: 14, cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 'var(--r-sm)',
                    background: path.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Icon size={18} style={{ color: path.iconColor }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', fontFamily: 'var(--font-head)' }}>{path.title}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-3)' }}>{path.subtitle} -- {path.duration}</p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    {prog.pct >= 100 ? (
                      <Award size={16} style={{ color: '#D97706' }} />
                    ) : (
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', fontFamily: 'var(--font-head)' }}>{prog.pct.toFixed(0)}%</span>
                    )}
                    <p style={{ fontSize: 11, color: 'var(--text-3)' }}>{prog.completed}/{prog.total}</p>
                  </div>
                </div>
                {/* Mini progress bar */}
                <div style={{ marginTop: 8, height: 4, background: 'var(--bg)', borderRadius: 20, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 20, background: path.gradient, transition: 'width 0.3s', width: `${prog.pct}%` }} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
