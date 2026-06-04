// =============================================================================
// GCC Seed Data - 180 Companies + 6 Market Indexes
// Gulf Cooperation Council Financial Analysis Platform
// =============================================================================
// 30 companies per country x 6 countries = 180 companies
// 6 stock exchange indexes (one per country)
// Covers: Saudi Arabia, UAE, Kuwait, Qatar, Bahrain, Oman
// =============================================================================

'use strict';

// ---------------------------------------------------------------------------
// Stock Exchange Indexes
// ---------------------------------------------------------------------------
const indexes = [
  {
    symbol: 'TASI',
    name: 'Tadawul All Share Index',
    name_arabic: 'مؤشر تداول لجميع الأسهم',
    country: 'Saudi Arabia',
    country_code: 'SA',
    type: 'index',
    exchange: 'Tadawul',
    currency: 'SAR',
    description: 'Main stock market index of the Saudi Exchange (Tadawul), tracking all listed companies'
  },
  {
    symbol: 'DFMGI',
    name: 'DFM General Index',
    name_arabic: 'المؤشر العام لسوق دبي المالي',
    country: 'UAE',
    country_code: 'AE',
    type: 'index',
    exchange: 'DFM',
    currency: 'AED',
    description: 'General index of the Dubai Financial Market tracking all listed equities'
  },
  {
    symbol: 'BKP',
    name: 'Boursa Kuwait Premier Market Index',
    name_arabic: 'مؤشر بورصة الكويت للسوق الأول',
    country: 'Kuwait',
    country_code: 'KW',
    type: 'index',
    exchange: 'Boursa Kuwait',
    currency: 'KWD',
    description: 'Premier market index of Boursa Kuwait covering the largest and most liquid stocks'
  },
  {
    symbol: 'QSI',
    name: 'QE General Index',
    name_arabic: 'المؤشر العام لبورصة قطر',
    country: 'Qatar',
    country_code: 'QA',
    type: 'index',
    exchange: 'QSE',
    currency: 'QAR',
    description: 'General index of the Qatar Stock Exchange tracking all listed companies'
  },
  {
    symbol: 'BAX',
    name: 'Bahrain All Share Index',
    name_arabic: 'مؤشر البحرين لجميع الأسهم',
    country: 'Bahrain',
    country_code: 'BH',
    type: 'index',
    exchange: 'BHB',
    currency: 'BHD',
    description: 'All share index of the Bahrain Bourse tracking all listed equities'
  },
  {
    symbol: 'MSI',
    name: 'MSM 30 Index',
    name_arabic: 'مؤشر سوق مسقط 30',
    country: 'Oman',
    country_code: 'OM',
    type: 'index',
    exchange: 'MSM',
    currency: 'OMR',
    description: 'MSM 30 index of the Muscat Securities Market tracking the top 30 companies'
  }
];

// ---------------------------------------------------------------------------
// Saudi Arabia - 30 Companies (Tadawul, SAR, tickers end .SR)
// ---------------------------------------------------------------------------
const saudiCompanies = [
  // --- Financials / Banking ---
  { symbol: '2222', name: 'Saudi Aramco', name_arabic: 'أرامكو السعودية', country: 'Saudi Arabia', country_code: 'SA', sector: 'Energy', industry: 'Integrated Oil & Gas', market_cap: 2100000000000, exchange: 'Tadawul', currency: 'SAR', ticker: '2222.SR', description: 'World\'s largest integrated oil and gas company and most valuable listed firm globally' },
  { symbol: '1120', name: 'Al Rajhi Bank', name_arabic: 'مصرف الراجحي', country: 'Saudi Arabia', country_code: 'SA', sector: 'Financials', industry: 'Banking', market_cap: 95000000000, exchange: 'Tadawul', currency: 'SAR', ticker: '1120.SR', description: 'Largest Islamic bank in the world by market capitalization' },
  { symbol: '1180', name: 'Saudi National Bank (SNB)', name_arabic: 'البنك الأهلي السعودي', country: 'Saudi Arabia', country_code: 'SA', sector: 'Financials', industry: 'Banking', market_cap: 78000000000, exchange: 'Tadawul', currency: 'SAR', ticker: '1180.SR', description: 'Largest bank in Saudi Arabia by total assets, formed from NCB-Samba merger' },
  { symbol: '1010', name: 'Riyad Bank', name_arabic: 'بنك الرياض', country: 'Saudi Arabia', country_code: 'SA', sector: 'Financials', industry: 'Banking', market_cap: 28000000000, exchange: 'Tadawul', currency: 'SAR', ticker: '1010.SR', description: 'Major Saudi commercial bank providing retail and corporate banking services' },
  { symbol: '8010', name: 'Tawuniya', name_arabic: 'التعاونية للتأمين', country: 'Saudi Arabia', country_code: 'SA', sector: 'Financials', industry: 'Insurance', market_cap: 8500000000, exchange: 'Tadawul', currency: 'SAR', ticker: '8010.SR', description: 'Largest insurance company in Saudi Arabia providing cooperative insurance solutions' },
  { symbol: '4280', name: 'Saudi Fransi Capital', name_arabic: 'السعودي الفرنسي كابيتال', country: 'Saudi Arabia', country_code: 'SA', sector: 'Financials', industry: 'Investment Services', market_cap: 2200000000, exchange: 'Tadawul', currency: 'SAR', ticker: '4280.SR', description: 'Leading investment banking and asset management firm in Saudi Arabia' },

  // --- Energy ---
  { symbol: '2030', name: 'Saudi Electricity Company (SEC)', name_arabic: 'الشركة السعودية للكهرباء', country: 'Saudi Arabia', country_code: 'SA', sector: 'Utilities', industry: 'Electric Utilities', market_cap: 48000000000, exchange: 'Tadawul', currency: 'SAR', ticker: '2030.SR', description: 'National electricity generation, transmission and distribution company' },
  { symbol: '2380', name: 'ACWA Power', name_arabic: 'أكوا باور', country: 'Saudi Arabia', country_code: 'SA', sector: 'Utilities', industry: 'Independent Power Producers', market_cap: 38000000000, exchange: 'Tadawul', currency: 'SAR', ticker: '2380.SR', description: 'Developer and operator of power generation and desalinated water plants' },

  // --- Materials / Chemicals ---
  { symbol: '2010', name: 'SABIC', name_arabic: 'سابك', country: 'Saudi Arabia', country_code: 'SA', sector: 'Materials', industry: 'Petrochemicals', market_cap: 85000000000, exchange: 'Tadawul', currency: 'SAR', ticker: '2010.SR', description: 'One of the world\'s largest petrochemicals manufacturers, 70% owned by Aramco' },
  { symbol: '1211', name: 'Ma\'aden (Saudi Arabian Mining)', name_arabic: 'معادن', country: 'Saudi Arabia', country_code: 'SA', sector: 'Materials', industry: 'Mining & Metals', market_cap: 18000000000, exchange: 'Tadawul', currency: 'SAR', ticker: '1211.SR', description: 'Largest multi-commodity mining company in the Middle East' },
  { symbol: '2060', name: 'National Industrialization (Tasnee)', name_arabic: 'التصنيع الوطنية', country: 'Saudi Arabia', country_code: 'SA', sector: 'Materials', industry: 'Diversified Chemicals', market_cap: 7500000000, exchange: 'Tadawul', currency: 'SAR', ticker: '2060.SR', description: 'Diversified industrial and petrochemical conglomerate' },

  // --- Communication Services ---
  { symbol: '7010', name: 'Saudi Telecom Company (stc)', name_arabic: 'الاتصالات السعودية', country: 'Saudi Arabia', country_code: 'SA', sector: 'Communication Services', industry: 'Telecommunications', market_cap: 58000000000, exchange: 'Tadawul', currency: 'SAR', ticker: '7010.SR', description: 'Largest telecommunications company in the Middle East by revenue' },
  { symbol: '7020', name: 'Mobily (Etihad Etisalat)', name_arabic: 'موبايلي', country: 'Saudi Arabia', country_code: 'SA', sector: 'Communication Services', industry: 'Wireless Telecommunications', market_cap: 12500000000, exchange: 'Tadawul', currency: 'SAR', ticker: '7020.SR', description: 'Second largest mobile operator in Saudi Arabia' },

  // --- Consumer Staples ---
  { symbol: '2280', name: 'Almarai', name_arabic: 'المراعي', country: 'Saudi Arabia', country_code: 'SA', sector: 'Consumer Staples', industry: 'Food Products', market_cap: 18000000000, exchange: 'Tadawul', currency: 'SAR', ticker: '2280.SR', description: 'Largest integrated dairy company in the world and leading food & beverage producer' },
  { symbol: '6001', name: 'Halwani Brothers', name_arabic: 'حلواني إخوان', country: 'Saudi Arabia', country_code: 'SA', sector: 'Consumer Staples', industry: 'Packaged Foods', market_cap: 1200000000, exchange: 'Tadawul', currency: 'SAR', ticker: '6001.SR', description: 'Major processed meat and pastry producer in Saudi Arabia' },
  { symbol: '4001', name: 'Abdullah Al Othaim Markets', name_arabic: 'أسواق عبدالله العثيم', country: 'Saudi Arabia', country_code: 'SA', sector: 'Consumer Staples', industry: 'Food & Staples Retailing', market_cap: 3800000000, exchange: 'Tadawul', currency: 'SAR', ticker: '4001.SR', description: 'Leading supermarket and hypermarket chain in Saudi Arabia' },

  // --- Real Estate ---
  { symbol: '4300', name: 'Dar Al Arkan', name_arabic: 'دار الأركان', country: 'Saudi Arabia', country_code: 'SA', sector: 'Real Estate', industry: 'Real Estate Development', market_cap: 8500000000, exchange: 'Tadawul', currency: 'SAR', ticker: '4300.SR', description: 'Largest real estate developer by revenue in Saudi Arabia' },
  { symbol: '4020', name: 'Saudi Real Estate Company', name_arabic: 'العقارية السعودية', country: 'Saudi Arabia', country_code: 'SA', sector: 'Real Estate', industry: 'Real Estate Investment Trusts', market_cap: 2800000000, exchange: 'Tadawul', currency: 'SAR', ticker: '4020.SR', description: 'Diversified real estate investment and development company' },

  // --- Healthcare ---
  { symbol: '4004', name: 'Dallah Healthcare', name_arabic: 'دله الصحية', country: 'Saudi Arabia', country_code: 'SA', sector: 'Healthcare', industry: 'Healthcare Facilities', market_cap: 5500000000, exchange: 'Tadawul', currency: 'SAR', ticker: '4004.SR', description: 'Leading private healthcare provider operating hospitals and medical centers' },
  { symbol: '4002', name: 'Mouwasat Medical Services', name_arabic: 'المواساة للخدمات الطبية', country: 'Saudi Arabia', country_code: 'SA', sector: 'Healthcare', industry: 'Healthcare Facilities', market_cap: 6200000000, exchange: 'Tadawul', currency: 'SAR', ticker: '4002.SR', description: 'Operator of hospitals and medical complexes across Saudi Arabia' },

  // --- Industrials ---
  { symbol: '2350', name: 'Saudi Kayan Petrochemical', name_arabic: 'كيان السعودية', country: 'Saudi Arabia', country_code: 'SA', sector: 'Materials', industry: 'Specialty Chemicals', market_cap: 9200000000, exchange: 'Tadawul', currency: 'SAR', ticker: '2350.SR', description: 'Major petrochemical company producing polypropylene, polyethylene and ethylene glycol' },
  { symbol: '1303', name: 'Elm Company', name_arabic: 'علم', country: 'Saudi Arabia', country_code: 'SA', sector: 'Information Technology', industry: 'IT Services & Digital Solutions', market_cap: 14000000000, exchange: 'Tadawul', currency: 'SAR', ticker: '1303.SR', description: 'Leading digital solutions provider for government and enterprise in Saudi Arabia' },
  { symbol: '2190', name: 'Saudi Industrial Services (SISCO)', name_arabic: 'سيسكو', country: 'Saudi Arabia', country_code: 'SA', sector: 'Industrials', industry: 'Industrial Conglomerates', market_cap: 2400000000, exchange: 'Tadawul', currency: 'SAR', ticker: '2190.SR', description: 'Diversified industrial services company focused on water and environmental services' },

  // --- Transport ---
  { symbol: '4031', name: 'Saudi Ground Services (SGS)', name_arabic: 'الخدمات الأرضية', country: 'Saudi Arabia', country_code: 'SA', sector: 'Industrials', industry: 'Airport Services', market_cap: 4200000000, exchange: 'Tadawul', currency: 'SAR', ticker: '4031.SR', description: 'Provider of ground handling services at airports across Saudi Arabia' },
  { symbol: '4030', name: 'Bahri (National Shipping Company)', name_arabic: 'البحري', country: 'Saudi Arabia', country_code: 'SA', sector: 'Industrials', industry: 'Marine Shipping', market_cap: 7800000000, exchange: 'Tadawul', currency: 'SAR', ticker: '4030.SR', description: 'Largest owner and operator of VLCCs (oil tankers) in the Middle East' },

  // --- Consumer Discretionary ---
  { symbol: '4070', name: 'Jarir Marketing', name_arabic: 'جرير', country: 'Saudi Arabia', country_code: 'SA', sector: 'Consumer Discretionary', industry: 'Specialty Retail', market_cap: 8200000000, exchange: 'Tadawul', currency: 'SAR', ticker: '4070.SR', description: 'Leading office supplies, electronics and bookstore retail chain' },
  { symbol: '4190', name: 'Jabal Omar Development', name_arabic: 'جبل عمر', country: 'Saudi Arabia', country_code: 'SA', sector: 'Real Estate', industry: 'Hospitality & Lodging REITs', market_cap: 9800000000, exchange: 'Tadawul', currency: 'SAR', ticker: '4190.SR', description: 'Developer of mixed-use real estate in the holy city of Makkah' },

  // --- Cement / Construction Materials ---
  { symbol: '3010', name: 'Saudi Cement', name_arabic: 'الأسمنت السعودية', country: 'Saudi Arabia', country_code: 'SA', sector: 'Materials', industry: 'Construction Materials', market_cap: 3800000000, exchange: 'Tadawul', currency: 'SAR', ticker: '3010.SR', description: 'One of the oldest and largest cement producers in Saudi Arabia' },
  { symbol: '3060', name: 'Yanbu Cement', name_arabic: 'أسمنت ينبع', country: 'Saudi Arabia', country_code: 'SA', sector: 'Materials', industry: 'Construction Materials', market_cap: 2200000000, exchange: 'Tadawul', currency: 'SAR', ticker: '3060.SR', description: 'Leading cement manufacturer in western Saudi Arabia' },

  // --- Pharmaceuticals ---
  { symbol: '4015', name: 'Saudi Pharmaceutical Industries (SPIMACO)', name_arabic: 'سبيماكو الدوائية', country: 'Saudi Arabia', country_code: 'SA', sector: 'Healthcare', industry: 'Pharmaceuticals', market_cap: 2400000000, exchange: 'Tadawul', currency: 'SAR', ticker: '4015.SR', description: 'Largest pharmaceutical manufacturer in Saudi Arabia and the GCC region' }
];

