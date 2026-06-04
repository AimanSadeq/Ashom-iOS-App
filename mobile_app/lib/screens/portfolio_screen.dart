import 'dart:async';

import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../services/market_api.dart';
import '../services/portfolio_store.dart';
import '../theme/app_colors.dart';
import '../theme/app_theme.dart';

class PortfolioScreen extends StatefulWidget {
  const PortfolioScreen({super.key});

  @override
  State<PortfolioScreen> createState() => _PortfolioScreenState();
}

class _PortfolioScreenState extends State<PortfolioScreen>
    with TickerProviderStateMixin {
  TabController? _tabs;
  String _mode = 'real'; // 'real' | 'practice' — mirrors PORTFOLIO_MODE key
  Timer? _priceTimer;

  @override
  void initState() {
    super.initState();
    _rebuildTabs();
    WidgetsBinding.instance.addPostFrameCallback((_) => _refreshPrices());
    _priceTimer = Timer.periodic(
        const Duration(seconds: 30), (_) => _refreshPrices());
  }

  Future<void> _refreshPrices() async {
    if (!mounted) return;
    final api = context.read<MarketApi>();
    final store = context.read<PortfolioStore>();
    await store.refreshLivePrices(api);
  }

  void _rebuildTabs() {
    final length = _mode == 'practice' ? 5 : 4;
    _tabs?.dispose();
    _tabs = TabController(length: length, vsync: this);
  }

  void _setMode(String m) {
    if (m == _mode) return;
    setState(() {
      _mode = m;
      _rebuildTabs();
    });
  }

  @override
  void dispose() {
    _priceTimer?.cancel();
    _tabs?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final dark = Theme.of(context).brightness == Brightness.dark;
    final text1 = dark ? AppColors.darkText1 : AppColors.text1;
    final text3 = dark ? AppColors.darkText3 : AppColors.text3;
    final isPractice = _mode == 'practice';

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 18, 20, 2),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Portfolio Tracker',
                      style: AppTheme.heading(size: 22, color: text1)),
                  Text(
                    isPractice ? 'Practice Simulator' : 'Track Your Holdings',
                    style: TextStyle(fontSize: 11, color: text3),
                  ),
                ],
              ),
              const Spacer(),
              IconButton(
                icon: const Icon(Icons.add_circle_outline),
                onPressed: () =>
                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                  content: Text('Add Holding — coming soon'),
                )),
                color: text3,
              ),
            ],
          ),
        ),
        // Live prices pulse — mirrors the React indicator above mode selector.
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 2, 20, 6),
          child: Row(
            children: [
              const _PulsingDot(),
              const SizedBox(width: 6),
              Text(
                'Live prices',
                style: TextStyle(fontSize: 10, color: text3),
              ),
            ],
          ),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 2, 20, 8),
          child: _ModeSelector(mode: _mode, onChange: _setMode),
        ),
        Container(
          decoration: BoxDecoration(
            border: Border(
              bottom: BorderSide(
                color: dark ? AppColors.darkBorder : AppColors.border,
              ),
            ),
          ),
          child: TabBar(
            controller: _tabs,
            labelStyle: const TextStyle(
                fontSize: 10, fontWeight: FontWeight.w700),
            unselectedLabelStyle: const TextStyle(
                fontSize: 10, fontWeight: FontWeight.w500),
            labelColor: AppColors.navy,
            unselectedLabelColor: text3,
            indicatorColor: AppColors.navy,
            indicatorWeight: 2,
            indicatorSize: TabBarIndicatorSize.tab,
            dividerColor: Colors.transparent,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            tabs: [
              const Tab(
                height: 44,
                icon: Icon(Icons.pie_chart_rounded, size: 14),
                iconMargin: EdgeInsets.only(bottom: 2),
                text: 'Overview',
              ),
              const Tab(
                height: 44,
                icon: Icon(Icons.account_balance_wallet_rounded, size: 14),
                iconMargin: EdgeInsets.only(bottom: 2),
                text: 'Holdings',
              ),
              const Tab(
                height: 44,
                icon: Icon(Icons.show_chart_rounded, size: 14),
                iconMargin: EdgeInsets.only(bottom: 2),
                text: 'Performance',
              ),
              const Tab(
                height: 44,
                icon: Icon(Icons.bar_chart_rounded, size: 14),
                iconMargin: EdgeInsets.only(bottom: 2),
                text: 'Analytics',
              ),
              if (isPractice)
                const Tab(
                  height: 44,
                  icon: Icon(Icons.emoji_events_rounded, size: 14),
                  iconMargin: EdgeInsets.only(bottom: 2),
                  text: 'Ranking',
                ),
            ],
          ),
        ),
        Expanded(
          child: TabBarView(
            controller: _tabs,
            children: [
              _OverviewTab(isPractice: isPractice),
              const _HoldingsTab(),
              const _PerformanceTab(),
              const _AnalyticsTab(),
              if (isPractice) const _RankingTab(),
            ],
          ),
        ),
      ],
    );
  }
}

class _ModeSelector extends StatelessWidget {
  const _ModeSelector({required this.mode, required this.onChange});
  final String mode;
  final ValueChanged<String> onChange;

  @override
  Widget build(BuildContext context) {
    final dark = Theme.of(context).brightness == Brightness.dark;
    final outerBg = dark ? AppColors.darkBorder : AppColors.border;
    final activeBg = dark ? AppColors.darkCard : Colors.white;
    final text3 = dark ? AppColors.darkText3 : AppColors.text3;

    Widget pill({
      required String value,
      required String label,
      required IconData icon,
    }) {
      final active = mode == value;
      return Expanded(
        child: GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: () => onChange(value),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 180),
            padding: const EdgeInsets.symmetric(vertical: 10),
            decoration: BoxDecoration(
              color: active ? activeBg : Colors.transparent,
              borderRadius: BorderRadius.circular(10),
              boxShadow: active
                  ? [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.08),
                        blurRadius: 4,
                        offset: const Offset(0, 1),
                      ),
                    ]
                  : null,
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(icon,
                    size: 14, color: active ? AppColors.navy : text3),
                const SizedBox(width: 6),
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: active ? AppColors.navy : text3,
                  ),
                ),
                // SIM badge ONLY when practice mode is active (mirrors React)
                if (value == 'practice' && active) ...[
                  const SizedBox(width: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFEF3C7),
                      borderRadius: BorderRadius.circular(99),
                    ),
                    child: const Text(
                      'SIM',
                      style: TextStyle(
                        color: Color(0xFF92400E),
                        fontSize: 7,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.all(3),
      decoration: BoxDecoration(
        color: outerBg,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          // Order matches React: Practice first, then Real
          pill(
            value: 'practice',
            label: 'Practice Mode',
            icon: Icons.sports_esports_rounded,
          ),
          const SizedBox(width: 4),
          pill(
            value: 'real',
            label: 'Real Portfolio',
            icon: Icons.account_balance_wallet_rounded,
          ),
        ],
      ),
    );
  }
}

