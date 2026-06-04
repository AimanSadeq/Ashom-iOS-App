import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

class WatchlistService extends ChangeNotifier {
  static const _key = 'ashom_watchlist_v1';
  final Set<String> _tickers = {};

  Iterable<String> get tickers => List.unmodifiable(_tickers);

  bool isWatched(String ticker) => _tickers.contains(ticker);

  Future<void> load() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_key);
    if (raw != null) {
      try {
        final list = jsonDecode(raw) as List;
        _tickers
          ..clear()
          ..addAll(list.cast<String>());
      } catch (_) {}
    }
    notifyListeners();
  }

  Future<void> toggle(String ticker) async {
    if (_tickers.contains(ticker)) {
      _tickers.remove(ticker);
    } else {
      _tickers.add(ticker);
    }
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_key, jsonEncode(_tickers.toList()));
    notifyListeners();
  }
}
