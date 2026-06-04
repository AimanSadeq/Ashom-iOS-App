import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../services/companies_service.dart';
import '../services/gamification_service.dart';
import '../theme/app_colors.dart';
import '../theme/app_theme.dart';

class ScreenerScreen extends StatefulWidget {
  const ScreenerScreen({super.key});

  @override
  State<ScreenerScreen> createState() => _ScreenerScreenState();
}

class _ScreenerScreenState extends State<ScreenerScreen> {
  final _search = TextEditingController();
  String _country = 'all';
  String _sortBy = 'name';
  bool _asc = true;
  bool _showFilters = true;
  bool _ran = false;
  final Set<String> _sectors = {};
  RangeValues _peRange = const RangeValues(0, 40);
  RangeValues _yieldRange = const RangeValues(0, 12);

  static const _countries = [
    ('all', 'All'),
    ('SA', '🇸🇦 Saudi'),
    ('AE', '🇦🇪 UAE'),
    ('KW', '🇰🇼 Kuwait'),
    ('QA', '🇶🇦 Qatar'),
    ('BH', '🇧🇭 Bahrain'),
    ('OM', '🇴🇲 Oman'),
  ];

  static const _sortOptions = [
    ('name', 'Name'),
    ('price', 'Price'),
    ('change', 'Change %'),
    ('pe', 'P/E'),
    ('yield', 'Dividend Yield'),
  ];

  static const _allSectors = [
    'Energy', 'Banking', 'Materials', 'Real Estate',
    'Telecom', 'Utilities', 'Healthcare', 'Consumer',
  ];

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  List<Company> get _results {
    var list = CompaniesService.catalog.where((c) {
      if (_country != 'all' && c.country != _country) return false;
      if (_sectors.isNotEmpty && !_sectors.contains(c.sector)) return false;
      if (c.financials.peRatio < _peRange.start ||
          c.financials.peRatio > _peRange.end) {
        return false;
      }
      if (c.financials.dividendYield < _yieldRange.start ||
          c.financials.dividendYield > _yieldRange.end) {
        return false;
      }
      if (_search.text.isNotEmpty) {
        final q = _search.text.toLowerCase();
        if (!c.name.toLowerCase().contains(q) &&
            !c.ticker.toLowerCase().contains(q)) {
          return false;
        }
      }
      return true;
    }).toList();

    int cmp(Company a, Company b) {
      final v = switch (_sortBy) {
        'price' => a.price.compareTo(b.price),
        'change' => a.change.compareTo(b.change),
        'pe' => a.financials.peRatio.compareTo(b.financials.peRatio),
        'yield' =>
            a.financials.dividendYield.compareTo(b.financials.dividendYield),
        _ => a.name.compareTo(b.name),
      };
      return _asc ? v : -v;
    }

    list.sort(cmp);
    return list;
  }

