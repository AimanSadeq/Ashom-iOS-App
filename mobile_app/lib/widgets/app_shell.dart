import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../services/auth_service.dart';
import '../theme/app_colors.dart';
import '../theme/app_theme.dart';
import '../theme/theme_controller.dart';
import 'disclaimer_gate.dart';

/// 430px mobile-first scaffold with frosted header + bottom nav.
/// Mirrors frontend/src/components/layout/AppShell.jsx.
class AppShell extends StatelessWidget {
  const AppShell({super.key, required this.child, required this.location});

  final Widget child;
  final String location;

  static const _tabs = [
    _NavItem('Home', Icons.home_rounded, '/'),
    _NavItem('Markets', Icons.trending_up_rounded, '/markets'),
    _NavItem('AI', Icons.memory_rounded, '/ai'),
    _NavItem('Analytics', Icons.bar_chart_rounded, '/analytics'),
    _NavItem('Portfolio', Icons.work_rounded, '/portfolio'),
    _NavItem('News', Icons.newspaper_rounded, '/news'),
    _NavItem('Learn', Icons.school_rounded, '/learning'),
  ];

  int _activeIndex() {
    for (var i = _tabs.length - 1; i >= 0; i--) {
      final p = _tabs[i].path;
      if (p == '/' && location == '/') return i;
      if (p != '/' && (location == p || location.startsWith('$p/'))) return i;
    }
    return 0;
  }

  @override
  Widget build(BuildContext context) {
    final theme = context.watch<ThemeController>();
    final auth = context.watch<AuthService>();
    final isDark = theme.isDark;
    final active = _activeIndex();
    final cardColor = isDark ? AppColors.darkCard : Colors.white;
    final borderColor = isDark ? AppColors.darkBorder : AppColors.border;
    final text2 = isDark ? AppColors.darkText2 : AppColors.text2;
    final text3 = isDark ? AppColors.darkText3 : AppColors.text3;

    final scaffoldBg = isDark ? AppColors.darkBg : AppColors.bg;
    return Scaffold(
      backgroundColor: scaffoldBg,
      body: Stack(
        children: [
          Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 430),
              child: Column(
                children: [
                  _Header(
                    isDark: isDark,
                    onToggleTheme: theme.toggle,
                    onNotifications: () => context.push('/notifications'),
                    onSettings: () => context.push('/settings'),
                    initials: auth.user?.initials ?? 'G',
                    text2: text2,
                    text3: text3,
                    cardColor: cardColor,
                    borderColor: borderColor,
                  ),
                  Expanded(
                    // Solid background prevents any prior frame bleeding through
                    // during a route swap.
                    child: ColoredBox(
                      color: scaffoldBg,
                      child: child,
                    ),
                  ),
                  _DisclaimerFooter(
                    cardColor: cardColor,
                    borderColor: borderColor,
                    text3: text3,
                  ),
                  _BottomNav(
                    tabs: _tabs,
                    activeIndex: active,
                    isDark: isDark,
                    onTap: (i) => context.go(_tabs[i].path),
                  ),
                ],
              ),
            ),
          ),
          // One-time educational-use disclaimer gate (covers everything until
          // acknowledged). Mirrors the web DisclaimerGate.
          const DisclaimerGate(),
        ],
      ),
    );
  }
}

/// Persistent compliance footer above the bottom nav.
/// Mirrors the footer added to AppShell.jsx in the hardening update.
class _DisclaimerFooter extends StatelessWidget {
  const _DisclaimerFooter({
    required this.cardColor,
    required this.borderColor,
    required this.text3,
  });

  final Color cardColor;
  final Color borderColor;
  final Color text3;

  @override
  Widget build(BuildContext context) {
    final base = TextStyle(fontSize: 10, height: 1.4, color: text3);
    final link = base.copyWith(
        decoration: TextDecoration.underline, fontWeight: FontWeight.w600);
    return Container(
      width: double.infinity,
      color: cardColor,
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 6),
      child: Text.rich(
        TextSpan(
          style: base,
          children: [
            const TextSpan(
                text:
                    'Educational use only · Not investment advice · Data indicative & may be delayed. '),
            TextSpan(
              text: 'Terms',
              style: link,
              recognizer: TapGestureRecognizer()
                ..onTap = () => context.push('/legal/terms'),
            ),
            const TextSpan(text: ' · '),
            TextSpan(
              text: 'Data sources',
              style: link,
              recognizer: TapGestureRecognizer()
                ..onTap = () => context.push('/legal/data-sources'),
            ),
          ],
        ),
        textAlign: TextAlign.center,
      ),
    );
  }
}

class _NavItem {
  final String label;
  final IconData icon;
  final String path;
  const _NavItem(this.label, this.icon, this.path);
}

