import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../l10n/app_localizations.dart';

class SavedBlogsScreen extends StatelessWidget {
  const SavedBlogsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context)!;

    return Scaffold(
      appBar: AppBar(title: Text(l10n.profileSavedBlogs), centerTitle: true),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.bookmark_border,
              size: 64,
              color: AppColors.slate400.withValues(alpha: 0.5),
            ),
            const SizedBox(height: 16),
            Text(
              l10n.profileNoSavedBlogs,
              style: theme.textTheme.titleMedium?.copyWith(
                color: AppColors.slate500,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
