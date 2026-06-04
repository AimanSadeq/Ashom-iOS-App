import { useState } from 'react';
import {
  FileSpreadsheet, Building2, Globe, Gem, Bitcoin,
  BarChart2, FileText, Download, CheckCircle, Loader2, AlertCircle,
} from 'lucide-react';

import PageHeader from '../components/shared/PageHeader';
import { companies, reports, markets, comparisons } from '../services/api';

const EXPORTS = [
  {
    id: 'analytics',
    icon: BarChart2,
    iconBg: '#F3EEFF', iconColor: '#7C3AED',
    title: 'Companies Analytics',
    description: 'Full financial data with ratios, margins, and growth metrics for all GCC companies.',
  },
  {
    id: 'companies',
    icon: Building2,
    iconBg: 'var(--blue-light)', iconColor: 'var(--blue)',
    title: 'All Companies',
    description: 'Names, tickers, sectors, countries, and basic information for 820+ companies.',
  },
  {
    id: 'by-country',
    icon: Globe,
    iconBg: 'var(--green-bg)', iconColor: 'var(--green)',
    title: 'Companies by Country',
    description: 'Separate sheets for each GCC country with detailed company data.',
  },
  {
    id: 'metals',
    icon: Gem,
    iconBg: '#FFF7ED', iconColor: '#D97706',
    title: 'Precious Metals & Oil',
    description: 'Historical and current prices for gold, silver, platinum, WTI, and Brent.',
  },
  {
    id: 'crypto',
    icon: Bitcoin,
    iconBg: 'var(--red-bg)', iconColor: 'var(--red)',
    title: 'Cryptocurrencies',
    description: 'Top cryptocurrency prices, market caps, volumes, and 24h changes.',
  },
  {
    id: 'comparisons',
    icon: BarChart2,
    iconBg: 'var(--green-bg)', iconColor: 'var(--green)',
    title: 'Comparisons',
    description: 'Your saved comparison analyses with all metrics and results.',
  },
  {
    id: 'reports',
    icon: FileText,
    iconBg: 'var(--blue-light)', iconColor: 'var(--blue)',
    title: 'Reports',
    description: 'Annual report metadata including company, year, and filing details.',
  },
];

const GCC_COUNTRIES = ['saudi', 'uae', 'kuwait', 'qatar', 'bahrain', 'oman'];
const CRYPTO_IDS = 'bitcoin,ethereum,binancecoin,solana,ripple,cardano,dogecoin,polkadot,avalanche-2,chainlink';

function downloadCSV(data, filename) {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row =>
      headers.map(h => {
        const val = row[h] == null ? '' : String(row[h]);
        return val.includes(',') || val.includes('"') || val.includes('\n')
          ? `"${val.replace(/"/g, '""')}"` : val;
      }).join(',')
    ),
  ];
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const cardStyle = { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)' };

