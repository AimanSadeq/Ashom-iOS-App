import 'dart:async';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../services/gamification_service.dart';
import '../services/market_api.dart';
import '../services/pin_service.dart';
import '../theme/app_colors.dart';
import '../theme/app_theme.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  String _tab = 'my';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<GamificationService>().track('screen-opened');
    });
  }

  @override
  Widget build(BuildContext context) {
    final dark = Theme.of(context).brightness == Brightness.dark;
    final card = dark ? AppColors.darkCard : Colors.white;
    final border = dark ? AppColors.darkBorder : AppColors.border;

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 14, 20, 6),
          child: _TabSwitcher(
            current: _tab,
            onChange: (t) => setState(() => _tab = t),
          ),
        ),
        Expanded(
          child: _tab == 'my'
              ? const _MyScreenTab()
              : _ExploreTab(card: card, border: border),
        ),
      ],
    );
  }
}

class _TabSwitcher extends StatelessWidget {
  const _TabSwitcher({required this.current, required this.onChange});
  final String current;
  final ValueChanged<String> onChange;

  @override
  Widget build(BuildContext context) {
    final dark = Theme.of(context).brightness == Brightness.dark;
    final bg = dark ? AppColors.darkBg : AppColors.bg;

    return Container(
      padding: const EdgeInsets.all(3),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          _tabButton('my', 'My Screen', Icons.push_pin_outlined, context),
          _tabButton('explore', 'Explore', Icons.menu_rounded, context),
        ],
      ),
    );
  }

  Widget _tabButton(
      String value, String label, IconData icon, BuildContext context) {
    final active = current == value;
    return Expanded(
      child: GestureDetector(
        onTap: () => onChange(value),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 180),
          padding: const EdgeInsets.symmetric(vertical: 9),
          decoration: BoxDecoration(
            color: active ? AppColors.navy : Colors.transparent,
            borderRadius: BorderRadius.circular(10),
            boxShadow: active
                ? [
                    BoxShadow(
                      color: AppColors.navy.withValues(alpha: 0.25),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ]
                : null,
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                icon,
                size: 14,
                color: active ? Colors.white : AppColors.text3,
              ),
              const SizedBox(width: 6),
              Text(
                label,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: active ? Colors.white : AppColors.text3,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/* ───────── My Screen ───────── */

class _MyScreenTab extends StatelessWidget {
  const _MyScreenTab();

  @override
  Widget build(BuildContext context) {
    final dark = Theme.of(context).brightness == Brightness.dark;
    final card = dark ? AppColors.darkCard : Colors.white;
    final border = dark ? AppColors.darkBorder : AppColors.border;
    final text1 = dark ? AppColors.darkText1 : AppColors.text1;
    final text3 = dark ? AppColors.darkText3 : AppColors.text3;

    final pins = context.watch<PinService>().pins;

    if (pins.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  color: AppColors.blueLight,
                  borderRadius: BorderRadius.circular(16),
                ),
                alignment: Alignment.center,
                child: const Icon(Icons.push_pin_outlined,
                    color: AppColors.blue, size: 22),
              ),
              const SizedBox(height: 14),
              Text('No items pinned',
                  style: AppTheme.heading(size: 14, color: text1)),
              const SizedBox(height: 6),
              SizedBox(
                width: 240,
                child: Text(
                  'Go to Explore and tap the pin icon on any tile to add it here.',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 12, color: text3),
                ),
              ),
            ],
          ),
        ),
      );
    }

    return ReorderableListView.builder(
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 28),
      itemCount: pins.length,
      onReorder: (oldI, newI) =>
          context.read<PinService>().reorder(oldI, newI),
      buildDefaultDragHandles: false,
      itemBuilder: (context, i) {
        final p = pins[i];
        return Container(
          key: ValueKey(p.id),
          margin: const EdgeInsets.only(bottom: 8),
          decoration: BoxDecoration(
            color: card,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: border),
          ),
          child: InkWell(
            onTap: () => context.go(p.route),
            borderRadius: BorderRadius.circular(12),
            child: Padding(
              padding: const EdgeInsets.symmetric(
                  horizontal: 8, vertical: 10),
              child: Row(
                children: [
                  ReorderableDragStartListener(
                    index: i,
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 6),
                      child: Icon(Icons.drag_indicator_rounded,
                          color: text3, size: 18),
                    ),
                  ),
                  Expanded(child: _pinRow(context, p, text1, text3)),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _pinRow(BuildContext context, Pin pin, Color text1, Color text3) {
    final c = _colorForToken(pin.color);
    return Row(
      children: [
        Container(
          width: 34,
          height: 34,
          decoration: BoxDecoration(
              color: c.bg, borderRadius: BorderRadius.circular(8)),
          alignment: Alignment.center,
          child: Icon(_iconForToken(pin.iconName), size: 16, color: c.fg),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(pin.label,
                  style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: text1)),
              if (pin.subtitle != null && pin.subtitle!.isNotEmpty)
                Text(pin.subtitle!,
                    style: TextStyle(fontSize: 11, color: text3)),
            ],
          ),
        ),
        IconButton(
          icon: const Icon(Icons.close_rounded, size: 16),
          color: AppColors.text3,
          onPressed: () => context.read<PinService>().remove(pin.id),
        ),
      ],
    );
  }
}

