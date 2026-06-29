import { Controller, Get, Post, Body, Param, Patch, Query, UseGuards, Delete, NotFoundException, Req } from '@nestjs/common';
import { InquiryService } from './inquiry.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('communication')
@Controller('communication/inquiry')
export class InquiryController {
    constructor(private readonly inquiryService: InquiryService) { }

    @ApiOperation({ summary: 'Submit a new inquiry (Lead, Inquiry, Contact Us)' })
    @ApiResponse({ status: 201, description: 'Inquiry submitted.' })
    @Post('')
    async createInquiry(@Body() body: CreateInquiryDto, @Req() req: any) {
        // Inject storeId from tenant context if not provided in body
        if (!body.storeId && req.tenant?.id) {
            body.storeId = req.tenant.id;
        }
        return this.inquiryService.createInquiry(body);
    }

    @ApiOperation({ summary: 'Admin: Get all inquiries' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('admin')
    async findAll(@Query() query: any, @Req() req: any) {
        const adminQuery = { ...query };
        if (req.user?.storeId) {
            adminQuery.storeId = req.user.storeId;
        }
        return this.inquiryService.findAll(adminQuery);
    }

    @ApiOperation({ summary: 'Admin: Get inquiry details' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('admin/:id')
    async findOneAdmin(@Param('id') id: string) {
        return this.inquiryService.findOne(id);
    }

    @ApiOperation({ summary: 'Admin: Update inquiry status' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Patch('admin/:id/status')
    async updateStatus(@Param('id') id: string, @Body() body: any) {
        if (!id || id === 'undefined' || id === 'null') {
            throw new NotFoundException('Invalid inquiry ID');
        }
        return this.inquiryService.updateStatus(id, body.status);
    }

    @ApiOperation({ summary: 'Admin: Delete inquiry' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Delete('admin/:id')
    async deleteInquiry(@Param('id') id: string) {
        if (!id || id === 'undefined' || id === 'null') {
            throw new NotFoundException('Invalid inquiry ID');
        }
        await this.inquiryService.deleteInquiry(id);
        return { success: true, message: 'Inquiry deleted' };
    }
}
