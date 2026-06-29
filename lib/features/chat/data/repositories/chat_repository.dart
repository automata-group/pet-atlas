import '../../../../core/network/api_client.dart';
import '../models/chat_group.dart';
import '../models/chat_message.dart';

class ChatRepository {
  final LocalApiClient _apiClient;

  ChatRepository({required LocalApiClient apiClient}) : _apiClient = apiClient;

  Future<List<ChatGroup>> getMyChats() async {
    try {
      final response = await _apiClient.dio.get('/chats/my');
      if (response.data is List) {
        return (response.data as List)
            .map((json) => ChatGroup.fromJson(json))
            .toList();
      }
      return [];
    } catch (e) {
      rethrow;
    }
  }

  Future<List<ChatMessage>> getChatMessages(String chatId, {int limit = 50}) async {
    try {
      final response = await _apiClient.dio.get('/chats/$chatId/messages', queryParameters: {
        'limit': limit,
      });
      if (response.data is List) {
        return (response.data as List)
            .map((json) => ChatMessage.fromJson(json))
            .toList();
      }
      return [];
    } catch (e) {
      rethrow;
    }
  }

  Future<ChatMessage> sendMessage(
    String chatId, 
    String content, {
    String type = 'Text',
    String? photoUrl,
    String? voiceUrl,
    String? videoUrl,
  }) async {
    try {
      final response = await _apiClient.dio.post('/chats/$chatId/messages', data: {
        'content': content,
        'type': type,
        'photoUrl': photoUrl,
        'voiceUrl': voiceUrl,
        'videoUrl': videoUrl,
      });
      return ChatMessage.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> uploadFile(String filePath) async {
    try {
      final formData = await _apiClient.createFormData({'file': filePath});
      final response = await _apiClient.dio.post('/chats/upload', data: formData);
      return response.data;
    } catch (e) {
      rethrow;
    }
  }

  Future<ChatGroup> startConsultation(int consultantId, String consultantName) async {
    try {
      final response = await _apiClient.dio.post('/chats/consult', data: {
        'consultantId': consultantId,
        'consultantName': consultantName,
      });
      return ChatGroup.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }
}
