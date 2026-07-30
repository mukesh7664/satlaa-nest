import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PosRoleGuard } from '../auth/guards/pos-role.guard';
import { PosService } from './pos.service';
import { CreatePosSaleDto } from './dto/create-pos-sale.dto';
import { CreateCourierDto, UpdateCourierDto } from './dto/courier.dto';
import { SaleChannel } from '../sales/entities/order.entity';

@ApiTags('pos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PosRoleGuard)
@Controller('pos')
export class PosController {
    constructor(private readonly posService: PosService) { }

    @ApiOperation({ summary: 'Search products/variants for billing' })
    @Get('products')
    async searchProducts(@Query('search') search: string) {
        const data = await this.posService.searchProducts(search);
        return { data };
    }

    @ApiOperation({ summary: 'Look up a customer by phone' })
    @Get('customers')
    async lookupCustomer(@Query('phone') phone: string) {
        const data = await this.posService.lookupCustomerByPhone(phone);
        return { data };
    }

    @ApiOperation({ summary: 'Create a walk-in customer' })
    @Post('customers')
    async createCustomer(@Body() body: { name: string; phone?: string; city?: string; email?: string }) {
        const data = await this.posService.createWalkInCustomer(body);
        return { data };
    }

    @ApiOperation({ summary: 'Create a POS sale (decrements stock, generates receipt)' })
    @Post('sales')
    async createSale(@Request() req, @Body() body: CreatePosSaleDto) {
        const operatorId = req.user.userId;
        return this.posService.createSale(body, operatorId);
    }

    @ApiOperation({ summary: 'List POS sales' })
    @Get('sales')
    async listSales(
        @Query('channel') channel?: SaleChannel,
        @Query('operatorId') operatorId?: string,
        @Query('courierId') courierId?: string,
        @Query('from') from?: string,
        @Query('to') to?: string,
    ) {
        const data = await this.posService.listSales({ channel, operatorId, courierId, from, to });
        return { data };
    }

    // ---- Couriers ----
    @ApiOperation({ summary: 'List couriers' })
    @Get('couriers')
    async listCouriers(@Query('includeInactive') includeInactive?: string) {
        const data = await this.posService.listCouriers(includeInactive === 'true');
        return { data };
    }

    @ApiOperation({ summary: 'Create courier' })
    @Post('couriers')
    async createCourier(@Body() body: CreateCourierDto) {
        const data = await this.posService.createCourier(body);
        return { data };
    }

    @ApiOperation({ summary: 'Update courier' })
    @Put('couriers/:id')
    async updateCourier(@Param('id', ParseUUIDPipe) id: string, @Body() body: UpdateCourierDto) {
        const data = await this.posService.updateCourier(id, body);
        return { data };
    }

    @ApiOperation({ summary: 'Deactivate courier' })
    @Delete('couriers/:id')
    async deleteCourier(@Param('id', ParseUUIDPipe) id: string) {
        return this.posService.deleteCourier(id);
    }

    // ---- Staff ----
    @ApiOperation({ summary: 'List staff/operators for attribution' })
    @Get('staff')
    async listStaff() {
        const data = await this.posService.listStaff();
        return { data };
    }

    // ---- Reports ----
    @ApiOperation({ summary: 'Staff-wise sales report' })
    @Get('reports/staff')
    async staffReport(@Query('from') from?: string, @Query('to') to?: string) {
        const data = await this.posService.staffReport(from, to);
        return { data };
    }

    @ApiOperation({ summary: 'Courier-wise sales report' })
    @Get('reports/courier')
    async courierReport(@Query('from') from?: string, @Query('to') to?: string) {
        const data = await this.posService.courierReport(from, to);
        return { data };
    }
}
