import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { ChatGroup } from '../chat/entities/chat-group.entity';
import { Message } from '../chat/entities/message.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatGroup, Message]),
  ],
  providers: [BlogService],
  controllers: [BlogController],
  exports: [BlogService],
})
export class BlogModule {}
