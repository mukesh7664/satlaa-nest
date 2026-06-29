import {
    Controller, Get, Param, Query, Request, BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BlogService } from './blog.service';

@ApiTags('blog')
@Controller('blog')
export class BlogController {
    constructor(private readonly blogService: BlogService) { }

    private requireTenant(req: any): string {
        const storeId = req.tenant?.id;
        if (!storeId) throw new BadRequestException('Tenant not resolved');
        return storeId;
    }

    @ApiOperation({ summary: 'Public: List published blog posts' })
    @Get('posts')
    getPosts(
        @Query('page') page = 1,
        @Query('perPage') perPage = 9,
        @Query('category') category: string,
        @Request() req: any,
    ) {
        return this.blogService.findPublicPosts(
            this.requireTenant(req),
            Number(page) || 1,
            Number(perPage) || 9,
            category,
        );
    }

    @ApiOperation({ summary: 'Public: List published post slugs (for SSG)' })
    @Get('posts/slugs')
    getSlugs(@Request() req: any) {
        return this.blogService.findPublicSlugs(this.requireTenant(req));
    }

    @ApiOperation({ summary: 'Public: Get a published post by slug' })
    @Get('posts/:slug')
    getPost(@Param('slug') slug: string, @Request() req: any) {
        return this.blogService.findPublicPostBySlug(this.requireTenant(req), slug);
    }

    @ApiOperation({ summary: 'Public: Get related posts for a slug' })
    @Get('posts/:slug/related')
    getRelated(
        @Param('slug') slug: string,
        @Query('limit') limit = 3,
        @Request() req: any,
    ) {
        return this.blogService.findRelatedPosts(this.requireTenant(req), slug, Number(limit) || 3);
    }

    @ApiOperation({ summary: 'Public: List blog categories with counts' })
    @Get('categories')
    getCategories(@Request() req: any) {
        return this.blogService.findPublicCategories(this.requireTenant(req));
    }

    @ApiOperation({ summary: 'Public: Get a blog category by slug' })
    @Get('categories/:slug')
    getCategory(@Param('slug') slug: string, @Request() req: any) {
        return this.blogService.findPublicCategoryBySlug(this.requireTenant(req), slug);
    }
}
