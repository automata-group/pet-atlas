class VaccineLog {
  final int id;
  final int petId;
  final String name;
  final DateTime administeredDate;
  final DateTime? nextDueDate;
  final String? veterinarian;
  final DateTime createdAt;

  VaccineLog({
    required this.id,
    required this.petId,
    required this.name,
    required this.administeredDate,
    this.nextDueDate,
    this.veterinarian,
    required this.createdAt,
  });

  factory VaccineLog.fromJson(Map<String, dynamic> json) {
    return VaccineLog(
      id: int.parse(json['id'].toString()),
      petId: int.parse(json['petId'].toString()),
      name: json['name'] ?? '',
      administeredDate: DateTime.parse(json['administeredDate']),
      nextDueDate: json['nextDueDate'] != null ? DateTime.parse(json['nextDueDate']) : null,
      veterinarian: json['veterinarian'],
      createdAt: DateTime.parse(json['createdAt']),
    );
  }
}