  void _run() {
    context.read<GamificationService>().track('screener-run');
    setState(() {
      _ran = true;
      _showFilters = false;
    });
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

    final results = _results;

    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 18, 20, 28),
      children: [
        Text('Screener', style: AppTheme.heading(size: 24, color: text1)),
        const SizedBox(height: 4),
        Text('Filter 820+ GCC companies',
            style: TextStyle(fontSize: 12, color: text3)),
        const SizedBox(height: 14),

        // Search
        TextField(
          controller: _search,
          onChanged: (_) => setState(() {}),
          decoration: InputDecoration(
            isDense: true,
            prefixIcon: Icon(Icons.search_rounded, size: 18, color: text3),
            hintText: 'Search by name or ticker…',
            border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: border)),
            enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: border)),
          ),
        ),
        const SizedBox(height: 12),

        // Country chips
        SizedBox(
          height: 36,
          child: ListView(
            scrollDirection: Axis.horizontal,
            children: [
              for (final c in _countries)
                GestureDetector(
                  onTap: () => setState(() => _country = c.$1),
                  child: Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                    margin: const EdgeInsets.only(right: 6),
                    decoration: BoxDecoration(
                      color: _country == c.$1 ? AppColors.navy : card,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                          color:
                              _country == c.$1 ? AppColors.navy : border),
                    ),
                    child: Text(c.$2,
                        style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: _country == c.$1 ? Colors.white : text2)),
                  ),
                ),
            ],
          ),
        ),
        const SizedBox(height: 12),

        // Sort + filter toggle
        Row(
          children: [
            Expanded(
              child: Container(
                height: 40,
                padding: const EdgeInsets.symmetric(horizontal: 10),
                decoration: BoxDecoration(
                  color: card,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: border),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: _sortBy,
                    isExpanded: true,
                    icon: Icon(Icons.expand_more_rounded, size: 18, color: text3),
                    onChanged: (v) {
                      if (v != null) setState(() => _sortBy = v);
                    },
                    items: _sortOptions
                        .map((o) => DropdownMenuItem<String>(
                              value: o.$1,
                              child: Text('Sort: ${o.$2}',
                                  style: TextStyle(fontSize: 12, color: text1)),
                            ))
                        .toList(),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 8),
            IconButton(
              icon: Icon(
                  _asc
                      ? Icons.arrow_upward_rounded
                      : Icons.arrow_downward_rounded,
                  size: 18,
                  color: text1),
              style: IconButton.styleFrom(
                backgroundColor: card,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                    side: BorderSide(color: border)),
              ),
              onPressed: () => setState(() => _asc = !_asc),
            ),
            const SizedBox(width: 8),
            IconButton(
              icon: Icon(Icons.tune_rounded, size: 18, color: text1),
              style: IconButton.styleFrom(
                backgroundColor: _showFilters ? AppColors.navy : card,
                foregroundColor: _showFilters ? Colors.white : text1,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                    side: BorderSide(color: border)),
              ),
              onPressed: () =>
                  setState(() => _showFilters = !_showFilters),
            ),
          ],
        ),

        if (_showFilters) ...[
          const SizedBox(height: 18),
          Text('Sectors', style: AppTheme.label(color: text3)),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              for (final s in _allSectors)
                FilterChip(
                  label: Text(s),
                  selected: _sectors.contains(s),
                  onSelected: (v) => setState(() {
                    if (v) {
                      _sectors.add(s);
                    } else {
                      _sectors.remove(s);
                    }
                  }),
                  labelStyle: TextStyle(
                    fontSize: 12,
                    color: _sectors.contains(s) ? Colors.white : text1,
                  ),
                  selectedColor: AppColors.navy,
                  backgroundColor: card,
                  side: BorderSide(color: border),
                  showCheckmark: false,
                ),
            ],
          ),
          const SizedBox(height: 14),
          _rangeCard('P/E Ratio', _peRange, 0, 60, card, border, text1, text3,
              (v) => setState(() => _peRange = v)),
          const SizedBox(height: 10),
          _rangeCard('Dividend Yield (%)', _yieldRange, 0, 15, card, border,
              text1, text3, (v) => setState(() => _yieldRange = v)),
          const SizedBox(height: 14),
          SizedBox(
            width: double.infinity,
            height: 46,
            child: ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.navy,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
              ),
              onPressed: _run,
              icon: const Icon(Icons.search_rounded, size: 16),
              label: const Text('Run Screen'),
            ),
          ),
        ],

        const SizedBox(height: 18),
        Row(
          children: [
            Text(
                _ran
                    ? '${results.length} results'
                    : 'Showing ${results.length} of ${CompaniesService.catalog.length}',
                style: TextStyle(
                    fontSize: 12, color: text3, fontWeight: FontWeight.w600)),
            const Spacer(),
            if (_country != 'all' || _sectors.isNotEmpty || _search.text.isNotEmpty)
              GestureDetector(
                onTap: () => setState(() {
                  _country = 'all';
                  _sectors.clear();
                  _search.clear();
                  _peRange = const RangeValues(0, 40);
                  _yieldRange = const RangeValues(0, 12);
                }),
                child: Row(
                  children: [
                    Icon(Icons.clear_rounded, size: 14, color: AppColors.blue),
                    const SizedBox(width: 4),
                    Text('Clear filters',
                        style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: AppColors.blue)),
                  ],
                ),
              ),
          ],
        ),
        const SizedBox(height: 10),
        if (results.isEmpty)
          Container(
            padding: const EdgeInsets.all(28),
            decoration: BoxDecoration(
              color: card,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: border),
            ),
            alignment: Alignment.center,
            child: Column(
              children: [
                Icon(Icons.filter_alt_off_rounded, size: 30, color: text3),
                const SizedBox(height: 8),
                Text('No companies match these filters',
                    style: TextStyle(fontSize: 12, color: text2)),
              ],
            ),
          )
        else
          for (final c in results) ...[
            GestureDetector(
              onTap: () => context.push('/companies/${c.ticker}'),
              child: Container(
                padding: const EdgeInsets.all(14),
                margin: const EdgeInsets.only(bottom: 8),
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
                        color: bg,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      alignment: Alignment.center,
                      child: Text(_flag(c.country),
                          style: const TextStyle(fontSize: 20)),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(c.name,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w700,
                                  color: text1)),
                          const SizedBox(height: 2),
                          Row(
                            children: [
                              Text(c.ticker,
                                  style: TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w600,
                                      color: text3)),
                              const SizedBox(width: 6),
                              Container(
                                width: 3,
                                height: 3,
                                decoration: BoxDecoration(
                                  color: text3,
                                  shape: BoxShape.circle,
                                ),
                              ),
                              const SizedBox(width: 6),
                              Text(c.sector,
                                  style:
                                      TextStyle(fontSize: 11, color: text3)),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              _miniStat('P/E ${c.financials.peRatio.toStringAsFixed(1)}', text3),
                              const SizedBox(width: 8),
                              _miniStat(
                                  'Yield ${c.financials.dividendYield.toStringAsFixed(1)}%',
                                  text3),
                            ],
                          ),
                        ],
                      ),
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(c.price < 1
                            ? c.price.toStringAsFixed(3)
                            : c.price.toStringAsFixed(2),
                            style:
                                AppTheme.heading(size: 14, color: text1)),
                        const SizedBox(height: 2),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: (c.change >= 0
                                    ? AppColors.green
                                    : AppColors.red)
                                .withValues(alpha: 0.14),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                              '${c.change >= 0 ? '+' : ''}${c.change.toStringAsFixed(2)}%',
                              style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w800,
                                  color: c.change >= 0
                                      ? AppColors.green
                                      : AppColors.red)),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
      ],
    );
  }

  Widget _miniStat(String text, Color color) {
    return Text(text,
        style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: color));
  }

  String _flag(String code) {
    return switch (code) {
      'SA' => '🇸🇦',
      'AE' => '🇦🇪',
      'KW' => '🇰🇼',
      'QA' => '🇶🇦',
      'BH' => '🇧🇭',
      'OM' => '🇴🇲',
      _ => '🌐',
    };
  }

  Widget _rangeCard(
    String label,
    RangeValues values,
    double min,
    double max,
    Color card,
    Color border,
    Color text1,
    Color text3,
    ValueChanged<RangeValues> onChanged,
  ) {
    return Container(
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
              Text(label,
                  style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: text1)),
              const Spacer(),
              Text(
                '${values.start.toStringAsFixed(1)} – ${values.end.toStringAsFixed(1)}',
                style: TextStyle(fontSize: 12, color: text3),
              ),
            ],
          ),
          RangeSlider(
            values: values,
            min: min,
            max: max,
            onChanged: onChanged,
            activeColor: AppColors.blue,
          ),
        ],
      ),
    );
  }
}
