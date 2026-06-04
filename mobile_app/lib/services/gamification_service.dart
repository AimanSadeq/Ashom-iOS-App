import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

class Achievement {
  final String id;
  final String category;
  final String title;
  final String description;
  final int threshold;

  const Achievement({
    required this.id,
    required this.category,
    required this.title,
    required this.description,
    this.threshold = 1,
  });
}

/// Lightweight port of `vifm-gamification.js` — tracks action counts and
/// unlocks achievements. Toast UI is up to the caller (HomePage shows it).
class GamificationService extends ChangeNotifier {
  static const _statsKey = 'ashom_gamification_stats';
  static const _unlockedKey = 'ashom_gamification_unlocked';

  final Map<String, int> _stats = {};
  final Set<String> _unlocked = {};
  Achievement? _lastUnlocked;

  Achievement? get lastUnlocked => _lastUnlocked;
  int get unlockedCount => _unlocked.length;
  int get totalAchievements => achievements.length;

  static const achievements = <Achievement>[
    Achievement(id: 'explorer-1', category: 'Explorer', title: 'First Steps', description: 'Open your first screen'),
    Achievement(id: 'explorer-2', category: 'Explorer', title: 'Dark Side', description: 'Toggle dark mode'),
    Achievement(id: 'analyst-1', category: 'Analyst', title: 'First Comparison', description: 'Create a comparison'),
    Achievement(id: 'analyst-2', category: 'Analyst', title: 'Power Screener', description: 'Run the screener 5 times', threshold: 5),
    Achievement(id: 'portfolio-1', category: 'Portfolio', title: 'Holding Added', description: 'Add a portfolio holding'),
    Achievement(id: 'portfolio-2', category: 'Portfolio', title: 'Diversified', description: 'Hold 5 or more assets', threshold: 5),
    Achievement(id: 'market-1', category: 'Market', title: 'Market Watcher', description: 'Refresh market data'),
    Achievement(id: 'market-2', category: 'Market', title: 'Crypto Curious', description: 'Visit the crypto screen'),
    Achievement(id: 'consistency-1', category: 'Consistency', title: 'Daily Login', description: 'Sign in once'),
  ];

  static const _actionToAchievements = <String, List<String>>{
    'screen-opened': ['explorer-1'],
    'dark-mode-toggled': ['explorer-2'],
    'comparison-created': ['analyst-1'],
    'screener-run': ['analyst-2'],
    'holding-added': ['portfolio-1', 'portfolio-2'],
    'market-refreshed': ['market-1'],
    'crypto-visited': ['market-2'],
    'login': ['consistency-1'],
  };

  Future<void> load() async {
    final prefs = await SharedPreferences.getInstance();
    final statsRaw = prefs.getString(_statsKey);
    if (statsRaw != null) {
      final m = jsonDecode(statsRaw) as Map<String, dynamic>;
      m.forEach((k, v) => _stats[k] = (v as num).toInt());
    }
    final unlockedRaw = prefs.getString(_unlockedKey);
    if (unlockedRaw != null) {
      final l = jsonDecode(unlockedRaw) as List;
      _unlocked.addAll(l.cast<String>());
    }
    notifyListeners();
  }

  Future<Achievement?> track(String action, {int weight = 1}) async {
    _stats.update(action, (v) => v + weight, ifAbsent: () => weight);
    final ids = _actionToAchievements[action];
    Achievement? unlocked;
    if (ids != null) {
      for (final id in ids) {
        if (_unlocked.contains(id)) continue;
        final ach = achievements.firstWhere(
          (a) => a.id == id,
          orElse: () => const Achievement(
            id: '', category: '', title: '', description: ''),
        );
        if (ach.id.isEmpty) continue;
        final current = _counterForAchievement(ach);
        if (current >= ach.threshold) {
          _unlocked.add(id);
          unlocked ??= ach;
        }
      }
    }
    await _persist();
    if (unlocked != null) {
      _lastUnlocked = unlocked;
    }
    notifyListeners();
    return unlocked;
  }

  int _counterForAchievement(Achievement a) {
    for (final entry in _actionToAchievements.entries) {
      if (entry.value.contains(a.id)) {
        return _stats[entry.key] ?? 0;
      }
    }
    return 0;
  }

  Future<void> _persist() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_statsKey, jsonEncode(_stats));
    await prefs.setString(_unlockedKey, jsonEncode(_unlocked.toList()));
  }
}
