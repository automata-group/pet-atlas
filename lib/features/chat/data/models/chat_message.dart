import 'package:flutter/foundation.dart';

class ChatMessage {
  final String id;
  final String chatId;
  final String senderId;
  final String type; // 'Text', 'Photo', 'Voice', 'Video', 'Location'
  final String content;
  final String? photoUrl;
  final String? voiceUrl;
  final String? videoUrl;
  final String? hash;
  final DateTime createdAt;

  ChatMessage({
    required this.id,
    required this.chatId,
    required this.senderId,
    required this.type,
    required this.content,
    this.photoUrl,
    this.voiceUrl,
    this.videoUrl,
    this.hash,
    required this.createdAt,
  });

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    debugPrint('DEBUG MODEL: Parsing message JSON: $json');
    try {
      return ChatMessage(
        id: json['id'].toString(),
        chatId: (json['chatId'] ?? json['groupId'] ?? json['group_id'] ?? '').toString(),
        senderId: (json['senderId'] ?? json['sender_id'] ?? '').toString(),
        type: json['type'] ?? 'Text',
        content: json['content'] ?? '',
        photoUrl: json['photoUrl'] ?? json['photo_url'],
        voiceUrl: json['voiceUrl'] ?? json['voice_url'],
        videoUrl: json['videoUrl'] ?? json['video_url'],
        hash: json['hash'],
        createdAt: DateTime.parse(json['createdAt'] ?? json['created_at']),
      );
    } catch (e) {
      debugPrint('DEBUG MODEL ERROR: Failed to parse ChatMessage: $e');
      rethrow;
    }
  }
}
