import { useState } from 'react';
import { Calculator, Play } from 'lucide-react';
import PageHeader from '../../components/shared/PageHeader';
import { quant } from '../../services/api';

/* ── constants ──────────────────────────────────────── */
const TOOLS = [
  { id: 'dcf', label: 'DCF' },
  { id: 'gordon', label: 'Gordon DDM' },
  { id: 'multistage', label: 'Multi-Stage DDM' },
  { id: 'residual', label: 'Residual Income' },
  { id: 'altman', label: 'Altman Z-Score' },
];

const FIELD_DEFS = {
  dcf: [
    { key: 'freeCashFlow', label: 'Free Cash Flow (M)', type: 'number', placeholder: '500' },
    { key: 'growthRate', label: 'Growth Rate (%)', type: 'number', placeholder: '5' },
    { key: 'terminalGrowth', label: 'Terminal Growth (%)', type: 'number', placeholder: '2' },
    { key: 'discountRate', label: 'Discount Rate (%)', type: 'number', placeholder: '10' },
    { key: 'projectionYears', label: 'Projection Years', type: 'number', placeholder: '5' },
    { key: 'sharesOutstanding', label: 'Shares Outstanding (M)', type: 'number', placeholder: '100' },
  ],
  gordon: [
    { key: 'dividend', label: 'Current Dividend', type: 'number', placeholder: '2.50' },
    { key: 'growthRate', label: 'Dividend Growth (%)', type: 'number', placeholder: '4' },
    { key: 'requiredReturn', label: 'Required Return (%)', type: 'number', placeholder: '10' },
  ],
  multistage: [
    { key: 'dividend', label: 'Current Dividend', type: 'number', placeholder: '2.50' },
    { key: 'highGrowth', label: 'High Growth Rate (%)', type: 'number', placeholder: '12' },
    { key: 'highGrowthYears', label: 'High Growth Years', type: 'number', placeholder: '5' },
    { key: 'stableGrowth', label: 'Stable Growth (%)', type: 'number', placeholder: '3' },
    { key: 'requiredReturn', label: 'Required Return (%)', type: 'number', placeholder: '10' },
  ],
  residual: [
    { key: 'bookValue', label: 'Book Value/Share', type: 'number', placeholder: '25.00' },
    { key: 'roe', label: 'ROE (%)', type: 'number', placeholder: '15' },
    { key: 'costOfEquity', label: 'Cost of Equity (%)', type: 'number', placeholder: '10' },
    { key: 'growthRate', label: 'Growth Rate (%)', type: 'number', placeholder: '3' },
  ],
  altman: [
    { key: 'workingCapital', label: 'Working Capital (M)', type: 'number', placeholder: '200' },
    { key: 'totalAssets', label: 'Total Assets (M)', type: 'number', placeholder: '1000' },
    { key: 'retainedEarnings', label: 'Retained Earnings (M)', type: 'number', placeholder: '300' },
    { key: 'ebit', label: 'EBIT (M)', type: 'number', placeholder: '150' },
    { key: 'marketCap', label: 'Market Cap (M)', type: 'number', placeholder: '800' },
    { key: 'totalLiabilities', label: 'Total Liabilities (M)', type: 'number', placeholder: '500' },
    { key: 'revenue', label: 'Revenue (M)', type: 'number', placeholder: '600' },
  ],
};

/* ── styles ─────────────────────────────────────────── */
const s = {
  page: { animation: 'fadeIn .3s ease' },
  body: { padding: '16px 16px 24px', display: 'flex', flexDirection: 'column', gap: 16 },
  label: {
    fontFamily: 'var(--font-head)', fontSize: 11, fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--text-3)',
    display: 'block', marginBottom: 6,
  },
  tabScroll: { overflowX: 'auto' },
  tabRow: { display: 'flex', gap: 4, minWidth: 'max-content' },
  tabChip: (active) => ({
    padding: '8px 12px', borderRadius: 'var(--r-md)', fontSize: 11,
    fontWeight: 600, whiteSpace: 'nowrap', cursor: 'pointer', border: 'none',
    transition: 'all .15s',
    background: active ? 'var(--navy)' : 'var(--card)',
    color: active ? '#fff' : 'var(--text-2)',
    ...(active ? {} : { border: '1px solid var(--border)' }),
  }),
  card: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 16 },
  cardTitle: { fontFamily: 'var(--font-head)', fontSize: 12, fontWeight: 700, color: 'var(--navy)', marginBottom: 12 },
  fieldLabel: { fontSize: 10, color: 'var(--text-3)', marginBottom: 4, display: 'block' },
  input: {
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
  }),
  errBox: { background: 'var(--red-bg)', border: '1px solid var(--red)', borderRadius: 'var(--r-md)', padding: 12 },
  errText: { fontSize: 12, color: 'var(--red)' },
  empty: { textAlign: 'center', padding: '40px 0' },
  emptyText: { fontSize: 12, color: 'var(--text-3)' },
  resultCard: {
    background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 16,
    backgroundImage: 'linear-gradient(135deg, var(--blue-light) 0%, var(--card) 60%)',
  },
  bigValue: (color) => ({ fontFamily: 'var(--font-head)', fontSize: 28, fontWeight: 700, color }),
  subLabel: { fontSize: 10, color: 'var(--text-3)' },
  detailGrid: { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8, paddingTop: 12, borderTop: '1px solid var(--border)' },
  detailLabel: { fontSize: 10, color: 'var(--text-3)' },
  detailValue: { fontSize: 12, fontWeight: 700, color: 'var(--navy)' },
};