/* ───────── Explore ───────── */

class _ExploreTab extends StatelessWidget {
  const _ExploreTab({required this.card, required this.border});
  final Color card;
  final Color border;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(0, 4, 0, 32),
      children: const [
        _GCCMarketsSection(),
        SizedBox(height: 22),
        _AIPromoCard(),
        SizedBox(height: 24),
        _QuickAccessSection(),
        SizedBox(height: 24),
        _TopLevelHubs(),
        SizedBox(height: 24),
        _ForYouSection(),
        SizedBox(height: 24),
        _MoreToolsSection(),
      ],
    );
  }
}

class _SectionLabel extends StatelessWidget {
  const _SectionLabel(this.text);
  final String text;

  @override
  Widget build(BuildContext context) {
    final dark = Theme.of(context).brightness == Brightness.dark;
    final color = dark ? AppColors.darkText3 : AppColors.text3;
    return Text(text, style: AppTheme.label(color: color));
  }
}

/* ───────── 1. GCC Markets ticker ───────── */

class _GCCMarketsSection extends StatefulWidget {
  const _GCCMarketsSection();
  @override
  State<_GCCMarketsSection> createState() => _GCCMarketsSectionState();
}

class _GCCMarketsSectionState extends State<_GCCMarketsSection> {
  static const _staticMarkets = <_Market>[
    _Market('tasi', '🇸🇦', 'SA', 'TASI', 12484, 1.24, true),
    _Market('dfm', '🇦🇪', 'AE', 'DFM', 4521, -0.38, false),
    _Market('adx', '🇦🇪', 'AE', 'ADX', 9810, 0.45, true),
    _Market('qsi', '🇶🇦', 'QA', 'QE', 10246, 0.67, true),
    _Market('boursa', '🇰🇼', 'KW', 'Boursa', 7892, 0.15, true),
    _Market('bax', '🇧🇭', 'BH', 'BAX', 1985, -0.12, false),
    _Market('msm', '🇴🇲', 'OM', 'MSM30', 4678, 0.89, true),
  ];

  List<_Market> _markets = _staticMarkets;
  DateTime? _lastUpdated;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _fetch();
    _timer = Timer.periodic(const Duration(seconds: 60), (_) => _fetch());
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  Future<void> _fetch() async {
    try {
      final api = context.read<MarketApi>();
      final data = await api.fetchIndices();
      if (!mounted) return;
      final flagBy = {
        'SA': '🇸🇦',
        'AE': '🇦🇪',
        'QA': '🇶🇦',
        'KW': '🇰🇼',
        'BH': '🇧🇭',
        'OM': '🇴🇲',
      };
      final list = data.values
          .map((q) => _Market(
                q.id,
                flagBy[q.country] ?? '🌐',
                q.country,
                q.label,
                q.price.round(),
                q.change,
                q.change >= 0,
              ))
          .toList();
      if (list.isNotEmpty) {
        setState(() {
          _markets = list;
          _lastUpdated = DateTime.now();
        });
      }
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    final timeStr = DateFormat('h:mm a')
        .format(_lastUpdated ?? DateTime.now());
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 10, 20, 10),
          child: Row(
            children: [
              const _SectionLabel('GCC Markets'),
              const Spacer(),
              Container(
                width: 6,
                height: 6,
                decoration: const BoxDecoration(
                  color: AppColors.green,
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 6),
              Text(
                'Live · $timeStr',
                style: const TextStyle(fontSize: 11, color: AppColors.text3),
              ),
            ],
          ),
        ),
        SizedBox(
          height: 150,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 20),
            itemCount: _markets.length,
            separatorBuilder: (_, _) => const SizedBox(width: 10),
            itemBuilder: (context, i) => _TickerCard(m: _markets[i]),
          ),
        ),
      ],
    );
  }
}

