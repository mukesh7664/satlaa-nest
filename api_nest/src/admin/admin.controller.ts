import { Controller, Get, Post, Put, Delete, Patch, Param, Body, Query, UseGuards, Request, NotFoundException, ParseUUIDPipe, UnauthorizedException, BadRequestException, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuditLogInterceptor } from './audit-log.interceptor';
import { AdminService } from './admin.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In, IsNull } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { Tag } from './entities/tag.entity';
import { EmailTemplate } from './entities/email-template.entity';
import { AdminNotification } from './entities/admin-notification.entity';
import { Order, OrderStatus, PaymentStatus } from '../sales/entities/order.entity';
import { Payment } from '../payments/entities/payment.entity';
import { PaymentAttempt } from '../payments/entities/payment-attempt.entity';
import { Estimate } from '../sales/entities/estimate.entity';
import { Product } from '../catalog/entities/product.entity';
import { Admin, AdminRole } from './entities/admin.entity';
import { EmailSettings } from './entities/email-settings.entity';
import { AdminAuthService } from './admin-auth.service';
import { Store } from '../stores/entities/store.entity';
import { Section } from '../cms/entities/section.entity';
import { Customer } from '../customers/entities/customer.entity';
import * as bcrypt from 'bcryptjs';
import { Address, AddressType } from '../customers/entities/address.entity';
import { SettingsService } from './settings.service';
import { TenantService } from '../tenant/tenant.service';
import { EmailService } from '../notifications/email.service';
import { CryptoService } from '../common/crypto.service';
import { CatalogService } from '../catalog/catalog.service';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseInterceptors(AuditLogInterceptor)
@Controller('admin')
export class AdminController {
    constructor(
        private readonly adminService: AdminService,
        private readonly adminAuthService: AdminAuthService,
        @InjectRepository(AuditLog)
        private auditLogRepository: Repository<AuditLog>,
        @InjectRepository(Tag)
        private tagRepository: Repository<Tag>,
        @InjectRepository(EmailTemplate)
        private emailTemplateRepository: Repository<EmailTemplate>,
        @InjectRepository(AdminNotification)
        private notificationRepository: Repository<AdminNotification>,
        @InjectRepository(EmailSettings)
        private emailSettingsRepository: Repository<EmailSettings>,
        @InjectRepository(Estimate)
        private estimateRepository: Repository<Estimate>,
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
        @InjectRepository(Section)
        private sectionRepository: Repository<Section>,
        @InjectRepository(Store)
        private storeRepository: Repository<Store>,
        @InjectRepository(Order)
        private orderRepository: Repository<Order>,
        @InjectRepository(Customer)
        private customerRepository: Repository<Customer>,
        @InjectRepository(Address)
        private addressRepository: Repository<Address>,
        @InjectRepository(PaymentAttempt)
        private paymentAttemptRepository: Repository<PaymentAttempt>,
        @InjectRepository(Payment)
        private paymentRepository: Repository<Payment>,
        private readonly settingsService: SettingsService,
        private readonly tenantService: TenantService,
        private readonly emailService: EmailService,
        private readonly cryptoService: CryptoService,
        private readonly catalogService: CatalogService,
    ) { }

    // ── Dashboard ───────────────────────────────────────────────────────
    @ApiOperation({ summary: 'Get dashboard statistics' })
    @Get('dashboard')
    async getDashboardStats(@Request() req: any) {
        return this.adminService.getDashboardStats(req.user?.storeId);
    }

    @ApiOperation({ summary: 'Get dashboard revenue chart' })
    @Get('dashboard/revenue')
    async getRevenueChart(@Request() req: any) {
        return this.adminService.getDashboardStats(req.user?.storeId); // reuse
    }

    @ApiOperation({ summary: 'Get recent activity' })
    @Get('activity')
    async getRecentActivity(@Request() req: any) {
        return this.adminService.getRecentActivity(req.user?.storeId);
    }

