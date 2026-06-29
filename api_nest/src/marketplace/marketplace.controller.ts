import { Controller, Get, Query, Param } from '@nestjs/common';
import { MarketplaceService } from './marketplace.service';

@Controller('global')
export class MarketplaceController {
    constructor(private readonly marketplaceService: MarketplaceService) {}

    @Get('stores')
    async getStores() {
        return this.marketplaceService.getGlobalStores();
    }

    @Get('products')
    async getProducts(
        @Query('limit') limit?: number,
        @Query('offset') offset?: number,
    ) {
        return this.marketplaceService.getGlobalProducts(limit, offset);
    }

    @Get('products/:id')
    async getProductDetails(@Param('id') id: string) {
        return this.marketplaceService.getGlobalProductDetails(id);
    }

    @Get('stores/:slug')
    async getStoreDetails(@Param('slug') slug: string) {
        return this.marketplaceService.getStoreDetails(slug);
    }
}
