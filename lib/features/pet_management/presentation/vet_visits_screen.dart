import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/theme/app_colors.dart';
import '../bloc/pet_management_bloc.dart';
import '../bloc/pet_management_event.dart';
import '../bloc/pet_management_state.dart';
import '../data/repositories/pet_management_repository.dart';
import '../data/models/vet_visit.dart';

class VetVisitsScreen extends StatelessWidget {
  final int petId;

  const VetVisitsScreen({super.key, required this.petId});

  void _showAddVisitSheet(BuildContext context, bool isArabic, bool isDark) {
    final clinicController = TextEditingController();
    final vetController = TextEditingController();
    final reasonController = TextEditingController();
    final notesController = TextEditingController();
    DateTime selectedDateTime = DateTime.now();
    final formKey = GlobalKey<FormState>();

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (modalContext) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
              child: Container(
                padding: EdgeInsets.only(
                  left: 24,
                  right: 24,
                  top: 24,
                  bottom: 24 + MediaQuery.of(context).padding.bottom,
                ),
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF0F1E23) : Colors.white,
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
                ),
                child: Form(
                  key: formKey,
                  child: SingleChildScrollView(
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
                          isArabic ? 'تسجيل زيارة عيادة جديدة' : 'Log New Vet Visit',
                          style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 20),
                        TextFormField(
                          controller: clinicController,
                          decoration: InputDecoration(
                            labelText: isArabic ? 'اسم العيادة' : 'Clinic Name',
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          validator: (val) => val == null || val.isEmpty
                              ? (isArabic ? 'الرجاء إدخال اسم العيادة' : 'Please enter clinic name')
                              : null,
                        ),
                        const SizedBox(height: 16),
                        TextFormField(
                          controller: vetController,
                          decoration: InputDecoration(
                            labelText: isArabic ? 'اسم الطبيب (اختياري)' : 'Vet Name (Optional)',
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                        ),
                        const SizedBox(height: 16),
                        TextFormField(
                          controller: reasonController,
                          decoration: InputDecoration(
                            labelText: isArabic ? 'سبب الزيارة (مثال: تطعيم سنوي)' : 'Reason (e.g. Annual Checkup)',
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          validator: (val) => val == null || val.isEmpty
                              ? (isArabic ? 'الرجاء إدخال سبب الزيارة' : 'Please enter reason')
                              : null,
                        ),
                        const SizedBox(height: 16),
                        
                        // DateTime Picker
                        InkWell(
                          onTap: () async {
                            final date = await showDatePicker(
                              context: context,
                              initialDate: selectedDateTime,
                              firstDate: DateTime(2020),
                              lastDate: DateTime.now().add(const Duration(days: 365)),
                            );
                            if (date != null) {
                              if (!context.mounted) return;
                              final time = await showTimePicker(
                                context: context,
                                initialTime: TimeOfDay.fromDateTime(selectedDateTime),
                              );
                              if (time != null) {
                                setModalState(() {
                                  selectedDateTime = DateTime(date.year, date.month, date.day, time.hour, time.minute);
                                });
                              }
                            }
                          },
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                            decoration: BoxDecoration(
                              border: Border.all(color: Colors.grey),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  '${selectedDateTime.toLocal()}'.split('.')[0],
                                  style: const TextStyle(fontSize: 16),
                                ),
                                Icon(Icons.calendar_today, color: AppColors.primary),
                              ],
                            ),
                          ),
                        ),
                        
                        const SizedBox(height: 16),
                        TextFormField(
                          controller: notesController,
                          maxLines: 2,
                          decoration: InputDecoration(
                            labelText: isArabic ? 'ملاحظات وتوصيات الطبيب' : 'Vet Notes & Recommendations',
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                        ),
                        const SizedBox(height: 24),
                        ElevatedButton(
                          onPressed: () {
                            if (formKey.currentState!.validate()) {
                              context.read<PetManagementBloc>().add(
                                    AddVetVisitEvent(petId, {
                                      'clinicName': clinicController.text,
                                      'vetName': vetController.text,
                                      'reason': reasonController.text,
                                      'dateTime': selectedDateTime.toIso8601String(),
                                      'notes': notesController.text,
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
              ),
            );
          },
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
        title: Text(isArabic ? 'سجل الزيارات الطبية' : 'Vet Visits Log'),
        elevation: 0,
        backgroundColor: Colors.transparent,
      ),
      body: BlocBuilder<PetManagementBloc, PetManagementState>(
        builder: (context, state) {
          if (state is PetManagementLoaded) {
            return FutureBuilder<List<VetVisit>>(
              future: RepositoryProvider.of<PetManagementRepository>(context).getVetVisits(petId),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }
                if (snapshot.hasError) {
                  return Center(child: Text(isArabic ? 'خطأ في تحميل سجل الزيارات' : 'Error loading vet visits'));
                }

                final visits = snapshot.data ?? [];

                if (visits.isEmpty) {
                  return Center(
                    child: Text(
                      isArabic ? 'لم يتم تسجيل أي زيارات بعد.' : 'No vet visits logged yet.',
                      style: const TextStyle(color: Colors.grey, fontSize: 16),
                    ),
                  );
                }

                return ListView.builder(
                  padding: const EdgeInsets.all(24),
                  itemCount: visits.length,
                  itemBuilder: (context, index) {
                    final visit = visits[index];

                    return Card(
                      color: isDark ? const Color(0xFF16252A) : Colors.white,
                      margin: const EdgeInsets.only(bottom: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Expanded(
                                  child: Text(
                                    visit.reason,
                                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                                  ),
                                ),
                                IconButton(
                                  icon: const Icon(Icons.delete_outline, color: Colors.redAccent),
                                  onPressed: () {
                                    context.read<PetManagementBloc>().add(
                                          DeleteVetVisitEvent(petId, visit.id),
                                        );
                                  },
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                const Icon(Icons.local_hospital_outlined, size: 16, color: Colors.grey),
                                const SizedBox(width: 8),
                                Text(
                                  visit.clinicName,
                                  style: const TextStyle(fontWeight: FontWeight.w500),
                                ),
                                if (visit.vetName != null && visit.vetName!.isNotEmpty) ...[
                                  Text(' (${visit.vetName})'),
                                ]
                              ],
                            ),
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                const Icon(Icons.access_time, size: 16, color: Colors.grey),
                                const SizedBox(width: 8),
                                Text(
                                  visit.dateTime.toLocal().toString().split('.')[0],
                                  style: const TextStyle(color: Colors.grey, fontSize: 12),
                                ),
                              ],
                            ),
                            if (visit.notes != null && visit.notes!.isNotEmpty) ...[
                              const SizedBox(height: 12),
                              const Divider(),
                              Text(
                                visit.notes!,
                                style: const TextStyle(color: Colors.grey, fontStyle: FontStyle.italic),
                              ),
                            ]
                          ],
                        ),
                      ),
                    );
                  },
                );
              },
            );
          }
          return const Center(child: CircularProgressIndicator());
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showAddVisitSheet(context, isArabic, isDark),
        backgroundColor: AppColors.primary,
        child: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }
}
