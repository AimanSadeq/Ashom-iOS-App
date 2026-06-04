import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Building2, Factory, TrendingUp, BarChart2,
  Globe, GitCompareArrows, Layers, LineChart, Map,
  ChevronRight
} from 'lucide-react';

import PageHeader from '../../components/shared/PageHeader';
import LoadingState from '../../components/shared/LoadingState';
import { analytics } from '../../services/api';
import useApi from '../../hooks/useApi';

const FALLBACK_COMPARISON_TYPES = [
  { id: 'company-vs-company',   title: 'Company vs Company',   icon: Building2,         iconBg: '#EAF2FC', iconFg: '#5391D5' },
  { id: 'company-vs-industry',  title: 'Company vs Industry',  icon: Factory,           iconBg: '#E6FAF5', iconFg: '#00C896' },
  { id: 'company-vs-index',     title: 'Company vs Index',     icon: TrendingUp,        iconBg: '#F0EEFE', iconFg: '#7C5FDB' },
  { id: 'industry-vs-industry', title: 'Industry vs Industry', icon: Layers,            iconBg: '#FFF8E6', iconFg: '#F2A600' },
  { id: 'industry-vs-index',    title: 'Industry vs Index',    icon: BarChart2,         iconBg: '#FFF5ED', iconFg: '#FF8A35' },
  { id: 'industry-vs-country',  title: 'Industry vs Country',  icon: Globe,             iconBg: '#E3F6F5', iconFg: '#00A8A0' },
  { id: 'company-vs-country',   title: 'Company vs Country',   icon: Map,               iconBg: '#FFF0F3', iconFg: '#FF4B6E' },
  { id: 'index-vs-index',       title: 'Index vs Index',       icon: GitCompareArrows,  iconBg: '#EAEBF7', iconFg: '#010131' },
  { id: 'country-vs-country',   title: 'Country vs Country',   icon: LineChart,         iconBg: '#EAF2FC', iconFg: '#5391D5' },
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

function mapApiTypes(apiTypes) {
  if (!apiTypes || !Array.isArray(apiTypes) || apiTypes.length === 0) return null;
  return apiTypes.map((t) => ({
    id: t.id,
    title: t.title || t.name || t.id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    icon: ICON_MAP[t.id] || BarChart2,
    iconBg: ICON_STYLE_MAP[t.id]?.iconBg || '#EAF2FC',
    iconFg: ICON_STYLE_MAP[t.id]?.iconFg || '#5391D5',
  }));
}

function getWizardData() {
  try { return JSON.parse(localStorage.getItem('ashom-wizard')) || {}; }
  catch { return {}; }
}

function setWizardData(data) {
  localStorage.setItem('ashom-wizard', JSON.stringify(data));
}

export default function WizardStep1() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselected = searchParams.get('type');
  const { data: apiTypes, loading } = useApi(analytics.types);
  const COMPARISON_TYPES = mapApiTypes(apiTypes) || FALLBACK_COMPARISON_TYPES;

  const [selected, setSelected] = useState(preselected || getWizardData().type || '');

  function handleNext(typeId) {
    const sel = typeId || selected;
    if (!sel) return;
    setWizardData({ ...getWizardData(), type: sel });
    navigate(`/wizard/first-entity?type=${sel}`);
  }

  function handleSelect(typeId) {
    setSelected(typeId);
    // Auto-advance after brief highlight
    setTimeout(() => {
      setWizardData({ ...getWizardData(), type: typeId });
      navigate(`/wizard/first-entity?type=${typeId}`);
    }, 300);
  }

  return (
    <div className="animate-fade-in" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <PageHeader title="Step 1 of 5" subtitle="Select Comparison Type" backTo="/analytics" />

      <div className="px-4 py-5 space-y-4">
        {/* Progress bar */}
        <div className="flex gap-1">
          <div className="h-1 flex-1 rounded-full" style={{ background: 'var(--navy)' }} />
          <div className="h-1 flex-1 rounded-full" style={{ background: 'var(--border)' }} />
          <div className="h-1 flex-1 rounded-full" style={{ background: 'var(--border)' }} />
          <div className="h-1 flex-1 rounded-full" style={{ background: 'var(--border)' }} />
          <div className="h-1 flex-1 rounded-full" style={{ background: 'var(--border)' }} />
        </div>

        {loading ? <LoadingState message="Loading comparison types..." /> : (
          <div className="grid grid-cols-2 gap-2.5">
            {COMPARISON_TYPES.map((type) => {
              const Icon = type.icon;
              const isSelected = selected === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => handleSelect(type.id)}
                  className="bg-white rounded-md flex flex-col items-center gap-2.5 p-4 text-center transition-all hover:-translate-y-0.5"
                  style={{
                    border: isSelected ? '2px solid var(--navy)' : '1px solid var(--border)',
                    boxShadow: isSelected ? '0 4px 12px rgba(1,1,49,0.1)' : 'none',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: type.iconBg }}
                  >
                    <Icon size={18} style={{ color: type.iconFg }} />
                  </div>
                  <span className="font-head text-[12px] font-bold leading-tight" style={{ color: 'var(--navy)' }}>
                    {type.title}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <div className="flex gap-2.5">
          <button
            onClick={() => navigate('/analytics')}
            className="flex-1 py-3 text-[13px] font-semibold flex items-center justify-center gap-1 transition-colors font-body"
            style={{ borderRadius: 'var(--r-md)', background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text-2)' }}
          >
            Back
          </button>
          <button
            onClick={() => handleNext()}
            disabled={!selected}
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
