import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { DirectoryService } from '../directory.service';

@Injectable()
export class ClinicsEnabledGuard implements CanActivate {
  constructor(private readonly directoryService: DirectoryService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const value = await this.directoryService.getSystemSetting('clinics_enabled', 'true');
    if (value === 'false') {
      throw new HttpException(
        'Clinics directory features are currently deactivated by the platform administrator.',
        HttpStatus.FORBIDDEN
      );
    }
    return true;
  }
}
