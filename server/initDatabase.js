// Database Initialization Script
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '../db/vifm.db');
const DB_DIR = path.dirname(DB_PATH);

// Ensure db directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const db = new sqlite3.Database(DB_PATH);

console.log('🔧 Initializing VIFM Database...\n');

db.serialize(() => {
  // Enable foreign keys
  db.run('PRAGMA foreign_keys = ON');

  // Companies Table
  console.log('Creating companies table...');
  db.run(`
    CREATE TABLE IF NOT EXISTS companies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      symbol TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      name_arabic TEXT,
      country TEXT NOT NULL,
      country_code TEXT NOT NULL,
      sector TEXT NOT NULL,
      industry TEXT,
      market_cap REAL,
      description TEXT,
      website TEXT,
      logo_url TEXT,
      exchange TEXT,
      isin TEXT,
      founded_year INTEGER,
      employees INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Financial Metrics Table
  console.log('Creating financial_metrics table...');
  db.run(`
    CREATE TABLE IF NOT EXISTS financial_metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      year INTEGER NOT NULL,
      quarter INTEGER,
      
      -- Income Statement
      revenue REAL,
      cost_of_revenue REAL,
      gross_profit REAL,
      operating_expenses REAL,
      operating_income REAL,
      net_income REAL,
      ebitda REAL,
      eps REAL,
      
      -- Balance Sheet
      total_assets REAL,
      current_assets REAL,
      total_liabilities REAL,
      current_liabilities REAL,
      shareholders_equity REAL,
      total_debt REAL,
      cash_and_equivalents REAL,
      
      -- Cash Flow
      operating_cash_flow REAL,
      investing_cash_flow REAL,
      financing_cash_flow REAL,
      free_cash_flow REAL,
      
      -- Ratios
      roe REAL,
      roa REAL,
      current_ratio REAL,
      quick_ratio REAL,
      debt_to_equity REAL,
      pe_ratio REAL,
      pb_ratio REAL,
      ps_ratio REAL,
      dividend_yield REAL,
      payout_ratio REAL,
      
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      UNIQUE(company_id, year, quarter)
    )
  `);

  // Annual Reports Table
  console.log('Creating annual_reports table...');
  db.run(`
    CREATE TABLE IF NOT EXISTS annual_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      year INTEGER NOT NULL,
      title TEXT NOT NULL,
      file_url TEXT,
      file_size INTEGER,
      pages INTEGER,
      language TEXT DEFAULT 'en',
      report_type TEXT DEFAULT 'annual',
      published_date DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      UNIQUE(company_id, year, report_type)
    )
  `);

  // Comparisons Table (saved user comparisons)
  console.log('Creating comparisons table...');
  db.run(`
    CREATE TABLE IF NOT EXISTS comparisons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      comparison_type TEXT NOT NULL,
      entity_ids TEXT NOT NULL,
      metrics TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Watchlist Table
  console.log('Creating watchlist table...');
  db.run(`
    CREATE TABLE IF NOT EXISTS watchlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    )
  `);

  // User Preferences Table
  console.log('Creating user_preferences table...');
  db.run(`
    CREATE TABLE IF NOT EXISTS user_preferences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL UNIQUE,
      preferences TEXT DEFAULT '{}',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create indexes for better performance
  console.log('Creating indexes...');
  db.run('CREATE INDEX IF NOT EXISTS idx_companies_country ON companies(country)');
  db.run('CREATE INDEX IF NOT EXISTS idx_companies_sector ON companies(sector)');
  db.run('CREATE INDEX IF NOT EXISTS idx_companies_symbol ON companies(symbol)');
  db.run('CREATE INDEX IF NOT EXISTS idx_companies_industry ON companies(industry)');
  db.run('CREATE INDEX IF NOT EXISTS idx_financial_metrics_company ON financial_metrics(company_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_financial_metrics_year ON financial_metrics(year)');
  db.run('CREATE INDEX IF NOT EXISTS idx_annual_reports_company ON annual_reports(company_id)');

  console.log('\n✅ Database initialization complete!\n');
  console.log('Next steps:');
  console.log('  1. Run: npm run seed-db (to populate with sample data)');
  console.log('  2. Run: npm start (to start the server)\n');
});

db.close();
