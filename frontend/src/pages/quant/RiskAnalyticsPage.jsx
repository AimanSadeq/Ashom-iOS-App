import { useState, useCallback, useMemo } from 'react';
import { ShieldAlert, BarChart3, Grid3X3, Zap, Play } from 'lucide-react';
import { Radar } from 'react-chartjs-2';
import PageHeader from '../../components/shared/PageHeader';
import LoadingState from '../../components/shared/LoadingState';
import ErrorState from '../../components/shared/ErrorState';
import useApi from '../../hooks/useApi';
import { quant } from '../../services/api';
import { CHART_COLORS, BASE_OPTIONS } from '../../components/shared/ChartSetup';

/* ── shared inline styles ───────────────────────────── */
const s = {
  page: { animation: 'fadeIn .3s ease' },
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
  runBtn: (disabled) => ({
    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: '12px 0', borderRadius: 'var(--r-md)', fontSize: 12, fontWeight: 700,
    color: '#fff', background: 'var(--navy)', border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1,
    transition: 'opacity .15s',
  }),
  errBox: { background: 'var(--red-bg)', border: '1px solid var(--red)', borderRadius: 'var(--r-md)', padding: 12 },
  errText: { fontSize: 12, color: 'var(--red)' },
  empty: { textAlign: 'center', padding: '40px 0' },
  emptyText: { fontSize: 12, color: 'var(--text-3)' },
  card: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 16 },
  cardTitle: { fontFamily: 'var(--font-head)', fontSize: 12, fontWeight: 700, color: 'var(--navy)', marginBottom: 12 },
  metricCard: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 12 },
  metricLabel: { fontSize: 10, color: 'var(--text-3)', marginBottom: 4 },
  tabBar: {
    display: 'flex', gap: 4, background: 'var(--bg)',
    borderRadius: 'var(--r-md)', padding: 4, margin: '12px 16px 8px',
  },
  tab: (active) => ({
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    padding: '8px 0', borderRadius: 'var(--r-sm)', fontSize: 11, fontWeight: 600,
    border: 'none', cursor: 'pointer', transition: 'all .15s',
    background: active ? 'var(--card)' : 'transparent',
    color: active ? 'var(--navy)' : 'var(--text-3)',
    boxShadow: active ? '0 1px 3px rgba(0,0,0,.06)' : 'none',
  }),
  body: { padding: '8px 16px 24px', display: 'flex', flexDirection: 'column', gap: 16 },
  checkbox: { width: 14, height: 14, borderRadius: 4 },
  checkList: {
    maxHeight: 200, overflowY: 'auto',
    background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 12,
    display: 'flex', flexDirection: 'column', gap: 4,
  },
  checkRow: { display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', cursor: 'pointer' },
  checkName: { fontSize: 11, color: 'var(--navy)' },
  checkTicker: { fontSize: 11, color: 'var(--text-3)', marginLeft: 'auto' },
  countText: { fontSize: 10, color: 'var(--text-3)', marginTop: 4 },
  scenarioBtn: (active) => ({
    width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: 'var(--r-md)',
    fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all .15s',
    border: active ? '1px solid var(--blue)' : '1px solid var(--border)',
    background: active ? 'var(--blue-light)' : 'var(--card)',
    color: active ? 'var(--navy)' : 'var(--text-2)',
  }),
  table: { width: '100%', fontSize: 11, borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '8px 4px', color: 'var(--text-3)', fontWeight: 600, borderBottom: '1px solid var(--border)' },
  thR: { textAlign: 'right', padding: '8px 4px', color: 'var(--text-3)', fontWeight: 600, borderBottom: '1px solid var(--border)' },
  td: { padding: '8px 4px', fontWeight: 600, color: 'var(--navy)', borderBottom: '1px solid var(--bg)' },
  tdR: { padding: '8px 4px', textAlign: 'right', fontFamily: 'monospace', borderBottom: '1px solid var(--bg)' },
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 },
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 },
};

