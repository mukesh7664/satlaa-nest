import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Store } from '../stores/entities/store.entity';
import { Product } from '../catalog/entities/product.entity';

@Injectable()
export class MarketplaceService {
    constructor(
        @InjectRepository(Store)
        private readonly storeRepository: Repository<Store>,
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
    ) {}

    async getGlobalStores() {
        return this.storeRepository.find({
            where: { 
                showInMarketplace: true,
                status: 'active' 
            },
            select: ['id', 'name', 'slug', 'createdAt'],
        });
    }

    async getGlobalProducts(limit: number = 20, offset: number = 0) {
        const [items, total] = await this.productRepository.findAndCount({
            where: { 
                showInMarketplace: true, 
                isActive: true,
                parentId: IsNull() // Only main products, not variants
            },
            relations: ['store', 'media', 'children'],
            take: limit,
            skip: offset,
            order: { createdAt: 'DESC' }
        });

        return { items, total };
    }

    async getStoreDetails(slug: string) {
        return this.storeRepository.findOne({
            where: { slug, showInMarketplace: true },
            relations: ['domains']
        });
    }

    async getGlobalProductDetails(id: string) {
        return this.productRepository.findOne({
            where: { id, showInMarketplace: true },
            relations: ['store', 'media', 'children', 'children.media', 'category', 'bundleItems', 'bundleItems.product']
        });
    }
}
