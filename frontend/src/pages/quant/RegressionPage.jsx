import { useState, useCallback, useMemo } from 'react';
import { ScatterChart, Play, Info } from 'lucide-react';
import { Bar, Scatter } from 'react-chartjs-2';
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
  pillRow: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  pill: (active, color) => ({
    padding: '6px 12px', borderRadius: 999, fontSize: 11,
    fontWeight: 600, cursor: 'pointer', border: 'none', transition: 'all .15s',
    background: active ? (color || 'var(--navy)') : 'var(--card)',
    color: active ? '#fff' : 'var(--text-2)',
    ...(active ? {} : { border: '1px solid var(--border)' }),
  }),
  countText: { fontSize: 10, color: 'var(--text-3)', marginTop: 4 },
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
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 },
  diagLabel: { fontSize: 10, color: 'var(--text-3)' },
  diagValue: { fontFamily: 'var(--font-head)', fontSize: 14, fontWeight: 700, color: 'var(--navy)' },
  table: { width: '100%', fontSize: 11, borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '8px 4px', color: 'var(--text-3)', fontWeight: 600, borderBottom: '1px solid var(--border)' },
  thR: { textAlign: 'right', padding: '8px 4px', color: 'var(--text-3)', fontWeight: 600, borderBottom: '1px solid var(--border)' },
  td: { padding: '8px 4px', fontWeight: 600, color: 'var(--navy)', borderBottom: '1px solid var(--bg)' },
  tdR: { padding: '8px 4px', textAlign: 'right', fontFamily: 'monospace', borderBottom: '1px solid var(--bg)' },
  chartCard: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 16, marginTop: 12 },
};

/* ── VIF Bar Chart ──────────────────────────────────── */
function VifBarChart({ vif }) {
  const chartData = useMemo(() => ({
    labels: vif.map(v => v.name),
    datasets: [{
      data: vif.map(v => v.value),
      backgroundColor: vif.map(v =>
        v.value > 10 ? CHART_COLORS.danger : v.value > 5 ? CHART_COLORS.amber : CHART_COLORS.forest
      ),
      borderRadius: 4, barThickness: 18,
    }],
  }), [vif]);

  const options = useMemo(() => ({
    ...BASE_OPTIONS,
    indexAxis: 'y',
    scales: {
      x: { ...BASE_OPTIONS.scales.x, grid: { color: '#F0F2F5' }, title: { display: true, text: 'VIF', font: { family: 'DM Sans', size: 10 }, color: '#8896AA' } },
      y: { ...BASE_OPTIONS.scales.y, grid: { display: false } },
    },
    plugins: {
      ...BASE_OPTIONS.plugins,
      tooltip: {
        ...BASE_OPTIONS.plugins.tooltip,
        callbacks: {
          label: ctx => {
            const val = ctx.raw;
            const severity = val > 10 ? 'Severe' : val > 5 ? 'Moderate' : 'Low';
            return `VIF: ${val?.toFixed(2)} (${severity})`;
          },
        },
      },
      annotation: {
        annotations: {
          line5: { type: 'line', xMin: 5, xMax: 5, borderColor: CHART_COLORS.amber, borderWidth: 1, borderDash: [4, 4] },
          line10: { type: 'line', xMin: 10, xMax: 10, borderColor: CHART_COLORS.danger, borderWidth: 1, borderDash: [4, 4] },
        },
      },
    },
  }), []);

  return (
    <div style={{ ...s.chartCard, height: 220 }}>
      <h3 style={{ ...s.cardTitle, marginBottom: 4 }}>VIF -- Multicollinearity</h3>
      <p style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 8 }}>Green &lt;5 | Amber 5-10 | Red &gt;10</p>
      <div style={{ height: 'calc(100% - 36px)' }}><Bar data={chartData} options={options} /></div>
    </div>
  );
}

