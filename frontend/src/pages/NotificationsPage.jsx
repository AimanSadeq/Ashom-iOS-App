import { useState } from 'react';
import {
  Trophy, FileText, Flame, TrendingUp,
  Bell, CheckCheck, Circle,
} from 'lucide-react';

import PageHeader from '../components/shared/PageHeader';

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    icon: Trophy,
    color: '#D97706',
    bg: '#FFFBEB',
    title: 'Achievement Unlocked',
    message: 'You earned "Navigator" - Visit 5 different pages',
    time: '2 min ago',
    read: false,
  },
  {
    id: 2,
    icon: FileText,
    color: 'var(--blue)',
    bg: 'var(--blue-light)',
    title: 'Earnings Report Available',
    message: 'Saudi Aramco Q4 2025 earnings report is now available for review.',
    time: '1 hour ago',
    read: false,
  },
  {
    id: 3,
    icon: Flame,
    color: 'var(--red)',
    bg: 'var(--red-bg)',
    title: 'Streak at Risk!',
    message: 'Your 7-day streak is at risk! Log in tomorrow to keep it alive.',
    time: '3 hours ago',
    read: false,
  },
  {
    id: 4,
    icon: TrendingUp,
    color: 'var(--green)',
    bg: 'var(--green-bg)',
    title: 'Portfolio Update',
    message: 'Your portfolio value increased by 2.3% today. Saudi Aramco up 1.8%.',
    time: '5 hours ago',
    read: true,
  },
  {
    id: 5,
    icon: Bell,
    color: '#7C3AED',
    bg: '#F5F3FF',
    title: 'Market Alert',
    message: 'Gold price crossed $2,350/oz. Your metals allocation is up 0.8%.',
    time: '8 hours ago',
    read: true,
  },
  {
    id: 6,
    icon: Trophy,
    color: '#D97706',
    bg: '#FFFBEB',
    title: 'Achievement Unlocked',
    message: 'You earned "Metal Watcher" - Visit the precious metals page.',
    time: '1 day ago',
    read: true,
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const toggleRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  return (
    <div className="animate-fade-in" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <PageHeader title="Notifications" backTo="/" />

      <div style={{ padding: '16px' }}>
        {/* Header bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <p style={{ fontSize: 12, color: 'var(--text-3)', margin: 0, fontFamily: 'var(--font-body)' }}>
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
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
              <CheckCheck size={12} /> Mark all as read
            </button>
          )}
        </div>

        {/* Sample notice */}
        <p style={{ fontSize: 11, color: 'var(--text-3)', fontStyle: 'italic', margin: '0 0 10px 4px', fontFamily: 'var(--font-body)' }}>
          Sample notifications — real-time alerts coming soon
        </p>

        {/* Notification list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {notifications.map((notif) => {
            const Icon = notif.icon;
            return (
              <button
                key={notif.id}
                onClick={() => toggleRead(notif.id)}
                style={{
                  width: '100%',
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderLeft: notif.read ? '1px solid var(--border)' : '3px solid var(--blue)',
                  borderRadius: 'var(--r-md)',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  textAlign: 'left',
                  cursor: 'pointer',
                  opacity: notif.read ? 0.6 : 1,
                  fontFamily: 'var(--font-body)',
                  transition: 'opacity 0.2s',
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 'var(--r-sm)',
                    background: notif.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  <Icon size={16} style={{ color: notif.color }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{notif.title}</span>
                    {!notif.read && <Circle size={6} style={{ color: 'var(--blue)', fill: 'var(--blue)', flexShrink: 0 }} />}
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--text-2)', margin: '3px 0 0', lineHeight: 1.5 }}>{notif.message}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-3)', margin: '4px 0 0' }}>{notif.time}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ height: 24 }} />
    </div>
  );
}
