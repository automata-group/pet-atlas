import 'package:flutter_bloc/flutter_bloc.dart';
import '../data/models/listing_item.dart';
import '../data/repositories/directory_repository.dart';

// Events
abstract class DirectoryEvent {}

class LoadDirectoryEvent extends DirectoryEvent {
  final String? type;
  final double? lat;
  final double? lon;
  final int? radius;
  final bool? isOfficial;
  final String? priceRange;
  final String? sortBy;

  LoadDirectoryEvent({
    this.type, 
    this.lat, 
    this.lon, 
    this.radius, 
    this.isOfficial, 
    this.priceRange, 
    this.sortBy
  });
}

class SearchDirectoryEvent extends DirectoryEvent {
  final String query;
  SearchDirectoryEvent(this.query);
}

// States
abstract class DirectoryState {}

class DirectoryInitial extends DirectoryState {}

class DirectoryLoading extends DirectoryState {}

class DirectoryLoaded extends DirectoryState {
  final List<ListingItem> listings;
  final String? activeFilter;

  DirectoryLoaded({required this.listings, this.activeFilter});
}

class DirectoryError extends DirectoryState {
  final String message;
  DirectoryError(this.message);
}

// BLoC
class DirectoryBloc extends Bloc<DirectoryEvent, DirectoryState> {
  final DirectoryRepository _repository;

  DirectoryBloc({required DirectoryRepository repository})
      : _repository = repository,
        super(DirectoryInitial()) {
    on<LoadDirectoryEvent>(_onLoadDirectory);
  }

  Future<void> _onLoadDirectory(
    LoadDirectoryEvent event,
    Emitter<DirectoryState> emit,
  ) async {
    emit(DirectoryLoading());
    try {
      List<ListingItem> listings;
      if (event.lat != null && event.lon != null && event.type != null) {
        try {
          listings = await _repository.getNearestListings(
            type: event.type!,
            lat: event.lat!,
            lon: event.lon!,
            radius: event.radius ?? 50000,
            isOfficial: event.isOfficial,
            priceRange: event.priceRange,
            sortBy: event.sortBy,
          );
        } catch (e) {
          // Fallback to all listings if nearest API fails (e.g., backend 500 for emulator coordinates)
          listings = await _repository.getAllListings();
          listings = listings.where((l) => l.listingType == event.type).toList();
        }
      } else {
        listings = await _repository.getAllListings();
        if (event.type != null) {
          listings = listings.where((l) => l.listingType == event.type).toList();
        }
      }
      emit(DirectoryLoaded(listings: listings, activeFilter: event.type));
    } catch (e) {
      emit(DirectoryError(e.toString()));
    }
  }
}
