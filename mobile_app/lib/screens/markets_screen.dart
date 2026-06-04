import 'dart:async';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../services/market_api.dart' as api_mod;
import '../theme/app_colors.dart';
import '../theme/app_theme.dart';

class MarketsScreen extends StatefulWidget {
  const MarketsScreen({super.key});

  @override
  State<MarketsScreen> createState() => _MarketsScreenState();
}

class _MarketsScreenState extends State<MarketsScreen> {
  String _tab = 'gainers'; // 'gainers' | 'losers'
  List<_Mover> _gainers = const [
    _Mover('Saudi Aramco', '2222.SR', 'SA', 28.45, 3.82),
    _Mover('Al Rajhi Bank', '1120.SR', 'SA', 95.20, 2.54),
    _Mover('Emaar Properties', 'EMAAR.AE', 'AE', 8.76, 2.11),
    _Mover('Qatar National Bank', 'QNBK.QA', 'QA', 14.30, 1.89),
    _Mover('National Bank of Kuwait', 'NBK.KW', 'KW', 1.02, 1.52),
  ];
  List<_Mover> _losers = const [
    _Mover('SABIC', '2010.SR', 'SA', 72.10, -2.41),
    _Mover('Dubai Islamic Bank', 'DIB.AE', 'AE', 6.22, -1.85),
    _Mover('Ooredoo', 'ORDS.QA', 'QA', 9.45, -1.33),
    _Mover('Zain Group', 'ZAIN.KW', 'KW', 0.58, -1.12),
    _Mover('Ahli United Bank', 'AUB.BH', 'BH', 0.81, -0.94),
  ];
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _fetch();
    _timer = Timer.periodic(const Duration(seconds: 120), (_) => _fetch());
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  Future<void> _fetch() async {
    try {
      final api = context.read<api_mod.MarketApi>();
      final movers = await api.fetchMovers(limit: 5);
      if (!mounted) return;
      final g = movers.where((m) => m.isGainer).take(5)
          .map((m) => _Mover(m.name, m.ticker, m.country, m.price, m.change))
          .toList();
      final l = movers.where((m) => !m.isGainer).take(5)
          .map((m) => _Mover(m.name, m.ticker, m.country, m.price, m.change))
          .toList();
      if (g.isNotEmpty || l.isNotEmpty) {
        setState(() {
          if (g.isNotEmpty) _gainers = g;
          if (l.isNotEmpty) _losers = l;
        });
      }
    } catch (_) {}
  }

  static const _tools = <_Tool>[
    _Tool(Icons.calendar_month_rounded, 'Earnings Calendar',
        'Upcoming GCC reports', '/earnings'),
    _Tool(Icons.trending_up_rounded, 'IPO Calendar',
        'Upcoming GCC listings', '/ipo-calendar'),
    _Tool(Icons.attach_money_rounded, 'Dividend Calendar',
        'Upcoming ex-dates', '/dividends'),
    _Tool(Icons.percent_rounded, 'Central Bank Rates',
        'GCC monetary policy', '/rates'),
  ];

  @override
  Widget build(BuildContext context) {
    final dark = Theme.of(context).brightness == Brightness.dark;
    final card = dark ? AppColors.darkCard : Colors.white;
    final border = dark ? AppColors.darkBorder : AppColors.border;
    final text1 = dark ? AppColors.darkText1 : AppColors.navy;
    final text3 = dark ? AppColors.darkText3 : AppColors.text3;
    final bg = dark ? AppColors.darkBg : AppColors.bg;

    final movers = _tab == 'gainers' ? _gainers : _losers;

    return ListView(
      padding: const EdgeInsets.fromLTRB(0, 18, 0, 28),
      children: [
        // Header
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 0, 20, 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Markets',
                  style: AppTheme.heading(size: 22, color: text1)),
              const SizedBox(height: 2),
              Text('Live data across GCC exchanges',
                  style: TextStyle(fontSize: 12, color: text3)),
            ],
          ),
        ),

        // Top Movers section
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 0, 20, 10),
          child: Row(
            children: [
              Text('TOP MOVERS', style: AppTheme.label(color: text3)),
              const Spacer(),
              _MoversToggle(
                current: _tab,
                bg: bg,
                onChange: (t) => setState(() => _tab = t),
              ),
            ],
          ),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(14),
            child: Container(
              decoration: BoxDecoration(
                color: card,
                border: Border.all(color: border),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Column(
                children: [
                  for (var i = 0; i < movers.length; i++) ...[
                    _MoverRow(
                      mover: movers[i],
                      onTap: () =>
                          context.go('/companies/${movers[i].ticker}'),
                    ),
                    if (i != movers.length - 1)
                      Divider(height: 1, color: border),
                  ],
                ],
              ),
            ),
          ),
        ),

        const SizedBox(height: 22),

        // Market Tools section
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 0, 20, 10),
          child: Text('MARKET TOOLS', style: AppTheme.label(color: text3)),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Column(
            children: [
              for (final t in _tools) ...[
                _ToolRow(tool: t),
                const SizedBox(height: 10),
              ],
            ],
          ),
        ),
      ],
    );
  }
}

/* ───── Tab toggle ───── */

class _MoversToggle extends StatelessWidget {
  const _MoversToggle({
    required this.current,
    required this.bg,
    required this.onChange,
  });

