import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../services/companies_service.dart';
import '../services/pin_service.dart';
import '../services/watchlist_service.dart';
import '../theme/app_colors.dart';
import '../theme/app_theme.dart';

class CompanyProfileScreen extends StatelessWidget {
  const CompanyProfileScreen({super.key, required this.companyId});

  final String companyId;

  @override
  Widget build(BuildContext context) {
    final company = CompaniesService.byTicker(companyId);
    if (company == null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.search_off_rounded,
                  size: 48, color: AppColors.text3),
              const SizedBox(height: 12),
              Text('Company not found',
                  style: AppTheme.heading(size: 18, color: AppColors.text1)),
              const SizedBox(height: 6),
              Text(
                'No record for ticker "$companyId".',
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 13, color: AppColors.text3),
              ),
              const SizedBox(height: 18),
              SizedBox(
                height: 44,
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.navy,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)),
                    padding: const EdgeInsets.symmetric(horizontal: 18),
                  ),
                  onPressed: () => context.go('/companies'),
                  icon: const Icon(Icons.business_rounded, size: 16),
                  label: const Text('Browse companies'),
                ),
              ),
            ],
          ),
        ),
      );
    }

    final dark = Theme.of(context).brightness == Brightness.dark;
    final text1 = dark ? AppColors.darkText1 : AppColors.text1;
    final text3 = dark ? AppColors.darkText3 : AppColors.text3;

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 28),
      children: [
        _HeroCard(company: company),
        const SizedBox(height: 12),
        _TradeButton(company: company),
        const SizedBox(height: 16),
        _PriceChartCard(company: company),
        const SizedBox(height: 16),
        _AnalystConsensusCard(company: company),
        const SizedBox(height: 20),
        ..._buildMetricSections(company, text1, text3),
        const SizedBox(height: 4),
        _ReportsSection(company: company),
      ],
    );
  }

  List<Widget> _buildMetricSections(
      Company company, Color text1, Color text3) {
    final sections = [
      (
        'Valuation',
        Icons.attach_money_rounded,
        [
          ('P/E Ratio', company.financials.peRatio, ''),
          ('P/B Ratio', company.financials.pbRatio, ''),
          ('P/S Ratio', company.financials.psRatio, ''),
          ('EV/EBITDA', company.financials.evEbitda, ''),
        ],
      ),
      (
        'Profitability',
        Icons.bar_chart_rounded,
        [
          ('ROE', company.financials.roe, '%'),
          ('ROA', company.financials.roa, '%'),
          ('Net Margin', company.financials.netProfitMargin, '%'),
          ('Gross Margin', company.financials.grossMargin, '%'),
        ],
      ),
      (
        'Risk & Leverage',
        Icons.verified_user_rounded,
        [
          ('D/E Ratio', company.financials.debtToEquity, ''),
          ('Beta', company.financials.beta, ''),
          ('Current Ratio', company.financials.currentRatio, ''),
          ('Interest Coverage', company.financials.interestCoverage, ''),
        ],
      ),
      (
        'Dividends & Growth',
        Icons.pie_chart_rounded,
        [
          ('Div Yield', company.financials.dividendYield, '%'),
          ('Payout Ratio', company.financials.payoutRatio, '%'),
          ('Rev Growth', company.financials.revenueGrowth, '%'),
          ('EPS Growth', company.financials.earningsGrowth, '%'),
        ],
      ),
    ];
    return [
      for (final s in sections) ...[
        _MetricSection(title: s.$1, icon: s.$2, metrics: s.$3),
        const SizedBox(height: 18),
      ],
    ];
  }
}

/* ───────── Hero ───────── */

class _HeroCard extends StatelessWidget {
  const _HeroCard({required this.company});
  final Company company;