// ---------------------------------------------------------------------------
// UAE - 30 Companies (DFM/ADX, AED, tickers end .AE)
// ---------------------------------------------------------------------------
const uaeCompanies = [
  // --- Financials / Banking ---
  { symbol: 'FAB', name: 'First Abu Dhabi Bank', name_arabic: 'بنك أبوظبي الأول', country: 'UAE', country_code: 'AE', sector: 'Financials', industry: 'Banking', market_cap: 65000000000, exchange: 'ADX', currency: 'AED', ticker: 'FAB.AE', description: 'Largest bank in the UAE and one of the largest in the Middle East by total assets' },
  { symbol: 'ENBD', name: 'Emirates NBD', name_arabic: 'الإمارات دبي الوطني', country: 'UAE', country_code: 'AE', sector: 'Financials', industry: 'Banking', market_cap: 28000000000, exchange: 'DFM', currency: 'AED', ticker: 'ENBD.AE', description: 'Leading banking group in the MENAT region with global presence' },
  { symbol: 'ADCB', name: 'Abu Dhabi Commercial Bank', name_arabic: 'بنك أبوظبي التجاري', country: 'UAE', country_code: 'AE', sector: 'Financials', industry: 'Banking', market_cap: 18000000000, exchange: 'ADX', currency: 'AED', ticker: 'ADCB.AE', description: 'Third largest bank in the UAE offering retail, corporate and investment banking' },
  { symbol: 'DIB', name: 'Dubai Islamic Bank', name_arabic: 'بنك دبي الإسلامي', country: 'UAE', country_code: 'AE', sector: 'Financials', industry: 'Islamic Banking', market_cap: 12000000000, exchange: 'DFM', currency: 'AED', ticker: 'DIB.AE', description: 'Largest Islamic bank in the UAE and one of the first Sharia-compliant banks globally' },
  { symbol: 'ADIB', name: 'Abu Dhabi Islamic Bank', name_arabic: 'مصرف أبوظبي الإسلامي', country: 'UAE', country_code: 'AE', sector: 'Financials', industry: 'Islamic Banking', market_cap: 9500000000, exchange: 'ADX', currency: 'AED', ticker: 'ADIB.AE', description: 'Leading Islamic bank providing Sharia-compliant banking solutions in the UAE' },
  { symbol: 'OIC', name: 'Orient Insurance Company', name_arabic: 'شركة أورينت للتأمين', country: 'UAE', country_code: 'AE', sector: 'Financials', industry: 'Insurance', market_cap: 1800000000, exchange: 'DFM', currency: 'AED', ticker: 'OIC.AE', description: 'One of the largest insurance companies in the UAE and the Middle East' },

  // --- Communication Services ---
  { symbol: 'ETISALAT', name: 'Emirates Telecommunications Group (e&)', name_arabic: 'مجموعة الإمارات للاتصالات', country: 'UAE', country_code: 'AE', sector: 'Communication Services', industry: 'Telecommunications', market_cap: 88000000000, exchange: 'ADX', currency: 'AED', ticker: 'ETISALAT.AE', description: 'Largest telecom operator in the Middle East and 18th largest globally by subscribers' },
  { symbol: 'DU', name: 'Emirates Integrated Telecommunications (du)', name_arabic: 'دو', country: 'UAE', country_code: 'AE', sector: 'Communication Services', industry: 'Wireless Telecommunications', market_cap: 15000000000, exchange: 'DFM', currency: 'AED', ticker: 'DU.AE', description: 'Second telecommunications operator in the UAE providing mobile, broadband and TV services' },

  // --- Energy ---
  { symbol: 'ADNOCDIST', name: 'ADNOC Distribution', name_arabic: 'أدنوك للتوزيع', country: 'UAE', country_code: 'AE', sector: 'Energy', industry: 'Oil & Gas Refining & Marketing', market_cap: 15000000000, exchange: 'ADX', currency: 'AED', ticker: 'ADNOCDIST.AE', description: 'Largest fuel distributor in the UAE with an extensive network of service stations' },
  { symbol: 'ADNOCDRILL', name: 'ADNOC Drilling', name_arabic: 'أدنوك للحفر', country: 'UAE', country_code: 'AE', sector: 'Energy', industry: 'Oil & Gas Drilling', market_cap: 12000000000, exchange: 'ADX', currency: 'AED', ticker: 'ADNOCDRILL.AE', description: 'Largest national drilling company in the Middle East by rig fleet size' },
  { symbol: 'ADNOCGAS', name: 'ADNOC Gas', name_arabic: 'أدنوك للغاز', country: 'UAE', country_code: 'AE', sector: 'Energy', industry: 'Oil & Gas Processing', market_cap: 25000000000, exchange: 'ADX', currency: 'AED', ticker: 'ADNOCGAS.AE', description: 'One of the largest gas processing companies globally, processing Abu Dhabi\'s natural gas' },

  // --- Utilities ---
  { symbol: 'TAQA', name: 'Abu Dhabi National Energy (TAQA)', name_arabic: 'طاقة', country: 'UAE', country_code: 'AE', sector: 'Utilities', industry: 'Multi-Utilities', market_cap: 25000000000, exchange: 'ADX', currency: 'AED', ticker: 'TAQA.AE', description: 'Abu Dhabi\'s low-carbon energy and water champion operating across 11 countries' },
  { symbol: 'DEWA', name: 'Dubai Electricity & Water Authority', name_arabic: 'هيئة كهرباء ومياه دبي', country: 'UAE', country_code: 'AE', sector: 'Utilities', industry: 'Electric Utilities', market_cap: 32000000000, exchange: 'DFM', currency: 'AED', ticker: 'DEWA.AE', description: 'Exclusive provider of electricity and water services in Dubai' },

  // --- Real Estate ---
  { symbol: 'EMAAR', name: 'Emaar Properties', name_arabic: 'إعمار العقارية', country: 'UAE', country_code: 'AE', sector: 'Real Estate', industry: 'Real Estate Development', market_cap: 22000000000, exchange: 'DFM', currency: 'AED', ticker: 'EMAAR.AE', description: 'Developer of Burj Khalifa and Dubai Mall, a global leader in real estate' },
  { symbol: 'ALDAR', name: 'Aldar Properties', name_arabic: 'الدار العقارية', country: 'UAE', country_code: 'AE', sector: 'Real Estate', industry: 'Diversified Real Estate', market_cap: 14500000000, exchange: 'ADX', currency: 'AED', ticker: 'ALDAR.AE', description: 'Abu Dhabi\'s leading real estate developer and manager' },
  { symbol: 'DAMAC', name: 'DAMAC Properties', name_arabic: 'داماك العقارية', country: 'UAE', country_code: 'AE', sector: 'Real Estate', industry: 'Luxury Real Estate Development', market_cap: 7200000000, exchange: 'DFM', currency: 'AED', ticker: 'DAMAC.AE', description: 'Luxury real estate developer known for premium communities and resort destinations' },
  { symbol: 'EMAARDEV', name: 'Emaar Development', name_arabic: 'إعمار للتطوير', country: 'UAE', country_code: 'AE', sector: 'Real Estate', industry: 'Residential Development', market_cap: 5800000000, exchange: 'DFM', currency: 'AED', ticker: 'EMAARDEV.AE', description: 'Build-to-sell property development subsidiary of Emaar Properties' },

  // --- Materials ---
  { symbol: 'FERTIGLOBE', name: 'Fertiglobe', name_arabic: 'فيرتيجلوب', country: 'UAE', country_code: 'AE', sector: 'Materials', industry: 'Fertilizers & Agricultural Chemicals', market_cap: 8200000000, exchange: 'ADX', currency: 'AED', ticker: 'FERTIGLOBE.AE', description: 'World\'s largest seaborne exporter of urea and largest nitrogen fertilizer producer in MENA' },

  // --- Industrials ---
  { symbol: 'DNATA', name: 'Air Arabia', name_arabic: 'العربية للطيران', country: 'UAE', country_code: 'AE', sector: 'Industrials', industry: 'Airlines', market_cap: 5500000000, exchange: 'DFM', currency: 'AED', ticker: 'AIRARABIA.AE', description: 'Largest low-cost carrier in the Middle East and North Africa' },
  { symbol: 'ARAMEX', name: 'Aramex', name_arabic: 'أرامكس', country: 'UAE', country_code: 'AE', sector: 'Industrials', industry: 'Logistics & Delivery', market_cap: 3200000000, exchange: 'DFM', currency: 'AED', ticker: 'ARAMEX.AE', description: 'Leading global provider of comprehensive logistics and transportation solutions' },
  { symbol: 'AGTHIA', name: 'Agthia Group', name_arabic: 'مجموعة أغذية', country: 'UAE', country_code: 'AE', sector: 'Consumer Staples', industry: 'Food Products', market_cap: 2800000000, exchange: 'ADX', currency: 'AED', ticker: 'AGTHIA.AE', description: 'Abu Dhabi-based food and beverage company known for Al Ain water brand' },
  { symbol: 'MULTIPLY', name: 'Multiply Group', name_arabic: 'مجموعة مضاعفة', country: 'UAE', country_code: 'AE', sector: 'Financials', industry: 'Investment Holding', market_cap: 9600000000, exchange: 'ADX', currency: 'AED', ticker: 'MULTIPLY.AE', description: 'Abu Dhabi-based holding company with investments across technology and energy' },

  // --- Healthcare ---
  { symbol: 'BURJEEL', name: 'Burjeel Holdings', name_arabic: 'برجيل القابضة', country: 'UAE', country_code: 'AE', sector: 'Healthcare', industry: 'Healthcare Facilities', market_cap: 4200000000, exchange: 'ADX', currency: 'AED', ticker: 'BURJEEL.AE', description: 'Largest private healthcare provider in the UAE by revenue' },

  // --- Consumer Discretionary ---
  { symbol: 'PARKIN', name: 'Parkin Company', name_arabic: 'شركة باركن', country: 'UAE', country_code: 'AE', sector: 'Industrials', industry: 'Parking & Infrastructure Services', market_cap: 3800000000, exchange: 'DFM', currency: 'AED', ticker: 'PARKIN.AE', description: 'Dubai\'s exclusive paid public parking operator and mobility solutions provider' },
  { symbol: 'SALIK', name: 'Salik Company', name_arabic: 'شركة سالك', country: 'UAE', country_code: 'AE', sector: 'Industrials', industry: 'Toll Roads & Infrastructure', market_cap: 6200000000, exchange: 'DFM', currency: 'AED', ticker: 'SALIK.AE', description: 'Exclusive operator of Dubai\'s electronic toll collection system' },
  { symbol: 'LULU', name: 'Lulu Retail Holdings', name_arabic: 'لولو للتجزئة القابضة', country: 'UAE', country_code: 'AE', sector: 'Consumer Staples', industry: 'Hypermarkets & Retail', market_cap: 6500000000, exchange: 'ADX', currency: 'AED', ticker: 'LULU.AE', description: 'One of the largest hypermarket chains in the Middle East' },

  // --- Technology ---
  { symbol: 'PRESIGHT', name: 'Presight AI', name_arabic: 'بريسايت', country: 'UAE', country_code: 'AE', sector: 'Information Technology', industry: 'Artificial Intelligence & Big Data', market_cap: 5200000000, exchange: 'ADX', currency: 'AED', ticker: 'PRESIGHT.AE', description: 'Leading big data analytics company powered by generative AI in the region' },

  // --- Additional Companies ---
  { symbol: 'RAK', name: 'RAK Ceramics', name_arabic: 'رأس الخيمة للسيراميك', country: 'UAE', country_code: 'AE', sector: 'Materials', industry: 'Building Products', market_cap: 2200000000, exchange: 'ADX', currency: 'AED', ticker: 'RAK.AE', description: 'One of the largest ceramics manufacturers in the world' },
  { symbol: 'NMDC', name: 'NMDC Group', name_arabic: 'مجموعة إن إم دي سي', country: 'UAE', country_code: 'AE', sector: 'Industrials', industry: 'Marine & Offshore Engineering', market_cap: 4800000000, exchange: 'ADX', currency: 'AED', ticker: 'NMDC.AE', description: 'Leading dredging, marine and civil engineering company in the Middle East' },
  { symbol: 'ADPORTS', name: 'AD Ports Group', name_arabic: 'مجموعة موانئ أبوظبي', country: 'UAE', country_code: 'AE', sector: 'Industrials', industry: 'Port Operations & Logistics', market_cap: 11000000000, exchange: 'ADX', currency: 'AED', ticker: 'ADPORTS.AE', description: 'Integrated trade, logistics and industrial hub facilitating global trade flows' }
];

