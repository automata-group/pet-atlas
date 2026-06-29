import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { Message } from './entities/message.entity';
import { ChatGroup } from './entities/chat-group.entity';
import { ChatMember } from './entities/chat-member.entity';

import { ChatGateway } from './chat.gateway';

import { ChatTyping } from './entities/chat-typing.entity';
import { ChatRead } from './entities/chat-read.entity';

import { DirectoryModule } from '../directory/directory.module';

import { ListingItem } from '../directory/entities/listing-item.entity';
import { ConsultantTeamMember } from '../directory/entities/consultant-team-member.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Message, 
      ChatGroup, 
      ChatMember, 
      ListingItem, 
      ConsultantTeamMember,
      ChatTyping,
      ChatRead
    ]),
    DirectoryModule,
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
  exports: [ChatService],
})
export class ChatModule {}
