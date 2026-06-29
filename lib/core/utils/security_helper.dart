import 'dart:convert';
import 'package:crypto/crypto.dart';

class SecurityHelper {
  /// Generates a SHA256 hash of the given content.
  /// Matches the backend implementation for integrity checks.
  static String hashSHA256(String content) {
    var bytes = utf8.encode(content);
    var digest = sha256.convert(bytes);
    return digest.toString();
  }

  /// Verifies if the content matches the provided hash.
  static bool verifyIntegrity(String content, String hash) {
    return hashSHA256(content) == hash;
  }
}
