import { Injectable, Logger, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus, PaymentStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CartService } from './cart.service';
import { DiscountService } from './discount.service';
import { InvoiceService } from './invoice.service';
import { CatalogService } from '../catalog/catalog.service';
import { EmailService } from '../notifications/email.service';
import { Store } from '../stores/entities/store.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { PaymentService } from './payment.service';

@Injectable()
export class OrderService {
    private readonly logger = new Logger(OrderService.name);

    constructor(
        @InjectRepository(Order)
        private orderRepository: Repository<Order>,
        @InjectRepository(OrderItem)
        private orderItemRepository: Repository<OrderItem>,
        private cartService: CartService,
        private discountService: DiscountService,
        private invoiceService: InvoiceService,
        private catalogService: CatalogService,
        private emailService: EmailService,
        @InjectRepository(Store)
        private storeRepository: Repository<Store>,
        @Inject(forwardRef(() => PaymentService))
        private paymentService: PaymentService,
    ) { }

    private mapOrderForResponse(order: Order) {
        if (!order) return null;

        const isPaid = order.paymentStatus === PaymentStatus.PAID;

        // Map items to include legacy _id and expected pricing fields
        const items = (order.items || []).map(item => {
            const returnRequest = (order as any).returnRequests?.find(rr => rr.orderItemId === item.id);
            return {
                ...item,
                _id: item.id,
                // If the order is paid, always show items as paid (handles legacy & new orders)
                paymentStatus: isPaid ? 'paid' : (item.paymentStatus || 'pending'),
                total: Number(item.totalPrice) + Number(item.tax_amount || 0),
                subtotal: Number(item.totalPrice),
                tax: Number(item.tax_amount || 0),
                discount: 0,
                returnStatus: returnRequest?.status,
                returnType: returnRequest?.type,
            };
        });
        const paidAmount = isPaid ? Number(order.totalAmount) : 0;
        const pendingAmount = Number(order.totalAmount) - paidAmount;

        return {
            ...order,
            _id: order.id,
            items,
            pricing: {
                total: Number(order.totalAmount),
                subtotal: Number(order.subtotal),
                tax: Number(order.taxAmount),
                shippingCharges: Number(order.shippingCost),
                discount: Number(order.discountAmount),
                discountAmount: 0,
                additionalDiscount: 0,
                currency: order.currency || 'INR',
                exchangeRate: order.exchangeRate || 1,
            },
            paymentSummary: {
                totalAmount: Number(order.totalAmount),
                paidAmount,
                rejectedAmount: 0,
                pendingAmount,
                paidItemsCount: isPaid ? items.length : 0,
                rejectedItemsCount: 0,
                pendingItemsCount: isPaid ? 0 : items.length,
            },
            payment: {
                method: order.paymentMethod,
                status: order.paymentStatus,
            },
            // Metadata fields for the UI
            orderType: order.orderType || order.metadata?.orderType || (order.paymentMethod === 'razorpay' ? 'direct_purchase' : 'quote_request'),
        };
    }

    async createOrderFromCart(customerId: string, orderData: CreateOrderDto, storeId: string) {
        // 1. Get Cart
        const cart = await this.cartService.findOrCreateCart(storeId, customerId);
        if (!cart.items || !cart.items.length) {
            throw new Error('Cart is empty');
        }

        const order = await this.createOrderWithItems(
            customerId,
            orderData,
            storeId,
            cart.items,
            cart.totals,
            cart.discountCode,
            cart.appliedDiscountId
        );

        // Clear the cart after order is successfully created
        await this.cartService.clearCart(storeId, customerId, undefined);

        return order;
    }

