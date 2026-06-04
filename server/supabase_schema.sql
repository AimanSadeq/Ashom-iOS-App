-- VIFM GCC Financial Analysis Platform - Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor to create the database schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Companies Table
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    country VARCHAR(50) NOT NULL,
    sector VARCHAR(100),
    industry VARCHAR(100),
    market_cap DECIMAL(20, 2),
    currency VARCHAR(10) DEFAULT 'USD',
    exchange VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Financial Metrics Table
CREATE TABLE IF NOT EXISTS financial_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    fiscal_year INTEGER NOT NULL,
    quarter INTEGER,
    revenue DECIMAL(20, 2),
    net_income DECIMAL(20, 2),
    total_assets DECIMAL(20, 2),
    total_equity DECIMAL(20, 2),
    eps DECIMAL(10, 4),
    pe_ratio DECIMAL(10, 2),
    roe DECIMAL(10, 4),
    roa DECIMAL(10, 4),
    debt_to_equity DECIMAL(10, 4),
    current_ratio DECIMAL(10, 4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, fiscal_year, quarter)
);

-- Annual Reports Table
CREATE TABLE IF NOT EXISTS annual_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    fiscal_year INTEGER NOT NULL,
    report_type VARCHAR(50) DEFAULT 'Annual Report',
    file_url TEXT,
    file_size INTEGER,
    pages INTEGER,
    published_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comparisons Table
CREATE TABLE IF NOT EXISTS comparisons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    comparison_type VARCHAR(100),
    entities JSONB NOT NULL,
    metrics JSONB NOT NULL,
    results JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Watchlist Table
CREATE TABLE IF NOT EXISTS watchlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, company_id)
);

-- Portfolios Table
CREATE TABLE IF NOT EXISTS portfolios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    objective VARCHAR(100),
    icon VARCHAR(10) DEFAULT '📊',
    holdings JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Preferences Table
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    theme VARCHAR(20) DEFAULT 'light',
    default_currency VARCHAR(10) DEFAULT 'USD',
    notifications_enabled BOOLEAN DEFAULT true,
    preferences JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_companies_country ON companies(country);
