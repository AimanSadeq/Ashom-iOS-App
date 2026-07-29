// Authentication Routes
const express = require('express');
const router = express.Router();
const { supabase, createUserClient } = require('../supabaseClient');

// Sign up with email and password
router.post('/signup', async (req, res) => {
  try {
    const { email, password, full_name } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        error: 'Please provide a valid email address'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters'
      });
    }

    if (!supabase) {
      return res.status(503).json({
        error: 'Supabase authentication is not configured'
      });
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: full_name || ''
        }
      }
    });

    if (error) throw error;

    res.status(201).json({
      message: 'User created successfully',
      user: data.user,
      session: data.session
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(400).json({
      error: error.message || 'Failed to create user'
    });
  }
});

// Sign in with email and password
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    // NOTE: the hardcoded demo@vifm.com / demo123 backdoor that used to sit
    // here has been removed. It issued the literal token 'demo-token', which
    // the university and preferences routes accepted as a real session — and
    // which isAdmin() treated as an administrator.
    //
    // To keep a demo account, create demo@vifm.com as a genuine Supabase Auth
    // user. It then logs in through the normal path below and receives a real,
    // expiring JWT with no special privileges.

    if (!supabase) {
      return res.status(503).json({
        error: 'Authentication is not configured on this server.'
      });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    res.json({
      success: true,
      message: 'Login successful',
      token: data.session?.access_token,
      user: data.user,
      session: data.session
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({
      error: error.message || 'Invalid credentials'
    });
  }
});

// Sign out
// The `supabase` client is a single module-level instance shared by every
// request. Calling supabase.auth.signOut() on it used to mutate that shared
// state, so one user logging out could disturb another user's in-flight
// request. Sessions here are stateless JWTs, so logout is a client-side
// concern: the client discards the token. Nothing to invalidate server-side.
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// Get current user
router.get('/user', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: 'No authorization header'
      });
    }

    if (!supabase) {
      return res.status(503).json({
        error: 'Supabase authentication is not configured'
      });
    }

    const token = authHeader.replace('Bearer ', '');

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error) throw error;

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(401).json({
      error: error.message || 'Unauthorized'
    });
  }
});

// Request password reset
router.post('/reset-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Email is required'
      });
    }

    if (!supabase) {
      return res.status(503).json({
        error: 'Supabase authentication is not configured'
      });
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${req.protocol}://${req.get('host')}/reset-password`
    });

    if (error) throw error;

    res.json({
      message: 'Password reset email sent successfully'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(400).json({
      error: error.message || 'Failed to send reset email'
    });
  }
});

// Update password
router.post('/update-password', async (req, res) => {
  try {
    const { password } = req.body;
    const authHeader = req.headers.authorization;

    if (!password) {
      return res.status(400).json({
        error: 'New password is required'
      });
    }

    if (!authHeader) {
      return res.status(401).json({
        error: 'No authorization header'
      });
    }

    if (!supabase) {
      return res.status(503).json({
        error: 'Supabase authentication is not configured'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters'
      });
    }

    const token = authHeader.replace('Bearer ', '');

    // Act as this one user via a per-request client rather than mutating the
    // shared client's session (which every other concurrent request also uses).
    const userClient = createUserClient(token);
    if (!userClient) {
      return res.status(401).json({ error: 'Invalid session' });
    }

    const { error } = await userClient.auth.updateUser({
      password: password
    });

    if (error) throw error;

    res.json({
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(400).json({
      error: error.message || 'Failed to update password'
    });
  }
});

module.exports = router;
