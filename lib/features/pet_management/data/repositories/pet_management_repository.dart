import '../../../../core/network/api_client.dart';
import '../models/diary_entry.dart';
import '../models/pet_reminder.dart';
import '../models/weight_log.dart';
import '../models/medication_log.dart';
import '../models/vet_visit.dart';
import '../models/vaccine_log.dart';
import '../models/pet_overview.dart';

class PetManagementRepository {
  final ApiClient apiClient;

  PetManagementRepository({required this.apiClient});

  // Overview
  Future<PetOverview> getOverview(int petId) async {
    final response = await apiClient.dio.get('/pet-management/$petId/overview');
    if (response.statusCode == 200) {
      return PetOverview.fromJson(response.data);
    }
    throw Exception('Failed to load pet overview');
  }

  // Diary
  Future<List<DiaryEntry>> getDiary(int petId) async {
    final response = await apiClient.dio.get('/pet-management/$petId/diary');
    if (response.statusCode == 200) {
      return (response.data as List).map((x) => DiaryEntry.fromJson(x)).toList();
    }
    throw Exception('Failed to load diary entries');
  }

  Future<DiaryEntry> addDiary(int petId, Map<String, dynamic> data) async {
    final response = await apiClient.dio.post('/pet-management/$petId/diary', data: data);
    if (response.statusCode == 201 || response.statusCode == 200) {
      return DiaryEntry.fromJson(response.data);
    }
    throw Exception('Failed to add diary entry');
  }

  Future<void> deleteDiary(int petId, int id) async {
    final response = await apiClient.dio.delete('/pet-management/$petId/diary/$id');
    if (response.statusCode != 200 && response.statusCode != 204) {
      throw Exception('Failed to delete diary entry');
    }
  }

  // Reminders
  Future<List<PetReminder>> getReminders(int petId) async {
    final response = await apiClient.dio.get('/pet-management/$petId/reminders');
    if (response.statusCode == 200) {
      return (response.data as List).map((x) => PetReminder.fromJson(x)).toList();
    }
    throw Exception('Failed to load reminders');
  }

  Future<PetReminder> addReminder(int petId, Map<String, dynamic> data) async {
    final response = await apiClient.dio.post('/pet-management/$petId/reminders', data: data);
    if (response.statusCode == 201 || response.statusCode == 200) {
      return PetReminder.fromJson(response.data);
    }
    throw Exception('Failed to add reminder');
  }

  Future<PetReminder> toggleReminder(int petId, int id, bool isCompleted) async {
    final response = await apiClient.dio.put('/pet-management/$petId/reminders/$id', data: {'isCompleted': isCompleted});
    if (response.statusCode == 200) {
      return PetReminder.fromJson(response.data);
    }
    throw Exception('Failed to update reminder');
  }

  Future<void> deleteReminder(int petId, int id) async {
    final response = await apiClient.dio.delete('/pet-management/$petId/reminders/$id');
    if (response.statusCode != 200 && response.statusCode != 204) {
      throw Exception('Failed to delete reminder');
    }
  }

  // Weight
  Future<List<WeightLog>> getWeight(int petId) async {
    final response = await apiClient.dio.get('/pet-management/$petId/weight');
    if (response.statusCode == 200) {
      return (response.data as List).map((x) => WeightLog.fromJson(x)).toList();
    }
    throw Exception('Failed to load weight logs');
  }

  Future<WeightLog> addWeight(int petId, Map<String, dynamic> data) async {
    final response = await apiClient.dio.post('/pet-management/$petId/weight', data: data);
    if (response.statusCode == 201 || response.statusCode == 200) {
      return WeightLog.fromJson(response.data);
    }
    throw Exception('Failed to add weight log');
  }

  Future<void> deleteWeight(int petId, int id) async {
    final response = await apiClient.dio.delete('/pet-management/$petId/weight/$id');
    if (response.statusCode != 200 && response.statusCode != 204) {
      throw Exception('Failed to delete weight log');
    }
  }

  // Meds
  Future<List<MedicationLog>> getMeds(int petId) async {
    final response = await apiClient.dio.get('/pet-management/$petId/meds');
    if (response.statusCode == 200) {
      return (response.data as List).map((x) => MedicationLog.fromJson(x)).toList();
    }
    throw Exception('Failed to load medication logs');
  }

  Future<MedicationLog> addMed(int petId, Map<String, dynamic> data) async {
    final response = await apiClient.dio.post('/pet-management/$petId/meds', data: data);
    if (response.statusCode == 201 || response.statusCode == 200) {
      return MedicationLog.fromJson(response.data);
    }
    throw Exception('Failed to add medication');
  }

  Future<void> deleteMed(int petId, int id) async {
    final response = await apiClient.dio.delete('/pet-management/$petId/meds/$id');
    if (response.statusCode != 200 && response.statusCode != 204) {
      throw Exception('Failed to delete medication');
    }
  }

  // Vet Visits
  Future<List<VetVisit>> getVetVisits(int petId) async {
    final response = await apiClient.dio.get('/pet-management/$petId/vet-visits');
    if (response.statusCode == 200) {
      return (response.data as List).map((x) => VetVisit.fromJson(x)).toList();
    }
    throw Exception('Failed to load vet visits');
  }

  Future<VetVisit> addVetVisit(int petId, Map<String, dynamic> data) async {
    final response = await apiClient.dio.post('/pet-management/$petId/vet-visits', data: data);
    if (response.statusCode == 201 || response.statusCode == 200) {
      return VetVisit.fromJson(response.data);
    }
    throw Exception('Failed to add vet visit');
  }

  Future<void> deleteVetVisit(int petId, int id) async {
    final response = await apiClient.dio.delete('/pet-management/$petId/vet-visits/$id');
    if (response.statusCode != 200 && response.statusCode != 204) {
      throw Exception('Failed to delete vet visit');
    }
  }

  // Vaccines
  Future<List<VaccineLog>> getVaccines(int petId) async {
    final response = await apiClient.dio.get('/pet-management/$petId/vaccines');
    if (response.statusCode == 200) {
      return (response.data as List).map((x) => VaccineLog.fromJson(x)).toList();
    }
    throw Exception('Failed to load vaccine logs');
  }

  Future<VaccineLog> addVaccine(int petId, Map<String, dynamic> data) async {
    final response = await apiClient.dio.post('/pet-management/$petId/vaccines', data: data);
    if (response.statusCode == 201 || response.statusCode == 200) {
      return VaccineLog.fromJson(response.data);
    }
    throw Exception('Failed to add vaccine log');
  }

  Future<void> deleteVaccine(int petId, int id) async {
    final response = await apiClient.dio.delete('/pet-management/$petId/vaccines/$id');
    if (response.statusCode != 200 && response.statusCode != 204) {
      throw Exception('Failed to delete vaccine log');
    }
  }
}
