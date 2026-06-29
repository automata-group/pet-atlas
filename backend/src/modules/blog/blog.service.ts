import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { ChatGroup } from '../chat/entities/chat-group.entity';
import { Message } from '../chat/entities/message.entity';

@Injectable()
export class BlogService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(ChatGroup)
    private readonly groupRepository: Repository<ChatGroup>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async getPosts(page: number = 1) {
    const baseUrl = this.configService.get<string>('WP_BASE_URL');
    const apiPath = this.configService.get<string>('WP_API_PATH');
    const wpUrl = `${baseUrl}${apiPath}/posts`;

    try {
      const response = await axios.get(wpUrl, {
        params: {
          _embed: 1,
          per_page: 10,
          page: page
        }
      });

      const posts = response.data.map(post => {
        let tag = 'General';
        const categories = post._embedded?.['wp:term']?.[0] || [];
        if (categories.some(c => c.name.toLowerCase().includes('dog'))) tag = 'Dog';
        else if (categories.some(c => c.name.toLowerCase().includes('cat'))) tag = 'Cat';
        else if (categories.some(c => c.name.toLowerCase().includes('exotic'))) tag = 'Exotic';

        return {
          id: post.id,
          title: post.title.rendered,
          subtitle: post.excerpt.rendered.replace(/<[^>]*>?/gm, '').substring(0, 100) + '...',
          content: post.content.rendered,
          imageUrl: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || `https://picsum.photos/seed/${post.id}/600/400`,
          tag: tag,
          author: post._embedded?.['author']?.[0]?.name || 'Pet-Atlas Team',
          date: new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        };
      });

      // PDF Page 10: Notify users of new post (via Announcement chat)
      if (posts.length > 0) {
        await this.notifyOfNewPost(posts[0]);
      }

      return posts;
    } catch (error) {
      console.error('Failed to fetch from WordPress:', error.message);
      return [];
    }
  }

  private async notifyOfNewPost(post: any) {
    try {
      // Find the official announcement group
      const announcementGroup = await this.groupRepository.findOne({
        where: { type: 'announcement' }
      });

      if (announcementGroup) {
        // Broadcast welcome message or post title
        const existing = await this.messageRepository.findOne({
          where: { groupId: announcementGroup.id, content: `📢 New Blog Post: ${post.title}` }
        });

        if (!existing) {
          await this.messageRepository.save(
            this.messageRepository.create({
              groupId: announcementGroup.id,
              senderId: 0, // System/Official sender
              type: 'Text',
              content: `📢 New Blog Post: ${post.title}`,
            })
          );
        }
      }
    } catch (e) {
      console.error('Failed to broadcast blog notification:', e.message);
    }
  }
}
