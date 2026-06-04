import { useState, useMemo } from 'react';
import { ArrowDownUp, RefreshCw } from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';

// GCC currencies with rates to USD (fixed peg rates — these are real peg values)
const CURRENCIES = [
  { code: 'USD', name: 'US Dollar',          flag: 'US', rate: 1.0000 },
  { code: 'SAR', name: 'Saudi Riyal',        flag: 'SA', rate: 3.7500 },
  { code: 'AED', name: 'UAE Dirham',         flag: 'AE', rate: 3.6725 },
  { code: 'KWD', name: 'Kuwaiti Dinar',      flag: 'KW', rate: 0.3078 },
  { code: 'QAR', name: 'Qatari Riyal',       flag: 'QA', rate: 3.6400 },
  { code: 'BHD', name: 'Bahraini Dinar',     flag: 'BH', rate: 0.3760 },
  { code: 'OMR', name: 'Omani Rial',         flag: 'OM', rate: 0.3845 },
  { code: 'EUR', name: 'Euro',               flag: 'EU', rate: 0.9230 },
  { code: 'GBP', name: 'British Pound',      flag: 'GB', rate: 0.7920 },
];

// Cross rate: how many units of "to" per 1 unit of "from"
function convert(amount, fromCode, toCode) {
  const from = CURRENCIES.find(c => c.code === fromCode);
  const to = CURRENCIES.find(c => c.code === toCode);
  if (!from || !to || !amount) return 0;
  // Convert from -> USD -> to
  const usdAmount = amount / from.rate;
  return usdAmount * to.rate;
}

export default function CurrencyConverterPage() {
  const [amount, setAmount] = useState('1000');
  const [fromCurrency, setFromCurrency] = useState('SAR');
  const [toCurrency, setToCurrency] = useState('AED');

  const result = useMemo(() => {
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return 0;
    return convert(num, fromCurrency, toCurrency);
  }, [amount, fromCurrency, toCurrency]);

  const rate = useMemo(() => convert(1, fromCurrency, toCurrency), [fromCurrency, toCurrency]);

  function handleSwap() {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  }

  // Build cross-rate table for GCC currencies only
  const gccCurrencies = CURRENCIES.filter(c => ['SAR', 'AED', 'KWD', 'QAR', 'BHD', 'OMR'].includes(c.code));

  return (
    <div className="animate-fade-in" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <PageHeader title="Currency Converter" subtitle="GCC Cross Rates" backTo="/" />

      <div className="px-4 py-4 space-y-4">
        {/* Converter card */}
        <div className="rounded-md p-4 space-y-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          {/* From */}
          <div>
            <label className="font-head text-[10px] font-bold uppercase tracking-[1px] block mb-1.5" style={{ color: 'var(--text-3)' }}>From</label>
            <div className="flex gap-2">
              <select
                value={fromCurrency}
                onChange={e => setFromCurrency(e.target.value)}
                className="w-28 text-[12px] font-head font-semibold rounded-md px-3 py-2.5 focus:outline-none"
                style={{ border: '1px solid var(--border)', color: 'var(--navy)', background: 'var(--card)' }}
              >
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                ))}
              </select>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="flex-1 text-lg font-bold rounded-md px-3 py-2.5 focus:outline-none text-right tabular-nums"
                style={{ border: '1px solid var(--border)', color: 'var(--navy)', background: 'var(--card)' }}
                placeholder="0"
              />
            </div>
            <p className="text-[10px] mt-1" style={{ color: 'var(--text-3)' }}>{CURRENCIES.find(c => c.code === fromCurrency)?.name}</p>
          </div>

          {/* Swap button */}
          <div className="flex justify-center">
            <button
              onClick={handleSwap}
              className="w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-all"
              style={{ border: '2px solid var(--border)', background: 'var(--card)', boxShadow: '0 1px 3px rgba(1,1,49,0.06)' }}
            >
              <ArrowDownUp size={16} style={{ color: 'var(--blue)' }} />
            </button>
          </div>

          {/* To */}
          <div>
            <label className="font-head text-[10px] font-bold uppercase tracking-[1px] block mb-1.5" style={{ color: 'var(--text-3)' }}>To</label>
            <div className="flex gap-2">
              <select
                value={toCurrency}
                onChange={e => setToCurrency(e.target.value)}
                className="w-28 text-[12px] font-head font-semibold rounded-md px-3 py-2.5 focus:outline-none"
                style={{ border: '1px solid var(--border)', color: 'var(--navy)', background: 'var(--card)' }}
              >
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                ))}
              </select>
              <div
                className="flex-1 text-lg font-bold rounded-md px-3 py-2.5 text-right tabular-nums"
                style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--navy)' }}
              >
                {result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
              </div>
            </div>
            <p className="text-[10px] mt-1" style={{ color: 'var(--text-3)' }}>{CURRENCIES.find(c => c.code === toCurrency)?.name}</p>
          </div>

          {/* Rate display */}
          <div className="flex items-center justify-center gap-2 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
            <RefreshCw size={11} style={{ color: 'var(--text-3)' }} />
            <p className="text-[10px] tabular-nums" style={{ color: 'var(--text-3)' }}>
              1 {fromCurrency} = {rate.toFixed(4)} {toCurrency}
            </p>
          </div>
        </div>

        {/* Cross-rate table */}
        <p className="font-head text-[11px] font-bold uppercase tracking-[1.2px]" style={{ color: 'var(--text-3)' }}>GCC Cross Rates</p>
        <div className="rounded-md overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-[10px]">
              <thead>
                <tr style={{ background: 'var(--bg)' }}>
                  <th className="text-left px-2 py-2 font-head font-bold sticky left-0" style={{ color: 'var(--text-2)', background: 'var(--bg)' }}>From \ To</th>
                  {gccCurrencies.map(c => (
                    <th key={c.code} className="text-center px-2 py-2 font-head font-bold" style={{ color: 'var(--text-2)' }}>{c.code}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {gccCurrencies.map(from => (
                  <tr key={from.code} style={{ borderTop: '1px solid var(--border)' }}>
                    <td className="px-2 py-2 font-head font-bold sticky left-0" style={{ color: 'var(--navy)', background: 'var(--card)' }}>{from.code}</td>
                    {gccCurrencies.map(to => {
                      const val = convert(1, from.code, to.code);
                      const isSame = from.code === to.code;
                      return (
                        <td
                          key={to.code}
                          className="text-center px-2 py-2 tabular-nums"
                          style={{ color: isSame ? 'var(--text-3)' : 'var(--navy)', fontWeight: isSame ? 400 : 500 }}
                        >
                          {isSame ? '1.00' : val.toFixed(4)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-[10px] italic text-center" style={{ color: 'var(--text-3)' }}>
          GCC currencies are pegged to USD. Rates are indicative and may vary slightly from market rates.
        </p>
      </div>
    </div>
  );
}
