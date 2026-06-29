import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Pet } from '../../profile/entities/pet.entity';

@Entity('pet_medication_logs')
export class MedicationLog {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ name: 'pet_id', type: 'bigint' })
  petId: number;

  @Column()
  name: string;

  @Column()
  dosage: string;

  @Column()
  frequency: string;

  @Column('datetime', { name: 'start_date' })
  startDate: Date;

  @Column('datetime', { name: 'end_date', nullable: true })
  endDate: Date | null;

  @Column('text', { nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Pet, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pet_id' })
  pet: Pet;
}
