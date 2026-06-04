import { useState, useEffect, useMemo } from 'react';
import { Download, CheckCircle, XCircle, AlertTriangle, Info, ChevronDown, ChevronUp } from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';

const NISAB_USD = 5500; // approximate gold-based nisab
const ZAKAT_RATE = 0.025;

const STORAGE_KEY = 'vifm-portfolio';
const ZAKAT_HISTORY_KEY = 'vifm-zakat-history';

function getHoldings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function isZakatable(type) {
  if (type === 'bond') return false;
  return true; // stocks, metals, crypto, oil, cash
}

function zakatNote(type) {
  if (type === 'crypto') return 'Consult Scholar';
  if (type === 'bond') return 'Exempt';
  return null;
}

function computeValue(h) {
  const qty = h.quantity || 0;
  const price = h.currentPrice || h.costPrice || 0;
  return qty * price;
}

const sectionLabel = {
  fontFamily: 'var(--font-head)', fontSize: 11, fontWeight: 700,
  textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--text-3)', margin: '0 0 10px',
};

const card = {
  background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)',
};

function fmt(n) {
  if (n == null) return '--';
  return '$' + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function ZakatReportPage() {
  const [holdings, setHoldings] = useState([]);
  const [showMethodology, setShowMethodology] = useState(false);

  useEffect(() => {
    setHoldings(getHoldings());
  }, []);

  const breakdown = useMemo(() => {
    return holdings.map(h => {
      const value = computeValue(h);
      const zakatable = isZakatable(h.type);
      const zakatAmount = zakatable ? value * ZAKAT_RATE : 0;
      return { ...h, value, zakatable, zakatAmount, note: zakatNote(h.type) };
    });
  }, [holdings]);

  const totalWealth = breakdown.reduce((s, b) => s + b.value, 0);
  const zakatableWealth = breakdown.filter(b => b.zakatable).reduce((s, b) => s + b.value, 0);
  const totalZakat = breakdown.reduce((s, b) => s + b.zakatAmount, 0);
  const meetsNisab = zakatableWealth >= NISAB_USD;

  // Group by type for summary
  const byType = useMemo(() => {
    const groups = {};
    breakdown.forEach(b => {
      const t = b.type || 'other';
      if (!groups[t]) groups[t] = { value: 0, zakatAmount: 0, zakatable: isZakatable(t), note: zakatNote(t) };
      groups[t].value += b.value;
      groups[t].zakatAmount += b.zakatAmount;
    });
    return groups;
  }, [breakdown]);

  // Mock historical data
  const history = useMemo(() => {
    try {
      const stored = localStorage.getItem(ZAKAT_HISTORY_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    // Generate mock history
    return [
      { year: '1446 AH (2024)', amount: totalZakat * 0.85, wealth: zakatableWealth * 0.85 },
      { year: '1445 AH (2023)', amount: totalZakat * 0.72, wealth: zakatableWealth * 0.72 },
      { year: '1444 AH (2022)', amount: totalZakat * 0.60, wealth: zakatableWealth * 0.60 },
    ];
  }, [totalZakat, zakatableWealth]);

  function handleDownload() {
    const report = {
      generatedAt: new Date().toISOString(),
      totalWealth, zakatableWealth, totalZakat, meetsNisab,
      nisabThreshold: NISAB_USD,
      breakdown: breakdown.map(b => ({
        name: b.name, type: b.type, value: b.value,
        zakatable: b.zakatable, zakatAmount: b.zakatAmount, note: b.note,
      })),
    };
    // Save to localStorage as downloadable record
    const prev = JSON.parse(localStorage.getItem(ZAKAT_HISTORY_KEY) || '[]');
    prev.unshift({ year: `1447 AH (2026)`, amount: totalZakat, wealth: zakatableWealth });
    localStorage.setItem(ZAKAT_HISTORY_KEY, JSON.stringify(prev.slice(0, 5)));
    localStorage.setItem('vifm-zakat-latest-report', JSON.stringify(report));
    alert('Zakat report saved. Check your portfolio exports.');
  }

  return (
    <div className="animate-fade-in">
      <PageHeader title="Zakat & Tax Report" subtitle="Islamic Wealth Obligation" backTo="/portfolio" />

      <div style={{ padding: '0 16px 100px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Summary Card */}
        <div style={{
          borderRadius: 'var(--r-lg)', padding: 20,
          background: 'linear-gradient(135deg, #00C896, #059669)',
          color: '#fff', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -20, right: -20, width: 100, height: 100,
            borderRadius: '50%', background: 'rgba(255,255,255,0.08)',
          }} />
          <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>
            Total Zakatable Wealth
          </p>
          <p style={{ fontSize: 26, fontWeight: 700, fontFamily: 'var(--font-head)', fontVariantNumeric: 'tabular-nums', marginBottom: 2 }}>
            {fmt(zakatableWealth)}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
            <div>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', margin: 0 }}>Zakat Due (2.5%)</p>
              <p style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-head)', margin: 0 }}>{fmt(totalZakat)}</p>
            </div>
            <div style={{ width: 1, height: 30, background: 'rgba(255,255,255,0.2)' }} />
            <div>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', margin: 0 }}>Nisab Status</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                {meetsNisab
                  ? <><CheckCircle size={14} /><span style={{ fontSize: 12, fontWeight: 600 }}>Above Nisab</span></>
                  : <><XCircle size={14} /><span style={{ fontSize: 12, fontWeight: 600 }}>Below Nisab</span></>
                }
              </div>
            </div>
          </div>
        </div>

        {/* Nisab Indicator */}
        <div style={{ ...card, padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 'var(--r-md)', flexShrink: 0,
            background: meetsNisab ? 'var(--green-bg, rgba(0,200,150,0.1))' : 'var(--red-bg, rgba(255,75,110,0.1))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {meetsNisab
              ? <CheckCircle size={16} style={{ color: 'var(--green, #00C896)' }} />
              : <XCircle size={16} style={{ color: 'var(--red, #FF4B6E)' }} />
            }
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--navy)', fontFamily: 'var(--font-head)', margin: '0 0 2px' }}>
              Nisab Threshold: {fmt(NISAB_USD)}
            </p>
            <p style={{ fontSize: 10, color: 'var(--text-3)', margin: 0 }}>
              {meetsNisab
                ? 'Your zakatable wealth exceeds the nisab. Zakat is obligatory.'
                : 'Your zakatable wealth is below the nisab. Zakat is not obligatory this year.'}
            </p>
          </div>
        </div>

        {/* Asset Breakdown Table */}
        <div>
          <p style={sectionLabel}>Asset Breakdown</p>
          {breakdown.length === 0 ? (
            <div style={{ ...card, padding: 24, textAlign: 'center' }}>
              <p style={{ fontSize: 12, color: 'var(--text-3)' }}>No holdings in portfolio. Add holdings to calculate Zakat.</p>
            </div>
          ) : (
            <div style={{ ...card, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                <thead>
                  <tr style={{ background: 'var(--bg)' }}>
                    {['Asset', 'Value', 'Zakatable?', 'Zakat'].map(h => (
                      <th key={h} style={{
                        padding: '8px 10px', textAlign: h === 'Asset' ? 'left' : 'right',
                        fontWeight: 600, color: 'var(--text-3)', fontFamily: 'var(--font-head)',
                        fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.5px',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {breakdown.map((b, i) => (
                    <tr key={b.id || i} style={{ borderTop: '1px solid var(--border)' }}>
                      <td style={{ padding: '8px 10px' }}>
                        <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--navy)', margin: 0 }}>{b.name}</p>
                        <p style={{ fontSize: 9, color: 'var(--text-3)', margin: 0, textTransform: 'capitalize' }}>{b.type}</p>
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: 'var(--text-2)' }}>
                        {fmt(b.value)}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                        {b.note ? (
                          <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 10, background: 'var(--amber-bg, rgba(245,158,11,0.1))', color: 'var(--amber, #D97706)', fontWeight: 600 }}>
                            {b.note}
                          </span>
                        ) : b.zakatable ? (
                          <CheckCircle size={14} style={{ color: 'var(--green, #00C896)' }} />
                        ) : (
                          <XCircle size={14} style={{ color: 'var(--text-3)' }} />
                        )}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: 'var(--navy)' }}>
                        {b.zakatAmount > 0 ? fmt(b.zakatAmount) : '--'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ borderTop: '2px solid var(--border)', background: 'var(--bg)' }}>
                    <td style={{ padding: '8px 10px', fontWeight: 700, color: 'var(--navy)', fontFamily: 'var(--font-head)' }}>Total</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: 'var(--navy)', fontVariantNumeric: 'tabular-nums' }}>{fmt(totalWealth)}</td>
                    <td style={{ padding: '8px 10px' }} />
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: 'var(--green, #00C896)', fontVariantNumeric: 'tabular-nums' }}>{fmt(totalZakat)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* Type Summary */}
        {Object.keys(byType).length > 0 && (
          <div>
            <p style={sectionLabel}>By Asset Class</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {Object.entries(byType).map(([type, data]) => (
                <div key={type} style={{ ...card, padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: data.zakatable ? 'var(--green, #00C896)' : 'var(--text-3)',
                      display: 'inline-block',
                    }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--navy)', textTransform: 'capitalize', fontFamily: 'var(--font-head)' }}>{type}</span>
                    {data.note && (
                      <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 10, background: 'var(--amber-bg, rgba(245,158,11,0.1))', color: 'var(--amber, #D97706)', fontWeight: 600 }}>
                        {data.note}
                      </span>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--navy)', margin: 0, fontVariantNumeric: 'tabular-nums' }}>{fmt(data.value)}</p>
                    <p style={{ fontSize: 10, color: 'var(--text-3)', margin: 0 }}>Zakat: {fmt(data.zakatAmount)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Methodology */}
        <div>
          <p style={sectionLabel}>Calculation Methodology</p>
          <div style={{ ...card, overflow: 'hidden' }}>
            <button
              onClick={() => setShowMethodology(!showMethodology)}
              style={{
                width: '100%', padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Info size={14} style={{ color: 'var(--blue)' }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--navy)', fontFamily: 'var(--font-head)' }}>How is Zakat Calculated?</span>
              </div>
              {showMethodology ? <ChevronUp size={14} style={{ color: 'var(--text-3)' }} /> : <ChevronDown size={14} style={{ color: 'var(--text-3)' }} />}
            </button>
            {showMethodology && (
              <div style={{ padding: '0 14px 14px', fontSize: 11, color: 'var(--text-2)', lineHeight: 1.7 }}>
                <p style={{ margin: '0 0 8px' }}>
                  <strong>Rate:</strong> Zakat is calculated at 2.5% of net zakatable wealth that has been held for one full Hijri (lunar) year.
                </p>
                <p style={{ margin: '0 0 8px' }}>
                  <strong>Nisab:</strong> The minimum threshold is based on the value of 85 grams of gold (approximately ${NISAB_USD.toLocaleString()}). Wealth below this threshold is exempt.
                </p>
                <p style={{ margin: '0 0 8px' }}>
                  <strong>Stocks:</strong> The full market value of publicly traded shares is zakatable if held for investment purposes.
                </p>
                <p style={{ margin: '0 0 8px' }}>
                  <strong>Gold & Silver:</strong> Zakatable when holdings exceed the nisab for their respective metal.
                </p>
                <p style={{ margin: '0 0 8px' }}>
                  <strong>Cryptocurrency:</strong> Scholarly opinions vary. Many scholars consider crypto zakatable as a form of digital wealth. Consult a qualified scholar.
                </p>
                <p style={{ margin: '0 0 8px' }}>
                  <strong>Bonds:</strong> Interest-bearing bonds are generally exempt from Zakat as the principal is owed to you, not owned. Sukuk may differ.
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Cash:</strong> All cash holdings above the nisab are fully zakatable.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <div style={{
          ...card, padding: 12, display: 'flex', gap: 8,
          background: 'var(--amber-bg, rgba(245,158,11,0.06))', borderColor: 'var(--amber-border, rgba(245,158,11,0.2))',
        }}>
          <AlertTriangle size={14} style={{ color: 'var(--amber, #D97706)', flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 10, color: 'var(--text-2)', lineHeight: 1.5, margin: 0 }}>
            This is an estimate only. Zakat calculations depend on individual circumstances, holding periods, and scholarly interpretations. Please consult a qualified Islamic scholar or your local Zakat authority for a definitive ruling.
          </p>
        </div>

        {/* Historical Tracking */}
        <div>
          <p style={sectionLabel}>Historical Estimates</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {history.map((h, i) => (
              <div key={i} style={{ ...card, padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--navy)', fontFamily: 'var(--font-head)' }}>{h.year}</span>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--green, #00C896)', margin: 0, fontVariantNumeric: 'tabular-nums' }}>{fmt(h.amount)}</p>
                  <p style={{ fontSize: 9, color: 'var(--text-3)', margin: 0 }}>on {fmt(h.wealth)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Download Button */}
        <button
          onClick={handleDownload}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '12px 0', borderRadius: 'var(--r-md)',
            background: 'var(--navy)', color: '#fff',
            fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)',
            border: 'none', cursor: 'pointer', transition: 'opacity 0.2s',
          }}
        >
          <Download size={14} /> Download Report
        </button>
      </div>
    </div>
  );
}
