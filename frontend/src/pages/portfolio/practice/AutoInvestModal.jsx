import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, ChevronRight, Check, Calendar, RefreshCw } from 'lucide-react';
import { TRADEABLE_ASSETS } from './practiceData';

const STORAGE_KEY = 'vifm-auto-invest-plans';

const POPULAR_ASSETS = [
  { name: 'Saudi Aramco',   ticker: '2222.SR', country: 'SA', type: 'stock' },
  { name: 'Al Rajhi Bank',  ticker: '1120.SR', country: 'SA', type: 'stock' },
  { name: 'QNB Group',      ticker: 'QNB.QA',  country: 'QA', type: 'stock' },
  { name: 'Emaar Properties', ticker: 'EMAAR.DU', country: 'AE', type: 'stock' },
  { name: 'SABIC',          ticker: '2010.SR', country: 'SA', type: 'stock' },
];

const COUNTRY_MAP = {
  '2222.SR': 'SA', '1120.SR': 'SA', '7010.SR': 'SA', '2010.SR': 'SA',
  'ENBD.DU': 'AE', 'FAB.DU': 'AE', 'EMAAR.DU': 'AE',
  'QNB.QA': 'QA', 'KFH.KW': 'KW',
  'XAU': '', 'XAG': '', 'BZ': '', 'CL': '',
  'BTC': '', 'ETH': '', 'SOL': '', 'XRP': '',
};

const FREQUENCIES = [
  { id: 'daily',   label: 'Daily' },
  { id: 'weekly',  label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
];

const DAYS_OF_WEEK = [
  { id: 1, label: 'Mon' },
  { id: 2, label: 'Tue' },
  { id: 3, label: 'Wed' },
  { id: 4, label: 'Thu' },
  { id: 5, label: 'Fri' },
];

export function loadAutoInvestPlans() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch { return []; }
}

export function saveAutoInvestPlans(plans) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
}

function getTomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

const card = {
  background: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--r-md)',
};

const inputStyle = {
  width: '100%',
  fontSize: 12,
  fontFamily: 'var(--font-body)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--r-sm)',
  padding: '10px 12px',
  outline: 'none',
  color: 'var(--text-1)',
  background: 'var(--card)',
  boxSizing: 'border-box',
};

const sectionLabel = {
  fontFamily: 'var(--font-head)',
  fontSize: 10,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '1.2px',
  color: 'var(--text-3)',
  margin: '0 0 6px',
};

