import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { SystemGatewayConfigService } from './system-gateway-config.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../auth/guards/super-admin.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('admin-config')
@Controller('admin/system-gateway-configs')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
@ApiBearerAuth()
export class SystemGatewayConfigController {
    constructor(private readonly configService: SystemGatewayConfigService) {}

    @Get()
    @ApiOperation({ summary: 'Super Admin: List all system gateway configurations' })
    async findAll() {
        const configs = await this.configService.findAll();
        return { data: configs };
    }

    @Get(':id')
    @ApiOperation({ summary: 'Super Admin: Get system gateway configuration by ID (masked)' })
    async findOne(@Param('id') id: string) {
        const config = await this.configService.findOne(id);
        return { data: config };
    }

    @Get(':id/decrypted')
    @ApiOperation({ summary: 'Super Admin: Get fully decrypted system gateway configuration' })
    async findOneDecrypted(@Param('id') id: string) {
        const config = await this.configService.getDecryptedConfig(id);
        return { data: config };
    }

    @Post()
    @ApiOperation({ summary: 'Super Admin: Create new system gateway configuration' })
    async create(@Body() data: any) {
        const config = await this.configService.create(data);
        return { success: true, message: 'Configuration created', data: config };
    }

    @Put(':id')
    @ApiOperation({ summary: 'Super Admin: Update system gateway configuration' })
    async update(@Param('id') id: string, @Body() data: any) {
        const config = await this.configService.update(id, data);
        return { success: true, message: 'Configuration updated', data: config };
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Super Admin: Delete system gateway configuration' })
    async remove(@Param('id') id: string) {
        await this.configService.remove(id);
        return { success: true, message: 'Configuration deleted' };
    }
}
