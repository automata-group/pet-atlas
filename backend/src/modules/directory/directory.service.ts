import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ListingItem } from './entities/listing-item.entity';
import { ConsultantTeamMember } from './entities/consultant-team-member.entity';
import { SystemSetting } from './entities/system-setting.entity';
import { ServiceSection } from './entities/service-section.entity';

@Injectable()
export class DirectoryService {
  constructor(
    @InjectRepository(ListingItem)
    private listingRepository: Repository<ListingItem>,
    @InjectRepository(ConsultantTeamMember)
    private teamRepository: Repository<ConsultantTeamMember>,
    @InjectRepository(SystemSetting)
    private systemSettingRepository: Repository<SystemSetting>,
    @InjectRepository(ServiceSection)
    private serviceSectionRepository: Repository<ServiceSection>,
  ) {}

  async getSystemSetting(key: string, defaultValue = 'true'): Promise<string> {
    try {
      const setting = await this.systemSettingRepository.findOne({ where: { key } });
      return setting ? setting.value : defaultValue;
    } catch (err) {
      return defaultValue;
    }
  }

  async setSystemSetting(key: string, value: string): Promise<SystemSetting> {
    let setting = await this.systemSettingRepository.findOne({ where: { key } });
    if (setting) {
      setting.value = value;
    } else {
      setting = this.systemSettingRepository.create({ key, value });
    }
    return this.systemSettingRepository.save(setting);
  }


  async getTeamMembers(listingId: number) {
    return this.teamRepository.find({
      where: { listingId },
      relations: ['user']
    });
  }

  async addTeamMember(requesterId: number, listingId: number, userId: number, role: string) {
    const listing = await this.listingRepository.findOne({ where: { id: listingId } });
    if (!listing) throw new NotFoundException('Listing not found');

    // Only owner can add team members
    if (listing.ownerId !== requesterId) {
      throw new Error('Only the owner can manage team members');
    }

    const member = this.teamRepository.create({
      listingId,
      userId,
      role: role || 'Responder'
    });

    return this.teamRepository.save(member);
  }

  async removeTeamMember(requesterId: number, listingId: number, userId: number) {
    const listing = await this.listingRepository.findOne({ where: { id: listingId } });
    if (!listing) throw new NotFoundException('Listing not found');

    if (listing.ownerId !== requesterId) {
      throw new Error('Only the owner can manage team members');
    }

    return this.teamRepository.delete({ listingId, userId });
  }

  // Spatial Distance Lookup (Find Nearest Clinics/Vets)
  async getNearestListings(
    type: string, 
    userLat: number, 
    userLon: number, 
    radius = 50000, 
    limit = 20,
    filters: { isOfficial?: boolean; priceRange?: string; sortBy?: 'distance' | 'rating' } = {}
  ) {
    // radius is in meters (default 50km)
    const query = this.listingRepository.createQueryBuilder('listing')
      .where('listing.listingType = :type', { type });

    if (filters.isOfficial !== undefined) {
      query.andWhere('listing.isOfficial = :isOfficial', { isOfficial: filters.isOfficial });
    }

    if (filters.priceRange && filters.priceRange !== 'Any') {
      query.andWhere('listing.priceRange = :priceRange', { priceRange: filters.priceRange });
    }

    query.addSelect(`ST_Distance_Sphere(listing.coordinates, POINT(${userLat}, ${userLon}))`, 'listing_distance')
      .having('listing_distance <= :radius', { radius });

    if (filters.sortBy === 'rating') {
      query.orderBy('listing.avgStars', 'DESC');
    } else {
      query.orderBy('listing_distance', 'ASC');
    }

    query.limit(limit);

    const { entities, raw } = await query.getRawAndEntities();
    
    // Map the distance from raw result back to entities
    return entities.map((entity, index) => {
      return {
        ...entity,
        distance: raw[index].listing_distance,
      };
    });
  }

  async getAllListings() {
    return this.listingRepository.find();
  }

  async getListingDetails(id: number) {
    const listing = await this.listingRepository.findOne({ where: { id } });
    if (!listing) {
      throw new NotFoundException('Listing not found');
    }
    return listing;
  }

  // Create listing
  async addListing(userId: number, dto: any) {
    const listing = this.listingRepository.create({
      ...dto,
      ownerId: dto.ownerId || userId,
    });

    const savedListing = await this.listingRepository.save(listing);
    return this.getListingDetails((savedListing as any).id);
  }



  async getMyListings(ownerId: number) {
    return this.listingRepository.find({
      where: { ownerId },
    });
  }

  async updateListing(requesterId: number, id: number, dto: any) {
    const listing = await this.listingRepository.findOne({ where: { id } });
    if (!listing) throw new NotFoundException('Listing not found');

    if (Number(listing.ownerId) !== Number(requesterId)) {
      throw new Error('Only the owner can update this listing');
    }

    const updated = this.listingRepository.merge(listing, dto);
    return this.listingRepository.save(updated);
  }

  // Service Sections CRUD Operations
  async getServiceSections(onlyActive = false) {
    try {
      const whereClause = onlyActive ? { isActive: true } : {};
      return await this.serviceSectionRepository.find({ where: whereClause, order: { id: 'ASC' } });
    } catch (err) {
      // Return hardcoded fallbacks if the database table is not migrated/created yet
      const fallbackServices = [
        { id: 1, titleEn: 'Clinics', titleAr: 'العيادات', iconName: 'medical_services', baseColor: '#2196F3', listingType: 'Clinic', isActive: true },
        { id: 2, titleEn: 'Vets', titleAr: 'الأطباء البيطريين', iconName: 'vaccines', baseColor: '#4CAF50', listingType: 'Vet', isActive: true },
        { id: 3, titleEn: 'Grooming', titleAr: 'الحلاقة والعناية', iconName: 'content_cut', baseColor: '#FF9800', listingType: 'Grooming', isActive: true },
        { id: 4, titleEn: 'Pet Care', titleAr: 'مستلزمات الحيوانات', iconName: 'pets', baseColor: '#9C27B0', listingType: 'Shop', isActive: true }
      ];
      return fallbackServices;
    }
  }

  async createServiceSection(dto: any) {
    const section = this.serviceSectionRepository.create({
      titleEn: dto.titleEn,
      titleAr: dto.titleAr,
      iconName: dto.iconName,
      baseColor: dto.baseColor || '#2196F3',
      listingType: dto.listingType,
      isActive: dto.isActive !== undefined ? dto.isActive : true
    });
    return this.serviceSectionRepository.save(section);
  }

  async updateServiceSection(id: number, dto: any) {
    const section = await this.serviceSectionRepository.findOne({ where: { id } });
    if (!section) throw new NotFoundException('Service section not found');
    const updated = this.serviceSectionRepository.merge(section, dto);
    return this.serviceSectionRepository.save(updated);
  }

  async deleteServiceSection(id: number) {
    const section = await this.serviceSectionRepository.findOne({ where: { id } });
    if (!section) throw new NotFoundException('Service section not found');
    return this.serviceSectionRepository.remove(section);
  }
}
