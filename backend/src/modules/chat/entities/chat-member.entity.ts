import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { ChatGroup } from './chat-group.entity';

@Entity('chat_members')
export class ChatMember {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ name: 'group_id', type: 'bigint' })
  groupId: number;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: number;

  @Column({
    name: 'role_in_group',
    type: 'enum',
    enum: ['admin', 'member', 'speaker'],
    default: 'member',
  })
  role: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => ChatGroup)
  @JoinColumn({ name: 'group_id' })
  group: ChatGroup;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
