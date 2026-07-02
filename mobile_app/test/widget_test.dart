import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:ashom/services/auth_service.dart';
import 'package:ashom/services/disclaimer_service.dart';
import 'package:ashom/widgets/disclaimer_gate.dart';
import 'package:ashom/widgets/notice_banners.dart';

void main() {
  // ── Guest identity ────────────────────────────────────────────────
  // External users must never see a real person's name (the website
  // hardening change replaced "Aiman Sadeq / AS" with "Guest / G").
  group('Guest identity', () {
    test('demo login yields a generic Guest, not a real name', () async {
      SharedPreferences.setMockInitialValues({});
      final auth = AuthService();
      await auth.login('demo@vifm.com', 'demo123');
      expect(auth.user, isNotNull);
      expect(auth.user!.name, 'Guest');
      expect(auth.user!.initials, 'G');
      expect(auth.user!.name, isNot('Aiman Sadeq'));
    });
  });

  // ── Disclaimer acknowledgment ─────────────────────────────────────
  group('DisclaimerService', () {
    test('defaults to not accepted and persists acceptance', () async {
      SharedPreferences.setMockInitialValues({});
      final svc = DisclaimerService();
      await svc.load();
      expect(svc.accepted, isFalse);

      await svc.accept();
      expect(svc.accepted, isTrue);

      // A fresh service reading the same store stays accepted.
      final reloaded = DisclaimerService();
      await reloaded.load();
      expect(reloaded.accepted, isTrue);
    });
  });

  // ── DisclaimerGate (one-time blocking modal) ──────────────────────
  testWidgets('DisclaimerGate blocks until accepted, then dismisses',
      (tester) async {
    SharedPreferences.setMockInitialValues({});
    final svc = DisclaimerService();
    await svc.load();

    await tester.pumpWidget(
      MaterialApp(
        home: ChangeNotifierProvider<DisclaimerService>.value(
          value: svc,
          child: const Scaffold(
            body: Stack(children: [DisclaimerGate()]),
          ),
        ),
      ),
    );
    await tester.pump();

    // Gate is visible with the educational-use copy.
    expect(find.text('Before you continue'), findsOneWidget);
    expect(find.text('I understand & agree'), findsOneWidget);

    // Accepting dismisses it for good.
    await tester.tap(find.text('I understand & agree'));
    await tester.pumpAndSettle();
    expect(find.text('Before you continue'), findsNothing);
    expect(svc.accepted, isTrue);
  });

  // ── Honesty banners ───────────────────────────────────────────────
  testWidgets('DemoDataBanner shows the "not live" warning', (tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(body: DemoDataBanner(note: 'simulated.')),
      ),
    );
    expect(
        find.textContaining('Demo data', findRichText: true), findsOneWidget);
    expect(find.textContaining('not live', findRichText: true), findsOneWidget);
  });

  testWidgets('ComingSoonBanner shows the preview notice', (tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(body: ComingSoonBanner(note: 'not available yet.')),
      ),
    );
    expect(find.textContaining('Preview / coming soon', findRichText: true),
        findsOneWidget);
  });
}
