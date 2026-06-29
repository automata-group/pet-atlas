import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('chat_message_reads')
export class ChatRead {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ name: 'message_id', type: 'bigint' })
  messageId: number;

  @Column({ name: 'group_id', type: 'bigint' })
  groupId: number;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: number;

  @CreateDateColumn({ name: 'read_at' })
  readAt: Date;
}
