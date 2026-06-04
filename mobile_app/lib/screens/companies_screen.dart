import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../services/companies_service.dart';
import '../theme/app_colors.dart';
import '../theme/app_theme.dart';

class CompaniesScreen extends StatefulWidget {
  const CompaniesScreen({super.key});

  @override
  State<CompaniesScreen> createState() => _CompaniesScreenState();
}

class _CompaniesScreenState extends State<CompaniesScreen> {
  final _search = TextEditingController();
  String? _filter;

  static const _countries = [
    ('SA', '🇸🇦', 'Saudi Arabia'),
    ('AE', '🇦🇪', 'UAE'),
    ('KW', '🇰🇼', 'Kuwait'),
    ('QA', '🇶🇦', 'Qatar'),
    ('BH', '🇧🇭', 'Bahrain'),
    ('OM', '🇴🇲', 'Oman'),
  ];

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  List<Company> get _filtered {
    var list = CompaniesService.catalog.where((c) {
      if (_filter != null && c.country != _filter) return false;
      if (_search.text.isNotEmpty) {
        final q = _search.text.toLowerCase();
        if (!c.name.toLowerCase().contains(q) &&
            !c.ticker.toLowerCase().contains(q)) {
          return false;
        }
      }
      return true;
    }).toList();
    list.sort((a, b) => a.name.compareTo(b.name));
    return list;
  }

