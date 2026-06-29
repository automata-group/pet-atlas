import 'package:flutter_bloc/flutter_bloc.dart';
import '../data/repositories/notification_repository.dart';
import '../data/models/notification_model.dart';

abstract class NotificationState {}

class NotificationInitial extends NotificationState {}

class NotificationLoading extends NotificationState {}

class NotificationLoaded extends NotificationState {
  final List<NotificationModel> notifications;
  NotificationLoaded({required this.notifications});
}

class NotificationError extends NotificationState {
  final String message;
  NotificationError({required this.message});
}

class NotificationCubit extends Cubit<NotificationState> {
  final NotificationRepository _repository;

  NotificationCubit({required NotificationRepository repository})
      : _repository = repository,
        super(NotificationInitial());

  Future<void> fetchNotifications() async {
    emit(NotificationLoading());
    try {
      final list = await _repository.getMyNotifications();
      emit(NotificationLoaded(notifications: list));
    } catch (e) {
      emit(NotificationError(message: e.toString()));
    }
  }

  Future<void> markAsRead(int notificationId) async {
    if (state is NotificationLoaded) {
      final currentList = (state as NotificationLoaded).notifications;
      
      // Optimistic update for instant UI feedback
      final updatedList = currentList.map((n) {
        if (n.id == notificationId) {
          return n.copyWith(isRead: true);
        }
        return n;
      }).toList();
      emit(NotificationLoaded(notifications: updatedList));

      try {
        await _repository.markAsRead(notificationId);
      } catch (e) {
        // Fallback to original list on network failure
        emit(NotificationLoaded(notifications: currentList));
      }
    }
  }
}
