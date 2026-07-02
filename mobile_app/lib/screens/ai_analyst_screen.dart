import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../services/market_api.dart';
import '../theme/app_colors.dart';
import '../theme/app_theme.dart';

/// Bilingual translations — mirror `T = { en: {...}, ar: {...} }` in the React source.
class _Lang {
  final String title;
  final String subtitle;
  final String placeholder;
  final String powered;
  final List<_Suggestion> suggestions;

  const _Lang({
    required this.title,
    required this.subtitle,
    required this.placeholder,
    required this.powered,
    required this.suggestions,
  });
}

class _Suggestion {
  final String label;
  final String message;
  final bool chevronLeft; // AR suggestions chevron left; EN chevron right
  const _Suggestion(this.label, this.message, {this.chevronLeft = false});
}

const _en = _Lang(
  title: 'GCC Markets Intelligence',
  subtitle:
      'Ask about companies, sectors, financials, or market trends across 180+ GCC listed companies.',
  placeholder: 'Ask about GCC markets...',
  powered: 'Powered by VIFM AI',
  suggestions: [
    _Suggestion('Analyze Saudi Aramco',
        'Analyze Saudi Aramco financial performance and outlook'),
    _Suggestion('Compare banking sectors',
        'Compare banking sectors across GCC countries'),
    _Suggestion('Top dividend stocks',
        'What are the top dividend stocks in GCC markets?'),
    _Suggestion('UAE market outlook',
        'What is the outlook for UAE capital markets in 2026?'),
  ],
);

const _ar = _Lang(
  title: 'الذكاء المالي لأسواق الخليج',
  subtitle:
      'اسأل عن الشركات والقطاعات والبيانات المالية أو اتجاهات السوق عبر أكثر من 180 شركة مدرجة في دول مجلس التعاون الخليجي.',
  placeholder: 'اسأل عن أسواق الخليج...',
  powered: 'مدعوم من VIFM AI',
  suggestions: [
    _Suggestion('تحليل أرامكو السعودية',
        'تحليل أداء أرامكو السعودية المالي والتوقعات',
        chevronLeft: true),
    _Suggestion('مقارنة القطاع المصرفي',
        'مقارنة القطاعات المصرفية عبر دول مجلس التعاون الخليجي',
        chevronLeft: true),
    _Suggestion('أفضل أسهم التوزيعات',
        'ما هي أفضل أسهم التوزيعات في أسواق الخليج؟',
        chevronLeft: true),
    _Suggestion('توقعات سوق الإمارات',
        'ما هي توقعات أسواق رأس المال في الإمارات لعام 2026؟',
        chevronLeft: true),
  ],
);

class _Message {
  final int id;
  final String role; // 'user' | 'assistant'
  final String content;
  final String lang; // 'en' | 'ar'
  const _Message({
    required this.id,
    required this.role,
    required this.content,
    required this.lang,
  });
}

class AIAnalystScreen extends StatefulWidget {
  const AIAnalystScreen({super.key});

  @override
  State<AIAnalystScreen> createState() => _AIAnalystScreenState();
}

class _AIAnalystScreenState extends State<AIAnalystScreen> {
  final _input = TextEditingController();
  final _scroll = ScrollController();
  final List<_Message> _messages = [];
  String _lang = 'en';
  bool _loading = false;

  _Lang get _t => _lang == 'ar' ? _ar : _en;
  bool get _rtl => _lang == 'ar';

  @override
  void dispose() {
    _input.dispose();
    _scroll.dispose();
    super.dispose();
  }

