import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

import '../services/auth_service.dart';
import '../services/onboarding_service.dart';
import '../theme/app_colors.dart';
import '../theme/app_theme.dart';
import '../theme/theme_controller.dart';
import '../widgets/notice_banners.dart';

class _Palette {
  final Color bg;
  final Color card;
  final Color border;
  final Color text1;
  final Color text2;
  final Color text3;
  const _Palette(this.bg, this.card, this.border, this.text1, this.text2,
      this.text3);

  factory _Palette.of(BuildContext context) {
    final dark = Theme.of(context).brightness == Brightness.dark;
    return _Palette(
      dark ? AppColors.darkBg : AppColors.bg,
      dark ? AppColors.darkCard : Colors.white,
      dark ? AppColors.darkBorder : AppColors.border,
      dark ? AppColors.darkText1 : AppColors.text1,
      dark ? AppColors.darkText2 : AppColors.text2,
      dark ? AppColors.darkText3 : AppColors.text3,
    );
  }
}

Widget _sectionLabel(String text, _Palette p) => Padding(
      padding: const EdgeInsets.fromLTRB(4, 0, 4, 8),
      child: Text(
        text.toUpperCase(),
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w700,
          letterSpacing: 1.2,
          color: p.text3,
        ),
      ),
    );

Widget _card({required List<Widget> children, required _Palette p}) =>
    Container(
      decoration: BoxDecoration(
        color: p.card,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: p.border),
      ),
      child: Column(children: children),
    );

Widget _row(
  BuildContext context, {
  required IconData icon,
  required Color iconBg,
  required Color iconFg,
  required String label,
  String? value,
  String? subtitle,
  VoidCallback? onTap,
  Widget? trailing,
  bool first = false,
  bool last = false,
}) {
  final p = _Palette.of(context);
  final content = Padding(
    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 13),
    child: Row(
      children: [
        Container(
          width: 34,
          height: 34,
          decoration: BoxDecoration(
            color: iconBg,
            borderRadius: BorderRadius.circular(10),
          ),
          alignment: Alignment.center,
          child: Icon(icon, color: iconFg, size: 16),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label,
                  style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: p.text1)),
              if (subtitle != null) ...[
                const SizedBox(height: 1),
                Text(subtitle,
                    style: TextStyle(fontSize: 11, color: p.text3)),
              ],
            ],
          ),
        ),
        if (value != null)
          Padding(
            padding: const EdgeInsets.only(right: 6),
            child: Text(value,
                style: TextStyle(fontSize: 12, color: p.text2)),
          ),
        if (trailing != null)
          trailing
        else if (onTap != null)
          Icon(Icons.chevron_right, size: 14, color: p.text3),
      ],
    ),
  );

  return Column(
    children: [
      InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.vertical(
          top: first ? const Radius.circular(14) : Radius.zero,
          bottom: last ? const Radius.circular(14) : Radius.zero,
        ),
        child: content,
      ),
      if (!last)
        Padding(
          padding: const EdgeInsets.only(left: 60),
          child: Divider(height: 1, color: p.border),
        ),
    ],
  );
}

void _snack(BuildContext context, String msg) {
  ScaffoldMessenger.of(context)
    ..hideCurrentSnackBar()
    ..showSnackBar(SnackBar(
      content: Text(msg),
      duration: const Duration(seconds: 2),
      behavior: SnackBarBehavior.floating,
    ));
}

// ============================================================
// Personal Info
// ============================================================
class PersonalInfoScreen extends StatefulWidget {
  const PersonalInfoScreen({super.key});
  @override
  State<PersonalInfoScreen> createState() => _PersonalInfoScreenState();
}

class _PersonalInfoScreenState extends State<PersonalInfoScreen> {
  late TextEditingController _name;
  late TextEditingController _phone;
  late TextEditingController _address;
  late TextEditingController _country;

  @override
  void initState() {
    super.initState();
    final auth = context.read<AuthService>();
    _name = TextEditingController(text: auth.user?.name ?? '');
    _phone = TextEditingController(text: '+971 50 000 0000');
    _address = TextEditingController(text: 'Dubai, UAE');
    _country = TextEditingController(text: 'United Arab Emirates');
  }

  @override
  void dispose() {
    _name.dispose();
    _phone.dispose();
    _address.dispose();
    _country.dispose();
    super.dispose();
  }

