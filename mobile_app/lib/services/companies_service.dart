import 'dart:math';

/// Sharia compliance status, mirrors the web's 3-level enum.
enum ShariaStatus { compliant, watch, nonCompliant }

/// Financial metrics shown across the 4 metric groups on CompanyProfile.
class CompanyFinancials {
  final double peRatio;
  final double pbRatio;
  final double psRatio;
  final double evEbitda;
  final double roe;
  final double roa;
  final double netProfitMargin;
  final double grossMargin;
  final double debtToEquity;
  final double beta;
  final double currentRatio;
  final double interestCoverage;
  final double dividendYield;
  final double payoutRatio;
  final double revenueGrowth;
  final double earningsGrowth;

  const CompanyFinancials({
    required this.peRatio,
    required this.pbRatio,
    required this.psRatio,
    required this.evEbitda,
    required this.roe,
    required this.roa,
    required this.netProfitMargin,
    required this.grossMargin,
    required this.debtToEquity,
    required this.beta,
    required this.currentRatio,
    required this.interestCoverage,
    required this.dividendYield,
    required this.payoutRatio,
    required this.revenueGrowth,
    required this.earningsGrowth,
  });
}

class AnnualReport {
  final String id;
  final String title;
  final int year;
  const AnnualReport({required this.id, required this.title, required this.year});
}

class Company {
  final String id;
  final String name;
  final String ticker;
  final String country; // SA/AE/QA/KW/BH/OM
  final String sector;
  final String currency;
  final double price;
  final double change;
  final CompanyFinancials financials;
  final List<AnnualReport> reports;
  final ShariaStatus sharia;

  const Company({
    required this.id,
    required this.name,
    required this.ticker,
    required this.country,
    required this.sector,
    required this.currency,
    required this.price,
    required this.change,
    required this.financials,
    required this.reports,
    required this.sharia,
  });
}

/// Deterministic seeded generators mirror `generatePriceHistory` and
/// `generateRatings` in `CompanyProfilePage.jsx` — same hash algorithm.
class CompaniesService {
  static int _hash(String s) {
    var h = 0;
    for (final c in s.codeUnits) {
      h = ((h << 5) - h + c) & 0xFFFFFFFF;
      if ((h & 0x80000000) != 0) h -= 0x100000000;
    }
    return h;
  }

  /// Deterministic price history over `days`, mirrors the React walk.
  static List<double> priceHistory(String name, int days) {
    final hash = _hash(name).abs();
    final basePrice = 10.0 + (hash % 200);
    var price = basePrice;
    final out = <double>[];
    for (var i = days; i >= 0; i--) {
      final seed = (hash * (i + 1) * 9301 + 49297) % 233280;
      final rnd = seed / 233280.0;
      final change = (rnd - 0.48) * basePrice * 0.03;
      price = max(basePrice * 0.5, price + change);
      out.add((price * 100).roundToDouble() / 100);
    }
    return out;
  }

  /// Deterministic analyst ratings, mirrors React `generateRatings(name)`.
  static AnalystRatings ratings(String name) {
    final hash = _hash(name).abs();
    final total = 8 + (hash % 8);
    final buyPct = 40 + (hash % 35);
    final sellPct = 5 + ((hash >> 4) % 15);
    final buy = (total * buyPct / 100).round();
    final sell = max(1, (total * sellPct / 100).round());
    final hold = (total - buy - sell).clamp(0, total);
    final consensus =
        buy > (hold + sell) ? 'Buy' : (hold > buy ? 'Hold' : 'Buy');
    final currentPrice = 10.0 + (hash % 200);
    final targetPrice = currentPrice * (1 + (0.05 + (hash % 25) / 100));
    return AnalystRatings(
      buy: buy,
      hold: hold,
      sell: sell,
      total: total,
      consensus: consensus,
      currentPrice: currentPrice,
      targetPrice: (targetPrice * 100).roundToDouble() / 100,
    );
  }

  /// Sharia hash-based rule — mirrors the general React behaviour where
  /// `getShariaStatus(name)` returns one of three buckets.
  static ShariaStatus sharia(String name) {
    final n = _hash(name).abs() % 10;
    if (n >= 7) return ShariaStatus.nonCompliant;
    if (n >= 5) return ShariaStatus.watch;
    return ShariaStatus.compliant;
  }

  static CompanyFinancials _financials(String name) {
    final h = _hash(name).abs();
    double v(int seed, double min, double max) {
      final s = ((h * (seed + 7)) + seed * 9301) % 100000;
      return min + (s / 100000.0) * (max - min);
    }

    return CompanyFinancials(
      peRatio: v(1, 5, 35),
      pbRatio: v(2, 0.8, 6),
      psRatio: v(3, 0.5, 8),
      evEbitda: v(4, 4, 20),
      roe: v(5, 4, 28),
      roa: v(6, 1, 18),
      netProfitMargin: v(7, 3, 32),
      grossMargin: v(8, 12, 65),
      debtToEquity: v(9, 0.1, 2.5),
      beta: v(10, 0.4, 1.6),
      currentRatio: v(11, 0.8, 3.5),
      interestCoverage: v(12, 1.5, 18),
      dividendYield: v(13, 0, 7),
      payoutRatio: v(14, 15, 85),
      revenueGrowth: v(15, -4, 22),
      earningsGrowth: v(16, -8, 30),
    );
  }

