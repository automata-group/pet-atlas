class VetVisit {
  final int id;
  final int petId;
  final String clinicName;
  final String? vetName;
  final DateTime dateTime;
  final String reason;
  final String? notes;
  final DateTime createdAt;

  VetVisit({
    required this.id,
    required this.petId,
    required this.clinicName,
    this.vetName,
    required this.dateTime,
    required this.reason,
    this.notes,
    required this.createdAt,
  });

  factory VetVisit.fromJson(Map<String, dynamic> json) {
    return VetVisit(
      id: int.parse(json['id'].toString()),
      petId: int.parse(json['petId'].toString()),
      clinicName: json['clinicName'] ?? '',
      vetName: json['vetName'],
      dateTime: DateTime.parse(json['dateTime']),
      reason: json['reason'] ?? '',
      notes: json['notes'],
      createdAt: DateTime.parse(json['createdAt']),
    );
  }
}
