import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'vifm-push-prefs';

const DEFAULT_PREFS = {
  enabled: false,
  priceAlerts: true,
  earnings: true,
  dividends: true,
  portfolioUpdates: true,
  news: false,
  socialMentions: false,
};

export default function usePushNotifications() {
  const [permission, setPermission] = useState(
    typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'default'
  );
  const [prefs, setPrefs] = useState(() => {
    try {
      return { ...DEFAULT_PREFS, ...JSON.parse(localStorage.getItem(STORAGE_KEY)) };
    } catch {
      return DEFAULT_PREFS;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  }, [prefs]);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return 'unsupported';
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === 'granted') setPrefs(p => ({ ...p, enabled: true }));
    return result;
  }, []);

  const sendNotification = useCallback((title, options = {}) => {
    if (permission !== 'granted' || !prefs.enabled) return;
    try {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });
    } catch {
      /* silent fail on mobile */
    }
  }, [permission, prefs.enabled]);

  const updatePref = useCallback((key, value) => {
    setPrefs(p => ({ ...p, [key]: value }));
  }, []);

  return { permission, prefs, requestPermission, sendNotification, updatePref };
}
