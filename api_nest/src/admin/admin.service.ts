import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../sales/entities/order.entity';
import { Inquiry, InquiryStatus } from '../communication/entities/inquiry.entity';
import { AdminNotification } from './entities/admin-notification.entity';

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(Order)
        private orderRepository: Repository<Order>,
        @InjectRepository(Inquiry)
        private inquiryRepository: Repository<Inquiry>,
        @InjectRepository(AdminNotification)
        private notificationRepository: Repository<AdminNotification>,
    ) { }

    async getDashboardStats() {
        // Parallel queries for performance
        const where: any = {};

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

    async getRecentActivity() {
        const where: any = {};

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

    async getOrderProfitMargin(range: string = '12 months') {
        const statuses = [OrderStatus.CONFIRMED, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED];

        const queryBuilder = this.orderRepository.createQueryBuilder('order')
            .leftJoinAndSelect('order.items', 'items')
            .where('order.status IN (:...statuses)', { statuses });

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
