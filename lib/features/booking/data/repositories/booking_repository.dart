import '../../../../core/network/api_client.dart';
import '../models/booking.dart';

class BookingRepository {
  final ApiClient apiClient;

  BookingRepository({required this.apiClient});

  Future<Booking> createBooking({
    required int listingId,
    required List<Map<String, dynamic>> selectedServices,
    required DateTime bookingDate,
    int? petId,
    String? notes,
  }) async {
    try {
      final response = await apiClient.dio.post('/bookings', data: {
        'listingId': listingId,
        'petId': petId,
        'selectedServices': selectedServices,
        'bookingDate': bookingDate.toIso8601String(),
        'notes': notes,
      });

      return Booking.fromJson(response.data);
    } catch (e) {
      throw Exception('Failed to create booking: $e');
    }
  }

  Future<List<Booking>> getMyBookings() async {
    try {
      final response = await apiClient.dio.get('/bookings/my');
      return (response.data as List)
          .map((json) => Booking.fromJson(json))
          .toList();
    } catch (e) {
      throw Exception('Failed to fetch bookings: $e');
    }
  }

  Future<void> cancelBooking(int id) async {
    try {
      await apiClient.dio.patch('/bookings/$id/cancel');
    } catch (e) {
      throw Exception('Failed to cancel booking: $e');
    }
  }
}
