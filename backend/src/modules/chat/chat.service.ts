import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { ChatGroup } from './entities/chat-group.entity';
import { ChatMember } from './entities/chat-member.entity';
import { ChatTyping } from './entities/chat-typing.entity';
import { ChatRead } from './entities/chat-read.entity';
import { SecurityUtil } from '../../common/utils/security.util';

import { ChatGateway } from './chat.gateway';
import { ListingItem } from '../directory/entities/listing-item.entity';
import { ConsultantTeamMember } from '../directory/entities/consultant-team-member.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatGroup)
    private groupRepository: Repository<ChatGroup>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(ChatMember)
    private memberRepository: Repository<ChatMember>,
    @InjectRepository(ChatTyping)
    private typingRepository: Repository<ChatTyping>,
    @InjectRepository(ChatRead)
    private readRepository: Repository<ChatRead>,
    @InjectRepository(ListingItem)
    private listingRepository: Repository<ListingItem>,
    @InjectRepository(ConsultantTeamMember)
    private teamRepository: Repository<ConsultantTeamMember>,
    private chatGateway: ChatGateway,
    private notificationsService: NotificationsService,
  ) {}

  async getAllChatsForAdmin() {
    // PDF Req: Admin can monitor and see all chats
    const groups = await this.groupRepository.find({
      order: { createdAt: 'DESC' }
    });

    return Promise.all(groups.map(async (group) => {
      const lastMessage = await this.messageRepository.findOne({
        where: { groupId: group.id },
        order: { createdAt: 'DESC' },
        relations: ['sender']
      });
      const memberCount = await this.memberRepository.count({
        where: { groupId: group.id }
      });
      return {
        ...group,
        lastMessage,
        memberCount
      };
    }));
  }

  async getMyChats(userId: number, roleId?: number, includeArchived = false) {
    const memberships = await this.memberRepository.find({
      where: { userId },
      relations: ['group'],
    });

    const chatsWithLastMessage = await Promise.all(
      memberships.map(async (membership) => {
        const group = membership.group;
        if (!group) return null;

        // Filter by archive status unless explicitly requested
        if (!includeArchived && group.status === 'archived') return null;
        if (includeArchived && group.status !== 'archived') return null;

        // === CONSULTANT FILTERING: Shared Inbox Logic ===
        if (roleId === 2 && group.type === 'vet_consult') {
          const claimedBy = (group as any).claimedBy;
          const isUnclaimed = !claimedBy;
          const isClaimedByMe = Number(claimedBy) === Number(userId);
          if (!isUnclaimed && !isClaimedByMe) return null; // Hidden from this consultant
        }

        const lastMessage = await this.messageRepository.findOne({
          where: { groupId: membership.groupId },
          order: { createdAt: 'DESC' },
        });
        return {
          ...group,
          lastMessage,
        };
      }),
    );

    return chatsWithLastMessage.filter(Boolean);
  }

  async getMessages(groupId: number, limit = 50) {
    return this.messageRepository.find({
      where: { groupId },
      order: { createdAt: 'DESC' }, // Latest first
      take: limit, // 'take' is TypeORM's limit for find()
      relations: ['sender'],
    });
  }

  async sendMessage(userId: number, groupId: number, dto: any, roleId?: number | string) {
    const group = await this.groupRepository.findOne({ where: { id: groupId } });
    if (!group) throw new Error('Chat group not found');

    if (group.status === 'archived') {
      throw new Error('This consultation has been closed and archived.');
    }

    if (group.type === 'announcement') {
      if (roleId !== 1 && roleId !== '1') {
        throw new Error('Only admins can send messages to announcement channels');
      }
    }

    if (group.type === 'community') {
      if (dto.type !== 'Voice' && dto.type !== 'Text' && dto.type !== 'Video') {
        throw new Error('Only Text, Voice, and Video messages are allowed in community channels');
      }
    }

    // === CONSULTATION CLAIMING SYSTEM ===
    if (group.type === 'vet_consult') {
      const numRoleId = Number(roleId);
      const claimedBy = (group as any).claimedBy;

      // Only consultants (2) are subject to claiming restrictions
      if (numRoleId === 2) {
        if (!claimedBy) {
          // 🟢 UNCLAIMED — this consultant claims it NOW
          await this.groupRepository.query(
            'UPDATE chat_groups SET claimed_by = ?, claimed_at = NOW() WHERE id = ?',
            [userId, groupId]
          );
          // Remove all OTHER consultants from the room (they should no longer see it)
          await this.memberRepository.query(
            `DELETE FROM chat_members
             WHERE group_id = ?
             AND user_id != ?
             AND user_id IN (SELECT id FROM users WHERE role_id = 2)`,
            [groupId, userId]
          );
        } else if (Number(claimedBy) !== Number(userId)) {
          // 🔴 CLAIMED BY ANOTHER CONSULTANT — block
          throw new Error('This consultation has already been claimed by another consultant.');
        }
        // else: claimed by me — allow
      }
      // Admins (1) and Clients (5) are NOT blocked by the claiming system
    }
    const hash = SecurityUtil.hashSHA256(dto.content || '');
    const message = this.messageRepository.create({
      ...dto,
      groupId,
      senderId: userId,
      hash,
    });
    const savedMessage = await this.messageRepository.save(message);
    
    // Broadcast the message to all clients in the room via WebSocket
    this.chatGateway.broadcastNewMessage(groupId.toString(), savedMessage);
    
    // Notify other members only for private consultations
    if (group.type === 'vet_consult') {
      const members = await this.memberRepository.find({ where: { groupId } });
      for (const member of members) {
        if (member.userId !== userId) {
          await this.notificationsService.createNotification(
            member.userId,
            'New Message',
            `New message in your consultation: ${dto.content.substring(0, 30)}${dto.content.length > 30 ? '...' : ''}`,
            'chat_message'
          );
        }
      }
    }
    
    return savedMessage;
  }

  async findOrCreateConsultation(userId: number, consultantId: number, consultantName: string) {
    let targetConsultantId = consultantId;
    let targetName = consultantName;
    let isOfficialQuery = false;

    // 1. If no consultantId provided, find the system's official consultation account
    if (!targetConsultantId || targetConsultantId === 0) {
      isOfficialQuery = true;
      const officialListing = await this.listingRepository.findOne({
        where: { isOfficial: true },
        relations: ['owner']
      });

      if (!officialListing) {
        // Fallback or create one if missing in some envs, but normally should exist
        throw new Error('Official consultation service is currently unavailable.');
      }

      targetConsultantId = Number(officialListing.ownerId);
      targetName = officialListing.title;
    }

    // 2. Find the listing owned by this consultant to get the team
    const listing = await this.listingRepository.findOne({
      where: { ownerId: targetConsultantId }
    });

    // 3. Check if a private consult already exists
    const existingGroup = await this.memberRepository.query(`
      SELECT gm1.group_id 
      FROM chat_members gm1
      JOIN chat_members gm2 ON gm1.group_id = gm2.group_id
      JOIN chat_groups cg ON gm1.group_id = cg.id
      WHERE gm1.user_id = ? 
      AND gm2.user_id = ? 
      AND cg.group_type = 'vet_consult'
      LIMIT 1
    `, [userId, targetConsultantId]);

    if (existingGroup.length > 0) {
      const group = await this.groupRepository.findOne({ where: { id: existingGroup[0].group_id } });
      // If the group is OPEN, return it. If it is ARCHIVED, we MUST create a new one (New Page)
      if (group && group.status === 'open') {
        return group;
      }
    }
 
    // 4. Create new group if not exists
    const newGroup = await this.groupRepository.save({
      name: `Consultation: ${targetName}`,
      type: 'vet_consult',
    });

    // 5. Find team members for this listing
    const teamMembers = listing ? await this.teamRepository.find({
      where: { listingId: listing.id }
    }) : [];

    // 6. Build member list: User + Consultant + Team
    const memberIds = new Set<number>();
    memberIds.add(userId);
    memberIds.add(targetConsultantId);
    teamMembers.forEach(m => memberIds.add(Number(m.userId)));

    if (isOfficialQuery) {
      // Add all active consultants to the shared official queue
      const allConsultants = await this.memberRepository.query("SELECT id FROM users WHERE role_id = 2");
      allConsultants.forEach((c: any) => memberIds.add(Number(c.id)));
    }

    // 7. Save members
    const membersToSave = Array.from(memberIds).map(uid => ({
      userId: uid,
      groupId: newGroup.id
    }));

    await this.memberRepository.save(membersToSave);

    // 8. Notify Consultant and Team
    for (const uid of Array.from(memberIds)) {
      if (uid !== userId) {
        await this.notificationsService.createNotification(
          uid,
          'New Consultation Request',
          `You have a new consultation request from User #${userId}`,
          'consultation_request'
        );
      }
    }

    return newGroup;
  }

  // --- TYPING STATUS ---
  async setTypingStatus(groupId: number, userId: number, isTyping: boolean, username?: string) {
    let status = await this.typingRepository.findOne({ where: { groupId, userId } });
    if (status) {
      status.isTyping = isTyping;
      await this.typingRepository.save(status);
    } else {
      status = this.typingRepository.create({ groupId, userId, isTyping });
      await this.typingRepository.save(status);
    }
    
    // Broadcast handled by ChatGateway directly when it receives the 'typing' WS event
    return status;
  }

  // --- READ RECEIPTS ---
  async markMessageRead(messageId: number, groupId: number, userId: number) {
    let readReceipt = await this.readRepository.findOne({ where: { messageId, userId } });
    if (!readReceipt) {
      readReceipt = this.readRepository.create({ messageId, groupId, userId });
      await this.readRepository.save(readReceipt);
    }
    // Broadcast handled by ChatGateway directly when it receives the 'messageSeen' WS event
    return readReceipt;
  }

  async archiveChat(groupId: number, userId: number, roleId: number | string) {
    const group = await this.groupRepository.findOne({ where: { id: groupId } });
    if (!group) throw new Error('Chat not found');

    // Admin (1), claiming Consultant (2), or Clinic Owner (3) can archive
    const isConsultant = Number(roleId) === 2;
    const isAdmin = Number(roleId) === 1;
    const isClinicOwner = Number(roleId) === 3;

    if (isConsultant && Number(group.claimedBy) !== Number(userId)) {
      throw new Error('Only the consultant who claimed this session can end it.');
    }

    if (!isAdmin && !isConsultant && !isClinicOwner) {
      throw new Error('Permission denied.');
    }

    group.status = 'archived';
    group.closedAt = new Date();
    await this.groupRepository.save(group);

    // Broadcast 'chatArchived' event to the room
    this.chatGateway.server.to(groupId.toString()).emit('chatArchived', {
      chatId: groupId.toString(),
      status: 'archived',
      closedAt: group.closedAt
    });

    return group;
  }

  async createGroup(name: string, type: 'announcement' | 'community', description?: string) {
    const group = this.groupRepository.create({
      name,
      type,
      description,
      status: 'open',
    });
    return this.groupRepository.save(group);
  }
}
