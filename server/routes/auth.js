// Authentication Routes
const express = require('express');
const router = express.Router();
const { supabase } = require('../supabaseClient');

// Sign up with email and password
router.post('/signup', async (req, res) => {
  try {
    const { email, password, full_name } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
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

    // Demo account fallback
    if (email === 'demo@vifm.com' && password === 'demo123') {
      return res.json({
        success: true,
        message: 'Demo login successful',
        token: 'demo-token',
        user: {
          id: 'demo-user-id',
          email: 'demo@vifm.com',
          full_name: 'Demo User'
        },
        session: {
          access_token: 'demo-token',
          refresh_token: 'demo-refresh-token'
        },
        is_demo: true
      });
    }

    if (!supabase) {
      return res.status(503).json({
        error: 'Supabase authentication is not configured. Use demo@vifm.com / demo123 for demo access.'
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
router.post('/logout', async (req, res) => {
  try {
    if (!supabase) {
      return res.json({ message: 'Logged out successfully' });
    }

    const { error } = await supabase.auth.signOut();

    if (error) throw error;

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(400).json({
      error: error.message || 'Failed to logout'
    });
  }
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

    const token = authHeader.replace('Bearer ', '');

    // Set the session
    await supabase.auth.setSession({
      access_token: token,
      refresh_token: req.body.refresh_token
    });

    const { error } = await supabase.auth.updateUser({
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
