import { Controller, Get, Post, Put, Delete, Patch, Param, Body, UseGuards, Query, ParseUUIDPipe, Request, UseInterceptors } from '@nestjs/common';
import { CmsService } from './cms.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuditLogInterceptor } from '../admin/audit-log.interceptor';
import { BadRequestException } from '@nestjs/common';

@ApiTags('cms')
@UseInterceptors(AuditLogInterceptor)
@Controller()
export class CmsController {
    constructor(private readonly cmsService: CmsService) { }

    // ══════════════════════════════════════════════════════════════════════
    // PUBLIC ROUTES (no auth)
    // ══════════════════════════════════════════════════════════════════════

    // ── Pages (public) ──────────────────────────────────────────────────
    @ApiOperation({ summary: 'Get all pages (public)' })
    @Get('pages')
    async getAllPages() {
        const pages = await this.cmsService.getAllPages();
        return { success: true, data: pages };
    }

    @ApiOperation({ summary: 'Get page by ID' })
    @ApiParam({ name: 'id' })
    @Get('pages/:id')
    async getPageById(@Param('id') id: string) {
        // Already returns { success: true, data: Page }
        return this.cmsService.getPageById(id);
    }

    @ApiOperation({ summary: 'Get page by slug' })
    @ApiParam({ name: 'slug' })
    @Get('pages/slug/:slug')
    async getPageBySlug(@Param('slug') slug: string) {
        // Already returns { success: true, data: Page }
        return this.cmsService.getPageBySlug(slug);
    }


    // ── Global Sections (public) ────────────────────────────────────────
    @ApiOperation({ summary: 'Get global header sections' })
    @Get('header-sections')
    async getGlobalHeaderSections() {
        const sections = await this.cmsService.getGlobalHeaderSections();
        return { success: true, data: sections };
    }

    @ApiOperation({ summary: 'Get global footer sections' })
    @Get('footer-sections')
    async getGlobalFooterSections() {
        const sections = await this.cmsService.getGlobalFooterSections();
        return { success: true, data: sections };
    }
    @ApiOperation({ summary: 'Get homepage page by slug' })
    @ApiParam({ name: 'slug' })
    @Get('homepage/pages/:slug')
    async getHomepagePageBySlug(@Param('slug') slug: string) {
        // Already returns { success: true, data: Page }
        return this.cmsService.getPageBySlug(slug);
    }


    // ══════════════════════════════════════════════════════════════════════
    // CMS ADMIN ROUTES (auth required)
    // ══════════════════════════════════════════════════════════════════════

    // ── Pages (admin) ───────────────────────────────────────────────────
    @ApiOperation({ summary: 'Admin: Get all pages' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('admin/pages')
    async getAdminPages() {
        return this.cmsService.getAllPages();
    }

    @ApiOperation({ summary: 'Admin: Get page by ID' })
    @ApiParam({ name: 'id' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('admin/pages/:id')
    async getAdminPageById(@Param('id') id: string) {
        return this.cmsService.getPageById(id);
    }

    @ApiOperation({ summary: 'Admin: Create page' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post('admin/pages')
    async createPage(@Body() body: any) {
        return this.cmsService.createPage(body);
    }

    @ApiOperation({ summary: 'Admin: Update page' })
    @ApiParam({ name: 'id' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Put('admin/pages/:id')
    async updatePage(@Param('id') id: string, @Body() body: any) {
        return this.cmsService.updatePage(id, body);
    }

    @ApiOperation({ summary: 'Admin: Delete page' })
    @ApiParam({ name: 'id' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Delete('admin/pages/:id')
    async deletePage(@Param('id') id: string) {
        return this.cmsService.deletePage(id);
    }

    // ── Section Types (The Library) ────────────────────────────────────
    @ApiOperation({ summary: 'Get all section types' })
    @Get('section-types')
    async getAllSectionTypes(@Query() query: any) {
        return this.cmsService.getAllSectionTypes(query);
    }

    @ApiOperation({ summary: 'Get all unique section type tags' })
    @Get('section-types/tags')
    async getSectionTypeTags() {
        return this.cmsService.getSectionTypeTags();
    }

    @ApiOperation({ summary: 'Get section type by ID' })
    @ApiParam({ name: 'id' })
    @Get('section-types/:id')
    async getSectionTypeById(@Param('id') id: string) {
        return this.cmsService.getSectionTypeById(id);
    }

    @ApiOperation({ summary: 'Admin: Create section type' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post('admin/section-types')
    async createSectionType(@Body() data: any) {
        return this.cmsService.createSectionType(data);
    }

    @ApiOperation({ summary: 'Admin: Update section type' })
    @ApiParam({ name: 'id' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Put('admin/section-types/:id')
    async updateSectionType(@Param('id') id: string, @Body() data: any) {
        return this.cmsService.updateSectionType(id, data);
    }

    @ApiOperation({ summary: 'Admin: Delete section type' })
    @ApiParam({ name: 'id' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Delete('admin/section-types/:id')
    async deleteSectionType(@Param('id') id: string) {
        return this.cmsService.deleteSectionType(id);
    }


    // ── Global Sections (admin) ─────────────────────────────────────────
    @ApiOperation({ summary: 'Admin: Get global header sections' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('admin/header-sections')
    async getAdminGlobalHeaderSections() {
        const sections = await this.cmsService.getGlobalHeaderSections();
        return { success: true, data: sections };
    }

    @ApiOperation({ summary: 'Admin: Get global footer sections' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('admin/footer-sections')
    async getAdminGlobalFooterSections() {
        const sections = await this.cmsService.getGlobalFooterSections();
        return { success: true, data: sections };
    }
    @ApiOperation({ summary: 'Admin: Update global header sections' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Put('admin/header-sections')
    async updateGlobalHeaderSections(@Body() body: any[]) {
        return this.cmsService.updateGlobalHeaderSections(body);
    }

    @ApiOperation({ summary: 'Admin: Update global footer sections' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Put('admin/footer-sections')
    async updateGlobalFooterSections(@Body() body: any[]) {
        return this.cmsService.updateGlobalFooterSections(body);
    }
}
