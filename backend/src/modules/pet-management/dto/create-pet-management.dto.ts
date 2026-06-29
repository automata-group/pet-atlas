import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsDateString, IsBoolean } from 'class-validator';

export class CreateDiaryEntryDto {
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Content is required' })
  content: string;

  @IsDateString({}, { message: 'Date must be a valid ISO date string' })
  @IsOptional()
  date?: string;
}

export class CreateReminderDto {
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @IsEnum(['medication', 'vaccine', 'vet_visit', 'other'], { message: 'Type must be medication, vaccine, vet_visit, or other' })
  @IsNotEmpty({ message: 'Type is required' })
  type: string;

  @IsDateString({}, { message: 'DateTime must be a valid ISO date string' })
  @IsNotEmpty({ message: 'DateTime is required' })
  dateTime: string;
}

export class UpdateReminderStatusDto {
  @IsBoolean()
  @IsNotEmpty()
  isCompleted: boolean;
}

export class CreateWeightLogDto {
  @IsNotEmpty({ message: 'Weight is required' })
  weight: string | number;

  @IsDateString({}, { message: 'Date must be a valid ISO date string' })
  @IsOptional()
  date?: string;
}

export class CreateMedicationLogDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Dosage is required' })
  dosage: string;

  @IsString()
  @IsNotEmpty({ message: 'Frequency is required' })
  frequency: string;

  @IsDateString({}, { message: 'StartDate must be a valid ISO date string' })
  @IsNotEmpty({ message: 'StartDate is required' })
  startDate: string;

  @IsDateString({}, { message: 'EndDate must be a valid ISO date string' })
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateVetVisitDto {
  @IsString()
  @IsNotEmpty({ message: 'ClinicName is required' })
  clinicName: string;

  @IsString()
  @IsOptional()
  vetName?: string;

  @IsDateString({}, { message: 'DateTime must be a valid ISO date string' })
  @IsNotEmpty({ message: 'DateTime is required' })
  dateTime: string;

  @IsString()
  @IsNotEmpty({ message: 'Reason is required' })
  reason: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateVaccineLogDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsDateString({}, { message: 'AdministeredDate must be a valid ISO date string' })
  @IsNotEmpty({ message: 'AdministeredDate is required' })
  administeredDate: string;

  @IsDateString({}, { message: 'NextDueDate must be a valid ISO date string' })
  @IsOptional()
  nextDueDate?: string;

  @IsString()
  @IsOptional()
  veterinarian?: string;
}
