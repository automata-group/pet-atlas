import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
  ) {}

  async createBooking(userId: number, dto: CreateBookingDto) {
    const totalPrice = (dto.selectedServices || []).reduce((sum, s) => sum + (s.price || 0), 0);
    const booking = this.bookingRepository.create({
      ...dto,
      userId,
      totalPrice,
      bookingDate: new Date(dto.bookingDate),
    });
    return this.bookingRepository.save(booking);
  }

  async getMyBookings(userId: number) {
    return this.bookingRepository.find({
      where: { userId },
      relations: ['listing', 'pet'],
      order: { bookingDate: 'DESC' },
    });
  }

  async getConsultantBookings(userId: number) {
    return this.bookingRepository.createQueryBuilder('booking')
      .leftJoinAndSelect('booking.listing', 'listing')
      .leftJoinAndSelect('booking.pet', 'pet')
      .leftJoinAndSelect('booking.user', 'user')
      .where('listing.owner_id = :userId', { userId })
      .orderBy('booking.bookingDate', 'DESC')
      .getMany();
  }

  async cancelBooking(userId: number, id: number) {
    const booking = await this.bookingRepository.findOne({
      where: { id, userId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found or unauthorized');
    }

    booking.status = 'CANCELLED';
    return this.bookingRepository.save(booking);
  }

  async updateStatus(id: number, status: string) {
    const booking = await this.bookingRepository.findOne({
      where: { id },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    booking.status = status;
    return this.bookingRepository.save(booking);
  }

  async getAllBookings() {
    return this.bookingRepository.find({
      relations: ['user', 'listing'],
      order: { createdAt: 'DESC' },
    });
  }
}