CREATE INDEX IF NOT EXISTS idx_companies_sector ON companies(sector);
CREATE INDEX IF NOT EXISTS idx_companies_symbol ON companies(symbol);
CREATE INDEX IF NOT EXISTS idx_companies_industry ON companies(industry);
CREATE INDEX IF NOT EXISTS idx_financial_metrics_company ON financial_metrics(company_id);
CREATE INDEX IF NOT EXISTS idx_financial_metrics_year ON financial_metrics(fiscal_year);
CREATE INDEX IF NOT EXISTS idx_annual_reports_company ON annual_reports(company_id);
CREATE INDEX IF NOT EXISTS idx_annual_reports_year ON annual_reports(fiscal_year);
CREATE INDEX IF NOT EXISTS idx_comparisons_user ON comparisons(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_user ON watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_user ON portfolios(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE annual_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Companies (Public Read)
CREATE POLICY "Companies are viewable by everyone"
    ON companies FOR SELECT
    USING (true);

CREATE POLICY "Companies are insertable by authenticated users"
    ON companies FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for Financial Metrics (Public Read)
CREATE POLICY "Financial metrics are viewable by everyone"
    ON financial_metrics FOR SELECT
    USING (true);

CREATE POLICY "Financial metrics are insertable by authenticated users"
    ON financial_metrics FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for Annual Reports (Public Read)
CREATE POLICY "Annual reports are viewable by everyone"
    ON annual_reports FOR SELECT
    USING (true);

CREATE POLICY "Annual reports are insertable by authenticated users"
    ON annual_reports FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for Comparisons (User-specific)
CREATE POLICY "Users can view their own comparisons"
    ON comparisons FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own comparisons"
    ON comparisons FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comparisons"
    ON comparisons FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comparisons"
    ON comparisons FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for Watchlist (User-specific)
CREATE POLICY "Users can view their own watchlist"
    ON watchlist FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert to their own watchlist"
    ON watchlist FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own watchlist"
    ON watchlist FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for Portfolios (User-specific)
CREATE POLICY "Users can view their own portfolios"
    ON portfolios FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own portfolios"
    ON portfolios FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own portfolios"
    ON portfolios FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own portfolios"
    ON portfolios FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for User Preferences (User-specific)
CREATE POLICY "Users can view their own preferences"
    ON user_preferences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
    ON user_preferences FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
    ON user_preferences FOR UPDATE
    USING (auth.uid() = user_id);

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_metrics_updated_at BEFORE UPDATE ON financial_metrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_annual_reports_updated_at BEFORE UPDATE ON annual_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comparisons_updated_at BEFORE UPDATE ON comparisons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolios_updated_at BEFORE UPDATE ON portfolios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =========================================================================
-- Quantitative Finance Tables
-- =========================================================================

-- Historical Price Data (5 years daily OHLC for all companies + indexes)
CREATE TABLE IF NOT EXISTS price_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    open DECIMAL(20, 4),
    high DECIMAL(20, 4),
    low DECIMAL(20, 4),
    close DECIMAL(20, 4),
    adjusted_close DECIMAL(20, 4),
    volume BIGINT,
    daily_return DECIMAL(12, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, date)
);

-- Fama-French Factor Returns (daily)
CREATE TABLE IF NOT EXISTS factor_returns (
    date DATE PRIMARY KEY,
    market_return DECIMAL(12, 8),
    smb DECIMAL(12, 8),
    hml DECIMAL(12, 8),
    rmw DECIMAL(12, 8),
    cma DECIMAL(12, 8),
    mom DECIMAL(12, 8),
    oil_factor DECIMAL(12, 8),
    risk_free_rate DECIMAL(12, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Macroeconomic Data (daily)
CREATE TABLE IF NOT EXISTS macro_data (
    date DATE PRIMARY KEY,
    oil_wti DECIMAL(10, 4),
    oil_brent DECIMAL(10, 4),
    gold_price DECIMAL(10, 4),
    us_10y_yield DECIMAL(8, 4),
    gcc_interbank_rate DECIMAL(8, 4),
    usd_sar DECIMAL(8, 4),
    usd_aed DECIMAL(8, 4),
    usd_kwd DECIMAL(8, 4),
    usd_qar DECIMAL(8, 4),
    usd_bhd DECIMAL(8, 4),
    usd_omr DECIMAL(8, 4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for quant tables
CREATE INDEX IF NOT EXISTS idx_price_history_company ON price_history(company_id);
CREATE INDEX IF NOT EXISTS idx_price_history_date ON price_history(date);
CREATE INDEX IF NOT EXISTS idx_price_history_company_date ON price_history(company_id, date);
CREATE INDEX IF NOT EXISTS idx_factor_returns_date ON factor_returns(date);
CREATE INDEX IF NOT EXISTS idx_macro_data_date ON macro_data(date);

-- RLS for quant tables (public read)
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE factor_returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE macro_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Price history is viewable by everyone"
    ON price_history FOR SELECT
    USING (true);

CREATE POLICY "Factor returns are viewable by everyone"
    ON factor_returns FOR SELECT
    USING (true);

CREATE POLICY "Macro data is viewable by everyone"
    ON macro_data FOR SELECT
    USING (true);

-- =========================================================================
-- Learning Academy & Certificates
-- =========================================================================

-- Learning Progress (tracks tutorial completion per user)
CREATE TABLE IF NOT EXISTS learning_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    tutorial_id VARCHAR(50) NOT NULL,
    steps_completed JSONB DEFAULT '[]',
    current_step INTEGER DEFAULT 0,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    UNIQUE(user_id, tutorial_id)
);

-- Certificates (issued on track completion)
CREATE TABLE IF NOT EXISTS certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    verification_code VARCHAR(50) NOT NULL UNIQUE,
    track_id VARCHAR(50) NOT NULL,
    track_name VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    institution VARCHAR(255),
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, track_id)
);

-- Indexes for learning tables
CREATE INDEX IF NOT EXISTS idx_learning_progress_user ON learning_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_progress_tutorial ON learning_progress(tutorial_id);
CREATE INDEX IF NOT EXISTS idx_certificates_user ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_code ON certificates(verification_code);

-- RLS for learning tables
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Learning progress: user-specific
CREATE POLICY "Users can view their own learning progress"
    ON learning_progress FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own learning progress"
    ON learning_progress FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own learning progress"
    ON learning_progress FOR UPDATE
    USING (auth.uid() = user_id);

-- Certificates: user can insert own, anyone can read (for verification)
CREATE POLICY "Certificates are viewable by everyone"
    ON certificates FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own certificates"
    ON certificates FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Insert demo user for testing (optional)
-- Note: This user will be created in Supabase Auth, not in this schema

-- =========================================================================
-- University Programs Tables
-- =========================================================================

-- Admin Users — email allowlist for VIFM staff admin access
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- University Partners — partner university records
CREATE TABLE IF NOT EXISTS university_partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Academic Courses — course definitions linking to VIFM tools
CREATE TABLE IF NOT EXISTS academic_courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Course Modules — individual content items (video/presentation/document)
CREATE TABLE IF NOT EXISTS course_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- University Enrollments — student enrollment records
CREATE TABLE IF NOT EXISTS university_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    university_id UUID NOT NULL REFERENCES university_partners(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    student_id VARCHAR(100),
    program VARCHAR(100),
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID REFERENCES admin_users(id),
    admin_notes TEXT,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(email, university_id)
);

-- Enrollment Progress — server-side course progress tracking
CREATE TABLE IF NOT EXISTS enrollment_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enrollment_id UUID NOT NULL REFERENCES university_enrollments(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES academic_courses(id) ON DELETE CASCADE,
    steps_completed JSONB DEFAULT '[]'::jsonb,
    current_step INTEGER DEFAULT 0,
    total_steps INTEGER DEFAULT 0,
    percentage INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(enrollment_id, course_id)
);

-- Indexes for university tables
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_university_partners_slug ON university_partners(slug);
CREATE INDEX IF NOT EXISTS idx_university_partners_country ON university_partners(country);
CREATE INDEX IF NOT EXISTS idx_academic_courses_slug ON academic_courses(slug);
CREATE INDEX IF NOT EXISTS idx_course_modules_course ON course_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_course_modules_type ON course_modules(content_type);
CREATE INDEX IF NOT EXISTS idx_university_enrollments_user ON university_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_university_enrollments_university ON university_enrollments(university_id);
CREATE INDEX IF NOT EXISTS idx_university_enrollments_email ON university_enrollments(email);
CREATE INDEX IF NOT EXISTS idx_university_enrollments_status ON university_enrollments(verification_status);
CREATE INDEX IF NOT EXISTS idx_enrollment_progress_enrollment ON enrollment_progress(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_enrollment_progress_course ON enrollment_progress(course_id);

-- RLS for university tables
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE university_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE university_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollment_progress ENABLE ROW LEVEL SECURITY;

-- University partners: public read
CREATE POLICY "University partners are viewable by everyone"
    ON university_partners FOR SELECT
    USING (true);

-- Academic courses: public read
CREATE POLICY "Academic courses are viewable by everyone"
    ON academic_courses FOR SELECT
    USING (true);

-- Course modules: public read
CREATE POLICY "Course modules are viewable by everyone"
    ON course_modules FOR SELECT
    USING (true);

-- Enrollments: users can view/insert their own
CREATE POLICY "Users can view their own enrollments"
    ON university_enrollments FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own enrollments"
    ON university_enrollments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Enrollment progress: users can view/update their own
CREATE POLICY "Users can view their own enrollment progress"
    ON enrollment_progress FOR SELECT
    USING (enrollment_id IN (SELECT id FROM university_enrollments WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own enrollment progress"
    ON enrollment_progress FOR UPDATE
    USING (enrollment_id IN (SELECT id FROM university_enrollments WHERE user_id = auth.uid()));

-- Triggers for updated_at
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_university_partners_updated_at BEFORE UPDATE ON university_partners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_academic_courses_updated_at BEFORE UPDATE ON academic_courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_modules_updated_at BEFORE UPDATE ON course_modules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_university_enrollments_updated_at BEFORE UPDATE ON university_enrollments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
