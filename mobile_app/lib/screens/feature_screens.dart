import 'package:flutter/material.dart';

import '../theme/app_colors.dart';
import '../theme/app_theme.dart';

class _P {
  final Color bg, card, border, t1, t2, t3;
  const _P(this.bg, this.card, this.border, this.t1, this.t2, this.t3);
  factory _P.of(BuildContext c) {
    final d = Theme.of(c).brightness == Brightness.dark;
    return _P(
      d ? AppColors.darkBg : AppColors.bg,
      d ? AppColors.darkCard : Colors.white,
      d ? AppColors.darkBorder : AppColors.border,
      d ? AppColors.darkText1 : AppColors.text1,
      d ? AppColors.darkText2 : AppColors.text2,
      d ? AppColors.darkText3 : AppColors.text3,
    );
  }
}

Widget _header(BuildContext c, String title, String tagline, IconData icon,
    Color accent) {
  final p = _P.of(c);
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Container(
        width: 56,
        height: 56,
        decoration: BoxDecoration(
          color: accent.withValues(alpha: 0.15),
          borderRadius: BorderRadius.circular(16),
        ),
        alignment: Alignment.center,
        child: Icon(icon, size: 26, color: accent),
      ),
      const SizedBox(height: 14),
      Text(title, style: AppTheme.heading(size: 22, color: p.t1)),
      const SizedBox(height: 4),
      Text(tagline,
          style: TextStyle(fontSize: 13, color: p.t3, height: 1.5)),
    ],
  );
}

Widget _tile(BuildContext c,
    {required IconData icon,
    required Color bg,
    required Color fg,
    required String title,
    required String subtitle,
    VoidCallback? onTap}) {
  final p = _P.of(c);
  return InkWell(
    onTap: onTap ??
        () {
          ScaffoldMessenger.of(c)
            ..hideCurrentSnackBar()
            ..showSnackBar(SnackBar(
              content: Text('$title — opens in next update'),
              duration: const Duration(seconds: 2),
              behavior: SnackBarBehavior.floating,
            ));
        },
    borderRadius: BorderRadius.circular(14),
    child: Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: p.card,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: p.border),
      ),
      child: Row(
        children: [
          Container(
            width: 38,
            height: 38,
            decoration: BoxDecoration(
              color: bg,
              borderRadius: BorderRadius.circular(10),
            ),
            alignment: Alignment.center,
            child: Icon(icon, color: fg, size: 18),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title,
                    style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: p.t1)),
                const SizedBox(height: 2),
                Text(subtitle,
                    style: TextStyle(fontSize: 11, color: p.t3)),
              ],
            ),
          ),
          Icon(Icons.chevron_right, size: 14, color: p.t3),
        ],
      ),
    ),
  );
}

// ============================================================
// University
// ============================================================
class UniversityScreen extends StatelessWidget {
  const UniversityScreen({super.key});

