import { useState } from 'react';
import { Upload, Image, Trash2, Check, Lock, Building2 } from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';
import useSubscription from '../hooks/useSubscription';

const STORAGE_KEY = 'vifm-whitelabel';

function loadWhiteLabel() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
  catch { return {}; }
}

function saveWhiteLabel(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export default function WhiteLabelPage() {
  const { canUseFeature, plan } = useSubscription();
  const [config, setConfig] = useState(loadWhiteLabel);
  const [saved, setSaved] = useState(false);

  const hasAccess = canUseFeature('whiteLabel');

  if (!hasAccess) {
    return (
      <div className="animate-fade-in" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
        <PageHeader title="White Label" subtitle="Branded reports" backTo="/settings" />
        <div style={{ padding: '48px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 'var(--r-lg)',
              background: '#FFFBEB',
              border: '1px solid #FDE68A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}
          >
            <Lock size={22} style={{ color: '#D97706' }} />
          </div>
          <p style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 16, color: 'var(--text-1)', margin: '0 0 4px' }}>Enterprise Feature</p>
          <p style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center', maxWidth: 240, lineHeight: 1.5 }}>
            White-label branding is available on the Enterprise plan ($99.99/mo).
          </p>
          <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 8 }}>Current plan: <span style={{ fontWeight: 700, color: 'var(--text-1)' }}>{plan.name}</span></p>
        </div>
      </div>
    );
  }

  function handleSave() {
    saveWhiteLabel(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleRemoveLogo() {
    setConfig(prev => ({ ...prev, logoUrl: null }));
  }

  const inputStyle = {
    width: '100%',
    fontSize: 12,
    fontFamily: 'var(--font-body)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--r-sm)',
    padding: '10px 12px',
    outline: 'none',
    color: 'var(--text-1)',
    background: 'var(--card)',
  };

  return (
    <div className="animate-fade-in" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <PageHeader title="White Label" subtitle="Branded reports" backTo="/settings" />

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Preview */}
        <div
          style={{
            background: 'var(--card)',
            border: '2px dashed var(--border)',
            borderRadius: 'var(--r-md)',
            padding: 16,
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-head)',
              fontSize: 10,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1.2px',
              color: 'var(--text-3)',
              margin: '0 0 12px',
            }}
          >
            Report Header Preview
          </p>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '2px solid var(--navy)',
              paddingBottom: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {config.logoUrl ? (
                <img src={config.logoUrl} alt="Logo" style={{ height: 32, width: 'auto', objectFit: 'contain' }} />
              ) : (
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 'var(--r-sm)',
                    background: 'var(--navy)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Building2 size={16} style={{ color: '#fff' }} />
                </div>
              )}
              <div>
                <p style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 14, color: 'var(--text-1)', margin: 0 }}>
                  {config.companyName || 'Your Company'}
                </p>
                <p style={{ fontSize: 11, color: 'var(--text-3)', margin: '1px 0 0' }}>{config.tagline || 'Financial Services'}</p>
              </div>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-3)', margin: 0 }}>Portfolio Report</p>
          </div>
        </div>

        {/* Company name */}
        <div>
          <label style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', marginBottom: 4, fontFamily: 'var(--font-body)' }}>Company Name</label>
          <input
            type="text"
            value={config.companyName || ''}
            onChange={e => setConfig(prev => ({ ...prev, companyName: e.target.value }))}
            placeholder="e.g. Al-Rajhi Capital"
            style={inputStyle}
          />
        </div>

        {/* Tagline */}
        <div>
          <label style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', marginBottom: 4, fontFamily: 'var(--font-body)' }}>Tagline</label>
          <input
            type="text"
            value={config.tagline || ''}
            onChange={e => setConfig(prev => ({ ...prev, tagline: e.target.value }))}
            placeholder="e.g. Wealth Management & Advisory"
            style={inputStyle}
          />
        </div>

        {/* Logo URL */}
        <div>
          <label style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', marginBottom: 4, fontFamily: 'var(--font-body)' }}>Logo URL</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="url"
              value={config.logoUrl || ''}
              onChange={e => setConfig(prev => ({ ...prev, logoUrl: e.target.value }))}
              placeholder="https://yourcompany.com/logo.png"
              style={{ ...inputStyle, flex: 1 }}
            />
            {config.logoUrl && (
              <button
                onClick={handleRemoveLogo}
                style={{
                  padding: 10,
                  borderRadius: 'var(--r-sm)',
                  border: '1px solid var(--border)',
                  background: 'var(--card)',
                  cursor: 'pointer',
                }}
              >
                <Trash2 size={14} style={{ color: 'var(--text-3)' }} />
              </button>
            )}
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-3)', margin: '4px 0 0' }}>Recommended: PNG or SVG, max height 40px</p>
        </div>

        {/* Contact info */}
        <div>
          <label style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', marginBottom: 4, fontFamily: 'var(--font-body)' }}>Report Footer Text</label>
          <input
            type="text"
            value={config.footerText || ''}
            onChange={e => setConfig(prev => ({ ...prev, footerText: e.target.value }))}
            placeholder="e.g. Licensed by CMA | P.O. Box 12345, Riyadh"
            style={inputStyle}
          />
        </div>

        {/* Primary color */}
        <div>
          <label style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', marginBottom: 4, fontFamily: 'var(--font-body)' }}>Brand Color</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <input
              type="color"
              value={config.brandColor || '#0a2f4e'}
              onChange={e => setConfig(prev => ({ ...prev, brandColor: e.target.value }))}
              style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--r-sm)',
                border: '1px solid var(--border)',
                cursor: 'pointer',
                padding: 0,
              }}
            />
            <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text-2)' }}>{config.brandColor || '#0a2f4e'}</span>
          </div>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          style={{
            width: '100%',
            padding: '12px 0',
            borderRadius: 'var(--r-sm)',
            fontSize: 13,
            fontWeight: 600,
            fontFamily: 'var(--font-body)',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s',
            background: saved ? 'var(--green)' : 'var(--navy)',
            color: '#fff',
          }}
        >
          {saved ? <><Check size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} /> Saved!</> : 'Save Branding'}
        </button>

        <p style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'center', fontFamily: 'var(--font-body)' }}>
          Your branding will appear on all PDF reports generated from the Report Export page.
        </p>
      </div>
    </div>
  );
}
