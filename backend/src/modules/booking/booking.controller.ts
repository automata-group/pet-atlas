import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  create(@Request() req, @Body() createBookingDto: CreateBookingDto) {
    return this.bookingService.createBooking(req.user.id, createBookingDto);
  }

  @Get('my')
  findAll(@Request() req) {
    return this.bookingService.getMyBookings(req.user.id);
  }

  @Get('consultant')
  @UseGuards(RolesGuard)
  @Roles(1, 3)
  getConsultantBookings(@Request() req) {
    return this.bookingService.getConsultantBookings(req.user.id);
  }

  @Patch(':id/cancel')
  cancel(@Request() req, @Param('id') id: string) {
    return this.bookingService.cancelBooking(req.user.id, +id);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(1, 3)
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.bookingService.updateStatus(+id, status);
  }

  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles(1)
  getAllBookings() {
    return this.bookingService.getAllBookings();
  }
}