  static const _courses = <(String, String, String)>[
    (
      'Equity Analysis Fundamentals',
      '8 modules • 6 hours',
      'P/E, EV/EBITDA, DCF and CFA-style ratio breakdowns.'
    ),
    (
      'GCC Markets 101',
      '6 modules • 4 hours',
      'TASI, DFM, ADX, Boursa Kuwait, QSE, BHB, MSX — structure & access.'
    ),
    (
      'Portfolio Construction',
      '10 modules • 8 hours',
      'Asset allocation, rebalancing, factor tilts, GCC-specific risks.'
    ),
    (
      'Sukuk & Islamic Finance',
      '5 modules • 3 hours',
      'Sharia-compliant fixed income and AAOIFI screening rules.'
    ),
    (
      'Commodities & Energy',
      '7 modules • 5 hours',
      'Oil, gas, metals — pricing, hedging, GCC exposure.'
    ),
    (
      'Quant for Stock Pickers',
      '9 modules • 7 hours',
      'Factor models, regression, optimization basics.'
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final p = _P.of(context);
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 28),
      children: [
        _header(context, 'University',
            'Free finance courses tailored to GCC markets.',
            Icons.school_rounded, AppColors.icPurpleFg),
        const SizedBox(height: 20),
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                AppColors.navy,
                AppColors.navy.withValues(alpha: 0.85)
              ],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Row(
            children: [
              const Icon(Icons.workspace_premium_rounded,
                  color: Colors.white, size: 28),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: const [
                    Text('Earn certificates',
                        style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w700,
                            fontSize: 14)),
                    SizedBox(height: 2),
                    Text(
                      'Complete a path to unlock a verified certificate.',
                      style: TextStyle(color: Colors.white70, fontSize: 12),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),
        Text('Courses',
            style: TextStyle(
                fontSize: 13, fontWeight: FontWeight.w700, color: p.t2)),
        const SizedBox(height: 10),
        for (final c in _courses) ...[
          _tile(context,
              icon: Icons.menu_book_rounded,
              bg: AppColors.icBlueBg,
              fg: AppColors.icBlueFg,
              title: c.$1,
              subtitle: '${c.$2} — ${c.$3}'),
          const SizedBox(height: 10),
        ],
      ],
    );
  }
}

// ============================================================
// Verify Certificate
// ============================================================
class VerifyCertificateScreen extends StatefulWidget {
  const VerifyCertificateScreen({super.key});
  @override
  State<VerifyCertificateScreen> createState() =>
      _VerifyCertificateScreenState();
}

class _VerifyCertificateScreenState extends State<VerifyCertificateScreen> {
  final _id = TextEditingController();
  String? _result;
  bool _valid = false;

  void _verify() {
    final v = _id.text.trim();
    final ok = v.toUpperCase().startsWith('ASH-') && v.length >= 8;
    setState(() {
      _valid = ok;
      _result = ok
          ? "Certificate $v is valid — issued by Ashom University, signed by VIA Institute of Finance DMCC."
          : "We couldn't find a certificate with that ID. Check the code on the certificate (format: ASH-XXXXXX).";
    });
  }

  @override
  Widget build(BuildContext context) {
    final p = _P.of(context);
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 28),
      children: [
        _header(context, 'Verify Certificate',
            'Confirm authenticity of an Ashom University certificate.',
            Icons.verified_rounded, AppColors.icGreenFg),
        const SizedBox(height: 20),
        TextField(
          controller: _id,
          textCapitalization: TextCapitalization.characters,
          decoration: InputDecoration(
            labelText: 'Certificate ID',
            hintText: 'ASH-XXXXXX',
            border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: p.border)),
            enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: p.border)),
          ),
        ),
        const SizedBox(height: 14),
        SizedBox(
          height: 46,
          child: ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.navy,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12)),
            ),
            onPressed: _verify,
            icon: const Icon(Icons.search_rounded, size: 16),
            label: const Text('Verify'),
          ),
        ),
        if (_result != null) ...[
          const SizedBox(height: 18),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: _valid ? AppColors.greenBg : AppColors.redBg,
              borderRadius: BorderRadius.circular(14),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(
                    _valid
                        ? Icons.check_circle_rounded
                        : Icons.error_outline_rounded,
                    color: _valid ? AppColors.green : AppColors.red),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(_result!,
                      style: TextStyle(
                          fontSize: 12,
                          color:
                              _valid ? AppColors.green : AppColors.red,
                          height: 1.5)),
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }
}

// ============================================================
// Multi-Portfolio (Portfolios list)
// ============================================================
class MultiPortfolioScreen extends StatelessWidget {
  const MultiPortfolioScreen({super.key});

  static const _portfolios = <(String, String, String, String)>[
    ('My Long-Term', '\$84,520', '+12.4% YTD', 'green'),
    ('Speculative', '\$11,200', '-3.1% YTD', 'red'),
    ('Sharia Compliant', '\$26,800', '+5.7% YTD', 'green'),
    ('Family Trust', '\$152,300', '+8.9% YTD', 'green'),
  ];

