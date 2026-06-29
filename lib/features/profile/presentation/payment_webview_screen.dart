import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:url_launcher/url_launcher.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:webview_flutter/webview_flutter.dart';
import '../../../../core/theme/app_colors.dart';
import '../bloc/subscription_cubit.dart';

class PaymentWebViewScreen extends StatefulWidget {
  final String paymentUrl;
  final String orderId;

  const PaymentWebViewScreen({
    super.key,
    required this.paymentUrl,
    required this.orderId,
  });

  @override
  State<PaymentWebViewScreen> createState() => _PaymentWebViewScreenState();
}

class _PaymentWebViewScreenState extends State<PaymentWebViewScreen> {
  late final WebViewController _controller;
  bool _isLoading = true;
  bool _isSuccessDetected = false;

  @override
  void initState() {
    super.initState();
    if (!kIsWeb) {
      _controller = WebViewController()
        ..setJavaScriptMode(JavaScriptMode.unrestricted)
        ..setBackgroundColor(const Color(0x00000000))
        ..setNavigationDelegate(
          NavigationDelegate(
            onProgress: (int progress) {},
            onPageStarted: (String url) {
              setState(() => _isLoading = true);
            },
            onPageFinished: (String url) {
              setState(() => _isLoading = false);
              
              if (!_isSuccessDetected &&
                  (url.contains('order-received') ||
                   url.contains('thank-you') ||
                   url.contains('payment-success') ||
                   url.contains('checkout/thankyou'))) {
                setState(() {
                  _isSuccessDetected = true;
                });
                _autoConfirmPayment();
              }
            },
            onWebResourceError: (WebResourceError error) {},
            onNavigationRequest: (NavigationRequest request) {
              final url = request.url;
              if (!_isSuccessDetected &&
                  (url.contains('order-received') ||
                   url.contains('thank-you') ||
                   url.contains('payment-success') ||
                   url.contains('checkout/thankyou'))) {
                setState(() {
                  _isSuccessDetected = true;
                });
                _autoConfirmPayment();
                return NavigationDecision.prevent;
              }
              return NavigationDecision.navigate;
            },
          ),
        )
        ..loadRequest(Uri.parse(widget.paymentUrl));
    } else {
      _isLoading = false;
    }
  }

