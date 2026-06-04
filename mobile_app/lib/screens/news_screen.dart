import 'dart:async';

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../services/market_api.dart';
import '../theme/app_colors.dart';
import '../theme/app_theme.dart';

/* ───── Models ───── */

class _Article {
  final String id;
  final String title;
  final String category;
  final String source;
  final String snippet;
  final String body;
  final DateTime publishedAt;
  final String? url;

  const _Article({
    required this.id,
    required this.title,
    required this.category,
    required this.source,
    required this.snippet,
    required this.body,
    required this.publishedAt,
    this.url,
  });
}

/* ───── Categories + colors mirror React CATEGORY_COLORS ───── */

const _categories = <String>[
  'All',
  'Business',
  'Finance',
  'Tech',
  'Investment',
  'Real Estate',
  'Banking',
];

const _categoryColors = <String, (Color, Color)>{
  'all': (AppColors.blueLight, AppColors.blue),
  'business': (AppColors.greenBg, AppColors.green),
  'finance': (Color(0xFFF3EEFF), Color(0xFF7C3AED)),
  'tech': (Color(0xFFFFF7ED), Color(0xFFD97706)),
  'investment': (AppColors.greenBg, AppColors.green),
  'real estate': (AppColors.redBg, AppColors.red),
  'banking': (AppColors.blueLight, AppColors.blue),
};

/* ───── Placeholder articles (until news API is wired) ───── */

final _sampleArticles = <_Article>[
  _Article(
    id: '1',
    title: 'Saudi Aramco beats Q1 estimates, raises dividend',
    category: 'Business',
    source: 'Reuters',
    snippet:
        'Oil giant posts \$30.1B net profit for the quarter, exceeding analyst consensus of \$28.7B. Dividend raised to \$20.7B.',
    body:
        'Saudi Aramco reported stronger-than-expected first-quarter results on Tuesday, with net profit reaching \$30.1B versus analyst consensus of \$28.7B.\n\nThe company raised its quarterly dividend payout to \$20.7B as upstream efficiency improvements and lower capex continue to support free cash flow.\n\nCEO Amin Nasser pointed to sustained global demand for Saudi crude and expanding downstream margins as the primary drivers.',
    publishedAt: DateTime.now().subtract(const Duration(hours: 2)),
    url: 'https://example.com/aramco-q1',
  ),
  _Article(
    id: '2',
    title: 'UAE central bank holds rate at 5.25% for third meeting',
    category: 'Banking',
    source: 'Bloomberg',
    snippet:
        'CBUAE kept its base rate unchanged, mirroring the latest Federal Reserve decision on US monetary policy.',
    body:
        'The Central Bank of the UAE (CBUAE) kept its base rate at 5.25% on Wednesday, mirroring the Federal Reserve\'s pause at its last meeting.\n\nThe decision reflects the UAE dirham\'s peg to the US dollar. Banking analysts expect the next move to be a cut in Q3 if US inflation continues to moderate.',
    publishedAt: DateTime.now().subtract(const Duration(hours: 4)),
  ),
  _Article(
    id: '3',
    title: 'Qatar signs new LNG supply deal with Germany',
    category: 'Business',
    source: 'FT',
    snippet:
        'QatarEnergy secures a 15-year supply agreement, cementing Doha\'s position as a strategic European gas partner.',
    body:
        'QatarEnergy announced a 15-year LNG supply agreement with a major German importer, covering more than 2 million tonnes per annum starting in 2026.',
    publishedAt: DateTime.now().subtract(const Duration(hours: 5)),
  ),
  _Article(
    id: '4',
    title: 'Kuwait Investment Authority raises US equity allocation',
    category: 'Investment',
    source: 'WSJ',
    snippet:
        'The sovereign wealth fund is rotating toward technology and healthcare sectors within its public equities sleeve.',
    body:
        'Kuwait\'s sovereign wealth fund reported a rotation toward technology and healthcare sectors in its latest quarterly disclosure.',
    publishedAt: DateTime.now().subtract(const Duration(hours: 7)),
  ),
  _Article(
    id: '5',
    title: 'Oman Vision 2040 unlocks \$70B in sovereign projects',
    category: 'Real Estate',
    source: 'Oman Observer',
    snippet:
        'A pipeline of infrastructure, tourism, and renewable energy projects is drawing international partners.',
    body:
        'Oman\'s Vision 2040 pipeline has now identified \$70B in sovereign projects, with tourism, logistics, and renewable energy leading new commitments.',
    publishedAt: DateTime.now().subtract(const Duration(hours: 9)),
  ),
  _Article(
    id: '6',
    title: 'GCC fintech funding rebounds, UAE leads deal count',
    category: 'Tech',
    source: 'TechCrunch',
    snippet:
        'Regional fintech investment rose 38% YoY in Q1, with UAE and Saudi Arabia capturing three-quarters of deals.',
    body:
        'GCC fintech funding rebounded sharply in Q1, rising 38% year-over-year. UAE-based startups led the deal count, followed closely by Saudi Arabia.',
    publishedAt: DateTime.now().subtract(const Duration(hours: 12)),
  ),
  _Article(
    id: '7',
    title: 'Dubai Financial Market launches new sukuk trading platform',
    category: 'Finance',
    source: 'The National',
    snippet:
        'The new platform will offer retail investors direct access to sovereign and corporate sukuk issuances.',
    body:
        'DFM\'s new sukuk trading platform opens sovereign and corporate Islamic bonds to retail investors with simplified settlement and real-time pricing.',
    publishedAt: DateTime.now().subtract(const Duration(hours: 18)),
  ),
];