  @override
  Widget build(BuildContext context) {
    final p = _P.of(context);
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 28),
      children: [
        _header(context, 'Portfolios',
            'Manage multiple portfolios — switch contexts, track each independently.',
            Icons.folder_special_rounded, AppColors.icNavyFg),
        const SizedBox(height: 20),
        SizedBox(
          height: 46,
          child: ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.navy,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12)),
            ),
            onPressed: () => ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('New portfolio — coming soon'))),
            icon: const Icon(Icons.add, size: 18),
            label: const Text('New Portfolio'),
          ),
        ),
        const SizedBox(height: 18),
        for (final pf in _portfolios) ...[
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: p.card,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: p.border),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(pf.$1,
                          style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                              color: p.t1)),
                    ),
                    Icon(Icons.more_horiz, size: 18, color: p.t3),
                  ],
                ),
                const SizedBox(height: 6),
                Text(pf.$2,
                    style: AppTheme.heading(size: 22, color: p.t1)),
                const SizedBox(height: 4),
                Text(pf.$3,
                    style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: pf.$4 == 'green'
                            ? AppColors.green
                            : AppColors.red)),
              ],
            ),
          ),
          const SizedBox(height: 12),
        ],
      ],
    );
  }
}

// ============================================================
// Learning Paths
// ============================================================
class LearningPathsScreen extends StatelessWidget {
  const LearningPathsScreen({super.key});

  static const _paths = <(String, String, String)>[
    (
      'Beginner Investor',
      '4 weeks',
      'From zero to your first portfolio — basics, market mechanics, account setup.'
    ),
    (
      'Equity Analyst',
      '8 weeks',
      'Master CFA-style ratio analysis, screening, and pitching equity ideas.'
    ),
    (
      'Quant Practitioner',
      '12 weeks',
      'Factor models, optimization, risk analytics. Codes in our Quant Lab.'
    ),
    (
      'Islamic Finance Specialist',
      '6 weeks',
      'Sharia screening, sukuk valuation, AAOIFI standards.'
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 28),
      children: [
        _header(context, 'Learning Paths',
            'Structured journeys — combine courses to master a skill.',
            Icons.route_rounded, AppColors.icTealFg),
        const SizedBox(height: 20),
        for (final pth in _paths) ...[
          _tile(context,
              icon: Icons.flag_rounded,
              bg: AppColors.icPurpleBg,
              fg: AppColors.icPurpleFg,
              title: pth.$1,
              subtitle: '${pth.$2} — ${pth.$3}'),
          const SizedBox(height: 10),
        ],
      ],
    );
  }
}

