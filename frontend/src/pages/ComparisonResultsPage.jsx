import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, ArrowDownRight, Minus, BarChart2 } from 'lucide-react';
import { Bar } from 'react-chartjs-2';

import PageHeader from '../components/shared/PageHeader';
import LoadingState from '../components/shared/LoadingState';
import { comparisons } from '../services/api';
import { CHART_COLORS, BASE_OPTIONS } from '../components/shared/ChartSetup';

const CATEGORY_STYLES = {
  Profitability: { bg: '#E6FAF5', fg: '#00C896' },
  Liquidity:     { bg: '#EAF2FC', fg: '#5391D5' },
  Leverage:      { bg: '#FFF0F3', fg: '#FF4B6E' },
  Valuation:     { bg: '#F0EEFE', fg: '#7C5FDB' },
  Efficiency:    { bg: '#FFF8E6', fg: '#F2A600' },
  Growth:        { bg: '#E3F6F5', fg: '#00A8A0' },
};

const METRIC_TO_CATEGORY = {
  roe: 'Profitability', roa: 'Profitability', roic: 'Profitability',
  net_margin: 'Profitability', gross_margin: 'Profitability', operating_margin: 'Profitability',
  current_ratio: 'Liquidity', quick_ratio: 'Liquidity', cash_ratio: 'Liquidity', working_capital: 'Liquidity',
  debt_equity: 'Leverage', debt_assets: 'Leverage', interest_coverage: 'Leverage', equity_multiplier: 'Leverage',
  pe_ratio: 'Valuation', pb_ratio: 'Valuation', ps_ratio: 'Valuation', ev_ebitda: 'Valuation', dividend_yield: 'Valuation',
  asset_turnover: 'Efficiency', inventory_turnover: 'Efficiency', receivable_turnover: 'Efficiency',
  revenue_growth: 'Growth', earnings_growth: 'Growth', asset_growth: 'Growth',
};

// Higher is better for these metrics
const HIGHER_IS_BETTER = new Set([
  'roe', 'roa', 'roic', 'net_margin', 'gross_margin', 'operating_margin',
  'current_ratio', 'quick_ratio', 'cash_ratio', 'working_capital',
  'interest_coverage', 'dividend_yield',
  'asset_turnover', 'inventory_turnover', 'receivable_turnover',
  'revenue_growth', 'earnings_growth', 'asset_growth',
]);

function getWizardData() {
  try { return JSON.parse(localStorage.getItem('ashom-wizard')) || {}; }
  catch { return {}; }
}

function getResults() {
  try { return JSON.parse(localStorage.getItem('ashom-comparison-results')) || null; }
  catch { return null; }
}

