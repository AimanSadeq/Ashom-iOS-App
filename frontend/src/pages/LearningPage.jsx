import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap, BookOpen, Users, Footprints, UserCheck,
  ChevronDown, ChevronUp, ExternalLink, Award, CheckCircle
} from 'lucide-react';

import PageHeader from '../components/shared/PageHeader';
import LoadingState from '../components/shared/LoadingState';
import useApi from '../hooks/useApi';
import { university } from '../services/api';

const FALLBACK_COURSES = [
  { id: 'investment', name: 'Investment Analysis', level: 'Undergraduate / Graduate', accent_color: '#5391D5', description: 'CAPM, Fama-French factor models, alpha and beta estimation, risk-return tradeoffs with real GCC stock data.', tools: [{ label: 'Factor Models', path: '/quant/factor-models' }, { label: 'Risk Analytics', path: '/quant/risk' }], cfa: ['CFA L1: Equity', 'CFA L2: Quant'], total_steps: 14 },
  { id: 'portfolio', name: 'Portfolio Management', level: 'Graduate / CFA Prep', accent_color: '#8B5CF6', description: 'Markowitz optimization, efficient frontiers, risk parity, tangency portfolios using real multi-asset GCC data.', tools: [{ label: 'Portfolio Optimizer', path: '/quant/optimizer' }], cfa: ['CFA L3: Portfolio', 'CFA L1: Quant'], total_steps: 7 },
  { id: 'corporate', name: 'Corporate Finance', level: 'Undergraduate / Graduate', accent_color: '#F59E0B', description: 'DCF valuation, DDM, residual income models, financial scoring on GCC companies.', tools: [{ label: 'Valuation Tools', path: '/quant/valuation' }], cfa: ['CFA L1: Corp Fin', 'CFA L2: Equity'], total_steps: 7 },
  { id: 'econometrics', name: 'Financial Econometrics', level: 'Graduate', accent_color: '#EC4899', description: 'OLS regression, diagnostics (DW, VIF, heteroscedasticity), cross-sectional analysis on GCC financial data.', tools: [{ label: 'Regression Lab', path: '/quant/regression' }], cfa: ['CFA L1: Quant', 'CFA L2: Quant'], total_steps: 6 },
  { id: 'gcc', name: 'GCC Capital Markets', level: 'Undergraduate / Graduate', accent_color: '#00C896', description: 'Oil sensitivity, Sharia compliance screening, country comparison, DuPont analysis, and economic diversification scoring.', tools: [{ label: 'GCC Tools', path: '/quant/gcc-tools' }, { label: 'Vision 2030', path: '/quant/vision-2030' }], cfa: ['CFA L1: Equity', 'CFA L2: FRA'], total_steps: 6 },
  { id: 'crossmarket', name: 'Cross-Market Analysis', level: 'Graduate / Professional', accent_color: '#10B981', description: 'Relative value analysis, cross-GCC arbitrage identification, factor-adjusted spread decomposition.', tools: [{ label: 'Relative Value', path: '/quant/relative-value' }], cfa: ['CFA L3: Portfolio', 'CFA L2: Equity'], total_steps: 0 },
];

const CFA_ALIGNMENT = [
  { level: 'CFA Level I', topics: [
    { topic: 'Quantitative Methods', tool: 'Regression Lab, Factor Models' },
    { topic: 'Equity Investments', tool: 'GCC Tools, Factor Models, EDS Score' },
    { topic: 'Corporate Issuers', tool: 'Valuation Tools (DCF, DDM)' },
    { topic: 'Portfolio Management', tool: 'Portfolio Optimizer (Intro)' },
  ]},
  { level: 'CFA Level II', topics: [
    { topic: 'Quantitative Methods', tool: 'Regression Lab (OLS diagnostics, VIF)' },
    { topic: 'Equity Valuation', tool: 'Valuation Tools (multi-stage DDM, residual income)' },
    { topic: 'Financial Reporting', tool: 'GCC Tools (DuPont, Beneish M-Score)' },
    { topic: 'Asset Pricing', tool: 'Factor Models (FF3, FF5, Carhart)' },
  ]},
  { level: 'CFA Level III', topics: [
    { topic: 'Portfolio Management', tool: 'Portfolio Optimizer (efficient frontier, risk parity)' },
    { topic: 'Risk Management', tool: 'Risk Analytics (VaR, CVaR, stress testing)' },
    { topic: 'Asset Allocation', tool: 'Relative Value Scanner, cross-market analysis' },
  ]},
];

