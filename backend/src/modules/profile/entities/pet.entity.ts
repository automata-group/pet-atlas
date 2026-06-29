import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('pets')
export class Pet {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ name: 'owner_id', type: 'bigint' })
  ownerId: number;

  @Column({ name: 'photo_url', nullable: true })
  photoUrl: string;

  @Column()
  name: string;

  @Column({ type: 'date', nullable: true })
  dob: Date;

  @Column({ type: 'enum', enum: ['Male', 'Female'], nullable: true })
  sex: string;

  @Column({ nullable: true })
  type: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weight: number;

  @Column({ nullable: true })
  breed: string;

  @Column({ default: false })
  neutered: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'activity_log', type: 'json', nullable: true })
  activityLog: { action: string; date: Date; details?: string }[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'owner_id' })
  owner: User;
}
