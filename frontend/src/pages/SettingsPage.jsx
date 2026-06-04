import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Shield, CreditCard, Mail, Bell, BarChart3,
  Globe, Banknote, Palette, HelpCircle, Bug, Info,
  ChevronRight, LogOut, Key, Building2, LayoutDashboard, Moon,
} from 'lucide-react';

import PageHeader from '../components/shared/PageHeader';
import { useAuth } from '../context/AuthContext';
import useTheme from '../hooks/useTheme';

const ICON_COLORS = {
  'Personal Info': { bg: '#EAF2FC', fg: '#5391D5' },
  'Security & Privacy': { bg: '#F0EEFE', fg: '#7C5FDB' },
  'Subscription': { bg: '#FFF8E6', fg: '#F2A600' },
  'API Access': { bg: '#E3F6F5', fg: '#00A8A0' },
  'White Label': { bg: '#EAEBF7', fg: '#010131' },
  'Custom Dashboard': { bg: '#FFF5ED', fg: '#FF8A35' },
  'Notification Settings': { bg: '#FFF0F3', fg: '#FF4B6E' },
  'Email Notifications': { bg: '#E6FAF5', fg: '#00C896' },
  'Market Alerts': { bg: '#FFF8E6', fg: '#F2A600' },
  'Dark Mode': { bg: '#EAEBF7', fg: '#010131' },
  'Language': { bg: '#EAF2FC', fg: '#5391D5' },
  'Currency': { bg: '#E6FAF5', fg: '#00C896' },
  'Theme': { bg: '#F0EEFE', fg: '#7C5FDB' },
  'Help Center': { bg: '#E6FAF5', fg: '#00C896' },
  'Report a Bug': { bg: '#FFF0F3', fg: '#FF4B6E' },
  'About': { bg: '#EAF2FC', fg: '#5391D5' },
};

const SECTIONS = [
  {
    title: 'Account',
    items: [
      { icon: User, label: 'Personal Info', subtitle: 'Name, phone, address' },
      { icon: Shield, label: 'Security & Privacy', subtitle: 'Password, 2FA, sessions' },
      { icon: CreditCard, label: 'Subscription', subtitle: 'Plan, billing, invoices', path: '/pricing' },
    ],
  },
  {
    title: 'Premium Features',
    items: [
      { icon: Key, label: 'API Access', subtitle: 'Developer tools & docs', path: '/api-access' },
      { icon: Building2, label: 'White Label', subtitle: 'Branded reports', path: '/white-label' },
      { icon: LayoutDashboard, label: 'Custom Dashboard', subtitle: 'Build your view', path: '/dashboard' },
    ],
  },
  {
    title: 'Notifications',
    items: [
      { icon: Bell, label: 'Notification Settings', subtitle: 'Configure push alerts', path: '/notification-settings' },
      { icon: Mail, label: 'Email Notifications', subtitle: 'Weekly digest, reports', toggle: true, defaultOn: true },
      { icon: BarChart3, label: 'Market Alerts', subtitle: 'Price movements, earnings', toggle: true, defaultOn: false },
    ],
  },
  {
    title: 'Preferences',
    items: [
      { icon: Moon, label: 'Dark Mode', subtitle: 'Switch to dark theme', toggle: true, defaultOn: false, themeToggle: true },
      { icon: Globe, label: 'Language', subtitle: 'English' },
      { icon: Banknote, label: 'Currency', subtitle: 'USD' },
      { icon: Palette, label: 'Theme', subtitle: 'Light' },
    ],
  },
  {
    title: 'Support',
    items: [
      { icon: HelpCircle, label: 'Help Center', subtitle: 'FAQs, guides, tutorials' },
      { icon: Bug, label: 'Report a Bug', subtitle: 'Send feedback to our team' },
      { icon: Info, label: 'About', subtitle: 'Version 2.0.0' },
    ],
  },
];

