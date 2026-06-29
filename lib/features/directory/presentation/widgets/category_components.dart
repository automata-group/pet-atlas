import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../l10n/app_localizations.dart';

/// Specialized widget for Vet listings (Specialties & Emergency info)
class VetMetadataWidget extends StatelessWidget {
  final Map<String, dynamic> metadata;

  const VetMetadataWidget({super.key, required this.metadata});

  @override
  Widget build(BuildContext context) {
    final specialties = metadata['specialties'] as List? ?? [];
    final languages = metadata['languages'] as List? ?? [];
    final isEmergency = metadata['emergencyService'] as bool? ?? false;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (isEmergency)
          Container(
            margin: const EdgeInsets.only(bottom: 16),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: Colors.red.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: Colors.red.withValues(alpha: 0.3)),
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.warning_amber_rounded, color: Colors.red, size: 18),
                SizedBox(width: 8),
                Text('24/7 Emergency Service Available', 
                  style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold, fontSize: 13)),
              ],
            ),
          ),
        Text(AppLocalizations.of(context)!.dirSpecialties, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          children: specialties.map((s) => Chip(
            label: Text(s.toString()),
            backgroundColor: AppColors.primary.withValues(alpha: 0.05),
            side: BorderSide.none,
          )).toList(),
        ),
        const SizedBox(height: 16),
        Text(AppLocalizations.of(context)!.dirLanguagesSpoken, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        Text(languages.join(', '), style: const TextStyle(color: Colors.grey)),
      ],
    );
  }
}

/// Specialized widget for Grooming listings with dynamic size-based pricing
class GroomingServiceMenu extends StatefulWidget {
  final Map<String, dynamic> metadata;
  final Function(String service, double price) onServiceToggle;
  final Set<String> selectedServices;

  const GroomingServiceMenu({
    super.key, 
    required this.metadata, 
    required this.onServiceToggle,
    required this.selectedServices,
  });

  @override
  State<GroomingServiceMenu> createState() => _GroomingServiceMenuState();
}

class _GroomingServiceMenuState extends State<GroomingServiceMenu> {
  String _selectedSize = 'small'; // small, medium, large

  @override
  Widget build(BuildContext context) {
    final tieredPrices = widget.metadata['tieredPrices'] as Map<String, dynamic>? ?? {};

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(AppLocalizations.of(context)!.dirSelectPetSize, style: const TextStyle(fontWeight: FontWeight.bold)),
        const SizedBox(height: 12),
        Row(
          children: ['small', 'medium', 'large'].map((size) {
            final isSelected = _selectedSize == size;
            return Expanded(
              child: GestureDetector(
                onTap: () => setState(() => _selectedSize = size),
                child: Container(
                  margin: const EdgeInsets.symmetric(horizontal: 4),
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  decoration: BoxDecoration(
                    color: isSelected ? AppColors.primary : Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.primary.withValues(alpha: 0.2)),
                  ),
                  child: Center(
                    child: Text(
                      size.toUpperCase(),
                      style: TextStyle(
                        color: isSelected ? Colors.white : Colors.black,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              ),
            );
          }).toList(),
        ),
        const SizedBox(height: 24),
        ...tieredPrices.entries.map((entry) {
          final serviceName = entry.key;
          final prices = entry.value as Map<String, dynamic>;
          final price = (prices[_selectedSize] ?? 0.0).toDouble();
          final isSelected = widget.selectedServices.contains(serviceName);

          return GestureDetector(
            onTap: () => widget.onServiceToggle(serviceName, price),
            child: Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isSelected ? AppColors.primary.withValues(alpha: 0.05) : Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: isSelected ? AppColors.primary : AppColors.primary.withValues(alpha: 0.05),
                  width: isSelected ? 2 : 1,
                ),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Text(serviceName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  ),
                  Text(
                    '\$${price.toInt()}',
                    style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w900, fontSize: 18),
                  ),
                ],
              ),
            ),
          );
        }),
      ],
    );
  }
}

/// Specialized widget for Insurance listings (Plan tiers)
class InsurancePlansWidget extends StatelessWidget {
  final Map<String, dynamic> metadata;
  final VoidCallback onQuoteRequest;

  const InsurancePlansWidget({super.key, required this.metadata, required this.onQuoteRequest});

  @override
  Widget build(BuildContext context) {
    final plans = metadata['plans'] as List? ?? [];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(AppLocalizations.of(context)!.dirInsurancePlans, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
        const SizedBox(height: 16),
        ...plans.map((plan) => Container(
          margin: const EdgeInsets.only(bottom: 16),
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: AppColors.primary.withValues(alpha: 0.1)),
            gradient: plan['name'] == 'Premium' ? LinearGradient(
              colors: [Colors.white, AppColors.primary.withValues(alpha: 0.05)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ) : null,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(plan['name'] ?? 'Plan', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  Text('\$${plan['monthlyPrice']}/mo', 
                    style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w900, fontSize: 20)),
                ],
              ),
              const SizedBox(height: 8),
              Text('Coverage: ${plan['coverage']}', style: const TextStyle(color: Colors.grey)),
              Text('Deductible: \$${plan['deductible']}', style: const TextStyle(color: Colors.grey)),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton(
                  onPressed: onQuoteRequest,
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.primary,
                    side: const BorderSide(color: AppColors.primary),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: Text(AppLocalizations.of(context)!.dirRequestInformation, style: const TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        )),
      ],
    );
  }
}

/// Specialized widget for Shops (Sub-categories & Special items)
class ShopInfoWidget extends StatelessWidget {
  final Map<String, dynamic> metadata;

  const ShopInfoWidget({super.key, required this.metadata});

  @override
  Widget build(BuildContext context) {
    final subCategories = metadata['subCategories'] as List? ?? [];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(AppLocalizations.of(context)!.dirAvailableCategories, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 12),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            childAspectRatio: 3,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
          ),
          itemCount: subCategories.length,
          itemBuilder: (context, index) {
            return Container(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.primary.withValues(alpha: 0.1)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.check_circle_outline, color: AppColors.primary, size: 16),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      subCategories[index].toString(),
                      style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 13),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ],
    );
  }
}
