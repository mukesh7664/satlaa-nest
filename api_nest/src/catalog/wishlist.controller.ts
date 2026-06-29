import { Controller, Get, Post, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WishlistService } from './wishlist.service';
import { CatalogService } from './catalog.service';

@ApiTags('wishlist')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wishlist')
export class WishlistController {
    constructor(
        private readonly wishlistService: WishlistService,
        private readonly catalogService: CatalogService,
    ) { }

    @ApiOperation({ summary: 'Get user wishlist' })
    @ApiResponse({ status: 200, description: 'User wishlist.' })
    @Get()
    async getWishlist(@Request() req) {
        const storeId = req.tenant.id;
        const wishlistItems = await this.wishlistService.getWishlist(storeId, req.user.userId);
        
        return await Promise.all(
            wishlistItems.map(async (item) => ({
                ...item,
                product: await this.catalogService.transformProduct(item.product)
            }))
        );
    }

    @ApiOperation({ summary: 'Add product to wishlist' })
    @ApiBody({ schema: { type: 'object', properties: { productId: { type: 'string' } } } })
    @ApiResponse({ status: 201, description: 'Added to wishlist.' })
    @Post()
    async addToWishlist(@Request() req, @Body('productId') productId: string) {
        const storeId = req.tenant.id;
        return this.wishlistService.addToWishlist(storeId, req.user.userId, productId);
    }

    @ApiOperation({ summary: 'Remove product from wishlist' })
    @ApiParam({ name: 'productId', description: 'Product ID' })
    @ApiResponse({ status: 200, description: 'Removed from wishlist.' })
    @Delete(':productId')
    async removeFromWishlist(@Request() req, @Param('productId') productId: string) {
        const storeId = req.tenant.id;
        return this.wishlistService.removeFromWishlist(storeId, req.user.userId, productId);
    }
}