class _Market {
  final String id;
  final String flag;
  final String code;
  final String symbol;
  final int value;
  final double change;
  final bool up;
  const _Market(this.id, this.flag, this.code, this.symbol, this.value,
      this.change, this.up);
}

class _TickerCard extends StatelessWidget {
  const _TickerCard({required this.m});
  final _Market m;

  static const _tints = <String, Color>{
    'tasi': Color(0x0F00C896),
    'dfm': Color(0x0F5391D5),
    'qe': Color(0x0F8B0000),
    'boursa': Color(0x0F007A3D),
    'bax': Color(0x0FCE1126),
    'msm': Color(0x0F008000),
  };
  static const _borders = <String, Color>{
    'tasi': Color(0xFF00C896),
    'dfm': Color(0xFF5391D5),
    'qe': Color(0xFF8B0000),
    'boursa': Color(0xFF007A3D),
    'bax': Color(0xFFCE1126),
    'msm': Color(0xFF008000),
  };

  @override
  Widget build(BuildContext context) {
    final dark = Theme.of(context).brightness == Brightness.dark;
    final borderColor = dark ? AppColors.darkBorder : AppColors.border;
    final cardColor = dark ? AppColors.darkCard : Colors.white;
    final text1 = dark ? AppColors.darkText1 : AppColors.navy;
    final text2 = dark ? AppColors.darkText2 : AppColors.text2;
    final text3 = dark ? AppColors.darkText3 : AppColors.text3;
    final tint = _tints[m.id] ?? cardColor;
    final accent = _borders[m.id] ?? borderColor;

    return GestureDetector(
      onTap: () => context.go('/markets'),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(14),
        child: Container(
          width: 152,
          decoration: BoxDecoration(
            color: tint,
            border: Border.all(color: borderColor),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Container(width: 3, color: accent),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(12, 12, 12, 10),
                  child: _tickerBody(text1, text2, text3),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _tickerBody(Color text1, Color text2, Color text3) {
    return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 18,
                  height: 18,
                  decoration: BoxDecoration(
                    color: AppColors.blueLight,
                    borderRadius: BorderRadius.circular(9),
                  ),
                  alignment: Alignment.center,
                  child: Text(m.flag, style: const TextStyle(fontSize: 11)),
                ),
                const SizedBox(width: 5),
                Text(
                  m.code,
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    color: text3,
                    letterSpacing: 0.5,
                  ),
                ),
                const Spacer(),
                Text(
                  m.symbol,
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: text2,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              NumberFormat.decimalPattern().format(m.value),
              style: AppTheme.heading(
                  size: 20, color: text1, letterSpacing: -0.5),
            ),
            const SizedBox(height: 5),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
              decoration: BoxDecoration(
                color: m.up ? AppColors.greenBg : AppColors.redBg,
                borderRadius: BorderRadius.circular(6),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    m.up
                        ? Icons.arrow_drop_up_rounded
                        : Icons.arrow_drop_down_rounded,
                    size: 14,
                    color: m.up
                        ? const Color(0xFF00A878)
                        : AppColors.red,
                  ),
                  Text(
                    '${m.up ? '+' : ''}${m.change.toStringAsFixed(2)}%',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: m.up
                          ? const Color(0xFF00A878)
                          : AppColors.red,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 6),
            Expanded(
              child: CustomPaint(
                size: const Size(double.infinity, double.infinity),
                painter: _SparklinePainter(
                  seed: m.id,
                  positive: m.up,
                ),
              ),
            ),
          ],
        );
  }
}

class _SparklinePainter extends CustomPainter {
  _SparklinePainter({required this.seed, required this.positive});
  final String seed;
  final bool positive;

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = positive ? AppColors.green : AppColors.red
      ..strokeWidth = 1.8
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;

