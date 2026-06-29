import '../../../../core/network/api_client.dart';
import '../models/subscription_status.dart';

class SubscriptionRepository {
  final LocalApiClient _apiClient;

  SubscriptionRepository({required LocalApiClient apiClient}) : _apiClient = apiClient;

  Future<SubscriptionStatus> getSubscriptionStatus() async {
    try {
      final response = await _apiClient.dio.get('/subscriptions/status');
      return SubscriptionStatus.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  Future<SubscriptionStatus> subscribe(int planId) async {
    try {
      final response = await _apiClient.dio.post('/subscriptions/subscribe', data: {
        'planId': planId,
      });
      return SubscriptionStatus.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  Future<SubscriptionStatus> cancelSubscription() async {
    try {
      final response = await _apiClient.dio.post('/subscriptions/cancel');
      return SubscriptionStatus.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  Future<SubscriptionStatus> confirmSubscription({String? orderId}) async {
    try {
      final response = await _apiClient.dio.post('/subscriptions/confirm', data: {
        if (orderId != null) 'orderId': orderId,
      });
      return SubscriptionStatus.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }
}
