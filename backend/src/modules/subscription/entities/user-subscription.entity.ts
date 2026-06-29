import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('user_subscriptions')
export class UserSubscription {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: number;

  @Column({ name: 'plan_id' })
  planId: number;

  @Column({ name: 'order_id', type: 'varchar', length: 255, nullable: true })
  orderId: string;

  @Column({ name: 'status', type: 'enum', enum: ['active', 'inactive', 'canceled', 'past_due'] })
  status: string;

  @Column({ name: 'current_period_start', type: 'timestamp', nullable: true })
  currentPeriodStart: Date;

  @Column({ name: 'current_period_end', type: 'timestamp', nullable: true })
  currentPeriodEnd: Date;

  @Column({ name: 'trial_end', type: 'timestamp', nullable: true })
  trialEnd: Date;

  @Column({ name: 'auto_renew', default: true })
  autoRenew: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
