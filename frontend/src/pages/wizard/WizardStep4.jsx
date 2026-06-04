import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronRight, CheckSquare, Square } from 'lucide-react';

import PageHeader from '../../components/shared/PageHeader';
import LoadingState from '../../components/shared/LoadingState';
import { analytics } from '../../services/api';
import useApi from '../../hooks/useApi';

const FALLBACK_METRIC_CATEGORIES = [
  {
    name: 'Profitability',
    metrics: [
      { id: 'roe', name: 'Return on Equity (ROE)' },
      { id: 'roa', name: 'Return on Assets (ROA)' },
      { id: 'roic', name: 'Return on Invested Capital' },
      { id: 'net_margin', name: 'Net Profit Margin' },
      { id: 'gross_margin', name: 'Gross Profit Margin' },
      { id: 'operating_margin', name: 'Operating Margin' },
    ],
  },
  {
    name: 'Liquidity',
    metrics: [
      { id: 'current_ratio', name: 'Current Ratio' },
      { id: 'quick_ratio', name: 'Quick Ratio' },
      { id: 'cash_ratio', name: 'Cash Ratio' },
      { id: 'working_capital', name: 'Working Capital' },
    ],
  },
  {
    name: 'Leverage',
    metrics: [
      { id: 'debt_equity', name: 'Debt to Equity' },
      { id: 'debt_assets', name: 'Debt to Assets' },
      { id: 'interest_coverage', name: 'Interest Coverage' },
      { id: 'equity_multiplier', name: 'Equity Multiplier' },
    ],
  },
  {
    name: 'Valuation',
    metrics: [
      { id: 'pe_ratio', name: 'P/E Ratio' },
      { id: 'pb_ratio', name: 'P/B Ratio' },
      { id: 'ps_ratio', name: 'P/S Ratio' },
      { id: 'ev_ebitda', name: 'EV/EBITDA' },
      { id: 'dividend_yield', name: 'Dividend Yield' },
    ],
  },
  {
    name: 'Efficiency',
    metrics: [
      { id: 'asset_turnover', name: 'Asset Turnover' },
      { id: 'inventory_turnover', name: 'Inventory Turnover' },
      { id: 'receivable_turnover', name: 'Receivable Turnover' },
    ],
  },
  {
    name: 'Growth',
    metrics: [
      { id: 'revenue_growth', name: 'Revenue Growth' },
      { id: 'earnings_growth', name: 'Earnings Growth' },
      { id: 'asset_growth', name: 'Asset Growth' },
    ],
  },
];

const CATEGORY_STYLE_MAP = {
  Profitability: { bg: '#E6FAF5', fg: '#00C896' },
  Liquidity:     { bg: '#EAF2FC', fg: '#5391D5' },
  Leverage:      { bg: '#FFF0F3', fg: '#FF4B6E' },
  Valuation:     { bg: '#F0EEFE', fg: '#7C5FDB' },
  Efficiency:    { bg: '#FFF8E6', fg: '#F2A600' },
  Growth:        { bg: '#E3F6F5', fg: '#00A8A0' },
};

function mapApiMetrics(apiData) {
  if (!apiData || !Array.isArray(apiData) || apiData.length === 0) return null;
  return apiData.map((cat) => ({
    name: cat.name,
    metrics: (cat.metrics || []).map((m) => ({
      id: m.id,
      name: m.name,
    })),
  }));
}

function getWizardData() {
  try { return JSON.parse(localStorage.getItem('ashom-wizard')) || {}; }
  catch { return {}; }
}

function setWizardData(data) {
  localStorage.setItem('ashom-wizard', JSON.stringify(data));
}

