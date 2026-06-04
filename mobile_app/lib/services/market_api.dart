import 'dart:async';
import 'dart:convert';

import 'package:flutter/widgets.dart';
import 'package:http/http.dart' as http;

/// Thin client for the Express proxies documented in the root CLAUDE.md.
/// Falls back to mock data when the server isn't reachable so the UI stays usable.
class MarketApi {
  MarketApi({String? baseUrl}) : baseUrl = baseUrl ?? _defaultBase;

  static const _defaultBase = String.fromEnvironment(
    'ASHOM_API_BASE',
    defaultValue: 'https://ashom.viftraining.com',
  );

  final String baseUrl;

  Future<List<Map<String, dynamic>>> fetchCompanies({
    String? country,
    String? sector,
    String? search,
  }) async {
    try {
      final qs = <String, String>{};
      if (country != null) qs['country'] = country;
      if (sector != null) qs['sector'] = sector;
      if (search != null) qs['search'] = search;
      final uri = Uri.parse('$baseUrl/api/companies').replace(
        queryParameters: qs.isEmpty ? null : qs,
      );
      final resp = await http.get(uri).timeout(const Duration(seconds: 10));
      if (resp.statusCode == 200) {
        final body = jsonDecode(resp.body) as Map<String, dynamic>;
        final list = (body['companies'] as List?) ?? (body['data'] as List?) ?? [];
        return list.whereType<Map<String, dynamic>>().toList();
      }
    } catch (_) {}
    return [];
  }

  Future<Map<String, IndexQuote>> fetchIndices() async {
    try {
      final uri = Uri.parse('$baseUrl/api/indices');
      final resp = await http.get(uri).timeout(const Duration(seconds: 6));
      if (resp.statusCode == 200) {
        final body = jsonDecode(resp.body) as Map<String, dynamic>;
        final data = body['data'] as Map<String, dynamic>? ?? {};
        return data.map((k, v) =>
            MapEntry(k, IndexQuote.fromJson(k, v as Map<String, dynamic>)));
      }
    } catch (_) {}
    return _fallbackIndices();
  }

  Future<List<Mover>> fetchMovers({int limit = 5}) async {
    try {
      final uri = Uri.parse('$baseUrl/api/movers?limit=$limit');
      final resp = await http.get(uri).timeout(const Duration(seconds: 6));
      if (resp.statusCode == 200) {
        final body = jsonDecode(resp.body) as Map<String, dynamic>;
        final list = (body['data'] as List?) ?? [];
        return list
            .whereType<Map<String, dynamic>>()
            .map(Mover.fromJson)
            .toList();
      }
    } catch (_) {}
    return _fallbackMovers();
  }

  Future<List<NewsArticle>> fetchNews({String category = 'all'}) async {
    try {
      final uri = Uri.parse('$baseUrl/api/news?category=$category');
      final resp = await http.get(uri).timeout(const Duration(seconds: 8));
      if (resp.statusCode == 200) {
        final body = jsonDecode(resp.body) as Map<String, dynamic>;
        final list = (body['data'] as List?) ?? (body['articles'] as List?) ?? [];
        return list
            .whereType<Map<String, dynamic>>()
            .map(NewsArticle.fromJson)
            .toList();
      }
    } catch (_) {}
    return [];
  }

  Future<String> analystChat(String message, List<Map<String, String>> history) async {
    try {
      final uri = Uri.parse('$baseUrl/api/analyst/chat');
      final resp = await http
          .post(uri,
              headers: {'Content-Type': 'application/json'},
              body: jsonEncode({'message': message, 'history': history}))
          .timeout(const Duration(seconds: 25));
      if (resp.statusCode == 200) {
        // Try JSON first; backend may also return SSE which has data: lines.
        final ct = resp.headers['content-type'] ?? '';
        if (ct.contains('application/json')) {
          final body = jsonDecode(resp.body) as Map<String, dynamic>;
          return (body['message'] as String?) ??
              (body['reply'] as String?) ??
              (body['text'] as String?) ??
              'No response from analyst.';
        }
        // Parse SSE if present
        final buf = StringBuffer();
        for (final line in resp.body.split('\n')) {
          if (!line.startsWith('data: ')) continue;
          try {
            final parsed = jsonDecode(line.substring(6)) as Map<String, dynamic>;
            if (parsed['type'] == 'text' && parsed['content'] is String) {
              buf.write(parsed['content']);
            }
          } catch (_) {}
        }
        if (buf.isNotEmpty) return buf.toString();
      }
      throw Exception('status ${resp.statusCode}');
    } catch (e) {
      throw Exception('AI service unavailable. Please try again in a moment.');
    }
  }

