import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'vifm-subscription';

const PLANS = {
  free:       { id: 'free',       name: 'Free',       price: 0,     watchlistLimit: 10, aiQueriesPerDay: 5,  portfolioLimit: 1,  apiCallsPerDay: 0,     hasAlerts: false, hasPdfReports: false, hasExcelExport: false, hasWhiteLabel: false, hasCustomDashboards: false, hasPushNotifications: false },
  starter:    { id: 'starter',    name: 'Starter',    price: 9.99,  watchlistLimit: 50, aiQueriesPerDay: 20, portfolioLimit: 3,  apiCallsPerDay: 0,     hasAlerts: true,  hasPdfReports: true,  hasExcelExport: false, hasWhiteLabel: false, hasCustomDashboards: false, hasPushNotifications: true },
  pro:        { id: 'pro',        name: 'Pro',        price: 29.99, watchlistLimit: -1,  aiQueriesPerDay: -1, portfolioLimit: 10, apiCallsPerDay: 1000,  hasAlerts: true,  hasPdfReports: true,  hasExcelExport: true,  hasWhiteLabel: false, hasCustomDashboards: false, hasPushNotifications: true },
  enterprise: { id: 'enterprise', name: 'Enterprise', price: 99.99, watchlistLimit: -1,  aiQueriesPerDay: -1, portfolioLimit: -1, apiCallsPerDay: 10000, hasAlerts: true,  hasPdfReports: true,  hasExcelExport: true,  hasWhiteLabel: true,  hasCustomDashboards: true,  hasPushNotifications: true },
};

function loadSubscription() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { planId: 'free', billing: 'monthly', subscribedAt: null, aiQueriesUsedToday: 0, lastQueryDate: null };
}

function saveSubscription(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export { PLANS };

export default function useSubscription() {
  const [sub, setSub] = useState(loadSubscription);

  useEffect(() => { saveSubscription(sub); }, [sub]);

  const plan = PLANS[sub.planId] || PLANS.free;

  const upgrade = useCallback((planId, billing = 'monthly') => {
    setSub(prev => ({ ...prev, planId, billing, subscribedAt: new Date().toISOString() }));
  }, []);

  const downgrade = useCallback(() => {
    setSub(prev => ({ ...prev, planId: 'free', billing: 'monthly', subscribedAt: null }));
  }, []);

  // AI query tracking
  const today = new Date().toISOString().split('T')[0];
  const aiQueriesUsed = sub.lastQueryDate === today ? sub.aiQueriesUsedToday : 0;
  const aiQueriesRemaining = plan.aiQueriesPerDay === -1 ? Infinity : Math.max(0, plan.aiQueriesPerDay - aiQueriesUsed);

  const trackAiQuery = useCallback(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    setSub(prev => ({
      ...prev,
      aiQueriesUsedToday: prev.lastQueryDate === todayStr ? prev.aiQueriesUsedToday + 1 : 1,
      lastQueryDate: todayStr,
    }));
  }, []);

  const canUseFeature = useCallback((feature) => {
    switch (feature) {
      case 'alerts': return plan.hasAlerts;
      case 'pdfReports': return plan.hasPdfReports;
      case 'excelExport': return plan.hasExcelExport;
      case 'whiteLabel': return plan.hasWhiteLabel;
      case 'customDashboards': return plan.hasCustomDashboards;
      case 'pushNotifications': return plan.hasPushNotifications;
      case 'api': return plan.apiCallsPerDay > 0;
      default: return true;
    }
  }, [plan]);

  return {
    plan, planId: sub.planId, billing: sub.billing,
    upgrade, downgrade,
    aiQueriesUsed, aiQueriesRemaining, trackAiQuery,
    canUseFeature,
    watchlistLimit: plan.watchlistLimit,
    portfolioLimit: plan.portfolioLimit,
  };
}
