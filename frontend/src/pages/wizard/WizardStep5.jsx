import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, GitCompareArrows, Hash, ArrowRight } from 'lucide-react';

import PageHeader from '../../components/shared/PageHeader';
import LoadingState from '../../components/shared/LoadingState';
import ErrorState from '../../components/shared/ErrorState';
import { comparisons } from '../../services/api';

function getWizardData() {
  try { return JSON.parse(localStorage.getItem('ashom-wizard')) || {}; }
  catch { return {}; }
}

function formatType(type) {
  if (!type) return '';
  return type.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export default function WizardStep5() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || getWizardData().type || '';

  const wizard = getWizardData();
  const { firstEntity, secondEntity, metrics } = wizard;

  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    try {
      const result = await comparisons.generate({
        comparisonType: wizard.type,
        firstEntity,
        secondEntity,
        selectedMetrics: metrics,
      });
      // Store results for the results page
      localStorage.setItem('ashom-comparison-results', JSON.stringify(result));
      navigate('/comparison-results');
    } catch (err) {
      setError(err.message);
      setGenerating(false);
    }
  }

  return (
    <div className="animate-fade-in" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <PageHeader title="Step 5 of 5" subtitle="Review & Generate" backTo={`/wizard/metrics?type=${type}`} />

      <div className="px-4 py-5 space-y-4">
        {/* Progress bar */}
        <div className="flex gap-1">
          <div className="h-1 flex-1 rounded-full" style={{ background: 'var(--navy)' }} />
          <div className="h-1 flex-1 rounded-full" style={{ background: 'var(--navy)' }} />
          <div className="h-1 flex-1 rounded-full" style={{ background: 'var(--navy)' }} />
          <div className="h-1 flex-1 rounded-full" style={{ background: 'var(--navy)' }} />
          <div className="h-1 flex-1 rounded-full" style={{ background: 'var(--navy)' }} />
        </div>

        {/* Summary card */}
        <div className="bg-white rounded-md p-4 space-y-4" style={{ border: '1px solid var(--border)' }}>
          <p
            className="font-head text-[11px] font-bold uppercase tracking-[1.2px]"
            style={{ color: 'var(--text-3)' }}
          >
            Comparison Summary
          </p>

          {/* Type */}
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: '#F0EEFE' }}
            >
              <GitCompareArrows size={16} style={{ color: '#7C5FDB' }} />
            </div>
            <div>
              <p className="text-[11px]" style={{ color: 'var(--text-3)' }}>Type</p>
              <p className="font-head text-[13px] font-bold" style={{ color: 'var(--navy)' }}>{formatType(wizard.type)}</p>
            </div>
          </div>

          {/* Entities */}
          <div className="flex items-center gap-2">
            <div
              className="flex-1 p-3 rounded-lg"
              style={{ background: 'var(--blue-light)', border: '1px solid var(--blue-mid)' }}
            >
              <p className="text-[10px] mb-0.5" style={{ color: 'var(--blue)' }}>First</p>
              <p className="font-head text-[12px] font-bold truncate" style={{ color: 'var(--navy)' }}>{firstEntity?.name || 'Not selected'}</p>
            </div>
            <ArrowRight size={14} style={{ color: 'var(--text-3)' }} className="flex-shrink-0" />
            <div
              className="flex-1 p-3 rounded-lg"
              style={{ background: 'var(--green-bg)', border: '1px solid var(--green)' }}
            >
              <p className="text-[10px] mb-0.5" style={{ color: 'var(--green)' }}>Second</p>
              <p className="font-head text-[12px] font-bold truncate" style={{ color: 'var(--navy)' }}>{secondEntity?.name || 'Not selected'}</p>
            </div>
          </div>

          {/* Metrics count */}
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: '#FFF8E6' }}
            >
              <Hash size={16} style={{ color: '#F2A600' }} />
            </div>
            <div>
              <p className="text-[11px]" style={{ color: 'var(--text-3)' }}>Metrics Selected</p>
              <p className="font-head text-[13px] font-bold" style={{ color: 'var(--navy)' }}>{metrics?.length || 0} metrics</p>
            </div>
          </div>

          {/* Metric tags */}
          {metrics && metrics.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {metrics.map((m) => (
                <span
                  key={m}
                  className="text-[10px] font-medium px-2 py-1 rounded-full"
                  style={{ background: 'var(--bg)', color: 'var(--text-2)', border: '1px solid var(--border)' }}
                >
                  {m.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Error state */}
        {error && <ErrorState message={error} onRetry={handleGenerate} />}

        {/* Generate button */}
        {generating ? (
          <LoadingState message="Generating comparison..." />
        ) : (
          <div className="flex gap-2.5">
            <button
              onClick={() => navigate(`/wizard/metrics?type=${type}`)}
              className="flex-1 py-3 text-[13px] font-semibold flex items-center justify-center gap-1 transition-colors font-body"
              style={{ borderRadius: 'var(--r-md)', background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text-2)' }}
            >
              Back
            </button>
            <button
              onClick={handleGenerate}
              disabled={!firstEntity || !secondEntity || !metrics?.length}
              className="flex-[2] py-3 text-[13px] font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-body"
              style={{ borderRadius: 'var(--r-md)', background: 'var(--navy)' }}
            >
              <Sparkles size={16} />
              Generate Comparison
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
