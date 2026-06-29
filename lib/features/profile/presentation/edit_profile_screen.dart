import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../l10n/app_localizations.dart';
import '../../auth/data/models/user.dart';
import '../../../core/theme/app_colors.dart';
import '../bloc/profile_bloc.dart';
import '../bloc/profile_event.dart';

class EditProfileScreen extends StatefulWidget {
  final User user;

  const EditProfileScreen({super.key, required this.user});

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  late TextEditingController _firstNameController;
  late TextEditingController _lastNameController;
  late TextEditingController _dobController;
  late TextEditingController _addressController;
  late TextEditingController _cityController;
  late TextEditingController _countryController;
  late TextEditingController _mobileController;
  
  String? _selectedSex;
  DateTime? _selectedDate;

  @override
  void initState() {
    super.initState();
    _firstNameController = TextEditingController(text: widget.user.firstName);
    _lastNameController = TextEditingController(text: widget.user.lastName);
    _addressController = TextEditingController(text: widget.user.address);
    _cityController = TextEditingController(text: widget.user.city);
    _countryController = TextEditingController(text: widget.user.country);
    _mobileController = TextEditingController(text: widget.user.mobileNumber);
    
    _selectedSex = widget.user.sex;
    _selectedDate = widget.user.dob;
    
    _dobController = TextEditingController(
      text: _selectedDate != null ? '${_selectedDate!.day}/${_selectedDate!.month}/${_selectedDate!.year}' : '',
    );
  }

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _dobController.dispose();
    _addressController.dispose();
    _cityController.dispose();
    _countryController.dispose();
    _mobileController.dispose();
    super.dispose();
  }

  Future<void> _selectDate(BuildContext context) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate ?? DateTime(1995),
      firstDate: DateTime(1950),
      lastDate: DateTime.now(),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(primary: AppColors.primary),
          ),
          child: child!,
        );
      },
    );
    if (picked != null && picked != _selectedDate) {
      setState(() {
        _selectedDate = picked;
        _dobController.text = '${picked.day}/${picked.month}/${picked.year}';
      });
    }
  }

  void _saveProfile() {
    final updatedUser = User(
      id: widget.user.id,
      username: widget.user.username,
      email: widget.user.email,
      firstName: _firstNameController.text,
      lastName: _lastNameController.text,
      dob: _selectedDate,
      sex: _selectedSex,
      address: _addressController.text,
      city: _cityController.text,
      country: _countryController.text,
      mobileNumber: _mobileController.text,
      photoUrl: widget.user.photoUrl,
    );

    context.read<ProfileBloc>().add(UpdateProfileDetailsEvent(updatedUser));
    Navigator.pop(context);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(AppLocalizations.of(context)!.profileUpdatedSuccessfully)),
    );
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.profileEditProfile, style: const TextStyle(fontWeight: FontWeight.bold)),
        elevation: 0,
        actions: [
          TextButton(
            onPressed: _saveProfile,
            child: Text(l10n.profileSave, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildSectionTitle(l10n.profilePersonalInfo),
            const SizedBox(height: 16),
            _buildTextField(label: l10n.profileFirstName, controller: _firstNameController, icon: Icons.person_outline),
            _buildTextField(label: l10n.profileLastName, controller: _lastNameController, icon: Icons.person_outline),
            
            _buildDateField(context),
            _buildSexSelector(context),
            
            const SizedBox(height: 32),
            _buildSectionTitle(l10n.profileContactDetails),
            const SizedBox(height: 16),
            _buildTextField(label: l10n.profileMobileNumber, controller: _mobileController, icon: Icons.phone_android, keyboardType: TextInputType.phone),
            _buildTextField(label: l10n.profileAddress, controller: _addressController, icon: Icons.location_on_outlined),
            
            Row(
              children: [
                Expanded(child: _buildTextField(label: l10n.profileCity, controller: _cityController)),
                const SizedBox(width: 16),
                Expanded(child: _buildTextField(label: l10n.profileCountry, controller: _countryController)),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.primary),
    );
  }

  Widget _buildTextField({
    required String label,
    required TextEditingController controller,
    IconData? icon,
    TextInputType? keyboardType,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 20),
      child: TextField(
        controller: controller,
        keyboardType: keyboardType,
        decoration: InputDecoration(
          labelText: label,
          prefixIcon: icon != null ? Icon(icon, color: AppColors.primary) : null,
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: Colors.grey.withValues(alpha: 0.3)),
          ),
        ),
      ),
    );
  }

  Widget _buildDateField(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 20),
      child: TextField(
        controller: _dobController,
        readOnly: true,
        onTap: () => _selectDate(context),
        decoration: InputDecoration(
          labelText: 'Date of Birth',
          prefixIcon: const Icon(Icons.calendar_month, color: AppColors.primary),
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: Colors.grey.withValues(alpha: 0.3)),
          ),
        ),
      ),
    );
  }

  Widget _buildSexSelector(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(l10n.profileSex, style: const TextStyle(color: Colors.grey, fontSize: 13)),
        const SizedBox(height: 8),
        Row(
          children: [
            _buildSexOption('Male'),
            const SizedBox(width: 16),
            _buildSexOption('Female'),
          ],
        ),
        const SizedBox(height: 20),
      ],
    );
  }

  Widget _buildSexOption(String label) {
    final isSelected = _selectedSex == label;
    return GestureDetector(
      onTap: () => setState(() => _selectedSex = label),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: isSelected ? AppColors.primary : Colors.grey.withValues(alpha: 0.3)),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : Colors.grey,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }
}
