import 'package:flutter/material.dart';

import '../theme/app_colors.dart';
import '../theme/app_theme.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});
  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  late List<_Notif> _items;

  @override
  void initState() {
    super.initState();
    _items = List.from(_seed);
  }

  static const _seed = <_Notif>[
    _Notif(
      id: '1',
      title: 'Achievement unlocked: Portfolio Pioneer',
      body: 'You added your first holding. Keep going!',
      timeAgo: '5m',
      type: _NotifType.achievement,
      read: false,
    ),
    _Notif(
      id: '2',
      title: 'Aramco earnings beat by 4%',
      body: 'Price moved +3.8% in after-hours',
      timeAgo: '10m',
      type: _NotifType.report,
      read: false,
    ),
    _Notif(
      id: '3',
      title: 'Login streak: 7 days 🔥',
      body: 'Daily check-in unlocked',
      timeAgo: '1h',
      type: _NotifType.streak,
      read: false,
    ),
    _Notif(
      id: '4',
      title: 'Your portfolio crossed \$100K',
      body: 'New personal best — keep going',
      timeAgo: '1h',
      type: _NotifType.portfolio,
      read: true,
    ),
    _Notif(
      id: '5',
      title: 'TASI closed +1.24% today',
      body: 'Heavyweights led the rally',
      timeAgo: '3h',
      type: _NotifType.market,
      read: true,
    ),
    _Notif(
      id: '6',
      title: 'Price alert: 2222.SR above \$28',
      body: 'Aramco hit your target',
      timeAgo: '5h',
      type: _NotifType.alert,
      read: true,
    ),
  ];

  int get _unread => _items.where((n) => !n.read).length;

  void _toggleRead(String id) {
    setState(() {
      _items = _items
          .map((n) => n.id == id ? n.copyWith(read: !n.read) : n)
          .toList();
    });
  }

  void _markAllRead() {
    setState(() {
      _items = _items.map((n) => n.copyWith(read: true)).toList();
    });
  }

  void _dismiss(String id) {
    setState(() => _items = _items.where((n) => n.id != id).toList());
  }

  @override
  Widget build(BuildContext context) {
    final dark = Theme.of(context).brightness == Brightness.dark;
    final card = dark ? AppColors.darkCard : Colors.white;
    final border = dark ? AppColors.darkBorder : AppColors.border;
    final text1 = dark ? AppColors.darkText1 : AppColors.text1;
    final text2 = dark ? AppColors.darkText2 : AppColors.text2;
    final text3 = dark ? AppColors.darkText3 : AppColors.text3;

    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 18, 20, 28),
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Notifications',
                    style: AppTheme.heading(size: 22, color: text1)),
                const SizedBox(height: 2),
                Text(
                    _unread == 0
                        ? 'All caught up'
                        : '$_unread unread',
                    style: TextStyle(fontSize: 12, color: text3)),
              ],
            ),
            const Spacer(),
            if (_unread > 0)
              TextButton.icon(
                onPressed: _markAllRead,
                icon: const Icon(Icons.done_all_rounded, size: 16),
                label: const Text('Mark all read',
                    style: TextStyle(
                        fontSize: 12, fontWeight: FontWeight.w700)),
              ),
          ],
        ),
        const SizedBox(height: 14),
        if (_items.isEmpty)
          Container(
            padding: const EdgeInsets.all(36),
            decoration: BoxDecoration(
              color: card,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: border),
            ),
            alignment: Alignment.center,
            child: Column(
              children: [
                Icon(Icons.notifications_none_rounded,
                    size: 36, color: text3),
                const SizedBox(height: 8),
                Text('No notifications',
                    style: TextStyle(fontSize: 13, color: text2)),
              ],
            ),
          )
        else
          for (final n in _items)
            Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: Dismissible(
                key: ValueKey(n.id),
                background: Container(
                  alignment: Alignment.centerLeft,
                  padding: const EdgeInsets.only(left: 20),
                  decoration: BoxDecoration(
                    color: AppColors.red,
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: const Icon(Icons.delete_outline_rounded,
                      color: Colors.white),
                ),
                secondaryBackground: Container(
                  alignment: Alignment.centerRight,
                  padding: const EdgeInsets.only(right: 20),
                  decoration: BoxDecoration(
                    color: AppColors.red,
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: const Icon(Icons.delete_outline_rounded,
                      color: Colors.white),
                ),
                onDismissed: (_) => _dismiss(n.id),
                child: InkWell(
                  onTap: () => _toggleRead(n.id),
                  borderRadius: BorderRadius.circular(14),
                  child: Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: card,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: border),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (!n.read)
                          Container(
                            width: 4,
                            margin:
                                const EdgeInsets.only(right: 10, top: 2, bottom: 2),
                            decoration: BoxDecoration(
                              color: AppColors.blue,
                              borderRadius: BorderRadius.circular(2),
                            ),
                          ),
                        Container(
                          width: 36,
                          height: 36,
                          decoration: BoxDecoration(
                            color: n.type.bg,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          alignment: Alignment.center,
                          child: Icon(n.type.icon, color: n.type.fg, size: 18),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(n.title,
                                  style: TextStyle(
                                      fontSize: 13,
                                      fontWeight: n.read
                                          ? FontWeight.w500
                                          : FontWeight.w700,
                                      color: text1)),
                              const SizedBox(height: 3),
                              Text(n.body,
                                  style: TextStyle(
                                      fontSize: 12, color: text2, height: 1.4)),
                            ],
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(n.timeAgo,
                            style: TextStyle(fontSize: 11, color: text3)),
                      ],
                    ),
                  ),
                ),
              ),
            ),
        const SizedBox(height: 10),
        Text(
          'Sample notifications — real-time alerts coming soon',
          textAlign: TextAlign.center,
          style: TextStyle(
              fontSize: 11, color: text3, fontStyle: FontStyle.italic),
        ),
      ],
    );
  }
}

enum _NotifType { achievement, report, streak, portfolio, market, alert }

extension on _NotifType {
  IconData get icon => switch (this) {
        _NotifType.achievement => Icons.emoji_events_rounded,
        _NotifType.report => Icons.description_rounded,
        _NotifType.streak => Icons.local_fire_department_rounded,
        _NotifType.portfolio => Icons.trending_up_rounded,
        _NotifType.market => Icons.show_chart_rounded,
        _NotifType.alert => Icons.notifications_active_rounded,
      };
  Color get bg => switch (this) {
        _NotifType.achievement => AppColors.icAmberBg,
        _NotifType.report => AppColors.icBlueBg,
        _NotifType.streak => AppColors.icRedBg,
        _NotifType.portfolio => AppColors.icGreenBg,
        _NotifType.market => AppColors.icPurpleBg,
        _NotifType.alert => AppColors.icOrangeBg,
      };
  Color get fg => switch (this) {
        _NotifType.achievement => AppColors.icAmberFg,
        _NotifType.report => AppColors.icBlueFg,
        _NotifType.streak => AppColors.icRedFg,
        _NotifType.portfolio => AppColors.icGreenFg,
        _NotifType.market => AppColors.icPurpleFg,
        _NotifType.alert => AppColors.icOrangeFg,
      };
}

class _Notif {
  final String id, title, body, timeAgo;
  final _NotifType type;
  final bool read;
  const _Notif({
    required this.id,
    required this.title,
    required this.body,
    required this.timeAgo,
    required this.type,
    required this.read,
  });
  _Notif copyWith({bool? read}) => _Notif(
        id: id,
        title: title,
        body: body,
        timeAgo: timeAgo,
        type: type,
        read: read ?? this.read,
      );
}
