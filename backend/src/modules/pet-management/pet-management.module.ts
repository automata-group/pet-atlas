import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pet } from '../profile/entities/pet.entity';
import { DiaryEntry } from './entities/diary-entry.entity';
import { PetReminder } from './entities/pet-reminder.entity';
import { WeightLog } from './entities/weight-log.entity';
import { MedicationLog } from './entities/medication-log.entity';
import { VetVisit } from './entities/vet-visit.entity';
import { VaccineLog } from './entities/vaccine-log.entity';
import { PetManagementController } from './pet-management.controller';
import { PetManagementService } from './pet-management.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Pet,
      DiaryEntry,
      PetReminder,
      WeightLog,
      MedicationLog,
      VetVisit,
      VaccineLog,
    ]),
  ],
  controllers: [PetManagementController],
  providers: [PetManagementService],
  exports: [PetManagementService],
})
export class PetManagementModule {}
