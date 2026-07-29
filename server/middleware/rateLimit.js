// Minimal in-process rate limiter.
//
// Deliberately dependency-free so it can be applied immediately without a
// package install. It is per-process, so it does NOT coordinate across
// multiple dynos/instances — if this app is ever scaled horizontally, replace
// the store with Redis. It is still a large improvement over having no limit
// at all on authentication and paid-LLM endpoints.
//
// Correct client IP resolution depends on `app.set('trust proxy', ...)` being
// configured in server/index.js. Without it, every request behind a reverse
// proxy reports the proxy's address and shares a single bucket.

'use strict';

function rateLimit(options = {}) {
  const windowMs = options.windowMs || 60 * 1000;
  const max = options.max || 30;
  const message = options.message || 'Too many requests. Please try again shortly.';
  const keyGenerator = options.keyGenerator || ((req) => req.ip || 'unknown');

  const hits = new Map();

  // Evict stale buckets so the map cannot grow without bound.
  const sweeper = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits) {
      if (now - entry.windowStart > windowMs * 2) hits.delete(key);
    }
  }, Math.max(windowMs, 60 * 1000));

  // Don't hold the event loop open just for the sweeper.
  if (typeof sweeper.unref === 'function') sweeper.unref();

  return function rateLimitMiddleware(req, res, next) {
    const key = keyGenerator(req);
    const now = Date.now();
    const entry = hits.get(key);

    if (!entry || now - entry.windowStart > windowMs) {
      hits.set(key, { windowStart: now, count: 1 });
      return next();
    }

    entry.count += 1;

    if (entry.count > max) {
      const retryAfter = Math.ceil((entry.windowStart + windowMs - now) / 1000);
      res.setHeader('Retry-After', String(Math.max(retryAfter, 1)));
      return res.status(429).json({ error: message });
    }

    next();
  };
}

module.exports = rateLimit;