  Widget _field(String label, TextEditingController c, _Palette p,
      {TextInputType? keyboard}) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label,
              style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: p.text3)),
          const SizedBox(height: 6),
          TextField(
            controller: c,
            keyboardType: keyboard,
            style: TextStyle(fontSize: 14, color: p.text1),
            decoration: InputDecoration(
              isDense: true,
              contentPadding: const EdgeInsets.symmetric(
                  horizontal: 12, vertical: 10),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: BorderSide(color: p.border),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: BorderSide(color: p.border),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: const BorderSide(color: AppColors.blue),
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final p = _Palette.of(context);
    final auth = context.watch<AuthService>();
    final initials = auth.user?.initials ?? 'U';
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 28),
      children: [
        Text('Personal Info',
            style: AppTheme.heading(size: 22, color: p.text1)),
        const SizedBox(height: 4),
        Text('Update your account details',
            style: TextStyle(fontSize: 13, color: p.text3)),
        const SizedBox(height: 18),
        // Avatar card
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: p.card,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: p.border),
          ),
          child: Row(
            children: [
              Container(
                width: 64,
                height: 64,
                decoration: const BoxDecoration(
                  color: AppColors.navy,
                  shape: BoxShape.circle,
                ),
                alignment: Alignment.center,
                child: Text(initials,
                    style: AppTheme.heading(size: 20, color: Colors.white)),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(auth.user?.email ?? '',
                        style: TextStyle(fontSize: 12, color: p.text3)),
                    const SizedBox(height: 4),
                    Text('Member since Jan 2025',
                        style: TextStyle(fontSize: 11, color: p.text3)),
                  ],
                ),
              ),
              TextButton(
                onPressed: () => _snack(context, 'Photo upload coming soon'),
                child: const Text('Photo'),
              ),
            ],
          ),
        ),
        const SizedBox(height: 18),
        _sectionLabel('Contact', p),
        Container(
          decoration: BoxDecoration(
            color: p.card,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: p.border),
          ),
          padding: const EdgeInsets.symmetric(vertical: 8),
          child: Column(
            children: [
              _field('Full Name', _name, p),
              _field('Phone Number', _phone, p,
                  keyboard: TextInputType.phone),
              _field('Address', _address, p),
              _field('Country', _country, p),
            ],
          ),
        ),
        const SizedBox(height: 18),
        SizedBox(
          height: 46,
          child: ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.navy,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12)),
            ),
            onPressed: () => _snack(context, 'Profile saved'),
            child: const Text('Save Changes',
                style: TextStyle(
                    fontSize: 14, fontWeight: FontWeight.w600)),
          ),
        ),
      ],
    );
  }
}

// ============================================================
// Security & Privacy
// ============================================================
class SecurityPrivacyScreen extends StatefulWidget {
  const SecurityPrivacyScreen({super.key});
  @override
  State<SecurityPrivacyScreen> createState() => _SecurityPrivacyScreenState();
}

class _SecurityPrivacyScreenState extends State<SecurityPrivacyScreen> {
  bool _twoFA = false;
  bool _biometric = true;
  bool _analytics = true;

