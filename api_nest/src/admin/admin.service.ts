import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Order, OrderStatus } from '../sales/entities/order.entity';
import { Inquiry, InquiryStatus } from '../communication/entities/inquiry.entity';
import { Store } from '../stores/entities/store.entity';
import { StoreDomain } from '../stores/entities/store-domain.entity';
import { Admin, AdminRole } from './entities/admin.entity';
import { StoreSubscription } from '../subscriptions/entities/store-subscription.entity';
import { Plan } from '../plans/plan.entity';
import { Payment } from '../payments/entities/payment.entity';
import { PaymentAttempt } from '../payments/entities/payment-attempt.entity';
import { AdminNotification } from './entities/admin-notification.entity';
import { Product } from '../catalog/entities/product.entity';
import { Page } from '../cms/entities/page.entity';
import { Media } from '../cms/entities/media.entity';

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(Order)
        private orderRepository: Repository<Order>,
        @InjectRepository(Inquiry)
        private inquiryRepository: Repository<Inquiry>,
        @InjectRepository(Store)
        private storeRepository: Repository<Store>,
        @InjectRepository(StoreDomain)
        private storeDomainRepository: Repository<StoreDomain>,
        @InjectRepository(Admin)
        private adminRepository: Repository<Admin>,
        @InjectRepository(StoreSubscription)
        private subscriptionRepository: Repository<StoreSubscription>,
        @InjectRepository(Plan)
        private planRepository: Repository<Plan>,
        @InjectRepository(Payment)
        private paymentRepository: Repository<Payment>,
        @InjectRepository(PaymentAttempt)
        private paymentAttemptRepository: Repository<PaymentAttempt>,
        @InjectRepository(AdminNotification)
        private notificationRepository: Repository<AdminNotification>,
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
        @InjectRepository(Page)
        private pageRepository: Repository<Page>,
        @InjectRepository(Media)
        private mediaRepository: Repository<Media>,
    ) { }

    async getDashboardStats(storeId?: string) {
        // Parallel queries for performance
        const where: any = {};
        if (storeId) {
            where.storeId = storeId;
        }

        const [
            totalOrders,
            totalRevenueResult,
            pendingOrders,
            newInquiries,
            unreadNotifications,
        ] = await Promise.all([
            this.orderRepository.count({ where }),
            this.orderRepository
                .createQueryBuilder('order')
                .select('SUM(order.totalAmount)', 'total')
                .where('order.status IN (:...statuses)', { statuses: [OrderStatus.CONFIRMED, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED] })
                .andWhere(storeId ? 'order.storeId = :storeId' : '1=1', { storeId })
                .getRawOne(),
            this.orderRepository.count({ where: { ...where, status: OrderStatus.PENDING } }),
            this.inquiryRepository.count({ where: { ...where, status: InquiryStatus.PENDING } }),
            this.notificationRepository.count({ where: { ...where, isRead: false } }),
        ]);

        return {
            sales: {
                totalOrders,
                totalRevenue: parseFloat(totalRevenueResult.total || '0'),
                pendingOrders,
            },
            communication: {
                newInquiries,
            },
            users: {
                totalUsers: 0,
            },
            notifications: {
                unreadCount: unreadNotifications,
            },
        };
    }

    async getRecentActivity(storeId?: string) {
        const where: any = {};
        if (storeId) {
            where.storeId = storeId;
        }

        const [recentOrders, recentInquiries] = await Promise.all([
            this.orderRepository.find({
                where,
                order: { createdAt: 'DESC' },
                take: 5,
                relations: ['customer'], // minimally load customer
                select: ['id', 'orderNumber', 'totalAmount', 'status', 'createdAt', 'customerId'] // select specific fields
            }),
            this.inquiryRepository.find({
                where,
                order: { createdAt: 'DESC' },
                take: 5,
                select: ['id', 'name', 'subject', 'status', 'createdAt']
            })
        ]);

        return {
            recentOrders,
            recentInquiries
        };
    }

    async getAllStores(page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;
        const [stores, total] = await this.storeRepository.findAndCount({
            relations: ['domains'],
            order: { createdAt: 'DESC' },
            take: limit,
            skip,
        });

        // Hydrate with owner info and subscription info
        const storeIds = stores.map(s => s.id);
        const [owners, subscriptions] = await Promise.all([
            storeIds.length > 0 ? this.adminRepository.find({
                where: { 
                    storeId: In(storeIds),
                    role: AdminRole.STORE_ADMIN
                }
            }) : Promise.resolve([]),
            storeIds.length > 0 ? this.subscriptionRepository.find({
                where: { store_id: In(storeIds) },
                relations: ['plan'],
                order: { created_at: 'DESC' }
            }) : Promise.resolve([])
        ]);

        const ownerMap = new Map(owners.map(o => [o.storeId, o]));
        
        // Map subscriptions by store_id (only the latest one)
        const subMap = new Map();
        subscriptions.forEach(sub => {
            if (!subMap.has(sub.store_id)) {
                subMap.set(sub.store_id, sub);
            }
        });

        const mappedStores = stores.map(store => ({
            ...store,
            owner: ownerMap.get(store.id) || null,
            subscription: subMap.get(store.id) || null,
            primaryDomain: store.domains.find(d => d.is_primary)?.domain || null,
            customDomain: store.domains.find(d => d.type === 'custom')?.domain || null,
        }));

        return {
            data: mappedStores,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async getAllAdminsWithPlans() {
        const admins = await this.adminRepository.find({
            order: { createdAt: 'DESC' }
        });

        // Find all stores associated with these admins
        const adminStoreIds = admins.map(a => a.storeId).filter(id => id);
        const subscriptions = adminStoreIds.length > 0 ? await this.subscriptionRepository.find({
            where: { store_id: In(adminStoreIds) },
            relations: ['plan']
        }) : [];

        // Map subscriptions back to the admin via storeId
        const subMap = new Map(subscriptions.map(s => [s.store_id, s]));

        return admins.map(admin => ({
            ...admin,
            subscription: admin.storeId ? subMap.get(admin.storeId) || null : null,
            plan: admin.storeId ? subMap.get(admin.storeId)?.plan || null : null,
        }));
    }

    async getStoreById(id: string) {
        const store = await this.storeRepository.findOne({
            where: { id },
            relations: ['domains'],
        });

        if (!store) return null;

        const owner = await this.adminRepository.findOne({
            where: { 
                storeId: id,
                role: AdminRole.STORE_ADMIN 
            }
        });

        const subscription = await this.subscriptionRepository.findOne({
            where: { store_id: id },
            relations: ['plan'],
            order: { created_at: 'DESC' }
        });

        const payments = await this.paymentRepository.find({
            where: { store_id: id, payment_type: 'SUBSCRIPTION' },
            order: { created_at: 'DESC' }
        });

        // ── Usage Stats ───────────────────────────────────────────────────
        const [productCount, pageCount, adminCount, storageResult] = await Promise.all([
            this.productRepository.count({ where: { storeId: id } }),
            this.pageRepository.count({ where: { storeId: id } }),
            this.adminRepository.count({ where: { storeId: id } }),
            this.mediaRepository.createQueryBuilder('media')
                .select('SUM(media.size)', 'total')
                .where('media.storeId = :id', { id })
                .getRawOne()
        ]);

        const storageUsedBytes = parseInt(storageResult?.total || '0');
        const storageUsedMb = Math.round(storageUsedBytes / (1024 * 1024));

        return {
            ...store,
            owner: owner || null,
            subscription: subscription || null,
            domains: store.domains || [],
            payments: payments || [],
            usage: {
                products: productCount,
                pages: pageCount,
                admins: adminCount,
                storageMb: storageUsedMb,
                customDomainCount: store.domains.filter(d => d.type === 'custom').length
            }
        };
    }

    async getAllPayments(page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;
        const [data, total] = await this.paymentRepository.findAndCount({
            where: { 
                status: 'success',
                payment_type: 'SUBSCRIPTION' 
            },
            relations: ['store'],
            order: { created_at: 'DESC' },
            take: limit,
            skip,
        });

        return {
            data,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
        };
    }

    async getAllPaymentAttempts(page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;
        const [data, total] = await this.paymentAttemptRepository.findAndCount({
            where: [
                { payment_status: 'pending', entity_type: 'SUBSCRIPTION' },
                { payment_status: 'failed', entity_type: 'SUBSCRIPTION' }
            ],
            relations: ['plan'],
            order: { created_at: 'DESC' },
            take: limit,
            skip,
        });

        // Add extracted store_name for the UI
        const mappedData = data.map(item => {
            const row = item as any;
            if (row.registration_data) {
                row.store_name = row.registration_data.storeName || row.registration_data.store_name || '-';
            }
            return row;
        });

        return {
            data: mappedData,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
        };
    }

    async getOrderProfitMargin(storeId?: string, range: string = '12 months') {
        const statuses = [OrderStatus.CONFIRMED, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED];

        const queryBuilder = this.orderRepository.createQueryBuilder('order')
            .leftJoinAndSelect('order.items', 'items')
            .where('order.status IN (:...statuses)', { statuses });

        if (storeId) {
            queryBuilder.andWhere('order.storeId = :storeId', { storeId });
        }

        const now = new Date();
        let startDate = new Date();
        let formatKey: (date: Date) => string;
        let buckets: { label: string; key: string; earnings: number; profits: number }[] = [];

        if (range === '24 hours') {
            startDate.setHours(now.getHours() - 24);
            queryBuilder.andWhere('order.createdAt >= :startDate', { startDate });

            // Generate 24 hourly buckets
            for (let i = 23; i >= 0; i--) {
                const d = new Date(now);
                d.setHours(now.getHours() - i);
                const label = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
                const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${d.getHours()}`;
                buckets.push({ label, key, earnings: 0, profits: 0 });
            }
            formatKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}`;
        } else if (range === '7 days') {
            startDate.setDate(now.getDate() - 7);
            startDate.setHours(0, 0, 0, 0);
            queryBuilder.andWhere('order.createdAt >= :startDate', { startDate });

            // Generate 7 daily buckets
            for (let i = 6; i >= 0; i--) {
                const d = new Date(now);
                d.setDate(now.getDate() - i);
                const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
                buckets.push({ label, key, earnings: 0, profits: 0 });
            }
            formatKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        } else if (range === '30 days') {
            startDate.setDate(now.getDate() - 30);
            startDate.setHours(0, 0, 0, 0);
            queryBuilder.andWhere('order.createdAt >= :startDate', { startDate });

            // Generate 30 daily buckets
            for (let i = 29; i >= 0; i--) {
                const d = new Date(now);
                d.setDate(now.getDate() - i);
                const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
                buckets.push({ label, key, earnings: 0, profits: 0 });
            }
            formatKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        } else {
            // Default: '12 months'
            startDate.setFullYear(now.getFullYear() - 1);
            startDate.setDate(1);
            startDate.setHours(0, 0, 0, 0);
            queryBuilder.andWhere('order.createdAt >= :startDate', { startDate });

            // Generate 12 monthly buckets
            for (let i = 11; i >= 0; i--) {
                const d = new Date(now);
                d.setMonth(now.getMonth() - i);
                const label = d.toLocaleDateString('en-US', { month: 'short' });
                const key = `${d.getFullYear()}-${d.getMonth()}`;
                buckets.push({ label, key, earnings: 0, profits: 0 });
            }
            formatKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}`;
        }

        const orders = await queryBuilder.orderBy('order.createdAt', 'ASC').getMany();

        // Populate buckets
        const bucketMap = new Map(buckets.map(b => [b.key, b]));

        orders.forEach(order => {
            const date = new Date(order.createdAt);
            const key = formatKey(date);
            const bucket = bucketMap.get(key);
            if (bucket) {
                const earnings = Number(order.totalAmount || 0);
                let costOfGoods = 0;
                if (order.items && order.items.length > 0) {
                    costOfGoods = order.items.reduce((acc, item) => acc + (Number(item.costPrice || 0) * (item.quantity || 1)), 0);
                }
                const profits = earnings - costOfGoods;

                bucket.earnings += earnings;
                bucket.profits += profits;
            }
        });

        // Map label/month name to match what Recharts expects (e.g. key `month` or `label`)
        return buckets.map(b => ({
            month: b.label,
            earnings: Math.round(b.earnings * 100) / 100,
            profits: Math.round(b.profits * 100) / 100,
        }));
    }
}
