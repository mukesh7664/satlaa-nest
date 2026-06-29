import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CheckoutService } from './checkout.service';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';
import { BadRequestException } from '@nestjs/common';

@ApiTags('checkout')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('checkout')
export class CheckoutController {
    constructor(private readonly checkoutService: CheckoutService) { }

    @ApiOperation({ summary: 'Validate checkout (pre-checkout check)' })
    @ApiResponse({ status: 200, description: 'Checkout validation result.' })
    @Post('validate')
    async validateCheckout(@Request() req, @CurrentTenant('id') storeId: string) {
        if (!storeId) throw new BadRequestException('Tenant not identified required for checkout.');
        return this.checkoutService.validateCheckout(req.user.customerId || req.user.userId, storeId);
    }

    @ApiOperation({ summary: 'Create order with payment' })
    @ApiResponse({ status: 201, description: 'Order and Razorpay order created.' })
    @Post('create-order')
    async createOrder(@Request() req, @Body() body: any, @CurrentTenant('id') storeId: string) {
        if (!storeId) throw new BadRequestException('Tenant not identified required for ordering.');
        const origin = req.headers.origin || req.headers.referer;
        return this.checkoutService.createOrder(req.user.customerId || req.user.userId, body, storeId, origin);
    }

    @ApiOperation({ summary: 'Get user orders' })
    @ApiResponse({ status: 200, description: 'List of orders.' })
    @Get('orders')
    async getUserOrders(@Request() req, @CurrentTenant('id') storeId: string) {
        if (!storeId) throw new BadRequestException('Tenant required');
        return this.checkoutService.getUserOrders(req.user.customerId || req.user.userId, storeId);
    }

    @ApiOperation({ summary: 'Get specific order' })
    @ApiParam({ name: 'orderId' })
    @ApiResponse({ status: 200, description: 'Order details.' })
    @Get('orders/:orderId')
    async getOrder(@Request() req, @Param('orderId') orderId: string, @CurrentTenant('id') storeId: string) {
        if (!storeId) throw new BadRequestException('Tenant required');
        return this.checkoutService.getOrder(req.user.customerId || req.user.userId, orderId, storeId);
    }
}
