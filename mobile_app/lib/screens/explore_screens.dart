// ignore_for_file: prefer_const_constructors, prefer_const_literals_to_create_immutables
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

import '../services/companies_service.dart';
import '../services/watchlist_service.dart';
import '../theme/app_colors.dart';
import '../theme/app_theme.dart';

// ---------- shared helpers ----------
class _P {
  final Color bg, card, border, t1, t2, t3;
  const _P(this.bg, this.card, this.border, this.t1, this.t2, this.t3);
  factory _P.of(BuildContext c) {
    final d = Theme.of(c).brightness == Brightness.dark;
    return _P(
      d ? AppColors.darkBg : AppColors.bg,
      d ? AppColors.darkCard : Colors.white,
      d ? AppColors.darkBorder : AppColors.border,
      d ? AppColors.darkText1 : AppColors.text1,
      d ? AppColors.darkText2 : AppColors.text2,
      d ? AppColors.darkText3 : AppColors.text3,
    );
  }
}

Widget _sectionTitle(String s, _P p) => Padding(
      padding: EdgeInsets.fromLTRB(4, 0, 4, 8),
      child: Text(s.toUpperCase(),
          style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              letterSpacing: 1.2,
              color: p.t3)),
    );

Widget _headerBar(BuildContext c, String title, String subtitle) {
  final p = _P.of(c);
  return Padding(
    padding: EdgeInsets.fromLTRB(20, 14, 20, 14),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: AppTheme.heading(size: 22, color: p.t1)),
        SizedBox(height: 2),
        Text(subtitle, style: TextStyle(fontSize: 12, color: p.t3)),
      ],
    ),
  );
}

Widget _card(BuildContext c, {required Widget child, EdgeInsets? padding}) {
  final p = _P.of(c);
  return Container(
    padding: padding ?? EdgeInsets.all(14),
    decoration: BoxDecoration(
      color: p.card,
      borderRadius: BorderRadius.circular(14),
      border: Border.all(color: p.border),
    ),
    child: child,
  );
}

Widget _emptyState(BuildContext c, IconData icon, String title, String hint,
    {Color? color}) {
  final p = _P.of(c);
  return Center(
    child: Padding(
      padding: EdgeInsets.all(28),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              color: (color ?? AppColors.icBlueFg).withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(16),
            ),
            alignment: Alignment.center,
            child: Icon(icon, size: 28, color: color ?? AppColors.icBlueFg),
          ),
          SizedBox(height: 14),
          Text(title,
              textAlign: TextAlign.center,
              style: AppTheme.heading(size: 17, color: p.t1)),
          SizedBox(height: 4),
          Text(hint,
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 12, color: p.t3, height: 1.5)),
        ],
      ),
    ),
  );
}

void _snack(BuildContext c, String msg) {
  ScaffoldMessenger.of(c)
    ..hideCurrentSnackBar()
    ..showSnackBar(SnackBar(
      content: Text(msg),
      duration: Duration(seconds: 2),
      behavior: SnackBarBehavior.floating,
    ));
}

// =====================================================================
// 1. CMA — Capital Market Authorities
// =====================================================================
class CMAScreen extends StatelessWidget {
  const CMAScreen({super.key});

  static const _authorities = <_Authority>[
    _Authority('SA', '🇸🇦', 'CMA', 'Capital Market Authority', 'Saudi Arabia',
        'https://cma.org.sa',
        'Regulates and develops the Saudi Arabian capital market, overseeing the Tadawul stock exchange.'),
    _Authority('AE', '🇦🇪', 'SCA', 'Securities & Commodities Authority', 'UAE',
        'https://www.sca.gov.ae',
        'Regulates securities and commodities markets in the UAE, including DFM and ADX exchanges.'),
    _Authority('KW', '🇰🇼', 'CMA', 'Capital Markets Authority', 'Kuwait',
        'https://www.cma.gov.kw',
        'Oversees the Boursa Kuwait stock exchange and regulates securities activities in Kuwait.'),
    _Authority('QA', '🇶🇦', 'QFMA', 'Qatar Financial Markets Authority', 'Qatar',
        'https://www.qfma.org.qa',
        'Regulates and supervises the Qatar Stock Exchange and financial markets in Qatar.'),
    _Authority('BH', '🇧🇭', 'CBB', 'Central Bank of Bahrain', 'Bahrain',
        'https://www.cbb.gov.bh',
        'Regulates the Bahrain Bourse and all financial institutions in the Kingdom of Bahrain.'),
    _Authority('OM', '🇴🇲', 'CMA', 'Capital Market Authority', 'Oman',
        'https://www.cma.gov.om',
        'Regulates the Muscat Securities Market and capital market activities in Oman.'),
  ];

  @override
  Widget build(BuildContext context) {
    final p = _P.of(context);
    return ListView(
      padding: EdgeInsets.fromLTRB(16, 16, 16, 28),
      children: [
        _headerBar(context, 'Capital Market Authorities', 'GCC Regulatory Bodies'),
        Container(
          padding: EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: AppColors.blueLight,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.blueMid),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: Color(0x265391D5),
                  borderRadius: BorderRadius.circular(10),
                ),
                alignment: Alignment.center,
                child: Icon(Icons.account_balance_rounded,
                    size: 16, color: AppColors.blue),
              ),
              SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('6 GCC Regulators',
                        style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: AppColors.navy)),
                    SizedBox(height: 4),
                    Text(
                        'Each GCC country has a dedicated authority overseeing its capital markets, exchanges, and securities activities.',
                        style: TextStyle(
                            fontSize: 11, color: AppColors.text2, height: 1.5)),
                  ],
                ),
              ),
            ],
          ),
        ),
        SizedBox(height: 14),
        for (final a in _authorities) ...[
          _card(
            context,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(a.flag, style: TextStyle(fontSize: 26)),
                    SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(a.abbr,
                                  style: AppTheme.heading(
                                      size: 14, color: p.t1)),
                              SizedBox(width: 8),
                              Container(
                                padding: EdgeInsets.symmetric(
                                    horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(
                                  color: AppColors.blueLight,
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text(a.code,
                                    style: TextStyle(
                                        fontSize: 10,
                                        fontWeight: FontWeight.w700,
                                        color: AppColors.blue)),
                              ),
                            ],
                          ),
                          SizedBox(height: 2),
                          Text(a.name,
                              style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                  color: p.t2)),
                          SizedBox(height: 1),
                          Text(a.country,
                              style: TextStyle(fontSize: 11, color: p.t3)),
                        ],
                      ),
                    ),
                  ],
                ),
                SizedBox(height: 10),
                Text(a.description,
                    style: TextStyle(
                        fontSize: 11, color: p.t3, height: 1.55)),
                SizedBox(height: 8),
                InkWell(
                  onTap: () => launchUrl(Uri.parse(a.website),
                      mode: LaunchMode.externalApplication),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.open_in_new_rounded,
                          size: 11, color: AppColors.blue),
                      SizedBox(width: 4),
                      Text('Visit Website',
                          style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              color: AppColors.blue)),
                    ],
                  ),
                ),
              ],
            ),
          ),
          SizedBox(height: 10),
        ],
      ],
    );
  }
}

class _Authority {
  final String code, flag, abbr, name, country, website, description;
  const _Authority(this.code, this.flag, this.abbr, this.name, this.country,
      this.website, this.description);
}

// =====================================================================
// 2. Central Bank Rates
// =====================================================================
class CentralBankRatesScreen extends StatelessWidget {
  const CentralBankRatesScreen({super.key});

  static const _banks = <_Bank>[
    _Bank('Saudi Arabia', '🇸🇦', 'SAMA', 5.50, 5.50, '2025-09-18'),
    _Bank('UAE', '🇦🇪', 'CBUAE', 5.40, 5.40, '2025-09-18'),
    _Bank('Qatar', '🇶🇦', 'QCB', 5.50, 5.50, '2025-09-18'),
    _Bank('Kuwait', '🇰🇼', 'CBK', 4.25, 4.00, '2025-12-11'),
    _Bank('Bahrain', '🇧🇭', 'CBB', 5.50, 5.50, '2025-09-18'),
    _Bank('Oman', '🇴🇲', 'CBO', 5.50, 5.50, '2025-09-18'),
  ];

  @override
  Widget build(BuildContext context) {
    final p = _P.of(context);
    final avg = _banks.map((b) => b.rate).reduce((a, b) => a + b) / _banks.length;
    return ListView(
      padding: EdgeInsets.fromLTRB(16, 16, 16, 28),
      children: [
        _headerBar(context, 'Central Bank Rates', 'GCC Monetary Policy'),
        Container(
          padding: EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.navy,
            borderRadius: BorderRadius.circular(14),
          ),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('AVERAGE GCC RATE',
                        style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 1.2,
                            color: Colors.white70)),
                    SizedBox(height: 4),
                    Text('${avg.toStringAsFixed(2)}%',
                        style: AppTheme.heading(size: 28, color: Colors.white)),
                  ],
                ),
              ),
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: Colors.white24,
                  borderRadius: BorderRadius.circular(12),
                ),
                alignment: Alignment.center,
                child: Text('%',
                    style: TextStyle(color: Colors.white, fontSize: 22)),
              ),
            ],
          ),
        ),
        SizedBox(height: 18),
        _sectionTitle('Rate by Country', p),
        for (final b in _banks) ...[
          _card(
            context,
            child: Row(
              children: [
                Text(b.flag, style: TextStyle(fontSize: 24)),
                SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(b.country,
                          style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: p.t1)),
                      SizedBox(height: 2),
                      Text('${b.bank} · Updated ${b.changeDate}',
                          style: TextStyle(fontSize: 11, color: p.t3)),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text('${b.rate.toStringAsFixed(2)}%',
                        style: AppTheme.heading(size: 18, color: p.t1)),
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                            b.rate > b.prevRate
                                ? Icons.arrow_upward_rounded
                                : b.rate < b.prevRate
                                    ? Icons.arrow_downward_rounded
                                    : Icons.remove,
                            size: 11,
                            color: b.rate > b.prevRate
                                ? AppColors.red
                                : b.rate < b.prevRate
                                    ? AppColors.green
                                    : p.t3),
                        SizedBox(width: 2),
                        Text(
                            b.rate == b.prevRate
                                ? 'Unchanged'
                                : '${(b.rate - b.prevRate).abs().toStringAsFixed(2)}%',
                            style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w600,
                                color: b.rate > b.prevRate
                                    ? AppColors.red
                                    : b.rate < b.prevRate
                                        ? AppColors.green
                                        : p.t3)),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),
          SizedBox(height: 10),
        ],
      ],
    );
  }
}

class _Bank {
  final String country, flag, bank, changeDate;
  final double rate, prevRate;
  const _Bank(this.country, this.flag, this.bank, this.rate, this.prevRate,
      this.changeDate);
}

// =====================================================================
// 3. Currency Converter
// =====================================================================
class CurrencyConverterScreen extends StatefulWidget {
  const CurrencyConverterScreen({super.key});
  @override
  State<CurrencyConverterScreen> createState() =>
      _CurrencyConverterScreenState();
}

class _CurrencyConverterScreenState extends State<CurrencyConverterScreen> {
  static const _currencies = <_Currency>[
    _Currency('USD', 'US Dollar', 1.0),
    _Currency('SAR', 'Saudi Riyal', 3.7500),
    _Currency('AED', 'UAE Dirham', 3.6725),
    _Currency('KWD', 'Kuwaiti Dinar', 0.3078),
    _Currency('QAR', 'Qatari Riyal', 3.6400),
    _Currency('BHD', 'Bahraini Dinar', 0.3760),
    _Currency('OMR', 'Omani Rial', 0.3845),
    _Currency('EUR', 'Euro', 0.9230),
    _Currency('GBP', 'British Pound', 0.7920),
  ];

  final _amount = TextEditingController(text: '1000');
  String _from = 'SAR';
  String _to = 'AED';

  double _convert(double amount, String from, String to) {
    final f = _currencies.firstWhere((c) => c.code == from);
    final t = _currencies.firstWhere((c) => c.code == to);
    return amount / f.rate * t.rate;
  }

