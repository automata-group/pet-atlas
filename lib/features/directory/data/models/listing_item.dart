class ClinicService {
  final String name;
  final String description;
  final double price;

  ClinicService({required this.name, required this.description, required this.price});

  factory ClinicService.fromJson(Map<String, dynamic> json) {
    return ClinicService(
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      price: (json['price'] ?? 0.0).toDouble(),
    );
  }
}

class ListingItem {
  final int id;
  final int categoryId;
  final String title;
  final String description;
  final String listingType;
  final String? contactNumber;
  final String? websiteUrl;
  final String address;
  final double avgStars;
  final String? logoUrl;
  final List<String> galleryUrls;
  final List<ClinicService> services;
  final String? priceRange;
  final double? lat;
  final double? lon;
  final double? distance;
  final int? ownerId;
  final bool isOfficial;
  final List<String> equipments;
  final Map<String, dynamic>? metadata;

  ListingItem({
    required this.id,
    required this.categoryId,
    required this.title,
    required this.description,
    required this.listingType,
    this.contactNumber,
    this.websiteUrl,
    required this.address,
    required this.avgStars,
    this.logoUrl,
    this.galleryUrls = const [],
    this.services = const [],
    this.equipments = const [],
    this.priceRange,
    this.lat,
    this.lon,
    this.distance,
    this.ownerId,
    this.isOfficial = false,
    this.metadata,
  });

  factory ListingItem.fromJson(Map<String, dynamic> json) {
    // ... coordinates logic remains same ...
    double? latitude;
    double? longitude;

    if (json['coordinates'] != null) {
      if (json['coordinates'] is Map) {
         latitude = (json['coordinates']['x'] ?? 0.0).toDouble();
         longitude = (json['coordinates']['y'] ?? 0.0).toDouble();
      }
    }

    return ListingItem(
      id: int.parse(json['id'].toString()),
      categoryId: json['categoryId'] ?? 0,
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      listingType: json['listingType'] ?? '',
      contactNumber: json['contactNumber'],
      websiteUrl: json['websiteUrl'],
      address: json['address'] ?? '',
      avgStars: double.parse((json['avgStars'] ?? 0.0).toString()),
      logoUrl: json['logoUrl'],
      galleryUrls: json['galleryUrls'] != null ? List<String>.from(json['galleryUrls']) : [],
      services: json['services'] != null 
          ? (json['services'] as List).map((s) => ClinicService.fromJson(s)).toList()
          : [],
      equipments: json['equipments'] != null ? List<String>.from(json['equipments']) : [],
      priceRange: json['priceRange'],
      lat: latitude,
      lon: longitude,
      distance: json['distance'] != null ? double.parse(json['distance'].toString()) : null,
      ownerId: json['owner_id'] != null ? int.parse(json['owner_id'].toString()) : null,
      isOfficial: json['isOfficial'] == 1 || json['isOfficial'] == true,
      metadata: json['item_metadata'],
    );
  }
}