  @override
  Widget build(BuildContext context) {
    final dark = Theme.of(context).brightness == Brightness.dark;
    final card = dark ? AppColors.darkCard : Colors.white;
    final border = dark ? AppColors.darkBorder : AppColors.border;
    final text1 = dark ? AppColors.darkText1 : AppColors.text1;
    final text2 = dark ? AppColors.darkText2 : AppColors.text2;
    final text3 = dark ? AppColors.darkText3 : AppColors.text3;
    final bg = dark ? AppColors.darkBg : AppColors.bg;

    final filtered = _filtered;
    // Count per country
    final counts = <String, int>{};
    for (final c in CompaniesService.catalog) {
      counts[c.country] = (counts[c.country] ?? 0) + 1;
    }

    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 18, 20, 28),
      children: [
        Text('GCC Companies',
            style: AppTheme.heading(size: 24, color: text1)),
        const SizedBox(height: 4),
        Text('${CompaniesService.catalog.length} listed companies across 6 markets',
            style: TextStyle(fontSize: 12, color: text3)),
        const SizedBox(height: 14),

        // Search
        TextField(
          controller: _search,
          onChanged: (_) => setState(() {}),
          decoration: InputDecoration(
            isDense: true,
            prefixIcon: Icon(Icons.search_rounded, size: 18, color: text3),
            hintText: 'Search by name or ticker…',
            border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: border)),
            enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: border)),
          ),
        ),
        const SizedBox(height: 18),

        // Country grid (2 columns × 3 rows)
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 3,
            crossAxisSpacing: 8,
            mainAxisSpacing: 8,
            childAspectRatio: 1.05,
          ),
          itemCount: _countries.length + 1,
          itemBuilder: (context, i) {
            if (i == 0) {
              final active = _filter == null;
              return _countryTile(
                  active: active,
                  flag: '🌐',
                  label: 'All',
                  count: CompaniesService.catalog.length,
                  card: card,
                  border: border,
                  text1: text1,
                  text3: text3,
                  onTap: () => setState(() => _filter = null));
            }
            final c = _countries[i - 1];
            final active = _filter == c.$1;
            return _countryTile(
                active: active,
                flag: c.$2,
                label: c.$3,
                count: counts[c.$1] ?? 0,
                card: card,
                border: border,
                text1: text1,
                text3: text3,
                onTap: () => setState(() => _filter = c.$1));
          },
        ),
        const SizedBox(height: 18),

        // Header row with count + clear
        Row(
          children: [
            Text(
              _filter == null
                  ? 'All Companies'
                  : 'Filtered · ${filtered.length}',
              style: TextStyle(
                  fontSize: 12, fontWeight: FontWeight.w700, color: text2),
            ),
            const Spacer(),
            if (_filter != null || _search.text.isNotEmpty)
              GestureDetector(
                onTap: () => setState(() {
                  _filter = null;
                  _search.clear();
                }),
                child: Row(
                  children: [
                    const Icon(Icons.clear_rounded,
                        size: 14, color: AppColors.blue),
                    const SizedBox(width: 4),
                    Text('Clear',
                        style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: AppColors.blue)),
                  ],
                ),
              ),
          ],
        ),
        const SizedBox(height: 10),

        if (filtered.isEmpty)
          Container(
            padding: const EdgeInsets.all(28),
            decoration: BoxDecoration(
              color: card,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: border),
            ),
            alignment: Alignment.center,
            child: Column(
              children: [
                Icon(Icons.search_off_rounded, size: 30, color: text3),
                const SizedBox(height: 8),
                Text('No companies match',
                    style: TextStyle(fontSize: 12, color: text2)),
              ],
            ),
          )
        else
          for (final c in filtered) ...[
            InkWell(
              onTap: () => context.push('/companies/${c.ticker}'),
              borderRadius: BorderRadius.circular(14),
              child: Container(
                padding: const EdgeInsets.all(14),
                margin: const EdgeInsets.only(bottom: 8),
                decoration: BoxDecoration(
                  color: card,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: border),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: bg,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      alignment: Alignment.center,
                      child: Text(_flag(c.country),
                          style: const TextStyle(fontSize: 22)),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(c.name,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w700,
                                  color: text1)),
                          const SizedBox(height: 2),
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 6, vertical: 1),
                                decoration: BoxDecoration(
                                  color: AppColors.blueLight,
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text(c.country,
                                    style: const TextStyle(
                                        fontSize: 9,
                                        fontWeight: FontWeight.w800,
                                        color: AppColors.blue)),
                              ),
                              const SizedBox(width: 6),
                              Expanded(
                                child: Text('${c.ticker} · ${c.sector}',
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: TextStyle(
                                        fontSize: 11, color: text3)),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 10),
                    SizedBox(
                      width: 56,
                      height: 28,
                      child: _Spark(
                          history: CompaniesService.priceHistory(c.name, 12),
                          positive: c.change >= 0),
                    ),
                    const SizedBox(width: 10),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                            c.price < 1
                                ? c.price.toStringAsFixed(3)
                                : c.price.toStringAsFixed(2),
                            style:
                                AppTheme.heading(size: 13, color: text1)),
                        const SizedBox(height: 2),
                        Text(
                            '${c.change >= 0 ? '+' : ''}${c.change.toStringAsFixed(2)}%',
                            style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w800,
                                color: c.change >= 0
                                    ? AppColors.green
                                    : AppColors.red)),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
      ],
    );
  }

  Widget _countryTile({
    required bool active,
    required String flag,
    required String label,
    required int count,
    required Color card,
    required Color border,
    required Color text1,
    required Color text3,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: active ? AppColors.navy : card,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: active ? AppColors.navy : border),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(flag, style: const TextStyle(fontSize: 22)),
            const SizedBox(height: 4),
            Text(label,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: active ? Colors.white : text1)),
            const SizedBox(height: 2),
            Text('$count',
                style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                    color: active ? Colors.white70 : text3)),
          ],
        ),
      ),
    );
  }

  String _flag(String code) {
    return switch (code) {
      'SA' => '🇸🇦',
      'AE' => '🇦🇪',
      'KW' => '🇰🇼',
      'QA' => '🇶🇦',
      'BH' => '🇧🇭',
      'OM' => '🇴🇲',
      _ => '🌐',
    };
  }
}

class _Spark extends StatelessWidget {
  const _Spark({required this.history, required this.positive});
  final List<double> history;
  final bool positive;

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      painter: _SparkPainter(history, positive),
      child: const SizedBox.expand(),
    );
  }
}

class _SparkPainter extends CustomPainter {
  final List<double> history;
  final bool positive;
  _SparkPainter(this.history, this.positive);

  @override
  void paint(Canvas canvas, Size size) {
    if (history.length < 2) return;
    final paint = Paint()
      ..color = positive ? AppColors.green : AppColors.red
      ..strokeWidth = 1.5
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;

    final min = history.reduce((a, b) => a < b ? a : b);
    final max = history.reduce((a, b) => a > b ? a : b);
    final range = (max - min) == 0 ? 1.0 : (max - min);

    final path = Path();
    for (var i = 0; i < history.length; i++) {
      final x = (i / (history.length - 1)) * size.width;
      final y = size.height - ((history[i] - min) / range) * size.height;
      if (i == 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }
    }
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant _SparkPainter old) =>
      old.history != history || old.positive != positive;
}