  @override
  void dispose() {
    _amount.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final p = _P.of(context);
    final amt = double.tryParse(_amount.text) ?? 0;
    final result = _convert(amt, _from, _to);
    final rate = _convert(1, _from, _to);
    return ListView(
      padding: EdgeInsets.fromLTRB(16, 16, 16, 28),
      children: [
        _headerBar(context, 'Currency Converter', 'GCC Cross Rates'),
        _card(
          context,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _sectionTitle('From', p),
              Row(
                children: [
                  Expanded(child: _ccyPicker(_from, (v) => setState(() => _from = v))),
                  SizedBox(width: 8),
                  SizedBox(
                    width: 130,
                    child: TextField(
                      controller: _amount,
                      keyboardType: TextInputType.numberWithOptions(decimal: true),
                      onChanged: (_) => setState(() {}),
                      decoration: InputDecoration(
                        isDense: true,
                        contentPadding:
                            EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                        border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(10),
                            borderSide: BorderSide(color: p.border)),
                      ),
                    ),
                  ),
                ],
              ),
              SizedBox(height: 12),
              Center(
                child: IconButton(
                  onPressed: () => setState(() {
                    final t = _from;
                    _from = _to;
                    _to = t;
                  }),
                  icon: Icon(Icons.swap_vert_rounded,
                      color: AppColors.blue, size: 22),
                ),
              ),
              _sectionTitle('To', p),
              Row(
                children: [
                  Expanded(child: _ccyPicker(_to, (v) => setState(() => _to = v))),
                  SizedBox(width: 8),
                  Container(
                    width: 130,
                    height: 42,
                    alignment: Alignment.centerRight,
                    padding: EdgeInsets.symmetric(horizontal: 10),
                    decoration: BoxDecoration(
                      color: p.bg,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: p.border),
                    ),
                    child: Text(result.toStringAsFixed(4),
                        style: AppTheme.heading(size: 16, color: p.t1)),
                  ),
                ],
              ),
              SizedBox(height: 10),
              Center(
                child: Text(
                    '1 $_from = ${rate.toStringAsFixed(4)} $_to',
                    style: TextStyle(fontSize: 11, color: p.t3)),
              ),
            ],
          ),
        ),
        SizedBox(height: 20),
        _sectionTitle('GCC Cross Rates', p),
        _card(
          context,
          padding: EdgeInsets.zero,
          child: Column(
            children: [
              for (final c in _currencies.where((c) =>
                  ['SAR', 'AED', 'KWD', 'QAR', 'BHD', 'OMR'].contains(c.code))) ...[
                Padding(
                  padding: EdgeInsets.symmetric(horizontal: 14, vertical: 12),
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
                        child: Text(c.code,
                            style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                                color: AppColors.blue)),
                      ),
                      SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(c.name,
                                style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                    color: p.t1)),
                            Text('1 USD = ${c.rate.toStringAsFixed(4)} ${c.code}',
                                style: TextStyle(fontSize: 11, color: p.t3)),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                if (c.code != 'OMR') Divider(height: 1, color: p.border),
              ],
            ],
          ),
        ),
      ],
    );
  }

  Widget _ccyPicker(String selected, ValueChanged<String> onChange) {
    final p = _P.of(context);
    return Container(
      height: 42,
      padding: EdgeInsets.symmetric(horizontal: 10),
      decoration: BoxDecoration(
        color: p.card,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: p.border),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: selected,
          isExpanded: true,
          icon: Icon(Icons.expand_more_rounded, size: 18, color: p.t3),
          onChanged: (v) {
            if (v != null) onChange(v);
          },
          items: _currencies
              .map((c) => DropdownMenuItem<String>(
                    value: c.code,
                    child: Text('${c.code} · ${c.name}',
                        style: TextStyle(fontSize: 13, color: p.t1)),
                  ))
              .toList(),
        ),
      ),
    );
  }
}

class _Currency {
  final String code, name;
  final double rate;
  const _Currency(this.code, this.name, this.rate);
}

// =====================================================================
// 4. Dividend Calendar
// =====================================================================
class DividendCalendarScreen extends StatelessWidget {
  const DividendCalendarScreen({super.key});

  static const _div = <_Div>[
    _Div('Saudi Aramco', '2222.SR', '🇸🇦', '2026-04-14', 0.3105, 'SAR', 4.2, '2026-05-05'),
    _Div('Al Rajhi Bank', '1120.SR', '🇸🇦', '2026-04-20', 4.00, 'SAR', 3.8, '2026-05-10'),
    _Div('Qatar National Bank', 'QNBK.QA', '🇶🇦', '2026-04-28', 1.00, 'QAR', 5.1, '2026-05-15'),
    _Div('Emirates NBD', 'ENBD.AE', '🇦🇪', '2026-05-05', 0.75, 'AED', 4.5, '2026-05-25'),
    _Div('Kuwait Finance House', 'KFH.KW', '🇰🇼', '2026-05-12', 0.025, 'KWD', 3.2, '2026-06-01'),
    _Div('National Bank of Kuwait', 'NBK.KW', '🇰🇼', '2026-05-18', 0.035, 'KWD', 4.8, '2026-06-08'),
    _Div('First Abu Dhabi Bank', 'FAB.AE', '🇦🇪', '2026-05-22', 0.52, 'AED', 3.9, '2026-06-12'),
    _Div('SABIC', '2010.SR', '🇸🇦', '2026-05-28', 3.00, 'SAR', 3.4, '2026-06-18'),
    _Div('Ooredoo', 'ORDS.QA', '🇶🇦', '2026-06-05', 0.40, 'QAR', 2.8, '2026-06-25'),
    _Div('Bank Muscat', 'BKMB.OM', '🇴🇲', '2026-06-10', 0.020, 'OMR', 5.5, '2026-06-30'),
    _Div('Ahli United Bank', 'AUB.BH', '🇧🇭', '2026-06-15', 0.015, 'BHD', 4.1, '2026-07-05'),
    _Div('Saudi Telecom', '7010.SR', '🇸🇦', '2026-06-20', 2.40, 'SAR', 3.6, '2026-07-10'),
  ];

  @override
  Widget build(BuildContext context) {
    final p = _P.of(context);
    return ListView(
      padding: EdgeInsets.fromLTRB(16, 16, 16, 28),
      children: [
        _headerBar(context, 'Dividend Calendar', 'Ex-dividend dates'),
        Container(
          padding: EdgeInsets.all(14),
          decoration: BoxDecoration(
            gradient: LinearGradient(
                colors: [AppColors.green, Color(0xFF1FBC7E)]),
            borderRadius: BorderRadius.circular(14),
          ),
          child: Row(
            children: [
              Icon(Icons.attach_money_rounded, color: Colors.white, size: 26),
              SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('${_div.length} upcoming dividends',
                        style: TextStyle(
                            color: Colors.white,
                            fontSize: 14,
                            fontWeight: FontWeight.w700)),
                    Text('Average yield: ${(_div.map((d) => d.yield).reduce((a, b) => a + b) / _div.length).toStringAsFixed(1)}%',
                        style: TextStyle(color: Colors.white70, fontSize: 11)),
                  ],
                ),
              ),
            ],
          ),
        ),
        SizedBox(height: 18),
        for (final d in _div) ...[
          _card(
            context,
            child: Row(
              children: [
                Container(
                  width: 48,
                  height: 56,
                  decoration: BoxDecoration(
                    color: AppColors.greenBg,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  alignment: Alignment.center,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(d.exDate.split('-').last,
                          style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w800,
                              color: AppColors.green)),
                      Text(_monthShort(d.exDate),
                          style: TextStyle(
                              fontSize: 9,
                              fontWeight: FontWeight.w700,
                              color: AppColors.green,
                              letterSpacing: 0.5)),
                    ],
                  ),
                ),
                SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(d.flag, style: TextStyle(fontSize: 14)),
                          SizedBox(width: 6),
                          Expanded(
                            child: Text(d.company,
                                style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w700,
                                    color: p.t1)),
                          ),
                        ],
                      ),
                      Text('${d.ticker} · Pay date ${d.payDate}',
                          style: TextStyle(fontSize: 11, color: p.t3)),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text('${d.amount.toStringAsFixed(d.amount < 1 ? 3 : 2)} ${d.currency}',
                        style: AppTheme.heading(size: 13, color: p.t1)),
                    Text('${d.yield.toStringAsFixed(1)}% yield',
                        style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: AppColors.green)),
                  ],
                ),
              ],
            ),
          ),
          SizedBox(height: 10),
        ],
      ],
    );
  }

  static String _monthShort(String date) {
    const m = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    final i = int.tryParse(date.split('-')[1]) ?? 1;
    return m[i - 1];
  }
}

class _Div {
  final String company, ticker, flag, exDate, currency, payDate;
  final double amount, yield;
  const _Div(this.company, this.ticker, this.flag, this.exDate, this.amount,
      this.currency, this.yield, this.payDate);
}

// =====================================================================
// 5. Earnings Calendar
// =====================================================================
class EarningsCalendarScreen extends StatelessWidget {
  const EarningsCalendarScreen({super.key});

  static const _earnings = <_Earning>[
    _Earning('Saudi Aramco', '2222.SR', '🇸🇦', '2026-04-15', 'Q1 2026', 2.85),
    _Earning('Al Rajhi Bank', '1120.SR', '🇸🇦', '2026-04-17', 'Q1 2026', 3.12),
    _Earning('Qatar National Bank', 'QNBK.QA', '🇶🇦', '2026-04-20', 'Q1 2026', 1.45),
    _Earning('Emaar Properties', 'EMAAR.AE', '🇦🇪', '2026-04-22', 'Q1 2026', 0.78),
    _Earning('National Bank of Kuwait', 'NBK.KW', '🇰🇼', '2026-04-24', 'Q1 2026', 0.62),
    _Earning('SABIC', '2010.SR', '🇸🇦', '2026-04-28', 'Q1 2026', 1.95),
    _Earning('Emirates NBD', 'ENBD.AE', '🇦🇪', '2026-05-02', 'Q1 2026', 1.33),
    _Earning('Kuwait Finance House', 'KFH.KW', '🇰🇼', '2026-05-05', 'Q1 2026', 0.89),
    _Earning('Ooredoo', 'ORDS.QA', '🇶🇦', '2026-05-08', 'Q1 2026', 0.55),
    _Earning('Bank Muscat', 'BKMB.OM', '🇴🇲', '2026-05-12', 'Q1 2026', 0.42),
    _Earning('Ahli United Bank', 'AUB.BH', '🇧🇭', '2026-05-15', 'Q1 2026', 0.35),
    _Earning('Saudi Telecom', '7010.SR', '🇸🇦', '2026-05-18', 'Q1 2026', 2.10),
    _Earning('First Abu Dhabi Bank', 'FAB.AE', '🇦🇪', '2026-05-22', 'Q1 2026', 1.75),
    _Earning('Industries Qatar', 'IQCD.QA', '🇶🇦', '2026-05-25', 'Q1 2026', 1.20),
    _Earning('Zain Group', 'ZAIN.KW', '🇰🇼', '2026-06-01', 'Q2 2026', 0.48),
    _Earning('Dubai Islamic Bank', 'DIB.AE', '🇦🇪', '2026-06-05', 'Q2 2026', 0.92),
    _Earning('Riyad Bank', '1010.SR', '🇸🇦', '2026-06-10', 'Q2 2026', 1.65),
    _Earning('Omantel', 'OTEL.OM', '🇴🇲', '2026-06-15', 'Q2 2026', 0.38),
  ];

  @override
  Widget build(BuildContext context) {
    final p = _P.of(context);
    return ListView(
      padding: EdgeInsets.fromLTRB(16, 16, 16, 28),
      children: [
        _headerBar(context, 'Earnings Calendar', 'Upcoming GCC earnings reports'),
        _card(
          context,
          child: Row(
            children: [
              Icon(Icons.event_note_rounded, color: AppColors.blue),
              SizedBox(width: 10),
              Expanded(
                child: Text('${_earnings.length} companies reporting next 90 days',
                    style: TextStyle(
                        fontSize: 12, color: p.t1, fontWeight: FontWeight.w600)),
              ),
            ],
          ),
        ),
        SizedBox(height: 18),
        for (final e in _earnings) ...[
          _card(
            context,
            child: Row(
              children: [
                Container(
                  width: 48,
                  height: 56,
                  decoration: BoxDecoration(
                    color: AppColors.blueLight,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  alignment: Alignment.center,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(e.date.split('-').last,
                          style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w800,
                              color: AppColors.blue)),
                      Text(DividendCalendarScreen._monthShort(e.date),
                          style: TextStyle(
                              fontSize: 9,
                              fontWeight: FontWeight.w700,
                              color: AppColors.blue,
                              letterSpacing: 0.5)),
                    ],
                  ),
                ),
                SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(e.flag, style: TextStyle(fontSize: 14)),
                          SizedBox(width: 6),
                          Expanded(
                            child: Text(e.company,
                                style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w700,
                                    color: p.t1)),
                          ),
                        ],
                      ),
                      Text('${e.ticker} · ${e.quarter}',
                          style: TextStyle(fontSize: 11, color: p.t3)),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text('EPS est.',
                        style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w600,
                            color: p.t3)),
                    Text('\$${e.expectedEPS.toStringAsFixed(2)}',
                        style: AppTheme.heading(size: 14, color: p.t1)),
                  ],
                ),
              ],
            ),
          ),
          SizedBox(height: 10),
        ],
      ],
    );
  }
}

