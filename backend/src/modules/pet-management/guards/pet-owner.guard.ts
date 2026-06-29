import { CanActivate, ExecutionContext, Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pet } from '../../profile/entities/pet.entity';

@Injectable()
export class PetOwnerGuard implements CanActivate {
  constructor(
    @InjectRepository(Pet)
    private petRepository: Repository<Pet>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;
    const petIdStr = request.params.petId;

    if (!userId) {
      throw new ForbiddenException('User is not authenticated');
    }

    if (!petIdStr) {
      return true; // Let requests that do not require petId pass, or handle in route
    }

    const petId = parseInt(petIdStr, 10);
    if (isNaN(petId)) {
      throw new NotFoundException('Invalid pet ID');
    }

    const pet = await this.petRepository.findOne({ where: { id: petId } });
    if (!pet) {
      throw new NotFoundException('Pet not found');
    }

    if (Number(pet.ownerId) !== Number(userId)) {
      throw new ForbiddenException('You do not own this pet');
    }

    // Attach pet to request for potential downstream reuse
    request.pet = pet;
    return true;
  }
}
