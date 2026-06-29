import 'package:equatable/equatable.dart';
import '../data/models/pet_overview.dart';

abstract class PetManagementState extends Equatable {
  const PetManagementState();

  @override
  List<Object?> get props => [];
}

class PetManagementInitial extends PetManagementState {}

class PetManagementLoading extends PetManagementState {}

class PetManagementLoaded extends PetManagementState {
  final PetOverview overview;
  const PetManagementLoaded(this.overview);

  @override
  List<Object?> get props => [overview];
}

class PetManagementError extends PetManagementState {
  final String message;
  const PetManagementError(this.message);

  @override
  List<Object?> get props => [message];
}

class PetManagementOperationSuccess extends PetManagementState {
  final String message;
  const PetManagementOperationSuccess(this.message);

  @override
  List<Object?> get props => [message];
}
