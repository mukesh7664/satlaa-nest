import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogPost } from './entities/blog-post.entity';
import { BlogCategory } from './entities/blog-category.entity';
import { BlogTag } from './entities/blog-tag.entity';
import { BlogService } from './blog.service';
import { AdminBlogController } from './admin-blog.controller';
import { BlogController } from './blog.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([BlogPost, BlogCategory, BlogTag]),
    ],
    providers: [BlogService],
    controllers: [AdminBlogController, BlogController],
    exports: [BlogService],
})
export class BlogModule { }
