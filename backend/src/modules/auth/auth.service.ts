import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import * as jwt from 'jsonwebtoken';
import { User } from './entities/user.entity';
import { ClientProfile } from './entities/client-profile.entity';
import { UserSession } from './entities/user-session.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(ClientProfile)
    private profileRepository: Repository<ClientProfile>,
    @InjectRepository(UserSession)
    private sessionRepository: Repository<UserSession>,
  ) {}

  async loginWithWordPress(username: string, password: String) {
    try {
      const wpBaseUrl = process.env.WP_BASE_URL || 'https://petatlas-news.com';
      const params = new URLSearchParams();
      params.append('username', username);
      params.append('password', password as string);

      const response = await axios.post(`${wpBaseUrl}/wp-json/jwt-auth/v1/token`, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
        }
      });

      const token = response.data.token;
      
      // Decode token to get user info (using secret to verify if possible, but WP secret might differ)
      // For JIT sync, we trust the WP response
      const decoded: any = jwt.decode(token);
      const wpUser = decoded.data?.user || decoded.user || decoded;
      const wpUserId = parseInt(wpUser.id || decoded.sub || decoded.id, 10);
      
      // Extract data with priority: 
      // 1. Response body fields (returned by typical WP JWT plugins)
      // 2. Token payload fields
      // 3. Fallback to passed username
      // Explicitly taking data from the fields you highlighted in the WordPress response:
      const wpEmail = response.data.user_email;
      const wpDisplayName = response.data.user_display_name || response.data.user_nicename;
      
      const email = wpEmail || wpUser.user_email || decoded.email || '';
      const displayName = wpDisplayName || wpUser.user_display_name || wpUser.user_login || username;
      
      console.log(`DEBUG: Syncing User ${wpUserId} - WP Name: ${wpDisplayName}, Final Name: ${displayName}`);
      
      const roles = decoded.data?.roles || decoded.roles || [];

      // Ensure wpUserId is a valid number
      if (isNaN(wpUserId)) {
        throw new Error('Invalid WordPress User ID in token');
      }

      // Sync user with the actual display name
      // Priority: 1. Display Name (Human), 2. Nicename (Slug), 3. Input Username
      const user = await this.syncUserProfile(wpUserId, displayName, email, roles);

      // Create a login session
      await this.createSession(user.id);

      // Update user status to Online
      user.availabilityStatus = 'Online';
      await this.userRepository.save(user);

      return {
        token,
        user: {
          ...user,
          roleId: user.roleId || (user as any).role_id
        },
      };
    } catch (error: any) {
      console.error('DEBUG: WordPress Auth Error:', error.response?.data || error.message);
      
      const responseData = error.response?.data;
      const isSecurityBlock = 
        (error.response?.status === 403 && (typeof responseData === 'string' || !responseData?.code)) || 
        (typeof responseData === 'string' && (
          responseData.includes('<!DOCTYPE') || 
          responseData.includes('aiowps-unlock') ||
          responseData.includes('blocked for security reasons') ||
          responseData.includes('<strong>ERROR</strong>')
        ));

      if (isSecurityBlock) {
        throw new UnauthorizedException('err_security_block_bot');
      }

      console.error('REAL AUTH ERROR:', error);
      throw new UnauthorizedException(error.response?.data?.message || error.message || 'Authentication failed');
    }
  }

  async createSession(userId: number, deviceInfo?: string, ipAddress?: string) {
    const session = this.sessionRepository.create({
      userId,
      deviceInfo,
      ipAddress,
      isActive: true,
    });
    return this.sessionRepository.save(session);
  }

  // Just-In-Time (JIT) sync from WordPress Token identity
  async syncUserProfile(wpUserId: number, username: string, email: string, wpRoles: string[] = []) {
    // 1. Determine local role ID from WordPress roles
    let roleId = 5; // Default: Client
    const hasRole = wpRoles.length > 0;
    if (wpRoles.includes('administrator')) {
      roleId = 1;
    } else if (wpRoles.includes('consultant')) {
      roleId = 2; // Explicit consultant role
    } else if (wpRoles.includes('operation_manager') || wpRoles.includes('shop_manager')) {
      roleId = 3;
    } else if (wpRoles.includes('editor') || wpRoles.includes('vet') || wpRoles.includes('doctor')) {
      roleId = 4; // Editor/Vet maps to local Vet role (4)
    }

    // 2. Check if user already anchored in our system (Check by ID or Email to prevent duplicates)
    const queryConditions: any[] = [];
    if (wpUserId && wpUserId !== 0) {
      queryConditions.push({ id: wpUserId });
    }
    if (email && email.trim() !== '') {
      queryConditions.push({ email });
    }

    if (queryConditions.length === 0) {
      throw new Error('لا يمكن البحث عن مستخدم بدون معرف أو بريد إلكتروني');
    }

    let user = await this.userRepository.findOne({
      where: queryConditions,
    });

    if (!user) {
      if (!wpUserId || wpUserId === 0) {
        throw new Error('لا يمكن إنشاء مستخدم جديد بدون معرف وورد بريس صحيح. الرجاء التأكد من وجود الحساب في وورد بريس.');
      }
      // 3. Provision User Anchor row matching WordPress ID
      user = this.userRepository.create({
        id: wpUserId,
        username,
        email,
        roleId,
      });
      user = await this.userRepository.save(user);

      // PDF Page 4: Ensure first chat with official center is created
      await this.ensureOfficialChat(user.id);

      // 4. Provision Profile metadata node
      const profile = this.profileRepository.create({
        userId: user.id,
        fullName: username,
      });
      await this.profileRepository.save(profile);
    } else {
      // 5. Anchor check: If user was found by email but has a different ID, update the ID to match WordPress
      if (wpUserId && wpUserId !== 0 && Number(user.id) !== Number(wpUserId)) {
        if (email && email.trim() !== '') {
          console.log(`DEBUG: Updating user ID from ${user.id} to ${wpUserId} to match WordPress`);
          await this.userRepository.query('UPDATE users SET id = ? WHERE email = ?', [wpUserId, email]);
          user.id = wpUserId;
        }
      }

      // 6. Identity Update: Ensure email, username and role are current
      let changed = false;
      
      const cleanUsername = (username || '').trim();
      const cleanEmail = (email || '').trim();
      const currentUsername = (user.username || '').trim();
      const currentEmail = (user.email || '').trim();

      // Email Sync
      if (cleanEmail && cleanEmail !== currentEmail) {
        console.log(`DEBUG: Updating email for user ${user.id} from "${currentEmail}" to "${cleanEmail}"`);
        user.email = cleanEmail;
        changed = true;
      }

      // Username Protection & Sync
      const isNewNameGeneric = !cleanUsername || cleanUsername.toLowerCase() === 'user';
      const isCurrentNameGeneric = !currentUsername || currentUsername.toLowerCase() === 'user';

      if (cleanUsername && !isNewNameGeneric && currentUsername !== cleanUsername) {
        console.log(`DEBUG: Updating username for user ${user.id} from "${currentUsername}" to "${cleanUsername}"`);
        user.username = cleanUsername;
        // Also update firstName if it's currently generic or empty
        if (!user.firstName || user.firstName.trim().toLowerCase() === 'user') {
          user.firstName = cleanUsername;
        }
        changed = true;
      } else if (isCurrentNameGeneric && !isNewNameGeneric && cleanUsername) {
        console.log(`DEBUG: Recovering generic username for user ${user.id} to "${cleanUsername}"`);
        user.username = cleanUsername;
        user.firstName = cleanUsername;
        changed = true;
      }

      if (changed) {
        user = await this.userRepository.save(user);
        console.log(`DEBUG: User ${user.id} updated successfully in DB`);
      }

      // 7. Profile Identity Sync: Ensure profile fullName matches
      try {
        let profile = await this.profileRepository.findOne({ where: { userId: user.id } });
        if (!profile) {
          profile = this.profileRepository.create({
            userId: user.id,
            fullName: user.username,
          });
          await this.profileRepository.save(profile);
        } else {
          const isProfileGeneric = !profile.fullName || profile.fullName.toLowerCase() === 'user';
          if (!isNewNameGeneric && (isProfileGeneric || profile.fullName !== username)) {
            profile.fullName = username;
            await this.profileRepository.save(profile);
          }
        }
      } catch (e) {
        console.error('DEBUG: Profile Sync Error:', e.message);
      }

      // Role Protection: Only update role if current local role is default (5) or if WP role is higher priority
      const isLocalHighPrivilege = user.roleId >= 1 && user.roleId <= 4;
      if (!isLocalHighPrivilege && hasRole && user.roleId !== roleId) {
        user.roleId = roleId;
        changed = true;
      }

      if (changed) {
        user = await this.userRepository.save(user);
      }
    }

    return user;
  }

  private async ensureOfficialChat(userId: number) {
    try {
      const officialListing = await this.userRepository.query(
        'SELECT owner_id FROM listing_items WHERE is_official = 1 LIMIT 1'
      );
      
      if (!officialListing || officialListing.length === 0) return;
      const officialOwnerId = officialListing[0].owner_id;

      const existing = await this.userRepository.query(
        `SELECT g.id FROM chat_groups g 
         JOIN chat_members m1 ON g.id = m1.group_id 
         JOIN chat_members m2 ON g.id = m2.group_id 
         WHERE g.group_type = 'vet_consult' AND m1.user_id = ? AND m2.user_id = ?`,
        [userId, officialOwnerId]
      );

      if (existing.length === 0) {
        // Create the room
        const group = await this.userRepository.query(
          'INSERT INTO chat_groups (group_name, group_type) VALUES (?, ?)',
          ['Pet-Atlas Official Support', 'vet_consult']
        );
        const groupId = group.insertId;

        // Add the client + admin
        await this.userRepository.query(
          'INSERT IGNORE INTO chat_members (group_id, user_id, role_in_group) VALUES (?, ?, ?), (?, ?, ?)',
          [groupId, userId, 'member', groupId, officialOwnerId, 'admin']
        );

        // ✅ Add ALL consultants (role_id = 2) to the room
        const consultants = await this.userRepository.query(
          'SELECT id FROM users WHERE role_id = 2'
        );
        for (const consultant of consultants) {
          await this.userRepository.query(
            'INSERT IGNORE INTO chat_members (group_id, user_id, role_in_group) VALUES (?, ?, ?)',
            [groupId, consultant.id, 'member']
          );
        }

        // Send welcome message
        await this.userRepository.query(
          'INSERT INTO messages (group_id, sender_id, type, content) VALUES (?, ?, ?, ?)',
          [groupId, officialOwnerId, 'Text', 'Welcome to Pet-Atlas! How can we help your pet today?']
        );
      } else {
        // Room exists — make sure all current consultants are members (handles new consultants added later)
        const groupId = existing[0].id;
        const consultants = await this.userRepository.query(
          'SELECT id FROM users WHERE role_id = 2'
        );
        for (const consultant of consultants) {
          await this.userRepository.query(
            'INSERT IGNORE INTO chat_members (group_id, user_id, role_in_group) VALUES (?, ?, ?)',
            [groupId, consultant.id, 'member']
          );
        }
      }
    } catch (e) {
      console.error('Failed to auto-create official chat:', e.message);
    }
  }

  async terminateSessions(userId: number) {
    await this.sessionRepository.update({ userId, isActive: true }, { isActive: false });
  }

  async updateUser(user: User) {
    return this.userRepository.save(user);
  }
}
