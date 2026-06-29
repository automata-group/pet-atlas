import { Controller, Get, Post, Body, Patch, Param, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getMyNotifications(@Req() req) {
    return this.notificationsService.getMyNotifications(req.user.id);
  }

  @Get('all')
  @UseGuards(RolesGuard)
  @Roles(1)
  @HttpCode(HttpStatus.OK)
  async getAllNotifications() {
    return this.notificationsService.getAllNotifications();
  }

  @Post('broadcast')
  @UseGuards(RolesGuard)
  @Roles(1)
  @HttpCode(HttpStatus.CREATED)
  async broadcast(@Body() data: { title: string, message: string, target: string, type: string }) {
    return this.notificationsService.broadcast(data.title, data.message, data.target, data.type);
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  async markAsRead(@Req() req, @Param('id') id: string) {
    return this.notificationsService.markAsRead(req.user.id, +id);
  }
}
