import { Controller, Get, Param, UseGuards, Request, Post, Put, Delete, Body, Query } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
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
    async getMyInvoices(@Request() req, @Query() query: any) {
        return this.invoiceService.findAllInvoices(req.user.userId, query);
    }

    @ApiOperation({ summary: 'Get details of specific invoice' })
    @ApiParam({ name: 'id', description: 'Invoice ID' })
    @ApiResponse({ status: 200, description: 'Invoice details.' })
    @ApiResponse({ status: 404, description: 'Invoice not found.' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('invoice/:id')
    async getInvoice(@Param('id') id: string, @Request() req) {
        return this.invoiceService.findOneInvoice(id, req.user.userId);
    }

    // ── Admin ───────────────────────────────────────────────────────────
    @ApiOperation({ summary: 'Admin: Create invoice' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post('admin/invoices')
    async createInvoice(@Body() body: any, @Request() req: any) {
        return this.invoiceService.createInvoice({ ...body, createdById: req.user.userId });
    }

    @ApiOperation({ summary: 'Admin: Generate invoice from order' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post('admin/invoices/generate/:orderId')
    async generateFromOrder(@Param('orderId') orderId: string, @Request() req: any) {
        return this.invoiceService.createInvoiceFromOrder(orderId, req.user.userId);
    }

    @ApiOperation({ summary: 'Admin: Get all invoices' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('admin/invoices')
    async getAllInvoices(@Query() query: any, @Request() req: any) {
        return this.invoiceService.findAllInvoices(undefined, query);
    }

    @ApiOperation({ summary: 'Admin: Get invoice by ID' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('admin/invoices/:id')
    async getInvoiceById(@Param('id') id: string, @Request() req: any) {
        const invoice = await this.invoiceService.findOneInvoice(id, undefined);
        return { data: invoice };
    }

    @ApiOperation({ summary: 'Admin: Update invoice' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Put('admin/invoices/:id')
    async updateInvoice(@Param('id') id: string, @Body() body: any, @Request() req: any) {
        const updated = await this.invoiceService.updateInvoice(id, body);
        return { success: true, message: 'Invoice updated', data: { ...updated, _id: updated.id } };
    }

    @ApiOperation({ summary: 'Admin: Delete invoice' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Delete('admin/invoices/:id')
    async deleteInvoice(@Param('id') id: string, @Request() req: any) {
        await this.invoiceService.deleteInvoice(id);
        return { success: true, message: 'Invoice deleted' };
    }

    @ApiOperation({ summary: 'Admin: Generate PDF' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post('admin/invoices/:id/generate-pdf')
    async generatePDF(@Param('id') id: string, @Request() req: any) {
        const url = await this.invoiceService.generateAndStorePdf(id);
        return { success: true, message: 'PDF generated and stored', data: { pdfUrl: url } };
    }

    @ApiOperation({ summary: 'Admin: Send invoice' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post('admin/invoices/:id/send')
    async sendInvoice(@Param('id') id: string, @Request() req: any) {
        return this.invoiceService.sendInvoice(id);
    }

    @ApiOperation({ summary: 'Admin: Add payment' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post('admin/invoices/:id/payments')
    async addPayment(@Param('id') id: string, @Body() body: any, @Request() req: any) {
        // This would call service to add payment
        return { success: true, message: 'Payment added', transactionId: 'TXN-MOCK' };
    }
}
