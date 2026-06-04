// ================================================================
// University Programs API
// File: server/routes/university.js
//
// Public: GET /partners, /courses, /courses/:slug
// Student: POST /enroll, GET /enrollment, POST /progress/sync, GET /progress
// Admin: CRUD partners/courses/modules, upload, enrollments, admin users
// ================================================================

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const supabaseService = require('../supabaseService');
const { supabase, supabaseAdmin } = require('../supabaseClient');

// ── Multer: memory storage, 100MB for video support ─────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    var allowed = [
      'video/mp4', 'video/webm', 'video/quicktime',
      'application/pdf',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/png', 'image/jpeg'
    ];
    if (allowed.includes(file.mimetype) || file.originalname.match(/\.(mp4|webm|mov|pdf|ppt|pptx|docx|doc|png|jpg|jpeg)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file format. Use MP4, PDF, PPTX, DOCX, PNG, or JPG.'));
    }
  }
});

// ── Auth middleware ──────────────────────────────────────────────
async function requireAuth(req, res, next) {
  var authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, error: 'Authorization required' });
  }
  var token = authHeader.replace('Bearer ', '');

  // Demo account
  if (token === 'demo-token') {
    req.user = { id: 'demo-user-id', email: 'demo@vifm.com', user_metadata: { full_name: 'Demo User' } };
    return next();
  }

  if (!supabase) {
    return res.status(503).json({ success: false, error: 'Auth service not configured' });
  }

  try {
    var result = await supabase.auth.getUser(token);
    if (result.error || !result.data || !result.data.user) {
      return res.status(401).json({ success: false, error: 'Invalid or expired token' });
    }
    req.user = result.data.user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Authentication failed' });
  }
}

async function requireAdmin(req, res, next) {
  // First authenticate
  requireAuth(req, res, async function () {
    if (!req.user) return; // requireAuth already sent response
    try {
      var isAdmin = await supabaseService.isAdmin(req.user.email);
      if (!isAdmin) {
        return res.status(403).json({ success: false, error: 'Admin access required' });
      }
      next();
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Admin check failed' });
    }
  });
}

// ================================================================
// PUBLIC ENDPOINTS (no auth)
// ================================================================

// GET /api/university/partners
router.get('/partners', async function (req, res) {
  try {
    var filters = {};
    if (req.query.country) filters.country = req.query.country;
    var partners = await supabaseService.getUniversityPartners(filters);
    res.json({ success: true, partners: partners });
  } catch (err) {
    console.error('Error fetching partners:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch partners' });
  }
});

// GET /api/university/courses
router.get('/courses', async function (req, res) {
  try {
    var courses = await supabaseService.getAcademicCourses();
    res.json({ success: true, courses: courses });
  } catch (err) {
    console.error('Error fetching courses:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch courses' });
  }
});

// GET /api/university/courses/:slug
router.get('/courses/:slug', async function (req, res) {
  try {
    var course = await supabaseService.getAcademicCourseBySlug(req.params.slug);
    if (!course) return res.status(404).json({ success: false, error: 'Course not found' });
    res.json({ success: true, course: course });
  } catch (err) {
    console.error('Error fetching course:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch course' });
  }
});

// ================================================================
// STUDENT ENDPOINTS (auth required)
// ================================================================

// POST /api/university/enroll
router.post('/enroll', requireAuth, async function (req, res) {
  try {
    var body = req.body;
    if (!body.universityId || !body.fullName || !body.email) {
      return res.status(400).json({ success: false, error: 'universityId, fullName, and email are required' });
    }

    var enrollData = {
      user_id: req.user.id,
      university_id: body.universityId,
      full_name: body.fullName,
      email: body.email,
      student_id: body.studentId || null,
      program: body.program || null
    };

    var enrollment = await supabaseService.createEnrollment(enrollData);
    if (!enrollment) {
      return res.status(503).json({ success: false, error: 'Enrollment tables not yet configured' });
    }
    res.json({ success: true, enrollment: enrollment });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ success: false, error: 'Already enrolled at this university' });
    }
    console.error('Error creating enrollment:', err);
    res.status(500).json({ success: false, error: 'Failed to create enrollment' });
  }
});

// GET /api/university/enrollment
router.get('/enrollment', requireAuth, async function (req, res) {
  try {
    var enrollment = await supabaseService.getEnrollmentByUserId(req.user.id);
    if (!enrollment) {
      // Try by email
      enrollment = await supabaseService.getEnrollmentByEmail(req.user.email);
    }
    res.json({ success: true, enrollment: enrollment });
  } catch (err) {
    console.error('Error fetching enrollment:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch enrollment' });
  }
});

