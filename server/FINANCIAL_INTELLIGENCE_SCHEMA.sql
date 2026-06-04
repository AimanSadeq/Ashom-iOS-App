-- ================================================================
-- Ashom Financial Intelligence Layer — Database Schema Extension
-- Run this ONCE in your Supabase SQL Editor
-- Project: Ashom GCC Financial Analysis Platform
-- FIXED: company_id is UUID to match companies.id
-- ================================================================

-- Enable pgvector for future vector search capability
CREATE EXTENSION IF NOT EXISTS vector;

-- ================================================================
-- TABLE 1: financial_documents
-- Registry of every uploaded document per company
-- ================================================================
CREATE TABLE IF NOT EXISTS financial_documents (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id      UUID REFERENCES companies(id) ON DELETE CASCADE,
  document_type   VARCHAR(50) NOT NULL,
  -- Values: 'balance_sheet' | 'income_statement' | 'cash_flow'
  --         'annual_report' | 'quarterly_report' | 'news' | 'board_of_directors'
  fiscal_year     INTEGER,
  fiscal_period   VARCHAR(20) DEFAULT 'FY',
  -- Values: 'FY' | 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'H1' | 'H2'
  language        VARCHAR(10) DEFAULT 'en',
  -- Values: 'en' | 'ar' | 'both'
  original_filename VARCHAR(255),
  file_format     VARCHAR(20),
  -- Values: 'pdf' | 'excel' | 'word' | 'paste'
  file_url        TEXT,         -- Supabase Storage URL (if uploaded)
  source_url      TEXT,         -- Original URL (if scraped)
  notes           TEXT,
  uploaded_by     VARCHAR(100),
  chunk_count     INTEGER DEFAULT 0,
  statement_count INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- TABLE 2: financial_statements
-- Structured line-by-line financial data (Balance Sheet, IS, CF)
-- ================================================================
CREATE TABLE IF NOT EXISTS financial_statements (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id      UUID REFERENCES companies(id) ON DELETE CASCADE,
  document_id     UUID REFERENCES financial_documents(id) ON DELETE CASCADE,
  statement_type  VARCHAR(50) NOT NULL,
  -- Values: 'balance_sheet' | 'income_statement' | 'cash_flow'
  fiscal_year     INTEGER NOT NULL,
  fiscal_period   VARCHAR(20) DEFAULT 'FY',
  currency        VARCHAR(10) DEFAULT 'SAR',
  unit            VARCHAR(20) DEFAULT 'thousands',
  -- Values: 'units' | 'thousands' | 'millions' | 'billions'
  line_item       VARCHAR(255) NOT NULL,
  -- e.g. 'Cash and Cash Equivalents'
  line_item_ar    VARCHAR(255),
  -- Arabic equivalent
  category        VARCHAR(100),
  -- e.g. 'Current Assets' | 'Non-Current Assets' | 'Current Liabilities'
  value           NUMERIC,
  value_prior_year NUMERIC,
  -- Prior year comparative column
  section_order   INTEGER DEFAULT 0,
  -- Preserves original statement row order
  is_subtotal     BOOLEAN DEFAULT FALSE,
  is_total        BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- TABLE 3: document_chunks
-- Text chunks from PDFs, Word docs, annual reports, news
-- Supports full-text search (and future vector/semantic search)
-- ================================================================
CREATE TABLE IF NOT EXISTS document_chunks (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id      UUID REFERENCES companies(id) ON DELETE CASCADE,
  document_id     UUID REFERENCES financial_documents(id) ON DELETE CASCADE,
  chunk_index     INTEGER NOT NULL,
  chunk_text      TEXT NOT NULL,
  chunk_text_ar   TEXT,
  -- Arabic version if bilingual source
  metadata        JSONB DEFAULT '{}',
  -- { page: 3, section: 'Risk Factors', word_count: 120 }
  embedding       vector(1536),
  -- Reserved for future OpenAI/semantic embeddings
  search_vector   TSVECTOR,
  -- Auto-populated by trigger below for full-text search
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- TABLE 4: board_members
-- Board of directors data per company per year
-- ================================================================
CREATE TABLE IF NOT EXISTS board_members (
  id                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id            UUID REFERENCES companies(id) ON DELETE CASCADE,
  document_id           UUID REFERENCES financial_documents(id) ON DELETE SET NULL,
  full_name             VARCHAR(255) NOT NULL,
  full_name_ar          VARCHAR(255),
  role                  VARCHAR(100),
  -- e.g. 'Chairman' | 'Vice Chairman' | 'Board Member' | 'CEO' | 'CFO'
  role_ar               VARCHAR(100),
  is_independent        BOOLEAN,
  committee_memberships TEXT[],
  -- e.g. ARRAY['Audit Committee', 'Risk Committee']
  nationality           VARCHAR(100),
  qualifications        TEXT,
  appointed_date        DATE,
  term_expires          DATE,
  is_active             BOOLEAN DEFAULT TRUE,
  fiscal_year           INTEGER,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- INDEXES — Performance optimization
-- ================================================================

-- financial_documents
CREATE INDEX IF NOT EXISTS idx_fin_docs_company    ON financial_documents(company_id);
CREATE INDEX IF NOT EXISTS idx_fin_docs_type       ON financial_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_fin_docs_year       ON financial_documents(fiscal_year);

-- financial_statements
CREATE INDEX IF NOT EXISTS idx_fin_stmt_company    ON financial_statements(company_id);
CREATE INDEX IF NOT EXISTS idx_fin_stmt_type       ON financial_statements(statement_type);
CREATE INDEX IF NOT EXISTS idx_fin_stmt_year       ON financial_statements(fiscal_year);
CREATE INDEX IF NOT EXISTS idx_fin_stmt_lookup     ON financial_statements(company_id, statement_type, fiscal_year);

-- document_chunks (GIN index for full-text search)
CREATE INDEX IF NOT EXISTS idx_chunks_company      ON document_chunks(company_id);
CREATE INDEX IF NOT EXISTS idx_chunks_document     ON document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_chunks_search       ON document_chunks USING GIN(search_vector);

-- board_members
CREATE INDEX IF NOT EXISTS idx_board_company       ON board_members(company_id);
CREATE INDEX IF NOT EXISTS idx_board_active        ON board_members(company_id, is_active);

-- ================================================================
-- TRIGGER: Auto-populate search_vector on document_chunks
-- ================================================================
CREATE OR REPLACE FUNCTION fn_update_chunk_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', COALESCE(NEW.chunk_text, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_chunk_search_vector ON document_chunks;
CREATE TRIGGER trg_chunk_search_vector
  BEFORE INSERT OR UPDATE ON document_chunks
  FOR EACH ROW EXECUTE FUNCTION fn_update_chunk_search_vector();

-- ================================================================
-- TRIGGER: Auto-update updated_at
-- ================================================================
CREATE OR REPLACE FUNCTION fn_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_fin_docs_updated_at ON financial_documents;
CREATE TRIGGER trg_fin_docs_updated_at
  BEFORE UPDATE ON financial_documents
  FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

DROP TRIGGER IF EXISTS trg_board_updated_at ON board_members;
CREATE TRIGGER trg_board_updated_at
  BEFORE UPDATE ON board_members
  FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

-- ================================================================
-- ROW LEVEL SECURITY
-- Note: Service role key (used by backend) bypasses RLS automatically
-- ================================================================
ALTER TABLE financial_documents  ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks      ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_members        ENABLE ROW LEVEL SECURITY;

-- Allow all reads for authenticated and anonymous users
CREATE POLICY "read_financial_documents"  ON financial_documents  FOR SELECT USING (true);
CREATE POLICY "read_financial_statements" ON financial_statements FOR SELECT USING (true);
CREATE POLICY "read_document_chunks"      ON document_chunks      FOR SELECT USING (true);
CREATE POLICY "read_board_members"        ON board_members        FOR SELECT USING (true);

-- ================================================================
-- VERIFICATION QUERY — Run after schema to confirm tables exist
-- ================================================================
SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns c
   WHERE c.table_name = t.table_name) AS column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN (
    'financial_documents',
    'financial_statements',
    'document_chunks',
    'board_members'
  )
ORDER BY table_name;

-- Expected output: 4 rows with column counts of ~14, ~17, ~10, ~16
