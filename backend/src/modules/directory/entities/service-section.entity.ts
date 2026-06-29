import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('service_sections')
export class ServiceSection {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'title_en', length: 100 })
  titleEn: string;

  @Column({ name: 'title_ar', length: 100 })
  titleAr: string;

  @Column({ name: 'icon_name', length: 100 })
  iconName: string;

  @Column({ name: 'base_color', length: 20, default: '#2196F3' })
  baseColor: string;

  @Column({ name: 'listing_type', length: 50 })
  listingType: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