/* ── Component ──────────────────────────────────────── */
export default function ValuationPage() {
  const [tool, setTool] = useState('dcf');
  const [inputs, setInputs] = useState({});
  const [results, setResults] = useState(null);
  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState(null);

  function handleInput(key, value) {
    setInputs(prev => ({ ...prev, [key]: value }));
  }

  function handleToolChange(id) {
    setTool(id);
    setInputs({});
    setResults(null);
    setRunError(null);
  }

  async function handleCalculate() {
    setRunning(true); setRunError(null);
    try {
      const numericInputs = {};
      for (const [k, v] of Object.entries(inputs)) {
        numericInputs[k] = parseFloat(v) || 0;
      }
      const res = await quant.valuation({ model: tool, ...numericInputs });
      setResults(res);
    } catch (err) { setRunError(err.message); }
    finally { setRunning(false); }
  }

  const fields = FIELD_DEFS[tool] || [];

  return (
    <div style={s.page}>
      <PageHeader title="Valuation Tools" subtitle="Intrinsic value models" backTo="/quant" />

      <div style={s.body}>
        {/* Tool selector */}
        <div style={s.tabScroll}>
          <div style={s.tabRow}>
            {TOOLS.map(t => (
              <button key={t.id} onClick={() => handleToolChange(t.id)} style={s.tabChip(tool === t.id)}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input form */}
        <div style={s.card}>
          <h3 style={s.cardTitle}>{TOOLS.find(t => t.id === tool)?.label} Inputs</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {fields.map(f => (
              <div key={f.key}>
                <label style={s.fieldLabel}>{f.label}</label>
                <input
                  type={f.type}
                  placeholder={f.placeholder}
                  value={inputs[f.key] || ''}
                  onChange={e => handleInput(f.key, e.target.value)}
                  style={s.input}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Calculate button */}
        <button onClick={handleCalculate} disabled={running} style={s.runBtn(running)}>
          <Play size={14} /> {running ? 'Calculating...' : 'Calculate'}
        </button>

        {runError && <div style={s.errBox}><p style={s.errText}>{runError}</p></div>}

        {/* Empty state */}
        {!results && !running && !runError && (
          <div style={s.empty}>
            <Calculator size={20} color="var(--text-3)" style={{ margin: '0 auto 8px', display: 'block' }} />
            <p style={s.emptyText}>Enter values and click Calculate</p>
          </div>
        )}

        {/* Results */}
        {results && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={s.resultCard}>
              <h3 style={s.cardTitle}>Valuation Result</h3>

              {/* Primary value */}
              {results.intrinsicValue != null && (
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <p style={s.subLabel}>Intrinsic Value per Share</p>
                  <p style={s.bigValue('var(--blue)')}>{results.intrinsicValue.toFixed(2)}</p>
                  {results.currentPrice != null && (
                    <p style={{
                      fontSize: 11, fontWeight: 600, marginTop: 4,
                      color: results.intrinsicValue > results.currentPrice ? 'var(--green)' : 'var(--red)',
                    }}>
                      {results.intrinsicValue > results.currentPrice ? 'Undervalued' : 'Overvalued'} vs. current {results.currentPrice.toFixed(2)}
                    </p>
                  )}
                </div>
              )}

              {/* Z-Score result */}
              {results.zScore != null && (
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <p style={s.subLabel}>Altman Z-Score</p>
                  <p style={s.bigValue(
                    results.zScore > 2.99 ? 'var(--green)' : results.zScore > 1.81 ? 'var(--blue)' : 'var(--red)'
                  )}>
                    {results.zScore.toFixed(3)}
                  </p>
                  <p style={{ fontSize: 11, fontWeight: 600, marginTop: 4, color: 'var(--text-2)' }}>
                    {results.zScore > 2.99 ? 'Safe Zone' : results.zScore > 1.81 ? 'Grey Zone' : 'Distress Zone'}
                  </p>
                </div>
              )}

              {/* Detail breakdown */}
              {results.details && (
                <div style={s.detailGrid}>
                  {Object.entries(results.details).map(([key, val]) => (
                    <div key={key}>
                      <p style={s.detailLabel}>{key}</p>
                      <p style={s.detailValue}>{typeof val === 'number' ? val.toFixed(2) : val}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