class _Earning {
  final String company, ticker, flag, date, quarter;
  final double expectedEPS;
  const _Earning(this.company, this.ticker, this.flag, this.date, this.quarter,
      this.expectedEPS);
}

// =====================================================================
// 6. IPO Calendar
// =====================================================================
class IPOCalendarScreen extends StatefulWidget {
  const IPOCalendarScreen({super.key});
  @override
  State<IPOCalendarScreen> createState() => _IPOCalendarScreenState();
}

class _IPOCalendarScreenState extends State<IPOCalendarScreen> {
  String _filter = 'all';
  static const _ipos = <_IPO>[
    _IPO('Arabian Mills', 'Consumer Staples', 'TASI', '2026-04-25', 'SAR 62-68', 'open', '2.1B SAR'),
    _IPO('ADNOC Logistics', 'Energy', 'ADX', '2026-05-10', 'AED 3.80-4.20', 'upcoming', ''),
    _IPO('Lulu Retail', 'Consumer Disc.', 'ADX', '2026-04-08', 'AED 2.04', 'listed', '6.3B AED'),
    _IPO('Beyout Investment', 'Financials', 'Boursa', '2026-05-20', 'KWD 0.150-0.180', 'upcoming', ''),
    _IPO('Alef Education', 'Technology', 'ADX', '2026-04-12', 'AED 1.35', 'listed', '1.1B AED'),
    _IPO('SAL Saudi Logistics', 'Industrials', 'TASI', '2026-06-01', 'SAR 26-30', 'upcoming', ''),
    _IPO('Talabat Holdings', 'Technology', 'DFM', '2026-04-18', 'AED 1.60', 'listed', '2.0B AED'),
    _IPO('Oman Chlorine', 'Materials', 'MSM', '2026-05-28', 'OMR 0.320-0.360', 'upcoming', ''),
    _IPO('Qatar Solar', 'Utilities', 'QSE', '2026-06-15', 'QAR 8.50-9.20', 'upcoming', ''),
    _IPO('Bahrain Fintech', 'Financials', 'BAX', '2026-04-20', 'BHD 0.450-0.520', 'open', ''),
  ];

  @override
  Widget build(BuildContext context) {
    final p = _P.of(context);
    final filtered = _filter == 'all'
        ? _ipos
        : _ipos.where((i) => i.status == _filter).toList();
    return ListView(
      padding: EdgeInsets.fromLTRB(16, 16, 16, 28),
      children: [
        _headerBar(context, 'IPO Calendar', 'New GCC listings'),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              for (final f in ['all', 'upcoming', 'open', 'listed']) ...[
                GestureDetector(
                  onTap: () => setState(() => _filter = f),
                  child: Container(
                    padding: EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                    margin: EdgeInsets.only(right: 8),
                    decoration: BoxDecoration(
                      color: _filter == f ? AppColors.navy : p.card,
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(
                          color:
                              _filter == f ? AppColors.navy : p.border),
                    ),
                    child: Text(
                        f[0].toUpperCase() + f.substring(1),
                        style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color:
                                _filter == f ? Colors.white : p.t2)),
                  ),
                ),
              ],
            ],
          ),
        ),
        SizedBox(height: 14),
        for (final i in filtered) ...[
          _card(
            context,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      width: 38,
                      height: 38,
                      decoration: BoxDecoration(
                        color: _statusBg(i.status),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      alignment: Alignment.center,
                      child: Icon(Icons.business_rounded,
                          color: _statusFg(i.status), size: 18),
                    ),
                    SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(i.name,
                              style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w700,
                                  color: p.t1)),
                          SizedBox(height: 2),
                          Text('${i.sector} · ${i.exchange}',
                              style: TextStyle(
                                  fontSize: 11, color: p.t3)),
                        ],
                      ),
                    ),
                    Container(
                      padding: EdgeInsets.symmetric(
                          horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: _statusBg(i.status),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                          i.status[0].toUpperCase() + i.status.substring(1),
                          style: TextStyle(
                              fontSize: 9,
                              fontWeight: FontWeight.w800,
                              color: _statusFg(i.status))),
                    ),
                  ],
                ),
                SizedBox(height: 10),
                Container(
                  padding: EdgeInsets.symmetric(
                      horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: p.bg,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('LISTING DATE',
                                style: TextStyle(
                                    fontSize: 9,
                                    fontWeight: FontWeight.w700,
                                    letterSpacing: 1,
                                    color: p.t3)),
                            SizedBox(height: 2),
                            Text(i.date,
                                style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                    color: p.t1)),
                          ],
                        ),
                      ),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('PRICE',
                                style: TextStyle(
                                    fontSize: 9,
                                    fontWeight: FontWeight.w700,
                                    letterSpacing: 1,
                                    color: p.t3)),
                            SizedBox(height: 2),
                            Text(i.priceRange,
                                style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                    color: p.t1)),
                          ],
                        ),
                      ),
                      if (i.raised.isNotEmpty)
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('RAISED',
                                  style: TextStyle(
                                      fontSize: 9,
                                      fontWeight: FontWeight.w700,
                                      letterSpacing: 1,
                                      color: p.t3)),
                              SizedBox(height: 2),
                              Text(i.raised,
                                  style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w700,
                                      color: AppColors.green)),
                            ],
                          ),
                        ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          SizedBox(height: 10),
        ],
      ],
    );
  }

  Color _statusBg(String s) => s == 'open'
      ? AppColors.greenBg
      : s == 'listed'
          ? AppColors.icNavyBg
          : AppColors.blueLight;
  Color _statusFg(String s) => s == 'open'
      ? AppColors.green
      : s == 'listed'
          ? AppColors.navy
          : AppColors.blue;
}

class _IPO {
  final String name, sector, exchange, date, priceRange, status, raised;
  const _IPO(this.name, this.sector, this.exchange, this.date,
      this.priceRange, this.status, this.raised);
}

// =====================================================================
// 7. Watchlist
// =====================================================================
class WatchlistScreen extends StatefulWidget {
  const WatchlistScreen({super.key});
  @override
  State<WatchlistScreen> createState() => _WatchlistScreenState();
}

class _WatchlistScreenState extends State<WatchlistScreen> {
  String _tab = 'watchlist';

  @override
  Widget build(BuildContext context) {
    final p = _P.of(context);
    final ws = context.watch<WatchlistService>();
    final tickers = ws.tickers.toList();
    final companies = tickers
        .map((t) => CompaniesService.byTicker(t))
        .whereType<Company>()
        .toList();

    return ListView(
      padding: EdgeInsets.fromLTRB(16, 16, 16, 28),
      children: [
        _headerBar(context, 'Watchlist', 'Track favorite companies'),
        Row(
          children: [
            Expanded(child: _tabPill('watchlist', 'Watchlist', companies.length, p)),
            SizedBox(width: 8),
            Expanded(child: _tabPill('alerts', 'Price Alerts', 0, p)),
          ],
        ),
        SizedBox(height: 14),
        if (_tab == 'watchlist')
          ..._watchlistContent(context, companies, ws, p)
        else
          ..._alertsContent(context, p),
      ],
    );
  }

  Widget _tabPill(String id, String label, int count, _P p) {
    final active = _tab == id;
    return GestureDetector(
      onTap: () => setState(() => _tab = id),
      child: Container(
        padding: EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: active ? AppColors.navy : p.card,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: active ? AppColors.navy : p.border),
        ),
        alignment: Alignment.center,
        child: Text('$label ($count)',
            style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: active ? Colors.white : p.t2)),
      ),
    );
  }

  List<Widget> _watchlistContent(
      BuildContext context, List<Company> companies, WatchlistService ws, _P p) {
    if (companies.isEmpty) {
      return [
        Container(
          padding: EdgeInsets.all(32),
          decoration: BoxDecoration(
            color: p.card,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: p.border),
          ),
          child: Column(
            children: [
              Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  color: AppColors.icAmberBg,
                  borderRadius: BorderRadius.circular(14),
                ),
                alignment: Alignment.center,
                child: Icon(Icons.visibility_outlined,
                    color: AppColors.icAmberFg, size: 26),
              ),
              SizedBox(height: 14),
              Text('No companies watched',
                  style: AppTheme.heading(size: 16, color: p.t1)),
              SizedBox(height: 6),
              Text(
                  'Browse companies and tap the star icon to add them to your watchlist.',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 12, color: p.t3)),
              SizedBox(height: 16),
              SizedBox(
                height: 42,
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.navy,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)),
                  ),
                  onPressed: () => context.push('/companies'),
                  icon: Icon(Icons.business_rounded, size: 16),
                  label: Text('Browse companies'),
                ),
              ),
            ],
          ),
        ),
      ];
    }
    return [
      for (final c in companies) ...[
        InkWell(
          onTap: () => context.push('/companies/${c.ticker}'),
          borderRadius: BorderRadius.circular(14),
          child: _card(
            context,
            child: Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: p.bg,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  alignment: Alignment.center,
                  child: Text(_flag(c.country),
                      style: TextStyle(fontSize: 20)),
                ),
                SizedBox(width: 12),
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
                              color: p.t1)),
                      Text('${c.ticker} · ${c.sector}',
                          style: TextStyle(fontSize: 11, color: p.t3)),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                        c.price < 1
                            ? c.price.toStringAsFixed(3)
                            : c.price.toStringAsFixed(2),
                        style: AppTheme.heading(size: 13, color: p.t1)),
                    Text(
                        '${c.change >= 0 ? '+' : ''}${c.change.toStringAsFixed(2)}%',
                        style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w800,
                            color: c.change >= 0
                                ? AppColors.green
                                : AppColors.red)),
                  ],
                ),
                SizedBox(width: 4),
                IconButton(
                  icon: Icon(Icons.star_rounded,
                      size: 18, color: AppColors.icAmberFg),
                  onPressed: () => ws.toggle(c.ticker),
                ),
              ],
            ),
          ),
        ),
        SizedBox(height: 10),
      ],
    ];
  }

  List<Widget> _alertsContent(BuildContext context, _P p) {
    return [
      Container(
        padding: EdgeInsets.all(32),
        decoration: BoxDecoration(
          color: p.card,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: p.border),
        ),
        child: Column(
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: AppColors.icOrangeBg,
                borderRadius: BorderRadius.circular(14),
              ),
              alignment: Alignment.center,
              child: Icon(Icons.notifications_active_outlined,
                  color: AppColors.icOrangeFg, size: 26),
            ),
            SizedBox(height: 14),
            Text('No price alerts',
                style: AppTheme.heading(size: 16, color: p.t1)),
            SizedBox(height: 6),
            Text(
                'Set a target price to get notified when a stock crosses it.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 12, color: p.t3)),
            SizedBox(height: 16),
            SizedBox(
              height: 42,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.navy,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: () =>
                    _snack(context, 'Add Alert — coming soon'),
                icon: Icon(Icons.add_alert_rounded, size: 16),
                label: Text('Create alert'),
              ),
            ),
          ],
        ),
      ),
    ];
  }

  String _flag(String code) => switch (code) {
        'SA' => '🇸🇦',
        'AE' => '🇦🇪',
        'KW' => '🇰🇼',
        'QA' => '🇶🇦',
        'BH' => '🇧🇭',
        'OM' => '🇴🇲',
        _ => '🌐',
      };
}

// =====================================================================
// 8. Glossary
// =====================================================================
class GlossaryScreen extends StatefulWidget {
  const GlossaryScreen({super.key});
  @override
  State<GlossaryScreen> createState() => _GlossaryScreenState();
}

class _GlossaryScreenState extends State<GlossaryScreen> {
  String _q = '';
  String _cat = 'all';
  String? _expanded;
  final _search = TextEditingController();

  static const _categories = <(String, String)>[
    ('all', 'All'),
    ('basics', 'Basics'),
    ('ratios', 'Ratios'),
    ('risk', 'Risk'),
    ('markets', 'Markets'),
    ('gcc', 'GCC'),
  ];

