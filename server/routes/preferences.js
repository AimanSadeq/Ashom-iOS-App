const express = require('express');
const router = express.Router();
const { supabase } = require('../supabaseClient');
const db = require('../supabaseService');

// Auth middleware — extracts user ID from Bearer token
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No authorization header' });

  const token = authHeader.replace('Bearer ', '');

  // Demo token shortcut
  if (token === 'demo-token') {
    req.userId = 'demo-user-id';
    return next();
  }

  // Supabase token validation
  if (!supabase) return res.status(503).json({ error: 'Auth not configured' });

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return res.status(401).json({ error: 'Invalid token' });
    req.userId = user.id;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

// GET /api/preferences — get all user preferences
router.get('/', requireAuth, async (req, res) => {
  try {
    const prefs = await db.getPreferences(req.userId);
    res.json({ success: true, data: prefs });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ error: 'Failed to load preferences' });
  }
});

// PUT /api/preferences/pins — save pinned items
router.put('/pins', requireAuth, async (req, res) => {
  try {
    const { pins } = req.body;
    if (!Array.isArray(pins)) return res.status(400).json({ error: 'pins must be an array' });

    const current = await db.getPreferences(req.userId);
    const updated = { ...current, pinned_items: pins };
    await db.savePreferences(req.userId, updated);

    res.json({ success: true });
  } catch (error) {
    console.error('Save pins error:', error);
    res.status(500).json({ error: 'Failed to save pins' });
  }
});

// GET /api/preferences/pins — get pinned items only
router.get('/pins', requireAuth, async (req, res) => {
  try {
    const prefs = await db.getPreferences(req.userId);
    res.json({ success: true, data: prefs.pinned_items || [] });
  } catch (error) {
    console.error('Get pins error:', error);
    res.status(500).json({ error: 'Failed to load pins' });
  }
});

module.exports = router;