    // ── Admin Orders ────────────────────────────────────────────────────
    @ApiOperation({ summary: 'Get all orders' })
    @Get('orders')
    async getAllOrders(@Request() req: any, @Query() query: any) {
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 10;
        const skip = (page - 1) * limit;
        const storeId = req.user?.storeId;

        const queryBuilder = this.orderRepository.createQueryBuilder('o');
        queryBuilder.leftJoinAndSelect('o.customer', 'customer');
        queryBuilder.leftJoinAndSelect('o.items', 'items');
        queryBuilder.leftJoinAndSelect('items.product', 'product');
        queryBuilder.leftJoinAndSelect('o.shipment', 'shipment');

        if (storeId) {
            queryBuilder.andWhere('o.storeId = :storeId', { storeId });
        }

        // Apply search filter
        if (query.search) {
            queryBuilder.andWhere(
                '(o.orderNumber LIKE :search OR customer.name LIKE :search OR customer.email LIKE :search)',
                { search: `%${query.search}%` }
            );
        }

        // Apply status filter (OrderStatus only)
        if (query.status && query.status !== 'all') {
            const validStatus = Object.values(OrderStatus).includes(query.status as OrderStatus);
            if (validStatus) {
                queryBuilder.andWhere('o.status = :status', { status: query.status });
            }
        }

        // Apply Payment Status filter (paid, unpaid, failed, refunded)
        if (query.paymentStatus && query.paymentStatus !== 'all') {
            const pStatus = query.paymentStatus === 'success' ? 'paid' : query.paymentStatus;
            queryBuilder.andWhere('o.paymentStatus = :paymentStatus', { paymentStatus: pStatus });
        }

        // Apply date range filter
        if (query.startDate) {
            queryBuilder.andWhere('o.createdAt >= :startDate', {
                startDate: new Date(query.startDate)
            });
        }
        if (query.endDate) {
            // Add one day to include the entire end date
            const endDate = new Date(query.endDate);
            endDate.setDate(endDate.getDate() + 1);
            queryBuilder.andWhere('o.createdAt < :endDate', { endDate });
        }

        // Apply sorting with validation
        const validSortFields = ['createdAt', 'updatedAt', 'orderNumber', 'status', 'totalAmount'];
        const sortBy = query.sort && validSortFields.includes(query.sort) ? query.sort : 'createdAt';
        const sortOrder = query.order === 'asc' ? 'ASC' : 'DESC';

        if (query.sort === 'pricing.total') {
            queryBuilder.orderBy('o.totalAmount', sortOrder);
        } else {
            queryBuilder.orderBy(`o.${sortBy}`, sortOrder);
        }

        const [data, total] = await queryBuilder
            .skip(skip)
            .take(limit)
            .getManyAndCount();

        const mappedData = data.map(order => {
            const isPaid = order.paymentStatus === 'paid' || 
                           order.paymentInfo?.status === 'paid' || 
                           order.paymentInfo?.status === 'success' || 
                           order.paymentInfo?.status === 'captured' ||
                           (order.paymentMethod === 'razorpay' && order.status !== OrderStatus.PENDING) ||
                           [OrderStatus.CONFIRMED, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED, OrderStatus.READY_TO_SHIP, OrderStatus.OUT_FOR_DELIVERY].includes(order.status as OrderStatus);
            const paidAmount = isPaid ? Number(order.totalAmount) : 0;
            const pendingAmount = Number(order.totalAmount) - paidAmount;

            let customer = undefined;
            if (order.customer) {
                customer = {
                    firstName: order.customer.name?.split(' ')[0] || '',
                    lastName: order.customer.name?.split(' ').slice(1).join(' ') || '',
                    email: order.customer.email,
                };
            } else if (order.billingAddress || order.shippingAddress) {
                const address = order.billingAddress || order.shippingAddress;
                const fullName = address.fullName || 'Guest';
                const nameParts = fullName.split(' ');
                customer = {
                    firstName: nameParts[0],
                    lastName: nameParts.slice(1).join(' '),
                    email: address.email || (order as any).guestEmail || '',
                };
            }

            return {
                ...order,
                _id: order.id,
                items: (order.items || []).map(item => ({
                    ...item,
                    _id: item.id,
                    total: Number(item.totalPrice) + Number(item.tax_amount || 0),
                    subtotal: Number(item.totalPrice) + Number(item.tax_amount || 0),
                    tax_rate: Number(item.tax_rate || 0),
                    tax_amount: Number(item.tax_amount || 0),
                    paymentStatus: item.paymentStatus || 'pending',
                    isBundle: item.product?.productStructureType === 'bundle'
                })),
                customer,
                pricing: {
                    total: order.totalAmount,
                },
                paymentSummary: {
                    paidAmount,
                    rejectedAmount: 0,
                    pendingAmount,
                    paidItemsCount: isPaid ? order.items.length : 0,
                    rejectedItemsCount: 0,
                    pendingItemsCount: isPaid ? 0 : order.items.length,
                }
            };
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

    @ApiOperation({ summary: 'Get order stats' })
    @Get('orders/stats')
    async getOrderStats(@Request() req: any) {
        const storeId = req.user?.storeId;
        const where: any = storeId ? { storeId } : {};

        const [
            total, 
            pending, 
            confirmed, 
            processing,
            shipped,
            delivered, 
            cancelled,
            returned,
            failed,
            needInvoice
        ] = await Promise.all([
            this.orderRepository.count({ where }),
            this.orderRepository.count({ where: { ...where, status: OrderStatus.PENDING } }),
            this.orderRepository.count({ where: { ...where, status: OrderStatus.CONFIRMED } }),
            this.orderRepository.count({ where: { ...where, status: OrderStatus.PROCESSING } }),
            this.orderRepository.count({ where: { ...where, status: OrderStatus.SHIPPED } }),
            this.orderRepository.count({ where: { ...where, status: OrderStatus.DELIVERED } }),
            this.orderRepository.count({ where: { ...where, status: OrderStatus.CANCELLED } }),
            this.orderRepository.count({ where: { ...where, status: OrderStatus.RETURNED } }),
            this.orderRepository.count({ where: { ...where, status: OrderStatus.FAILED } }),
            this.orderRepository.count({ where: { ...where, paymentStatus: PaymentStatus.UNPAID } }),
        ]);
        
        return { 
            data: {
                totalOrders: total,
                pending,
                confirmed,
                processing,
                shipped,
                delivered,
                completed: delivered, // mapping delivered to completed for frontend compatibility
                cancelled,
                returned,
                failed,
                needInvoice
            }
        };
    }

    @ApiOperation({ summary: 'Get order profit margin statistics' })
    @Get('orders/profit-margin')
    async getOrderProfitMargin(@Request() req: any, @Query('range') range: string) {
        const storeId = req.user?.storeId;
        const data = await this.adminService.getOrderProfitMargin(storeId, range || '12 months');
        return { success: true, data };
    }

    @ApiOperation({ summary: 'Get order by ID' })
    @ApiParam({ name: 'id' })
    @Get('orders/:id')
    async getOrderById(@Param('id', new ParseUUIDPipe()) id: string) {
        console.log(`[Admin] Fetching order with ID: ${id}`);

        // Try to fetch with relations
        let order = await this.orderRepository.findOne({ 
            where: { id }, 
            relations: ['customer', 'items', 'shipment', 'store', 'returnRequests'] 
        });

        // Fallback: If not found with relation, try without relation (maybe user was deleted)
        if (!order) {
            console.log(`[Admin] Order not found with relation 'customer'. Retrying without relations...`);
            order = await this.orderRepository.findOne({ where: { id } });
        }

        // Second API Fallback: Raw Query (in case TypeORM is acting up)
        if (!order) {
            console.log(`[Admin] Order not found via TypeORM. Retrying with Raw Query...`);
            const rawOrders = await this.orderRepository.query('SELECT * FROM orders WHERE id = $1', [id]);
            if (rawOrders && rawOrders.length > 0) {
                console.log('[Admin] Order FOUND via Raw Query!');
                // Map raw result to entity structure roughly
                order = this.orderRepository.create(rawOrders[0] as Order);
                // Warning: Relations won't be hydrated here, but better than 404
            }
        }

        if (!order) {
            console.log(`[Admin] Order definitely not found.`);
            throw new NotFoundException('Order not found');
        }

        // Hydrate items with product details and Bundle metadata
        if (order.items && order.items.length > 0) {
            // Heal missing productIds for bundles if possible
            for (const item of order.items) {
                if (!item.productId && item.bundleSelections && Object.keys(item.bundleSelections).length > 0) {
                    const firstBundleItemId = Object.keys(item.bundleSelections)[0];
                    const res = await this.orderRepository.query(
                        'SELECT "bundleId" FROM product_bundle_items WHERE id = $1', 
                        [firstBundleItemId]
                    );
                    if (res && res.length > 0) {
                        item.productId = res[0].bundleId;
                    }
                }
            }

            const productIds = order.items.map(item => item.productId).filter(id => id);
            
            let productMap = new Map();
            if (productIds.length > 0) {
                const products = await this.catalogService.findProductsByIds(productIds, order.storeId);
                productMap = new Map(products.map(p => [p.id, p]));
            }

            const enrichedItems = [];
            for (const item of order.items) {
                const product = productMap.get(item.productId);
                const mappedItem = {
                    ...item,
                    _id: item.id,
                    total: Number(item.totalPrice || 0) + Number(item.tax_amount || 0),
                    subtotal: Number(item.totalPrice || 0) + Number(item.tax_amount || 0),
                    tax_rate: Number(item.tax_rate || 0),
                    tax_amount: Number(item.tax_amount || 0),
                    hsn_code: item.hsn_code || product?.hsn_code || '',
                    paymentStatus: item.paymentStatus || 'pending',
                    returnStatus: (order as any).returnRequests?.find(rr => rr.orderItemId === item.id)?.status,
                    returnType: (order as any).returnRequests?.find(rr => rr.orderItemId === item.id)?.type,
                } as any;

                if (product) {
                    const transformed = await this.catalogService.transformProduct(product);
                    mappedItem.productName = product.title;
                    mappedItem.productTitle = product.title;
                    mappedItem.productImage = transformed.icon?.url;
                    mappedItem.brandName = transformed.productInfo?.brand;
                    
                    const isBundle = transformed.bundleProducts && transformed.bundleProducts.length > 0;
                    mappedItem.isBundle = isBundle;

                    if (isBundle) {
                        mappedItem.bundleDetails = transformed.bundleProducts.map(bp => {
                            const selectedVariantId = item.bundleSelections ? item.bundleSelections[bp._id] : null;
                            let variantName = '';
                            if (selectedVariantId && bp.product.variants) {
                                const variant = bp.product.variants.find(v => v._id === selectedVariantId);
                                if (variant) variantName = variant.name;
                            }
                            return {
                                id: bp._id,
                                productId: bp.product._id,
                                productName: bp.product.productInfo?.title || 'Unknown Product',
                                brandName: bp.product.productInfo?.brand || '',
                                image: bp.product.icon?.url || bp.product.images?.[0]?.url || '',
                                quantity: bp.quantity,
                                selectedVariantId,
                                variantName
                            };
                        });
                    }

                    // Resolve variant name if missing but variantId is present
                    if (item.variantId && product.children) {
                        const variant = product.children.find(v => v.id === item.variantId);
                        if (variant) {
                            mappedItem.productName = `${product.title} - ${variant.title}`;
                            if (!mappedItem.variantInfo) mappedItem.variantInfo = {};
                            if (typeof mappedItem.variantInfo === 'object') {
                                mappedItem.variantInfo.name = mappedItem.variantInfo.name || variant.title;
                            }
                        }
                    }

                    mappedItem.product = {
                        _id: product.id,
                        ...product,
                        media: product.media,
                    };
                }
                enrichedItems.push(mappedItem);
            }
            order.items = enrichedItems;
        }

        const isPaid = order.paymentStatus === 'paid' || 
                       order.paymentInfo?.status === 'paid' || 
                       order.paymentInfo?.status === 'success' || 
                       order.paymentInfo?.status === 'captured' ||
                       (order.paymentMethod === 'razorpay' && order.status !== OrderStatus.PENDING) ||
                       [OrderStatus.CONFIRMED, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED, OrderStatus.READY_TO_SHIP, OrderStatus.OUT_FOR_DELIVERY].includes(order.status as OrderStatus);
        const paidAmount = isPaid ? Number(order.totalAmount) : 0;
        const pendingAmount = Number(order.totalAmount) - paidAmount;

        // Fetch real payment records from 'payments' table (Success)
        const successfulPayments = await this.paymentRepository.find({
            where: { order_id: id },
            order: { created_at: 'DESC' }
        });

        // Fetch real payment attempts from 'payment_attempts' table (All)
        const rawAttempts = await this.paymentAttemptRepository.find({
            where: { order_id: id },
            order: { created_at: 'DESC' }
        });

        const paymentHistory: any[] = [];

        // Add successful payments first
        successfulPayments.forEach(p => {
             paymentHistory.push({
                id: p.id,
                amount: Number(p.amount),
                method: p.payment_method || (order.paymentMethod === 'razorpay' ? 'Razorpay' : order.paymentMethod || 'Razorpay'),
                transactionId: p.transaction_id || '-',
                paymentDate: p.paid_at || p.created_at,
                status: p.status || 'success',
            });
        });

        // Add attempts that aren't already represented by successful payments
        rawAttempts.forEach(attempt => {
            const isAlreadyListed = successfulPayments.some(p => p.payment_attempt_id === attempt.id);
            if (!isAlreadyListed) {
                paymentHistory.push({
                    id: attempt.id,
                    amount: Number(attempt.amount),
                    method: attempt.payment_gateway || (order.paymentMethod === 'razorpay' ? 'Razorpay' : order.paymentMethod || 'Razorpay'),
                    transactionId: attempt.gateway_order_id || '-',
                    paymentDate: attempt.created_at,
                    status: attempt.payment_status,
                });
            }
        });

        // Synthesize a record if paid but no history records found in DB tables
        if (paymentHistory.length === 0 && isPaid) {
            const method = order.paymentMethod || (order.paymentInfo as any)?.method || 'Razorpay';
            const tid = (order.paymentInfo as any)?.transactionId || 
                        (order.paymentInfo as any)?.razorpayPaymentId || 
                        (order.paymentInfo as any)?.razorpay_payment_id || 
                        (order.paymentInfo as any)?.paymentId || '-';
            
            paymentHistory.push({
                amount: Number(order.totalAmount),
                method,
                transactionId: tid,
                paymentDate: (order as any).createdAt,
                status: 'success'
            });
        }

        let customer = undefined;
        if (order.customer) {
            customer = {
                firstName: order.customer.name?.split(' ')[0] || '',
                lastName: order.customer.name?.split(' ').slice(1).join(' ') || '',
                email: order.customer.email,
            };
        } else if (order.billingAddress || order.shippingAddress) {
            const address = order.billingAddress || order.shippingAddress;
            const fullName = address.fullName || 'Guest';
            const nameParts = fullName.split(' ');
            customer = {
                firstName: nameParts[0],
                lastName: nameParts.slice(1).join(' '),
                email: address.email || (order as any).guestEmail || '',
            };
        }

        const storefrontBase = process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:3000';
        let storefrontUrl = storefrontBase;
        if (order.store) {
            // In local dev, we often use subdomains on localhost
            if (storefrontBase.includes('localhost')) {
                storefrontUrl = storefrontBase.replace('localhost', `${order.store.slug}.localhost`);
            } else {
                // Production logic: use store domain or subdomain
                storefrontUrl = `https://${order.store.slug}.${process.env.BASE_DOMAIN || 'prefyn.com'}`;
            }
        }

        return {
            data: {
                ...order,
                _id: order.id,
                storefrontUrl,
                customer,
                pricing: {
                    subtotal: order.subtotal,
                    discount: order.discountAmount,
                    tax: order.taxAmount,
                    shippingCharges: order.shippingCost,
                    total: order.totalAmount,
                },
                paymentSummary: {
                    paidAmount,
                    rejectedAmount: 0,
                    pendingAmount,
                    paidItemsCount: isPaid ? order.items.length : 0,
                    rejectedItemsCount: 0,
                    pendingItemsCount: isPaid ? 0 : order.items.length,
                },
                payment: {
                    method: order.paymentMethod || (order.paymentInfo as any)?.method || 'Razorpay',
                    status: order.paymentStatus || (order.paymentInfo as any)?.status || 'pending',
                    transactionId: (order.paymentInfo as any)?.transactionId || 
                                   (order.paymentInfo as any)?.razorpayPaymentId || 
                                   (order.paymentInfo as any)?.razorpay_payment_id || 
                                   (order.paymentInfo as any)?.paymentId || '-',
                    paidAt: (order.paymentInfo as any)?.paidAt || (order as any).createdAt,
                },
                paymentHistory
            }
        };
    }

    @ApiOperation({ summary: 'Create manual order' })
    @Post('orders')
    async createOrder(@Body() body: any, @Request() req: any) {
        const storeId = req.user?.storeId;
        const pricing = body.pricing || {};
        // Normalize items: frontend sends {product, productName, ...} but entity uses {productId, productTitle, ...}
        const initialItems = body.items || [];
        const productIds = initialItems.map((item: any) => item.product || item.productId).filter((id: any) => id);
        const variantIds = initialItems.map((item: any) => item.variantId).filter((id: any) => id);
        const allQueryIds = Array.from(new Set([...productIds, ...variantIds]));
        const dbProducts = allQueryIds.length > 0
            ? await this.catalogService.findProductsByIds(allQueryIds, storeId)
            : [];
        const productsMap = new Map(dbProducts.map(p => [p.id, p]));

        const items = initialItems.map((item: any) => {
            const productId = item.product || item.productId || null;
            const variantId = item.variantId || null;

            const targetProdId = variantId || productId;
            const dbProduct = targetProdId ? productsMap.get(targetProdId) : (productId ? productsMap.get(productId) : null);
            let costPrice = dbProduct ? Number(dbProduct.costPrice || 0) : 0;
            if (costPrice === 0 && dbProduct?.parentId) {
                const parentProduct = productsMap.get(dbProduct.parentId) || dbProduct.parent;
                if (parentProduct) {
                    costPrice = Number(parentProduct.costPrice || 0);
                }
            }

            return {
                productId,
                productName: item.productName || item.productTitle || 'Item',
                sku: item.sku || item.productSku || '',
                price: Number(item.price) || 0,
                costPrice: costPrice,
                quantity: Number(item.quantity) || 1,
                totalPrice: Number(item.total) || Number(item.price) * Number(item.quantity) || 0,
                variantId,
                variantInfo: item.variantInfo || item.selectedVariant || null,
            };
        });

        const order = this.orderRepository.create({
            orderNumber: body.orderNumber || `ORD-${Date.now()}`,
            customerId: body.customer || body.customerId || null,
            status: body.status || OrderStatus.PENDING,
            items,
            totalAmount: Number(pricing.total ?? body.totalAmount ?? 0),
            subtotal: Number(pricing.subtotal ?? body.subtotal ?? 0),
            taxAmount: Number(pricing.tax ?? body.tax ?? 0),
            discountAmount: Number(pricing.discount ?? body.discount ?? 0),
            shippingCost: Number(pricing.shippingCost ?? body.shippingCost ?? 0),
            billingAddress: body.billingAddress || null,
            shippingAddress: body.shippingAddress || body.billingAddress || null,
            storeId,
            orderType: body.orderType || 'manual_invoice',
            metadata: {
                createdByAdmin: true,
                notes: body.notes || '',
                // Other non-fixed data can be stored here
            },
        });
        return this.orderRepository.save(order);
    }

    @ApiOperation({ summary: 'Update order' })
    @ApiParam({ name: 'id' })
    @Put('orders/:id')
    async updateOrder(@Param('id') id: string, @Body() body: any, @Request() req: any) {
        const storeId = req.user?.storeId;
        const whereCond: any = { id };
        if (storeId) whereCond.storeId = storeId;

        const order = await this.orderRepository.findOne({ where: whereCond });
        if (!order) throw new NotFoundException('Order not found');

        Object.assign(order, body);
        return this.orderRepository.save(order);
    }

    @ApiOperation({ summary: 'Update order status' })
    @ApiParam({ name: 'id' })
    @Put('orders/:id/status')
    async updateOrderStatus(@Param('id') id: string, @Body() body: { status: OrderStatus }, @Request() req: any) {
        const storeId = req.user?.storeId;
        const whereCond: any = { id };
        if (storeId) whereCond.storeId = storeId;

        const order = await this.orderRepository.findOne({ where: whereCond });
        if (!order) throw new NotFoundException('Order not found');

        order.status = body.status;
        return this.orderRepository.save(order);
    }

    @ApiOperation({ summary: 'Update order delivery info' })
    @ApiParam({ name: 'id' })
    @Put('orders/:id/delivery')
    async updateDeliveryInfo(@Param('id') id: string, @Body() body: any, @Request() req: any) {
        const storeId = req.user?.storeId;
        const whereCond: any = { id };
        if (storeId) whereCond.storeId = storeId;

        const order = await this.orderRepository.findOne({ where: whereCond });
        if (!order) throw new NotFoundException('Order not found');

        (order as any).paymentInfo = { ...order.paymentInfo, ...body };
        return this.orderRepository.save(order);
    }

    @ApiOperation({ summary: 'Delete order' })
    @ApiParam({ name: 'id' })
    @Delete('orders/:id')
    async deleteOrder(@Param('id') id: string, @Request() req: any) {
        const storeId = req.user?.storeId;
        const whereCond: any = { id };
        if (storeId) whereCond.storeId = storeId;

        const order = await this.orderRepository.findOne({ where: whereCond });
        if (!order) throw new NotFoundException('Order not found');

        await this.orderRepository.delete(id);
        return { success: true, message: 'Order deleted' };
    }

    @ApiOperation({ summary: 'Get user orders (admin view)' })
    @ApiParam({ name: 'customerId' })
    @Get('orders/customer/:customerId')
    async getCustomerOrders(@Param('customerId') customerId: string, @Request() req: any) {
        const storeId = req.user?.storeId;
        const whereCond: any = { customerId };
        if (storeId) whereCond.storeId = storeId;

        const orders = await this.orderRepository.find({ 
            where: whereCond, 
            order: { createdAt: 'DESC' } 
        });
        return { data: orders };
    }


    @Get('admins-list')
    async getAdmins(@Request() req: any, @Query() query: any) {
        const storeId = req.user?.storeId;
        const role = req.user?.role;
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 20;

        const superRoles = [AdminRole.ADMIN];
        
        let filterRole: any = undefined;
        
        // Handle specific role request from query
        if (query.role) {
            filterRole = query.role;
        } 
        // Handle Platform-only admins (Super + Super Sub)
        else if (query.type === 'super') {
            filterRole = In(superRoles);
        }
        // Legacy/Default logic
        else if (superRoles.includes(role) && !storeId && !query.storeId) {
             // By default, if super admin doesn't provide storeId, only show Super Admin roles
             // However, for consistency with the new 'type=super' param, we can leave this open
             // or force it. Let's keep it open unless explicitly asked to filter.
        }

        const { admins, total } = await this.adminAuthService.getAllAdmins(
            query.storeId || storeId, 
            filterRole, 
            page, 
            limit
        );
        return {
            data: admins.map(admin => ({
                _id: admin.id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                phone: admin.phone || null,
                createdAt: admin.createdAt,
                updatedAt: admin.updatedAt,
                permissions: admin.permissions || [],
                adminType: admin.adminType || null,
            })),
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
        };
    }

    @ApiOperation({ summary: 'Get admin by ID' })
    @Get('admins-list/:id')
    async getAdminById(@Param('id', new ParseUUIDPipe()) id: string, @Request() req: any) {
        const storeId = req.user?.storeId;
        const admin = await this.adminAuthService.getAdminById(id);

        if (storeId && admin.storeId !== storeId) {
            throw new UnauthorizedException('You do not have permission to view this admin');
        }
        return {
            data: {
                _id: admin.id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                phone: admin.phone || null,
                createdAt: admin.createdAt,
                updatedAt: admin.updatedAt,
                permissions: admin.permissions || [],
                adminType: admin.adminType || null,
            }
        };
    }

    @Post('admins-list')
    async createAdminUser(@Body() body: any, @Request() req: any) {
        const currentUser = await this.adminAuthService.getAdminById(req.user.userId);
        
        // Default role to sub_admin if not provided
        if (!body.role) {
            body.role = AdminRole.SUB_ADMIN;
        }

        const admin = await this.adminAuthService.createAdmin(body, currentUser);
        return {
            data: {
                _id: admin.id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                phone: admin.phone || null,
                createdAt: admin.createdAt,
                updatedAt: admin.updatedAt,
                permissions: admin.permissions || [],
                adminType: admin.adminType || null,
            }
        };
    }

    @ApiOperation({ summary: 'Update admin' })
    @Put('admins-list/:id')
    async updateAdminUser(@Param('id', new ParseUUIDPipe()) id: string, @Body() body: any, @Request() req: any) {
        const storeId = req.user?.storeId;
        const existingAdmin = await this.adminAuthService.getAdminById(id);

        if (storeId && existingAdmin.storeId !== storeId) {
            throw new UnauthorizedException('You do not have permission to edit this admin');
        }

        const superRoles = [AdminRole.ADMIN];
        if (storeId && superRoles.includes(body.role)) {
            throw new UnauthorizedException('You cannot grant super admin privileges');
        }

        const admin = await this.adminAuthService.updateAdmin(id, body);
        return {
            data: {
                _id: admin.id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                phone: admin.phone || null,
                createdAt: admin.createdAt,
                updatedAt: admin.updatedAt,
                permissions: admin.permissions || [],
                adminType: admin.adminType || null,
            }
        };
    }

    @ApiOperation({ summary: 'Delete admin' })
    @Delete('admins-list/:id')
    async deleteAdminUser(@Param('id', new ParseUUIDPipe()) id: string, @Request() req: any) {
        const storeId = req.user?.storeId;
        const existingAdmin = await this.adminAuthService.getAdminById(id);

        if (storeId && existingAdmin.storeId !== storeId) {
            throw new UnauthorizedException('You do not have permission to delete this admin');
        }

        const superRoles = [AdminRole.ADMIN];
        if (superRoles.includes(existingAdmin.role) && req.user?.role !== AdminRole.ADMIN) {
            throw new UnauthorizedException('Only a Super Admin can delete Super/Sub Admin roles');
        }

        return this.adminAuthService.deleteAdmin(id);
    }


    // ── Admin Customers ─────────────────────────────────────────────────
    @ApiOperation({ summary: 'Get all customers' })
    @Get('customers')
    async getAllCustomers(@Request() req: any, @Query() query: any) {
        const storeId = req.user?.storeId;
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 20;
        const skip = (page - 1) * limit;
        const search = query.search || '';

        const qb = this.customerRepository.createQueryBuilder('c');

        if (storeId) {
            qb.andWhere('c.storeId = :storeId', { storeId });
        }

        if (search) {
            const searchCondition = '(c.name ILIKE :search OR c.email ILIKE :search OR c.phone ILIKE :search)';
            qb.andWhere(searchCondition, { search: `%${search}%` });
        }

        const [data, total] = await qb
            .leftJoinAndSelect('c.addresses', 'addr')
            .orderBy('c.createdAt', 'DESC')
            .skip(skip)
            .take(limit)
            .getManyAndCount();

        const mappedData = data.map(customer => {
            const nameParts = customer.name?.split(' ') || [];
            return {
                ...customer,
                _id: customer.id,
                firstName: nameParts[0] || '',
                lastName: nameParts.slice(1).join(' ') || '',
            };
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

    @ApiOperation({ summary: 'Get customer by ID' })
    @ApiParam({ name: 'id' })
    @Get('customers/:id')
    async getCustomerById(@Param('id', new ParseUUIDPipe()) id: string, @Request() req: any) {
        const storeId = req.user?.storeId;
        const customerRepo = this.customerRepository;
        
        const where: any = { id };
        if (storeId) {
            where.storeId = storeId;
        }

        const customer = await customerRepo.findOne({
            where,
            relations: ['addresses']
        });
        if (!customer) {
            throw new NotFoundException('Customer not found');
        }

        const nameParts = customer.name?.split(' ') || [];
        return {
            data: {
                ...customer,
                _id: customer.id,
                firstName: nameParts[0] || '',
                lastName: nameParts.slice(1).join(' ') || '',
                addresses: customer.addresses || [],
            }
        };
    }

    @ApiOperation({ summary: 'Create customer' })
    @Post('customers')
    async createCustomer(@Body() body: any, @Request() req: any) {
        const storeId = req.user?.storeId;
        const targetStoreId = storeId || body.storeId;
        const customerRepo = this.customerRepository;

        if (targetStoreId && body.email) {
            const existingCustomer = await customerRepo.findOne({
                where: { email: body.email, storeId: targetStoreId }
            });

            if (existingCustomer) {
                throw new BadRequestException('A customer with this email already exists in this store');
            }
        }

        const customer = customerRepo.create({
            name: body.name || `${body.firstName || ''} ${body.lastName || ''}`.trim(),
            email: body.email,
            phone: body.phone || (body.phone?.number ? `${body.phone?.countryCode || ''} ${body.phone?.number}`.trim() : null),
            isActive: body.isActive !== undefined ? body.isActive : true,
            storeId: targetStoreId,
        });

        if (body.password) {
            const salt = await bcrypt.genSalt();
            customer.password = await bcrypt.hash(body.password, salt);
        }

        await customerRepo.save(customer);

        // Save addresses if provided
        if (body.shippingAddress || body.billingAddress) {
            const addressesToSave = [];
            
            if (body.shippingAddress) {
                const s = body.shippingAddress;
                addressesToSave.push(this.addressRepository.create({
                    fullName: s.fullName || s.name || customer.name,
                    email: s.email || customer.email,
                    street: s.street || s.addressLine1 || s.address,
                    landmark: s.landmark || s.addressLine2,
                    city: s.city,
                    state: s.state || s.province,
                    country: s.country || 'India',
                    pincode: s.pincode || s.pinCode || s.postalCode,
                    phone: s.phone || customer.phone,
                    customerId: customer.id,
                    type: AddressType.SHIPPING,
                    isDefault: true
                }));
            }
            
            if (body.billingAddress) {
                const b = body.billingAddress;
                addressesToSave.push(this.addressRepository.create({
                    fullName: b.fullName || b.name || customer.name,
                    email: b.email || customer.email,
                    street: b.street || b.addressLine1 || b.address,
                    landmark: b.landmark || b.addressLine2,
                    city: b.city,
                    state: b.state || b.province,
                    country: b.country || 'India',
                    pincode: b.pincode || b.pinCode || b.postalCode,
                    phone: b.phone || customer.phone,
                    customerId: customer.id,
                    type: AddressType.BILLING,
                    isDefault: !body.shippingAddress
                }));
            }

            if (addressesToSave.length > 0) {
                await this.addressRepository.save(addressesToSave);
            }
        }
        
        const nameParts = customer.name?.split(' ') || [];
        return { 
            data: { 
                ...customer, 
                _id: customer.id,
                firstName: nameParts[0] || '',
                lastName: nameParts.slice(1).join(' ') || '',
            } 
        };
    }

    @ApiOperation({ summary: 'Update customer' })
    @ApiParam({ name: 'id' })
    @Put('customers/:id')
    async updateCustomer(@Param('id', new ParseUUIDPipe()) id: string, @Body() body: any, @Request() req: any) {
        const storeId = req.user?.storeId;
        const customerRepo = this.customerRepository;

        const where: any = { id };
        if (storeId) {
            where.storeId = storeId;
        }

        const customer = await customerRepo.findOne({ where });
        if (!customer) throw new NotFoundException('Customer not found');

        if (body.firstName || body.lastName) {
            customer.name = `${body.firstName || ''} ${body.lastName || ''}`.trim();
        } else if (body.name) {
            customer.name = body.name;
        }
        
        if (body.email) customer.email = body.email;
        if (body.phone) {
             customer.phone = typeof body.phone === 'object' && body.phone.number 
                ? `${body.phone.countryCode || ''} ${body.phone.number}`.trim() 
                : body.phone;
        }
        if (body.isActive !== undefined) customer.isActive = body.isActive;

        await customerRepo.save(customer);

        const nameParts = customer.name?.split(' ') || [];
        return { 
            data: { 
                ...customer, 
                _id: customer.id,
                firstName: nameParts[0] || '',
                lastName: nameParts.slice(1).join(' ') || '', 
            } 
        };
    }

    @ApiOperation({ summary: 'Delete customer' })
    @ApiParam({ name: 'id' })
    @Delete('customers/:id')
    async deleteCustomer(@Param('id', new ParseUUIDPipe()) id: string, @Request() req: any) {
        const storeId = req.user?.storeId;
        const customerRepo = this.customerRepository;

        const where: any = { id };
        if (storeId) {
            where.storeId = storeId;
        }

        const customer = await customerRepo.findOne({ where });
        if (!customer) throw new NotFoundException('Customer not found');

        await customerRepo.delete(id);
        return { success: true, message: 'Customer deleted' };
    }

    // ── Audit Logs ──────────────────────────────────────────────────────
    @ApiOperation({ summary: 'Get audit logs' })
    @Get('audit-logs')
    async getAuditLogs(@Query() query: any, @Request() req: any) {
        const storeId = req.user?.storeId;
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 20;
        const skip = (page - 1) * limit;

        const queryBuilder = this.auditLogRepository.createQueryBuilder('auditLog');
        queryBuilder.leftJoinAndSelect('auditLog.admin', 'admin');

        if (storeId) {
            queryBuilder.andWhere('auditLog.storeId = :storeId', { storeId });
        }

        // Apply filters
        if (query.search) {
            const search = `%${query.search}%`;
            queryBuilder.andWhere(
                '(admin.email ILIKE :search OR admin.name ILIKE :search OR auditLog.resourceName ILIKE :search OR auditLog.actionDescription ILIKE :search)',
                { search }
            );
        }

        if (query.action && query.action !== '') {
            queryBuilder.andWhere('auditLog.action = :action', { action: query.action });
        }

        if (query.resourceType && query.resourceType !== '') {
            queryBuilder.andWhere('LOWER(auditLog.resourceType) = LOWER(:resourceType)', { resourceType: query.resourceType });
        }

        if (query.adminId) {
            queryBuilder.andWhere('auditLog.adminId = :adminId', { adminId: query.adminId });
        }

        queryBuilder.orderBy('auditLog.createdAt', 'DESC');

        const [logs, total] = await queryBuilder
            .skip(skip)
            .take(limit)
            .getManyAndCount();

        // Map to match frontend expectations
        const mappedLogs = logs.map(log => ({
            id: log.id,
            user: log.admin ? {
                id: log.admin.id,
                name: log.admin.name || 'Unknown',
                email: log.admin.email,
                role: log.admin.role || 'admin',
            } : {
                id: log.adminId || '',
                name: 'Unknown',
                email: 'N/A',
                role: 'admin',
            },
            action: log.action,
            actionDescription: log.actionDescription || log.action,
            resourceType: log.resourceType,
            resourceId: log.resourceId,
            resourceName: log.resourceName || log.resourceType,
            changes: log.changes || {},
            ipAddress: log.ipAddress,
            userAgent: log.userAgent,
            status: log.status || 'success',
            createdAt: log.createdAt,
        }));

        return {
            data: mappedLogs,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }

    // ── Tags ────────────────────────────────────────────────────────────
    @ApiOperation({ summary: 'Search tags' })
    @Get('tags/search')
    async searchTags(@Query('q') q: string, @Query('limit') limit: string, @Request() req: any) {
        const storeId = req.user?.storeId;
        const whereCond: any = {};
        if (storeId) whereCond.storeId = storeId;
        
        if (q) {
            whereCond.name = Like(`%${q}%`);
        }
        
        const take = parseInt(limit) || 10;
        const tags = await this.tagRepository.find({ 
            where: whereCond, 
            order: { name: 'ASC' },
            take 
        });
        return { tags, count: tags.length, success: true };
    }

    @ApiOperation({ summary: 'Get all tags' })
    @Get('tags')
    async getAllTags(@Request() req: any, @Query('search') search?: string) {
        const storeId = req.user?.storeId;
        const whereCond: any = {};
        if (storeId) whereCond.storeId = storeId;
        if (search) {
            whereCond.name = Like(`%${search}%`);
        }
        
        const tags = await this.tagRepository.find({ where: whereCond, order: { name: 'ASC' } });
        return { tags, count: tags.length, success: true };
    }

    @ApiOperation({ summary: 'Create tag' })
    @Post('tags')
    async createTag(@Body() body: any, @Request() req: any) {
        const storeId = req.user?.storeId;
        const tagData = { ...body };
        if (storeId) tagData.storeId = storeId;
        
        const tag = this.tagRepository.create(tagData);
        const saved = await this.tagRepository.save(tag);
        return { tag: saved, success: true, message: 'Tag created' };
    }

    @ApiOperation({ summary: 'Get tag by ID' })
    @ApiParam({ name: 'id' })
    @Get('tags/:id')
    async getTagById(@Param('id') id: string, @Request() req: any) {
        const storeId = req.user?.storeId;
        const whereCond: any = { id };
        if (storeId) whereCond.storeId = storeId;

        const tag = await this.tagRepository.findOne({ where: whereCond });
        if (!tag) throw new NotFoundException('Tag not found');
        
        return { tag, success: true };
    }

    @ApiOperation({ summary: 'Update tag' })
    @ApiParam({ name: 'id' })
    @Put('tags/:id')
    async updateTag(@Param('id') id: string, @Body() body: any, @Request() req: any) {
        const storeId = req.user?.storeId;
        const whereCond: any = { id };
        if (storeId) whereCond.storeId = storeId;

        const tag = await this.tagRepository.findOne({ where: whereCond });
        if (!tag) throw new NotFoundException('Tag not found');
        
        Object.assign(tag, body);
        const updated = await this.tagRepository.save(tag);
        return { tag: updated, success: true, message: 'Tag updated' };
    }

    @ApiOperation({ summary: 'Delete tag' })
    @ApiParam({ name: 'id' })
    @Delete('tags/:id')
    async deleteTag(@Param('id') id: string, @Request() req: any) {
        const storeId = req.user?.storeId;
        const whereCond: any = { id };
        if (storeId) whereCond.storeId = storeId;

        const tag = await this.tagRepository.findOne({ where: whereCond });
        if (!tag) throw new NotFoundException('Tag not found');

        await this.tagRepository.delete(id);
        return { success: true, message: 'Tag deleted' };
    }

    // ── Email Settings ─────────────────────────────────────────────────
    @ApiOperation({ summary: 'Get email settings' })
    @Get('email-config/settings')
    async getEmailSettings(@Request() req: any) {
        const storeId = req.user?.storeId;
        const settings = await this.emailSettingsRepository.findOne({ where: { storeId } });
        if (settings && settings.smtpPassword) {
            settings.smtpPassword = '********';
        }
        return settings || {};
    }

    @ApiOperation({ summary: 'Update email settings' })
    @Put('email-config/settings')
    async updateEmailSettings(@Body() body: any, @Request() req: any) {
        const storeId = req.user?.storeId;
        let settings = await this.emailSettingsRepository.findOne({ where: { storeId } });
        
        const updateData = { ...body };
        if (updateData.smtpPassword === '********') {
            delete updateData.smtpPassword; // Don't update if it's the placeholder
        } else if (updateData.smtpPassword) {
            updateData.smtpPassword = this.cryptoService.encrypt(updateData.smtpPassword);
        }

        if (settings) {
            Object.assign(settings, updateData);
        } else {
            settings = this.emailSettingsRepository.create({ ...updateData, storeId }) as any;
        }
        
        const saved = await this.emailSettingsRepository.save(settings);
        if (saved && saved.smtpPassword) {
            saved.smtpPassword = '********';
        }
        return saved;
    }

    @ApiOperation({ summary: 'Test email connection' })
    @Post('email-config/test-connection')
    async testConnection(@Body() body: any, @Request() req: any) {
        const { testEmail, ...settings } = body;
        if (!testEmail) throw new BadRequestException('Recipient email is required');

        // Handle masked password from UI
        if (settings.smtpPassword === '********') {
            const storeId = req.user?.storeId;
            const existing = await this.emailSettingsRepository.findOne({ where: { storeId } });
            if (existing) {
                settings.smtpPassword = existing.smtpPassword; // Use real (encrypted) pass from DB
            }
        }
        
        try {
            await this.emailService.testConnection(settings, testEmail);
            return { success: true, message: 'Test email sent successfully' };
        } catch (error) {
            throw new BadRequestException(error.message || 'Failed to send test email');
        }
    }

    // ── Email Templates ─────────────────────────────────────────────────
    @ApiOperation({ summary: 'Get email templates' })
    @Get('email-config/templates')
    async getEmailTemplates(@Request() req: any) {
        const storeId = req.user?.storeId;
        const whereCond = storeId ? { storeId } : {};
        return this.emailTemplateRepository.find({ where: whereCond, order: { createdAt: 'DESC' } });
    }

    @ApiOperation({ summary: 'Get email template by ID' })
    @ApiParam({ name: 'id' })
    @Get('email-config/templates/:id')
    async getEmailTemplateById(@Param('id') id: string, @Request() req: any) {
        const storeId = req.user?.storeId;
        const whereCond: any = { id };
        if (storeId) whereCond.storeId = storeId;
        return this.emailTemplateRepository.findOne({ where: whereCond });
    }

    @ApiOperation({ summary: 'Create email template' })
    @Post('email-config/templates')
    async createEmailTemplate(@Body() body: any, @Request() req: any) {
        const storeId = req.user?.storeId;
        const template = this.emailTemplateRepository.create({ ...body, storeId });
        return this.emailTemplateRepository.save(template);
    }

    @ApiOperation({ summary: 'Update email template' })
    @ApiParam({ name: 'id' })
    @Put('email-config/templates/:id')
    async updateEmailTemplate(@Param('id') id: string, @Body() body: any, @Request() req: any) {
        const storeId = req.user?.storeId;
        const whereCond: any = { id };
        if (storeId) whereCond.storeId = storeId;
        
        const template = await this.emailTemplateRepository.findOne({ where: whereCond });
        if (!template) throw new NotFoundException('Template not found');

        Object.assign(template, body);
        return this.emailTemplateRepository.save(template);
    }

    @ApiOperation({ summary: 'Delete email template' })
    @ApiParam({ name: 'id' })
    @Delete('email-config/templates/:id')
    async deleteEmailTemplate(@Param('id') id: string, @Request() req: any) {
        const storeId = req.user?.storeId;
        const whereCond: any = { id };
        if (storeId) whereCond.storeId = storeId;

        const template = await this.emailTemplateRepository.findOne({ where: whereCond });
        if (!template) throw new NotFoundException('Template not found');

        await this.emailTemplateRepository.remove(template);
        return { success: true, message: 'Email template deleted' };
    }

    @ApiOperation({ summary: 'Initialize default email templates' })
    @Post('email-config/templates/init')
    async initializeTemplates(@Request() req: any) {
        const storeId = req.user?.storeId;
        if (!storeId) throw new BadRequestException('Store ID not found');
        
        await this.tenantService.createDefaultTemplates(storeId);
        return this.emailTemplateRepository.find({ where: { storeId }, order: { createdAt: 'DESC' } });
    }

    @ApiOperation({ summary: 'Send test email for template' })
    @ApiParam({ name: 'id' })
    @Post('email-config/templates/:id/test')
    async sendTestTemplateEmail(@Param('id') id: string, @Body() body: { email: string }, @Request() req: any) {
        const storeId = req.user?.storeId;
        if (!body.email) throw new BadRequestException('Recipient email is required');

        try {
            await this.emailService.sendTemplateTestEmail(id, body.email, storeId);
            return { success: true, message: 'Test email sent successfully' };
        } catch (error) {
            throw new BadRequestException(error.message || 'Failed to send test email');
        }
    }

    // ── Notifications ───────────────────────────────────────────────────
    @ApiOperation({ summary: 'Get admin notifications' })
    @Get('notifications')
    async getNotifications(@Query() query: any, @Request() req: any) {
        const storeId = req.user?.storeId;
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 10;
        const skip = (page - 1) * limit;

        const whereCond: any = {};
        if (storeId) whereCond.storeId = storeId;

        const [data, total] = await this.notificationRepository.findAndCount({
            where: whereCond,
            order: { createdAt: 'DESC' },
            take: limit,
            skip: skip,
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

    @ApiOperation({ summary: 'Get unread notification count' })
    @Get('notifications/unread-count')
    async getUnreadCount(@Request() req: any) {
        const storeId = req.user?.storeId;
        const whereCond: any = { isRead: false };
        if (storeId) whereCond.storeId = storeId;

        const count = await this.notificationRepository.count({ where: whereCond });
        return { data: { count } };
    }

    @ApiOperation({ summary: 'Mark all notifications as read' })
    @Put('notifications/mark-all-read')
    async markAllAsRead(@Request() req: any) {
        const storeId = req.user?.storeId;
        const qb = this.notificationRepository.createQueryBuilder().update().set({ isRead: true } as any);
        
        if (storeId) {
            qb.where('isRead = :isRead AND "storeId" = :storeId', { isRead: false, storeId });
        } else {
            qb.where('isRead = :isRead', { isRead: false });
        }
        
        await qb.execute();
        return { success: true };
    }

    @ApiOperation({ summary: 'Mark notification as read' })
    @ApiParam({ name: 'id' })
    @Put('notifications/:id/read')
    async markNotificationRead(@Param('id') id: string, @Request() req: any) {
        const storeId = req.user?.storeId;
        const whereCond: any = { id };
        if (storeId) whereCond.storeId = storeId;

        const notification = await this.notificationRepository.findOne({ where: whereCond });
        if (!notification) throw new NotFoundException('Notification not found');

        await this.notificationRepository.update(id, { isRead: true } as any);
        return { success: true };
    }

    @ApiOperation({ summary: 'Delete notification' })
    @ApiParam({ name: 'id' })
    @Delete('notifications/:id')
    async deleteNotification(@Param('id') id: string, @Request() req: any) {
        const storeId = req.user?.storeId;
        const whereCond: any = { id };
        if (storeId) whereCond.storeId = storeId;

        const notification = await this.notificationRepository.findOne({ where: whereCond });
        if (!notification) throw new NotFoundException('Notification not found');

        await this.notificationRepository.delete(id);
        return { success: true };
    }

    @ApiOperation({ summary: 'Get customer report' })
    @Get('reports/customers')
    async getCustomerReport() {
        const total = await this.customerRepository.count();
        const active = await this.customerRepository.count({ where: { isActive: true } });
        return { total, active, inactive: total - active };
    }

    // ── Section Library (Super Admin) ────────────────────────────────────
    @ApiOperation({ summary: 'Get global section library' })
    @Get('sections/library')
    async getSectionLibrary() {
        const sections = await this.sectionRepository.find({
            order: { name: 'ASC' }
        });
        return { data: sections };
    }

    @ApiOperation({ summary: 'Create global section' })
    @Post('sections/library')
    async createLibrarySection(@Body() body: any) {
        const section = this.sectionRepository.create({
            ...body,
        });
        return this.sectionRepository.save(section);
    }

    @ApiOperation({ summary: 'Update global section' })
    @Put('sections/library/:id')
    async updateLibrarySection(@Param('id') id: string, @Body() body: any) {
        await this.sectionRepository.update(id, { ...body });
        return this.sectionRepository.findOne({ where: { id } });
    }

    @ApiOperation({ summary: 'Toggle section status' })
    @Patch('sections/library/:id/status')
    async toggleSectionStatus(@Param('id') id: string, @Body() body: { isActive: boolean }) {
        await this.sectionRepository.update(id, { isActive: body.isActive });
        return { success: true };
    }

    @ApiOperation({ summary: 'Delete global section' })
    @Delete('sections/library/:id')
    async deleteLibrarySection(@Param('id') id: string) {
        await this.sectionRepository.delete(id);
        return { success: true };
    }
}
