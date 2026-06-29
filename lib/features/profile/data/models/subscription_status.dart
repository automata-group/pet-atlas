class SubscriptionStatus {
  final String status; // 'active', 'inactive', 'canceled', 'past_due'
  final DateTime? currentPeriodEnd;
  final bool autoRenew;
  final int? planId;
  final String? orderId;
  final String? paymentUrl;

  SubscriptionStatus({
    required this.status,
    this.currentPeriodEnd,
    required this.autoRenew,
    this.planId,
    this.orderId,
    this.paymentUrl,
  });

  bool get isActive => status == 'active';

  factory SubscriptionStatus.fromJson(Map<String, dynamic> json) {
    return SubscriptionStatus(
      status: json['status'] ?? 'inactive',
      currentPeriodEnd: json['currentPeriodEnd'] != null 
          ? DateTime.parse(json['currentPeriodEnd']) 
          : null,
      autoRenew: json['autoRenew'] ?? false,
      planId: json['planId'] != null ? int.parse(json['planId'].toString()) : null,
      orderId: json['orderId']?.toString(),
      paymentUrl: json['paymentUrl']?.toString(),
    );
  }
}
