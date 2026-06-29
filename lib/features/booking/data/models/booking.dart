import '../../../directory/data/models/listing_item.dart';
import '../../../profile/data/models/pet.dart';

class Booking {
  final int id;
  final int userId;
  final int listingId;
  final int? petId;
  final List<ClinicService> selectedServices;
  final DateTime bookingDate;
  final String status;
  final double totalPrice;
  final String? notes;
  final ListingItem? listing;
  final Pet? pet;

  Booking({
    required this.id,
    required this.userId,
    required this.listingId,
    this.petId,
    required this.selectedServices,
    required this.bookingDate,
    required this.status,
    required this.totalPrice,
    this.notes,
    this.listing,
    this.pet,
  });

  factory Booking.fromJson(Map<String, dynamic> json) {
    return Booking(
      id: int.parse(json['id'].toString()),
      userId: int.parse(json['userId'].toString()),
      listingId: int.parse(json['listingId'].toString()),
      petId: json['petId'] != null ? int.parse(json['petId'].toString()) : null,
      selectedServices: (json['selectedServices'] as List)
          .map((s) => ClinicService.fromJson(s))
          .toList(),
      bookingDate: DateTime.parse(json['bookingDate']),
      status: json['status'] ?? 'PENDING',
      totalPrice: double.parse((json['totalPrice'] ?? 0.0).toString()),
      notes: json['notes'],
      listing: json['listing'] != null ? ListingItem.fromJson(json['listing']) : null,
      pet: json['pet'] != null ? Pet.fromJson(json['pet']) : null,
    );
  }
}