// ---------------------------------------------------------------------------
// Kuwait - 30 Companies (Boursa Kuwait, KWD, tickers end .KW)
// ---------------------------------------------------------------------------
const kuwaitCompanies = [
  // --- Financials / Banking ---
  { symbol: 'NBK', name: 'National Bank of Kuwait', name_arabic: 'بنك الكويت الوطني', country: 'Kuwait', country_code: 'KW', sector: 'Financials', industry: 'Banking', market_cap: 18000000000, exchange: 'Boursa Kuwait', currency: 'KWD', ticker: 'NBK.KW', description: 'Largest bank in Kuwait and one of the leading financial institutions in the Middle East' },
  { symbol: 'KFH', name: 'Kuwait Finance House', name_arabic: 'بيت التمويل الكويتي', country: 'Kuwait', country_code: 'KW', sector: 'Financials', industry: 'Islamic Banking', market_cap: 13000000000, exchange: 'Boursa Kuwait', currency: 'KWD', ticker: 'KFH.KW', description: 'One of the world\'s largest Islamic banks and Kuwait\'s leading Islamic financial institution' },
  { symbol: 'BOUBYAN', name: 'Boubyan Bank', name_arabic: 'بنك بوبيان', country: 'Kuwait', country_code: 'KW', sector: 'Financials', industry: 'Islamic Banking', market_cap: 7200000000, exchange: 'Boursa Kuwait', currency: 'KWD', ticker: 'BOUBYAN.KW', description: 'Fastest growing Islamic bank in Kuwait with strong digital banking focus' },
  { symbol: 'GBK', name: 'Gulf Bank', name_arabic: 'بنك الخليج', country: 'Kuwait', country_code: 'KW', sector: 'Financials', industry: 'Banking', market_cap: 3200000000, exchange: 'Boursa Kuwait', currency: 'KWD', ticker: 'GBK.KW', description: 'Major Kuwaiti commercial bank serving retail and corporate clients' },
  { symbol: 'ABK', name: 'Al Ahli Bank of Kuwait', name_arabic: 'البنك الأهلي الكويتي', country: 'Kuwait', country_code: 'KW', sector: 'Financials', industry: 'Banking', market_cap: 2800000000, exchange: 'Boursa Kuwait', currency: 'KWD', ticker: 'ABK.KW', description: 'Prominent commercial bank with operations in Kuwait, UAE and Egypt' },
  { symbol: 'GIG', name: 'Gulf Insurance Group', name_arabic: 'مجموعة الخليج للتأمين', country: 'Kuwait', country_code: 'KW', sector: 'Financials', industry: 'Insurance', market_cap: 1600000000, exchange: 'Boursa Kuwait', currency: 'KWD', ticker: 'GIG.KW', description: 'Largest insurance group in Kuwait with operations across the Middle East' },
  { symbol: 'KIB', name: 'Kuwait International Bank', name_arabic: 'بنك الكويت الدولي', country: 'Kuwait', country_code: 'KW', sector: 'Financials', industry: 'Islamic Banking', market_cap: 1200000000, exchange: 'Boursa Kuwait', currency: 'KWD', ticker: 'KIB.KW', description: 'Islamic bank providing Sharia-compliant banking products and services' },
  { symbol: 'KIPCO', name: 'KIPCO - Kuwait Projects Company', name_arabic: 'كيبكو', country: 'Kuwait', country_code: 'KW', sector: 'Financials', industry: 'Investment Holding', market_cap: 2200000000, exchange: 'Boursa Kuwait', currency: 'KWD', ticker: 'KIPCO.KW', description: 'One of the largest holding companies in the Middle East and North Africa' },

  // --- Communication Services ---
  { symbol: 'ZAIN', name: 'Zain Group', name_arabic: 'مجموعة زين', country: 'Kuwait', country_code: 'KW', sector: 'Communication Services', industry: 'Telecommunications', market_cap: 4000000000, exchange: 'Boursa Kuwait', currency: 'KWD', ticker: 'ZAIN.KW', description: 'Leading mobile voice and data services operator across 7 Middle Eastern and African countries' },
  { symbol: 'OOREDOO', name: 'Ooredoo Kuwait', name_arabic: 'أوريدو الكويت', country: 'Kuwait', country_code: 'KW', sector: 'Communication Services', industry: 'Wireless Telecommunications', market_cap: 2400000000, exchange: 'Boursa Kuwait', currency: 'KWD', ticker: 'OOREDOO.KW', description: 'Third mobile operator in Kuwait providing voice, data and broadband services' },
  { symbol: 'STC', name: 'STC Kuwait (Viva)', name_arabic: 'الاتصالات الكويتية فيفا', country: 'Kuwait', country_code: 'KW', sector: 'Communication Services', industry: 'Wireless Telecommunications', market_cap: 1800000000, exchange: 'Boursa Kuwait', currency: 'KWD', ticker: 'STC.KW', description: 'Kuwait\'s youngest telecom operator, subsidiary of Saudi Telecom Company' },

  // --- Industrials ---
  { symbol: 'AGILITY', name: 'Agility Public Warehousing', name_arabic: 'أجيليتي', country: 'Kuwait', country_code: 'KW', sector: 'Industrials', industry: 'Transportation & Logistics', market_cap: 6000000000, exchange: 'Boursa Kuwait', currency: 'KWD', ticker: 'AGILITY.KW', description: 'Global logistics company operating in over 60 countries' },
  { symbol: 'AAYAN', name: 'Aayan Leasing & Investment', name_arabic: 'أعيان للإجارة والاستثمار', country: 'Kuwait', country_code: 'KW', sector: 'Financials', industry: 'Leasing & Finance', market_cap: 680000000, exchange: 'Boursa Kuwait', currency: 'KWD', ticker: 'AAYAN.KW', description: 'Investment company providing Islamic leasing and financing services' },
  { symbol: 'HUMANSOFT', name: 'Humansoft Holding', name_arabic: 'هيومن سوفت القابضة', country: 'Kuwait', country_code: 'KW', sector: 'Consumer Discretionary', industry: 'Education Services', market_cap: 2800000000, exchange: 'Boursa Kuwait', currency: 'KWD', ticker: 'HUMANSOFT.KW', description: 'Leading private higher education provider in Kuwait operating the American University' },

  // --- Energy ---
  { symbol: 'KOC', name: 'Kuwait Oil Company', name_arabic: 'شركة نفط الكويت', country: 'Kuwait', country_code: 'KW', sector: 'Energy', industry: 'Oil & Gas Exploration', market_cap: 8500000000, exchange: 'Boursa Kuwait', currency: 'KWD', ticker: 'KOC.KW', description: 'National oil company responsible for exploration and production of oil and gas in Kuwait' },
  { symbol: 'KNPC', name: 'Kuwait National Petroleum', name_arabic: 'البترول الوطنية الكويتية', country: 'Kuwait', country_code: 'KW', sector: 'Energy', industry: 'Oil & Gas Refining', market_cap: 5500000000, exchange: 'Boursa Kuwait', currency: 'KWD', ticker: 'KNPC.KW', description: 'Responsible for refining, gas liquefaction and distribution of petroleum products' },
  { symbol: 'IFA', name: 'IFA Hotels & Resorts', name_arabic: 'إيفا للفنادق والمنتجعات', country: 'Kuwait', country_code: 'KW', sector: 'Consumer Discretionary', industry: 'Hotels & Resorts', market_cap: 420000000, exchange: 'Boursa Kuwait', currency: 'KWD', ticker: 'IFA.KW', description: 'Developer and operator of hospitality and leisure properties' },

  // --- Real Estate ---
  { symbol: 'MABANEE', name: 'Mabanee Company', name_arabic: 'المباني', country: 'Kuwait', country_code: 'KW', sector: 'Real Estate', industry: 'Shopping Malls & Retail REIT', market_cap: 3500000000, exchange: 'Boursa Kuwait', currency: 'KWD', ticker: 'MABANEE.KW', description: 'Developer and operator of The Avenues, Kuwait\'s largest mall' },
  { symbol: 'SALHIA', name: 'Salhia Real Estate', name_arabic: 'صالحية العقارية', country: 'Kuwait', country_code: 'KW', sector: 'Real Estate', industry: 'Commercial Real Estate', market_cap: 850000000, exchange: 'Boursa Kuwait', currency: 'KWD', ticker: 'SALHIA.KW', description: 'Premium real estate developer focused on commercial and mixed-use properties in Kuwait' },
  { symbol: 'NREC', name: 'National Real Estate Company', name_arabic: 'العقارات الوطنية', country: 'Kuwait', country_code: 'KW', sector: 'Real Estate', industry: 'Real Estate Development', market_cap: 580000000, exchange: 'Boursa Kuwait', currency: 'KWD', ticker: 'NREC.KW', description: 'One of Kuwait\'s oldest real estate developers focused on residential and commercial projects' },

  // --- Materials ---
  { symbol: 'EQUATE', name: 'Equate Petrochemical', name_arabic: 'إيكويت للبتروكيماويات', country: 'Kuwait', country_code: 'KW', sector: 'Materials', industry: 'Petrochemicals', market_cap: 4200000000, exchange: 'Boursa Kuwait', currency: 'KWD', ticker: 'EQUATE.KW', description: 'Major producer of ethylene glycol and polyethylene in the Middle East' },
  { symbol: 'KCPC', name: 'Kuwait Cement Company', name_arabic: 'شركة الكويت للإسمنت', country: 'Kuwait', country_code: 'KW', sector: 'Materials', industry: 'Construction Materials', market_cap: 620000000, exchange: 'Boursa Kuwait', currency: 'KWD', ticker: 'KCPC.KW', description: 'Leading cement manufacturer in Kuwait producing Portland and sulfate-resistant cement' },

  // --- Consumer Staples ---
  { symbol: 'AMERICANA', name: 'Americana Restaurants', name_arabic: 'مطاعم أمريكانا', country: 'Kuwait', country_code: 'KW', sector: 'Consumer Discretionary', industry: 'Restaurants & Fast Food', market_cap: 5200000000, exchange: 'Boursa Kuwait', currency: 'KWD', ticker: 'AMERICANA.KW', description: 'Largest restaurant operating company in the Middle East with KFC, Pizza Hut and other brands' },
  { symbol: 'MEZZAN', name: 'Mezzan Holding', name_arabic: 'مزان القابضة', country: 'Kuwait', country_code: 'KW', sector: 'Consumer Staples', industry: 'Food Distribution', market_cap: 1200000000, exchange: 'Boursa Kuwait', currency: 'KWD', ticker: 'MEZZAN.KW', description: 'Largest food and FMCG production, manufacturing and distribution company in the Gulf' },

  // --- Healthcare ---
  { symbol: 'KPPC', name: 'Kuwait Pharmaceutical', name_arabic: 'الأدوية الكويتية', country: 'Kuwait', country_code: 'KW', sector: 'Healthcare', industry: 'Pharmaceuticals', market_cap: 350000000, exchange: 'Boursa Kuwait', currency: 'KWD', ticker: 'KPPC.KW', description: 'Pharmaceutical manufacturing and distribution company in Kuwait' },
  { symbol: 'DHAMAN', name: 'Health Assurance Hospitals (Dhaman)', name_arabic: 'ضمان للمستشفيات', country: 'Kuwait', country_code: 'KW', sector: 'Healthcare', industry: 'Healthcare Facilities', market_cap: 620000000, exchange: 'Boursa Kuwait', currency: 'KWD', ticker: 'DHAMAN.KW', description: 'Operator of health insurance hospitals serving expatriate workers in Kuwait' },

  // --- Utilities / Industrials ---
  { symbol: 'SHAMAL', name: 'Shamal Az-Zour Al-Oula Power', name_arabic: 'شمال الزور الأولى', country: 'Kuwait', country_code: 'KW', sector: 'Utilities', industry: 'Independent Power Producers', market_cap: 1800000000, exchange: 'Boursa Kuwait', currency: 'KWD', ticker: 'SHAMAL.KW', description: 'First independent power and water project in Kuwait' },
  { symbol: 'HEAVY', name: 'Heavy Engineering Industries', name_arabic: 'الصناعات الهندسية الثقيلة', country: 'Kuwait', country_code: 'KW', sector: 'Industrials', industry: 'Heavy Engineering', market_cap: 450000000, exchange: 'Boursa Kuwait', currency: 'KWD', ticker: 'HEAVY.KW', description: 'Manufacturer of oil and gas equipment and industrial steel structures' },

  // --- Additional Companies ---
  { symbol: 'UNITED', name: 'United Real Estate Company', name_arabic: 'العقارات المتحدة', country: 'Kuwait', country_code: 'KW', sector: 'Real Estate', industry: 'Diversified Real Estate', market_cap: 780000000, exchange: 'Boursa Kuwait', currency: 'KWD', ticker: 'UNITED.KW', description: 'One of the largest real estate companies in the Middle East with a diversified portfolio' },
  { symbol: 'ALIMTIAZ', name: 'Al Imtiaz Investment Group', name_arabic: 'الامتياز للاستثمار', country: 'Kuwait', country_code: 'KW', sector: 'Financials', industry: 'Diversified Financial Services', market_cap: 520000000, exchange: 'Boursa Kuwait', currency: 'KWD', ticker: 'ALIMTIAZ.KW', description: 'Diversified investment group with interests in real estate, energy and technology' }
];

