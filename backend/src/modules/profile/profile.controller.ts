import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Req, UseGuards, HttpCode, HttpStatus, ParseIntPipe } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('profile')
@UseGuards(JwtAuthGuard) // Protect all routes here with WordPress Token verification
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getProfile(@Req() req) {
    return this.profileService.getProfile(req.user.id);
  }

  @Put()
  @HttpCode(HttpStatus.OK)
  async updateProfile(@Req() req, @Body() body: any) {
    return this.profileService.updateProfile(req.user.id, body);
  }

  @Patch('status')
  @HttpCode(HttpStatus.OK)
  async updateStatus(@Req() req, @Body('status') status: string) {
    return this.profileService.updateStatus(req.user.id, status);
  }

  @Post('pets')
  @HttpCode(HttpStatus.CREATED)
  async addPet(@Req() req, @Body() createPetDto: CreatePetDto) {
    return this.profileService.addPet(req.user.id, createPetDto);
  }

  @Put('pets/:id')
  @HttpCode(HttpStatus.OK)
  async updatePet(
    @Req() req,
    @Param('id', ParseIntPipe) petId: number,
    @Body() updatePetDto: Partial<CreatePetDto>,
  ) {
    return this.profileService.updatePet(req.user.id, petId, updatePetDto);
  }

  @Delete('pets/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePet(@Req() req, @Param('id', ParseIntPipe) petId: number) {
    await this.profileService.deletePet(req.user.id, petId);
  }
}