  @override
  Widget build(BuildContext context) {
    final isUp = company.change >= 0;
    final pinService = context.watch<PinService>();
    final watchlist = context.watch<WatchlistService>();
    final pinId = 'company-${company.ticker}';
    final pinned = pinService.isPinned(pinId);
    final watched = watchlist.isWatched(company.ticker);

    final shariaColors = _shariaColors(company.sharia);
    final shariaLabel = _shariaLabel(company.sharia);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [AppColors.navy, AppColors.navySoft],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Stack(
        children: [
          Positioned(
            right: 0,
            top: 0,
            child: Row(
              children: [
                _HeaderIconButton(
                  icon: pinned ? Icons.push_pin : Icons.push_pin_outlined,
                  color: pinned ? AppColors.green : Colors.white70,
                  onTap: () {
                    if (pinned) {
                      pinService.remove(pinId);
                    } else {
                      pinService.toggle(Pin(
                        id: pinId,
                        type: 'company',
                        label: company.name,
                        subtitle: company.ticker,
                        route: '/companies/${company.ticker}',
                        color: 'blue',
                        iconName: 'Building2',
                      ));
                    }
                  },
                ),
                const SizedBox(width: 6),
                _HeaderIconButton(
                  icon: watched ? Icons.star_rounded : Icons.star_border_rounded,
                  color: watched
                      ? const Color(0xFFF5A623)
                      : Colors.white70,
                  onTap: () => watchlist.toggle(company.ticker),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.only(right: 90),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      company.ticker,
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.7),
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      company.name,
                      style: AppTheme.heading(
                          size: 18, color: Colors.white, letterSpacing: -0.2),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      company.country,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    company.sector,
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.6),
                      fontSize: 11,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: shariaColors.$1,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.verified_user_rounded,
                            size: 9, color: shariaColors.$2),
                        const SizedBox(width: 4),
                        Text(
                          shariaLabel,
                          style: TextStyle(
                            color: shariaColors.$2,
                            fontSize: 9,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    company.price.toStringAsFixed(2),
                    style: AppTheme.heading(
                        size: 26, color: Colors.white, letterSpacing: -0.6),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    company.currency,
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.5),
                      fontSize: 11,
                    ),
                  ),
                  const Spacer(),
                  Icon(
                    isUp
                        ? Icons.trending_up_rounded
                        : Icons.trending_down_rounded,
                    size: 16,
                    color: isUp ? AppColors.green : AppColors.red,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    '${isUp ? '+' : ''}${company.change.toStringAsFixed(2)}%',
                    style: TextStyle(
                      color: isUp ? AppColors.green : AppColors.red,
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
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

  (Color, Color) _shariaColors(ShariaStatus s) {
    switch (s) {
      case ShariaStatus.compliant:
        return (
          Colors.white.withValues(alpha: 0.15),
          const Color(0xFF00C896)
        );
      case ShariaStatus.watch:
        return (
          Colors.white.withValues(alpha: 0.15),
          const Color(0xFFF2A600)
        );
      case ShariaStatus.nonCompliant:
        return (
          Colors.white.withValues(alpha: 0.15),
          const Color(0xFFFF4B6E)
        );
    }
  }

  String _shariaLabel(ShariaStatus s) {
    switch (s) {
      case ShariaStatus.compliant:
        return 'SHARIA COMPLIANT';
      case ShariaStatus.watch:
        return 'WATCH LIST';
      case ShariaStatus.nonCompliant:
        return 'NON-COMPLIANT';
    }
  }
}

class _HeaderIconButton extends StatelessWidget {
  const _HeaderIconButton({
    required this.icon,
    required this.color,
    required this.onTap,
  });

  final IconData icon;
  final Color color;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.all(6),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Icon(icon, size: 14, color: color),
      ),
    );
  }
}

/* ───────── Trade button ───────── */

class _TradeButton extends StatelessWidget {
  const _TradeButton({required this.company});
  final Company company;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton.icon(
        onPressed: () => context.push('/order/${company.ticker}'),
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.navy,
          padding: const EdgeInsets.symmetric(vertical: 14),
          shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12)),
        ),
        icon: const Icon(Icons.shopping_cart_rounded,
            size: 16, color: Colors.white),
        label: Text(
          'Trade ${company.ticker}',
          style: AppTheme.heading(
              size: 13, color: Colors.white, letterSpacing: 0),
        ),
      ),
    );
  }
}

/* ───────── Price chart ───────── */

class _PriceChartCard extends StatefulWidget {
  const _PriceChartCard({required this.company});
  final Company company;

  @override
  State<_PriceChartCard> createState() => _PriceChartCardState();
}

class _PriceChartCardState extends State<_PriceChartCard> {
  static const _timeframes = [
    ('1D', 1),
    ('1W', 7),
    ('1M', 30),
    ('3M', 90),
    ('1Y', 365),
    ('ALL', 730),
  ];

  int _active = 2; // default 1M