// ---------------------------------------------------------------------------
// Qatar - 30 Companies (QSE, QAR, tickers end .QA)
// ---------------------------------------------------------------------------
const qatarCompanies = [
  // --- Financials / Banking ---
  { symbol: 'QNBK', name: 'Qatar National Bank (QNB)', name_arabic: 'بنك قطر الوطني', country: 'Qatar', country_code: 'QA', sector: 'Financials', industry: 'Banking', market_cap: 48000000000, exchange: 'QSE', currency: 'QAR', ticker: 'QNBK.QA', description: 'Largest financial institution in the Middle East and Africa by assets' },
  { symbol: 'QIIK', name: 'Qatar Islamic Bank', name_arabic: 'بنك قطر الإسلامي', country: 'Qatar', country_code: 'QA', sector: 'Financials', industry: 'Islamic Banking', market_cap: 11000000000, exchange: 'QSE', currency: 'QAR', ticker: 'QIIK.QA', description: 'Largest private bank in Qatar and one of the biggest Islamic banks in the world' },
  { symbol: 'CBQK', name: 'Commercial Bank of Qatar', name_arabic: 'البنك التجاري القطري', country: 'Qatar', country_code: 'QA', sector: 'Financials', industry: 'Banking', market_cap: 6200000000, exchange: 'QSE', currency: 'QAR', ticker: 'CBQK.QA', description: 'Second largest private bank in Qatar providing retail and corporate banking services' },
  { symbol: 'DHBK', name: 'Doha Bank', name_arabic: 'بنك الدوحة', country: 'Qatar', country_code: 'QA', sector: 'Financials', industry: 'Banking', market_cap: 3200000000, exchange: 'QSE', currency: 'QAR', ticker: 'DHBK.QA', description: 'One of the largest commercial banks in Qatar with international operations' },
  { symbol: 'MARK', name: 'Masraf Al Rayan', name_arabic: 'مصرف الريان', country: 'Qatar', country_code: 'QA', sector: 'Financials', industry: 'Islamic Banking', market_cap: 7200000000, exchange: 'QSE', currency: 'QAR', ticker: 'MARK.QA', description: 'Leading Sharia-compliant bank in Qatar and one of the world\'s largest Islamic banks' },
  { symbol: 'QNNS', name: 'Qatar Insurance Company', name_arabic: 'شركة قطر للتأمين', country: 'Qatar', country_code: 'QA', sector: 'Financials', industry: 'Insurance', market_cap: 2100000000, exchange: 'QSE', currency: 'QAR', ticker: 'QNNS.QA', description: 'Largest insurance company in Qatar and one of the leading insurers in the Middle East' },
  { symbol: 'QFBQ', name: 'Qatar First Bank', name_arabic: 'مصرف قطر الأول', country: 'Qatar', country_code: 'QA', sector: 'Financials', industry: 'Investment Banking', market_cap: 850000000, exchange: 'QSE', currency: 'QAR', ticker: 'QFBQ.QA', description: 'First independent Sharia-compliant investment bank in Qatar' },

  // --- Communication Services ---
  { symbol: 'ORDS', name: 'Ooredoo Group', name_arabic: 'مجموعة أوريدو', country: 'Qatar', country_code: 'QA', sector: 'Communication Services', industry: 'Telecommunications', market_cap: 15000000000, exchange: 'QSE', currency: 'QAR', ticker: 'ORDS.QA', description: 'International telecom company serving over 120 million customers across 10 countries' },
  { symbol: 'VFQS', name: 'Vodafone Qatar', name_arabic: 'فودافون قطر', country: 'Qatar', country_code: 'QA', sector: 'Communication Services', industry: 'Wireless Telecommunications', market_cap: 3800000000, exchange: 'QSE', currency: 'QAR', ticker: 'VFQS.QA', description: 'Second telecommunications operator in Qatar providing mobile, broadband and enterprise services' },

  // --- Energy ---
  { symbol: 'QGTS', name: 'Qatar Gas Transport (Nakilat)', name_arabic: 'ناقلات', country: 'Qatar', country_code: 'QA', sector: 'Energy', industry: 'LNG Shipping & Transport', market_cap: 8500000000, exchange: 'QSE', currency: 'QAR', ticker: 'QGTS.QA', description: 'Largest LNG shipping company in the world with a fleet of over 70 LNG carriers' },
  { symbol: 'QAMC', name: 'Qatar Aluminium Manufacturing (QAMCO)', name_arabic: 'شركة قطر لصناعة الألمنيوم', country: 'Qatar', country_code: 'QA', sector: 'Materials', industry: 'Aluminum', market_cap: 3200000000, exchange: 'QSE', currency: 'QAR', ticker: 'QAMC.QA', description: 'Largest aluminum producer in the Middle East outside the GCC' },
  { symbol: 'QFLS', name: 'Qatar Fuel Company (WOQOD)', name_arabic: 'وقود', country: 'Qatar', country_code: 'QA', sector: 'Energy', industry: 'Oil & Gas Refining & Marketing', market_cap: 5500000000, exchange: 'QSE', currency: 'QAR', ticker: 'QFLS.QA', description: 'Exclusive fuel distributor in Qatar operating the nation-wide fuel station network' },

  // --- Materials ---
  { symbol: 'IQCD', name: 'Industries Qatar', name_arabic: 'صناعات قطر', country: 'Qatar', country_code: 'QA', sector: 'Materials', industry: 'Diversified Industrials', market_cap: 18000000000, exchange: 'QSE', currency: 'QAR', ticker: 'IQCD.QA', description: 'One of the largest industrial companies in Qatar with interests in petrochemicals, fertilizers and steel' },
  { symbol: 'MPHC', name: 'Mesaieed Petrochemical Holding', name_arabic: 'مسيعيد للبتروكيماويات القابضة', country: 'Qatar', country_code: 'QA', sector: 'Materials', industry: 'Petrochemicals', market_cap: 4500000000, exchange: 'QSE', currency: 'QAR', ticker: 'MPHC.QA', description: 'Leading petrochemical holding company in Qatar with LDPE and other chemical production' },
  { symbol: 'QNCD', name: 'Qatar National Cement Company', name_arabic: 'إسمنت قطر الوطنية', country: 'Qatar', country_code: 'QA', sector: 'Materials', industry: 'Construction Materials', market_cap: 1200000000, exchange: 'QSE', currency: 'QAR', ticker: 'QNCD.QA', description: 'Largest cement producer in Qatar providing construction materials' },

  // --- Utilities ---
  { symbol: 'QEWS', name: 'Qatar Electricity & Water', name_arabic: 'كهرماء', country: 'Qatar', country_code: 'QA', sector: 'Utilities', industry: 'Multi-Utilities', market_cap: 7000000000, exchange: 'QSE', currency: 'QAR', ticker: 'QEWS.QA', description: 'Sole electricity and water provider in Qatar ensuring national energy security' },

  // --- Real Estate ---
  { symbol: 'BRES', name: 'Barwa Real Estate', name_arabic: 'بروة العقارية', country: 'Qatar', country_code: 'QA', sector: 'Real Estate', industry: 'Real Estate Development', market_cap: 4200000000, exchange: 'QSE', currency: 'QAR', ticker: 'BRES.QA', description: 'Major Qatari real estate company known for developing large-scale residential communities' },
  { symbol: 'ERES', name: 'Ezdan Holding Group', name_arabic: 'إزدان القابضة', country: 'Qatar', country_code: 'QA', sector: 'Real Estate', industry: 'Residential Real Estate', market_cap: 2800000000, exchange: 'QSE', currency: 'QAR', ticker: 'ERES.QA', description: 'One of the largest private real estate developers in Qatar and the Middle East' },
  { symbol: 'UDCD', name: 'United Development Company', name_arabic: 'المتحدة للتنمية', country: 'Qatar', country_code: 'QA', sector: 'Real Estate', industry: 'Mixed-Use Development', market_cap: 2200000000, exchange: 'QSE', currency: 'QAR', ticker: 'UDCD.QA', description: 'Developer of The Pearl-Qatar, a major mixed-use island community' },

  // --- Consumer ---
  { symbol: 'MCGS', name: 'Medicare Group', name_arabic: 'مجموعة ميديكير', country: 'Qatar', country_code: 'QA', sector: 'Healthcare', industry: 'Healthcare Facilities', market_cap: 680000000, exchange: 'QSE', currency: 'QAR', ticker: 'MCGS.QA', description: 'Private healthcare provider operating medical centers and pharmacies in Qatar' },
  { symbol: 'QISI', name: 'Qatar Industrial Manufacturing (QIMC)', name_arabic: 'الصناعية القطرية', country: 'Qatar', country_code: 'QA', sector: 'Industrials', industry: 'Industrial Conglomerates', market_cap: 1800000000, exchange: 'QSE', currency: 'QAR', ticker: 'QISI.QA', description: 'Diversified industrial company with interests in manufacturing, trading and services' },
  { symbol: 'GWCS', name: 'Gulf Warehousing Company', name_arabic: 'شركة الخليج للمخازن', country: 'Qatar', country_code: 'QA', sector: 'Industrials', industry: 'Warehousing & Logistics', market_cap: 950000000, exchange: 'QSE', currency: 'QAR', ticker: 'GWCS.QA', description: 'Largest logistics and warehousing company in Qatar' },
  { symbol: 'MCCS', name: 'Mannai Corporation', name_arabic: 'شركة منّاعي', country: 'Qatar', country_code: 'QA', sector: 'Industrials', industry: 'Trading & Distribution', market_cap: 1500000000, exchange: 'QSE', currency: 'QAR', ticker: 'MCCS.QA', description: 'Diversified conglomerate with auto dealerships, IT, and engineering services' },
  { symbol: 'ZHCD', name: 'Zad Holding Company', name_arabic: 'زاد القابضة', country: 'Qatar', country_code: 'QA', sector: 'Consumer Staples', industry: 'Food Products', market_cap: 1100000000, exchange: 'QSE', currency: 'QAR', ticker: 'ZHCD.QA', description: 'Major food conglomerate in Qatar producing flour, animal feed and dairy products' },
  { symbol: 'QNBFS', name: 'Dlala Brokerage & Investment', name_arabic: 'دلالة للوساطة والاستثمار', country: 'Qatar', country_code: 'QA', sector: 'Financials', industry: 'Brokerage & Capital Markets', market_cap: 320000000, exchange: 'QSE', currency: 'QAR', ticker: 'DBIS.QA', description: 'Financial brokerage firm providing investment and advisory services in Qatar' },
  { symbol: 'WDAM', name: 'Widam Food Company', name_arabic: 'ودام للأغذية', country: 'Qatar', country_code: 'QA', sector: 'Consumer Staples', industry: 'Meat & Livestock', market_cap: 450000000, exchange: 'QSE', currency: 'QAR', ticker: 'WDAM.QA', description: 'Qatar\'s leading livestock trader and meat processor ensuring national food security' },
  { symbol: 'QIMD', name: 'Qatar Islamic Insurance Group', name_arabic: 'الإسلامية القطرية للتأمين', country: 'Qatar', country_code: 'QA', sector: 'Financials', industry: 'Takaful Insurance', market_cap: 280000000, exchange: 'QSE', currency: 'QAR', ticker: 'QIMD.QA', description: 'Sharia-compliant insurance company providing takaful products in Qatar' },

  // --- Additional Companies ---
  { symbol: 'AKHI', name: 'Al Khaleej Takaful Insurance', name_arabic: 'الخليج للتكافل', country: 'Qatar', country_code: 'QA', sector: 'Financials', industry: 'Insurance', market_cap: 220000000, exchange: 'QSE', currency: 'QAR', ticker: 'AKHI.QA', description: 'Takaful insurance company providing Sharia-compliant insurance services in Qatar' },
  { symbol: 'QGMD', name: 'Qatari German Company for Medical Devices', name_arabic: 'القطرية الألمانية للأجهزة الطبية', country: 'Qatar', country_code: 'QA', sector: 'Healthcare', industry: 'Medical Devices', market_cap: 180000000, exchange: 'QSE', currency: 'QAR', ticker: 'QGMD.QA', description: 'Manufacturer and distributor of medical devices and laboratory equipment in Qatar' },
  { symbol: 'QNNS2', name: 'Qatar Navigation (Milaha)', name_arabic: 'ملاحة قطر', country: 'Qatar', country_code: 'QA', sector: 'Industrials', industry: 'Marine Transportation', market_cap: 3800000000, exchange: 'QSE', currency: 'QAR', ticker: 'QNNS2.QA', description: 'Diversified maritime and logistics company providing shipping, port and trading services' }
];

