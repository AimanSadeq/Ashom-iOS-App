import { useState } from 'react';
import { Bell, BellOff, TrendingUp, TrendingDown, DollarSign, Newspaper, Award, Check, Lock, Calendar, Briefcase, AtSign, Send } from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';
import useSubscription from '../hooks/useSubscription';
import usePushNotifications from '../hooks/usePushNotifications';

const NOTIFICATION_TYPES = [
  { key: 'priceAlerts',      label: 'Price Alerts',         desc: 'When a watched company hits your target price',  icon: Bell,         color: 'var(--green)',  bg: 'var(--green-bg)' },
  { key: 'earnings',         label: 'Earnings Reports',     desc: 'Quarterly and annual earnings announcements',    icon: Calendar,     color: 'var(--blue)',   bg: 'var(--blue-light)' },
  { key: 'dividends',        label: 'Dividend Dates',       desc: 'Ex-dividend and payment date reminders',         icon: DollarSign,   color: '#7C3AED',      bg: '#F5F3FF' },
  { key: 'portfolioUpdates', label: 'Portfolio Updates',     desc: 'When your portfolio value changes significantly', icon: Briefcase,   color: 'var(--blue)',   bg: 'var(--blue-light)' },
  { key: 'news',             label: 'News Alerts',          desc: 'Major GCC market news and announcements',        icon: Newspaper,    color: 'var(--red)',    bg: 'var(--red-bg)' },
  { key: 'socialMentions',   label: 'Social Mentions',      desc: 'When companies you follow are mentioned online', icon: AtSign,       color: '#D97706',      bg: '#FFFBEB' },
];

function Toggle({ on, onToggle }) {
  return (
    <button
      onClick={onToggle}
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
        flexShrink: 0,
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

function PermissionBadge({ permission }) {
  const config = {
    granted: { label: 'Granted', color: 'var(--green)', bg: 'var(--green-bg)' },
    denied:  { label: 'Blocked', color: 'var(--red)',   bg: 'var(--red-bg)' },
    default: { label: 'Not Asked', color: 'var(--text-3)', bg: 'var(--bg)' },
  };
  const c = config[permission] || config.default;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontSize: 10,
        fontWeight: 600,
        fontFamily: 'var(--font-head)',
        color: c.color,
        background: c.bg,
        padding: '3px 8px',
        borderRadius: 'var(--r-sm)',
      }}
    >
      {permission === 'granted' && <Check size={10} />}
      {c.label}
    </span>
  );
}

export default function NotificationSettingsPage() {
  const { canUseFeature } = useSubscription();
  const { permission, prefs, requestPermission, sendNotification, updatePref } = usePushNotifications();
  const [testSent, setTestSent] = useState(false);

  const hasAccess = canUseFeature('pushNotifications');

  function handleToggleMaster() {
    if (prefs.enabled) {
      updatePref('enabled', false);
    } else {
      requestPermission().then(result => {
        if (result === 'granted') {
          updatePref('enabled', true);
        }
      });
    }
  }

  function handleTestNotification() {
    sendNotification('VIFM Test Notification', {
      body: 'Push notifications are working correctly!',
    });
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  }

  if (!hasAccess) {
    return (
      <div className="animate-fade-in" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
        <PageHeader title="Notifications" subtitle="Push notification settings" backTo="/settings" />
        <div style={{ padding: '48px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 'var(--r-lg)',
              background: 'var(--blue-light)',
              border: '1px solid var(--blue-mid)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}
          >
            <Lock size={22} style={{ color: 'var(--blue)' }} />
          </div>
          <p style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 16, color: 'var(--text-1)', margin: '0 0 4px' }}>Starter Feature</p>
          <p style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center', maxWidth: 240, lineHeight: 1.5 }}>
            Push notifications are available on Starter ($9.99/mo) and above.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <PageHeader title="Notifications" subtitle="Push notification settings" backTo="/settings" />

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Master toggle */}
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-md)',
            padding: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--r-sm)',
                background: prefs.enabled ? 'var(--green-bg)' : 'var(--bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {prefs.enabled
                ? <Bell size={18} style={{ color: 'var(--green)' }} />
                : <BellOff size={18} style={{ color: 'var(--text-3)' }} />
              }
            </div>
            <div>
              <p style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 14, color: 'var(--text-1)', margin: 0 }}>Push Notifications</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                <PermissionBadge permission={permission} />
              </div>
            </div>
          </div>
          <Toggle on={prefs.enabled} onToggle={handleToggleMaster} />
        </div>

        {/* Permission denied warning */}
        {permission === 'denied' && (
          <div
            style={{
              background: 'var(--red-bg)',
              border: '1px solid var(--red)',
              borderRadius: 'var(--r-md)',
              padding: '10px 14px',
            }}
          >
            <p style={{ fontSize: 11, color: 'var(--red)', margin: 0, lineHeight: 1.5 }}>
              Notifications are blocked by your browser. Please enable them in your browser settings and refresh the page.
            </p>
          </div>
        )}

        {/* Individual notification types */}
        {prefs.enabled && (
          <>
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
              Notification Types
            </p>
            <div
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-md)',
                overflow: 'hidden',
              }}
            >
              {NOTIFICATION_TYPES.map((nt, i) => {
                const Icon = nt.icon;
                return (
                  <div
                    key={nt.key}
                    style={{
                      padding: '13px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      borderBottom: i < NOTIFICATION_TYPES.length - 1 ? '1px solid var(--border)' : 'none',
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 'var(--r-sm)',
                        background: nt.bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={16} style={{ color: nt.color }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', margin: 0 }}>{nt.label}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-3)', margin: '1px 0 0' }}>{nt.desc}</p>
                    </div>
                    <Toggle on={prefs[nt.key]} onToggle={() => updatePref(nt.key, !prefs[nt.key])} />
                  </div>
                );
              })}
            </div>

            {/* Test Notification button */}
            <button
              onClick={handleTestNotification}
              disabled={permission !== 'granted'}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                width: '100%',
                padding: '12px 16px',
                borderRadius: 'var(--r-md)',
                border: '1px solid var(--border)',
                background: testSent ? 'var(--green-bg)' : 'var(--card)',
                color: testSent ? 'var(--green)' : 'var(--navy)',
                fontFamily: 'var(--font-head)',
                fontSize: 12,
                fontWeight: 600,
                cursor: permission === 'granted' ? 'pointer' : 'not-allowed',
                opacity: permission === 'granted' ? 1 : 0.5,
                transition: 'all 0.2s',
              }}
            >
              {testSent ? <Check size={14} /> : <Send size={14} />}
              {testSent ? 'Notification Sent' : 'Send Test Notification'}
            </button>
          </>
        )}

        <p style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'center', fontFamily: 'var(--font-body)' }}>
          Notifications are delivered via browser push. Make sure to allow notifications in your browser settings.
        </p>
      </div>
    </div>
  );
}
