import 'package:flutter/foundation.dart';
import 'package:dio/dio.dart';
import '../../../core/network/api_client.dart';
import 'token_service.dart';

class AuthRepository {
  // ignore: unused_field
  final WpApiClient _wpClient;
  final LocalApiClient _localClient;
  final TokenService _tokenService;

  AuthRepository({
    required WpApiClient wpClient,
    required LocalApiClient localClient,
    required TokenService tokenService,
  })  : _wpClient = wpClient,
        _localClient = localClient,
        _tokenService = tokenService;

  Future<Map<String, dynamic>> login({
    required String username,
    required String password,
  }) async {
    try {
      // تسجيل الدخول عبر الباك إند كوسيط لتجنب حظر Cloudflare/WAF
      final response = await _localClient.dio.post(
        '/auth/login',
        data: {
          'username': username,
          'password': password,
        },
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        if (response.data is! Map) {
          throw Exception('err_invalid_response_format');
        }

        final token = response.data['token'];
        if (token != null) {
          await _tokenService.saveToken(token);
        }

        // الباك إند يقوم مسبقاً بالمزامنة ويعيد بيانات المستخدم جاهزة
        return {
          ...response.data,
          'localUser': response.data['user'],
        };
      } else {
        final data = response.data;
        if (data is Map) {
          throw Exception(data['message'] ?? data['code'] ?? 'err_generic_server');
        }
        throw Exception('err_generic_server');
      }
    } on DioException catch (e) {
      debugPrint('DEBUG: DioException during login');
      debugPrint('DEBUG: URI: ${e.requestOptions.uri}');
      debugPrint('DEBUG: Status: ${e.response?.statusCode}');
      debugPrint('DEBUG: Data: ${e.response?.data}');

      // الباك إند يرسل رسائل أخطاء موحدة وواضحة
      if (e.response?.statusCode == 403 || (e.response?.data is Map && e.response?.data['message'] == 'err_security_block_bot')) {
        throw Exception('err_security_block_bot');
      }

      final responseData = e.response?.data;
      if (responseData is Map) {
        // أصبحنا نعتمد على حقل message القياسي من NestJS
        throw Exception(responseData['message'] ?? responseData['code'] ?? 'err_generic_server');
      }
      throw Exception('err_generic_server');
    }
  }

  Future<void> register({
    required String username,
    required String email,
    required String password,
  }) async {
    try {
      final response = await _localClient.dio.post(
        '/auth/register',
        data: {
          'username': username,
          'email': email,
          'password': password, 
        },
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        // Automatically login after registration to trigger JIT sync
        await login(username: username, password: password);
      } else {
        final data = response.data;
        if (data is Map) {
          throw Exception('${data['message'] ?? data['code'] ?? 'err_generic_server'} | RAW: $data');
        }
        throw Exception('err_generic_server | RAW: $data');
      }
    } on DioException catch (e) {
      debugPrint('DEBUG: DioException during register');
      debugPrint('DEBUG: URI: ${e.requestOptions.uri}');
      debugPrint('DEBUG: Status: ${e.response?.statusCode}');
      debugPrint('DEBUG: Data: ${e.response?.data}');

      if (e.response == null) {
        throw Exception('err_network_or_blocked | Msg: ${e.message} | Type: ${e.type}');
      }

      final responseData = e.response?.data;
      if (responseData is Map) {
        throw Exception(responseData['message'] ?? responseData['code'] ?? 'err_generic_server');
      }
      throw Exception('err_generic_server');
    }
  }

  Future<void> logout() async {
    await _tokenService.deleteToken();
  }

  Future<bool> isAuthenticated() async {
    return await _tokenService.hasToken();
  }

  Future<Map<String, dynamic>?> getCurrentUser() async {
    try {
      final response = await _localClient.dio.get('/auth/me');
      if (response.statusCode == 200) {
        return response.data;
      }
      return null;
    } catch (e) {
      debugPrint('DEBUG: Failed to get current user: $e');
      return null;
    }
  }

  Future<String?> getToken() => _tokenService.getToken();
}
