import { useState, useMemo } from 'react';
import { Info, TrendingUp, TrendingDown } from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';

/* ── Underlying stocks ── */
const UNDERLYINGS = {
  '2222.SR': { name: 'Aramco',    price: 28.45 },
  '1120.SR': { name: 'Al Rajhi',  price: 95.20 },
  '2010.SR': { name: 'SABIC',     price: 72.10 },
  '7010.SR': { name: 'STC',       price: 42.80 },
  'EMAAR.AE': { name: 'Emaar',   price: 8.76 },
};

const EXPIRIES = ['Apr 2026', 'May 2026', 'Jun 2026'];

/* ── Deterministic options-chain generator ── */
function generateOptionsChain(ticker, currentPrice, isCall) {
  let hash = 0;
  for (let i = 0; i < ticker.length; i++) hash = ((hash << 5) - hash + ticker.charCodeAt(i)) | 0;
  const strikes = [];
  for (let i = -5; i <= 5; i++) {
    const strike = Math.round(currentPrice * (1 + i * 0.025) * 100) / 100;
    const seed = Math.abs(hash * (i + 10) * 7919) % 10000;
    const itm = isCall ? strike < currentPrice : strike > currentPrice;
    strikes.push({
      strike,
      bid: +(Math.max(0.01, (itm ? Math.abs(currentPrice - strike) : 0) + (seed % 100) / 200)).toFixed(2),
      ask: +(Math.max(0.02, (itm ? Math.abs(currentPrice - strike) : 0) + (seed % 100) / 200 + 0.05)).toFixed(2),
      volume: 50 + (seed % 500),
      oi: 200 + (seed % 2000),
      iv: +(15 + (seed % 30) + Math.abs(i) * 2).toFixed(1),
      delta: isCall ? +(0.5 + i * -0.09).toFixed(2) : +((-0.5) + i * 0.09).toFixed(2),
      itm,
      atm: i === 0,
    });
  }
  return strikes;
}

export default function OptionsScreenerPage() {
  const [selectedTicker, setSelectedTicker] = useState('2222.SR');
  const [isCall, setIsCall] = useState(true);
  const [expiry, setExpiry] = useState(EXPIRIES[0]);

  const underlying = UNDERLYINGS[selectedTicker];
  const chain = useMemo(
    () => generateOptionsChain(selectedTicker, underlying.price, isCall),
    [selectedTicker, underlying.price, isCall]
  );

  return (
    <div className="animate-fade-in">
      <PageHeader title="Options Screener" subtitle="GCC Derivatives Market" backTo="/analytics" />

      {/* Info banner */}
      <div className="mx-4 mt-4 p-3 rounded-lg flex items-start gap-2" style={{ background: 'var(--blue-light)', border: '1px solid var(--border)' }}>
        <Info size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--blue)' }} />
        <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-2)' }}>
          Options trading is available on select GCC exchanges including TASI and DFM
        </p>
      </div>

      {/* Underlying selector */}
      <div className="px-4 mt-4">
        <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-3)' }}>Underlying</p>
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {Object.entries(UNDERLYINGS).map(([ticker, info]) => {
            const active = ticker === selectedTicker;
            return (
              <button
                key={ticker}
                onClick={() => setSelectedTicker(ticker)}
                className="shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all duration-150"
                style={{
                  background: active ? 'var(--navy)' : 'var(--card)',
                  color: active ? '#fff' : 'var(--text-2)',
                  border: `1px solid ${active ? 'var(--navy)' : 'var(--border)'}`,
                }}
              >
                {info.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Current price */}
      <div className="px-4 mt-3 flex items-baseline gap-2">
        <span className="text-[18px] font-bold font-head" style={{ color: 'var(--navy)' }}>{underlying.price.toFixed(2)}</span>
        <span className="text-[11px]" style={{ color: 'var(--text-3)' }}>{selectedTicker}</span>
      </div>

      {/* Call / Put toggle */}
      <div className="px-4 mt-3 flex gap-2">
        <button
          onClick={() => setIsCall(true)}
          className="flex-1 py-2 rounded-lg text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all duration-150"
          style={{
            background: isCall ? 'var(--green-bg)' : 'var(--card)',
            color: isCall ? 'var(--green)' : 'var(--text-3)',
            border: `1px solid ${isCall ? 'var(--green)' : 'var(--border)'}`,
          }}
        >
          <TrendingUp size={13} /> Calls
        </button>
        <button
          onClick={() => setIsCall(false)}
          className="flex-1 py-2 rounded-lg text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all duration-150"
          style={{
            background: !isCall ? 'var(--red-bg)' : 'var(--card)',
            color: !isCall ? 'var(--red)' : 'var(--text-3)',
            border: `1px solid ${!isCall ? 'var(--red)' : 'var(--border)'}`,
          }}
        >
          <TrendingDown size={13} /> Puts
        </button>
      </div>

      {/* Expiry selector */}
      <div className="px-4 mt-3 flex gap-2">
        {EXPIRIES.map(exp => {
          const active = exp === expiry;
          return (
            <button
              key={exp}
              onClick={() => setExpiry(exp)}
              className="px-3 py-1 rounded-full text-[10px] font-semibold transition-all duration-150"
              style={{
                background: active ? 'var(--blue)' : 'var(--card)',
                color: active ? '#fff' : 'var(--text-3)',
                border: `1px solid ${active ? 'var(--blue)' : 'var(--border)'}`,
              }}
            >
              {exp}
            </button>
          );
        })}
      </div>

      {/* Options chain table */}
      <div className="px-4 mt-4 pb-28 overflow-x-auto">
        <table className="w-full text-[11px]" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead>
            <tr>
              {['Strike', 'Bid', 'Ask', 'Vol', 'OI', 'IV%', '\u0394'].map(h => (
                <th
                  key={h}
                  className="text-[9px] font-bold uppercase tracking-wider py-2 px-1.5 text-right first:text-left"
                  style={{ color: 'var(--text-3)', borderBottom: '1px solid var(--border)' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {chain.map((row, idx) => (
              <tr
                key={idx}
                style={{
                  background: row.itm ? 'var(--blue-light)' : 'transparent',
                  borderLeft: row.atm ? '3px solid var(--navy)' : '3px solid transparent',
                }}
              >
                <td className="py-1.5 px-1.5 font-semibold" style={{ color: 'var(--navy)' }}>
                  {row.strike.toFixed(2)}
                  {row.atm && <span className="ml-1 text-[8px] px-1 py-0.5 rounded" style={{ background: 'var(--navy)', color: '#fff' }}>ATM</span>}
                </td>
                <td className="py-1.5 px-1.5 text-right" style={{ color: 'var(--green)' }}>{row.bid.toFixed(2)}</td>
                <td className="py-1.5 px-1.5 text-right" style={{ color: 'var(--red)' }}>{row.ask.toFixed(2)}</td>
                <td className="py-1.5 px-1.5 text-right" style={{ color: 'var(--text-2)' }}>{row.volume.toLocaleString()}</td>
                <td className="py-1.5 px-1.5 text-right" style={{ color: 'var(--text-2)' }}>{row.oi.toLocaleString()}</td>
                <td className="py-1.5 px-1.5 text-right" style={{ color: 'var(--text-2)' }}>{row.iv}%</td>
                <td className="py-1.5 px-1.5 text-right font-mono" style={{ color: 'var(--text-1)' }}>{row.delta}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