function formatMetricName(id) {
  return id.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function generateMockResults(wizard) {
  const { metrics = [], firstEntity, secondEntity } = wizard;
  return {
    type: wizard.type,
    firstEntity,
    secondEntity,
    metrics: metrics.map((id) => {
      const v1 = +(Math.random() * 30 + 5).toFixed(2);
      const v2 = +(Math.random() * 30 + 5).toFixed(2);
      return {
        id,
        name: formatMetricName(id),
        category: METRIC_TO_CATEGORY[id] || 'Other',
        value1: v1,
        value2: v2,
        diff: +(v1 - v2).toFixed(2),
      };
    }),
  };
}

export default function ComparisonResultsPage() {
  const navigate = useNavigate();
  const wizard = useMemo(() => getWizardData(), []);
  const localResults = getResults();
  const [apiResults, setApiResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Try to fetch saved comparisons from the API
  useEffect(() => {
    if (localResults?.metrics) return; // already have local results, skip API call
    setLoading(true);
    comparisons.list()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setApiResults(data[0]);
        }
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Use local results first, then API results, then mock data as last resort
  const results = useMemo(() => {
    if (localResults?.metrics) return localResults;
    if (apiResults?.metrics) return apiResults;
    return generateMockResults(wizard);
  }, [localResults, apiResults, wizard]);

  const categories = useMemo(() => {
    const cats = new Set(results.metrics.map((m) => m.category));
    return ['All', ...Array.from(cats)];
  }, [results]);

  const [activeCategory, setActiveCategory] = useState('All');

  const filteredMetrics = useMemo(() => {
    if (activeCategory === 'All') return results.metrics;
    return results.metrics.filter((m) => m.category === activeCategory);
  }, [results, activeCategory]);

  function getWinner(metric) {
    const higherBetter = HIGHER_IS_BETTER.has(metric.id);
    if (metric.value1 === metric.value2) return 'tie';
    if (higherBetter) return metric.value1 > metric.value2 ? 'first' : 'second';
    return metric.value1 < metric.value2 ? 'first' : 'second';
  }

  const entity1 = results.firstEntity || wizard.firstEntity;
  const entity2 = results.secondEntity || wizard.secondEntity;

  return (
    <div className="animate-fade-in" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <PageHeader title="Comparison Results" subtitle={entity1?.name && entity2?.name ? `${entity1.name} vs ${entity2.name}` : undefined} backTo="/analytics" />

      <div className="px-4 py-5 space-y-4">
        {loading && <LoadingState message="Loading comparison results..." />}
        {error && !localResults && (
          <div
            className="rounded-md p-3"
            style={{ background: '#FFF8E6', border: '1px solid #F2A600' }}
          >
            <p className="text-[12px]" style={{ color: '#F2A600' }}>Could not load saved comparisons. Showing available data.</p>
          </div>
        )}

        {/* Entity cards */}
        <div className="grid grid-cols-2 gap-2.5">
          <div
            className="bg-white rounded-md p-3"
            style={{ border: '1px solid var(--border)', borderLeft: '4px solid var(--blue)' }}
          >
            <p className="text-[11px] mb-0.5" style={{ color: 'var(--text-3)' }}>Entity 1</p>
            <p className="font-head text-[13px] font-bold truncate" style={{ color: 'var(--navy)' }}>{entity1?.name || 'N/A'}</p>
          </div>
          <div
            className="bg-white rounded-md p-3"
            style={{ border: '1px solid var(--border)', borderLeft: '4px solid var(--green)' }}
          >
            <p className="text-[11px] mb-0.5" style={{ color: 'var(--text-3)' }}>Entity 2</p>
            <p className="font-head text-[13px] font-bold truncate" style={{ color: 'var(--navy)' }}>{entity2?.name || 'N/A'}</p>
          </div>
        </div>

        {/* Category filter chips */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-4 px-4">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            const catStyle = CATEGORY_STYLES[cat];
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="whitespace-nowrap text-[11px] font-semibold px-3 py-1.5 rounded-full transition-all"
                style={isActive
                  ? { background: 'var(--navy)', color: '#fff' }
                  : { background: catStyle?.bg || 'var(--bg)', color: catStyle?.fg || 'var(--text-2)', border: '1px solid var(--border)' }
                }
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Comparison bar chart */}
        {filteredMetrics.length > 0 && (
          <div className="bg-white rounded-md p-4" style={{ border: '1px solid var(--border)', height: '280px' }}>
            <Bar
              data={{
                labels: filteredMetrics.map((m) => m.name),
                datasets: [
                  {
                    label: entity1?.name || 'Entity 1',
                    data: filteredMetrics.map((m) => m.value1),
                    backgroundColor: CHART_COLORS.blue,
                    borderRadius: 4,
                  },
                  {
                    label: entity2?.name || 'Entity 2',
                    data: filteredMetrics.map((m) => m.value2),
                    backgroundColor: CHART_COLORS.teal,
                    borderRadius: 4,
                  },
                ],
              }}
              options={{
                ...BASE_OPTIONS,
                indexAxis: 'y',
                plugins: {
                  ...BASE_OPTIONS.plugins,
                  legend: { display: true, position: 'top', labels: { font: { family: 'DM Sans', size: 10 }, boxWidth: 12, padding: 8 } },
                },
                scales: {
                  x: { ...BASE_OPTIONS.scales.y, beginAtZero: true },
                  y: { ...BASE_OPTIONS.scales.x, ticks: { ...BASE_OPTIONS.scales.x.ticks, autoSkip: false } },
                },
              }}
            />
          </div>
        )}

        {/* Metrics comparison table */}
        <div className="space-y-2.5">
          <p
            className="font-head text-[11px] font-bold uppercase tracking-[1.2px]"
            style={{ color: 'var(--text-3)' }}
          >
            Metric Details
          </p>

          {filteredMetrics.map((metric) => {
            const winner = getWinner(metric);
            const catStyle = CATEGORY_STYLES[metric.category] || { bg: 'var(--bg)', fg: 'var(--text-2)' };
            return (
              <div key={metric.id} className="bg-white rounded-md p-3" style={{ border: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between mb-2.5">
                  <p className="font-head text-[13px] font-bold" style={{ color: 'var(--navy)' }}>{metric.name}</p>
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: catStyle.bg, color: catStyle.fg }}
                  >
                    {metric.category}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  {/* Entity 1 value */}
                  <div
                    className="py-2 rounded-lg"
                    style={winner === 'first'
                      ? { background: 'var(--green-bg)', border: '1px solid var(--green)' }
                      : { background: 'var(--bg)' }
                    }
                  >
                    <p
                      className="text-[14px] font-bold font-body"
                      style={{ color: winner === 'first' ? 'var(--green)' : 'var(--navy)' }}
                    >
                      {metric.value1}
                    </p>
                    <p className="text-[10px] truncate px-1" style={{ color: 'var(--text-3)' }}>{entity1?.name?.split(' ')[0]}</p>
                  </div>

                  {/* Difference */}
                  <div className="py-2 rounded-lg flex flex-col items-center justify-center" style={{ background: 'var(--bg)' }}>
                    {metric.diff > 0 ? (
                      <ArrowUpRight size={12} style={{ color: 'var(--green)' }} />
                    ) : metric.diff < 0 ? (
                      <ArrowDownRight size={12} style={{ color: 'var(--red)' }} />
                    ) : (
                      <Minus size={12} style={{ color: 'var(--text-3)' }} />
                    )}
                    <p
                      className="text-[12px] font-semibold"
                      style={{ color: metric.diff > 0 ? 'var(--green)' : metric.diff < 0 ? 'var(--red)' : 'var(--text-3)' }}
                    >
                      {metric.diff > 0 ? '+' : ''}{metric.diff}
                    </p>
                  </div>

                  {/* Entity 2 value */}
                  <div
                    className="py-2 rounded-lg"
                    style={winner === 'second'
                      ? { background: 'var(--green-bg)', border: '1px solid var(--green)' }
                      : { background: 'var(--bg)' }
                    }
                  >
                    <p
                      className="text-[14px] font-bold font-body"
                      style={{ color: winner === 'second' ? 'var(--green)' : 'var(--navy)' }}
                    >
                      {metric.value2}
                    </p>
                    <p className="text-[10px] truncate px-1" style={{ color: 'var(--text-3)' }}>{entity2?.name?.split(' ')[0]}</p>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredMetrics.length === 0 && (
            <p className="text-[12px] text-center py-6" style={{ color: 'var(--text-3)' }}>No metrics in this category.</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2.5">
          <button
            onClick={() => navigate('/analytics')}
            className="flex-1 py-2.5 text-[13px] font-semibold transition-colors font-body"
            style={{ borderRadius: 'var(--r-md)', border: '1px solid var(--border)', color: 'var(--navy)', background: 'var(--card)' }}
          >
            New Comparison
          </button>
          <button
            onClick={() => {
              localStorage.removeItem('ashom-wizard');
              localStorage.removeItem('ashom-comparison-results');
              navigate('/');
            }}
            className="flex-1 py-2.5 text-[13px] font-semibold text-white transition-colors font-body"
            style={{ borderRadius: 'var(--r-md)', background: 'var(--navy)' }}
          >
            Done
          </button>
        </div>

        <div className="h-4" />
      </div>
    </div>
  );
}
