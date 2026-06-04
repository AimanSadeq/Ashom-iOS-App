import { useState, useCallback, useMemo } from 'react';
import { PieChart, Play, Target } from 'lucide-react';
import { Scatter, Doughnut } from 'react-chartjs-2';
import PageHeader from '../../components/shared/PageHeader';
import LoadingState from '../../components/shared/LoadingState';
import ErrorState from '../../components/shared/ErrorState';
import useApi from '../../hooks/useApi';
import { quant } from '../../services/api';
import { CHART_COLORS, CHART_PALETTE, BASE_OPTIONS } from '../../components/shared/ChartSetup';

/* ── helpers ────────────────────────────────────────── */
function generateFrontierPoints(optimalReturn, optimalRisk) {
  const points = [];
  const ret = optimalReturn || 0.12;
  const risk = optimalRisk || 0.15;
  for (let i = 0; i < 25; i++) {
    const t = i / 24;
    const r = risk * 0.4 + t * risk * 1.6;
    const e = ret * 0.3 + (ret * 1.2) * Math.sqrt(t) - 0.15 * t * t * ret;
    points.push({ x: parseFloat((r * 100).toFixed(2)), y: parseFloat((e * 100).toFixed(2)) });
  }
  return points;
}

/* ── shared styles ──────────────────────────────────── */
const sty = {
  page: { animation: 'fadeIn .3s ease' },
  body: { padding: '16px 16px 24px', display: 'flex', flexDirection: 'column', gap: 16 },
  label: {
    fontFamily: 'var(--font-head)', fontSize: 11, fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--text-3)',
    display: 'block', marginBottom: 6,
  },
  checkList: {
    maxHeight: 220, overflowY: 'auto',
    background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 12,
    display: 'flex', flexDirection: 'column', gap: 4,
  },
  checkRow: { display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', cursor: 'pointer' },
  checkbox: { width: 14, height: 14, borderRadius: 4 },
  checkName: { fontSize: 11, color: 'var(--navy)' },
  checkTicker: { fontSize: 11, color: 'var(--text-3)', marginLeft: 'auto' },
  countText: { fontSize: 10, color: 'var(--text-3)', marginTop: 4 },
  input: {
    width: '100%', padding: '10px 12px', fontSize: 12,
    fontFamily: 'var(--font-body)', background: 'var(--card)',
    border: '1px solid var(--border)', borderRadius: 'var(--r-md)',
    color: 'var(--text-1)', outline: 'none',
  },
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 },
  inputLabel: { fontSize: 10, color: 'var(--text-3)', marginBottom: 4 },
  riskRow: { display: 'flex', gap: 6 },
  riskChip: (active) => ({
    flex: 1, padding: '8px 0', borderRadius: 'var(--r-md)', fontSize: 11,
    fontWeight: 600, textAlign: 'center', cursor: 'pointer', border: 'none',
    textTransform: 'capitalize', transition: 'all .15s',
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
  statGrid3: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 },
  statCenter: { textAlign: 'center' },
  bigNum: (color) => ({ fontFamily: 'var(--font-head)', fontSize: 20, fontWeight: 700, color }),
  statLabel: { fontSize: 10, color: 'var(--text-3)', marginTop: 2 },
  weightRow: { display: 'flex', alignItems: 'center', gap: 8 },
  weightName: { fontSize: 11, fontWeight: 600, color: 'var(--navy)', width: 96, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  weightBarBg: { flex: 1, height: 8, background: 'var(--bg)', borderRadius: 999, overflow: 'hidden' },
  weightBar: (pct) => ({ height: '100%', width: `${pct}%`, background: 'var(--blue)', borderRadius: 999 }),
  weightVal: { fontSize: 11, fontFamily: 'monospace', color: 'var(--text-2)', width: 48, textAlign: 'right' },
};

/* ── Efficient Frontier Chart ───────────────────────── */
function EfficientFrontierChart({ results }) {
  const chartData = useMemo(() => {
    const frontier = results.frontier || generateFrontierPoints(results.expectedReturn, results.risk);
    const optimalPoint = results.risk != null && results.expectedReturn != null
      ? [{ x: parseFloat((results.risk * 100).toFixed(2)), y: parseFloat((results.expectedReturn * 100).toFixed(2)) }]
      : [];
    return {
      datasets: [
        {
          label: 'Frontier',
          data: frontier.map(p => ({ x: p.x ?? p.risk, y: p.y ?? p.ret })),
          backgroundColor: CHART_COLORS.blue,
          borderColor: CHART_COLORS.blue,
          pointRadius: 3, showLine: true, borderWidth: 2, fill: false, tension: 0.4,
        },
        ...(optimalPoint.length ? [{
          label: 'Optimal',
          data: optimalPoint,
          backgroundColor: CHART_COLORS.amber,
          borderColor: CHART_COLORS.amber,
          pointRadius: 7, pointStyle: 'star', showLine: false,
        }] : []),
      ],
    };
  }, [results]);

  const options = useMemo(() => ({
    ...BASE_OPTIONS,
    scales: {
      x: { ...BASE_OPTIONS.scales.x, type: 'linear', title: { display: true, text: 'Risk (Std Dev %)', font: { family: 'DM Sans', size: 10 }, color: '#8896AA' } },
      y: { ...BASE_OPTIONS.scales.y, type: 'linear', title: { display: true, text: 'Expected Return %', font: { family: 'DM Sans', size: 10 }, color: '#8896AA' } },
    },
    plugins: {
      ...BASE_OPTIONS.plugins,
      legend: { display: true, labels: { font: { family: 'DM Sans', size: 10 }, usePointStyle: true, boxWidth: 6 } },
      tooltip: { ...BASE_OPTIONS.plugins.tooltip, callbacks: { label: ctx => `Risk: ${ctx.raw.x.toFixed(2)}% | Return: ${ctx.raw.y.toFixed(2)}%` } },
    },
  }), []);

  return (
    <div style={{ ...sty.card, marginTop: 12, height: 250 }}>
      <h3 style={{ ...sty.cardTitle, marginBottom: 8 }}>Efficient Frontier</h3>
      <div style={{ height: 'calc(100% - 24px)' }}><Scatter data={chartData} options={options} /></div>
    </div>
  );
}

/* ── Allocation Doughnut ────────────────────────────── */
function AllocationDoughnut({ weights }) {
  const chartData = useMemo(() => ({
    labels: weights.map(w => w.asset || w.name),
    datasets: [{ data: weights.map(w => parseFloat(((w.weight || 0) * 100).toFixed(1))), backgroundColor: CHART_PALETTE.slice(0, weights.length), borderWidth: 0, hoverOffset: 6 }],
  }), [weights]);

  const options = useMemo(() => ({
    responsive: true, maintainAspectRatio: false, cutout: '60%',
    plugins: {
      legend: { display: true, position: 'right', labels: { font: { family: 'DM Sans', size: 9 }, boxWidth: 10, padding: 6 } },
      tooltip: { ...BASE_OPTIONS.plugins.tooltip, callbacks: { label: ctx => `${ctx.label}: ${ctx.raw}%` } },
    },
  }), []);

  return (
    <div style={{ ...sty.card, marginTop: 12, height: 250 }}>
      <h3 style={{ ...sty.cardTitle, marginBottom: 8 }}>Optimal Allocation</h3>
      <div style={{ height: 'calc(100% - 24px)' }}><Doughnut data={chartData} options={options} /></div>
    </div>
  );
}

/* ── Component ──────────────────────────────────────── */
export default function OptimizerPage() {
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [minWeight, setMinWeight] = useState('0');
  const [maxWeight, setMaxWeight] = useState('40');
  const [riskTolerance, setRiskTolerance] = useState('medium');
  const [results, setResults] = useState(null);
  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState(null);

  const fetchCompanies = useCallback(() => quant.companies(), []);
  const { data: companiesData, loading, error, refetch } = useApi(fetchCompanies);
  const companiesList = Array.isArray(companiesData) ? companiesData : companiesData?.companies || companiesData?.data || [];

  function toggleAsset(sym) {
    setSelectedAssets(prev => prev.includes(sym) ? prev.filter(s => s !== sym) : [...prev, sym]);
  }

  async function handleOptimize() {
    if (selectedAssets.length < 2) return;
    setRunning(true); setRunError(null);
    try {
      const res = await quant.optimize({
        assets: selectedAssets,
        minWeight: parseFloat(minWeight) / 100,
        maxWeight: parseFloat(maxWeight) / 100,
        riskTolerance,
      });
      setResults(res);
    } catch (err) { setRunError(err.message); }
    finally { setRunning(false); }
  }

  return (
    <div style={sty.page}>
      <PageHeader title="Portfolio Optimizer" subtitle="Mean-variance optimization" backTo="/quant" />

      <div style={sty.body}>
        {/* Asset selector */}
        <div>
          <label style={sty.label}>Select Assets (min 2)</label>
          {loading && <LoadingState message="Loading companies..." />}
          {error && <ErrorState message={error} onRetry={refetch} />}
          {!loading && !error && (
            <div style={sty.checkList}>
              {companiesList.map(c => {
                const sym = c.symbol || c.id;
                const checked = selectedAssets.includes(sym);
                return (
                  <label key={sym} style={sty.checkRow}>
                    <input type="checkbox" checked={checked} onChange={() => toggleAsset(sym)} style={sty.checkbox} />
                    <span style={sty.checkName}>{c.name}</span>
                    <span style={sty.checkTicker}>{c.ticker || c.symbol}</span>
                  </label>
                );
              })}
            </div>
          )}
          <p style={sty.countText}>{selectedAssets.length} assets selected</p>
        </div>

        {/* Constraints */}
        <div>
          <label style={sty.label}>Constraints</label>
          <div style={sty.grid2}>
            <div>
              <p style={sty.inputLabel}>Min Weight (%)</p>
              <input type="number" min="0" max="100" value={minWeight} onChange={e => setMinWeight(e.target.value)} style={sty.input} />
            </div>
            <div>
              <p style={sty.inputLabel}>Max Weight (%)</p>
              <input type="number" min="0" max="100" value={maxWeight} onChange={e => setMaxWeight(e.target.value)} style={sty.input} />
            </div>
          </div>
        </div>

        {/* Risk tolerance */}
        <div>
          <label style={sty.label}>Risk Tolerance</label>
          <div style={sty.riskRow}>
            {['low', 'medium', 'high'].map(r => (
              <button key={r} onClick={() => setRiskTolerance(r)} style={sty.riskChip(riskTolerance === r)}>{r}</button>
            ))}
          </div>
        </div>

        {/* Optimize button */}
        <button onClick={handleOptimize} disabled={selectedAssets.length < 2 || running} style={sty.runBtn(selectedAssets.length < 2 || running)}>
          <Play size={14} /> {running ? 'Optimizing...' : 'Optimize Portfolio'}
        </button>

        {runError && <div style={sty.errBox}><p style={sty.errText}>{runError}</p></div>}

        {/* Empty state */}
        {!results && !running && !runError && (
          <div style={sty.empty}>
            <PieChart size={20} color="var(--text-3)" style={{ margin: '0 auto 8px', display: 'block' }} />
            <p style={sty.emptyText}>Select assets and constraints, then optimize</p>
          </div>
        )}

        {/* Results */}
        {results && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Risk / Return stats */}
            <div style={sty.card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Target size={14} color="var(--blue)" />
                <h3 style={{ ...sty.cardTitle, marginBottom: 0 }}>Optimal Portfolio</h3>
              </div>
              <div style={sty.statGrid3}>
                <div style={sty.statCenter}>
                  <p style={sty.bigNum('var(--green)')}>
                    {results.expectedReturn != null ? (results.expectedReturn * 100).toFixed(2) + '%' : '--'}
                  </p>
                  <p style={sty.statLabel}>Exp. Return</p>
                </div>
                <div style={sty.statCenter}>
                  <p style={sty.bigNum('var(--blue)')}>
                    {results.risk != null ? (results.risk * 100).toFixed(2) + '%' : '--'}
                  </p>
                  <p style={sty.statLabel}>Risk (Vol)</p>
                </div>
                <div style={sty.statCenter}>
                  <p style={sty.bigNum('var(--navy)')}>
                    {results.sharpe != null ? results.sharpe.toFixed(3) : '--'}
                  </p>
                  <p style={sty.statLabel}>Sharpe</p>
                </div>
              </div>
            </div>

            {/* Optimal weights */}
            {results.weights && results.weights.length > 0 && (
              <div style={sty.card}>
                <h3 style={sty.cardTitle}>Optimal Weights</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {results.weights.map(w => (
                    <div key={w.asset || w.name} style={sty.weightRow}>
                      <span style={sty.weightName}>{w.asset || w.name}</span>
                      <div style={sty.weightBarBg}>
                        <div style={sty.weightBar((w.weight || 0) * 100)} />
                      </div>
                      <span style={sty.weightVal}>{((w.weight || 0) * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <EfficientFrontierChart results={results} />
            {results.weights && results.weights.length > 0 && <AllocationDoughnut weights={results.weights} />}
          </div>
        )}
      </div>
    </div>
  );
}