  Map<String, IndexQuote> _fallbackIndices() {
    return {
      'tasi': IndexQuote(id: 'tasi', label: 'TASI', country: 'SA', price: 12420.50, change: 0.84),
      'dfm': IndexQuote(id: 'dfm', label: 'DFM', country: 'AE', price: 5230.20, change: -0.21),
      'adx': IndexQuote(id: 'adx', label: 'ADX', country: 'AE', price: 9810.40, change: 0.45),
      'qsi': IndexQuote(id: 'qsi', label: 'QE', country: 'QA', price: 10380.10, change: 0.62),
      'boursa': IndexQuote(id: 'boursa', label: 'Boursa', country: 'KW', price: 7250.80, change: 1.12),
      'bax': IndexQuote(id: 'bax', label: 'BAX', country: 'BH', price: 2030.50, change: -0.08),
      'msm': IndexQuote(id: 'msm', label: 'MSM30', country: 'OM', price: 4680.30, change: 0.34),
    };
  }

  List<Mover> _fallbackMovers() {
    return const [
      Mover(ticker: '2222.SR', name: 'Saudi Aramco', country: 'SA', price: 28.45, change: 3.82, isGainer: true),
      Mover(ticker: 'EMAAR.AE', name: 'Emaar Properties', country: 'AE', price: 8.76, change: 2.91, isGainer: true),
      Mover(ticker: 'QNBK.QA', name: 'Qatar National Bank', country: 'QA', price: 14.30, change: 2.18, isGainer: true),
      Mover(ticker: '1120.SR', name: 'Al Rajhi Bank', country: 'SA', price: 95.20, change: 1.84, isGainer: true),
      Mover(ticker: 'NBK.KW', name: 'NBK', country: 'KW', price: 1.02, change: 1.52, isGainer: true),
      Mover(ticker: '2010.SR', name: 'SABIC', country: 'SA', price: 72.10, change: -2.41, isGainer: false),
      Mover(ticker: 'DIB.AE', name: 'Dubai Islamic Bank', country: 'AE', price: 6.22, change: -1.85, isGainer: false),
      Mover(ticker: 'ORDS.QA', name: 'Ooredoo', country: 'QA', price: 9.45, change: -1.33, isGainer: false),
      Mover(ticker: 'ZAIN.KW', name: 'Zain Group', country: 'KW', price: 0.58, change: -1.12, isGainer: false),
      Mover(ticker: 'AUB.BH', name: 'Ahli United Bank', country: 'BH', price: 0.81, change: -0.94, isGainer: false),
    ];
  }

  Future<Map<String, CryptoQuote>> fetchCrypto(List<String> ids) async {
    try {
      final uri = Uri.parse(
        '$baseUrl/api/coingecko/crypto?ids=${ids.join(',')}',
      );
      final resp = await http
          .get(uri)
          .timeout(const Duration(seconds: 6));
      if (resp.statusCode == 200) {
        final body = jsonDecode(resp.body) as Map<String, dynamic>;
        final data = body['data'] as Map<String, dynamic>? ?? {};
        return data.map(
          (k, v) => MapEntry(k, CryptoQuote.fromJson(k, v as Map<String, dynamic>)),
        );
      }
    } catch (_) {
      // fall through to fallback
    }
    return _fallbackCrypto(ids);
  }

  Future<Map<String, CommodityQuote>> fetchCommodities() async {
    try {
      final uri = Uri.parse('$baseUrl/api/commodities/yahoo');
      final resp = await http
          .get(uri)
          .timeout(const Duration(seconds: 6));
      if (resp.statusCode == 200) {
        final body = jsonDecode(resp.body) as Map<String, dynamic>;
        final data = body['data'] as Map<String, dynamic>? ?? {};
        return data.map(
          (k, v) =>
              MapEntry(k, CommodityQuote.fromJson(k, v as Map<String, dynamic>)),
        );
      }
    } catch (_) {}
    return _fallbackCommodities();
  }

  Map<String, CryptoQuote> _fallbackCrypto(List<String> ids) {
    const defaults = {
      'bitcoin': (95420.0, 1.82),
      'ethereum': (3420.0, 0.94),
      'binancecoin': (698.0, -0.44),
      'solana': (218.0, 3.11),
      'cardano': (1.08, -0.73),
      'ripple': (2.35, 1.12),
      'polkadot': (8.22, 0.18),
      'dogecoin': (0.41, -1.28),
    };
    final out = <String, CryptoQuote>{};
    for (final id in ids) {
      final d = defaults[id];
      if (d == null) continue;
      out[id] = CryptoQuote(id: id, price: d.$1, change24h: d.$2);
    }
    return out;
  }

