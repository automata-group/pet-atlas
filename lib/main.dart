import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:responsive_framework/responsive_framework.dart';
import 'l10n/app_localizations.dart';

import 'core/theme/app_theme.dart';
import 'core/bloc/theme_bloc.dart';
import 'core/bloc/locale_bloc.dart';
import 'features/auth/bloc/auth_bloc.dart';
import 'features/blog/bloc/blog_bloc.dart';
import 'features/profile/bloc/profile_bloc.dart';
import 'features/profile/bloc/profile_event.dart';
import 'features/directory/bloc/directory_bloc.dart';
import 'features/directory/data/repositories/directory_repository.dart';
import 'features/auth/data/token_service.dart';
import 'core/network/api_client.dart';
import 'core/network/socket_service.dart';
import 'features/auth/data/auth_repository.dart';
import 'features/booking/bloc/booking_bloc.dart';
import 'features/booking/data/repositories/booking_repository.dart';
import 'features/profile/data/repositories/profile_repository.dart';
import 'features/chat/bloc/chat_bloc.dart';
import 'features/chat/data/repositories/chat_repository.dart';
import 'features/splash/splash_screen.dart';
import 'features/profile/data/repositories/subscription_repository.dart';
import 'features/profile/bloc/subscription_cubit.dart';
import 'features/directory/bloc/system_config_cubit.dart';
import 'features/home/data/repositories/notification_repository.dart';
import 'features/home/bloc/notification_cubit.dart';
import 'features/pet_management/data/repositories/pet_management_repository.dart';

void main() {
  runApp(const PetAtlasApp());
}

class PetAtlasApp extends StatelessWidget {
  const PetAtlasApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiRepositoryProvider(
      providers: [
        RepositoryProvider<TokenService>(create: (_) => TokenService()),
        RepositoryProvider<SocketService>(
          create: (context) => SocketService(
            tokenService: RepositoryProvider.of<TokenService>(context),
          )..connect(),
        ),
        RepositoryProvider<WpApiClient>(
          create: (context) => WpApiClient(
            tokenService: RepositoryProvider.of<TokenService>(context),
          ),
        ),
        RepositoryProvider<LocalApiClient>(
          create: (context) => LocalApiClient(
            tokenService: RepositoryProvider.of<TokenService>(context),
          ),
        ),
        RepositoryProvider<AuthRepository>(
          create: (context) => AuthRepository(
            wpClient: RepositoryProvider.of<WpApiClient>(context), 
            localClient: RepositoryProvider.of<LocalApiClient>(context),
            tokenService: RepositoryProvider.of<TokenService>(context),
          ),
        ),
        RepositoryProvider<DirectoryRepository>(
          create: (context) => DirectoryRepository(
            apiClient: RepositoryProvider.of<LocalApiClient>(context),
          ),
        ),
        RepositoryProvider<BookingRepository>(
          create: (context) => BookingRepository(
            apiClient: RepositoryProvider.of<LocalApiClient>(context),
          ),
        ),
        RepositoryProvider<ProfileRepository>(
          create: (context) => ProfileRepository(
            apiClient: RepositoryProvider.of<LocalApiClient>(context),
          ),
        ),
        RepositoryProvider<PetManagementRepository>(
          create: (context) => PetManagementRepository(
            apiClient: RepositoryProvider.of<LocalApiClient>(context),
          ),
        ),
        RepositoryProvider<ChatRepository>(
          create: (context) => ChatRepository(
            apiClient: RepositoryProvider.of<LocalApiClient>(context),
          ),
        ),
        RepositoryProvider<SubscriptionRepository>(
          create: (context) => SubscriptionRepository(
            apiClient: RepositoryProvider.of<LocalApiClient>(context),
          ),
        ),
        RepositoryProvider<NotificationRepository>(
          create: (context) => NotificationRepository(
            apiClient: RepositoryProvider.of<LocalApiClient>(context),
          ),
        ),
      ],
      child: MultiBlocProvider(
        providers: [
          BlocProvider<ThemeBloc>(create: (_) => ThemeBloc()),
          BlocProvider<LocaleBloc>(create: (_) => LocaleBloc()),
          BlocProvider<AuthBloc>(
            create: (context) => AuthBloc(
              authRepository: RepositoryProvider.of<AuthRepository>(context),
              tokenService: RepositoryProvider.of<TokenService>(context),
            )..add(CheckAuthEvent()),
          ),
          BlocProvider<BlogBloc>(
            create: (context) => BlogBloc(),
          ),
          BlocProvider<DirectoryBloc>(
            create: (context) => DirectoryBloc(
              repository: RepositoryProvider.of<DirectoryRepository>(context),
            )..add(LoadDirectoryEvent()),
          ),
          BlocProvider<BookingBloc>(
            create: (context) => BookingBloc(
              repository: RepositoryProvider.of<BookingRepository>(context),
            )..add(FetchMyBookings()),
          ),
          BlocProvider<ProfileBloc>(
            create: (context) => ProfileBloc(
              profileRepository: RepositoryProvider.of<ProfileRepository>(context),
            )..add(LoadProfileEvent()),
          ),
          BlocProvider<ChatBloc>(
            create: (context) => ChatBloc(
              repository: RepositoryProvider.of<ChatRepository>(context),
            )..add(LoadMyChats()),
          ),
          BlocProvider<SubscriptionCubit>(
            create: (context) => SubscriptionCubit(
              repository: RepositoryProvider.of<SubscriptionRepository>(context),
            )..loadStatus(),
          ),
          BlocProvider<SystemConfigCubit>(
            create: (context) => SystemConfigCubit(
              repository: RepositoryProvider.of<DirectoryRepository>(context),
            )..loadConfig(),
          ),
          BlocProvider<NotificationCubit>(
            create: (context) => NotificationCubit(
              repository: RepositoryProvider.of<NotificationRepository>(context),
            )..fetchNotifications(),
          ),
        ],
        child: BlocBuilder<ThemeBloc, ThemeState>(
          builder: (context, themeState) {
            return BlocBuilder<LocaleBloc, Locale>(
              builder: (context, locale) {
                return MaterialApp(
                  title: 'Pet-Atlas',
                  debugShowCheckedModeBanner: false,
                  theme: AppTheme.lightTheme,
                  darkTheme: AppTheme.darkTheme,
                  themeMode: themeState.themeMode,
                  locale: locale,
                  localizationsDelegates: const [
                    AppLocalizations.delegate,
                    GlobalMaterialLocalizations.delegate,
                    GlobalWidgetsLocalizations.delegate,
                    GlobalCupertinoLocalizations.delegate,
                  ],
                  supportedLocales: const [Locale('en'), Locale('ar')],
                  builder: (context, child) => ResponsiveBreakpoints.builder(
                    child: Builder(
                      builder: (context) {
                        return ResponsiveScaledBox(
                          width: ResponsiveValue<double?>(context, defaultValue: 390.0, conditionalValues: [
                            Condition.equals(name: MOBILE, value: 390.0),
                          ]).value ?? 390.0,
                          child: child!,
                        );
                      },
                    ),
                    breakpoints: [
                      const Breakpoint(start: 0, end: 450, name: MOBILE),
                      const Breakpoint(start: 451, end: 800, name: TABLET),
                      const Breakpoint(start: 801, end: 1920, name: DESKTOP),
                      const Breakpoint(start: 1921, end: double.infinity, name: '4K'),
                    ],
                  ),
                  home: const SplashScreen(),
                );
              },
            );
          },
        ),
      ),
    );
  }
}
