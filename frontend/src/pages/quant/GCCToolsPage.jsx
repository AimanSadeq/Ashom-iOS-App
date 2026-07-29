import { useState, useCallback } from 'react';
import { Globe2, Droplets, BookOpen, Landmark, Network, ArrowLeft, Play } from 'lucide-react';
import PageHeader from '../../components/shared/PageHeader';
import { DataNotice } from '../../components/shared/DataNotice';
import LoadingState from '../../components/shared/LoadingState';
import ErrorState from '../../components/shared/ErrorState';
import useApi from '../../hooks/useApi';
import { quant } from '../../services/api';

/* ── constants ──────────────────────────────────────── */
const TOOL_CARDS = [
  { id: 'oil', title: 'Oil Sensitivity', desc: 'Measure company exposure to oil price movements', icon: Droplets },
  { id: 'islamic', title: 'Islamic Finance', desc: 'Sharia compliance screening and Islamic ratios', icon: BookOpen },
  { id: 'swf', title: 'Sovereign Wealth', desc: 'SWF ownership analysis and impact assessment', icon: Landmark },
  { id: 'regional', title: 'Regional Correlation', desc: 'Cross-market correlation across GCC exchanges', icon: Network },
];

const OIL_FIELDS = [
  { key: 'company', label: 'Company', type: 'select' },
  { key: 'period', label: 'Period', type: 'choice', options: ['1y', '3y', '5y'] },
];
const ISLAMIC_FIELDS = [{ key: 'company', label: 'Company', type: 'select' }];
const SWF_FIELDS = [{ key: 'company', label: 'Company', type: 'select' }];
const REGIONAL_FIELDS = [
  { key: 'markets', label: 'Markets', type: 'multi', options: ['Tadawul', 'ADX', 'DFM', 'Boursa Kuwait', 'QSE', 'Bahrain', 'MSM'] },
];

/* ── styles ─────────────────────────────────────────── */
const s = {
  page: { animation: 'fadeIn .3s ease' },
  body: { padding: '16px 16px 24px', display: 'flex', flexDirection: 'column', gap: 16 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 },
  toolCard: {
    background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)',
    padding: 16, textAlign: 'left', cursor: 'pointer',
    transition: 'box-shadow .15s, transform .15s',
  },
  iconWrap: {
    width: 40, height: 40, borderRadius: 'var(--r-sm)',
    background: '#F0EEFE', display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: 12, color: '#7C5FDB',
  },
  toolTitle: { fontFamily: 'var(--font-head)', fontSize: 12, fontWeight: 700, color: 'var(--navy)', marginBottom: 4 },
  toolDesc: { fontSize: 11, color: 'var(--text-2)', lineHeight: 1.45 },
  backBtn: {
    display: 'flex', alignItems: 'center', gap: 6, fontSize: 11,
    fontWeight: 600, color: 'var(--blue)', background: 'none',
    border: 'none', cursor: 'pointer', padding: 0,
  },
  label: { fontSize: 10, color: 'var(--text-3)', marginBottom: 4, display: 'block' },
  select: {
    width: '100%', padding: '10px 12px', fontSize: 12,
    fontFamily: 'var(--font-body)', background: 'var(--card)',
    border: '1px solid var(--border)', borderRadius: 'var(--r-md)',
    color: 'var(--text-1)', outline: 'none',
  },
  pill: (active) => ({
    padding: '6px 12px', borderRadius: 999, fontSize: 11,
    fontWeight: 600, cursor: 'pointer', border: 'none', transition: 'all .15s',
    background: active ? 'var(--navy)' : 'var(--card)',
    color: active ? '#fff' : 'var(--text-2)',
    ...(active ? {} : { border: '1px solid var(--border)' }),
  }),
  pillRow: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  card: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 16 },
  cardTitle: { fontFamily: 'var(--font-head)', fontSize: 12, fontWeight: 700, color: 'var(--navy)', marginBottom: 12 },
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
  metricGrid: { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 },
  metricLabel: { fontSize: 10, color: 'var(--text-3)' },
  metricValue: { fontFamily: 'var(--font-head)', fontSize: 14, fontWeight: 700, color: 'var(--navy)' },
  message: { fontSize: 12, color: 'var(--text-2)', marginTop: 8 },
};

