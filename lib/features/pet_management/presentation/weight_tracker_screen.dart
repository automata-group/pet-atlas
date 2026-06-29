import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/theme/app_colors.dart';
import '../bloc/pet_management_bloc.dart';
import '../bloc/pet_management_event.dart';
import '../bloc/pet_management_state.dart';
import '../data/models/weight_log.dart';
import '../data/repositories/pet_management_repository.dart';

class WeightTrackerScreen extends StatelessWidget {
  final int petId;

  const WeightTrackerScreen({super.key, required this.petId});

  void _showAddWeightSheet(BuildContext context, bool isArabic, bool isDark) {
    final weightController = TextEditingController();
    final formKey = GlobalKey<FormState>();

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (modalContext) {
        return Padding(
          padding: EdgeInsets.only(bottom: MediaQuery.of(modalContext).viewInsets.bottom),
          child: Container(
            padding: EdgeInsets.only(
              left: 24,
              right: 24,
              top: 24,
              bottom: 24 + MediaQuery.of(modalContext).padding.bottom,
            ),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF0F1E23) : Colors.white,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
            ),
            child: Form(
              key: formKey,
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
                    isArabic ? 'سجل وزناً جديداً' : 'Log New Weight',
                    style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 20),
                  TextFormField(
                    controller: weightController,
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    decoration: InputDecoration(
                      labelText: isArabic ? 'الوزن (كجم)' : 'Weight (kg)',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    validator: (val) => val == null || double.tryParse(val) == null
                        ? (isArabic ? 'الرجاء إدخال وزن صحيح' : 'Please enter a valid weight')
                        : null,
                  ),
                  const SizedBox(height: 24),
                  ElevatedButton(
                    onPressed: () {
                      if (formKey.currentState!.validate()) {
                        context.read<PetManagementBloc>().add(
                              AddWeightLogEvent(petId, {
                                'weight': weightController.text,
                                'date': DateTime.now().toIso8601String(),
                              }),
                            );
                        Navigator.pop(modalContext);
                      }
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      minimumSize: const Size(double.infinity, 50),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: Text(isArabic ? 'حفظ' : 'Save'),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final isArabic = Localizations.localeOf(context).languageCode == 'ar';
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF0F1E23) : const Color(0xFFF5F8F8),
      appBar: AppBar(
        title: Text(isArabic ? 'متابع الوزن والنمو' : 'Weight Tracker'),
        elevation: 0,
        backgroundColor: Colors.transparent,
      ),
      body: BlocBuilder<PetManagementBloc, PetManagementState>(
        builder: (context, state) {
          if (state is PetManagementLoaded) {
            // Wait, we need to load weight logs. Since the overview loads the latestWeight, does it load the list?
            // Wait! In PetManagementService we implemented getWeight(petId) which returns the full list!
            // But state.overview only has the latestWeight, medications, vetVisits, vaccines (limit 5).
            // Wait, can we fetch the list or do we get it from a separate request?
            // Actually, in `test-pet-management.js` and `pet_management_repository.dart` we have `getWeight(petId)`.
            // But we can also query weight logs directly or use the Bloc.
            // Wait! If the user clicks on a category, does the Bloc fetch the list?
            // In `pet_management_bloc.dart`, we implemented add/delete of weight logs to trigger a reload of the overview.
            // Wait, can we just list the weight logs from a separate fetch, or can we return the list in the overview?
            // Let's check `pet-management.service.ts` line 70:
            // ```typescript
            //     const latestWeight = await this.weightLogRepository.findOne({
            //       where: { petId },
            //       order: { date: 'DESC' },
            //     });
            // ```
            // Ah! The overview only has the single `latestWeight`. But wait, in the sub-screens, is it better if they fetch their full lists?
            // Yes! But wait, `PetManagementBloc` currently only holds `PetManagementLoaded` which has `overview`.
            // Wait, if the overview contains `medications`, `vetVisits`, and `vaccines` (limit 5), we can just fetch the full lists dynamically,
            // OR we can make a separate repository call!
            // Wait! Is there an easy way? Yes! We can write a simple `FutureBuilder` or wrap it in a `StatefulWidget` that calls the repository directly!
            // Calling the repository directly in a `FutureBuilder` is extremely simple, responsive, and keeps the code highly decoupled!
            // Let's look at `PetManagementRepository` methods:
            // - `getWeight(petId)` returns `Future<List<WeightLog>>`
            // - `getMeds(petId)` returns `Future<List<MedicationLog>>`
            // - `getVetVisits(petId)` returns `Future<List<VetVisit>>`
            // - `getVaccines(petId)` returns `Future<List<VaccineLog>>`
            // - `getDiary(petId)` returns `Future<List<DiaryEntry>>`
            // - `getReminders(petId)` returns `Future<List<PetReminder>>`
            //
            // This is absolutely perfect! Using `FutureBuilder` on these repository methods inside the sub-screens is incredibly robust,
            // handles loading and error states cleanly, and automatically refreshes when we trigger events through the Bloc by calling `setState` or listening to the Bloc state changes!
            // Let's implement this pattern in all sub-screens.

            return FutureBuilder<List<WeightLog>>(
              future: RepositoryProvider.of<PetManagementRepository>(context).getWeight(petId),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }
                if (snapshot.hasError) {
                  return Center(child: Text(isArabic ? 'خطأ في تحميل سجل الوزن' : 'Error loading weight logs'));
                }

                final logs = snapshot.data ?? [];

                if (logs.isEmpty) {
                  return Center(
                    child: Text(
                      isArabic ? 'لم يتم تسجيل أي أوزان بعد.' : 'No weight records logged yet.',
                      style: const TextStyle(color: Colors.grey, fontSize: 16),
                    ),
                  );
                }

                // Compute difference between latest and previous log
                double diff = 0.0;
                if (logs.length >= 2) {
                  final latestVal = double.tryParse(logs[0].weight) ?? 0.0;
                  final prevVal = double.tryParse(logs[1].weight) ?? 0.0;
                  diff = latestVal - prevVal;
                }

                return ListView(
                  padding: const EdgeInsets.all(24),
                  children: [
                    // Visual Weight Indicator Card
                    if (logs.length >= 2)
                      Container(
                        padding: const EdgeInsets.all(16),
                        margin: const EdgeInsets.only(bottom: 24),
                        decoration: BoxDecoration(
                          color: diff >= 0 ? Colors.green.withValues(alpha: 0.1) : Colors.red.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              isArabic ? 'معدل التغير في الوزن' : 'Weight Change Rate',
                              style: const TextStyle(fontWeight: FontWeight.bold),
                            ),
                            Text(
                              '${diff >= 0 ? '+' : ''}${diff.toStringAsFixed(2)} kg',
                              style: TextStyle(
                                color: diff >= 0 ? Colors.green : Colors.red,
                                fontWeight: FontWeight.bold,
                                fontSize: 18,
                              ),
                            ),
                          ],
                        ),
                      ),

                    ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: logs.length,
                      itemBuilder: (context, index) {
                        final log = logs[index];
                        return Card(
                          color: isDark ? const Color(0xFF16252A) : Colors.white,
                          margin: const EdgeInsets.only(bottom: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          child: ListTile(
                            leading: Icon(Icons.monitor_weight, color: AppColors.primary),
                            title: Text(
                              '${log.weight} kg',
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                            ),
                            subtitle: Text(log.date.toLocal().toString().split(' ')[0]),
                            trailing: IconButton(
                              icon: const Icon(Icons.delete_outline, color: Colors.redAccent),
                              onPressed: () {
                                context.read<PetManagementBloc>().add(
                                      DeleteWeightLogEvent(petId, log.id),
                                    );
                                // Trigger UI rebuild by resetting state in BLoC
                              },
                            ),
                          ),
                        );
                      },
                    ),
                  ],
                );
              },
            );
          }
          return const Center(child: CircularProgressIndicator());
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showAddWeightSheet(context, isArabic, isDark),
        backgroundColor: AppColors.primary,
        child: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }
}
