import { Controller, Get, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { BlogService } from './blog.service';

@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAll(@Query('page') page?: string) {
    const pageNum = page ? parseInt(page, 10) : 1;
    return this.blogService.getPosts(pageNum);
  }
}
