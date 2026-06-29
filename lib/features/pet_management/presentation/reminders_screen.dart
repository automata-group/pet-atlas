import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/theme/app_colors.dart';
import '../bloc/pet_management_bloc.dart';
import '../bloc/pet_management_event.dart';
import '../bloc/pet_management_state.dart';

class RemindersScreen extends StatefulWidget {
  final int petId;

  const RemindersScreen({super.key, required this.petId});

  @override
  State<RemindersScreen> createState() => _RemindersScreenState();
}

class _RemindersScreenState extends State<RemindersScreen> {
  String _filterStatus = 'all'; // all, pending, completed

  void _showAddReminderSheet(BuildContext context, bool isArabic, bool isDark) {
    final titleController = TextEditingController();
    String selectedType = 'other';
    DateTime selectedDate = DateTime.now().add(const Duration(hours: 1));
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
                        isArabic ? 'إضافة تذكير جديد' : 'Add New Reminder',
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
                      DropdownButtonFormField<String>(
                        value: selectedType,
                        decoration: InputDecoration(
                          labelText: isArabic ? 'النوع' : 'Type',
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        items: [
                          DropdownMenuItem(value: 'medication', child: Text(isArabic ? 'دواء / علاج' : 'Medication')),
                          DropdownMenuItem(value: 'vaccine', child: Text(isArabic ? 'تطعيم / لقاح' : 'Vaccine')),
                          DropdownMenuItem(value: 'vet_visit', child: Text(isArabic ? 'زيارة بيطرية' : 'Vet Visit')),
                          DropdownMenuItem(value: 'other', child: Text(isArabic ? 'آخر' : 'Other')),
                        ],
                        onChanged: (val) {
                          if (val != null) {
                            setModalState(() => selectedType = val);
                          }
                        },
                      ),
                      const SizedBox(height: 16),
                      InkWell(
                        onTap: () async {
                          final date = await showDatePicker(
                            context: context,
                            initialDate: selectedDate,
                            firstDate: DateTime.now(),
                            lastDate: DateTime.now().add(const Duration(days: 365)),
                          );
                          if (date != null) {
                            if (!context.mounted) return;
                            final time = await showTimePicker(
                              context: context,
                              initialTime: TimeOfDay.fromDateTime(selectedDate),
                            );
                            if (time != null) {
                              setModalState(() {
                                selectedDate = DateTime(date.year, date.month, date.day, time.hour, time.minute);
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
                                '${selectedDate.toLocal()}'.split('.')[0],
                                style: const TextStyle(fontSize: 16),
                              ),
                              Icon(Icons.calendar_today, color: AppColors.primary),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),
                      ElevatedButton(
                        onPressed: () {
                          if (formKey.currentState!.validate()) {
                            context.read<PetManagementBloc>().add(
                                  AddReminderEvent(widget.petId, {
                                    'title': titleController.text,
                                    'type': selectedType,
                                    'dateTime': selectedDate.toIso8601String(),
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
        title: Text(isArabic ? 'التذكيرات والمواعيد' : 'Reminders & Tasks'),
        elevation: 0,
        backgroundColor: Colors.transparent,
      ),
      body: Column(
        children: [
          // Filter Chips
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
            child: Row(
              children: [
                _buildFilterChip('all', isArabic ? 'الكل' : 'All', isDark),
                const SizedBox(width: 8),
                _buildFilterChip('pending', isArabic ? 'المعلقة' : 'Pending', isDark),
                const SizedBox(width: 8),
                _buildFilterChip('completed', isArabic ? 'المكتملة' : 'Completed', isDark),
              ],
            ),
          ),
          Expanded(
            child: BlocBuilder<PetManagementBloc, PetManagementState>(
              builder: (context, state) {
                if (state is PetManagementLoaded) {
                  var reminders = state.overview.upcomingReminders;
                  if (_filterStatus == 'pending') {
                    reminders = reminders.where((r) => !r.isCompleted).toList();
                  } else if (_filterStatus == 'completed') {
                    reminders = reminders.where((r) => r.isCompleted).toList();
                  }

                  if (reminders.isEmpty) {
                    return Center(
                      child: Text(
                        isArabic ? 'لا توجد تذكيرات مسجلة.' : 'No reminders found.',
                        style: const TextStyle(color: Colors.grey, fontSize: 16),
                      ),
                    );
                  }

                  return ListView.builder(
                    padding: const EdgeInsets.all(24),
                    itemCount: reminders.length,
                    itemBuilder: (context, index) {
                      final rem = reminders[index];
                      return Card(
                        color: isDark ? const Color(0xFF16252A) : Colors.white,
                        margin: const EdgeInsets.only(bottom: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        child: ListTile(
                          leading: Checkbox(
                            value: rem.isCompleted,
                            activeColor: AppColors.primary,
                            onChanged: (val) {
                              if (val != null) {
                                context.read<PetManagementBloc>().add(
                                      ToggleReminderEvent(widget.petId, rem.id, val),
                                    );
                              }
                            },
                          ),
                          title: Text(
                            rem.title,
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              decoration: rem.isCompleted ? TextDecoration.lineThrough : null,
                              color: rem.isCompleted ? Colors.grey : null,
                            ),
                          ),
                          subtitle: Text(
                            '${rem.type.toUpperCase()} • ${rem.dateTime.toLocal().toString().split('.')[0]}',
                            style: const TextStyle(fontSize: 12),
                          ),
                          trailing: IconButton(
                            icon: const Icon(Icons.delete_outline, color: Colors.redAccent),
                            onPressed: () {
                              context.read<PetManagementBloc>().add(
                                    DeleteReminderEvent(widget.petId, rem.id),
                                  );
                            },
                          ),
                        ),
                      );
                    },
                  );
                }
                return const Center(child: CircularProgressIndicator());
              },
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showAddReminderSheet(context, isArabic, isDark),
        backgroundColor: AppColors.primary,
        child: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }

  Widget _buildFilterChip(String status, String label, bool isDark) {
    final isSelected = _filterStatus == status;
    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (val) {
        if (val) {
          setState(() => _filterStatus = status);
        }
      },
      selectedColor: AppColors.primary,
      labelStyle: TextStyle(
        color: isSelected
            ? Colors.white
            : (isDark ? Colors.white70 : Colors.black87),
        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
      ),
    );
  }
}
