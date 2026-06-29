import { IsNotEmpty, IsNumber, IsOptional, IsString, IsArray, IsDateString } from 'class-validator';

export class CreateBookingDto {
  @IsNotEmpty()
  @IsNumber()
  listingId: number;

  @IsOptional()
  @IsNumber()
  petId?: number;

  @IsNotEmpty()
  @IsArray()
  selectedServices: { name: string; price: number }[];

  @IsNotEmpty()
  @IsDateString()
  bookingDate: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
