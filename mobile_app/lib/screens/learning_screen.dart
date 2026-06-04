import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../theme/app_colors.dart';
import '../theme/app_theme.dart';

/* ───── Models ───── */

class _CourseTool {
  final String label;
  final String path;
  const _CourseTool(this.label, this.path);
}

class _Course {
  final String id;
  final String name;
  final String level;
  final Color accentColor;
  final String description;
  final List<_CourseTool> tools;
  final List<String> cfa;
  final int totalSteps;

  const _Course({
    required this.id,
    required this.name,
    required this.level,
    required this.accentColor,
    required this.description,
    required this.tools,
    required this.cfa,
    required this.totalSteps,
  });
}

class _CfaLevel {
  final String level;
  final List<_CfaTopic> topics;
  const _CfaLevel(this.level, this.topics);
}

class _CfaTopic {
  final String topic;
  final String tool;
  const _CfaTopic(this.topic, this.tool);
}

/* ───── Data (exact copy from React FALLBACK_COURSES + CFA_ALIGNMENT) ───── */

const _courses = <_Course>[
  _Course(
    id: 'investment',
    name: 'Investment Analysis',
    level: 'Undergraduate / Graduate',
    accentColor: Color(0xFF5391D5),
    description:
        'CAPM, Fama-French factor models, alpha and beta estimation, risk-return tradeoffs with real GCC stock data.',
    tools: [
      _CourseTool('Factor Models', '/quant/factor-models'),
      _CourseTool('Risk Analytics', '/quant/risk'),
    ],
    cfa: ['CFA L1: Equity', 'CFA L2: Quant'],
    totalSteps: 14,
  ),
  _Course(
    id: 'portfolio',
    name: 'Portfolio Management',
    level: 'Graduate / CFA Prep',
    accentColor: Color(0xFF8B5CF6),
    description:
        'Markowitz optimization, efficient frontiers, risk parity, tangency portfolios using real multi-asset GCC data.',
    tools: [
      _CourseTool('Portfolio Optimizer', '/quant/optimizer'),
    ],
    cfa: ['CFA L3: Portfolio', 'CFA L1: Quant'],
    totalSteps: 7,
  ),
  _Course(
    id: 'corporate',
    name: 'Corporate Finance',
    level: 'Undergraduate / Graduate',
    accentColor: Color(0xFFF59E0B),
    description:
        'DCF valuation, DDM, residual income models, financial scoring on GCC companies.',
    tools: [
      _CourseTool('Valuation Tools', '/quant/valuation'),
    ],
    cfa: ['CFA L1: Corp Fin', 'CFA L2: Equity'],
    totalSteps: 7,
  ),
  _Course(
    id: 'econometrics',
    name: 'Financial Econometrics',
    level: 'Graduate',
    accentColor: Color(0xFFEC4899),
    description:
        'OLS regression, diagnostics (DW, VIF, heteroscedasticity), cross-sectional analysis on GCC financial data.',
    tools: [
      _CourseTool('Regression Lab', '/quant/regression'),
    ],
    cfa: ['CFA L1: Quant', 'CFA L2: Quant'],
    totalSteps: 6,
  ),
  _Course(
    id: 'gcc',
    name: 'GCC Capital Markets',
    level: 'Undergraduate / Graduate',
    accentColor: Color(0xFF00C896),
    description:
        'Oil sensitivity, Sharia compliance screening, country comparison, DuPont analysis, and economic diversification scoring.',
    tools: [
      _CourseTool('GCC Tools', '/quant/gcc-tools'),
      _CourseTool('Vision 2030', '/quant/vision-2030'),
    ],
    cfa: ['CFA L1: Equity', 'CFA L2: FRA'],
    totalSteps: 6,
  ),
  _Course(
    id: 'crossmarket',
    name: 'Cross-Market Analysis',
    level: 'Graduate / Professional',
    accentColor: Color(0xFF10B981),
    description:
        'Relative value analysis, cross-GCC arbitrage identification, factor-adjusted spread decomposition.',
    tools: [
      _CourseTool('Relative Value', '/quant/relative-value'),
    ],
    cfa: ['CFA L3: Portfolio', 'CFA L2: Equity'],
    totalSteps: 0,
  ),
];

