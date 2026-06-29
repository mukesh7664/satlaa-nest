import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionsService } from './subscriptions.service';
import { Product } from '../catalog/entities/product.entity';
import { Page } from '../cms/entities/page.entity';
import { StoreDomain } from '../stores/entities/store-domain.entity';
import { Media } from '../cms/entities/media.entity';
import { Admin } from '../admin/entities/admin.entity';

@Injectable()
export class PlanLimitsService {
    constructor(
        private readonly subscriptionsService: SubscriptionsService,
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
        @InjectRepository(Page)
        private readonly pageRepository: Repository<Page>,
        @InjectRepository(StoreDomain)
        private readonly domainRepository: Repository<StoreDomain>,
        @InjectRepository(Media)
        private readonly mediaRepository: Repository<Media>,
        @InjectRepository(Admin)
        private readonly adminRepository: Repository<Admin>,
    ) { }

    async checkLimit(storeId: string, feature: 'products' | 'pages' | 'custom_domains') {
        const subscription = await this.subscriptionsService.getStoreSubscription(storeId);
        if (!subscription || subscription.status !== 'active') {
            throw new BadRequestException('No active subscription found for this store.');
        }

        const plan = subscription.plan;
        if (!plan) {
            throw new BadRequestException('Plan limits not configured.');
        }

        if (feature === 'custom_domains') {
            const domainLimit = plan.customDomainLimit;
            
            if (domainLimit === 0) {
                throw new BadRequestException(`Custom domains are not supported on your current plan.`);
            }
            if (domainLimit === -1) return true;
            
            const count = await this.domainRepository.count({ where: { store_id: storeId, type: 'custom' } });
            if (count >= domainLimit) {
                throw new BadRequestException(`Custom domain limit reached for your plan (${domainLimit}). Please upgrade to add more.`);
            }
            return true;
        }

        let limit = 0;
        let count = 0;

        if (feature === 'products') {
            const hasProductModule = plan.allowedPages
                ? (plan.allowedPages.includes('manage-products') || plan.allowedPages.includes('manage-products/product-list'))
                : plan.category !== 'page_builder';

            if (!hasProductModule || plan.productLimit === 0) {
                throw new BadRequestException(`Products are only available on E-commerce plans.`);
            }
            limit = plan.productLimit;
            if (limit === -1) return true;
            count = await this.productRepository.count({ where: { storeId } });
        } else if (feature === 'pages') {
            const hasPageModule = plan.allowedPages
                ? plan.allowedPages.includes('pages')
                : true;

            if (!hasPageModule) {
                throw new BadRequestException(`Pages are not supported on your current plan.`);
            }
            limit = plan.pageLimit;
            if (limit === -1) return true;
            count = await this.pageRepository.count({ where: { storeId } });
        }

        if (count >= limit) {
            const featureName = feature.replace('_', ' ');
            throw new BadRequestException(`${featureName.charAt(0).toUpperCase() + featureName.slice(1)} limit reached for your plan (${limit}). Please upgrade to add more.`);
        }

        return true;
    }

    async getUsage(storeId: string) {
        const subscription = await this.subscriptionsService.getStoreSubscription(storeId);
        if (!subscription || !subscription.plan) return null;

        const plan = subscription.plan;
        
        const productCount = await this.productRepository.count({ where: { storeId } });
        const pageCount = await this.pageRepository.count({ where: { storeId } });
        const domainCount = await this.domainRepository.count({ where: { store_id: storeId, type: 'custom' } });

        return {
            products: {
                used: productCount,
                limit: plan.productLimit ?? 0,
            },
            pages: {
                used: pageCount,
                limit: plan.pageLimit ?? 0,
            },
            custom_domains: {
                used: domainCount,
                limit: plan.customDomainLimit ?? 0,
            },
            storage: {
                used: await this.calculateStorageUsage(storeId),
                limit: plan.storageMb ?? 0,
            },
            users: {
                used: await this.adminRepository.count({ where: { storeId } }),
                limit: plan.adminLimit ?? 5,
            }
        };
    }

    private async calculateStorageUsage(storeId: string): Promise<number> {
        const result = await this.mediaRepository
            .createQueryBuilder('media')
            .select('SUM(media.size)', 'total')
            .where('media.storeId = :storeId', { storeId })
            .getRawOne();
        
        const totalBytes = parseInt(result?.total || '0', 10);
        // Convert to MB (rounded to 2 decimal places)
        return Math.round((totalBytes / (1024 * 1024)) * 100) / 100;
    }
}
