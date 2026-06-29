import 'package:flutter/foundation.dart';

class Environment {
  // WordPress Base URL for Articles and Initial Auth
  static const String wpBaseUrl = 'https://pet-atlas.com/wp-json';

  // Live NestJS Backend Base URL for Profiles, Pets, and Permissions
  static String get localBaseUrl {
    if (kReleaseMode) {
      return 'https://api.pet-atlas.com/api';
    }
    return 'http://localhost:3000/api';
  }
}
