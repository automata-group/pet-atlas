import { Entity, PrimaryColumn, Column, CreateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Role } from './role.entity';

@Entity('users')
export class User {
  @PrimaryColumn({ type: 'bigint' })
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'role_id', default: 5 }) // Default to client
  roleId: number;

  @Column({ name: 'first_name', nullable: true })
  firstName: string;

  @Column({ name: 'last_name', nullable: true })
  lastName: string;

  @Column({ type: 'date', nullable: true })
  dob: Date;

  @Column({ type: 'enum', enum: ['Male', 'Female'], nullable: true })
  sex: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  country: string;

  @Column({ name: 'mobile_number', nullable: true })
  mobileNumber: string;

  @Column({ 
    name: 'availability_status', 
    type: 'enum', 
    enum: ['Online', 'Offline', 'Busy'], 
    default: 'Offline' 
  })
  availabilityStatus: string;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date;
}
