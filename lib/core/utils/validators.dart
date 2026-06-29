import 'package:flutter/widgets.dart';
import '../../l10n/app_localizations.dart';

class Validators {
  static String? validateEmail(String? value, BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    if (value == null || value.isEmpty) {
      return l10n.errEmailRequired;
    }
    final emailRegExp = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
    if (!emailRegExp.hasMatch(value)) {
      return l10n.errEmailInvalid;
    }
    return null;
  }

  static String? validatePassword(String? value, BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    if (value == null || value.isEmpty) {
      return l10n.errPasswordRequired;
    }
    if (value.length < 6) {
      return l10n.errPasswordTooShort;
    }
    return null;
  }

  static String? validateConfirmPassword(String? value, String password, BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    if (value == null || value.isEmpty) {
      return l10n.errConfirmPasswordRequired;
    }
    if (value != password) {
      return l10n.errPasswordsDoNotMatch;
    }
    return null;
  }

  static String? validateUsername(String? value, BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    if (value == null || value.isEmpty) {
      return l10n.errUsernameRequired;
    }
    if (value.length < 3) {
      return l10n.errUsernameTooShort;
    }
    return null;
  }

  static String? validateRequired(String? value, String fieldName, BuildContext context) {
    if (value == null || value.isEmpty) {
      return '$fieldName is required';
    }
    return null;
  }
}
