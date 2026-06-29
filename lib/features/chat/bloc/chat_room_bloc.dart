import 'package:flutter/foundation.dart';
import 'dart:async';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import '../data/models/chat_message.dart';
import '../data/repositories/chat_repository.dart';
import '../../../core/network/socket_service.dart';

// Events
abstract class ChatRoomEvent extends Equatable {
  @override
  List<Object?> get props => [];
}

class LoadMessages extends ChatRoomEvent {
  final String chatId;
  LoadMessages(this.chatId);
  @override
  List<Object?> get props => [chatId];
}

class SendMessage extends ChatRoomEvent {
  final String chatId;
  final String content;
  SendMessage(this.chatId, this.content);
  @override
  List<Object?> get props => [chatId, content];
}

class SendMediaMessage extends ChatRoomEvent {
  final String chatId;
  final String filePath;
  final String type; // 'Photo', 'Voice', 'Video', 'File'
  SendMediaMessage(this.chatId, this.filePath, this.type);
  @override
  List<Object?> get props => [chatId, filePath, type];
}

class OnMessageReceived extends ChatRoomEvent {
  final ChatMessage message;
  OnMessageReceived(this.message);
  @override
  List<Object?> get props => [message];
}

class UpdateTypingStatus extends ChatRoomEvent {
  final String username;
  final bool isTyping;
  UpdateTypingStatus(this.username, this.isTyping);
  @override
  List<Object?> get props => [username, isTyping];
}

class MarkMessageAsSeen extends ChatRoomEvent {
  final String messageId;
  MarkMessageAsSeen(this.messageId);
  @override
  List<Object?> get props => [messageId];
}

class OnChatArchived extends ChatRoomEvent {
  final String chatId;
  OnChatArchived(this.chatId);
  @override
  List<Object?> get props => [chatId];
}

// States
abstract class ChatRoomState extends Equatable {
  @override
  List<Object?> get props => [];
}

class ChatRoomInitial extends ChatRoomState {}
class ChatRoomLoading extends ChatRoomState {}
class ChatRoomLoaded extends ChatRoomState {
  final List<ChatMessage> messages;
  final bool isSending;
  final List<String> typingUsers;
  final Map<String, DateTime> seenMessages; // messageId -> seenAt
  final String roomStatus; // 'open' or 'archived'

  ChatRoomLoaded(
    this.messages, {
    this.isSending = false, 
    this.typingUsers = const [],
    this.seenMessages = const {},
    this.roomStatus = 'open',
  });

  @override
  List<Object?> get props => [messages, isSending, typingUsers, seenMessages, roomStatus];

  ChatRoomLoaded copyWith({
    List<ChatMessage>? messages,
    bool? isSending,
    List<String>? typingUsers,
    Map<String, DateTime>? seenMessages,
    String? roomStatus,
  }) {
    return ChatRoomLoaded(
      messages ?? this.messages,
      isSending: isSending ?? this.isSending,
      typingUsers: typingUsers ?? this.typingUsers,
      seenMessages: seenMessages ?? this.seenMessages,
      roomStatus: roomStatus ?? this.roomStatus,
    );
  }
}
class ChatRoomError extends ChatRoomState {
  final String message;
  ChatRoomError(this.message);
  @override
  List<Object?> get props => [message];
}

// BLoC
class ChatRoomBloc extends Bloc<ChatRoomEvent, ChatRoomState> {
  final ChatRepository _repository;
  final SocketService _socketService;
  String? _currentChatId;
  StreamSubscription? _messageSubscription;
  StreamSubscription? _typingSubscription;
  StreamSubscription? _seenSubscription;
  StreamSubscription? _archiveSubscription;

