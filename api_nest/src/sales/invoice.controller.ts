import { Controller, Get, Param, UseGuards, Request, Post, Put, Delete, Body, Query } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';
import { BadRequestException } from '@nestjs/common';

@ApiTags('sales')
@Controller('')
export class InvoiceController {
    constructor(private readonly invoiceService: InvoiceService) { }

    @ApiOperation({ summary: 'Get all invoices for current user' })
    @ApiResponse({ status: 200, description: 'List of invoices.' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('invoice')
    async getMyInvoices(@Request() req, @Query() query: any, @CurrentTenant('id') storeId: string) {
        if (!storeId) throw new BadRequestException('Tenant required');
        return this.invoiceService.findAllInvoices(req.user.userId, storeId, query);
    }

    @ApiOperation({ summary: 'Get details of specific invoice' })
    @ApiParam({ name: 'id', description: 'Invoice ID' })
    @ApiResponse({ status: 200, description: 'Invoice details.' })
    @ApiResponse({ status: 404, description: 'Invoice not found.' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('invoice/:id')
    async getInvoice(@Param('id') id: string, @Request() req, @CurrentTenant('id') storeId: string) {
        if (!storeId) throw new BadRequestException('Tenant required');
        return this.invoiceService.findOneInvoice(id, req.user.userId, storeId);
    }

    // ── Admin ───────────────────────────────────────────────────────────
    @ApiOperation({ summary: 'Admin: Create invoice' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post('admin/invoices')
    async createInvoice(@Body() body: any, @Request() req: any) {
        const storeId = req.user.storeId;
        if (!storeId) throw new BadRequestException('Tenant required');
        return this.invoiceService.createInvoice({ ...body, storeId, createdById: req.user.userId });
    }

    @ApiOperation({ summary: 'Admin: Generate invoice from order' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post('admin/invoices/generate/:orderId')
    async generateFromOrder(@Param('orderId') orderId: string, @Request() req: any) {
        const storeId = req.user.storeId;
        if (!storeId) throw new BadRequestException('Tenant required');
        return this.invoiceService.createInvoiceFromOrder(orderId, storeId, req.user.userId);
    }

    @ApiOperation({ summary: 'Admin: Get all invoices' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('admin/invoices')
    async getAllInvoices(@Query() query: any, @Request() req: any) {
        const storeId = req.user.storeId;
        if (!storeId) throw new BadRequestException('Tenant required');
        return this.invoiceService.findAllInvoices(undefined, storeId, query);
    }

    @ApiOperation({ summary: 'Admin: Get invoice by ID' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('admin/invoices/:id')
    async getInvoiceById(@Param('id') id: string, @Request() req: any) {
        const storeId = req.user.storeId;
        if (!storeId) throw new BadRequestException('Tenant required');
        const invoice = await this.invoiceService.findOneInvoice(id, undefined, storeId);
        return { data: invoice };
    }

    @ApiOperation({ summary: 'Admin: Update invoice' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Put('admin/invoices/:id')
    async updateInvoice(@Param('id') id: string, @Body() body: any, @Request() req: any) {
        const storeId = req.user.storeId;
        if (!storeId) throw new BadRequestException('Tenant required');
        const updated = await this.invoiceService.updateInvoice(id, body, storeId);
        return { success: true, message: 'Invoice updated', data: { ...updated, _id: updated.id } };
    }

    @ApiOperation({ summary: 'Admin: Delete invoice' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Delete('admin/invoices/:id')
    async deleteInvoice(@Param('id') id: string, @Request() req: any) {
        const storeId = req.user.storeId;
        if (!storeId) throw new BadRequestException('Tenant required');
        await this.invoiceService.deleteInvoice(id, storeId);
        return { success: true, message: 'Invoice deleted' };
    }

    @ApiOperation({ summary: 'Admin: Generate PDF' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post('admin/invoices/:id/generate-pdf')
    async generatePDF(@Param('id') id: string, @Request() req: any) {
        const storeId = req.user.storeId;
        if (!storeId) throw new BadRequestException('Tenant required');
        const url = await this.invoiceService.generateAndStorePdf(id, storeId);
        return { success: true, message: 'PDF generated and stored', data: { pdfUrl: url } };
    }

    @ApiOperation({ summary: 'Admin: Send invoice' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post('admin/invoices/:id/send')
    async sendInvoice(@Param('id') id: string, @Request() req: any) {
        const storeId = req.user.storeId;
        if (!storeId) throw new BadRequestException('Tenant required');
        return this.invoiceService.sendInvoice(id, storeId);
    }

    @ApiOperation({ summary: 'Admin: Add payment' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post('admin/invoices/:id/payments')
    async addPayment(@Param('id') id: string, @Body() body: any, @Request() req: any) {
        const storeId = req.user.storeId;
        if (!storeId) throw new BadRequestException('Tenant required');
        // This would call service to add payment
        return { success: true, message: 'Payment added', transactionId: 'TXN-MOCK' };
    }
}
