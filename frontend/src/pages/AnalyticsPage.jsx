import { useNavigate } from 'react-router-dom';
import {
  Building2, Factory, TrendingUp, BarChart2,
  Globe, GitCompareArrows, Layers, LineChart, Map,
  Lightbulb
} from 'lucide-react';

import PageHeader from '../components/shared/PageHeader';
import LoadingState from '../components/shared/LoadingState';
import ErrorState from '../components/shared/ErrorState';
import { analytics } from '../services/api';
import useApi from '../hooks/useApi';

const FALLBACK_COMPARISON_TYPES = [
  { id: 'company-vs-company',   title: 'Company vs Company',   desc: 'Head-to-head financials',     icon: Building2,         iconBg: '#EAF2FC', iconFg: '#5391D5' },
  { id: 'company-vs-industry',  title: 'Company vs Industry',  desc: 'Benchmark against peers',     icon: Factory,           iconBg: '#E6FAF5', iconFg: '#00C896' },
  { id: 'company-vs-index',     title: 'Company vs Index',     desc: 'Track market performance',    icon: TrendingUp,        iconBg: '#F0EEFE', iconFg: '#7C5FDB' },
  { id: 'industry-vs-industry', title: 'Industry vs Industry', desc: 'Cross-sector analysis',       icon: Layers,            iconBg: '#FFF8E6', iconFg: '#F2A600' },
  { id: 'industry-vs-index',    title: 'Industry vs Index',    desc: 'Sector vs market trends',     icon: BarChart2,         iconBg: '#FFF5ED', iconFg: '#FF8A35' },
  { id: 'industry-vs-country',  title: 'Industry vs Country',  desc: 'Regional sector insights',    icon: Globe,             iconBg: '#E3F6F5', iconFg: '#00A8A0' },
  { id: 'company-vs-country',   title: 'Company vs Country',   desc: 'National market standing',    icon: Map,               iconBg: '#FFF0F3', iconFg: '#FF4B6E' },
  { id: 'index-vs-index',       title: 'Index vs Index',       desc: 'Compare market indices',      icon: GitCompareArrows,  iconBg: '#EAEBF7', iconFg: '#010131' },
  { id: 'country-vs-country',   title: 'Country vs Country',   desc: 'GCC cross-country review',    icon: LineChart,         iconBg: '#EAF2FC', iconFg: '#5391D5' },
];

const ICON_MAP = {
  'company-vs-company': Building2,
  'company-vs-industry': Factory,
  'company-vs-index': TrendingUp,
  'industry-vs-industry': Layers,
  'industry-vs-index': BarChart2,
  'industry-vs-country': Globe,
  'company-vs-country': Map,
  'index-vs-index': GitCompareArrows,
  'country-vs-country': LineChart,
};

const ICON_STYLE_MAP = {
  'company-vs-company':   { iconBg: '#EAF2FC', iconFg: '#5391D5' },
  'company-vs-industry':  { iconBg: '#E6FAF5', iconFg: '#00C896' },
  'company-vs-index':     { iconBg: '#F0EEFE', iconFg: '#7C5FDB' },
  'industry-vs-industry': { iconBg: '#FFF8E6', iconFg: '#F2A600' },
  'industry-vs-index':    { iconBg: '#FFF5ED', iconFg: '#FF8A35' },
  'industry-vs-country':  { iconBg: '#E3F6F5', iconFg: '#00A8A0' },
  'company-vs-country':   { iconBg: '#FFF0F3', iconFg: '#FF4B6E' },
  'index-vs-index':       { iconBg: '#EAEBF7', iconFg: '#010131' },
  'country-vs-country':   { iconBg: '#EAF2FC', iconFg: '#5391D5' },
};

const DESC_MAP = {
  'company-vs-company':   'Head-to-head financials',
  'company-vs-industry':  'Benchmark against peers',
  'company-vs-index':     'Track market performance',
  'industry-vs-industry': 'Cross-sector analysis',
  'industry-vs-index':    'Sector vs market trends',
  'industry-vs-country':  'Regional sector insights',
  'company-vs-country':   'National market standing',
  'index-vs-index':       'Compare market indices',
  'country-vs-country':   'GCC cross-country review',
};

function mapApiTypes(apiTypes) {
  if (!apiTypes || !Array.isArray(apiTypes) || apiTypes.length === 0) return null;
  return apiTypes.map((t) => ({
    id: t.id,
    title: t.title || t.name || t.id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    desc: DESC_MAP[t.id] || '',
    icon: ICON_MAP[t.id] || BarChart2,
    iconBg: ICON_STYLE_MAP[t.id]?.iconBg || '#EAF2FC',
    iconFg: ICON_STYLE_MAP[t.id]?.iconFg || '#5391D5',
  }));
}

export default function AnalyticsPage() {
  const navigate = useNavigate();
  const { data: apiTypes, loading, error, refetch } = useApi(analytics.types);
  const COMPARISON_TYPES = mapApiTypes(apiTypes) || FALLBACK_COMPARISON_TYPES;

  return (
    <div className="animate-fade-in" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <PageHeader title="Analytics" subtitle="Choose your comparison type" backTo="/" />

      <div className="px-4 py-5 space-y-5">
        <section>
          <p
            className="font-head text-[11px] font-bold uppercase tracking-[1.2px] mb-3"
            style={{ color: 'var(--text-3)' }}
          >
            Comparison Types
          </p>

          {error && <ErrorState message={error} onRetry={refetch} />}
          {loading ? (
            <LoadingState message="Loading comparison types..." />
          ) : (
            <div className="grid grid-cols-2 gap-2.5 stagger-children">
              {COMPARISON_TYPES.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => navigate(`/wizard/type?type=${type.id}`)}
                    className="bg-white rounded-md flex flex-col items-start gap-2.5 p-4 text-left transition-all hover:-translate-y-0.5"
                    style={{ border: '1px solid var(--border)' }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: type.iconBg }}
                    >
                      <Icon size={18} style={{ color: type.iconFg }} />
                    </div>
                    <div>
                      <span className="font-head text-[13px] font-bold leading-tight block" style={{ color: 'var(--navy)' }}>
                        {type.title}
                      </span>
                      {type.desc && (
                        <span className="text-[11px] mt-0.5 block" style={{ color: 'var(--text-3)' }}>
                          {type.desc}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Pro tip card */}
        <div
          className="rounded-md p-4 flex items-start gap-3"
          style={{ background: 'var(--blue-light)', border: '1px solid var(--blue-mid)' }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(83,145,213,0.15)' }}
          >
            <Lightbulb size={16} style={{ color: 'var(--blue)' }} />
          </div>
          <div>
            <p className="font-head text-[12px] font-bold" style={{ color: 'var(--navy)' }}>Pro tip</p>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-2)' }}>
              Use the Wizard for guided step-by-step comparisons
            </p>
          </div>
        </div>

        <div className="h-4" />
      </div>
    </div>
  );
}