  @override
  Widget build(BuildContext context) {
    final p = _Palette.of(context);
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 28),
      children: [
        Text('Security & Privacy',
            style: AppTheme.heading(size: 22, color: p.text1)),
        const SizedBox(height: 4),
        Text('Protect your account and data',
            style: TextStyle(fontSize: 13, color: p.text3)),
        const SizedBox(height: 18),
        _sectionLabel('Authentication', p),
        _card(p: p, children: [
          _row(context,
              icon: Icons.lock_rounded,
              iconBg: AppColors.icPurpleBg,
              iconFg: AppColors.icPurpleFg,
              label: 'Change Password',
              subtitle: 'Last changed 3 months ago',
              first: true,
              onTap: () => _showPasswordSheet(context)),
          _row(context,
              icon: Icons.shield_rounded,
              iconBg: AppColors.icGreenBg,
              iconFg: AppColors.icGreenFg,
              label: 'Two-Factor Authentication',
              subtitle: 'Add SMS or app verification',
              trailing: Switch(
                value: _twoFA,
                onChanged: (v) {
                  setState(() => _twoFA = v);
                  _snack(context,
                      v ? '2FA enabled' : '2FA disabled');
                },
              )),
          _row(context,
              icon: Icons.fingerprint_rounded,
              iconBg: AppColors.icBlueBg,
              iconFg: AppColors.icBlueFg,
              label: 'Biometric Sign-In',
              subtitle: 'Face ID / Touch ID',
              last: true,
              trailing: Switch(
                value: _biometric,
                onChanged: (v) {
                  setState(() => _biometric = v);
                  _snack(context,
                      v ? 'Biometric enabled' : 'Biometric disabled');
                },
              )),
        ]),
        const SizedBox(height: 18),
        _sectionLabel('Privacy', p),
        _card(p: p, children: [
          _row(context,
              icon: Icons.analytics_rounded,
              iconBg: AppColors.icAmberBg,
              iconFg: AppColors.icAmberFg,
              label: 'Usage Analytics',
              subtitle: 'Anonymous app analytics',
              first: true,
              trailing: Switch(
                value: _analytics,
                onChanged: (v) => setState(() => _analytics = v),
              )),
          _row(context,
              icon: Icons.history_rounded,
              iconBg: AppColors.icBlueBg,
              iconFg: AppColors.icBlueFg,
              label: 'Active Sessions',
              subtitle: '1 device',
              onTap: () => _snack(context,
                  'You are signed in on this device only')),
          _row(context,
              icon: Icons.download_rounded,
              iconBg: AppColors.icGreenBg,
              iconFg: AppColors.icGreenFg,
              label: 'Download My Data',
              subtitle: 'Get a copy of your data',
              last: true,
              onTap: () =>
                  _snack(context, 'Data export emailed within 24 hours')),
        ]),
        const SizedBox(height: 18),
        _sectionLabel('Danger Zone', p),
        _card(p: p, children: [
          _row(context,
              icon: Icons.delete_forever_rounded,
              iconBg: AppColors.icRedBg,
              iconFg: AppColors.icRedFg,
              label: 'Delete Account',
              subtitle: 'Permanently remove your account',
              first: true,
              last: true,
              onTap: () => _confirmDelete(context)),
        ]),
      ],
    );
  }

  void _showPasswordSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Theme.of(context).brightness == Brightness.dark
          ? AppColors.darkCard
          : Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        final p = _Palette.of(ctx);
        final old = TextEditingController();
        final n = TextEditingController();
        final c = TextEditingController();
        return Padding(
          padding: EdgeInsets.fromLTRB(20, 20, 20,
              MediaQuery.of(ctx).viewInsets.bottom + 20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text('Change Password',
                  style: AppTheme.heading(size: 18, color: p.text1)),
              const SizedBox(height: 14),
              TextField(
                  controller: old,
                  obscureText: true,
                  decoration:
                      const InputDecoration(labelText: 'Current Password')),
              const SizedBox(height: 10),
              TextField(
                  controller: n,
                  obscureText: true,
                  decoration:
                      const InputDecoration(labelText: 'New Password')),
              const SizedBox(height: 10),
              TextField(
                  controller: c,
                  obscureText: true,
                  decoration: const InputDecoration(
                      labelText: 'Confirm Password')),
              const SizedBox(height: 18),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.navy,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14)),
                onPressed: () {
                  Navigator.pop(ctx);
                  _snack(context, 'Password updated');
                },
                child: const Text('Update Password'),
              ),
            ],
          ),
        );
      },
    );
  }

  void _confirmDelete(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Account?'),
        content: const Text(
            'This will permanently remove your account and all data. This cannot be undone.'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Cancel')),
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
              _snack(context,
                  'Account deletion request submitted. We will email you.');
            },
            child: const Text('Delete',
                style: TextStyle(color: AppColors.red)),
          ),
        ],
      ),
    );
  }
}

// ============================================================
// Notification Settings
// ============================================================
class NotificationSettingsScreen extends StatefulWidget {
  const NotificationSettingsScreen({super.key});
  @override
  State<NotificationSettingsScreen> createState() =>
      _NotificationSettingsScreenState();
}

