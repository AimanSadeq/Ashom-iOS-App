import { useState, useMemo } from 'react';
import { Info, ArrowUpDown, Filter, ArrowRightLeft } from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';

const CROSS_LISTINGS = [
  {
    name: 'Ooredoo Group', primary: 'QSE',
    listings: [
      { exchange: 'QSE', price: 9.45, currency: 'QAR' },
      { exchange: 'Boursa Kuwait', price: 0.82, currency: 'KWD', equivQAR: 9.72 },
    ],
    spread: 2.86,
  },
  {
    name: 'Gulf Bank', primary: 'Boursa Kuwait',
    listings: [
      { exchange: 'Boursa Kuwait', price: 0.295, currency: 'KWD' },
      { exchange: 'BAX', price: 0.378, currency: 'BHD', equivKWD: 0.302 },
    ],
    spread: 2.37,
  },
  {
    name: 'Ahli United Bank', primary: 'BAX',
    listings: [
      { exchange: 'BAX', price: 0.81, currency: 'BHD' },
      { exchange: 'Boursa Kuwait', price: 0.265, currency: 'KWD', equivBHD: 0.795 },
    ],
    spread: -1.85,
  },
  {
    name: 'Zain Group', primary: 'Boursa Kuwait',
    listings: [
      { exchange: 'Boursa Kuwait', price: 0.580, currency: 'KWD' },
      { exchange: 'BAX', price: 0.735, currency: 'BHD', equivKWD: 0.588 },
    ],
    spread: 1.38,
  },
  {
    name: 'GFH Financial Group', primary: 'BAX',
    listings: [
      { exchange: 'BAX', price: 0.325, currency: 'BHD' },
      { exchange: 'DFM', price: 1.15, currency: 'AED', equivBHD: 0.318 },
      { exchange: 'Boursa Kuwait', price: 0.105, currency: 'KWD', equivBHD: 0.315 },
    ],
    spread: 3.08,
  },
  {
    name: 'KIPCO', primary: 'Boursa Kuwait',
    listings: [
      { exchange: 'Boursa Kuwait', price: 0.182, currency: 'KWD' },
      { exchange: 'BAX', price: 0.232, currency: 'BHD', equivKWD: 0.186 },
    ],
    spread: 2.20,
  },
];

/* ── Exchange badge colours ── */
const EXCHANGE_COLORS = {
  QSE:             { bg: '#EDE7F6', fg: '#6A1B9A' },
  'Boursa Kuwait': { bg: '#E8F5E9', fg: '#2E7D32' },
  BAX:             { bg: '#FFF3E0', fg: '#E65100' },
  DFM:             { bg: '#E3F2FD', fg: '#1565C0' },
};

