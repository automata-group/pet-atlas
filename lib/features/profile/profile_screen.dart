import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../core/theme/app_colors.dart';
import '../../l10n/app_localizations.dart';
import 'bloc/profile_bloc.dart';
import 'bloc/profile_event.dart';
import 'bloc/profile_state.dart';
import 'saved_blogs_screen.dart';
import 'security_settings_screen.dart';
import 'subscription_settings_screen.dart';
import '../auth/bloc/auth_bloc.dart';
import '../auth/login_screen.dart';
import '../booking/presentation/my_bookings_screen.dart';
import 'presentation/edit_profile_screen.dart';
import 'presentation/pet_details_screen.dart';
import 'presentation/add_pet_screen.dart';
import '../auth/data/models/user.dart';
import 'data/models/pet.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  @override
  void initState() {
    super.initState();
    // Dispatch initial load event
    context.read<ProfileBloc>().add(LoadProfileEvent());
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final l10n = AppLocalizations.of(context)!;

    return Scaffold(
      body: MultiBlocListener(
        listeners: [
          BlocListener<AuthBloc, AuthState>(
            listener: (context, authState) {
              if (authState is AuthUnauthenticated) {
                Navigator.of(context).pushAndRemoveUntil(
                  MaterialPageRoute(builder: (_) => LoginScreen()),
                  (route) => false,
                );
              }
            },
          ),
        ],
        child: BlocBuilder<ProfileBloc, ProfileState>(
          builder: (context, state) {
            if (state is ProfileLoading || state is ProfileInitial) {
              return const Center(child: CircularProgressIndicator());
            }

            if (state is ProfileLoaded) {
              return SafeArea(
              child: SingleChildScrollView(
                child: Column(
                  children: [
                    const SizedBox(height: 32),
                    // Profile Image with Edit Icon
                    Center(
                      child: Stack(
                        children: [
                          Container(
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: AppColors.primary.withValues(alpha: 0.2),
                                width: 4,
                              ),
                            ),
                            child: CircleAvatar(
                              radius: 50,
                              backgroundImage: state.user.photoUrl != null 
                                ? NetworkImage(state.user.photoUrl!) 
                                : null,
                              backgroundColor: AppColors.slate200,
                              child: state.user.photoUrl == null 
                                ? const Icon(Icons.person, size: 50, color: Colors.white) 
                                : null,
                            ),
                          ),
                          Positioned(
                            bottom: 0,
                            right: 0,
                            child: InkWell(
                              onTap: () => _showAvatarSelectionSheet(context),
                              child: Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: AppColors.primary,
                                  shape: BoxShape.circle,
                                  border: Border.all(
                                    color: isDark
                                        ? AppColors.slate900
                                        : Colors.white,
                                    width: 3,
                                  ),
                                ),
                                child: const Icon(
                                  Icons.edit,
                                  color: Colors.white,
                                  size: 16,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                    // User Info
                    BlocBuilder<AuthBloc, AuthState>(
                      builder: (context, authState) {
                        String name = state.user.fullName;
                        String email = state.user.email;

                        return Column(
                          children: [
                            Text(
                              name,
                              style: theme.textTheme.titleLarge?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              email,
                              style: theme.textTheme.bodyMedium?.copyWith(
                                color: isDark ? AppColors.slate400 : AppColors.slate500,
                              ),
                            ),
                            const SizedBox(height: 16),
                            ElevatedButton.icon(
                              onPressed: () => _navigateToEditProfile(context, state.user),
                              icon: const Icon(Icons.edit, size: 18),
                              label: Text(l10n.profileEditProfile),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.primary,
                                foregroundColor: Colors.white,
                                elevation: 0,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                              ),
                            ),
                          ],
                        );
                      },
                    ),
                    const SizedBox(height: 32),
                    
                    const SizedBox(height: 24),
                    
                    // Detailed Info (Address, Mobile)
                    if ((state.user.address != null && state.user.address!.isNotEmpty) || (state.user.mobileNumber != null && state.user.mobileNumber!.isNotEmpty))
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16.0),
                        child: Container(
                          padding: const EdgeInsets.all(20),
                          decoration: BoxDecoration(
                            color: isDark ? AppColors.slate800 : Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: isDark ? AppColors.slate700 : AppColors.slate100),
                          ),
                          child: Column(
                            children: [
                              if (state.user.mobileNumber != null && state.user.mobileNumber!.isNotEmpty)
                                _buildInfoRow(Icons.phone_android, 'Mobile', state.user.mobileNumber!, isDark),
                              if (state.user.address != null && state.user.address!.isNotEmpty)
                                _buildInfoRow(Icons.location_on_outlined, 'Address', '${state.user.address}, ${state.user.city ?? ''}', isDark),
                            ],
                          ),
                        ),
                      )
                    else
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16.0),
                        child: InkWell(
                          onTap: () => _navigateToEditProfile(context, state.user),
                          borderRadius: BorderRadius.circular(16),
                          child: Container(
                            padding: const EdgeInsets.all(20),
                            decoration: BoxDecoration(
                              color: AppColors.primary.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
                            ),
                            child: Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: AppColors.primary.withValues(alpha: 0.2),
                                    shape: BoxShape.circle,
                                  ),
                                  child: const Icon(Icons.person_add_alt_1, color: AppColors.primary),
                                ),
                                const SizedBox(width: 16),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        l10n.profileCompleteProfile,
                                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppColors.primary),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        l10n.profileCompleteProfileSubtitle,
                                        style: const TextStyle(fontSize: 12, color: Colors.grey),
                                      ),
                                    ],
                                  ),
                                ),
                                const Icon(Icons.arrow_forward_ios, size: 16, color: AppColors.primary),
                              ],
                            ),
                          ),
                        ),
                      ),
                    
                    // My Pets Section (PDF Page 3)
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16.0),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(l10n.profileMyPets, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                          TextButton(
                            onPressed: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(builder: (context) => const AddPetScreen()),
                              );
                            },
                            child: Text(l10n.profileAddPet, style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold)),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 8),
                    SizedBox(
                      height: 120,
                      child: ListView.builder(
                        scrollDirection: Axis.horizontal,
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        itemCount: state.pets.length,
                        itemBuilder: (context, index) {
                          final pet = state.pets[index];
                          return GestureDetector(
                            onTap: () => _navigateToPetDetails(context, pet),
                            child: Container(
                              width: 100,
                              margin: const EdgeInsets.only(right: 16),
                              decoration: BoxDecoration(
                                color: isDark ? AppColors.slate800 : Colors.white,
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(color: isDark ? AppColors.slate700 : AppColors.slate100),
                              ),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  CircleAvatar(
                                    radius: 30,
                                    backgroundImage: pet.photoUrl != null ? NetworkImage(pet.photoUrl!) : null,
                                    backgroundColor: AppColors.slate100,
                                    child: pet.photoUrl == null ? const Icon(Icons.pets, color: AppColors.primary) : null,
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    pet.name,
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                    
                    const SizedBox(height: 24),

                    // Options List
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16.0),
                      child: Column(
                        children: [
                          _buildProfileOption(
                            icon: Icons.bookmark_border,
                            title: l10n.profileSavedBlogs,
                            theme: theme,
                            isDark: isDark,
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) =>
                                      const SavedBlogsScreen(),
                                ),
                              );
                            },
                          ),
                          _buildProfileOption(
                            icon: Icons.security,
                            title: l10n.profileSecurity,
                            theme: theme,
                            isDark: isDark,
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) =>
                                      const SecuritySettingsScreen(),
                                ),
                              );
                            },
                          ),
                          _buildProfileOption(
                            icon: Icons.subscriptions_outlined,
                            title: l10n.profileSubscription,
                            theme: theme,
                            isDark: isDark,
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) =>
                                      const SubscriptionSettingsScreen(),
                                ),
                              );
                            },
                          ),
                          _buildProfileOption(
                            icon: Icons.calendar_month_outlined,
                            title: l10n.bookingMyAppointments,
                            theme: theme,
                            isDark: isDark,
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) =>
                                      const MyBookingsScreen(),
                                ),
                              );
                            },
                          ),
                          _buildProfileOption(
                            icon: Icons.logout,
                            title: l10n.authLogout,
                            theme: theme,
                            isDark: isDark,
                            onTap: () {
                              context.read<AuthBloc>().add(LogoutEvent());
                            },
                            iconColor: Colors.redAccent,
                            textColor: Colors.redAccent,
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 32),
                  ],
                ),
              ),
            );
          }

          if (state is ProfileError) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: SingleChildScrollView(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.cloud_off_rounded, size: 80, color: Colors.grey),
                    const SizedBox(height: 24),
                    Text(
                      state.message,
                      textAlign: TextAlign.center,
                      style: const TextStyle(fontSize: 16, color: Colors.grey, height: 1.5),
                    ),
                    const SizedBox(height: 32),
                    ElevatedButton.icon(
                      onPressed: () {
                        context.read<ProfileBloc>().add(LoadProfileEvent());
                      },
                      icon: const Icon(Icons.refresh),
                      label: Text(l10n.profileTryAgain),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                  ],
                ),
                ),
              ),
            );
          }

          return const SizedBox.shrink();
        },
      ),
    ),
  );
}


  void _navigateToPetDetails(BuildContext context, Pet pet) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => PetDetailsScreen(pet: pet),
      ),
    );
  }

  void _navigateToEditProfile(BuildContext context, User user) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => EditProfileScreen(user: user),
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value, bool isDark) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        children: [
          Icon(icon, size: 20, color: AppColors.primary),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: const TextStyle(color: Colors.grey, fontSize: 11)),
              Text(value, style: TextStyle(fontWeight: FontWeight.w500, color: isDark ? Colors.white : Colors.black87)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildProfileOption({
    required IconData icon,
    required String title,
    required ThemeData theme,
    required bool isDark,
    required VoidCallback onTap,
    Color? iconColor,
    Color? textColor,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: isDark ? AppColors.slate800 : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isDark ? AppColors.slate700 : AppColors.slate100,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
        leading: Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: (iconColor ?? AppColors.primary).withValues(alpha: 0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: iconColor ?? AppColors.primary, size: 22),
        ),
        title: Text(
          title,
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w600,
            color: textColor,
          ),
        ),
        trailing: Icon(
          Icons.chevron_right,
          color: isDark ? AppColors.slate400 : AppColors.slate500,
        ),
        onTap: onTap,
      ),
    );
  }

  void _showAvatarSelectionSheet(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final isArabic = Localizations.localeOf(context).languageCode == 'ar';
    final customUrlController = TextEditingController();

    final List<String> avatars = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150',
    ];

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(context).viewInsets.bottom,
              ),
              child: Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF0F1E23) : Colors.white,
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.15),
                      blurRadius: 20,
                    ),
                  ],
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Center(
                      child: Container(
                        width: 48,
                        height: 5,
                        decoration: BoxDecoration(
                          color: isDark ? Colors.white24 : Colors.black12,
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),
                    Text(
                      isArabic ? 'اختر صورتك الرمزية' : 'Choose Your Avatar',
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w900,
                        letterSpacing: -0.5,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 20),
                    GridView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 3,
                        crossAxisSpacing: 16,
                        mainAxisSpacing: 16,
                      ),
                      itemCount: avatars.length,
                      itemBuilder: (context, index) {
                        final avatarUrl = avatars[index];
                        return InkWell(
                          onTap: () {
                            Navigator.pop(context);
                            context.read<ProfileBloc>().add(
                              UpdateProfileImageEvent(avatarUrl),
                            );
                          },
                          borderRadius: BorderRadius.circular(50),
                          child: Container(
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: AppColors.primary.withValues(alpha: 0.3),
                                width: 2,
                              ),
                            ),
                            child: CircleAvatar(
                              backgroundImage: NetworkImage(avatarUrl),
                              backgroundColor: Colors.grey[200],
                            ),
                          ),
                        );
                      },
                    ),
                    const SizedBox(height: 24),
                    Text(
                      isArabic ? 'أو أدخل رابط صورة مخصص' : 'Or enter custom image URL',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: customUrlController,
                      style: TextStyle(color: isDark ? Colors.white : Colors.black87),
                      decoration: InputDecoration(
                        hintText: isArabic ? 'رابط الصورة (https://...)' : 'Image URL (https://...)',
                        hintStyle: const TextStyle(color: Colors.grey),
                        filled: true,
                        fillColor: isDark ? Colors.white.withValues(alpha: 0.05) : Colors.grey[100],
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide.none,
                        ),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                      ),
                    ),
                    const SizedBox(height: 20),
                    Row(
                      children: [
                        Expanded(
                          child: TextButton(
                            onPressed: () => Navigator.pop(context),
                            child: Text(
                              isArabic ? 'إلغاء' : 'Cancel',
                              style: TextStyle(color: isDark ? Colors.white70 : Colors.black54),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: ElevatedButton(
                            onPressed: () {
                              final text = customUrlController.text.trim();
                              if (text.isNotEmpty && text.startsWith('http')) {
                                Navigator.pop(context);
                                context.read<ProfileBloc>().add(
                                  UpdateProfileImageEvent(text),
                                );
                              }
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primary,
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            child: Text(isArabic ? 'تطبيق' : 'Apply'),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }
}