  static List<AnnualReport> _reports(String ticker, int years) {
    final now = DateTime.now().year;
    return List.generate(
      years,
      (i) => AnnualReport(
        id: '$ticker-${now - i}',
        title: '$ticker Annual Report ${now - i}',
        year: now - i,
      ),
    );
  }

  /// Seed catalog — 12 companies across all six GCC markets. Used when the
  /// backend isn't reachable. Prices/changes come from the mock.
  static final List<Company> _seed = [
    _mk('2222.SR', 'Saudi Aramco', 'SA', 'Energy', 'SAR', 28.45, 3.82),
    _mk('1120.SR', 'Al Rajhi Bank', 'SA', 'Banking', 'SAR', 95.20, 2.54),
    _mk('2010.SR', 'SABIC', 'SA', 'Materials', 'SAR', 72.10, -2.41),
    _mk('7010.SR', 'STC', 'SA', 'Telecom', 'SAR', 42.60, 1.08),
    _mk('EMAAR.AE', 'Emaar Properties', 'AE', 'Real Estate', 'AED', 8.76, 2.11),
    _mk('DIB.AE', 'Dubai Islamic Bank', 'AE', 'Banking', 'AED', 6.22, -1.85),
    _mk('QNBK.QA', 'Qatar National Bank', 'QA', 'Banking', 'QAR', 14.30, 1.89),
    _mk('ORDS.QA', 'Ooredoo', 'QA', 'Telecom', 'QAR', 9.45, -1.33),
    _mk('NBK.KW', 'National Bank of Kuwait', 'KW', 'Banking', 'KWD', 1.02, 1.52),
    _mk('ZAIN.KW', 'Zain Group', 'KW', 'Telecom', 'KWD', 0.58, -1.12),
    _mk('AUB.BH', 'Ahli United Bank', 'BH', 'Banking', 'BHD', 0.81, -0.94),
    _mk('OTEL.OM', 'Oman Telecom', 'OM', 'Telecom', 'OMR', 0.78, 0.22),
  ];

  /// Loaded from /api/companies when reachable. Falls back to seed when empty.
  static List<Company> _loaded = [];
  static List<Company> get catalog =>
      _loaded.isNotEmpty ? _loaded : _seed;

  /// Hydrate the catalog from the backend. Safe to call multiple times.
  /// On error (offline, etc) the seed remains in effect.
  static Future<void> loadFromApi(Object api) async {
    try {
      // Use dynamic dispatch to avoid an import cycle with market_api.dart
      // ignore: avoid_dynamic_calls
      final dynamic list = await (api as dynamic).fetchCompanies();
      if (list is List && list.isNotEmpty) {
        _loaded = list
            .whereType<Map<String, dynamic>>()
            .map(_fromApi)
            .toList();
      }
    } catch (_) {
      // keep seed
    }
  }

  static Company _fromApi(Map<String, dynamic> j) {
    final ticker =
        (j['ticker'] ?? j['symbol'] ?? j['id'] ?? '').toString();
    final name = (j['name'] ?? ticker).toString();
    // Normalize country to 2-letter codes used app-wide.
    String country = (j['country'] ?? '').toString();
    const map = {
      'Saudi Arabia': 'SA',
      'United Arab Emirates': 'AE',
      'UAE': 'AE',
      'Kuwait': 'KW',
      'Qatar': 'QA',
      'Bahrain': 'BH',
      'Oman': 'OM',
    };
    country = map[country] ?? (country.length == 2 ? country : 'SA');
    return Company(
      id: (j['id'] ?? ticker).toString(),
      name: name,
      ticker: ticker,
      country: country,
      sector: (j['sector'] ?? j['industry'] ?? 'Other').toString(),
      currency: (j['currency'] ?? _ccyForCountry(country)).toString(),
      price: (j['price'] as num?)?.toDouble() ??
          (10 + (_hash(name).abs() % 200)).toDouble(),
      change: (j['change'] as num?)?.toDouble() ??
          (((_hash(name).abs() % 800) / 100) - 4.0),
      financials: _financials(name),
      reports: _reports(ticker, 5),
      sharia: sharia(name),
    );
  }

  static String _ccyForCountry(String c) => switch (c) {
        'SA' => 'SAR',
        'AE' => 'AED',
        'KW' => 'KWD',
        'QA' => 'QAR',
        'BH' => 'BHD',
        'OM' => 'OMR',
        _ => 'USD',
      };

  static Company _mk(String ticker, String name, String country, String sector,
      String currency, double price, double change) {
    return Company(
      id: ticker,
      name: name,
      ticker: ticker,
      country: country,
      sector: sector,
      currency: currency,
      price: price,
      change: change,
      financials: _financials(name),
      reports: _reports(ticker, 5),
      sharia: sharia(name),
    );
  }

  static Company? byTicker(String ticker) {
    for (final c in catalog) {
      if (c.ticker == ticker) return c;
    }
    return null;
  }
}

class AnalystRatings {
  final int buy;
  final int hold;
  final int sell;
  final int total;
  final String consensus;
  final double currentPrice;
  final double targetPrice;

  const AnalystRatings({
    required this.buy,
    required this.hold,
    required this.sell,
    required this.total,
    required this.consensus,
    required this.currentPrice,
    required this.targetPrice,
  });

  double get upsidePct =>
      currentPrice == 0 ? 0 : ((targetPrice - currentPrice) / currentPrice) * 100;
}
