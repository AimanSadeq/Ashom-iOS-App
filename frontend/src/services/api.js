// Central API service — all fetch calls go through here
// In dev, CRA proxy forwards /api to Express backend
// In production, set REACT_APP_API_URL to your backend URL

const API_BASE = process.env.REACT_APP_API_URL || '';

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const token = localStorage.getItem('auth_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || `API error ${res.status}`);
  }

  return res.json();
}

// Auth
export const auth = {
  login: (email, password) => request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  signup: (data) => request('/api/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
  getUser: () => request('/api/auth/user'),
  resetPassword: (email) => request('/api/auth/reset-password', { method: 'POST', body: JSON.stringify({ email }) }),
  updatePassword: (password, token) => request('/api/auth/update-password', {
    method: 'POST',
    body: JSON.stringify({ password }),
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  }),
};

// Companies
export const companies = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/companies${qs ? '?' + qs : ''}`);
  },
  get: (id) => request(`/api/companies/${id}`),
  coverage: () => request('/api/companies/stats/coverage'),
};

// Screener
export const screener = {
  search: (filters) => request('/api/screener', { method: 'POST', body: JSON.stringify(filters) }),
};

// Analytics
export const analytics = {
  types: () => request('/api/analytics/types'),
  metrics: () => request('/api/analytics/metrics'),
  industries: () => request('/api/analytics/industries'),
  industry: (name) => request(`/api/analytics/industries/${encodeURIComponent(name)}`),
};

// Comparisons
export const comparisons = {
  create: (data) => request('/api/comparisons', { method: 'POST', body: JSON.stringify(data) }),
  list: () => request('/api/comparisons'),
  generate: (data) => request('/api/comparisons/generate', { method: 'POST', body: JSON.stringify(data) }),
};

// Reports
export const reports = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/reports${qs ? '?' + qs : ''}`);
  },
  get: (id) => request(`/api/reports/${id}`),
};

// Market Data
export const markets = {
  commodities: () => request('/api/commodities/yahoo'),
  crypto: (ids) => request(`/api/coingecko/crypto?ids=${ids}`),
};

// News
export const news = {
  list: (category = 'all') => request(`/api/news?category=${category}`),
  article: (url) => request(`/api/news/article?url=${encodeURIComponent(url)}`),
};

// SSE stream helper — used by AI Analyst endpoints that return text/event-stream
async function streamSSE(path, body) {
  const url = `${API_BASE}${path}`;
  const token = localStorage.getItem('auth_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });

  // Non-streaming error responses (503, 429, 400) return JSON
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.error || error.message || `API error ${res.status}`);
  }

  // Check if response is JSON (fallback) rather than SSE
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return res.json();
  }

  // Parse SSE stream — collect all text events into a single message
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // Process complete events (separated by \n\n)
    const events = buffer.split('\n\n');
    buffer = events.pop(); // Keep incomplete event in buffer

    for (const event of events) {
      const line = event.trim();
      if (!line.startsWith('data: ')) continue;
      try {
        const parsed = JSON.parse(line.slice(6));
        if (parsed.type === 'text' && parsed.content) {
          fullText += parsed.content;
        }
        // Ignore tool_start, tool_complete, done events
      } catch { /* skip unparseable lines */ }
    }
  }

  return { message: fullText || 'No response generated.' };
}

// AI Analyst
export const analyst = {
  analyze: (data) => streamSSE('/api/analyst/analyze', data),
  chat: (data) => streamSSE('/api/analyst/chat', data),
};

// Quant
export const quant = {
  companies: () => request('/api/quant/companies'),
  priceHistory: (symbol) => request(`/api/quant/price-history/${symbol}`),
  factorReturns: () => request('/api/quant/factor-returns'),
  macroData: () => request('/api/quant/macro-data'),
  correlationMatrix: () => request('/api/quant/correlation-matrix'),
  factorModel: (data) => request('/api/quant/factor-model', { method: 'POST', body: JSON.stringify(data) }),
  regression: (data) => request('/api/quant/regression', { method: 'POST', body: JSON.stringify(data) }),
  var: (data) => request('/api/quant/var', { method: 'POST', body: JSON.stringify(data) }),
  riskMetrics: (data) => request('/api/quant/risk-metrics', { method: 'POST', body: JSON.stringify(data) }),
  optimize: (data) => request('/api/quant/optimize', { method: 'POST', body: JSON.stringify(data) }),
  valuation: (data) => request('/api/quant/valuation', { method: 'POST', body: JSON.stringify(data) }),
  scoring: (data) => request('/api/quant/scoring', { method: 'POST', body: JSON.stringify(data) }),
  vision2030: (data) => request('/api/quant/vision2030', { method: 'POST', body: JSON.stringify(data) }),
  relativeValue: (data) => request('/api/quant/relative-value', { method: 'POST', body: JSON.stringify(data) }),
};

// University
export const university = {
  partners: () => request('/api/university/partners'),
  courses: () => request('/api/university/courses'),
  course: (slug) => request(`/api/university/courses/${slug}`),
  enroll: (data) => request('/api/university/enroll', { method: 'POST', body: JSON.stringify(data) }),
  enrollment: () => request('/api/university/enrollment'),
  syncProgress: (data) => request('/api/university/progress/sync', { method: 'POST', body: JSON.stringify(data) }),
  progress: () => request('/api/university/progress'),
};

// Certificates
export const certificates = {
  issue: (data) => request('/api/certificates', { method: 'POST', body: JSON.stringify(data) }),
  verify: (code) => request(`/api/certificates/verify/${code}`),
};

// User Preferences
export const preferences = {
  getPins: () => request('/api/preferences/pins'),
  savePins: (pins) => request('/api/preferences/pins', { method: 'PUT', body: JSON.stringify({ pins }) }),
};

// Health
export const health = () => request('/api/health');
