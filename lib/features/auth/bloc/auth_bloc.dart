import 'package:flutter/foundation.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:jwt_decoder/jwt_decoder.dart';
import '../data/auth_repository.dart';
import '../data/token_service.dart';

// Events
abstract class AuthEvent {}

class LoginEvent extends AuthEvent {
  final String username;
  final String password;
  LoginEvent({required this.username, required this.password});
}

class RegisterEvent extends AuthEvent {
  final String username;
  final String email;
  final String password;
  RegisterEvent({
    required this.username,
    required this.email,
    required this.password,
  });
}

class CheckAuthEvent extends AuthEvent {}

class LogoutEvent extends AuthEvent {}

// States
abstract class AuthState {}

class AuthInitial extends AuthState {}

class AuthLoading extends AuthState {}

class AuthAuthenticated extends AuthState {
  final int userId;
  final String username;
  final String? email;
  AuthAuthenticated({required this.userId, required this.username, this.email});
}

class AuthError extends AuthState {
  final String message;
  AuthError({required this.message});
}

class AuthUnauthenticated extends AuthState {}

// BLoC
class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final AuthRepository _authRepository;

  AuthBloc({
    required AuthRepository authRepository,
    required TokenService tokenService,
  })  : _authRepository = authRepository,
        super(AuthInitial()) {
    
    tokenService.onAuthLogout.listen((_) {
      add(LogoutEvent());
    });
    
    on<CheckAuthEvent>((event, emit) async {
      final isAuthenticated = await _authRepository.isAuthenticated();
      if (isAuthenticated) {
        try {
          final userData = await _authRepository.getCurrentUser();
          if (userData != null) {
            emit(AuthAuthenticated(
              userId: int.tryParse(userData['id']?.toString() ?? '0') ?? 0,
              username: userData['username'] ?? 'User',
              email: userData['email'],
            ));
          } else {
            // Fallback to token decoding if backend fails but we have a token
            final token = await _authRepository.getToken();
            if (token != null) {
              final decoded = JwtDecoder.decode(token);
              final userId = int.tryParse(decoded['data']?['user']?['id']?.toString() ?? 
                                        decoded['id']?.toString() ?? '0') ?? 0;
              emit(AuthAuthenticated(userId: userId, username: 'User'));
            } else {
              emit(AuthUnauthenticated());
            }
          }
        } catch (e) {
          emit(AuthUnauthenticated());
        }
      } else {
        emit(AuthUnauthenticated());
      }
    });

    on<LoginEvent>((event, emit) async {
      debugPrint('DEBUG: LoginEvent received for ${event.username}');
      emit(AuthLoading());
      try {
        final data = await _authRepository.login(
          username: event.username,
          password: event.password,
        );
        debugPrint('DEBUG: Login successful for ${event.username}');
        
        final localUser = data['localUser'];
        if (localUser != null) {
          final localUsername = localUser['username']?.toString() ?? '';
          final isLocalGeneric = localUsername.toLowerCase() == 'user';
          
          emit(AuthAuthenticated(
            userId: int.tryParse(localUser['id']?.toString() ?? '0') ?? 0,
            username: isLocalGeneric 
                ? (data['user_display_name'] ?? localUsername) 
                : localUsername,
            email: localUser['email'] ?? data['user_email'],
          ));
        } else {
          final token = data['token'];
          int userId = 0;
          if (token != null) {
            final decoded = JwtDecoder.decode(token);
            userId = int.tryParse(decoded['data']?['user']?['id']?.toString() ?? 
                                decoded['id']?.toString() ?? '0') ?? 0;
          }
          emit(AuthAuthenticated(
            userId: userId,
            username: data['user_display_name'] ?? event.username,
            email: data['user_email'],
          ));
        }
      } catch (e) {
        debugPrint('DEBUG: Login error: $e');
        final errorMessage = e is Exception ? e.toString().replaceFirst('Exception: ', '') : e.toString();
        emit(AuthError(message: errorMessage));
      }
    });

    on<RegisterEvent>((event, emit) async {
      emit(AuthLoading());
      try {
        await _authRepository.register(
          username: event.username,
          email: event.email,
          password: event.password,
        );
        add(LoginEvent(username: event.username, password: event.password));
      } catch (e) {
        debugPrint('DEBUG: Register error: $e');
        final errorMessage = e is Exception ? e.toString().replaceFirst('Exception: ', '') : e.toString();
        emit(AuthError(message: errorMessage));
      }
    });

    on<LogoutEvent>((event, emit) async {
      await _authRepository.logout();
      emit(AuthUnauthenticated());
    });
  }
}
