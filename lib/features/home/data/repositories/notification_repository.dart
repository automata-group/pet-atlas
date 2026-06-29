import '../../../../core/network/api_client.dart';
import '../models/notification_model.dart';

class NotificationRepository {
  final LocalApiClient _apiClient;

  NotificationRepository({required LocalApiClient apiClient}) : _apiClient = apiClient;

  Future<List<NotificationModel>> getMyNotifications() async {
    try {
      final response = await _apiClient.dio.get('/notifications');
      if (response.statusCode == 200) {
        final List<dynamic> data = response.data;
        return data.map((json) => NotificationModel.fromJson(json)).toList();
      }
      throw Exception('Failed to load notifications');
    } catch (e) {
      throw Exception('Error loading notifications: $e');
    }
  }

  Future<void> markAsRead(int notificationId) async {
    try {
      await _apiClient.dio.patch('/notifications/$notificationId/read');
    } catch (e) {
      throw Exception('Failed to mark notification as read: $e');
    }
  }
}
