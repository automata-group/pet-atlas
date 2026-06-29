import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pet } from '../profile/entities/pet.entity';
import { DiaryEntry } from './entities/diary-entry.entity';
import { PetReminder } from './entities/pet-reminder.entity';
import { WeightLog } from './entities/weight-log.entity';
import { MedicationLog } from './entities/medication-log.entity';
import { VetVisit } from './entities/vet-visit.entity';
import { VaccineLog } from './entities/vaccine-log.entity';
import {
  CreateDiaryEntryDto,
  CreateReminderDto,
  CreateWeightLogDto,
  CreateMedicationLogDto,
  CreateVetVisitDto,
  CreateVaccineLogDto,
} from './dto/create-pet-management.dto';

@Injectable()
export class PetManagementService {
  constructor(
    @InjectRepository(Pet)
    private petRepository: Repository<Pet>,
    @InjectRepository(DiaryEntry)
    private diaryRepository: Repository<DiaryEntry>,
    @InjectRepository(PetReminder)
    private reminderRepository: Repository<PetReminder>,
    @InjectRepository(WeightLog)
    private weightLogRepository: Repository<WeightLog>,
    @InjectRepository(MedicationLog)
    private medicationLogRepository: Repository<MedicationLog>,
    @InjectRepository(VetVisit)
    private vetVisitRepository: Repository<VetVisit>,
    @InjectRepository(VaccineLog)
    private vaccineLogRepository: Repository<VaccineLog>,
  ) {}

  // Overview / Dashboard (Diary, reminders, weight, meds, vet visits, vaccines)
  async getOverview(petId: number) {
    const pet = await this.petRepository.findOne({ where: { id: petId } });
    if (!pet) throw new NotFoundException('Pet not found');

    const recentDiary = await this.diaryRepository.find({
      where: { petId },
      order: { date: 'DESC' },
      take: 3,
    });

    const upcomingReminders = await this.reminderRepository.find({
      where: { petId, isCompleted: false },
      order: { dateTime: 'ASC' },
      take: 5,
    });

    const latestWeight = await this.weightLogRepository.findOne({
      where: { petId },
      order: { date: 'DESC' },
    });

    const medications = await this.medicationLogRepository.find({
      where: { petId },
      order: { startDate: 'DESC' },
      take: 5,
    });

    const vetVisits = await this.vetVisitRepository.find({
      where: { petId },
      order: { dateTime: 'DESC' },
      take: 5,
    });

    const vaccines = await this.vaccineLogRepository.find({
      where: { petId },
      order: { administeredDate: 'DESC' },
      take: 5,
    });

    return {
      pet,
      recentDiary,
      upcomingReminders,
      latestWeight,
      medications,
      vetVisits,
      vaccines,
    };
  }

  // --- Diary Operations ---
  async getDiaryEntries(petId: number) {
    return this.diaryRepository.find({ where: { petId }, order: { date: 'DESC' } });
  }

  async createDiaryEntry(petId: number, dto: CreateDiaryEntryDto) {
    const entry = this.diaryRepository.create({
      petId,
      title: dto.title,
      content: dto.content,
      date: dto.date ? new Date(dto.date) : new Date(),
    });
    return this.diaryRepository.save(entry);
  }

  async deleteDiaryEntry(petId: number, id: number) {
    const entry = await this.diaryRepository.findOne({ where: { id, petId } });
    if (!entry) throw new NotFoundException('Diary entry not found');
    return this.diaryRepository.remove(entry);
  }

  // --- Reminder Operations ---
  async getReminders(petId: number) {
    return this.reminderRepository.find({ where: { petId }, order: { dateTime: 'ASC' } });
  }

  async createReminder(petId: number, dto: CreateReminderDto) {
    const reminder = this.reminderRepository.create({
      petId,
      title: dto.title,
      type: dto.type,
      dateTime: new Date(dto.dateTime),
      isCompleted: false,
    });
    return this.reminderRepository.save(reminder);
  }

