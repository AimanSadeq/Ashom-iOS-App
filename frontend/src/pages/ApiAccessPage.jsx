import { useState } from 'react';
import { Key, Copy, Check, RefreshCw, Code, Lock, Eye, EyeOff } from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';
import useSubscription from '../hooks/useSubscription';

const API_KEY_STORAGE = 'vifm-api-key';

function generateApiKey() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let key = 'vifm_';
  for (let i = 0; i < 32; i++) key += chars[Math.floor(Math.random() * chars.length)];
  return key;
}

function loadApiKey() {
  return localStorage.getItem(API_KEY_STORAGE) || null;
}

const ENDPOINTS = [
  { method: 'GET', path: '/api/companies', desc: 'List all GCC companies with optional filters', params: 'country, sector, search' },
  { method: 'GET', path: '/api/companies/:id', desc: 'Get company details with financial metrics', params: 'id (path)' },
  { method: 'GET', path: '/api/companies/stats/coverage', desc: 'Coverage statistics by country and sector', params: 'none' },
  { method: 'POST', path: '/api/screener', desc: 'Screen companies by financial criteria', params: 'JSON body with filters' },
  { method: 'GET', path: '/api/commodities/yahoo', desc: 'Gold, silver, platinum, oil prices', params: 'none' },
  { method: 'GET', path: '/api/coingecko/crypto', desc: 'Cryptocurrency prices', params: 'ids (comma-separated)' },
  { method: 'GET', path: '/api/analytics/types', desc: 'Available comparison types', params: 'none' },
  { method: 'GET', path: '/api/reports', desc: 'Annual reports with filters', params: 'company_id, year' },
];