/* ───── Screen ───── */

class NewsScreen extends StatefulWidget {
  const NewsScreen({super.key});

  @override
  State<NewsScreen> createState() => _NewsScreenState();
}

class _NewsScreenState extends State<NewsScreen>
    with WidgetsBindingObserver {
  List<_Article>? _articles;
  bool _loading = true;
  String? _error;
  String _category = 'All';
  String _search = '';
  DateTime? _lastUpdated;
  Timer? _timer;
  _Article? _selected;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _fetch();
    _timer = Timer.periodic(const Duration(seconds: 60), (_) => _fetch());
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
      _timer = Timer.periodic(const Duration(seconds: 60), (_) => _fetch());
    } else {
      _timer?.cancel();
    }
  }

  Future<void> _fetch() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final api = context.read<MarketApi>();
      final live = await api.fetchNews(category: _category.toLowerCase());
      if (!mounted) return;
      final mapped = live.isEmpty
          ? [..._sampleArticles]
          : live
              .map((a) => _Article(
                    id: a.id,
                    title: a.title,
                    category: a.category,
                    source: a.source,
                    snippet: a.snippet,
                    body: a.body,
                    publishedAt: a.publishedAt,
                    url: a.url,
                  ))
              .toList();
      mapped.sort((a, b) => b.publishedAt.compareTo(a.publishedAt));
      setState(() {
        _articles = mapped;
        _lastUpdated = DateTime.now();
        _loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _articles = [..._sampleArticles]
          ..sort((a, b) => b.publishedAt.compareTo(a.publishedAt));
        _lastUpdated = DateTime.now();
        _loading = false;
      });
    }
  }

  List<_Article> get _filtered {
    final list = _articles ?? const [];
    final byCategory = _category == 'All'
        ? list
        : list
            .where((a) =>
                a.category.toLowerCase() == _category.toLowerCase())
            .toList();
    final q = _search.trim().toLowerCase();
    if (q.isEmpty) return byCategory;
    return byCategory
        .where((a) =>
            a.title.toLowerCase().contains(q) ||
            a.source.toLowerCase().contains(q) ||
            a.snippet.toLowerCase().contains(q))
        .toList();
  }

  String _relative(DateTime d) {
    final diff = DateTime.now().difference(d);
    if (diff.inHours < 1) return 'Just now';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    if (diff.inDays < 7) return '${diff.inDays}d ago';
    return DateFormat.yMd().format(d);
  }

  @override
  Widget build(BuildContext context) {
    final dark = Theme.of(context).brightness == Brightness.dark;
    final card = dark ? AppColors.darkCard : Colors.white;
    final border = dark ? AppColors.darkBorder : AppColors.border;
    final text1 = dark ? AppColors.darkText1 : AppColors.navy;
    final text2 = dark ? AppColors.darkText2 : AppColors.text2;
    final text3 = dark ? AppColors.darkText3 : AppColors.text3;

    return ListView(
      padding: const EdgeInsets.only(top: 18, bottom: 28),
      children: [
        // Header
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 0, 20, 10),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('News Stream',
                  style: AppTheme.heading(size: 22, color: text1)),
              const SizedBox(height: 2),
              Text('GCC & Global Financial News',
                  style: TextStyle(fontSize: 12, color: text3)),
            ],
          ),
        ),
        // Live indicator row
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 2, 20, 10),
          child: Row(
            children: [
              const _LivePulse(),
              const SizedBox(width: 6),
              Text('Live', style: TextStyle(fontSize: 11, color: text3)),
              const Spacer(),
              if (_lastUpdated != null)
                Text(
                  'Updated ${DateFormat.jms().format(_lastUpdated!)}',
                  style: TextStyle(fontSize: 11, color: text3),
                ),
              const SizedBox(width: 6),
              InkWell(
                onTap: _fetch,
                borderRadius: BorderRadius.circular(8),
                child: Padding(
                  padding: const EdgeInsets.all(4),
                  child: Icon(Icons.refresh_rounded,
                      size: 14, color: text3),
                ),
              ),
            ],
          ),
        ),
        // Search
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 0, 20, 10),
          child: TextField(
            onChanged: (v) => setState(() => _search = v),
            decoration: InputDecoration(
              hintText: 'Search articles...',
              hintStyle: TextStyle(color: text3, fontSize: 13),
              prefixIcon: Icon(Icons.search_rounded, size: 16, color: text3),
              filled: true,
              fillColor: card,
              contentPadding: const EdgeInsets.symmetric(vertical: 10),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide: BorderSide(color: border),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide: BorderSide(color: border),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide: const BorderSide(
                    color: AppColors.blue, width: 1.5),
              ),
            ),
            style: const TextStyle(fontSize: 13),
          ),
        ),
        // Category chips
        SizedBox(
          height: 34,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 20),
            itemCount: _categories.length,
            separatorBuilder: (_, _) => const SizedBox(width: 6),
            itemBuilder: (context, i) {
              final cat = _categories[i];
              final active = _category == cat;
              return GestureDetector(
                onTap: () => setState(() => _category = cat),
                child: Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 14, vertical: 6),
                  decoration: BoxDecoration(
                    color: active ? AppColors.navy : card,
                    borderRadius: BorderRadius.circular(99),
                    border: Border.all(
                        color: active ? AppColors.navy : border),
                  ),
                  child: Text(
                    cat,
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
        if (_error != null)
          Container(
            margin: const EdgeInsets.fromLTRB(20, 0, 20, 10),
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFFFFF7ED),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Text(
              _error!,
              style: const TextStyle(
                fontSize: 11,
                color: Color(0xFFD97706),
              ),
            ),
          ),
        // Content
        if (_loading && _articles == null)
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 48),
            child: Center(
              child: Column(
                children: [
                  const CircularProgressIndicator(strokeWidth: 2),
                  const SizedBox(height: 12),
                  Text('Loading news...',
                      style: TextStyle(fontSize: 12, color: text3)),
                ],
              ),
            ),
          )
        else if (_filtered.isEmpty)
          _EmptyState(hint: _search.isNotEmpty)
        else
          for (final article in _filtered) ...[
            if (_selected?.id == article.id)
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 8),
                child: _ArticleModal(
                  article: article,
                  onClose: () => setState(() => _selected = null),
                  relativeTime: _relative(article.publishedAt),
                  fullTime: DateFormat('EEEE, MMMM d, yyyy  h:mm a')
                      .format(article.publishedAt),
                ),
              )
            else
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 8),
                child: _ArticleCard(
                  article: article,
                  onTap: () => setState(() => _selected = article),
                  relativeTime: _relative(article.publishedAt),
                  card: card,
                  border: border,
                  text1: text1,
                  text3: text3,
                ),
              ),
          ],
      ],
    );
  }
}