// ---------------------------------------------------------------------------
// Bahrain - 30 Companies (BHB, BHD, tickers end .BH)
// ---------------------------------------------------------------------------
const bahrainCompanies = [
  // --- Financials / Banking ---
  { symbol: 'AUB', name: 'Ahli United Bank', name_arabic: 'البنك الأهلي المتحد', country: 'Bahrain', country_code: 'BH', sector: 'Financials', industry: 'Banking', market_cap: 4200000000, exchange: 'BHB', currency: 'BHD', ticker: 'AUB.BH', description: 'Leading pan-Gulf retail and commercial bank with operations across 5 countries' },
  { symbol: 'NBB', name: 'National Bank of Bahrain', name_arabic: 'بنك البحرين الوطني', country: 'Bahrain', country_code: 'BH', sector: 'Financials', industry: 'Banking', market_cap: 2800000000, exchange: 'BHB', currency: 'BHD', ticker: 'NBB.BH', description: 'Oldest and one of the largest commercial banks in the Kingdom of Bahrain' },
  { symbol: 'BARKA', name: 'Al Baraka Banking Group', name_arabic: 'مجموعة البركة المصرفية', country: 'Bahrain', country_code: 'BH', sector: 'Financials', industry: 'Islamic Banking', market_cap: 1800000000, exchange: 'BHB', currency: 'BHD', ticker: 'BARKA.BH', description: 'International Islamic banking group with subsidiaries in 17 countries' },
  { symbol: 'BBK', name: 'Bank of Bahrain and Kuwait', name_arabic: 'بنك البحرين والكويت', country: 'Bahrain', country_code: 'BH', sector: 'Financials', industry: 'Banking', market_cap: 850000000, exchange: 'BHB', currency: 'BHD', ticker: 'BBK.BH', description: 'One of the oldest joint venture banks in the Gulf region' },
  { symbol: 'SALAM', name: 'Al Salam Bank', name_arabic: 'بنك السلام', country: 'Bahrain', country_code: 'BH', sector: 'Financials', industry: 'Islamic Banking', market_cap: 1500000000, exchange: 'BHB', currency: 'BHD', ticker: 'SALAM.BH', description: 'Leading Sharia-compliant bank in Bahrain focused on retail and corporate Islamic banking' },
  { symbol: 'BISB', name: 'Bahrain Islamic Bank', name_arabic: 'بنك البحرين الإسلامي', country: 'Bahrain', country_code: 'BH', sector: 'Financials', industry: 'Islamic Banking', market_cap: 480000000, exchange: 'BHB', currency: 'BHD', ticker: 'BISB.BH', description: 'Pioneer Islamic bank providing Sharia-compliant financial solutions in Bahrain' },
  { symbol: 'GFH', name: 'GFH Financial Group', name_arabic: 'مجموعة جي إف إتش المالية', country: 'Bahrain', country_code: 'BH', sector: 'Financials', industry: 'Investment Banking', market_cap: 1200000000, exchange: 'BHB', currency: 'BHD', ticker: 'GFH.BH', description: 'Islamic investment bank with commercial banking and real estate operations' },
  { symbol: 'ITHMR', name: 'Ithmaar Holding', name_arabic: 'إثمار القابضة', country: 'Bahrain', country_code: 'BH', sector: 'Financials', industry: 'Investment Holding', market_cap: 380000000, exchange: 'BHB', currency: 'BHD', ticker: 'ITHMR.BH', description: 'Bahrain-based investment holding company with diversified portfolio' },
  { symbol: 'SOLIDARITY', name: 'Solidarity Bahrain', name_arabic: 'سوليدرتي البحرين', country: 'Bahrain', country_code: 'BH', sector: 'Financials', industry: 'Takaful Insurance', market_cap: 180000000, exchange: 'BHB', currency: 'BHD', ticker: 'SOLIDARITY.BH', description: 'Leading Takaful (Islamic insurance) provider in the Kingdom of Bahrain' },
  { symbol: 'BKIC', name: 'Bahrain Kuwait Insurance', name_arabic: 'البحرين الكويت للتأمين', country: 'Bahrain', country_code: 'BH', sector: 'Financials', industry: 'Insurance', market_cap: 150000000, exchange: 'BHB', currency: 'BHD', ticker: 'BKIC.BH', description: 'Composite insurance company providing life and general insurance products' },

  // --- Communication Services ---
  { symbol: 'BATELCO', name: 'Bahrain Telecommunications (Batelco)', name_arabic: 'بتلكو', country: 'Bahrain', country_code: 'BH', sector: 'Communication Services', industry: 'Telecommunications', market_cap: 1200000000, exchange: 'BHB', currency: 'BHD', ticker: 'BATELCO.BH', description: 'Leading integrated telecom provider in Bahrain with regional operations' },
  { symbol: 'ZAINBH', name: 'Zain Bahrain', name_arabic: 'زين البحرين', country: 'Bahrain', country_code: 'BH', sector: 'Communication Services', industry: 'Wireless Telecommunications', market_cap: 280000000, exchange: 'BHB', currency: 'BHD', ticker: 'ZAIN.BH', description: 'Mobile telecommunications operator providing wireless services in Bahrain' },

  // --- Materials ---
  { symbol: 'ALBA', name: 'Aluminium Bahrain (Alba)', name_arabic: 'ألبا', country: 'Bahrain', country_code: 'BH', sector: 'Materials', industry: 'Aluminum', market_cap: 3500000000, exchange: 'BHB', currency: 'BHD', ticker: 'ALBA.BH', description: 'One of the largest aluminum smelters in the world and the largest in the Middle East' },
  { symbol: 'GPIC', name: 'Gulf Petrochemical Industries', name_arabic: 'الخليج لصناعة البتروكيماويات', country: 'Bahrain', country_code: 'BH', sector: 'Materials', industry: 'Petrochemicals', market_cap: 680000000, exchange: 'BHB', currency: 'BHD', ticker: 'GPIC.BH', description: 'Producer of methanol, ammonia and urea for export markets' },

  // --- Energy ---
  { symbol: 'BAPCO', name: 'Bapco Energies', name_arabic: 'بابكو للطاقات', country: 'Bahrain', country_code: 'BH', sector: 'Energy', industry: 'Integrated Oil & Gas', market_cap: 2200000000, exchange: 'BHB', currency: 'BHD', ticker: 'BAPCO.BH', description: 'National oil company of Bahrain engaged in exploration, refining and marketing of petroleum' },
  { symbol: 'NOGA', name: 'National Oil & Gas Authority', name_arabic: 'هيئة النفط والغاز الوطنية', country: 'Bahrain', country_code: 'BH', sector: 'Energy', industry: 'Oil & Gas Exploration', market_cap: 1400000000, exchange: 'BHB', currency: 'BHD', ticker: 'NOGA.BH', description: 'Bahrain\'s oil and gas regulatory authority and upstream operator' },

  // --- Real Estate ---
  { symbol: 'SEEF', name: 'Seef Properties', name_arabic: 'عقارات السيف', country: 'Bahrain', country_code: 'BH', sector: 'Real Estate', industry: 'Shopping Malls & Retail', market_cap: 480000000, exchange: 'BHB', currency: 'BHD', ticker: 'SEEF.BH', description: 'Developer and operator of shopping malls and commercial properties in Bahrain' },
  { symbol: 'ESTERAD', name: 'Esterad Investment Company', name_arabic: 'إستراد للاستثمار', country: 'Bahrain', country_code: 'BH', sector: 'Real Estate', industry: 'Real Estate Investment', market_cap: 120000000, exchange: 'BHB', currency: 'BHD', ticker: 'ESTERAD.BH', description: 'Real estate and venture capital investment company in Bahrain' },
  { symbol: 'INOVEST', name: 'Inovest', name_arabic: 'إنوفست', country: 'Bahrain', country_code: 'BH', sector: 'Real Estate', industry: 'Diversified Real Estate', market_cap: 240000000, exchange: 'BHB', currency: 'BHD', ticker: 'INOVEST.BH', description: 'Bahrain-based investment company focused on real estate, healthcare and hospitality' },

  // --- Utilities ---
  { symbol: 'EWA', name: 'Electricity & Water Authority', name_arabic: 'هيئة الكهرباء والماء', country: 'Bahrain', country_code: 'BH', sector: 'Utilities', industry: 'Multi-Utilities', market_cap: 580000000, exchange: 'BHB', currency: 'BHD', ticker: 'EWA.BH', description: 'Bahrain\'s electricity generation, transmission and water desalination utility' },

  // --- Consumer ---
  { symbol: 'BMMI', name: 'BMMI', name_arabic: 'بي إم إم آي', country: 'Bahrain', country_code: 'BH', sector: 'Consumer Staples', industry: 'Food Distribution', market_cap: 420000000, exchange: 'BHB', currency: 'BHD', ticker: 'BMMI.BH', description: 'Leading food and beverage distribution company in Bahrain with catering operations' },
  { symbol: 'TRAFCO', name: 'Trafco Group', name_arabic: 'مجموعة ترافكو', country: 'Bahrain', country_code: 'BH', sector: 'Consumer Staples', industry: 'Food Products', market_cap: 180000000, exchange: 'BHB', currency: 'BHD', ticker: 'TRAFCO.BH', description: 'Diversified food manufacturing and distribution group in Bahrain' },
  { symbol: 'DELMON', name: 'Delmon Poultry', name_arabic: 'دواجن دلمون', country: 'Bahrain', country_code: 'BH', sector: 'Consumer Staples', industry: 'Poultry & Meat Processing', market_cap: 85000000, exchange: 'BHB', currency: 'BHD', ticker: 'DELMON.BH', description: 'Major poultry producer and processor in the Kingdom of Bahrain' },

  // --- Industrials ---
  { symbol: 'APM', name: 'APM Terminals Bahrain', name_arabic: 'إي بي إم تيرمنالز البحرين', country: 'Bahrain', country_code: 'BH', sector: 'Industrials', industry: 'Port & Terminal Operations', market_cap: 320000000, exchange: 'BHB', currency: 'BHD', ticker: 'APM.BH', description: 'Operator of container and general cargo terminal at Khalifa Bin Salman Port' },
  { symbol: 'GASS', name: 'Bahrain National Gas (Banagas)', name_arabic: 'بناغاز', country: 'Bahrain', country_code: 'BH', sector: 'Energy', industry: 'Gas Processing', market_cap: 650000000, exchange: 'BHB', currency: 'BHD', ticker: 'GASS.BH', description: 'Gas processing company separating associated gas from oil production' },

  // --- Healthcare ---
  { symbol: 'BFMC', name: 'Bahrain Family Medical Center', name_arabic: 'مركز البحرين الطبي العائلي', country: 'Bahrain', country_code: 'BH', sector: 'Healthcare', industry: 'Healthcare Facilities', market_cap: 95000000, exchange: 'BHB', currency: 'BHD', ticker: 'BFMC.BH', description: 'Private healthcare provider operating medical clinics and diagnostic centers' },
  { symbol: 'BPHARMA', name: 'Bahrain Pharma', name_arabic: 'البحرين فارما', country: 'Bahrain', country_code: 'BH', sector: 'Healthcare', industry: 'Pharmaceuticals', market_cap: 65000000, exchange: 'BHB', currency: 'BHD', ticker: 'BPHARMA.BH', description: 'Pharmaceutical manufacturing and distribution company in the Kingdom of Bahrain' },

  // --- Tourism / Hotels ---
  { symbol: 'BHOTEL', name: 'Bahrain Hotels Company', name_arabic: 'فنادق البحرين', country: 'Bahrain', country_code: 'BH', sector: 'Consumer Discretionary', industry: 'Hotels & Resorts', market_cap: 120000000, exchange: 'BHB', currency: 'BHD', ticker: 'BHOTEL.BH', description: 'Hospitality company operating hotels and resorts in the Kingdom of Bahrain' },
  { symbol: 'NASS', name: 'Nass Corporation', name_arabic: 'مجموعة ناس', country: 'Bahrain', country_code: 'BH', sector: 'Industrials', industry: 'Construction & Engineering', market_cap: 280000000, exchange: 'BHB', currency: 'BHD', ticker: 'NASS.BH', description: 'Leading construction, manufacturing and services conglomerate in Bahrain' },

  // --- Technology ---
  { symbol: 'BNET', name: 'Bahrain Network (BNET)', name_arabic: 'شبكة البحرين', country: 'Bahrain', country_code: 'BH', sector: 'Information Technology', industry: 'Internet Infrastructure', market_cap: 320000000, exchange: 'BHB', currency: 'BHD', ticker: 'BNET.BH', description: 'National broadband network operator providing wholesale internet infrastructure services' }
];