  static const _terms = <_Term>[
    _Term('stock', 'Stock', 'basics', 'A share of ownership in a company',
        'When you buy a stock, you own a small piece of that company. If the company does well, your stock becomes more valuable.'),
    _Term('bond', 'Bond', 'basics', 'A loan to a company or government',
        'A bond is like an IOU. You lend money to an issuer, and they promise to pay you back with interest. Sukuk are Islamic bonds.'),
    _Term('dividend', 'Dividend', 'basics', 'Cash payment to shareholders',
        'Some companies share profits via dividends, usually paid quarterly. Many GCC banks are known for generous dividends.'),
    _Term('ipo', 'IPO', 'basics', 'Initial Public Offering — first stock sale',
        "An IPO is when a private company offers shares to the public for the first time. Saudi Aramco's 2019 IPO was the largest in history."),
    _Term('market-cap', 'Market Cap', 'basics', "Total value of a company's shares",
        'Market cap = share price × shares outstanding. Aramco is worth over \$2 trillion, making it one of the world\'s most valuable companies.'),
    _Term('portfolio', 'Portfolio', 'basics', 'Your collection of investments',
        'All the investments you own — stocks, bonds, cash, commodities. Diversification spreads risk.'),
    _Term('pe-ratio', 'P/E Ratio', 'ratios', 'Price-to-Earnings',
        'P/E = Stock Price ÷ EPS. Low P/E might mean undervalued. Compare within the same sector.'),
    _Term('pb-ratio', 'P/B Ratio', 'ratios', 'Price-to-Book',
        'P/B = Price ÷ Book Value. P/B below 1 means stock trades below asset value.'),
    _Term('roe', 'ROE', 'ratios', 'Return on Equity',
        'ROE = Net Income ÷ Equity. Top GCC banks typically have ROE of 12-18%.'),
    _Term('de-ratio', 'D/E Ratio', 'ratios', 'Debt-to-Equity',
        'D/E = Debt ÷ Equity. Lower is generally safer.'),
    _Term('div-yield', 'Dividend Yield', 'ratios', 'Annual dividend ÷ stock price',
        'A 5% yield means \$5 per year per \$100 invested. Some GCC stocks yield 6-8%.'),
    _Term('volatility', 'Volatility', 'risk', 'How much a price swings',
        'Measured as standard deviation of returns. Crypto > stocks > bonds.'),
    _Term('beta', 'Beta', 'risk', 'How a stock moves vs the market',
        'Beta 1.0 = moves with market. >1 = more volatile. <1 = less volatile.'),
    _Term('sharpe', 'Sharpe Ratio', 'risk', 'Return per unit of risk',
        'Sharpe = (Return − Risk-free rate) ÷ Volatility. Above 1.0 is good.'),
    _Term('diversification', 'Diversification', 'risk', 'Spreading risk',
        "Don't put all your eggs in one basket. GCC investors can diversify across 6 countries."),
    _Term('var', 'Value at Risk', 'risk', 'Maximum expected loss',
        'Daily VaR of \$5,000 at 95% confidence = 95% chance you won\'t lose more than \$5,000 in a day.'),
    _Term('bull-market', 'Bull Market', 'markets', 'Rising prices',
        'A sustained 20%+ rally from recent lows.'),
    _Term('bear-market', 'Bear Market', 'markets', 'Falling prices',
        'A sustained 20%+ decline. Painful but historically temporary.'),
    _Term('index', 'Market Index', 'markets', 'Tracks overall performance',
        'TASI (Saudi), DFM (UAE) track a basket of stocks to represent the market.'),
    _Term('liquidity', 'Liquidity', 'markets', 'How easily you can buy/sell',
        'High volume = liquid. Aramco and Al Rajhi are highly liquid.'),
    _Term('tadawul', 'Tadawul', 'gcc', 'Saudi Stock Exchange',
        'Largest in the MENA region. Regulated by the Capital Market Authority (CMA). Main index: TASI.'),
    _Term('sukuk', 'Sukuk', 'gcc', 'Islamic bonds',
        "Sharia-compliant — represent asset ownership rather than debt. GCC is the world's largest sukuk market."),
    _Term('vision2030', 'Vision 2030', 'gcc', "Saudi diversification plan",
        'Reduces oil dependence, grows tourism, entertainment, and tech. Drives massive investment and IPOs.'),
    _Term('zakat', 'Zakat', 'gcc', '2.5% wealth obligation',
        'One of the Five Pillars of Islam — mandatory charitable contribution for qualifying wealth held one year.'),
    _Term('cma', 'CMA', 'gcc', "Capital Market Authority",
        "Saudi Arabia's securities regulator, similar to the US SEC."),
  ];

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final p = _P.of(context);
    final filtered = _terms.where((t) {
      if (_cat != 'all' && t.category != _cat) return false;
      if (_q.isNotEmpty &&
          !t.term.toLowerCase().contains(_q.toLowerCase()) &&
          !t.short.toLowerCase().contains(_q.toLowerCase())) {
        return false;
      }
      return true;
    }).toList();

    return ListView(
      padding: EdgeInsets.fromLTRB(16, 16, 16, 28),
      children: [
        _headerBar(context, 'Financial Glossary', 'Learn key concepts'),
        TextField(
          controller: _search,
          onChanged: (v) => setState(() => _q = v),
          decoration: InputDecoration(
            isDense: true,
            prefixIcon: Icon(Icons.search_rounded, size: 18, color: p.t3),
            hintText: 'Search terms…',
            border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: p.border)),
            enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: p.border)),
          ),
        ),
        SizedBox(height: 12),
        SizedBox(
          height: 36,
          child: ListView(
            scrollDirection: Axis.horizontal,
            children: [
              for (final c in _categories) ...[
                GestureDetector(
                  onTap: () => setState(() => _cat = c.$1),
                  child: Container(
                    padding: EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                    margin: EdgeInsets.only(right: 6),
                    decoration: BoxDecoration(
                      color: _cat == c.$1 ? AppColors.navy : p.card,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                          color: _cat == c.$1 ? AppColors.navy : p.border),
                    ),
                    child: Text(c.$2,
                        style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: _cat == c.$1 ? Colors.white : p.t2)),
                  ),
                ),
              ],
            ],
          ),
        ),
        SizedBox(height: 6),
        Text('${filtered.length} terms',
            style: TextStyle(fontSize: 11, color: p.t3)),
        SizedBox(height: 8),
        for (final t in filtered) ...[
          GestureDetector(
            onTap: () => setState(() =>
                _expanded = _expanded == t.id ? null : t.id),
            child: _card(
              context,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        width: 32,
                        height: 32,
                        decoration: BoxDecoration(
                          color: AppColors.blueLight,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        alignment: Alignment.center,
                        child: Icon(Icons.menu_book_rounded,
                            size: 14, color: AppColors.blue),
                      ),
                      SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(t.term,
                                style: AppTheme.heading(
                                    size: 14, color: p.t1)),
                            SizedBox(height: 2),
                            Text(t.short,
                                style: TextStyle(
                                    fontSize: 11,
                                    color: p.t2,
                                    height: 1.4)),
                            if (_expanded == t.id) ...[
                              SizedBox(height: 8),
                              Divider(height: 1, color: p.border),
                              SizedBox(height: 8),
                              Text(t.detail,
                                  style: TextStyle(
                                      fontSize: 12,
                                      color: p.t2,
                                      height: 1.6)),
                            ],
                          ],
                        ),
                      ),
                      Container(
                        padding: EdgeInsets.symmetric(
                            horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppColors.bg,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(t.category,
                            style: TextStyle(
                                fontSize: 9,
                                fontWeight: FontWeight.w600,
                                color: p.t3)),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          SizedBox(height: 6),
        ],
        if (filtered.isEmpty)
          _emptyState(context, Icons.search_off_rounded, 'No terms found',
              'Try a different search or category.'),
      ],
    );
  }
}

class _Term {
  final String id, term, category, short, detail;
  const _Term(this.id, this.term, this.category, this.short, this.detail);
}

// =====================================================================
// 9. Net Worth
// =====================================================================
class NetWorthScreen extends StatelessWidget {
  const NetWorthScreen({super.key});

  static const _classes = <_Asset>[
    _Asset('Stocks', Icons.business_rounded, AppColors.navy, 48200, 51.4),
    _Asset('Crypto', Icons.currency_bitcoin_rounded, AppColors.icPurpleFg, 16500, 17.6),
    _Asset('Metals', Icons.layers_rounded, AppColors.icAmberFg, 9800, 10.4),
    _Asset('Oil', Icons.local_gas_station_rounded, AppColors.icOrangeFg, 6400, 6.8),
    _Asset('Bonds', Icons.account_balance_rounded, AppColors.blue, 8200, 8.7),
    _Asset('Cash', Icons.account_balance_wallet_rounded, AppColors.green, 4700, 5.0),
  ];

  @override
  Widget build(BuildContext context) {
    final p = _P.of(context);
    final total = _classes.map((c) => c.value).reduce((a, b) => a + b);
    return ListView(
      padding: EdgeInsets.fromLTRB(16, 16, 16, 28),
      children: [
        _headerBar(context, 'Net Worth', 'All assets overview'),
        Container(
          padding: EdgeInsets.all(18),
          decoration: BoxDecoration(
            gradient: LinearGradient(
                colors: [AppColors.navy, Color(0xFF1B1B5C)]),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('TOTAL NET WORTH',
                  style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 1.2,
                      color: Colors.white70)),
              SizedBox(height: 4),
              Text('\$${_fmt(total.toDouble())}',
                  style: AppTheme.heading(size: 30, color: Colors.white)),
              SizedBox(height: 8),
              Row(
                children: [
                  Icon(Icons.trending_up_rounded,
                      size: 14, color: AppColors.green),
                  SizedBox(width: 4),
                  Text('+12.4% YTD',
                      style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: AppColors.green)),
                ],
              ),
            ],
          ),
        ),
        SizedBox(height: 18),
        _sectionTitle('Allocation', p),
        for (final a in _classes) ...[
          _card(
            context,
            child: Row(
              children: [
                Container(
                  width: 38,
                  height: 38,
                  decoration: BoxDecoration(
                    color: a.color.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  alignment: Alignment.center,
                  child: Icon(a.icon, color: a.color, size: 18),
                ),
                SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(a.label,
                          style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: p.t1)),
                      SizedBox(height: 4),
                      Container(
                        height: 5,
                        decoration: BoxDecoration(
                          color: p.bg,
                          borderRadius: BorderRadius.circular(3),
                        ),
                        child: FractionallySizedBox(
                          alignment: Alignment.centerLeft,
                          widthFactor: a.pct / 100,
                          child: Container(
                            decoration: BoxDecoration(
                              color: a.color,
                              borderRadius: BorderRadius.circular(3),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text('\$${_fmt(a.value.toDouble())}',
                        style: AppTheme.heading(size: 13, color: p.t1)),
                    Text('${a.pct.toStringAsFixed(1)}%',
                        style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: p.t3)),
                  ],
                ),
              ],
            ),
          ),
          SizedBox(height: 10),
        ],
      ],
    );
  }

  static String _fmt(double v) {
    if (v >= 1e6) return '${(v / 1e6).toStringAsFixed(2)}M';
    if (v >= 1e3) return '${(v / 1e3).toStringAsFixed(1)}K';
    return v.toStringAsFixed(0);
  }
}

class _Asset {
  final String label;
  final IconData icon;
  final Color color;
  final int value;
  final double pct;
  const _Asset(this.label, this.icon, this.color, this.value, this.pct);
}

// =====================================================================
// 10. Zakat
// =====================================================================
class ZakatScreen extends StatefulWidget {
  const ZakatScreen({super.key});
  @override
  State<ZakatScreen> createState() => _ZakatScreenState();
}

class _ZakatScreenState extends State<ZakatScreen> {
  final _cash = TextEditingController(text: '20000');
  final _gold = TextEditingController(text: '5000');
  final _silver = TextEditingController(text: '500');
  final _stocks = TextEditingController(text: '48200');
  final _crypto = TextEditingController(text: '16500');
  final _debts = TextEditingController(text: '4000');

  double _parse(TextEditingController c) =>
      double.tryParse(c.text.replaceAll(',', '')) ?? 0;

  double get _net =>
      (_parse(_cash) + _parse(_gold) + _parse(_silver) + _parse(_stocks) +
              _parse(_crypto)) -
          _parse(_debts);
  double get _zakat => _net * 0.025;
  static const _nisab = 5500.0;

