class WeightLog {
  final int id;
  final int petId;
  final String weight;
  final DateTime date;
  final DateTime createdAt;

  WeightLog({
    required this.id,
    required this.petId,
    required this.weight,
    required this.date,
    required this.createdAt,
  });

  factory WeightLog.fromJson(Map<String, dynamic> json) {
    return WeightLog(
      id: int.parse(json['id'].toString()),
      petId: int.parse(json['petId'].toString()),
      weight: json['weight']?.toString() ?? '0',
      date: DateTime.parse(json['date']),
      createdAt: DateTime.parse(json['createdAt']),
    );
  }
}
