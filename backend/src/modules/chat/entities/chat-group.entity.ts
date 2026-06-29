import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Message } from './message.entity';

@Entity('chat_groups')
export class ChatGroup {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ name: 'group_name' })
  name: string;

  @Column({
    name: 'group_type',
    type: 'enum',
    enum: ['announcement', 'community', 'vet_consult'],
    default: 'community',
  })
  type: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Consultation claiming system
  @Column({ name: 'claimed_by', type: 'bigint', nullable: true })
  claimedBy: number | null;

  @Column({ name: 'claimed_at', type: 'datetime', nullable: true })
  claimedAt: Date | null;

  @Column({
    type: 'enum',
    enum: ['open', 'archived'],
    default: 'open',
  })
  status: string;

  @Column({ name: 'closed_at', type: 'datetime', nullable: true })
  closedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => Message, (message) => message.groupId)
  messages: Message[];
}

