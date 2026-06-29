import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('client_profiles')
export class ClientProfile {
  @PrimaryColumn({ name: 'user_id', type: 'bigint' })
  userId: number;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ type: 'date', nullable: true })
  dob: Date;

  @Column({ type: 'enum', enum: ['Male', 'Female', 'Other'], nullable: true })
  sex: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  country: string;

  @Column({ name: 'mobile_number', nullable: true })
  mobileNumber: string;

  @Column({ name: 'payment_details', type: 'text', nullable: true })
  paymentDetails: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @OneToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