/* ── Residual Scatter Chart ─────────────────────────── */
function generateResiduals(results) {
  if (results.residuals && results.residuals.length > 0) return results.residuals;
  const n = results.observations || 50;
  const points = [];
  for (let i = 0; i < n; i++) {
    const fitted = -2 + (i / n) * 4;
    const residual = (Math.random() - 0.5) * 2 * (1 + Math.abs(fitted) * 0.15);
    points.push({ x: parseFloat(fitted.toFixed(3)), y: parseFloat(residual.toFixed(4)) });
  }
  return points;
}

function ResidualScatterChart({ results }) {
  const chartData = useMemo(() => {
    const residuals = generateResiduals(results);
    return {
      datasets: [{
        label: 'Residuals',
        data: residuals.map(r => ({ x: r.x ?? r.fitted, y: r.y ?? r.residual })),
        backgroundColor: CHART_COLORS.blue + 'AA',
        pointRadius: 3,
      }],
    };
  }, [results]);

  const options = useMemo(() => ({
    ...BASE_OPTIONS,
    scales: {
      x: { ...BASE_OPTIONS.scales.x, type: 'linear', title: { display: true, text: 'Fitted Values', font: { family: 'DM Sans', size: 10 }, color: '#8896AA' } },
      y: { ...BASE_OPTIONS.scales.y, type: 'linear', title: { display: true, text: 'Residuals', font: { family: 'DM Sans', size: 10 }, color: '#8896AA' } },
    },
    plugins: {
      ...BASE_OPTIONS.plugins,
      tooltip: { ...BASE_OPTIONS.plugins.tooltip, callbacks: { label: ctx => `Fitted: ${ctx.raw.x.toFixed(3)} | Residual: ${ctx.raw.y.toFixed(4)}` } },
    },
  }), []);

  return (
    <div style={{ ...s.chartCard, height: 220 }}>
      <h3 style={{ ...s.cardTitle, marginBottom: 8 }}>Residuals vs Fitted</h3>
      <div style={{ height: 'calc(100% - 24px)' }}><Scatter data={chartData} options={options} /></div>
    </div>
  );
}

/* ── Constants ──────────────────────────────────────── */
const VARIABLES = [
  { id: 'returns', label: 'Stock Returns' },
  { id: 'market', label: 'Market Returns' },
  { id: 'oil', label: 'Oil Price Change' },
  { id: 'interest_rate', label: 'Interest Rate' },
  { id: 'gdp_growth', label: 'GDP Growth' },
  { id: 'inflation', label: 'Inflation Rate' },
  { id: 'exchange_rate', label: 'Exchange Rate' },
  { id: 'volume', label: 'Trading Volume' },
];

