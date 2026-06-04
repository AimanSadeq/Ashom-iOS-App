// Quick migration script to create university tables in Supabase
// Run: node server/migrateUniversity.js

require('dotenv').config();
const { supabaseAdmin } = require('./supabaseClient');

async function migrate() {
  if (!supabaseAdmin) {
    console.error('Supabase not configured');
    process.exit(1);
  }

  console.log('Creating university program tables...\n');

  const statements = [
    // Table 1: admin_users
    `CREATE TABLE IF NOT EXISTS admin_users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) NOT NULL UNIQUE,
      full_name VARCHAR(255),
      role VARCHAR(50) DEFAULT 'admin',
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`,

    // Table 2: university_partners
    `CREATE TABLE IF NOT EXISTS university_partners (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      slug VARCHAR(50) NOT NULL UNIQUE,
      name VARCHAR(255) NOT NULL,
      full_name VARCHAR(500),
      country VARCHAR(100) NOT NULL,
      country_code VARCHAR(5) NOT NULL,
      email_domain VARCHAR(255),
      description TEXT,
      programs JSONB DEFAULT '[]'::jsonb,
      website_url TEXT,
      contact_email VARCHAR(255),
      accent_color VARCHAR(20) DEFAULT '#7C3AED',
      logo_url TEXT,
      is_active BOOLEAN DEFAULT true,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`,

    // Table 3: academic_courses
    `CREATE TABLE IF NOT EXISTS academic_courses (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      slug VARCHAR(50) NOT NULL UNIQUE,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      level VARCHAR(100),
      icon VARCHAR(50),
      accent_color VARCHAR(20) DEFAULT '#5B8DEF',
      tool_page_urls JSONB DEFAULT '[]'::jsonb,
      learning_track_ids JSONB DEFAULT '[]'::jsonb,
      cfa_alignment JSONB DEFAULT '[]'::jsonb,
      total_steps INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`,

    // Table 4: course_modules
    `CREATE TABLE IF NOT EXISTS course_modules (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      course_id UUID NOT NULL REFERENCES academic_courses(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('video', 'presentation', 'document')),
      file_url TEXT,
      file_name VARCHAR(255),
      file_size INTEGER,
      duration_minutes INTEGER,
      sort_order INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`,

    // Table 5: university_enrollments
    `CREATE TABLE IF NOT EXISTS university_enrollments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID,
      university_id UUID NOT NULL REFERENCES university_partners(id) ON DELETE CASCADE,
      full_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      student_id VARCHAR(100),
      program VARCHAR(100),
      verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
      verified_at TIMESTAMPTZ,
      verified_by UUID REFERENCES admin_users(id),
      admin_notes TEXT,
      enrolled_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(email, university_id)
    )`,

    // Table 6: enrollment_progress
    `CREATE TABLE IF NOT EXISTS enrollment_progress (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      enrollment_id UUID NOT NULL REFERENCES university_enrollments(id) ON DELETE CASCADE,
      course_id UUID NOT NULL REFERENCES academic_courses(id) ON DELETE CASCADE,
      steps_completed JSONB DEFAULT '[]'::jsonb,
      current_step INTEGER DEFAULT 0,
      total_steps INTEGER DEFAULT 0,
      percentage INTEGER DEFAULT 0,
      started_at TIMESTAMPTZ,
      completed_at TIMESTAMPTZ,
      last_synced_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(enrollment_id, course_id)
    )`,

    // Indexes
    `CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email)`,
    `CREATE INDEX IF NOT EXISTS idx_university_partners_slug ON university_partners(slug)`,
    `CREATE INDEX IF NOT EXISTS idx_university_partners_country ON university_partners(country)`,
    `CREATE INDEX IF NOT EXISTS idx_academic_courses_slug ON academic_courses(slug)`,
    `CREATE INDEX IF NOT EXISTS idx_course_modules_course ON course_modules(course_id)`,
    `CREATE INDEX IF NOT EXISTS idx_course_modules_type ON course_modules(content_type)`,
    `CREATE INDEX IF NOT EXISTS idx_university_enrollments_user ON university_enrollments(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_university_enrollments_university ON university_enrollments(university_id)`,
    `CREATE INDEX IF NOT EXISTS idx_university_enrollments_email ON university_enrollments(email)`,
    `CREATE INDEX IF NOT EXISTS idx_university_enrollments_status ON university_enrollments(verification_status)`,
    `CREATE INDEX IF NOT EXISTS idx_enrollment_progress_enrollment ON enrollment_progress(enrollment_id)`,
    `CREATE INDEX IF NOT EXISTS idx_enrollment_progress_course ON enrollment_progress(course_id)`
  ];

  for (var i = 0; i < statements.length; i++) {
    var sql = statements[i];
    var label = sql.substring(0, 60).replace(/\s+/g, ' ').trim();
    var { error } = await supabaseAdmin.rpc('exec_sql', { query: sql }).catch(function () { return { error: null }; });

    // Try direct SQL via REST if rpc not available
    if (error) {
      var res = await supabaseAdmin.from('_sqlquery').select().limit(0).catch(function () { return {}; });
    }

    // Use raw fetch as fallback
    var url = process.env.SUPABASE_URL + '/rest/v1/rpc/';
    try {
      var result = await fetch(url.replace('/rest/v1/rpc/', '/rest/v1/'), {
        method: 'POST',
        headers: {
          'apikey': process.env.SUPABASE_SERVICE_KEY,
          'Authorization': 'Bearer ' + process.env.SUPABASE_SERVICE_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        }
      });
    } catch (e) { /* ignore */ }

    console.log('  [' + (i + 1) + '/' + statements.length + '] ' + label + '...');
  }

  // The Supabase JS client can't run raw DDL SQL.
  // We need to use the Management API or SQL Editor.
  console.log('\n⚠️  Note: Supabase JS client cannot execute DDL statements directly.');
  console.log('Please run the SQL from server/supabase_schema.sql (University Programs section)');
  console.log('in the Supabase SQL Editor at: ' + process.env.SUPABASE_URL + '/project/default/sql\n');
  console.log('After creating tables, run: node server/seedSupabase.js');

  process.exit(0);
}

migrate();
