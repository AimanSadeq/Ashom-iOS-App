import { useState, useEffect, useCallback, useRef } from 'react';
import { preferences } from '../services/api';

const STORAGE_KEY = 'vifm-home-pinned';

// Migrate old format (string array) to new format (object array)
function migrate(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map(item => {
    if (typeof item === 'string') {
      return { id: 'section-' + item, type: 'section', sectionId: item };
    }
    return item;
  });
}

function loadPins() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (raw) return migrate(raw);
  } catch { /* ignore */ }
  return [];
}

function savePinsLocal(pins) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pins));
}

// Cross-tab sync: listen for storage changes from other tabs
function useStorageSync(setPins) {
  useEffect(() => {
    function onStorage(e) {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setPins(migrate(JSON.parse(e.newValue)));
        } catch { /* ignore */ }
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [setPins]);
}

export default function usePin() {
  const [pins, setPins] = useState(loadPins);
  const saveTimer = useRef(null);
  const skipNextSync = useRef(true); // skip first useEffect([pins]) fire

  // Cross-tab sync
  useStorageSync(setPins);

  // On pin change: save to localStorage immediately, debounce save to server
  useEffect(() => {
    // Always keep localStorage in sync
    savePinsLocal(pins);

    // Skip the initial mount — don't push to server on load
    if (skipNextSync.current) {
      skipNextSync.current = false;
      return;
    }

    const token = localStorage.getItem('auth_token');
    if (!token) return;

    // Debounce server save by 1 second
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      preferences.savePins(pins).catch(() => {});
    }, 1000);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [pins]);

  const addPin = useCallback((pin) => {
    setPins(prev => {
      if (prev.some(p => p.id === pin.id)) return prev;
      return [...prev, pin];
    });
  }, []);

  const removePin = useCallback((id) => {
    setPins(prev => prev.filter(p => p.id !== id));
  }, []);

  const isPinned = useCallback((id) => {
    return pins.some(p => p.id === id);
  }, [pins]);

  const reorderPins = useCallback((index, direction) => {
    setPins(prev => {
      const next = [...prev];
      const newIdx = index + direction;
      if (newIdx < 0 || newIdx >= next.length) return prev;
      [next[index], next[newIdx]] = [next[newIdx], next[index]];
      return next;
    });
  }, []);

  // Helper to create pin objects
  const createPin = useCallback((type, data) => {
    switch (type) {
      case 'section':
        return { id: 'section-' + data.sectionId, type: 'section', sectionId: data.sectionId };
      case 'company':
        return {
          id: 'company-' + data.companyId,
          type: 'company',
          label: data.name,
          subtitle: [data.ticker, data.sector].filter(Boolean).join(' · '),
          route: '/companies/' + data.companyId,
          color: 'blue',
          iconName: 'Building2',
        };
      case 'tool':
        return {
          id: 'tool-' + data.route.replace(/\//g, '-'),
          type: 'tool',
          label: data.label,
          subtitle: data.subtitle || '',
          route: data.route,
          color: data.color || 'blue',
          iconName: data.iconName || 'Zap',
        };
      case 'crypto':
        return {
          id: 'crypto-' + data.symbol,
          type: 'crypto',
          label: data.name,
          subtitle: data.symbol,
          route: '/crypto',
          color: 'teal',
        };
      case 'metal':
        return {
          id: 'metal-' + data.symbol,
          type: 'metal',
          label: data.name,
          subtitle: data.symbol,
          route: '/metals',
          color: 'amber',
        };
      default:
        return { id: 'custom-' + Date.now(), type: 'custom', ...data };
    }
  }, []);

  return { pins, addPin, removePin, isPinned, reorderPins, createPin };
}