const _cfaAlignment = <_CfaLevel>[
  _CfaLevel('CFA Level I', [
    _CfaTopic('Quantitative Methods', 'Regression Lab, Factor Models'),
    _CfaTopic('Equity Investments', 'GCC Tools, Factor Models, EDS Score'),
    _CfaTopic('Corporate Issuers', 'Valuation Tools (DCF, DDM)'),
    _CfaTopic('Portfolio Management', 'Portfolio Optimizer (Intro)'),
  ]),
  _CfaLevel('CFA Level II', [
    _CfaTopic('Quantitative Methods', 'Regression Lab (OLS diagnostics, VIF)'),
    _CfaTopic('Equity Valuation',
        'Valuation Tools (multi-stage DDM, residual income)'),
    _CfaTopic('Financial Reporting', 'GCC Tools (DuPont, Beneish M-Score)'),
    _CfaTopic('Asset Pricing', 'Factor Models (FF3, FF5, Carhart)'),
  ]),
  _CfaLevel('CFA Level III', [
    _CfaTopic('Portfolio Management',
        'Portfolio Optimizer (efficient frontier, risk parity)'),
    _CfaTopic('Risk Management', 'Risk Analytics (VaR, CVaR, stress testing)'),
    _CfaTopic(
        'Asset Allocation', 'Relative Value Scanner, cross-market analysis'),
  ]),
];

/* ───── Screen ───── */

class LearningScreen extends StatefulWidget {
  const LearningScreen({super.key});

  @override
  State<LearningScreen> createState() => _LearningScreenState();
}

class _LearningScreenState extends State<LearningScreen> {
  String? _expandedCourseId;

  @override
  Widget build(BuildContext context) {
    final dark = Theme.of(context).brightness == Brightness.dark;
    final card = dark ? AppColors.darkCard : Colors.white;
    final border = dark ? AppColors.darkBorder : AppColors.border;
    final text1 = dark ? AppColors.darkText1 : AppColors.navy;
    final text2 = dark ? AppColors.darkText2 : AppColors.text2;
    final text3 = dark ? AppColors.darkText3 : AppColors.text3;

    final totalSteps =
        _courses.fold<int>(0, (sum, c) => sum + c.totalSteps);

    final stats = [
      (Icons.group_rounded, 'Partners', '6', AppColors.greenBg,
          AppColors.green),
      (Icons.menu_book_rounded, 'Courses', '${_courses.length}',
          AppColors.blueLight, AppColors.blue),
      (Icons.directions_walk_rounded, 'Guided Steps',
          '${totalSteps == 0 ? 40 : totalSteps}',
          const Color(0xFFFFF7ED), const Color(0xFFD97706)),
      (Icons.verified_user_rounded, 'Enrolled', '0',
          const Color(0xFFF3EEFF), const Color(0xFF7C3AED)),
    ];

    final quickLinks = [
      (Icons.directions_walk_rounded, 'Learning Paths', 'Structured courses',
          '/paths', AppColors.blue),
      (Icons.menu_book_rounded, 'Glossary', '25+ terms', '/glossary',
          const Color(0xFF7C3AED)),
      (Icons.group_rounded, 'Classroom', 'Compete', '/classroom',
          AppColors.green),
    ];

    return ListView(
      padding: const EdgeInsets.only(top: 18, bottom: 28),
      children: [
        // Header
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 0, 20, 12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Learning Academy',
                  style: AppTheme.heading(size: 22, color: text1)),
              const SizedBox(height: 2),
              Text('Educational Hub',
                  style: TextStyle(fontSize: 12, color: text3)),
            ],
          ),
        ),
        // Hero
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 0, 20, 12),
          child: Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [AppColors.navy, AppColors.navySoft],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  alignment: Alignment.center,
                  child: const Icon(Icons.school_rounded,
                      color: Colors.white, size: 20),
                ),
                const SizedBox(height: 12),
                Text('VIFM Academic Programs',
                    style: AppTheme.heading(
                        size: 18,
                        color: Colors.white,
                        letterSpacing: -0.2)),
                const SizedBox(height: 6),
                Text(
                  'Master financial analysis with courses designed for GCC capital markets. Earn certificates and build careers.',
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.6),
                    fontSize: 12,
                    height: 1.5,
                  ),
                ),
                const SizedBox(height: 14),
                Row(
                  children: [
                    _HeroButton(
                      label: 'View Partners',
                      onTap: () => context.push('/university'),
                      bg: Colors.white,
                      fg: AppColors.navy,
                    ),
                    const SizedBox(width: 8),
                    _HeroButton(
                      label: 'Learning Paths',
                      onTap: () => context.push('/paths'),
                      bg: Colors.white.withValues(alpha: 0.15),
                      fg: Colors.white,
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
        // Quick links 3-col
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 0, 20, 10),
          child: Row(
            children: [
              for (var i = 0; i < quickLinks.length; i++) ...[
                Expanded(
                  child: _QuickLink(
                    icon: quickLinks[i].$1,
                    label: quickLinks[i].$2,
                    sub: quickLinks[i].$3,
                    path: quickLinks[i].$4,
                    color: quickLinks[i].$5,
                    card: card,
                    border: border,
                    text3: text3,
                  ),
                ),
                if (i != quickLinks.length - 1) const SizedBox(width: 8),
              ],
            ],
          ),
        ),
        // Stats 4-col
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 4, 20, 16),
          child: Row(
            children: [
              for (var i = 0; i < stats.length; i++) ...[
                Expanded(
                  child: _StatTile(
                    icon: stats[i].$1,
                    label: stats[i].$2,
                    value: stats[i].$3,
                    bg: stats[i].$4,
                    fg: stats[i].$5,
                    card: card,
                    border: border,
                    text1: text1,
                    text3: text3,
                  ),
                ),
                if (i != stats.length - 1) const SizedBox(width: 6),
              ],
            ],
          ),
        ),
        // Academic Curriculum
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 0, 20, 10),
          child: Text('ACADEMIC CURRICULUM',
              style: AppTheme.label(color: text3)),
        ),
        for (final course in _courses)
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 8),
            child: _CourseCard(
              course: course,
              expanded: _expandedCourseId == course.id,
              onToggle: () => setState(() {
                _expandedCourseId =
                    _expandedCourseId == course.id ? null : course.id;
              }),
              card: card,
              border: border,
              text1: text1,
              text2: text2,
              text3: text3,
            ),
          ),
        // CFA Alignment
        const SizedBox(height: 16),
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 0, 20, 10),
          child: Row(
            children: [
              const Icon(Icons.emoji_events_rounded,
                  size: 12, color: Color(0xFFD97706)),
              const SizedBox(width: 4),
              Text('CFA CURRICULUM ALIGNMENT',
                  style: AppTheme.label(color: text3)),
            ],
          ),
        ),
        for (final level in _cfaAlignment)
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 10),
            child: _CfaLevelCard(
              level: level,
              card: card,
              border: border,
              text1: text1,
              text2: text2,
              text3: text3,
            ),
          ),
      ],
    );
  }
}

