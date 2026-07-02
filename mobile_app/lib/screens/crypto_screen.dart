import 'dart:async';

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../services/gamification_service.dart';
import '../services/market_api.dart';
import '../theme/app_colors.dart';
import '../theme/app_theme.dart';

class CryptoScreen extends StatefulWidget {
  const CryptoScreen({super.key});

  @override
  State<CryptoScreen> createState() => _CryptoScreenState();
}

class _CryptoScreenState extends State<CryptoScreen>
    with WidgetsBindingObserver {
  static const _ids = [
    'bitcoin',
    'ethereum',
    'binancecoin',
    'solana',
    'cardano',
    'ripple',
    'polkadot',
    'dogecoin',
    'avalanche-2',
    'matic-network',
  ];
  static const _meta = {
    'bitcoin': ('Bitcoin', 'BTC'),
    'ethereum': ('Ethereum', 'ETH'),
    'binancecoin': ('BNB', 'BNB'),
    'solana': ('Solana', 'SOL'),
    'cardano': ('Cardano', 'ADA'),
    'ripple': ('XRP', 'XRP'),
    'polkadot': ('Polkadot', 'DOT'),
    'dogecoin': ('Dogecoin', 'DOGE'),
    'avalanche-2': ('Avalanche', 'AVAX'),
    'matic-network': ('Polygon', 'MATIC'),
  };

  Map<String, CryptoQuote> _data = {};
  Timer? _timer;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _fetch();
    _timer = Timer.periodic(const Duration(seconds: 30), (_) => _fetch());
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<GamificationService>().track('crypto-visited');
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      _fetch();
      _timer?.cancel();
      _timer = Timer.periodic(const Duration(seconds: 30), (_) => _fetch());
    } else {
      _timer?.cancel();
    }
  }

  Future<void> _fetch() async {
    if (!mounted) return;
    final api = context.read<MarketApi>();
    final data = await api.fetchCrypto(_ids);
    if (!mounted) return;
    setState(() {
      _data = data;
      _loading = false;
    });
    context.read<GamificationService>().track('market-refreshed');
  }

  @override
  Widget build(BuildContext context) {
    final dark = Theme.of(context).brightness == Brightness.dark;
    final card = dark ? AppColors.darkCard : Colors.white;
    final border = dark ? AppColors.darkBorder : AppColors.border;
    final text1 = dark ? AppColors.darkText1 : AppColors.text1;
    final text2 = dark ? AppColors.darkText2 : AppColors.text2;
    final text3 = dark ? AppColors.darkText3 : AppColors.text3;

    final fmt = NumberFormat.currency(symbol: '\$', decimalDigits: 2);

    return RefreshIndicator(
      onRefresh: _fetch,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 18, 20, 28),
        children: [
          Row(
            children: [
              Text('Crypto',
                  style: AppTheme.heading(size: 24, color: text1)),
              const SizedBox(width: 10),
              Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: AppColors.icAmberBg,
                  borderRadius: BorderRadius.circular(6),
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
                    const SizedBox(width: 6),
                    const Text(
                      'INDICATIVE',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        color: AppColors.icAmberFg,
                        letterSpacing: 0.8,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text('Indicative prices · may be delayed · refreshes every 30s',
              style: TextStyle(fontSize: 12, color: text3)),
          const SizedBox(height: 18),
          if (_loading)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 40),
              child: Center(child: CircularProgressIndicator()),
            )
          else
            for (final id in _ids)
              _cryptoRow(id, _data[id], fmt, card, border, text1, text2, text3),
        ],
      ),
    );
  }

  Widget _cryptoRow(
    String id,
    CryptoQuote? q,
    NumberFormat fmt,
    Color card,
    Color border,
    Color text1,
    Color text2,
    Color text3,
  ) {
    final meta = _meta[id]!;
    final price = q?.price ?? 0;
    final change = q?.change24h ?? 0;
    final up = change >= 0;
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: card,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: border),
      ),
      child: Row(
        children: [
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              color: AppColors.icOrangeBg,
              borderRadius: BorderRadius.circular(10),
            ),
            alignment: Alignment.center,
            child: Text(
              meta.$2.substring(0, meta.$2.length > 3 ? 3 : meta.$2.length),
              style: const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w700,
                color: AppColors.icOrangeFg,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(meta.$1,
                    style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: text1)),
                const SizedBox(height: 2),
                Text(meta.$2,
                    style: TextStyle(fontSize: 12, color: text3)),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                fmt.format(price),
                style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: text1),
              ),
              const SizedBox(height: 2),
              Text(
                '${up ? '+' : ''}${change.toStringAsFixed(2)}%',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: up ? AppColors.green : AppColors.red,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
