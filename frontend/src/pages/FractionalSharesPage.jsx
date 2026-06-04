import { useState } from 'react';
import { Building2, DollarSign, PieChart, TrendingUp, Layers, Target, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';

const COMPANIES = [
  { name: 'Saudi Aramco', ticker: '2222.SR', price: 28.45, currency: 'SAR', country: 'Saudi Arabia' },
  { name: 'Al Rajhi Bank', ticker: '1120.SR', price: 95.20, currency: 'SAR', country: 'Saudi Arabia' },
  { name: 'Emirates NBD', ticker: 'ENBD', price: 18.75, currency: 'AED', country: 'UAE' },
  { name: 'Qatar National Bank', ticker: 'QNBK', price: 14.60, currency: 'QAR', country: 'Qatar' },
  { name: 'Kuwait Finance House', ticker: 'KFH', price: 8.30, currency: 'KWD', country: 'Kuwait' },
  { name: 'Ahli United Bank', ticker: 'AUB', price: 0.82, currency: 'BHD', country: 'Bahrain' },
  { name: 'Bank Muscat', ticker: 'BKMB', price: 0.52, currency: 'OMR', country: 'Oman' },
];

const STEPS = [
  { num: 1, title: 'Choose a Company', desc: 'Select any GCC-listed company from the exchange.', Icon: Building2 },
  { num: 2, title: 'Enter Any Amount', desc: 'Invest as little as $1 — no minimum share requirement.', Icon: DollarSign },
  { num: 3, title: 'Own a Fraction', desc: 'You receive a proportional share of the stock.', Icon: PieChart },
];

const BENEFITS = [
  { title: 'Diversify Easily', desc: 'Spread your investment across many companies with small amounts.', Icon: Layers },
  { title: 'Start Small', desc: 'Begin investing from as little as $1 with no barriers.', Icon: Target },
  { title: 'No Minimum', desc: 'No minimum share purchase — buy exactly what you can afford.', Icon: DollarSign },
  { title: 'Dollar-Cost Average', desc: 'Invest fixed amounts regularly regardless of share price.', Icon: RefreshCw },
];

const EXCHANGE_SUPPORT = [
  { exchange: 'Tadawul (TASI)', country: 'Saudi Arabia', status: 'Coming 2026', supported: false },
  { exchange: 'DFM', country: 'UAE', status: 'Available', supported: true },
  { exchange: 'ADX', country: 'UAE', status: 'Available', supported: true },
  { exchange: 'Boursa Kuwait', country: 'Kuwait', status: 'Pilot Phase', supported: false },
  { exchange: 'Qatar Exchange', country: 'Qatar', status: 'Under Review', supported: false },
  { exchange: 'Bahrain Bourse', country: 'Bahrain', status: 'Coming 2027', supported: false },
  { exchange: 'MSX', country: 'Oman', status: 'Not Yet', supported: false },
];

const FAQS = [
  {
    q: 'Do I actually own the stock with fractional shares?',
    a: 'Yes. Fractional shares grant you proportional ownership, including dividend rights. Your broker holds the shares on your behalf, and you benefit from any price appreciation or dividends just like a whole-share owner.',
  },
  {
    q: 'Can I sell fractional shares at any time?',
    a: 'In most cases, yes. Fractional shares can be sold during market hours just like whole shares. However, liquidity may vary by broker and exchange. Check with your broker for specific rules.',
  },
  {
    q: 'Are fractional shares Sharia-compliant?',
    a: 'Fractional shares follow the same compliance rules as the underlying stock. If the company itself is Sharia-compliant, then owning a fraction of it is also compliant. Use the Ashom Sharia Screening tool to verify individual stocks.',
  },
];

const sectionLabel = {
  fontFamily: 'var(--font-head)', fontSize: 11, fontWeight: 700,
  textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--text-3)', margin: '0 0 10px',
};

const card = {
  background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)',
};

