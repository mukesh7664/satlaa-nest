import { Controller, Get, Post, Patch, Body, Param, UseGuards, Req, ForbiddenException, Query } from '@nestjs/common';
import { ReturnRequestService } from './return-request.service';
import { ReturnRequestStatus, ReturnRequestType } from './entities/return-request.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminRoleGuard } from '../auth/guards/admin-role.guard';

@Controller('return-requests')
@UseGuards(JwtAuthGuard)
export class ReturnRequestController {
    constructor(private readonly returnRequestService: ReturnRequestService) {}

    // Customer Endpoints
    @Post('bulk')
    async createBulk(@Req() req: any, @Body() data: {
        orderId: string;
        itemIds?: string[];
        type: ReturnRequestType;
        reason: string;
        images?: string[];
        customerNotes?: string;
        replacementVariantId?: string;
        replacementVariantInfo?: any;
    }) {
        const customerId = req.user.customerId || req.user.userId || req.user.id;
        return this.returnRequestService.createBulkRequest(customerId, data);
    }

    @Post()
    async create(@Req() req: any, @Body() data: {
        orderId: string;
        orderItemId: string;
        type: ReturnRequestType;
        reason: string;
        images?: string[];
        customerNotes?: string;
        replacementVariantId?: string;
        replacementVariantInfo?: any;
    }) {
        const customerId = req.user.customerId || req.user.userId || req.user.id;
        return this.returnRequestService.createRequest(customerId, data);
    }

    @Get('my')
    async findMyRequests(@Req() req: any) {
        const customerId = req.user.id;
        return this.returnRequestService.findAll(customerId);
    }

    // Admin Endpoints
    @Get('admin')
    @UseGuards(AdminRoleGuard)
    async findAllAdmin(
        @Req() req: any,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        return this.returnRequestService.findAll(undefined, startDate, endDate);
    }

    @Get(':id')
    async findOne(@Param('id') id: string, @Req() req: any) {
        return this.returnRequestService.findOne(id);
    }

    @Patch(':id/status')
    @UseGuards(AdminRoleGuard)
    async updateStatus(
        @Param('id') id: string,
        @Req() req: any,
        @Body() data: {
            status: ReturnRequestStatus;
            adminNotes?: string;
            refundAmount?: number;
            addToInventory?: boolean;
        },
    ) {
        return this.returnRequestService.updateStatus(id, data);
    }
}
