import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: 'chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('ChatGateway');

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string },
  ) {
    client.join(data.chatId);
    this.logger.log(`Client ${client.id} joined room: ${data.chatId}`);
    return { event: 'joinedRoom', data: data.chatId };
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string; isTyping: boolean; username: string; userId: string },
  ) {
    this.logger.log(`Typing event in room ${data.chatId} from ${data.username}: ${data.isTyping}`);
    // Broadcast to ALL in the room including sender (so all parties see the indicator)
    this.server.to(data.chatId).emit('userTyping', {
      chatId: data.chatId,
      userId: data.userId,
      username: data.username || 'User',
      isTyping: data.isTyping,
    });
  }

  @SubscribeMessage('messageSeen')
  handleMessageSeen(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string; messageId: string; userId: string },
  ) {
    this.logger.log(`DEBUG: Received messageSeen event from client ${client.id}`);
    this.logger.log(`DEBUG: data.chatId=${data.chatId}, data.messageId=${data.messageId}, data.userId=${data.userId}`);
    
    const payload = {
      chatId: String(data.chatId),
      messageId: String(data.messageId),
      userId: String(data.userId),
      seenAt: new Date(),
    };
    
    this.server.to(String(data.chatId)).emit('messageSeen', payload);
    this.logger.log(`DEBUG: Broadcasted messageSeen to room ${data.chatId}`);
  }

  // Called from ChatService after a message is saved to DB
  broadcastNewMessage(chatId: string, message: any) {
    const normalized = {
      id: message.id?.toString(),
      chatId: chatId,
      groupId: chatId,
      senderId: message.senderId?.toString(),
      sender_id: message.senderId?.toString(),
      type: message.type,
      content: message.content,
      photoUrl: message.photoUrl,
      voiceUrl: message.voiceUrl,
      createdAt: message.createdAt,
    };
    this.server.to(chatId).emit('newMessage', normalized);
    this.logger.log(`Broadcasted new message to room: ${chatId}`);
  }
}

