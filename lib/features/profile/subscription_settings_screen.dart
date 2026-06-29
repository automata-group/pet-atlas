import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';
import '../../core/theme/app_colors.dart';
import '../../l10n/app_localizations.dart';
import 'bloc/subscription_cubit.dart';
import 'presentation/payment_webview_screen.dart';

class SubscriptionSettingsScreen extends StatelessWidget {
  const SubscriptionSettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final l10n = AppLocalizations.of(context)!;
    final isArabic = Localizations.localeOf(context).languageCode == 'ar';

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF0F1E23) : const Color(0xFFF5F8F8),
      appBar: AppBar(
        title: Text(l10n.profileSubscription),
        centerTitle: true,
        backgroundColor: isDark ? const Color(0xFF0F1E23) : Colors.white,
        elevation: 0,
      ),
      body: BlocConsumer<SubscriptionCubit, SubscriptionState>(
        listener: (context, state) {
          if (state.status != null &&
              state.status!.status == 'inactive' &&
              state.status!.paymentUrl != null) {
            final paymentUrl = state.status!.paymentUrl!;
            final orderId = state.status!.orderId ?? '';
            
            // Reset cubit state to prevent double navigation
            context.read<SubscriptionCubit>().reset();

            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => PaymentWebViewScreen(
                  paymentUrl: paymentUrl,
                  orderId: orderId,
                ),
              ),
            ).then((didConfirm) {
              if (didConfirm == true && context.mounted) {
                context.read<SubscriptionCubit>().loadStatus();
              }
            });
          } else if (state.errorMessage != null) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(
                  isArabic 
                      ? "فشلت العملية. يرجى المحاولة لاحقاً." 
                      : "Action failed. Please try again.",
                ),
                backgroundColor: Colors.redAccent,
              ),
            );
          }
        },
        builder: (context, state) {
          if (state.isLoading) {
            return const Center(child: CircularProgressIndicator(color: AppColors.primary));
          }

          final subscription = state.status;
          final bool isActive = subscription?.isActive ?? false;

          return Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header card
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: isActive
                        ? AppColors.primary.withValues(alpha: 0.1)
                        : Colors.grey.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: isActive
                          ? AppColors.primary.withValues(alpha: 0.3)
                          : Colors.grey.withValues(alpha: 0.2),
                      width: 2,
                    ),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        isActive ? Icons.verified_user : Icons.cancel_outlined,
                        color: isActive ? AppColors.primary : Colors.grey,
                        size: 48,
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              isActive
                                  ? (isArabic ? "اشتراك نشط" : "Active Subscription")
                                  : (isArabic ? "لا يوجد اشتراك نشط" : "No Active Subscription"),
                              style: theme.textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.bold,
                                color: isActive ? AppColors.primary : (isDark ? Colors.white : Colors.black87),
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              isActive
                                  ? (isArabic
                                      ? "لديك وصول كامل إلى مجتمع Pet-Atlas والاستشارات الفورية والخصومات الحصرية."
                                      : "Full access to Pet-Atlas community, vet consults, and exclusive discounts.")
                                  : (isArabic
                                      ? "اشترك الآن لتفعيل الاستشارات البيطرية الفورية والخصومات الحصرية."
                                      : "Subscribe to unlock instant specialized vet chats and discounts."),
                              style: theme.textTheme.bodyMedium?.copyWith(
                                color: isDark ? AppColors.slate400 : AppColors.slate500,
                                fontSize: 13,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 32),

                // Details list
                if (isActive && subscription != null) ...[
                  Text(
                    isArabic ? "تفاصيل الاشتراك" : "Subscription Details",
                    style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 16),
                  _buildDetailRow(
                    isArabic ? "الخطة" : "Plan",
                    isArabic ? "باقة الاستشارات والخصومات" : "Premium Consults & Offers",
                    isDark,
                  ),
                  const Divider(height: 24),
                  _buildDetailRow(
                    isArabic ? "تاريخ التجديد" : "Renewal Date",
                    subscription.currentPeriodEnd != null
                        ? DateFormat('yyyy-MM-dd').format(subscription.currentPeriodEnd!)
                        : "N/A",
                    isDark,
                  ),
                  const Divider(height: 24),
                  _buildDetailRow(
                    isArabic ? "التجديد التلقائي" : "Auto-Renewal",
                    subscription.autoRenew
                        ? (isArabic ? "مفعّل" : "Enabled")
                        : (isArabic ? "ملغي" : "Disabled"),
                    isDark,
                    valueColor: subscription.autoRenew ? Colors.green : Colors.orange,
                  ),
                  const SizedBox(height: 48),

                  // Cancel / Action buttons
                  if (subscription.autoRenew)
                    SizedBox(
                      width: double.infinity,
                      height: 52,
                      child: OutlinedButton(
                        onPressed: () => _confirmCancelDialog(context, isArabic),
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: Colors.redAccent),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        child: Text(
                          isArabic ? "إلغاء التجديد التلقائي" : "Cancel Auto-Renewal",
                          style: const TextStyle(
                            color: Colors.redAccent,
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    )
                  else
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.orange.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.orange.withValues(alpha: 0.2)),
                      ),
                      child: Text(
                        isArabic
                            ? "تم إيقاف التجديد التلقائي. ستنتهي صلاحية اشتراكك الحالي في تاريخ التجديد."
                            : "Auto-renewal is disabled. Your premium access will expire at the end of the current period.",
                        style: const TextStyle(color: Colors.orange, fontSize: 13, fontWeight: FontWeight.w500),
                        textAlign: TextAlign.center,
                      ),
                    ),
                ] else ...[
                  const Spacer(),
                  SizedBox(
                    width: double.infinity,
                    height: 54,
                    child: ElevatedButton(
                      onPressed: () {
                        context.read<SubscriptionCubit>().subscribe(planId: 2);
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        elevation: 4,
                      ),
                      child: Text(
                        isArabic ? "اشترك الآن بقيمة 38 درهم" : "Subscribe now for 38 AED",
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 32),
                ],
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildDetailRow(String label, String value, bool isDark, {Color? valueColor}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(color: isDark ? AppColors.slate400 : AppColors.slate500, fontSize: 14),
        ),
        Text(
          value,
          style: TextStyle(
            fontWeight: FontWeight.bold,
            color: valueColor ?? (isDark ? Colors.white : Colors.black87),
            fontSize: 14,
          ),
        ),
      ],
    );
  }

  void _confirmCancelDialog(BuildContext context, bool isArabic) {
    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: Text(isArabic ? "تأكيد الإلغاء" : "Confirm Cancellation"),
        content: Text(
          isArabic
              ? "هل أنت متأكد من رغبتك في إلغاء التجديد التلقائي للاشتراك؟ ستحتفظ بميزاتك حتى نهاية الفترة الحالية."
              : "Are you sure you want to cancel auto-renewal? You will keep premium access until the end of the current period.",
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext),
            child: Text(isArabic ? "تراجع" : "Go Back"),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(dialogContext);
              context.read<SubscriptionCubit>().cancelSubscription();
            },
            child: Text(
              isArabic ? "نعم، إلغاء" : "Yes, Cancel",
              style: const TextStyle(color: Colors.redAccent),
            ),
          ),
        ],
      ),
    );
  }
}