export default function ExcelDownloadPage() {
  const [downloading, setDownloading] = useState(null);
  const [completed, setCompleted] = useState([]);
  const [error, setError] = useState(null);

  const handleDownload = async (id) => {
    setDownloading(id);
    setError(null);
    try {
      switch (id) {
        case 'analytics':
        case 'companies': {
          const res = await companies.list();
          const rows = (res.companies || res.data || res || []);
          downloadCSV(rows, id === 'analytics' ? 'gcc_companies_analytics.csv' : 'gcc_all_companies.csv');
          break;
        }
        case 'by-country': {
          for (const country of GCC_COUNTRIES) {
            const res = await companies.list({ country });
            const rows = (res.companies || res.data || res || []);
            if (rows.length > 0) downloadCSV(rows, `gcc_companies_${country}.csv`);
          }
          break;
        }
        case 'metals': {
          const res = await markets.commodities();
          const data = res.data || res;
          const rows = Object.entries(data).map(([key, val]) => ({
            commodity: key,
            price: val?.price,
            change: val?.change,
            changePercent: val?.changePercent,
            symbol: val?.symbol,
          }));
          downloadCSV(rows, 'gcc_precious_metals_oil.csv');
          break;
        }
        case 'crypto': {
          const res = await markets.crypto(CRYPTO_IDS);
          const data = res.data || res;
          const rows = Object.entries(data).map(([key, val]) => ({
            cryptocurrency: key,
            price: val?.price,
            change24h: val?.change,
            marketCap: val?.marketCap,
            volume: val?.volume,
          }));
          downloadCSV(rows, 'gcc_cryptocurrencies.csv');
          break;
        }
        case 'reports': {
          const res = await reports.list();
          const rows = (res.reports || res.data || res || []);
          downloadCSV(rows, 'gcc_annual_reports.csv');
          break;
        }
        case 'comparisons': {
          const res = await comparisons.list();
          const rows = (res.comparisons || res.data || res || []);
          downloadCSV(rows, 'gcc_comparisons.csv');
          break;
        }
        default:
          break;
      }
      setCompleted((prev) => [...prev, id]);
      setTimeout(() => setCompleted((prev) => prev.filter((x) => x !== id)), 3000);
    } catch (err) {
      setError(`Failed to download: ${err.message}`);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div>
      <PageHeader title="Excel Download" backTo="/" subtitle="Export Data to Excel" />

      <div style={{ padding: '16px 20px' }}>
        {/* Hero */}
        <div style={{
          ...cardStyle, padding: 16, marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 12,
          background: 'linear-gradient(135deg, var(--green-bg) 0%, var(--blue-light) 100%)',
          border: '1px solid var(--border)',
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 'var(--r-sm)',
            background: 'var(--green-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <FileSpreadsheet size={18} style={{ color: 'var(--green)' }} />
          </div>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)', fontFamily: 'var(--font-head)' }}>Export GCC Market Data</h3>
            <p style={{ fontSize: 11, color: 'var(--text-3)' }}>Download spreadsheets for offline analysis.</p>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div style={{
            ...cardStyle, padding: 12, marginBottom: 10,
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--red-bg)', borderColor: 'var(--red)',
          }}>
            <AlertCircle size={14} style={{ color: 'var(--red)', flexShrink: 0 }} />
            <p style={{ fontSize: 11, color: 'var(--red)', flex: 1 }}>{error}</p>
            <button onClick={() => setError(null)}
              style={{ fontSize: 11, color: 'var(--red)', fontWeight: 600, background: 'transparent', border: 'none', cursor: 'pointer' }}>
              Dismiss
            </button>
          </div>
        )}

        {/* Export cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {EXPORTS.map((item) => {
            const isDownloading = downloading === item.id;
            const isCompleted = completed.includes(item.id);

            return (
              <div key={item.id} style={{
                ...cardStyle, padding: 14,
                display: 'flex', alignItems: 'flex-start', gap: 12,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 'var(--r-sm)',
                  background: item.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, marginTop: 2,
                }}>
                  <item.icon size={16} style={{ color: item.iconColor }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: 12, fontWeight: 600, color: 'var(--navy)', fontFamily: 'var(--font-head)' }}>{item.title}</h3>
                  <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2, lineHeight: 1.5 }}>{item.description}</p>
                </div>
                <button
                  onClick={() => handleDownload(item.id)}
                  disabled={isDownloading}
                  style={{
                    flexShrink: 0, padding: '6px 14px', fontSize: 11, fontWeight: 600,
                    borderRadius: 'var(--r-sm)', display: 'flex', alignItems: 'center', gap: 4,
                    border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                    fontFamily: 'var(--font-head)',
                    background: isCompleted ? 'var(--green-bg)' : 'var(--navy)',
                    color: isCompleted ? 'var(--green)' : '#fff',
                    opacity: isDownloading ? 0.5 : 1,
                  }}
                >
                  {isDownloading ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : isCompleted ? (
                    <CheckCircle size={12} />
                  ) : (
                    <Download size={12} />
                  )}
                  {isCompleted ? 'Done' : 'Download'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ height: 24 }} />
    </div>
  );
}
