// Supabase Database Seed Script - 180 GCC Companies + Indexes
// Uses shared seed data from gcc-seed-data.js
require('dotenv').config();
const { supabaseAdmin } = require('./supabaseClient');
const { companies, indexes, generateAllMetrics } = require('./gcc-seed-data');

console.log('🌱 Seeding Supabase Database with 180 GCC Companies + 6 Indexes...\n');

// ==================== Seed Companies ====================
async function seedCompanies() {
  console.log(`Inserting ${companies.length} companies...`);

  // Supabase upsert in batches of 50 to avoid payload limits
  const batchSize = 50;
  let inserted = 0;

  for (let i = 0; i < companies.length; i += batchSize) {
    const batch = companies.slice(i, i + batchSize).map(c => ({
      symbol: c.symbol,
      name: c.name,
      country: c.country,
      sector: c.sector,
      industry: c.industry,
      market_cap: c.market_cap,
      currency: c.currency || 'USD',
      exchange: c.exchange,
      description: c.description
    }));

    const { error } = await supabaseAdmin
      .from('companies')
      .upsert(batch, { onConflict: 'symbol' });

    if (error) throw error;
    inserted += batch.length;
    console.log(`  ...batch ${Math.ceil((i + 1) / batchSize)}: ${inserted}/${companies.length}`);
  }

  console.log(`✅ Inserted ${inserted} companies`);
}

// ==================== Seed Indexes ====================
async function seedIndexes() {
  console.log(`\nInserting ${indexes.length} stock exchange indexes...`);

  const indexRecords = indexes.map(idx => ({
    symbol: idx.symbol,
    name: idx.name,
    country: idx.country,
    sector: 'Index',
    industry: 'Stock Exchange Index',
    market_cap: 0,
    currency: idx.currency || 'USD',
    exchange: idx.exchange,
    description: idx.description
  }));

  const { error } = await supabaseAdmin
    .from('companies')
    .upsert(indexRecords, { onConflict: 'symbol' });

  if (error) throw error;
  console.log(`✅ Inserted ${indexes.length} indexes`);
}

// ==================== Seed Financial Metrics ====================
async function seedMetrics() {
  console.log('\nInserting financial metrics for all companies...');

  // Get company IDs from database
  const { data: companiesData, error: companiesError } = await supabaseAdmin
    .from('companies')
    .select('id, symbol');

  if (companiesError) {
    console.error('Error fetching companies:', companiesError.message);
    return;
  }

  const companyMap = {};
  companiesData.forEach(c => {
    companyMap[c.symbol] = c.id;
  });

  // Generate metrics for all 180 companies
  const allMetrics = generateAllMetrics();

  const metricsRecords = allMetrics
    .filter(m => companyMap[m.company_symbol])
    .map(m => ({
      company_id: companyMap[m.company_symbol],
      fiscal_year: m.year,
      revenue: m.revenue,
      net_income: m.net_income,
      total_assets: m.total_assets,
      total_equity: m.total_equity,
      roe: m.roe / 100,       // Supabase schema stores as decimal (0.xx)
      roa: m.roa / 100,
      pe_ratio: m.pe_ratio,
      eps: m.eps,
      debt_to_equity: m.debt_to_equity,
      current_ratio: m.current_ratio
    }));

  // Upsert in batches
  const batchSize = 50;
  let inserted = 0;

  for (let i = 0; i < metricsRecords.length; i += batchSize) {
    const batch = metricsRecords.slice(i, i + batchSize);

    const { error } = await supabaseAdmin
      .from('financial_metrics')
      .upsert(batch, { onConflict: 'company_id,fiscal_year,quarter' });

    if (error) {
      console.error(`  Batch error at ${i}:`, error.message);
    } else {
      inserted += batch.length;
    }
  }

  console.log(`✅ Inserted ${inserted} financial metrics records`);
}

// ==================== Seed Annual Reports ====================
async function seedReports() {
  console.log('\nInserting sample annual reports...');

  // Get company IDs
  const { data: companiesData, error: companiesError } = await supabaseAdmin
    .from('companies')
    .select('id, symbol, name');

  if (companiesError) {
    console.error('Error fetching companies:', companiesError.message);
    return;
  }

  const companyMap = {};
  companiesData.forEach(c => {
    companyMap[c.symbol] = { id: c.id, name: c.name };
  });

  // Generate reports for top companies by market cap (top 30)
  const topCompanies = companies
    .sort((a, b) => b.market_cap - a.market_cap)
    .slice(0, 30);

  const reports = [];
  topCompanies.forEach(c => {
    if (!companyMap[c.symbol]) return;

    // 2024 report
    reports.push({
      company_id: companyMap[c.symbol].id,
      fiscal_year: 2024,
      title: `${c.name} Annual Report 2024`,
      pages: 80 + Math.floor(Math.random() * 100),
      file_size: 2000000 + Math.floor(Math.random() * 3000000),
      published_date: '2025-03-15'
    });

    // 2023 report
    reports.push({
      company_id: companyMap[c.symbol].id,
      fiscal_year: 2023,
      title: `${c.name} Annual Report 2023`,
      pages: 75 + Math.floor(Math.random() * 100),
      file_size: 1800000 + Math.floor(Math.random() * 3000000),
      published_date: '2024-03-15'
    });
  });

  // Upsert in batches
  const batchSize = 30;
  let inserted = 0;

  for (let i = 0; i < reports.length; i += batchSize) {
    const batch = reports.slice(i, i + batchSize);

    const { error } = await supabaseAdmin
      .from('annual_reports')
      .upsert(batch);

    if (error) {
      console.error(`  Reports batch error at ${i}:`, error.message);
    } else {
      inserted += batch.length;
    }
  }

  console.log(`✅ Inserted ${inserted} annual reports`);
}

