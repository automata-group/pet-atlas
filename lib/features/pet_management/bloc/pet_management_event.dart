import 'package:equatable/equatable.dart';

abstract class PetManagementEvent extends Equatable {
  const PetManagementEvent();

  @override
  List<Object?> get props => [];
}

class LoadPetOverviewEvent extends PetManagementEvent {
  final int petId;
  const LoadPetOverviewEvent(this.petId);

  @override
  List<Object?> get props => [petId];
}

class AddDiaryEntryEvent extends PetManagementEvent {
  final int petId;
  final Map<String, dynamic> data;
  const AddDiaryEntryEvent(this.petId, this.data);

  @override
  List<Object?> get props => [petId, data];
}

class DeleteDiaryEntryEvent extends PetManagementEvent {
  final int petId;
  final int id;
  const DeleteDiaryEntryEvent(this.petId, this.id);

  @override
  List<Object?> get props => [petId, id];
}

class AddReminderEvent extends PetManagementEvent {
  final int petId;
  final Map<String, dynamic> data;
  const AddReminderEvent(this.petId, this.data);

  @override
  List<Object?> get props => [petId, data];
}

class ToggleReminderEvent extends PetManagementEvent {
  final int petId;
  final int id;
  final bool isCompleted;
  const ToggleReminderEvent(this.petId, this.id, this.isCompleted);

  @override
  List<Object?> get props => [petId, id, isCompleted];
}

class DeleteReminderEvent extends PetManagementEvent {
  final int petId;
  final int id;
  const DeleteReminderEvent(this.petId, this.id);

  @override
  List<Object?> get props => [petId, id];
}

class AddWeightLogEvent extends PetManagementEvent {
  final int petId;
  final Map<String, dynamic> data;
  const AddWeightLogEvent(this.petId, this.data);

  @override
  List<Object?> get props => [petId, data];
}

class DeleteWeightLogEvent extends PetManagementEvent {
  final int petId;
  final int id;
  const DeleteWeightLogEvent(this.petId, this.id);

  @override
  List<Object?> get props => [petId, id];
}

class AddMedicationLogEvent extends PetManagementEvent {
  final int petId;
  final Map<String, dynamic> data;
  const AddMedicationLogEvent(this.petId, this.data);

  @override
  List<Object?> get props => [petId, data];
}

class DeleteMedicationLogEvent extends PetManagementEvent {
  final int petId;
  final int id;
  const DeleteMedicationLogEvent(this.petId, this.id);

  @override
  List<Object?> get props => [petId, id];
}

class AddVetVisitEvent extends PetManagementEvent {
  final int petId;
  final Map<String, dynamic> data;
  const AddVetVisitEvent(this.petId, this.data);

  @override
  List<Object?> get props => [petId, data];
}

class DeleteVetVisitEvent extends PetManagementEvent {
  final int petId;
  final int id;
  const DeleteVetVisitEvent(this.petId, this.id);

  @override
  List<Object?> get props => [petId, id];
}

class AddVaccineLogEvent extends PetManagementEvent {
  final int petId;
  final Map<String, dynamic> data;
  const AddVaccineLogEvent(this.petId, this.data);

  @override
  List<Object?> get props => [petId, data];
}

class DeleteVaccineLogEvent extends PetManagementEvent {
  final int petId;
  final int id;
  const DeleteVaccineLogEvent(this.petId, this.id);

  @override
  List<Object?> get props => [petId, id];
}