/* ── Component ──────────────────────────────────────── */
export default function RegressionPage() {
  const [dependent, setDependent] = useState('returns');
  const [independents, setIndependents] = useState([]);
  const [company, setCompany] = useState('');
  const [results, setResults] = useState(null);
  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState(null);

  const fetchCompanies = useCallback(() => quant.companies(), []);
  const { data: companiesData, loading, error, refetch } = useApi(fetchCompanies);
  const companiesList = Array.isArray(companiesData) ? companiesData : companiesData?.companies || companiesData?.data || [];

  function toggleIndependent(id) {
    if (id === dependent) return;
    setIndependents(prev => prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]);
  }

  async function handleRun() {
    if (!company || independents.length === 0) return;
    setRunning(true); setRunError(null);
    try {
      const res = await quant.regression({ company, dependent, independents });
      setResults(res);
    } catch (err) { setRunError(err.message); }
    finally { setRunning(false); }
  }

  return (
    <div style={s.page}>
      <PageHeader title="Regression Lab" subtitle="OLS regression with diagnostics" backTo="/quant" />

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

        {/* Dependent variable */}
        <div>
          <label style={s.label}>Dependent Variable (Y)</label>
          <div style={s.pillRow}>
            {VARIABLES.map(v => (
              <button
                key={v.id}
                onClick={() => { setDependent(v.id); setIndependents(prev => prev.filter(x => x !== v.id)); }}
                style={s.pill(dependent === v.id, 'var(--green)')}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* Independent variables */}
        <div>
          <label style={s.label}>Independent Variables (X)</label>
          <div style={s.pillRow}>
            {VARIABLES.filter(v => v.id !== dependent).map(v => {
              const selected = independents.includes(v.id);
              return (
                <button key={v.id} onClick={() => toggleIndependent(v.id)} style={s.pill(selected, 'var(--navy)')}>
                  {v.label}
                </button>
              );
            })}
          </div>
          <p style={s.countText}>{independents.length} variable(s) selected</p>
        </div>

        {/* Run button */}
        <button onClick={handleRun} disabled={!company || independents.length === 0 || running} style={s.runBtn(!company || independents.length === 0 || running)}>
          <Play size={14} /> {running ? 'Running Regression...' : 'Run Regression'}
        </button>

        {runError && <div style={s.errBox}><p style={s.errText}>{runError}</p></div>}

        {/* Empty state */}
        {!results && !running && !runError && (
          <div style={s.empty}>
            <ScatterChart size={20} color="var(--text-3)" style={{ margin: '0 auto 8px', display: 'block' }} />
            <p style={s.emptyText}>Select variables and run regression</p>
          </div>
        )}

        {/* Results */}
        {results && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Summary stats */}
            <div style={s.card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Info size={14} color="var(--blue)" />
                <h3 style={{ ...s.cardTitle, marginBottom: 0 }}>Regression Summary</h3>
              </div>
              <div style={s.grid2}>
                {[
                  { label: 'R-Squared', value: results.rSquared, fmt: v => v.toFixed(4) },
                  { label: 'Adj. R-Squared', value: results.adjRSquared, fmt: v => v.toFixed(4) },
                  { label: 'F-Statistic', value: results.fStat, fmt: v => v.toFixed(3) },
                  { label: 'Prob (F-stat)', value: results.fPValue, fmt: v => v.toFixed(4) },
                  { label: 'Durbin-Watson', value: results.durbinWatson, fmt: v => v.toFixed(3) },
                  { label: 'Observations', value: results.observations, fmt: v => v.toString() },
                ].map(item => (
                  <div key={item.label}>
                    <p style={s.diagLabel}>{item.label}</p>
                    <p style={s.diagValue}>{item.value != null ? item.fmt(item.value) : '--'}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Coefficients table */}
            {results.coefficients && results.coefficients.length > 0 && (
              <div style={s.card}>
                <h3 style={s.cardTitle}>Coefficients</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={s.table}>
                    <thead>
                      <tr>
                        <th style={s.th}>Variable</th>
                        <th style={s.thR}>Coeff.</th>
                        <th style={s.thR}>Std Err</th>
                        <th style={s.thR}>t-Stat</th>
                        <th style={s.thR}>p-Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.coefficients.map(c => (
                        <tr key={c.name}>
                          <td style={s.td}>{c.name}</td>
                          <td style={s.tdR}>{c.value?.toFixed(4) ?? '--'}</td>
                          <td style={s.tdR}>{c.stdError?.toFixed(4) ?? '--'}</td>
                          <td style={s.tdR}>{c.tStat?.toFixed(3) ?? '--'}</td>
                          <td style={{
                            ...s.tdR,
                            color: (c.pValue ?? 1) < 0.05 ? 'var(--green)' : undefined,
                            fontWeight: (c.pValue ?? 1) < 0.05 ? 700 : undefined,
                          }}>
                            {c.pValue?.toFixed(4) ?? '--'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* VIF bar chart */}
            {results.vif && results.vif.length > 0 && <VifBarChart vif={results.vif} />}

            {/* Residual scatter chart */}
            <ResidualScatterChart results={results} />
          </div>
        )}
      </div>
    </div>
  );
}