// ==================== Cleanup Old Data ====================
async function cleanupOldData() {
  console.log('🧹 Cleaning up old data...');

  // Delete in order due to foreign key constraints
  const tables = ['annual_reports', 'financial_metrics', 'comparisons', 'watchlist', 'portfolios', 'companies'];
  for (const table of tables) {
    const { error } = await supabaseAdmin
      .from(table)
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

    if (error && !error.message.includes('does not exist')) {
      console.warn(`  Warning cleaning ${table}: ${error.message}`);
    }
  }

  console.log('✅ Old data cleaned up');
}

// ==================== University Programs ====================
async function seedUniversityData() {
  console.log('\n📚 Seeding university program data...');

  // 1. Admin users
  const { error: adminErr } = await supabaseAdmin
    .from('admin_users')
    .upsert([
      { email: 'admin@vifm.com', full_name: 'VIFM Admin', role: 'admin', is_active: true },
      { email: 'demo@vifm.com', full_name: 'Demo Admin', role: 'admin', is_active: true }
    ], { onConflict: 'email' });
  if (adminErr) console.warn('  Admin seed warning:', adminErr.message);
  else console.log('  ✅ Seeded 2 admin users');

  // 2. University partners
  const universities = [
    { slug: 'kfupm', name: 'KFUPM', full_name: 'King Fahd University of Petroleum and Minerals', country: 'Saudi Arabia', country_code: 'SA', email_domain: 'kfupm.edu.sa', description: 'Premier engineering and business university with a strong finance and economics program.', programs: ['Finance BSc', 'MBA Finance', 'MSc Economics'], accent_color: '#10B981', sort_order: 1 },
    { slug: 'aus', name: 'American University of Sharjah', full_name: 'American University of Sharjah', country: 'UAE', country_code: 'AE', email_domain: 'aus.edu', description: 'AUS School of Business Administration. AACSB-accredited with finance concentrations emphasizing quantitative methods and capital markets.', programs: ['BBA Finance', 'MBA', 'MSc Finance'], accent_color: '#3B82F6', sort_order: 2 },
    { slug: 'qu', name: 'Qatar University', full_name: 'Qatar University', country: 'Qatar', country_code: 'QA', email_domain: 'qu.edu.qa', description: 'College of Business and Economics. Qatar\'s largest university with a dedicated finance department and strong research output.', programs: ['BSc Finance', 'MSc Finance', 'PhD Economics'], accent_color: '#8B5CF6', sort_order: 3 },
    { slug: 'uob', name: 'University of Bahrain', full_name: 'University of Bahrain', country: 'Bahrain', country_code: 'BH', email_domain: 'uob.edu.bh', description: 'College of Business Administration. Bahrain\'s national university offering finance and banking programs aligned with the Bahrain Financial Centre.', programs: ['BSc Finance', 'MBA Banking'], accent_color: '#EC4899', sort_order: 4 },
    { slug: 'ku', name: 'Kuwait University', full_name: 'Kuwait University', country: 'Kuwait', country_code: 'KW', email_domain: 'ku.edu.kw', description: 'College of Business Administration. Kuwait\'s oldest university with a finance and financial institutions department covering GCC markets.', programs: ['BSc Finance', 'MSc Finance'], accent_color: '#F59E0B', sort_order: 5 },
    { slug: 'squ', name: 'Sultan Qaboos University', full_name: 'Sultan Qaboos University', country: 'Oman', country_code: 'OM', email_domain: 'squ.edu.om', description: 'College of Economics and Political Science. Oman\'s leading university with programs in financial economics and quantitative analysis.', programs: ['BSc Economics', 'MSc Finance'], accent_color: '#EF4444', sort_order: 6 }
  ];

  const { error: uniErr } = await supabaseAdmin
    .from('university_partners')
    .upsert(universities, { onConflict: 'slug' });
  if (uniErr) console.warn('  University seed warning:', uniErr.message);
  else console.log(`  ✅ Seeded ${universities.length} university partners`);

  // 3. Academic courses
  const courses = [
    { slug: 'investment', name: 'Investment Analysis', description: 'CAPM, Fama-French factor models, alpha and beta estimation, risk-return tradeoffs with real GCC stock data.', level: 'Undergraduate / Graduate', icon: 'chart-line', accent_color: '#5B8DEF', tool_page_urls: [{ label: 'Factor Models', url: '/27_Factor_Models.html', icon: 'chart-line' }, { label: 'Risk Analytics', url: '/28_Risk_Analytics.html', icon: 'shield-halved' }], learning_track_ids: ['factor', 'risk'], cfa_alignment: ['CFA L1: Equity', 'CFA L2: Quant'], total_steps: 14, sort_order: 1 },
    { slug: 'portfolio', name: 'Portfolio Management', description: 'Markowitz optimization, efficient frontiers, risk parity, tangency portfolios using real multi-asset GCC data.', level: 'Graduate / CFA Prep', icon: 'scale-balanced', accent_color: '#8B5CF6', tool_page_urls: [{ label: 'Portfolio Optimizer', url: '/29_Portfolio_Optimizer.html', icon: 'chart-pie' }], learning_track_ids: ['optimizer'], cfa_alignment: ['CFA L3: Portfolio', 'CFA L1: Quant'], total_steps: 7, sort_order: 2 },
    { slug: 'corporate', name: 'Corporate Finance', description: 'DCF valuation, DDM, residual income models, financial scoring (Altman Z, Piotroski F, Beneish M) on GCC companies.', level: 'Undergraduate / Graduate', icon: 'calculator', accent_color: '#F59E0B', tool_page_urls: [{ label: 'Valuation Tools', url: '/30_Valuation_Tools.html', icon: 'calculator' }], learning_track_ids: ['valuation'], cfa_alignment: ['CFA L1: Corp Fin', 'CFA L2: Equity'], total_steps: 7, sort_order: 3 },
    { slug: 'econometrics', name: 'Financial Econometrics', description: 'OLS regression, diagnostics (DW, VIF, heteroscedasticity), cross-sectional analysis on GCC financial data.', level: 'Graduate', icon: 'square-root-variable', accent_color: '#EC4899', tool_page_urls: [{ label: 'Regression Lab', url: '/31_Regression_Lab.html', icon: 'square-root-variable' }], learning_track_ids: ['regression'], cfa_alignment: ['CFA L1: Quant', 'CFA L2: Quant'], total_steps: 6, sort_order: 4 },
    { slug: 'gcc', name: 'GCC Capital Markets', description: 'Oil sensitivity, Sharia compliance screening, country comparison, DuPont analysis, economic diversification scoring.', level: 'Undergraduate / Graduate', icon: 'globe', accent_color: '#06B6D4', tool_page_urls: [{ label: 'GCC Tools', url: '/32_GCC_Tools.html', icon: 'globe' }, { label: 'EDS Score', url: '/34_Vision_2030.html', icon: 'seedling' }], learning_track_ids: ['gcc'], cfa_alignment: ['CFA L1: Equity', 'CFA L2: FRA'], total_steps: 6, sort_order: 5 },
    { slug: 'crossmarket', name: 'Cross-Market Analysis', description: 'Relative value analysis, cross-GCC arbitrage identification, factor-adjusted spread decomposition for fund managers.', level: 'Graduate / Professional', icon: 'arrows-left-right', accent_color: '#10B981', tool_page_urls: [{ label: 'Relative Value', url: '/35_Relative_Value.html', icon: 'scale-balanced' }], learning_track_ids: [], cfa_alignment: ['CFA L3: Portfolio', 'CFA L2: Equity'], total_steps: 0, sort_order: 6 }
  ];

  const { error: courseErr } = await supabaseAdmin
    .from('academic_courses')
    .upsert(courses, { onConflict: 'slug' });
  if (courseErr) console.warn('  Course seed warning:', courseErr.message);
  else console.log(`  ✅ Seeded ${courses.length} academic courses`);

  console.log('✅ University program seeding complete');
}