/* ───── Hero button ───── */

class _HeroButton extends StatelessWidget {
  const _HeroButton({
    required this.label,
    required this.onTap,
    required this.bg,
    required this.fg,
  });

  final String label;
  final VoidCallback onTap;
  final Color bg;
  final Color fg;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: bg,
      borderRadius: BorderRadius.circular(10),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(10),
        child: Padding(
          padding:
              const EdgeInsets.symmetric(horizontal: 16, vertical: 9),
          child: Text(
            label,
            style: AppTheme.heading(
                size: 12, color: fg, letterSpacing: 0),
          ),
        ),
      ),
    );
  }
}

/* ───── Quick link ───── */

class _QuickLink extends StatelessWidget {
  const _QuickLink({
    required this.icon,
    required this.label,
    required this.sub,
    required this.path,
    required this.color,
    required this.card,
    required this.border,
    required this.text3,
  });

  final IconData icon;
  final String label;
  final String sub;
  final String path;
  final Color color;
  final Color card;
  final Color border;
  final Color text3;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () => context.push(path),
        borderRadius: BorderRadius.circular(14),
        child: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: card,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: border),
          ),
          child: Column(
            children: [
              Icon(icon, color: color, size: 16),
              const SizedBox(height: 6),
              Text(
                label,
                style: AppTheme.heading(
                    size: 11, color: AppColors.navy, letterSpacing: 0),
              ),
              const SizedBox(height: 2),
              Text(
                sub,
                style: TextStyle(fontSize: 9, color: text3),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/* ───── Stat tile ───── */

class _StatTile extends StatelessWidget {
  const _StatTile({
    required this.icon,
    required this.label,
    required this.value,
    required this.bg,
    required this.fg,
    required this.card,
    required this.border,
    required this.text1,
    required this.text3,
  });

  final IconData icon;
  final String label;
  final String value;
  final Color bg;
  final Color fg;
  final Color card;
  final Color border;
  final Color text1;
  final Color text3;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 14),
      decoration: BoxDecoration(
        color: card,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: border),
      ),
      child: Column(
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: bg,
              borderRadius: BorderRadius.circular(10),
            ),
            alignment: Alignment.center,
            child: Icon(icon, color: fg, size: 14),
          ),
          const SizedBox(height: 6),
          Text(
            value,
            style: AppTheme.heading(
                size: 14, color: text1, letterSpacing: 0),
          ),
          const SizedBox(height: 2),
          Text(label, style: TextStyle(fontSize: 10, color: text3)),
        ],
      ),
    );
  }
}

/* ───── Course card (expandable) ───── */

class _CourseCard extends StatelessWidget {
  const _CourseCard({
    required this.course,
    required this.expanded,
    required this.onToggle,
    required this.card,
    required this.border,
    required this.text1,
    required this.text2,
    required this.text3,
  });

