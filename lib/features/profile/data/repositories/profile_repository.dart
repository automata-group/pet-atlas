import '../../../../core/network/api_client.dart';
import '../../../auth/data/models/user.dart';
import '../models/pet.dart';

class ProfileRepository {
  final ApiClient apiClient;

  ProfileRepository({required this.apiClient});

  Future<Map<String, dynamic>> getFullProfile() async {
    try {
      final response = await apiClient.dio.get('/profile');
      if (response.statusCode == 200) {
        return response.data;
      }
      throw Exception('Failed to load profile');
    } catch (e) {
      throw Exception('Failed to fetch profile: $e');
    }
  }

  Future<List<Pet>> getMyPets() async {
    final data = await getFullProfile();
    if (data['pets'] != null) {
      return (data['pets'] as List)
          .map((json) => Pet.fromJson(json))
          .toList();
    }
    return [];
  }

  Future<Pet> addPet(Map<String, dynamic> petData) async {
    try {
      final response = await apiClient.dio.post('/profile/pets', data: petData);
      if (response.statusCode == 201 || response.statusCode == 200) {
        return Pet.fromJson(response.data);
      }
      throw Exception('Failed to add pet');
    } catch (e) {
      throw Exception('Error adding pet: $e');
    }
  }

  Future<User> updateProfile(User user) async {
    try {
      final Map<String, dynamic> updateData = {
        'firstName': user.firstName,
        'lastName': user.lastName,
        'dob': user.dob?.toIso8601String(),
        'sex': user.sex,
        'address': user.address,
        'city': user.city,
        'country': user.country,
        'mobileNumber': user.mobileNumber,
      };
      
      final response = await apiClient.dio.put('/profile', data: updateData);
      if (response.statusCode == 200) {
        final profileData = response.data; // profile object
        final userData = profileData['user'];
        return User.fromJson(userData);
      }
      throw Exception('Failed to update profile');
    } catch (e) {
      throw Exception('Error updating profile: $e');
    }
  }

  Future<Pet> updatePet(int petId, Map<String, dynamic> petData) async {
    try {
      final response = await apiClient.dio.put('/profile/pets/$petId', data: petData);
      if (response.statusCode == 200) {
        return Pet.fromJson(response.data);
      }
      throw Exception('Failed to update pet');
    } catch (e) {
      throw Exception('Error updating pet: $e');
    }
  }

  Future<void> deletePet(int petId) async {
    try {
      final response = await apiClient.dio.delete('/profile/pets/$petId');
      if (response.statusCode != 204 && response.statusCode != 200) {
        throw Exception('Failed to delete pet');
      }
    } catch (e) {
      throw Exception('Error deleting pet: $e');
    }
  }
}
