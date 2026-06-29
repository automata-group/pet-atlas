import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../l10n/app_localizations.dart';

class SecuritySettingsScreen extends StatelessWidget {
  const SecuritySettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final l10n = AppLocalizations.of(context)!;

    return Scaffold(
      appBar: AppBar(title: Text(l10n.profileSecurity), centerTitle: true),
      body: ListView(
        padding: const EdgeInsets.all(24.0),
        children: [
          Container(
            decoration: BoxDecoration(
              color: isDark ? AppColors.slate800 : Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: isDark ? AppColors.slate700 : AppColors.slate100,
              ),
            ),
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(Icons.password, color: AppColors.primary),
                  title: Text(l10n.profileChangePassword),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () {},
                ),
                Divider(
                  color: isDark ? AppColors.slate700 : AppColors.slate100,
                  height: 1,
                ),
                ListTile(
                  leading: const Icon(Icons.security, color: AppColors.primary),
                  title: Text(l10n.profileEnable2FA),
                  trailing: Switch(
                    value: false,
                    activeTrackColor: AppColors.primary,
                    onChanged: (bool value) {},
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