/* ── Risk Radar Chart ───────────────────────────────── */
function RiskRadarChart({ data }) {
  const chartData = useMemo(() => {
    const metrics = [
      { label: 'Sharpe', raw: data.sharpe },
      { label: 'Sortino', raw: data.sortino },
      { label: 'Treynor', raw: data.treynor },
      { label: 'Info Ratio', raw: data.infoRatio },
    ];
    const values = metrics.map(m => {
      if (m.raw == null) return 0;
      return Math.min(Math.max(m.raw * 3, -10), 10);
    });
    return {
      labels: metrics.map(m => m.label),
      datasets: [{
        data: values,
        backgroundColor: CHART_COLORS.blue + '33',
        borderColor: CHART_COLORS.blue,
        borderWidth: 2,
        pointBackgroundColor: CHART_COLORS.blue,
        pointRadius: 4,
        fill: true,
      }],
    };
  }, [data]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        grid: { color: '#F0F2F5' },
        angleLines: { color: '#F0F2F5' },
        pointLabels: { font: { family: 'DM Sans', size: 10, weight: '600' }, color: '#8896AA' },
        ticks: { font: { family: 'DM Mono', size: 8 }, color: '#8896AA', backdropColor: 'transparent' },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        ...BASE_OPTIONS.plugins.tooltip,
        callbacks: {
          label: ctx => {
            const raw = [data.sharpe, data.sortino, data.treynor, data.infoRatio][ctx.dataIndex];
            return `${ctx.label}: ${raw != null ? raw.toFixed(3) : '--'}`;
          },
        },
      },
    },
  }), [data]);

  return (
    <div style={{ ...s.card, marginTop: 12, height: 250 }}>
      <h3 style={{ ...s.cardTitle, marginBottom: 8 }}>Risk Profile</h3>
      <div style={{ height: 'calc(100% - 24px)' }}>
        <Radar data={chartData} options={options} />
      </div>
    </div>
  );
}

/* ── Constants ──────────────────────────────────────── */
const TABS = [
  { id: 'metrics', label: 'Risk Metrics', icon: BarChart3 },
  { id: 'correlation', label: 'Correlation', icon: Grid3X3 },
  { id: 'stress', label: 'Stress Test', icon: Zap },
];

const STRESS_SCENARIOS = [
  { id: 'oil_crash', label: 'Oil Price Crash (-40%)' },
  { id: 'rate_hike', label: 'Rate Hike (+200bps)' },
  { id: 'market_panic', label: 'Market Panic (-30%)' },
  { id: 'currency_shock', label: 'Currency Peg Break' },
  { id: 'geopolitical', label: 'Geopolitical Crisis' },
];

