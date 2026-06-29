import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { ListingItem } from '../../directory/entities/listing-item.entity';

@Entity('consultant_team_members')
export class ConsultantTeamMember {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ name: 'listing_id', type: 'bigint' })
  listingId: number;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: number;

  @Column({ default: 'responder' }) // responder, admin, etc.
  role: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => ListingItem)
  @JoinColumn({ name: 'listing_id' })
  listing: ListingItem;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
