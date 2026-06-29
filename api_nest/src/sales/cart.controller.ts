import { Controller, Get, Post, Body, Delete, Param, UseGuards, Request, Query } from '@nestjs/common';
import { CartService } from './cart.service';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBody } from '@nestjs/swagger';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

@ApiTags('sales')
@UseGuards(OptionalJwtAuthGuard)
@Controller('cart')
export class CartController {
    constructor(private readonly cartService: CartService) { }
    
    @ApiOperation({ summary: 'Merge guest cart into user cart' })
    @ApiQuery({ name: 'sessionId', required: true })
    @Post('/merge')
    async mergeCart(@Query('sessionId') sessionId: string, @Request() req) {
        const storeId = req.tenant.id;
        const customerId = req.user?.customerId || req.user?.userId;
        if (!customerId) return { message: 'User not logged in' };
        return this.cartService.mergeCarts(storeId, customerId, sessionId);
    }

    @ApiOperation({ summary: 'Get current cart (by user or session)' })
    @ApiQuery({ name: 'sessionId', required: false })
    @ApiResponse({ status: 200, description: 'Return cart details.' })
    @Get()
    async getCart(@Query('sessionId') sessionId: string, @Request() req) {
        const storeId = req.tenant.id;
        const customerId = req.user?.customerId || req.user?.userId;
        return this.cartService.findOrCreateCart(storeId, customerId, sessionId);
    }

    @ApiOperation({ summary: 'Clear cart' })
    @ApiQuery({ name: 'sessionId', required: false })
    @ApiResponse({ status: 200, description: 'Cart cleared.' })
    @Delete()
    async clearCart(@Query('sessionId') sessionId: string, @Request() req) {
        const storeId = req.tenant.id;
        const customerId = req.user?.customerId || req.user?.userId;
        return this.cartService.clearCart(storeId, customerId, sessionId);
    }

    @ApiOperation({ summary: 'Add item to cart' })
    @ApiQuery({ name: 'sessionId', required: false })
    @ApiResponse({ status: 201, description: 'Item added.' })
    @Post('/items')
    async addItem(@Body() body: AddCartItemDto, @Query('sessionId') sessionId: string, @Request() req) {
        const storeId = req.tenant.id;
        const customerId = req.user?.customerId || req.user?.userId;
        return this.cartService.addToCart(storeId, customerId, sessionId, body);
    }

    @ApiOperation({ summary: 'Remove item from cart' })
    @ApiQuery({ name: 'sessionId', required: false })
    @ApiResponse({ status: 200, description: 'Item removed.' })
    @Delete('/items/:id')
    async removeItem(@Param('id') id: string, @Query('sessionId') sessionId: string, @Request() req) {
        const storeId = req.tenant.id;
        const customerId = req.user?.customerId || req.user?.userId;
        return this.cartService.removeItem(storeId, customerId, sessionId, id);
    }

    @ApiOperation({ summary: 'Update item quantity' })
    @ApiQuery({ name: 'sessionId', required: false })
    @ApiBody({ schema: { type: 'object', properties: { quantity: { type: 'number' } } } })
    @ApiResponse({ status: 200, description: 'Quantity updated.' })
    @Post('/items/:id') // Use POST or PATCH. User might prefer POST for simplicity or if they follow a pattern.
    async updateItem(@Param('id') id: string, @Body('quantity') quantity: number, @Query('sessionId') sessionId: string, @Request() req) {
        const storeId = req.tenant.id;
        const customerId = req.user?.customerId || req.user?.userId;
        return this.cartService.updateItemQuantity(storeId, customerId, sessionId, id, quantity);
    }

    @ApiOperation({ summary: 'Apply discount code' })
    @ApiQuery({ name: 'sessionId', required: false })
    @ApiBody({ schema: { type: 'object', properties: { code: { type: 'string' } } } })
    @ApiResponse({ status: 200, description: 'Discount applied.' })
    @ApiResponse({ status: 400, description: 'Invalid discount.' })
    @Post('/discount')
    async applyDiscount(@Body('code') code: string, @Query('sessionId') sessionId: string, @Request() req) {
        const storeId = req.tenant.id;
        const customerId = req.user?.customerId || req.user?.userId;
        return this.cartService.applyDiscount(storeId, customerId, sessionId, code);
    }

    @ApiOperation({ summary: 'Remove applied discount' })
    @ApiQuery({ name: 'sessionId', required: false })
    @ApiResponse({ status: 200, description: 'Discount removed.' })
    @Delete('/discount')
    async removeDiscount(@Query('sessionId') sessionId: string, @Request() req) {
        const storeId = req.tenant.id;
        const customerId = req.user?.customerId || req.user?.userId;
        return this.cartService.removeDiscount(storeId, customerId, sessionId);
    }
}

