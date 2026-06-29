import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DirectoryController } from './directory.controller';
import { DirectoryService } from './directory.service';
import { ListingItem } from './entities/listing-item.entity';
import { ConsultantTeamMember } from './entities/consultant-team-member.entity';
import { SystemSetting } from './entities/system-setting.entity';
import { ServiceSection } from './entities/service-section.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ListingItem, ConsultantTeamMember, SystemSetting, ServiceSection])],
  controllers: [DirectoryController],
  providers: [DirectoryService],
  exports: [DirectoryService, TypeOrmModule],
})
export class DirectoryModule {}

