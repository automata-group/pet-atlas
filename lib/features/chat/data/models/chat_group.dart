import 'chat_message.dart';

class ChatGroup {
  final String id;
  final String name;
  final String type; // 'announcement', 'community', 'vet_consult'
  final String? description;
  final ChatMessage? lastMessage;
  final String status;
  final int unreadCount;

  ChatGroup({
    required this.id,
    required this.name,
    required this.type,
    this.status = 'open',
    this.description,
    this.lastMessage,
    this.unreadCount = 0,
  });

  factory ChatGroup.fromJson(Map<String, dynamic> json) {
    return ChatGroup(
      id: json['id'].toString(),
      name: json['name'] ?? json['group_name'] ?? 'Unknown',
      type: json['type'] ?? json['group_type'] ?? 'community',
      status: json['status'] ?? 'open',
      description: json['description'],
      lastMessage: json['lastMessage'] != null 
          ? ChatMessage.fromJson(json['lastMessage']) 
          : null,
      unreadCount: json['unreadCount'] ?? 0,
    );
  }
}