class _PulsingDot extends StatefulWidget {
  const _PulsingDot();
  @override
  State<_PulsingDot> createState() => _PulsingDotState();
}

class _PulsingDotState extends State<_PulsingDot>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _ctrl,
      builder: (_, _) {
        return Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(
            color: AppColors.green.withValues(alpha: 0.4 + _ctrl.value * 0.6),
            shape: BoxShape.circle,
          ),
        );
      },
    );
  }
}

class _RankingTab extends StatelessWidget {
  const _RankingTab();

  static const _leaders = <(int, String, String, double, int)>[
    (1, 'Ayah N.', 'AN', 32.7, 48),
    (2, 'Karim F.', 'KF', 28.1, 61),
    (3, 'You', 'YU', 24.4, 35),
    (4, 'Leila H.', 'LH', 18.9, 29),
    (5, 'Faisal T.', 'FT', 15.2, 22),
    (6, 'Nour A.', 'NA', 12.6, 18),
    (7, 'Hala K.', 'HK', 9.3, 14),
    (8, 'Omar D.', 'OD', 6.1, 12),
  ];

  @override
  Widget build(BuildContext context) {
    final dark = Theme.of(context).brightness == Brightness.dark;
    final card = dark ? AppColors.darkCard : Colors.white;
    final border = dark ? AppColors.darkBorder : AppColors.border;
    final text1 = dark ? AppColors.darkText1 : AppColors.text1;
    final text3 = dark ? AppColors.darkText3 : AppColors.text3;

    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
      children: [
        Row(
          children: [
            Text('Leaderboard', style: AppTheme.label(color: text3)),
            const Spacer(),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: AppColors.icAmberBg,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.info_outline, size: 11, color: AppColors.icAmberFg),
                  const SizedBox(width: 4),
                  Text('Sample',
                      style: TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.w800,
                          color: AppColors.icAmberFg)),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        Container(
          decoration: BoxDecoration(
            color: card,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: border),
          ),
          child: Column(
            children: [
              for (var i = 0; i < _leaders.length; i++) ...[
                Padding(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 14, vertical: 12),
                  child: _rankRow(_leaders[i], text1, text3),
                ),
                if (i != _leaders.length - 1)
                  Divider(height: 1, color: border),
              ],
            ],
          ),
        ),
      ],
    );
  }

  Widget _rankRow(
      (int, String, String, double, int) r, Color text1, Color text3) {
    final rank = r.$1;
    final isYou = r.$2 == 'You';
    final medalColor = switch (rank) {
      1 => const Color(0xFFD4AF37),
      2 => const Color(0xFF9CA3AF),
      3 => const Color(0xFFC97B3A),
      _ => AppColors.text3,
    };
    return Row(
      children: [
        SizedBox(
          width: 26,
          child: rank <= 3
              ? Icon(Icons.emoji_events_rounded,
                  size: 18, color: medalColor)
              : Text('$rank',
                  style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: text3)),
        ),
        const SizedBox(width: 10),
        Container(
          width: 34,
          height: 34,
          decoration: BoxDecoration(
            color: isYou ? AppColors.blue : AppColors.icNavyBg,
            shape: BoxShape.circle,
          ),
          alignment: Alignment.center,
          child: Text(
            r.$3,
            style: TextStyle(
              color: isYou ? Colors.white : AppColors.navy,
              fontSize: 11,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Text(
            r.$2,
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: isYou ? AppColors.blue : text1,
            ),
          ),
        ),
        Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(
              '${r.$4 >= 0 ? '+' : ''}${r.$4.toStringAsFixed(1)}%',
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: r.$4 >= 0 ? AppColors.green : AppColors.red,
              ),
            ),
            Text(
              '${r.$5} trades',
              style: TextStyle(fontSize: 10, color: text3),
            ),
          ],
        ),
      ],
    );
  }
}

class _OverviewTab extends StatelessWidget {
  const _OverviewTab({required this.isPractice});
  final bool isPractice;

  static const _startingCash = 100000.0; // Practice sim starting balance

