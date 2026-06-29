import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import '../../features/auth/data/token_service.dart';
import '../config/environment.dart';

class ApiClient {
  final Dio _dio;
  final TokenService _tokenService;
  final String baseUrl;

  ApiClient({
    required TokenService tokenService,
    this.baseUrl = Environment.wpBaseUrl,
  })  : _tokenService = tokenService,
        _dio = Dio(BaseOptions(
          baseUrl: baseUrl,
          connectTimeout: const Duration(seconds: 15),
          receiveTimeout: const Duration(seconds: 15),
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            if (!kIsWeb) 'User-Agent': 'PetAtlasMobileApp/1.0',
          },
        )) {
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        // Skip adding token for login and register routes to avoid "Expired token" errors
        if (options.path.contains('/jwt-auth/v1/token') || 
            options.path.contains('/app/v1/register') ||
            options.path.contains('/auth/register')) {
          return handler.next(options);
        }

        final token = await _tokenService.getToken();
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
      onError: (DioException e, handler) async {
        if (e.response?.statusCode == 401) {
          await _tokenService.deleteToken();
        }
        return handler.next(e);
      },
    ));

    // Add logging in debug mode
    _dio.interceptors.add(LogInterceptor(
      requestHeader: true,
      requestBody: true,
      responseBody: true,
      error: true,
    ));
  }

  Future<FormData> createFormData(Map<String, dynamic> data) async {
    final formData = FormData();
    for (final entry in data.entries) {
      if (entry.value is String && (entry.value as String).startsWith('/')) {
        // Assume it's a file path
        formData.files.add(MapEntry(
          entry.key,
          await MultipartFile.fromFile(entry.value as String),
        ));
      } else {
        formData.fields.add(MapEntry(entry.key, entry.value.toString()));
      }
    }
    return formData;
  }

  Dio get dio => _dio;
}

class WpApiClient extends ApiClient {
  WpApiClient({required super.tokenService})
      : super(baseUrl: Environment.wpBaseUrl);
}

class LocalApiClient extends ApiClient {
  LocalApiClient({required super.tokenService})
      : super(baseUrl: Environment.localBaseUrl);
}
