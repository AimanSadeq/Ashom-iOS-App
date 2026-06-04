import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

enum AssetType { stock, metal, oil, crypto, bond, cash }

AssetType assetTypeFromString(String raw) => AssetType.values.firstWhere(
      (a) => a.name == raw,
      orElse: () => AssetType.stock,
    );

class Holding {
  final int id;
  final AssetType type;
  final String name;
  final String symbol;
  final double quantity;
  final double costPrice;
  final String costCurrency;
  final double currentPrice;

  const Holding({
    required this.id,
    required this.type,
    required this.name,
    required this.symbol,
    required this.quantity,
    required this.costPrice,
    required this.costCurrency,
    required this.currentPrice,
  });

  Holding copyWith({double? currentPrice}) => Holding(
        id: id,
        type: type,
        name: name,
        symbol: symbol,
        quantity: quantity,
        costPrice: costPrice,
        costCurrency: costCurrency,
        currentPrice: currentPrice ?? this.currentPrice,
      );

  double get marketValue => quantity * currentPrice;
  double get costBasis => quantity * costPrice;
  double get pnl => marketValue - costBasis;
  double get pnlPct => costBasis == 0 ? 0 : (pnl / costBasis) * 100;

  Map<String, dynamic> toJson() => {
        'id': id,
        'type': type.name,
        'name': name,
        'symbol': symbol,
        'quantity': quantity,
        'costPrice': costPrice,
        'costCurrency': costCurrency,
        'currentPrice': currentPrice,
      };

  factory Holding.fromJson(Map<String, dynamic> j) => Holding(
        id: j['id'] as int,
        type: assetTypeFromString(j['type'] as String),
        name: j['name'] as String,
        symbol: j['symbol'] as String,
        quantity: (j['quantity'] as num).toDouble(),
        costPrice: (j['costPrice'] as num).toDouble(),
        costCurrency: j['costCurrency'] as String,
        currentPrice: (j['currentPrice'] as num).toDouble(),
      );
}

class PortfolioStore extends ChangeNotifier {
  static const _key = 'ashom_portfolio_holdings_v1';
  List<Holding> _holdings = [];

  List<Holding> get holdings => List.unmodifiable(_holdings);

  double get totalValue =>
      _holdings.fold<double>(0, (sum, h) => sum + h.marketValue);
  double get totalCost =>
      _holdings.fold<double>(0, (sum, h) => sum + h.costBasis);
  double get totalPnl => totalValue - totalCost;
  double get totalPnlPct => totalCost == 0 ? 0 : (totalPnl / totalCost) * 100;

  Map<AssetType, double> get allocationByType {
    final map = <AssetType, double>{};
    for (final h in _holdings) {
      map.update(h.type, (v) => v + h.marketValue,
          ifAbsent: () => h.marketValue);
    }
    return map;
  }

  Future<void> load() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_key);
    if (raw == null || raw.isEmpty) {
      _holdings = _seed();
      await _persist();
    } else {
      try {
        final list = jsonDecode(raw) as List;
        _holdings = list
            .map((e) => Holding.fromJson(e as Map<String, dynamic>))
            .toList();
      } catch (_) {
        _holdings = _seed();
      }
    }
    notifyListeners();
  }

  Future<void> add(Holding h) async {
    _holdings = [..._holdings, h];
    await _persist();
    notifyListeners();
  }

  Future<void> remove(int id) async {
    _holdings = _holdings.where((h) => h.id != id).toList();
    await _persist();
    notifyListeners();
  }

  Future<void> _persist() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(
      _key,
      jsonEncode(_holdings.map((h) => h.toJson()).toList()),
    );
  }

  /// Update `currentPrice` on crypto / metal / oil holdings using live API data.
  /// Stock and bond/cash prices are left alone (cost basis remains the proxy).
  Future<void> refreshLivePrices(Object api) async {
    if (_holdings.isEmpty) return;
    try {
      // Use dynamic to avoid circular import with market_api.
      // ignore: avoid_dynamic_calls
      final cryptoIds = _holdings
          .where((h) => h.type == AssetType.crypto)
          .map((h) => h.symbol.toLowerCase())
          .toSet()
          .toList();
      Map<String, dynamic> crypto = {};
      Map<String, dynamic> commod = {};
      if (cryptoIds.isNotEmpty) {
        // ignore: avoid_dynamic_calls
        crypto = await (api as dynamic).fetchCrypto(cryptoIds);
      }
      final hasCommod = _holdings.any(
          (h) => h.type == AssetType.metal || h.type == AssetType.oil);
      if (hasCommod) {
        // ignore: avoid_dynamic_calls
        commod = await (api as dynamic).fetchCommodities();
      }
      var changed = false;
      _holdings = _holdings.map((h) {
        double? newPrice;
        if (h.type == AssetType.crypto) {
          final q = crypto[h.symbol.toLowerCase()];
          // ignore: avoid_dynamic_calls
          newPrice = (q?.price as double?);
        } else if (h.type == AssetType.metal || h.type == AssetType.oil) {
          final q = commod[h.symbol.toLowerCase()];
          // ignore: avoid_dynamic_calls
          newPrice = (q?.price as double?);
        }
        if (newPrice != null && newPrice > 0 && newPrice != h.currentPrice) {
          changed = true;
          return h.copyWith(currentPrice: newPrice);
        }
        return h;
      }).toList();
      if (changed) {
        await _persist();
        notifyListeners();
      }
    } catch (_) {
      // ignore
    }
  }

  List<Holding> _seed() {
    // Seed data so Overview has something to render on first launch.
    return [
      Holding(
        id: 1,
        type: AssetType.stock,
        name: 'Saudi Aramco',
        symbol: '2222.SR',
        quantity: 500,
        costPrice: 26.50,
        costCurrency: 'SAR',
        currentPrice: 28.45,
      ),
      Holding(
        id: 2,
        type: AssetType.stock,
        name: 'Al Rajhi Bank',
        symbol: '1120.SR',
        quantity: 120,
        costPrice: 88.00,
        costCurrency: 'SAR',
        currentPrice: 95.20,
      ),
      Holding(
        id: 3,
        type: AssetType.crypto,
        name: 'Bitcoin',
        symbol: 'BTC',
        quantity: 0.15,
        costPrice: 68000,
        costCurrency: 'USD',
        currentPrice: 95420,
      ),
      Holding(
        id: 4,
        type: AssetType.metal,
        name: 'Gold (oz)',
        symbol: 'XAU',
        quantity: 3,
        costPrice: 2400,
        costCurrency: 'USD',
        currentPrice: 2645.10,
      ),
      Holding(
        id: 5,
        type: AssetType.cash,
        name: 'USD Cash',
        symbol: 'USD',
        quantity: 4500,
        costPrice: 1,
        costCurrency: 'USD',
        currentPrice: 1,
      ),
    ];
  }
}
