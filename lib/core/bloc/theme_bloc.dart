import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter/material.dart';

// Events
abstract class ThemeEvent {}

class ToggleThemeEvent extends ThemeEvent {}

// State
class ThemeState {
  final ThemeMode themeMode;
  ThemeState({required this.themeMode});
}

// BLoC
class ThemeBloc extends Bloc<ThemeEvent, ThemeState> {
  ThemeBloc() : super(ThemeState(themeMode: ThemeMode.system)) {
    on<ToggleThemeEvent>((event, emit) {
      if (state.themeMode == ThemeMode.light) {
        emit(ThemeState(themeMode: ThemeMode.dark));
      } else if (state.themeMode == ThemeMode.dark) {
        emit(ThemeState(themeMode: ThemeMode.light));
      } else {
        // Assuming system was default, let's toggle to dark
        emit(ThemeState(themeMode: ThemeMode.dark));
      }
    });
  }
}