  final String current;
  final Color bg;
  final ValueChanged<String> onChange;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(2),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(99),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _pill(
            label: 'Gainers',
            value: 'gainers',
            activeBg: AppColors.greenBg,
            activeFg: AppColors.green,
          ),
          _pill(
            label: 'Losers',
            value: 'losers',
            activeBg: AppColors.redBg,
            activeFg: AppColors.red,
          ),
        ],
      ),
    );
  }

  Widget _pill({
    required String label,
    required String value,
    required Color activeBg,
    required Color activeFg,
  }) {
    final active = current == value;
    return GestureDetector(
      onTap: () => onChange(value),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
        decoration: BoxDecoration(
          color: active ? activeBg : Colors.transparent,
          borderRadius: BorderRadius.circular(99),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.w800,
            color: active ? activeFg : AppColors.text3,
          ),
        ),
      ),
    );
  }
}

/* ───── Mover row ───── */

class _Mover {
  final String name;
  final String ticker;
  final String country;
  final double price;
  final double change;
  const _Mover(this.name, this.ticker, this.country, this.price, this.change);
}

class _MoverRow extends StatelessWidget {
  const _MoverRow({required this.mover, required this.onTap});
  final _Mover mover;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final dark = Theme.of(context).brightness == Brightness.dark;
    final text1 = dark ? AppColors.darkText1 : AppColors.navy;
    final text3 = dark ? AppColors.darkText3 : AppColors.text3;
    final isGainer = mover.change > 0;
    final accent = isGainer ? AppColors.green : AppColors.red;
    final tint = isGainer
        ? const Color(0x0800C896)
        : const Color(0x08FF4B6E);

    return InkWell(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: tint,
          border: Border(left: BorderSide(color: accent, width: 3)),
        ),
        padding: const EdgeInsets.fromLTRB(10, 10, 12, 10),
        child: Row(
          children: [
            Container(
              width: 28,
              height: 28,
              decoration: BoxDecoration(
                color: AppColors.blueLight,
                borderRadius: BorderRadius.circular(8),
              ),
              alignment: Alignment.center,
              child: Text(
                mover.country,
                style: const TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w800,
                  color: AppColors.blue,
                ),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    mover.name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w800,
                      color: text1,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    mover.ticker,
                    style: TextStyle(fontSize: 10, color: text3),
                  ),
                ],
              ),
            ),
            CustomPaint(
              size: const Size(40, 20),
              painter: _MoverSparklinePainter(
                name: mover.name,
                positive: isGainer,
              ),
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  mover.price.toStringAsFixed(2),
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w800,
                    color: text1,
                  ),
                ),
                const SizedBox(height: 2),
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color:
                        isGainer ? AppColors.greenBg : AppColors.redBg,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    '${isGainer ? '+' : ''}${mover.change.toStringAsFixed(2)}%',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                      color: accent,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

/// Deterministic 12-point sparkline mirroring React's `MiniSparkline(name, positive)`.
class _MoverSparklinePainter extends CustomPainter {
  _MoverSparklinePainter({required this.name, required this.positive});
  final String name;
  final bool positive;

  @override
  void paint(Canvas canvas, Size size) {
    var hash = 0;
    for (final c in name.codeUnits) {
      hash = ((hash << 5) - hash + c) & 0xFFFFFFFF;
      if ((hash & 0x80000000) != 0) hash -= 0x100000000;
    }
    final abs = hash.abs();

    final points = <double>[];
    for (var i = 0; i < 12; i++) {
      final seed = (abs * (i + 1) * 9301 + 49297) % 233280;
      final rand = seed / 233280.0;
      final base = positive ? (20 - i * 0.8) : (10 + i * 0.5);
      final y = (base + (rand - 0.5) * 10).clamp(2, 22).toDouble();
      points.add(y);
    }
    // Map from a 0..24 reference space into the canvas.
    final path = Path();
    final stepX = size.width / (points.length - 1);
    for (var i = 0; i < points.length; i++) {
      final x = i * stepX;
      // y here is in range [2,22] of a 24-tall reference; rescale to size.height
      final y = (points[i] / 24.0) * size.height;
      if (i == 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }
    }
    final paint = Paint()
      ..color = positive ? AppColors.green : AppColors.red
      ..strokeWidth = 1.5
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant _MoverSparklinePainter old) =>
      old.name != name || old.positive != positive;
}

/* ───── Market tool row ───── */

class _Tool {
  final IconData icon;
  final String label;
  final String subtitle;
  final String route;
  const _Tool(this.icon, this.label, this.subtitle, this.route);
}

class _ToolRow extends StatelessWidget {
  const _ToolRow({required this.tool});
  final _Tool tool;

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
        onTap: () => context.go(tool.route),
        borderRadius: BorderRadius.circular(14),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: card,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: border),
          ),
          child: Row(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: AppColors.blueLight,
                  borderRadius: BorderRadius.circular(10),
                ),
                alignment: Alignment.center,
                child: Icon(tool.icon, color: AppColors.blue, size: 16),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      tool.label,
                      style: AppTheme.heading(
                          size: 14, color: text1, letterSpacing: 0),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      tool.subtitle,
                      style: TextStyle(fontSize: 11, color: text3),
                    ),
                  ],
                ),
              ),
              Icon(Icons.chevron_right, size: 14, color: text3),
            ],
          ),
        ),
      ),
    );
  }
}
