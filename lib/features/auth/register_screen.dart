import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:video_player/video_player.dart';
import '../../l10n/app_localizations.dart';

import '../../core/theme/app_colors.dart';
import 'bloc/auth_bloc.dart';
import 'login_screen.dart';
import '../home/home_screen.dart';
import '../../core/utils/validators.dart';
import '../../core/utils/error_translator.dart';
import '../../core/utils/custom_snack_bar.dart';
import 'auth_webview_screen.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _usernameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;
  late List<VideoPlayerController> _controllers;
  bool _isVideoInitialized = false;
  final List<String> _videos = ['assets/pet1.mp4', 'assets/pet2.mp4'];
  int _currentVideoIndex = 0;

  @override
  void initState() {
    super.initState();
    _controllers = _videos.map((path) => VideoPlayerController.asset(path)).toList();
    for (int i = 0; i < _controllers.length; i++) {
      _controllers[i].initialize().then((_) {
        _controllers[i].setVolume(0);
        if (i == 0) {
          _controllers[i].play();
          _controllers[i].addListener(_videoListener);
          setState(() => _isVideoInitialized = true);
        }
      });
    }
  }

  void _videoListener() {
    final currentController = _controllers[_currentVideoIndex];
    if (currentController.value.isInitialized &&
        !currentController.value.isPlaying &&
        currentController.value.position >= currentController.value.duration) {
      
      currentController.removeListener(_videoListener);
      currentController.seekTo(Duration.zero);
      currentController.pause();

      _currentVideoIndex = (_currentVideoIndex + 1) % _controllers.length;
      final nextController = _controllers[_currentVideoIndex];
      nextController.play();
      nextController.addListener(_videoListener);
      setState(() {});
    }
  }

  @override
  void dispose() {
    _usernameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    for (var controller in _controllers) {
      controller.removeListener(_videoListener);
      controller.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);

    return Scaffold(
      body: Stack(
        children: [
          // Background Video
          if (_isVideoInitialized && _controllers[_currentVideoIndex].value.size.width > 0 && _controllers[_currentVideoIndex].value.size.height > 0)
            SizedBox.expand(
              child: FittedBox(
                fit: BoxFit.cover,
                child: SizedBox(
                  width: _controllers[_currentVideoIndex].value.size.width,
                  height: _controllers[_currentVideoIndex].value.size.height,
                  child: VideoPlayer(_controllers[_currentVideoIndex]),
                ),
              ),
            )
          else
            Container(color: Colors.black),

          // Dark Overlay for readability
          Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Colors.black.withValues(alpha: 0.3),
                  Colors.black.withValues(alpha: 0.8),
                ],
              ),
            ),
          ),

          // Register Form
          BlocListener<AuthBloc, AuthState>(
            listener: (context, state) {
              if (state is AuthAuthenticated) {
                CustomSnackBar.showSuccess(context, l10n.authRegisterSuccess);
                Navigator.of(context).pushReplacement(
                  MaterialPageRoute(builder: (_) => const HomeScreen()),
                );
              } else if (state is AuthError) {
                if (state.message == 'err_security_block_bot') {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: const Text('Security Verification Required'),
                      backgroundColor: Colors.orange,
                      duration: const Duration(seconds: 10),
                      action: SnackBarAction(
                        label: 'VERIFY',
                        textColor: Colors.white,
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => const AuthWebViewScreen(
                                url: 'https://pet-atlas.com/',
                                title: 'Verify you are human',
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                  );
                } else {
                  final parts = state.message.split(' | RAW: ');
                  final errorCode = parts[0];
                  // final rawResponse = parts.length > 1 ? parts[1] : state.message;

                  // Show original SnackBar
                  CustomSnackBar.showError(
                    context,
                    ErrorTranslator.translate(errorCode, context),
                  );
                }
              }
            },
            child: SafeArea(
              child: Center(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 24.0),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        const SizedBox(height: 20),
                        Center(
                          child: Container(
                            padding: const EdgeInsets.all(24),
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.1),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.pets,
                              size: 60,
                              color: Colors.white,
                            ),
                          ),
                        ),
                        const SizedBox(height: 24),
                        Text(
                          l10n.authRegister,
                          style: theme.textTheme.headlineMedium?.copyWith(
                            fontWeight: FontWeight.w900,
                            color: Colors.white,
                            letterSpacing: -1,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 48),
                        _buildGlassInput(
                          hintText: l10n.authUsername,
                          icon: Icons.alternate_email,
                          controller: _usernameController,
                          validator: (value) => Validators.validateUsername(value, context),
                        ),
                        const SizedBox(height: 16),
                        _buildGlassInput(
                          hintText: l10n.authEmail,
                          icon: Icons.email_outlined,
                          controller: _emailController,
                          keyboardType: TextInputType.emailAddress,
                          validator: (value) => Validators.validateEmail(value, context),
                        ),
                        const SizedBox(height: 16),
                        _buildGlassInput(
                          hintText: l10n.authPassword,
                          icon: Icons.lock_outline,
                          isPassword: true,
                          controller: _passwordController,
                          validator: (value) => Validators.validatePassword(value, context),
                          obscureText: _obscurePassword,
                          onToggleVisibility: () {
                            setState(() {
                              _obscurePassword = !_obscurePassword;
                            });
                          },
                        ),
                        const SizedBox(height: 16),
                        _buildGlassInput(
                          hintText: l10n.authConfirmPassword,
                          icon: Icons.lock_outline,
                          isPassword: true,
                          controller: _confirmPasswordController,
                          validator: (value) => Validators.validateConfirmPassword(
                            value,
                            _passwordController.text,
                            context,
                          ),
                          obscureText: _obscureConfirmPassword,
                          onToggleVisibility: () {
                            setState(() {
                              _obscureConfirmPassword = !_obscureConfirmPassword;
                            });
                          },
                        ),
                        const SizedBox(height: 32),
                        BlocBuilder<AuthBloc, AuthState>(
                          builder: (context, state) {
                            if (state is AuthLoading) {
                              return const Center(child: CircularProgressIndicator(color: Colors.white));
                            }
                            return ElevatedButton(
                              onPressed: () {
                                if (_formKey.currentState!.validate()) {
                                  context.read<AuthBloc>().add(
                                    RegisterEvent(
                                      username: _usernameController.text,
                                      email: _emailController.text,
                                      password: _passwordController.text,
                                    ),
                                  );
                                }
                              },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.primary,
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(vertical: 18),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(16),
                                ),
                                elevation: 0,
                              ),
                              child: Text(
                                l10n.authRegister,
                                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                              ),
                            );
                          },
                        ),
                        const SizedBox(height: 32),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              l10n.authAlreadyHaveAccount,
                              style: const TextStyle(color: Colors.white70),
                            ),
                            TextButton(
                              onPressed: () {
                                Navigator.of(context).pushReplacement(
                                  MaterialPageRoute(builder: (_) => const LoginScreen()),
                                );
                              },
                              child: const Text(
                                'Sign In',
                                style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGlassInput({
    required String hintText,
    required IconData icon,
    required TextEditingController controller,
    required FormFieldValidator<String>? validator,
    bool isPassword = false,
    TextInputType? keyboardType,
    bool? obscureText,
    VoidCallback? onToggleVisibility,
  }) {
    final isObscure = obscureText ?? isPassword;

    return Container(
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
      ),
      child: TextFormField(
        controller: controller,
        obscureText: isObscure,
        keyboardType: keyboardType,
        style: const TextStyle(color: Colors.white),
        decoration: InputDecoration(
          hintText: hintText,
          hintStyle: const TextStyle(color: Colors.white54),
          prefixIcon: Icon(icon, color: Colors.white70),
          suffixIcon: isPassword && onToggleVisibility != null
              ? IconButton(
                  icon: Icon(
                    isObscure ? Icons.visibility_off : Icons.visibility,
                    color: Colors.white70,
                  ),
                  onPressed: onToggleVisibility,
                )
              : null,
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(vertical: 18, horizontal: 20),
        ),
        validator: validator,
      ),
    );
  }
}
