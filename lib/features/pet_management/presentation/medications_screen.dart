import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/theme/app_colors.dart';
import '../bloc/pet_management_bloc.dart';
import '../bloc/pet_management_event.dart';
import '../bloc/pet_management_state.dart';
import '../data/repositories/pet_management_repository.dart';
import '../data/models/medication_log.dart';

class MedicationsScreen extends StatelessWidget {
  final int petId;

  const MedicationsScreen({super.key, required this.petId});

  void _showAddMedicationSheet(BuildContext context, bool isArabic, bool isDark) {
    final nameController = TextEditingController();
    final dosageController = TextEditingController();
    final frequencyController = TextEditingController();
    final notesController = TextEditingController();
    DateTime startDate = DateTime.now();
    DateTime? endDate;
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
                          isArabic ? 'إضافة دواء جديد' : 'Add New Medication',
                          style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 20),
                        TextFormField(
                          controller: nameController,
                          decoration: InputDecoration(
                            labelText: isArabic ? 'اسم الدواء' : 'Medication Name',
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          validator: (val) => val == null || val.isEmpty
                              ? (isArabic ? 'الرجاء إدخال اسم الدواء' : 'Please enter medication name')
                              : null,
                        ),
                        const SizedBox(height: 16),
                        TextFormField(
                          controller: dosageController,
                          decoration: InputDecoration(
                            labelText: isArabic ? 'الجرعة (مثال: نصف حبة)' : 'Dosage (e.g. 1/2 pill)',
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          validator: (val) => val == null || val.isEmpty
                              ? (isArabic ? 'الرجاء إدخال الجرعة' : 'Please enter dosage')
                              : null,
                        ),
                        const SizedBox(height: 16),
                        TextFormField(
                          controller: frequencyController,
                          decoration: InputDecoration(
                            labelText: isArabic ? 'التكرار (مثال: مرتين يومياً)' : 'Frequency (e.g. Twice daily)',
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          validator: (val) => val == null || val.isEmpty
                              ? (isArabic ? 'الرجاء إدخال التكرار' : 'Please enter frequency')
                              : null,
                        ),
                        const SizedBox(height: 16),
                        
                        // Start Date
                        ListTile(
                          title: Text(isArabic ? 'تاريخ البدء' : 'Start Date'),
                          subtitle: Text('${startDate.toLocal()}'.split(' ')[0]),
                          trailing: const Icon(Icons.calendar_today),
                          onTap: () async {
                            final date = await showDatePicker(
                              context: context,
                              initialDate: startDate,
                              firstDate: DateTime(2020),
                              lastDate: DateTime.now().add(const Duration(days: 365)),
                            );
                            if (date != null) {
                              setModalState(() => startDate = date);
                            }
                          },
                        ),
                        
                        // End Date
                        ListTile(
                          title: Text(isArabic ? 'تاريخ الانتهاء (اختياري)' : 'End Date (Optional)'),
                          subtitle: Text(endDate != null ? '${endDate!.toLocal()}'.split(' ')[0] : (isArabic ? 'مستمر' : 'Ongoing')),
                          trailing: const Icon(Icons.calendar_today),
                          onTap: () async {
                            final date = await showDatePicker(
                              context: context,
                              initialDate: endDate ?? DateTime.now().add(const Duration(days: 7)),
                              firstDate: startDate,
                              lastDate: DateTime.now().add(const Duration(days: 365)),
                            );
                            if (date != null) {
                              setModalState(() => endDate = date);
                            }
                          },
                        ),
                        
                        const SizedBox(height: 12),
                        TextFormField(
                          controller: notesController,
                          maxLines: 2,
                          decoration: InputDecoration(
                            labelText: isArabic ? 'ملاحظات' : 'Notes',
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                        ),
                        const SizedBox(height: 24),
                        ElevatedButton(
                          onPressed: () {
                            if (formKey.currentState!.validate()) {
                              context.read<PetManagementBloc>().add(
                                    AddMedicationLogEvent(petId, {
                                      'name': nameController.text,
                                      'dosage': dosageController.text,
                                      'frequency': frequencyController.text,
                                      'startDate': startDate.toIso8601String(),
                                      'endDate': endDate?.toIso8601String(),
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
        title: Text(isArabic ? 'سجل الأدوية والعلاجات' : 'Medications & Prescriptions'),
        elevation: 0,
        backgroundColor: Colors.transparent,
      ),
      body: BlocBuilder<PetManagementBloc, PetManagementState>(
        builder: (context, state) {
          if (state is PetManagementLoaded) {
            return FutureBuilder<List<MedicationLog>>(
              future: RepositoryProvider.of<PetManagementRepository>(context).getMeds(petId),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }
                if (snapshot.hasError) {
                  return Center(child: Text(isArabic ? 'خطأ في تحميل سجل الأدوية' : 'Error loading medications'));
                }

                final meds = snapshot.data ?? [];

                if (meds.isEmpty) {
                  return Center(
                    child: Text(
                      isArabic ? 'لا توجد أدوية مسجلة حالياً.' : 'No medications recorded.',
                      style: const TextStyle(color: Colors.grey, fontSize: 16),
                    ),
                  );
                }

                return ListView.builder(
                  padding: const EdgeInsets.all(24),
                  itemCount: meds.length,
                  itemBuilder: (context, index) {
                    final med = meds[index];
                    final isOngoing = med.endDate == null;

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
                                    med.name,
                                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                                  ),
                                ),
                                IconButton(
                                  icon: const Icon(Icons.delete_outline, color: Colors.redAccent),
                                  onPressed: () {
                                    context.read<PetManagementBloc>().add(
                                          DeleteMedicationLogEvent(petId, med.id),
                                        );
                                  },
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                Icon(Icons.medication, size: 16, color: AppColors.primary),
                                const SizedBox(width: 8),
                                Text(
                                  '${isArabic ? "الجرعة" : "Dosage"}: ${med.dosage} (${med.frequency})',
                                  style: const TextStyle(fontWeight: FontWeight.w500),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                const Icon(Icons.calendar_month, size: 16, color: Colors.grey),
                                const SizedBox(width: 8),
                                Text(
                                  '${isArabic ? "المدة" : "Duration"}: ${med.startDate.toLocal().toString().split(' ')[0]} ${isArabic ? "إلى" : "to"} ${isOngoing ? (isArabic ? "مستمر" : "Ongoing") : med.endDate!.toLocal().toString().split(' ')[0]}',
                                  style: const TextStyle(color: Colors.grey, fontSize: 12),
                                ),
                              ],
                            ),
                            if (med.notes != null && med.notes!.isNotEmpty) ...[
                              const SizedBox(height: 12),
                              const Divider(),
                              Text(
                                med.notes!,
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
        onPressed: () => _showAddMedicationSheet(context, isArabic, isDark),
        backgroundColor: AppColors.primary,
        child: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }
}
