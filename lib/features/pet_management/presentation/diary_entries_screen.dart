import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/theme/app_colors.dart';
import '../bloc/pet_management_bloc.dart';
import '../bloc/pet_management_event.dart';
import '../bloc/pet_management_state.dart';

class DiaryEntriesScreen extends StatelessWidget {
  final int petId;

  const DiaryEntriesScreen({super.key, required this.petId});

  void _showAddEntrySheet(BuildContext context, bool isArabic, bool isDark) {
    final titleController = TextEditingController();
    final contentController = TextEditingController();
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
                    isArabic ? 'إضافة ملاحظة جديدة' : 'Add New Note',
                    style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 20),
                  TextFormField(
                    controller: titleController,
                    decoration: InputDecoration(
                      labelText: isArabic ? 'العنوان' : 'Title',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    validator: (val) => val == null || val.isEmpty
                        ? (isArabic ? 'الرجاء إدخال العنوان' : 'Please enter title')
                        : null,
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: contentController,
                    maxLines: 4,
                    decoration: InputDecoration(
                      labelText: isArabic ? 'التفاصيل' : 'Details',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    validator: (val) => val == null || val.isEmpty
                        ? (isArabic ? 'الرجاء إدخال التفاصيل' : 'Please enter details')
                        : null,
                  ),
                  const SizedBox(height: 24),
                  ElevatedButton(
                    onPressed: () {
                      if (formKey.currentState!.validate()) {
                        context.read<PetManagementBloc>().add(
                              AddDiaryEntryEvent(petId, {
                                'title': titleController.text,
                                'content': contentController.text,
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
        title: Text(isArabic ? 'يوميات الأليف' : 'Pet Diary'),
        elevation: 0,
        backgroundColor: Colors.transparent,
      ),
      body: BlocBuilder<PetManagementBloc, PetManagementState>(
        builder: (context, state) {
          if (state is PetManagementLoaded) {
            final entries = state.overview.recentDiary;

            if (entries.isEmpty) {
              return Center(
                child: Text(
                  isArabic ? 'سجل اليوميات فارغ.' : 'Diary is currently empty.',
                  style: const TextStyle(color: Colors.grey, fontSize: 16),
                ),
              );
            }

            return ListView.builder(
              padding: const EdgeInsets.all(24),
              itemCount: entries.length,
              itemBuilder: (context, index) {
                final entry = entries[index];
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
                            Text(
                              entry.title,
                              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                            ),
                            IconButton(
                              icon: const Icon(Icons.delete_outline, color: Colors.redAccent, size: 20),
                              onPressed: () {
                                context.read<PetManagementBloc>().add(
                                      DeleteDiaryEntryEvent(petId, entry.id),
                                    );
                              },
                            ),
                          ],
                        ),
                        Text(
                          entry.date.toLocal().toString().split(' ')[0],
                          style: const TextStyle(color: Colors.grey, fontSize: 12),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          entry.content,
                          style: TextStyle(
                            color: isDark ? Colors.white70 : Colors.black87,
                            height: 1.5,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            );
          }
          return const Center(child: CircularProgressIndicator());
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showAddEntrySheet(context, isArabic, isDark),
        backgroundColor: AppColors.primary,
        child: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }
}
