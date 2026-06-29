import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Pet } from '../../profile/entities/pet.entity';

@Entity('pet_vaccine_logs')
export class VaccineLog {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ name: 'pet_id', type: 'bigint' })
  petId: number;

  @Column()
  name: string;

  @Column('datetime', { name: 'administered_date' })
  administeredDate: Date;

  @Column('datetime', { name: 'next_due_date', nullable: true })
  nextDueDate: Date | null;

  @Column('varchar', { nullable: true })
  veterinarian: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Pet, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pet_id' })
  pet: Pet;
}