/* ───── Live pulse dot ───── */

class _LivePulse extends StatefulWidget {
  const _LivePulse();
  @override
  State<_LivePulse> createState() => _LivePulseState();
}

class _LivePulseState extends State<_LivePulse>
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

/* ───── Empty state ───── */

class _EmptyState extends StatelessWidget {
  const _EmptyState({required this.hint});
  final bool hint;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 48),
      child: Center(
        child: Column(
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: AppColors.bg,
                borderRadius: BorderRadius.circular(14),
              ),
              alignment: Alignment.center,
              child: const Icon(Icons.newspaper_rounded,
                  color: AppColors.text3, size: 20),
            ),
            const SizedBox(height: 12),
            Text('No articles found',
                style: AppTheme.heading(size: 14, color: AppColors.navy)),
            const SizedBox(height: 4),
            Text(
              hint
                  ? 'Try a different search term.'
                  : 'No news available for this category.',
              style:
                  const TextStyle(fontSize: 11, color: AppColors.text3),
            ),
          ],
        ),
      ),
    );
  }
}

/* ───── Article card ───── */

class _ArticleCard extends StatelessWidget {
  const _ArticleCard({
    required this.article,
    required this.onTap,
    required this.relativeTime,
    required this.card,
    required this.border,
    required this.text1,
    required this.text3,
  });

