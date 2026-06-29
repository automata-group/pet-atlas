import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/theme/app_colors.dart';
import '../bloc/subscription_cubit.dart';
import 'payment_webview_screen.dart';

class PaywallScreen extends StatelessWidget {
  final VoidCallback? onSubscribeSuccess;

  const PaywallScreen({super.key, this.onSubscribeSuccess});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final isArabic = Localizations.localeOf(context).languageCode == 'ar';

    // Premium styling constants
    final textHeader = isArabic ? "ميزات حصرية بانتظارك" : "Unlock Premium Features";
    final textSubHeader = isArabic ? "Pet-Atlas دائماً هنا من أجلك" : "Pet-Atlas Always Here for you";
    final textDescription = isArabic
        ? "تواصل مع فريق الأطباء البيطريين في أي وقت ومن أي مكان، تماماً كأنه دردشة مع صديق، ببضع نقرات وبدون مواعيد مسبقة."
        : "Chat with our vet team anytime, anywhere, just like texting a friend, just a few clicks. No appointments needed.";
    final textBtn = isArabic ? "اشترك الآن" : "Subscribe now";
    final textPrice = isArabic ? "38 درهم بدلاً من 66 / شهرياً" : "38 aed instead of 66 / month";
    final textBenefit1 = isArabic ? "دردشة واستشارات بيطرية فورية 24/7" : "Unlimited Vet Chat 24/7";
    final textBenefit2 = isArabic ? "عروض حصرية وخصومات هائلة للعيادات والمنتجات" : "Exclusive Offers & Brand Discounts";
    final textBenefit3 = isArabic ? "تجديد تلقائي مرن، وإلغاء بضغطة زر" : "Auto-renews, cancel anytime";

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF0F1E23) : const Color(0xFFF5F8F8),
      body: BlocConsumer<SubscriptionCubit, SubscriptionState>(
        listener: (context, state) {
          if (state.status?.isActive ?? false) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(
                  isArabic
                      ? "تم تفعيل الاشتراك بنجاح! مرحباً بك في مجتمعنا."
                      : "Subscription activated successfully! Welcome aboard.",
                ),
                backgroundColor: AppColors.primary,
              ),
            );
            if (onSubscribeSuccess != null) {
              onSubscribeSuccess!();
            }
          } else if (state.status != null &&
              state.status!.status == 'inactive' &&
              state.status!.paymentUrl != null) {
            final paymentUrl = state.status!.paymentUrl!;
            final orderId = state.status!.orderId ?? '';
            
            // Reset state to avoid duplicate push
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
                // Refresh status upon return
                context.read<SubscriptionCubit>().loadStatus();
              }
            });
          } else if (state.errorMessage != null) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(
                  isArabic 
                      ? "حدث خطأ أثناء تفعيل الاشتراك. يرجى المحاولة لاحقاً." 
                      : "Failed to activate subscription. Please try again.",
                ),
                backgroundColor: Colors.redAccent,
              ),
            );
          }
        },
        builder: (context, state) {
          return Container(
            width: double.infinity,
            height: double.infinity,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: isDark
                    ? [const Color(0xFF0F1E23), const Color(0xFF16252A), const Color(0xFF1F353E)]
                    : [const Color(0xFFF5F8F8), const Color(0xFFE6EFF1), Colors.white],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
            ),
            child: SafeArea(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    const SizedBox(height: 32),
                    
                    // Brand Icon
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withValues(alpha: 0.15),
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.primary.withValues(alpha: 0.2),
                            blurRadius: 20,
                            spreadRadius: 2,
                          )
                        ],
                      ),
                      child: const Icon(
                        Icons.pets_outlined,
                        color: AppColors.primary,
                        size: 64,
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Headings
                    Text(
                      textHeader,
                      style: theme.textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: isDark ? Colors.white : Colors.black87,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      textSubHeader,
                      style: theme.textTheme.titleMedium?.copyWith(
                        color: AppColors.primary,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.5,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 24),

                    // Glassmorphic Card
                    Container(
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        color: isDark 
                            ? Colors.white.withValues(alpha: 0.03) 
                            : Colors.black.withValues(alpha: 0.02),
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(
                          color: isDark 
                              ? Colors.white.withValues(alpha: 0.08) 
                              : Colors.black.withValues(alpha: 0.05),
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.05),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          )
                        ],
                      ),
                      child: Column(
                        children: [
                          Text(
                            textDescription,
                            style: theme.textTheme.bodyMedium?.copyWith(
                              height: 1.5,
                              color: isDark ? AppColors.slate400 : AppColors.slate500,
                            ),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 24),
                          
                          // Benefits Checklist
                          _buildBenefitRow(theme, isDark, textBenefit1),
                          const SizedBox(height: 12),
                          _buildBenefitRow(theme, isDark, textBenefit2),
                          const SizedBox(height: 12),
                          _buildBenefitRow(theme, isDark, textBenefit3),
                        ],
                      ),
                    ),
                    const SizedBox(height: 48),

                    // Subscribe Action Button
                    if (state.isLoading)
                      const Center(
                        child: CircularProgressIndicator(color: AppColors.primary),
                      )
                    else ...[
                      SizedBox(
                        width: double.infinity,
                        height: 56,
                        child: ElevatedButton(
                          onPressed: () {
                            context.read<SubscriptionCubit>().subscribe(planId: 2);
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primary,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                            ),
                            elevation: 8,
                            shadowColor: AppColors.primary.withValues(alpha: 0.4),
                          ),
                          child: Text(
                            textBtn,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        textPrice,
                        style: TextStyle(
                          color: isDark ? AppColors.slate400 : AppColors.slate500,
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                    const SizedBox(height: 24),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildBenefitRow(ThemeData theme, bool isDark, String text) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Icon(
          Icons.check_circle_rounded,
          color: AppColors.primary,
          size: 20,
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            text,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: isDark ? AppColors.slate200 : AppColors.slate800,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
      ],
    );
  }
}
