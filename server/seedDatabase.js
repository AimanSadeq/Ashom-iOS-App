// SQLite Database Seed Script - 180 GCC Companies + Indexes
// Uses shared seed data from gcc-seed-data.js
const db = require('./database');
const { companies, indexes, generateAllMetrics } = require('./gcc-seed-data');

console.log('🌱 Seeding SQLite Database with 180 GCC Companies + 6 Indexes...\n');

// ==================== Seed Companies ====================
async function seedCompanies() {
  console.log(`Inserting ${companies.length} companies...`);

  const stmt = `INSERT OR REPLACE INTO companies
    (symbol, name, name_arabic, country, country_code, sector, industry, market_cap, exchange, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  let inserted = 0;
  for (const c of companies) {
    try {
      await db.runAsync(stmt, [
        c.symbol,
        c.name,
        c.name_arabic || null,
        c.country,
        c.country_code || '',
        c.sector,
        c.industry,
        c.market_cap,
        c.exchange,
        c.description
      ]);
      inserted++;
    } catch (err) {
      console.error(`  Error inserting ${c.name}:`, err.message);
    }
  }

  console.log(`✅ Inserted ${inserted} companies`);
}

// ==================== Seed Indexes ====================
async function seedIndexes() {
  console.log(`\nInserting ${indexes.length} stock exchange indexes...`);

  const stmt = `INSERT OR REPLACE INTO companies
    (symbol, name, name_arabic, country, country_code, sector, industry, market_cap, exchange, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  for (const idx of indexes) {
    try {
      await db.runAsync(stmt, [
        idx.symbol,
        idx.name,
        idx.name_arabic || null,
        idx.country,
        idx.country_code || '',
        'Index',
        'Stock Exchange Index',
        0,
        idx.exchange,
        idx.description
      ]);
    } catch (err) {
      console.error(`  Error inserting index ${idx.name}:`, err.message);
    }
  }

  console.log(`✅ Inserted ${indexes.length} indexes`);
}

// ==================== Seed Financial Metrics ====================
async function seedMetrics() {
  console.log('\nInserting financial metrics for all companies...');

  // Generate metrics for all 180 companies
  const allMetrics = generateAllMetrics();
  let inserted = 0;

  for (const m of allMetrics) {
    try {
      // Get company_id from symbol
      const company = await db.getAsync('SELECT id FROM companies WHERE symbol = ?', [m.company_symbol]);
      if (!company) continue;

      await db.runAsync(
        `INSERT OR REPLACE INTO financial_metrics
         (company_id, year, revenue, net_income, total_assets, shareholders_equity,
          roe, roa, pe_ratio, eps, debt_to_equity, current_ratio,
          operating_cash_flow, free_cash_flow)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          company.id,
          m.year,
          m.revenue,
          m.net_income,
          m.total_assets,
          m.total_equity,
          m.roe,
          m.roa,
          m.pe_ratio,
          m.eps,
          m.debt_to_equity,
          m.current_ratio,
          m.operating_cash_flow,
          m.free_cash_flow
        ]
      );
      inserted++;
    } catch (err) {
      console.error(`  Error inserting metrics for ${m.company_symbol}:`, err.message);
    }
  }

  console.log(`✅ Inserted ${inserted} financial metrics records`);
}

// ==================== Seed Annual Reports ====================
async function seedReports() {
  console.log('\nInserting sample annual reports...');

  // Generate reports for top 30 companies by market cap
  const topCompanies = [...companies]
    .sort((a, b) => b.market_cap - a.market_cap)
    .slice(0, 30);

  let inserted = 0;

  for (const c of topCompanies) {
    try {
      const company = await db.getAsync('SELECT id FROM companies WHERE symbol = ?', [c.symbol]);
      if (!company) continue;

      // 2024 report
      await db.runAsync(
        `INSERT OR REPLACE INTO annual_reports
         (company_id, year, title, pages, file_size, published_date)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          company.id,
          2024,
          `${c.name} Annual Report 2024`,
          80 + Math.floor(Math.random() * 100),
          2000000 + Math.floor(Math.random() * 3000000),
          '2025-03-15'
        ]
      );
      inserted++;

      // 2023 report
      await db.runAsync(
        `INSERT OR REPLACE INTO annual_reports
         (company_id, year, title, pages, file_size, published_date)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          company.id,
          2023,
          `${c.name} Annual Report 2023`,
          75 + Math.floor(Math.random() * 100),
          1800000 + Math.floor(Math.random() * 3000000),
          '2024-03-15'
        ]
      );
      inserted++;
    } catch (err) {
      console.error(`  Error inserting reports for ${c.name}:`, err.message);
    }
  }

  console.log(`✅ Inserted ${inserted} annual reports`);
}

// ==================== Main ====================
async function seedDatabase() {
  try {
    await seedCompanies();
    await seedIndexes();
    await seedMetrics();
    await seedReports();

    // Print summary
    const countryCounts = {};
    companies.forEach(c => {
      countryCounts[c.country] = (countryCounts[c.country] || 0) + 1;
    });

    console.log('\n══════════════════════════════════════════');
    console.log('✅ SQLite database seeding complete!');
    console.log('══════════════════════════════════════════');
    console.log('\nCompanies by country:');
    Object.entries(countryCounts).forEach(([country, count]) => {
      console.log(`  ${country}: ${count}`);
    });
    console.log(`  TOTAL: ${companies.length} companies + ${indexes.length} indexes`);
    console.log('\nNext step: Run "npm start" to start the server\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