/* ── Component ──────────────────────────────────────── */
export default function RiskAnalyticsPage() {
  const [tab, setTab] = useState('metrics');
  const [company, setCompany] = useState('');
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [scenario, setScenario] = useState('oil_crash');
  const [riskResults, setRiskResults] = useState(null);
  const [corrResults, setCorrResults] = useState(null);
  const [stressResults, setStressResults] = useState(null);
  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState(null);

  const fetchCompanies = useCallback(() => quant.companies(), []);
  const { data: companiesData, loading, error, refetch } = useApi(fetchCompanies);
  const companiesList = Array.isArray(companiesData) ? companiesData : companiesData?.companies || companiesData?.data || [];

  function toggleCompany(sym) {
    setSelectedCompanies(prev =>
      prev.includes(sym) ? prev.filter(s => s !== sym) : [...prev, sym]
    );
  }

  async function runRiskMetrics() {
    if (!company) return;
    setRunning(true); setRunError(null);
    try {
      const [metrics, varData] = await Promise.all([
        quant.riskMetrics({ company }),
        quant.var({ company }),
      ]);
      setRiskResults({ ...metrics, ...varData });
    } catch (err) { setRunError(err.message); }
    finally { setRunning(false); }
  }

  async function runCorrelation() {
    if (selectedCompanies.length < 2) return;
    setRunning(true); setRunError(null);
    try {
      const res = await quant.riskMetrics({ companies: selectedCompanies, type: 'correlation' });
      setCorrResults(res);
    } catch (err) { setRunError(err.message); }
    finally { setRunning(false); }
  }

  async function runStressTest() {
    if (!company) return;
    setRunning(true); setRunError(null);
    try {
      const res = await quant.riskMetrics({ company, scenario, type: 'stress' });
      setStressResults(res);
    } catch (err) { setRunError(err.message); }
    finally { setRunning(false); }
  }

  return (
    <div style={s.page}>
      <PageHeader title="Risk Analytics" subtitle="Risk measurement and stress testing" backTo="/quant" />

      {/* Tabs */}
      <div style={s.tabBar}>
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={s.tab(tab === t.id)}>
              <Icon size={12} /> {t.label}
            </button>
          );
        })}
      </div>

      {loading && <LoadingState message="Loading companies..." />}
      {error && <ErrorState message={error} onRetry={refetch} />}

      {!loading && !error && (
        <div style={s.body}>
          {/* ── RISK METRICS TAB ── */}
          {tab === 'metrics' && (
            <>
              <div>
                <label style={s.label}>Company</label>
                <select value={company} onChange={e => setCompany(e.target.value)} style={s.select}>
                  <option value="">Select a company...</option>
                  {companiesList.map(c => (
                    <option key={c.id || c.symbol} value={c.symbol || c.id}>{c.name} ({c.ticker || c.symbol})</option>
                  ))}
                </select>
              </div>

              <button onClick={runRiskMetrics} disabled={!company || running} style={s.runBtn(!company || running)}>
                <Play size={14} /> {running ? 'Calculating...' : 'Calculate Risk Metrics'}
              </button>

              {!riskResults && !running && (
                <div style={s.empty}>
                  <ShieldAlert size={20} color="var(--text-3)" style={{ margin: '0 auto 8px', display: 'block' }} />
                  <p style={s.emptyText}>Select a company to view risk metrics</p>
                </div>
              )}

              {riskResults && (
                <>
                  <RiskRadarChart data={riskResults} />
                  <div style={s.grid2}>
                    {[
                      { label: 'VaR (95%)', value: riskResults.var95, fmt: v => (v * 100).toFixed(2) + '%', color: 'var(--red)' },
                      { label: 'CVaR (95%)', value: riskResults.cvar95, fmt: v => (v * 100).toFixed(2) + '%', color: 'var(--red)' },
                      { label: 'Sharpe Ratio', value: riskResults.sharpe, fmt: v => v.toFixed(3), color: 'var(--green)' },
                      { label: 'Sortino Ratio', value: riskResults.sortino, fmt: v => v.toFixed(3), color: 'var(--green)' },
                      { label: 'Treynor Ratio', value: riskResults.treynor, fmt: v => v.toFixed(4), color: 'var(--navy)' },
                      { label: 'Information Ratio', value: riskResults.infoRatio, fmt: v => v.toFixed(3), color: 'var(--navy)' },
                      { label: 'Max Drawdown', value: riskResults.maxDrawdown, fmt: v => (v * 100).toFixed(2) + '%', color: 'var(--red)' },
                      { label: 'Volatility (Ann.)', value: riskResults.volatility, fmt: v => (v * 100).toFixed(2) + '%', color: 'var(--blue)' },
                    ].map(m => (
                      <div key={m.label} style={s.metricCard}>
                        <p style={s.metricLabel}>{m.label}</p>
                        <p style={{ fontSize: 14, fontWeight: 700, color: m.color }}>
                          {m.value != null ? m.fmt(m.value) : '--'}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {/* ── CORRELATION TAB ── */}
          {tab === 'correlation' && (
            <>
              <div>
                <label style={s.label}>Select Companies (min 2)</label>
                <div style={s.checkList}>
                  {companiesList.map(c => {
                    const sym = c.symbol || c.id;
                    const checked = selectedCompanies.includes(sym);
                    return (
                      <label key={sym} style={s.checkRow}>
                        <input type="checkbox" checked={checked} onChange={() => toggleCompany(sym)} style={s.checkbox} />
                        <span style={s.checkName}>{c.name}</span>
                        <span style={s.checkTicker}>{c.ticker || c.symbol}</span>
                      </label>
                    );
                  })}
                </div>
                <p style={s.countText}>{selectedCompanies.length} selected</p>
              </div>

              <button onClick={runCorrelation} disabled={selectedCompanies.length < 2 || running} style={s.runBtn(selectedCompanies.length < 2 || running)}>
                <Play size={14} /> {running ? 'Computing...' : 'Compute Correlation Matrix'}
              </button>

              {!corrResults && !running && (
                <div style={s.empty}>
                  <Grid3X3 size={20} color="var(--text-3)" style={{ margin: '0 auto 8px', display: 'block' }} />
                  <p style={s.emptyText}>Select at least 2 companies</p>
                </div>
              )}

              {corrResults && corrResults.matrix && (
                <div style={{ ...s.card, overflowX: 'auto' }}>
                  <h3 style={s.cardTitle}>Correlation Matrix</h3>
                  <table style={s.table}>
                    <thead>
                      <tr>
                        <th style={s.th}></th>
                        {corrResults.labels?.map(l => (
                          <th key={l} style={{ ...s.thR, padding: '8px 4px', fontSize: 10 }}>{l}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {corrResults.matrix.map((row, i) => (
                        <tr key={i}>
                          <td style={s.td}>{corrResults.labels?.[i]}</td>
                          {row.map((val, j) => (
                            <td key={j} style={{
                              ...s.tdR,
                              color: i === j ? 'var(--text-3)' : val > 0.7 ? 'var(--green)' : val < -0.3 ? 'var(--red)' : undefined,
                              fontWeight: (i !== j && (val > 0.7 || val < -0.3)) ? 700 : undefined,
                            }}>
                              {val?.toFixed(2) ?? '--'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* ── STRESS TEST TAB ── */}
          {tab === 'stress' && (
            <>
              <div>
                <label style={s.label}>Company</label>
                <select value={company} onChange={e => setCompany(e.target.value)} style={s.select}>
                  <option value="">Select a company...</option>
                  {companiesList.map(c => (
                    <option key={c.id || c.symbol} value={c.symbol || c.id}>{c.name} ({c.ticker || c.symbol})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={s.label}>Stress Scenario</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {STRESS_SCENARIOS.map(sc => (
                    <button key={sc.id} onClick={() => setScenario(sc.id)} style={s.scenarioBtn(scenario === sc.id)}>
                      {sc.label}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={runStressTest} disabled={!company || running} style={s.runBtn(!company || running)}>
                <Zap size={14} /> {running ? 'Running Stress Test...' : 'Run Stress Test'}
              </button>

              {!stressResults && !running && (
                <div style={s.empty}>
                  <Zap size={20} color="var(--text-3)" style={{ margin: '0 auto 8px', display: 'block' }} />
                  <p style={s.emptyText}>Select a company and scenario</p>
                </div>
              )}

              {stressResults && (
                <div style={s.card}>
                  <h3 style={s.cardTitle}>Stress Test Results</h3>
                  <div style={s.grid3}>
                    <div>
                      <p style={s.metricLabel}>Expected Loss</p>
                      <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--red)' }}>
                        {stressResults.expectedLoss != null ? (stressResults.expectedLoss * 100).toFixed(2) + '%' : '--'}
                      </p>
                    </div>
                    <div>
                      <p style={s.metricLabel}>Worst Case</p>
                      <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--red)' }}>
                        {stressResults.worstCase != null ? (stressResults.worstCase * 100).toFixed(2) + '%' : '--'}
                      </p>
                    </div>
                    <div>
                      <p style={s.metricLabel}>Recovery (days)</p>
                      <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)' }}>{stressResults.recoveryDays ?? '--'}</p>
                    </div>
                    <div>
                      <p style={s.metricLabel}>Scenario</p>
                      <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)' }}>
                        {STRESS_SCENARIOS.find(sc => sc.id === scenario)?.label ?? scenario}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {runError && (
            <div style={s.errBox}><p style={s.errText}>{runError}</p></div>
          )}
        </div>
      )}
    </div>
  );
}
