import 'package:equatable/equatable.dart';
import '../../auth/data/models/user.dart';
import '../data/models/pet.dart';

abstract class ProfileState extends Equatable {
  const ProfileState();

  @override
  List<Object?> get props => [];
}

class ProfileInitial extends ProfileState {}

class ProfileLoading extends ProfileState {}

class ProfileLoaded extends ProfileState {
  final User user;
  final List<Pet> pets;

  const ProfileLoaded({
    required this.user,
    this.pets = const [],
  });

  ProfileLoaded copyWith({User? user, List<Pet>? pets}) {
    return ProfileLoaded(
      user: user ?? this.user,
      pets: pets ?? this.pets,
    );
  }

  @override
  List<Object?> get props => [user, pets];
}

class ProfileError extends ProfileState {
  final String message;
  const ProfileError(this.message);

  @override
  List<Object?> get props => [message];
}
