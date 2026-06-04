import { useState, useCallback, useMemo } from 'react';
import { Play, Layers, Info } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import PageHeader from '../../components/shared/PageHeader';
import LoadingState from '../../components/shared/LoadingState';
import ErrorState from '../../components/shared/ErrorState';
import useApi from '../../hooks/useApi';
import { quant } from '../../services/api';
import { CHART_COLORS, BASE_OPTIONS } from '../../components/shared/ChartSetup';

/* ── styles ─────────────────────────────────────────── */
const s = {
  page: { animation: 'fadeIn .3s ease' },
  body: { padding: '16px 16px 24px', display: 'flex', flexDirection: 'column', gap: 16 },
  label: {
    fontFamily: 'var(--font-head)', fontSize: 11, fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--text-3)',
    display: 'block', marginBottom: 6,
  },
  select: {
    width: '100%', padding: '10px 12px', fontSize: 12,
    fontFamily: 'var(--font-body)', background: 'var(--card)',
    border: '1px solid var(--border)', borderRadius: 'var(--r-md)',
    color: 'var(--text-1)', outline: 'none',
  },
  chipRow: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 },
  chip: (active) => ({
    padding: '8px 4px', borderRadius: 'var(--r-md)', fontSize: 11,
    fontWeight: 600, textAlign: 'center', cursor: 'pointer', border: 'none',
    transition: 'all .15s',
    background: active ? 'var(--navy)' : 'var(--card)',
    color: active ? '#fff' : 'var(--text-2)',
    ...(active ? {} : { border: '1px solid var(--border)' }),
  }),
  desc: { fontSize: 11, color: 'var(--text-3)', marginTop: 4 },
  rangeRow: { display: 'flex', gap: 6 },
  rangeChip: (active) => ({
    padding: '8px 16px', borderRadius: 'var(--r-md)', fontSize: 11,
    fontWeight: 600, cursor: 'pointer', border: 'none', transition: 'all .15s',
    background: active ? 'var(--blue)' : 'var(--card)',
    color: active ? '#fff' : 'var(--text-2)',
    ...(active ? {} : { border: '1px solid var(--border)' }),
  }),
  runBtn: {
    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: '12px 0', borderRadius: 'var(--r-md)', fontSize: 12, fontWeight: 700,
    color: '#fff', background: 'var(--navy)', border: 'none', cursor: 'pointer',
    opacity: 1, transition: 'opacity .15s',
  },
  errBox: {
    background: 'var(--red-bg)', border: '1px solid var(--red)',
    borderRadius: 'var(--r-md)', padding: 12,
  },
  errText: { fontSize: 12, color: 'var(--red)' },
  empty: { textAlign: 'center', padding: '40px 0' },
  emptyIcon: { width: 48, height: 48, borderRadius: 'var(--r-lg)', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' },
  emptyText: { fontSize: 12, color: 'var(--text-3)' },
  card: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 16 },
  cardTitle: { fontFamily: 'var(--font-head)', fontSize: 12, fontWeight: 700, color: 'var(--navy)', marginBottom: 12 },
  statGrid3: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 },
  statCenter: { textAlign: 'center' },
  bigNum: { fontFamily: 'var(--font-head)', fontSize: 20, fontWeight: 700, color: 'var(--navy)' },
  statLabel: { fontSize: 10, color: 'var(--text-3)', marginTop: 2 },
  table: { width: '100%', fontSize: 11, borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '8px 4px', color: 'var(--text-3)', fontWeight: 600, borderBottom: '1px solid var(--border)' },
  thR: { textAlign: 'right', padding: '8px 4px', color: 'var(--text-3)', fontWeight: 600, borderBottom: '1px solid var(--border)' },
  td: { padding: '8px 4px', fontWeight: 600, color: 'var(--navy)', borderBottom: '1px solid var(--bg)' },
  tdR: { padding: '8px 4px', textAlign: 'right', fontFamily: 'monospace', borderBottom: '1px solid var(--bg)' },
  diagGrid: { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 },
  diagLabel: { fontSize: 10, color: 'var(--text-3)' },
  diagValue: { fontFamily: 'var(--font-head)', fontSize: 14, fontWeight: 700, color: 'var(--navy)' },
  chartCard: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 16, marginTop: 12 },
};