class _NotificationSettingsScreenState
    extends State<NotificationSettingsScreen> {
  bool _push = true;
  bool _portfolio = true;
  bool _priceAlerts = true;
  bool _earnings = false;
  bool _news = true;
  bool _achievements = true;
  bool _quietHours = false;

  Widget _toggleRow(String label, String subtitle, bool value,
      ValueChanged<bool> onChanged,
      {required IconData icon,
      required Color bg,
      required Color fg,
      bool first = false,
      bool last = false}) {
    return _row(context,
        icon: icon,
        iconBg: bg,
        iconFg: fg,
        label: label,
        subtitle: subtitle,
        first: first,
        last: last,
        trailing: Switch(value: value, onChanged: onChanged));
  }

  @override
  Widget build(BuildContext context) {
    final p = _Palette.of(context);
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 28),
      children: [
        Text('Notification Settings',
            style: AppTheme.heading(size: 22, color: p.text1)),
        const SizedBox(height: 4),
        Text('Choose what reaches you',
            style: TextStyle(fontSize: 13, color: p.text3)),
        const SizedBox(height: 18),
        _sectionLabel('General', p),
        _card(p: p, children: [
          _toggleRow('Push Notifications', 'Master on/off', _push,
              (v) => setState(() => _push = v),
              icon: Icons.notifications_rounded,
              bg: AppColors.icRedBg,
              fg: AppColors.icRedFg,
              first: true,
              last: true),
        ]),
        const SizedBox(height: 18),
        _sectionLabel('Categories', p),
        _card(p: p, children: [
          _toggleRow('Portfolio Updates', 'Daily summary', _portfolio,
              (v) => setState(() => _portfolio = v),
              icon: Icons.account_balance_wallet_rounded,
              bg: AppColors.icGreenBg,
              fg: AppColors.icGreenFg,
              first: true),
          _toggleRow('Price Alerts', 'Hit your set targets', _priceAlerts,
              (v) => setState(() => _priceAlerts = v),
              icon: Icons.show_chart_rounded,
              bg: AppColors.icAmberBg,
              fg: AppColors.icAmberFg),
          _toggleRow('Earnings Reports', 'Companies on your watchlist',
              _earnings, (v) => setState(() => _earnings = v),
              icon: Icons.assessment_rounded,
              bg: AppColors.icPurpleBg,
              fg: AppColors.icPurpleFg),
          _toggleRow('News Digest', 'Daily GCC market news', _news,
              (v) => setState(() => _news = v),
              icon: Icons.newspaper_rounded,
              bg: AppColors.icBlueBg,
              fg: AppColors.icBlueFg),
          _toggleRow('Achievements', 'Unlocks & milestones', _achievements,
              (v) => setState(() => _achievements = v),
              icon: Icons.emoji_events_rounded,
              bg: AppColors.icTealBg,
              fg: AppColors.icTealFg,
              last: true),
        ]),
        const SizedBox(height: 18),
        _sectionLabel('Quiet Hours', p),
        _card(p: p, children: [
          _toggleRow('Do Not Disturb', '10:00 PM – 7:00 AM', _quietHours,
              (v) => setState(() => _quietHours = v),
              icon: Icons.nightlight_rounded,
              bg: AppColors.icNavyBg,
              fg: AppColors.icNavyFg,
              first: true,
              last: true),
        ]),
      ],
    );
  }
}

// ============================================================
// Help Center
// ============================================================
class HelpCenterScreen extends StatelessWidget {
  const HelpCenterScreen({super.key});

  static const _faqs = <(String, String)>[
    (
      'How do I add a stock to my portfolio?',
      'Open Portfolio → tap + Add Holding → choose asset type → enter ticker, quantity, and cost.'
    ),
    (
      'Where do the prices come from?',
      'Stocks use static GCC company data. Crypto comes from CoinGecko. Metals/oil use Yahoo Finance with fallback prices.'
    ),
    (
      'Is my data shared?',
      'No. All portfolio data is stored locally on your device. We do not sell your data.'
    ),
    (
      'How do I cancel my subscription?',
      'Open Settings → Subscription → Manage Plan. Cancellations take effect at the end of the current period.'
    ),
    (
      'Can I export my portfolio?',
      'Yes. Portfolio → ⋯ menu → Export CSV. PDF report export coming soon.'
    ),
    (
      'How do I report a bug?',
      'Settings → Report a Bug → describe the issue and tap Send. We respond within 48 hours.'
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final p = _Palette.of(context);
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 28),
      children: [
        Text('Help Center',
            style: AppTheme.heading(size: 22, color: p.text1)),
        const SizedBox(height: 4),
        Text('FAQs, guides, and contact options',
            style: TextStyle(fontSize: 13, color: p.text3)),
        const SizedBox(height: 18),
        _sectionLabel('Contact', p),
        _card(p: p, children: [
          _row(context,
              icon: Icons.email_rounded,
              iconBg: AppColors.icBlueBg,
              iconFg: AppColors.icBlueFg,
              label: 'Email Support',
              subtitle: 'asaad@viftraining.com',
              first: true,
              onTap: () => launchUrl(
                  Uri.parse('mailto:asaad@viftraining.com?subject=Ashom Support'),
                  mode: LaunchMode.externalApplication)),
          _row(context,
              icon: Icons.public_rounded,
              iconBg: AppColors.icGreenBg,
              iconFg: AppColors.icGreenFg,
              label: 'Website',
              subtitle: 'ashom.app',
              onTap: () => launchUrl(Uri.parse('https://ashom.app'),
                  mode: LaunchMode.externalApplication)),
          _row(context,
              icon: Icons.tour_rounded,
              iconBg: AppColors.icAmberBg,
              iconFg: AppColors.icAmberFg,
              label: 'Replay app tour',
              subtitle: 'Show the welcome screens again',
              last: true,
              onTap: () async {
                await context.read<OnboardingService>().reset();
                if (!context.mounted) return;
                _snack(context, 'Tour restarted — restart the app to view');
              }),
        ]),
        const SizedBox(height: 18),
        _sectionLabel('Frequently Asked', p),
        _card(p: p, children: [
          for (var i = 0; i < _faqs.length; i++)
            _ExpansionRow(
              question: _faqs[i].$1,
              answer: _faqs[i].$2,
              first: i == 0,
              last: i == _faqs.length - 1,
            ),
        ]),
      ],
    );
  }
}

