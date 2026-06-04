import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../theme/app_colors.dart';
import '../theme/app_theme.dart';

class _ComparisonType {
  final String id;
  final String title;
  final String desc;
  final IconData icon;
  final Color iconBg;
  final Color iconFg;

  const _ComparisonType({
    required this.id,
    required this.title,
    required this.desc,
    required this.icon,
    required this.iconBg,
    required this.iconFg,
  });
}

const _comparisonTypes = <_ComparisonType>[
  _ComparisonType(
    id: 'company-vs-company',
    title: 'Company vs Company',
    desc: 'Head-to-head financials',
    icon: Icons.business_rounded,
    iconBg: Color(0xFFEAF2FC),
    iconFg: Color(0xFF5391D5),
  ),
  _ComparisonType(
    id: 'company-vs-industry',
    title: 'Company vs Industry',
    desc: 'Benchmark against peers',
    icon: Icons.factory_rounded,
    iconBg: Color(0xFFE6FAF5),
    iconFg: Color(0xFF00C896),
  ),
  _ComparisonType(
    id: 'company-vs-index',
    title: 'Company vs Index',
    desc: 'Track market performance',
    icon: Icons.trending_up_rounded,
    iconBg: Color(0xFFF0EEFE),
    iconFg: Color(0xFF7C5FDB),
  ),
  _ComparisonType(
    id: 'industry-vs-industry',
    title: 'Industry vs Industry',
    desc: 'Cross-sector analysis',
    icon: Icons.layers_rounded,
    iconBg: Color(0xFFFFF8E6),
    iconFg: Color(0xFFF2A600),
  ),
  _ComparisonType(
    id: 'industry-vs-index',
    title: 'Industry vs Index',
    desc: 'Sector vs market trends',
    icon: Icons.bar_chart_rounded,
    iconBg: Color(0xFFFFF5ED),
    iconFg: Color(0xFFFF8A35),
  ),
  _ComparisonType(
    id: 'industry-vs-country',
    title: 'Industry vs Country',
    desc: 'Regional sector insights',
    icon: Icons.public_rounded,
    iconBg: Color(0xFFE3F6F5),
    iconFg: Color(0xFF00A8A0),
  ),
  _ComparisonType(
    id: 'company-vs-country',
    title: 'Company vs Country',
    desc: 'National market standing',
    icon: Icons.map_rounded,
    iconBg: Color(0xFFFFF0F3),
    iconFg: Color(0xFFFF4B6E),
  ),
  _ComparisonType(
    id: 'index-vs-index',
    title: 'Index vs Index',
    desc: 'Compare market indices',
    icon: Icons.compare_arrows_rounded,
    iconBg: Color(0xFFEAEBF7),
    iconFg: Color(0xFF010131),
  ),
  _ComparisonType(
    id: 'country-vs-country',
    title: 'Country vs Country',
    desc: 'GCC cross-country review',
    icon: Icons.show_chart_rounded,
    iconBg: Color(0xFFEAF2FC),
    iconFg: Color(0xFF5391D5),
  ),
];

class AnalyticsScreen extends StatelessWidget {
  const AnalyticsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final dark = Theme.of(context).brightness == Brightness.dark;
    final text1 = dark ? AppColors.darkText1 : AppColors.navy;
    final text3 = dark ? AppColors.darkText3 : AppColors.text3;

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 18, 16, 28),
      children: [
        // Header
        Padding(
          padding: const EdgeInsets.fromLTRB(4, 0, 0, 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Analytics',
                  style: AppTheme.heading(size: 22, color: text1)),
              const SizedBox(height: 2),
              Text('Choose your comparison type',
                  style: TextStyle(fontSize: 12, color: text3)),
            ],
          ),
        ),
        // Section label
        Padding(
          padding: const EdgeInsets.fromLTRB(4, 0, 0, 12),
          child: Text('COMPARISON TYPES',
              style: AppTheme.label(color: text3)),
        ),
        // 2-col grid
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            mainAxisSpacing: 10,
            crossAxisSpacing: 10,
            mainAxisExtent: 128,
          ),
          itemCount: _comparisonTypes.length,
          itemBuilder: (context, i) =>
              _TypeCard(type: _comparisonTypes[i]),
        ),
        const SizedBox(height: 20),
        // Pro tip
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: AppColors.blueLight,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.blueMid),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: AppColors.blue.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(10),
                ),
                alignment: Alignment.center,
                child: const Icon(Icons.lightbulb_rounded,
                    color: AppColors.blue, size: 16),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Pro tip',
                        style: AppTheme.heading(
                            size: 12, color: AppColors.navy, letterSpacing: 0)),
                    const SizedBox(height: 2),
                    Text(
                      'Use the Wizard for guided step-by-step comparisons',
                      style: TextStyle(
                        fontSize: 11,
                        color: AppColors.text2,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _TypeCard extends StatelessWidget {
  const _TypeCard({required this.type});
  final _ComparisonType type;

  @override
  Widget build(BuildContext context) {
    final dark = Theme.of(context).brightness == Brightness.dark;
    final card = dark ? AppColors.darkCard : Colors.white;
    final border = dark ? AppColors.darkBorder : AppColors.border;
    final text1 = dark ? AppColors.darkText1 : AppColors.navy;
    final text3 = dark ? AppColors.darkText3 : AppColors.text3;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () => context.push('/wizard/type?type=${type.id}'),
        borderRadius: BorderRadius.circular(14),
        child: Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: card,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: border),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: type.iconBg,
                  borderRadius: BorderRadius.circular(12),
                ),
                alignment: Alignment.center,
                child: Icon(type.icon, color: type.iconFg, size: 18),
              ),
              const Spacer(),
              Text(
                type.title,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: AppTheme.heading(
                    size: 13, color: text1, letterSpacing: 0),
              ),
              const SizedBox(height: 2),
              Text(
                type.desc,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(fontSize: 11, color: text3),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
