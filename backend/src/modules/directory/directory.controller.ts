import { Controller, Get, Post, Put, Body, Query, Param, Req, UseGuards, ParseIntPipe, HttpCode, HttpStatus, HttpException } from '@nestjs/common';
import { DirectoryService } from './directory.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ClinicsEnabledGuard } from './guards/clinics-enabled.guard';

@Controller('directory')
export class DirectoryController {
  constructor(private readonly directoryService: DirectoryService) {}

  @Get('config')
  @HttpCode(HttpStatus.OK)
  async getConfig() {
    const keys = ['clinics_enabled', 'app_name', 'app_version', 'default_region', 'enforce_mfa', 'jwt_secret'];
    const config: any = {};
    
    for (const key of keys) {
      const value = await this.directoryService.getSystemSetting(key, this.getDefaultValue(key));
      config[this.snakeToCamel(key)] = value === 'true' || value === 'false' ? value === 'true' : value;
    }
    
    return config;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1)
  @Post('config')
  @HttpCode(HttpStatus.OK)
  async updateConfig(@Body() body: any) {
    for (const key in body) {
      const snakeKey = this.camelToSnake(key);
      const value = typeof body[key] === 'boolean' ? String(body[key]) : String(body[key]);
      await this.directoryService.setSystemSetting(snakeKey, value);
    }
    return body;
  }

  private getDefaultValue(key: string): string {
    const defaults: any = {
      clinics_enabled: 'true',
      app_name: 'Pet-Atlas',
      app_version: '1.0.0-PROD',
      default_region: 'Middle East (Cairo)',
      enforce_mfa: 'false',
      jwt_secret: 'PA_SECURE_9921_ALPHA_BETA_SIGMA',
    };
    return defaults[key] || '';
  }

  private snakeToCamel(str: string) {
    return str.replace(/([-_][a-z])/g, group =>
      group.toUpperCase().replace('-', '').replace('_', ''),
    );
  }

  private camelToSnake(str: string) {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }


  @UseGuards(ClinicsEnabledGuard)
  @Get('nearest')
  @HttpCode(HttpStatus.OK)
  async getNearest(
    @Query('type') type: string,
    @Query('lat') lat: string,
    @Query('lon') lon: string,
    @Query('radius') radius: string,
    @Query('isOfficial') isOfficial?: string,
    @Query('priceRange') priceRange?: string,
    @Query('sortBy') sortBy?: 'distance' | 'rating',
  ) {
    const userLat = parseFloat(lat || '0');
    const userLon = parseFloat(lon || '0');
    const rad = parseInt(radius || '50000');
    
    return this.directoryService.getNearestListings(type, userLat, userLon, rad, 20, {
      isOfficial: isOfficial === 'true' ? true : undefined,
      priceRange,
      sortBy,
    });
  }

  @UseGuards(ClinicsEnabledGuard)
  @Get()
  @HttpCode(HttpStatus.OK)
  async getAll() {
    return this.directoryService.getAllListings();
  }

  @UseGuards(JwtAuthGuard, ClinicsEnabledGuard)
  @Get('my')
  @HttpCode(HttpStatus.OK)
  async getMyListings(@Req() req) {
    return this.directoryService.getMyListings(req.user.id);
  }

  // --- Dynamic Services Endpoints ---

  @UseGuards(ClinicsEnabledGuard)
  @Get('services')
  @HttpCode(HttpStatus.OK)
  async getActiveServices() {
    return this.directoryService.getServiceSections(true);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1)
  @Get('services/admin')
  @HttpCode(HttpStatus.OK)
  async getAllServicesAdmin() {
    return this.directoryService.getServiceSections(false);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1)
  @Post('services')
  @HttpCode(HttpStatus.CREATED)
  async createService(@Body() dto: any) {
    return this.directoryService.createServiceSection(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1)
  @Put('services/:id')
  @HttpCode(HttpStatus.OK)
  async updateService(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    return this.directoryService.updateServiceSection(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1)
  @Post('services/:id/delete') // Using POST or DELETE, let's also add actual delete
  @HttpCode(HttpStatus.OK)
  async deleteServicePost(@Param('id', ParseIntPipe) id: number) {
    return this.directoryService.deleteServiceSection(id);
  }

  @UseGuards(ClinicsEnabledGuard)
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return this.directoryService.getListingDetails(id);
  }

  @UseGuards(JwtAuthGuard, ClinicsEnabledGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async addListing(@Req() req, @Body() dto: any) {
    // Basic DTO placeholder for time efficiency
    return this.directoryService.addListing(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard, ClinicsEnabledGuard)
  @Get(':id/team')
  @HttpCode(HttpStatus.OK)
  async getTeam(@Param('id', ParseIntPipe) id: number) {
    return this.directoryService.getTeamMembers(id);
  }

  @UseGuards(JwtAuthGuard, ClinicsEnabledGuard)
  @Post(':id/team')
  @HttpCode(HttpStatus.CREATED)
  async addToTeam(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
    @Body('userId', ParseIntPipe) userId: number,
    @Body('role') role: string,
  ) {
    return this.directoryService.addTeamMember(req.user.id, id, userId, role);
  }

  @UseGuards(JwtAuthGuard, ClinicsEnabledGuard)
  @Post(':id/team/remove') // Using POST for remove to handle userId in body easily
  @HttpCode(HttpStatus.OK)
  async removeFromTeam(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
    @Body('userId', ParseIntPipe) userId: number,
  ) {
    return this.directoryService.removeTeamMember(req.user.id, id, userId);
  }

  @UseGuards(JwtAuthGuard, ClinicsEnabledGuard)
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateListing(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
  ) {
    try {
      return await this.directoryService.updateListing(req.user.id, id, dto);
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.FORBIDDEN);
    }
  }


}


