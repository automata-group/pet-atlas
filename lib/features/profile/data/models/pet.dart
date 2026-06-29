class Pet {
  final int id;
  final int ownerId;
  final String name;
  final String? photoUrl;
  final String? breed;
  final String? type;
  final String? weight;
  final DateTime? dob;
  final String? sex;
  final bool neutered;
  final String? notes;
  final List<Map<String, dynamic>>? activityLog;

  Pet({
    required this.id,
    required this.ownerId,
    required this.name,
    this.photoUrl,
    this.breed,
    this.type,
    this.weight,
    this.dob,
    this.sex,
    this.neutered = false,
    this.notes,
    this.activityLog,
  });

  factory Pet.fromJson(Map<String, dynamic> json) {
    return Pet(
      id: int.parse(json['id'].toString()),
      ownerId: int.parse(json['ownerId'].toString()),
      name: json['name'] ?? '',
      photoUrl: json['photoUrl'],
      breed: json['breed'],
      type: json['type'],
      weight: json['weight']?.toString(),
      dob: json['dob'] != null ? DateTime.parse(json['dob']) : null,
      sex: json['sex'],
      neutered: json['neutered'] ?? false,
      notes: json['notes'],
      activityLog: json['activityLog'] != null ? List<Map<String, dynamic>>.from(json['activityLog']) : null,
    );
  }
}
