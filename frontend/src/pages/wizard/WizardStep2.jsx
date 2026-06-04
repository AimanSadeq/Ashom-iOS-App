import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, ChevronRight, Building2, Factory, TrendingUp, Globe } from 'lucide-react';

import PageHeader from '../../components/shared/PageHeader';
import LoadingState from '../../components/shared/LoadingState';
import ErrorState from '../../components/shared/ErrorState';
import useApi from '../../hooks/useApi';
import { companies, analytics } from '../../services/api';

/* ------------------------------------------------------------------ */
/* Entity labels and fetch logic based on the comparison type          */
/* ------------------------------------------------------------------ */

const ENTITY_ICONS = {
  company:  Building2,
  industry: Factory,
  index:    TrendingUp,
  country:  Globe,
};

const GCC_COUNTRIES = [
  { id: 'saudi',   name: 'Saudi Arabia' },
  { id: 'uae',     name: 'United Arab Emirates' },
  { id: 'kuwait',  name: 'Kuwait' },
  { id: 'qatar',   name: 'Qatar' },
  { id: 'bahrain', name: 'Bahrain' },
  { id: 'oman',    name: 'Oman' },
];

const GCC_INDICES = [
  { id: 'tasi',    name: 'Tadawul All Share (TASI)' },
  { id: 'adi',     name: 'Abu Dhabi Index (ADI)' },
  { id: 'dfmgi',   name: 'DFM General Index' },
  { id: 'kwse',    name: 'Kuwait Stock Exchange' },
  { id: 'qe',      name: 'Qatar Exchange Index' },
  { id: 'bax',     name: 'Bahrain All Share' },
  { id: 'msm30',   name: 'Muscat MSM 30' },
];

function getFirstEntityKind(type) {
  if (!type) return 'company';
  return type.split('-vs-')[0]; // company, industry, index, country
}

function getWizardData() {
  try { return JSON.parse(localStorage.getItem('ashom-wizard')) || {}; }
  catch { return {}; }
}

function setWizardData(data) {
  localStorage.setItem('ashom-wizard', JSON.stringify(data));
}

/* ------------------------------------------------------------------ */

export default function WizardStep2() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || getWizardData().type || '';
  const entityKind = getFirstEntityKind(type);

  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(getWizardData().firstEntity || null);

  function handleSelect(entity) {
    setSelected(entity);
    // Auto-advance after brief highlight
    setTimeout(() => {
      setWizardData({ ...getWizardData(), type, firstEntity: entity });
      navigate(`/wizard/second-entity?type=${type}`);
    }, 300);
  }

  // Fetch entities based on kind
  const companiesApi = useApi(() => companies.list(), [], entityKind === 'company');
  const industriesApi = useApi(() => analytics.industries(), [], entityKind === 'industry');

  // Build entity list
  const entities = useMemo(() => {
    if (entityKind === 'country') return GCC_COUNTRIES;
    if (entityKind === 'index') return GCC_INDICES;
    if (entityKind === 'industry' && industriesApi.data) {
      const raw = industriesApi.data;
      const list = Array.isArray(raw) ? raw : raw?.industries || raw?.data || [];
      return list.map((ind) => typeof ind === 'string' ? { id: ind, name: ind } : { id: ind.id || ind.industry || ind.name, name: ind.industry || ind.name });
    }
    if (entityKind === 'company' && companiesApi.data) {
      const raw = companiesApi.data;
      const list = Array.isArray(raw) ? raw : raw?.companies || raw?.data || [];
      return list.map((c) => ({ id: c.id, name: c.name, subtitle: c.sector }));
    }
    return [];
  }, [entityKind, companiesApi.data, industriesApi.data]);

  const loading = (entityKind === 'company' && companiesApi.loading) || (entityKind === 'industry' && industriesApi.loading);
  const error = (entityKind === 'company' && companiesApi.error) || (entityKind === 'industry' && industriesApi.error);

  const filtered = useMemo(() => {
    if (!search.trim()) return entities;
    const q = search.toLowerCase();
    return entities.filter((e) => e.name.toLowerCase().includes(q));
  }, [entities, search]);

  function handleNext() {
    if (!selected) return;
    setWizardData({ ...getWizardData(), type, firstEntity: selected });
    navigate(`/wizard/second-entity?type=${type}`);
  }

  const Icon = ENTITY_ICONS[entityKind] || Building2;
  const kindLabel = entityKind.charAt(0).toUpperCase() + entityKind.slice(1);

  return (
    <div className="animate-fade-in" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <PageHeader title="Step 2 of 5" subtitle={`Select First ${kindLabel}`} backTo={`/wizard/type?type=${type}`} />

      <div className="px-4 py-5 space-y-4">
        {/* Progress bar */}
        <div className="flex gap-1">
          <div className="h-1 flex-1 rounded-full" style={{ background: 'var(--navy)' }} />
          <div className="h-1 flex-1 rounded-full" style={{ background: 'var(--navy)' }} />
          <div className="h-1 flex-1 rounded-full" style={{ background: 'var(--border)' }} />
          <div className="h-1 flex-1 rounded-full" style={{ background: 'var(--border)' }} />
          <div className="h-1 flex-1 rounded-full" style={{ background: 'var(--border)' }} />
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-3)' }} />
          <input
            type="text"
            placeholder={`Search ${entityKind}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-[13px] bg-white focus:outline-none transition-all font-body"
            style={{ borderRadius: 'var(--r-md)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
          />
        </div>

        {/* Entity list */}
        {loading && <LoadingState message={`Loading ${entityKind} list...`} />}
        {error && <ErrorState message={error} onRetry={entityKind === 'company' ? companiesApi.refetch : industriesApi.refetch} />}

        {!loading && !error && (
          <div className="space-y-1.5 max-h-[50vh] overflow-y-auto">
            {filtered.length === 0 && (
              <p className="text-[12px] text-center py-6" style={{ color: 'var(--text-3)' }}>No results found.</p>
            )}
            {filtered.map((entity) => {
              const isSelected = selected?.id === entity.id;
              return (
                <button
                  key={entity.id}
                  onClick={() => handleSelect(entity)}
                  className="w-full flex items-center gap-3 p-3 transition-all text-left"
                  style={{
                    borderRadius: 'var(--r-md)',
                    border: isSelected ? '2px solid var(--navy)' : '1px solid var(--border)',
                    background: isSelected ? 'var(--blue-light)' : 'var(--card)',
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background: isSelected ? 'rgba(83,145,213,0.15)' : 'var(--bg)',
                      color: isSelected ? 'var(--blue)' : 'var(--text-3)',
                    }}
                  >
                    <Icon size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-head text-[13px] font-semibold truncate" style={{ color: 'var(--navy)' }}>{entity.name}</p>
                    {entity.subtitle && <p className="text-[11px] truncate" style={{ color: 'var(--text-3)' }}>{entity.subtitle}</p>}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <div className="flex gap-2.5">
          <button
            onClick={() => navigate(`/wizard/type?type=${type}`)}
            className="flex-1 py-3 text-[13px] font-semibold flex items-center justify-center gap-1 transition-colors font-body"
            style={{ borderRadius: 'var(--r-md)', background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text-2)' }}
          >
            Back
          </button>
          <button
            onClick={handleNext}
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
