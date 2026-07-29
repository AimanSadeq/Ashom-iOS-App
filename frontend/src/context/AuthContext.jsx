import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');

    // No token means signed out. It must NOT mean "mint one and pretend".
    // This branch previously wrote a literal 'demo-token' that the server
    // accepted as a valid — and administrative — session.
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    auth.getUser()
      .then(res => {
        setUser(res.user || res);
      })
      .catch(() => {
        localStorage.removeItem('auth_token');
        setUser(null);
      })
      .finally(() => setLoading(false));
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
