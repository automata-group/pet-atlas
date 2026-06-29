import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/theme/app_colors.dart';
import '../bloc/pet_management_bloc.dart';
import '../bloc/pet_management_event.dart';
import '../bloc/pet_management_state.dart';
import '../data/repositories/pet_management_repository.dart';
import '../data/models/vaccine_log.dart';

class VaccinationsScreen extends StatelessWidget {
  final int petId;

  const VaccinationsScreen({super.key, required this.petId});

  void _showAddVaccineSheet(BuildContext context, bool isArabic, bool isDark) {
    final nameController = TextEditingController();
    final vetController = TextEditingController();
    DateTime administeredDate = DateTime.now();
    DateTime? nextDueDate;
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
                          isArabic ? 'سجل تطعيماً جديداً' : 'Log New Vaccine',
                          style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 20),
                        TextFormField(
                          controller: nameController,
                          decoration: InputDecoration(
                            labelText: isArabic ? 'اسم اللقاح / التطعيم' : 'Vaccine Name',
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          validator: (val) => val == null || val.isEmpty
                              ? (isArabic ? 'الرجاء إدخال اسم اللقاح' : 'Please enter vaccine name')
                              : null,
                        ),
                        const SizedBox(height: 16),
                        TextFormField(
                          controller: vetController,
                          decoration: InputDecoration(
                            labelText: isArabic ? 'اسم الطبيب (اختياري)' : 'Veterinarian (Optional)',
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                        ),
                        const SizedBox(height: 16),
                        
                        // Administered Date
                        ListTile(
                          title: Text(isArabic ? 'تاريخ التلقيح' : 'Administered Date'),
                          subtitle: Text('${administeredDate.toLocal()}'.split(' ')[0]),
                          trailing: const Icon(Icons.calendar_today),
                          onTap: () async {
                            final date = await showDatePicker(
                              context: context,
                              initialDate: administeredDate,
                              firstDate: DateTime(2020),
                              lastDate: DateTime.now().add(const Duration(days: 365)),
                            );
                            if (date != null) {
                              setModalState(() => administeredDate = date);
                            }
                          },
                        ),
                        
                        // Next Due Date
                        ListTile(
                          title: Text(isArabic ? 'الجرعة القادمة (اختياري)' : 'Next Due Date (Optional)'),
                          subtitle: Text(nextDueDate != null ? '${nextDueDate!.toLocal()}'.split(' ')[0] : (isArabic ? 'غير محدد' : 'Not scheduled')),
                          trailing: const Icon(Icons.calendar_today),
                          onTap: () async {
                            final date = await showDatePicker(
                              context: context,
                              initialDate: nextDueDate ?? DateTime.now().add(const Duration(days: 365)),
                              firstDate: administeredDate,
                              lastDate: DateTime.now().add(const Duration(days: 365 * 3)),
                            );
                            if (date != null) {
                              setModalState(() => nextDueDate = date);
                            }
                          },
                        ),
                        
                        const SizedBox(height: 24),
                        ElevatedButton(
                          onPressed: () {
                            if (formKey.currentState!.validate()) {
                              context.read<PetManagementBloc>().add(
                                    AddVaccineLogEvent(petId, {
                                      'name': nameController.text,
                                      'administeredDate': administeredDate.toIso8601String(),
                                      'nextDueDate': nextDueDate?.toIso8601String(),
                                      'veterinarian': vetController.text,
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
        title: Text(isArabic ? 'سجل التطعيمات واللقاحات' : 'Vaccinations Record'),
        elevation: 0,
        backgroundColor: Colors.transparent,
      ),
      body: BlocBuilder<PetManagementBloc, PetManagementState>(
        builder: (context, state) {
          if (state is PetManagementLoaded) {
            return FutureBuilder<List<VaccineLog>>(
              future: RepositoryProvider.of<PetManagementRepository>(context).getVaccines(petId),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }
                if (snapshot.hasError) {
                  return Center(child: Text(isArabic ? 'خطأ في تحميل سجل اللقاحات' : 'Error loading vaccines'));
                }

                final vaccines = snapshot.data ?? [];

                if (vaccines.isEmpty) {
                  return Center(
                    child: Text(
                      isArabic ? 'لم يتم تسجيل أي تطعيمات بعد.' : 'No vaccinations recorded yet.',
                      style: const TextStyle(color: Colors.grey, fontSize: 16),
                    ),
                  );
                }

                return ListView.builder(
                  padding: const EdgeInsets.all(24),
                  itemCount: vaccines.length,
                  itemBuilder: (context, index) {
                    final vac = vaccines[index];
                    final hasNext = vac.nextDueDate != null;

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
                                    vac.name,
                                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                                  ),
                                ),
                                IconButton(
                                  icon: const Icon(Icons.delete_outline, color: Colors.redAccent),
                                  onPressed: () {
                                    context.read<PetManagementBloc>().add(
                                          DeleteVaccineLogEvent(petId, vac.id),
                                        );
                                  },
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                const Icon(Icons.vaccines, size: 16, color: Colors.grey),
                                const SizedBox(width: 8),
                                Text(
                                  '${isArabic ? "تاريخ التلقيح" : "Administered"}: ${vac.administeredDate.toLocal().toString().split(' ')[0]}',
                                  style: const TextStyle(fontWeight: FontWeight.w500),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                const Icon(Icons.notifications_active_outlined, size: 16, color: Colors.grey),
                                const SizedBox(width: 8),
                                Text(
                                  '${isArabic ? "الجرعة القادمة" : "Next Due"}: ${hasNext ? vac.nextDueDate!.toLocal().toString().split(' ')[0] : (isArabic ? "غير مجدول" : "Not scheduled")}',
                                  style: TextStyle(
                                    color: hasNext ? Colors.orange : Colors.grey,
                                    fontSize: 12,
                                    fontWeight: hasNext ? FontWeight.bold : null,
                                  ),
                                ),
                              ],
                            ),
                            if (vac.veterinarian != null && vac.veterinarian!.isNotEmpty) ...[
                              const SizedBox(height: 12),
                              const Divider(),
                              Row(
                                children: [
                                  const Icon(Icons.person_outline, size: 14, color: Colors.grey),
                                  const SizedBox(width: 6),
                                  Text(
                                    '${isArabic ? "بإشراف الطبيب" : "By Vet"}: ${vac.veterinarian}',
                                    style: const TextStyle(color: Colors.grey, fontSize: 12),
                                  ),
                                ],
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
        onPressed: () => _showAddVaccineSheet(context, isArabic, isDark),
        backgroundColor: AppColors.primary,
        child: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }
}