export default function WizardStep4() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || getWizardData().type || '';
  const { data: apiMetrics, loading: metricsLoading } = useApi(analytics.metrics);
  const METRIC_CATEGORIES = mapApiMetrics(apiMetrics) || FALLBACK_METRIC_CATEGORIES;

  const [selectedMetrics, setSelectedMetrics] = useState(() => {
    const saved = getWizardData().metrics;
    return saved ? new Set(saved) : new Set();
  });

  function toggleMetric(id) {
    setSelectedMetrics((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleCategory(category) {
    const categoryIds = category.metrics.map((m) => m.id);
    const allSelected = categoryIds.every((id) => selectedMetrics.has(id));

    setSelectedMetrics((prev) => {
      const next = new Set(prev);
      categoryIds.forEach((id) => {
        if (allSelected) next.delete(id);
        else next.add(id);
      });
      return next;
    });
  }

  function handleNext() {
    if (selectedMetrics.size === 0) return;
    setWizardData({ ...getWizardData(), metrics: Array.from(selectedMetrics) });
    navigate(`/wizard/review?type=${type}`);
  }

  return (
    <div className="animate-fade-in" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <PageHeader title="Step 4 of 5" subtitle="Select Metrics" backTo={`/wizard/second-entity?type=${type}`} />

      <div className="px-4 py-5 space-y-4">
        {/* Progress bar */}
        <div className="flex gap-1">
          <div className="h-1 flex-1 rounded-full" style={{ background: 'var(--navy)' }} />
          <div className="h-1 flex-1 rounded-full" style={{ background: 'var(--navy)' }} />
          <div className="h-1 flex-1 rounded-full" style={{ background: 'var(--navy)' }} />
          <div className="h-1 flex-1 rounded-full" style={{ background: 'var(--navy)' }} />
          <div className="h-1 flex-1 rounded-full" style={{ background: 'var(--border)' }} />
        </div>

        <p className="text-[12px]" style={{ color: 'var(--text-2)' }}>
          Selected: <span className="font-bold" style={{ color: 'var(--navy)' }}>{selectedMetrics.size}</span> metrics
        </p>

        {metricsLoading ? <LoadingState message="Loading metrics..." /> : (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {METRIC_CATEGORIES.map((category) => {
              const catIds = category.metrics.map((m) => m.id);
              const allSelected = catIds.every((id) => selectedMetrics.has(id));
              const someSelected = catIds.some((id) => selectedMetrics.has(id));
              const catStyle = CATEGORY_STYLE_MAP[category.name] || { bg: 'var(--bg)', fg: 'var(--text-2)' };

              return (
                <div key={category.name} className="bg-white rounded-md p-3" style={{ border: '1px solid var(--border)' }}>
                  {/* Category header */}
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center justify-between mb-2.5"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                        style={{ background: catStyle.bg, color: catStyle.fg }}
                      >
                        {category.name}
                      </span>
                      <span className="text-[11px]" style={{ color: 'var(--text-3)' }}>
                        {catIds.filter((id) => selectedMetrics.has(id)).length}/{catIds.length}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold" style={{ color: 'var(--blue)' }}>
                      {allSelected ? 'Deselect All' : 'Select All'}
                    </span>
                  </button>

                  {/* Metric checkboxes */}
                  <div className="grid grid-cols-2 gap-1.5">
                    {category.metrics.map((metric) => {
                      const isChecked = selectedMetrics.has(metric.id);
                      return (
                        <button
                          key={metric.id}
                          onClick={() => toggleMetric(metric.id)}
                          className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-all"
                          style={{
                            background: isChecked ? 'var(--blue-light)' : 'var(--bg)',
                            border: isChecked ? '1px solid var(--blue-mid)' : '1px solid transparent',
                          }}
                        >
                          {isChecked
                            ? <CheckSquare size={14} className="flex-shrink-0" style={{ color: 'var(--navy)' }} />
                            : <Square size={14} className="flex-shrink-0" style={{ color: 'var(--text-3)' }} />
                          }
                          <span className="text-[11px] font-medium leading-tight" style={{ color: 'var(--navy)' }}>{metric.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex gap-2.5">
          <button
            onClick={() => navigate(`/wizard/second-entity?type=${type}`)}
            className="flex-1 py-3 text-[13px] font-semibold flex items-center justify-center gap-1 transition-colors font-body"
            style={{ borderRadius: 'var(--r-md)', background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text-2)' }}
          >
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={selectedMetrics.size === 0}
            className="flex-[2] py-3 text-[13px] font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-body"
            style={{ borderRadius: 'var(--r-md)', background: 'var(--navy)' }}
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
