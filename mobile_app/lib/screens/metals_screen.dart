import 'dart:async';

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../services/market_api.dart';
import '../theme/app_colors.dart';
import '../theme/app_theme.dart';

class MetalsScreen extends StatefulWidget {
  const MetalsScreen({super.key});

  @override
  State<MetalsScreen> createState() => _MetalsScreenState();
}

class _MetalsScreenState extends State<MetalsScreen> {
  Map<String, CommodityQuote> _data = {};
  bool _loading = true;
  Timer? _timer;
  DateTime? _lastUpdated;

  static const Map<String, (Color, Color, IconData)> _meta = {
    'gold': (Color(0xFFFFF8E6), Color(0xFFF2A600), Icons.diamond_outlined),
    'silver':
        (Color(0xFFEEEEF1), Color(0xFF6B7280), Icons.workspace_premium_rounded),
    'platinum': (Color(0xFFEAF2FC), Color(0xFF5391D5), Icons.shield_rounded),
    'palladium':
        (Color(0xFFE6FAF5), Color(0xFF00C896), Icons.local_fire_department_rounded),
    'wti': (Color(0xFFFFF5ED), Color(0xFFFF8A35), Icons.local_gas_station_rounded),
    'brent':
        (Color(0xFFFFF0F3), Color(0xFFFF4B6E), Icons.local_gas_station_rounded),
  };

  @override
  void initState() {
    super.initState();
    _fetch();
    _timer = Timer.periodic(const Duration(seconds: 30), (_) => _fetch());
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  Future<void> _fetch() async {
    final data = await context.read<MarketApi>().fetchCommodities();
    if (!mounted) return;
    setState(() {
      _data = data;
      _loading = false;
      _lastUpdated = DateTime.now();
    });
  }

  @override
  Widget build(BuildContext context) {
    final dark = Theme.of(context).brightness == Brightness.dark;
    final card = dark ? AppColors.darkCard : Colors.white;
    final border = dark ? AppColors.darkBorder : AppColors.border;
    final text1 = dark ? AppColors.darkText1 : AppColors.text1;
    final text3 = dark ? AppColors.darkText3 : AppColors.text3;

    final fmt = NumberFormat.currency(symbol: '\$', decimalDigits: 2);
    final gold = _data['gold'];
    final wti = _data['wti'];

    return RefreshIndicator(
      onRefresh: _fetch,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 18, 20, 28),
        children: [
          Text('Metals & Oil',
              style: AppTheme.heading(size: 24, color: text1)),
          const SizedBox(height: 4),
          Row(
            children: [
              Text('Spot prices, indicative · delayed',
                  style: TextStyle(fontSize: 12, color: text3)),
              const Spacer(),
              if (_lastUpdated != null)
                Text('Updated ${DateFormat.jm().format(_lastUpdated!)}',
                    style: TextStyle(fontSize: 11, color: text3)),
              const SizedBox(width: 6),
              InkWell(
                onTap: _fetch,
                borderRadius: BorderRadius.circular(8),
                child: Padding(
                  padding: const EdgeInsets.all(4),
                  child: Icon(Icons.refresh_rounded, size: 16, color: text3),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          if (_loading)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 40),
              child: Center(child: CircularProgressIndicator()),
            )
          else ...[
            // Market overview card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [AppColors.navy, Color(0xFF1B1B5C)],
                ),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Row(
                children: [
                  _overviewCol(
                      'GOLD',
                      gold == null ? '—' : fmt.format(gold.price),
                      gold?.change),
                  Container(width: 1, height: 36, color: Colors.white24),
                  _overviewCol(
                      'WTI', wti == null ? '—' : fmt.format(wti.price), wti?.change),
                  Container(width: 1, height: 36, color: Colors.white24),
                  _overviewCol('IMPACT', '+2.4%', 2.4),
                ],
              ),
            ),
            const SizedBox(height: 18),
            Text('Precious Metals', style: AppTheme.label(color: text3)),
            const SizedBox(height: 10),
            for (final id in ['gold', 'silver', 'platinum', 'palladium'])
              _row(id, _data[id], fmt, card, border, text1, text3),
            const SizedBox(height: 18),
            Text('Oil', style: AppTheme.label(color: text3)),
            const SizedBox(height: 10),
            for (final id in ['wti', 'brent'])
              _row(id, _data[id], fmt, card, border, text1, text3),
          ],
        ],
      ),
    );
  }

  Widget _overviewCol(String label, String value, double? change) {
    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label,
              style: const TextStyle(
                  fontSize: 9,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 1.2,
                  color: Colors.white70)),
          const SizedBox(height: 4),
          Text(value,
              style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w800,
                  color: Colors.white)),
          if (change != null) ...[
            const SizedBox(height: 2),
            Text(
                '${change >= 0 ? '+' : ''}${change.toStringAsFixed(2)}%',
                style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    color: change >= 0 ? AppColors.green : AppColors.red)),
          ],
        ],
      ),
    );
  }

  Widget _row(
    String id,
    CommodityQuote? q,
    NumberFormat fmt,
    Color card,
    Color border,
    Color text1,
    Color text3,
  ) {
    if (q == null) return const SizedBox.shrink();
    final meta = _meta[id] ?? (AppColors.icAmberBg, AppColors.icAmberFg, Icons.diamond_outlined);
    final up = q.change >= 0;
    final high = q.price * 1.012;
    final low = q.price * 0.988;
    final pos = ((q.price - low) / (high - low)).clamp(0.0, 1.0);
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
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
              Container(
                width: 42,
                height: 42,
                decoration: BoxDecoration(
                    color: meta.$1, borderRadius: BorderRadius.circular(10)),
                alignment: Alignment.center,
                child: Icon(meta.$3, color: meta.$2, size: 22),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(q.label,
                    style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: text1)),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(fmt.format(q.price),
                      style: AppTheme.heading(size: 14, color: text1)),
                  const SizedBox(height: 2),
                  Text('${up ? '+' : ''}${q.change.toStringAsFixed(2)}%',
                      style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: up ? AppColors.green : AppColors.red)),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),
          // 24h high/low bar
          Row(
            children: [
              Text('L ${fmt.format(low)}',
                  style: TextStyle(fontSize: 10, color: text3)),
              const SizedBox(width: 6),
              Expanded(
                child: LayoutBuilder(
                  builder: (context, c) {
                    final w = c.maxWidth;
                    return Stack(
                      alignment: Alignment.centerLeft,
                      children: [
                        Container(
                          height: 4,
                          decoration: BoxDecoration(
                            gradient: LinearGradient(colors: [
                              AppColors.red.withValues(alpha: 0.3),
                              meta.$2.withValues(alpha: 0.4),
                              AppColors.green.withValues(alpha: 0.3),
                            ]),
                            borderRadius: BorderRadius.circular(2),
                          ),
                        ),
                        Positioned(
                          left: (w * pos).clamp(0, w - 10),
                          child: Container(
                            width: 10,
                            height: 10,
                            decoration: BoxDecoration(
                              color: meta.$2,
                              shape: BoxShape.circle,
                              border:
                                  Border.all(color: Colors.white, width: 2),
                            ),
                          ),
                        ),
                      ],
                    );
                  },
                ),
              ),
              const SizedBox(width: 6),
              Text('H ${fmt.format(high)}',
                  style: TextStyle(fontSize: 10, color: text3)),
            ],
          ),
        ],
      ),
    );
  }
}
