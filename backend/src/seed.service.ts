import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DirectoryService } from './modules/directory/directory.service';
import { ChatGroup } from './modules/chat/entities/chat-group.entity';
import { ChatMember } from './modules/chat/entities/chat-member.entity';
import { Message } from './modules/chat/entities/message.entity';
import { User } from './modules/auth/entities/user.entity';
import { Role } from './modules/auth/entities/role.entity';

import { ConsultantTeamMember } from './modules/directory/entities/consultant-team-member.entity';

import { ListingItem } from './modules/directory/entities/listing-item.entity';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  constructor(
    private readonly directoryService: DirectoryService,
    @InjectRepository(ListingItem)
    private readonly listingRepository: Repository<ListingItem>,
    @InjectRepository(ChatGroup)
    private readonly groupRepository: Repository<ChatGroup>,
    @InjectRepository(ChatMember)
    private readonly memberRepository: Repository<ChatMember>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(ConsultantTeamMember)
    private readonly teamRepository: Repository<ConsultantTeamMember>,
  ) {}

  async seedRoles() {
    console.log('Checking and cleaning roles table...');
    
    // 1. Delete empty or null role names that cause unique constraint errors
    await this.roleRepository.query('DELETE FROM roles WHERE role_name = "" OR role_name IS NULL');
    
    const existingRoles = await this.roleRepository.find();
    const roleNames = existingRoles.map(r => r.roleName);

    const defaultRoles = [
      { id: 1, name: 'Administrator' },
      { id: 2, name: 'Consultant' },
      { id: 3, name: 'Clinic/Shop Owner' },
      { id: 4, name: 'Editor' },
      { id: 5, name: 'Client' },
      { id: 6, name: 'Technical Team' },
      { id: 7, name: 'Responder' },
    ];

    for (const role of defaultRoles) {
      if (!roleNames.includes(role.name)) {
        await this.roleRepository.save(
          this.roleRepository.create({ id: role.id, roleName: role.name })
        );
      }
    }
    console.log('Roles synchronization complete.');
  }

  async seedChatData() {
    let users = await this.userRepository.find();
    
    if (users.length === 0) {
      console.log('No users found for chat seeding. Creating a dummy test user...');
      const dummyUser = await this.userRepository.save(
        this.userRepository.create({
          id: 999, 
          username: 'test_user',
          email: 'test@example.com',
          roleId: 5,
        }),
      );
      users = [dummyUser];
    }
    
    for (const targetUser of users) {
      console.log(`Seeding chat data for user: ${targetUser.username} (ID: ${targetUser.id})`);
      


      // 3. Create an Announcement Group
      const announcementGroup = await this.groupRepository.save(
        this.groupRepository.create({
          name: 'Pet-Atlas Announcements',
          type: 'announcement',
          description: 'Official announcements and news from Pet-Atlas',
        }),
      );

      await this.memberRepository.save(
        this.memberRepository.create({
          groupId: announcementGroup.id,
          userId: targetUser.id,
          role: 'member',
        }),
      );

      await this.messageRepository.save(
        this.messageRepository.create({
          groupId: announcementGroup.id,
          senderId: 1, // Admin
          type: 'Text',
          content: 'Welcome to the Pet-Atlas Announcements Channel! Stay tuned for important updates.',
        }),
      );
    }

    return { message: `Chat data seeded successfully for ${users.length} users.` };
  }

  async onApplicationBootstrap() {
    // Ensure roles are clean and exist
    await this.seedRoles();

    // Ensure default admin user (ID: 1) exists for listing ownership
    const adminUser = await this.userRepository.findOne({ where: { id: 1 } });
    if (!adminUser) {
      console.log('Seeding default administrator user (ID: 1)...');
      await this.userRepository.save(
        this.userRepository.create({
          id: 1,
          username: 'admin',
          email: 'admin@pet-atlas.com',
          roleId: 1, // Admin
          firstName: 'System',
          lastName: 'Administrator',
          availabilityStatus: 'Online',
        })
      );
    }

    // Ensure default vet user (ID: 2) exists for consultant team linking
    const vetUser = await this.userRepository.findOne({ where: { id: 2 } });
    if (!vetUser) {
      console.log('Seeding default vet user (ID: 2)...');
      await this.userRepository.save(
        this.userRepository.create({
          id: 2,
          username: 'dr_sarah',
          email: 'sarah@pet-atlas.com',
          roleId: 2, // Vet / Consultant
          firstName: 'Sarah',
          lastName: 'Thompson',
          availabilityStatus: 'Online',
        })
      );
    }

    // Check if we already have listings
    const existing = await this.directoryService.getAllListings();
    
    const shouldRefresh = existing.length > 0 && !existing[0].logoUrl;

    if (existing.length === 0 || shouldRefresh) {
      console.log('Seeding premium sample directory data...');
      
      const samples = [
        {
          title: 'Advanced Vet Care Center',
          description: 'Specialized veterinary care with modern diagnostic imaging and emergency services.',
          listingType: 'Vet',
          categoryId: 2,
          address: '456 Medical Blvd, Brooklyn, New York',
          contactNumber: '+1 212-555-0900',
          avgStars: 4.8,
          priceRange: '$$$',
          isOfficial: true,
          logoUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=200&auto=format&fit=crop',
          itemMetadata: {
            specialties: ['Surgery', 'Cardiology', 'Emergency'],
            languages: ['English', 'Spanish'],
            emergencyService: true,
          },
          coordinates: { lat: 40.6782, lon: -73.9442 },
        },
        {
          title: 'Pet Guard Insurance',
          description: 'Comprehensive pet insurance plans tailored to your needs.',
          listingType: 'Insurance',
          categoryId: 3,
          address: 'Finance Plaza, Manhattan, New York',
          contactNumber: '+1 800-PET-SAFE',
          avgStars: 4.5,
          priceRange: '$$',
          logoUrl: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=200&auto=format&fit=crop',
          itemMetadata: {
            plans: [
              { name: 'Essential', monthlyPrice: 25, coverage: 'Accidents Only', deductible: 250 },
            ],
          },
          coordinates: { lat: 40.7128, lon: -74.0060 },
        },
      ];

      for (const sample of samples) {
        try {
          await this.directoryService.addListing(1, sample);
        } catch (e) {
          console.error('Failed to seed item:', sample.title, e.message);
        }
      }
      console.log('Premium seeding complete.');

      // 4. Link other vets to the official listing to simulate the "One account, multiple consultants"
      const official = await this.listingRepository.findOne({ where: { isOfficial: true } });
      const otherVets = await this.userRepository.find({ where: { roleId: 2 } }); // roleId 2 is Vet

      if (official && otherVets.length > 0) {
        for (const vet of otherVets) {
          if (Number(vet.id) !== Number(official.ownerId)) {
            await this.teamRepository.save(
              this.teamRepository.create({
                listingId: official.id,
                userId: vet.id,
                role: 'responder'
              })
            );
          }
        }
        console.log(`Added ${otherVets.length} responders to official team.`);
      }
    }
  }
}