  Holding? _bestPerformer(List<Holding> holdings) {
    if (holdings.isEmpty) return null;
    final sorted = [...holdings]..sort((a, b) => b.pnlPct.compareTo(a.pnlPct));
    return sorted.first;
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

    final portfolio = context.watch<PortfolioStore>();
    final fmt = NumberFormat.currency(symbol: '\$', decimalDigits: 2);
    final totalValue = portfolio.totalValue;
    final totalCost = portfolio.totalCost;
    final totalGain = portfolio.totalPnl;
    final totalGainPct = portfolio.totalPnlPct;
    final allocation = portfolio.allocationByType;
    final hasHoldings = portfolio.holdings.isNotEmpty;
    final best = _bestPerformer(portfolio.holdings);

    if (!hasHoldings && !isPractice) {
      return _EmptyState(onAdd: () => _showAddModal(context));
    }

    final double totalForPct = totalValue == 0 ? 1.0 : totalValue;

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 28),
      children: [
        // Virtual cash card — Practice mode only
        if (isPractice) ...[
          _VirtualCashCard(
              amount: (_startingCash - totalCost).clamp(0, _startingCash),
              fmt: fmt),
          const SizedBox(height: 12),
        ],
        // Total Value gradient card
        _TotalValueCard(
          isPractice: isPractice,
          totalValue: totalValue,
          totalGain: totalGain,
          totalGainPct: totalGainPct,
          virtualCash: _startingCash,
          fmt: fmt,
        ),
        const SizedBox(height: 12),
        // Share Performance button
        if (hasHoldings) ...[
          _ShareButton(
            onTap: () => _showShareSheet(context, totalValue, totalGain,
                totalGainPct, allocation, fmt),
            bg: bg,
            border: border,
          ),
          const SizedBox(height: 12),
        ],
        // AI Insights
        if (hasHoldings) ...[
          const _AIInsightsCard(),
          const SizedBox(height: 12),
        ],
        // Allocation donut
        if (allocation.isNotEmpty) ...[
          _AllocationCard(
            allocation: allocation,
            totalValue: totalValue,
            totalForPct: totalForPct,
            card: card,
            border: border,
            text1: text1,
            text3: text3,
            fmt: fmt,
          ),
          const SizedBox(height: 12),
        ],
        // Quick stats 2-col
        Row(
          children: [
            Expanded(
              child: _StatBox(
                label: 'Total Cost',
                value: fmt.format(totalCost),
                card: card,
                border: border,
                text1: text1,
                text3: text3,
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _StatBox(
                label: 'Best Performer',
                value: best?.name ?? '--',
                card: card,
                border: border,
                text1: text1,
                text3: text3,
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        // Add Holding button
        SizedBox(
          width: double.infinity,
          child: ElevatedButton.icon(
            onPressed: () => _showAddModal(context),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.navy,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
              ),
            ),
            icon: const Icon(Icons.add_rounded, size: 16),
            label: Text(
              isPractice ? 'Buy Asset' : 'Add Holding',
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ),
        const SizedBox(height: 24),
        // Related tools
        Text('RELATED TOOLS', style: AppTheme.label(color: text3)),
        const SizedBox(height: 10),
        _RelatedToolRow(
            icon: Icons.attach_money_rounded,
            label: 'Dividend Calendar',
            subtitle: 'Upcoming ex-dates',
            route: '/dividends',
            card: card, border: border, text1: text1, text2: text2,
            text3: text3),
        const SizedBox(height: 8),
        _RelatedToolRow(
            icon: Icons.calculate_rounded,
            label: 'Zakat Report',
            subtitle: 'Wealth obligation',
            route: '/zakat',
            card: card, border: border, text1: text1, text2: text2,
            text3: text3),
        const SizedBox(height: 8),
        _RelatedToolRow(
            icon: Icons.trending_up_rounded,
            label: 'Net Worth',
            subtitle: 'All assets overview',
            route: '/net-worth',
            card: card, border: border, text1: text1, text2: text2,
            text3: text3),
      ],
    );
  }

  void _showAddModal(BuildContext context) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => const _AddHoldingSheet(),
    );
  }

  void _showShareSheet(
    BuildContext context,
    double totalValue,
    double totalGain,
    double totalGainPct,
    Map<AssetType, double> allocation,
    NumberFormat fmt,
  ) {
    showModalBottomSheet<void>(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => _SharePerformanceSheet(
        totalValue: totalValue,
        totalGain: totalGain,
        totalGainPct: totalGainPct,
        allocation: allocation,
        fmt: fmt,
      ),
    );
  }
}

/* ───── Empty state ───── */

class _EmptyState extends StatelessWidget {
  const _EmptyState({required this.onAdd});
  final VoidCallback onAdd;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: AppColors.blueLight,
                borderRadius: BorderRadius.circular(14),
              ),
              alignment: Alignment.center,
              child: const Icon(Icons.account_balance_wallet_rounded,
                  color: AppColors.blue, size: 20),
            ),
            const SizedBox(height: 12),
            Text('No holdings yet',
                style: AppTheme.heading(size: 14, color: AppColors.navy)),
            const SizedBox(height: 4),
            const Text('Add your first holding to get started.',
                style:
                    TextStyle(fontSize: 10, color: AppColors.text3)),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: onAdd,
              icon: const Icon(Icons.add_rounded, size: 14),
              label: const Text('Add Holding'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.navy,
                foregroundColor: Colors.white,
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                textStyle: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/* ───── Virtual cash card (practice) ───── */

class _VirtualCashCard extends StatelessWidget {
  const _VirtualCashCard({required this.amount, required this.fmt});
  final double amount;
  final NumberFormat fmt;

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            gradient: const LinearGradient(
              colors: [Color(0xFFF59E0B), Color(0xFFD97706)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'AVAILABLE CASH',
                style: TextStyle(
                  color: Colors.white.withValues(alpha: 0.75),
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 1.5,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                fmt.format(amount),
                style: AppTheme.heading(
                    size: 24, color: Colors.white, letterSpacing: 0),
              ),
            ],
          ),
        ),
        const Positioned(top: 8, right: 8, child: _VirtualBadge()),
      ],
    );
  }
}

class _VirtualBadge extends StatelessWidget {
  const _VirtualBadge();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.2),
        borderRadius: BorderRadius.circular(999),
      ),
      child: const Text(
        'VIRTUAL',
        style: TextStyle(
          color: Colors.white,
          fontSize: 8,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.5,
        ),
      ),
    );
  }
}

/* ───── Total value card ───── */

class _TotalValueCard extends StatelessWidget {
  const _TotalValueCard({
    required this.isPractice,
    required this.totalValue,
    required this.totalGain,
    required this.totalGainPct,
    required this.virtualCash,
    required this.fmt,
  });

  final bool isPractice;
  final double totalValue;
  final double totalGain;
  final double totalGainPct;
  final double virtualCash;
  final NumberFormat fmt;

