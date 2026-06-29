import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { ProfileModule } from './modules/profile/profile.module';
import { DirectoryModule } from './modules/directory/directory.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { ChatModule } from './modules/chat/chat.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { BookingModule } from './modules/booking/booking.module';
import { BlogModule } from './modules/blog/blog.module';
import { PetManagementModule } from './modules/pet-management/pet-management.module';
import { SeedService } from './seed.service';
import { User } from './modules/auth/entities/user.entity';
import { Role } from './modules/auth/entities/role.entity';
import { ChatGroup } from './modules/chat/entities/chat-group.entity';
import { ChatMember } from './modules/chat/entities/chat-member.entity';
import { Message } from './modules/chat/entities/message.entity';
import { ListingItem } from './modules/directory/entities/listing-item.entity';
import { ConsultantTeamMember } from './modules/directory/entities/consultant-team-member.entity';

@Module({
  imports: [
    // 0. Config Module (Global env loading)
    ConfigModule.forRoot({
      isGlobal: true,
    }),


    // 1. Database Connection (MariaDB/MySQL)
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOST || 'localhost',
      port: process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT, 10) : 3306,
      username: process.env.DATABASE_USER || 'root',
      password: process.env.DATABASE_PASSWORD || '',
      database: process.env.DATABASE_NAME || 'pet_atlas',
      autoLoadEntities: true, // Load @Entity decorators automatically
      synchronize: false, // Reverted to false to avoid TypeORM index crashes
    }),

    // 2. Rate Limiting: 10 requests per 60 seconds per IP
    ThrottlerModule.forRoot([
      {
        ttl: 60000, 
        limit: 10,
      },
    ]),

    // 3. Auth & SaaS Module
    AuthModule,

    // 4. Client & Pet Profile Module
    ProfileModule,

    // 5. Directory & Spatial Search Module
    DirectoryModule,

    // 6. Subscriptions & Billing Module
    SubscriptionModule,

    // 7. Chat & Community Module
    ChatModule,

    // 8. Notifications Module
    NotificationsModule,

    // 9. Bookings Module
    BookingModule,

    // 10. Blog Module
    BlogModule,

    // 12. Pet Management Module
    PetManagementModule,

    // 11. Feature Repositories for SeedService
    TypeOrmModule.forFeature([
      User,
      Role,
      ChatGroup,
      ChatMember,
      Message,
      ListingItem,
      ConsultantTeamMember,
    ]),
  ],
  controllers: [AppController],
  providers: [AppService, SeedService],
})
export class AppModule {}