export default function ApiAccessPage() {
  const { canUseFeature, plan, planId } = useSubscription();
  const [apiKey, setApiKey] = useState(loadApiKey);
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);

  const hasAccess = canUseFeature('api');

  function handleGenerateKey() {
    const key = generateApiKey();
    localStorage.setItem(API_KEY_STORAGE, key);
    setApiKey(key);
    setShowKey(true);
  }

  function handleRegenerateKey() {
    if (!window.confirm('Regenerate API key? The old key will stop working immediately.')) return;
    handleGenerateKey();
  }

  function handleCopy() {
    if (apiKey) {
      navigator.clipboard?.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (!hasAccess) {
    return (
      <div className="animate-fade-in" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
        <PageHeader title="API Access" subtitle="Programmatic data access" backTo="/settings" />
        <div style={{ padding: '48px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 'var(--r-lg)',
              background: '#F5F3FF',
              border: '1px solid #E9E5FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}
          >
            <Lock size={22} style={{ color: '#7C3AED' }} />
          </div>
          <p style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 16, color: 'var(--text-1)', margin: '0 0 4px' }}>Pro Feature</p>
          <p style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center', maxWidth: 240, lineHeight: 1.5 }}>
            API access is available on Pro ($29.99/mo) and Enterprise ($99.99/mo) plans.
          </p>
          <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 8 }}>Current plan: <span style={{ fontWeight: 700, color: 'var(--text-1)' }}>{plan.name}</span></p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <PageHeader title="API Access" subtitle="Programmatic data access" backTo="/settings" />

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Rate limit info */}
        <div
          style={{
            borderRadius: 'var(--r-md)',
            padding: 16,
            background: 'linear-gradient(135deg, #7C3AED, #5B21B6)',
            color: '#fff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Code size={16} />
            <p style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 14, margin: 0 }}>Your API Plan</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', margin: 0 }}>Daily Limit</p>
              <p style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 20, margin: '2px 0 0' }}>{plan.apiCallsPerDay.toLocaleString()}</p>
            </div>
            <div>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', margin: 0 }}>Plan</p>
              <p style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 20, margin: '2px 0 0' }}>{plan.name}</p>
            </div>
          </div>
        </div>

        {/* API Key */}
        <p
          style={{
            fontFamily: 'var(--font-head)',
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1.2px',
            color: 'var(--text-3)',
            margin: '0 0 -8px 4px',
          }}
        >
          API Key
        </p>
        {apiKey ? (
          <div
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-md)',
              padding: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Key size={14} style={{ color: '#7C3AED', flexShrink: 0 }} />
              <div
                style={{
                  flex: 1,
                  fontFamily: 'monospace',
                  fontSize: 12,
                  background: 'var(--bg)',
                  borderRadius: 'var(--r-sm)',
                  padding: '8px 12px',
                  overflow: 'hidden',
                  color: 'var(--text-1)',
                }}
              >
                {showKey ? apiKey : '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022'}
              </div>
              <button
                onClick={() => setShowKey(v => !v)}
                style={{ padding: 6, borderRadius: 'var(--r-sm)', border: 'none', background: 'transparent', cursor: 'pointer' }}
              >
                {showKey ? <EyeOff size={14} style={{ color: 'var(--text-3)' }} /> : <Eye size={14} style={{ color: 'var(--text-3)' }} />}
              </button>
              <button
                onClick={handleCopy}
                style={{ padding: 6, borderRadius: 'var(--r-sm)', border: 'none', background: 'transparent', cursor: 'pointer' }}
              >
                {copied ? <Check size={14} style={{ color: 'var(--green)' }} /> : <Copy size={14} style={{ color: 'var(--text-3)' }} />}
              </button>
            </div>
            <button
              onClick={handleRegenerateKey}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--blue)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
              }}
            >
              <RefreshCw size={10} /> Regenerate Key
            </button>
          </div>
        ) : (
          <button
            onClick={handleGenerateKey}
            style={{
              width: '100%',
              background: 'var(--card)',
              border: '2px dashed var(--border)',
              borderRadius: 'var(--r-md)',
              padding: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
            }}
          >
            <Key size={16} style={{ color: '#7C3AED' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>Generate API Key</span>
          </button>
        )}

        {/* Usage example */}
        <p
          style={{
            fontFamily: 'var(--font-head)',
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1.2px',
            color: 'var(--text-3)',
            margin: '0 0 -8px 4px',
          }}
        >
          Quick Start
        </p>
        <div
          style={{
            background: 'var(--navy)',
            borderRadius: 'var(--r-md)',
            padding: 12,
            overflowX: 'auto',
          }}
        >
          <pre style={{ fontSize: 10, fontFamily: 'monospace', lineHeight: 1.5, color: '#E5E7EB', margin: 0, whiteSpace: 'pre' }}>
{`curl -H "Authorization: Bearer ${apiKey || 'YOUR_API_KEY'}" \\
  https://ashom.app/api/companies?country=Saudi%20Arabia`}
          </pre>
        </div>

        {/* Endpoints */}
        <p
          style={{
            fontFamily: 'var(--font-head)',
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1.2px',
            color: 'var(--text-3)',
            margin: '0 0 -8px 4px',
          }}
        >
          Available Endpoints
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {ENDPOINTS.map((ep, i) => (
            <div
              key={i}
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-md)',
                padding: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    padding: '2px 6px',
                    borderRadius: 4,
                    background: ep.method === 'GET' ? 'var(--green-bg)' : '#FFFBEB',
                    color: ep.method === 'GET' ? 'var(--green)' : '#D97706',
                  }}
                >
                  {ep.method}
                </span>
                <code style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-1)', fontWeight: 600 }}>{ep.path}</code>
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-2)', margin: 0 }}>{ep.desc}</p>
              <p style={{ fontSize: 11, color: 'var(--text-3)', margin: '3px 0 0' }}>Params: {ep.params}</p>
            </div>
          ))}
        </div>

        {/* Rate limiting info */}
        <div
          style={{
            background: '#FFFBEB',
            border: '1px solid #FDE68A',
            borderRadius: 'var(--r-md)',
            padding: 12,
          }}
        >
          <p style={{ fontSize: 11, color: '#92400E', lineHeight: 1.5, margin: 0 }}>
            <span style={{ fontWeight: 700 }}>Rate Limiting:</span> All API requests require a valid API key in the Authorization header. Requests exceeding your daily limit will receive a 429 response.
          </p>
        </div>
      </div>
    </div>
  );
}
