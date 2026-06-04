import { useState, useMemo } from 'react';
import { Search, BookOpen, TrendingUp, Shield, DollarSign, BarChart2, PieChart, Landmark } from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';

const CATEGORIES = [
  { id: 'all', label: 'All', icon: BookOpen },
  { id: 'basics', label: 'Basics', icon: BookOpen },
  { id: 'ratios', label: 'Ratios', icon: BarChart2 },
  { id: 'risk', label: 'Risk', icon: Shield },
  { id: 'markets', label: 'Markets', icon: TrendingUp },
  { id: 'gcc', label: 'GCC', icon: Landmark },
];

const CATEGORY_BADGE = {
  basics: { bg: 'var(--blue-light)', color: 'var(--blue)' },
  ratios: { bg: '#F3EEFF', color: '#7C3AED' },
  risk: { bg: 'var(--red-bg)', color: 'var(--red)' },
  markets: { bg: 'var(--green-bg)', color: 'var(--green)' },
  gcc: { bg: '#FFF7ED', color: '#D97706' },
};

const TERMS = [
  // Basics
  { id: 'stock', term: 'Stock', category: 'basics', short: 'A share of ownership in a company', detail: 'When you buy a stock, you own a small piece of that company. If the company does well, your stock becomes more valuable. Companies sell stocks to raise money for growth. In GCC markets, stocks are traded on exchanges like Tadawul (Saudi), DFM (UAE), and Boursa Kuwait.' },
  { id: 'bond', term: 'Bond', category: 'basics', short: 'A loan you make to a company or government', detail: 'A bond is like an IOU. You lend money to an issuer (company or government), and they promise to pay you back with interest. Bonds are generally considered safer than stocks but offer lower returns. Sukuk are Islamic bonds that comply with Sharia law.' },
  { id: 'dividend', term: 'Dividend', category: 'basics', short: 'Cash payment from a company to its shareholders', detail: 'Some companies share their profits with shareholders through dividends, usually paid quarterly or annually. Dividend yield tells you how much a company pays relative to its stock price. Many GCC companies, especially banks, are known for generous dividends.' },
  { id: 'ipo', term: 'IPO', category: 'basics', short: 'Initial Public Offering \u2014 when a company first sells stock', detail: 'An IPO is when a private company offers its shares to the public for the first time. Saudi Aramco\'s 2019 IPO was the largest in history. IPOs can be exciting but also risky since the company has no public trading history.' },
  { id: 'market-cap', term: 'Market Cap', category: 'basics', short: 'Total value of all a company\'s shares', detail: 'Market capitalization = share price \u00D7 number of shares outstanding. It tells you how big a company is. Saudi Aramco has a market cap over $2 trillion, making it one of the world\'s most valuable companies. Companies are often classified as large-cap (>$10B), mid-cap ($2-10B), or small-cap (<$2B).' },
  { id: 'portfolio', term: 'Portfolio', category: 'basics', short: 'Your collection of investments', detail: 'A portfolio is all the investments you own — stocks, bonds, cash, commodities, etc. A well-diversified portfolio spreads risk across different asset types, sectors, and countries. The Ashom portfolio tracker helps you manage and analyze your holdings.' },

  // Ratios
  { id: 'pe-ratio', term: 'P/E Ratio', category: 'ratios', short: 'Price-to-Earnings \u2014 how expensive a stock is relative to profits', detail: 'P/E = Stock Price \u00F7 Earnings Per Share. A P/E of 15 means investors pay $15 for every $1 of earnings. Low P/E might mean the stock is undervalued (or the company has problems). High P/E might mean growth is expected. Compare within the same sector — bank P/Es are typically lower than tech P/Es.' },
  { id: 'pb-ratio', term: 'P/B Ratio', category: 'ratios', short: 'Price-to-Book \u2014 stock price vs. company\'s net assets', detail: 'P/B = Stock Price \u00F7 Book Value Per Share. A P/B below 1 means the stock trades below the value of its assets on paper. Banks in GCC markets typically trade at 1.5-3x book value. Very useful for valuing financial companies.' },
  { id: 'roe', term: 'ROE', category: 'ratios', short: 'Return on Equity \u2014 how efficiently a company uses shareholder money', detail: 'ROE = Net Income \u00F7 Shareholders\' Equity. An ROE of 15% means the company generates 15 cents of profit for every dollar of equity. Higher is better, but very high ROE can indicate high leverage (debt). Top GCC banks typically have ROE of 12-18%.' },
  { id: 'de-ratio', term: 'D/E Ratio', category: 'ratios', short: 'Debt-to-Equity \u2014 how much debt vs. shareholder money', detail: 'D/E = Total Debt \u00F7 Total Equity. A D/E of 0.5 means the company has 50 cents of debt for every dollar of equity. Lower is generally safer. Utilities often have higher D/E because they borrow to build infrastructure. Banks have naturally high D/E due to their business model.' },
  { id: 'div-yield', term: 'Dividend Yield', category: 'ratios', short: 'Annual dividend as a percentage of stock price', detail: 'Dividend Yield = Annual Dividend \u00F7 Stock Price. A 5% yield means you earn $5 per year for every $100 invested. High yields can be attractive for income investors but may signal the stock price has fallen. Some GCC companies offer yields of 6-8%.' },

  // Risk
  { id: 'volatility', term: 'Volatility', category: 'risk', short: 'How much a price swings up and down', detail: 'Volatility measures the degree of price variation over time. High volatility = bigger price swings = more risk (but also more opportunity). Measured as standard deviation of returns. Crypto is typically more volatile than stocks, which are more volatile than bonds.' },
  { id: 'beta', term: 'Beta', category: 'risk', short: 'How much a stock moves relative to the overall market', detail: 'Beta of 1.0 means the stock moves with the market. Beta > 1 means more volatile than the market (e.g., beta 1.5 = 50% more volatile). Beta < 1 means less volatile. Utility stocks often have low beta. Growth stocks tend to have high beta.' },
  { id: 'sharpe', term: 'Sharpe Ratio', category: 'risk', short: 'Return earned per unit of risk taken', detail: 'Sharpe = (Portfolio Return - Risk-Free Rate) \u00F7 Portfolio Volatility. Higher is better. A Sharpe above 1.0 is considered good, above 2.0 is very good. It helps you compare investments that have different risk levels. Used extensively by fund managers and in the CFA curriculum.' },
  { id: 'diversification', term: 'Diversification', category: 'risk', short: 'Spreading investments to reduce risk', detail: 'Don\'t put all your eggs in one basket. By investing across different stocks, sectors, countries, and asset types, you reduce the impact of any single investment going wrong. GCC investors can diversify across 6 countries and multiple sectors.' },
  { id: 'var', term: 'Value at Risk (VaR)', category: 'risk', short: 'Maximum expected loss over a given time period', detail: 'VaR answers: "What\'s the most I could lose in a bad day/week?" A daily VaR of $5,000 at 95% confidence means there\'s a 95% chance you won\'t lose more than $5,000 in a day. Used by banks and regulators to manage risk.' },

  // Markets
  { id: 'bull-market', term: 'Bull Market', category: 'markets', short: 'When prices are rising and investors are optimistic', detail: 'A bull market is a sustained period of rising stock prices, typically defined as a 20%+ gain from a recent low. Investors feel confident and willing to buy. The opposite is a bear market (20%+ decline).' },
  { id: 'bear-market', term: 'Bear Market', category: 'markets', short: 'When prices are falling and investors are pessimistic', detail: 'A bear market is a sustained 20%+ decline in stock prices. Investors sell out of fear. Bear markets are painful but historically temporary — markets have always recovered eventually. They can also present buying opportunities for long-term investors.' },
  { id: 'index', term: 'Market Index', category: 'markets', short: 'A number that tracks the overall market performance', detail: 'An index like TASI (Saudi) or DFM General Index (UAE) tracks a basket of stocks to represent the broader market. When people say "the market is up 2%," they mean the index rose 2%. Indices help investors compare their portfolio performance against the market.' },
  { id: 'liquidity', term: 'Liquidity', category: 'markets', short: 'How easily you can buy or sell without affecting the price', detail: 'A liquid stock has high trading volume — you can buy or sell quickly at fair prices. Illiquid stocks may have wide bid-ask spreads and large price impact when you trade. Large-cap GCC stocks like Aramco and Al Rajhi are highly liquid.' },

  // GCC
  { id: 'tadawul', term: 'Tadawul', category: 'gcc', short: 'The Saudi Stock Exchange \u2014 largest in the Middle East', detail: 'Tadawul (officially Saudi Exchange) is the main stock exchange in Saudi Arabia and the largest in the MENA region by market cap. It\'s regulated by the Capital Market Authority (CMA). The main index is TASI (Tadawul All Share Index). Home to Saudi Aramco, the world\'s most valuable listed company.' },
  { id: 'sukuk', term: 'Sukuk', category: 'gcc', short: 'Islamic bonds \u2014 Sharia-compliant fixed income', detail: 'Sukuk are financial certificates that comply with Islamic law. Unlike conventional bonds, sukuk represent ownership in a tangible asset rather than a debt obligation. They don\'t pay interest (riba) but instead share profits from the underlying asset. The GCC is the world\'s largest sukuk market.' },
  { id: 'vision2030', term: 'Vision 2030', category: 'gcc', short: 'Saudi Arabia\'s plan to diversify its economy beyond oil', detail: 'Vision 2030 is Saudi Arabia\'s strategic framework to reduce dependence on oil revenues, develop public sectors like health and education, and grow tourism, entertainment, and technology. It\'s driving massive investment and IPOs. For investors, it signals which sectors will receive government support and growth.' },
  { id: 'zakat', term: 'Zakat', category: 'gcc', short: 'Islamic obligation to give 2.5% of wealth to those in need', detail: 'Zakat is one of the Five Pillars of Islam — a mandatory charitable contribution of 2.5% of qualifying wealth held for one year. For investors, this applies to cash, stocks, and other liquid assets above a minimum threshold (nisab). Ashom includes a Zakat calculator in the portfolio analytics.' },
  { id: 'cma', term: 'CMA', category: 'gcc', short: 'Capital Market Authority \u2014 regulates Saudi securities', detail: 'The CMA is Saudi Arabia\'s securities regulator, similar to the SEC in the US. It oversees the Tadawul exchange, protects investors, and ensures market fairness. Each GCC country has its own regulator: SCA (UAE), CMA (Kuwait), QFMA (Qatar), CBB (Bahrain), CMA (Oman).' },
];

