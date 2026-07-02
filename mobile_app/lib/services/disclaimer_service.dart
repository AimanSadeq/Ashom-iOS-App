import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// One-time educational-use disclaimer acknowledgment.
/// Mirrors the `vifm-disclaimer-accepted` flag used by the web DisclaimerGate.
class DisclaimerService extends ChangeNotifier {
  static const _key = 'vifm-disclaimer-accepted';
  bool _accepted = false;

  bool get accepted => _accepted;

  Future<void> load() async {
    final prefs = await SharedPreferences.getInstance();
    _accepted = prefs.getBool(_key) ?? false;
    notifyListeners();
  }

  Future<void> accept() async {
    _accepted = true;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_key, true);
    notifyListeners();
  }

  Future<void> reset() async {
    _accepted = false;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_key);
    notifyListeners();
  }
}