export default function CrossListingPage() {
  const [sortBy, setSortBy] = useState('spread'); // 'spread' | 'name'
  const [oppOnly, setOppOnly] = useState(false);

  const filtered = useMemo(() => {
    let list = [...CROSS_LISTINGS];
    if (oppOnly) list = list.filter(c => Math.abs(c.spread) > 2);
    list.sort((a, b) =>
      sortBy === 'spread'
        ? Math.abs(b.spread) - Math.abs(a.spread)
        : a.name.localeCompare(b.name)
    );
    return list;
  }, [sortBy, oppOnly]);

  return (
    <div className="animate-fade-in">
      <PageHeader title="Cross-Listings" subtitle="Multi-Exchange GCC Stocks" backTo="/markets" />

      {/* Info card */}
      <div className="mx-4 mt-4 p-3 rounded-lg flex items-start gap-2" style={{ background: 'var(--blue-light)', border: '1px solid var(--border)' }}>
        <Info size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--blue)' }} />
        <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-2)' }}>
          Some GCC companies are listed on multiple exchanges, creating potential arbitrage opportunities
        </p>
      </div>

      {/* Controls */}
      <div className="px-4 mt-4 flex items-center gap-2">
        {/* Sort pills */}
        <button
          onClick={() => setSortBy('spread')}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-semibold transition-all duration-150"
          style={{
            background: sortBy === 'spread' ? 'var(--navy)' : 'var(--card)',
            color: sortBy === 'spread' ? '#fff' : 'var(--text-3)',
            border: `1px solid ${sortBy === 'spread' ? 'var(--navy)' : 'var(--border)'}`,
          }}
        >
          <ArrowUpDown size={10} /> Spread %
        </button>
        <button
          onClick={() => setSortBy('name')}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-semibold transition-all duration-150"
          style={{
            background: sortBy === 'name' ? 'var(--navy)' : 'var(--card)',
            color: sortBy === 'name' ? '#fff' : 'var(--text-3)',
            border: `1px solid ${sortBy === 'name' ? 'var(--navy)' : 'var(--border)'}`,
          }}
        >
          <ArrowUpDown size={10} /> Name
        </button>

        <div className="flex-1" />

        {/* Opportunities toggle */}
        <button
          onClick={() => setOppOnly(o => !o)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-semibold transition-all duration-150"
          style={{
            background: oppOnly ? 'var(--green-bg)' : 'var(--card)',
            color: oppOnly ? 'var(--green)' : 'var(--text-3)',
            border: `1px solid ${oppOnly ? 'var(--green)' : 'var(--border)'}`,
          }}
        >
          <Filter size={10} /> Opportunities
        </button>
      </div>

      {/* Company cards */}
      <div className="px-4 mt-4 pb-28 space-y-3">
        {filtered.map(company => {
          const isOpportunity = Math.abs(company.spread) > 2;
          const spreadColor = company.spread > 0 ? 'var(--green)' : company.spread < 0 ? 'var(--red)' : 'var(--text-3)';
          const spreadBg = company.spread > 0 ? 'var(--green-bg)' : company.spread < 0 ? 'var(--red-bg)' : 'var(--card)';

          return (
            <div
              key={company.name}
              className="rounded-xl p-4"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ArrowRightLeft size={14} style={{ color: 'var(--blue)' }} />
                  <span className="text-[13px] font-bold font-head" style={{ color: 'var(--navy)' }}>{company.name}</span>
                </div>
                <span
                  className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: EXCHANGE_COLORS[company.primary]?.bg || 'var(--card)',
                    color: EXCHANGE_COLORS[company.primary]?.fg || 'var(--text-2)',
                  }}
                >
                  {company.primary}
                </span>
              </div>

              {/* Listings table */}
              <table className="w-full text-[11px] mb-3">
                <thead>
                  <tr>
                    {['Exchange', 'Price', 'Currency'].map(h => (
                      <th
                        key={h}
                        className="text-[9px] font-bold uppercase tracking-wider py-1 text-left"
                        style={{ color: 'var(--text-3)', borderBottom: '1px solid var(--border)' }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {company.listings.map((listing, idx) => (
                    <tr key={idx}>
                      <td className="py-1.5" style={{ color: 'var(--text-1)' }}>
                        <span
                          className="text-[9px] font-semibold px-1.5 py-0.5 rounded"
                          style={{
                            background: EXCHANGE_COLORS[listing.exchange]?.bg || 'var(--card)',
                            color: EXCHANGE_COLORS[listing.exchange]?.fg || 'var(--text-2)',
                          }}
                        >
                          {listing.exchange}
                        </span>
                      </td>
                      <td className="py-1.5 font-semibold" style={{ color: 'var(--navy)' }}>{listing.price.toFixed(3)}</td>
                      <td className="py-1.5" style={{ color: 'var(--text-3)' }}>{listing.currency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Spread + arbitrage badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px]" style={{ color: 'var(--text-3)' }}>Spread:</span>
                  <span
                    className="text-[13px] font-bold font-head"
                    style={{ color: spreadColor }}
                  >
                    {company.spread > 0 ? '+' : ''}{company.spread.toFixed(2)}%
                  </span>
                </div>
                <span
                  className="text-[9px] font-bold px-2 py-1 rounded-full"
                  style={{
                    background: isOpportunity ? 'var(--green-bg)' : 'var(--card)',
                    color: isOpportunity ? 'var(--green)' : 'var(--text-3)',
                    border: `1px solid ${isOpportunity ? 'var(--green)' : 'var(--border)'}`,
                  }}
                >
                  {isOpportunity ? 'Opportunity' : 'Neutral'}
                </span>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[12px]" style={{ color: 'var(--text-3)' }}>No cross-listings match the current filter</p>
          </div>
        )}
      </div>
    </div>
  );
}
