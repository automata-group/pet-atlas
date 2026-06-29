import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class LocaleBloc extends Bloc<LocaleEvent, Locale> {
  LocaleBloc() : super(const Locale('en')) {
    on<ToggleLocaleEvent>((event, emit) {
      if (state.languageCode == 'en') {
        emit(const Locale('ar'));
      } else {
        emit(const Locale('en'));
      }
    });
  }
}

abstract class LocaleEvent {}
class ToggleLocaleEvent extends LocaleEvent {}
