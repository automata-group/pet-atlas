import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/theme/app_colors.dart';
import '../bloc/profile_bloc.dart';
import '../bloc/profile_event.dart';

class AddPetScreen extends StatefulWidget {
  const AddPetScreen({super.key});

  @override
  State<AddPetScreen> createState() => _AddPetScreenState();
}

class _AddPetScreenState extends State<AddPetScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _breedController = TextEditingController();
  final _weightController = TextEditingController();
  final _notesController = TextEditingController();
  
  String _selectedType = 'Dog';
  String _selectedSex = 'Male';
  bool _isNeutered = false;
  DateTime? _selectedDob;
  String _photoUrl = '';

  @override
  void dispose() {
    _nameController.dispose();
    _breedController.dispose();
    _weightController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _selectDob(BuildContext context) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now().subtract(const Duration(days: 365)),
      firstDate: DateTime(2000),
      lastDate: DateTime.now(),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: ColorScheme.dark(
              primary: AppColors.primary,
              onPrimary: Colors.white,
              surface: const Color(0xFF16252A),
              onSurface: Colors.white,
            ),
            dialogTheme: const DialogThemeData(
              backgroundColor: Color(0xFF0F1E23),
            ),
          ),
          child: child!,
        );
      },
    );
    if (picked != null && picked != _selectedDob) {
      setState(() {
        _selectedDob = picked;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final isArabic = Localizations.localeOf(context).languageCode == 'ar';

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF0F1E23) : const Color(0xFFF5F8F8),
      appBar: AppBar(
        title: Text(isArabic ? 'إضافة أليف جديد' : 'Add New Pet'),
        elevation: 0,
        backgroundColor: Colors.transparent,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Dynamic Pet Avatar photo section
              Center(
                child: Stack(
                  children: [
                    CircleAvatar(
                      radius: 54,
                      backgroundColor: isDark ? Colors.white10 : Colors.black12,
                      backgroundImage: _photoUrl.isNotEmpty ? NetworkImage(_photoUrl) : null,
                      child: _photoUrl.isEmpty
                          ? Icon(Icons.add_a_photo_outlined, size: 36, color: AppColors.primary)
                          : null,
                    ),
                    Positioned(
                      bottom: 0,
                      right: 0,
                      child: InkWell(
                        onTap: () => _showPetPhotoOptionSheet(context),
                        child: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: AppColors.primary,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.edit, size: 16, color: Colors.white),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),

              // Pet Name
              Text(
                isArabic ? 'اسم الأليف' : 'Pet Name',
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
              ),
              const SizedBox(height: 8),
              _buildTextField(
                _nameController,
                isArabic ? 'مثال: بودي' : 'e.g. Buddy',
                isArabic ? 'الرجاء إدخال اسم الأليف' : 'Please enter pet name',
              ),
              const SizedBox(height: 20),

              // Pet Type
              Text(
                isArabic ? 'نوع الأليف' : 'Pet Type',
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  _buildTypeOption('Dog', Icons.pets, isArabic ? 'كلب' : 'Dog'),
                  const SizedBox(width: 12),
                  _buildTypeOption('Cat', Icons.pets_outlined, isArabic ? 'قط' : 'Cat'),
                ],
              ),
              const SizedBox(height: 20),

              // Breed
              Text(
                isArabic ? 'السلالة' : 'Breed',
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
              ),
              const SizedBox(height: 8),
              _buildTextField(
                _breedController,
                isArabic ? 'مثال: روتوايلر' : 'e.g. Golden Retriever',
                isArabic ? 'الرجاء إدخال السلالة' : 'Please enter breed',
              ),
              const SizedBox(height: 20),

              // Date of Birth
              Text(
                isArabic ? 'تاريخ الميلاد' : 'Date of Birth',
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
              ),
              const SizedBox(height: 8),
              InkWell(
                onTap: () => _selectDob(context),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                  decoration: BoxDecoration(
                    color: isDark ? Colors.white.withValues(alpha: 0.05) : Colors.grey[200],
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: isDark ? Colors.white10 : Colors.black12,
                    ),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        _selectedDob == null
                            ? (isArabic ? 'اختر تاريخ الميلاد' : 'Select Date of Birth')
                            : _selectedDob!.toLocal().toString().split(' ')[0],
                        style: TextStyle(
                          color: _selectedDob == null ? Colors.grey : (isDark ? Colors.white : Colors.black87),
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      Icon(Icons.calendar_today, color: AppColors.primary, size: 20),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // Weight
              Text(
                isArabic ? 'الوزن (كجم)' : 'Weight (kg)',
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
              ),
              const SizedBox(height: 8),
              _buildTextField(
                _weightController,
                'e.g. 25.5',
                isArabic ? 'الرجاء إدخال الوزن' : 'Please enter weight',
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
              ),
              const SizedBox(height: 20),

              // Sex
              Text(
                isArabic ? 'الجنس' : 'Sex',
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  _buildSexOption('Male', Icons.male, isArabic ? 'ذكر' : 'Male'),
                  const SizedBox(width: 12),
                  _buildSexOption('Female', Icons.female, isArabic ? 'أنثى' : 'Female'),
                ],
              ),
              const SizedBox(height: 24),

              // Is Neutered
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: isDark ? Colors.white.withValues(alpha: 0.05) : Colors.grey[100],
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: isDark ? Colors.white10 : Colors.black12,
                  ),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            isArabic ? 'معقم / مخصي' : 'Neutered / Spayed',
                            style: const TextStyle(fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            isArabic ? 'هل تم إجراء عملية تعقيم لأليفك؟' : 'Has your pet been neutered?',
                            style: const TextStyle(fontSize: 12, color: Colors.grey),
                          ),
                        ],
                      ),
                    ),
                    Switch(
                      value: _isNeutered,
                      onChanged: (val) => setState(() => _isNeutered = val),
                      activeColor: AppColors.primary,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Notes
              Text(
                isArabic ? 'ملاحظات إضافية' : 'Additional Notes',
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _notesController,
                maxLines: 3,
                decoration: InputDecoration(
                  hintText: isArabic ? 'اكتب أي تفاصيل صحية أو سلوكية...' : 'Describe any health history, behaviors...',
                  filled: true,
                  fillColor: isDark ? Colors.white.withValues(alpha: 0.05) : Colors.grey[200],
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                ),
              ),
              const SizedBox(height: 40),

              ElevatedButton(
                onPressed: _submit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  minimumSize: const Size(double.infinity, 56),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  elevation: 4,
                ),
                child: Text(
                  isArabic ? 'حفظ ملف الأليف' : 'Save Pet Profile',
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTextField(TextEditingController controller, String hint, String validationMsg, {TextInputType? keyboardType}) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return TextFormField(
      controller: controller,
      keyboardType: keyboardType,
      style: TextStyle(color: isDark ? Colors.white : Colors.black87),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: const TextStyle(color: Colors.grey),
        filled: true,
        fillColor: isDark ? Colors.white.withValues(alpha: 0.05) : Colors.grey[200],
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      ),
      validator: (val) => val == null || val.isEmpty ? validationMsg : null,
    );
  }

  Widget _buildTypeOption(String type, IconData icon, String displayLabel) {
    final isSelected = _selectedType == type;
    return Expanded(
      child: InkWell(
        onTap: () => setState(() => _selectedType = type),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 16),
          decoration: BoxDecoration(
            color: isSelected ? AppColors.primary : (Theme.of(context).brightness == Brightness.dark ? Colors.white.withValues(alpha: 0.05) : Colors.grey[200]),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isSelected ? AppColors.primary : Colors.transparent,
            ),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, color: isSelected ? Colors.white : Colors.grey),
              const SizedBox(width: 8),
              Text(
                displayLabel,
                style: TextStyle(
                  color: isSelected ? Colors.white : Colors.grey,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSexOption(String sex, IconData icon, String displayLabel) {
    final isSelected = _selectedSex == sex;
    return Expanded(
      child: InkWell(
        onTap: () => setState(() => _selectedSex = sex),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 16),
          decoration: BoxDecoration(
            color: isSelected ? AppColors.primary : (Theme.of(context).brightness == Brightness.dark ? Colors.white.withValues(alpha: 0.05) : Colors.grey[200]),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isSelected ? AppColors.primary : Colors.transparent,
            ),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, color: isSelected ? Colors.white : Colors.grey),
              const SizedBox(width: 8),
              Text(
                displayLabel,
                style: TextStyle(
                  color: isSelected ? Colors.white : Colors.grey,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _submit() {
    if (_formKey.currentState!.validate()) {
      final petData = {
        'name': _nameController.text,
        'type': _selectedType,
        'breed': _breedController.text,
        'weight': double.tryParse(_weightController.text) ?? 0.0,
        'sex': _selectedSex,
        'neutered': _isNeutered,
        'dob': _selectedDob?.toIso8601String(),
        'photoUrl': _photoUrl,
        'notes': _notesController.text,
      };

      context.read<ProfileBloc>().add(AddPetEvent(petData));
      
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(Localizations.localeOf(context).languageCode == 'ar' ? 'تم إضافة الأليف بنجاح!' : 'Pet added successfully!'),
          backgroundColor: Colors.teal,
        ),
      );
    }
  }

  void _showPetPhotoOptionSheet(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final isArabic = Localizations.localeOf(context).languageCode == 'ar';
    final customUrlController = TextEditingController(text: _photoUrl);

    final List<Map<String, String>> petAvatars = [
      {
        'name': isArabic ? 'جرو لطيف' : 'Cute Puppy',
        'url': 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=150',
      },
      {
        'name': isArabic ? 'مسترد ذهبي' : 'Golden Retriever',
        'url': 'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=150',
      },
      {
        'name': isArabic ? 'هريرة صغيرة' : 'Cute Kitten',
        'url': 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=150',
      },
      {
        'name': isArabic ? 'قطة نائمة' : 'Sleeping Cat',
        'url': 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?q=80&w=150',
      },
      {
        'name': isArabic ? 'أرنب لطيف' : 'Cute Rabbit',
        'url': 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?q=80&w=150',
      },
      {
        'name': isArabic ? 'ببغاء ملون' : 'Colorful Parrot',
        'url': 'https://images.unsplash.com/photo-1522856283749-616db60c0d53?q=80&w=150',
      },
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
                      isArabic ? 'اختر صورة أليفك' : 'Choose Pet Avatar',
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
                        crossAxisSpacing: 12,
                        mainAxisSpacing: 12,
                        childAspectRatio: 0.85,
                      ),
                      itemCount: petAvatars.length,
                      itemBuilder: (context, index) {
                        final avatar = petAvatars[index];
                        return InkWell(
                          onTap: () {
                            setState(() {
                              _photoUrl = avatar['url']!;
                            });
                            Navigator.pop(context);
                          },
                          borderRadius: BorderRadius.circular(16),
                          child: Container(
                            decoration: BoxDecoration(
                              color: isDark ? Colors.white.withValues(alpha: 0.03) : Colors.grey[100],
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(
                                color: _photoUrl == avatar['url'] ? AppColors.primary : Colors.transparent,
                                width: 2,
                              ),
                            ),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                CircleAvatar(
                                  radius: 28,
                                  backgroundImage: NetworkImage(avatar['url']!),
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  avatar['name']!,
                                  style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold),
                                  textAlign: TextAlign.center,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ],
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
                                setState(() {
                                  _photoUrl = text;
                                });
                                Navigator.pop(context);
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
