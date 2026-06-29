import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { SeedService } from './seed.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly seedService: SeedService,
  ) {}

  @Get('seed-chat')
  async seedChat() {
    return this.seedService.seedChatData();
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
