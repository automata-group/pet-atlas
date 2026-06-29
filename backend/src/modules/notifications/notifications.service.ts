import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getAllNotifications() {
    return this.notificationRepository.find({
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async broadcast(title: string, message: string, target: string, type: string) {
    // 1. Save the broadcast "record" (we'll save it with userId: 0 as a global log)
    const broadcastLog = this.notificationRepository.create({
      userId: 0,
      title,
      message,
      type,
    });
    await this.notificationRepository.save(broadcastLog);

    // 2. Actually send to all users (or targeted group)
    const users = await this.userRepository.find();
    const notifications = users.map(user => ({
      userId: user.id,
      title,
      message,
      type,
    }));

    await this.notificationRepository.save(notifications);
    return { success: true, count: users.length };
  }

  async getMyNotifications(userId: number) {
    return this.notificationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 20,
    });
  }

  async markAsRead(userId: number, notificationId: number) {
    await this.notificationRepository.update(
      { id: notificationId, userId },
      { isRead: true },
    );
    return { success: true };
  }

  async createNotification(userId: number, title: string, message: string, type = 'general') {
    const notification = this.notificationRepository.create({
      userId,
      title,
      message,
      type,
    });
    return this.notificationRepository.save(notification);
  }
}