export default function FractionalSharesPage() {
  const [selectedCompany, setSelectedCompany] = useState(COMPANIES[0]);
  const [amount, setAmount] = useState(50);
  const [openFaq, setOpenFaq] = useState(null);

  const shares = amount > 0 ? (amount / selectedCompany.price) : 0;
  const fractionPct = Math.min((shares % 1) * 100, 100);

  return (
    <div className="animate-fade-in">
      <PageHeader title="Fractional Shares" subtitle="Invest with Any Amount" backTo="/learning" />

      <div style={{ padding: '0 16px 100px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Hero Card */}
        <div style={{
          borderRadius: 'var(--r-lg)', padding: 20,
          background: 'linear-gradient(135deg, var(--navy), var(--navy-soft, #1a1a4e))',
          color: '#fff', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -20, right: -20, width: 100, height: 100,
            borderRadius: '50%', background: 'rgba(255,255,255,0.05)',
          }} />
          <p style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-head)', marginBottom: 6 }}>
            Own a piece of any company
          </p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
            Start investing from as little as $1. No need to buy whole shares — fractional investing lets everyone participate in the GCC markets.
          </p>
        </div>

        {/* How It Works */}
        <div>
          <p style={sectionLabel}>How It Works</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {STEPS.map(({ num, title, desc, Icon }) => (
              <div key={num} style={{ ...card, padding: 14, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 'var(--r-md)', flexShrink: 0,
                  background: 'var(--blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--blue)', fontFamily: 'var(--font-head)' }}>{num}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)', fontFamily: 'var(--font-head)', margin: '0 0 2px' }}>{title}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-3)', lineHeight: 1.4, margin: 0 }}>{desc}</p>
                </div>
                <Icon size={16} style={{ color: 'var(--blue)', flexShrink: 0, marginTop: 2 }} />
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Calculator */}
        <div>
          <p style={sectionLabel}>Fractional Calculator</p>
          <div style={{ ...card, padding: 16 }}>
            {/* Company Selector */}
            <label style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4, display: 'block' }}>
              Company
            </label>
            <select
              value={selectedCompany.ticker}
              onChange={e => setSelectedCompany(COMPANIES.find(c => c.ticker === e.target.value))}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 'var(--r-sm)',
                border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--navy)',
                fontSize: 13, fontFamily: 'var(--font-body)', marginBottom: 12, appearance: 'auto',
              }}
            >
              {COMPANIES.map(c => (
                <option key={c.ticker} value={c.ticker}>
                  {c.name} — {c.currency} {c.price.toFixed(2)}
                </option>
              ))}
            </select>

            {/* Amount Input */}
            <label style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4, display: 'block' }}>
              Investment Amount ($)
            </label>
            <input
              type="number"
              min="1"
              step="1"
              value={amount}
              onChange={e => setAmount(Math.max(0, Number(e.target.value)))}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 'var(--r-sm)',
                border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--navy)',
                fontSize: 13, fontFamily: 'var(--font-body)', marginBottom: 16, boxSizing: 'border-box',
              }}
            />

            {/* Result */}
            <div style={{
              borderRadius: 'var(--r-md)', padding: 16, textAlign: 'center',
              background: 'var(--green-bg, rgba(0,200,150,0.08))', border: '1px solid var(--green, #00C896)',
            }}>
              <p style={{ fontSize: 11, color: 'var(--text-3)', margin: '0 0 6px' }}>You would own</p>
              <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--navy)', fontFamily: 'var(--font-head)', margin: '0 0 4px' }}>
                {shares.toFixed(3)} shares
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-2)', margin: 0 }}>
                of {selectedCompany.name}
              </p>

              {/* Visual pie slice */}
              <div style={{ margin: '16px auto 0', width: 80, height: 80, position: 'relative' }}>
                <svg width="80" height="80" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="36" fill="none" stroke="var(--border)" strokeWidth="6" />
                  <circle
                    cx="40" cy="40" r="36"
                    fill="none" stroke="var(--blue)" strokeWidth="6"
                    strokeDasharray={`${(fractionPct / 100) * 226.2} 226.2`}
                    strokeDashoffset="0"
                    transform="rotate(-90 40 40)"
                    strokeLinecap="round"
                  />
                  <text x="40" y="40" textAnchor="middle" dominantBaseline="central"
                    style={{ fontSize: 11, fontWeight: 700, fill: 'var(--navy)', fontFamily: 'var(--font-head)' }}>
                    {(shares % 1 * 100).toFixed(0)}%
                  </text>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div>
          <p style={sectionLabel}>Benefits</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {BENEFITS.map(({ title, desc, Icon }) => (
              <div key={title} style={{ ...card, padding: 14 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 'var(--r-sm)',
                  background: 'var(--blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 8,
                }}>
                  <Icon size={14} style={{ color: 'var(--blue)' }} />
                </div>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--navy)', fontFamily: 'var(--font-head)', margin: '0 0 2px' }}>{title}</p>
                <p style={{ fontSize: 10, color: 'var(--text-3)', lineHeight: 1.4, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* GCC Exchange Support */}
        <div>
          <p style={sectionLabel}>GCC Exchange Support</p>
          <div style={{ ...card, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
              <thead>
                <tr style={{ background: 'var(--bg)' }}>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--text-3)', fontFamily: 'var(--font-head)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Exchange</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--text-3)', fontFamily: 'var(--font-head)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Country</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, color: 'var(--text-3)', fontFamily: 'var(--font-head)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {EXCHANGE_SUPPORT.map(({ exchange, country, status, supported }) => (
                  <tr key={exchange} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '8px 12px', fontWeight: 500, color: 'var(--navy)' }}>{exchange}</td>
                    <td style={{ padding: '8px 12px', color: 'var(--text-2)' }}>{country}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                      <span style={{
                        fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                        background: supported ? 'var(--green-bg, rgba(0,200,150,0.1))' : 'rgba(150,150,150,0.1)',
                        color: supported ? 'var(--green, #00C896)' : 'var(--text-3)',
                      }}>
                        {status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div>
          <p style={sectionLabel}>Frequently Asked Questions</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {FAQS.map((faq, i) => (
              <div key={i} style={{ ...card, overflow: 'hidden' }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: '100%', padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                    fontSize: 12, fontWeight: 600, color: 'var(--navy)', fontFamily: 'var(--font-head)',
                  }}
                >
                  {faq.q}
                  {openFaq === i ? <ChevronUp size={14} style={{ color: 'var(--text-3)', flexShrink: 0 }} /> : <ChevronDown size={14} style={{ color: 'var(--text-3)', flexShrink: 0 }} />}
                </button>
                {openFaq === i && (
                  <div style={{ padding: '0 14px 12px', fontSize: 11, color: 'var(--text-2)', lineHeight: 1.6 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