// ---------------------------------------------------------------------------
// Oman - 30 Companies (MSM, OMR, tickers end .OM)
// ---------------------------------------------------------------------------
const omanCompanies = [
  // --- Financials / Banking ---
  { symbol: 'BKMB', name: 'Bank Muscat', name_arabic: 'بنك مسقط', country: 'Oman', country_code: 'OM', sector: 'Financials', industry: 'Banking', market_cap: 3500000000, exchange: 'MSM', currency: 'OMR', ticker: 'BKMB.OM', description: 'Largest bank in Oman and one of the most profitable banks in the Gulf region' },
  { symbol: 'BKSB', name: 'Bank Sohar', name_arabic: 'بنك صحار الدولي', country: 'Oman', country_code: 'OM', sector: 'Financials', industry: 'Banking', market_cap: 950000000, exchange: 'MSM', currency: 'OMR', ticker: 'BKSB.OM', description: 'Major commercial bank providing corporate, retail and Islamic banking services' },
  { symbol: 'BKDB', name: 'Bank Dhofar', name_arabic: 'بنك ظفار', country: 'Oman', country_code: 'OM', sector: 'Financials', industry: 'Banking', market_cap: 1200000000, exchange: 'MSM', currency: 'OMR', ticker: 'BKDB.OM', description: 'Second largest bank in Oman serving retail, corporate and private banking clients' },
  { symbol: 'NBOB', name: 'National Bank of Oman', name_arabic: 'البنك الوطني العماني', country: 'Oman', country_code: 'OM', sector: 'Financials', industry: 'Banking', market_cap: 1050000000, exchange: 'MSM', currency: 'OMR', ticker: 'NBOB.OM', description: 'Oldest indigenous commercial bank in the Sultanate of Oman' },
  { symbol: 'ABOB', name: 'Alizz Islamic Bank', name_arabic: 'بنك العز الإسلامي', country: 'Oman', country_code: 'OM', sector: 'Financials', industry: 'Islamic Banking', market_cap: 320000000, exchange: 'MSM', currency: 'OMR', ticker: 'ABOB.OM', description: 'Sharia-compliant bank providing Islamic financial products in Oman' },
  { symbol: 'DHOFAR', name: 'Dhofar Insurance', name_arabic: 'ظفار للتأمين', country: 'Oman', country_code: 'OM', sector: 'Financials', industry: 'Insurance', market_cap: 180000000, exchange: 'MSM', currency: 'OMR', ticker: 'DHOFAR.OM', description: 'Leading insurance company in Oman providing comprehensive insurance solutions' },
  { symbol: 'ONIC', name: 'Oman National Investment Corporation', name_arabic: 'عمان الوطنية للاستثمار', country: 'Oman', country_code: 'OM', sector: 'Financials', industry: 'Investment Services', market_cap: 280000000, exchange: 'MSM', currency: 'OMR', ticker: 'ONIC.OM', description: 'Government-backed investment company focused on strategic sectors in Oman' },

  // --- Communication Services ---
  { symbol: 'OTEL', name: 'Omantel', name_arabic: 'عمانتل', country: 'Oman', country_code: 'OM', sector: 'Communication Services', industry: 'Telecommunications', market_cap: 2800000000, exchange: 'MSM', currency: 'OMR', ticker: 'OTEL.OM', description: 'Largest telecom provider in Oman and a major shareholder of Zain Group' },
  { symbol: 'OORD', name: 'Ooredoo Oman', name_arabic: 'أوريدو عمان', country: 'Oman', country_code: 'OM', sector: 'Communication Services', industry: 'Wireless Telecommunications', market_cap: 1200000000, exchange: 'MSM', currency: 'OMR', ticker: 'OORD.OM', description: 'Second telecom operator in Oman providing mobile and broadband services' },

  // --- Energy ---
  { symbol: 'OQEP', name: 'OQ Exploration & Production', name_arabic: 'أوكيو للاستكشاف والإنتاج', country: 'Oman', country_code: 'OM', sector: 'Energy', industry: 'Oil & Gas Exploration', market_cap: 2200000000, exchange: 'MSM', currency: 'OMR', ticker: 'OQEP.OM', description: 'Government-owned company engaged in oil and gas exploration and production in Oman' },
  { symbol: 'OQGS', name: 'OQ Gas Networks (OQGN)', name_arabic: 'أوكيو لشبكات الغاز', country: 'Oman', country_code: 'OM', sector: 'Energy', industry: 'Gas Transmission & Distribution', market_cap: 1800000000, exchange: 'MSM', currency: 'OMR', ticker: 'OQGS.OM', description: 'Operator of Oman\'s natural gas transportation pipeline network' },
  { symbol: 'SHELL', name: 'Shell Oman Marketing', name_arabic: 'شل عمان للتسويق', country: 'Oman', country_code: 'OM', sector: 'Energy', industry: 'Oil & Gas Refining & Marketing', market_cap: 420000000, exchange: 'MSM', currency: 'OMR', ticker: 'SHELL.OM', description: 'Marketer and distributor of petroleum products and lubricants in Oman' },
  { symbol: 'ARLO', name: 'Al Jazeera Services', name_arabic: 'خدمات الجزيرة', country: 'Oman', country_code: 'OM', sector: 'Energy', industry: 'Oilfield Services', market_cap: 250000000, exchange: 'MSM', currency: 'OMR', ticker: 'ARLO.OM', description: 'Oilfield services company providing drilling, workover and well services in Oman' },

  // --- Utilities ---
  { symbol: 'NAMA', name: 'Nama Holding', name_arabic: 'نماء القابضة', country: 'Oman', country_code: 'OM', sector: 'Utilities', industry: 'Multi-Utilities', market_cap: 1500000000, exchange: 'MSM', currency: 'OMR', ticker: 'NAMA.OM', description: 'Government holding company overseeing electricity and related water companies in Oman' },
  { symbol: 'ALBUSTAN', name: 'Al Batinah Power', name_arabic: 'الباطنة للطاقة', country: 'Oman', country_code: 'OM', sector: 'Utilities', industry: 'Independent Power Producers', market_cap: 480000000, exchange: 'MSM', currency: 'OMR', ticker: 'ALBUSTAN.OM', description: 'Independent power producer operating electricity generation plants in Oman' },

  // --- Materials ---
  { symbol: 'RAYSUT', name: 'Raysut Cement', name_arabic: 'أسمنت ريسوت', country: 'Oman', country_code: 'OM', sector: 'Materials', industry: 'Construction Materials', market_cap: 420000000, exchange: 'MSM', currency: 'OMR', ticker: 'RAYSUT.OM', description: 'Largest cement company in Oman with production capacity exceeding 5 million tonnes' },
  { symbol: 'OCAI', name: 'Oman Cables Industry', name_arabic: 'صناعة الكابلات العمانية', country: 'Oman', country_code: 'OM', sector: 'Materials', industry: 'Electrical Equipment', market_cap: 180000000, exchange: 'MSM', currency: 'OMR', ticker: 'OCAI.OM', description: 'Leading manufacturer of power cables and conductors in the Sultanate of Oman' },
  { symbol: 'OCROM', name: 'Oman Chromite Company', name_arabic: 'كروميت عمان', country: 'Oman', country_code: 'OM', sector: 'Materials', industry: 'Mining & Metals', market_cap: 95000000, exchange: 'MSM', currency: 'OMR', ticker: 'OCROM.OM', description: 'Mining company focused on chromite ore extraction and processing in Oman' },

  // --- Real Estate ---
  { symbol: 'OURE', name: 'Al Jazeera Real Estate', name_arabic: 'الجزيرة العقارية', country: 'Oman', country_code: 'OM', sector: 'Real Estate', industry: 'Real Estate Development', market_cap: 220000000, exchange: 'MSM', currency: 'OMR', ticker: 'OURE.OM', description: 'Real estate development company focused on residential and commercial projects' },
  { symbol: 'OMRE', name: 'Muscat National Development & Investment (Asaas)', name_arabic: 'أساس', country: 'Oman', country_code: 'OM', sector: 'Real Estate', industry: 'Diversified Real Estate', market_cap: 350000000, exchange: 'MSM', currency: 'OMR', ticker: 'OMRE.OM', description: 'Major real estate and investment company developing commercial and residential properties' },

  // --- Consumer ---
  { symbol: 'OFMI', name: 'Oman Fisheries', name_arabic: 'الأسماك العمانية', country: 'Oman', country_code: 'OM', sector: 'Consumer Staples', industry: 'Fisheries & Aquaculture', market_cap: 120000000, exchange: 'MSM', currency: 'OMR', ticker: 'OFMI.OM', description: 'Leading fisheries company in Oman engaged in fish processing and export' },
  { symbol: 'OFLOUR', name: 'Oman Flour Mills', name_arabic: 'مطاحن عمان', country: 'Oman', country_code: 'OM', sector: 'Consumer Staples', industry: 'Food Products', market_cap: 180000000, exchange: 'MSM', currency: 'OMR', ticker: 'OFLOUR.OM', description: 'Major flour milling and food production company ensuring food security in Oman' },
  { symbol: 'SALALAH', name: 'Salalah Mills', name_arabic: 'مطاحن صلالة', country: 'Oman', country_code: 'OM', sector: 'Consumer Staples', industry: 'Food Products', market_cap: 85000000, exchange: 'MSM', currency: 'OMR', ticker: 'SALALAH.OM', description: 'Flour milling and animal feed production company in southern Oman' },

  // --- Industrials ---
  { symbol: 'OMINVEST', name: 'Ominvest', name_arabic: 'أومنفست', country: 'Oman', country_code: 'OM', sector: 'Financials', industry: 'Diversified Financial Services', market_cap: 850000000, exchange: 'MSM', currency: 'OMR', ticker: 'OMINVEST.OM', description: 'Largest investment company in Oman with interests in banking, insurance and real estate' },
  { symbol: 'ASYAD', name: 'Asyad Shipping (formerly Oman Shipping)', name_arabic: 'أسياد للشحن', country: 'Oman', country_code: 'OM', sector: 'Industrials', industry: 'Marine Shipping', market_cap: 380000000, exchange: 'MSM', currency: 'OMR', ticker: 'ASYAD.OM', description: 'National shipping company providing oil and dry cargo transport services' },
  { symbol: 'GALFAR', name: 'Galfar Engineering & Contracting', name_arabic: 'جلفار للهندسة والمقاولات', country: 'Oman', country_code: 'OM', sector: 'Industrials', industry: 'Construction & Engineering', market_cap: 280000000, exchange: 'MSM', currency: 'OMR', ticker: 'GALFAR.OM', description: 'Largest construction and engineering company in the Sultanate of Oman' },

  // --- Healthcare ---
  { symbol: 'OAPH', name: 'Oman Pharmaceutical Products', name_arabic: 'المنتجات الدوائية العمانية', country: 'Oman', country_code: 'OM', sector: 'Healthcare', industry: 'Pharmaceuticals', market_cap: 65000000, exchange: 'MSM', currency: 'OMR', ticker: 'OAPH.OM', description: 'Pharmaceutical manufacturing and distribution company in Oman' },

  // --- Transport ---
  { symbol: 'OAMC', name: 'Oman Aviation Services', name_arabic: 'خدمات الطيران العمانية', country: 'Oman', country_code: 'OM', sector: 'Industrials', industry: 'Airport Services', market_cap: 220000000, exchange: 'MSM', currency: 'OMR', ticker: 'OAMC.OM', description: 'Provider of ground handling and cargo services at Oman\'s airports' },

  // --- Additional Companies ---
  { symbol: 'ACWA', name: 'Acwa Power Barka', name_arabic: 'أكوا باور بركاء', country: 'Oman', country_code: 'OM', sector: 'Utilities', industry: 'Water Desalination', market_cap: 350000000, exchange: 'MSM', currency: 'OMR', ticker: 'ACWA.OM', description: 'Independent water and power producer operating desalination and power generation plants' },
  { symbol: 'OMAN', name: 'Oman Oil Marketing Company', name_arabic: 'النفط العمانية للتسويق', country: 'Oman', country_code: 'OM', sector: 'Energy', industry: 'Fuel Distribution', market_cap: 520000000, exchange: 'MSM', currency: 'OMR', ticker: 'OMAN.OM', description: 'Leading fuel distributor in the Sultanate with a network of service stations nationwide' }
];

