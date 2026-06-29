import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PetOwnerGuard } from './guards/pet-owner.guard';
import { PetManagementService } from './pet-management.service';
import {
  CreateDiaryEntryDto,
  CreateReminderDto,
  UpdateReminderStatusDto,
  CreateWeightLogDto,
  CreateMedicationLogDto,
  CreateVetVisitDto,
  CreateVaccineLogDto,
} from './dto/create-pet-management.dto';

@Controller('pet-management')
@UseGuards(JwtAuthGuard, PetOwnerGuard)
export class PetManagementController {
  constructor(private readonly petManagementService: PetManagementService) {}

  @Get(':petId/overview')
  async getOverview(@Param('petId', ParseIntPipe) petId: number) {
    return this.petManagementService.getOverview(petId);
  }

  // --- Diary ---
  @Get(':petId/diary')
  async getDiary(@Param('petId', ParseIntPipe) petId: number) {
    return this.petManagementService.getDiaryEntries(petId);
  }

  @Post(':petId/diary')
  async createDiary(@Param('petId', ParseIntPipe) petId: number, @Body() dto: CreateDiaryEntryDto) {
    return this.petManagementService.createDiaryEntry(petId, dto);
  }

  @Delete(':petId/diary/:id')
  async deleteDiary(@Param('petId', ParseIntPipe) petId: number, @Param('id', ParseIntPipe) id: number) {
    return this.petManagementService.deleteDiaryEntry(petId, id);
  }

  // --- Reminders ---
  @Get(':petId/reminders')
  async getReminders(@Param('petId', ParseIntPipe) petId: number) {
    return this.petManagementService.getReminders(petId);
  }

  @Post(':petId/reminders')
  async createReminder(@Param('petId', ParseIntPipe) petId: number, @Body() dto: CreateReminderDto) {
    return this.petManagementService.createReminder(petId, dto);
  }

  @Put(':petId/reminders/:id')
  async updateReminderStatus(
    @Param('petId', ParseIntPipe) petId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReminderStatusDto,
  ) {
    return this.petManagementService.updateReminderStatus(petId, id, dto.isCompleted);
  }

  @Delete(':petId/reminders/:id')
  async deleteReminder(@Param('petId', ParseIntPipe) petId: number, @Param('id', ParseIntPipe) id: number) {
    return this.petManagementService.deleteReminder(petId, id);
  }

  // --- Weight ---
  @Get(':petId/weight')
  async getWeight(@Param('petId', ParseIntPipe) petId: number) {
    return this.petManagementService.getWeightLogs(petId);
  }

  @Post(':petId/weight')
  async createWeight(@Param('petId', ParseIntPipe) petId: number, @Body() dto: CreateWeightLogDto) {
    return this.petManagementService.createWeightLog(petId, dto);
  }

  @Delete(':petId/weight/:id')
  async deleteWeight(@Param('petId', ParseIntPipe) petId: number, @Param('id', ParseIntPipe) id: number) {
    return this.petManagementService.deleteWeightLog(petId, id);
  }

  // --- Medication ---
  @Get(':petId/meds')
  async getMeds(@Param('petId', ParseIntPipe) petId: number) {
    return this.petManagementService.getMedicationLogs(petId);
  }

  @Post(':petId/meds')
  async createMedication(@Param('petId', ParseIntPipe) petId: number, @Body() dto: CreateMedicationLogDto) {
    return this.petManagementService.createMedicationLog(petId, dto);
  }

  @Delete(':petId/meds/:id')
  async deleteMedication(@Param('petId', ParseIntPipe) petId: number, @Param('id', ParseIntPipe) id: number) {
    return this.petManagementService.deleteMedicationLog(petId, id);
  }

  // --- Vet Visits ---
  @Get(':petId/vet-visits')
  async getVetVisits(@Param('petId', ParseIntPipe) petId: number) {
    return this.petManagementService.getVetVisits(petId);
  }

  @Post(':petId/vet-visits')
  async createVetVisit(@Param('petId', ParseIntPipe) petId: number, @Body() dto: CreateVetVisitDto) {
    return this.petManagementService.createVetVisit(petId, dto);
  }

  @Delete(':petId/vet-visits/:id')
  async deleteVetVisit(@Param('petId', ParseIntPipe) petId: number, @Param('id', ParseIntPipe) id: number) {
    return this.petManagementService.deleteVetVisit(petId, id);
  }

  // --- Vaccines ---
  @Get(':petId/vaccines')
  async getVaccines(@Param('petId', ParseIntPipe) petId: number) {
    return this.petManagementService.getVaccineLogs(petId);
  }

  @Post(':petId/vaccines')
  async createVaccine(@Param('petId', ParseIntPipe) petId: number, @Body() dto: CreateVaccineLogDto) {
    return this.petManagementService.createVaccineLog(petId, dto);
  }

  @Delete(':petId/vaccines/:id')
  async deleteVaccine(@Param('petId', ParseIntPipe) petId: number, @Param('id', ParseIntPipe) id: number) {
    return this.petManagementService.deleteVaccineLog(petId, id);
  }
}
