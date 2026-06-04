import { useParams } from 'react-router-dom';
import { Download, FileX } from 'lucide-react';

import PageHeader from '../components/shared/PageHeader';
import LoadingState from '../components/shared/LoadingState';
import ErrorState from '../components/shared/ErrorState';
import useApi from '../hooks/useApi';
import { reports } from '../services/api';

export default function PDFViewerPage() {
  const { id } = useParams();
  const { data, loading, error, refetch } = useApi(() => reports.get(id), [id]);

  const report = data?.report || data?.data || data || {};
  const pdfUrl = report.pdfUrl || report.url || report.fileUrl || null;
  const title = report.title || report.companyName || `Report #${id}`;

  if (loading) return (
    <div className="animate-fade-in" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <PageHeader title="Report" backTo="/filings" />
      <LoadingState message="Loading report..." />
    </div>
  );

  if (error) return (
    <div className="animate-fade-in" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <PageHeader title="Report" backTo="/filings" />
      <ErrorState message={error} onRetry={refetch} />
    </div>
  );

  return (
    <div className="animate-fade-in flex flex-col h-full" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <PageHeader
        title={title}
        subtitle={report.year ? `${report.companyName || ''} - ${report.year}` : undefined}
        backTo="/filings"
      />

      {pdfUrl ? (
        <>
          {/* Toolbar */}
          <div
            className="px-4 py-2.5 flex items-center justify-between"
            style={{ borderBottom: '1px solid var(--border)', background: 'var(--card)' }}
          >
            <div className="flex items-center gap-2">
              {report.year && (
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-semibold font-body"
                  style={{ background: 'var(--blue-light)', color: 'var(--navy)' }}
                >
                  {report.year}
                </span>
              )}
              {report.country && (
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-semibold font-body"
                  style={{ background: 'var(--blue-light)', color: 'var(--navy)' }}
                >
                  {report.country.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold font-body rounded-md transition-opacity hover:opacity-90"
              style={{ background: 'var(--blue)', color: '#fff' }}
            >
              <Download size={12} />
              Download
            </a>
          </div>

          {/* PDF iframe */}
          <div className="flex-1 min-h-0" style={{ background: 'var(--bg)' }}>
            <iframe
              src={pdfUrl}
              title={title}
              className="w-full h-full border-0"
              style={{ minHeight: 'calc(100vh - 160px)' }}
            />
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div
            className="w-14 h-14 rounded-lg flex items-center justify-center mb-4"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
          >
            <FileX size={24} style={{ color: 'var(--text-3)' }} />
          </div>
          <p className="text-sm font-bold font-head mb-1" style={{ color: 'var(--navy)' }}>PDF not available</p>
          <p className="text-xs font-body text-center max-w-xs" style={{ color: 'var(--text-3)' }}>
            The PDF document for this report is not currently available. Please check back later or contact support.
          </p>
        </div>
      )}
    </div>
  );
}