  @override
  Widget build(BuildContext context) {
    final dark = Theme.of(context).brightness == Brightness.dark;
    final card = dark ? AppColors.darkCard : Colors.white;
    final border = dark ? AppColors.darkBorder : AppColors.border;
    final text1 = dark ? AppColors.darkText1 : AppColors.navy;
    final text3 = dark ? AppColors.darkText3 : AppColors.text3;

    final days = _timeframes[_active].$2;
    final history = CompaniesService.priceHistory(widget.company.name, days);
    final currentPrice = history.last;
    final startPrice = history.first;
    final pct = startPrice == 0
        ? 0.0
        : ((currentPrice - startPrice) / startPrice) * 100;
    final isUp = pct >= 0;

    final minY = history.reduce((a, b) => a < b ? a : b);
    final maxY = history.reduce((a, b) => a > b ? a : b);
    final pad = (maxY - minY) * 0.1;
    final spots = [
      for (var i = 0; i < history.length; i++)
        FlSpot(i.toDouble(), history[i]),
    ];

    return Container(
      decoration: BoxDecoration(
        color: card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 12, 14, 6),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Current Price',
                        style: TextStyle(fontSize: 11, color: text3)),
                    Text(
                      currentPrice.toStringAsFixed(2),
                      style: AppTheme.heading(
                          size: 20, color: text1, letterSpacing: 0),
                    ),
                  ],
                ),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: (isUp ? AppColors.green : AppColors.red)
                        .withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        isUp
                            ? Icons.trending_up_rounded
                            : Icons.trending_down_rounded,
                        size: 12,
                        color: isUp ? AppColors.green : AppColors.red,
                      ),
                      const SizedBox(width: 3),
                      Text(
                        '${isUp ? '+' : ''}${pct.toStringAsFixed(2)}%',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: isUp ? AppColors.green : AppColors.red,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(10, 4, 10, 6),
            child: Row(
              children: [
                for (var i = 0; i < _timeframes.length; i++)
                  Padding(
                    padding: const EdgeInsets.only(right: 6),
                    child: _TimeframePill(
                      label: _timeframes[i].$1,
                      active: i == _active,
                      onTap: () => setState(() => _active = i),
                    ),
                  ),
              ],
            ),
          ),
          SizedBox(
            height: 200,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(10, 8, 14, 12),
              child: LineChart(
                LineChartData(
                  minX: 0,
                  maxX: (history.length - 1).toDouble(),
                  minY: minY - pad,
                  maxY: maxY + pad,
                  gridData: FlGridData(
                    show: true,
                    drawVerticalLine: false,
                    horizontalInterval: (maxY - minY) / 4,
                    getDrawingHorizontalLine: (_) => FlLine(
                      color: border,
                      strokeWidth: 1,
                    ),
                  ),
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
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [
                            AppColors.blue.withValues(alpha: 0.25),
                            AppColors.blue.withValues(alpha: 0.02),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _TimeframePill extends StatelessWidget {
  const _TimeframePill({
    required this.label,
    required this.active,
    required this.onTap,
  });

  final String label;
  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final dark = Theme.of(context).brightness == Brightness.dark;
    final border = dark ? AppColors.darkBorder : AppColors.border;
    final text2 = dark ? AppColors.darkText2 : AppColors.text2;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(99),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: active ? AppColors.navy : Colors.transparent,
          borderRadius: BorderRadius.circular(99),
          border: active ? null : Border.all(color: border),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.w700,
            color: active ? Colors.white : text2,
          ),
        ),
      ),
    );
  }
}

/* ───────── Analyst consensus ───────── */

class _AnalystConsensusCard extends StatelessWidget {
  const _AnalystConsensusCard({required this.company});
  final Company company;

  @override
  Widget build(BuildContext context) {
    final dark = Theme.of(context).brightness == Brightness.dark;
    final card = dark ? AppColors.darkCard : Colors.white;
    final border = dark ? AppColors.darkBorder : AppColors.border;
    final text1 = dark ? AppColors.darkText1 : AppColors.navy;
    final text3 = dark ? AppColors.darkText3 : AppColors.text3;

    final r = CompaniesService.ratings(company.name);
    final consensusColors = _consensusColors(r.consensus);
    final upside = r.upsidePct;
    final isUpside = upside >= 0;

    final total = r.total == 0 ? 1 : r.total;
    final buyW = r.buy / total;
    final holdW = r.hold / total;
    final sellW = r.sell / total;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: card,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('ANALYST CONSENSUS', style: AppTheme.label(color: text3)),
          const SizedBox(height: 12),
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 12, vertical: 4),
                decoration: BoxDecoration(
                  color: consensusColors.$1,
                  borderRadius: BorderRadius.circular(99),
                ),
                child: Text(
                  r.consensus,
                  style: AppTheme.heading(
                      size: 12, color: consensusColors.$2, letterSpacing: 0),
                ),
              ),
              const Spacer(),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text('Avg Target',
                      style: TextStyle(fontSize: 10, color: text3)),
                  Row(
                    children: [
                      Text(
                        '${company.currency} ${r.targetPrice.toStringAsFixed(2)}',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: text1,
                        ),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        '${isUpside ? '+' : ''}${upside.toStringAsFixed(1)}%',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                          color:
                              isUpside ? AppColors.green : AppColors.red,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),
          ClipRRect(
            borderRadius: BorderRadius.circular(99),
            child: SizedBox(
              height: 8,
              child: Row(
                children: [
                  Expanded(
                    flex: _safeFlex(buyW),
                    child: Container(color: AppColors.green),
                  ),
                  Expanded(
                    flex: _safeFlex(holdW),
                    child: Container(color: const Color(0xFFF2A600)),
                  ),
                  Expanded(
                    flex: _safeFlex(sellW),
                    child: Container(color: AppColors.red),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _count(r.buy, 'Buy', AppColors.green),
              _dot(text3),
              _count(r.hold, 'Hold', const Color(0xFFF2A600)),
              _dot(text3),
              _count(r.sell, 'Sell', AppColors.red),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            'Updated 3 days ago  ·  ${r.total} analysts',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 9, color: text3),
          ),
        ],
      ),
    );
  }

  Widget _count(int n, String label, Color color) => Row(
        children: [
          Text('$n',
              style: TextStyle(
                  color: color, fontSize: 11, fontWeight: FontWeight.w700)),
          const SizedBox(width: 4),
          Text(label, style: const TextStyle(fontSize: 10)),
        ],
      );

  Widget _dot(Color color) => Padding(
        padding: const EdgeInsets.symmetric(horizontal: 6),
        child: Text('·', style: TextStyle(color: color, fontSize: 12)),
      );

  int _safeFlex(double w) {
    final v = (w * 1000).toInt();
    return v < 1 ? 1 : v;
  }

  (Color, Color) _consensusColors(String c) {
    switch (c) {
      case 'Buy':
        return (AppColors.greenBg, AppColors.green);
      case 'Hold':
        return (const Color(0xFFFFF8E6), const Color(0xFFF2A600));
      case 'Sell':
        return (AppColors.redBg, AppColors.red);
    }
    return (AppColors.greenBg, AppColors.green);
  }
}