  async updateReminderStatus(petId: number, id: number, isCompleted: boolean) {
    const reminder = await this.reminderRepository.findOne({ where: { id, petId } });
    if (!reminder) throw new NotFoundException('Reminder not found');
    reminder.isCompleted = isCompleted;
    return this.reminderRepository.save(reminder);
  }

  async deleteReminder(petId: number, id: number) {
    const reminder = await this.reminderRepository.findOne({ where: { id, petId } });
    if (!reminder) throw new NotFoundException('Reminder not found');
    return this.reminderRepository.remove(reminder);
  }

  // --- Weight Operations ---
  async getWeightLogs(petId: number) {
    return this.weightLogRepository.find({ where: { petId }, order: { date: 'DESC' } });
  }

  async createWeightLog(petId: number, dto: CreateWeightLogDto) {
    const log = this.weightLogRepository.create({
      petId,
      weight: parseFloat(String(dto.weight)),
      date: dto.date ? new Date(dto.date) : new Date(),
    });
    return this.weightLogRepository.save(log);
  }

  async deleteWeightLog(petId: number, id: number) {
    const log = await this.weightLogRepository.findOne({ where: { id, petId } });
    if (!log) throw new NotFoundException('Weight log not found');
    return this.weightLogRepository.remove(log);
  }

  // --- Medication Operations ---
  async getMedicationLogs(petId: number) {
    return this.medicationLogRepository.find({ where: { petId }, order: { startDate: 'DESC' } });
  }

  async createMedicationLog(petId: number, dto: CreateMedicationLogDto) {
    const medication = this.medicationLogRepository.create({
      petId,
      name: dto.name,
      dosage: dto.dosage,
      frequency: dto.frequency,
      startDate: new Date(dto.startDate),
      endDate: dto.endDate ? new Date(dto.endDate) : null,
      notes: dto.notes,
    });
    return this.medicationLogRepository.save(medication);
  }

  async deleteMedicationLog(petId: number, id: number) {
    const medication = await this.medicationLogRepository.findOne({ where: { id, petId } });
    if (!medication) throw new NotFoundException('Medication log not found');
    return this.medicationLogRepository.remove(medication);
  }

  // --- Vet Visit Operations ---
  async getVetVisits(petId: number) {
    return this.vetVisitRepository.find({ where: { petId }, order: { dateTime: 'DESC' } });
  }

  async createVetVisit(petId: number, dto: CreateVetVisitDto) {
    const visit = this.vetVisitRepository.create({
      petId,
      clinicName: dto.clinicName,
      vetName: dto.vetName,
      dateTime: new Date(dto.dateTime),
      reason: dto.reason,
      notes: dto.notes,
    });
    return this.vetVisitRepository.save(visit);
  }

  async deleteVetVisit(petId: number, id: number) {
    const visit = await this.vetVisitRepository.findOne({ where: { id, petId } });
    if (!visit) throw new NotFoundException('Vet visit not found');
    return this.vetVisitRepository.remove(visit);
  }

  // --- Vaccine Operations ---
  async getVaccineLogs(petId: number) {
    return this.vaccineLogRepository.find({ where: { petId }, order: { administeredDate: 'DESC' } });
  }

  async createVaccineLog(petId: number, dto: CreateVaccineLogDto) {
    const vaccine = this.vaccineLogRepository.create({
      petId,
      name: dto.name,
      administeredDate: new Date(dto.administeredDate),
      nextDueDate: dto.nextDueDate ? new Date(dto.nextDueDate) : null,
      veterinarian: dto.veterinarian,
    });
    return this.vaccineLogRepository.save(vaccine);
  }

  async deleteVaccineLog(petId: number, id: number) {
    const vaccine = await this.vaccineLogRepository.findOne({ where: { id, petId } });
    if (!vaccine) throw new NotFoundException('Vaccine log not found');
    return this.vaccineLogRepository.remove(vaccine);
  }
}