  Map<String, CommodityQuote> _fallbackCommodities() {
    return {
      'gold': CommodityQuote(id: 'gold', label: 'Gold', price: 2645.10, change: 0.82),
      'silver':
          CommodityQuote(id: 'silver', label: 'Silver', price: 30.40, change: 1.14),
      'platinum':
          CommodityQuote(id: 'platinum', label: 'Platinum', price: 945.20, change: -0.32),
      'palladium':
          CommodityQuote(id: 'palladium', label: 'Palladium', price: 982.50, change: -0.67),
      'wti': CommodityQuote(id: 'wti', label: 'WTI Crude', price: 72.40, change: 0.44),
      'brent':
          CommodityQuote(id: 'brent', label: 'Brent Crude', price: 76.10, change: 0.28),
    };
  }
}

class CryptoQuote {
  final String id;
  final double price;
  final double change24h;

  const CryptoQuote({
    required this.id,
    required this.price,
    required this.change24h,
  });

  factory CryptoQuote.fromJson(String id, Map<String, dynamic> j) => CryptoQuote(
        id: id,
        price: (j['price'] as num?)?.toDouble() ?? 0,
        change24h: (j['change'] as num?)?.toDouble() ?? 0,
      );
}

class CommodityQuote {
  final String id;
  final String label;
  final double price;
  final double change;

  const CommodityQuote({
    required this.id,
    required this.label,
    required this.price,
    required this.change,
  });

  factory CommodityQuote.fromJson(String id, Map<String, dynamic> j) =>
      CommodityQuote(
        id: id,
        label: (j['label'] as String?) ?? _pretty(id),
        price: (j['price'] as num?)?.toDouble() ?? 0,
        change: (j['change'] as num?)?.toDouble() ?? 0,
      );

  static String _pretty(String id) =>
      id.isEmpty ? id : id[0].toUpperCase() + id.substring(1);
}

class IndexQuote {
  final String id, label, country;
  final double price, change;
  const IndexQuote({
    required this.id,
    required this.label,
    required this.country,
    required this.price,
    required this.change,
  });
  factory IndexQuote.fromJson(String id, Map<String, dynamic> j) => IndexQuote(
        id: id,
        label: (j['label'] as String?) ?? id.toUpperCase(),
        country: (j['country'] as String?) ?? '',
        price: (j['price'] as num?)?.toDouble() ?? 0,
        change: (j['change'] as num?)?.toDouble() ?? 0,
      );
}

class Mover {
  final String ticker, name, country;
  final double price, change;
  final bool isGainer;
  const Mover({
    required this.ticker,
    required this.name,
    required this.country,
    required this.price,
    required this.change,
    required this.isGainer,
  });
  factory Mover.fromJson(Map<String, dynamic> j) => Mover(
        ticker: (j['ticker'] as String?) ?? (j['symbol'] as String?) ?? '',
        name: (j['name'] as String?) ?? (j['company'] as String?) ?? '',
        country: (j['country'] as String?) ?? '',
        price: (j['price'] as num?)?.toDouble() ?? 0,
        change: (j['change'] as num?)?.toDouble() ?? 0,
        isGainer: ((j['change'] as num?)?.toDouble() ?? 0) >= 0,
      );
}

class NewsArticle {
  final String id, title, category, source, snippet, body;
  final DateTime publishedAt;
  final String? url;
  const NewsArticle({
    required this.id,
    required this.title,
    required this.category,
    required this.source,
    required this.snippet,
    required this.body,
    required this.publishedAt,
    this.url,
  });
  factory NewsArticle.fromJson(Map<String, dynamic> j) {
    DateTime parseDate() {
      final v = j['publishedAt'] ?? j['date'] ?? j['published_at'];
      if (v is String) {
        return DateTime.tryParse(v) ?? DateTime.now();
      }
      return DateTime.now();
    }

    return NewsArticle(
      id: (j['id'] ?? j['_id'] ?? j['url'] ?? UniqueKey().toString())
          .toString(),
      title: (j['title'] as String?) ?? '',
      category: (j['category'] as String?) ?? 'general',
      source: (j['source'] as String?) ?? '',
      snippet:
          (j['snippet'] as String?) ?? (j['description'] as String?) ?? '',
      body: (j['body'] as String?) ??
          (j['content'] as String?) ??
          (j['snippet'] as String?) ??
          '',
      publishedAt: parseDate(),
      url: j['url'] as String?,
    );
  }
}
