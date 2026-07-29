// API smoke tests.
//
// The repository had no tests at all. This is a deliberately dependency-free
// suite runnable against a live server: `npm start` in one shell, `npm test` in
// another (override the target with BASE_URL).
//
// The SEC_* cases are regression guards for the audit's critical finding: the
// literal string 'demo-token' was accepted as a valid — and administrative —
// session. If any of those cases returns 200, that bypass has been reintroduced.

const B = process.env.BASE_URL || 'http://localhost:3001';
const DEMO = { Authorization: 'Bearer demo-token' };
const tests = [
  ['GET /api/health',                  '/api/health',                       {}, 200],
  ['GET /api/companies',               '/api/companies',                    {}, 200],
  ['GET /api/companies?country=saudi', '/api/companies?country=saudi',      {}, 200],
  ['GET /api/companies coverage',      '/api/companies/stats/coverage',     {}, 200],
  ['GET /api/reports  (was 500)',      '/api/reports?limit=3',              {}, 200],
  ['GET /api/analytics/types',         '/api/analytics/types',              {}, 200],
  ['GET /api/analytics/industries',    '/api/analytics/industries',         {}, 200],
  ['GET /api/commodities/yahoo',       '/api/commodities/yahoo',            {}, 200],
  ['GET /api/coingecko/crypto',        '/api/coingecko/crypto?ids=bitcoin', {}, 200],
  ['SEC admin+demo-token (was 200)',   '/api/university/admin/dashboard',   DEMO, 401],
  ['SEC admin enrollments+demo-token', '/api/university/admin/enrollments', DEMO, 401],
  ['SEC prefs+demo-token',             '/api/preferences/pins',             DEMO, 401],
  ['SEC ingest no password',           '/api/ingest/stats',                 {}, 401],
  ['SEC unknown /api (was 200 HTML)',  '/api/indices',                      {}, 404],
  ['SEC public university courses',    '/api/university/courses',           {}, 200],
  ['QUANT companies',                  '/api/quant/companies',              {}, 200],
  ['QUANT price-history',              '/api/quant/price-history/2222',     {}, 200],
  ['QUANT correlation-matrix',         '/api/quant/correlation-matrix?symbols=2222,1120', {}, 200],
  ['QUANT factor-returns',             '/api/quant/factor-returns',         {}, 200],
];
let pass = 0, fail = 0;
for (const [name, path, headers, want] of tests) {
  try {
    const r = await fetch(B + path, { headers });
    const ok = r.status === want;
    console.log(`  ${ok ? '✅' : '❌'} ${name.padEnd(36)} ${r.status}${ok ? '' : ' (want ' + want + ')'}`);
    ok ? pass++ : fail++;
  } catch (e) {
    console.log(`  ❌ ${name.padEnd(36)} ERR ${e.message}`); fail++;
  }
}
// POST endpoints
const posts = [
  ['POST /api/screener (was 500)', '/api/screener', { countries: ['saudi'] }, 200],
  ['POST /api/comparisons/generate', '/api/comparisons/generate', { firstEntity:{name:'Saudi Aramco',type:'company'}, secondEntity:{name:'SABIC',type:'company'} }, 200],
  ['POST /api/quant/risk-metrics', '/api/quant/risk-metrics', { symbol:'2222', range:'1Y' }, 200],
  ['POST /api/quant/optimize', '/api/quant/optimize', { symbols:['2222','1120'] }, 200],
  ['POST /api/quant/scoring', '/api/quant/scoring', { symbol:'2222' }, 200],
];
for (const [name, path, body, want] of posts) {
  try {
    const r = await fetch(B + path, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
    const ok = r.status === want;
    console.log(`  ${ok ? '✅' : '❌'} ${name.padEnd(36)} ${r.status}${ok ? '' : ' (want ' + want + ')'}`);
    ok ? pass++ : fail++;
  } catch (e) { console.log(`  ❌ ${name.padEnd(36)} ERR ${e.message}`); fail++; }
}

// ── CONTRACT TESTS ─────────────────────────────────────────────────────────
//
// Every payload below is exactly what a Quant Lab page constructs. They exist
// because the entire Quant Lab once shipped broken: the pages sent
// {company: ...} while every endpoint required {symbol: ...}, so 8 of 9 tools
// returned HTTP 400 on click. Endpoint-level tests passed the whole time,
// because they used the correct shape rather than the one the UI sends.
//
// If a page's request shape drifts from its endpoint again, these fail.
console.log('\n── CONTRACT (exact UI payloads) ──');
const contracts = [
  ['RiskAnalyticsPage.runRiskMetrics',  '/api/quant/risk-metrics',  { symbol:'2222', range:'1Y' }],
  ['RiskAnalyticsPage.var',             '/api/quant/var',           { symbol:'2222', method:'historical', confidence:0.95 }],
  ['RiskAnalyticsPage.runStressTest',   '/api/quant/stress-test',   { symbol:'2222', scenario:'oil_crash', range:'3Y' }],
  ['FactorModelsPage',                  '/api/quant/factor-model',  { symbol:'2222', model:'ff3', range:'3Y' }],
  ['OptimizerPage',                     '/api/quant/optimize',      { symbols:['2222','1120'], range:'3Y', constraints:{ minWeight:0, maxWeight:1 } }],
  ['ValuationPage (dcf)',               '/api/quant/valuation',     { method:'dcf', params:{ freeCashFlows:[105,110,116], wacc:0.1, terminalGrowthRate:0.02, sharesOutstanding:100 } }],
  ['ValuationPage (altman)',            '/api/quant/valuation',     { method:'altman', params:{ workingCapital:200, retainedEarnings:300, ebit:150, marketCap:800, totalDebt:500, totalAssets:1000, sales:600 } }],
  ['Vision2030Page',                    '/api/quant/vision2030',    { batch:true }],
  ['RegressionPage',                    '/api/quant/regression',    { dependent:{ type:'stock_return', symbol:'2222' }, independents:[{ type:'macro', name:'oil_wti' }], range:'3Y' }],
  ['RelativeValuePage',                 '/api/quant/relative-value',{ sector:'Energy' }],
  ['GCCToolsPage (oil)',                '/api/quant/regression',    { dependent:{ type:'stock_return', symbol:'2222' }, independents:[{ type:'macro', name:'oil_wti' }], range:'3Y' }],
];
for (const [name, path, body] of contracts) {
  try {
    const r = await fetch(B + path, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
    const j = await r.json().catch(() => ({}));
    const ok = r.status === 200 && j.success === true;
    console.log(`  ${ok ? '✅' : '❌'} ${name.padEnd(36)} ${r.status}${ok ? '' : ' ' + (j.error || '')}`);
    ok ? pass++ : fail++;
  } catch (e) { console.log(`  ❌ ${name.padEnd(36)} ERR ${e.message}`); fail++; }
}

// ── INVARIANTS ─────────────────────────────────────────────────────────────
//
// Max drawdown is bounded [0,1] by definition. It once reported 3.76 (376%)
// because the endpoint passed a returns series to a function that expects an
// equity curve — a defect no status-code check could detect.
console.log('\n── INVARIANTS ──');
try {
  const r = await fetch(B + '/api/quant/risk-metrics', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ symbol:'2222', range:'1Y' }),
  });
  const j = await r.json();
  const m = j?.data?.metrics || {};
  const mdd = typeof m.maxDrawdown === 'object' ? m.maxDrawdown?.maxDrawdown : m.maxDrawdown;

  const checks = [
    ['maxDrawdown within [0,1]', typeof mdd === 'number' && mdd >= 0 && mdd <= 1, mdd],
    ['annualizedVolatility >= 0', m.annualizedVolatility >= 0, m.annualizedVolatility],
    ['sharpe is finite',          Number.isFinite(m.sharpe), m.sharpe],
  ];
  for (const [name, ok, val] of checks) {
    console.log(`  ${ok ? '✅' : '❌'} ${name.padEnd(36)} ${val}`);
    ok ? pass++ : fail++;
  }
} catch (e) { console.log(`  ❌ invariants ERR ${e.message}`); fail++; }

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