  @override
  Widget build(BuildContext context) {
    final up = totalGain >= 0;
    return Stack(
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            gradient: const LinearGradient(
              colors: [AppColors.navy, AppColors.navySoft],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                isPractice ? 'PORTFOLIO VALUE' : 'TOTAL PORTFOLIO VALUE',
                style: TextStyle(
                  color: Colors.white.withValues(alpha: 0.6),
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 1.5,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                fmt.format(totalValue),
                style: AppTheme.heading(
                    size: 26, color: Colors.white, letterSpacing: -0.6),
              ),
              const SizedBox(height: 4),
              Row(
                children: [
                  Icon(
                    up
                        ? Icons.trending_up_rounded
                        : Icons.trending_down_rounded,
                    size: 12,
                    color: up
                        ? const Color(0xFF6EE7B7)
                        : const Color(0xFFFCA5A5),
                  ),
                  const SizedBox(width: 6),
                  Text(
                    '${up ? '+' : ''}${fmt.format(totalGain)} (${totalGainPct.toStringAsFixed(2)}%)',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                      color: up
                          ? const Color(0xFF6EE7B7)
                          : const Color(0xFFFCA5A5),
                    ),
                  ),
                ],
              ),
              if (isPractice) ...[
                const SizedBox(height: 4),
                Text(
                  'Total: ${fmt.format(virtualCash + totalValue)}',
                  style: TextStyle(
                    fontSize: 10,
                    color: Colors.white.withValues(alpha: 0.4),
                  ),
                ),
              ],
            ],
          ),
        ),
        if (isPractice)
          const Positioned(top: 8, right: 8, child: _VirtualBadge()),
      ],
    );
  }
}

/* ───── Share button ───── */

class _ShareButton extends StatelessWidget {
  const _ShareButton({
    required this.onTap,
    required this.bg,
    required this.border,
  });

  final VoidCallback onTap;
  final Color bg;
  final Color border;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: bg,
          border: Border.all(color: border),
          borderRadius: BorderRadius.circular(12),
        ),
        child: const Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.share_rounded, size: 13, color: AppColors.navy),
            SizedBox(width: 6),
            Text(
              'Share Performance',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: AppColors.navy,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/* ───── AI insights card ───── */

class _AIInsightsCard extends StatelessWidget {
  const _AIInsightsCard();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            AppColors.blue.withValues(alpha: 0.08),
            AppColors.icPurpleBg,
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.blueMid),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: AppColors.blue.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(10),
            ),
            alignment: Alignment.center,
            child: const Icon(Icons.auto_awesome_rounded,
                color: AppColors.blue, size: 16),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('AI Portfolio Insights',
                    style: AppTheme.heading(
                        size: 12,
                        color: AppColors.navy,
                        letterSpacing: 0)),
                const SizedBox(height: 2),
                const Text(
                  'Your portfolio shows strong diversification across sectors. Consider rebalancing into defensive assets.',
                  style: TextStyle(
                    fontSize: 11,
                    color: AppColors.text2,
                    height: 1.35,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/* ───── Allocation card ───── */

class _AllocationCard extends StatelessWidget {
  const _AllocationCard({
    required this.allocation,
    required this.totalValue,
    required this.totalForPct,
    required this.card,
    required this.border,
    required this.text1,
    required this.text3,
    required this.fmt,
  });

  final Map<AssetType, double> allocation;
  final double totalValue;
  final double totalForPct;
  final Color card;
  final Color border;
  final Color text1;
  final Color text3;
  final NumberFormat fmt;

  static const _chartPalette = <Color>[
    Color(0xFF5391D5),
    Color(0xFF00C896),
    Color(0xFF7C5FDB),
    Color(0xFFF2A600),
    Color(0xFFFF8A35),
    Color(0xFF00A8A0),
  ];

  @override
  Widget build(BuildContext context) {
    final entries = allocation.entries.toList();
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: card,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('ALLOCATION', style: AppTheme.label(color: text3)),
          const SizedBox(height: 8),
          SizedBox(
            height: 180,
            child: Stack(
              alignment: Alignment.center,
              children: [
                PieChart(
                  PieChartData(
                    sectionsSpace: 0,
                    centerSpaceRadius: 56,
                    sections: [
                      for (var i = 0; i < entries.length; i++)
                        PieChartSectionData(
                          value: entries[i].value,
                          color:
                              _chartPalette[i % _chartPalette.length],
                          radius: 28,
                          showTitle: false,
                        ),
                    ],
                  ),
                ),
                Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text('Total',
                        style: TextStyle(
                            fontSize: 10, color: text3)),
                    Text(
                      fmt.format(totalValue),
                      style: AppTheme.heading(
                          size: 14, color: text1, letterSpacing: 0),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 12,
            runSpacing: 4,
            alignment: WrapAlignment.center,
            children: [
              for (var i = 0; i < entries.length; i++)
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 8,
                      height: 8,
                      decoration: BoxDecoration(
                        color: _chartPalette[i % _chartPalette.length],
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 4),
                    Text(
                      '${_labelForType(entries[i].key)} ${((entries[i].value / totalForPct) * 100).toStringAsFixed(1)}%',
                      style: TextStyle(
                        fontSize: 10,
                        color: AppColors.text2,
                      ),
                    ),
                  ],
                ),
            ],
          ),
        ],
      ),
    );
  }

  String _labelForType(AssetType t) => switch (t) {
        AssetType.stock => 'Stocks',
        AssetType.metal => 'Metals',
        AssetType.oil => 'Oil',
        AssetType.crypto => 'Crypto',
        AssetType.bond => 'Bonds',
        AssetType.cash => 'Cash',
      };
}

/* ───── Quick-stat box ───── */

class _StatBox extends StatelessWidget {
  const _StatBox({
    required this.label,
    required this.value,
    required this.card,
    required this.border,
    required this.text1,
    required this.text3,
  });

  final String label;
  final String value;
  final Color card;
  final Color border;
  final Color text1;
  final Color text3;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: card,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: TextStyle(fontSize: 10, color: text3)),
          const SizedBox(height: 2),
          Text(
            value,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: AppTheme.heading(
                size: 14, color: text1, letterSpacing: 0),
          ),
        ],
      ),
    );
  }
}

/* ───── Related tool row ───── */

class _RelatedToolRow extends StatelessWidget {
  const _RelatedToolRow({
    required this.icon,
    required this.label,
    required this.subtitle,
    required this.route,
    required this.card,
    required this.border,
    required this.text1,
    required this.text2,
    required this.text3,
  });

