import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/theme/app_colors.dart';
import '../../profile/data/models/pet.dart';
import '../bloc/pet_management_bloc.dart';
import '../bloc/pet_management_event.dart';
import '../bloc/pet_management_state.dart';
import 'diary_entries_screen.dart';
import 'reminders_screen.dart';
import 'weight_tracker_screen.dart';
import 'medications_screen.dart';
import 'vet_visits_screen.dart';
import 'vaccinations_screen.dart';

class PetManagementDashboard extends StatelessWidget {
  final Pet pet;

  const PetManagementDashboard({super.key, required this.pet});

  @override
  Widget build(BuildContext context) {
    final isArabic = Localizations.localeOf(context).languageCode == 'ar';
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF0F1E23) : const Color(0xFFF5F8F8),
      appBar: AppBar(
        title: Text(isArabic ? 'ملف رعاية ${pet.name}' : '${pet.name}\'s Care File'),
        elevation: 0,
        backgroundColor: Colors.transparent,
      ),
      body: BlocBuilder<PetManagementBloc, PetManagementState>(
        builder: (context, state) {
          if (state is PetManagementLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (state is PetManagementError) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    isArabic ? 'خطأ في تحميل البيانات' : 'Error loading details',
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  Text(state.message, style: const TextStyle(color: Colors.red)),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () {
                      context.read<PetManagementBloc>().add(LoadPetOverviewEvent(pet.id));
                    },
                    child: Text(isArabic ? 'إعادة المحاولة' : 'Retry'),
                  ),
                ],
              ),
            );
          }

          if (state is PetManagementLoaded) {
            final overview = state.overview;
            final latestWeightText = overview.latestWeight != null
                ? '${overview.latestWeight!.weight} kg'
                : (pet.weight != null ? '${pet.weight} kg' : (isArabic ? 'غير مسجل' : 'Not recorded'));

            return RefreshIndicator(
              onRefresh: () async {
                context.read<PetManagementBloc>().add(LoadPetOverviewEvent(pet.id));
              },
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Unified Care Header Card
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: isDark
                              ? [const Color(0xFF16252A), const Color(0xFF0F242A)]
                              : [Colors.white, Colors.blueGrey[50]!],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(24),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: isDark ? 0.3 : 0.05),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          )
                        ],
                      ),
                      child: Row(
                        children: [
                          CircleAvatar(
                            radius: 36,
                            backgroundImage: pet.photoUrl != null && pet.photoUrl!.isNotEmpty
                                ? NetworkImage(pet.photoUrl!)
                                : null,
                            backgroundColor: AppColors.primary.withValues(alpha: 0.1),
                            child: pet.photoUrl == null || pet.photoUrl!.isEmpty
                                ? const Icon(Icons.pets, size: 36, color: AppColors.primary)
                                : null,
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  pet.name,
                                  style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  '${pet.breed ?? (isArabic ? "سلالة غير معروفة" : "Unknown Breed")} • ${pet.type ?? ""}',
                                  style: const TextStyle(color: Colors.grey, fontSize: 13),
                                ),
                                const SizedBox(height: 8),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: AppColors.primary.withValues(alpha: 0.1),
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                  child: Text(
                                    '${isArabic ? "الوزن الأخير" : "Latest Weight"}: $latestWeightText',
                                    style: const TextStyle(
                                      color: AppColors.primary,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 12,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 32),

                    // Quick Summary Section
                    _buildSectionHeader(isArabic ? 'الأقسام والخدمات' : 'Care Services'),
                    const SizedBox(height: 16),

                    // Grid of Actions
                    GridView.count(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      crossAxisCount: 2,
                      crossAxisSpacing: 16,
                      mainAxisSpacing: 16,
                      childAspectRatio: 1.25,
                      children: [
                        _buildCategoryCard(
                          context: context,
                          icon: Icons.book_outlined,
                          title: isArabic ? 'اليوميات' : 'Diary Logs',
                          subtitle: isArabic ? 'ملاحظات وتفاصيل' : 'Notes & thoughts',
                          color: Colors.teal,
                          onTap: () => Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => BlocProvider.value(
                                value: context.read<PetManagementBloc>(),
                                child: DiaryEntriesScreen(petId: pet.id),
                              ),
                            ),
                          ),
                        ),
                        _buildCategoryCard(
                          context: context,
                          icon: Icons.notification_important_outlined,
                          title: isArabic ? 'التذكيرات' : 'Reminders',
                          subtitle: isArabic ? 'المواعيد والمهام' : 'Tasks & alerts',
                          color: Colors.orange,
                          onTap: () => Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => BlocProvider.value(
                                value: context.read<PetManagementBloc>(),
                                child: RemindersScreen(petId: pet.id),
                              ),
                            ),
                          ),
                        ),
                        _buildCategoryCard(
                          context: context,
                          icon: Icons.monitor_weight_outlined,
                          title: isArabic ? 'سجل الوزن' : 'Weight Tracker',
                          subtitle: isArabic ? 'متابعة النمو' : 'Track growth',
                          color: Colors.blue,
                          onTap: () => Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => BlocProvider.value(
                                value: context.read<PetManagementBloc>(),
                                child: WeightTrackerScreen(petId: pet.id),
                              ),
                            ),
                          ),
                        ),
                        _buildCategoryCard(
                          context: context,
                          icon: Icons.medical_services_outlined,
                          title: isArabic ? 'الأدوية' : 'Medications',
                          subtitle: isArabic ? 'العلاجات والجرعات' : 'Meds & dosages',
                          color: Colors.red,
                          onTap: () => Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => BlocProvider.value(
                                value: context.read<PetManagementBloc>(),
                                child: MedicationsScreen(petId: pet.id),
                              ),
                            ),
                          ),
                        ),
                        _buildCategoryCard(
                          context: context,
                          icon: Icons.calendar_month_outlined,
                          title: isArabic ? 'الزيارات الطبية' : 'Vet Visits',
                          subtitle: isArabic ? 'مراجعة الأطباء' : 'Clinic visits',
                          color: Colors.purple,
                          onTap: () => Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => BlocProvider.value(
                                value: context.read<PetManagementBloc>(),
                                child: VetVisitsScreen(petId: pet.id),
                              ),
                            ),
                          ),
                        ),
                        _buildCategoryCard(
                          context: context,
                          icon: Icons.vaccines_outlined,
                          title: isArabic ? 'التطعيمات' : 'Vaccinations',
                          subtitle: isArabic ? 'سجل اللقاحات' : 'Immunization log',
                          color: Colors.indigo,
                          onTap: () => Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => BlocProvider.value(
                                value: context.read<PetManagementBloc>(),
                                child: VaccinationsScreen(petId: pet.id),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 32),

                    // Upcoming Reminders Card inside Dashboard
                    _buildSectionHeader(isArabic ? 'المهام القادمة' : 'Upcoming Tasks'),
                    const SizedBox(height: 12),
                    if (overview.upcomingReminders.isEmpty)
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: isDark ? Colors.white.withValues(alpha: 0.02) : Colors.grey[100],
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Text(
                          isArabic ? 'لا توجد تذكيرات قادمة' : 'No upcoming reminders scheduled',
                          style: const TextStyle(color: Colors.grey),
                          textAlign: TextAlign.center,
                        ),
                      )
                    else
                      ListView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: overview.upcomingReminders.length,
                        itemBuilder: (context, index) {
                          final rem = overview.upcomingReminders[index];
                          return Card(
                            color: isDark ? const Color(0xFF16252A) : Colors.white,
                            margin: const EdgeInsets.only(bottom: 10),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            child: ListTile(
                              leading: Icon(
                                rem.type == 'medication'
                                    ? Icons.medical_services
                                    : (rem.type == 'vaccine'
                                        ? Icons.vaccines
                                        : (rem.type == 'vet_visit' ? Icons.calendar_month : Icons.alarm)),
                                color: AppColors.primary,
                              ),
                              title: Text(rem.title, style: const TextStyle(fontWeight: FontWeight.bold)),
                              subtitle: Text(rem.dateTime.toLocal().toString().split(' ')[0]),
                              trailing: IconButton(
                                icon: const Icon(Icons.check_circle_outline, color: Colors.grey),
                                onPressed: () {
                                  context.read<PetManagementBloc>().add(
                                        ToggleReminderEvent(pet.id, rem.id, true),
                                      );
                                },
                              ),
                            ),
                          );
                        },
                      ),
                  ],
                ),
              ),
            );
          }

          return const SizedBox.shrink();
        },
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Text(
      title,
      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
    );
  }

  Widget _buildCategoryCard({
    required BuildContext context,
    required IconData icon,
    required String title,
    required String subtitle,
    required Color color,
    required VoidCallback onTap,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF16252A) : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: isDark ? Colors.white10 : Colors.black.withValues(alpha: 0.05)),
          boxShadow: [
            if (!isDark)
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.02),
                blurRadius: 8,
                offset: const Offset(0, 4),
              )
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: color, size: 24),
            ),
            const SizedBox(height: 12),
            Text(
              title,
              style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 15),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 2),
            Text(
              subtitle,
              style: const TextStyle(color: Colors.grey, fontSize: 11),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}
