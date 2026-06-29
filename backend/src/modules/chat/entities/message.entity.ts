import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ name: 'group_id', type: 'bigint' })
  groupId: number;

  @Column({ name: 'sender_id', type: 'bigint' })
  senderId: number;

  @Column({ type: 'enum', enum: ['Text', 'Photo', 'Voice', 'Video', 'Location'], default: 'Text' })
  type: string;

  @Column('text')
  content: string;

  @Column({ name: 'photo_url', nullable: true })
  photoUrl: string;

  @Column({ name: 'voice_url', nullable: true })
  voiceUrl: string;

  @Column({ name: 'video_url', nullable: true })
  videoUrl: string;

  @Column({ nullable: true })
  hash: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sender_id' })
  sender: User;
}