// ============================================================
// Comparison Results
// ============================================================
class ComparisonResultsScreen extends StatelessWidget {
  const ComparisonResultsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final p = _P.of(context);
    final demoMetrics = <(String, String, String)>[
      ('P/E Ratio', '18.2x', '15.4x'),
      ('Dividend Yield', '4.1%', '3.6%'),
      ('ROE', '17.8%', '21.5%'),
      ('Debt/Equity', '0.42', '0.31'),
      ('Revenue (TTM)', '\$48.3B', '\$32.1B'),
      ('Net Income', '\$8.9B', '\$6.4B'),
    ];
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 28),
      children: [
        _header(context, 'Comparison Results',
            'Saudi Aramco vs ADNOC Distribution — fundamental snapshot.',
            Icons.compare_arrows_rounded, AppColors.icAmberFg),
        const SizedBox(height: 20),
        Container(
          decoration: BoxDecoration(
            color: p.card,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: p.border),
          ),
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 16, vertical: 12),
                decoration: BoxDecoration(
                  color: p.bg,
                  borderRadius:
                      const BorderRadius.vertical(top: Radius.circular(14)),
                ),
                child: Row(
                  children: [
                    Expanded(
                        flex: 3,
                        child: Text('Metric',
                            style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                color: p.t3))),
                    Expanded(
                        flex: 2,
                        child: Text('Aramco',
                            textAlign: TextAlign.right,
                            style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                color: p.t3))),
                    Expanded(
                        flex: 2,
                        child: Text('ADNOC',
                            textAlign: TextAlign.right,
                            style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                color: p.t3))),
                  ],
                ),
              ),
              for (final m in demoMetrics)
                Padding(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 16, vertical: 12),
                  child: Row(
                    children: [
                      Expanded(
                          flex: 3,
                          child: Text(m.$1,
                              style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w500,
                                  color: p.t1))),
                      Expanded(
                          flex: 2,
                          child: Text(m.$2,
                              textAlign: TextAlign.right,
                              style: TextStyle(
                                  fontSize: 13, color: p.t2))),
                      Expanded(
                          flex: 2,
                          child: Text(m.$3,
                              textAlign: TextAlign.right,
                              style: TextStyle(
                                  fontSize: 13, color: p.t2))),
                    ],
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
            onPressed: () => ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Export PDF — coming soon'))),
            icon: const Icon(Icons.picture_as_pdf_rounded, size: 16),
            label: const Text('Export to PDF'),
          ),
        ),
      ],
    );
  }
}

// ============================================================
// Report Export
// ============================================================
class ReportExportScreen extends StatefulWidget {
  const ReportExportScreen({super.key});
  @override
  State<ReportExportScreen> createState() => _ReportExportScreenState();
}

class _ReportExportScreenState extends State<ReportExportScreen> {
  String _format = 'PDF';
  bool _holdings = true;
  bool _performance = true;
  bool _allocation = true;
  bool _zakat = false;

  @override
  Widget build(BuildContext context) {
    final p = _P.of(context);
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 28),
      children: [
        _header(context, 'Export Report',
            'Generate a polished report of your portfolio.',
            Icons.summarize_rounded, AppColors.icOrangeFg),
        const SizedBox(height: 20),
        Text('Format',
            style: TextStyle(
                fontSize: 12, fontWeight: FontWeight.w700, color: p.t3)),
        const SizedBox(height: 8),
        Row(
          children: [
            for (final f in const ['PDF', 'Excel', 'CSV']) ...[
              Expanded(
                child: GestureDetector(
                  onTap: () => setState(() => _format = f),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    margin: const EdgeInsets.symmetric(horizontal: 3),
                    decoration: BoxDecoration(
                      color: _format == f ? AppColors.navy : p.card,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: p.border),
                    ),
                    alignment: Alignment.center,
                    child: Text(f,
                        style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color:
                                _format == f ? Colors.white : p.t1)),
                  ),
                ),
              ),
            ],
          ],
        ),
        const SizedBox(height: 22),
        Text('Sections',
            style: TextStyle(
                fontSize: 12, fontWeight: FontWeight.w700, color: p.t3)),
        const SizedBox(height: 8),
        for (final (label, value, setter) in <(String, bool, ValueChanged<bool>)>[
          ('Holdings table', _holdings, (v) => setState(() => _holdings = v)),
          ('Performance chart', _performance,
              (v) => setState(() => _performance = v)),
          ('Allocation breakdown', _allocation,
              (v) => setState(() => _allocation = v)),
          ('Zakat estimate', _zakat, (v) => setState(() => _zakat = v)),
        ])
          Container(
            margin: const EdgeInsets.only(bottom: 8),
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: BoxDecoration(
              color: p.card,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: p.border),
            ),
            child: Row(
              children: [
                Expanded(
                    child: Text(label,
                        style: TextStyle(fontSize: 13, color: p.t1))),
                Switch(value: value, onChanged: setter),
              ],
            ),
          ),
        const SizedBox(height: 14),
        SizedBox(
          height: 46,
          child: ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.navy,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12)),
            ),
            onPressed: () => ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                    content: Text(
                        'Generating $_format report — we will email it to you'))),
            icon: const Icon(Icons.download_rounded, size: 16),
            label: Text('Generate $_format'),
          ),
        ),
      ],
    );
  }
}