  final _Course course;
  final bool expanded;
  final VoidCallback onToggle;
  final Color card;
  final Color border;
  final Color text1;
  final Color text2;
  final Color text3;

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(14),
      child: Container(
        decoration: BoxDecoration(
          color: card,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: border),
        ),
        child: Column(
          children: [
            InkWell(
              onTap: onToggle,
              child: Padding(
                padding: const EdgeInsets.all(14),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        color: course.accentColor.withValues(alpha: 0.10),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      alignment: Alignment.center,
                      child: Icon(Icons.menu_book_rounded,
                          color: course.accentColor, size: 16),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(course.name,
                              style: AppTheme.heading(
                                  size: 13,
                                  color: text1,
                                  letterSpacing: 0)),
                          const SizedBox(height: 2),
                          Text(course.level,
                              style: TextStyle(
                                  fontSize: 11, color: text3)),
                        ],
                      ),
                    ),
                    if (course.totalSteps > 0) ...[
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF3EEFF),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          '${course.totalSteps} steps',
                          style: const TextStyle(
                            fontSize: 10,
                            color: Color(0xFF7C3AED),
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                    ],
                    Icon(
                      expanded
                          ? Icons.keyboard_arrow_up_rounded
                          : Icons.keyboard_arrow_down_rounded,
                      size: 16,
                      color: text3,
                    ),
                  ],
                ),
              ),
            ),
            if (expanded) ...[
              Container(height: 1, color: border),
              Padding(
                padding: const EdgeInsets.fromLTRB(14, 12, 14, 14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(course.description,
                        style: TextStyle(
                          fontSize: 12,
                          color: text2,
                          height: 1.6,
                        )),
                    if (course.tools.isNotEmpty) ...[
                      const SizedBox(height: 12),
                      Text('TOOLS', style: AppTheme.label(color: text3)),
                      const SizedBox(height: 6),
                      Wrap(
                        spacing: 6,
                        runSpacing: 6,
                        children: [
                          for (final t in course.tools)
                            _ToolPill(tool: t),
                        ],
                      ),
                    ],
                    if (course.cfa.isNotEmpty) ...[
                      const SizedBox(height: 12),
                      Text('CFA ALIGNMENT',
                          style: AppTheme.label(color: text3)),
                      const SizedBox(height: 6),
                      Wrap(
                        spacing: 4,
                        runSpacing: 4,
                        children: [
                          for (final tag in course.cfa)
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 10, vertical: 3),
                              decoration: BoxDecoration(
                                color: const Color(0xFFFFF7ED),
                                borderRadius:
                                    BorderRadius.circular(99),
                                border: Border.all(
                                    color: const Color(0xFFFDE68A)),
                              ),
                              child: Text(
                                tag,
                                style: const TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w500,
                                  color: Color(0xFFD97706),
                                ),
                              ),
                            ),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _ToolPill extends StatelessWidget {
  const _ToolPill({required this.tool});
  final _CourseTool tool;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.blueLight,
      borderRadius: BorderRadius.circular(10),
      child: InkWell(
        onTap: () => context.push(tool.path),
        borderRadius: BorderRadius.circular(10),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.open_in_new_rounded,
                  color: AppColors.blue, size: 10),
              const SizedBox(width: 4),
              Text(
                tool.label,
                style: const TextStyle(
                  color: AppColors.blue,
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/* ───── CFA level card ───── */

class _CfaLevelCard extends StatelessWidget {
  const _CfaLevelCard({
    required this.level,
    required this.card,
    required this.border,
    required this.text1,
    required this.text2,
    required this.text3,
  });

  final _CfaLevel level;
  final Color card;
  final Color border;
  final Color text1;
  final Color text2;
  final Color text3;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: card,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.check_circle_rounded,
                  color: AppColors.green, size: 14),
              const SizedBox(width: 8),
              Text(level.level,
                  style: AppTheme.heading(
                      size: 13, color: text1, letterSpacing: 0)),
            ],
          ),
          const SizedBox(height: 12),
          for (final t in level.topics) ...[
            Padding(
              padding: const EdgeInsets.only(left: 4, bottom: 8),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding: const EdgeInsets.only(top: 3),
                    child: Icon(
                      Icons.check_circle_rounded,
                      color: AppColors.green.withValues(alpha: 0.6),
                      size: 10,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: RichText(
                      text: TextSpan(
                        style: TextStyle(
                          fontSize: 12,
                          color: text2,
                          height: 1.4,
                        ),
                        children: [
                          TextSpan(
                            text: t.topic,
                            style: TextStyle(
                              color: text1,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          TextSpan(
                            text: ' — ${t.tool}',
                            style: TextStyle(color: text3),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}
