import {
    Controller, Get, Post, Put, Patch, Delete, Param, Query, Body,
    UseGuards, Request, BadRequestException, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BlogService } from './blog.service';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';
import { CreateBlogCategoryDto } from './dto/create-blog-category.dto';
import { CreateBlogTagDto } from './dto/create-blog-tag.dto';

@ApiTags('admin/blog')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/blog')
export class AdminBlogController {
    constructor(private readonly blogService: BlogService) { }

    private requireStore(req: any): string {
        const storeId = req.user?.storeId;
        if (!storeId) throw new BadRequestException('Store context required');
        return storeId;
    }

    // ─── Posts ──────────────────────────────────────────────────────────────

    @ApiOperation({ summary: 'Admin: Get all blog posts' })
    @Get('posts')
    getPosts(
        @Query('page') page = 1,
        @Query('limit') limit = 20,
        @Query('search') search: string,
        @Query('status') status: string,
        @Request() req: any,
    ) {
        return this.blogService.findAllPosts(this.requireStore(req), { page, limit, search, status });
    }

    @ApiOperation({ summary: 'Admin: Get blog post by ID' })
    @Get('posts/:id')
    getPost(@Param('id') id: string, @Request() req: any) {
        return this.blogService.findPostById(id, this.requireStore(req));
    }

    @ApiOperation({ summary: 'Admin: Create blog post' })
    @Post('posts')
    createPost(@Body() dto: CreateBlogPostDto, @Request() req: any) {
        return this.blogService.createPost(dto, this.requireStore(req));
    }

    @ApiOperation({ summary: 'Admin: Update blog post' })
    @Put('posts/:id')
    updatePost(@Param('id') id: string, @Body() dto: UpdateBlogPostDto, @Request() req: any) {
        return this.blogService.updatePost(id, dto, this.requireStore(req));
    }

    @ApiOperation({ summary: 'Admin: Toggle blog post status' })
    @Patch('posts/:id/status')
    toggleStatus(@Param('id') id: string, @Request() req: any) {
        return this.blogService.toggleStatus(id, this.requireStore(req));
    }

    @ApiOperation({ summary: 'Admin: Delete blog post' })
    @Delete('posts/:id')
    @HttpCode(HttpStatus.OK)
    deletePost(@Param('id') id: string, @Request() req: any) {
        return this.blogService.removePost(id, this.requireStore(req));
    }

    // ─── Categories ───────────────────────────────────────────────────────────

    @ApiOperation({ summary: 'Admin: Get blog categories' })
    @Get('categories')
    getCategories(@Request() req: any) {
        return this.blogService.findCategories(this.requireStore(req));
    }

    @ApiOperation({ summary: 'Admin: Create blog category' })
    @Post('categories')
    createCategory(@Body() dto: CreateBlogCategoryDto, @Request() req: any) {
        return this.blogService.createCategory(dto, this.requireStore(req));
    }

    @ApiOperation({ summary: 'Admin: Update blog category' })
    @Put('categories/:id')
    updateCategory(@Param('id') id: string, @Body() dto: Partial<CreateBlogCategoryDto>, @Request() req: any) {
        return this.blogService.updateCategory(id, dto, this.requireStore(req));
    }

    @ApiOperation({ summary: 'Admin: Delete blog category' })
    @Delete('categories/:id')
    @HttpCode(HttpStatus.OK)
    deleteCategory(@Param('id') id: string, @Request() req: any) {
        return this.blogService.removeCategory(id, this.requireStore(req));
    }

    // ─── Tags ─────────────────────────────────────────────────────────────────

    @ApiOperation({ summary: 'Admin: Get blog tags' })
    @Get('tags')
    getTags(@Request() req: any) {
        return this.blogService.findTags(this.requireStore(req));
    }

    @ApiOperation({ summary: 'Admin: Create blog tag' })
    @Post('tags')
    createTag(@Body() dto: CreateBlogTagDto, @Request() req: any) {
        return this.blogService.createTag(dto, this.requireStore(req));
    }

    @ApiOperation({ summary: 'Admin: Delete blog tag' })
    @Delete('tags/:id')
    @HttpCode(HttpStatus.OK)
    deleteTag(@Param('id') id: string, @Request() req: any) {
        return this.blogService.removeTag(id, this.requireStore(req));
    }
}