const cardStyle = { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)' };

export default function GlossaryPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [expanded, setExpanded] = useState(null);

  const filtered = useMemo(() => {
    return TERMS.filter(t => {
      if (category !== 'all' && t.category !== category) return false;
      if (search && !t.term.toLowerCase().includes(search.toLowerCase()) && !t.short.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [search, category]);

  const chipStyle = (active) => ({
    padding: '6px 14px', borderRadius: 20, fontSize: 11, fontWeight: 600,
    border: '1px solid ' + (active ? 'var(--navy)' : 'var(--border)'),
    background: active ? 'var(--navy)' : 'var(--card)',
    color: active ? '#fff' : 'var(--text-2)',
    cursor: 'pointer', whiteSpace: 'nowrap',
    display: 'flex', alignItems: 'center', gap: 4,
    fontFamily: 'var(--font-body)',
  });

  return (
    <div>
      <PageHeader title="Financial Glossary" subtitle="Learn key concepts" backTo="/learning" />

      <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search terms..."
            style={{
              width: '100%', fontSize: 13, border: '1px solid var(--border)', borderRadius: 'var(--r-md)',
              paddingLeft: 36, paddingRight: 12, paddingTop: 10, paddingBottom: 10,
              outline: 'none', background: 'var(--card)', color: 'var(--text-1)',
              fontFamily: 'var(--font-body)',
            }}
          />
        </div>

        {/* Category chips */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }} className="scrollbar-hide">
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setCategory(c.id)} style={chipStyle(category === c.id)}>
              <c.icon size={10} />
              {c.label}
            </button>
          ))}
        </div>

        {/* Results count */}
        <p style={{ fontSize: 11, color: 'var(--text-3)' }}>{filtered.length} terms</p>

        {/* Term cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {filtered.map(t => {
            const isOpen = expanded === t.id;
            const badge = CATEGORY_BADGE[t.category] || CATEGORY_BADGE.basics;
            return (
              <button
                key={t.id}
                onClick={() => setExpanded(isOpen ? null : t.id)}
                style={{
                  ...cardStyle, width: '100%', textAlign: 'left', padding: 14, cursor: 'pointer',
                  boxShadow: isOpen ? '0 0 0 1px var(--blue)' : 'none',
                  transition: 'box-shadow 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 'var(--r-sm)',
                    background: 'var(--blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, marginTop: 2,
                  }}>
                    <BookOpen size={14} style={{ color: 'var(--blue)' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', fontFamily: 'var(--font-head)' }}>{t.term}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 2, lineHeight: 1.5 }}>{t.short}</p>
                    {isOpen && (
                      <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                        <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6 }}>{t.detail}</p>
                      </div>
                    )}
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 500, padding: '3px 8px', borderRadius: 6,
                    background: badge.bg, color: badge.color, flexShrink: 0,
                  }}>
                    {t.category}
                  </span>
                </div>
              </button>
            );
          })}

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <BookOpen size={24} style={{ color: 'var(--text-3)', margin: '0 auto 8px', display: 'block' }} />
              <p style={{ fontSize: 12, color: 'var(--text-3)' }}>No matching terms found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
