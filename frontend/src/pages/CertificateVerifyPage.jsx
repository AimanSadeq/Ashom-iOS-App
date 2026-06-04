import { useState } from 'react';
import { ShieldCheck, Search, Award, Calendar, User, Building2, AlertCircle } from 'lucide-react';

import PageHeader from '../components/shared/PageHeader';
import { certificates } from '../services/api';

const cardStyle = { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)' };

export default function CertificateVerifyPage() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    const trimmed = code.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await certificates.verify(trimmed);
      if (data && (data.certificate || data.valid || data.name)) {
        setResult(data.certificate || data);
      } else {
        setError('Invalid certificate code. Please check and try again.');
      }
    } catch (err) {
      setError(err.message || 'Invalid certificate code. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Verify Certificate" subtitle="Authenticate VIFM Credentials" backTo="/" />

      <div style={{ padding: '24px 20px' }}>
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 'var(--r-lg)', background: 'var(--green-bg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px',
          }}>
            <ShieldCheck size={24} style={{ color: 'var(--green)' }} />
          </div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy)', fontFamily: 'var(--font-head)' }}>Certificate Verification</h2>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>Enter the certificate code to verify its authenticity.</p>
        </div>

        {/* Input */}
        <div style={{ ...cardStyle, padding: 16 }}>
          <label style={{
            fontSize: 10, fontWeight: 600, color: 'var(--text-3)',
            textTransform: 'uppercase', letterSpacing: '0.8px', fontFamily: 'var(--font-head)',
          }}>Certificate Code</label>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
              placeholder="e.g. VIFM-2024-ABC123"
              style={{
                flex: 1, padding: '10px 12px', fontSize: 14,
                border: '1px solid var(--border)', borderRadius: 'var(--r-sm)',
                outline: 'none', background: 'var(--card)', color: 'var(--text-1)',
                fontFamily: 'var(--font-body)',
              }}
            />
            <button
              onClick={handleVerify}
              disabled={loading || !code.trim()}
              style={{
                padding: '10px 16px', background: 'var(--navy)', color: '#fff',
                fontSize: 13, fontWeight: 600, borderRadius: 'var(--r-sm)',
                border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                opacity: (loading || !code.trim()) ? 0.5 : 1,
                fontFamily: 'var(--font-head)', transition: 'opacity 0.15s',
              }}
            >
              {loading ? (
                <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} className="animate-spin" />
              ) : (
                <Search size={14} />
              )}
              Verify
            </button>
          </div>
        </div>

        {/* Success */}
        {result && (
          <div style={{ ...cardStyle, marginTop: 16, padding: 16, borderLeft: '4px solid var(--green)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 'var(--r-sm)', background: 'var(--green-bg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <ShieldCheck size={16} style={{ color: 'var(--green)' }} />
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--green)', fontFamily: 'var(--font-head)' }}>Certificate Verified</p>
                <p style={{ fontSize: 10, color: 'var(--green)', opacity: 0.7 }}>This certificate is authentic</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(result.name || result.holderName) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <User size={12} style={{ color: 'var(--text-3)' }} />
                  <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Holder:</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--navy)' }}>{result.name || result.holderName}</span>
                </div>
              )}
              {(result.course || result.courseName) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Award size={12} style={{ color: 'var(--text-3)' }} />
                  <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Course:</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--navy)' }}>{result.course || result.courseName}</span>
                </div>
              )}
              {(result.date || result.issuedAt || result.issuedDate) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Calendar size={12} style={{ color: 'var(--text-3)' }} />
                  <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Date:</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--navy)' }}>{result.date || result.issuedAt || result.issuedDate}</span>
                </div>
              )}
              {(result.issuer || result.issuedBy) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Building2 size={12} style={{ color: 'var(--text-3)' }} />
                  <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Issuer:</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--navy)' }}>{result.issuer || result.issuedBy}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ ...cardStyle, marginTop: 16, padding: 16, borderLeft: '4px solid var(--red)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 'var(--r-sm)', background: 'var(--red-bg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <AlertCircle size={16} style={{ color: 'var(--red)' }} />
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--red)', fontFamily: 'var(--font-head)' }}>Invalid Certificate</p>
                <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ height: 24 }} />
    </div>
  );
}