  @override
  void dispose() {
    _cash.dispose();
    _gold.dispose();
    _silver.dispose();
    _stocks.dispose();
    _crypto.dispose();
    _debts.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final p = _P.of(context);
    final liable = _net >= _nisab;
    return ListView(
      padding: EdgeInsets.fromLTRB(16, 16, 16, 28),
      children: [
        _headerBar(context, 'Zakat Calculator', '2.5% of qualifying wealth'),
        Container(
          padding: EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: liable ? AppColors.green : AppColors.icAmberFg,
            borderRadius: BorderRadius.circular(16),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('ZAKAT DUE',
                  style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 1.2,
                      color: Colors.white70)),
              SizedBox(height: 4),
              Text('\$${_zakat.toStringAsFixed(2)}',
                  style: AppTheme.heading(size: 30, color: Colors.white)),
              SizedBox(height: 6),
              Text(
                  liable
                      ? 'Net assets \$${_net.toStringAsFixed(0)} above Nisab threshold (\$${_nisab.toStringAsFixed(0)})'
                      : 'Net assets below Nisab — no Zakat due',
                  style: TextStyle(color: Colors.white, fontSize: 12)),
            ],
          ),
        ),
        SizedBox(height: 18),
        _sectionTitle('Assets', p),
        _amountRow('Cash & Bank Balances', _cash, p),
        SizedBox(height: 8),
        _amountRow('Gold (USD value)', _gold, p),
        SizedBox(height: 8),
        _amountRow('Silver (USD value)', _silver, p),
        SizedBox(height: 8),
        _amountRow('Stocks (trading intent)', _stocks, p),
        SizedBox(height: 8),
        _amountRow('Cryptocurrency', _crypto, p),
        SizedBox(height: 18),
        _sectionTitle('Liabilities', p),
        _amountRow('Outstanding debts', _debts, p),
      ],
    );
  }

  Widget _amountRow(String label, TextEditingController c, _P p) {
    return _card(
      context,
      child: Row(
        children: [
          Expanded(
            child: Text(label,
                style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: p.t1)),
          ),
          SizedBox(width: 8),
          SizedBox(
            width: 120,
            child: TextField(
              controller: c,
              keyboardType: TextInputType.numberWithOptions(decimal: true),
              textAlign: TextAlign.right,
              onChanged: (_) => setState(() {}),
              decoration: InputDecoration(
                isDense: true,
                prefixText: '\$ ',
                contentPadding:
                    EdgeInsets.symmetric(horizontal: 8, vertical: 8),
                border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: BorderSide(color: p.border)),
                enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: BorderSide(color: p.border)),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// =====================================================================
// 11. Sharia Screening
// =====================================================================
class ShariaScreeningScreen extends StatefulWidget {
  const ShariaScreeningScreen({super.key});
  @override
  State<ShariaScreeningScreen> createState() => _ShariaScreeningScreenState();
}

class _ShariaScreeningScreenState extends State<ShariaScreeningScreen> {
  String _filter = 'all';

  static const _stocks = <_ShariaStock>[
    _ShariaStock('Saudi Aramco', '2222.SR', '🇸🇦', 'compliant', 12.4, 1.2, 0.8),
    _ShariaStock('Al Rajhi Bank', '1120.SR', '🇸🇦', 'compliant', 18.2, 2.1, 1.0),
    _ShariaStock('Saudi Telecom', '7010.SR', '🇸🇦', 'compliant', 22.0, 3.4, 2.1),
    _ShariaStock('Emirates NBD', 'ENBD.AE', '🇦🇪', 'non-compliant', 45.2, 8.5, 6.2),
    _ShariaStock('First Abu Dhabi Bank', 'FAB.AE', '🇦🇪', 'non-compliant', 48.0, 9.1, 5.8),
    _ShariaStock('Qatar National Bank', 'QNBK.QA', '🇶🇦', 'watch', 35.1, 5.5, 4.2),
    _ShariaStock('SABIC', '2010.SR', '🇸🇦', 'compliant', 28.5, 4.2, 1.2),
    _ShariaStock('Kuwait Finance House', 'KFH.KW', '🇰🇼', 'compliant', 19.4, 2.8, 0.9),
    _ShariaStock('Emaar Properties', 'EMAAR.AE', '🇦🇪', 'compliant', 24.8, 3.6, 2.0),
    _ShariaStock('Ahli United Bank', 'AUB.BH', '🇧🇭', 'non-compliant', 42.0, 7.8, 5.5),
  ];

  @override
  Widget build(BuildContext context) {
    final p = _P.of(context);
    final list = _filter == 'all'
        ? _stocks
        : _stocks.where((s) => s.status == _filter).toList();
    final compliant =
        _stocks.where((s) => s.status == 'compliant').length;
    final watch = _stocks.where((s) => s.status == 'watch').length;
    final nonCompliant =
        _stocks.where((s) => s.status == 'non-compliant').length;

    return ListView(
      padding: EdgeInsets.fromLTRB(16, 16, 16, 28),
      children: [
        _headerBar(context, 'Sharia Screening', 'AAOIFI compliance check'),
        Row(
          children: [
            Expanded(child: _stat(p, compliant, 'Compliant', AppColors.green)),
            SizedBox(width: 8),
            Expanded(child: _stat(p, watch, 'Watch', AppColors.icAmberFg)),
            SizedBox(width: 8),
            Expanded(
                child: _stat(p, nonCompliant, 'Non-Compl.', AppColors.red)),
          ],
        ),
        SizedBox(height: 14),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              for (final (id, label) in const [
                ('all', 'All'),
                ('compliant', 'Compliant'),
                ('watch', 'Watch'),
                ('non-compliant', 'Non-Compliant'),
              ])
                GestureDetector(
                  onTap: () => setState(() => _filter = id),
                  child: Container(
                    margin: EdgeInsets.only(right: 6),
                    padding: EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                    decoration: BoxDecoration(
                      color: _filter == id ? AppColors.navy : p.card,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                          color:
                              _filter == id ? AppColors.navy : p.border),
                    ),
                    child: Text(label,
                        style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color:
                                _filter == id ? Colors.white : p.t2)),
                  ),
                ),
            ],
          ),
        ),
        SizedBox(height: 14),
        for (final s in list) ...[
          _card(
            context,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(s.flag, style: TextStyle(fontSize: 22)),
                    SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(s.name,
                              style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w700,
                                  color: p.t1)),
                          Text(s.ticker,
                              style: TextStyle(fontSize: 11, color: p.t3)),
                        ],
                      ),
                    ),
                    _statusBadge(s.status),
                  ],
                ),
                SizedBox(height: 10),
                _metric(p, 'Debt / Assets', s.debt, 33, '%'),
                SizedBox(height: 6),
                _metric(p, 'Interest Income', s.interest, 5, '%'),
                SizedBox(height: 6),
                _metric(p, 'Haram Revenue', s.haram, 5, '%'),
              ],
            ),
          ),
          SizedBox(height: 10),
        ],
      ],
    );
  }

  Widget _stat(_P p, int value, String label, Color color) {
    return Container(
      padding: EdgeInsets.symmetric(vertical: 14),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          Text('$value',
              style: AppTheme.heading(size: 20, color: color)),
          Text(label,
              style: TextStyle(
                  fontSize: 11, fontWeight: FontWeight.w600, color: p.t2)),
        ],
      ),
    );
  }

  Widget _metric(_P p, String label, double value, double threshold, String unit) {
    final pass = value < threshold;
    return Row(
      children: [
        SizedBox(
          width: 110,
          child: Text(label,
              style: TextStyle(fontSize: 10, color: p.t3)),
        ),
        Expanded(
          child: Container(
            height: 6,
            decoration: BoxDecoration(
              color: p.border,
              borderRadius: BorderRadius.circular(3),
            ),
            child: FractionallySizedBox(
              alignment: Alignment.centerLeft,
              widthFactor: (value / (threshold * 1.4)).clamp(0, 1).toDouble(),
              child: Container(
                decoration: BoxDecoration(
                  color: pass ? AppColors.green : AppColors.red,
                  borderRadius: BorderRadius.circular(3),
                ),
              ),
            ),
          ),
        ),
        SizedBox(width: 8),
        SizedBox(
          width: 44,
          child: Text('${value.toStringAsFixed(1)}$unit',
              textAlign: TextAlign.right,
              style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                  color: pass ? AppColors.green : AppColors.red)),
        ),
      ],
    );
  }

  Widget _statusBadge(String status) {
    final (color, bg, label) = switch (status) {
      'compliant' => (AppColors.green, AppColors.greenBg, 'Compliant'),
      'watch' => (AppColors.icAmberFg, AppColors.icAmberBg, 'Watch'),
      _ => (AppColors.red, AppColors.redBg, 'Non-Compl.'),
    };
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(label,
          style: TextStyle(
              fontSize: 9, fontWeight: FontWeight.w800, color: color)),
    );
  }
}

class _ShariaStock {
  final String name, ticker, flag, status;
  final double debt, interest, haram;
  const _ShariaStock(this.name, this.ticker, this.flag, this.status, this.debt,
      this.interest, this.haram);
}

// =====================================================================
// 12. Cross-Listings
// =====================================================================
class CrossListingsScreen extends StatelessWidget {
  const CrossListingsScreen({super.key});

  static const _items = <_Cross>[
    _Cross('Ooredoo Group', 'QSE', [
      _Listing('QSE', 9.45, 'QAR'),
      _Listing('Boursa Kuwait', 0.82, 'KWD'),
    ], 2.86),
    _Cross('Gulf Bank', 'Boursa Kuwait', [
      _Listing('Boursa Kuwait', 0.295, 'KWD'),
      _Listing('BAX', 0.378, 'BHD'),
    ], 2.37),
    _Cross('Ahli United Bank', 'BAX', [
      _Listing('BAX', 0.81, 'BHD'),
      _Listing('Boursa Kuwait', 0.265, 'KWD'),
    ], -1.85),
    _Cross('Zain Group', 'Boursa Kuwait', [
      _Listing('Boursa Kuwait', 0.580, 'KWD'),
      _Listing('BAX', 0.735, 'BHD'),
    ], 1.38),
    _Cross('GFH Financial Group', 'BAX', [
      _Listing('BAX', 0.325, 'BHD'),
      _Listing('DFM', 1.15, 'AED'),
      _Listing('Boursa Kuwait', 0.105, 'KWD'),
    ], 3.08),
    _Cross('KIPCO', 'Boursa Kuwait', [
      _Listing('Boursa Kuwait', 0.182, 'KWD'),
      _Listing('BAX', 0.232, 'BHD'),
    ], 2.20),
  ];

  @override
  Widget build(BuildContext context) {
    final p = _P.of(context);
    return ListView(
      padding: EdgeInsets.fromLTRB(16, 16, 16, 28),
      children: [
        _headerBar(context, 'Cross-Listings', 'Multi-exchange GCC stocks'),
        Container(
          padding: EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: AppColors.icAmberBg,
            borderRadius: BorderRadius.circular(10),
          ),
          child: Row(
            children: [
              Icon(Icons.info_outline,
                  size: 16, color: AppColors.icAmberFg),
              SizedBox(width: 8),
              Expanded(
                child: Text(
                    'Same company, different exchanges — small spreads can signal arbitrage opportunities.',
                    style: TextStyle(fontSize: 11, color: p.t2, height: 1.4)),
              ),
            ],
          ),
        ),
        SizedBox(height: 18),
        for (final c in _items) ...[
          _card(
            context,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(c.name,
                          style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                              color: p.t1)),
                    ),
                    Container(
                      padding: EdgeInsets.symmetric(
                          horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: c.spread.abs() > 2.5
                            ? AppColors.greenBg
                            : c.spread < 0
                                ? AppColors.redBg
                                : AppColors.icAmberBg,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                          '${c.spread >= 0 ? '+' : ''}${c.spread.toStringAsFixed(2)}%',
                          style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w800,
                              color: c.spread.abs() > 2.5
                                  ? AppColors.green
                                  : c.spread < 0
                                      ? AppColors.red
                                      : AppColors.icAmberFg)),
                    ),
                  ],
                ),
                SizedBox(height: 4),
                Text('Primary: ${c.primary}',
                    style: TextStyle(fontSize: 11, color: p.t3)),
                SizedBox(height: 10),
                for (final l in c.listings)
                  Padding(
                    padding: EdgeInsets.symmetric(vertical: 4),
                    child: Row(
                      children: [
                        Container(
                          padding: EdgeInsets.symmetric(
                              horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: AppColors.blueLight,
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(l.exchange,
                              style: TextStyle(
                                  fontSize: 9,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.blue)),
                        ),
                        Spacer(),
                        Text('${l.price.toStringAsFixed(3)} ${l.currency}',
                            style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: p.t1)),
                      ],
                    ),
                  ),
              ],
            ),
          ),
          SizedBox(height: 10),
        ],
      ],
    );
  }
}

class _Cross {
  final String name, primary;
  final List<_Listing> listings;
  final double spread;
  const _Cross(this.name, this.primary, this.listings, this.spread);
}

class _Listing {
  final String exchange, currency;
  final double price;
  const _Listing(this.exchange, this.price, this.currency);
}

// =====================================================================
// 13. Copy Trading
// =====================================================================
class CopyTradingScreen extends StatelessWidget {
  const CopyTradingScreen({super.key});

