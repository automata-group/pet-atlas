import { Injectable, InternalServerErrorException, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserSession } from './entities/user-session.entity';
import { AuthService } from './auth.service';
import axios from 'axios';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserSession)
    private sessionRepository: Repository<UserSession>,
    private authService: AuthService,
  ) {}

  async getAllUsers() {
    const users = await this.userRepository.find({
      select: ['id', 'username', 'email', 'roleId', 'firstName', 'lastName', 'city', 'availabilityStatus', 'createdAt'],
      order: { createdAt: 'DESC' },
    });

    const subscriptions = await this.userRepository.query('SELECT user_id, status, plan_id FROM user_subscriptions').catch(() => []);
    const subMap = new Map();
    for (const sub of subscriptions) {
      subMap.set(Number(sub.user_id), { status: sub.status, planId: sub.plan_id });
    }

    return users.map(user => ({
      ...user,
      subscription: subMap.get(Number(user.id)) || { status: 'inactive', planId: null }
    }));
  }

  async createUser(body: { username: string, email: string, roleId: number, password?: string }) {
    const wpBaseUrl = process.env.WP_BASE_URL || 'https://pet-atlas.com';
    const regUrl = `${wpBaseUrl}/wp-json/app/v1/register`;
    
    console.log(`DEBUG: Admin creating user ${body.username} (${body.email})`);
    
    try {
      let wpUserId: number | null = null;

      try {
        const wpResponse = await axios.post(regUrl, {
          username: body.username,
          email: body.email,
          password: body.password || 'Pass123!@#',
        }, {
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
          }
        });
        wpUserId = wpResponse.data.id || wpResponse.data.user_id || wpResponse.data.userId;
        console.log(`DEBUG: WP Registration Success. Full Data:`, wpResponse.data);
        console.log(`DEBUG: WP Registration Success, ID: ${wpUserId}`);
      } catch (e: any) {
        const wpError = e.response?.data;
        if (wpError?.code === 'user_exists' || wpError?.code === 'existing_user_login' || wpError?.code === 'existing_user_email') {
          console.log(`DEBUG: User exists in WP. Attempting background login-sync...`);
          try {
            // Attempt login to trigger JIT sync and get the user
            const loginRes = await this.authService.loginWithWordPress(body.username, body.password || 'Pass123!@#');
            return loginRes.user;
          } catch (loginError: any) {
            console.error('DEBUG: Background Sync Login Failed:', loginError.message);
            if (wpError?.code === 'existing_user_login') {
              throw new ConflictException('اسم المستخدم هذا مستخدم بالفعل. يرجى اختيار اسم مستخدم آخر.');
            } else if (wpError?.code === 'existing_user_email') {
              throw new ConflictException('البريد الإلكتروني هذا مسجل بالفعل. يرجى استخدام بريد آخر أو تسجيل الدخول.');
            } else {
              throw new ConflictException('اسم المستخدم أو البريد الإلكتروني مسجل بالفعل. يرجى التحقق من البيانات أو تسجيل الدخول.');
            }
          }
        } else {
          console.error('DEBUG: WordPress Registration Failed:', wpError || e.message);
          throw new BadRequestException(wpError?.message || 'فشل التسجيل في وورد بريس. تأكد من صحة البيانات.');
        }
      }

      // 2. Sync to local database
      // If wpUserId is still null but they existed in WP, syncUserProfile will attempt email-based sync
      // but it works better with an ID. 
      // If wpUserId is null, we pass 0 or a placeholder? No, let's try to get the user from WP if possible.
      
      try {
        return await this.authService.syncUserProfile(
          wpUserId || 0, // 0 means "find by email only" in sync logic
          body.username, 
          body.email, 
          body.roleId === 4 ? ['vet'] : body.roleId === 2 ? ['consultant'] : ['customer']
        );
      } catch (syncError: any) {
        console.error('DEBUG: Local Sync Failed:', syncError);
        throw new InternalServerErrorException(`فشل المزامنة المحلية: ${syncError.message}`);
      }
    } catch (e) {
      if (e instanceof BadRequestException || e instanceof InternalServerErrorException || e instanceof ConflictException) {
        throw e;
      }
      console.error('DEBUG: CreateUser Unexpected Error:', e);
      throw new InternalServerErrorException('حدث خطأ غير متوقع أثناء إنشاء الحساب');
    }
  }

  async getStats() {
    const totalUsers   = await this.userRepository.count();
    const admins       = await this.userRepository.count({ where: { roleId: 1 } });
    const consultants  = await this.userRepository.count({ where: { roleId: 2 } });
    const clients      = await this.userRepository.count({ where: { roleId: 5 } });

    // Aggregate chats, bookings, listings via raw queries
    const [chatResult]    = await this.userRepository.query('SELECT COUNT(*) as cnt FROM chat_groups').catch(() => [{ cnt: 0 }]);
    const [bookingResult] = await this.userRepository.query('SELECT COUNT(*) as cnt FROM bookings').catch(() => [{ cnt: 0 }]);
    const [listingResult] = await this.userRepository.query('SELECT COUNT(*) as cnt FROM listing_items').catch(() => [{ cnt: 0 }]);
    const [pendingResult] = await this.userRepository.query("SELECT COUNT(*) as cnt FROM bookings WHERE status = 'PENDING'").catch(() => [{ cnt: 0 }]);
    const [activeConsults] = await this.userRepository.query(
      "SELECT COUNT(*) as cnt FROM chat_groups WHERE group_type = 'vet_consult' AND status != 'archived'"
    ).catch(() => [{ cnt: 0 }]);

    return {
      users: {
        total: totalUsers,
        admins,
        consultants,
        clients,
      },
      chats:          parseInt(chatResult?.cnt ?? 0),
      bookings:       parseInt(bookingResult?.cnt ?? 0),
      listings:       parseInt(listingResult?.cnt ?? 0),
      pendingBookings: parseInt(pendingResult?.cnt ?? 0),
      activeConsults:  parseInt(activeConsults?.cnt ?? 0),
    };
  }

  async getSessions() {
    return this.sessionRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async removeUser(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }
    return this.userRepository.softRemove(user);
  }
}
