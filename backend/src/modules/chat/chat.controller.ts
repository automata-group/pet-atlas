import { Controller, Get, Post, Body, Query, Param, Req, UseGuards, ParseIntPipe, HttpCode, HttpStatus, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';


@Controller('chats')
@UseGuards(JwtAuthGuard) // Protect all chat routes
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('test-chat')
  @HttpCode(HttpStatus.OK)
  async testChat() {
    return { status: 'Chat system is online', version: '1.0.1' };
  }

  @Get('my')
  @HttpCode(HttpStatus.OK)
  async getMyChats(
    @Req() req,
    @Query('archived') archived?: string,
  ) {
    const includeArchived = archived === 'true';
    return this.chatService.getMyChats(req.user.id, Number(req.user.roleId), includeArchived);
  }

  @Get(':id/messages')
  @HttpCode(HttpStatus.OK)
  async getMessages(
    @Param('id', ParseIntPipe) groupId: number,
    @Query('limit') limit: string,
  ) {
    const limitNum = parseInt(limit || '50', 10);
    return this.chatService.getMessages(groupId, limitNum);
  }

  @Post(':id/messages')
  @HttpCode(HttpStatus.CREATED)
  async sendMessage(
    @Req() req,
    @Param('id', ParseIntPipe) groupId: number,
    @Body() dto: any,
  ) {
    // Basic DTO placeholder for media types supports (Voice, Video, Photo, Location)
    return this.chatService.sendMessage(req.user.id, groupId, dto, req.user.roleId);
  }

  @Post('consult')
  @HttpCode(HttpStatus.OK)
  async startConsultation(
    @Req() req,
    @Body() body: { consultantId: number; consultantName: string },
  ) {
    return this.chatService.findOrCreateConsultation(
      req.user.id, 
      body.consultantId, 
      body.consultantName
    );
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        cb(null, `${randomName}${extname(file.originalname)}`);
      }
    }),
    fileFilter: (req, file, cb) => {
      if (file.mimetype.match(/\/(jpg|jpeg|png|gif|mp3|wav|ogg|m4a|mp4|quicktime|pdf|msword|vnd.openxmlformats-officedocument.wordprocessingml.document)$/)) {
        cb(null, true);
      } else {
        cb(new Error('Unsupported file type'), false);
      }
    }
  }))
  @HttpCode(HttpStatus.CREATED)
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    let type = 'File';
    if (file.mimetype.startsWith('image')) type = 'Photo';
    else if (file.mimetype.startsWith('audio')) type = 'Voice';
    else if (file.mimetype.startsWith('video')) type = 'Video';
    
    return {
      url: `/uploads/${file.filename}`,
      type: type,
      size: file.size,
      originalName: file.originalname
    };
  }

  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles(1)
  @HttpCode(HttpStatus.OK)
  async getAllChatsForAdmin(@Req() req) {
    return this.chatService.getAllChatsForAdmin();
  }
  @Post(':id/typing')
  @HttpCode(HttpStatus.OK)
  async setTyping(
    @Req() req,
    @Param('id', ParseIntPipe) groupId: number,
    @Body() body: { isTyping: boolean },
  ) {
    const username = req.user.username || req.user.display_name || 'User';
    return this.chatService.setTypingStatus(groupId, req.user.id, body.isTyping, username);
  }

  @Post(':id/messages/:msgId/seen')
  @HttpCode(HttpStatus.OK)
  async markSeen(
    @Req() req,
    @Param('id', ParseIntPipe) groupId: number,
    @Param('msgId', ParseIntPipe) messageId: number,
  ) {
    return this.chatService.markMessageRead(messageId, groupId, req.user.id);
  }

  @Post(':id/archive')
  @HttpCode(HttpStatus.OK)
  async archiveChat(
    @Req() req,
    @Param('id', ParseIntPipe) groupId: number,
  ) {
    return this.chatService.archiveChat(groupId, req.user.id, req.user.roleId);
  }

  @Post('group')
  @Roles(1)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.CREATED)
  async createGroup(
    @Body() body: { name: string; type: 'announcement' | 'community'; description?: string },
  ) {
    return this.chatService.createGroup(body.name, body.type, body.description);
  }
}
