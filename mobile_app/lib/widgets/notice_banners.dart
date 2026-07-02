import 'package:flutter/material.dart';

import '../theme/app_colors.dart';

/// "Demo data — illustrative prices, not live." banner.
/// Mirrors frontend/src/components/shared/DemoDataBanner.jsx.
class DemoDataBanner extends StatelessWidget {
  const DemoDataBanner({super.key, this.note, this.margin});

  final String? note;
  final EdgeInsetsGeometry? margin;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: margin ??
          const EdgeInsets.fromLTRB(20, 12, 20, 0),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: AppColors.icAmberFg.withValues(alpha: 0.08),
        border: Border.all(
            color: AppColors.icAmberFg.withValues(alpha: 0.35)),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Padding(
            padding: EdgeInsets.only(top: 1, right: 8),
            child: Icon(Icons.warning_amber_rounded,
                size: 14, color: Color(0xFFA37300)),
          ),
          Expanded(
            child: Text.rich(
              TextSpan(
                style: const TextStyle(
                    fontSize: 11, height: 1.35, color: Color(0xFF7A5500)),
                children: [
                  const TextSpan(
                      text: 'Demo data',
                      style: TextStyle(fontWeight: FontWeight.w700)),
                  TextSpan(
                      text: ' — illustrative prices, not live.'
                          '${note != null ? ' $note' : ''}'),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// "Preview / coming soon" banner for non-functional preview pages.
/// Mirrors frontend/src/components/shared/ComingSoonBanner.jsx.
class ComingSoonBanner extends StatelessWidget {
  const ComingSoonBanner({super.key, required this.note, this.margin});

  final String note;
  final EdgeInsetsGeometry? margin;

  @override
  Widget build(BuildContext context) {
    const blue = Color(0xFF2C5C8F);
    return Container(
      margin: margin ??
          const EdgeInsets.fromLTRB(20, 12, 20, 0),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: AppColors.blue.withValues(alpha: 0.08),
        border: Border.all(color: AppColors.blue.withValues(alpha: 0.35)),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Padding(
            padding: EdgeInsets.only(top: 1, right: 8),
            child: Icon(Icons.schedule_rounded, size: 14, color: blue),
          ),
          Expanded(
            child: Text.rich(
              TextSpan(
                style: const TextStyle(
                    fontSize: 11, height: 1.35, color: blue),
                children: [
                  const TextSpan(
                      text: 'Preview / coming soon',
                      style: TextStyle(fontWeight: FontWeight.w700)),
                  TextSpan(text: ' — $note'),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