export default function AutoInvestModal({ onClose, onPlanCreated }) {
  const [step, setStep] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('SAR');
  const [frequency, setFrequency] = useState('weekly');
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [startDate] = useState(getTomorrow());

  const filteredAssets = useMemo(() => {
    if (!search) return [];
    const q = search.toLowerCase();
    return TRADEABLE_ASSETS.filter(
      a => a.name.toLowerCase().includes(q) || a.symbol.toLowerCase().includes(q)
    );
  }, [search]);

  function selectAsset(asset) {
    const country = COUNTRY_MAP[asset.symbol] || '';
    setSelectedAsset({
      name: asset.name,
      ticker: asset.symbol,
      country,
      type: asset.type,
    });
    setStep(2);
  }

  function selectPopular(p) {
    setSelectedAsset({ ...p });
    setStep(2);
  }

  const parsedAmount = parseFloat(amount) || 0;
  const canProceedStep2 = parsedAmount >= 10;

  function handleConfirm() {
    const plan = {
      id: Date.now(),
      asset: { name: selectedAsset.name, ticker: selectedAsset.ticker, country: selectedAsset.country },
      amount: parsedAmount,
      currency,
      frequency,
      dayOfWeek: frequency === 'weekly' ? dayOfWeek : undefined,
      dayOfMonth: frequency === 'monthly' ? dayOfMonth : undefined,
      active: true,
      createdAt: new Date().toISOString(),
    };
    const plans = loadAutoInvestPlans();
    plans.push(plan);
    saveAutoInvestPlans(plans);
    if (onPlanCreated) onPlanCreated(plan);
    onClose();
  }

  function getFrequencyLabel() {
    if (frequency === 'daily') return 'Every day';
    if (frequency === 'weekly') return `Every ${DAYS_OF_WEEK.find(d => d.id === dayOfWeek)?.label || 'Mon'}`;
    return `Monthly on day ${dayOfMonth}`;
  }

  const pillBase = {
    padding: '6px 14px',
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 600,
    fontFamily: 'var(--font-body)',
    border: '1px solid var(--border)',
    cursor: 'pointer',
    transition: 'all 0.2s',
    background: 'var(--bg)',
    color: 'var(--text-2)',
  };

  const pillActive = {
    ...pillBase,
    background: 'var(--navy)',
    color: '#fff',
    borderColor: 'var(--navy)',
  };

  const dotBase = {
    width: 8, height: 8, borderRadius: '50%',
    transition: 'all 0.2s',
  };

  const modal = (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(1,1,49,0.4)',
        zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--card)',
          borderRadius: 'var(--r-xl) var(--r-xl) 0 0',
          width: '100%',
          maxWidth: 430,
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          animation: 'fadeIn 0.2s ease',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div style={{
          padding: '16px 20px 12px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)', fontFamily: 'var(--font-head)', margin: 0 }}>Auto-Invest</h3>
              <p style={{ fontSize: 10, color: 'var(--text-3)', margin: '2px 0 0' }}>Set up recurring investments</p>
            </div>
            <button onClick={onClose} style={{ padding: 4, borderRadius: 'var(--r-sm)', border: 'none', background: 'none', cursor: 'pointer' }}>
              <X size={16} style={{ color: 'var(--text-3)' }} />
            </button>
          </div>
          {/* Step dots */}
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
            {[1, 2, 3].map(s => (
              <div
                key={s}
                style={{
                  ...dotBase,
                  background: s === step ? 'var(--navy)' : 'var(--border)',
                  width: s === step ? 20 : 8,
                  borderRadius: s === step ? 4 : '50%',
                }}
              />
            ))}
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ overflowY: 'auto', padding: 20, flex: 1 }}>

          {/* Step 1: Select Asset */}
          {step === 1 && (
            <div>
              <p style={sectionLabel}>Search Asset</p>
              <div style={{ position: 'relative', marginBottom: 12 }}>
                <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search stocks, crypto, metals..."
                  style={{ ...inputStyle, paddingLeft: 36 }}
                  autoFocus
                />
              </div>

              {search && filteredAssets.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16, maxHeight: 200, overflowY: 'auto' }}>
                  {filteredAssets.map((a, i) => (
                    <button
                      key={a.symbol + i}
                      onClick={() => selectAsset(a)}
                      style={{
                        ...card, padding: 10,
                        display: 'flex', alignItems: 'center', gap: 12,
                        textAlign: 'left', cursor: 'pointer', width: '100%',
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--navy)', margin: 0 }}>{a.name}</p>
                        <p style={{ fontSize: 10, color: 'var(--text-3)', margin: 0 }}>{a.symbol}</p>
                      </div>
                      {COUNTRY_MAP[a.symbol] && (
                        <span style={{
                          fontSize: 8, fontWeight: 700, padding: '2px 6px',
                          borderRadius: 4, background: 'var(--blue-light)', color: 'var(--navy)',
                        }}>{COUNTRY_MAP[a.symbol]}</span>
                      )}
                      <ChevronRight size={14} style={{ color: 'var(--text-3)' }} />
                    </button>
                  ))}
                </div>
              )}

              {search && filteredAssets.length === 0 && (
                <p style={{ fontSize: 10, color: 'var(--text-3)', textAlign: 'center', padding: '12px 0' }}>No matching assets</p>
              )}

              <p style={{ ...sectionLabel, marginTop: 8 }}>Popular GCC Stocks</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {POPULAR_ASSETS.map(p => (
                  <button
                    key={p.ticker}
                    onClick={() => selectPopular(p)}
                    style={{
                      ...card, padding: 10,
                      display: 'flex', alignItems: 'center', gap: 12,
                      textAlign: 'left', cursor: 'pointer', width: '100%',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--navy)', margin: 0 }}>{p.name}</p>
                      <p style={{ fontSize: 10, color: 'var(--text-3)', margin: 0 }}>{p.ticker}</p>
                    </div>
                    <span style={{
                      fontSize: 8, fontWeight: 700, padding: '2px 6px',
                      borderRadius: 4, background: 'var(--blue-light)', color: 'var(--navy)',
                    }}>{p.country}</span>
                    <ChevronRight size={14} style={{ color: 'var(--text-3)' }} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Configure Investment */}
          {step === 2 && (
            <div>
              {/* Selected asset chip */}
              <div style={{
                ...card, padding: 10, marginBottom: 16,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--navy)', margin: 0, fontFamily: 'var(--font-head)' }}>{selectedAsset.name}</p>
                  <p style={{ fontSize: 10, color: 'var(--text-3)', margin: 0 }}>{selectedAsset.ticker}</p>
                </div>
                <button
                  onClick={() => { setStep(1); setSelectedAsset(null); setSearch(''); }}
                  style={{ fontSize: 10, fontWeight: 600, color: 'var(--blue)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}
                >
                  Change
                </button>
              </div>

              {/* Amount */}
              <p style={sectionLabel}>Amount per period</p>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="100"
                  min="10"
                  style={{ ...inputStyle, flex: 1 }}
                  autoFocus
                />
                <div style={{ display: 'flex', gap: 2, background: 'var(--bg)', borderRadius: 'var(--r-sm)', padding: 2 }}>
                  {['SAR', 'USD'].map(c => (
                    <button
                      key={c}
                      onClick={() => setCurrency(c)}
                      style={{
                        padding: '6px 10px', fontSize: 10, fontWeight: 600,
                        fontFamily: 'var(--font-body)',
                        borderRadius: 'var(--r-sm)', border: 'none', cursor: 'pointer',
                        background: currency === c ? 'var(--navy)' : 'transparent',
                        color: currency === c ? '#fff' : 'var(--text-2)',
                        transition: 'all 0.2s',
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              {amount && parsedAmount < 10 && (
                <p style={{ fontSize: 10, color: 'var(--red)', margin: '-12px 0 12px' }}>Minimum amount is 10</p>
              )}

              {/* Frequency */}
              <p style={sectionLabel}>Frequency</p>
              <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                {FREQUENCIES.map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFrequency(f.id)}
                    style={frequency === f.id ? pillActive : pillBase}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Day of week (weekly) */}
              {frequency === 'weekly' && (
                <>
                  <p style={sectionLabel}>Day of week</p>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                    {DAYS_OF_WEEK.map(d => (
                      <button
                        key={d.id}
                        onClick={() => setDayOfWeek(d.id)}
                        style={dayOfWeek === d.id ? pillActive : pillBase}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Day of month (monthly) */}
              {frequency === 'monthly' && (
                <>
                  <p style={sectionLabel}>Day of month</p>
                  <select
                    value={dayOfMonth}
                    onChange={e => setDayOfMonth(Number(e.target.value))}
                    style={{ ...inputStyle, marginBottom: 16, appearance: 'auto' }}
                  >
                    {Array.from({ length: 28 }, (_, i) => i + 1).map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </>
              )}

              {/* Start date */}
              <p style={sectionLabel}>Start date</p>
              <div style={{ ...card, padding: 10, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Calendar size={14} style={{ color: 'var(--text-3)' }} />
                <span style={{ fontSize: 12, color: 'var(--navy)', fontWeight: 500, fontFamily: 'var(--font-body)' }}>{startDate}</span>
              </div>

              {/* Next / Back */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => { setStep(1); setSelectedAsset(null); setSearch(''); }}
                  style={{
                    flex: 1, padding: '10px 0', borderRadius: 'var(--r-md)',
                    border: '1px solid var(--border)', background: 'none',
                    fontSize: 12, fontWeight: 600, color: 'var(--text-2)', cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  Back
                </button>
                <button
                  onClick={() => canProceedStep2 && setStep(3)}
                  disabled={!canProceedStep2}
                  style={{
                    flex: 2, padding: '10px 0', borderRadius: 'var(--r-md)',
                    border: 'none',
                    background: canProceedStep2 ? 'var(--navy)' : 'var(--border)',
                    color: '#fff', fontSize: 12, fontWeight: 600,
                    cursor: canProceedStep2 ? 'pointer' : 'not-allowed',
                    fontFamily: 'var(--font-body)',
                    transition: 'opacity 0.2s',
                  }}
                >
                  Review
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review & Confirm */}
          {step === 3 && (
            <div>
              <div style={{
                ...card, padding: 16, marginBottom: 16,
                background: 'linear-gradient(135deg, var(--blue-light), var(--card))',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <RefreshCw size={16} style={{ color: 'var(--navy)' }} />
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', margin: 0, fontFamily: 'var(--font-head)' }}>Auto-Invest Summary</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Asset</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--navy)', fontFamily: 'var(--font-head)' }}>
                      {selectedAsset?.name}
                      {selectedAsset?.country && (
                        <span style={{
                          fontSize: 8, fontWeight: 700, padding: '1px 5px', borderRadius: 3,
                          background: 'var(--bg)', color: 'var(--text-2)', marginLeft: 6,
                        }}>{selectedAsset.country}</span>
                      )}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Ticker</span>
                    <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-1)' }}>{selectedAsset?.ticker}</span>
                  </div>
                  <div style={{ height: 1, background: 'var(--border)' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Amount</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)', fontFamily: 'var(--font-head)', fontVariantNumeric: 'tabular-nums' }}>
                      {parsedAmount.toLocaleString()} {currency}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Frequency</span>
                    <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-1)' }}>{getFrequencyLabel()}</span>
                  </div>
                  <div style={{ height: 1, background: 'var(--border)' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, color: 'var(--text-3)' }}>First investment</span>
                    <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-1)' }}>{startDate}</span>
                  </div>
                </div>
              </div>

              {/* Back / Confirm */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setStep(2)}
                  style={{
                    flex: 1, padding: '10px 0', borderRadius: 'var(--r-md)',
                    border: '1px solid var(--border)', background: 'none',
                    fontSize: 12, fontWeight: 600, color: 'var(--text-2)', cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  Back
                </button>
                <button
                  onClick={handleConfirm}
                  style={{
                    flex: 2, padding: '12px 0', borderRadius: 'var(--r-md)',
                    border: 'none', background: 'var(--navy)', color: '#fff',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  <Check size={14} /> Start Auto-Invest
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