// POST /api/university/progress/sync
router.post('/progress/sync', requireAuth, async function (req, res) {
  try {
    var enrollment = await supabaseService.getEnrollmentByUserId(req.user.id);
    if (!enrollment) {
      return res.status(404).json({ success: false, error: 'No enrollment found' });
    }

    var courseProgress = req.body.courseProgress || [];
    var synced = 0;

    for (var i = 0; i < courseProgress.length; i++) {
      var cp = courseProgress[i];
      if (!cp.courseId) continue;

      var pct = cp.totalSteps > 0 ? Math.round((cp.stepsCompleted / cp.totalSteps) * 100) : 0;
      await supabaseService.syncProgress(enrollment.id, cp.courseId, {
        steps_completed: cp.stepsCompletedArr || [],
        current_step: cp.currentStep || 0,
        total_steps: cp.totalSteps || 0,
        percentage: pct,
        started_at: cp.startedAt || null,
        completed_at: pct >= 100 ? new Date().toISOString() : null
      });
      synced++;
    }

    res.json({ success: true, synced: synced });
  } catch (err) {
    console.error('Error syncing progress:', err);
    res.status(500).json({ success: false, error: 'Failed to sync progress' });
  }
});

// GET /api/university/progress
router.get('/progress', requireAuth, async function (req, res) {
  try {
    var enrollment = await supabaseService.getEnrollmentByUserId(req.user.id);
    if (!enrollment) {
      return res.json({ success: true, progress: [] });
    }
    var progress = await supabaseService.getEnrollmentProgress(enrollment.id);
    res.json({ success: true, progress: progress });
  } catch (err) {
    console.error('Error fetching progress:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch progress' });
  }
});

// ================================================================
// ADMIN ENDPOINTS
// ================================================================

// GET /api/university/admin/dashboard
router.get('/admin/dashboard', requireAdmin, async function (req, res) {
  try {
    var stats = await supabaseService.getUniversityStats();

    // Recent enrollments
    var enrollments = await supabaseService.getEnrollments({});
    stats.recent_enrollments = enrollments.slice(0, 10);

    res.json({ success: true, stats: stats });
  } catch (err) {
    console.error('Error fetching dashboard:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch dashboard stats' });
  }
});

// --- University Partner CRUD ---
router.get('/admin/partners', requireAdmin, async function (req, res) {
  try {
    var partners = await supabaseService.getAllUniversityPartners();
    res.json({ success: true, partners: partners });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch partners' });
  }
});

router.post('/admin/partners', requireAdmin, async function (req, res) {
  try {
    var data = req.body;
    if (!data.slug || !data.name || !data.country || !data.country_code) {
      return res.status(400).json({ success: false, error: 'slug, name, country, and country_code are required' });
    }
    var partner = await supabaseService.createUniversityPartner(data);
    res.json({ success: true, partner: partner });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ success: false, error: 'University slug already exists' });
    console.error('Error creating partner:', err);
    res.status(500).json({ success: false, error: 'Failed to create partner' });
  }
});

router.put('/admin/partners/:id', requireAdmin, async function (req, res) {
  try {
    var partner = await supabaseService.updateUniversityPartner(req.params.id, req.body);
    res.json({ success: true, partner: partner });
  } catch (err) {
    console.error('Error updating partner:', err);
    res.status(500).json({ success: false, error: 'Failed to update partner' });
  }
});

router.delete('/admin/partners/:id', requireAdmin, async function (req, res) {
  try {
    await supabaseService.deleteUniversityPartner(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting partner:', err);
    res.status(500).json({ success: false, error: 'Failed to delete partner' });
  }
});

// --- Course CRUD ---
router.get('/admin/courses', requireAdmin, async function (req, res) {
  try {
    var courses = await supabaseService.getAllAcademicCourses();
    res.json({ success: true, courses: courses });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch courses' });
  }
});

router.post('/admin/courses', requireAdmin, async function (req, res) {
  try {
    var data = req.body;
    if (!data.slug || !data.name) {
      return res.status(400).json({ success: false, error: 'slug and name are required' });
    }
    var course = await supabaseService.createAcademicCourse(data);
    res.json({ success: true, course: course });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ success: false, error: 'Course slug already exists' });
    console.error('Error creating course:', err);
    res.status(500).json({ success: false, error: 'Failed to create course' });
  }
});

router.put('/admin/courses/:id', requireAdmin, async function (req, res) {
  try {
    var course = await supabaseService.updateAcademicCourse(req.params.id, req.body);
    res.json({ success: true, course: course });
  } catch (err) {
    console.error('Error updating course:', err);
    res.status(500).json({ success: false, error: 'Failed to update course' });
  }
});

