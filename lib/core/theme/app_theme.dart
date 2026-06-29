import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_colors.dart';

class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      colorScheme: const ColorScheme.light(
        primary: AppColors.primary,
        surface: AppColors.backgroundLight,
        onSurface: AppColors.slate900,
      ),
      scaffoldBackgroundColor: AppColors.backgroundLight,
      textTheme: GoogleFonts.interTextTheme(ThemeData.light().textTheme).apply(
        bodyColor: AppColors.slate900,
        displayColor: AppColors.slate900,
      ),
      iconTheme: const IconThemeData(
        color: AppColors.slate900,
        size: 24,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent, // Adjust based on usage
        elevation: 0,
        iconTheme: IconThemeData(color: AppColors.slate900),
        titleTextStyle: TextStyle(
          color: AppColors.slate900,
          fontSize: 20,
          fontWeight: FontWeight.bold,
          letterSpacing: -0.5,
        ),
      ),
    );
  }

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      colorScheme: const ColorScheme.dark(
        primary: AppColors.primary,
        surface: AppColors.backgroundDark,
        onSurface: AppColors.slate100,
      ),
      scaffoldBackgroundColor: AppColors.backgroundDark,
      textTheme: GoogleFonts.interTextTheme(ThemeData.dark().textTheme).apply(
        bodyColor: AppColors.slate100,
        displayColor: AppColors.slate100,
      ),
      iconTheme: const IconThemeData(
        color: AppColors.slate100,
        size: 24,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: IconThemeData(color: AppColors.slate100),
        titleTextStyle: TextStyle(
          color: AppColors.slate100,
          fontSize: 20,
          fontWeight: FontWeight.bold,
          letterSpacing: -0.5,
        ),
      ),
    );
  }
}
