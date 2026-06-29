class ServiceSection {
  final int id;
  final String titleEn;
  final String titleAr;
  final String iconName;
  final String baseColor;
  final String listingType;
  final bool isActive;

  ServiceSection({
    required this.id,
    required this.titleEn,
    required this.titleAr,
    required this.iconName,
    required this.baseColor,
    required this.listingType,
    required this.isActive,
  });

  factory ServiceSection.fromJson(Map<String, dynamic> json) {
    return ServiceSection(
      id: json['id'] as int? ?? 0,
      titleEn: json['titleEn'] as String? ?? '',
      titleAr: json['titleAr'] as String? ?? '',
      iconName: json['iconName'] as String? ?? 'pets',
      baseColor: json['baseColor'] as String? ?? '#2196F3',
      listingType: json['listingType'] as String? ?? 'Clinic',
      isActive: json['isActive'] as bool? ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'titleEn': titleEn,
      'titleAr': titleAr,
      'iconName': iconName,
      'baseColor': baseColor,
      'listingType': listingType,
      'isActive': isActive,
    };
  }
}