/* ── Component ──────────────────────────────────────── */
export default function GCCToolsPage() {
  const [activeTool, setActiveTool] = useState(null);
  const [inputs, setInputs] = useState({});
  const [results, setResults] = useState(null);
  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState(null);

  const fetchCompanies = useCallback(() => quant.companies(), []);
  const { data: companiesData, loading, error, refetch } = useApi(fetchCompanies);
  const companiesList = Array.isArray(companiesData) ? companiesData : companiesData?.companies || companiesData?.data || [];

  function handleInput(key, value) {
    setInputs(prev => ({ ...prev, [key]: value }));
  }

  function toggleMulti(key, val) {
    setInputs(prev => {
      const arr = prev[key] || [];
      return { ...prev, [key]: arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val] };
    });
  }

  function openTool(id) {
    setActiveTool(id);
    setInputs({});
    setResults(null);
    setRunError(null);
  }

  async function handleRun() {
    setRunning(true); setRunError(null);
    try {
      // There is no `gccTool` mode on /risk-metrics — that call always failed
      // with "Required: symbol". Each tool is routed to the endpoint that can
      // actually answer it, and the two with no data source say so plainly
      // rather than issuing a request that cannot succeed.
      let mapped;

      if (activeTool === 'oil') {
        // Oil sensitivity = regression of the stock's returns on WTI.
        if (!inputs.company) throw new Error('Select a company first.');
        const RANGE = { '1y': '1Y', '3y': '3Y', '5y': '5Y' };
        const res = await quant.regression({
          dependent: { type: 'stock_return', symbol: inputs.company },
          independents: [{ type: 'macro', name: 'oil_wti' }],
          range: RANGE[inputs.period] || '3Y',
        });
        const reg = res?.data?.regression || {};
        mapped = {
          metrics: {
            'Oil Beta':      reg.coefficients?.[1]?.toFixed(4) ?? '--',
            'Intercept':     reg.coefficients?.[0]?.toFixed(4) ?? '--',
            'R-Squared':     reg.rSquared?.toFixed(4) ?? '--',
            't-Statistic':   reg.tStats?.[1]?.toFixed(2) ?? '--',
            'Observations':  res?.data?.observations ?? '--',
          },
          message: 'Oil beta is the sensitivity of this stock\'s daily returns to WTI. Derived from sample data.',
        };

      } else if (activeTool === 'regional') {
        // Cross-market correlation, using the largest company in each selected
        // market as that market's proxy (no index-level price series exists).
        const MARKET_COUNTRY = {
          'Tadawul': 'Saudi Arabia', 'ADX': 'UAE', 'DFM': 'UAE',
          'Boursa Kuwait': 'Kuwait', 'QSE': 'Qatar', 'Bahrain': 'Bahrain', 'MSM': 'Oman',
        };
        const markets = inputs.markets || [];
        if (markets.length < 2) throw new Error('Select at least 2 markets.');

        const proxies = [];
        const labels = [];
        markets.forEach(mk => {
          const country = MARKET_COUNTRY[mk];
          const co = companiesList.find(c => c.country === country && !proxies.includes(c.symbol));
          if (co) { proxies.push(co.symbol); labels.push(`${mk} (${co.symbol})`); }
        });
        if (proxies.length < 2) throw new Error('Could not resolve enough market proxies.');

        const res = await quant.correlationMatrix(proxies, '1Y');
        const m = res?.data?.correlationMatrix || [];
        const metrics = {};
        for (let i = 0; i < labels.length; i++) {
          for (let j = i + 1; j < labels.length; j++) {
            metrics[`${labels[i]} ↔ ${labels[j]}`] = m[i]?.[j]?.toFixed(3) ?? '--';
          }
        }
        mapped = {
          metrics,
          message: 'Correlations use the largest listed company in each market as a proxy, since no index-level price series is available.',
        };

      } else {
        // Islamic screening and sovereign-wealth ownership need data the
        // platform does not hold (AAOIFI screening inputs; SWF registers).
        mapped = {
          metrics: null,
          message: activeTool === 'islamic'
            ? 'Sharia screening requires AAOIFI-standard inputs (debt/market-cap, non-compliant income ratios) that are not present in this dataset. Connect a screening data provider to enable this tool.'
            : 'Sovereign wealth fund ownership data is not available in this dataset. Connect an ownership/shareholder-register source to enable this tool.',
        };
      }

      setResults(mapped);
    } catch (err) { setRunError(err.message); }
    finally { setRunning(false); }
  }

  function getFields() {
    switch (activeTool) {
      case 'oil': return OIL_FIELDS;
      case 'islamic': return ISLAMIC_FIELDS;
      case 'swf': return SWF_FIELDS;
      case 'regional': return REGIONAL_FIELDS;
      default: return [];
    }
  }

  // Tool detail view
  if (activeTool) {
    const toolInfo = TOOL_CARDS.find(t => t.id === activeTool);
    const fields = getFields();

    return (
      <div style={s.page}>
        <PageHeader title={toolInfo.title} subtitle={toolInfo.desc} backTo="/quant/gcc-tools" />
        <div style={{ padding: "12px 16px 0" }}><DataNotice variant="sample" /></div>

        <div style={s.body}>
          <button onClick={() => setActiveTool(null)} style={s.backBtn}>
            <ArrowLeft size={12} /> Back to GCC Tools
          </button>

          {loading && <LoadingState message="Loading..." />}
          {error && <ErrorState message={error} onRetry={refetch} />}

          {!loading && !error && (
            <>
              <div style={{ ...s.card, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {fields.map(f => {
                  if (f.type === 'select') {
                    return (
                      <div key={f.key}>
                        <label style={s.label}>{f.label}</label>
                        <select value={inputs[f.key] || ''} onChange={e => handleInput(f.key, e.target.value)} style={s.select}>
                          <option value="">Select...</option>
                          {companiesList.map(c => (
                            <option key={c.id || c.symbol} value={c.symbol || c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    );
                  }
                  if (f.type === 'choice') {
                    return (
                      <div key={f.key}>
                        <label style={s.label}>{f.label}</label>
                        <div style={s.pillRow}>
                          {f.options.map(o => (
                            <button key={o} onClick={() => handleInput(f.key, o)} style={s.pill(inputs[f.key] === o)}>
                              {o.toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  if (f.type === 'multi') {
                    return (
                      <div key={f.key}>
                        <label style={s.label}>{f.label}</label>
                        <div style={s.pillRow}>
                          {f.options.map(o => {
                            const sel = (inputs[f.key] || []).includes(o);
                            return (
                              <button key={o} onClick={() => toggleMulti(f.key, o)} style={s.pill(sel)}>{o}</button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>

              <button onClick={handleRun} disabled={running} style={s.runBtn(running)}>
                <Play size={14} /> {running ? 'Running...' : 'Run Analysis'}
              </button>

              {runError && <div style={s.errBox}><p style={s.errText}>{runError}</p></div>}

              {!results && !running && !runError && (
                <div style={s.empty}>
                  <Globe2 size={20} color="var(--text-3)" style={{ margin: '0 auto 8px', display: 'block' }} />
                  <p style={s.emptyText}>Configure inputs and run analysis</p>
                </div>
              )}

              {results && (
                <div style={s.card}>
                  <h3 style={s.cardTitle}>Results</h3>
                  {results.metrics && (
                    <div style={s.metricGrid}>
                      {Object.entries(results.metrics).map(([key, val]) => (
                        <div key={key}>
                          <p style={s.metricLabel}>{key}</p>
                          <p style={s.metricValue}>{typeof val === 'number' ? val.toFixed(3) : val ?? '--'}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {results.message && <p style={s.message}>{results.message}</p>}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // Main card grid
  return (
    <div style={s.page}>
      <PageHeader title="GCC Tools" subtitle="Region-specific quantitative analysis" backTo="/quant" />

      <div style={{ padding: '16px 16px 24px' }}>
        <div style={s.grid}>
          {TOOL_CARDS.map(tool => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => openTool(tool.id)}
                style={s.toolCard}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,.06)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
              >
                <div style={s.iconWrap}><Icon size={20} /></div>
                <h3 style={s.toolTitle}>{tool.title}</h3>
                <p style={s.toolDesc}>{tool.desc}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
