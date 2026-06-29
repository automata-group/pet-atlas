import 'package:flutter_bloc/flutter_bloc.dart';
import '../data/models/subscription_status.dart';
import '../data/repositories/subscription_repository.dart';

class SubscriptionState {
  final SubscriptionStatus? status;
  final bool isLoading;
  final String? errorMessage;

  SubscriptionState({
    this.status,
    this.isLoading = false,
    this.errorMessage,
  });

  SubscriptionState copyWith({
    SubscriptionStatus? status,
    bool? isLoading,
    String? errorMessage,
  }) {
    return SubscriptionState(
      status: status ?? this.status,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage,
    );
  }
}

class SubscriptionCubit extends Cubit<SubscriptionState> {
  final SubscriptionRepository _repository;

  SubscriptionCubit({required SubscriptionRepository repository})
      : _repository = repository,
        super(SubscriptionState());

  Future<void> loadStatus() async {
    emit(state.copyWith(isLoading: true));
    try {
      final status = await _repository.getSubscriptionStatus();
      emit(SubscriptionState(status: status, isLoading: false));
    } catch (e) {
      emit(state.copyWith(
        isLoading: false,
        errorMessage: e.toString(),
      ));
    }
  }

  Future<void> subscribe({int planId = 2}) async {
    emit(state.copyWith(isLoading: true));
    try {
      final status = await _repository.subscribe(planId);
      emit(SubscriptionState(status: status, isLoading: false));
    } catch (e) {
      emit(state.copyWith(
        isLoading: false,
        errorMessage: e.toString(),
      ));
    }
  }

  Future<void> cancelSubscription() async {
    emit(state.copyWith(isLoading: true));
    try {
      final status = await _repository.cancelSubscription();
      emit(SubscriptionState(status: status, isLoading: false));
    } catch (e) {
      emit(state.copyWith(
        isLoading: false,
        errorMessage: e.toString(),
      ));
    }
  }

  Future<void> confirmSubscription({String? orderId}) async {
    emit(state.copyWith(isLoading: true));
    try {
      final status = await _repository.confirmSubscription(orderId: orderId);
      emit(SubscriptionState(status: status, isLoading: false));
    } catch (e) {
      emit(state.copyWith(
        isLoading: false,
        errorMessage: e.toString(),
      ));
    }
  }

  void reset() {
    emit(SubscriptionState());
  }
}
