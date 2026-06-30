import { Controller, Get, Post, Put, Body, UseGuards, Request, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SettingsService } from './settings.service';
import { AuditLogInterceptor } from './audit-log.interceptor';

@ApiTags('admin/settings')
@UseInterceptors(AuditLogInterceptor)
@Controller('admin/settings')
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) { }

    @ApiOperation({ summary: 'Admin: Get full settings' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get()
    async getSettings(@Request() req: any) {
        return this.settingsService.getSettings();
    }

    @ApiOperation({ summary: 'Admin: Get SEO settings' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('seo')
    async getAdminSeoSettings(@Request() req: any) {
        return this.settingsService.getSeoSettings();
    }

    @ApiOperation({ summary: 'Update SEO settings' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post('seo')
    async updateAdminSeoSettings(@Body() body: any, @Request() req: any) {
        return this.settingsService.updateSeoSettings(body);
    }

    @ApiOperation({ summary: 'Admin: Update settings' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Put()
    async updateSettings(@Body() body: any, @Request() req: any) {
        return this.settingsService.updateSettings(body);
    }
}
