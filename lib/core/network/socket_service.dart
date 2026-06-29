import 'dart:async';
import 'package:socket_io_client/socket_io_client.dart' as io;
import 'package:jwt_decoder/jwt_decoder.dart';
import 'package:flutter/foundation.dart';
import '../config/environment.dart';
import '../../features/auth/data/token_service.dart';

class SocketService {
  io.Socket? _socket;
  final TokenService _tokenService;
  String? _currentUserId;
  String? _username;

  SocketService({required TokenService tokenService}) : _tokenService = tokenService;

  String? get currentUserId => _currentUserId;
  String? get username => _username;

  String? _activeChatId;

  final _messageStreamController = StreamController<dynamic>.broadcast();
  Stream<dynamic> get messageStream => _messageStreamController.stream;

  final _typingStreamController = StreamController<dynamic>.broadcast();
  Stream<dynamic> get typingStream => _typingStreamController.stream;

  final _seenStreamController = StreamController<dynamic>.broadcast();
  Stream<dynamic> get seenStream => _seenStreamController.stream;

  final _archiveStreamController = StreamController<dynamic>.broadcast();
  Stream<dynamic> get archiveStream => _archiveStreamController.stream;

  void connect() async {
    debugPrint('DEBUG SOCKET: [1] connect() called');
    try {
      final token = await _tokenService.getToken();
      debugPrint('DEBUG SOCKET: [2] Token retrieved (null: ${token == null})');
      
      if (token != null) {
        final decodedToken = JwtDecoder.decode(token);
        final wpData = decodedToken['data'];
        if (wpData != null && wpData['user'] != null) {
          _currentUserId = wpData['user']['id']?.toString();
        }
        _currentUserId ??= decodedToken['id']?.toString();
        _username = decodedToken['username']?.toString() ?? decodedToken['user_login']?.toString();
        debugPrint('DEBUG SOCKET: [3] Resolved currentUserId=$_currentUserId');
      }
      
      final uri = Uri.parse(Environment.localBaseUrl);
      final socketUrl = '${uri.scheme}://${uri.host}${uri.hasPort ? ':${uri.port}' : ''}/chat';
      debugPrint('DEBUG SOCKET: [4] Connecting to URL: $socketUrl');
      
      _socket = io.io(socketUrl, io.OptionBuilder()
        .setTransports(['websocket'])
        .setAuth({'token': token})
        .enableAutoConnect()
        .build());

      _socket!.onAny((event, data) {
        debugPrint('DEBUG SOCKET ANY: event=$event, data=$data');
      });

      _socket!.onConnect((_) {
        debugPrint('DEBUG SOCKET: [5] CONNECTED SUCCESSFULLY. ID: ${_socket!.id}');
        if (_activeChatId != null) {
          debugPrint('DEBUG SOCKET: [6] Joining room: $_activeChatId');
          _socket!.emit('joinRoom', {'chatId': _activeChatId});
        }
      });

      _socket!.onConnectError((err) {
        debugPrint('DEBUG SOCKET ERROR: $err');
      });

      _socket!.onDisconnect((reason) {
        debugPrint('DEBUG SOCKET DISCONNECTED: $reason');
      });

      // Move listeners inside connect() after socket initialization
      _socket!.on('newMessage', (data) {
        debugPrint('DEBUG SOCKET: Incoming newMessage event: $data');
        _messageStreamController.add(data);
      });

      _socket!.on('userTyping', (data) {
        debugPrint('DEBUG SOCKET: Incoming userTyping event: $data');
        _typingStreamController.add(data);
      });

      _socket!.on('messageSeen', (data) {
        debugPrint('DEBUG SOCKET: Incoming messageSeen event: $data');
        _seenStreamController.add(data);
      });

      _socket!.on('chatArchived', (data) {
        debugPrint('DEBUG SOCKET: Incoming chatArchived event: $data');
        _archiveStreamController.add(data);
      });

    } catch (e, stack) {
      debugPrint('DEBUG SOCKET CRASH: $e');
      debugPrint('DEBUG SOCKET STACK: $stack');
    }
  }

  void joinChatRoom(String chatId) {
    _activeChatId = chatId;
    if (_socket != null && _socket!.connected) {
      debugPrint('DEBUG SOCKET: Joining room $chatId');
      _socket!.emit('joinRoom', {'chatId': chatId});
    } else {
      debugPrint('DEBUG SOCKET: Queued room join for $chatId (waiting for connection)');
    }
  }

  void leaveChatRoom(String chatId) {
    if (_activeChatId == chatId) _activeChatId = null;
    if (_socket == null || !_socket!.connected) return;
    debugPrint('DEBUG SOCKET: Leaving room $chatId');
    _socket!.emit('leaveRoom', {'chatId': chatId});
  }

  // Deprecated: use messageStream instead
  void onNewMessage(Function(dynamic) callback) {
    messageStream.listen(callback);
  }

  void sendTypingStatus(String chatId, bool isTyping) {
    if (_socket == null || !_socket!.connected) return;
    _socket!.emit('typing', {
      'chatId': chatId,
      'isTyping': isTyping,
      'username': _username ?? 'User',
      'userId': _currentUserId,
    });
  }

  void sendMessageSeen(String chatId, String messageId) {
    if (_socket == null || !_socket!.connected) return;
    _socket!.emit('messageSeen', {
      'chatId': chatId,
      'messageId': messageId,
      'userId': _currentUserId,
    });
  }

  // Deprecated: use typingStream instead
  void onUserTyping(Function(dynamic) callback) {
    typingStream.listen(callback);
  }

  // Deprecated: use seenStream instead
  void onMessageSeen(Function(dynamic) callback) {
    seenStream.listen(callback);
  }

  void disconnect() {
    _socket?.disconnect();
    _socket = null;
  }
  
  bool get isConnected => _socket?.connected ?? false;
}