  final IconData icon;
  final String label;
  final String subtitle;
  final String route;
  final Color card;
  final Color border;
  final Color text1;
  final Color text2;
  final Color text3;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () => context.push(route),
        borderRadius: BorderRadius.circular(14),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          decoration: BoxDecoration(
            color: card,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: border),
          ),
          child: Row(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: AppColors.blueLight,
                  borderRadius: BorderRadius.circular(10),
                ),
                alignment: Alignment.center,
                child: Icon(icon, color: AppColors.blue, size: 14),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      label,
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: text1,
                      ),
                    ),
                    const SizedBox(height: 1),
                    Text(
                      subtitle,
                      style: TextStyle(fontSize: 10, color: text3),
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

/* ───── Add Holding bottom sheet ───── */

class _AddHoldingSheet extends StatefulWidget {
  const _AddHoldingSheet();

  @override
  State<_AddHoldingSheet> createState() => _AddHoldingSheetState();
}

class _AddHoldingSheetState extends State<_AddHoldingSheet> {
  AssetType _type = AssetType.stock;
  final _name = TextEditingController();
  final _symbol = TextEditingController();
  final _qty = TextEditingController();
  final _cost = TextEditingController();
  final _notes = TextEditingController();

  @override
  void dispose() {
    _name.dispose();
    _symbol.dispose();
    _qty.dispose();
    _cost.dispose();
    _notes.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final name = _name.text.trim();
    final symbol = _symbol.text.trim();
    final qty = double.tryParse(_qty.text) ?? 0;
    final cost = double.tryParse(_cost.text) ?? 0;
    if (name.isEmpty || qty <= 0) return;
    await context.read<PortfolioStore>().add(Holding(
          id: DateTime.now().millisecondsSinceEpoch,
          type: _type,
          name: name,
          symbol: symbol,
          quantity: qty,
          costPrice: cost,
          costCurrency: 'USD',
          currentPrice: cost,
        ));
    if (mounted) Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;
    return Padding(
      padding: EdgeInsets.fromLTRB(20, 20, 20, 20 + bottomInset),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Text('Add Holding',
                  style: AppTheme.heading(
                      size: 14, color: AppColors.navy, letterSpacing: 0)),
              const Spacer(),
              IconButton(
                icon: const Icon(Icons.close_rounded, size: 16),
                onPressed: () => Navigator.of(context).pop(),
                color: AppColors.text3,
              ),
            ],
          ),
          const SizedBox(height: 8),
          _sheetLabel('Asset Type'),
          DropdownButtonFormField<AssetType>(
            initialValue: _type,
            onChanged: (v) => setState(() => _type = v ?? AssetType.stock),
            items: [
              for (final t in AssetType.values)
                DropdownMenuItem(
                  value: t,
                  child: Text(_prettyType(t)),
                ),
            ],
          ),
          const SizedBox(height: 10),
          _sheetLabel('Name'),
          TextField(
            controller: _name,
            decoration: const InputDecoration(hintText: 'e.g. Saudi Aramco'),
          ),
          const SizedBox(height: 10),
          _sheetLabel('Symbol'),
          TextField(
            controller: _symbol,
            decoration: const InputDecoration(hintText: 'e.g. 2222.SR'),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _sheetLabel('Quantity'),
                    TextField(
                      controller: _qty,
                      keyboardType:
                          const TextInputType.numberWithOptions(decimal: true),
                      decoration: const InputDecoration(hintText: '0'),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _sheetLabel('Cost Price (\$)'),
                    TextField(
                      controller: _cost,
                      keyboardType:
                          const TextInputType.numberWithOptions(decimal: true),
                      decoration: const InputDecoration(hintText: '0.00'),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          _sheetLabel('Notes (optional)'),
          TextField(
            controller: _notes,
            decoration: const InputDecoration(hintText: 'Any notes…'),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _submit,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.navy,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text('Add to Portfolio',
                  style: TextStyle(
                      fontSize: 13, fontWeight: FontWeight.w600)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _sheetLabel(String s) => Padding(
        padding: const EdgeInsets.only(bottom: 4, left: 2),
        child: Text(s,
            style: AppTheme.label(color: AppColors.text3)),
      );

  String _prettyType(AssetType t) => switch (t) {
        AssetType.stock => 'Stock',
        AssetType.metal => 'Metal',
        AssetType.oil => 'Oil',
        AssetType.crypto => 'Crypto',
        AssetType.bond => 'Bond',
        AssetType.cash => 'Cash',
      };
}

/* ───── Share Performance bottom sheet ───── */

class _SharePerformanceSheet extends StatefulWidget {
  const _SharePerformanceSheet({
    required this.totalValue,
    required this.totalGain,
    required this.totalGainPct,
    required this.allocation,
    required this.fmt,
  });

  final double totalValue;
  final double totalGain;
  final double totalGainPct;
  final Map<AssetType, double> allocation;
  final NumberFormat fmt;

  @override
  State<_SharePerformanceSheet> createState() =>
      _SharePerformanceSheetState();
}

class _SharePerformanceSheetState extends State<_SharePerformanceSheet> {
  String _period = 'YTD';

  @override
  Widget build(BuildContext context) {
    final up = widget.totalGain >= 0;
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 36,
            height: 4,
            decoration: BoxDecoration(
              color: AppColors.border,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Text('Share Performance',
                  style: AppTheme.heading(
                      size: 14,
                      color: AppColors.navy,
                      letterSpacing: 0)),
              const Spacer(),
              IconButton(
                icon: const Icon(Icons.close_rounded, size: 16),
                onPressed: () => Navigator.of(context).pop(),
                color: AppColors.text3,
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              for (final p in const ['1M', '3M', 'YTD', '1Y'])
                Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: GestureDetector(
                    onTap: () => setState(() => _period = p),
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 5),
                      decoration: BoxDecoration(
                        color: _period == p
                            ? AppColors.navy
                            : AppColors.bg,
                        borderRadius: BorderRadius.circular(99),
                      ),
                      child: Text(
                        p,
                        style: TextStyle(
                          color: _period == p
                              ? Colors.white
                              : AppColors.text3,
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(14),
              gradient: const LinearGradient(
                colors: [AppColors.navy, AppColors.navySoft],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('MY ASHOM PORTFOLIO · $_period',
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.6),
                      fontSize: 9,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 1,
                    )),
                const SizedBox(height: 6),
                Text(widget.fmt.format(widget.totalValue),
                    style: AppTheme.heading(
                        size: 24,
                        color: Colors.white,
                        letterSpacing: -0.6)),
                const SizedBox(height: 2),
                Text(
                  '${up ? '+' : ''}${widget.fmt.format(widget.totalGain)} (${widget.totalGainPct.toStringAsFixed(2)}%)',
                  style: TextStyle(
                    color: up ? AppColors.green : AppColors.red,
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                          content: Text('Copied to clipboard')),
                    );
                    Navigator.of(context).pop();
                  },
                  icon: const Icon(Icons.copy_rounded, size: 14),
                  label: const Text('Copy'),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () {
                    Navigator.of(context).pop();
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.navy,
                    foregroundColor: Colors.white,
                  ),
                  icon: const Icon(Icons.share_rounded, size: 14),
                  label: const Text('Share'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _HoldingsTab extends StatefulWidget {
  const _HoldingsTab();

  @override
  State<_HoldingsTab> createState() => _HoldingsTabState();
}

class _HoldingsTabState extends State<_HoldingsTab> {
  static const _filters = [
    'All', 'Stocks', 'Metals', 'Oil', 'Crypto', 'Bonds', 'Cash'
  ];
  String _filter = 'All';

  static const _typeStyle = <AssetType, (Color, Color)>{
    AssetType.stock: (AppColors.blueLight, AppColors.navy),
    AssetType.metal: (Color(0xFFFFFBEB), Color(0xFFD97706)),
    AssetType.oil: (Color(0xFFF5F3FF), Color(0xFF7C3AED)),
    AssetType.crypto: (AppColors.greenBg, AppColors.green),
    AssetType.bond: (Color(0xFFECFDF5), Color(0xFF059669)),
    AssetType.cash: (AppColors.bg, AppColors.text3),
  };

  void _showAddSheet() {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => const _AddHoldingSheet(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final dark = Theme.of(context).brightness == Brightness.dark;
    final card = dark ? AppColors.darkCard : Colors.white;
    final border = dark ? AppColors.darkBorder : AppColors.border;
    final text1 = dark ? AppColors.darkText1 : AppColors.navy;
    final text2 = dark ? AppColors.darkText2 : AppColors.text2;
    final text3 = dark ? AppColors.darkText3 : AppColors.text3;

    final portfolio = context.watch<PortfolioStore>();
    final fmt = NumberFormat.currency(symbol: '\$', decimalDigits: 2);
    final filtered = _filter == 'All'
        ? portfolio.holdings
        : portfolio.holdings
            .where((h) => _labelForType(h.type).toLowerCase() ==
                _filter.toLowerCase())
            .toList();

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 28),
      children: [
        // Filter chips
        SizedBox(
          height: 32,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: _filters.length,
            separatorBuilder: (_, _) => const SizedBox(width: 6),
            itemBuilder: (context, i) {
              final label = _filters[i];
              final active = _filter == label;
              return GestureDetector(
                onTap: () => setState(() => _filter = label),
                child: Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 12, vertical: 5),
                  decoration: BoxDecoration(
                    color: active ? AppColors.navy : card,
                    borderRadius: BorderRadius.circular(99),
                    border: active ? null : Border.all(color: border),
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    label,
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: active ? Colors.white : text2,
                    ),
                  ),
                ),
              );
            },
          ),
        ),
        const SizedBox(height: 12),
        if (filtered.isEmpty)
          _HoldingsEmptyState(onAdd: _showAddSheet)
        else
          for (final h in filtered) ...[
            _HoldingRow(
              holding: h,
              fmt: fmt,
              typeStyle: _typeStyle[h.type] ?? _typeStyle[AssetType.cash]!,
              card: card,
              border: border,
              text1: text1,
              text3: text3,
              onDelete: () => portfolio.remove(h.id),
            ),
            const SizedBox(height: 8),
          ],
        const SizedBox(height: 8),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton.icon(
            onPressed: _showAddSheet,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.navy,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
              ),
            ),
            icon: const Icon(Icons.add_rounded, size: 14),
            label: const Text('Add Holding',
                style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
          ),
        ),
      ],
    );
  }

  String _labelForType(AssetType t) => switch (t) {
        AssetType.stock => 'Stocks',
        AssetType.metal => 'Metals',
        AssetType.oil => 'Oil',
        AssetType.crypto => 'Crypto',
        AssetType.bond => 'Bonds',
        AssetType.cash => 'Cash',
      };
}

class _HoldingsEmptyState extends StatelessWidget {
  const _HoldingsEmptyState({required this.onAdd});
  final VoidCallback onAdd;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 48),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: AppColors.blueLight,
              borderRadius: BorderRadius.circular(14),
            ),
            alignment: Alignment.center,
            child: const Icon(Icons.account_balance_wallet_rounded,
                color: AppColors.blue, size: 20),
          ),
          const SizedBox(height: 12),
          Text('No holdings yet',
              style: AppTheme.heading(size: 14, color: AppColors.navy)),
          const SizedBox(height: 4),
          const Text('Add your first holding to get started.',
              style: TextStyle(fontSize: 10, color: AppColors.text3)),
          const SizedBox(height: 16),
          ElevatedButton.icon(
            onPressed: onAdd,
            icon: const Icon(Icons.add_rounded, size: 14),
            label: const Text('Add Holding'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.navy,
              foregroundColor: Colors.white,
              padding:
                  const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              textStyle: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
              ),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10)),
            ),
          ),
        ],
      ),
    );
  }
}

