import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';
import '../bloc/booking_bloc.dart';
import '../data/models/booking.dart';
import '../../../l10n/app_localizations.dart';

class MyBookingsScreen extends StatelessWidget {
  const MyBookingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(AppLocalizations.of(context)!.bookingMyAppointments, style: const TextStyle(fontWeight: FontWeight.bold)),
        elevation: 0,
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
      ),
      backgroundColor: const Color(0xFFF5F8F8),
      body: BlocBuilder<BookingBloc, BookingState>(
        builder: (context, state) {
          if (state is BookingLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (state is BookingSuccess) {
            if (state.bookings.isEmpty) {
              return _buildEmptyState(context);
            }
            return RefreshIndicator(
              onRefresh: () async {
                context.read<BookingBloc>().add(FetchMyBookings());
              },
              child: ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: state.bookings.length,
                itemBuilder: (context, index) {
                  return _buildBookingCard(context, state.bookings[index]);
                },
              ),
            );
          }

          if (state is BookingError) {
            return Center(child: Text(state.error));
          }

          return const Center(child: Text('Start booking to see your appointments here.'));
        },
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.calendar_today_outlined, size: 80, color: Colors.grey),
          const SizedBox(height: 16),
          Text(AppLocalizations.of(context)!.bookingNoAppointmentsYet, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.grey)),
        ],
      ),
    );
  }

  Widget _buildBookingCard(BuildContext context, Booking booking) {
    final primaryColor = const Color(0xFF00B0F0);
    final dateStr = DateFormat('EEE, MMM d, yyyy').format(booking.bookingDate);
    
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, 4))
        ],
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              children: [
                Container(
                  width: 60,
                  height: 60,
                  decoration: BoxDecoration(
                    color: primaryColor.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.pets, color: Color(0xFF00B0F0)),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        booking.listing?.title ?? 'Medical Center',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                      ),
                      const SizedBox(height: 4),
                      Text(dateStr, style: const TextStyle(color: Colors.grey, fontSize: 13)),
                    ],
                  ),
                ),
                _buildStatusBadge(booking.status),
              ],
            ),
          ),
          const Divider(height: 1),
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(AppLocalizations.of(context)!.bookingServices, style: const TextStyle(color: Colors.grey, fontSize: 11)),
                    Text(
                      booking.selectedServices.map((s) => s.name).join(', '),
                      style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 13),
                    ),
                    if (booking.pet != null) ...[
                      const SizedBox(height: 4),
                      Text('For: ${booking.pet?.name}', style: TextStyle(color: primaryColor, fontSize: 12, fontWeight: FontWeight.bold)),
                    ],
                  ],
                ),
                if (booking.status == 'PENDING')
                  TextButton(
                    onPressed: () {
                      context.read<BookingBloc>().add(CancelBookingEvent(booking.id));
                    },
                    child: Text(AppLocalizations.of(context)!.dirCancel, style: const TextStyle(color: Colors.red)),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusBadge(String status) {
    Color color;
    switch (status) {
      case 'CONFIRMED': color = Colors.green; break;
      case 'CANCELLED': color = Colors.red; break;
      case 'COMPLETED': color = Colors.blue; break;
      default: color = Colors.orange;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        status,
        style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.bold),
      ),
    );
  }
}
