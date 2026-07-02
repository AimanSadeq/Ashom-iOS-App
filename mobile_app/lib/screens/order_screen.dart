import 'dart:async';
import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../services/companies_service.dart';
import '../services/order_history_service.dart';
import '../theme/app_colors.dart';
import '../theme/app_theme.dart';
import '../widgets/notice_banners.dart';

enum OrderSide { buy, sell }

enum OrderType { market, limit, stop }

class OrderScreen extends StatefulWidget {
  const OrderScreen({super.key, required this.ticker});
  final String ticker;

  @override
  State<OrderScreen> createState() => _OrderScreenState();
}

class _OrderScreenState extends State<OrderScreen> {
  OrderSide _side = OrderSide.buy;
  OrderType _type = OrderType.market;
  int _qty = 10; // mirror React's default qty = 10
  late final TextEditingController _limitController;
  double? _livePrice;
  Timer? _quoteTimer;
  DateTime? _quoteAt;

  @override
  void initState() {
    super.initState();
    final c = CompaniesService.byTicker(widget.ticker);
    _limitController =
        TextEditingController(text: (c?.price ?? 25.00).toStringAsFixed(2));
    _fetchQuote();
    _quoteTimer = Timer.periodic(const Duration(seconds: 30), (_) => _fetchQuote());
  }

  @override
  void dispose() {
    _quoteTimer?.cancel();
    _limitController.dispose();
    super.dispose();
  }

  Future<void> _fetchQuote() async {
    // Backend `/api/quote/:symbol` may or may not be available. We jitter the
    // local catalog price so the UI feels alive while staying believable.
    final c = CompaniesService.byTicker(widget.ticker);
    if (c == null) return;
    final base = c.price;
    final jitter = (DateTime.now().millisecondsSinceEpoch / 1000) % 60;
    final pct = ((jitter / 60) - 0.5) * 0.006; // ±0.3%
    if (!mounted) return;
    setState(() {
      _livePrice = (base * (1 + pct) * 100).roundToDouble() / 100;
      _quoteAt = DateTime.now();
    });
  }

