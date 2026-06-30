
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order, OrderStatus, PaymentStatus } from '../sales/entities/order.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Product } from '../catalog/entities/product.entity';
import { Collection } from '../catalog/entities/collection.entity';
import { Invoice } from '../sales/entities/invoice.entity';
import { Inquiry, InquiryStatus } from '../communication/entities/inquiry.entity';
import { getFullS3Url } from '../common/utils/s3-url.util';
import { EmailSettings } from './entities/email-settings.entity';
import { GeneralSettings } from './entities/general-settings.entity';
import { StorePaymentConfigService } from '../payments/store-payment-config.service';
import { ShippingConfig } from '../sales/entities/shipping-config.entity';

@Injectable()
export class DashboardService {
    constructor(
        @InjectRepository(Order)
        private orderRepository: Repository<Order>,
        @InjectRepository(Customer)
        private customerRepository: Repository<Customer>,
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
        @InjectRepository(Collection)
        private collectionRepository: Repository<Collection>,
        @InjectRepository(Invoice)
        private invoiceRepository: Repository<Invoice>,
        @InjectRepository(Inquiry)
        private inquiryRepository: Repository<Inquiry>,
        @InjectRepository(EmailSettings)
        private emailSettingsRepository: Repository<EmailSettings>,
        @InjectRepository(GeneralSettings)
        private generalSettingsRepository: Repository<GeneralSettings>,
        private storePaymentConfigService: StorePaymentConfigService,
        private dataSource: DataSource,
    ) { }

    async getDashboardSummary() {
        // Basic counts
        const [
            totalCustomers,
            totalProducts,
            activeProducts,
            totalCollections,
            totalOrders,
            pendingInvoices,
            newInquiryCount,
            paidOrdersCount,
        ] = await Promise.all([
            this.customerRepository.count(),
            this.productRepository.count(),
            this.productRepository.count({ where: { isActive: true } }),
            this.collectionRepository.count(),
            this.orderRepository.count(),
            this.invoiceRepository.count({ where: [{ status: 'sent' }, { status: 'overdue' }, { status: 'partially_paid' }] }),
            this.inquiryRepository.count({ where: { status: InquiryStatus.PENDING } }),
            this.orderRepository.count({ where: { paymentStatus: PaymentStatus.PAID } }),
        ]);

        // Order Statistics
        const orderStats = await this.getOrderStats();

        // Revenue Logic
        const { totalRevenue, monthlyRevenue } = await this.getRevenueStats();

        // Monthly Sales Graph (Last 12 months)
        const yearlyData = await this.getMonthlySales();

        // Top Lists
        const topCategories = await this.getTopCategories();
        const topProducts = await this.getTopProducts();
        const topCustomers = await this.getTopCustomers();
        const paymentDistribution = await this.getPaymentDistribution();

        // Helper for "Active Categories" (using Collection as category)
        const totalCategories = totalCollections;

        // Dynamic Trend Calculations
        const trends = await this.getTrendStats(monthlyRevenue, totalCustomers);

        return {
            summary: {
                totalCustomers,
                totalProducts,
                activeProducts,
                totalCategories,
                totalCollections,
                totalOrders,
                totalRevenue,
                monthlyRevenue,
                trends,
                paidOrdersCount,
            },
            orderStats,
            yearlyData,
            topCategories,
            topProducts,
            topCustomers,
            paymentDistribution,
            inHouseStore: {
                totalSales: totalRevenue,
                totalProducts: activeProducts,
                averageRating: 4.92, // Static as per legacy or unimplemented logic
                totalOrders: totalOrders,
            },
            setupStatus: await this.getSetupStatus(),
            // Legacy compatibility fields if needed at root level
            totalOrders,
            totalUsers: totalCustomers,
            totalRevenue,
            pendingInvoices,
            newInquiryCount,
        };
    }