    final rng = _seededRandom(seed);
    const points = 12;
    final path = Path();
    for (var i = 0; i < points; i++) {
      final x = (i / (points - 1)) * size.width;
      final base = positive ? 1 - (i / (points - 1)) * 0.7 : (i / (points - 1)) * 0.7;
      final noise = (rng() - 0.5) * 0.35;
      final y = ((base + noise).clamp(0.05, 0.95)) * size.height;
      if (i == 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }
    }
    canvas.drawPath(path, paint);
  }

  double Function() _seededRandom(String seed) {
    var state = seed.codeUnits.fold<int>(
        0, (acc, c) => (acc * 31 + c) & 0x7fffffff);
    return () {
      state = (state * 1103515245 + 12345) & 0x7fffffff;
      return state / 0x7fffffff;
    };
  }

  @override
  bool shouldRepaint(covariant _SparklinePainter old) =>
      old.seed != seed || old.positive != positive;
}

/* ───────── 2. AI Promo Card ───────── */

class _AIPromoCard extends StatelessWidget {
  const _AIPromoCard();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () => context.go('/ai'),
          borderRadius: BorderRadius.circular(20),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(20),
            child: Container(
              color: AppColors.navy,
              height: 108,
              child: Stack(
                children: [
                  Positioned(
                    top: -36,
                    right: -36,
                    child: Container(
                      width: 140,
                      height: 140,
                      decoration: const BoxDecoration(
                        shape: BoxShape.circle,
                        color: Color(0x4053A1D5),
                      ),
                    ),
                  ),
                  Positioned(
                    bottom: -30,
                    right: 72,
                    child: Container(
                      width: 96,
                      height: 96,
                      decoration: const BoxDecoration(
                        shape: BoxShape.circle,
                        color: Color(0x1F53A1D5),
                      ),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      children: [
                        Container(
                          width: 48,
                          height: 48,
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(14),
                          ),
                          alignment: Alignment.center,
                          child: const Icon(Icons.memory_rounded,
                              color: Colors.white, size: 24),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                'AI FINANCIAL ANALYST',
                                style: TextStyle(
                                  fontSize: 9,
                                  fontWeight: FontWeight.w800,
                                  color: Colors.white.withValues(alpha: 0.55),
                                  letterSpacing: 1,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'Ask about GCC markets',
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: AppTheme.heading(
                                    size: 15,
                                    color: Colors.white,
                                    letterSpacing: 0),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                '820+ companies · Live data',
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(
                                  fontSize: 11,
                                  color: Colors.white.withValues(alpha: 0.6),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 10),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 12, vertical: 8),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(
                                color:
                                    Colors.white.withValues(alpha: 0.22)),
                          ),
                          child: const Text(
                            'Ask AI',
                            style: TextStyle(
                                color: Colors.white,
                                fontSize: 12,
                                fontWeight: FontWeight.w700),
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
      ),
    );
  }
}

/* ───────── 3. Quick Access (3-col grid) ───────── */

class _QuickAccessSection extends StatelessWidget {
  const _QuickAccessSection();

  static const _items = <_QuickItem>[
    _QuickItem(Icons.bolt_rounded, 'Metals & Oil', '/metals',
        AppColors.icRedBg, AppColors.icRedFg, 'Zap', 'red'),
    _QuickItem(Icons.currency_bitcoin, 'Crypto', '/crypto',
        AppColors.icOrangeBg, AppColors.icOrangeFg, 'Bitcoin', 'orange'),
    _QuickItem(Icons.business_rounded, 'Companies', '/companies',
        AppColors.icBlueBg, AppColors.icBlueFg, 'Building2', 'blue'),
    _QuickItem(Icons.monitor_rounded, 'Portfolio', '/portfolio',
        AppColors.icNavyBg, AppColors.icNavyFg, 'Monitor', 'navy'),
    _QuickItem(Icons.bar_chart_rounded, 'Analytics', '/analytics',
        AppColors.icPurpleBg, AppColors.icPurpleFg, 'BarChart2', 'purple'),
    _QuickItem(Icons.memory_rounded, 'AI Analyst', '/ai',
        AppColors.icTealBg, AppColors.icTealFg, 'Cpu', 'teal'),
  ];

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const _SectionLabel('Quick Access'),
          const SizedBox(height: 10),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate:
                const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 3,
              mainAxisSpacing: 8,
              crossAxisSpacing: 8,
              mainAxisExtent: 92,
            ),
            itemCount: _items.length,
            itemBuilder: (context, i) => _QuickTile(item: _items[i]),
          ),
        ],
      ),
    );
  }
}

