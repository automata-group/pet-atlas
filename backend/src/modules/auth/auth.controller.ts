import { Controller, Get, Post, Body, Req, UseGuards, Delete, Param, ParseIntPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly adminService: AdminService,
  ) {}

  @Post('login')
  async login(@Body() body: any) {
    const { email, username, password } = body;
    // WordPress accepts either email or username in the 'username' field of JWT plugin
    return this.authService.loginWithWordPress(email || username, password);
  }

  @Post('register')
  async register(@Body() body: any) {
    const { username, email, password } = body;
    return this.adminService.createUser({
      username,
      email,
      password,
      roleId: 5, // Customer/Client
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req) {
    // The Guard will attach the synced local user to the request
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('sync-profile')
  async syncProfile(@Req() req, @Body() body: any) {
    const { display_name, email } = body;
    if (!display_name && !email) {
      return req.user;
    }
    // Force a rich synchronization using the data provided by the client
    return this.authService.syncUserProfile(req.user.id, display_name, email, []);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2) // Admin (1) or Consultant (2)
  @Get('consultant-check')
  async checkConsultantStatus(@Req() req) {
    return { 
      status: 'Verified', 
      message: `Welcome Consultant ${req.user.username}. Professional access granted.`,
      user: req.user
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1) // Admin only (from your SQL: 1 = admin)
  @Get('admin-test')
  async testAdminRole() {
    return { message: 'You have admin permissions on the local backend!' };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1)
  @Get('admin/users')
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1)
  @Post('admin/users')
  async createUser(@Body() body: any) {
    return this.adminService.createUser(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1)
  @Get('admin/stats')
  async getStats() {
    return this.adminService.getStats();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1)
  @Get('admin/sessions')
  async getSessions() {
    return this.adminService.getSessions();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1)
  @Delete('admin/users/:id')
  async removeUser(@Param('id', ParseIntPipe) userId: number) {
    return this.adminService.removeUser(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req) {
    await this.authService.terminateSessions(req.user.id);
    const user = req.user;
    user.availabilityStatus = 'Offline';
    await this.authService.updateUser(user);
    return { success: true };
  }
}
