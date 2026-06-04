import { useNavigate } from 'react-router-dom';
import {
  FlaskConical, ArrowRight, Layers, ShieldAlert, PieChart, Calculator,
  ScatterChart, Globe2, BarChart3, Landmark,
} from 'lucide-react';
import PageHeader from '../../components/shared/PageHeader';

const STATS = [
  { value: '180', label: 'Companies' },
  { value: '5Y', label: 'Price History' },
  { value: '36', label: 'Quant Models' },
  { value: '7', label: 'Tool Suites' },
];

const TOOLS = [
  {
    title: 'Factor Models',
    desc: 'CAPM, Fama-French, and Carhart multi-factor analysis',
    tags: ['CAPM', 'FF3', 'FF5', 'Carhart'],
    icon: Layers,
    to: '/quant/factor-models',
  },
  {
    title: 'Risk Analytics',
    desc: 'VaR, CVaR, correlations, and stress testing',
    tags: ['VaR', 'CVaR', 'Sharpe', 'Stress'],
    icon: ShieldAlert,
    to: '/quant/risk',
  },
  {
    title: 'Portfolio Optimizer',
    desc: 'Mean-variance optimization with constraints',
    tags: ['MVO', 'Efficient Frontier', 'Weights'],
    icon: PieChart,
    to: '/quant/optimizer',
  },
  {
    title: 'Valuation Tools',
    desc: 'DCF, DDM, residual income, and Z-Score models',
    tags: ['DCF', 'DDM', 'Z-Score', 'RI'],
    icon: Calculator,
    to: '/quant/valuation',
  },
  {
    title: 'Regression Lab',
    desc: 'OLS regression with diagnostics and VIF analysis',
    tags: ['OLS', 'R-Squared', 'VIF', 'F-Stat'],
    icon: ScatterChart,
    to: '/quant/regression',
  },
  {
    title: 'GCC Tools',
    desc: 'Oil sensitivity, Islamic finance, sovereign wealth',
    tags: ['Oil Beta', 'Sharia', 'SWF', 'Regional'],
    icon: Globe2,
    to: '/quant/gcc-tools',
  },
  {
    title: 'Relative Value',
    desc: 'Peer comparison and relative valuation scanner',
    tags: ['P/E', 'EV/EBITDA', 'P/B', 'Peers'],
    icon: BarChart3,
    to: '/quant/relative-value',
  },
  {
    title: 'Vision 2030',
    desc: 'Saudi diversification metrics and sector analysis',
    tags: ['Non-Oil GDP', 'Sectors', 'FDI', 'Reform'],
    icon: Landmark,
    to: '/quant/vision-2030',
  },
];

const sty = {
  page: { animation: 'fadeIn .3s ease' },
  heroWrap: { padding: '16px 16px 8px' },
  hero: {
    background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-soft) 100%)',
    borderRadius: 'var(--r-xl)',
    padding: '28px 20px',
    textAlign: 'center',
    color: '#fff',
  },
  heroIconWrap: {
    width: 48, height: 48, borderRadius: 'var(--r-lg)',
    background: 'rgba(255,255,255,0.1)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 12px',
  },
  heroTitle: { fontFamily: 'var(--font-head)', fontSize: 16, fontWeight: 700, margin: '0 0 4px' },
  heroDesc: { fontSize: 11, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5, maxWidth: 280, margin: '0 auto' },
  statsRow: { padding: '12px 16px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 },
  statCard: {
    background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)',
    padding: '10px 4px', textAlign: 'center',
  },
  statValue: { fontFamily: 'var(--font-head)', fontSize: 14, fontWeight: 700, color: 'var(--navy)' },
  statLabel: { fontSize: 10, color: 'var(--text-3)', marginTop: 2 },
  toolsSection: { padding: '0 16px 24px' },
  sectionLabel: {
    fontFamily: 'var(--font-head)', fontSize: 11, fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--text-3)', marginBottom: 10,
  },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 },
  toolCard: {
    background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)',
    padding: '14px', textAlign: 'left', cursor: 'pointer',
    display: 'flex', flexDirection: 'column',
    transition: 'box-shadow .15s, transform .15s',
  },
  iconWrap: {
    width: 40, height: 40, borderRadius: 'var(--r-sm)',
    background: '#F0EEFE', display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: 10, color: '#7C5FDB',
  },
  toolTitle: { fontFamily: 'var(--font-head)', fontSize: 12, fontWeight: 700, color: 'var(--navy)', marginBottom: 2 },
  toolDesc: { fontSize: 11, color: 'var(--text-2)', lineHeight: 1.45, marginBottom: 8, flex: 1 },
  tagsRow: { display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 },
  tag: {
    fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
    background: 'var(--blue-light)', color: 'var(--blue)',
  },
  openLink: {
    display: 'flex', alignItems: 'center', gap: 4,
    fontSize: 11, fontWeight: 600, color: 'var(--blue)',
  },
};

export default function QuantLabPage() {
  const navigate = useNavigate();

  return (
    <div style={sty.page}>
      <PageHeader title="Quant Lab" backTo="/" subtitle="Quantitative Finance Tools" />

      {/* Hero */}
      <div style={sty.heroWrap}>
        <div style={sty.hero}>
          <div style={sty.heroIconWrap}>
            <FlaskConical size={24} color="#fff" />
          </div>
          <p style={sty.heroTitle}>Quantitative Finance Lab</p>
          <p style={sty.heroDesc}>
            Professional-grade quantitative tools for GCC capital markets.
            Factor models, risk analytics, optimization, and more.
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div style={sty.statsRow}>
        {STATS.map(s => (
          <div key={s.label} style={sty.statCard}>
            <p style={sty.statValue}>{s.value}</p>
            <p style={sty.statLabel}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tool cards grid */}
      <div style={sty.toolsSection}>
        <p style={sty.sectionLabel}>Tools</p>
        <div style={sty.grid}>
          {TOOLS.map(tool => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.title}
                onClick={() => navigate(tool.to)}
                style={sty.toolCard}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,.06)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
              >
                <div style={sty.iconWrap}>
                  <Icon size={18} />
                </div>
                <h3 style={sty.toolTitle}>{tool.title}</h3>
                <p style={sty.toolDesc}>{tool.desc}</p>
                <div style={sty.tagsRow}>
                  {tool.tags.map(t => (
                    <span key={t} style={sty.tag}>{t}</span>
                  ))}
                </div>
                <div style={sty.openLink}>
                  Open <ArrowRight size={10} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
