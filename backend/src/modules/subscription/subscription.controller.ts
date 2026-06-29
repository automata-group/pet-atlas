import { Controller, Get, Post, Body, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard) // Protect all routes
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get('status')
  @HttpCode(HttpStatus.OK)
  async getStatus(@Req() req) {
    return this.subscriptionService.getStatus(req.user.id);
  }

  @Post('subscribe')
  @HttpCode(HttpStatus.CREATED)
  async subscribe(@Req() req, @Body('planId') planId: number) {
    return this.subscriptionService.subscribe(req.user.id, planId);
  }

  @Post('confirm')
  @HttpCode(HttpStatus.OK)
  async confirm(@Req() req, @Body('orderId') orderId?: string) {
    return this.subscriptionService.confirm(req.user.id, orderId);
  }

  @Post('cancel')
  @HttpCode(HttpStatus.OK)
  async cancel(@Req() req) {
    return this.subscriptionService.cancelAutoRenew(req.user.id);
  }

  // Trigger manually for testing or wire up to Cron
  @Post('process-renewals')
  @HttpCode(HttpStatus.OK)
  async processRenewals() {
    return this.subscriptionService.processAutoRenewals();
  }

  @Get('all')
  @UseGuards(RolesGuard)
  @Roles(1)
  @HttpCode(HttpStatus.OK)
  async getAllSubscribers() {
    return this.subscriptionService.getAllSubscribers();
  }

  @Get('admin/stats')
  @UseGuards(RolesGuard)
  @Roles(1)
  @HttpCode(HttpStatus.OK)
  async getAdminStats() {
    return this.subscriptionService.getAdminStats();
  }

  @Post('admin/force-activate')
  @UseGuards(RolesGuard)
  @Roles(1)
  @HttpCode(HttpStatus.OK)
  async forceActivate(@Body() body: { userId: number; planId?: number }) {
    return this.subscriptionService.forceActivateSubscription(body.userId, body.planId || 2);
  }

  @Post('admin/force-cancel')
  @UseGuards(RolesGuard)
  @Roles(1)
  @HttpCode(HttpStatus.OK)
  async forceCancel(@Body() body: { userId: number }) {
    return this.subscriptionService.forceCancelSubscription(body.userId);
  }
}