// ---------------------------------------------------------------------------
// Combine all companies
// ---------------------------------------------------------------------------
const companies = [
  ...saudiCompanies,
  ...uaeCompanies,
  ...kuwaitCompanies,
  ...qatarCompanies,
  ...bahrainCompanies,
  ...omanCompanies
];

// ---------------------------------------------------------------------------
// Sector-based metric generation parameters
// ---------------------------------------------------------------------------
const SECTOR_PROFILES = {
  'Energy': {
    revenueMultiplier: 0.45,      // Revenue as fraction of market cap
    netMarginRange: [0.08, 0.22], // Net income / Revenue
    assetMultiplier: 0.55,        // Total assets as fraction of market cap
    equityRatio: [0.35, 0.55],    // Equity / Assets
    peRange: [10, 18],
    debtToEquityRange: [0.3, 0.9],
    currentRatioRange: [1.1, 1.8]
  },
  'Financials': {
    revenueMultiplier: 0.08,
    netMarginRange: [0.25, 0.45],
    assetMultiplier: 8.0,         // Banks have much higher assets to market cap
    equityRatio: [0.08, 0.16],
    peRange: [8, 16],
    debtToEquityRange: [5.0, 12.0], // Banks are highly leveraged
    currentRatioRange: [1.0, 1.3]
  },
  'Materials': {
    revenueMultiplier: 0.35,
    netMarginRange: [0.06, 0.18],
    assetMultiplier: 0.65,
    equityRatio: [0.40, 0.60],
    peRange: [10, 20],
    debtToEquityRange: [0.2, 0.8],
    currentRatioRange: [1.2, 2.0]
  },
  'Communication Services': {
    revenueMultiplier: 0.22,
    netMarginRange: [0.12, 0.28],
    assetMultiplier: 0.60,
    equityRatio: [0.35, 0.55],
    peRange: [12, 22],
    debtToEquityRange: [0.3, 1.2],
    currentRatioRange: [0.8, 1.5]
  },
  'Consumer Staples': {
    revenueMultiplier: 0.55,
    netMarginRange: [0.05, 0.14],
    assetMultiplier: 0.50,
    equityRatio: [0.40, 0.60],
    peRange: [15, 28],
    debtToEquityRange: [0.2, 0.7],
    currentRatioRange: [1.3, 2.2]
  },
  'Consumer Discretionary': {
    revenueMultiplier: 0.50,
    netMarginRange: [0.06, 0.16],
    assetMultiplier: 0.55,
    equityRatio: [0.35, 0.55],
    peRange: [14, 26],
    debtToEquityRange: [0.3, 1.0],
    currentRatioRange: [1.1, 2.0]
  },
  'Real Estate': {
    revenueMultiplier: 0.12,
    netMarginRange: [0.20, 0.40],
    assetMultiplier: 1.20,
    equityRatio: [0.30, 0.55],
    peRange: [10, 20],
    debtToEquityRange: [0.4, 1.5],
    currentRatioRange: [1.0, 1.8]
  },
  'Utilities': {
    revenueMultiplier: 0.30,
    netMarginRange: [0.08, 0.18],
    assetMultiplier: 1.10,
    equityRatio: [0.25, 0.45],
    peRange: [12, 20],
    debtToEquityRange: [0.8, 2.0],
    currentRatioRange: [0.8, 1.4]
  },
  'Industrials': {
    revenueMultiplier: 0.40,
    netMarginRange: [0.05, 0.15],
    assetMultiplier: 0.60,
    equityRatio: [0.35, 0.55],
    peRange: [12, 22],
    debtToEquityRange: [0.3, 1.2],
    currentRatioRange: [1.1, 1.9]
  },
  'Healthcare': {
    revenueMultiplier: 0.35,
    netMarginRange: [0.08, 0.20],
    assetMultiplier: 0.55,
    equityRatio: [0.40, 0.60],
    peRange: [18, 32],
    debtToEquityRange: [0.2, 0.8],
    currentRatioRange: [1.3, 2.5]
  },
  'Information Technology': {
    revenueMultiplier: 0.30,
    netMarginRange: [0.12, 0.30],
    assetMultiplier: 0.45,
    equityRatio: [0.50, 0.70],
    peRange: [20, 40],
    debtToEquityRange: [0.05, 0.5],
    currentRatioRange: [1.5, 3.0]
  }
};

