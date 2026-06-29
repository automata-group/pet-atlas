import 'package:flutter_bloc/flutter_bloc.dart';
import '../data/repositories/directory_repository.dart';
import '../data/models/service_section.dart';

class SystemConfigState {
  final bool clinicsEnabled;
  final List<ServiceSection> services;
  final bool isLoading;

  SystemConfigState({
    required this.clinicsEnabled,
    this.services = const [],
    this.isLoading = false,
  });

  SystemConfigState copyWith({
    bool? clinicsEnabled,
    List<ServiceSection>? services,
    bool? isLoading,
  }) {
    return SystemConfigState(
      clinicsEnabled: clinicsEnabled ?? this.clinicsEnabled,
      services: services ?? this.services,
      isLoading: isLoading ?? this.isLoading,
    );
  }
}

class SystemConfigCubit extends Cubit<SystemConfigState> {
  final DirectoryRepository _repository;

  SystemConfigCubit({required DirectoryRepository repository})
      : _repository = repository,
        super(SystemConfigState(clinicsEnabled: true, services: const []));

  Future<void> loadConfig() async {
    emit(state.copyWith(isLoading: true));
    try {
      final clinicsEnabled = await _repository.getClinicsEnabled();
      final services = await _repository.getActiveServices();
      emit(SystemConfigState(
        clinicsEnabled: clinicsEnabled,
        services: services,
        isLoading: false,
      ));
    } catch (_) {
      emit(state.copyWith(isLoading: false));
    }
  }
}
