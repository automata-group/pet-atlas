import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AdminService } from './admin.service';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { ClientProfile } from './entities/client-profile.entity';
import { UserSession } from './entities/user-session.entity';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, ClientProfile, UserSession]),
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('WP_JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AdminService, JwtStrategy],
  exports: [AuthService, JwtStrategy],
})
export class AuthModule { }
