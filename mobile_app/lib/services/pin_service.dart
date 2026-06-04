import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Mirrors the React `usePin` hook: a user-curated list of shortcuts shown
/// on the "My Screen" tab. Identified by `id` (e.g. `tool-/markets`).
class Pin {
  final String id;
  final String type; // tool | company | index | metal | crypto | portfolio
  final String label;
  final String? subtitle;
  final String route;
  final String color;
  final String iconName;

  const Pin({
    required this.id,
    required this.type,
    required this.label,
    this.subtitle,
    required this.route,
    required this.color,
    required this.iconName,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'type': type,
        'label': label,
        'subtitle': subtitle,
        'route': route,
        'color': color,
        'iconName': iconName,
      };

  factory Pin.fromJson(Map<String, dynamic> j) => Pin(
        id: j['id'] as String,
        type: j['type'] as String,
        label: j['label'] as String,
        subtitle: j['subtitle'] as String?,
        route: j['route'] as String,
        color: j['color'] as String,
        iconName: j['iconName'] as String,
      );
}

class PinService extends ChangeNotifier {
  static const _key = 'ashom_pins_v1';
  List<Pin> _pins = [];

  List<Pin> get pins => List.unmodifiable(_pins);

  bool isPinned(String id) => _pins.any((p) => p.id == id);

  Future<void> load() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_key);
    if (raw == null) {
      notifyListeners();
      return;
    }
    try {
      final list = jsonDecode(raw) as List;
      _pins = list.map((e) => Pin.fromJson(e as Map<String, dynamic>)).toList();
    } catch (_) {
      _pins = [];
    }
    notifyListeners();
  }

  Future<void> toggle(Pin pin) async {
    if (isPinned(pin.id)) {
      _pins = _pins.where((p) => p.id != pin.id).toList();
    } else {
      _pins = [..._pins, pin];
    }
    await _persist();
    notifyListeners();
  }

  Future<void> remove(String id) async {
    _pins = _pins.where((p) => p.id != id).toList();
    await _persist();
    notifyListeners();
  }

  Future<void> reorder(int oldIndex, int newIndex) async {
    if (oldIndex < 0 || oldIndex >= _pins.length) return;
    final adjusted = newIndex > oldIndex ? newIndex - 1 : newIndex;
    final list = List<Pin>.from(_pins);
    final moved = list.removeAt(oldIndex);
    list.insert(adjusted.clamp(0, list.length), moved);
    _pins = list;
    await _persist();
    notifyListeners();
  }

  Future<void> _persist() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(
      _key,
      jsonEncode(_pins.map((p) => p.toJson()).toList()),
    );
  }
}
