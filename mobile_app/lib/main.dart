import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';

import 'router.dart';
import 'services/auth_service.dart';
import 'services/companies_service.dart';
import 'services/gamification_service.dart';
import 'services/market_api.dart';
import 'services/onboarding_service.dart';
import 'services/order_history_service.dart';
import 'services/pin_service.dart';
import 'services/portfolio_store.dart';
import 'services/watchlist_service.dart';
import 'theme/app_theme.dart';
import 'theme/theme_controller.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.dark,
  ));

  final auth = AuthService();
  final theme = ThemeController();
  final portfolio = PortfolioStore();
  final gamification = GamificationService();
  final onboarding = OnboardingService();
  final pins = PinService();
  final watchlist = WatchlistService();
  final orderHistory = OrderHistoryService();
  final api = MarketApi();

  await Future.wait([
    auth.loadSession(),
    theme.load(),
    portfolio.load(),
    gamification.load(),
    onboarding.load(),
    pins.load(),
    watchlist.load(),
    orderHistory.load(),
  ]);

  // Hydrate companies catalog from backend in the background so the seed
  // appears immediately on first paint and live data replaces it shortly.
  unawaited(CompaniesService.loadFromApi(api));

  runApp(AshomApp(
    auth: auth,
    theme: theme,
    portfolio: portfolio,
    gamification: gamification,
    onboarding: onboarding,
    pins: pins,
    watchlist: watchlist,
    orderHistory: orderHistory,
    api: api,
  ));
}

class AshomApp extends StatelessWidget {
  const AshomApp({
    super.key,
    required this.auth,
    required this.theme,
    required this.portfolio,
    required this.gamification,
    required this.onboarding,
    required this.pins,
    required this.watchlist,
    required this.orderHistory,
    required this.api,
  });

  final AuthService auth;
  final ThemeController theme;
  final PortfolioStore portfolio;
  final GamificationService gamification;
  final OnboardingService onboarding;
  final PinService pins;
  final WatchlistService watchlist;
  final OrderHistoryService orderHistory;
  final MarketApi api;

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider.value(value: auth),
        ChangeNotifierProvider.value(value: theme),
        ChangeNotifierProvider.value(value: portfolio),
        ChangeNotifierProvider.value(value: gamification),
        ChangeNotifierProvider.value(value: onboarding),
        ChangeNotifierProvider.value(value: pins),
        ChangeNotifierProvider.value(value: watchlist),
        ChangeNotifierProvider.value(value: orderHistory),
        Provider<MarketApi>.value(value: api),
      ],
      child: AppRouter(
        builder: (context, router) {
          final themeController = context.watch<ThemeController>();
          return MaterialApp.router(
            title: 'Ashom',
            debugShowCheckedModeBanner: false,
            theme: AppTheme.light(),
            darkTheme: AppTheme.dark(),
            themeMode: themeController.mode,
            routerConfig: router,
          );
        },
      ),
    );
  }
}