  @override
  Widget build(BuildContext context) {
    // React fallback: unknown ticker renders with `{name: ticker, price: 25.00, change: 0.00, currency: 'SAR'}`.
    final company = CompaniesService.byTicker(widget.ticker) ??
        Company(
          id: widget.ticker,
          name: widget.ticker,
          ticker: widget.ticker,
          country: 'SA',
          sector: 'Unknown',
          currency: 'SAR',
          price: 25.00,
          change: 0.00,
          financials: CompaniesService.catalog.first.financials,
          reports: const [],
          sharia: ShariaStatus.watch,
        );

    final dark = Theme.of(context).brightness == Brightness.dark;
    final card = dark ? AppColors.darkCard : Colors.white;
    final border = dark ? AppColors.darkBorder : AppColors.border;
    final text1 = dark ? AppColors.darkText1 : AppColors.text1;
    final text3 = dark ? AppColors.darkText3 : AppColors.text3;
    final fmt = NumberFormat('#,##0.00');

    final limit = double.tryParse(_limitController.text);
    final marketPrice = _livePrice ?? company.price;
    final effectivePrice =
        _type == OrderType.market ? marketPrice : (limit ?? marketPrice);
    final total = effectivePrice * _qty;

    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
      children: [
        const DemoDataBanner(
          margin: EdgeInsets.only(bottom: 14),
          note:
              'Order book and execution are always simulated — no real order is placed. '
              'Prices for markets without a free feed (Abu Dhabi, Bahrain, Oman) are illustrative.',
        ),
        _header(company, text1, text3, dark),
        const SizedBox(height: 18),
        _sideToggle(),
        const SizedBox(height: 14),
        _typeSelector(),
        const SizedBox(height: 14),
        if (_type != OrderType.market)
          Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: TextField(
              controller: _limitController,
              keyboardType:
                  const TextInputType.numberWithOptions(decimal: true),
              onChanged: (_) => setState(() {}),
              decoration: InputDecoration(
                labelText: _type == OrderType.limit
                    ? 'Limit Price'
                    : 'Stop Price',
                prefixText: '${company.currency} ',
              ),
            ),
          ),
        _qtyStepper(card, border, text1, text3),
        const SizedBox(height: 14),
        _costSummary(company, fmt, total, card, border, text1, text3),
        const SizedBox(height: 20),
        _orderBook(company, card, border, text1, text3),
        const SizedBox(height: 18),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: () => _confirmOrder(company, effectivePrice, total),
            style: ElevatedButton.styleFrom(
              backgroundColor:
                  _side == OrderSide.buy ? AppColors.green : AppColors.red,
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12)),
            ),
            child: Text(
              '${_side == OrderSide.buy ? 'Buy' : 'Sell'} ${company.ticker}',
              style: AppTheme.heading(
                  size: 14, color: Colors.white, letterSpacing: 0.2),
            ),
          ),
        ),
      ],
    );
  }

  Widget _header(Company c, Color text1, Color text3, bool dark) {
    final isUp = c.change >= 0;
    final shown = _livePrice ?? c.price;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(c.ticker,
                style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: text3)),
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
              decoration: BoxDecoration(
                color: AppColors.icAmberFg.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 6,
                    height: 6,
                    decoration: const BoxDecoration(
                      color: AppColors.icAmberFg,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 4),
                  const Text('INDICATIVE',
                      style: TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 0.5,
                          color: AppColors.icAmberFg)),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 2),
        Text(c.name,
            style: AppTheme.heading(size: 20, color: text1)),
        const SizedBox(height: 6),
        Row(
          children: [
            Text(
              '${c.currency} ${shown.toStringAsFixed(2)}',
              style: AppTheme.heading(size: 22, color: text1, letterSpacing: 0),
            ),
            const SizedBox(width: 8),
            Text(
              '${isUp ? '+' : ''}${c.change.toStringAsFixed(2)}%',
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: isUp ? AppColors.green : AppColors.red,
              ),
            ),
            const Spacer(),
            CustomPaint(
              size: const Size(56, 28),
              painter: _OrderSparklinePainter(ticker: c.ticker, up: isUp),
            ),
          ],
        ),
        if (_quoteAt != null) ...[
          const SizedBox(height: 4),
          Text('Updated ${DateFormat.jms().format(_quoteAt!)}',
              style: TextStyle(fontSize: 10, color: text3)),
        ],
      ],
    );
  }

  Widget _sideToggle() {
    return Container(
      padding: const EdgeInsets.all(3),
      decoration: BoxDecoration(
        color: AppColors.bg,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          _sidePill('Buy', OrderSide.buy, AppColors.green),
          _sidePill('Sell', OrderSide.sell, AppColors.red),
        ],
      ),
    );
  }

  Widget _sidePill(String label, OrderSide side, Color activeColor) {
    final active = _side == side;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _side = side),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: active ? activeColor : Colors.transparent,
            borderRadius: BorderRadius.circular(10),
          ),
          alignment: Alignment.center,
          child: Text(
            label,
            style: TextStyle(
              fontWeight: FontWeight.w700,
              color: active ? Colors.white : AppColors.text3,
              fontSize: 14,
            ),
          ),
        ),
      ),
    );
  }

  Widget _typeSelector() {
    return Row(
      children: [
        for (final t in OrderType.values) ...[
          Expanded(
            child: GestureDetector(
              onTap: () => setState(() => _type = t),
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 10),
                decoration: BoxDecoration(
                  color: _type == t ? AppColors.navy : Colors.transparent,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppColors.border),
                ),
                alignment: Alignment.center,
                child: Text(
                  _typeLabel(t),
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: _type == t ? Colors.white : AppColors.text2,
                  ),
                ),
              ),
            ),
          ),
          if (t != OrderType.stop) const SizedBox(width: 8),
        ],
      ],
    );
  }

  String _typeLabel(OrderType t) {
    switch (t) {
      case OrderType.market:
        return 'Market';
      case OrderType.limit:
        return 'Limit';
      case OrderType.stop:
        return 'Stop Loss';
    }
  }

  Widget _qtyStepper(Color card, Color border, Color text1, Color text3) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: card,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: border),
      ),
      child: Row(
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Quantity',
                  style: TextStyle(fontSize: 11, color: text3)),
              const SizedBox(height: 2),
              Text('$_qty shares',
                  style: AppTheme.heading(
                      size: 18, color: text1, letterSpacing: 0)),
            ],
          ),
          const Spacer(),
          IconButton.filledTonal(
            onPressed: _qty > 1 ? () => setState(() => _qty--) : null,
            icon: const Icon(Icons.remove),
          ),
          const SizedBox(width: 8),
          IconButton.filledTonal(
            onPressed: () => setState(() => _qty++),
            icon: const Icon(Icons.add),
          ),
        ],
      ),
    );
  }

  Widget _costSummary(Company c, NumberFormat fmt, double total, Color card,
      Color border, Color text1, Color text3) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: card,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: border),
      ),
      child: Row(
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Estimated Total',
                  style: TextStyle(fontSize: 11, color: text3)),
              const SizedBox(height: 2),
              Text(
                '${c.currency} ${fmt.format(total)}',
                style: AppTheme.heading(
                    size: 20, color: text1, letterSpacing: 0),
              ),
            ],
          ),
          const Spacer(),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text('Available',
                  style: TextStyle(fontSize: 11, color: text3)),
              const SizedBox(height: 2),
              Text(
                '\$100,000',
                style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: text1),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _orderBook(Company c, Color card, Color border, Color text1,
      Color text3) {
    // Deterministic 5-level book derived from the price.
    final base = _livePrice ?? c.price;
    final rng = Random(c.name.hashCode);
    final bids = List.generate(5, (i) {
      final price = base - (0.02 * (i + 1));
      final qty = 50 + rng.nextInt(450);
      return (price, qty);
    });
    final asks = List.generate(5, (i) {
      final price = base + (0.02 * (i + 1));
      final qty = 50 + rng.nextInt(450);
      return (price, qty);
    });
    final maxQty = [
      ...bids.map((e) => e.$2),
      ...asks.map((e) => e.$2),
    ].reduce((a, b) => a > b ? a : b);
    final spread = asks.first.$1 - bids.first.$1;
    final spreadPct = (spread / base) * 100;

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
          Text('ORDER BOOK', style: AppTheme.label(color: text3)),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Bids',
                        style: TextStyle(
                            fontSize: 10,
                            color: AppColors.green,
                            fontWeight: FontWeight.w700)),
                    const SizedBox(height: 6),
                    for (final b in bids)
                      _bookRow(b.$1, b.$2, maxQty, AppColors.green, true,
                          text1, text3),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text('Asks',
                        style: TextStyle(
                            fontSize: 10,
                            color: AppColors.red,
                            fontWeight: FontWeight.w700)),
                    const SizedBox(height: 6),
                    for (final a in asks)
                      _bookRow(a.$1, a.$2, maxQty, AppColors.red, false,
                          text1, text3),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: AppColors.bg,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              children: [
                Icon(Icons.swap_horiz_rounded, size: 13, color: text3),
                const SizedBox(width: 6),
                Text('Spread',
                    style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 0.5,
                        color: text3)),
                const Spacer(),
                Text(
                    '${c.currency} ${spread.toStringAsFixed(2)} · ${spreadPct.toStringAsFixed(2)}%',
                    style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: text1)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _bookRow(double price, int qty, int maxQty, Color color,
      bool leftAligned, Color text1, Color text3) {
    final fraction = qty / maxQty;
    return Container(
      height: 22,
      margin: const EdgeInsets.only(bottom: 2),
      child: Stack(
        alignment:
            leftAligned ? Alignment.centerLeft : Alignment.centerRight,
        children: [
          FractionallySizedBox(
            alignment:
                leftAligned ? Alignment.centerLeft : Alignment.centerRight,
            widthFactor: fraction,
            child: Container(color: color.withValues(alpha: 0.12)),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 6),
            child: Row(
              mainAxisAlignment: leftAligned
                  ? MainAxisAlignment.spaceBetween
                  : MainAxisAlignment.spaceBetween,
              children: leftAligned
                  ? [
                      Text(price.toStringAsFixed(2),
                          style: TextStyle(
                              color: color,
                              fontSize: 11,
                              fontWeight: FontWeight.w700)),
                      Text('$qty',
                          style:
                              TextStyle(color: text3, fontSize: 10)),
                    ]
                  : [
                      Text('$qty',
                          style:
                              TextStyle(color: text3, fontSize: 10)),
                      Text(price.toStringAsFixed(2),
                          style: TextStyle(
                              color: color,
                              fontSize: 11,
                              fontWeight: FontWeight.w700)),
                    ],
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _confirmOrder(Company c, double price, double total) async {
    HapticFeedback.lightImpact();
    final fmt = NumberFormat('#,##0.00');
    final isBuy = _side == OrderSide.buy;
    final confirmed = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 14, 20, 20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: AppColors.border,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 14),
                Text('Review order',
                    style: AppTheme.heading(size: 18, color: AppColors.text1)),
                const SizedBox(height: 4),
                Text('Confirm details before placing',
                    style: TextStyle(fontSize: 12, color: AppColors.text3)),
                const SizedBox(height: 18),
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: AppColors.bg,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    children: [
                      _summaryRow('Stock', '${c.name} (${c.ticker})'),
                      _summaryRow('Side', isBuy ? 'Buy' : 'Sell'),
                      _summaryRow('Type', _typeLabel(_type)),
                      _summaryRow('Quantity', '$_qty'),
                      _summaryRow(
                          'Price', '${c.currency} ${price.toStringAsFixed(2)}'),
                      const Divider(height: 18),
                      _summaryRow('Total',
                          '${c.currency} ${fmt.format(total)}',
                          bold: true),
                    ],
                  ),
                ),
                const SizedBox(height: 18),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12)),
                        ),
                        onPressed: () => Navigator.of(ctx).pop(false),
                        child: const Text('Cancel'),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor:
                              isBuy ? AppColors.green : AppColors.red,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12)),
                        ),
                        onPressed: () => Navigator.of(ctx).pop(true),
                        child: Text(isBuy ? 'Confirm Buy' : 'Confirm Sell'),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
    if (confirmed == true && mounted) {
      await _placeOrder(c, price, total);
    }
  }

  Future<void> _placeOrder(Company c, double price, double total) async {
    HapticFeedback.mediumImpact();
    final fmt = NumberFormat('#,##0.00');
    await context.read<OrderHistoryService>().record(
          ticker: c.ticker,
          side: _side == OrderSide.buy ? 'buy' : 'sell',
          orderType: _typeLabel(_type).toLowerCase().split(' ').first,
          quantity: _qty,
          price: price,
          total: total,
          currency: c.currency,
        );
    if (!mounted) return;
    await showDialog<void>(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        title: Column(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: const BoxDecoration(
                  color: AppColors.greenBg, shape: BoxShape.circle),
              alignment: Alignment.center,
              child: const Icon(Icons.check_rounded,
                  size: 24, color: AppColors.green),
            ),
            const SizedBox(height: 8),
            const Text('Order Placed',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _summaryRow('Stock', '${c.name} (${c.ticker})'),
            _summaryRow('Side', _side == OrderSide.buy ? 'Buy' : 'Sell'),
            _summaryRow('Type', _typeLabel(_type)),
            _summaryRow('Quantity', '$_qty'),
            _summaryRow('Price', '${c.currency} ${price.toStringAsFixed(2)}'),
            _summaryRow('Total', '${c.currency} ${fmt.format(total)}'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Place Another'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.of(context).pop();
              context.go('/portfolio');
            },
            child: const Text('View Portfolio'),
          ),
        ],
      ),
    );
  }

  Widget _summaryRow(String label, String value, {bool bold = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label,
              style: TextStyle(
                  fontSize: bold ? 13 : 12,
                  color: bold ? AppColors.text1 : AppColors.text3,
                  fontWeight: bold ? FontWeight.w700 : FontWeight.w500)),
          Text(value,
              style: TextStyle(
                  fontSize: bold ? 14 : 12,
                  fontWeight: FontWeight.w700,
                  color: AppColors.text1)),
        ],
      ),
    );
  }
}

