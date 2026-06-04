import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AuthUser {
  final String name;
  final String email;
  final String initials;
  final String title;

  const AuthUser({
    required this.name,
    required this.email,
    required this.initials,
    required this.title,
  });
}

class AuthService extends ChangeNotifier {
  static const _demoEmail = 'demo@vifm.com';
  static const _demoPassword = 'demo123';
  static const _sessionKey = 'ashom_session_email';

  AuthUser? _user;
  AuthUser? get user => _user;
  bool get isAuthenticated => _user != null;

  Future<void> loadSession() async {
    final prefs = await SharedPreferences.getInstance();
    final email = prefs.getString(_sessionKey);
    if (email != null) {
      _user = _userFor(email);
      notifyListeners();
    }
  }

  Future<void> login(String email, String password) async {
    await Future<void>.delayed(const Duration(milliseconds: 400));
    final isDemo = email.trim().toLowerCase() == _demoEmail &&
        password == _demoPassword;
    if (!isDemo) {
      throw Exception('Invalid email or password');
    }
    _user = _userFor(email);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_sessionKey, email);
    notifyListeners();
  }

  Future<void> logout() async {
    _user = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_sessionKey);
    notifyListeners();
  }

  Future<void> register(String name, String email, String password) async {
    await Future<void>.delayed(const Duration(milliseconds: 600));
    if (name.trim().isEmpty) {
      throw Exception('Please enter your name');
    }
    if (!email.contains('@')) {
      throw Exception('Please enter a valid email');
    }
    if (password.length < 6) {
      throw Exception('Password must be at least 6 characters');
    }
    final initials = name
        .trim()
        .split(RegExp(r'\s+'))
        .map((w) => w.isEmpty ? '' : w[0])
        .join('')
        .toUpperCase();
    _user = AuthUser(
      name: name.trim(),
      email: email.trim(),
      initials: initials.isEmpty
          ? 'U'
          : initials.substring(0, initials.length >= 2 ? 2 : 1),
      title: 'Member',
    );
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_sessionKey, email);
    notifyListeners();
  }

  Future<void> requestPasswordReset(String email) async {
    await Future<void>.delayed(const Duration(milliseconds: 700));
    if (!email.contains('@')) {
      throw Exception('Please enter a valid email');
    }
  }

  AuthUser _userFor(String email) {
    // Mirrors the placeholder user in frontend/src/App.js.
    return AuthUser(
      name: 'Aiman Sadeq',
      email: email,
      initials: 'AS',
      title: 'Analyst',
    );
  }
}