  Future<void> _send([String? prefill]) async {
    final raw = (prefill ?? _input.text).trim();
    if (raw.isEmpty || _loading) return;

    final msgLang = _lang;
    final userMsg = _Message(
      id: DateTime.now().millisecondsSinceEpoch,
      role: 'user',
      content: raw,
      lang: msgLang,
    );

    // Mirror React behavior: Arabic mode prepends prompt prefix for the API call.
    // (The client-visible message stays the original user text; the *API payload*
    //  would be "$apiMessage" — kept here in a comment so backend wire is 1:1 later.)
    // final apiMessage = msgLang == 'ar'
    //     ? '[User is asking in Arabic. Please respond in Arabic if possible.] $raw'
    //     : raw;

    setState(() {
      _messages.add(userMsg);
      _input.clear();
      _loading = true;
    });
    _scrollToEnd();

    final apiMessage = msgLang == 'ar'
        ? '[User is asking in Arabic. Please respond in Arabic if possible.] $raw'
        : raw;
    final history = _messages
        .where((m) => m.id != userMsg.id)
        .map((m) => {'role': m.role, 'content': m.content})
        .toList();

    try {
      final api = context.read<MarketApi>();
      final reply = await api.analystChat(apiMessage, history);
      if (!mounted) return;
      setState(() {
        _messages.add(_Message(
          id: DateTime.now().millisecondsSinceEpoch,
          role: 'assistant',
          content: reply,
          lang: msgLang,
        ));
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _messages.add(_Message(
          id: DateTime.now().millisecondsSinceEpoch,
          role: 'assistant',
          content: msgLang == 'ar'
              ? 'عذراً، حدث خطأ. الرجاء المحاولة لاحقاً.'
              : "Sorry, I couldn't reach the AI service. Please try again in a moment.",
          lang: msgLang,
        ));
        _loading = false;
      });
    }
    _scrollToEnd();
  }