// ============================================================
// Quant Lab sub-pages — share a single info layout
// ============================================================
class QuantInfoScreen extends StatelessWidget {
  const QuantInfoScreen({
    super.key,
    required this.title,
    required this.tagline,
    required this.icon,
    required this.accent,
    required this.bullets,
  });

  final String title;
  final String tagline;
  final IconData icon;
  final Color accent;
  final List<String> bullets;

  @override
  Widget build(BuildContext context) {
    final p = _P.of(context);
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 28),
      children: [
        _header(context, title, tagline, icon, accent),
        const SizedBox(height: 22),
        Container(
          decoration: BoxDecoration(
            color: p.card,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: p.border),
          ),
          padding:
              const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          child: Column(
            children: [
              for (final b in bullets)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Icon(Icons.check_circle_rounded,
                          color: AppColors.green, size: 16),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(b,
                            style: TextStyle(
                                fontSize: 13, color: p.t1, height: 1.4)),
                      ),
                    ],
                  ),
                ),
            ],
          ),
        ),
        const SizedBox(height: 18),
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [accent.withValues(alpha: 0.18), p.card],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: p.border),
          ),
          child: Row(
            children: [
              const Icon(Icons.info_outline,
                  size: 18, color: AppColors.text2),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  "Full $title workbench launches in the next release. We'll notify you.",
                  style: TextStyle(fontSize: 12, color: p.t2, height: 1.5),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

// ============================================================
// Wizard Steps (2-5) — share a single "step" layout
// ============================================================
class WizardStepScreen extends StatelessWidget {
  const WizardStepScreen({
    super.key,
    required this.step,
    required this.title,
    required this.subtitle,
    required this.nextPath,
  });

  final int step;
  final String title;
  final String subtitle;
  final String? nextPath;

  @override
  Widget build(BuildContext context) {
    final p = _P.of(context);
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 28),
      children: [
        Text('Step $step of 5',
            style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w700,
                letterSpacing: 1.2,
                color: p.t3)),
        const SizedBox(height: 8),
        Text(title, style: AppTheme.heading(size: 22, color: p.t1)),
        const SizedBox(height: 6),
        Text(subtitle,
            style: TextStyle(fontSize: 13, color: p.t3, height: 1.5)),
        const SizedBox(height: 22),
        Container(
          height: 6,
          decoration: BoxDecoration(
            color: p.border,
            borderRadius: BorderRadius.circular(3),
          ),
          child: FractionallySizedBox(
            alignment: Alignment.centerLeft,
            widthFactor: step / 5,
            child: Container(
              decoration: BoxDecoration(
                color: AppColors.blue,
                borderRadius: BorderRadius.circular(3),
              ),
            ),
          ),
        ),
        const SizedBox(height: 22),
        Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: p.card,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: p.border),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(Icons.tune_rounded, size: 28, color: AppColors.blue),
              const SizedBox(height: 10),
              Text("This step's controls",
                  style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: p.t1)),
              const SizedBox(height: 6),
              Text(
                'Inputs for this step will live here. Continue to flow through the wizard.',
                style: TextStyle(fontSize: 12, color: p.t3, height: 1.5),
              ),
            ],
          ),
        ),
        const SizedBox(height: 22),
        if (nextPath != null)
          SizedBox(
            height: 46,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.navy,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
              ),
              onPressed: () => Navigator.of(context).pushNamed(nextPath!),
              child: Text(step == 5 ? 'Finish' : 'Continue'),
            ),
          ),
      ],
    );
  }
}
