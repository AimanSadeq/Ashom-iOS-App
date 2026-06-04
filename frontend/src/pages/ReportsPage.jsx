import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Eye, Calendar } from 'lucide-react';

import PageHeader from '../components/shared/PageHeader';
import LoadingState from '../components/shared/LoadingState';
import ErrorState from '../components/shared/ErrorState';
import useApi from '../hooks/useApi';
import { reports } from '../services/api';

const COUNTRIES = [
  { id: 'all', label: 'All' },
  { id: 'saudi', label: 'Saudi Arabia' },
  { id: 'uae', label: 'UAE' },
  { id: 'kuwait', label: 'Kuwait' },
  { id: 'qatar', label: 'Qatar' },
  { id: 'bahrain', label: 'Bahrain' },
  { id: 'oman', label: 'Oman' },
];

export default function ReportsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('all');

  const fetchReports = useCallback(
    () => {
      const params = {};
      if (country !== 'all') params.country = country;
      if (search.trim()) params.search = search.trim();
      return reports.list(params);
    },
    [country, search]
  );

  const { data, loading, error, refetch } = useApi(fetchReports, [country, search]);

  const reportList = Array.isArray(data) ? data : data?.reports || data?.data || [];

  return (
    <div className="animate-fade-in" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <PageHeader title="Annual Reports" subtitle="GCC company filings" backTo="/" />

      {/* Search */}
      <div className="px-4 pt-4 pb-2">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-3)' }} />
          <input
            type="text"
            placeholder="Search reports..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs font-body rounded-md transition-colors outline-none"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              color: 'var(--text-1)',
            }}
            onFocus={e => { e.target.style.borderColor = 'var(--blue)'; e.target.style.boxShadow = '0 0 0 3px var(--blue-light)'; }}
            onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
          />
        </div>
      </div>

      {/* Country filter chips */}
      <div className="px-4 pb-3 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {COUNTRIES.map(c => (
            <button
              key={c.id}
              onClick={() => setCountry(c.id)}
              className="px-3 py-1.5 rounded-md text-[10px] font-semibold font-body whitespace-nowrap transition-colors"
              style={{
                background: country === c.id ? 'var(--navy)' : 'var(--card)',
                color: country === c.id ? '#fff' : 'var(--text-2)',
                border: `1px solid ${country === c.id ? 'var(--navy)' : 'var(--border)'}`,
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div className="px-4 pb-2">
        <p className="text-[10px] font-body" style={{ color: 'var(--text-3)' }}>{reportList.length} reports</p>
      </div>

      {/* Report cards */}
      <div className="px-4 pb-4">
        {loading && <LoadingState message="Loading reports..." />}
        {error && <ErrorState message={error} onRetry={refetch} />}

        {!loading && !error && reportList.length === 0 && (
          <div className="text-center py-12">
            <FileText size={24} className="mx-auto mb-2" style={{ color: 'var(--text-3)' }} />
            <p className="text-xs font-body" style={{ color: 'var(--text-3)' }}>No reports found</p>
          </div>
        )}

        {!loading && !error && reportList.length > 0 && (
          <div className="space-y-2">
            {reportList.map((r, i) => (
              <div
                key={r.id || i}
                className="p-3 rounded-md"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-md flex items-center justify-center shrink-0"
                    style={{ background: 'var(--blue-light)' }}
                  >
                    <FileText size={18} style={{ color: 'var(--blue)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold font-body truncate" style={{ color: 'var(--navy)' }}>
                      {r.companyName || r.company || r.title || 'Annual Report'}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {r.year && (
                        <span className="flex items-center gap-1 text-[10px] font-body" style={{ color: 'var(--text-3)' }}>
                          <Calendar size={10} />
                          {r.year}
                        </span>
                      )}
                      {(r.sector || r.industry) && (
                        <span className="text-[10px] font-body" style={{ color: 'var(--text-3)' }}>{r.sector || r.industry}</span>
                      )}
                      {r.country && (
                        <span
                          className="px-1.5 py-0.5 rounded text-[10px] font-semibold font-body"
                          style={{ background: 'var(--blue-light)', color: 'var(--navy)' }}
                        >
                          {r.country.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/reports/${r.id}`)}
                    className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-semibold font-body rounded-md transition-colors shrink-0"
                    style={{ background: 'var(--blue)', color: '#fff' }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                  >
                    <Eye size={12} />
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