class _QuickItem {
  final IconData icon;
  final String label;
  final String route;
  final Color bg;
  final Color fg;
  final String iconName;
  final String color;
  const _QuickItem(this.icon, this.label, this.route, this.bg, this.fg,
      this.iconName, this.color);
}

class _QuickTile extends StatelessWidget {
  const _QuickTile({required this.item});
  final _QuickItem item;

  @override
  Widget build(BuildContext context) {
    final dark = Theme.of(context).brightness == Brightness.dark;
    final card = dark ? AppColors.darkCard : Colors.white;
    final border = dark ? AppColors.darkBorder : AppColors.border;
    final text1 = dark ? AppColors.darkText1 : AppColors.navy;

    final pin = Pin(
      id: 'tool-${item.route}',
      type: 'tool',
      label: item.label,
      subtitle: '',
      route: item.route,
      color: item.color,
      iconName: item.iconName,
    );
    final pinned = context.watch<PinService>().isPinned(pin.id);

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () => context.go(item.route),
        borderRadius: BorderRadius.circular(12),
        child: Stack(
          fit: StackFit.expand,
          children: [
            Container(
              padding: const EdgeInsets.fromLTRB(6, 10, 6, 8),
              decoration: BoxDecoration(
                color: card,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: border),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: item.bg,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    alignment: Alignment.center,
                    child: Icon(item.icon, color: item.fg, size: 20),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    item.label,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: text1,
                      letterSpacing: -0.1,
                    ),
                  ),
                ],
              ),
            ),
            Positioned(
              top: 4,
              right: 4,
              child: Material(
                color: Colors.transparent,
                shape: const CircleBorder(),
                clipBehavior: Clip.antiAlias,
                child: InkWell(
                  onTap: () => context.read<PinService>().toggle(pin),
                  child: Container(
                    width: 24,
                    height: 24,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: pinned
                          ? AppColors.blueLight
                          : Colors.transparent,
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      pinned ? Icons.push_pin : Icons.push_pin_outlined,
                      size: 11,
                      color: pinned ? AppColors.blue : AppColors.text3,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/* ───────── 4. Top-level hubs (Markets / CMA / Learning) ───────── */

class _TopLevelHubs extends StatelessWidget {
  const _TopLevelHubs();

  @override
  Widget build(BuildContext context) {
    final hubs = <_Hub>[
      _Hub(
        icon: Icons.trending_up_rounded,
        label: 'Markets',
        subtitle: 'GCC indices, top movers & live data',
        route: '/markets',
        iconBg: AppColors.blueLight,
        iconFg: AppColors.blue,
        bgA: const Color(0x14539AD5),
        bgB: const Color(0x0D00C896),
      ),
      _Hub(
        icon: Icons.account_balance_rounded,
        label: 'Capital Market Authorities',
        subtitle: '6 GCC regulatory bodies & resources',
        route: '/cma',
        iconBg: AppColors.icNavyBg,
        iconFg: AppColors.navy,
        bgA: const Color(0x0F010131),
        bgB: const Color(0x0A7C5FDB),
      ),
      _Hub(
        icon: Icons.school_rounded,
        label: 'Learning',
        subtitle: 'Courses, university programs & glossary',
        route: '/learning',
        iconBg: AppColors.icTealBg,
        iconFg: AppColors.icTealFg,
        bgA: const Color(0x0F00A8A0),
        bgB: const Color(0x0A00C896),
      ),
    ];
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        children: [
          for (final h in hubs) ...[
            _HubCard(hub: h),
            const SizedBox(height: 10),
          ],
        ],
      ),
    );
  }
}

class _Hub {
  final IconData icon;
  final String label;
  final String subtitle;
  final String route;
  final Color iconBg;
  final Color iconFg;
  final Color bgA;
  final Color bgB;
  const _Hub({
    required this.icon,
    required this.label,
    required this.subtitle,
    required this.route,
    required this.iconBg,
    required this.iconFg,
    required this.bgA,
    required this.bgB,
  });
}

class _HubCard extends StatelessWidget {
  const _HubCard({required this.hub});
  final _Hub hub;

  @override
  Widget build(BuildContext context) {
    final dark = Theme.of(context).brightness == Brightness.dark;
    final border = dark ? AppColors.darkBorder : AppColors.border;
    final text1 = dark ? AppColors.darkText1 : AppColors.navy;
    final text2 = dark ? AppColors.darkText2 : AppColors.text2;
    final text3 = dark ? AppColors.darkText3 : AppColors.text3;

    return InkWell(
      onTap: () => context.go(hub.route),
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [hub.bgA, hub.bgB],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: border),
        ),
        child: Row(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                  color: hub.iconBg,
                  borderRadius: BorderRadius.circular(12)),
              alignment: Alignment.center,
              child: Icon(hub.icon, color: hub.iconFg, size: 22),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    hub.label,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: AppTheme.heading(
                        size: 14, color: text1, letterSpacing: 0),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    hub.subtitle,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(fontSize: 11, color: text2),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            Icon(Icons.chevron_right, color: text3, size: 18),
          ],
        ),
      ),
    );
  }
}