/* ── Factor Loadings Chart ──────────────────────────── */
function FactorLoadingsChart({ factors, alpha }) {
  const chartData = useMemo(() => {
    const items = [];
    if (alpha != null) items.push({ name: 'Alpha', value: alpha });
    factors.forEach(f => {
      if (f.coefficient != null) items.push({ name: f.name, value: f.coefficient });
    });
    return {
      labels: items.map(i => i.name),
      datasets: [{
        data: items.map(i => i.value),
        backgroundColor: items.map(i => i.value >= 0 ? '#00C896' : '#FF4B6E'),
        borderRadius: 4,
        barThickness: 18,
      }],
    };
  }, [factors, alpha]);

  const options = useMemo(() => ({
    ...BASE_OPTIONS,
    indexAxis: 'y',
    scales: {
      x: { ...BASE_OPTIONS.scales.x, grid: { color: '#F0F2F5' } },
      y: { ...BASE_OPTIONS.scales.y, grid: { display: false } },
    },
    plugins: {
      ...BASE_OPTIONS.plugins,
      tooltip: {
        ...BASE_OPTIONS.plugins.tooltip,
        callbacks: { label: ctx => `Loading: ${ctx.raw?.toFixed(4)}` },
      },
    },
  }), []);

  return (
    <div style={{ ...s.chartCard, height: 220 }}>
      <h3 style={{ ...s.cardTitle, marginBottom: 8 }}>Factor Loadings</h3>
      <div style={{ height: 'calc(100% - 24px)' }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}

/* ── Constants ──────────────────────────────────────── */
const MODELS = [
  { id: 'capm', label: 'CAPM', desc: 'Capital Asset Pricing Model' },
  { id: 'ff3', label: 'FF3', desc: 'Fama-French 3-Factor' },
  { id: 'ff5', label: 'FF5', desc: 'Fama-French 5-Factor' },
  { id: 'carhart', label: 'Carhart', desc: 'Carhart 4-Factor' },
];

const RANGES = [
  { id: '1y', label: '1Y' },
  { id: '3y', label: '3Y' },
  { id: '5y', label: '5Y' },
];

/* ── Component ──────────────────────────────────────── */
export default function FactorModelsPage() {
  const [company, setCompany] = useState('');
  const [model, setModel] = useState('capm');
  const [range, setRange] = useState('3y');
  const [results, setResults] = useState(null);
  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState(null);

  const fetchCompanies = useCallback(() => quant.companies(), []);
  const { data: companiesData, loading, error, refetch } = useApi(fetchCompanies);
  const companiesList = Array.isArray(companiesData) ? companiesData : companiesData?.companies || companiesData?.data || [];

  async function handleRun() {
    if (!company) return;
    setRunning(true);
    setRunError(null);
    try {
      const res = await quant.factorModel({ company, model, range });
      setResults(res);
    } catch (err) {
      setRunError(err.message);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div style={s.page}>
      <PageHeader title="Factor Models" subtitle="Multi-factor regression analysis" backTo="/quant" />

      <div style={s.body}>
        {/* Company selector */}
        <div>
          <label style={s.label}>Company</label>
          {loading && <LoadingState message="Loading companies..." />}
          {error && <ErrorState message={error} onRetry={refetch} />}
          {!loading && !error && (
            <select value={company} onChange={e => setCompany(e.target.value)} style={s.select}>
              <option value="">Select a company...</option>
              {companiesList.map(c => (
                <option key={c.id || c.symbol} value={c.symbol || c.id}>
                  {c.name} ({c.ticker || c.symbol})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Model selector */}
        <div>
          <label style={s.label}>Model</label>
          <div style={s.chipRow}>
            {MODELS.map(m => (
              <button key={m.id} onClick={() => setModel(m.id)} style={s.chip(model === m.id)}>
                {m.label}
              </button>
            ))}
          </div>
          <p style={s.desc}>{MODELS.find(m => m.id === model)?.desc}</p>
        </div>

        {/* Date range */}
        <div>
          <label style={s.label}>Date Range</label>
          <div style={s.rangeRow}>
            {RANGES.map(r => (
              <button key={r.id} onClick={() => setRange(r.id)} style={s.rangeChip(range === r.id)}>
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Run button */}
        <button
          onClick={handleRun}
          disabled={!company || running}
          style={{ ...s.runBtn, opacity: (!company || running) ? 0.4 : 1, cursor: (!company || running) ? 'not-allowed' : 'pointer' }}
        >
          <Play size={14} />
          {running ? 'Running Model...' : 'Run Model'}
        </button>

        {/* Run error */}
        {runError && (
          <div style={s.errBox}><p style={s.errText}>{runError}</p></div>
        )}

        {/* Empty state */}
        {!results && !running && !runError && (
          <div style={s.empty}>
            <div style={s.emptyIcon}><Layers size={20} color="var(--text-3)" /></div>
            <p style={s.emptyText}>Select a company and model, then click Run</p>
          </div>
        )}

        {/* Results */}
        {results && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Summary stats */}
            <div style={s.card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Info size={14} color="var(--blue)" />
                <h3 style={{ ...s.cardTitle, marginBottom: 0 }}>Model Summary</h3>
              </div>
              <div style={s.statGrid3}>
                <div style={s.statCenter}>
                  <p style={s.bigNum}>{results.rSquared != null ? results.rSquared.toFixed(3) : '--'}</p>
                  <p style={s.statLabel}>R-Squared</p>
                </div>
                <div style={s.statCenter}>
                  <p style={s.bigNum}>{results.alpha != null ? results.alpha.toFixed(4) : '--'}</p>
                  <p style={s.statLabel}>Alpha</p>
                </div>
                <div style={s.statCenter}>
                  <p style={s.bigNum}>{results.beta != null ? results.beta.toFixed(3) : '--'}</p>
                  <p style={s.statLabel}>Beta</p>
                </div>
              </div>
            </div>

            {/* Factor loadings table */}
            {results.factors && results.factors.length > 0 && (
              <div style={s.card}>
                <h3 style={s.cardTitle}>Factor Loadings</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={s.table}>
                    <thead>
                      <tr>
                        <th style={s.th}>Factor</th>
                        <th style={s.thR}>Coefficient</th>
                        <th style={s.thR}>t-Stat</th>
                        <th style={s.thR}>p-Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.factors.map(f => (
                        <tr key={f.name}>
                          <td style={s.td}>{f.name}</td>
                          <td style={s.tdR}>{f.coefficient?.toFixed(4) ?? '--'}</td>
                          <td style={s.tdR}>{f.tStat?.toFixed(3) ?? '--'}</td>
                          <td style={{ ...s.tdR, color: (f.pValue ?? 1) < 0.05 ? 'var(--green)' : undefined, fontWeight: (f.pValue ?? 1) < 0.05 ? 700 : undefined }}>
                            {f.pValue?.toFixed(4) ?? '--'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Factor loadings bar chart */}
            {results.factors && results.factors.length > 0 && (
              <FactorLoadingsChart factors={results.factors} alpha={results.alpha} />
            )}

            {/* Diagnostics */}
            <div style={s.card}>
              <h3 style={s.cardTitle}>Diagnostics</h3>
              <div style={s.diagGrid}>
                {[
                  { label: 'Adj. R-Squared', value: results.adjRSquared },
                  { label: 'F-Statistic', value: results.fStat },
                  { label: 'Durbin-Watson', value: results.durbinWatson },
                  { label: 'Observations', value: results.observations },
                ].map(item => (
                  <div key={item.label}>
                    <p style={s.diagLabel}>{item.label}</p>
                    <p style={s.diagValue}>
                      {item.value != null ? (typeof item.value === 'number' ? item.value.toFixed(3) : item.value) : '--'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
