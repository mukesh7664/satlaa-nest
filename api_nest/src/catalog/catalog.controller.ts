import { Controller, Get, Post, Body, Param, Query, UseGuards, NotFoundException, BadRequestException } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';

import { CategoriesService } from './categories.service';

@ApiTags('catalog')
@Controller('')
export class CatalogController {
    constructor(
        private readonly catalogService: CatalogService,
        private readonly categoriesService: CategoriesService
    ) { }

    // Products
    @ApiOperation({ summary: 'Get all products' })
    @ApiResponse({ status: 200, description: 'List of products.' })
    @Get('products')
    async getAllProducts(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('brand') brand?: string,
        @Query('category') category?: string,
        @Query('collection') collection?: string,
        @Query('tags') tags?: string,
        @Query('flags') flags?: string,
        @Query('minPrice') minPrice?: string,
        @Query('maxPrice') maxPrice?: string,
        @Query('rating') rating?: string,
        @Query('search') search?: string,
        @Query('sortBy') sortBy?: string,
        @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    ) {
        const result = await this.catalogService.findAllProductsPaginated({
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 12,
            brand,
            category,
            collection,
            tags,
            flags,
            minPrice: minPrice ? parseFloat(minPrice) : undefined,
            maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
            rating: rating ? parseInt(rating) : undefined,
            search,
            sortBy,
            sortOrder,
        });
        return { success: true, data: result.products, pagination: result.pagination };
    }

    @ApiOperation({ summary: 'Get product by slug or ID' })
    @ApiParam({ name: 'idOrSlug', description: 'Product ID (UUID) or slug' })
    @ApiResponse({ status: 200, description: 'Product details.' })
    @Get('products/:idOrSlug')
    async getProduct(@Param('idOrSlug') idOrSlug: string) {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
        const product = isUUID
            ? await this.catalogService.findOneProduct(idOrSlug)
            : await this.catalogService.findProductBySlug(idOrSlug);

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        const transformed = await this.catalogService.transformProduct(product);
        return { success: true, data: transformed };
    }

    @ApiOperation({ summary: 'Create a new product' })
    @ApiResponse({ status: 201, description: 'Product created.' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post('products')
    async createProduct(@Body() createProductDto: any) {
        return this.catalogService.createProduct(createProductDto);
    }

    // Collections
    @ApiOperation({ summary: 'Get all collections' })
    @ApiResponse({ status: 200, description: 'List of collections.' })
    @Get('collections')
    async getCollections(@Query('page') page?: string, @Query('limit') limit?: string, @Query('type') type?: string, @Query('search') search?: string) {
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 50;
        const result = await this.catalogService.findAllCollectionsPaginated(pageNum, limitNum, type, search);
        return {
            success: true,
            collections: result.collections,
            pagination: result.pagination,
        };
    }

    @ApiOperation({ summary: 'Get collections for filter sidebar' })
    @Get('collections/filters')
    async getFilterCollections() {
        const collections = await this.catalogService.findFilterCollections();
        return { success: true, collections };
    }

    @ApiOperation({ summary: 'Get category by slug' })
    @ApiParam({ name: 'slug', description: 'Category slug' })
    @Get('categories/slug/:slug')
    async getCategoryBySlug(@Param('slug') slug: string) {
        const category = await this.categoriesService.findBySlug(slug);
        return { success: true, category };
    }

    @ApiOperation({ summary: 'Get all categories for storefront' })
    @Get('categories')
    async getCategories() {
        const categories = await this.categoriesService.findAll();
        return { success: true, categories };
    }

    @ApiOperation({ summary: 'Get all filters for storefront' })
    @Get('filters')
    async getFilters(
        @Query('category') category: string,
    ) {
        const filters = await this.catalogService.getFilters(category);
        return { success: true, filters };
    }

    @ApiOperation({ summary: 'Get collection by slug with products' })
    @ApiParam({ name: 'slug', description: 'Collection slug' })
    @Get('collections/slug/:slug')
    async getCollectionBySlug(@Param('slug') slug: string, @Query('page') page?: string, @Query('limit') limit?: string) {
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 20;
        const result = await this.catalogService.findCollectionBySlug(slug, pageNum, limitNum);
        return {
            success: true,
            collection: result.collection,
            pagination: result.pagination,
        };
    }

    @ApiOperation({ summary: 'Get collection by ID with products' })
    @ApiParam({ name: 'id', description: 'Collection ID' })
    @Get('collections/:id')
    async getCollectionById(@Param('id') id: string, @Query('page') page?: string, @Query('limit') limit?: string) {
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 20;
        const result = await this.catalogService.findCollectionById(id, pageNum, limitNum);
        return {
            success: true,
            collection: result.collection,
            pagination: result.pagination,
        };
    }

    // ================= REVIEWS =================

    @ApiOperation({ summary: 'Get approved reviews for a product' })
    @Get('products/:productId/reviews')
    async getProductReviews(
        @Param('productId') productId: string,
    ) {
        const reviews = await this.catalogService.findApprovedReviews(productId);
        return { success: true, data: reviews };
    }

    @ApiOperation({ summary: 'Submit review for a product' })
    @Post('products/:productId/reviews')
    async submitProductReview(
        @Param('productId') productId: string,
        @Body() dto: { customerName: string; customerEmail?: string; rating: number; comment: string },
    ) {
        if (!dto.customerName || !dto.rating || !dto.comment) {
            throw new BadRequestException('Required fields: customerName, rating, comment');
        }
        if (dto.rating < 1 || dto.rating > 5) {
            throw new BadRequestException('Rating must be between 1 and 5');
        }
        const review = await this.catalogService.submitReview(productId, dto);
        return { success: true, data: review };
    }
}
