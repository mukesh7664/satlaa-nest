import { Controller, Get, Post, Body, UseGuards, Request, Query, Res, Delete, Param } from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminRoleGuard } from '../auth/guards/admin-role.guard';
import { StorePaymentConfigService } from './store-payment-config.service';
import { UpsertStorePaymentConfigDto } from './dto/upsert-store-payment-config.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('admin-payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/settings/payment-gateways')
export class StorePaymentConfigController {
    constructor(private readonly configService: StorePaymentConfigService) { }

    @ApiOperation({ summary: 'Get payment configurations (masked)' })
    @Get()
    async getConfig(
        @Request() req,
        @Res({ passthrough: true }) res: Response
    ) {
        res.setHeader('Cache-Control', 'no-store');
        return this.configService.findByStore();
    }

    @ApiOperation({ summary: 'Get decrypted payment configurations (Admin only)' })
    @UseGuards(AdminRoleGuard)
    @Get('decrypted')
    async getDecryptedConfig(
        @Request() req, 
        @Res({ passthrough: true }) res: Response
    ) {
        res.setHeader('Cache-Control', 'no-store');
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.headers['user-agent'];
        return this.configService.getDecryptedByStore(req.user, ipAddress, userAgent);
    }

    @ApiOperation({ summary: 'Create or update payment configuration' })
    @Post()
    async upsertConfig(@Request() req, @Body() dto: UpsertStorePaymentConfigDto) {
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.headers['user-agent'];
        return this.configService.upsert(dto, req.user, ipAddress, userAgent);
    }

    @ApiOperation({ summary: 'Delete payment configuration' })
    @Delete(':provider')
    async deleteConfig(@Request() req, @Param('provider') provider: string) {
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.headers['user-agent'];
        return this.configService.delete(provider, req.user, ipAddress, userAgent);
    }
}