class _Header extends StatelessWidget {
  const _Header({
    required this.isDark,
    required this.onToggleTheme,
    required this.onNotifications,
    required this.onSettings,
    required this.initials,
    required this.text2,
    required this.text3,
    required this.cardColor,
    required this.borderColor,
  });

  final bool isDark;
  final VoidCallback onToggleTheme;
  final VoidCallback onNotifications;
  final VoidCallback onSettings;
  final String initials;
  final Color text2;
  final Color text3;
  final Color cardColor;
  final Color borderColor;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(
        left: 20,
        right: 20,
        top: MediaQuery.of(context).padding.top + 8,
        bottom: 14,
      ),
      decoration: BoxDecoration(
        color: cardColor,
        border: Border(bottom: BorderSide(color: borderColor)),
      ),
      child: Row(
        children: [
          InkWell(
            onTap: () => GoRouter.of(context).go('/'),
            borderRadius: BorderRadius.circular(14),
            child: Row(
              children: [
                Container(
                  width: 42,
                  height: 42,
                  decoration: BoxDecoration(
                    color: AppColors.navy,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    'أسهم',
                    textDirection: TextDirection.rtl,
                    style: AppTheme.heading(
                      size: 15,
                      color: Colors.white,
                      letterSpacing: -0.5,
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Ashom',
                      style: AppTheme.heading(
                        size: 15,
                        color: isDark ? AppColors.darkText1 : AppColors.navy,
                      ),
                    ),
                    const SizedBox(height: 1),
                    Text(
                      'GCC Financial Intelligence',
                      style: TextStyle(fontSize: 11, color: text3),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const Spacer(),
          _CircleIconButton(
            icon: isDark ? Icons.wb_sunny_outlined : Icons.nightlight_round,
            onTap: onToggleTheme,
            color: text2,
            bg: cardColor,
            borderColor: borderColor,
          ),
          const SizedBox(width: 8),
          _CircleIconButton(
            icon: Icons.notifications_none_rounded,
            onTap: onNotifications,
            color: text2,
            bg: cardColor,
            borderColor: borderColor,
          ),
          const SizedBox(width: 8),
          InkWell(
            onTap: onSettings,
            borderRadius: BorderRadius.circular(18),
            child: Container(
              width: 36,
              height: 36,
              decoration: const BoxDecoration(
                color: AppColors.navy,
                shape: BoxShape.circle,
              ),
              alignment: Alignment.center,
              child: Text(
                initials,
                style: AppTheme.heading(
                    size: 13, color: Colors.white, letterSpacing: 0),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _CircleIconButton extends StatelessWidget {
  const _CircleIconButton({
    required this.icon,
    required this.onTap,
    required this.color,
    required this.bg,
    required this.borderColor,
  });

  final IconData icon;
  final VoidCallback onTap;
  final Color color;
  final Color bg;
  final Color borderColor;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(18),
      child: Container(
        width: 36,
        height: 36,
        decoration: BoxDecoration(
          color: bg,
          shape: BoxShape.circle,
          border: Border.all(color: borderColor),
        ),
        child: Icon(icon, size: 18, color: color),
      ),
    );
  }
}

class _BottomNav extends StatelessWidget {
  const _BottomNav({
    required this.tabs,
    required this.activeIndex,
    required this.isDark,
    required this.onTap,
  });

  final List<_NavItem> tabs;
  final int activeIndex;
  final bool isDark;
  final ValueChanged<int> onTap;

  @override
  Widget build(BuildContext context) {
    final bg = isDark ? AppColors.darkCard : Colors.white;
    final border = isDark ? AppColors.darkBorder : AppColors.border;
    final inactive = isDark ? AppColors.darkText3 : AppColors.text3;
    final activeFg = isDark ? AppColors.darkBlue : AppColors.blue;
    final activeBg = isDark ? const Color(0xFF1E293B) : AppColors.blueLight;

    return Container(
      decoration: BoxDecoration(
        color: bg,
        border: Border(top: BorderSide(color: border)),
      ),
      padding: EdgeInsets.only(
        top: 8,
        bottom: 8 + MediaQuery.of(context).padding.bottom,
      ),
      child: Row(
        children: [
          for (var i = 0; i < tabs.length; i++)
            Expanded(
              child: InkWell(
                onTap: () => onTap(i),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 30,
                      height: 28,
                      decoration: BoxDecoration(
                        color:
                            i == activeIndex ? activeBg : Colors.transparent,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      alignment: Alignment.center,
                      child: Icon(
                        tabs[i].icon,
                        size: 18,
                        color: i == activeIndex ? activeFg : inactive,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      tabs[i].label,
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                        color: i == activeIndex ? activeFg : inactive,
                        letterSpacing: 0.2,
                      ),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}