class _ExpansionRow extends StatefulWidget {
  const _ExpansionRow({
    required this.question,
    required this.answer,
    this.first = false,
    this.last = false,
  });
  final String question;
  final String answer;
  final bool first;
  final bool last;
  @override
  State<_ExpansionRow> createState() => _ExpansionRowState();
}

class _ExpansionRowState extends State<_ExpansionRow> {
  bool _open = false;
  @override
  Widget build(BuildContext context) {
    final p = _Palette.of(context);
    return Column(
      children: [
        InkWell(
          onTap: () => setState(() => _open = !_open),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 13),
            child: Row(
              children: [
                Expanded(
                  child: Text(widget.question,
                      style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: p.text1)),
                ),
                Icon(_open ? Icons.expand_less : Icons.expand_more,
                    size: 18, color: p.text3),
              ],
            ),
          ),
        ),
        if (_open)
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 14),
            child: Align(
              alignment: Alignment.centerLeft,
              child: Text(widget.answer,
                  style: TextStyle(fontSize: 12, color: p.text2, height: 1.5)),
            ),
          ),
        if (!widget.last) Divider(height: 1, color: p.border),
      ],
    );
  }
}

// ============================================================
// Report a Bug
// ============================================================
class ReportBugScreen extends StatefulWidget {
  const ReportBugScreen({super.key});
  @override
  State<ReportBugScreen> createState() => _ReportBugScreenState();
}

class _ReportBugScreenState extends State<ReportBugScreen> {
  final _subject = TextEditingController();
  final _body = TextEditingController();
  String _severity = 'Medium';

  @override
  void dispose() {
    _subject.dispose();
    _body.dispose();
    super.dispose();
  }

  Future<void> _send() async {
    final uri = Uri(
      scheme: 'mailto',
      path: 'asaad@viftraining.com',
      queryParameters: {
        'subject': '[Bug — $_severity] ${_subject.text}',
        'body':
            '${_body.text}\n\n---\nApp: Ashom 1.36 (build 36)\nPlatform: iOS',
      },
    );
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      if (mounted) _snack(context, 'Could not open email client');
    }
  }

  @override
  Widget build(BuildContext context) {
    final p = _Palette.of(context);
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 28),
      children: [
        Text('Report a Bug',
            style: AppTheme.heading(size: 22, color: p.text1)),
        const SizedBox(height: 4),
        Text("Describe what went wrong — we'll look into it",
            style: TextStyle(fontSize: 13, color: p.text3)),
        const SizedBox(height: 18),
        _sectionLabel('Severity', p),
        _card(p: p, children: [
          for (final s in const ['Low', 'Medium', 'High', 'Crash'])
            _row(context,
                icon: Icons.flag_rounded,
                iconBg: s == 'Crash'
                    ? AppColors.icRedBg
                    : s == 'High'
                        ? AppColors.icOrangeBg
                        : s == 'Medium'
                            ? AppColors.icAmberBg
                            : AppColors.icGreenBg,
                iconFg: s == 'Crash'
                    ? AppColors.icRedFg
                    : s == 'High'
                        ? AppColors.icOrangeFg
                        : s == 'Medium'
                            ? AppColors.icAmberFg
                            : AppColors.icGreenFg,
                label: s,
                first: s == 'Low',
                last: s == 'Crash',
                onTap: () => setState(() => _severity = s),
                trailing: _severity == s
                    ? const Icon(Icons.check_circle_rounded,
                        size: 18, color: AppColors.blue)
                    : Icon(Icons.radio_button_unchecked,
                        size: 18, color: p.text3)),
        ]),
        const SizedBox(height: 18),
        _sectionLabel('Details', p),
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: p.card,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: p.border),
          ),
          child: Column(
            children: [
              TextField(
                controller: _subject,
                style: TextStyle(fontSize: 13, color: p.text1),
                decoration: const InputDecoration(
                  hintText: 'Short summary',
                  border: InputBorder.none,
                ),
              ),
              Divider(height: 1, color: p.border),
              TextField(
                controller: _body,
                maxLines: 6,
                minLines: 6,
                style: TextStyle(fontSize: 13, color: p.text1),
                decoration: const InputDecoration(
                  hintText:
                      'Steps to reproduce, what you expected, what happened…',
                  border: InputBorder.none,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 18),
        SizedBox(
          height: 46,
          child: ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.navy,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12)),
            ),
            onPressed: _send,
            icon: const Icon(Icons.send_rounded, size: 16),
            label: const Text('Send Report'),
          ),
        ),
      ],
    );
  }
}