/// 12-point deterministic sparkline mirroring the React OrderPage MiniSparkline.
class _OrderSparklinePainter extends CustomPainter {
  _OrderSparklinePainter({required this.ticker, required this.up});

  final String ticker;
  final bool up;

  @override
  void paint(Canvas canvas, Size size) {
    var hash = 0;
    for (final c in ticker.codeUnits) {
      hash = ((hash << 5) - hash + c) & 0xFFFFFFFF;
      if ((hash & 0x80000000) != 0) hash -= 0x100000000;
    }
    final abs = hash.abs();
    final points = <double>[];
    for (var i = 0; i < 12; i++) {
      final seed = (abs * (i + 1) * 9301 + 49297) % 233280;
      points.add((seed / 233280.0) * 20 + 2);
    }
    final maxY = points.reduce((a, b) => a > b ? a : b);
    final minY = points.reduce((a, b) => a < b ? a : b);
    final range = (maxY - minY).abs() < 0.0001 ? 1.0 : (maxY - minY);

    final path = Path();
    for (var i = 0; i < points.length; i++) {
      final x = (i / (points.length - 1)) * size.width;
      final y = size.height - ((points[i] - minY) / range) * (size.height - 4);
      if (i == 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }
    }
    final paint = Paint()
      ..color = up ? AppColors.green : AppColors.red
      ..strokeWidth = 1.5
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant _OrderSparklinePainter old) =>
      old.ticker != ticker || old.up != up;
}