  ChatRoomBloc({
    required ChatRepository repository,
    required SocketService socketService,
  })  : _repository = repository,
        _socketService = socketService,
        super(ChatRoomInitial()) {
    
    // Listen for socket messages via Stream
    _messageSubscription = _socketService.messageStream.listen((data) {
      final message = ChatMessage.fromJson(data);
      if (message.chatId == _currentChatId) {
        add(OnMessageReceived(message));
        // Only mark as seen if the message was sent by SOMEONE ELSE (not us)
        if (message.senderId != _socketService.currentUserId) {
          _socketService.sendMessageSeen(_currentChatId!, message.id);
        }
      }
    });

    // Listen for typing status via Stream
    _typingSubscription = _socketService.typingStream.listen((data) {
      // Ignore own typing events (server broadcasts to everyone including sender)
      if (data['userId']?.toString() == _socketService.currentUserId) return;
      if (data['chatId']?.toString() == _currentChatId) {
        add(UpdateTypingStatus(data['username'] ?? 'Someone', data['isTyping'] ?? false));
      }
    });

    // Listen for message seen via Stream
    _seenSubscription = _socketService.seenStream.listen((data) {
      debugPrint('DEBUG UI SEEN: Received seen event: $data');
      // Only care about OTHER users reading OUR messages
      if (data['userId']?.toString() == _socketService.currentUserId) {
        debugPrint('DEBUG UI SEEN: Ignored because it was sent by us.');
        return;
      }
      if (data['chatId']?.toString() == _currentChatId) {
        debugPrint('DEBUG UI SEEN: Marking message ${data['messageId']} as seen in UI');
        add(MarkMessageAsSeen(data['messageId']?.toString() ?? ''));
      } else {
        debugPrint('DEBUG UI SEEN: Ignored due to chatId mismatch. data[chatId]=${data['chatId']}, _currentChatId=$_currentChatId');
      }
    });

    _archiveSubscription = _socketService.archiveStream.listen((data) {
      if (data['chatId']?.toString() == _currentChatId) {
        add(OnChatArchived(_currentChatId!));
      }
    });

    on<LoadMessages>((event, emit) async {
      _currentChatId = event.chatId;
      _socketService.joinChatRoom(event.chatId);
      
      emit(ChatRoomLoading());
      try {
        final messages = await _repository.getChatMessages(event.chatId);
        // Determine roomStatus from the group list if possible, or default to 'open'
        // For simplicity, we'll initialize with 'open' and let the socket/load handle it
        emit(ChatRoomLoaded(messages, roomStatus: 'open')); 
      } catch (e) {
        emit(ChatRoomError(e.toString()));
      }
    });

    on<OnChatArchived>((event, emit) {
      if (state is ChatRoomLoaded) {
        emit((state as ChatRoomLoaded).copyWith(roomStatus: 'archived'));
      }
    });

    on<UpdateTypingStatus>((event, emit) {
      if (state is ChatRoomLoaded) {
        final currentState = state as ChatRoomLoaded;
        final updatedTypingUsers = List<String>.from(currentState.typingUsers);
        if (event.isTyping) {
          if (!updatedTypingUsers.contains(event.username)) {
            updatedTypingUsers.add(event.username);
          }
        } else {
          updatedTypingUsers.remove(event.username);
        }
        emit(currentState.copyWith(typingUsers: updatedTypingUsers));
      }
    });

    on<MarkMessageAsSeen>((event, emit) {
      if (state is ChatRoomLoaded) {
        final currentState = state as ChatRoomLoaded;
        final updatedSeenMessages = Map<String, DateTime>.from(currentState.seenMessages);
        updatedSeenMessages[event.messageId] = DateTime.now();
        emit(currentState.copyWith(seenMessages: updatedSeenMessages));
      }
    });

    on<OnMessageReceived>((event, emit) {
      if (state is ChatRoomLoaded) {
        final currentState = state as ChatRoomLoaded;
        final updatedMessages = List<ChatMessage>.from(currentState.messages);

        // 1. Avoid exact ID duplicates
        if (updatedMessages.any((m) => m.id == event.message.id)) return;

        // 2. Handle De-duplication (Self-messages)
        // If we receive a message from ourselves, check if there's a matching temporary message
        if (event.message.senderId == _socketService.currentUserId) {
          final tempIndex = updatedMessages.indexWhere((m) => 
            m.id.startsWith('temp_') && m.content == event.message.content
          );
          
          if (tempIndex != -1) {
            // Update the temporary message with the real one from server
            updatedMessages[tempIndex] = event.message;
            emit(currentState.copyWith(messages: updatedMessages));
            return;
          }
        }

        // 3. New message from someone else (or no temp match found)
        emit(currentState.copyWith(messages: [event.message, ...updatedMessages]));
      }
    });

    on<SendMessage>((event, emit) async {
      final currentState = state;
      if (currentState is ChatRoomLoaded) {
        final currentMessages = List<ChatMessage>.from(currentState.messages);
        
        final tempMessage = ChatMessage(
          id: 'temp_${DateTime.now().millisecondsSinceEpoch}',
          chatId: event.chatId,
          senderId: _socketService.currentUserId ?? '',
          type: 'Text',
          content: event.content,
          createdAt: DateTime.now(),
        );
        
        // Add temp message immediately for instant UI feedback
        emit(currentState.copyWith(messages: [tempMessage, ...currentMessages], isSending: true));

        try {
          // HTTP call to persist the message — backend will broadcast via socket
          await _repository.sendMessage(event.chatId, event.content);
          
          // Just mark as no longer sending; socket listener will replace the temp message
          if (state is ChatRoomLoaded) {
            emit((state as ChatRoomLoaded).copyWith(isSending: false));
          }
        } catch (e) {
          // Remove the temp message on failure
          final rollbackMessages = List<ChatMessage>.from(
            state is ChatRoomLoaded ? (state as ChatRoomLoaded).messages : []
          )..removeWhere((m) => m.id == tempMessage.id);
          emit(ChatRoomLoaded(rollbackMessages));
        }
      }
    });

    on<SendMediaMessage>((event, emit) async {
      final currentState = state;
      if (currentState is ChatRoomLoaded) {
        final currentMessages = List<ChatMessage>.from(currentState.messages);
        
        final tempMessage = ChatMessage(
          id: 'temp_media_${DateTime.now().millisecondsSinceEpoch}',
          chatId: event.chatId,
          senderId: _socketService.currentUserId ?? '',
          type: event.type,
          content: 'Sending ${event.type}...',
          createdAt: DateTime.now(),
        );
        
        emit(currentState.copyWith(messages: [tempMessage, ...currentMessages], isSending: true));

        try {
          // 1. Upload File
          final uploadResult = await _repository.uploadFile(event.filePath);
          final String fileUrl = uploadResult['url'];
          
          // 2. Send Message with URL
          await _repository.sendMessage(
            event.chatId, 
            uploadResult['originalName'] ?? event.type,
            type: event.type,
            photoUrl: event.type == 'Photo' ? fileUrl : null,
            voiceUrl: event.type == 'Voice' ? fileUrl : null,
            videoUrl: event.type == 'Video' ? fileUrl : null,
          );

          if (state is ChatRoomLoaded) {
            emit((state as ChatRoomLoaded).copyWith(isSending: false));
          }
        } catch (e) {
           final rollbackMessages = List<ChatMessage>.from(
            state is ChatRoomLoaded ? (state as ChatRoomLoaded).messages : []
          )..removeWhere((m) => m.id == tempMessage.id);
          emit(ChatRoomLoaded(rollbackMessages));
        }
      }
    });
  }

  @override
  Future<void> close() {
    _messageSubscription?.cancel();
    _typingSubscription?.cancel();
    _seenSubscription?.cancel();
    _archiveSubscription?.cancel();
    if (_currentChatId != null) {
      _socketService.leaveChatRoom(_currentChatId!);
    }
    return super.close();
  }
}