// ============================================================
// About
// ============================================================
class AboutScreen extends StatelessWidget {
  const AboutScreen({super.key});
  @override
  Widget build(BuildContext context) {
    final p = _Palette.of(context);
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 28),
      children: [
        Center(
          child: Column(
            children: [
              Container(
                width: 84,
                height: 84,
                decoration: BoxDecoration(
                  color: AppColors.navy,
                  borderRadius: BorderRadius.circular(20),
                ),
                alignment: Alignment.center,
                child: const Text('A',
                    style: TextStyle(
                        fontSize: 48,
                        fontWeight: FontWeight.w800,
                        color: Colors.white)),
              ),
              const SizedBox(height: 14),
              Text('Ashom',
                  style: AppTheme.heading(size: 24, color: p.text1)),
              Text('GCC Financial Intelligence',
                  style: TextStyle(fontSize: 13, color: p.text3)),
              const SizedBox(height: 6),
              Text('Version 1.36.0 (Build 36)',
                  style: TextStyle(fontSize: 12, color: p.text3)),
            ],
          ),
        ),
        const SizedBox(height: 22),
        _card(p: p, children: [
          _row(context,
              icon: Icons.business_rounded,
              iconBg: AppColors.icNavyBg,
              iconFg: AppColors.icNavyFg,
              label: 'Publisher',
              subtitle: 'VIA Institute of Finance DMCC',
              first: true),
          _row(context,
              icon: Icons.public_rounded,
              iconBg: AppColors.icBlueBg,
              iconFg: AppColors.icBlueFg,
              label: 'Website',
              subtitle: 'ashom.app',
              onTap: () => launchUrl(Uri.parse('https://ashom.app'),
                  mode: LaunchMode.externalApplication)),
          _row(context,
              icon: Icons.mail_rounded,
              iconBg: AppColors.icGreenBg,
              iconFg: AppColors.icGreenFg,
              label: 'Contact',
              subtitle: 'asaad@viftraining.com',
              onTap: () => launchUrl(
                  Uri.parse('mailto:asaad@viftraining.com'),
                  mode: LaunchMode.externalApplication)),
          _row(context,
              icon: Icons.copyright_rounded,
              iconBg: AppColors.icPurpleBg,
              iconFg: AppColors.icPurpleFg,
              label: 'Copyright',
              subtitle: '© 2026 VIFM. All rights reserved.',
              last: true),
        ]),
      ],
    );
  }
}

// ============================================================
// Static info screen (Terms / Privacy / Data Sources / etc.)
// ============================================================
class StaticInfoScreen extends StatelessWidget {
  const StaticInfoScreen({
    super.key,
    required this.title,
    required this.sections,
  });

  final String title;
  final List<(String, String)> sections;

  @override
  Widget build(BuildContext context) {
    final p = _Palette.of(context);
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 28),
      children: [
        Text(title, style: AppTheme.heading(size: 22, color: p.text1)),
        const SizedBox(height: 18),
        for (final s in sections) ...[
          Text(s.$1,
              style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: p.text1)),
          const SizedBox(height: 8),
          Text(s.$2,
              style: TextStyle(
                  fontSize: 13, color: p.text2, height: 1.55)),
          const SizedBox(height: 18),
        ],
      ],
    );
  }
}

