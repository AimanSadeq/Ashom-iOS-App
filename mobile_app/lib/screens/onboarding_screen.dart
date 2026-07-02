import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../services/onboarding_service.dart';
import '../theme/app_colors.dart';
import '../theme/app_theme.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  int _current = 0;

  static const _slides = <_Slide>[
    _Slide(
      title: 'Welcome to Ashom',
      subtitle: 'Your GCC Financial Intelligence Platform',
      detail: '180+ companies  ·  6 markets  ·  Indicative data',
      isLogo: true,
    ),
    _Slide(
      icon: Icons.trending_up_rounded,
      iconBg: Color(0xFFEBF3FB),
      iconFg: Color(0xFF3878BE),
      title: 'GCC Markets',
      subtitle:
          'Track stocks, metals, oil, and crypto across all 6 GCC exchanges with indicative prices (may be delayed).',
    ),
    _Slide(
      icon: Icons.memory_rounded,
      iconBg: Color(0xFFF0EEFE),
      iconFg: Color(0xFF7C5FDB),
      title: 'AI Financial Analyst',
      subtitle:
          'Ask questions about any company, sector, or market trend. Get instant analysis powered by AI.',
    ),
    _Slide(
      icon: Icons.push_pin_rounded,
      iconBg: Color(0xFFE6FAF5),
      iconFg: Color(0xFF00C896),
      title: 'Make It Yours',
      subtitle:
          'Pin your favorite tools, companies, and market data to your personal home screen.',
      isLast: true,
    ),
  ];

  Future<void> _finish() async {
    await context.read<OnboardingService>().complete();
    if (!mounted) return;
    context.go('/');
  }

  void _next() {
    if (_slides[_current].isLast) {
      _finish();
      return;
    }
    setState(() => _current++);
  }

  @override
  Widget build(BuildContext context) {
    final slide = _slides[_current];
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 430),
            child: Column(
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 12, 20, 0),
                  child: Align(
                    alignment: Alignment.centerRight,
                    child: TextButton(
                      onPressed: _finish,
                      child: const Text(
                        'Skip',
                        style: TextStyle(
                            fontSize: 12, color: AppColors.text3),
                      ),
                    ),
                  ),
                ),
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 32),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        if (slide.isLogo)
                          Container(
                            width: 60,
                            height: 60,
                            decoration: BoxDecoration(
                              color: AppColors.navy,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            alignment: Alignment.center,
                            child: const Text(
                              'أسهم',
                              textDirection: TextDirection.rtl,
                              style: TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w700,
                                  fontSize: 18),
                            ),
                          )
                        else
                          Container(
                            width: 60,
                            height: 60,
                            decoration: BoxDecoration(
                              color: slide.iconBg,
                              shape: BoxShape.circle,
                            ),
                            alignment: Alignment.center,
                            child: Icon(slide.icon,
                                color: slide.iconFg, size: 28),
                          ),
                        const SizedBox(height: 24),
                        Text(
                          slide.title,
                          textAlign: TextAlign.center,
                          style: AppTheme.heading(
                            size: slide.isLogo ? 22 : 18,
                            color: AppColors.navy,
                          ),
                        ),
                        const SizedBox(height: 12),
                        ConstrainedBox(
                          constraints:
                              const BoxConstraints(maxWidth: 300),
                          child: Text(
                            slide.subtitle,
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: slide.isLogo ? 14 : 13,
                              color: AppColors.text2,
                              height: 1.55,
                            ),
                          ),
                        ),
                        if (slide.detail != null) ...[
                          const SizedBox(height: 8),
                          Text(
                            slide.detail!,
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                                fontSize: 12, color: AppColors.text3),
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(24, 0, 24, 32),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          for (var i = 0; i < _slides.length; i++) ...[
                            AnimatedContainer(
                              duration: const Duration(milliseconds: 200),
                              width: 8,
                              height: 8,
                              decoration: BoxDecoration(
                                color: i == _current
                                    ? AppColors.navy
                                    : AppColors.border,
                                shape: BoxShape.circle,
                              ),
                            ),
                            if (i != _slides.length - 1)
                              const SizedBox(width: 8),
                          ],
                        ],
                      ),
                      const SizedBox(height: 24),
                      SizedBox(
                        width: double.infinity,
                        height: 48,
                        child: ElevatedButton(
                          onPressed: _next,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.navy,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                          child: Text(
                            slide.isLast ? 'Get Started' : 'Next',
                            style: const TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.w600,
                                color: Colors.white),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _Slide {
  final IconData? icon;
  final Color iconBg;
  final Color iconFg;
  final String title;
  final String subtitle;
  final String? detail;
  final bool isLogo;
  final bool isLast;

  const _Slide({
    this.icon,
    this.iconBg = Colors.transparent,
    this.iconFg = Colors.transparent,
    required this.title,
    required this.subtitle,
    this.detail,
    this.isLogo = false,
    this.isLast = false,
  });
}
