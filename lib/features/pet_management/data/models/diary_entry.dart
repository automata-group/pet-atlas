class DiaryEntry {
  final int id;
  final int petId;
  final String title;
  final String content;
  final DateTime date;
  final DateTime createdAt;

  DiaryEntry({
    required this.id,
    required this.petId,
    required this.title,
    required this.content,
    required this.date,
    required this.createdAt,
  });

  factory DiaryEntry.fromJson(Map<String, dynamic> json) {
    return DiaryEntry(
      id: int.parse(json['id'].toString()),
      petId: int.parse(json['petId'].toString()),
      title: json['title'] ?? '',
      content: json['content'] ?? '',
      date: DateTime.parse(json['date']),
      createdAt: DateTime.parse(json['createdAt']),
    );
  }
}
