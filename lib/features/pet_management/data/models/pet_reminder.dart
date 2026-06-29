class PetReminder {
  final int id;
  final int petId;
  final String title;
  final String type; // medication, vaccine, vet_visit, other
  final DateTime dateTime;
  final bool isCompleted;
  final DateTime createdAt;

  PetReminder({
    required this.id,
    required this.petId,
    required this.title,
    required this.type,
    required this.dateTime,
    required this.isCompleted,
    required this.createdAt,
  });

  factory PetReminder.fromJson(Map<String, dynamic> json) {
    return PetReminder(
      id: int.parse(json['id'].toString()),
      petId: int.parse(json['petId'].toString()),
      title: json['title'] ?? '',
      type: json['type'] ?? 'other',
      dateTime: DateTime.parse(json['dateTime']),
      isCompleted: json['isCompleted'] == true || json['isCompleted'] == 1 || json['isCompleted'] == 'true',
      createdAt: DateTime.parse(json['createdAt']),
    );
  }
}