/* ───────── 5. For You ───────── */

class _ForYouSection extends StatelessWidget {
  const _ForYouSection();

  static const _items = <_ForYouItem>[
    _ForYouItem(
      icon: Icons.group_rounded,
      category: 'TRADING',
      title: 'Copy Trading',
      subtitle: "Mirror top investors' portfolios",
      badge: 'NEW',
      badgeColor: AppColors.blue,
      iconBg: AppColors.icPurpleBg,
      iconFg: AppColors.icPurpleFg,
      route: '/copy-trading',
    ),
    _ForYouItem(
      icon: Icons.groups_rounded,
      category: 'COMMUNITY',
      title: 'Social Feed',
      subtitle: 'Discuss stocks & follow analysts',
      badge: 'NEW',
      badgeColor: AppColors.blue,
      iconBg: AppColors.icTealBg,
      iconFg: AppColors.icTealFg,
      route: '/community',
    ),
    _ForYouItem(
      icon: Icons.emoji_events_rounded,
      category: 'CURATED',
      title: 'Smart Picks',
      subtitle: 'Top lists & AI-curated ideas',
      badge: null,
      badgeColor: AppColors.blue,
      iconBg: AppColors.icAmberBg,
      iconFg: AppColors.icAmberFg,
      route: '/curated',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const _SectionLabel('For You'),
          const SizedBox(height: 10),
          for (final it in _items) ...[
            _ForYouCard(item: it),
            const SizedBox(height: 8),
          ],
        ],
      ),
    );
  }
}

class _ForYouItem {
  final IconData icon;
  final String category;
  final String title;
  final String subtitle;
  final String? badge;
  final Color badgeColor;
  final Color iconBg;
  final Color iconFg;
  final String route;
  const _ForYouItem({
    required this.icon,
    required this.category,
    required this.title,
    required this.subtitle,
    required this.badge,
    required this.badgeColor,
    required this.iconBg,
    required this.iconFg,
    required this.route,
  });
}

class _ForYouCard extends StatelessWidget {
  const _ForYouCard({required this.item});
  final _ForYouItem item;

