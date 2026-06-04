import { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home, TrendingUp, Cpu, BarChart2, BriefcaseBusiness,
  Newspaper, GraduationCap, Bell, Moon, Sun
} from 'lucide-react';
import useTheme from '../../hooks/useTheme';

/* ─── Sub-page → parent nav tab mapping ─── */
const ROUTE_PARENTS = {
  '/earnings': '/analytics',
  '/options': '/analytics',
  '/wizard': '/analytics',
  '/comparison-results': '/analytics',
  '/net-worth': '/portfolio',
  '/family': '/portfolio',
  '/copy-trading': '/portfolio',
  '/zakat': '/portfolio',
  '/order': '/portfolio',
  '/metals': '/markets',
  '/crypto': '/markets',
  '/companies': '/markets',
  '/screener': '/markets',
  '/ipo-calendar': '/markets',
  '/dividends': '/markets',
  '/rates': '/markets',
  '/cross-listings': '/markets',
  '/sharia': '/markets',
  '/community': '/news',
  '/fractional-shares': '/learning',
  '/glossary': '/learning',
  '/paths': '/learning',
  '/university': '/learning',
  '/quant': '/analytics',
  '/filings': '/analytics',
  '/sectors': '/analytics',
  '/curated': '/markets',
};

export default function AppShell({ children, user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggle: toggleTheme } = useTheme();
  const mainRef = useRef(null);
  const [pageKey, setPageKey] = useState(location.pathname);
  const [transitioning, setTransitioning] = useState(false);
  const prevPath = useRef(location.pathname);

  useEffect(() => {
    if (prevPath.current !== location.pathname) {
      setTransitioning(true);
      const timer = setTimeout(() => {
        setPageKey(location.pathname);
        setTransitioning(false);
        if (mainRef.current) mainRef.current.scrollTop = 0;
      }, 120);
      prevPath.current = location.pathname;
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  const navItems = [
    { label: 'Home',      icon: Home,               path: '/' },
    { label: 'Markets',   icon: TrendingUp,         path: '/markets' },
    { label: 'AI',        icon: Cpu,                path: '/ai' },
    { label: 'Analytics', icon: BarChart2,           path: '/analytics' },
    { label: 'Portfolio', icon: BriefcaseBusiness,   path: '/portfolio' },
    { label: 'News',      icon: Newspaper,           path: '/news' },
    { label: 'Learning',  icon: GraduationCap,       path: '/learning' },
  ];

  const isActive = useCallback((navPath) => {
    if (navPath === '/') return location.pathname === '/';
    if (location.pathname === navPath || location.pathname.startsWith(navPath + '/')) return true;
    // Check if current route maps to this nav tab
    for (const [route, parent] of Object.entries(ROUTE_PARENTS)) {
      if (location.pathname.startsWith(route) && parent === navPath) return true;
    }
    return false;
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen max-w-[430px] mx-auto" style={{ background: 'var(--bg)' }}>

      {/* ── HEADER (Frosted glass) ── */}
      <header className="glass-header sticky top-0 z-40 px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
        <button onClick={() => navigate('/')} className="flex items-center gap-2.5 bg-transparent border-none cursor-pointer p-0" aria-label="Go to home">
          <div className="w-[42px] h-[42px] rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'var(--navy)' }}>
            <span className="text-white text-[15px] font-bold font-head" style={{ direction: 'rtl', letterSpacing: '-0.5px' }}>أسهم</span>
          </div>
          <div className="flex flex-col text-left">
            <span className="font-head text-[15px] font-bold" style={{ color: 'var(--navy)', letterSpacing: '-0.3px' }}>Ashom</span>
            <span className="text-[11px] font-medium mt-px" style={{ color: 'var(--text-3)', letterSpacing: '0.2px' }}>GCC Financial Intelligence</span>
          </div>
        </button>

        <div className="flex items-center gap-2.5">
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
            aria-label="Toggle dark mode"
          >
            {isDark
              ? <Sun size={18} style={{ color: 'var(--text-2)' }} />
              : <Moon size={18} style={{ color: 'var(--text-2)' }} />}
          </button>
          <button
            onClick={() => navigate('/notifications')}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
            aria-label="Notifications"
          >
            <Bell size={18} style={{ color: 'var(--text-2)' }} />
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="w-9 h-9 rounded-full flex items-center justify-center font-head text-[13px] font-bold text-white"
            style={{ background: 'var(--navy)' }}
            aria-label="User settings"
          >
            {user?.initials ?? 'AS'}
          </button>
        </div>
      </header>

      {/* ── PAGE CONTENT ── */}
      <main ref={mainRef} className="flex-1 overflow-y-auto pb-24">
        <div
          key={pageKey}
          className={`transition-all duration-200 ease-out ${
            transitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
          }`}
        >
          {children}
        </div>
      </main>

      {/* ── BOTTOM NAVIGATION (Frosted glass) ── */}
      <nav
        className="glass-nav fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] flex z-40"
        style={{ borderTop: '1px solid var(--border)', padding: '8px 0 16px' }}
      >
        {navItems.map(({ label, icon: Icon, path }) => {
          const active = isActive(path);
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex-1 flex flex-col items-center gap-[3px] py-1"
            >
              <div
                className="w-[26px] h-[26px] rounded-lg flex items-center justify-center transition-all duration-150"
                style={active ? { background: 'var(--blue-light)' } : {}}
              >
                <Icon size={18} strokeWidth={2.2} style={{ color: active ? 'var(--blue)' : 'var(--text-3)' }} />
              </div>
              <span
                className="text-[10px] font-semibold"
                style={{ color: active ? 'var(--blue)' : 'var(--text-3)', letterSpacing: '0.2px' }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
