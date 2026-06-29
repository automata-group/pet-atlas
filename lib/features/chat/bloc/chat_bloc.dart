import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import '../data/models/chat_group.dart';
import '../data/repositories/chat_repository.dart';

// Events
abstract class ChatEvent extends Equatable {
  @override
  List<Object?> get props => [];
}

class LoadMyChats extends ChatEvent {}

class StartConsultation extends ChatEvent {
  final int listingId;
  final String listingName;
  StartConsultation({required this.listingId, required this.listingName});
  @override
  List<Object?> get props => [listingId, listingName];
}

// States
abstract class ChatState extends Equatable {
  @override
  List<Object?> get props => [];
}

class ChatInitial extends ChatState {}
class ChatLoading extends ChatState {}
class ChatLoaded extends ChatState {
  final List<ChatGroup> chats;
  ChatLoaded(this.chats);
  @override
  List<Object?> get props => [chats];
}
class ChatSuccess extends ChatState {
  final ChatGroup chat;
  ChatSuccess(this.chat);
  @override
  List<Object?> get props => [chat];
}
class ChatError extends ChatState {
  final String message;
  ChatError(this.message);
  @override
  List<Object?> get props => [message];
}

// BLoC
class ChatBloc extends Bloc<ChatEvent, ChatState> {
  final ChatRepository _repository;

  ChatBloc({required ChatRepository repository}) 
      : _repository = repository, 
        super(ChatInitial()) {
    on<LoadMyChats>((event, emit) async {
      emit(ChatLoading());
      try {
        final chats = await _repository.getMyChats();
        emit(ChatLoaded(chats));
      } catch (e) {
        emit(ChatError(e.toString()));
      }
    });

    on<StartConsultation>((event, emit) async {
      emit(ChatLoading());
      try {
        final chat = await _repository.startConsultation(event.listingId, event.listingName);
        emit(ChatSuccess(chat));
      } catch (e) {
        emit(ChatError(e.toString()));
      }
    });
  }
}