  @override
  Widget build(BuildContext context) {
    final dark = Theme.of(context).brightness == Brightness.dark;
    final card = dark ? AppColors.darkCard : Colors.white;
    final border = dark ? AppColors.darkBorder : AppColors.border;
    final text1 = dark ? AppColors.darkText1 : AppColors.navy;
    final text3 = dark ? AppColors.darkText3 : AppColors.text3;

    return InkWell(
      onTap: () => context.go(item.route),
      borderRadius: BorderRadius.circular(14),
      child: Stack(
        children: [
          Container(
            padding: const EdgeInsets.fromLTRB(14, 12, 14, 12),
            decoration: BoxDecoration(
              color: card,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: border),
            ),
            child: Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                      color: item.iconBg,
                      borderRadius: BorderRadius.circular(10)),
                  alignment: Alignment.center,
                  child: Icon(item.icon, color: item.iconFg, size: 20),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Flexible(
                            child: Text(
                              item.category,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w800,
                                color: text3,
                                letterSpacing: 0.8,
                              ),
                            ),
                          ),
                          if (item.badge != null) ...[
                            const SizedBox(width: 6),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: item.badgeColor,
                                borderRadius: BorderRadius.circular(99),
                              ),
                              child: Text(
                                item.badge!,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 8,
                                  fontWeight: FontWeight.w800,
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                      const SizedBox(height: 3),
                      Text(
                        item.title,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: AppTheme.heading(
                            size: 14, color: text1, letterSpacing: 0),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        item.subtitle,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(fontSize: 11, color: text3),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  width: 26,
                  height: 26,
                  decoration: BoxDecoration(
                    color: dark ? AppColors.darkBg : AppColors.bg,
                    borderRadius: BorderRadius.circular(13),
                    border: Border.all(color: border),
                  ),
                  child: const Icon(Icons.chevron_right,
                      color: AppColors.text2, size: 14),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/* ───────── 6. More Tools (grouped) ───────── */

class _MoreToolsSection extends StatelessWidget {
  const _MoreToolsSection();

  static final _groups = <_Group>[
    _Group('Markets', [
      _Tool(Icons.star_border_rounded, 'Watchlist', 'Track favorites', '/watchlist'),
      _Tool(Icons.calendar_month_rounded, 'Earnings Calendar', 'Upcoming reports', '/earnings'),
      _Tool(Icons.attach_money_rounded, 'Dividend Calendar', 'Ex-dividend dates', '/dividends'),
      _Tool(Icons.trending_up_rounded, 'IPO Calendar', 'New GCC listings', '/ipo-calendar'),
      _Tool(Icons.account_balance_rounded, 'Central Bank Rates', 'GCC monetary policy', '/rates'),
      _Tool(Icons.swap_horiz_rounded, 'Cross-Listings', 'Multi-exchange stocks', '/cross-listings'),
      _Tool(Icons.verified_user_rounded, 'Sharia Screening', 'AAOIFI compliance', '/sharia'),
      _Tool(Icons.sync_alt_rounded, 'Currency Converter', 'GCC exchange rates', '/currency'),
    ]),
    _Group('Portfolio', [
      _Tool(Icons.sports_esports_rounded, 'Practice Simulator', '\$100K virtual cash', '/portfolio'),
      _Tool(Icons.account_balance_wallet_rounded, 'Net Worth', 'All assets overview', '/net-worth'),
      _Tool(Icons.family_restroom_rounded, 'Family Hub', 'Track family investments', '/family'),
      _Tool(Icons.group_rounded, 'Copy Trading', 'Mirror top investors', '/copy-trading'),
      _Tool(Icons.volunteer_activism_rounded, 'Zakat Report', 'Wealth obligation', '/zakat'),
      _Tool(Icons.file_download_rounded, 'PDF Export', 'Portfolio reports', '/reports/export'),
    ]),
    _Group('Analytics', [
      _Tool(Icons.search_rounded, 'Screener', 'Filter 820+ companies', '/screener'),
      _Tool(Icons.bolt_rounded, 'Quant Lab', 'Factor models & risk', '/quant'),
      _Tool(Icons.description_rounded, 'Annual Reports', 'SEC & CMA filings', '/filings'),
      _Tool(Icons.bar_chart_rounded, 'Options Screener', 'Derivatives market', '/options'),
      _Tool(Icons.layers_rounded, 'Sector Dashboard', 'Industry analysis', '/sectors'),
    ]),
    _Group('Learning', [
      _Tool(Icons.groups_rounded, 'Classroom', 'Compete with classmates', '/classroom'),
      _Tool(Icons.pie_chart_rounded, 'Fractional Shares', 'Invest any amount', '/fractional-shares'),
      _Tool(Icons.menu_book_rounded, 'Glossary', 'Financial terms A–Z', '/glossary'),
    ]),
  ];

  @override
  Widget build(BuildContext context) {
    final dark = Theme.of(context).brightness == Brightness.dark;
    final card = dark ? AppColors.darkCard : Colors.white;
    final border = dark ? AppColors.darkBorder : AppColors.border;
    final text1 = dark ? AppColors.darkText1 : AppColors.navy;
    final text3 = dark ? AppColors.darkText3 : AppColors.text3;
    final bg = dark ? AppColors.darkBg : AppColors.bg;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          for (var g = 0; g < _groups.length; g++) ...[
            _SectionLabel(_groups[g].title),
            const SizedBox(height: 10),
            Container(
              decoration: BoxDecoration(
                color: card,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: border),
              ),
              child: Column(
                children: [
                  for (var i = 0; i < _groups[g].tools.length; i++) ...[
                    InkWell(
                      onTap: () => context.go(_groups[g].tools[i].route),
                      child: Padding(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 14, vertical: 12),
                        child: Row(
                          children: [
                            Container(
                              width: 32,
                              height: 32,
                              decoration: BoxDecoration(
                                color: bg,
                                borderRadius: BorderRadius.circular(9),
                              ),
                              alignment: Alignment.center,
                              child: Icon(_groups[g].tools[i].icon,
                                  size: 15, color: AppColors.text2),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment:
                                    CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    _groups[g].tools[i].label,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w600,
                                      color: text1,
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    _groups[g].tools[i].subtitle,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: TextStyle(
                                        fontSize: 11, color: text3),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 8),
                            Icon(Icons.chevron_right,
                                size: 16, color: text3),
                          ],
                        ),
                      ),
                    ),
                    if (i != _groups[g].tools.length - 1)
                      Divider(height: 1, color: border),
                  ],
                ],
              ),
            ),
            if (g != _groups.length - 1) const SizedBox(height: 18),
          ],
        ],
      ),
    );
  }
}

