import 'package:equatable/equatable.dart';
import '../../auth/data/models/user.dart';

abstract class ProfileEvent extends Equatable {
  const ProfileEvent();

  @override
  List<Object?> get props => [];
}

class LoadProfileEvent extends ProfileEvent {}

class UpdateProfileImageEvent extends ProfileEvent {
  final String newImageUrl;
  const UpdateProfileImageEvent(this.newImageUrl);

  @override
  List<Object?> get props => [newImageUrl];
}

class UpdateProfileDetailsEvent extends ProfileEvent {
  final User updatedUser;
  const UpdateProfileDetailsEvent(this.updatedUser);

  @override
  List<Object?> get props => [updatedUser];
}

class AddPetEvent extends ProfileEvent {
  final Map<String, dynamic> petData;
  const AddPetEvent(this.petData);

  @override
  List<Object?> get props => [petData];
}

class UpdatePetEvent extends ProfileEvent {
  final int petId;
  final Map<String, dynamic> petData;
  const UpdatePetEvent(this.petId, this.petData);

  @override
  List<Object?> get props => [petId, petData];
}

class DeletePetEvent extends ProfileEvent {
  final int petId;
  const DeletePetEvent(this.petId);

  @override
  List<Object?> get props => [petId];
}
