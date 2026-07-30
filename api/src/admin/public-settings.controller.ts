import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { AuditLogInterceptor } from './audit-log.interceptor';

@ApiTags('settings')
@UseInterceptors(AuditLogInterceptor)
@Controller('settings')
export class PublicSettingsController {
    constructor(private readonly settingsService: SettingsService) { }

    @ApiOperation({ summary: 'Get SEO settings (public)' })
    @ApiResponse({ status: 200, description: 'SEO settings.' })
    @Get('seo')
    async getSeoSettings() {
        const settings = await this.settingsService.getSeoSettings();
        return { success: true, data: settings };
    }

    @ApiOperation({ summary: 'Get public settings (SEO, TopBar, Popup, etc.)' })
    @ApiResponse({ status: 200, description: 'Public settings.' })
    @Get('public')
    async getPublicSettings() {
        const settings = await this.settingsService.getPublicSettings();
        return { success: true, data: settings };
    }
}
