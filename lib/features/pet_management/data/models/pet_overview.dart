import '../../../profile/data/models/pet.dart';
import 'diary_entry.dart';
import 'pet_reminder.dart';
import 'weight_log.dart';
import 'medication_log.dart';
import 'vet_visit.dart';
import 'vaccine_log.dart';

class PetOverview {
  final Pet pet;
  final List<DiaryEntry> recentDiary;
  final List<PetReminder> upcomingReminders;
  final WeightLog? latestWeight;
  final List<MedicationLog> medications;
  final List<VetVisit> vetVisits;
  final List<VaccineLog> vaccines;

  PetOverview({
    required this.pet,
    required this.recentDiary,
    required this.upcomingReminders,
    this.latestWeight,
    required this.medications,
    required this.vetVisits,
    required this.vaccines,
  });

  factory PetOverview.fromJson(Map<String, dynamic> json) {
    return PetOverview(
      pet: Pet.fromJson(json['pet']),
      recentDiary: (json['recentDiary'] as List? ?? [])
          .map((d) => DiaryEntry.fromJson(d))
          .toList(),
      upcomingReminders: (json['upcomingReminders'] as List? ?? [])
          .map((r) => PetReminder.fromJson(r))
          .toList(),
      latestWeight: json['latestWeight'] != null ? WeightLog.fromJson(json['latestWeight']) : null,
      medications: (json['medications'] as List? ?? [])
          .map((m) => MedicationLog.fromJson(m))
          .toList(),
      vetVisits: (json['vetVisits'] as List? ?? [])
          .map((v) => VetVisit.fromJson(v))
          .toList(),
      vaccines: (json['vaccines'] as List? ?? [])
          .map((v) => VaccineLog.fromJson(v))
          .toList(),
    );
  }
}
