class MedicationLog {
  final int id;
  final int petId;
  final String name;
  final String dosage;
  final String frequency;
  final DateTime startDate;
  final DateTime? endDate;
  final String? notes;
  final DateTime createdAt;

  MedicationLog({
    required this.id,
    required this.petId,
    required this.name,
    required this.dosage,
    required this.frequency,
    required this.startDate,
    this.endDate,
    this.notes,
    required this.createdAt,
  });

  factory MedicationLog.fromJson(Map<String, dynamic> json) {
    return MedicationLog(
      id: int.parse(json['id'].toString()),
      petId: int.parse(json['petId'].toString()),
      name: json['name'] ?? '',
      dosage: json['dosage'] ?? '',
      frequency: json['frequency'] ?? '',
      startDate: DateTime.parse(json['startDate']),
      endDate: json['endDate'] != null ? DateTime.parse(json['endDate']) : null,
      notes: json['notes'],
      createdAt: DateTime.parse(json['createdAt']),
    );
  }
}