class _HoldingRow extends StatelessWidget {
  const _HoldingRow({
    required this.holding,
    required this.fmt,
    required this.typeStyle,
    required this.card,
    required this.border,
    required this.text1,
    required this.text3,
    required this.onDelete,
  });

  final Holding holding;
  final NumberFormat fmt;
  final (Color, Color) typeStyle;
  final Color card;
  final Color border;
  final Color text1;
  final Color text3;
  final VoidCallback onDelete;

  @override
  Widget build(BuildContext context) {
    final isUp = holding.pnlPct >= 0;
    final badge = (holding.symbol.isEmpty
            ? holding.name
            : holding.symbol)
        .substring(0, holding.symbol.length > 3 || holding.name.length > 3
            ? 3
            : holding.name.length)
        .toUpperCase();

    return Container(
      padding: const EdgeInsets.all(12),
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
              color: typeStyle.$1,
              borderRadius: BorderRadius.circular(10),
            ),
            alignment: Alignment.center,
            child: Text(
              badge,
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w700,
                color: typeStyle.$2,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  holding.name,
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
                  '${holding.quantity} units @ ${fmt.format(holding.costPrice)}',
                  style: TextStyle(fontSize: 10, color: text3),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                fmt.format(holding.marketValue),
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: text1,
                ),
              ),
              const SizedBox(height: 2),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                decoration: BoxDecoration(
                  color: isUp ? AppColors.greenBg : AppColors.redBg,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  '${isUp ? '+' : ''}${holding.pnlPct.toStringAsFixed(1)}%',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                    color: isUp ? AppColors.green : AppColors.red,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(width: 4),
          IconButton(
            icon: const Icon(Icons.delete_outline_rounded, size: 14),
            onPressed: onDelete,
            color: text3,
            visualDensity: VisualDensity.compact,
          ),
        ],
      ),
    );
  }
}