router.delete('/admin/courses/:id', requireAdmin, async function (req, res) {
  try {
    await supabaseService.deleteAcademicCourse(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting course:', err);
    res.status(500).json({ success: false, error: 'Failed to delete course' });
  }
});

// --- Module CRUD ---
router.get('/admin/courses/:courseId/modules', requireAdmin, async function (req, res) {
  try {
    var modules = await supabaseService.getCourseModules(req.params.courseId);
    res.json({ success: true, modules: modules });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch modules' });
  }
});

router.post('/admin/courses/:courseId/modules', requireAdmin, async function (req, res) {
  try {
    var data = req.body;
    data.course_id = req.params.courseId;
    if (!data.title || !data.content_type) {
      return res.status(400).json({ success: false, error: 'title and content_type are required' });
    }
    var mod = await supabaseService.createCourseModule(data);
    res.json({ success: true, module: mod });
  } catch (err) {
    console.error('Error creating module:', err);
    res.status(500).json({ success: false, error: 'Failed to create module' });
  }
});

router.put('/admin/modules/:id', requireAdmin, async function (req, res) {
  try {
    var mod = await supabaseService.updateCourseModule(req.params.id, req.body);
    res.json({ success: true, module: mod });
  } catch (err) {
    console.error('Error updating module:', err);
    res.status(500).json({ success: false, error: 'Failed to update module' });
  }
});

router.delete('/admin/modules/:id', requireAdmin, async function (req, res) {
  try {
    await supabaseService.deleteCourseModule(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting module:', err);
    res.status(500).json({ success: false, error: 'Failed to delete module' });
  }
});

// --- File Upload ---
router.post('/admin/upload', requireAdmin, upload.single('file'), async function (req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file provided' });
    }

    var courseSlug = req.body.courseSlug || 'general';
    var timestamp = Date.now();
    var safeName = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    var storagePath = 'courses/' + courseSlug + '/' + timestamp + '-' + safeName;

    if (!supabaseAdmin) {
      return res.status(503).json({ success: false, error: 'Storage not configured' });
    }

    var uploadResult = await supabaseAdmin.storage
      .from('course-content')
      .upload(storagePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (uploadResult.error) {
      console.error('Storage upload error:', uploadResult.error);
      return res.status(500).json({ success: false, error: 'Upload failed: ' + uploadResult.error.message });
    }

    var publicUrlResult = supabaseAdmin.storage
      .from('course-content')
      .getPublicUrl(storagePath);

    res.json({
      success: true,
      url: publicUrlResult.data.publicUrl,
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: storagePath
    });
  } catch (err) {
    console.error('Error uploading file:', err);
    res.status(500).json({ success: false, error: 'Failed to upload file' });
  }
});

// --- Enrollment Management ---
router.get('/admin/enrollments', requireAdmin, async function (req, res) {
  try {
    var filters = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.query.university_id) filters.university_id = req.query.university_id;
    if (req.query.search) filters.search = req.query.search;
    var enrollments = await supabaseService.getEnrollments(filters);
    res.json({ success: true, enrollments: enrollments });
  } catch (err) {
    console.error('Error fetching enrollments:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch enrollments' });
  }
});

router.put('/admin/enrollments/:id/verify', requireAdmin, async function (req, res) {
  try {
    var status = req.body.status;
    if (!status || !['verified', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Valid status required: verified, rejected, or pending' });
    }

    // Get admin record for audit trail
    var adminUsers = await supabaseService.getAdminUsers();
    var adminRecord = adminUsers.find(function (a) { return a.email === req.user.email; });

    var enrollment = await supabaseService.updateEnrollmentStatus(
      req.params.id,
      status,
      adminRecord ? adminRecord.id : null,
      req.body.notes || null
    );

    res.json({ success: true, enrollment: enrollment });
  } catch (err) {
    console.error('Error verifying enrollment:', err);
    res.status(500).json({ success: false, error: 'Failed to update enrollment status' });
  }
});

// --- Admin User Management ---
router.get('/admin/admins', requireAdmin, async function (req, res) {
  try {
    var admins = await supabaseService.getAdminUsers();
    res.json({ success: true, admins: admins });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch admins' });
  }
});

router.post('/admin/admins', requireAdmin, async function (req, res) {
  try {
    if (!req.body.email) return res.status(400).json({ success: false, error: 'Email required' });
    var admin = await supabaseService.addAdminUser({ email: req.body.email, full_name: req.body.full_name || '' });
    res.json({ success: true, admin: admin });
  } catch (err) {
    console.error('Error adding admin:', err);
    res.status(500).json({ success: false, error: 'Failed to add admin' });
  }
});

router.delete('/admin/admins/:id', requireAdmin, async function (req, res) {
  try {
    await supabaseService.removeAdminUser(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('Error removing admin:', err);
    res.status(500).json({ success: false, error: 'Failed to remove admin' });
  }
});

module.exports = router;
