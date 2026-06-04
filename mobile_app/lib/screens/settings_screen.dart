import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../services/auth_service.dart';
import '../theme/app_colors.dart';
import '../theme/app_theme.dart';
import '../theme/theme_controller.dart';
import 'settings_detail_screens.dart' as detail;

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _emailOn = true;
  bool _marketAlertsOn = false;
  String _language = 'English';
  String _currency = 'USD';

  @override
  Widget build(BuildContext context) {
    final dark = Theme.of(context).brightness == Brightness.dark;
    final card = dark ? AppColors.darkCard : Colors.white;
    final border = dark ? AppColors.darkBorder : AppColors.border;
    final text1 = dark ? AppColors.darkText1 : AppColors.text1;
    final text3 = dark ? AppColors.darkText3 : AppColors.text3;
    final bg = dark ? AppColors.darkBg : AppColors.bg;

    final auth = context.watch<AuthService>();
    final theme = context.watch<ThemeController>();

    final displayName = auth.user?.name ?? 'User';
    final displayEmail = auth.user?.email ?? '';
    final initials = auth.user?.initials ??
        displayName
            .split(' ')
            .map((w) => w.isEmpty ? '' : w[0])
            .join('')
            .toUpperCase()
            .substring(0, displayName.isEmpty ? 0 : 2);

    final sections = <_Section>[
      _Section('Account', [
        _Item(Icons.person_rounded, 'Personal Info', 'Name, phone, address',
            path: '/personal-info'),
        _Item(Icons.shield_rounded, 'Security & Privacy',
            'Password, 2FA, sessions',
            path: '/security-privacy'),
        _Item(Icons.credit_card_rounded, 'Subscription',
            'Plan, billing, invoices',
            path: '/pricing'),
      ]),
      _Section('Premium Features', [
        _Item(Icons.key_rounded, 'API Access', 'Developer tools & docs',
            path: '/api-access'),
        _Item(Icons.business_rounded, 'White Label', 'Branded reports',
            path: '/white-label'),
        _Item(Icons.dashboard_rounded, 'Custom Dashboard',
            'Build your view',
            path: '/dashboard'),
      ]),
      _Section('Notifications', [
        _Item(Icons.notifications_rounded, 'Notification Settings',
            'Configure push alerts',
            path: '/notification-settings'),
        _Item(Icons.mail_rounded, 'Email Notifications',
            'Weekly digest, reports',
            toggle: true, on: _emailOn,
            onToggle: (v) => setState(() => _emailOn = v)),
        _Item(Icons.show_chart_rounded, 'Market Alerts',
            'Price movements, earnings',
            toggle: true, on: _marketAlertsOn,
            onToggle: (v) => setState(() => _marketAlertsOn = v)),
      ]),
      _Section('Preferences', [
        _Item(Icons.nightlight_rounded, 'Dark Mode', 'Switch to dark theme',
            toggle: true,
            on: theme.isDark,
            onToggle: (_) => theme.toggle()),
        _Item(Icons.public_rounded, 'Language', _language,
            action: () => detail.showLanguagePicker(context,
                current: _language,
                onSelected: (v) => setState(() => _language = v))),
        _Item(Icons.account_balance_wallet_rounded, 'Currency', _currency,
            action: () => detail.showCurrencyPicker(context,
                current: _currency,
                onSelected: (v) => setState(() => _currency = v))),
        _Item(Icons.palette_rounded, 'Theme',
            theme.isDark ? 'Dark' : 'Light',
            action: () => detail.showThemePicker(context, theme)),
      ]),
      _Section('Support', [
        _Item(Icons.help_rounded, 'Help Center', 'FAQs, guides, tutorials',
            path: '/help'),
        _Item(Icons.bug_report_rounded, 'Report a Bug',
            'Send feedback to our team',
            path: '/report-bug'),
        _Item(Icons.info_rounded, 'About', 'Version 1.37.0',
            path: '/about'),
      ]),
      _Section('Legal', [
        _Item(Icons.description_rounded, 'Terms of Use',
            'Educational-use disclaimer',
            path: '/legal/terms'),
        _Item(Icons.privacy_tip_rounded, 'Privacy Policy',
            'How we handle your data',
            path: '/legal/privacy'),
        _Item(Icons.source_rounded, 'Data Sources',
            'Where prices come from',
            path: '/legal/data-sources'),
      ]),
    ];

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 24),
      children: [
        // Profile card
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: card,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: border),
          ),
          child: Row(
            children: [
              Container(
                width: 52,
                height: 52,
                decoration: const BoxDecoration(
                  color: AppColors.navy,
                  shape: BoxShape.circle,
                ),
                alignment: Alignment.center,
                child: Text(
                  initials,
                  style: AppTheme.heading(size: 16, color: Colors.white),
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      displayName,
                      style: AppTheme.heading(size: 15, color: text1),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      displayEmail,
                      style: TextStyle(fontSize: 12, color: text3),
                    ),
                  ],
                ),
              ),
              OutlinedButton(
                onPressed: () => context.push('/personal-info'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.navy,
                  backgroundColor: card,
                  side: BorderSide(color: border),
                  padding: const EdgeInsets.symmetric(
                      horizontal: 14, vertical: 7),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                  textStyle: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                child: const Text('Edit'),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),
        for (final section in sections) ...[
          Padding(
            padding: const EdgeInsets.fromLTRB(4, 0, 0, 8),
            child: Text(section.title, style: AppTheme.label(color: text3)),
          ),
          Container(
            decoration: BoxDecoration(
              color: card,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: border),
            ),
            clipBehavior: Clip.antiAlias,
            child: Column(
              children: [
                for (var i = 0; i < section.items.length; i++) ...[
                  _SettingRow(
                    item: section.items[i],
                    text1: text1,
                    text3: text3,
                    bg: bg,
                  ),
                  if (i != section.items.length - 1)
                    Divider(height: 1, color: border),
                ],
              ],
            ),
          ),
          const SizedBox(height: 20),
        ],
        InkWell(
          onTap: () async {
            await context.read<AuthService>().logout();
          },
          borderRadius: BorderRadius.circular(16),
          child: Container(
            padding: const EdgeInsets.symmetric(vertical: 14),
            decoration: BoxDecoration(
              color: card,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: border),
            ),
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.logout_rounded, color: AppColors.red, size: 14),
                SizedBox(width: 8),
                Text(
                  'Log Out',
                  style: TextStyle(
                    color: AppColors.red,
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _Section {
  final String title;
  final List<_Item> items;
  const _Section(this.title, this.items);
}

class _Item {
  final IconData icon;
  final String label;
  final String subtitle;
  final String? path;
  final VoidCallback? action;
  final bool toggle;
  final bool on;
  final ValueChanged<bool>? onToggle;

  const _Item(
    this.icon,
    this.label,
    this.subtitle, {
    this.path,
    this.action,
    this.toggle = false,
    this.on = false,
    this.onToggle,
  });
}

class _SettingRow extends StatelessWidget {
  const _SettingRow({
    required this.item,
    required this.text1,
    required this.text3,
    required this.bg,
  });

  final _Item item;
  final Color text1;
  final Color text3;
  final Color bg;

  static const _iconColors = <String, (Color, Color)>{
    'Personal Info': (Color(0xFFEAF2FC), Color(0xFF5391D5)),
    'Security & Privacy': (Color(0xFFF0EEFE), Color(0xFF7C5FDB)),
    'Subscription': (Color(0xFFFFF8E6), Color(0xFFF2A600)),
    'API Access': (Color(0xFFE3F6F5), Color(0xFF00A8A0)),
    'White Label': (Color(0xFFEAEBF7), Color(0xFF010131)),
    'Custom Dashboard': (Color(0xFFFFF5ED), Color(0xFFFF8A35)),
    'Notification Settings': (Color(0xFFFFF0F3), Color(0xFFFF4B6E)),
    'Email Notifications': (Color(0xFFE6FAF5), Color(0xFF00C896)),
    'Market Alerts': (Color(0xFFFFF8E6), Color(0xFFF2A600)),
    'Dark Mode': (Color(0xFFEAEBF7), Color(0xFF010131)),
    'Language': (Color(0xFFEAF2FC), Color(0xFF5391D5)),
    'Currency': (Color(0xFFE6FAF5), Color(0xFF00C896)),
    'Theme': (Color(0xFFF0EEFE), Color(0xFF7C5FDB)),
    'Help Center': (Color(0xFFE6FAF5), Color(0xFF00C896)),
    'Report a Bug': (Color(0xFFFFF0F3), Color(0xFFFF4B6E)),
    'About': (Color(0xFFEAF2FC), Color(0xFF5391D5)),
  };

  @override
  Widget build(BuildContext context) {
    final colors = _iconColors[item.label] ?? (bg, AppColors.text2);
    final content = Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 13),
      child: Row(
        children: [
          Container(
            width: 34,
            height: 34,
            decoration: BoxDecoration(
              color: colors.$1,
              borderRadius: BorderRadius.circular(10),
            ),
            alignment: Alignment.center,
            child: Icon(item.icon, color: colors.$2, size: 16),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.label,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: text1,
                  ),
                ),
                const SizedBox(height: 1),
                Text(
                  item.subtitle,
                  style: TextStyle(fontSize: 11, color: text3),
                ),
              ],
            ),
          ),
          if (item.toggle)
            _PillSwitch(
              value: item.on,
              onChanged: item.onToggle ?? (_) {},
            )
          else
            Icon(Icons.chevron_right, size: 14, color: text3),
        ],
      ),
    );

    return InkWell(
      onTap: () {
        if (item.toggle) {
          item.onToggle?.call(!item.on);
        } else if (item.action != null) {
          item.action!();
        } else if (item.path != null) {
          context.push(item.path!);
        }
      },
      child: content,
    );
  }
}

/// 44×26 pill switch matching React `ToggleSwitch` exactly.
class _PillSwitch extends StatelessWidget {
  const _PillSwitch({required this.value, required this.onChanged});
  final bool value;
  final ValueChanged<bool> onChanged;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => onChanged(!value),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        width: 44,
        height: 26,
        padding: const EdgeInsets.all(2),
        decoration: BoxDecoration(
          color: value ? AppColors.green : AppColors.border,
          borderRadius: BorderRadius.circular(13),
        ),
        child: AnimatedAlign(
          duration: const Duration(milliseconds: 180),
          alignment: value ? Alignment.centerRight : Alignment.centerLeft,
          child: Container(
            width: 22,
            height: 22,
            decoration: BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.15),
                  blurRadius: 3,
                  offset: const Offset(0, 1),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
