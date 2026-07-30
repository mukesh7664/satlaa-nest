import {
    Controller, Get, Param, Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BlogService } from './blog.service';

@ApiTags('blog')
@Controller('blog')
export class BlogController {
    constructor(private readonly blogService: BlogService) { }

    @ApiOperation({ summary: 'Public: List published blog posts' })
    @Get('posts')
    getPosts(
        @Query('page') page = 1,
        @Query('perPage') perPage = 9,
        @Query('category') category: string,
    ) {
        return this.blogService.findPublicPosts(
            Number(page) || 1,
            Number(perPage) || 9,
            category,
        );
    }

    @ApiOperation({ summary: 'Public: List published post slugs (for SSG)' })
    @Get('posts/slugs')
    getSlugs() {
        return this.blogService.findPublicSlugs();
    }

    @ApiOperation({ summary: 'Public: Get a published post by slug' })
    @Get('posts/:slug')
    getPost(@Param('slug') slug: string) {
        return this.blogService.findPublicPostBySlug(slug);
    }

    @ApiOperation({ summary: 'Public: Get related posts for a slug' })
    @Get('posts/:slug/related')
    getRelated(
        @Param('slug') slug: string,
        @Query('limit') limit = 3,
    ) {
        return this.blogService.findRelatedPosts(slug, Number(limit) || 3);
    }

    @ApiOperation({ summary: 'Public: List blog categories with counts' })
    @Get('categories')
    getCategories() {
        return this.blogService.findPublicCategories();
    }

    @ApiOperation({ summary: 'Public: Get a blog category by slug' })
    @Get('categories/:slug')
    getCategory(@Param('slug') slug: string) {
        return this.blogService.findPublicCategoryBySlug(slug);
    }
}
