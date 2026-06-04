import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      localStorage.setItem('vifm-home-tab', 'my');
      navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
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
            className="font-head"
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: 'var(--text-1)',
              fontFamily: 'var(--font-head)',
              margin: 0,
            }}
          >
            Sign in to Ashom
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-3)', marginTop: 6 }}>
            GCC Financial Intelligence
          </p>
        </div>

        {/* Form */}
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
              style={{
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
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--blue)';
                e.target.style.boxShadow = '0 0 0 3px var(--blue-light)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 500,
                color: 'var(--text-1)',
                marginBottom: 6,
                fontFamily: 'var(--font-body)',
              }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={{
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
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--blue)';
                e.target.style.boxShadow = '0 0 0 3px var(--blue-light)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border)';
                e.target.style.boxShadow = 'none';
              }}
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
                Signing in...
              </span>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1" style={{ height: 1, background: 'var(--border)' }} />
          <span style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--font-body)' }}>
            or continue with
          </span>
          <div className="flex-1" style={{ height: 1, background: 'var(--border)' }} />
        </div>

        {/* Links */}
        <div className="text-center space-y-3">
          <Link
            to="/reset-password"
            style={{
              display: 'block',
              fontSize: 14,
              color: 'var(--blue)',
              fontWeight: 500,
              textDecoration: 'none',
              fontFamily: 'var(--font-body)',
            }}
          >
            Forgot password?
          </Link>
          <p style={{ fontSize: 14, color: 'var(--text-3)', margin: 0 }}>
            Don't have an account?{' '}
            <Link
              to="/register"
              style={{
                color: 'var(--blue)',
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              Sign up
            </Link>
          </p>
        </div>

        {/* Demo hint */}
        <div className="mt-6 text-center">
          <p style={{ fontSize: 12, color: 'var(--text-3)', margin: 0 }}>
            Demo: demo@vifm.com / demo123
          </p>
        </div>
      </div>
    </div>
  );
}