// ============================================================
// Subscription / Pricing
// ============================================================
class PricingScreen extends StatelessWidget {
  const PricingScreen({super.key});

  static const _plans = <_Plan>[
    _Plan('Free', '\$0', 'forever', [
      'Up to 10 watchlist items',
      'Basic market data',
      'Limited historical charts',
    ]),
    _Plan('Pro', '\$9.99', 'per month', [
      'Unlimited watchlists & portfolios',
      'Full GCC company database',
      'Excel/CSV exports',
      'Priority support',
    ], featured: true),
    _Plan('Institutional', '\$49', 'per month', [
      'Everything in Pro',
      'API access',
      'White-label reports',
      'Custom dashboards',
      'Dedicated account manager',
    ]),
  ];

  @override
  Widget build(BuildContext context) {
    final p = _Palette.of(context);
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 28),
      children: [
        Text('Choose Your Plan',
            style: AppTheme.heading(size: 24, color: p.text1)),
        const SizedBox(height: 6),
        Text('Switch anytime. Cancel anytime.',
            style: TextStyle(fontSize: 13, color: p.text3)),
        const ComingSoonBanner(
          margin: EdgeInsets.only(top: 14),
          note:
              'Subscriptions are not yet active — plans are shown for preview. No payment is taken.',
        ),
        const SizedBox(height: 22),
        for (final plan in _plans) ...[
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: plan.featured ? AppColors.navy : p.card,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                  color: plan.featured ? AppColors.navy : p.border,
                  width: plan.featured ? 0 : 1),
              boxShadow: plan.featured
                  ? [
                      BoxShadow(
                          color: AppColors.navy.withValues(alpha: 0.18),
                          blurRadius: 18,
                          offset: const Offset(0, 6))
                    ]
                  : null,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(plan.name,
                        style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            color: plan.featured ? Colors.white : p.text1)),
                    if (plan.featured) ...[
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: AppColors.blue,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Text('POPULAR',
                            style: TextStyle(
                                fontSize: 9,
                                fontWeight: FontWeight.w700,
                                letterSpacing: 1,
                                color: Colors.white)),
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(plan.price,
                        style: TextStyle(
                            fontSize: 28,
                            fontWeight: FontWeight.w800,
                            color:
                                plan.featured ? Colors.white : p.text1)),
                    const SizedBox(width: 6),
                    Padding(
                      padding: const EdgeInsets.only(bottom: 6),
                      child: Text(plan.cadence,
                          style: TextStyle(
                              fontSize: 12,
                              color: plan.featured
                                  ? Colors.white70
                                  : p.text3)),
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                for (final f in plan.features)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 6),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Icon(Icons.check_circle_rounded,
                            size: 14,
                            color: plan.featured
                                ? Colors.white
                                : AppColors.green),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(f,
                              style: TextStyle(
                                  fontSize: 12,
                                  color: plan.featured
                                      ? Colors.white
                                      : p.text2)),
                        ),
                      ],
                    ),
                  ),
                const SizedBox(height: 14),
                SizedBox(
                  width: double.infinity,
                  height: 42,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: plan.featured
                          ? Colors.white
                          : AppColors.navy,
                      foregroundColor: plan.featured
                          ? AppColors.navy
                          : Colors.white,
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10)),
                    ),
                    onPressed: () => _snack(context,
                        '${plan.name} plan — checkout coming soon'),
                    child: Text(
                        plan.name == 'Free' ? 'Current Plan' : 'Choose ${plan.name}',
                        style: const TextStyle(fontWeight: FontWeight.w600)),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),
        ],
      ],
    );
  }
}

class _Plan {
  final String name;
  final String price;
  final String cadence;
  final List<String> features;
  final bool featured;
  const _Plan(this.name, this.price, this.cadence, this.features,
      {this.featured = false});
}

// ============================================================
// Feature info screens (API Access, White Label, Custom Dashboard)
// ============================================================
class FeatureInfoScreen extends StatelessWidget {
  const FeatureInfoScreen({
    super.key,
    required this.title,
    required this.tagline,
    required this.icon,
    required this.accent,
    required this.bullets,
    this.comingSoon,
  });

  final String title;
  final String tagline;
  final IconData icon;
  final Color accent;
  final List<String> bullets;

  /// When set, shows a "Preview / coming soon" banner so external users aren't
  /// misled into thinking the feature is live. Mirrors the web ComingSoonBanner.
  final String? comingSoon;