  static const _investors = <_Investor>[
    _Investor('Abdullah Al-Saud', 'AS', 0xFF010131,
        'Saudi banking & energy specialist. 8 years experience.',
        32.5, 71, 1247, 'Medium'),
    _Investor('Mariam Al-Falasi', 'MF', 0xFF5391D5,
        'UAE real estate & hospitality focus. CFA charterholder.',
        28.1, 68, 892, 'Medium'),
    _Investor('Hassan Al-Thani', 'HT', 0xFF7C5FDB,
        'Qatar gas & infrastructure. Former QIA analyst.',
        24.7, 74, 634, 'Low'),
    _Investor('Fatima Al-Balushi', 'FB', 0xFF00C896,
        'Oman & Bahrain small caps. High growth strategy.',
        41.2, 62, 421, 'High'),
    _Investor('Omar Al-Sabah', 'OS', 0xFFF2A600,
        'Kuwait blue chips. Conservative dividend strategy.',
        18.3, 79, 1563, 'Low'),
    _Investor('VIFM Quant Bot', 'VQ', 0xFFFF4B6E,
        'AI-driven GCC momentum strategy. Automated rebalancing.',
        35.8, 66, 2104, 'Medium'),
    _Investor('Nadia Al-Rashid', 'NR', 0xFFFF8A35,
        'GCC crypto & digital assets specialist.',
        52.3, 58, 356, 'High'),
    _Investor('Khalid Bin Zayed', 'KZ', 0xFF00A8A0,
        'Sharia-compliant portfolio. AAOIFI screened holdings only.',
        21.6, 73, 789, 'Low'),
  ];

  @override
  Widget build(BuildContext context) {
    final p = _P.of(context);
    return ListView(
      padding: EdgeInsets.fromLTRB(16, 16, 16, 28),
      children: [
        _headerBar(context, 'Copy Trading',
            "Mirror top investors' portfolios automatically"),
        for (final inv in _investors) ...[
          _card(
            context,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(colors: [
                          Color(inv.color),
                          Color(inv.color).withValues(alpha: 0.85),
                        ]),
                        borderRadius: BorderRadius.circular(24),
                      ),
                      alignment: Alignment.center,
                      child: Text(inv.initials,
                          style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w800,
                              fontSize: 14)),
                    ),
                    SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(inv.name,
                                  style: TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w700,
                                      color: p.t1)),
                              SizedBox(width: 4),
                              Icon(Icons.verified_rounded,
                                  size: 14, color: AppColors.blue),
                            ],
                          ),
                          Text(inv.bio,
                              style: TextStyle(
                                  fontSize: 11, color: p.t3, height: 1.4),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis),
                        ],
                      ),
                    ),
                  ],
                ),
                SizedBox(height: 12),
                Row(
                  children: [
                    _statBlock(p, '+${inv.ret.toStringAsFixed(1)}%', 'YTD Return',
                        AppColors.green),
                    SizedBox(width: 8),
                    _statBlock(p, '${inv.winRate}%', 'Win Rate', AppColors.navy),
                    SizedBox(width: 8),
                    _statBlock(
                        p, '${inv.copiers}', 'Copiers', AppColors.icPurpleFg),
                  ],
                ),
                SizedBox(height: 12),
                Row(
                  children: [
                    Container(
                      padding:
                          EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                        color: _riskBg(inv.risk),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text('${inv.risk} Risk',
                          style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                              color: _riskFg(inv.risk))),
                    ),
                    Spacer(),
                    SizedBox(
                      height: 32,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.navy,
                          foregroundColor: Colors.white,
                          padding: EdgeInsets.symmetric(horizontal: 16),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10)),
                        ),
                        onPressed: () => _snack(context,
                            'Started copying ${inv.name} — coming soon'),
                        child: Text('Copy',
                            style: TextStyle(
                                fontSize: 12, fontWeight: FontWeight.w700)),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          SizedBox(height: 10),
        ],
      ],
    );
  }

  Widget _statBlock(_P p, String value, String label, Color color) {
    return Expanded(
      child: Container(
        padding: EdgeInsets.symmetric(vertical: 8),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.10),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Column(
          children: [
            Text(value,
                style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w800,
                    color: color)),
            Text(label,
                style: TextStyle(
                    fontSize: 9,
                    fontWeight: FontWeight.w600,
                    color: p.t3)),
          ],
        ),
      ),
    );
  }

  Color _riskBg(String r) =>
      r == 'Low' ? AppColors.greenBg : r == 'High' ? AppColors.redBg : AppColors.icAmberBg;
  Color _riskFg(String r) =>
      r == 'Low' ? AppColors.green : r == 'High' ? AppColors.red : AppColors.icAmberFg;
}

class _Investor {
  final String name, initials, bio, risk;
  final int color, copiers, winRate;
  final double ret;
  const _Investor(this.name, this.initials, this.color, this.bio, this.ret,
      this.winRate, this.copiers, this.risk);
}

// =====================================================================
// 14. Social Feed (Community)
// =====================================================================
class SocialFeedScreen extends StatelessWidget {
  const SocialFeedScreen({super.key});

  static const _posts = <_Post>[
    _Post('Mohammed Al-Rashid', 'MR', '2h ago',
        'Saudi Aramco Q1 results looking strong. Revenue beat expectations by 8%. Holding my position.',
        '2222.SR', 'bullish', 24, 7),
    _Post('Fatima Hassan', 'FH', '4h ago',
        'Anyone watching the Dubai real estate sector? Emaar up 3% this week on tourism data.',
        'EMAAR.AE', 'bullish', 18, 12),
    _Post('Ahmad Al-Kuwait', 'AK', '6h ago',
        'Gold hitting resistance at \$2,350. Might take profits on my metals position and rotate into GCC banks.',
        null, 'neutral', 31, 9),
    _Post('Sara Al-Qatari', 'SQ', '8h ago',
        'QNB earnings next week. Expecting strong loan growth given Qatar infrastructure spending.',
        'QNBK.QA', 'bullish', 15, 5),
    _Post('Khalid Bahraini', 'KB', '12h ago',
        'Be cautious on SABIC — petrochemical margins compressing globally. Downgrading my outlook.',
        '2010.SR', 'bearish', 22, 14),
    _Post('Noura Al-Omani', 'NO', '1d ago',
        'Just completed the CFA Level 1 prep on Ashom! The quant tools are incredibly helpful for practice.',
        null, 'neutral', 45, 8),
    _Post('VIFM Research', 'VR', '1d ago',
        'Weekly GCC Market Wrap: TASI +1.2%, DFM -0.4%, QE +0.7%. Banking sector leading gains across the region.',
        null, 'bullish', 67, 21),
  ];

  static const _trending = <(String, String, int, bool)>[
    ('2222.SR', 'Saudi Aramco', 42, true),
    ('EMAAR.AE', 'Emaar Properties', 31, true),
    ('QNBK.QA', 'QNB Group', 28, true),
    ('2010.SR', 'SABIC', 19, false),
    ('FAB.AE', 'First Abu Dhabi Bank', 16, true),
  ];

  @override
  Widget build(BuildContext context) {
    final p = _P.of(context);
    return ListView(
      padding: EdgeInsets.fromLTRB(16, 16, 16, 28),
      children: [
        _headerBar(context, 'Community', 'Discuss stocks & follow analysts'),
        _sectionTitle('Trending Tickers', p),
        SizedBox(
          height: 92,
          child: ListView(
            scrollDirection: Axis.horizontal,
            children: [
              for (final t in _trending)
                Container(
                  width: 140,
                  margin: EdgeInsets.only(right: 10),
                  padding: EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: p.card,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: p.border),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(t.$1,
                              style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w800,
                                  color: p.t1)),
                          SizedBox(width: 4),
                          Icon(
                              t.$4
                                  ? Icons.trending_up_rounded
                                  : Icons.trending_down_rounded,
                              size: 14,
                              color: t.$4 ? AppColors.green : AppColors.red),
                        ],
                      ),
                      SizedBox(height: 2),
                      Text(t.$2,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(fontSize: 11, color: p.t3)),
                      Spacer(),
                      Text('${t.$3} posts',
                          style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              color: AppColors.blue)),
                    ],
                  ),
                ),
            ],
          ),
        ),
        SizedBox(height: 14),
        _sectionTitle('Feed', p),
        for (final post in _posts) ...[
          _card(
            context,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(colors: [
                          AppColors.navy,
                          AppColors.blue,
                        ]),
                        shape: BoxShape.circle,
                      ),
                      alignment: Alignment.center,
                      child: Text(post.initials,
                          style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w800,
                              color: Colors.white)),
                    ),
                    SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(post.user,
                              style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w700,
                                  color: p.t1)),
                          Text(post.time,
                              style: TextStyle(fontSize: 10, color: p.t3)),
                        ],
                      ),
                    ),
                    _sentimentBadge(post.sentiment),
                  ],
                ),
                SizedBox(height: 10),
                Text(post.text,
                    style: TextStyle(fontSize: 13, color: p.t1, height: 1.5)),
                if (post.ticker != null) ...[
                  SizedBox(height: 8),
                  Container(
                    padding:
                        EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: AppColors.blueLight,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text('\$${post.ticker}',
                        style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w800,
                            color: AppColors.blue)),
                  ),
                ],
                SizedBox(height: 10),
                Row(
                  children: [
                    Icon(Icons.favorite_border_rounded,
                        size: 16, color: p.t3),
                    SizedBox(width: 4),
                    Text('${post.likes}',
                        style: TextStyle(fontSize: 11, color: p.t3)),
                    SizedBox(width: 16),
                    Icon(Icons.mode_comment_outlined,
                        size: 15, color: p.t3),
                    SizedBox(width: 4),
                    Text('${post.comments}',
                        style: TextStyle(fontSize: 11, color: p.t3)),
                    Spacer(),
                    Icon(Icons.share_outlined, size: 16, color: p.t3),
                  ],
                ),
              ],
            ),
          ),
          SizedBox(height: 10),
        ],
      ],
    );
  }

  Widget _sentimentBadge(String s) {
    final (color, label) = switch (s) {
      'bullish' => (AppColors.green, 'Bullish'),
      'bearish' => (AppColors.red, 'Bearish'),
      _ => (AppColors.text3, 'Neutral'),
    };
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 6,
            height: 6,
            decoration: BoxDecoration(color: color, shape: BoxShape.circle),
          ),
          SizedBox(width: 4),
          Text(label,
              style: TextStyle(
                  fontSize: 9, fontWeight: FontWeight.w700, color: color)),
        ],
      ),
    );
  }
}

class _Post {
  final String user, initials, time, text, sentiment;
  final String? ticker;
  final int likes, comments;
  const _Post(this.user, this.initials, this.time, this.text, this.ticker,
      this.sentiment, this.likes, this.comments);
}

// =====================================================================
// 15. Curated Lists (Smart Picks)
// =====================================================================
class CuratedListsScreen extends StatelessWidget {
  const CuratedListsScreen({super.key});

  static const _lists = <_Curated>[
    _Curated('Largest by Market Cap', 'GCC blue chips', Icons.workspace_premium_rounded,
        AppColors.icAmberBg, AppColors.icAmberFg),
    _Curated('Top Dividend Payers', 'Highest yield companies', Icons.attach_money_rounded,
        AppColors.icGreenBg, AppColors.icGreenFg),
    _Curated('Most Undervalued', 'Lowest P/E ratios', Icons.trending_down_rounded,
        AppColors.icPurpleBg, AppColors.icPurpleFg),
    _Curated('Most Profitable', 'Highest ROE companies', Icons.bolt_rounded,
        AppColors.icRedBg, AppColors.icRedFg),
    _Curated('Lowest Risk', 'Best debt-to-equity ratios', Icons.shield_rounded,
        AppColors.icBlueBg, AppColors.icBlueFg),
    _Curated('Sharia Compliant', 'AAOIFI screened', Icons.verified_user_rounded,
        AppColors.icTealBg, AppColors.icTealFg),
    _Curated('GCC Tech Picks', 'Technology & telecom leaders', Icons.memory_rounded,
        AppColors.icNavyBg, AppColors.icNavyFg),
    _Curated('Vision 2030 Themes', 'Beneficiaries of Saudi diversification',
        Icons.flag_rounded, AppColors.icOrangeBg, AppColors.icOrangeFg),
  ];

  @override
  Widget build(BuildContext context) {
    final p = _P.of(context);
    return ListView(
      padding: EdgeInsets.fromLTRB(16, 16, 16, 28),
      children: [
        _headerBar(context, 'Smart Picks', 'Top lists & AI-curated ideas'),
        for (final c in _lists) ...[
          _card(
            context,
            child: Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: c.bg,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  alignment: Alignment.center,
                  child: Icon(c.icon, color: c.fg, size: 20),
                ),
                SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(c.title,
                          style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                              color: p.t1)),
                      SizedBox(height: 2),
                      Text(c.subtitle,
                          style: TextStyle(fontSize: 11, color: p.t3)),
                    ],
                  ),
                ),
                Icon(Icons.chevron_right_rounded, color: p.t3, size: 18),
              ],
            ),
          ),
          SizedBox(height: 10),
        ],
      ],
    );
  }
}

class _Curated {
  final String title, subtitle;
  final IconData icon;
  final Color bg, fg;
  const _Curated(this.title, this.subtitle, this.icon, this.bg, this.fg);
}