class _PerformanceTab extends StatefulWidget {
  const _PerformanceTab();

  @override
  State<_PerformanceTab> createState() => _PerformanceTabState();
}

class _PerformanceTabState extends State<_PerformanceTab> {
  static const _ranges = ['1W', '1M', '3M', '6M', '1Y'];
  String _range = '1M';

  List<FlSpot> _generate(double totalCost, double totalValue, int days) {
    final base = totalCost > 0 ? totalCost : 10000.0;
    final spots = <FlSpot>[];
    for (var i = days; i >= 0; i--) {
      final progress = (days - i) / days;
      final drift = (totalValue - base) * progress;
      final noise =
          base * 0.02 * (i * 0.7).remainder(3.14) / 3.14;
      spots.add(FlSpot((days - i).toDouble(),
          double.parse((base + drift + noise).toStringAsFixed(2))));
    }
    return spots;
  }

  @override
  Widget build(BuildContext context) {
    final dark = Theme.of(context).brightness == Brightness.dark;
    final card = dark ? AppColors.darkCard : Colors.white;
    final border = dark ? AppColors.darkBorder : AppColors.border;
    final text1 = dark ? AppColors.darkText1 : AppColors.navy;
    final text2 = dark ? AppColors.darkText2 : AppColors.text2;
    final text3 = dark ? AppColors.darkText3 : AppColors.text3;
    final portfolio = context.watch<PortfolioStore>();
    final fmt = NumberFormat.currency(symbol: '\$', decimalDigits: 2);

    final days = switch (_range) {
      '1W' => 7,
      '1M' => 30,
      '3M' => 90,
      '6M' => 180,
      '1Y' => 365,
      _ => 30,
    };

    final spots = _generate(
        portfolio.totalCost, portfolio.totalValue, days);
    final minY = spots.map((s) => s.y).reduce((a, b) => a < b ? a : b);
    final maxY = spots.map((s) => s.y).reduce((a, b) => a > b ? a : b);
    final pad = ((maxY - minY) * 0.1).abs();

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 28),
      children: [
        // Range chips
        Row(
          children: [
            for (final r in _ranges)
              Padding(
                padding: const EdgeInsets.only(right: 6),
                child: GestureDetector(
                  onTap: () => setState(() => _range = r),
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 5),
                    decoration: BoxDecoration(
                      color: _range == r ? AppColors.navy : card,
                      borderRadius: BorderRadius.circular(99),
                      border: _range == r
                          ? null
                          : Border.all(color: border),
                    ),
                    child: Text(
                      r,
                      style: TextStyle(
                        color: _range == r ? Colors.white : text2,
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
              ),
          ],
        ),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: card,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: border),
          ),
          child: Column(
            children: [
              SizedBox(
                height: 220,
                child: portfolio.holdings.isEmpty
                    ? Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.show_chart_rounded,
                              size: 24, color: border),
                          const SizedBox(height: 8),
                          Text('Add holdings to see performance',
                              style:
                                  TextStyle(fontSize: 10, color: text3)),
                        ],
                      )
                    : LineChart(
                        LineChartData(
                          minX: 0,
                          maxX: days.toDouble(),
                          minY: minY - pad,
                          maxY: maxY + pad,
                          gridData: const FlGridData(show: false),
                          titlesData: const FlTitlesData(show: false),
                          borderData: FlBorderData(show: false),
                          lineBarsData: [
                            LineChartBarData(
                              spots: spots,
                              isCurved: true,
                              color: AppColors.blue,
                              barWidth: 2,
                              dotData: const FlDotData(show: false),
                              belowBarData: BarAreaData(
                                show: true,
                                color: AppColors.blue
                                    .withValues(alpha: 0.1),
                              ),
                            ),
                          ],
                        ),
                      ),
              ),
              const SizedBox(height: 4),
              Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  '* Projected performance based on cost basis',
                  style: TextStyle(
                    fontSize: 10,
                    color: text3,
                    fontStyle: FontStyle.italic,
                  ),
                ),
              ),
            ],
          ),
        ),
        if (portfolio.holdings.isNotEmpty) ...[
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _PerfStat(
                  icon: Icons.attach_money_rounded,
                  label: 'Total Value',
                  value: fmt.format(portfolio.totalValue),
                  card: card, border: border, text1: text1, text3: text3,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _PerfStat(
                  icon: Icons.percent_rounded,
                  label: 'Return',
                  value:
                      '${portfolio.totalPnlPct.toStringAsFixed(2)}%',
                  valueColor: portfolio.totalPnl >= 0
                      ? AppColors.green
                      : AppColors.red,
                  card: card, border: border, text1: text1, text3: text3,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _PerfStat(
                  icon: Icons.access_time_rounded,
                  label: 'Holdings',
                  value: '${portfolio.holdings.length}',
                  card: card, border: border, text1: text1, text3: text3,
                ),
              ),
            ],
          ),
        ],
      ],
    );
  }
}

class _PerfStat extends StatelessWidget {
  const _PerfStat({
    required this.icon,
    required this.label,
    required this.value,
    this.valueColor,
    required this.card,
    required this.border,
    required this.text1,
    required this.text3,
  });

  final IconData icon;
  final String label;
  final String value;
  final Color? valueColor;
  final Color card;
  final Color border;
  final Color text1;
  final Color text3;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: card,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: border),
      ),
      child: Column(
        children: [
          Icon(icon, size: 14, color: text3),
          const SizedBox(height: 4),
          Text(label, style: TextStyle(fontSize: 10, color: text3)),
          const SizedBox(height: 2),
          Text(
            value,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: AppTheme.heading(
                size: 12, color: valueColor ?? text1, letterSpacing: 0),
          ),
        ],
      ),
    );
  }
}