class _Group {
  final String title;
  final List<_Tool> tools;
  _Group(this.title, this.tools);
}

class _Tool {
  final IconData icon;
  final String label;
  final String subtitle;
  final String route;
  const _Tool(this.icon, this.label, this.subtitle, this.route);
}

/* ───────── shared helpers ───────── */

class _IconColors {
  final Color bg;
  final Color fg;
  const _IconColors(this.bg, this.fg);
}

_IconColors _colorForToken(String c) {
  switch (c) {
    case 'red':
      return const _IconColors(AppColors.icRedBg, AppColors.icRedFg);
    case 'orange':
      return const _IconColors(AppColors.icOrangeBg, AppColors.icOrangeFg);
    case 'blue':
      return const _IconColors(AppColors.icBlueBg, AppColors.icBlueFg);
    case 'amber':
      return const _IconColors(AppColors.icAmberBg, AppColors.icAmberFg);
    case 'navy':
      return const _IconColors(AppColors.icNavyBg, AppColors.icNavyFg);
    case 'purple':
      return const _IconColors(AppColors.icPurpleBg, AppColors.icPurpleFg);
    case 'green':
      return const _IconColors(AppColors.icGreenBg, AppColors.icGreenFg);
    case 'teal':
      return const _IconColors(AppColors.icTealBg, AppColors.icTealFg);
  }
  return const _IconColors(AppColors.icBlueBg, AppColors.icBlueFg);
}

IconData _iconForToken(String name) {
  switch (name) {
    case 'Zap':
      return Icons.bolt_rounded;
    case 'Bitcoin':
      return Icons.currency_bitcoin;
    case 'Building2':
      return Icons.business_rounded;
    case 'Monitor':
      return Icons.monitor_rounded;
    case 'BarChart2':
      return Icons.bar_chart_rounded;
    case 'Cpu':
      return Icons.memory_rounded;
    case 'Search':
      return Icons.search_rounded;
    case 'Star':
      return Icons.star_border_rounded;
    case 'TrendingUp':
      return Icons.trending_up_rounded;
    case 'Calendar':
      return Icons.calendar_month_rounded;
    case 'DollarSign':
      return Icons.attach_money_rounded;
    case 'Landmark':
      return Icons.account_balance_rounded;
    case 'GraduationCap':
      return Icons.school_rounded;
    case 'Users':
      return Icons.group_rounded;
    case 'Crown':
      return Icons.emoji_events_rounded;
    case 'Shield':
      return Icons.verified_user_rounded;
    case 'ArrowDownUp':
      return Icons.sync_alt_rounded;
    case 'Download':
      return Icons.file_download_rounded;
    case 'FileText':
      return Icons.description_rounded;
    case 'Layers':
      return Icons.layers_rounded;
    case 'PieChart':
      return Icons.pie_chart_rounded;
    case 'BookOpen':
      return Icons.menu_book_rounded;
    case 'Calculator':
      return Icons.calculate_rounded;
    case 'Gamepad2':
      return Icons.sports_esports_rounded;
  }
  return Icons.apps_rounded;
}
