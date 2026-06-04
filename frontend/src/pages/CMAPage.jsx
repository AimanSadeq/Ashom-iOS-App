import { Landmark, ExternalLink, ChevronRight } from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';

const COUNTRY_FLAGS = {
  SA: '\u{1F1F8}\u{1F1E6}',
  AE: '\u{1F1E6}\u{1F1EA}',
  KW: '\u{1F1F0}\u{1F1FC}',
  QA: '\u{1F1F6}\u{1F1E6}',
  BH: '\u{1F1E7}\u{1F1ED}',
  OM: '\u{1F1F4}\u{1F1F2}',
};

const GCC_AUTHORITIES = [
  { code: 'SA', abbr: 'CMA',  name: 'Capital Market Authority',              country: 'Saudi Arabia', website: 'https://cma.org.sa',   description: 'Regulates and develops the Saudi Arabian capital market, overseeing the Tadawul stock exchange.' },
  { code: 'AE', abbr: 'SCA',  name: 'Securities & Commodities Authority',    country: 'UAE',          website: 'https://www.sca.gov.ae', description: 'Regulates securities and commodities markets in the UAE, including DFM and ADX exchanges.' },
  { code: 'KW', abbr: 'CMA',  name: 'Capital Markets Authority',             country: 'Kuwait',       website: 'https://www.cma.gov.kw', description: 'Oversees the Boursa Kuwait stock exchange and regulates securities activities in Kuwait.' },
  { code: 'QA', abbr: 'QFMA', name: 'Qatar Financial Markets Authority',     country: 'Qatar',        website: 'https://www.qfma.org.qa', description: 'Regulates and supervises the Qatar Stock Exchange and financial markets in Qatar.' },
  { code: 'BH', abbr: 'CBB',  name: 'Central Bank of Bahrain',               country: 'Bahrain',      website: 'https://www.cbb.gov.bh', description: 'Regulates the Bahrain Bourse and all financial institutions in the Kingdom of Bahrain.' },
  { code: 'OM', abbr: 'CMA',  name: 'Capital Market Authority',              country: 'Oman',         website: 'https://www.cma.gov.om', description: 'Regulates the Muscat Securities Market and capital market activities in Oman.' },
];

export default function CMAPage() {
  return (
    <div className="animate-fade-in">
      <PageHeader title="Capital Market Authorities" subtitle="GCC Regulatory Bodies" backTo="/" />

      {/* Info card */}
      <div className="px-5 pt-5 pb-3">
        <div className="rounded-md p-4 flex items-start gap-3" style={{ background: 'var(--blue-light)', border: '1px solid var(--blue-mid)' }}>
          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(83,145,213,0.15)' }}>
            <Landmark size={16} style={{ color: 'var(--blue)' }} />
          </div>
          <div>
            <p className="font-head text-[12px] font-bold" style={{ color: 'var(--navy)' }}>6 GCC Regulators</p>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-2)' }}>
              Each GCC country has a dedicated authority overseeing its capital markets, exchanges, and securities activities.
            </p>
          </div>
        </div>
      </div>

      {/* Authority cards */}
      <div className="px-4 space-y-2.5 pb-6">
        {GCC_AUTHORITIES.map((auth) => (
          <div
            key={auth.code + auth.abbr}
            className="rounded-md p-4"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-3.5">
              <span className="text-2xl flex-shrink-0">{COUNTRY_FLAGS[auth.code]}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-head text-sm font-bold" style={{ color: 'var(--navy)' }}>{auth.abbr}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: 'var(--blue-light)', color: 'var(--blue)' }}>{auth.code}</span>
                </div>
                <p className="text-[11px] font-medium" style={{ color: 'var(--text-2)' }}>{auth.name}</p>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-3)' }}>{auth.country}</p>
              </div>
              <a href={auth.website} target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
                aria-label={`Visit ${auth.abbr} website`}>
                <ChevronRight size={14} style={{ color: 'var(--text-3)' }} />
              </a>
            </div>
            <p className="text-[11px] mt-2.5 leading-relaxed" style={{ color: 'var(--text-3)' }}>{auth.description}</p>
            <a href={auth.website} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-semibold mt-2 hover:opacity-80 transition-opacity"
              style={{ color: 'var(--blue)' }}>
              <ExternalLink size={10} /> Visit Website
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