  void _scrollToEnd() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scroll.hasClients) {
        _scroll.animateTo(
          _scroll.position.maxScrollExtent,
          duration: const Duration(milliseconds: 250),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final dark = Theme.of(context).brightness == Brightness.dark;
    final card = dark ? AppColors.darkCard : Colors.white;
    final border = dark ? AppColors.darkBorder : AppColors.border;
    final text3 = dark ? AppColors.darkText3 : AppColors.text3;
    final bg = dark ? AppColors.darkBg : AppColors.bg;

    return Column(
      children: [
        // Language toggle
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
          child: Center(
            child: Container(
              decoration: BoxDecoration(
                color: card,
                borderRadius: BorderRadius.circular(999),
                border: Border.all(color: border),
              ),
              clipBehavior: Clip.antiAlias,
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  _langPill('EN', 'en'),
                  _langPill('AR', 'ar'),
                ],
              ),
            ),
          ),
        ),
        // Messages area
        Expanded(
          child: _messages.isEmpty
              ? _emptyState(card, border, text3)
              : _chatList(card, border, text3, bg),
        ),
        // Input bar
        Container(
          decoration: BoxDecoration(
            color: card,
            border: Border(top: BorderSide(color: border)),
          ),
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 10),
          child: Column(
            children: [
              Row(
                children: [
                  Expanded(
                    child: Directionality(
                      textDirection:
                          _rtl ? TextDirection.rtl : TextDirection.ltr,
                      child: TextField(
                        controller: _input,
                        enabled: !_loading,
                        onSubmitted: (_) => _send(),
                        textInputAction: TextInputAction.send,
                        decoration: InputDecoration(
                          hintText: _t.placeholder,
                          filled: true,
                          fillColor: bg,
                          contentPadding: const EdgeInsets.symmetric(
                              horizontal: 16, vertical: 10),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(999),
                            borderSide: BorderSide(color: border),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(999),
                            borderSide: BorderSide(color: border),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(999),
                            borderSide: const BorderSide(
                                color: AppColors.blue, width: 1.5),
                          ),
                        ),
                        style: const TextStyle(fontSize: 14),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  _sendButton(),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                _t.powered,
                style: TextStyle(
                  fontSize: 10,
                  color: text3,
                  letterSpacing: 0.3,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _langPill(String label, String value) {
    final active = _lang == value;
    return GestureDetector(
      onTap: () => setState(() => _lang = value),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 5),
        color: active ? AppColors.navy : Colors.transparent,
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: active ? Colors.white : AppColors.text2,
          ),
        ),
      ),
    );
  }

  Widget _sendButton() {
    final disabled = _loading || _input.text.trim().isEmpty;
    return AnimatedContainer(
      duration: const Duration(milliseconds: 120),
      width: 40,
      height: 40,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: disabled ? AppColors.text3 : AppColors.navy,
      ),
      child: Material(
        color: Colors.transparent,
        shape: const CircleBorder(),
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: disabled ? null : () => _send(),
          child: Transform.scale(
            scaleX: _rtl ? -1.0 : 1.0,
            child: const Icon(Icons.send_rounded,
                size: 16, color: Colors.white),
          ),
        ),
      ),
    );
  }

  Widget _emptyState(Color card, Color border, Color text3) {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 12),
      child: Column(
        children: [
          const SizedBox(height: 16),
          Container(
            width: 60,
            height: 60,
            decoration: BoxDecoration(
              color: AppColors.navy,
              borderRadius: BorderRadius.circular(16),
            ),
            alignment: Alignment.center,
            child: const Icon(Icons.auto_awesome_rounded,
                color: Colors.white, size: 28),
          ),
          const SizedBox(height: 12),
          Directionality(
            textDirection: _rtl ? TextDirection.rtl : TextDirection.ltr,
            child: Column(
              children: [
                Text(
                  _t.title,
                  textAlign: TextAlign.center,
                  style: AppTheme.heading(size: 20, color: AppColors.navy),
                ),
                const SizedBox(height: 4),
                ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 300),
                  child: Text(
                    _t.subtitle,
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 13,
                      color: text3,
                      height: 1.4,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate:
                const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 10,
              mainAxisSpacing: 10,
              mainAxisExtent: 66,
            ),
            itemCount: _t.suggestions.length,
            itemBuilder: (context, i) {
              final s = _t.suggestions[i];
              return _SuggestionButton(
                suggestion: s,
                rtl: _rtl,
                card: card,
                border: border,
                onTap: () => _send(s.message),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _chatList(Color card, Color border, Color text3, Color bg) {
    return ListView.separated(
      controller: _scroll,
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
      itemCount: _messages.length + (_loading ? 1 : 0),
      separatorBuilder: (_, _) => const SizedBox(height: 10),
      itemBuilder: (context, i) {
        if (_loading && i == _messages.length) {
          return _loadingBubble(card, border, text3);
        }
        final m = _messages[i];
        return _MessageBubble(msg: m, card: card, border: border, text3: text3);
      },
    );
  }

  Widget _loadingBubble(Color card, Color border, Color text3) {
    return Row(
      children: [
        Container(
          width: 28,
          height: 28,
          decoration: BoxDecoration(
            color: AppColors.blueLight,
            borderRadius: BorderRadius.circular(8),
          ),
          alignment: Alignment.center,
          child: const Icon(Icons.smart_toy_rounded,
              size: 14, color: AppColors.blue),
        ),
        const SizedBox(width: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          decoration: BoxDecoration(
            color: card,
            border: Border.all(color: border),
            borderRadius: const BorderRadius.only(
              topLeft: Radius.circular(12),
              topRight: Radius.circular(12),
              bottomRight: Radius.circular(12),
              bottomLeft: Radius.circular(10),
            ),
          ),
          child: SizedBox(
            width: 14,
            height: 14,
            child: CircularProgressIndicator(
              strokeWidth: 2,
              color: text3,
            ),
          ),
        ),
      ],
    );
  }
}

/* ───── Suggestion button ───── */

class _SuggestionButton extends StatelessWidget {
  const _SuggestionButton({
    required this.suggestion,
    required this.rtl,
    required this.card,
    required this.border,
    required this.onTap,
  });

  final _Suggestion suggestion;
  final bool rtl;
  final Color card;
  final Color border;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          decoration: BoxDecoration(
            color: card,
            border: Border.all(color: border),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Directionality(
            textDirection: rtl ? TextDirection.rtl : TextDirection.ltr,
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    suggestion.label,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: AppColors.navy,
                      height: 1.3,
                    ),
                  ),
                ),
                const SizedBox(width: 6),
                Icon(
                  suggestion.chevronLeft
                      ? Icons.chevron_left_rounded
                      : Icons.chevron_right_rounded,
                  size: 16,
                  color: AppColors.text3,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/* ───── Message bubble ───── */

class _MessageBubble extends StatelessWidget {
  const _MessageBubble({
    required this.msg,
    required this.card,
    required this.border,
    required this.text3,
  });

  final _Message msg;
  final Color card;
  final Color border;
  final Color text3;

  @override
  Widget build(BuildContext context) {
    final isUser = msg.role == 'user';
    final isAr = msg.lang == 'ar';
    final tagColor = isAr ? const Color(0xFF00A878) : AppColors.blue;

    final assistantAvatar = Container(
      width: 28,
      height: 28,
      decoration: BoxDecoration(
        color: AppColors.blueLight,
        borderRadius: BorderRadius.circular(8),
      ),
      alignment: Alignment.center,
      child: const Icon(Icons.smart_toy_rounded,
          size: 14, color: AppColors.blue),
    );

    final userAvatar = Container(
      width: 28,
      height: 28,
      decoration: BoxDecoration(
        color: AppColors.blueLight,
        borderRadius: BorderRadius.circular(8),
      ),
      alignment: Alignment.center,
      child: const Icon(Icons.person_rounded,
          size: 14, color: AppColors.navy),
    );

    final bubble = Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      constraints: const BoxConstraints(maxWidth: 280),
      decoration: BoxDecoration(
        color: isUser ? AppColors.navy : card,
        border: isUser ? null : Border.all(color: border),
        borderRadius: BorderRadius.only(
          topLeft: const Radius.circular(12),
          topRight: const Radius.circular(12),
          bottomLeft:
              Radius.circular(isUser ? 12 : 6),
          bottomRight:
              Radius.circular(isUser ? 6 : 12),
        ),
      ),
      child: Directionality(
        textDirection: isAr ? TextDirection.rtl : TextDirection.ltr,
        child: Text(
          msg.content,
          style: TextStyle(
            fontSize: 13,
            height: 1.55,
            color: isUser ? Colors.white : AppColors.navy,
          ),
        ),
      ),
    );

    final tag = Container(
      padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
      decoration: BoxDecoration(
        color: isUser ? tagColor : AppColors.text3,
        borderRadius: BorderRadius.circular(3),
      ),
      child: Text(
        isAr ? 'AR' : 'EN',
        style: const TextStyle(
          color: Colors.white,
          fontSize: 9,
          fontWeight: FontWeight.w600,
        ),
      ),
    );

    final messageColumn = Column(
      crossAxisAlignment:
          isUser ? CrossAxisAlignment.end : CrossAxisAlignment.start,
      children: [
        if (!isUser)
          Padding(
            padding: const EdgeInsets.only(bottom: 2),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'AI',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                    color: text3,
                    letterSpacing: 0.5,
                  ),
                ),
                const SizedBox(width: 6),
                tag,
              ],
            ),
          ),
        bubble,
        if (isUser)
          Padding(
            padding: const EdgeInsets.only(top: 2),
            child: tag,
          ),
      ],
    );

    return Row(
      mainAxisAlignment:
          isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: isUser
          ? [
              Flexible(child: messageColumn),
              const SizedBox(width: 8),
              userAvatar,
            ]
          : [
              assistantAvatar,
              const SizedBox(width: 8),
              Flexible(child: messageColumn),
            ],
    );
  }
}
