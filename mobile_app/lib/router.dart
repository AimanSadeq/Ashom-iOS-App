import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import 'screens/ai_analyst_screen.dart';
import 'screens/analytics_screen.dart';
import 'screens/companies_screen.dart';
import 'screens/company_profile_screen.dart';
import 'screens/crypto_screen.dart';
import 'screens/home_screen.dart';
import 'screens/learning_screen.dart';
import 'screens/login_screen.dart';
import 'screens/markets_screen.dart';
import 'screens/metals_screen.dart';
import 'screens/news_screen.dart';
import 'screens/notifications_screen.dart';
import 'screens/onboarding_screen.dart';
import 'screens/order_screen.dart';
import 'screens/placeholder_screen.dart';
import 'screens/portfolio_screen.dart';
import 'screens/screener_screen.dart';
import 'screens/auth_extras.dart';
import 'screens/explore_screens.dart';
import 'screens/feature_screens.dart';
import 'screens/settings_detail_screens.dart';
import 'screens/settings_screen.dart';
import 'theme/app_colors.dart';
import 'services/auth_service.dart';
import 'services/onboarding_service.dart';
import 'widgets/app_shell.dart';

GoRouter buildRouter(AuthService auth, OnboardingService onboarding) {
  return GoRouter(
    initialLocation: '/',
    refreshListenable: Listenable.merge([auth, onboarding]),
    redirect: (context, state) {
      final loggedIn = auth.isAuthenticated;
      final loc = state.matchedLocation;
      final isAuthRoute =
          loc == '/login' || loc == '/register' || loc == '/reset-password';
      final atOnboarding = loc == '/onboarding';

      if (!loggedIn && !isAuthRoute) return '/login';
      if (loggedIn && isAuthRoute) {
        return onboarding.done ? '/' : '/onboarding';
      }
      if (loggedIn && !onboarding.done && !atOnboarding) {
        return '/onboarding';
      }
      if (loggedIn && onboarding.done && atOnboarding) return '/';
      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/register',
        builder: (context, state) => const RegisterScreen(),
      ),
      GoRoute(
        path: '/reset-password',
        builder: (context, state) => const ResetPasswordScreen(),
      ),
      GoRoute(
        path: '/onboarding',
        builder: (context, state) => const OnboardingScreen(),
      ),
      ShellRoute(
        builder: (context, state, child) => AppShell(
          location: state.matchedLocation,
          child: child,
        ),
        routes: [
          GoRoute(
              path: '/',
              pageBuilder: (c, s) =>
                  const NoTransitionPage(child: HomeScreen())),
          GoRoute(
              path: '/markets',
              pageBuilder: (c, s) =>
                  const NoTransitionPage(child: MarketsScreen())),
          GoRoute(
              path: '/ai',
              pageBuilder: (c, s) =>
                  const NoTransitionPage(child: AIAnalystScreen())),
          GoRoute(
              path: '/analytics',
              pageBuilder: (c, s) =>
                  const NoTransitionPage(child: AnalyticsScreen())),
          GoRoute(
              path: '/portfolio',
              pageBuilder: (c, s) =>
                  const NoTransitionPage(child: PortfolioScreen())),
          GoRoute(
              path: '/news',
              pageBuilder: (c, s) =>
                  const NoTransitionPage(child: NewsScreen())),
          GoRoute(
              path: '/learning',
              pageBuilder: (c, s) =>
                  const NoTransitionPage(child: LearningScreen())),
          GoRoute(path: '/crypto', builder: (c, s) => const CryptoScreen()),
          GoRoute(path: '/metals', builder: (c, s) => const MetalsScreen()),
          GoRoute(path: '/screener', builder: (c, s) => const ScreenerScreen()),
          GoRoute(path: '/companies', builder: (c, s) => const CompaniesScreen()),
          GoRoute(
            path: '/companies/:id',
            builder: (c, s) =>
                CompanyProfileScreen(companyId: s.pathParameters['id'] ?? ''),
          ),
          GoRoute(
              path: '/notifications',
              builder: (c, s) => const NotificationsScreen()),
          GoRoute(path: '/settings', builder: (c, s) => const SettingsScreen()),
          GoRoute(
            path: '/order/:ticker',
            builder: (c, s) =>
                OrderScreen(ticker: s.pathParameters['ticker'] ?? ''),
          ),
          GoRoute(
            path: '/reports/:id',
            builder: (c, s) => PlaceholderScreen(
              title: 'Annual Report',
              subtitle:
                  'Report ${s.pathParameters['id'] ?? ''} — in-app PDF viewer coming soon.',
            ),
          ),
          GoRoute(
            path: '/wizard/type',
            builder: (c, s) => PlaceholderScreen(
              title: 'Comparison Wizard',
              subtitle:
                  'Type "${s.uri.queryParameters['type'] ?? ''}" — 5-step wizard coming soon.',
            ),
          ),
          GoRoute(
            path: '/filings',
            builder: (c, s) => const FilingsScreen(),
          ),
          GoRoute(
            path: '/watchlist',
            builder: (c, s) => const WatchlistScreen(),
          ),
          GoRoute(
            path: '/cma',
            builder: (c, s) => const CMAScreen(),
          ),
          GoRoute(
            path: '/export',
            builder: (c, s) => const ReportExportScreen(),
          ),
          GoRoute(
            path: '/rates',
            builder: (c, s) => const CentralBankRatesScreen(),
          ),
          GoRoute(
            path: '/zakat',
            builder: (c, s) => const ZakatScreen(),
          ),
          GoRoute(
            path: '/dividends',
            builder: (c, s) => const DividendCalendarScreen(),
          ),
          GoRoute(
            path: '/earnings',
            builder: (c, s) => const EarningsCalendarScreen(),
          ),
          GoRoute(
            path: '/ipo-calendar',
            builder: (c, s) => const IPOCalendarScreen(),
          ),
          GoRoute(
            path: '/currency',
            builder: (c, s) => const CurrencyConverterScreen(),
          ),
          GoRoute(
            path: '/quant',
            builder: (c, s) => const QuantHubScreen(),
          ),
          GoRoute(
            path: '/sectors',
            builder: (c, s) => const SectorDashboardScreen(),
          ),
          GoRoute(
            path: '/sharia',
            builder: (c, s) => const ShariaScreeningScreen(),
          ),
          GoRoute(
            path: '/copy-trading',
            builder: (c, s) => const CopyTradingScreen(),
          ),
          GoRoute(
            path: '/community',
            builder: (c, s) => const SocialFeedScreen(),
          ),
          GoRoute(
            path: '/curated',
            builder: (c, s) => const CuratedListsScreen(),
          ),
          GoRoute(
            path: '/cross-listings',
            builder: (c, s) => const CrossListingsScreen(),
          ),
          GoRoute(
            path: '/family',
            builder: (c, s) => const FamilyHubScreen(),
          ),
          GoRoute(
            path: '/net-worth',
            builder: (c, s) => const NetWorthScreen(),
          ),
          GoRoute(
            path: '/options',
            builder: (c, s) => const OptionsScreenerScreen(),
          ),
          GoRoute(
            path: '/classroom',
            builder: (c, s) => const ClassroomScreen(),
          ),
          GoRoute(
            path: '/fractional-shares',
            builder: (c, s) => const FractionalSharesScreen(),
          ),
          GoRoute(
            path: '/glossary',
            builder: (c, s) => const GlossaryScreen(),
          ),
          GoRoute(
            path: '/achievements',
            builder: (c, s) => const AchievementsScreen(),
          ),
          // ===== Settings detail routes =====
          GoRoute(
            path: '/personal-info',
            builder: (c, s) => const PersonalInfoScreen(),
          ),
          GoRoute(
            path: '/security-privacy',
            builder: (c, s) => const SecurityPrivacyScreen(),
          ),
          GoRoute(
            path: '/notification-settings',
            builder: (c, s) => const NotificationSettingsScreen(),
          ),
          GoRoute(
            path: '/help',
            builder: (c, s) => const HelpCenterScreen(),
          ),
          GoRoute(
            path: '/report-bug',
            builder: (c, s) => const ReportBugScreen(),
          ),
          GoRoute(
            path: '/about',
            builder: (c, s) => const AboutScreen(),
          ),
          GoRoute(
            path: '/pricing',
            builder: (c, s) => const PricingScreen(),
          ),
          GoRoute(
            path: '/api-access',
            builder: (c, s) => const FeatureInfoScreen(
              title: 'API Access',
              tagline:
                  'Build on top of Ashom. Read-only REST endpoints for the GCC company dataset, market quotes, and your portfolio.',
              icon: Icons.key_rounded,
              accent: AppColors.icTealFg,
              comingSoon:
                  'The public API is not available yet. This page previews what is planned.',
              bullets: [
                'REST + JSON, generous rate limits',
                'GCC company financials & ratios',
                'Indicative commodities & crypto quotes',
                'Portfolio sync (read & write)',
                'API keys with scoped permissions',
              ],
            ),
          ),
          GoRoute(
            path: '/white-label',
            builder: (c, s) => const FeatureInfoScreen(
              title: 'White Label',
              tagline:
                  'Publish branded research and reports to your clients with your logo, colors, and disclaimers.',
              icon: Icons.business_rounded,
              accent: AppColors.icNavyFg,
              comingSoon:
                  'White-label publishing is not available yet — this is a preview of the offering.',
              bullets: [
                'Custom logo, colors, fonts',
                'Branded PDF report templates',
                'Custom domain (yourbrand.ashom.app)',
                'Client management dashboard',
                'Dedicated success manager',
              ],
            ),
          ),
          GoRoute(
            path: '/dashboard',
            builder: (c, s) => const FeatureInfoScreen(
              title: 'Custom Dashboard',
              tagline:
                  'Compose your own homepage from market modules — watchlists, charts, news, and metrics.',
              icon: Icons.dashboard_rounded,
              accent: AppColors.icOrangeFg,
              bullets: [
                'Drag-and-drop module layout',
                '20+ pre-built widget types',
                'Save multiple layouts',
                'Share dashboards with team',
                'Auto-refresh on intervals',
              ],
            ),
          ),
          GoRoute(
            path: '/legal/terms',
            builder: (c, s) => const StaticInfoScreen(
              title: 'Terms of Use',
              sections: [
                (
                  'Educational use',
                  'Ashom is provided for educational and informational purposes only. Nothing in the app constitutes investment, financial, legal, or tax advice. You alone are responsible for your investment decisions.',
                ),
                (
                  'No warranty',
                  'Market data, prices, and analytics are provided "as is" without warranty of any kind. We aggregate from third-party sources and cannot guarantee accuracy, timeliness, or completeness.',
                ),
                (
                  'Acceptable use',
                  'You agree not to misuse the service, attempt to access data you are not authorized to access, or reverse-engineer the app. We reserve the right to suspend access for violations.',
                ),
                (
                  'Subscriptions',
                  'Paid plans renew automatically at the end of each billing period. Cancel anytime in Settings → Subscription. Refunds are handled per the App Store policy.',
                ),
                (
                  'Changes',
                  'We may update these terms from time to time. Continued use after changes means you accept the revised terms. Last updated June 2026.',
                ),
              ],
            ),
          ),
          GoRoute(
            path: '/legal/privacy',
            builder: (c, s) => const StaticInfoScreen(
              title: 'Privacy Policy',
              sections: [
                (
                  'What we collect',
                  'Account email and display name. Portfolio holdings you enter (stored locally on your device by default). Crash reports and anonymous usage analytics — only if you have analytics enabled.',
                ),
                (
                  'What we do NOT collect',
                  'We do not sell your data. We do not collect contact lists, location, photos, or any identifiers used for advertising.',
                ),
                (
                  'Third parties',
                  'Authentication via Supabase. Market data fetched from CoinGecko (crypto), Yahoo Finance (commodities). These providers see only the data requests, not your account.',
                ),
                (
                  'Your rights',
                  'You can export or delete your data at any time from Settings → Security & Privacy. Email privacy@ashom.app for any GDPR/CCPA requests.',
                ),
              ],
            ),
          ),
          // ===== Newly-added missing routes (parity with website) =====
          GoRoute(
            path: '/university',
            builder: (c, s) => const UniversityScreen(),
          ),
          GoRoute(
            path: '/verify-certificate',
            builder: (c, s) => const VerifyCertificateScreen(),
          ),
          GoRoute(
            path: '/portfolios',
            builder: (c, s) => const MultiPortfolioScreen(),
          ),
          GoRoute(
            path: '/paths',
            builder: (c, s) => const LearningPathsScreen(),
          ),
          GoRoute(
            path: '/comparison-results',
            builder: (c, s) => const ComparisonResultsScreen(),
          ),
          GoRoute(
            path: '/reports/export',
            builder: (c, s) => const ReportExportScreen(),
          ),
          GoRoute(
            path: '/quant/factor-models',
            builder: (c, s) => const QuantInfoScreen(
              title: 'Factor Models',
              tagline:
                  'Decompose returns by size, value, momentum, quality and other factors.',
              icon: Icons.scatter_plot_rounded,
              accent: AppColors.icPurpleFg,
              bullets: [
                'Fama-French 3 & 5 factor regressions',
                'Carhart momentum factor',
                'GCC-localized factor library',
                'Per-stock alpha & beta',
                'Rolling factor exposures',
              ],
            ),
          ),
          GoRoute(
            path: '/quant/gcc-tools',
            builder: (c, s) => const QuantInfoScreen(
              title: 'GCC Tools',
              tagline:
                  'Quant utilities tuned for Gulf markets — currency pegs, oil sensitivity, dividend cycles.',
              icon: Icons.handyman_rounded,
              accent: AppColors.icTealFg,
              bullets: [
                'USD-pegged currency converter',
                'Oil-beta calculator',
                'GCC sector heatmaps',
                'Dividend ex-date scanner',
                'Free-float adjustments',
              ],
            ),
          ),
          GoRoute(
            path: '/quant/optimizer',
            builder: (c, s) => const QuantInfoScreen(
              title: 'Portfolio Optimizer',
              tagline:
                  'Find the optimal allocation across your watchlist using mean-variance, risk-parity, or Black-Litterman.',
              icon: Icons.tune_rounded,
              accent: AppColors.icBlueFg,
              bullets: [
                'Mean-variance frontier',
                'Risk parity allocation',
                'Black-Litterman views',
                'Constraints (min/max weights, sector caps)',
                'Backtested allocations',
              ],
            ),
          ),
          GoRoute(
            path: '/quant/regression',
            builder: (c, s) => const QuantInfoScreen(
              title: 'Regression Lab',
              tagline:
                  'Run OLS, ridge, lasso, and time-series regressions on GCC market data.',
              icon: Icons.show_chart_rounded,
              accent: AppColors.icAmberFg,
              bullets: [
                'OLS, Ridge, Lasso',
                'Multicollinearity diagnostics',
                'Residual analysis & QQ plots',
                'Time-series ARIMA / GARCH',
                'Export coefficients to Excel',
              ],
            ),
          ),
          GoRoute(
            path: '/quant/relative-value',
            builder: (c, s) => const QuantInfoScreen(
              title: 'Relative Value',
              tagline:
                  'Spot rich/cheap stocks vs sector peers using multiples and z-scores.',
              icon: Icons.compare_arrows_rounded,
              accent: AppColors.icOrangeFg,
              bullets: [
                'Peer-group z-scores',
                'Multi-multiple composite ranking',
                'Sector & country normalization',
                'Historical mean-reversion signals',
                'Watchlist sync',
              ],
            ),
          ),
          GoRoute(
            path: '/quant/risk',
            builder: (c, s) => const QuantInfoScreen(
              title: 'Risk Analytics',
              tagline:
                  'Measure your portfolio risk — VaR, CVaR, drawdown, volatility, correlations.',
              icon: Icons.shield_rounded,
              accent: AppColors.icRedFg,
              bullets: [
                'Historical & parametric VaR',
                'CVaR (Expected Shortfall)',
                'Stress testing scenarios',
                'Correlation matrices',
                'Sharpe / Sortino / Calmar ratios',
              ],
            ),
          ),
          GoRoute(
            path: '/quant/valuation',
            builder: (c, s) => const QuantInfoScreen(
              title: 'Valuation Workbench',
              tagline:
                  'Build DCFs, comparables, and dividend discount models in-app.',
              icon: Icons.calculate_rounded,
              accent: AppColors.icGreenFg,
              bullets: [
                'DCF (FCF / FCFE / DDM)',
                'Comparable company analysis',
                'Precedent transactions',
                'WACC calculator',
                'Sensitivity tables',
              ],
            ),
          ),
          GoRoute(
            path: '/quant/vision-2030',
            builder: (c, s) => const QuantInfoScreen(
              title: 'Vision 2030 Tracker',
              tagline:
                  'Follow Saudi Vision 2030 sectors, megaprojects, and exposed equities.',
              icon: Icons.flag_circle_rounded,
              accent: AppColors.icNavyFg,
              bullets: [
                'NEOM, Red Sea, Qiddiya exposure',
                'Public Investment Fund holdings',
                'Tourism, mining, renewables baskets',
                'IPO pipeline tracker',
                'KPI dashboards',
              ],
            ),
          ),
          GoRoute(
            path: '/wizard/first-entity',
            builder: (c, s) => const WizardStepScreen(
              step: 2,
              title: 'Pick the first entity',
              subtitle: 'Choose a company, sector, or index to compare from.',
              nextPath: '/wizard/second-entity',
            ),
          ),
          GoRoute(
            path: '/wizard/second-entity',
            builder: (c, s) => const WizardStepScreen(
              step: 3,
              title: 'Pick the second entity',
              subtitle: 'Choose what to compare against.',
              nextPath: '/wizard/metrics',
            ),
          ),
          GoRoute(
            path: '/wizard/metrics',
            builder: (c, s) => const WizardStepScreen(
              step: 4,
              title: 'Select metrics',
              subtitle: 'Pick the ratios and figures you want side-by-side.',
              nextPath: '/wizard/review',
            ),
          ),
          GoRoute(
            path: '/wizard/review',
            builder: (c, s) => const WizardStepScreen(
              step: 5,
              title: 'Review',
              subtitle: "Double-check, then we'll generate the comparison.",
              nextPath: '/comparison-results',
            ),
          ),
          GoRoute(
            path: '/legal/data-sources',
            builder: (c, s) => const StaticInfoScreen(
              title: 'Data Sources',
              sections: [
                (
                  'Important',
                  'All market data in Ashom is indicative and may be delayed. It is obtained from the third-party sources below and is not official, real-time, or guaranteed. Some figures are sample/illustrative where no free source is available — these are clearly labelled "Demo data" in the app. Verify any price with the official exchange before relying on it.',
                ),
                (
                  'GCC company data',
                  'Static dataset of 180+ companies across Saudi Arabia, UAE, Kuwait, Qatar, Bahrain, and Oman. Compiled from public exchange filings and regulator disclosures.',
                ),
                (
                  'Cryptocurrencies',
                  'CoinGecko public API. Near real-time with a ~90-second cache. Rate-limit fallback to last known prices.',
                ),
                (
                  'Metals & oil',
                  'Yahoo Finance public endpoints. Delayed (~1 min cache). Falls back to last-cached prices when upstream is unavailable.',
                ),
                (
                  'Indices & stock prices',
                  'Yahoo Finance for Saudi, Dubai, Qatar, and Kuwait (delayed ~30–90s). ADX, Qatar (QSI), Bahrain (BAX), and Oman (MSM30) are scraped from public exchange websites and refreshed periodically.',
                ),
                (
                  'Markets without a free live feed',
                  'Individual stock prices for Abu Dhabi (ADX), Bahrain, and Oman are not available from a free source and are shown as clearly-labelled demo values on the relevant pages.',
                ),
                (
                  'Central bank rates',
                  'GCC central bank websites, polled periodically. Not real-time.',
                ),
                (
                  'Attribution',
                  '"Yahoo" and "Yahoo Finance" are trademarks of their respective owner. CoinGecko data is used under its public API terms. Exchange data belongs to the respective exchanges (Saudi Exchange, DFM, ADX, Qatar Stock Exchange, Boursa Kuwait, Bahrain Bourse, Muscat Stock Exchange).',
                ),
              ],
            ),
          ),
        ],
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Center(child: Text('Route not found: ${state.uri}')),
    ),
  );
}

class AppRouter extends StatefulWidget {
  const AppRouter({super.key, required this.builder});

  final Widget Function(BuildContext, GoRouter) builder;

  @override
  State<AppRouter> createState() => _AppRouterState();
}

class _AppRouterState extends State<AppRouter> {
  GoRouter? _router;

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthService>();
    final onboarding = context.watch<OnboardingService>();
    _router ??= buildRouter(auth, onboarding);
    return widget.builder(context, _router!);
  }
}
