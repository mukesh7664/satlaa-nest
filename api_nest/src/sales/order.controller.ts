import { Controller, Get, Post, Body, UseGuards, Request, Param, Patch } from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { CreateOrderDto } from './dto/create-order.dto';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';
import { BadRequestException } from '@nestjs/common';

@ApiTags('sales')
@Controller('orders')
export class OrderController {
    constructor(private readonly orderService: OrderService) { }

    @ApiOperation({ summary: 'Place an order from current cart' })
    @ApiResponse({ status: 201, description: 'Order created successfully.' })
    @ApiResponse({ status: 400, description: 'Cart empty or invalid.' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post()
    async placeOrder(@Request() req, @Body() body: CreateOrderDto, @CurrentTenant('id') storeId: string) {
        if (!storeId) throw new BadRequestException('Tenant not identified required for ordering.');
        return this.orderService.createOrderFromCart(req.user.customerId || req.user.userId, body, storeId);
    }

    @ApiOperation({ summary: 'Get all orders for the current user' })
    @ApiResponse({ status: 200, description: 'List of orders.' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get()
    async getMyOrders(@Request() req, @CurrentTenant('id') storeId: string) {
        if (!storeId) throw new BadRequestException('Tenant required');
        const orders = await this.orderService.findAllOrders(req.user.customerId || req.user.userId, storeId);
        return { data: orders };
    }

    @ApiOperation({ summary: 'Get details of a specific order' })
    @ApiParam({ name: 'id', description: 'Order ID' })
    @ApiResponse({ status: 200, description: 'Order details.' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async getOrder(@Param('id') id: string, @Request() req, @CurrentTenant('id') storeId: string) {
        if (!storeId) throw new BadRequestException('Tenant required');
        return this.orderService.findOneOrder(id, req.user.customerId || req.user.userId, storeId);
    }

    // NOTE: This usually would be an Admin only or Webhook endpoint
    // For now, implementing as a simple protected endpoint for testing flow
    @ApiOperation({ summary: 'Update order status (Mock/Admin)' })
    @ApiParam({ name: 'id', description: 'Order ID' })
    @ApiBody({ schema: { type: 'object', properties: { status: { type: 'string' }, paymentInfo: { type: 'object' } } } })
    @ApiResponse({ status: 200, description: 'Status updated.' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Patch(':id/status')
    async updateStatus(@Param('id') id: string, @Body() body: { status: string, paymentInfo?: any }, @CurrentTenant('id') storeId: string) {
        if (!storeId) throw new BadRequestException('Tenant required for updates');
        return this.orderService.updateStatus(id, body.status as any, body.paymentInfo, storeId);
    }

    @ApiOperation({ summary: 'Cancel an order' })
    @ApiParam({ name: 'id', description: 'Order ID' })
    @ApiBody({ schema: { type: 'object', properties: { reason: { type: 'string' } } } })
    @ApiResponse({ status: 200, description: 'Order cancelled successfully.' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post(':id/cancel')
    async cancelOrder(@Param('id') id: string, @Body() body: { reason: string }, @Request() req, @CurrentTenant('id') storeId: string) {
        if (!storeId) throw new BadRequestException('Tenant required');
        return this.orderService.cancelOrder(id, body.reason, req.user.customerId || req.user.userId, storeId);
    }
}
