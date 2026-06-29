import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import '../data/models/booking.dart';
import '../data/repositories/booking_repository.dart';

// --- Events ---
abstract class BookingEvent extends Equatable {
  const BookingEvent();
  @override
  List<Object?> get props => [];
}

class CreateBooking extends BookingEvent {
  final int listingId;
  final List<Map<String, dynamic>> selectedServices;
  final DateTime bookingDate;
  final int? petId;
  final String? notes;

  const CreateBooking({
    required this.listingId,
    required this.selectedServices,
    required this.bookingDate,
    this.petId,
    this.notes,
  });

  @override
  List<Object?> get props => [listingId, selectedServices, bookingDate, petId, notes];
}

class FetchMyBookings extends BookingEvent {}

class CancelBookingEvent extends BookingEvent {
  final int id;
  const CancelBookingEvent(this.id);
  @override
  List<Object?> get props => [id];
}

// --- States ---
abstract class BookingState extends Equatable {
  const BookingState();
  @override
  List<Object?> get props => [];
}

class BookingInitial extends BookingState {}
class BookingLoading extends BookingState {}
class BookingSuccess extends BookingState {
  final List<Booking> bookings;
  final String? message;
  const BookingSuccess(this.bookings, {this.message});
  @override
  List<Object?> get props => [bookings, message];
}
class BookingError extends BookingState {
  final String error;
  const BookingError(this.error);
  @override
  List<Object?> get props => [error];
}

// --- BLoC ---
class BookingBloc extends Bloc<BookingEvent, BookingState> {
  final BookingRepository repository;

  BookingBloc({required this.repository}) : super(BookingInitial()) {
    on<CreateBooking>(_onCreateBooking);
    on<FetchMyBookings>(_onFetchMyBookings);
    on<CancelBookingEvent>(_onCancelBooking);
  }

  Future<void> _onCreateBooking(CreateBooking event, Emitter<BookingState> emit) async {
    emit(BookingLoading());
    try {
      await repository.createBooking(
        listingId: event.listingId,
        selectedServices: event.selectedServices,
        bookingDate: event.bookingDate,
        petId: event.petId,
        notes: event.notes,
      );
      // Refresh list after creation
      final bookings = await repository.getMyBookings();
      emit(BookingSuccess(bookings, message: 'Booking created successfully!'));
    } catch (e) {
      emit(BookingError(e.toString()));
    }
  }

  Future<void> _onFetchMyBookings(FetchMyBookings event, Emitter<BookingState> emit) async {
    emit(BookingLoading());
    try {
      final bookings = await repository.getMyBookings();
      emit(BookingSuccess(bookings));
    } catch (e) {
      emit(BookingError(e.toString()));
    }
  }

  Future<void> _onCancelBooking(CancelBookingEvent event, Emitter<BookingState> emit) async {
    try {
      await repository.cancelBooking(event.id);
      final bookings = await repository.getMyBookings();
      emit(BookingSuccess(bookings, message: 'Booking cancelled.'));
    } catch (e) {
      emit(BookingError(e.toString()));
    }
  }
}