/* ───────── Metric section ───────── */

class _MetricSection extends StatelessWidget {
  const _MetricSection({
    required this.title,
    required this.icon,
    required this.metrics,
  });

  final String title;
  final IconData icon;
  final List<(String, double, String)> metrics;

  @override
  Widget build(BuildContext context) {
    final dark = Theme.of(context).brightness == Brightness.dark;
    final card = dark ? AppColors.darkCard : Colors.white;
    final border = dark ? AppColors.darkBorder : AppColors.border;
    final text1 = dark ? AppColors.darkText1 : AppColors.navy;
    final text3 = dark ? AppColors.darkText3 : AppColors.text3;
    final fmt = NumberFormat('#,##0.00');

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Container(
              width: 24,
              height: 24,
              decoration: BoxDecoration(
                color: AppColors.blueLight,
                borderRadius: BorderRadius.circular(6),
              ),
              alignment: Alignment.center,
              child: Icon(icon, size: 12, color: AppColors.blue),
            ),
            const SizedBox(width: 8),
            Text(
              title,
              style: AppTheme.heading(size: 13, color: text1, letterSpacing: 0),
            ),
          ],
        ),
        const SizedBox(height: 10),
        GridView.count(
          crossAxisCount: 2,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          mainAxisSpacing: 8,
          crossAxisSpacing: 8,
          childAspectRatio: 2.6,
          children: [
            for (final m in metrics)
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: card,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: border),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(m.$1,
                        style: TextStyle(fontSize: 10, color: text3)),
                    const SizedBox(height: 3),
                    Text(
                      '${fmt.format(m.$2)}${m.$3}',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: text1,
                      ),
                    ),
                  ],
                ),
              ),
          ],
        ),
      ],
    );
  }
}

/* ───────── Reports ───────── */

class _ReportsSection extends StatelessWidget {
  const _ReportsSection({required this.company});
  final Company company;

  @override
  Widget build(BuildContext context) {
    if (company.reports.isEmpty) return const SizedBox.shrink();
    final dark = Theme.of(context).brightness == Brightness.dark;
    final card = dark ? AppColors.darkCard : Colors.white;
    final border = dark ? AppColors.darkBorder : AppColors.border;
    final text1 = dark ? AppColors.darkText1 : AppColors.navy;
    final text3 = dark ? AppColors.darkText3 : AppColors.text3;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Annual Reports', style: AppTheme.label(color: text3)),
        const SizedBox(height: 10),
        for (final r in company.reports) ...[
          InkWell(
            onTap: () => context.push('/reports/${r.id}'),
            borderRadius: BorderRadius.circular(12),
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: card,
                borderRadius: BorderRadius.circular(12),
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
                    child: const Icon(Icons.description_rounded,
                        color: AppColors.blue, size: 18),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          r.title,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: text1,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          '${r.year}',
                          style: TextStyle(fontSize: 10, color: text3),
                        ),
                      ],
                    ),
                  ),
                  Icon(Icons.open_in_new_rounded, size: 14, color: text3),
                ],
              ),
            ),
          ),
          const SizedBox(height: 8),
        ],
      ],
    );
  }
}
