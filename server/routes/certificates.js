const express = require('express');
const router = express.Router();

// POST /api/certificates — Store a certificate (requires auth)
router.post('/', async (req, res) => {
    try {
        const { verificationCode, trackId, trackName, userName, institution } = req.body;

        if (!verificationCode || !trackId || !trackName || !userName) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        // Try Supabase first
        const supabase = req.app.get('supabase');
        if (supabase) {
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                return res.status(401).json({ success: false, error: 'Authentication required' });
            }

            const token = authHeader.replace('Bearer ', '');
            const { data: { user }, error: authError } = await supabase.auth.getUser(token);
            if (authError || !user) {
                return res.status(401).json({ success: false, error: 'Invalid token' });
            }

            const { data, error } = await supabase
                .from('certificates')
                .upsert({
                    user_id: user.id,
                    verification_code: verificationCode,
                    track_id: trackId,
                    track_name: trackName,
                    user_name: userName,
                    institution: institution || null,
                    issued_at: new Date().toISOString()
                }, { onConflict: 'user_id,track_id' })
                .select()
                .single();

            if (error) {
                console.error('Certificate save error:', error);
                return res.json({ success: true, stored: 'local-only', message: 'Saved locally' });
            }

            return res.json({ success: true, stored: 'supabase', data });
        }

        // No Supabase — just acknowledge
        res.json({ success: true, stored: 'local-only' });
    } catch (err) {
        console.error('Certificate POST error:', err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// GET /api/certificates/verify/:code — Public verification
router.get('/verify/:code', async (req, res) => {
    try {
        const code = req.params.code;
        const supabase = req.app.get('supabase');

        if (supabase) {
            const { data, error } = await supabase
                .from('certificates')
                .select('verification_code, track_id, track_name, user_name, institution, issued_at')
                .eq('verification_code', code)
                .single();

            if (error || !data) {
                return res.json({ success: false, found: false, message: 'Certificate not found or issued offline' });
            }

            return res.json({
                success: true,
                found: true,
                certificate: {
                    code: data.verification_code,
                    trackName: data.track_name,
                    userName: data.user_name,
                    institution: data.institution,
                    issuedAt: data.issued_at
                }
            });
        }

        res.json({ success: false, found: false, message: 'Verification requires server database' });
    } catch (err) {
        console.error('Verify error:', err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

module.exports = router;