function ToggleSwitch({ defaultOn = false }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      onClick={(e) => { e.stopPropagation(); setOn(!on); }}
      style={{
        width: 44,
        height: 26,
        borderRadius: 13,
        background: on ? 'var(--green)' : 'var(--border)',
        border: 'none',
        cursor: 'pointer',
        padding: 2,
        display: 'flex',
        alignItems: 'center',
        transition: 'background 0.2s',
      }}
    >
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: '#fff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
          transition: 'transform 0.2s',
          transform: on ? 'translateX(18px)' : 'translateX(0)',
        }}
      />
    </button>
  );
}

function ThemeToggle() {
  const { isDark, toggle } = useTheme();
  return (
    <button
      onClick={(e) => { e.stopPropagation(); toggle(); }}
      style={{
        width: 44,
        height: 26,
        borderRadius: 13,
        background: isDark ? 'var(--green)' : 'var(--border)',
        border: 'none',
        cursor: 'pointer',
        padding: 2,
        display: 'flex',
        alignItems: 'center',
        transition: 'background 0.2s',
      }}
    >
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: '#fff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
          transition: 'transform 0.2s',
          transform: isDark ? 'translateX(18px)' : 'translateX(0)',
        }}
      />
    </button>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const displayName = user?.name || 'User';
  const displayEmail = user?.email || '';
  const initials = user?.initials || displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="animate-fade-in" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <PageHeader title="Settings" backTo="/" />

      {/* Profile card */}
      <div style={{ padding: '20px 16px 0' }}>
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-md)',
            padding: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: 'var(--navy)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontFamily: 'var(--font-head)',
              fontWeight: 700,
              fontSize: 16,
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 15, color: 'var(--text-1)', margin: 0 }}>
              {displayName}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-3)', margin: '2px 0 0' }}>{displayEmail}</p>
          </div>
          <button
            style={{
              padding: '7px 14px',
              fontSize: 12,
              fontWeight: 600,
              fontFamily: 'var(--font-body)',
              color: 'var(--navy)',
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-sm)',
              cursor: 'pointer',
            }}
          >
            Edit
          </button>
        </div>
      </div>

      {/* Settings sections */}
      <div style={{ padding: '20px 16px 0' }}>
        {SECTIONS.map((section, si) => (
          <div key={section.title} style={{ marginBottom: 24 }}>
            <p
              style={{
                fontFamily: 'var(--font-head)',
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1.2px',
                color: 'var(--text-3)',
                margin: '0 0 8px 4px',
              }}
            >
              {section.title}
            </p>
            <div
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-md)',
                overflow: 'hidden',
              }}
            >
              {section.items.map((item, i) => {
                const Tag = item.toggle ? 'div' : 'button';
                return (
                  <Tag
                    key={item.label}
                    onClick={() => item.path && navigate(item.path)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '13px 16px',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: i < section.items.length - 1 ? '1px solid var(--border)' : 'none',
                      cursor: item.path || item.toggle ? 'pointer' : 'default',
                      textAlign: 'left',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 'var(--r-sm)',
                        background: ICON_COLORS[item.label]?.bg || 'var(--bg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <item.icon size={15} style={{ color: ICON_COLORS[item.label]?.fg || 'var(--text-2)' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', margin: 0 }}>{item.label}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-3)', margin: '1px 0 0' }}>{item.subtitle}</p>
                    </div>
                    {item.themeToggle ? (
                      <ThemeToggle />
                    ) : item.toggle ? (
                      <ToggleSwitch defaultOn={item.defaultOn} />
                    ) : (
                      <ChevronRight size={14} style={{ color: 'var(--text-3)' }} />
                    )}
                  </Tag>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Logout */}
      <div style={{ padding: '0 16px' }}>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-md)',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
          }}
        >
          <LogOut size={14} style={{ color: 'var(--red)' }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--red)' }}>Log Out</span>
        </button>
      </div>

      <div style={{ height: 24 }} />
    </div>
  );
}