    async createOrderDirectly(customerId: string, orderData: CreateOrderDto, storeId: string) {
        if (!orderData.items || !orderData.items.length) {
            throw new Error('No items provided for direct order');
        }

        // Fetch products to get accurate tax rates
        const productIds = orderData.items.map(item => item.productId);
        const products = await this.catalogService.findProductsByIds(productIds, storeId);

        // Map items with accurate tax info
        const itemsWithTax = orderData.items.map(item => {
            const product = products.find(p => p.id === item.productId);
            const taxRate = Number(product?.tax_rate || 0);
            const lineSubtotal = Number(item.price) * item.quantity;
            const taxAmount = (lineSubtotal * taxRate) / 100;
            return {
                ...item,
                tax_rate: taxRate,
                tax_amount: taxAmount,
                totalPrice: lineSubtotal
            };
        });

        // Calculate totals
        const subtotal = itemsWithTax.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0);
        const tax = itemsWithTax.reduce((acc, item) => acc + (item.tax_amount || 0), 0);
        const shipping = 0; // Standardize this if needed
        const total = subtotal + tax + shipping;

        const totals = {
            subtotal,
            tax,
            shippingCharges: shipping,
            total,
            discountAmount: 0,
            discount: 0
        };

        return this.createOrderWithItems(
            customerId,
            orderData,
            storeId,
            itemsWithTax,
            totals
        );
    }

    private async createOrderWithItems(
        customerId: string,
        orderData: CreateOrderDto,
        storeId: string,
        items: any[],
        totals: any,
        discountCode?: string,
        appliedDiscountId?: string
    ) {
        // 1. Validate Inventory (Check stock for all items before starting)
        for (const item of items) {
            const targetId = item.variantId || item.productId;
            await this.catalogService.validateStock(targetId, item.quantity, storeId, item.bundleSelections);
        }

        // 2. Create Order
        const order = this.orderRepository.create({
            customerId,
            orderNumber: `ORD-${Date.now()}`,
            status: OrderStatus.PENDING,
            paymentStatus: PaymentStatus.UNPAID,
            paymentMethod: orderData.paymentMethod || 'Razorpay',
            currency: (orderData as any).currency || 'INR',
            exchangeRate: (orderData as any).exchangeRate || 1,
            storeId,
            totalAmount: totals.total,
            subtotal: totals.subtotal,
            taxAmount: totals.tax,
            shippingCost: totals.shippingCharges,
            discountAmount: (totals.discountAmount || 0) + (totals.discount || 0),
            shippingAddress: orderData.shippingAddress,
            billingAddress: orderData.billingAddress,
            discountCode: discountCode,
            discountId: appliedDiscountId,
            paymentInfo: {
                method: orderData.paymentMethod || 'Razorpay',
                status: 'pending',
            },
            orderType: orderData.paymentMethod === 'razorpay' ? 'direct_purchase' : 'quote_request',
            metadata: {
                // Only non-fixed data here (Browser info, etc. could be added from orderData if provided)
            }
        });

        const savedOrder = await this.orderRepository.save(order);

        // 3. Create Order Items
        const productIds = items.map(item => item.productId).filter(id => id);
        const variantIds = items.map(item => item.variantId).filter(id => id);
        const allQueryIds = Array.from(new Set([...productIds, ...variantIds]));
        const dbProducts = allQueryIds.length > 0
            ? await this.catalogService.findProductsByIds(allQueryIds, storeId)
            : [];
        const productsMap = new Map(dbProducts.map(p => [p.id, p]));

        const orderItems = items.map(item => {
            const productId = item.productId;
            const variantId = item.variantId || (item.product?.is_variant ? item.product.id : null);
            const productName = item.productName || (item.product?.is_variant && item.product?.parent ? item.product.parent.title : item.product?.title) || 'Product';

            const targetProdId = variantId || productId;
            const dbProduct = targetProdId ? productsMap.get(targetProdId) : (productId ? productsMap.get(productId) : null);
            let costPrice = dbProduct ? Number(dbProduct.costPrice || 0) : 0;
            if (costPrice === 0 && dbProduct?.parentId) {
                const parentProduct = productsMap.get(dbProduct.parentId) || dbProduct.parent;
                if (parentProduct) {
                    costPrice = Number(parentProduct.costPrice || 0);
                }
            }

            return this.orderItemRepository.create({
                orderId: savedOrder.id,
                productId: productId,
                variantId: variantId,
                productName: productName,
                sku: item.sku || item.product?.sku || '',
                hsn_code: item.hsn_code || item.product?.hsn_code || '',
                price: Number(item.price),
                costPrice: costPrice,
                tax_rate: Number(item.tax_rate || item.product?.tax_rate || 0),
                tax_amount: (Number(item.totalPrice || item.subtotal || (Number(item.price) * item.quantity)) * Number(item.tax_rate || item.product?.tax_rate || 0)) / 100,
                quantity: item.quantity,
                totalPrice: Number(item.totalPrice || item.subtotal || (Number(item.price) * item.quantity)),
                variantInfo: item.selectedVariant,
                bundleSelections: item.bundleSelections,
            });
        });

        await this.orderItemRepository.save(orderItems);

        // 4. Update Inventory (Decrement Stock)
        for (const item of items) {
            const targetId = item.variantId || item.productId;
            await this.catalogService.decrementStock(targetId, item.quantity, storeId, item.bundleSelections);
        }

        // 5. Increment Discount Usage
        if (appliedDiscountId) {
            await this.discountService.incrementUsage(appliedDiscountId);
        }

        const fullOrder = await this.findOneOrder(savedOrder.id, customerId, storeId);
        return fullOrder;
    }

    async findAllOrders(customerId: string, storeId: string) {
        const orders = await this.orderRepository.find({
            where: { customerId, storeId },
            relations: ['items', 'returnRequests'],
            order: { createdAt: 'DESC' }
        });
        const mappedOrders = orders.map(order => this.mapOrderForResponse(order));
        return this.enrichOrdersWithMetadata(mappedOrders, storeId);
    }

    async findOneOrder(id: string, customerId: string, storeId: string) {
        const order = await this.orderRepository.findOne({
            where: { id, customerId, storeId },
            relations: ['items', 'returnRequests']
        });
        
        if (!order) return null;

        const mappedOrder = this.mapOrderForResponse(order);
        const enriched = await this.enrichOrdersWithMetadata([mappedOrder], storeId);
        return enriched[0];
    }

    private async enrichOrdersWithMetadata(orders: any[], storeId: string) {
        if (!orders || orders.length === 0) return orders;

        // 1. Collect all unique product IDs
        const productIds = new Set<string>();
        orders.forEach(order => {
            order.items?.forEach(item => {
                if (item.productId) productIds.add(item.productId);
            });
        });

        if (productIds.size === 0) return orders;

        // 2. Fetch products in bulk to minimize DB roundtrips
        const productsList = await this.catalogService.findProductsByIds(Array.from(productIds), storeId);
        
        // 3. Transform products (images, brands, titles)
        const transformedProductsMap = new Map<string, any>();
        for (const p of productsList) {
            const transformed = await this.catalogService.transformProduct(p);
            transformedProductsMap.set(p.id, transformed);
        }

        // 4. Map metadata back to order items
        for (const order of orders) {
            if (!order.items) continue;
            for (const item of order.items) {
                    const product = transformedProductsMap.get(item.productId);
                    if (product) {
                        const presentationItem = item as any;
                        // Attach the full product object for policy and metadata
                        presentationItem.product = product;
                        
                        // Provide Image, Brand, and ensure Title is correct
                        presentationItem.productImage = product.icon?.url;
                        presentationItem.brandName = product.productInfo?.brand || presentationItem.brandName;
                        presentationItem.hsn_code = presentationItem.hsn_code || product.hsn_code;
                        
                        // Update generic titles (e.g., if set to 'Product' during quick checkout)
                        if (presentationItem.productName === 'Product' || !presentationItem.productName) {
                            presentationItem.productName = product.productInfo?.title || presentationItem.productName;
                        }

                    const isBundle = product.bundleProducts && product.bundleProducts.length > 0;
                    presentationItem.isBundle = isBundle;

                    if (isBundle) {
                        presentationItem.bundleDetails = product.bundleProducts.map(bp => {
                            const selectedVariantId = item.bundleSelections ? item.bundleSelections[bp._id] : null;
                            let variantName = '';
                            if (selectedVariantId && bp.product.variants) {
                                const variant = bp.product.variants.find(v => v._id === selectedVariantId);
                                if (variant) variantName = variant.name;
                            }
                            return {
                                productId: bp.product._id,
                                productName: bp.product.productInfo.title,
                                brandName: bp.product.productInfo.brand,
                                quantity: bp.quantity,
                                variantId: selectedVariantId,
                                variantName: variantName,
                                image: bp.product.images?.[0]?.url || bp.product.icon?.url
                            };
                        });
                    }
                }
            }
        }
        return orders;
    }

    async updateStatus(id: string, status: OrderStatus, paymentInfo?: any, storeId?: string) {
        const order = await this.orderRepository.findOne({ 
            where: storeId ? { id, storeId } : { id },
            relations: ['items']
        });
        if (!order) {
            throw new Error('Order not found');
        }

        const previousStatus = order.status;
        order.status = status;

        // Handle Stock Restoration on Cancel/Return
        const restorationStatuses = ['cancelled', 'returned'];
        const isNewRestoration = restorationStatuses.includes(status.toLowerCase()) && !restorationStatuses.includes(previousStatus.toLowerCase());

        if (isNewRestoration) {
            try {
                for (const item of order.items) {
                    await this.catalogService.incrementStock(item.productId, item.quantity, order.storeId, item.bundleSelections);
                }
            } catch (err) {
                this.logger.error(`Stock restoration failed for order ${order.id}: ${err.message}`);
            }
        }

        if (paymentInfo) {
            order.paymentInfo = { ...order.paymentInfo, ...paymentInfo };
            // Update paymentStatus based on info
            if (['paid', 'success', 'completed'].includes(paymentInfo.status)) {
                order.paymentStatus = PaymentStatus.PAID;
            }
        }

        const savedOrder = await this.orderRepository.save(order);

        // Generate Invoice if confirmed or paid
        if (status === OrderStatus.CONFIRMED || status === OrderStatus.PROCESSING || status === OrderStatus.SHIPPED || status === OrderStatus.DELIVERED) {
            await this.invoiceService.createInvoiceFromOrder(savedOrder.id, storeId);
        }

        return this.mapOrderForResponse(savedOrder);
    }

    async cancelOrder(id: string, reason: string, customerId: string, storeId: string) {
        const order = await this.orderRepository.findOne({
            where: { id, customerId, storeId },
            relations: ['items']
        });

        if (!order) {
            throw new BadRequestException('Order not found or access denied');
        }

        // Eligibility check
        const allowedStatuses = [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PROCESSING, OrderStatus.READY_TO_SHIP];
        if (!allowedStatuses.includes(order.status)) {
            throw new BadRequestException(`Order cannot be cancelled in its current state: ${order.status}`);
        }

        // 1. Process Refund if Paid
        if (order.paymentStatus === PaymentStatus.PAID) {
            try {
                // Determine gateay if possible, but initiateRefund handles generic
                await this.paymentService.initiateRefund(order.id, storeId, undefined, reason);
                this.logger.log(`Refund initiated for cancelled order: ${order.orderNumber}`);
            } catch (err) {
                this.logger.error(`Automatic refund failed for order ${order.id}: ${err.message}`);
                // We proceed with cancellation but log the refund failure for manual intervention
                // Usually we might want to flag the order as 'Refund Pending' in metadata
                order.metadata = { ...order.metadata, refundError: err.message };
            }
        }

        // 2. Update Status (This will trigger stock restoration in updateStatus logic)
        order.cancellationReason = reason;
        order.cancelledAt = new Date();
        await this.orderRepository.save(order);
        
        // We use the existing updateStatus to handle the complex state transitions and stock logic
        return this.updateStatus(id, OrderStatus.CANCELLED, undefined, storeId);
    }
}
