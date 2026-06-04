import { useState, useCallback } from 'react';
import { BarChart3, Play, ArrowUpDown } from 'lucide-react';
import PageHeader from '../../components/shared/PageHeader';
import LoadingState from '../../components/shared/LoadingState';
import ErrorState from '../../components/shared/ErrorState';
import useApi from '../../hooks/useApi';
import { quant } from '../../services/api';

/* ── constants ──────────────────────────────────────── */
const METRICS = [
  { id: 'pe', label: 'P/E Ratio' },
  { id: 'pb', label: 'P/B Ratio' },
  { id: 'evEbitda', label: 'EV/EBITDA' },
  { id: 'ps', label: 'P/S Ratio' },
  { id: 'dividendYield', label: 'Div. Yield' },
  { id: 'roe', label: 'ROE' },
];

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
  pill: (active) => ({
    padding: '6px 12px', borderRadius: 999, fontSize: 11,
    fontWeight: 600, cursor: 'pointer', border: 'none', transition: 'all .15s',
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
  targetCard: {
    background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 16,
    backgroundImage: 'linear-gradient(135deg, var(--blue-light) 0%, var(--card) 60%)',
  },
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 },
  subLabel: { fontSize: 10, color: 'var(--text-3)' },
  subValue: { fontFamily: 'var(--font-head)', fontSize: 14, fontWeight: 700, color: 'var(--navy)' },
  table: { width: '100%', fontSize: 11, borderCollapse: 'collapse', minWidth: 400 },
  th: (clickable) => ({
    textAlign: 'left', padding: '8px 4px', color: 'var(--text-3)', fontWeight: 600,
    borderBottom: '1px solid var(--border)',
    cursor: clickable ? 'pointer' : 'default',
  }),
  td: { padding: '8px 4px', fontWeight: 600, color: 'var(--navy)', borderBottom: '1px solid var(--bg)' },
  tdMono: { padding: '8px 4px', fontFamily: 'monospace', borderBottom: '1px solid var(--bg)' },
};

/* ── Component ──────────────────────────────────────── */
export default function RelativeValuePage() {
  const [company, setCompany] = useState('');
  const [metric, setMetric] = useState('pe');
  const [results, setResults] = useState(null);
  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState(null);
  const [sortKey, setSortKey] = useState('pe');
  const [sortDir, setSortDir] = useState('asc');

  const fetchCompanies = useCallback(() => quant.companies(), []);
  const { data: companiesData, loading, error, refetch } = useApi(fetchCompanies);
  const companiesList = Array.isArray(companiesData) ? companiesData : companiesData?.companies || companiesData?.data || [];

  async function handleScan() {
    if (!company) return;
    setRunning(true); setRunError(null);
    try {
      const res = await quant.relativeValue({ company, metric });
      setResults(res);
    } catch (err) { setRunError(err.message); }
    finally { setRunning(false); }
  }

  function toggleSort(key) {
    if (sortKey === key) { setSortDir(d => d === 'asc' ? 'desc' : 'asc'); }
    else { setSortKey(key); setSortDir('asc'); }
  }

  const peers = results?.peers || [];
  const sorted = [...peers].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    const av = a[sortKey] ?? 0;
    const bv = b[sortKey] ?? 0;
    return dir * (av - bv);
  });

  return (
    <div style={s.page}>
      <PageHeader title="Relative Value" subtitle="Peer comparison scanner" backTo="/quant" />

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

        {/* Metric selector */}
        <div>
          <label style={s.label}>Primary Metric</label>
          <div style={s.pillRow}>
            {METRICS.map(m => (
              <button key={m.id} onClick={() => setMetric(m.id)} style={s.pill(metric === m.id)}>
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scan button */}
        <button onClick={handleScan} disabled={!company || running} style={s.runBtn(!company || running)}>
          <Play size={14} /> {running ? 'Scanning...' : 'Scan Peers'}
        </button>

        {runError && <div style={s.errBox}><p style={s.errText}>{runError}</p></div>}

        {/* Empty state */}
        {!results && !running && !runError && (
          <div style={s.empty}>
            <BarChart3 size={20} color="var(--text-3)" style={{ margin: '0 auto 8px', display: 'block' }} />
            <p style={s.emptyText}>Select a company to find comparable peers</p>
          </div>
        )}

        {/* Results */}
        {results && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Target company summary */}
            {results.target && (
              <div style={s.targetCard}>
                <h3 style={{ ...s.cardTitle, marginBottom: 8 }}>{results.target.name}</h3>
                <div style={s.grid3}>
                  <div><p style={s.subLabel}>P/E</p><p style={s.subValue}>{results.target.pe?.toFixed(1) ?? '--'}</p></div>
                  <div><p style={s.subLabel}>P/B</p><p style={s.subValue}>{results.target.pb?.toFixed(2) ?? '--'}</p></div>
                  <div><p style={s.subLabel}>EV/EBITDA</p><p style={s.subValue}>{results.target.evEbitda?.toFixed(1) ?? '--'}</p></div>
                </div>
              </div>
            )}

            {/* Peer comparison table */}
            {sorted.length > 0 && (
              <div style={{ ...s.card, overflowX: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <h3 style={{ ...s.cardTitle, marginBottom: 0 }}>Peer Comparison</h3>
                  <p style={{ fontSize: 10, color: 'var(--text-3)' }}>{sorted.length} peers</p>
                </div>
                <table style={s.table}>
                  <thead>
                    <tr>
                      {[
                        { key: 'name', label: 'Company' },
                        { key: 'pe', label: 'P/E' },
                        { key: 'pb', label: 'P/B' },
                        { key: 'evEbitda', label: 'EV/EBITDA' },
                        { key: 'roe', label: 'ROE' },
                      ].map(col => (
                        <th key={col.key} onClick={() => toggleSort(col.key)} style={s.th(true)}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {col.label}
                            {sortKey === col.key && <ArrowUpDown size={8} />}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((p, i) => (
                      <tr key={i}>
                        <td style={s.td}>{p.name}</td>
                        <td style={s.tdMono}>{p.pe?.toFixed(1) ?? '--'}</td>
                        <td style={s.tdMono}>{p.pb?.toFixed(2) ?? '--'}</td>
                        <td style={s.tdMono}>{p.evEbitda?.toFixed(1) ?? '--'}</td>
                        <td style={s.tdMono}>{p.roe != null ? p.roe.toFixed(1) + '%' : '--'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Valuation verdict */}
            {results.verdict && (
              <div style={{
                ...s.card,
                background: results.verdict === 'undervalued' ? 'var(--green-bg)' : results.verdict === 'overvalued' ? 'var(--red-bg)' : 'var(--bg)',
                borderColor: results.verdict === 'undervalued' ? 'var(--green)' : results.verdict === 'overvalued' ? 'var(--red)' : 'var(--border)',
              }}>
                <p style={{
                  fontSize: 12, fontWeight: 700,
                  color: results.verdict === 'undervalued' ? 'var(--green)' : results.verdict === 'overvalued' ? 'var(--red)' : 'var(--text-2)',
                }}>
                  Relative to peers: {results.verdict.charAt(0).toUpperCase() + results.verdict.slice(1)}
                </p>
                {results.discount != null && (
                  <p style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 2 }}>
                    Trading at {Math.abs(results.discount * 100).toFixed(1)}% {results.discount < 0 ? 'discount' : 'premium'} to peer average
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
