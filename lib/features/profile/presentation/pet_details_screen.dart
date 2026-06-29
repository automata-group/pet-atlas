import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../data/models/pet.dart';
import '../../../core/theme/app_colors.dart';
import '../bloc/profile_bloc.dart';
import '../bloc/profile_state.dart';
import 'edit_pet_screen.dart';
import '../../pet_management/bloc/pet_management_bloc.dart';
import '../../pet_management/bloc/pet_management_event.dart';
import '../../pet_management/data/repositories/pet_management_repository.dart';
import '../../pet_management/presentation/pet_management_dashboard.dart';

class PetDetailsScreen extends StatelessWidget {
  final Pet pet;

  const PetDetailsScreen({super.key, required this.pet});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<ProfileBloc, ProfileState>(
      builder: (context, state) {
        Pet currentPet = pet;
        if (state is ProfileLoaded) {
          final found = state.pets.where((p) => p.id == pet.id);
          if (found.isNotEmpty) {
            currentPet = found.first;
          }
        }

        final theme = Theme.of(context);
        final isDark = theme.brightness == Brightness.dark;
        final isArabic = Localizations.localeOf(context).languageCode == 'ar';

        return Scaffold(
          appBar: AppBar(
            title: Text(
              isArabic ? 'ملف ${currentPet.name}' : '${currentPet.name}\'s Profile',
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
            elevation: 0,
            actions: [
              IconButton(
                icon: const Icon(Icons.edit_outlined),
                onPressed: () async {
                  final deleted = await Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => EditPetScreen(pet: currentPet),
                    ),
                  );
                  if (deleted == true && context.mounted) {
                    Navigator.pop(context);
                  }
                },
                tooltip: isArabic ? 'تعديل الملف' : 'Edit Profile',
              ),
            ],
          ),
          body: SingleChildScrollView(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header
                Center(
                  child: Column(
                    children: [
                      CircleAvatar(
                        radius: 60,
                        backgroundImage: currentPet.photoUrl != null && currentPet.photoUrl!.isNotEmpty
                            ? NetworkImage(currentPet.photoUrl!)
                            : null,
                        backgroundColor: AppColors.slate200,
                        child: currentPet.photoUrl == null || currentPet.photoUrl!.isEmpty
                            ? const Icon(Icons.pets, size: 60, color: Colors.white)
                            : null,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        currentPet.name,
                        style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
                      ),
                      Text(
                        currentPet.breed ?? (isArabic ? 'سلالة غير معروفة' : 'Unknown Breed'),
                        style: theme.textTheme.bodyMedium?.copyWith(color: Colors.grey),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 32),
                
                // Basic Info Chips
                Wrap(
                  spacing: 12,
                  runSpacing: 12,
                  children: [
                    _buildInfoChip(Icons.cake_outlined, _formatAge(currentPet.dob, isArabic)),
                    _buildInfoChip(
                      currentPet.sex == 'Male' ? Icons.male : Icons.female,
                      currentPet.sex == 'Male'
                          ? (isArabic ? 'ذكر' : 'Male')
                          : (currentPet.sex == 'Female' ? (isArabic ? 'أنثى' : 'Female') : (isArabic ? 'غير معروف' : 'Unknown')),
                    ),
                    if (currentPet.neutered)
                      _buildInfoChip(Icons.health_and_safety_outlined, isArabic ? 'معقم / مخصي' : 'Neutered'),
                  ],
                ),
                const SizedBox(height: 24),
                ElevatedButton.icon(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => BlocProvider<PetManagementBloc>(
                          create: (context) => PetManagementBloc(
                            repository: RepositoryProvider.of<PetManagementRepository>(context),
                          )..add(LoadPetOverviewEvent(currentPet.id)),
                          child: PetManagementDashboard(pet: currentPet),
                        ),
                      ),
                    );
                  },
                  icon: const Icon(Icons.dashboard_customize_outlined, color: Colors.white),
                  label: Text(isArabic ? 'إدارة ملف الرعاية والصحة' : 'Manage Health & Care File'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    minimumSize: const Size(double.infinity, 54),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    elevation: 2,
                  ),
                ),
                const SizedBox(height: 32),
                
                // Notes Section
                _buildSectionTitle(isArabic ? 'ملاحظات وتفاصيل' : 'Notes & Character'),
                const SizedBox(height: 12),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: isDark ? AppColors.slate800 : Colors.blueGrey[50],
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Text(
                    currentPet.notes != null && currentPet.notes!.isNotEmpty
                        ? currentPet.notes!
                        : (isArabic ? 'لا توجد ملاحظات مسجلة.' : 'No special notes recorded.'),
                    style: TextStyle(
                      fontSize: 15,
                      height: 1.5,
                      color: isDark ? Colors.white70 : Colors.black87,
                    ),
                  ),
                ),
                const SizedBox(height: 32),
                
                // Activity Log Section (PDF Page 3)
                _buildSectionTitle(isArabic ? 'سجل الأنشطة والصحة' : 'Activity & Health Log'),
                const SizedBox(height: 12),
                if (currentPet.activityLog == null || currentPet.activityLog!.isEmpty)
                  Text(isArabic ? 'لا توجد سجلات أنشطة حديثة.' : 'No recent activity logs.')
                else
                  ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: currentPet.activityLog!.length,
                    itemBuilder: (context, index) {
                      final log = currentPet.activityLog![index];
                      return _buildLogItem(
                        log['action'] ?? 'Activity',
                        log['date'] ?? '',
                        log['details'] ?? '',
                        isDark,
                      );
                    },
                  ),
              ],
            ),
          ),
        );
      },
    );
  }

  String _formatAge(DateTime? dob, bool isArabic) {
    if (dob == null) return isArabic ? 'عمر غير معروف' : 'Unknown age';
    final age = DateTime.now().year - dob.year;
    return isArabic ? '$age سنوات' : '$age years old';
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.primary),
    );
  }

  Widget _buildInfoChip(IconData icon, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: BoxDecoration(
        color: AppColors.primary.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(30),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 18, color: AppColors.primary),
          const SizedBox(width: 8),
          Text(label, style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold, fontSize: 13)),
        ],
      ),
    );
  }

  Widget _buildLogItem(String action, String date, String details, bool isDark) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        border: Border(left: BorderSide(color: AppColors.primary, width: 4)),
        color: isDark ? AppColors.slate800.withValues(alpha: 0.5) : Colors.grey[50],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(action, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              Text(date, style: const TextStyle(color: Colors.grey, fontSize: 12)),
            ],
          ),
          const SizedBox(height: 4),
          Text(details, style: TextStyle(color: isDark ? Colors.white70 : Colors.black54)),
        ],
      ),
    );
  }
}