const s = {
  sectionLabel: {
    fontFamily: 'var(--font-head)', fontSize: 11, fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--text-3)',
    marginBottom: 10,
  },
  card: {
    background: 'var(--card)', border: '1px solid var(--border)',
    borderRadius: 'var(--r-md)', overflow: 'hidden',
  },
  chip: (active) => ({
    padding: '6px 14px', borderRadius: 20, fontSize: 11, fontWeight: 600,
    border: '1px solid ' + (active ? 'var(--navy)' : 'var(--border)'),
    background: active ? 'var(--navy)' : 'var(--card)',
    color: active ? '#fff' : 'var(--text-2)',
    cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'var(--font-body)',
  }),
};

export default function LearningPage() {
  const navigate = useNavigate();
  const { data, loading } = useApi(university.courses);
  const [expandedCourse, setExpandedCourse] = useState(null);

  const rawCourses = Array.isArray(data) ? data : data?.courses || [];
  const courseList = rawCourses.length > 0 ? rawCourses : FALLBACK_COURSES;
  const totalSteps = courseList.reduce((sum, c) => sum + (c.total_steps || 0), 0);

  const stats = [
    { icon: Users, label: 'Partners', value: '6', bg: 'var(--green-bg)', color: 'var(--green)' },
    { icon: BookOpen, label: 'Courses', value: String(courseList.length), bg: 'var(--blue-light)', color: 'var(--blue)' },
    { icon: Footprints, label: 'Guided Steps', value: String(totalSteps || 40), bg: '#FFF7ED', color: '#D97706' },
    { icon: UserCheck, label: 'Enrolled', value: '0', bg: '#F3EEFF', color: '#7C3AED' },
  ];

  function toggleCourse(id) {
    setExpandedCourse(prev => prev === id ? null : id);
  }

  return (
    <div>
      <PageHeader title="Learning Academy" backTo="/" subtitle="Educational Hub" />

      {/* Hero */}
      <div style={{ margin: '16px 20px 0', borderRadius: 'var(--r-lg)', background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-soft) 100%)', padding: 20, color: '#fff' }}>
        <div style={{ width: 40, height: 40, borderRadius: 'var(--r-sm)', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
          <GraduationCap size={20} />
        </div>
        <h2 style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.3, marginBottom: 4, fontFamily: 'var(--font-head)' }}>VIFM Academic Programs</h2>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
          Master financial analysis with courses designed for GCC capital markets. Earn certificates and build careers.
        </p>
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <button onClick={() => navigate('/university')}
            style={{ padding: '9px 16px', background: '#fff', color: 'var(--navy)', fontSize: 12, fontWeight: 600, borderRadius: 'var(--r-sm)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-head)' }}>
            View Partners
          </button>
          <button onClick={() => navigate('/paths')}
            style={{ padding: '9px 16px', background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: 12, fontWeight: 600, borderRadius: 'var(--r-sm)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-head)' }}>
            Learning Paths
          </button>
        </div>
      </div>

      {/* Quick links */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, padding: '12px 20px 0' }}>
        {[
          { icon: Footprints, label: 'Learning Paths', sub: 'Structured courses', path: '/paths', color: 'var(--blue)' },
          { icon: BookOpen, label: 'Glossary', sub: '25+ terms', path: '/glossary', color: '#7C3AED' },
          { icon: Users, label: 'Classroom', sub: 'Compete', path: '/classroom', color: 'var(--green)' },
        ].map(item => (
          <button key={item.label} onClick={() => navigate(item.path)}
            style={{ ...s.card, padding: 14, textAlign: 'center', cursor: 'pointer' }}>
            <item.icon size={16} style={{ color: item.color, margin: '0 auto 6px' }} />
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--navy)', fontFamily: 'var(--font-head)' }}>{item.label}</p>
            <p style={{ fontSize: 9, color: 'var(--text-3)', marginTop: 2 }}>{item.sub}</p>
          </button>
        ))}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, padding: '14px 20px 0' }}>
        {stats.map(st => (
          <div key={st.label} style={{ ...s.card, textAlign: 'center', padding: '14px 0' }}>
            <div style={{ width: 32, height: 32, borderRadius: 'var(--r-sm)', background: st.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px' }}>
              <st.icon size={14} style={{ color: st.color }} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)', fontFamily: 'var(--font-head)' }}>{st.value}</p>
            <p style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>{st.label}</p>
          </div>
        ))}
      </div>

      {/* Courses -- expandable */}
      <div style={{ padding: '20px 20px 0' }}>
        <p style={s.sectionLabel}>Academic Curriculum</p>

        {loading && <LoadingState message="Loading courses..." />}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {courseList.map((c, i) => {
            const color = c.accent_color || '#5391D5';
            const tools = c.tools || c.tool_page_urls || [];
            const cfa = Array.isArray(c.cfa || c.cfa_alignment) ? (c.cfa || c.cfa_alignment) : [];
            const isOpen = expandedCourse === (c.id || i);

            return (
              <div key={c.id || i} style={s.card}>
                {/* Course Header */}
                <button
                  onClick={() => toggleCourse(c.id || i)}
                  style={{
                    width: '100%', padding: 14, display: 'flex', alignItems: 'flex-start', gap: 12,
                    textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer',
                  }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 'var(--r-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: color + '1A', color }}>
                    <BookOpen size={16} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)', lineHeight: 1.3, fontFamily: 'var(--font-head)' }}>{c.name}</h3>
                    <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{c.level}</p>
                  </div>
                  <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    {c.total_steps > 0 && (
                      <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 6, background: '#F3EEFF', color: '#7C3AED', fontWeight: 500 }}>{c.total_steps} steps</span>
                    )}
                    {isOpen ? <ChevronUp size={14} style={{ color: 'var(--text-3)' }} /> : <ChevronDown size={14} style={{ color: 'var(--text-3)' }} />}
                  </div>
                </button>

                {/* Expanded Details */}
                {isOpen && (
                  <div style={{ padding: '0 14px 14px', borderTop: '1px solid var(--border)' }}>
                    <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6, marginTop: 12, marginBottom: 12 }}>{c.description}</p>

                    {tools.length > 0 && (
                      <div style={{ marginBottom: 12 }}>
                        <p style={{ ...s.sectionLabel, marginBottom: 6 }}>Tools</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {tools.map((t, ti) => (
                            <button key={ti} onClick={() => navigate(t.path || t.url || '/quant')}
                              style={{
                                fontSize: 11, fontWeight: 600, color: 'var(--blue)', background: 'var(--blue-light)',
                                padding: '5px 10px', borderRadius: 'var(--r-sm)', border: 'none', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: 4,
                              }}>
                              <ExternalLink size={8} /> {t.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {cfa.length > 0 && (
                      <div>
                        <p style={{ ...s.sectionLabel, marginBottom: 6 }}>CFA Alignment</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {cfa.map((tag, ti) => (
                            <span key={ti} style={{
                              fontSize: 10, padding: '3px 10px', borderRadius: 20,
                              background: '#FFF7ED', color: '#D97706', fontWeight: 500,
                              border: '1px solid #FDE68A',
                            }}>{tag}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* CFA Curriculum Alignment */}
      <div style={{ padding: '24px 20px 0' }}>
        <p style={{ ...s.sectionLabel, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Award size={12} style={{ color: '#D97706' }} /> CFA Curriculum Alignment
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {CFA_ALIGNMENT.map((level, li) => (
            <div key={li} style={{ ...s.card, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <CheckCircle size={14} style={{ color: 'var(--green)' }} />
                <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', fontFamily: 'var(--font-head)' }}>{level.level}</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {level.topics.map((t, ti) => (
                  <div key={ti} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, paddingLeft: 4 }}>
                    <CheckCircle size={10} style={{ color: 'var(--green)', marginTop: 2, flexShrink: 0, opacity: 0.6 }} />
                    <p style={{ fontSize: 12, color: 'var(--text-2)' }}>
                      <span style={{ fontWeight: 600, color: 'var(--navy)' }}>{t.topic}</span>
                      <span style={{ color: 'var(--text-3)' }}> -- {t.tool}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ height: 24 }} />
    </div>
  );
}
