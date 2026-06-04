// VIFM Server - Main Entry Point
require('dotenv').config({ override: true });
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

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Disable caching for ALL files and clear stale service workers
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  // Clear browser cache on HTML page requests to prevent stale content
  if (req.path.endsWith('.html') || req.path === '/') {
    res.setHeader('Clear-Site-Data', '"cache"');
  }
  next();
});

// In production, serve React build; in development, serve legacy HTML
const reactBuildPath = path.join(__dirname, '..', 'frontend', 'build');
const legacyPath = path.join(__dirname, '..');
const fs = require('fs');
const serveFrontendBuild = fs.existsSync(reactBuildPath);

if (serveFrontendBuild) {
  // Production: serve React build
  app.use(express.static(reactBuildPath, { maxAge: '1d' }));
} else {
  // Fallback: serve legacy static files
  app.use(express.static(legacyPath, { etag: false, lastModified: false, maxAge: 0 }));
}

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/companies', companiesRouter);
app.use('/api/comparisons', comparisonsRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/screener', screenerRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/commodities', commoditiesRouter);
app.use('/api/coingecko', coingeckoRouter);
app.use('/api/news', newsRouter);
app.use('/api/analyst', analystRouter);
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

// Catch-all: serve React index.html for client-side routing (or legacy index)
app.get('*', (req, res) => {
  if (serveFrontendBuild) {
    res.sendFile(path.join(reactBuildPath, 'index.html'));
  } else {
    res.sendFile(path.join(legacyPath, 'index.html'));
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

// Start server - Listen on all network interfaces (0.0.0.0) to allow phone access
const HOST = '0.0.0.0';
const server = app.listen(PORT, HOST, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🚀 VIFM Server Started Successfully!                    ║
║                                                            ║
║   Environment: ${process.env.NODE_ENV || 'development'}                                    ║
║   Port: ${PORT}                                               ║
║   Local URL:  http://localhost:${PORT}                       ║
║   Network URL: http://10.93.12.173:${PORT}                   ║
║                                                            ║
║   API Endpoints:                                           ║
║   - GET  /api/health                                       ║
║   - POST /api/auth/signup                                  ║
║   - POST /api/auth/login                                   ║
║   - POST /api/auth/logout                                  ║
║   - GET  /api/auth/user                                    ║
║   - GET  /api/companies                                    ║
║   - GET  /api/screener                                     ║
║   - GET  /api/analytics                                    ║
║   - GET  /api/reports                                      ║
║   - POST /api/comparisons                                  ║
║   - POST /api/analyst/analyze                              ║
║   - POST /api/analyst/chat                                 ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
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
