import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { auth } from '../services/api';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  // New-password state (shown when URL has ?token=...)
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updated, setUpdated] = useState(false);

  useEffect(() => {
    if (updated) {
      const timer = setTimeout(() => navigate('/login'), 2000);
      return () => clearTimeout(timer);
    }
  }, [updated, navigate]);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await auth.updatePassword(newPassword, token);
      setUpdated(true);
    } catch (err) {
      setError(err.message || 'Could not update password');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await auth.resetPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.message || 'Could not send reset link');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    height: 48,
    padding: '0 16px',
    fontSize: 16,
    borderRadius: 'var(--r-md)',
    border: '1px solid var(--border)',
    background: 'var(--card)',
    color: 'var(--text-1)',
    fontFamily: 'var(--font-body)',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
  };

  const handleFocus = (e) => {
    e.target.style.borderColor = 'var(--blue)';
    e.target.style.boxShadow = '0 0 0 3px var(--blue-light)';
  };

  const handleBlur = (e) => {
    e.target.style.borderColor = 'var(--border)';
    e.target.style.boxShadow = 'none';
  };

  return (
    <div
      className="min-h-screen px-4"
      style={{ background: 'var(--bg)', fontFamily: 'var(--font-body)', position: 'relative', overflow: 'hidden', paddingTop: 80 }}
    >
      {/* Decorative circles */}
      <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(83,145,213,0.06)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -40, left: -40, width: 150, height: 150, borderRadius: '50%', background: 'rgba(0,200,150,0.05)', pointerEvents: 'none' }} />

      <div className="w-full animate-fade-in" style={{ maxWidth: 430, margin: '0 auto' }}>

        {/* Logo */}
        <div className="text-center mb-10 animate-fade-up">
          <div
            className="inline-flex items-center justify-center mb-4"
            style={{
              width: 60,
              height: 60,
              borderRadius: 'var(--r-sm)',
              background: 'var(--navy)',
            }}
          >
            <span className="text-white font-bold" style={{ fontFamily: 'serif', fontSize: 18 }}>
              أسهم
            </span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 4 }}>Welcome back</p>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: 'var(--text-1)',
              fontFamily: 'var(--font-head)',
              margin: 0,
            }}
          >
            Ashom
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-3)', marginTop: 6 }}>
            GCC Financial Intelligence
          </p>
        </div>

        {token ? (
          /* Set New Password flow (arrived from email link with ?token=...) */
          updated ? (
            <div className="text-center space-y-4 animate-fade-up">
              <div
                className="inline-flex items-center justify-center mb-2"
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'var(--green-bg)',
                }}
              >
                <svg
                  className="w-6 h-6"
                  style={{ color: 'var(--green)' }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: 'var(--text-1)',
                  fontFamily: 'var(--font-head)',
                  margin: 0,
                }}
              >
                Password updated!
              </h2>
              <p style={{ fontSize: 14, color: 'var(--text-3)', margin: 0 }}>
                Redirecting to login...
              </p>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <h2
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: 'var(--text-1)',
                    fontFamily: 'var(--font-head)',
                    margin: 0,
                  }}
                >
                  Set new password
                </h2>
                <p style={{ fontSize: 14, color: 'var(--text-3)', marginTop: 6 }}>
                  Enter your new password below.
                </p>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-5">
                <div>
                  <label
                    htmlFor="newPassword"
                    style={{
                      display: 'block',
                      fontSize: 14,
                      fontWeight: 500,
                      color: 'var(--text-1)',
                      marginBottom: 6,
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    New password
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    style={inputStyle}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    style={{
                      display: 'block',
                      fontSize: 14,
                      fontWeight: 500,
                      color: 'var(--text-1)',
                      marginBottom: 6,
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    Confirm password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    style={inputStyle}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                </div>

                {error && (
                  <p
                    style={{
                      fontSize: 14,
                      color: 'var(--red)',
                      background: 'var(--red-bg)',
                      borderRadius: 'var(--r-sm)',
                      padding: '10px 14px',
                      margin: 0,
                    }}
                  >
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    height: 48,
                    borderRadius: 'var(--r-md)',
                    background: 'var(--navy)',
                    color: '#FFFFFF',
                    fontSize: 15,
                    fontWeight: 600,
                    fontFamily: 'var(--font-head)',
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.55 : 1,
                    transition: 'opacity 0.2s, transform 0.1s',
                  }}
                  onMouseDown={(e) => { if (!loading) e.currentTarget.style.transform = 'scale(0.98)'; }}
                  onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Updating...
                    </span>
                  ) : (
                    'Update password'
                  )}
                </button>
              </form>

              <div className="mt-5 text-center">
                <Link
                  to="/login"
                  style={{
                    fontSize: 14,
                    color: 'var(--blue)',
                    fontWeight: 500,
                    textDecoration: 'none',
                  }}
                >
                  Back to sign in
                </Link>
              </div>
            </>
          )
        ) : sent ? (
          /* Email sent success state */
          <div className="text-center space-y-4 animate-fade-up">
            <div
              className="inline-flex items-center justify-center mb-2"
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'var(--green-bg)',
              }}
            >
              <svg
                className="w-6 h-6"
                style={{ color: 'var(--green)' }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: 'var(--text-1)',
                fontFamily: 'var(--font-head)',
                margin: 0,
              }}
            >
              Check your email
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-3)', margin: 0 }}>
              We sent a reset link to{' '}
              <span style={{ fontWeight: 500, color: 'var(--text-1)' }}>{email}</span>.
              Check your inbox and follow the instructions.
            </p>
            <Link
              to="/login"
              style={{
                display: 'inline-block',
                marginTop: 16,
                fontSize: 14,
                color: 'var(--blue)',
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          /* Request reset form */
          <>
            <div className="text-center mb-6">
              <h2
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: 'var(--text-1)',
                  fontFamily: 'var(--font-head)',
                  margin: 0,
                }}
              >
                Reset your password
              </h2>
              <p style={{ fontSize: 14, color: 'var(--text-3)', marginTop: 6 }}>
                Enter your email and we'll send you a reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  style={{
                    display: 'block',
                    fontSize: 14,
                    fontWeight: 500,
                    color: 'var(--text-1)',
                    marginBottom: 6,
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={inputStyle}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>

              {error && (
                <p
                  style={{
                    fontSize: 14,
                    color: 'var(--red)',
                    background: 'var(--red-bg)',
                    borderRadius: 'var(--r-sm)',
                    padding: '10px 14px',
                    margin: 0,
                  }}
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  height: 48,
                  borderRadius: 'var(--r-md)',
                  background: 'var(--navy)',
                  color: '#FFFFFF',
                  fontSize: 15,
                  fontWeight: 600,
                  fontFamily: 'var(--font-head)',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.55 : 1,
                  transition: 'opacity 0.2s, transform 0.1s',
                }}
                onMouseDown={(e) => { if (!loading) e.currentTarget.style.transform = 'scale(0.98)'; }}
                onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Sending...
                  </span>
                ) : (
                  'Send reset link'
                )}
              </button>
            </form>

            <div className="mt-5 text-center">
              <Link
                to="/login"
                style={{
                  fontSize: 14,
                  color: 'var(--blue)',
                  fontWeight: 500,
                  textDecoration: 'none',
                }}
              >
                Back to sign in
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