class _AnalyticsTab extends StatelessWidget {
  const _AnalyticsTab();

  @override
  Widget build(BuildContext context) {
    final dark = Theme.of(context).brightness == Brightness.dark;
    final card = dark ? AppColors.darkCard : Colors.white;
    final border = dark ? AppColors.darkBorder : AppColors.border;
    final text1 = dark ? AppColors.darkText1 : AppColors.navy;
    final text2 = dark ? AppColors.darkText2 : AppColors.text2;
    final text3 = dark ? AppColors.darkText3 : AppColors.text3;
    final bg = dark ? AppColors.darkBg : AppColors.bg;

    final portfolio = context.watch<PortfolioStore>();
    final fmt = NumberFormat.currency(symbol: '\$', decimalDigits: 2);

    if (portfolio.holdings.isEmpty) {
      return _HoldingsEmptyState(
        onAdd: () => showModalBottomSheet<void>(
          context: context,
          isScrollControlled: true,
          shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          builder: (_) => const _AddHoldingSheet(),
        ),
      );
    }

    final zakat = portfolio.totalValue * 0.025;
    final total = portfolio.totalValue == 0 ? 1 : portfolio.totalValue;

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 28),
      children: [
        // Risk Metrics
        Text('RISK METRICS', style: AppTheme.label(color: text3)),
        const SizedBox(height: 10),
        Row(
          children: [
            Expanded(
              child: _RiskStat(
                icon: Icons.verified_user_rounded,
                iconColor: AppColors.green,
                label: 'Sharpe Ratio',
                value: '1.24',
                valueColor: text1,
                card: card, border: border, text3: text3,
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _RiskStat(
                icon: Icons.trending_down_rounded,
                iconColor: AppColors.red,
                label: 'Max Drawdown',
                value: '-8.3%',
                valueColor: AppColors.red,
                card: card, border: border, text3: text3,
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _RiskStat(
                icon: Icons.bar_chart_rounded,
                iconColor: const Color(0xFF7C3AED),
                label: 'Volatility',
                value: '12.5%',
                valueColor: text1,
                card: card, border: border, text3: text3,
              ),
            ),
          ],
        ),
        const SizedBox(height: 6),
        Text(
          '* Estimated values based on sample data',
          style: TextStyle(
            fontSize: 10,
            color: text3,
            fontStyle: FontStyle.italic,
          ),
        ),
        const SizedBox(height: 18),
        // Allocation bars
        Text('ALLOCATION BY ASSET CLASS',
            style: AppTheme.label(color: text3)),
        const SizedBox(height: 10),
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: card,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: border),
          ),
          child: Column(
            children: [
              for (final entry in portfolio.allocationByType.entries) ...[
                _AllocationBar(
                  label: _labelForType(entry.key),
                  value: entry.value,
                  total: total.toDouble(),
                  fmt: fmt,
                  bg: bg,
                  text1: text1,
                  text2: text2,
                  text3: text3,
                ),
                const SizedBox(height: 10),
              ],
            ],
          ),
        ),
        const SizedBox(height: 18),
        // Zakat
        Text('ZAKAT ESTIMATE (2.5%)',
            style: AppTheme.label(color: text3)),
        const SizedBox(height: 10),
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: card,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: border),
          ),
          child: Row(
            children: [
              Text(
                'Annual Zakat Due',
                style: TextStyle(fontSize: 12, color: text2),
              ),
              const Spacer(),
              Text(
                fmt.format(zakat),
                style: AppTheme.heading(
                    size: 14, color: text1, letterSpacing: 0),
              ),
            ],
          ),
        ),
      ],
    );
  }

  String _labelForType(AssetType t) => switch (t) {
        AssetType.stock => 'Stocks',
        AssetType.metal => 'Metals',
        AssetType.oil => 'Oil',
        AssetType.crypto => 'Crypto',
        AssetType.bond => 'Bonds',
        AssetType.cash => 'Cash',
      };
}

class _RiskStat extends StatelessWidget {
  const _RiskStat({
    required this.icon,
    required this.iconColor,
    required this.label,
    required this.value,
    required this.valueColor,
    required this.card,
    required this.border,
    required this.text3,
  });

  final IconData icon;
  final Color iconColor;
  final String label;
  final String value;
  final Color valueColor;
  final Color card;
  final Color border;
  final Color text3;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: card,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: border),
      ),
      child: Column(
        children: [
          Icon(icon, size: 14, color: iconColor),
          const SizedBox(height: 4),
          Text(label,
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 10, color: text3)),
          const SizedBox(height: 2),
          Text(
            value,
            style: AppTheme.heading(
                size: 14, color: valueColor, letterSpacing: 0),
          ),
        ],
      ),
    );
  }
}

class _AllocationBar extends StatelessWidget {
  const _AllocationBar({
    required this.label,
    required this.value,
    required this.total,
    required this.fmt,
    required this.bg,
    required this.text1,
    required this.text2,
    required this.text3,
  });

  final String label;
  final double value;
  final double total;
  final NumberFormat fmt;
  final Color bg;
  final Color text1;
  final Color text2;
  final Color text3;

  @override
  Widget build(BuildContext context) {
    final pct = total > 0 ? (value / total) * 100 : 0.0;
    return Column(
      children: [
        Row(
          children: [
            Text(
              label,
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w500,
                color: text1,
              ),
            ),
            const Spacer(),
            Text(
              '${fmt.format(value)} (${pct.toStringAsFixed(1)}%)',
              style: TextStyle(fontSize: 10, color: text3),
            ),
          ],
        ),
        const SizedBox(height: 4),
        Container(
          height: 8,
          decoration: BoxDecoration(
            color: bg,
            borderRadius: BorderRadius.circular(20),
          ),
          child: FractionallySizedBox(
            alignment: Alignment.centerLeft,
            widthFactor: (pct / 100).clamp(0, 1),
            child: Container(
              decoration: BoxDecoration(
                color: AppColors.blue,
                borderRadius: BorderRadius.circular(20),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
