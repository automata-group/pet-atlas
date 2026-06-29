import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { ListingItem } from '../../directory/entities/listing-item.entity';
import { Pet } from '../../profile/entities/pet.entity';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: number;

  @Column({ name: 'listing_id', type: 'bigint' })
  listingId: number;

  @Column({ name: 'pet_id', type: 'bigint', nullable: true })
  petId: number;

  @Column({ name: 'selected_services', type: 'json' })
  selectedServices: { name: string; price: number }[];

  @Column({ name: 'total_price', type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalPrice: number;

  @Column({ name: 'booking_date', type: 'datetime' })
  bookingDate: Date;

  @Column({
    type: 'enum',
    enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'],
    default: 'PENDING',
  })
  status: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => ListingItem)
  @JoinColumn({ name: 'listing_id' })
  listing: ListingItem;

  @ManyToOne(() => Pet)
  @JoinColumn({ name: 'pet_id' })
  pet: Pet;
}
