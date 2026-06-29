import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Pet } from '../../profile/entities/pet.entity';

@Entity('pet_vet_visits')
export class VetVisit {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ name: 'pet_id', type: 'bigint' })
  petId: number;

  @Column('varchar', { name: 'clinic_name' })
  clinicName: string;

  @Column('varchar', { name: 'vet_name', nullable: true })
  vetName: string | null;

  @Column('datetime', { name: 'date_time' })
  dateTime: Date;

  @Column('varchar')
  reason: string;

  @Column('text', { nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Pet, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pet_id' })
  pet: Pet;
}