  @override
  Widget build(BuildContext context) {
    final p = _Palette.of(context);
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 28),
      children: [
        Container(
          width: 64,
          height: 64,
          decoration: BoxDecoration(
            color: accent.withValues(alpha: 0.15),
            borderRadius: BorderRadius.circular(18),
          ),
          alignment: Alignment.center,
          child: Icon(icon, size: 28, color: accent),
        ),
        if (comingSoon != null)
          ComingSoonBanner(
            margin: const EdgeInsets.only(top: 16),
            note: comingSoon!,
          ),
        const SizedBox(height: 18),
        Text(title,
            style: AppTheme.heading(size: 24, color: p.text1)),
        const SizedBox(height: 6),
        Text(tagline,
            style: TextStyle(fontSize: 14, color: p.text2, height: 1.5)),
        const SizedBox(height: 22),
        _sectionLabel("What's included", p),
        _card(p: p, children: [
          for (var i = 0; i < bullets.length; i++)
            _row(context,
                icon: Icons.check_circle_rounded,
                iconBg: AppColors.icGreenBg,
                iconFg: AppColors.icGreenFg,
                label: bullets[i],
                first: i == 0,
                last: i == bullets.length - 1),
        ]),
        const SizedBox(height: 22),
        SizedBox(
          height: 46,
          child: ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: accent,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12)),
            ),
            onPressed: () => _snack(context, 'Contact sales coming soon'),
            child: const Text('Contact Sales'),
          ),
        ),
      ],
    );
  }
}

// ============================================================
// Bottom-sheet pickers for Language / Currency / Theme
// ============================================================
Future<void> showLanguagePicker(BuildContext context,
    {required String current,
    required ValueChanged<String> onSelected}) async {
  await _pickerSheet(context,
      title: 'Language',
      options: const [
        ('English', 'English'),
        ('العربية', 'Arabic'),
      ],
      current: current,
      onSelected: onSelected);
}

Future<void> showCurrencyPicker(BuildContext context,
    {required String current,
    required ValueChanged<String> onSelected}) async {
  await _pickerSheet(context,
      title: 'Currency',
      options: const [
        ('USD', 'US Dollar'),
        ('SAR', 'Saudi Riyal'),
        ('AED', 'UAE Dirham'),
        ('KWD', 'Kuwaiti Dinar'),
        ('QAR', 'Qatari Riyal'),
        ('BHD', 'Bahraini Dinar'),
        ('OMR', 'Omani Rial'),
      ],
      current: current,
      onSelected: onSelected);
}

Future<void> showThemePicker(BuildContext context, ThemeController theme) async {
  await _pickerSheet(context,
      title: 'Theme',
      options: const [
        ('Light', 'Always light'),
        ('Dark', 'Always dark'),
      ],
      current: theme.isDark ? 'Dark' : 'Light',
      onSelected: (v) {
        final wantDark = v == 'Dark';
        if (theme.isDark != wantDark) theme.toggle();
      });
}

Future<void> _pickerSheet(
  BuildContext context, {
  required String title,
  required List<(String, String)> options,
  required String current,
  required ValueChanged<String> onSelected,
}) async {
  final dark = Theme.of(context).brightness == Brightness.dark;
  await showModalBottomSheet(
    context: context,
    backgroundColor: dark ? AppColors.darkCard : Colors.white,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
    ),
    builder: (ctx) {
      final p = _Palette.of(ctx);
      return SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 36,
              height: 4,
              margin: const EdgeInsets.symmetric(vertical: 10),
              decoration: BoxDecoration(
                color: p.border,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 4, 20, 12),
              child: Align(
                alignment: Alignment.centerLeft,
                child: Text(title,
                    style: AppTheme.heading(size: 18, color: p.text1)),
              ),
            ),
            for (final o in options)
              InkWell(
                onTap: () {
                  onSelected(o.$1);
                  Navigator.pop(ctx);
                },
                child: Padding(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 20, vertical: 14),
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(o.$1,
                                style: TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w600,
                                    color: p.text1)),
                            const SizedBox(height: 2),
                            Text(o.$2,
                                style: TextStyle(
                                    fontSize: 12, color: p.text3)),
                          ],
                        ),
                      ),
                      if (current == o.$1)
                        const Icon(Icons.check_rounded,
                            color: AppColors.blue, size: 20),
                    ],
                  ),
                ),
              ),
            const SizedBox(height: 8),
          ],
        ),
      );
    },
  );
}
