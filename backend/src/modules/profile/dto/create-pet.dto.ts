import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean, IsDateString } from 'class-validator';

export class CreatePetDto {
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsString({ message: 'Photo URL must be a string' })
  @IsOptional()
  photoUrl?: string;

  @IsDateString({}, { message: 'Date of birth must be a valid ISO date string' })
  @IsOptional()
  dob?: string;

  @IsEnum(['Male', 'Female'], { message: 'Sex must be Male or Female' })
  @IsOptional()
  sex?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsOptional()
  weight?: string | number;

  @IsString()
  @IsOptional()
  breed?: string;

  @IsBoolean()
  @IsOptional()
  neutered?: boolean;

  @IsString()
  @IsOptional()
  notes?: string;
}