    async getSetupStatus() {
        const [emailSettings, paymentConfigs, shippingConfig, generalSettings, productCount] = await Promise.all([
            this.emailSettingsRepository.findOne({ where: {} }),
            this.storePaymentConfigService.findByStore(),
            this.dataSource.getRepository(ShippingConfig).findOne({ where: { provider: 'shiprocket' } }),
            this.generalSettingsRepository.findOne({ where: {} }),
            this.productRepository.count(),
        ]);

        const emailConfigured = !!(emailSettings && emailSettings.smtpHost && emailSettings.smtpUser && emailSettings.smtpPassword);
        const paymentConfigured = paymentConfigs.some(c => c.isActive && c.keyId && c.keySecret);
        const shippingConfigured = !!(shippingConfig && shippingConfig.email && shippingConfig.password);

        const steps = [
            {
                id: 'store_details',
                label: 'Store Name & Description',
                description: 'Set your store brand name and a short description',
                weight: 20,
                isCompleted: !!(generalSettings && generalSettings.siteName && generalSettings.siteName !== 'Inospire' && generalSettings.siteDescription),
                redirectUrl: '/settings/general-settings'
            },
            {
                id: 'store_logo',
                label: 'Store Logo',
                description: 'Upload a logo to build brand identity',
                weight: 20,
                isCompleted: !!(generalSettings && generalSettings.siteLogo),
                redirectUrl: '/settings/general-settings'
            },
            {
                id: 'first_product',
                label: 'Add First Product',
                description: 'Add at least one product to start selling',
                weight: 20,
                isCompleted: productCount > 0,
                redirectUrl: '/manage-products/create-product'
            },
            {
                id: 'payment_gateway',
                label: 'Payment Gateway',
                description: 'Setup Razorpay or Stripe to receive payments',
                weight: 20,
                isCompleted: paymentConfigured,
                redirectUrl: '/settings/payment-settings'
            },
            {
                id: 'email_smtp',
                label: 'Email SMTP Configuration',
                description: 'Setup SMTP server for transactional emails',
                weight: 20,
                isCompleted: emailConfigured,
                redirectUrl: '/settings/email-config/settings'
            }
        ];

        const completionPercentage = steps.reduce((acc, step) => acc + (step.isCompleted ? step.weight : 0), 0);

        return {
            emailConfigured,
            paymentConfigured,
            shippingConfigured,
            emailAllowed: true,
            paymentAllowed: true,
            shippingAllowed: true,
            isComplete: completionPercentage === 100,
            completionPercentage,
            steps,
        };
    }

    async getRecentOrders() {
        return this.orderRepository.find({
            where: {},
            take: 5,
            order: { createdAt: 'DESC' },
            relations: ['customer'],
        });
    }

    private async getOrderStats() {
        const query = this.orderRepository
            .createQueryBuilder('order')
            .select('order.status', 'status')
            .addSelect('COUNT(order.id)', 'count');

        const stats = await query
            .groupBy('order.status')
            .getRawMany();

        const result = {
            total: 0,
            pending: 0,
            pending_approval: 0,
            confirmed: 0,
            processed: 0,
            shipped: 0,
            delivered: 0,
            cancelled: 0,
            returned: 0,
            return_requested: 0,
            replacement_requested: 0,
        };

        stats.forEach((item) => {
            const count = parseInt(item.count, 10);
            const status = item.status;
            result.total += count;

            switch (status) {
                case OrderStatus.PENDING:
                    result.pending += count;
                    break;
                case OrderStatus.CONFIRMED:
                    result.confirmed += count;
                    break;
                case OrderStatus.PROCESSING:
                    result.processed += count;
                    break;
                case OrderStatus.SHIPPED:
                    result.shipped += count;
                    break;
                case OrderStatus.DELIVERED:
                    result.delivered += count;
                    break;
                case OrderStatus.CANCELLED:
                    result.cancelled += count;
                    break;
                case OrderStatus.REFUNDED:
                    result.returned += count;
                    break;
                case OrderStatus.RETURN_REQUESTED:
                    result.return_requested += count;
                    break;
                case OrderStatus.REPLACEMENT_REQUESTED:
                    result.replacement_requested += count;
                    break;
                default:
                    break;
            }
        });

        return result;
    }

    private async getRevenueStats() {
        const totalQuery = this.orderRepository
            .createQueryBuilder('order')
            .select('SUM(order.totalAmount)', 'total')
            .where('order.status != :status', { status: OrderStatus.CANCELLED })
            .andWhere('order.status != :refundedStatus', { refundedStatus: OrderStatus.REFUNDED });

        const totalRevenueResult = await totalQuery.getRawOne();

        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const monthlyQuery = this.orderRepository
            .createQueryBuilder('order')
            .select('SUM(order.totalAmount)', 'total')
            .where('order.createdAt >= :startOfMonth', { startOfMonth })
            .andWhere('order.status != :status', { status: OrderStatus.CANCELLED })
            .andWhere('order.status != :refundedStatus', { refundedStatus: OrderStatus.REFUNDED });

        const monthlyRevenueResult = await monthlyQuery.getRawOne();

        return {
            totalRevenue: parseFloat(totalRevenueResult?.total || '0'),
            monthlyRevenue: parseFloat(monthlyRevenueResult?.total || '0'),
        };
    }

