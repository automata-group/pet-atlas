import 'package:flutter_bloc/flutter_bloc.dart';
import '../../auth/data/models/user.dart';
import '../data/models/pet.dart';
import '../data/repositories/profile_repository.dart';
import 'profile_event.dart';
import 'profile_state.dart';

class ProfileBloc extends Bloc<ProfileEvent, ProfileState> {
  final ProfileRepository _profileRepository;

  ProfileBloc({required ProfileRepository profileRepository}) 
      : _profileRepository = profileRepository,
        super(ProfileInitial()) {
    on<LoadProfileEvent>(_onLoadProfile);
    on<UpdateProfileImageEvent>(_onUpdateProfileImage);
    on<UpdateProfileDetailsEvent>(_onUpdateProfileDetails);
    on<AddPetEvent>(_onAddPet);
    on<UpdatePetEvent>(_onUpdatePet);
    on<DeletePetEvent>(_onDeletePet);
  }

  String _getFriendlyErrorMessage(dynamic e) {
    final errorString = e.toString();
    if (errorString.contains('SocketException') || errorString.contains('connection error') || errorString.contains('Network is unreachable')) {
      return 'No internet connection or server is unreachable. Please check your network and try again.';
    } else if (errorString.contains('DioException')) {
      return 'Failed to connect to the server. Please try again later.';
    }
    return 'An unexpected error occurred. Please try again.';
  }

  void _onAddPet(
    AddPetEvent event,
    Emitter<ProfileState> emit,
  ) async {
    if (state is ProfileLoaded) {
      final currentState = state as ProfileLoaded;
      try {
        final newPet = await _profileRepository.addPet(event.petData);
        final updatedPets = List<Pet>.from(currentState.pets)..add(newPet);
        emit(currentState.copyWith(pets: updatedPets));
      } catch (e) {
        emit(ProfileError(_getFriendlyErrorMessage(e)));
      }
    }
  }

  void _onUpdatePet(
    UpdatePetEvent event,
    Emitter<ProfileState> emit,
  ) async {
    if (state is ProfileLoaded) {
      final currentState = state as ProfileLoaded;
      try {
        final updatedPet = await _profileRepository.updatePet(event.petId, event.petData);
        final updatedPets = currentState.pets.map((p) => p.id == event.petId ? updatedPet : p).toList();
        emit(currentState.copyWith(pets: updatedPets));
      } catch (e) {
        emit(ProfileError(_getFriendlyErrorMessage(e)));
      }
    }
  }

  void _onDeletePet(
    DeletePetEvent event,
    Emitter<ProfileState> emit,
  ) async {
    if (state is ProfileLoaded) {
      final currentState = state as ProfileLoaded;
      try {
        await _profileRepository.deletePet(event.petId);
        final updatedPets = currentState.pets.where((p) => p.id != event.petId).toList();
        emit(currentState.copyWith(pets: updatedPets));
      } catch (e) {
        emit(ProfileError(_getFriendlyErrorMessage(e)));
      }
    }
  }

  void _onLoadProfile(
    LoadProfileEvent event,
    Emitter<ProfileState> emit,
  ) async {
    emit(ProfileLoading());
    try {
      final data = await _profileRepository.getFullProfile();
      
      // Map backend 'profile' -> 'user' relation to our User model
      final profileData = data['profile'];
      final userData = profileData != null ? profileData['user'] : null;
      
      if (userData == null) {
        throw Exception('User data not found in profile');
      }

      final user = User.fromJson(userData);
      
      final petsData = data['pets'] as List? ?? [];
      final pets = petsData.map((json) => Pet.fromJson(json)).toList();

      emit(ProfileLoaded(user: user, pets: pets));
    } catch (e) {
      emit(ProfileError(_getFriendlyErrorMessage(e)));
    }
  }

  void _onUpdateProfileImage(
    UpdateProfileImageEvent event,
    Emitter<ProfileState> emit,
  ) {
    if (state is ProfileLoaded) {
      final currentState = state as ProfileLoaded;
      final updatedUser = User(
        id: currentState.user.id,
        username: currentState.user.username,
        email: currentState.user.email,
        firstName: currentState.user.firstName,
        lastName: currentState.user.lastName,
        dob: currentState.user.dob,
        sex: currentState.user.sex,
        address: currentState.user.address,
        city: currentState.user.city,
        country: currentState.user.country,
        mobileNumber: currentState.user.mobileNumber,
        photoUrl: event.newImageUrl,
      );
      emit(currentState.copyWith(user: updatedUser));
    }
  }

  void _onUpdateProfileDetails(
    UpdateProfileDetailsEvent event,
    Emitter<ProfileState> emit,
  ) async {
    if (state is ProfileLoaded) {
      final currentState = state as ProfileLoaded;
      try {
        final updatedUser = await _profileRepository.updateProfile(event.updatedUser);
        emit(currentState.copyWith(user: updatedUser));
      } catch (e) {
        emit(ProfileError(_getFriendlyErrorMessage(e)));
      }
    }
  }
}