  final _Article article;
  final VoidCallback onTap;
  final String relativeTime;
  final Color card;
  final Color border;
  final Color text1;
  final Color text3;

  @override
  Widget build(BuildContext context) {
    final colors = _categoryColors[article.category.toLowerCase()] ??
        _categoryColors['all']!;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Container(
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
                    padding: const EdgeInsets.symmetric(
                        horizontal: 10, vertical: 3),
                    decoration: BoxDecoration(
                      color: colors.$1,
                      borderRadius: BorderRadius.circular(99),
                    ),
                    child: Text(
                      article.category,
                      style: TextStyle(
                        color: colors.$2,
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                  const Spacer(),
                  Text(relativeTime,
                      style: TextStyle(fontSize: 10, color: text3)),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                article.title,
                style: AppTheme.heading(
                    size: 13, color: text1, letterSpacing: 0),
              ),
              const SizedBox(height: 4),
              Text(
                article.snippet,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(fontSize: 11, color: text3, height: 1.5),
              ),
              const SizedBox(height: 10),
              Divider(height: 1, color: border),
              const SizedBox(height: 8),
              Row(
                children: [
                  Text(article.source,
                      style: TextStyle(fontSize: 11, color: text3)),
                  const Spacer(),
                  Text(
                    'Read more',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: AppColors.blue,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/* ───── Inline article "modal" (in-place expansion) ───── */

class _ArticleModal extends StatelessWidget {
  const _ArticleModal({
    required this.article,
    required this.onClose,
    required this.relativeTime,
    required this.fullTime,
  });

  final _Article article;
  final VoidCallback onClose;
  final String relativeTime;
  final String fullTime;

  @override
  Widget build(BuildContext context) {
    final dark = Theme.of(context).brightness == Brightness.dark;
    final card = dark ? AppColors.darkCard : Colors.white;
    final border = dark ? AppColors.darkBorder : AppColors.border;

    final paragraphs =
        article.body.split(RegExp(r'\n\n|\n')).where((p) => p.trim().isNotEmpty);

    return ClipRRect(
      borderRadius: BorderRadius.circular(20),
      child: Container(
        decoration: BoxDecoration(
          color: card,
          border: Border.all(color: border),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Navy header bar
            Container(
              color: AppColors.navy,
              padding: const EdgeInsets.symmetric(
                  horizontal: 16, vertical: 10),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      article.category.toUpperCase(),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 9,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 0.8,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    relativeTime,
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.4),
                      fontSize: 10,
                    ),
                  ),
                  const Spacer(),
                  InkWell(
                    onTap: onClose,
                    borderRadius: BorderRadius.circular(8),
                    child: Padding(
                      padding: const EdgeInsets.all(4),
                      child: Icon(Icons.close_rounded,
                          color: Colors.white.withValues(alpha: 0.6),
                          size: 14),
                    ),
                  ),
                ],
              ),
            ),
            Padding(
              padding:
                  const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    article.title,
                    style: AppTheme.heading(
                        size: 14, color: AppColors.navy, letterSpacing: 0),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Icon(Icons.newspaper_rounded,
                          size: 10, color: AppColors.text3),
                      const SizedBox(width: 4),
                      Text(article.source,
                          style: const TextStyle(
                              fontSize: 10, color: AppColors.text3)),
                      const SizedBox(width: 8),
                      const Text('|',
                          style: TextStyle(
                              fontSize: 10, color: AppColors.text3)),
                      const SizedBox(width: 8),
                      Icon(Icons.access_time_rounded,
                          size: 10, color: AppColors.text3),
                      const SizedBox(width: 4),
                      Flexible(
                        child: Text(
                          fullTime,
                          style: const TextStyle(
                              fontSize: 10, color: AppColors.text3),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  for (final p in paragraphs) ...[
                    Text(
                      p.trim(),
                      style: const TextStyle(
                        fontSize: 11,
                        color: AppColors.text2,
                        height: 1.6,
                      ),
                    ),
                    const SizedBox(height: 8),
                  ],
                  if (article.url != null) ...[
                    const SizedBox(height: 6),
                    Container(
                      width: double.infinity,
                      padding:
                          const EdgeInsets.symmetric(vertical: 10),
                      decoration: BoxDecoration(
                        color: AppColors.blueLight,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.open_in_new_rounded,
                              size: 12, color: AppColors.blue),
                          SizedBox(width: 6),
                          Text(
                            'Read Full Article',
                            style: TextStyle(
                              color: AppColors.blue,
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
