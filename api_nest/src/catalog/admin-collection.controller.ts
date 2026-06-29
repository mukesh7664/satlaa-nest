import { Controller, Get, Post, Put, Delete, Patch, Param, Body, UseGuards, Query, Request, NotFoundException, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuditLogInterceptor } from '../admin/audit-log.interceptor';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Collection } from './entities/collection.entity';
import { CollectionProduct } from './entities/collection-product.entity';
import { CatalogService } from './catalog.service';
import { Product } from './entities/product.entity';

@ApiTags('admin/collections')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseInterceptors(AuditLogInterceptor)
@Controller('admin/collections')
export class AdminCollectionController {
    constructor(
        @InjectRepository(Collection)
        private collectionRepository: Repository<Collection>,
        @InjectRepository(CollectionProduct)
        private collectionProductRepository: Repository<CollectionProduct>,
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
        private catalogService: CatalogService,
    ) { }

    @ApiOperation({ summary: 'Admin: Get all collections' })
    @Get()
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'search', required: false })
    async getAllCollections(
        @Query('page') page = 1,
        @Query('limit') limit = 10,
        @Query('search') search: string,
        @Request() req: any
    ) {
        const storeId = req.user?.storeId;
        const whereCond: any = {};
        if (storeId) whereCond.storeId = storeId;
        
        const query: any = {
            order: { createdAt: 'DESC' },
            take: Number(limit),
            skip: (Number(page) - 1) * Number(limit),
            where: whereCond,
        };

        if (search) {
            query.where = [
                { ...whereCond, name: Like(`%${search}%`) },
                { ...whereCond, slug: Like(`%${search}%`) },
            ];
        }

        const [items, total] = await this.collectionRepository.findAndCount(query);

        return {
            collections: items,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / Number(limit))
            }
        };
    }

    @ApiOperation({ summary: 'Admin: Get collection by slug' })
    @ApiParam({ name: 'slug' })
    @Get('slug/:slug')
    async getCollectionBySlug(@Param('slug') slug: string, @Request() req: any) {
        const storeId = req.user?.storeId;
        const whereCond: any = { slug };
        if (storeId) whereCond.storeId = storeId;
        const collection = await this.collectionRepository.findOne({ where: whereCond });
        return { success: true, collection };
    }

    @ApiOperation({ summary: 'Admin: Sync all automatic collections' })
    @Post('sync-all')
    async syncAllCollections(@Request() req: any) {
        const storeId = req.user?.storeId;
        // TODO: implement automatic collection sync logic
        return { success: true, message: 'Collections synced' };
    }

    @ApiOperation({ summary: 'Admin: Get collection by ID' })
    @ApiParam({ name: 'id' })
    @Get(':id')
    async getCollectionById(@Param('id') id: string, @Request() req: any) {
        const storeId = req.user?.storeId;
        const whereCond: any = { id };
        if (storeId) whereCond.storeId = storeId;
        const collection = await this.collectionRepository.findOne({ where: whereCond });
        return { success: true, collection };
    }

    @ApiOperation({ summary: 'Admin: Create collection' })
    @Post()
    async createCollection(@Body() body: any, @Request() req: any) {
        const storeId = req.user?.storeId;
        const colData = { ...body };
        if (storeId) colData.storeId = storeId;
        
        const collection = this.collectionRepository.create(colData);
        return this.collectionRepository.save(collection);
    }

    @ApiOperation({ summary: 'Admin: Update collection' })
    @ApiParam({ name: 'id' })
    @Put(':id')
    async updateCollection(@Param('id') id: string, @Body() body: any, @Request() req: any) {
        const storeId = req.user?.storeId;
        const whereCond: any = { id };
        if (storeId) whereCond.storeId = storeId;
        
        const collection = await this.collectionRepository.findOne({ where: whereCond });
        if (!collection) throw new NotFoundException('Collection not found');
        
        Object.assign(collection, body);
        return this.collectionRepository.save(collection);
    }

    @ApiOperation({ summary: 'Admin: Delete collection' })
    @ApiParam({ name: 'id' })
    @Delete(':id')
    async deleteCollection(@Param('id') id: string, @Request() req: any) {
        const storeId = req.user?.storeId;
        const whereCond: any = { id };
        if (storeId) whereCond.storeId = storeId;
        
        const collection = await this.collectionRepository.findOne({ where: whereCond });
        if (!collection) throw new NotFoundException('Collection not found');
        
        await this.collectionRepository.delete(id);
        return { success: true, message: 'Collection deleted' };
    }

    @ApiOperation({ summary: 'Admin: Add products to collection' })
    @ApiParam({ name: 'id' })
    @Post(':id/products')
    async addProducts(@Param('id') id: string, @Body() body: { productIds: string[] }, @Request() req: any) {
        const storeId = req.user?.storeId;
        const whereCond: any = { id };
        if (storeId) whereCond.storeId = storeId;
        
        const collection = await this.collectionRepository.findOne({ where: whereCond });
        if (!collection) throw new NotFoundException('Collection not found');

        // Get current max sort order
        const maxSortOrder = await this.collectionProductRepository
            .createQueryBuilder('cp')
            .where('cp.collection_id = :collectionId', { collectionId: id })
            .select('MAX(cp.sort_order)', 'max')
            .getRawOne();
        
        let nextSortOrder = (maxSortOrder?.max || 0) + 1;

        const productIds = body.productIds || [];
        for (const productId of productIds) {
            // Check if already exists
            const exists = await this.collectionProductRepository.findOne({
                where: { collectionId: id, productId }
            });

            if (!exists) {
                const cp = this.collectionProductRepository.create({
                    collectionId: id,
                    productId,
                    sortOrder: nextSortOrder++
                });
                await this.collectionProductRepository.save(cp);
            }
        }

        return { success: true };
    }

    @ApiOperation({ summary: 'Admin: Remove products from collection' })
    @ApiParam({ name: 'id' })
    @Delete(':id/products')
    async removeProducts(@Param('id') id: string, @Body() body: { productIds: string[] }, @Request() req: any) {
        const storeId = req.user?.storeId;
        const whereCond: any = { id };
        if (storeId) whereCond.storeId = storeId;
        
        const collection = await this.collectionRepository.findOne({ where: whereCond });
        if (!collection) throw new NotFoundException('Collection not found');

        const productIds = body.productIds || [];
        if (productIds.length > 0) {
            await this.collectionProductRepository
                .createQueryBuilder()
                .delete()
                .where('collection_id = :id AND product_id IN (:...productIds)', { id, productIds })
                .execute();
        }

        return { success: true };
    }

    @ApiOperation({ summary: 'Admin: Get collection products' })
    @ApiParam({ name: 'id' })
    @Get(':id/products')
    async getCollectionProducts(@Param('id') id: string, @Request() req: any) {
        const storeId = req.user?.storeId;
        const whereCond: any = { id };
        if (storeId) whereCond.storeId = storeId;
        
        const collection = await this.collectionRepository.findOne({ where: whereCond });
        if (!collection) throw new NotFoundException('Collection not found');

        const collectionProducts = await this.collectionProductRepository.find({
            where: { collectionId: id },
            relations: ['product', 'product.media'],
            order: { sortOrder: 'ASC' }
        });

        const products = await Promise.all(
            collectionProducts.map(async (cp) => {
                const transformed = await this.catalogService.transformProduct(cp.product);
                return {
                    ...transformed,
                    sortOrder: cp.sortOrder
                };
            })
        );

        return { collection, products };
    }

    @ApiOperation({ summary: 'Admin: Reorder products in collection' })
    @ApiParam({ name: 'id' })
    @Patch(':id/products/reorder')
    async reorderProducts(@Param('id') id: string, @Body() body: { productIds: string[] }, @Request() req: any) {
        const storeId = req.user?.storeId;
        const whereCond: any = { id };
        if (storeId) whereCond.storeId = storeId;
        
        const collection = await this.collectionRepository.findOne({ where: whereCond });
        if (!collection) throw new NotFoundException('Collection not found');

        const productIds = body.productIds || [];
        for (let i = 0; i < productIds.length; i++) {
            await this.collectionProductRepository.update(
                { collectionId: id, productId: productIds[i] },
                { sortOrder: i + 1 }
            );
        }

        return { success: true };
    }

    @ApiOperation({ summary: 'Admin: Toggle collection status' })
    @ApiParam({ name: 'id' })
    @Patch(':id/status')
    async toggleStatus(@Param('id') id: string, @Request() req: any) {
        const storeId = req.user?.storeId;
        const whereCond: any = { id };
        if (storeId) whereCond.storeId = storeId;
        
        const collection = await this.collectionRepository.findOne({ where: whereCond });
        if (!collection) throw new NotFoundException('Collection not found');
        
        collection.isActive = !collection.isActive;
        return this.collectionRepository.save(collection);
    }
}