  void _autoConfirmPayment() {
    // Automatically trigger subscription confirmation
    context.read<SubscriptionCubit>().confirmSubscription(orderId: widget.orderId);
    
    final isArabic = Localizations.localeOf(context).languageCode == 'ar';
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          isArabic
              ? "تم كشف نجاح عملية الدفع! جاري تفعيل اشتراكك..."
              : "Payment success detected! Activating your subscription...",
        ),
        backgroundColor: AppColors.primary,
      ),
    );
    Navigator.pop(context, true);
  }

  Future<bool> _onWillPop() async {
    if (_isSuccessDetected) return true;

    final isArabic = Localizations.localeOf(context).languageCode == 'ar';
    final result = await showDialog<String>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: Text(isArabic ? "تأكيد الدفع" : "Confirm Payment"),
        content: Text(
          isArabic
              ? "هل أكملت عملية الدفع؟ أم أنك تريد إلغاء العملية والرجوع للتطبيق؟"
              : "Did you complete the payment? Or do you want to cancel and go back to the app?",
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext, 'stay'),
            child: Text(isArabic ? "البقاء بالصفحة" : "Stay here"),
          ),
          TextButton(
            onPressed: () => Navigator.pop(dialogContext, 'cancel'),
            child: Text(isArabic ? "إلغاء الرجوع" : "Cancel & Exit", style: const TextStyle(color: Colors.red)),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(dialogContext, 'paid');
            },
            child: Text(
              isArabic ? "نعم، تم الدفع" : "Yes, paid",
              style: const TextStyle(
                color: AppColors.primary,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );

    if (result == 'paid') {
      if (mounted) {
        context.read<SubscriptionCubit>().confirmSubscription(orderId: widget.orderId);
        Navigator.pop(context, true);
      }
      return false;
    } else if (result == 'cancel') {
      return true; // Let the screen pop and return to the app
    }
    
    return false; // Stay on the screen
  }

  @override
  Widget build(BuildContext context) {
    final isArabic = Localizations.localeOf(context).languageCode == 'ar';
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    if (kIsWeb) {
      return PopScope(
        canPop: false,
        onPopInvokedWithResult: (didPop, result) async {
          if (didPop) return;
          final shouldPop = await _onWillPop();
          if (shouldPop && context.mounted) {
            Navigator.pop(context);
          }
        },
        child: Scaffold(
          appBar: AppBar(
            title: Text(
              isArabic ? "بوابة الدفع الآمنة" : "Secure Payment Gateway",
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
            backgroundColor: isDark ? const Color(0xFF0F1E23) : Colors.white,
            foregroundColor: isDark ? Colors.white : Colors.black87,
            elevation: 0,
            leading: IconButton(
              icon: const Icon(Icons.close),
              onPressed: () async {
                final shouldPop = await _onWillPop();
                if (shouldPop && context.mounted) {
                  Navigator.pop(context);
                }
              },
            ),
          ),
          body: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.payment, size: 64, color: AppColors.primary),
                const SizedBox(height: 16),
                Text(
                  isArabic 
                      ? 'يجب فتح صفحة الدفع في علامة تبويب جديدة.' 
                      : 'Payment requires opening a new browser tab.',
                  style: TextStyle(fontSize: 16, color: Colors.grey[700]),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 24),
                ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                  ),
                  onPressed: () => launchUrl(Uri.parse(widget.paymentUrl), mode: LaunchMode.externalApplication),
                  icon: const Icon(Icons.open_in_new),
                  label: Text(isArabic ? 'فتح صفحة الدفع' : 'Open Payment Page'),
                ),
                const SizedBox(height: 32),
                Text(
                  isArabic
                      ? 'بعد إتمام عملية الدفع في النافذة الجديدة، اضغط هنا:'
                      : 'After completing payment in the new window, click هنا:',
                  style: TextStyle(fontSize: 14, color: Colors.grey[600]),
                ),
                const SizedBox(height: 16),
                OutlinedButton.icon(
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.green,
                    side: const BorderSide(color: Colors.green),
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                  ),
                  onPressed: () {
                     setState(() {
                       _isSuccessDetected = true;
                     });
                     _autoConfirmPayment();
                  },
                  icon: const Icon(Icons.check_circle),
                  label: Text(isArabic ? 'لقد أكملت الدفع' : 'I have completed the payment'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) async {
        if (didPop) return;
        final shouldPop = await _onWillPop();
        if (shouldPop && context.mounted) {
          Navigator.pop(context);
        }
      },
      child: Scaffold(
        appBar: AppBar(
          title: Text(
            isArabic ? "بوابة الدفع الآمنة" : "Secure Payment Gateway",
            style: const TextStyle(fontWeight: FontWeight.bold),
          ),
          backgroundColor: Theme.of(context).brightness == Brightness.dark ? const Color(0xFF0F1E23) : Colors.white,
          foregroundColor: Theme.of(context).brightness == Brightness.dark ? Colors.white : Colors.black87,
          elevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.close),
            onPressed: () async {
              final shouldPop = await _onWillPop();
              if (shouldPop && context.mounted) {
                Navigator.pop(context);
              }
            },
          ),
          actions: [
            IconButton(
              icon: const Icon(Icons.refresh),
              onPressed: () => _controller.reload(),
            ),
          ],
        ),
        body: Stack(
          children: [
            WebViewWidget(controller: _controller),
            if (_isLoading)
              const Center(
                child: CircularProgressIndicator(
                  color: AppColors.primary,
                ),
              ),
          ],
        ),
      ),
    );
  }
}