    private async getTrendStats(monthlyRevenue = 0, totalCustomers = 0) {
        const now = new Date();
        const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

        // 1. Total Sales (Revenue) Trend: compare current month revenue with previous month revenue
        const previousMonthQuery = this.orderRepository
            .createQueryBuilder('order')
            .select('SUM(order.totalAmount)', 'total')
            .where('order.createdAt >= :startOfPreviousMonth', { startOfPreviousMonth })
            .andWhere('order.createdAt <= :endOfPreviousMonth', { endOfPreviousMonth })
            .andWhere('order.status != :status', { status: OrderStatus.CANCELLED })
            .andWhere('order.status != :refundedStatus', { refundedStatus: OrderStatus.REFUNDED });

        const previousMonthResult = await previousMonthQuery.getRawOne();
        const previousMonthRevenue = parseFloat(previousMonthResult?.total || '0');

        let salesTrend = 0;
        if (previousMonthRevenue > 0) {
            salesTrend = ((monthlyRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;
        } else if (monthlyRevenue > 0) {
            salesTrend = 100;
        }

        // 2. Total Customers Trend: compare total customers growth
        const newCustomersQuery = this.customerRepository
            .createQueryBuilder('customer')
            .where('customer.createdAt >= :startOfCurrentMonth', { startOfCurrentMonth });
        const newCustomersThisMonth = await newCustomersQuery.getCount();
        const previousCustomers = totalCustomers - newCustomersThisMonth;
        let customersTrend = 0;
        if (previousCustomers > 0) {
            customersTrend = (newCustomersThisMonth / previousCustomers) * 100;
        } else if (newCustomersThisMonth > 0) {
            customersTrend = 100;
        }

        // 3. Orders Paid Trend: compare paid orders current month vs previous month
        const currentMonthPaidQuery = this.orderRepository
            .createQueryBuilder('order')
            .where('order.paymentStatus = :status', { status: PaymentStatus.PAID })
            .andWhere('order.createdAt >= :startOfCurrentMonth', { startOfCurrentMonth });
        const currentMonthPaid = await currentMonthPaidQuery.getCount();

        const previousMonthPaidQuery = this.orderRepository
            .createQueryBuilder('order')
            .where('order.paymentStatus = :status', { status: PaymentStatus.PAID })
            .andWhere('order.createdAt >= :startOfPreviousMonth', { startOfPreviousMonth })
            .andWhere('order.createdAt <= :endOfPreviousMonth', { endOfPreviousMonth });
        const previousMonthPaid = await previousMonthPaidQuery.getCount();

        let deliveredTrend = 0;
        if (previousMonthPaid > 0) {
            deliveredTrend = ((currentMonthPaid - previousMonthPaid) / previousMonthPaid) * 100;
        } else if (currentMonthPaid > 0) {
            deliveredTrend = 100;
        }

        return {
            salesTrend: parseFloat(salesTrend.toFixed(2)),
            incomeTrend: parseFloat(salesTrend.toFixed(2)),
            deliveredTrend: parseFloat(deliveredTrend.toFixed(2)),
            customersTrend: parseFloat(customersTrend.toFixed(2)),
        };
    }

    private async getMonthlySales() {
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

        const query = this.orderRepository
            .createQueryBuilder('order')
            .select("TO_CHAR(order.createdAt, 'Mon')", 'month')
            .addSelect("EXTRACT(MONTH FROM order.createdAt)", 'monthNum')
            .addSelect("EXTRACT(YEAR FROM order.createdAt)", 'yearNum')
            .addSelect('SUM(order.totalAmount)', 'sales')
            .where('order.createdAt >= :date', { date: twelveMonthsAgo })
            .andWhere('order.status != :status', { status: OrderStatus.CANCELLED });

        const sales = await query
            .groupBy("TO_CHAR(order.createdAt, 'Mon')")
            .addGroupBy("EXTRACT(MONTH FROM order.createdAt)")
            .addGroupBy("EXTRACT(YEAR FROM order.createdAt)")
            .orderBy("EXTRACT(YEAR FROM order.createdAt)", 'ASC')
            .addOrderBy("EXTRACT(MONTH FROM order.createdAt)", 'ASC')
            .getRawMany();

        return sales.map(item => ({
            month: item.month,
            sales: parseFloat(item.sales),
        }));
    }

    private async getTopCategories() {
        // Fetch top categories based on quantities in order items
        try {
            const result = await this.orderRepository.query(`
                SELECT
                    c.id as "categoryId",
                    c.name as name,
                    SUM(oi.quantity) as count,
                    SUM(oi."totalPrice") as revenue
                FROM order_items oi
                INNER JOIN orders o ON o.id = oi."orderId"
                INNER JOIN products p ON p.id = oi."productId"::uuid
                INNER JOIN categories c ON c.id = p."categoryId"
                GROUP BY c.id, c.name
                ORDER BY revenue DESC
                LIMIT 5
            `, []);

            const enrichedResult = await Promise.all(result.map(async (r) => {
                const productsCount = await this.productRepository.count({
                    where: {
                        categoryId: r.categoryId,
                    }
                });
                return {
                    name: r.name,
                    count: parseInt(r.count),
                    revenue: parseFloat(r.revenue || '0'),
                    productsCount
                };
            }));

            return enrichedResult;
        } catch (error) {
            console.error('Error in getTopCategories:', error);
            return [];
        }
    }


    private async getTopProducts() {
        try {
            const result = await this.orderRepository.query(`
                SELECT
                    oi."productName" as name,
                    COALESCE(pm.key, '') as image,
                    SUM(oi.quantity) as quantity,
                    SUM(oi."totalPrice") as price,
                    p."isActive" as "isActive",
                    p.stock as stock
                FROM order_items oi
                INNER JOIN orders o ON o.id = oi."orderId"
                LEFT JOIN products p ON p.id = oi."productId"::uuid
                LEFT JOIN product_media pm ON pm."productId" = p.id AND pm.is_main = true
                GROUP BY oi."productName", pm.key, p."isActive", p.stock
                ORDER BY price DESC
                LIMIT 4
            `, []);

            return result.map(r => ({
                name: r.name,
                image: r.image ? getFullS3Url(r.image) : '',
                quantity: parseInt(r.quantity),
                price: parseFloat(r.price),
                isActive: r.isActive !== null ? r.isActive : true,
                stock: r.stock !== null ? parseInt(r.stock) : null
            }));
        } catch (error) {
            console.error('Error in getTopProducts:', error);
            // Fallback to basic aggregation if join fails (e.g. invalid UUIDs in productId)
            const result = await this.orderRepository.query(`
                SELECT
                    oi."productName" as name,
                    '' as image,
                    SUM(oi.quantity) as quantity,
                    SUM(oi."totalPrice") as price,
                    p."isActive" as "isActive",
                    p.stock as stock
                FROM order_items oi
                INNER JOIN orders o ON o.id = oi."orderId"
                LEFT JOIN products p ON p.id = oi."productId"::uuid
                GROUP BY oi."productName", p."isActive", p.stock
                ORDER BY price DESC
                LIMIT 4
            `, []);

            return result.map(r => ({
                name: r.name,
                image: r.image,
                quantity: parseInt(r.quantity),
                price: parseFloat(r.price),
                isActive: r.isActive !== null ? r.isActive : true,
                stock: r.stock !== null ? parseInt(r.stock) : null
            }));
        }
    }

    private async getTopCustomers() {
        const query = this.orderRepository
            .createQueryBuilder('order')
            .select('order.customerId', 'customerId')
            .addSelect('SUM(order.totalAmount)', 'totalSpent')
            .addSelect('COUNT(order.id)', 'orderCount')
            .innerJoin('order.customer', 'customer')
            .addSelect('customer.name', 'name')
            .addSelect('customer.email', 'email');

        const topCustomers = await query
            .groupBy('order.customerId')
            .addGroupBy('customer.id')
            .orderBy('"totalSpent"', 'DESC')
            .limit(5)
            .getRawMany();

        return topCustomers.map(c => ({
            name: c.name || 'Unknown User',
            email: c.email,
            totalSpent: parseFloat(c.totalSpent),
            image: null // user entity doesn't show easy profile image column, might be in metadata
        }));
    }

    private async getPaymentDistribution() {
        // paymentInfo is jsonb
        const result = await this.orderRepository.query(`
        SELECT
            "paymentInfo"->>'method' as method,
            COUNT(*) as count
        FROM orders
        GROUP BY "paymentInfo"->>'method'
      `, []);

        const distribution = {
            cash_on_delivery: 0,
            wallet: 0,
            others: 0,
        };

        result.forEach(row => {
            const method = row.method?.toLowerCase();
            const count = parseInt(row.count);

            if (method === 'cash_on_delivery' || method === 'cod') {
                distribution.cash_on_delivery += count;
            } else if (method === 'wallet') {
                distribution.wallet += count;
            } else {
                distribution.others += count;
            }
        });

        return distribution;
    }
}
