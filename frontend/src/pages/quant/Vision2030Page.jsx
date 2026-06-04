import { useState } from 'react';
import { Landmark, Play, TrendingUp, TrendingDown } from 'lucide-react';
import PageHeader from '../../components/shared/PageHeader';
import { quant } from '../../services/api';

/* ── constants ──────────────────────────────────────── */
const SECTORS = [
  { id: 'tourism', label: 'Tourism & Entertainment' },
  { id: 'technology', label: 'Technology & Digital' },
  { id: 'mining', label: 'Mining & Metals' },
  { id: 'manufacturing', label: 'Manufacturing' },
  { id: 'financial', label: 'Financial Services' },
  { id: 'healthcare', label: 'Healthcare' },
  { id: 'real_estate', label: 'Real Estate' },
  { id: 'renewable', label: 'Renewable Energy' },
  { id: 'logistics', label: 'Logistics & Transport' },
  { id: 'retail', label: 'Retail & Consumer' },
];

const METRIC_GROUPS = [
  { id: 'diversification', label: 'Diversification Score' },
  { id: 'non_oil_revenue', label: 'Non-Oil Revenue' },
  { id: 'fdi_exposure', label: 'FDI Exposure' },
  { id: 'reform_alignment', label: 'Reform Alignment' },
];

/* ── styles ─────────────────────────────────────────── */
const s = {
  page: { animation: 'fadeIn .3s ease' },
  body: { padding: '16px 16px 24px', display: 'flex', flexDirection: 'column', gap: 16 },
  heroCard: {
    background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 16,
    backgroundImage: 'linear-gradient(135deg, var(--blue-light) 0%, var(--card) 60%)',
    display: 'flex', alignItems: 'center', gap: 12,
  },
  heroIcon: {
    width: 40, height: 40, borderRadius: 'var(--r-sm)',
    background: '#F0EEFE', display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#7C5FDB', flexShrink: 0,
  },
  heroTitle: { fontFamily: 'var(--font-head)', fontSize: 12, fontWeight: 700, color: 'var(--navy)' },
  heroDesc: { fontSize: 11, color: 'var(--text-2)' },
  label: {
    fontFamily: 'var(--font-head)', fontSize: 11, fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--text-3)',
    display: 'block', marginBottom: 6,
  },
  pillRow: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  pill: (active) => ({
    padding: '6px 12px', borderRadius: 999, fontSize: 11,
    fontWeight: 600, cursor: 'pointer', border: 'none', transition: 'all .15s',
    background: active ? 'var(--navy)' : 'var(--card)',
    color: active ? '#fff' : 'var(--text-2)',
    ...(active ? {} : { border: '1px solid var(--border)' }),
  }),
  countText: { fontSize: 10, color: 'var(--text-3)', marginTop: 4 },
  metricGrid: { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 6 },
  metricChip: (active) => ({
    padding: '10px 12px', borderRadius: 'var(--r-md)', fontSize: 11,
    fontWeight: 600, textAlign: 'center', cursor: 'pointer', border: 'none',
    transition: 'all .15s',
    background: active ? 'var(--navy)' : 'var(--card)',
    color: active ? '#fff' : 'var(--text-2)',
    ...(active ? {} : { border: '1px solid var(--border)' }),
  }),
  runBtn: (disabled) => ({
    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: '12px 0', borderRadius: 'var(--r-md)', fontSize: 12, fontWeight: 700,
    color: '#fff', background: 'var(--navy)', border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1,
  }),
  errBox: { background: 'var(--red-bg)', border: '1px solid var(--red)', borderRadius: 'var(--r-md)', padding: 12 },
  errText: { fontSize: 12, color: 'var(--red)' },
  empty: { textAlign: 'center', padding: '40px 0' },
  emptyText: { fontSize: 12, color: 'var(--text-3)' },
  card: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 16 },
  cardTitle: { fontFamily: 'var(--font-head)', fontSize: 12, fontWeight: 700, color: 'var(--navy)', marginBottom: 12 },
  scoreCard: {
    background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 16,
    textAlign: 'center',
  },
  bigScore: { fontFamily: 'var(--font-head)', fontSize: 32, fontWeight: 700, color: 'var(--blue)' },
  subLabel: { fontSize: 10, color: 'var(--text-3)' },
  barBg: { height: 8, background: 'var(--bg)', borderRadius: 999, overflow: 'hidden' },
  barFill: (score) => ({
    height: '100%', borderRadius: 999,
    width: `${Math.min(score || 0, 100)}%`,
    background: (score || 0) >= 70 ? 'var(--green)' : (score || 0) >= 40 ? 'var(--blue)' : 'var(--red)',
  }),
  diagGrid: { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 },
  diagLabel: { fontSize: 10, color: 'var(--text-3)' },
  diagValue: { fontFamily: 'var(--font-head)', fontSize: 14, fontWeight: 700, color: 'var(--navy)' },
  insightDot: { width: 4, height: 4, borderRadius: 999, background: 'var(--blue)', marginTop: 6, flexShrink: 0 },
  insightText: { fontSize: 11, color: 'var(--text-2)' },
};

