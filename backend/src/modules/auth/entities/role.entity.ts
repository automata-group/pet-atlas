import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'role_name' }) // Temporarily removed unique: true to allow server start
  roleName: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
