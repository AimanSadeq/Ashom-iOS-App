import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../services/disclaimer_service.dart';
import '../theme/app_colors.dart';
import '../theme/app_theme.dart';

/// One-time, blocking educational-use disclaimer shown before the app is usable.
/// Mirrors frontend/src/components/shared/DisclaimerGate.jsx.
///
/// Rendered as a full-screen overlay (inside a Stack) rather than a dialog so it
/// reliably blocks interaction and dismisses itself the moment the user accepts.
class DisclaimerGate extends StatelessWidget {
  const DisclaimerGate({super.key});

  @override
  Widget build(BuildContext context) {
    final disclaimer = context.watch<DisclaimerService>();
    if (disclaimer.accepted) return const SizedBox.shrink();

    final isDark = Theme.of(context).brightness == Brightness.dark;
    final card = isDark ? AppColors.darkCard : Colors.white;
    final navy = isDark ? AppColors.darkText1 : AppColors.navy;
    final text2 = isDark ? AppColors.darkText2 : AppColors.text2;

    return Positioned.fill(
      child: Material(
        color: const Color(0x8C010131), // rgba(1,0,49,0.55)
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 400),
              child: Container(
                decoration: BoxDecoration(
                  color: card,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: const [
                    BoxShadow(
                      color: Color(0x4D000000),
                      blurRadius: 60,
                      offset: Offset(0, 20),
                    ),
                  ],
                ),
                padding: const EdgeInsets.fromLTRB(22, 28, 22, 22),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 52,
                      height: 52,
                      decoration: BoxDecoration(
                        color: AppColors.icAmberFg.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: const Icon(Icons.shield_outlined,
                          size: 26, color: Color(0xFFA37300)),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Before you continue',
                      textAlign: TextAlign.center,
                      style: AppTheme.heading(size: 19, color: navy),
                    ),
                    const SizedBox(height: 12),
                    Text.rich(
                      TextSpan(
                        style: TextStyle(
                            fontSize: 13, height: 1.6, color: text2),
                        children: const [
                          TextSpan(text: 'Ashom is for '),
                          TextSpan(
                              text: 'educational and informational purposes only',
                              style: TextStyle(fontWeight: FontWeight.w700)),
                          TextSpan(text: '. It is '),
                          TextSpan(
                              text:
                                  'not investment advice, an offer, or a recommendation',
                              style: TextStyle(fontWeight: FontWeight.w700)),
                          TextSpan(
                              text: ' to buy or sell any security.'),
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text.rich(
                      TextSpan(
                        style: TextStyle(
                            fontSize: 13, height: 1.6, color: text2),
                        children: const [
                          TextSpan(text: 'Market data is '),
                          TextSpan(
                              text: 'indicative and may be delayed',
                              style: TextStyle(fontWeight: FontWeight.w700)),
                          TextSpan(
                              text:
                                  '. It is sourced from third parties (Yahoo Finance and public exchange websites) and is not guaranteed to be accurate, complete, or timely. Do not rely on it for trading decisions.'),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                    Wrap(
                      alignment: WrapAlignment.center,
                      spacing: 14,
                      runSpacing: 6,
                      children: [
                        _LegalLink(
                            label: 'Terms',
                            onTap: () => context.push('/legal/terms')),
                        _LegalLink(
                            label: 'Privacy',
                            onTap: () => context.push('/legal/privacy')),
                        _LegalLink(
                            label: 'Data sources',
                            onTap: () => context.push('/legal/data-sources')),
                      ],
                    ),
                    const SizedBox(height: 18),
                    SizedBox(
                      width: double.infinity,
                      child: FilledButton(
                        style: FilledButton.styleFrom(
                          backgroundColor: AppColors.navy,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10)),
                        ),
                        onPressed: () =>
                            context.read<DisclaimerService>().accept(),
                        child: Text('I understand & agree',
                            style: AppTheme.heading(
                                size: 14, color: Colors.white)),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _LegalLink extends StatelessWidget {
  const _LegalLink({required this.label, required this.onTap});

  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Text(
        label,
        style: const TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: AppColors.blue,
          decoration: TextDecoration.underline,
        ),
      ),
    );
  }
}
