import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('listing_items')
export class ListingItem {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ name: 'category_id' })
  categoryId: number;

  @Column({ name: 'owner_id', type: 'bigint' })
  ownerId: number;

  @Column({ name: 'logo_url', nullable: true })
  logoUrl: string;

  @Column({ name: 'gallery_urls', type: 'json', nullable: true })
  galleryUrls: string[];

  @Column({ type: 'json', nullable: true })
  services: { name: string; description: string; price: number }[];

  @Column({ name: 'price_range', nullable: true })
  priceRange: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({ 
    name: 'listing_type', 
    type: 'enum', 
    enum: ['Clinic', 'Vet', 'Insurance', 'Shop', 'Grooming', 'MobileClinic', 'PetSitter', 'Boarding', 'Event'] 
  })
  listingType: string;

  @Column({ name: 'item_metadata', type: 'json', nullable: true })
  itemMetadata: any;

  @Column({ type: 'json', nullable: true })
  equipments: string[];

  @Column({ name: 'contact_number', nullable: true })
  contactNumber: string;

  @Column({ name: 'website_url', nullable: true })
  websiteUrl: string;

  // Spatial POINT - mapped as raw geometry to coordinate buffers
  // Note: Coordinates will be serialized as {x: lat, y: lon} in JSON if handled by ST_AsText query or custom transformer
  // Transformer to handle MySQL POINT <-> JSON mapping
  static pointTransformer = {
    to: (value: { lat: number; lon: number } | null) => {
      if (!value) return null;
      return `POINT(${value.lat} ${value.lon})`; // WKT format for standard ST_GeomFromText
    },
    from: (value: any) => {
      // Handling the raw value from the database (varies by driver)
      if (!value) return null;
      if (typeof value === 'string') return value; // Already a string/WKT
      return value; // Depends on driver configuration (mysql2 returns varied formats)
    },
  };

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    nullable: true,
    transformer: ListingItem.pointTransformer,
  })
  coordinates: { lat: number; lon: number } | null;

  @Column('text')
  address: string;

  @Column({ name: 'avg_stars', type: 'decimal', precision: 3, scale: 2, default: 0.0 })
  avgStars: number;

  @Column({ name: 'is_official', type: 'boolean', default: false })
  isOfficial: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'owner_id' })
  owner: User;
}
