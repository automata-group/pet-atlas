import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

class SearchField extends StatelessWidget {
  final String hintText;
  final TextEditingController? controller;
  final VoidCallback? onFilterPressed;
  final void Function(String)? onSubmitted;
  final VoidCallback? onSearchPressed;

  const SearchField({
    super.key,
    required this.hintText,
    this.controller,
    this.onFilterPressed,
    this.onSubmitted,
    this.onSearchPressed,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Container(
      height: 56,
      decoration: BoxDecoration(
        color: isDark ? AppColors.slate800 : Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: TextField(
        controller: controller,
        onSubmitted: onSubmitted,
        textInputAction: TextInputAction.search,
        decoration: InputDecoration(
          hintText: hintText,
          hintStyle: theme.textTheme.bodyMedium?.copyWith(
            color: isDark ? AppColors.slate400 : AppColors.slate500,
          ),
          prefixIcon: IconButton(
            icon: const Icon(
              Icons.search,
              color: AppColors.primary,
            ),
            onPressed: onSearchPressed,
          ),
          suffixIcon: IconButton(
            icon: Icon(
              Icons.tune,
              color: isDark ? AppColors.slate400 : AppColors.slate400,
            ),
            onPressed: onFilterPressed,
          ),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(vertical: 16),
        ),
      ),
    );
  }
}
