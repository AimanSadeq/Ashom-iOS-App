import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

class OrderRecord {
  final int id;
  final String ticker;
  final String side; // 'buy' | 'sell'
  final String orderType; // 'market' | 'limit' | 'stop'
  final int quantity;
  final double price;
  final double total;
  final String currency;
  final DateTime timestamp;
  final String status;

  const OrderRecord({
    required this.id,
    required this.ticker,
    required this.side,
    required this.orderType,
    required this.quantity,
    required this.price,
    required this.total,
    required this.currency,
    required this.timestamp,
    required this.status,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'ticker': ticker,
        'side': side,
        'orderType': orderType,
        'quantity': quantity,
        'price': price,
        'total': total,
        'currency': currency,
        'timestamp': timestamp.toIso8601String(),
        'status': status,
      };

  factory OrderRecord.fromJson(Map<String, dynamic> j) => OrderRecord(
        id: j['id'] as int,
        ticker: j['ticker'] as String,
        side: j['side'] as String,
        orderType: j['orderType'] as String,
        quantity: (j['quantity'] as num).toInt(),
        price: (j['price'] as num).toDouble(),
        total: (j['total'] as num).toDouble(),
        currency: j['currency'] as String,
        timestamp: DateTime.parse(j['timestamp'] as String),
        status: j['status'] as String,
      );
}

class OrderHistoryService extends ChangeNotifier {
  static const _key = 'ashom_order_history_v1';
  List<OrderRecord> _orders = [];

  List<OrderRecord> get orders => List.unmodifiable(_orders.reversed);

  Future<void> load() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_key);
    if (raw == null) {
      notifyListeners();
      return;
    }
    try {
      final list = jsonDecode(raw) as List;
      _orders = list
          .map((e) => OrderRecord.fromJson(e as Map<String, dynamic>))
          .toList();
    } catch (_) {
      _orders = [];
    }
    notifyListeners();
  }

  Future<OrderRecord> record({
    required String ticker,
    required String side,
    required String orderType,
    required int quantity,
    required double price,
    required double total,
    required String currency,
  }) async {
    final rec = OrderRecord(
      id: DateTime.now().millisecondsSinceEpoch,
      ticker: ticker,
      side: side,
      orderType: orderType,
      quantity: quantity,
      price: price,
      total: total,
      currency: currency,
      timestamp: DateTime.now(),
      status: 'filled',
    );
    _orders = [..._orders, rec];
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(
      _key,
      jsonEncode(_orders.map((o) => o.toJson()).toList()),
    );
    notifyListeners();
    return rec;
  }
}