/* ── Component ──────────────────────────────────────── */
export default function Vision2030Page() {
  const [selectedSectors, setSelectedSectors] = useState([]);
  const [metricGroup, setMetricGroup] = useState('diversification');
  const [results, setResults] = useState(null);
  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState(null);

  function toggleSector(id) {
    setSelectedSectors(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  }

  async function handleAnalyze() {
    if (selectedSectors.length === 0) return;
    setRunning(true); setRunError(null);
    try {
      const res = await quant.vision2030({ sectors: selectedSectors, metric: metricGroup });
      setResults(res);
    } catch (err) { setRunError(err.message); }
    finally { setRunning(false); }
  }

  return (
    <div style={s.page}>
      <PageHeader title="Vision 2030" subtitle="Saudi diversification analysis" backTo="/quant" />

      <div style={s.body}>
        {/* Hero card */}
        <div style={s.heroCard}>
          <div style={s.heroIcon}><Landmark size={20} /></div>
          <div>
            <h3 style={s.heroTitle}>Vision 2030 Alignment</h3>
            <p style={s.heroDesc}>Analyze sector performance against Saudi diversification goals</p>
          </div>
        </div>

        {/* Sector selector */}
        <div>
          <label style={s.label}>Select Sectors</label>
          <div style={s.pillRow}>
            {SECTORS.map(sec => (
              <button key={sec.id} onClick={() => toggleSector(sec.id)} style={s.pill(selectedSectors.includes(sec.id))}>
                {sec.label}
              </button>
            ))}
          </div>
          <p style={s.countText}>{selectedSectors.length} sector(s) selected</p>
        </div>

        {/* Metric group */}
        <div>
          <label style={s.label}>Analysis Type</label>
          <div style={s.metricGrid}>
            {METRIC_GROUPS.map(m => (
              <button key={m.id} onClick={() => setMetricGroup(m.id)} style={s.metricChip(metricGroup === m.id)}>
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Analyze button */}
        <button onClick={handleAnalyze} disabled={selectedSectors.length === 0 || running} style={s.runBtn(selectedSectors.length === 0 || running)}>
          <Play size={14} /> {running ? 'Analyzing...' : 'Analyze Vision 2030'}
        </button>

        {runError && <div style={s.errBox}><p style={s.errText}>{runError}</p></div>}

        {/* Empty state */}
        {!results && !running && !runError && (
          <div style={s.empty}>
            <Landmark size={20} color="var(--text-3)" style={{ margin: '0 auto 8px', display: 'block' }} />
            <p style={s.emptyText}>Select sectors and click Analyze</p>
          </div>
        )}

        {/* Results */}
        {results && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Overall score */}
            {results.overallScore != null && (
              <div style={s.scoreCard}>
                <p style={{ ...s.subLabel, marginBottom: 4 }}>Overall Vision 2030 Score</p>
                <p style={s.bigScore}>{results.overallScore.toFixed(1)}</p>
                <p style={{ ...s.subLabel, marginTop: 2 }}>out of 100</p>
              </div>
            )}

            {/* Sector breakdown */}
            {results.sectors && results.sectors.length > 0 && (
              <div style={s.card}>
                <h3 style={s.cardTitle}>Sector Analysis</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {results.sectors.map(sec => (
                    <div key={sec.id || sec.name}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--navy)' }}>{sec.name}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          {sec.trend === 'up' && <TrendingUp size={10} color="var(--green)" />}
                          {sec.trend === 'down' && <TrendingDown size={10} color="var(--red)" />}
                          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--navy)' }}>{sec.score?.toFixed(1) ?? '--'}</span>
                        </div>
                      </div>
                      <div style={s.barBg}>
                        <div style={s.barFill(sec.score)} />
                      </div>
                      {sec.highlights && (
                        <p style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>{sec.highlights}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Diversification metrics */}
            {results.metrics && (
              <div style={s.card}>
                <h3 style={s.cardTitle}>Diversification Metrics</h3>
                <div style={s.diagGrid}>
                  {Object.entries(results.metrics).map(([key, val]) => (
                    <div key={key}>
                      <p style={s.diagLabel}>{key}</p>
                      <p style={s.diagValue}>{typeof val === 'number' ? val.toFixed(2) : val ?? '--'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key insights */}
            {results.insights && results.insights.length > 0 && (
              <div style={s.card}>
                <h3 style={s.cardTitle}>Key Insights</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {results.insights.map((insight, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <div style={s.insightDot} />
                      <span style={s.insightText}>{insight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