// Default profile for any sectors not explicitly listed
const DEFAULT_PROFILE = {
  revenueMultiplier: 0.30,
  netMarginRange: [0.08, 0.18],
  assetMultiplier: 0.60,
  equityRatio: [0.35, 0.55],
  peRange: [12, 22],
  debtToEquityRange: [0.3, 1.0],
  currentRatioRange: [1.1, 1.8]
};

// ---------------------------------------------------------------------------
// Deterministic pseudo-random number generator (seeded by company symbol)
// Ensures the same company always gets the same metrics
// ---------------------------------------------------------------------------
function seededRandom(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  // Return a function that produces deterministic "random" values
  return function () {
    hash = (hash * 1664525 + 1013904223) & 0x7fffffff;
    return hash / 0x7fffffff;
  };
}

function randomInRange(rng, min, max) {
  return min + rng() * (max - min);
}

function roundTo(value, decimals) {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

// ---------------------------------------------------------------------------
// generateMetrics(company)
// Produces realistic financial metrics for a given company object based on
// its sector and market_cap. Uses a deterministic seeded RNG so the same
// company always generates the same numbers.
// ---------------------------------------------------------------------------
function generateMetrics(company) {
  const profile = SECTOR_PROFILES[company.sector] || DEFAULT_PROFILE;
  const rng = seededRandom(company.symbol + company.country_code);

  const marketCap = company.market_cap;

  // Revenue
  const revenueVariance = randomInRange(rng, 0.8, 1.2);
  const revenue = Math.round(marketCap * profile.revenueMultiplier * revenueVariance);

  // Net income
  const netMargin = randomInRange(rng, profile.netMarginRange[0], profile.netMarginRange[1]);
  const netIncome = Math.round(revenue * netMargin);

  // Total assets
  const assetVariance = randomInRange(rng, 0.85, 1.15);
  const totalAssets = Math.round(marketCap * profile.assetMultiplier * assetVariance);

  // Shareholders' equity
  const equityRatio = randomInRange(rng, profile.equityRatio[0], profile.equityRatio[1]);
  const totalEquity = Math.round(totalAssets * equityRatio);

  // Total debt (liabilities)
  const totalDebt = totalAssets - totalEquity;

  // Derived ratios
  const roe = roundTo((netIncome / totalEquity) * 100, 2);  // Return on Equity (%)
  const roa = roundTo((netIncome / totalAssets) * 100, 2);   // Return on Assets (%)

  // P/E ratio
  const peRatio = roundTo(randomInRange(rng, profile.peRange[0], profile.peRange[1]), 2);

  // EPS (earnings per share) — approximate shares outstanding from market cap / assumed price
  const assumedPrice = randomInRange(rng, 5, 200);
  const sharesOutstanding = Math.round(marketCap / assumedPrice);
  const eps = roundTo(netIncome / sharesOutstanding, 2);

  // Debt to Equity
  const debtToEquity = roundTo(
    randomInRange(rng, profile.debtToEquityRange[0], profile.debtToEquityRange[1]),
    2
  );

  // Current Ratio
  const currentRatio = roundTo(
    randomInRange(rng, profile.currentRatioRange[0], profile.currentRatioRange[1]),
    2
  );

  // Operating cash flow (typically 1.1x - 1.5x net income for healthy companies)
  const ocfMultiplier = randomInRange(rng, 1.05, 1.55);
  const operatingCashFlow = Math.round(netIncome * ocfMultiplier);

  // Free cash flow (60-85% of operating cash flow)
  const fcfRatio = randomInRange(rng, 0.55, 0.85);
  const freeCashFlow = Math.round(operatingCashFlow * fcfRatio);

  // Dividend yield (GCC companies tend to be generous dividend payers)
  const dividendYield = roundTo(randomInRange(rng, 1.5, 6.5), 2);

  // Revenue growth (year-over-year)
  const revenueGrowth = roundTo(randomInRange(rng, -5, 18), 2);

  return {
    company_symbol: company.symbol,
    company_name: company.name,
    country: company.country,
    sector: company.sector,
    industry: company.industry,
    year: 2024,
    revenue,
    net_income: netIncome,
    total_assets: totalAssets,
    total_equity: totalEquity,
    total_debt: totalDebt,
    roe,
    roa,
    pe_ratio: peRatio,
    eps,
    debt_to_equity: debtToEquity,
    current_ratio: currentRatio,
    operating_cash_flow: operatingCashFlow,
    free_cash_flow: freeCashFlow,
    dividend_yield: dividendYield,
    revenue_growth: revenueGrowth
  };
}

// ---------------------------------------------------------------------------
// Generate metrics for all companies at once
// ---------------------------------------------------------------------------
function generateAllMetrics() {
  return companies.map(generateMetrics);
}

// ---------------------------------------------------------------------------
// Helper: get companies by country
// ---------------------------------------------------------------------------
function getCompaniesByCountry(countryName) {
  return companies.filter(c => c.country === countryName);
}

// ---------------------------------------------------------------------------
// Helper: get companies by sector
// ---------------------------------------------------------------------------
function getCompaniesBySector(sectorName) {
  return companies.filter(c => c.sector === sectorName);
}

// ---------------------------------------------------------------------------
// Helper: summary statistics
// ---------------------------------------------------------------------------
function getSummary() {
  const byCountry = {};
  const bySector = {};

  companies.forEach(c => {
    byCountry[c.country] = (byCountry[c.country] || 0) + 1;
    bySector[c.sector] = (bySector[c.sector] || 0) + 1;
  });

  return {
    totalCompanies: companies.length,
    totalIndexes: indexes.length,
    byCountry,
    bySector
  };
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------
module.exports = {
  companies,
  indexes,
  saudiCompanies,
  uaeCompanies,
  kuwaitCompanies,
  qatarCompanies,
  bahrainCompanies,
  omanCompanies,
  generateMetrics,
  generateAllMetrics,
  getCompaniesByCountry,
  getCompaniesBySector,
  getSummary,
  SECTOR_PROFILES
};
