import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('WP_JWT_SECRET'),
    });
  }

  // Decoded payload from WordPress JWT Plugin
  async validate(payload: any) {
    console.log('DEBUG: Decoded JWT Payload:', JSON.stringify(payload));
    
    // WordPress Typical Payload structure generally nests data inside 'data' property
    const wpUser = payload.data?.user || payload.user || payload;
    const wpUserId = parseInt(wpUser.id || payload.sub || payload.id, 10);

    console.log('DEBUG: Extracted WP User ID:', wpUserId);

    if (!wpUserId) {
      console.error('DEBUG: Failed to extract user ID from token');
      throw new UnauthorizedException('Invalid token structure from WordPress');
    }

    const username = 
      wpUser.user_login || 
      wpUser.user_nicename || 
      wpUser.display_name || 
      payload.preferred_username || 
      payload.name || 
      'User';
      
    const email = 
      wpUser.user_email || 
      payload.email || 
      '';
    
    // WordPress JWT plugin often includes roles/capabilities in the payload
    const roles = payload.data?.roles || payload.roles || [];

    // Synchronize to local anchor table just in time (JIT)
    try {
      const localUser = await this.authService.syncUserProfile(
        wpUserId,
        username,
        email,
        roles,
      );
      return localUser; // Attached to Req.user
    } catch (error) {
      console.error('DEBUG: Error in jwt.strategy validate syncUserProfile:', error);
      throw new UnauthorizedException(`Authentication failed during user sync: ${error.message}`);
    }
  }
}
