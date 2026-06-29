import 'package:flutter_bloc/flutter_bloc.dart';
import '../data/repositories/pet_management_repository.dart';
import 'pet_management_event.dart';
import 'pet_management_state.dart';

class PetManagementBloc extends Bloc<PetManagementEvent, PetManagementState> {
  final PetManagementRepository _repository;

  PetManagementBloc({required PetManagementRepository repository})
      : _repository = repository,
        super(PetManagementInitial()) {
    on<LoadPetOverviewEvent>(_onLoadOverview);
    on<AddDiaryEntryEvent>(_onAddDiary);
    on<DeleteDiaryEntryEvent>(_onDeleteDiary);
    on<AddReminderEvent>(_onAddReminder);
    on<ToggleReminderEvent>(_onToggleReminder);
    on<DeleteReminderEvent>(_onDeleteReminder);
    on<AddWeightLogEvent>(_onAddWeight);
    on<DeleteWeightLogEvent>(_onDeleteWeight);
    on<AddMedicationLogEvent>(_onAddMedication);
    on<DeleteMedicationLogEvent>(_onDeleteMedication);
    on<AddVetVisitEvent>(_onAddVetVisit);
    on<DeleteVetVisitEvent>(_onDeleteVetVisit);
    on<AddVaccineLogEvent>(_onAddVaccine);
    on<DeleteVaccineLogEvent>(_onDeleteVaccine);
  }

  void _onLoadOverview(
    LoadPetOverviewEvent event,
    Emitter<PetManagementState> emit,
  ) async {
    emit(PetManagementLoading());
    try {
      final overview = await _repository.getOverview(event.petId);
      emit(PetManagementLoaded(overview));
    } catch (e) {
      emit(PetManagementError(e.toString()));
    }
  }

  // --- Diary ---
  void _onAddDiary(AddDiaryEntryEvent event, Emitter<PetManagementState> emit) async {
    try {
      await _repository.addDiary(event.petId, event.data);
      add(LoadPetOverviewEvent(event.petId));
    } catch (e) {
      emit(PetManagementError(e.toString()));
    }
  }

  void _onDeleteDiary(DeleteDiaryEntryEvent event, Emitter<PetManagementState> emit) async {
    try {
      await _repository.deleteDiary(event.petId, event.id);
      add(LoadPetOverviewEvent(event.petId));
    } catch (e) {
      emit(PetManagementError(e.toString()));
    }
  }

  // --- Reminders ---
  void _onAddReminder(AddReminderEvent event, Emitter<PetManagementState> emit) async {
    try {
      await _repository.addReminder(event.petId, event.data);
      add(LoadPetOverviewEvent(event.petId));
    } catch (e) {
      emit(PetManagementError(e.toString()));
    }
  }

  void _onToggleReminder(ToggleReminderEvent event, Emitter<PetManagementState> emit) async {
    try {
      await _repository.toggleReminder(event.petId, event.id, event.isCompleted);
      add(LoadPetOverviewEvent(event.petId));
    } catch (e) {
      emit(PetManagementError(e.toString()));
    }
  }

  void _onDeleteReminder(DeleteReminderEvent event, Emitter<PetManagementState> emit) async {
    try {
      await _repository.deleteReminder(event.petId, event.id);
      add(LoadPetOverviewEvent(event.petId));
    } catch (e) {
      emit(PetManagementError(e.toString()));
    }
  }

  // --- Weight ---
  void _onAddWeight(AddWeightLogEvent event, Emitter<PetManagementState> emit) async {
    try {
      await _repository.addWeight(event.petId, event.data);
      add(LoadPetOverviewEvent(event.petId));
    } catch (e) {
      emit(PetManagementError(e.toString()));
    }
  }

  void _onDeleteWeight(DeleteWeightLogEvent event, Emitter<PetManagementState> emit) async {
    try {
      await _repository.deleteWeight(event.petId, event.id);
      add(LoadPetOverviewEvent(event.petId));
    } catch (e) {
      emit(PetManagementError(e.toString()));
    }
  }

  // --- Medication ---
  void _onAddMedication(AddMedicationLogEvent event, Emitter<PetManagementState> emit) async {
    try {
      await _repository.addMed(event.petId, event.data);
      add(LoadPetOverviewEvent(event.petId));
    } catch (e) {
      emit(PetManagementError(e.toString()));
    }
  }

  void _onDeleteMedication(DeleteMedicationLogEvent event, Emitter<PetManagementState> emit) async {
    try {
      await _repository.deleteMed(event.petId, event.id);
      add(LoadPetOverviewEvent(event.petId));
    } catch (e) {
      emit(PetManagementError(e.toString()));
    }
  }

  // --- Vet Visit ---
  void _onAddVetVisit(AddVetVisitEvent event, Emitter<PetManagementState> emit) async {
    try {
      await _repository.addVetVisit(event.petId, event.data);
      add(LoadPetOverviewEvent(event.petId));
    } catch (e) {
      emit(PetManagementError(e.toString()));
    }
  }

  void _onDeleteVetVisit(DeleteVetVisitEvent event, Emitter<PetManagementState> emit) async {
    try {
      await _repository.deleteVetVisit(event.petId, event.id);
      add(LoadPetOverviewEvent(event.petId));
    } catch (e) {
      emit(PetManagementError(e.toString()));
    }
  }

  // --- Vaccine ---
  void _onAddVaccine(AddVaccineLogEvent event, Emitter<PetManagementState> emit) async {
    try {
      await _repository.addVaccine(event.petId, event.data);
      add(LoadPetOverviewEvent(event.petId));
    } catch (e) {
      emit(PetManagementError(e.toString()));
    }
  }

  void _onDeleteVaccine(DeleteVaccineLogEvent event, Emitter<PetManagementState> emit) async {
    try {
      await _repository.deleteVaccine(event.petId, event.id);
      add(LoadPetOverviewEvent(event.petId));
    } catch (e) {
      emit(PetManagementError(e.toString()));
    }
  }
}
