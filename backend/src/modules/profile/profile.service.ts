import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProfile } from '../auth/entities/client-profile.entity';
import { User } from '../auth/entities/user.entity';
import { Pet } from './entities/pet.entity';
import { CreatePetDto } from './dto/create-pet.dto';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(ClientProfile)
    private profileRepository: Repository<ClientProfile>,
    @InjectRepository(Pet)
    private petRepository: Repository<Pet>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async updateStatus(userId: number, status: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.availabilityStatus = status;
    return this.userRepository.save(user);
  }

  async getProfile(userId: number) {
    let profile = await this.profileRepository.findOne({
      where: { userId },
      relations: ['user'], // Includes user anchor details
    });

    if (!profile) {
      // Create a default profile if it doesn't exist
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) throw new NotFoundException('User not found');
      
      profile = this.profileRepository.create({
        userId,
        fullName: user.username || 'User',
      });
      profile = await this.profileRepository.save(profile);
      profile.user = user;
    }

    const pets = await this.petRepository.find({
      where: { ownerId: userId },
    });

    return {
      profile,
      pets,
    };
  }

  async updateProfile(userId: number, dto: any) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user) {
      if (dto.firstName !== undefined) user.firstName = dto.firstName;
      if (dto.lastName !== undefined) user.lastName = dto.lastName;
      if (dto.dob !== undefined) user.dob = (dto.dob ? new Date(dto.dob) : null) as any;
      if (dto.sex !== undefined) user.sex = dto.sex;
      if (dto.address !== undefined) user.address = dto.address;
      if (dto.city !== undefined) user.city = dto.city;
      if (dto.country !== undefined) user.country = dto.country;
      if (dto.mobileNumber !== undefined) user.mobileNumber = dto.mobileNumber;
      await this.userRepository.save(user);
    }

    let profile = await this.profileRepository.findOne({ where: { userId } });
    if (!profile) {
      profile = this.profileRepository.create({ userId, fullName: '' });
    }

    if (dto.firstName !== undefined || dto.lastName !== undefined) {
      const newFirstName = dto.firstName !== undefined ? dto.firstName : (user ? user.firstName : '');
      const newLastName = dto.lastName !== undefined ? dto.lastName : (user ? user.lastName : '');
      profile.fullName = `${newFirstName} ${newLastName}`.trim();
    }

    if (dto.bio !== undefined) {
      profile.notes = dto.bio;
    }

    if (dto.mobileNumber !== undefined) {
      profile.mobileNumber = dto.mobileNumber;
    } else if (dto.phone !== undefined) {
      profile.mobileNumber = dto.phone;
    }

    await this.profileRepository.save(profile);

    return this.profileRepository.findOne({
      where: { userId },
      relations: ['user'],
    });
  }

  async addPet(userId: number, dto: CreatePetDto) {
    const { weight, ...rest } = dto;
    const pet = this.petRepository.create({
      ...rest,
      weight: (weight !== undefined && weight !== null && weight !== '') ? parseFloat(String(weight)) : undefined,
      ownerId: userId,
    });
    return this.petRepository.save(pet);
  }

  async updatePet(userId: number, petId: number, dto: Partial<CreatePetDto>) {
    const pet = await this.petRepository.findOne({
      where: { id: petId, ownerId: userId },
    });

    if (!pet) {
      throw new NotFoundException('Pet not found or unauthorized');
    }

    const { weight, ...rest } = dto;
    Object.assign(pet, {
      ...rest,
      ...(weight !== undefined ? { weight: (weight !== null && weight !== '') ? parseFloat(String(weight)) : null } : {}),
    });
    return this.petRepository.save(pet);
  }

  async deletePet(userId: number, petId: number) {
    const pet = await this.petRepository.findOne({
      where: { id: petId, ownerId: userId },
    });

    if (!pet) {
      throw new NotFoundException('Pet not found or unauthorized');
    }

    // Soft Delete (DeleteDateColumn will update 'deleted_at')
    return this.petRepository.softRemove(pet);
  }
}