// ==================== Main ====================
async function seedDatabase() {
  if (!supabaseAdmin) {
    console.error('❌ Supabase is not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_KEY in .env');
    process.exit(1);
  }

  try {
    await cleanupOldData();
    await seedCompanies();
    await seedIndexes();
    await seedMetrics();
    await seedReports();
    await seedUniversityData();

    // Print summary
    const { companies: countryBreakdown } = require('./gcc-seed-data');
    const countryCounts = {};
    countryBreakdown.forEach(c => {
      countryCounts[c.country] = (countryCounts[c.country] || 0) + 1;
    });

    console.log('\n══════════════════════════════════════════');
    console.log('✅ Supabase database seeding complete!');
    console.log('══════════════════════════════════════════');
    console.log('\nCompanies by country:');
    Object.entries(countryCounts).forEach(([country, count]) => {
      console.log(`  ${country}: ${count}`);
    });
    console.log(`  TOTAL: ${countryBreakdown.length} companies + 6 indexes`);

    console.log('\nAPI endpoints:');
    console.log('  GET  http://localhost:3000/api/companies');
    console.log('  GET  http://localhost:3000/api/companies?country=Saudi Arabia');
    console.log('  GET  http://localhost:3000/api/companies?sector=Financials');
    console.log('  GET  http://localhost:3000/api/companies/stats/coverage');
    console.log('  GET  http://localhost:3000/api/analytics/industries');
    console.log('  GET  http://localhost:3000/api/analytics/industries?country=UAE\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
