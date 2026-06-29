import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Pet } from '../../profile/entities/pet.entity';

@Entity('pet_diary_entries')
export class DiaryEntry {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ name: 'pet_id', type: 'bigint' })
  petId: number;

  @Column('varchar')
  title: string;

  @Column('text')
  content: string;

  @Column('datetime')
  date: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Pet, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pet_id' })
  pet: Pet;
}
