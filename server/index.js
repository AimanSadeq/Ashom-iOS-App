// VIFM Server - Main Entry Point
//
// `override: false` (the default) is intentional: platform-provided environment
// variables (Render, Docker, CI) must win over a local .env file. With
// override:true a stale .env silently shadowed real deployment config — e.g.
// `PORT=3111 node server/index.js` would still bind to the .env port.
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');

// Import routes
const authRouter = require('./routes/auth');
const companiesRouter = require('./routes/companies');
const comparisonsRouter = require('./routes/comparisons');
const reportsRouter = require('./routes/reports');
const screenerRouter = require('./routes/screener');
const analyticsRouter = require('./routes/analytics');
const commoditiesRouter = require('./routes/commodities');
const coingeckoRouter = require('./routes/coingecko');
const newsRouter = require('./routes/news');
const analystRouter = require('./routes/analyst');
const ingestRouter = require('./routes/ingest');
const quantRouter = require('./routes/quant');
const certificatesRouter = require('./routes/certificates');
const universityRouter = require('./routes/university');
const preferencesRouter = require('./routes/preferences');
const rateLimit = require('./middleware/rateLimit');
const { supabase } = require('./supabaseClient');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Trust the platform reverse proxy (Render/Heroku/nginx) so req.ip is the real
// client address. Without this every request reports the proxy's IP, which
// collapses all callers into a single rate-limit bucket — simultaneously
// locking out legitimate users and failing to stop a single abuser.
app.set('trust proxy', 1);

// Make the Supabase client reachable via req.app.get('supabase').
// routes/certificates.js has always read this key; it was never set, so
// certificate storage silently no-opped and verification always failed.
app.set('supabase', supabase);

// Middleware
app.use(helmet({
  // Content-Security-Policy is enabled. Tokens live in localStorage, so an XSS
  // is a session-theft bug — CSP is the main mitigation. 'unsafe-inline' for
  // styles is required by the inline style objects used throughout the React
  // pages; tightening that further means migrating those to classes first.
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'self'"],
      baseUri: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// CORS: `origin: '*'` together with `credentials: true` is an invalid
// combination — browsers reject credentialed requests to a wildcard origin.
// Send credentials only when an explicit allowlist is configured.
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim()).filter(Boolean)
  : null;

app.use(cors(
  corsOrigins
    ? { origin: corsOrigins, credentials: true }
    : { origin: '*', credentials: false }
));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Caching policy.
//
// This used to send `no-store` for EVERY response plus `Clear-Site-Data: "cache"`
// on HTML — a development workaround that shipped to production. It forced a
// re-download of the ~1 MB JS bundle on every single navigation.
//
// CRA emits content-hashed filenames (main.<hash>.js), so those are safe to
// cache immutably: a new build produces a new filename. Only HTML and API
// responses must stay fresh.
const HASHED_ASSET = /\.[0-9a-f]{8,}\.(js|css|woff2?|png|jpe?g|svg|gif|ico)$/i;

app.use((req, res, next) => {
  const isApi = req.path.startsWith('/api/');
  const isHtml = req.path === '/' || req.path.endsWith('.html');

  if (isApi || isHtml) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  } else if (HASHED_ASSET.test(req.path)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  } else {
    // Unhashed static assets: revalidate but allow reuse.
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
  }
  next();
});

// In production, serve React build; in development, serve legacy HTML
const reactBuildPath = path.join(__dirname, '..', 'frontend', 'build');
const legacyPath = path.join(__dirname, '..');
const fs = require('fs');
const serveFrontendBuild = fs.existsSync(reactBuildPath);

if (serveFrontendBuild) {
  // Production: serve React build. Cache-Control is set by the middleware
  // above, so express.static must not override it with its own maxAge.
  app.use(express.static(reactBuildPath));
} else {
  // Fallback: serve legacy static files.
  //
  // WARNING: the repository root contains admin consoles (admin-upload.html,
  // 37_Admin_University.html). Serving the whole root exposes them. This branch
  // only runs when frontend/build is missing — i.e. a misconfigured deploy —
  // so treat a missing build as a deployment failure, not a fallback.
  console.warn('⚠️  frontend/build not found — serving repository root. Do not run this in production.');
  app.use(express.static(legacyPath, { etag: false, lastModified: false, maxAge: 0 }));
}

// Rate limits.
// Authentication endpoints are the credential-stuffing and mail-bombing
// surface; the analyst endpoints spend money against the server's Anthropic
// key and carry no authentication of their own.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many authentication attempts. Please try again in a few minutes.'
});

const analystLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Rate limit exceeded. Please wait a moment before trying again.'
});

const apiLimiter = rateLimit({ windowMs: 60 * 1000, max: 300 });

app.use('/api/', apiLimiter);

// API Routes
app.use('/api/auth', authLimiter, authRouter);
app.use('/api/companies', companiesRouter);
app.use('/api/comparisons', comparisonsRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/screener', screenerRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/commodities', commoditiesRouter);
app.use('/api/coingecko', coingeckoRouter);
app.use('/api/news', newsRouter);
app.use('/api/analyst', analystLimiter, analystRouter);
app.use('/api/ingest', ingestRouter);
app.use('/api/quant', quantRouter);
app.use('/api/certificates', certificatesRouter);
app.use('/api/university', universityRouter);
app.use('/api/preferences', preferencesRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.APP_VERSION || '1.0.0'
  });
});

// Unmatched API routes must 404 as JSON.
//
// This has to sit BEFORE the SPA catch-all. Previously an unknown /api/* path
// fell through to the catch-all and returned HTTP 200 with index.html, so
// clients could not distinguish "endpoint does not exist" from "success". The
// Flutter app calls /api/indices, /api/movers and /api/quote/* — none of which
// exist — got 200 HTML, failed to parse it, and silently fell back to mock
// data with no error surfaced to the user.
app.use('/api', (req, res) => {
  res.status(404).json({
    error: {
      message: `No API endpoint matches ${req.method} ${req.originalUrl}`,
      status: 404
    }
  });
});

// Catch-all: serve React index.html for client-side routing (or legacy index)
app.get('*', (req, res) => {
  if (serveFrontendBuild) {
    res.sendFile(path.join(reactBuildPath, 'index.html'));
  } else {
    res.sendFile(path.join(legacyPath, 'index.html'));
  }
});

// Error handling middleware.
// Internal error text and stack traces stay in the server log; clients get a
// generic message in production so implementation details aren't disclosed.
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  const status = err.status || 500;
  console.error(`Error ${status} on ${req.method} ${req.originalUrl}:`, err.stack || err.message);

  const isClientError = status >= 400 && status < 500;
  const exposeMessage = isClientError || process.env.NODE_ENV !== 'production';

  res.status(status).json({
    error: {
      message: exposeMessage ? (err.message || 'Request failed') : 'Internal Server Error',
      status
    }
  });
});

// Start server - Listen on all network interfaces (0.0.0.0) to allow phone access
const HOST = '0.0.0.0';
const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 Ashom/VIFM server listening on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Frontend:    ${serveFrontendBuild ? 'React build' : 'LEGACY STATIC ROOT (misconfigured)'}`);

  // Startup configuration checks. These previously failed silently at runtime:
  // an invalid Anthropic key surfaced only as a 401 inside an SSE stream, and a
  // missing ADMIN_PASSWORD fell back to a value hardcoded in the source.
  if (!process.env.ADMIN_PASSWORD) {
    console.warn('⚠️  ADMIN_PASSWORD is not set — /api/ingest/* admin endpoints are disabled.');
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('⚠️  ANTHROPIC_API_KEY is not set — AI Analyst endpoints will return 503.');
  }
  if (!process.env.CORS_ORIGIN) {
    console.warn('⚠️  CORS_ORIGIN is not set — running with open CORS and credentials disabled.');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

module.exports = app;
