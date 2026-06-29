import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSubscription } from './entities/user-subscription.entity';
import axios from 'axios';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(UserSubscription)
    private userSubscriptionRepository: Repository<UserSubscription>,
  ) {}

  async getStatus(userId: number) {
    const subscription = await this.userSubscriptionRepository.findOne({
      where: { userId },
      order: { id: 'DESC' }, // Latest subscription
    });

    if (!subscription) {
      return { status: 'inactive', message: 'No active subscription found' };
    }

    return subscription;
  }

  async subscribe(userId: number, planId: number) {
    // 1. Check existing subscription
    const existing = await this.getStatus(userId);
    if (existing && existing.status === 'active') {
      throw new BadRequestException('User already has an active subscription');
    }

    const consumerKey = process.env.WC_CONSUMER_KEY;
    const consumerSecret = process.env.WC_CONSUMER_SECRET;
    
    if (!consumerKey || !consumerSecret) {
      throw new BadRequestException('WooCommerce API credentials are not configured');
    }

    const authHeader = 'Basic ' + Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    const productId = parseInt(process.env.WC_PRODUCT_ID || '1787', 10);

    let orderId = '';
    let paymentUrl = '';

    try {
      const response = await axios.post(
        'https://pet-atlas.com/wp-json/wc/v3/orders',
        {
          payment_method: 'myfatoorah',
          payment_method_title: 'MyFatoorah',
          set_paid: false,
          line_items: [
            {
              product_id: productId,
              quantity: 1,
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: authHeader,
          },
        },
      );

      orderId = response.data.id.toString();
      paymentUrl = response.data.payment_url || `https://pet-atlas.com/checkout/order-pay/${orderId}/?key=${response.data.order_key}`;
      console.log(`WooCommerce Order Created successfully: ID ${orderId}, URL ${paymentUrl}`);
    } catch (error) {
      console.error('Error creating WooCommerce order:', error.response?.data || error.message);
      throw new BadRequestException('Failed to create payment order on WooCommerce');
    }

    // 2. Create or update user subscription record as inactive
    let subscription = await this.userSubscriptionRepository.findOne({
      where: { userId, status: 'inactive' },
      order: { id: 'DESC' },
    });

    if (!subscription) {
      subscription = this.userSubscriptionRepository.create({
        userId,
        planId,
        orderId,
        status: 'inactive',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 Days interval
        autoRenew: true,
      });
    } else {
      subscription.orderId = orderId;
      subscription.planId = planId;
      subscription.currentPeriodStart = new Date();
      subscription.currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }

    const saved = await this.userSubscriptionRepository.save(subscription);

    return {
      id: saved.id,
      userId: saved.userId,
      planId: saved.planId,
      orderId: saved.orderId,
      status: saved.status,
      currentPeriodStart: saved.currentPeriodStart,
      currentPeriodEnd: saved.currentPeriodEnd,
      autoRenew: saved.autoRenew,
      paymentUrl,
    };
  }

  async confirm(userId: number, orderId?: string) {
    let subscription: UserSubscription | null;
    if (orderId) {
      subscription = await this.userSubscriptionRepository.findOne({
        where: { userId, orderId },
      });
    } else {
      subscription = await this.userSubscriptionRepository.findOne({
        where: { userId, status: 'inactive' },
        order: { id: 'DESC' },
      });
    }

    if (!subscription) {
      throw new NotFoundException('No pending subscription found to confirm');
    }

    const targetOrderId = orderId || subscription.orderId;
    if (!targetOrderId) {
      throw new BadRequestException('No order ID associated with this subscription');
    }

    const consumerKey = process.env.WC_CONSUMER_KEY;
    const consumerSecret = process.env.WC_CONSUMER_SECRET;
    
    if (!consumerKey || !consumerSecret) {
      throw new BadRequestException('WooCommerce API credentials are not configured');
    }

    const authHeader = 'Basic ' + Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

    try {
      const response = await axios.put(
        `https://pet-atlas.com/wp-json/wc/v3/orders/${targetOrderId}`,
        {
          status: 'completed',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: authHeader,
          },
        },
      );
      console.log(`WooCommerce Order ${targetOrderId} set to completed:`, response.data.status);
    } catch (error) {
      console.error('Error confirming WooCommerce order:', error.response?.data || error.message);
      throw new BadRequestException('Failed to confirm payment status with WooCommerce');
    }

    subscription.status = 'active';
    subscription.currentPeriodStart = new Date();
    subscription.currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    return this.userSubscriptionRepository.save(subscription);
  }

  async cancelAutoRenew(userId: number) {
    const subscription = await this.userSubscriptionRepository.findOne({
      where: { userId, status: 'active' },
    });

    if (!subscription) {
      throw new NotFoundException('No active subscription found to cancel');
    }

    subscription.autoRenew = false;
    return this.userSubscriptionRepository.save(subscription);
  }

  // Cron Job logic handler (To be called from a scheduler)
  async processAutoRenewals() {
    const expiringSubscriptions = await this.userSubscriptionRepository
      .createQueryBuilder('sub')
      .where('sub.currentPeriodEnd <= NOW()')
      .andWhere('sub.autoRenew = true')
      .andWhere('sub.status = :status', { status: 'active' })
      .getMany();

    for (const sub of expiringSubscriptions) {
      // 1. Trigger Payment Gateway deduction trigger
      // log: console.log(`Deducting payment for User ${sub.userId}`);
      
      // 2. Extend Dates node
      sub.currentPeriodStart = new Date();
      sub.currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); 
      await this.userSubscriptionRepository.save(sub);
    }

    return { renewed: expiringSubscriptions.length };
  }

  async forceActivateSubscription(userId: number, planId = 2) {
    let subscription = await this.userSubscriptionRepository.findOne({
      where: { userId },
      order: { id: 'DESC' },
    });

    if (!subscription) {
      subscription = this.userSubscriptionRepository.create({
        userId,
        planId,
        orderId: 'ADMIN_FREE_BYPASS',
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year free bypass
        autoRenew: false,
      });
    } else {
      subscription.planId = planId;
      subscription.orderId = 'ADMIN_FREE_BYPASS';
      subscription.status = 'active';
      subscription.currentPeriodStart = new Date();
      subscription.currentPeriodEnd = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
      subscription.autoRenew = false;
    }

    return this.userSubscriptionRepository.save(subscription);
  }

  async forceCancelSubscription(userId: number) {
    const subscription = await this.userSubscriptionRepository.findOne({
      where: { userId },
      order: { id: 'DESC' },
    });

    if (!subscription) {
      throw new NotFoundException('No subscription found for this user');
    }

    subscription.status = 'inactive';
    subscription.autoRenew = false;
    return this.userSubscriptionRepository.save(subscription);
  }

  async getAllSubscribers() {
    return this.userSubscriptionRepository.find({
      relations: ['user'],
      order: { id: 'DESC' },
    });
  }

  async getAdminStats() {
    const all = await this.userSubscriptionRepository.find();
    
    // Revenue mapping
    const prices = { 1: 0, 2: 49, 3: 149 };
    
    const stats = {
      totalRevenue: all.reduce((sum, s) => sum + (s.status === 'active' ? (prices[s.planId] || 0) : 0), 0),
      activePaid: all.filter(s => s.status === 'active' && s.planId > 1).length,
      totalSubscribers: all.length,
      tierDistribution: {
        basic: all.filter(s => s.planId === 1).length,
        pro: all.filter(s => s.planId === 2).length,
        premium: all.filter(s => s.planId === 3).length,
      }
    };

    return stats;
  }
}
