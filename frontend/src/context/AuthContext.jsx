import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      auth.getUser()
        .then(res => {
          setUser(res.user || res);
        })
        .catch(() => {
          localStorage.removeItem('auth_token');
        })
        .finally(() => setLoading(false));
    } else {
      // Demo user fallback — set demo token so preferences sync works
      localStorage.setItem('auth_token', 'demo-token');
      setUser({
        name: 'Aiman Sadeq',
        initials: 'AS',
        email: 'demo@vifm.com',
        title: 'VP Analyst',
        level: 4,
        rank: 'VP',
        xp: 530,
        xpMax: 900,
        streak: 2,
        missions: '4/25',
      });
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await auth.login(email, password);
    if (res.token) localStorage.setItem('auth_token', res.token);
    setUser(res.user || { email, name: email.split('@')[0], initials: email.substring(0, 2).toUpperCase() });
    return res;
  };

  const signup = async (data) => {
    const res = await auth.signup(data);
    if (res.token) localStorage.setItem('auth_token', res.token);
    setUser(res.user);
    return res;
  };

  const logout = async () => {
    try { await auth.logout(); } catch (e) {}
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
