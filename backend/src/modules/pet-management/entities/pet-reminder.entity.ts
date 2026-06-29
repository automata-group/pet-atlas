import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Pet } from '../../profile/entities/pet.entity';

@Entity('pet_reminders')
export class PetReminder {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ name: 'pet_id', type: 'bigint' })
  petId: number;

  @Column('varchar')
  title: string;

  @Column({ type: 'enum', enum: ['medication', 'vaccine', 'vet_visit', 'other'] })
  type: string;

  @Column('datetime', { name: 'date_time' })
  dateTime: Date;

  @Column({ name: 'is_completed', default: false })
  isCompleted: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Pet, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pet_id' })
  pet: Pet;
}