// =====================================================================
// 16. Classroom
// =====================================================================
class ClassroomScreen extends StatelessWidget {
  const ClassroomScreen({super.key});

  static const _students = <(String, String, double, int, bool)>[
    ('Aiman Sadeq', 'AS', 0.0, 0, true),
    ('Sara Al-Mansoori', 'SM', 8.3, 15, false),
    ('Khalid Bin Rashid', 'KR', 6.1, 22, false),
    ('Noura Al-Shehhi', 'NS', 4.7, 9, false),
    ('Faisal Al-Dosari', 'FD', 3.2, 18, false),
    ('Maryam Hassan', 'MH', 1.9, 7, false),
    ('Youssef Bakri', 'YB', -0.5, 12, false),
    ('Lina Al-Qurashi', 'LQ', -2.1, 5, false),
  ];

  @override
  Widget build(BuildContext context) {
    final p = _P.of(context);
    return ListView(
      padding: EdgeInsets.fromLTRB(16, 16, 16, 28),
      children: [
        _headerBar(context, 'Classroom', 'Compete with classmates'),
        Container(
          padding: EdgeInsets.all(16),
          decoration: BoxDecoration(
            gradient: LinearGradient(
                colors: [AppColors.navy, Color(0xFF1B1B5C)]),
            borderRadius: BorderRadius.circular(14),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(Icons.groups_rounded, color: Colors.white, size: 22),
                  SizedBox(width: 8),
                  Text('Financial Analysis 301',
                      style: TextStyle(
                          color: Colors.white,
                          fontSize: 15,
                          fontWeight: FontWeight.w800)),
                ],
              ),
              SizedBox(height: 6),
              Text('Dr. Ahmed Al-Rashid · Code VIFM-DEMO · \$100K starting cash',
                  style: TextStyle(color: Colors.white70, fontSize: 11)),
              SizedBox(height: 14),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.white,
                        side: BorderSide(color: Colors.white24),
                        padding: EdgeInsets.symmetric(vertical: 10),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10)),
                      ),
                      onPressed: () => _snack(
                          context, 'Create classroom — coming soon'),
                      icon: Icon(Icons.add_rounded, size: 16),
                      label: Text('Create'),
                    ),
                  ),
                  SizedBox(width: 8),
                  Expanded(
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: AppColors.navy,
                        padding: EdgeInsets.symmetric(vertical: 10),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10)),
                      ),
                      onPressed: () => _snack(
                          context, 'Join classroom — coming soon'),
                      icon: Icon(Icons.login_rounded, size: 16),
                      label: Text('Join'),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        SizedBox(height: 20),
        _sectionTitle('Leaderboard', p),
        for (var i = 0; i < _students.length; i++) ...[
          _card(
            context,
            child: Row(
              children: [
                Container(
                  width: 28,
                  height: 28,
                  decoration: BoxDecoration(
                    color: i < 3
                        ? [
                            AppColors.icAmberFg,
                            AppColors.text2,
                            AppColors.icOrangeFg
                          ][i]
                        : p.bg,
                    shape: BoxShape.circle,
                  ),
                  alignment: Alignment.center,
                  child: Text('${i + 1}',
                      style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w800,
                          color: i < 3 ? Colors.white : p.t3)),
                ),
                SizedBox(width: 12),
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: _students[i].$5 ? AppColors.blueLight : p.bg,
                    shape: BoxShape.circle,
                  ),
                  alignment: Alignment.center,
                  child: Text(_students[i].$2,
                      style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                          color: _students[i].$5
                              ? AppColors.blue
                              : p.t2)),
                ),
                SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(_students[i].$1 +
                          (_students[i].$5 ? ' (You)' : ''),
                          style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: p.t1)),
                      Text('${_students[i].$4} trades',
                          style: TextStyle(fontSize: 11, color: p.t3)),
                    ],
                  ),
                ),
                Text(
                    '${_students[i].$3 >= 0 ? '+' : ''}${_students[i].$3.toStringAsFixed(1)}%',
                    style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w800,
                        color: _students[i].$3 >= 0
                            ? AppColors.green
                            : AppColors.red)),
              ],
            ),
          ),
          SizedBox(height: 8),
        ],
      ],
    );
  }
}

// =====================================================================
// 17. Family Hub
// =====================================================================
class FamilyHubScreen extends StatelessWidget {
  const FamilyHubScreen({super.key});

  static const _members = <(String, String, double, double, bool)>[
    ('Asaad (You)', 'AS', 84520, 12.4, true),
    ('Spouse', 'SP', 62300, 8.7, false),
    ('Son (16)', 'SN', 12400, 5.2, false),
    ('Daughter (12)', 'DT', 8200, 6.8, false),
  ];

  @override
  Widget build(BuildContext context) {
    final p = _P.of(context);
    final total = _members.map((m) => m.$3).reduce((a, b) => a + b);
    return ListView(
      padding: EdgeInsets.fromLTRB(16, 16, 16, 28),
      children: [
        _headerBar(context, 'Family Hub', 'Track family investments together'),
        Container(
          padding: EdgeInsets.all(18),
          decoration: BoxDecoration(
            gradient: LinearGradient(colors: [AppColors.green, Color(0xFF1FBC7E)]),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('FAMILY NET WORTH',
                  style: TextStyle(
                      color: Colors.white70,
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 1.2)),
              SizedBox(height: 4),
              Text('\$${total.toStringAsFixed(0)}',
                  style: AppTheme.heading(size: 30, color: Colors.white)),
              SizedBox(height: 6),
              Text('${_members.length} members tracked',
                  style: TextStyle(color: Colors.white70, fontSize: 12)),
            ],
          ),
        ),
        SizedBox(height: 18),
        _sectionTitle('Members', p),
        for (final m in _members) ...[
          _card(
            context,
            child: Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: m.$5 ? AppColors.navy : p.bg,
                    shape: BoxShape.circle,
                  ),
                  alignment: Alignment.center,
                  child: Text(m.$2,
                      style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w800,
                          color: m.$5 ? Colors.white : p.t2)),
                ),
                SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(m.$1,
                          style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: p.t1)),
                      Text('${(m.$3 / total * 100).toStringAsFixed(1)}% of family',
                          style: TextStyle(fontSize: 11, color: p.t3)),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text('\$${m.$3.toStringAsFixed(0)}',
                        style: AppTheme.heading(size: 14, color: p.t1)),
                    Text('+${m.$4.toStringAsFixed(1)}% YTD',
                        style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: AppColors.green)),
                  ],
                ),
              ],
            ),
          ),
          SizedBox(height: 10),
        ],
        SizedBox(height: 12),
        SizedBox(
          height: 46,
          child: ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.navy,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12)),
            ),
            onPressed: () => _snack(context, 'Add family member — coming soon'),
            icon: Icon(Icons.person_add_rounded, size: 16),
            label: Text('Add Member'),
          ),
        ),
      ],
    );
  }
}

// =====================================================================
// 18. Options Screener
// =====================================================================
class OptionsScreenerScreen extends StatelessWidget {
  const OptionsScreenerScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final p = _P.of(context);
    return ListView(
      padding: EdgeInsets.fromLTRB(16, 16, 16, 28),
      children: [
        _headerBar(context, 'Options Screener',
            'Derivatives market — early access'),
        Container(
          padding: EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: AppColors.icAmberBg,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            children: [
              Icon(Icons.info_outline,
                  size: 16, color: AppColors.icAmberFg),
              SizedBox(width: 8),
              Expanded(
                child: Text(
                    'GCC-listed options are limited. We are sourcing data — full screener arrives in 1.40.',
                    style: TextStyle(fontSize: 11, color: p.t2, height: 1.4)),
              ),
            ],
          ),
        ),
        SizedBox(height: 18),
        _sectionTitle('Sample Chain — 2222.SR', p),
        _card(
          context,
          padding: EdgeInsets.zero,
          child: Column(
            children: [
              Container(
                padding: EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                decoration: BoxDecoration(color: p.bg),
                child: Row(
                  children: [
                    Expanded(child: _hdr(p, 'Strike')),
                    Expanded(child: _hdr(p, 'Type')),
                    Expanded(child: _hdr(p, 'Premium')),
                    Expanded(child: _hdr(p, 'IV')),
                  ],
                ),
              ),
              for (final o in const [
                ('25.00', 'Call', '3.20', '24%'),
                ('27.50', 'Call', '1.85', '22%'),
                ('30.00', 'Call', '0.95', '21%'),
                ('27.50', 'Put', '0.75', '23%'),
                ('25.00', 'Put', '0.40', '25%'),
              ])
                Padding(
                  padding: EdgeInsets.symmetric(horizontal: 14, vertical: 11),
                  child: Row(
                    children: [
                      Expanded(child: Text(o.$1, style: TextStyle(fontSize: 12, color: p.t1))),
                      Expanded(
                        child: Container(
                          padding:
                              EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: o.$2 == 'Call'
                                ? AppColors.greenBg
                                : AppColors.redBg,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          width: 50,
                          alignment: Alignment.center,
                          child: Text(o.$2,
                              style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w800,
                                  color: o.$2 == 'Call'
                                      ? AppColors.green
                                      : AppColors.red)),
                        ),
                      ),
                      Expanded(
                          child: Text(o.$3,
                              style: TextStyle(fontSize: 12, color: p.t1))),
                      Expanded(
                          child: Text(o.$4,
                              style: TextStyle(fontSize: 12, color: p.t3))),
                    ],
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _hdr(_P p, String s) => Text(s,
      style: TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w800,
          letterSpacing: 1,
          color: p.t3));
}

// =====================================================================
// 19. Sector Dashboard
// =====================================================================
class SectorDashboardScreen extends StatelessWidget {
  const SectorDashboardScreen({super.key});

  static const _sectors = <_Sector>[
    _Sector('Financials', Icons.account_balance_rounded,
        AppColors.icNavyBg, AppColors.icNavyFg, 2840, 18, 6),
    _Sector('Energy', Icons.bolt_rounded, AppColors.icRedBg,
        AppColors.icRedFg, 2210, 14, 4),
    _Sector('Communication Services', Icons.wifi_rounded,
        AppColors.icPurpleBg, AppColors.icPurpleFg, 580, 22, 6),
    _Sector('Materials', Icons.factory_rounded, AppColors.icOrangeBg,
        AppColors.icOrangeFg, 540, 35, 6),
    _Sector('Real Estate', Icons.home_rounded, AppColors.icGreenBg,
        AppColors.icGreenFg, 420, 28, 5),
    _Sector('Utilities', Icons.business_rounded, AppColors.icBlueBg,
        AppColors.icBlueFg, 380, 15, 6),
    _Sector('Consumer Staples', Icons.grass_rounded, AppColors.icAmberBg,
        AppColors.icAmberFg, 320, 42, 6),
    _Sector('Industrials', Icons.engineering_rounded, AppColors.icBlueBg,
        AppColors.icBlueFg, 290, 38, 5),
    _Sector('Information Technology', Icons.memory_rounded,
        AppColors.icPurpleBg, AppColors.icPurpleFg, 240, 18, 4),
    _Sector('Healthcare', Icons.favorite_rounded, AppColors.icTealBg,
        AppColors.icTealFg, 180, 24, 5),
    _Sector('Consumer Discretionary', Icons.shopping_bag_rounded,
        AppColors.icOrangeBg, AppColors.icOrangeFg, 160, 31, 6),
  ];

  @override
  Widget build(BuildContext context) {
    final p = _P.of(context);
    final total = _sectors.map((s) => s.cap).reduce((a, b) => a + b);
    return ListView(
      padding: EdgeInsets.fromLTRB(16, 16, 16, 28),
      children: [
        _headerBar(context, 'Sector Dashboard',
            'GCC market by sector (USD market cap)'),
        for (final s in _sectors) ...[
          _card(
            context,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: s.bg,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      alignment: Alignment.center,
                      child: Icon(s.icon, color: s.fg, size: 18),
                    ),
                    SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(s.name,
                              style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w700,
                                  color: p.t1)),
                          Text('${s.companies} companies · ${s.countries} countries',
                              style: TextStyle(fontSize: 11, color: p.t3)),
                        ],
                      ),
                    ),
                    Text('\$${s.cap}B',
                        style: AppTheme.heading(size: 14, color: p.t1)),
                  ],
                ),
                SizedBox(height: 8),
                Container(
                  height: 5,
                  decoration: BoxDecoration(
                    color: p.bg,
                    borderRadius: BorderRadius.circular(3),
                  ),
                  child: FractionallySizedBox(
                    alignment: Alignment.centerLeft,
                    widthFactor: s.cap / total,
                    child: Container(
                      decoration: BoxDecoration(
                        color: s.fg,
                        borderRadius: BorderRadius.circular(3),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          SizedBox(height: 10),
        ],
      ],
    );
  }
}

class _Sector {
  final String name;
  final IconData icon;
  final Color bg, fg;
  final int cap, companies, countries;
  const _Sector(this.name, this.icon, this.bg, this.fg, this.cap, this.companies,
      this.countries);
}

// =====================================================================
// 20. Fractional Shares
// =====================================================================
class FractionalSharesScreen extends StatelessWidget {
  const FractionalSharesScreen({super.key});

  static const _examples = <(String, String, double, double)>[
    ('Saudi Aramco', '2222.SR', 27.85, 0.50),
    ('Al Rajhi Bank', '1120.SR', 86.40, 0.25),
    ('Emaar Properties', 'EMAAR.AE', 8.45, 1.00),
    ('Qatar National Bank', 'QNBK.QA', 16.20, 0.75),
  ];

  @override
  Widget build(BuildContext context) {
    final p = _P.of(context);
    return ListView(
      padding: EdgeInsets.fromLTRB(16, 16, 16, 28),
      children: [
        _headerBar(context, 'Fractional Shares',
            'Invest any amount — even partial shares'),
        Container(
          padding: EdgeInsets.all(16),
          decoration: BoxDecoration(
            gradient: LinearGradient(colors: [
              AppColors.icAmberFg,
              AppColors.icOrangeFg,
            ]),
            borderRadius: BorderRadius.circular(14),
          ),
          child: Row(
            children: [
              Icon(Icons.pie_chart_rounded, color: Colors.white, size: 28),
              SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Start with as little as \$1',
                        style: TextStyle(
                            color: Colors.white,
                            fontSize: 15,
                            fontWeight: FontWeight.w800)),
                    Text('Own a slice of any GCC blue chip',
                        style: TextStyle(color: Colors.white70, fontSize: 12)),
                  ],
                ),
              ),
            ],
          ),
        ),
        SizedBox(height: 18),
        _sectionTitle('How it works', p),
        _card(
          context,
          child: Column(
            children: [
              for (final (icon, title, body) in [
                (Icons.attach_money_rounded, 'Pick an amount',
                    'Decide how much you want to invest — say \$50.'),
                (Icons.pie_chart_rounded, 'Get a fraction',
                    "If a share costs \$200, you get 0.25 shares — same gains, same dividends, proportionally."),
                (Icons.timeline_rounded, 'Track your slice',
                    'Your fractional holdings show up in the portfolio just like full shares.'),
              ])
                Padding(
                  padding: EdgeInsets.symmetric(vertical: 8),
                  child: Row(
                    children: [
                      Container(
                        width: 36,
                        height: 36,
                        decoration: BoxDecoration(
                          color: AppColors.icAmberBg,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        alignment: Alignment.center,
                        child: Icon(icon,
                            color: AppColors.icAmberFg, size: 16),
                      ),
                      SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(title,
                                style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w700,
                                    color: p.t1)),
                            Text(body,
                                style: TextStyle(
                                    fontSize: 11, color: p.t3, height: 1.45)),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
        ),
        SizedBox(height: 18),
        _sectionTitle('Try it', p),
        for (final e in _examples) ...[
          _card(
            context,
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(e.$1,
                          style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: p.t1)),
                      Text(e.$2,
                          style: TextStyle(fontSize: 11, color: p.t3)),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text('${e.$4} share',
                        style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: AppColors.blue)),
                    Text('\$${(e.$3 * e.$4).toStringAsFixed(2)}',
                        style: AppTheme.heading(size: 14, color: p.t1)),
                  ],
                ),
              ],
            ),
          ),
          SizedBox(height: 8),
        ],
      ],
    );
  }
}

