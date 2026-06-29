import 'package:flutter/widgets.dart';
import '../../l10n/app_localizations.dart';

class ErrorTranslator {
  static String translate(String errorCode, BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    switch (errorCode) {
      // JWT Auth Errors
      case 'jwt_auth_invalid_username':
      case 'jwt_auth_invalid_password':
      case 'jwt_auth_empty_username':
      case 'jwt_auth_empty_password':
      case 'invalid_username':
      case 'invalid_password':
      case '[jwt_auth] invalid_email':
      case '[jwt_auth] invalid_username':
      case 'invalid_username_or_password':
        return l10n.errInvalidCredentials;

      // WordPress REST API User Errors
      case 'rest_user_invalid_email':
      case 'rest_invalid_email':
        return l10n.errInvalidEmailFormat;
      case 'rest_user_user_exists':
      case 'existing_user_login':
      case 'rest_invalid_username':
        return l10n.errUsernameExists;
      case 'rest_user_email_exists':
        return l10n.errEmailExists;

      // Common REST Errors
      case 'rest_forbidden':
      case 'rest_cannot_create':
      case 'rest_invalid_param':
        return l10n.errUnauthorized;
      
      case 'security_block_403':
        return l10n.errForbidden;
      
      case 'err_security_block_bot':
        return 'Security verification required. Please open the website to solve the challenge.';

      default:
        return l10n.errGenericServer;
    }
  }
}
