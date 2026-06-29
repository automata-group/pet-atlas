import '../../../../core/network/api_client.dart';
import '../models/listing_item.dart';
import '../models/service_section.dart';

class DirectoryRepository {
  final LocalApiClient _apiClient;

  DirectoryRepository({required LocalApiClient apiClient})
    : _apiClient = apiClient;

  Future<List<ListingItem>> getAllListings() async {
    try {
      final response = await _apiClient.dio.get('/directory');
      final List data = response.data;
      return data.map((json) => ListingItem.fromJson(json)).toList();
    } catch (e) {
      throw Exception('Failed to load listings: $e');
    }
  }

  Future<List<ListingItem>> getNearestListings({
    required String type,
    required double lat,
    required double lon,
    int radius = 50000,
    bool? isOfficial,
    String? priceRange,
    String? sortBy,
  }) async {
    try {
      final response = await _apiClient.dio.get(
        '/directory/nearest',
        queryParameters: {
          'type': type,
          'lat': lat.toString(),
          'lon': lon.toString(),
          'radius': radius.toString(),
          if (isOfficial != null) 'isOfficial': isOfficial.toString(),
          if (priceRange != null && priceRange != 'Any')
            'priceRange': priceRange,
          if (sortBy != null) 'sortBy': sortBy,
        },
      );
      final List data = response.data;
      return data.map((json) => ListingItem.fromJson(json)).toList();
    } catch (e) {
      throw Exception('Failed to load nearest listings: $e');
    }
  }

  Future<ListingItem> getListingDetails(int id) async {
    try {
      final response = await _apiClient.dio.get('/directory/$id');
      return ListingItem.fromJson(response.data);
    } catch (e) {
      throw Exception('Failed to load listing details: $e');
    }
  }

  Future<bool> getClinicsEnabled() async {
    try {
      final response = await _apiClient.dio.get('/directory/config');
      return response.data['clinicsEnabled'] ?? false;
    } catch (e) {
      return false; // Default to false if the request fails
    }
  }

  Future<List<ServiceSection>> getActiveServices() async {
    try {
      final response = await _apiClient.dio.get('/directory/services');
      final List data = response.data;
      return data.map((json) => ServiceSection.fromJson(json)).toList();
    } catch (e) {
      // Robust recovery fallback: return default sections if request/network fails
      return [
        ServiceSection(id: 1, titleEn: 'Clinics', titleAr: 'العيادات', iconName: 'medical_services', baseColor: '#2196F3', listingType: 'Clinic', isActive: true),
        ServiceSection(id: 2, titleEn: 'Vets', titleAr: 'الأطباء البيطريين', iconName: 'vaccines', baseColor: '#4CAF50', listingType: 'Vet', isActive: true),
        ServiceSection(id: 3, titleEn: 'Grooming', titleAr: 'الحلاقة والعناية', iconName: 'content_cut', baseColor: '#FF9800', listingType: 'Grooming', isActive: true),
        ServiceSection(id: 4, titleEn: 'Pet Care', titleAr: 'مستلزمات الحيوانات', iconName: 'pets', baseColor: '#9C27B0', listingType: 'Shop', isActive: true),
      ];
    }
  }
}
