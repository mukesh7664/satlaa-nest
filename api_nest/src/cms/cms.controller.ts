import { Controller, Get, Post, Put, Delete, Patch, Param, Body, UseGuards, Query, ParseUUIDPipe, Request, UseInterceptors } from '@nestjs/common';
import { CmsService } from './cms.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuditLogInterceptor } from '../admin/audit-log.interceptor';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';
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
    async getAllPages(@CurrentTenant('id') storeId: string) {
        if (!storeId) throw new BadRequestException('Tenant not identified');
        const pages = await this.cmsService.getAllPages(storeId);
        return { success: true, data: pages };
    }

    @ApiOperation({ summary: 'Get page by ID' })
    @ApiParam({ name: 'id' })
    @Get('pages/:id')
    async getPageById(@Param('id') id: string, @CurrentTenant('id') storeId: string) {
        if (!storeId) throw new BadRequestException('Tenant not identified');
        // Already returns { success: true, data: Page }
        return this.cmsService.getPageById(id, storeId);
    }

    @ApiOperation({ summary: 'Get page by slug' })
    @ApiParam({ name: 'slug' })
    @Get('pages/slug/:slug')
    async getPageBySlug(@Param('slug') slug: string, @CurrentTenant('id') storeId: string) {
        if (!storeId) throw new BadRequestException('Tenant not identified');
        // Already returns { success: true, data: Page }
        return this.cmsService.getPageBySlug(slug, storeId);
    }


    // ── Global Sections (public) ────────────────────────────────────────
    @ApiOperation({ summary: 'Get global header sections' })
    @Get('header-sections')
    async getGlobalHeaderSections(@CurrentTenant('id') storeId: string) {
        if (!storeId) throw new BadRequestException('Tenant not identified');
        const sections = await this.cmsService.getGlobalHeaderSections(storeId);
        return { success: true, data: sections };
    }

    @ApiOperation({ summary: 'Get global footer sections' })
    @Get('footer-sections')
    async getGlobalFooterSections(@CurrentTenant('id') storeId: string) {
        if (!storeId) throw new BadRequestException('Tenant not identified');
        const sections = await this.cmsService.getGlobalFooterSections(storeId);
        return { success: true, data: sections };
    }
    @ApiOperation({ summary: 'Get homepage page by slug' })
    @ApiParam({ name: 'slug' })
    @Get('homepage/pages/:slug')
    async getHomepagePageBySlug(@Param('slug') slug: string, @CurrentTenant('id') storeId: string) {
        if (!storeId) throw new BadRequestException('Tenant not identified');
        // Already returns { success: true, data: Page }
        return this.cmsService.getPageBySlug(slug, storeId);
    }


    // ══════════════════════════════════════════════════════════════════════
    // CMS ADMIN ROUTES (auth required)
    // ══════════════════════════════════════════════════════════════════════

    // ── Pages (admin) ───────────────────────────────────────────────────
    @ApiOperation({ summary: 'Admin: Get all pages' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('admin/pages')
    async getAdminPages(@Request() req: any) {
        const storeId = req.user?.storeId;
        return this.cmsService.getAllPages(storeId);
    }

    @ApiOperation({ summary: 'Admin: Get page by ID' })
    @ApiParam({ name: 'id' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('admin/pages/:id')
    async getAdminPageById(@Param('id') id: string, @Request() req: any) {
        const storeId = req.user?.storeId;
        // The provided snippet for this method was syntactically incorrect and referenced
        // `this.pageRepository` and `data` which are not defined in this controller.
        // To maintain syntactical correctness as per instructions, the original
        // functional line is kept. If a change was intended, please provide a valid one.
        return this.cmsService.getPageById(id, storeId);
    }

    @ApiOperation({ summary: 'Admin: Create page' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post('admin/pages')
    async createPage(@Body() body: any, @Request() req: any) {
        const storeId = req.user?.storeId;
        return this.cmsService.createPage(body, storeId);
    }

    @ApiOperation({ summary: 'Admin: Update page' })
    @ApiParam({ name: 'id' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Put('admin/pages/:id')
    async updatePage(@Param('id') id: string, @Body() body: any, @Request() req: any) {
        const storeId = req.user?.storeId;
        return this.cmsService.updatePage(id, body, storeId);
    }

    @ApiOperation({ summary: 'Admin: Delete page' })
    @ApiParam({ name: 'id' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Delete('admin/pages/:id')
    async deletePage(@Param('id') id: string, @Request() req: any) {
        const storeId = req.user?.storeId;
        return this.cmsService.deletePage(id, storeId);
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
    async getAdminGlobalHeaderSections(@Request() req: any) {
        const storeId = req.user?.storeId;
        const sections = await this.cmsService.getGlobalHeaderSections(storeId);
        return { success: true, data: sections };
    }

    @ApiOperation({ summary: 'Admin: Get global footer sections' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('admin/footer-sections')
    async getAdminGlobalFooterSections(@Request() req: any) {
        const storeId = req.user?.storeId;
        const sections = await this.cmsService.getGlobalFooterSections(storeId);
        return { success: true, data: sections };
    }
    @ApiOperation({ summary: 'Admin: Update global header sections' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Put('admin/header-sections')
    async updateGlobalHeaderSections(@Body() body: any[], @Request() req: any) {
        const storeId = req.user?.storeId;
        return this.cmsService.updateGlobalHeaderSections(storeId, body);
    }

    @ApiOperation({ summary: 'Admin: Update global footer sections' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Put('admin/footer-sections')
    async updateGlobalFooterSections(@Body() body: any[], @Request() req: any) {
        const storeId = req.user?.storeId;
        return this.cmsService.updateGlobalFooterSections(storeId, body);
    }
}
