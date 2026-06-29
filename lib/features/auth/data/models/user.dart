class User {
  final int id;
  final String username;
  final String email;
  final String? firstName;
  final String? lastName;
  final DateTime? dob;
  final String? sex;
  final String? address;
  final String? city;
  final String? country;
  final String? mobileNumber;
  final String? photoUrl;

  User({
    required this.id,
    required this.username,
    required this.email,
    this.firstName,
    this.lastName,
    this.dob,
    this.sex,
    this.address,
    this.city,
    this.country,
    this.mobileNumber,
    this.photoUrl,
  });

  String get fullName => (firstName != null || lastName != null)
      ? '${firstName ?? ''} ${lastName ?? ''}'.trim()
      : username;

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: int.parse(json['id'].toString()),
      username: json['username'] ?? '',
      email: json['email'] ?? '',
      firstName: json['firstName'],
      lastName: json['lastName'],
      dob: json['dob'] != null ? DateTime.parse(json['dob']) : null,
      sex: json['sex'],
      address: json['address'],
      city: json['city'],
      country: json['country'],
      mobileNumber: json['mobileNumber'],
      photoUrl: json['photoUrl'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'email': email,
      'firstName': firstName,
      'lastName': lastName,
      'dob': dob?.toIso8601String(),
      'sex': sex,
      'address': address,
      'city': city,
      'country': country,
      'mobileNumber': mobileNumber,
      'photoUrl': photoUrl,
    };
  }
}
