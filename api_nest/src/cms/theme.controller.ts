import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { ThemeService } from './theme.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../auth/guards/super-admin.guard';

@Controller('admin/themes')
@UseGuards(JwtAuthGuard)
export class ThemeController {
    constructor(private readonly themeService: ThemeService) {}

    @Get()
    async getThemes(@Query('all') all?: string) {
        return this.themeService.findAll(all === 'true');
    }

    @Get(':id')
    async getTheme(@Param('id') id: string) {
        return this.themeService.findOne(id);
    }

    @Post()
    @UseGuards(SuperAdminGuard)
    async create(@Body() data: any) {
        return this.themeService.create(data);
    }

    @Put(':id')
    @UseGuards(SuperAdminGuard)
    async update(@Param('id') id: string, @Body() data: any) {
        return this.themeService.update(id, data);
    }

    @Delete(':id')
    @UseGuards(SuperAdminGuard)
    async remove(@Param('id') id: string) {
        return this.themeService.remove(id);
    }

    @Post(':id/install')
    async installTheme(@Param('id') id: string) {
        return this.themeService.applyTheme(id);
    }
}