// =====================================================================
// 21. Quant Lab hub
// =====================================================================
class QuantHubScreen extends StatelessWidget {
  const QuantHubScreen({super.key});

  static const _tools = <_QTool>[
    _QTool('Factor Models', 'Size, value, momentum, quality, low-vol',
        Icons.scatter_plot_rounded, AppColors.icPurpleFg,
        '/quant/factor-models'),
    _QTool('GCC Tools', 'Currency pegs, oil sensitivity, dividend cycles',
        Icons.handyman_rounded, AppColors.icTealFg, '/quant/gcc-tools'),
    _QTool('Portfolio Optimizer', 'Mean-variance, risk-parity, Black-Litterman',
        Icons.tune_rounded, AppColors.icBlueFg, '/quant/optimizer'),
    _QTool('Regression Lab', 'OLS, ridge, lasso, time-series',
        Icons.show_chart_rounded, AppColors.icAmberFg, '/quant/regression'),
    _QTool('Relative Value', 'Z-scores vs sector peers',
        Icons.compare_arrows_rounded, AppColors.icOrangeFg,
        '/quant/relative-value'),
    _QTool('Risk Analytics', 'VaR, CVaR, drawdown, volatility',
        Icons.shield_rounded, AppColors.icRedFg, '/quant/risk'),
    _QTool('Valuation Workbench', 'DCF, comparables, dividend discount',
        Icons.calculate_rounded, AppColors.icGreenFg, '/quant/valuation'),
    _QTool('Vision 2030 Tracker', 'Saudi diversification themes',
        Icons.flag_circle_rounded, AppColors.icNavyFg, '/quant/vision-2030'),
  ];

  @override
  Widget build(BuildContext context) {
    final p = _P.of(context);
    return ListView(
      padding: EdgeInsets.fromLTRB(16, 16, 16, 28),
      children: [
        _headerBar(context, 'Quant Lab', 'Factor models, optimization & risk'),
        for (final t in _tools) ...[
          InkWell(
            onTap: () => Navigator.of(context).pushNamed(t.path),
            child: _card(
              context,
              child: Row(
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: t.color.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    alignment: Alignment.center,
                    child: Icon(t.icon, color: t.color, size: 20),
                  ),
                  SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(t.title,
                            style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w700,
                                color: p.t1)),
                        Text(t.subtitle,
                            style: TextStyle(fontSize: 11, color: p.t3)),
                      ],
                    ),
                  ),
                  Icon(Icons.chevron_right_rounded, color: p.t3, size: 18),
                ],
              ),
            ),
          ),
          SizedBox(height: 10),
        ],
      ],
    );
  }
}

class _QTool {
  final String title, subtitle, path;
  final IconData icon;
  final Color color;
  const _QTool(this.title, this.subtitle, this.icon, this.color, this.path);
}

// =====================================================================
// 22. Annual Reports (Filings)
// =====================================================================
class FilingsScreen extends StatelessWidget {
  const FilingsScreen({super.key});

  static const _reports = <(String, String, String, String, String)>[
    ('Saudi Aramco', '2222.SR', '🇸🇦', 'Annual Report 2025', '12.4 MB'),
    ('Al Rajhi Bank', '1120.SR', '🇸🇦', 'Annual Report 2025', '8.7 MB'),
    ('SABIC', '2010.SR', '🇸🇦', 'Annual Report 2025', '9.2 MB'),
    ('Saudi Telecom', '7010.SR', '🇸🇦', 'Annual Report 2025', '6.8 MB'),
    ('Emirates NBD', 'ENBD.AE', '🇦🇪', 'Annual Report 2025', '7.5 MB'),
    ('Emaar Properties', 'EMAAR.AE', '🇦🇪', 'Annual Report 2025', '5.9 MB'),
    ('Qatar National Bank', 'QNBK.QA', '🇶🇦', 'Annual Report 2025', '8.1 MB'),
    ('National Bank of Kuwait', 'NBK.KW', '🇰🇼', 'Annual Report 2025', '6.4 MB'),
    ('Bank Muscat', 'BKMB.OM', '🇴🇲', 'Annual Report 2025', '5.2 MB'),
    ('Ahli United Bank', 'AUB.BH', '🇧🇭', 'Annual Report 2025', '5.8 MB'),
  ];

  @override
  Widget build(BuildContext context) {
    final p = _P.of(context);
    return ListView(
      padding: EdgeInsets.fromLTRB(16, 16, 16, 28),
      children: [
        _headerBar(context, 'Annual Reports', 'SEC & CMA filings'),
        for (final r in _reports) ...[
          _card(
            context,
            child: Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: AppColors.icRedBg,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  alignment: Alignment.center,
                  child: Icon(Icons.picture_as_pdf_rounded,
                      color: AppColors.icRedFg, size: 18),
                ),
                SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(r.$3, style: TextStyle(fontSize: 14)),
                          SizedBox(width: 6),
                          Expanded(
                            child: Text(r.$1,
                                style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w700,
                                    color: p.t1)),
                          ),
                        ],
                      ),
                      Text('${r.$2} · ${r.$4} · ${r.$5}',
                          style: TextStyle(fontSize: 11, color: p.t3)),
                    ],
                  ),
                ),
                Icon(Icons.download_rounded, size: 18, color: p.t3),
              ],
            ),
          ),
          SizedBox(height: 8),
        ],
      ],
    );
  }
}

// =====================================================================
// 23. Achievements
// =====================================================================
class AchievementsScreen extends StatelessWidget {
  const AchievementsScreen({super.key});

  static const _achievements = <_Achievement>[
    _Achievement('First Login', 'Sign in to Ashom', Icons.login_rounded,
        AppColors.icBlueFg, true),
    _Achievement('Portfolio Pioneer', 'Add your first holding',
        Icons.account_balance_wallet_rounded, AppColors.icGreenFg, true),
    _Achievement('Watchlist Warrior', 'Watch 5+ companies',
        Icons.star_rounded, AppColors.icAmberFg, true),
    _Achievement('Sector Explorer', 'View all 11 sectors',
        Icons.layers_rounded, AppColors.icPurpleFg, false),
    _Achievement('Comparison Pro', 'Run 10 comparisons',
        Icons.compare_arrows_rounded, AppColors.icTealFg, false),
    _Achievement('GCC Globetrotter', 'View companies from all 6 countries',
        Icons.public_rounded, AppColors.icNavyFg, false),
    _Achievement('Dark Knight', 'Enable dark mode',
        Icons.dark_mode_rounded, AppColors.navy, true),
    _Achievement('Calculator Wizard', 'Use the Zakat calculator',
        Icons.calculate_rounded, AppColors.icGreenFg, false),
    _Achievement('Quant Apprentice', 'Open Quant Lab',
        Icons.bolt_rounded, AppColors.icPurpleFg, false),
    _Achievement('Diamond Hands', 'Hold a position for 365 days',
        Icons.diamond_rounded, AppColors.icBlueFg, false),
  ];

  @override
  Widget build(BuildContext context) {
    final p = _P.of(context);
    final unlocked = _achievements.where((a) => a.done).length;
    return ListView(
      padding: EdgeInsets.fromLTRB(16, 16, 16, 28),
      children: [
        _headerBar(context, 'Achievements',
            '$unlocked of ${_achievements.length} unlocked'),
        Container(
          padding: EdgeInsets.all(16),
          decoration: BoxDecoration(
            gradient: LinearGradient(
                colors: [AppColors.icAmberFg, AppColors.icOrangeFg]),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Row(
            children: [
              Icon(Icons.emoji_events_rounded, color: Colors.white, size: 32),
              SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('${(unlocked / _achievements.length * 100).round()}% Complete',
                        style: TextStyle(
                            color: Colors.white,
                            fontSize: 18,
                            fontWeight: FontWeight.w800)),
                    Text('Keep exploring to unlock more',
                        style: TextStyle(color: Colors.white70, fontSize: 12)),
                  ],
                ),
              ),
            ],
          ),
        ),
        SizedBox(height: 18),
        GridView.builder(
          shrinkWrap: true,
          physics: NeverScrollableScrollPhysics(),
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            crossAxisSpacing: 10,
            mainAxisSpacing: 10,
            childAspectRatio: 0.95,
          ),
          itemCount: _achievements.length,
          itemBuilder: (c, i) {
            final a = _achievements[i];
            return Container(
              padding: EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: p.card,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: p.border),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: 52,
                    height: 52,
                    decoration: BoxDecoration(
                      color: a.done
                          ? a.color.withValues(alpha: 0.18)
                          : p.bg,
                      borderRadius: BorderRadius.circular(14),
                    ),
                    alignment: Alignment.center,
                    child: Icon(a.icon,
                        size: 26, color: a.done ? a.color : p.t3),
                  ),
                  SizedBox(height: 10),
                  Text(a.title,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w800,
                          color: a.done ? p.t1 : p.t3)),
                  SizedBox(height: 2),
                  Text(a.subtitle,
                      textAlign: TextAlign.center,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                          fontSize: 10,
                          color: p.t3,
                          height: 1.4)),
                ],
              ),
            );
          },
        ),
      ],
    );
  }
}

class _Achievement {
  final String title, subtitle;
  final IconData icon;
  final Color color;
  final bool done;
  const _Achievement(this.title, this.subtitle, this.icon, this.color, this.done);
}
