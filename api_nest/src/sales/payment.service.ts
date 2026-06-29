import { Injectable, Logger, BadRequestException, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
const Stripe = require('stripe');
import { Order, OrderStatus, PaymentStatus } from './entities/order.entity';
import { SettingsService } from '../admin/settings.service';

import { Payment } from '../payments/entities/payment.entity';
import { PaymentAttempt } from '../payments/entities/payment-attempt.entity';
import { OrderItem } from './entities/order-item.entity';
import { StorePaymentConfigService } from '../payments/store-payment-config.service';
import { SystemGatewayConfigService } from '../payments/system-gateway-config.service';
import { EmailService } from '../notifications/email.service';
import { Store } from '../stores/entities/store.entity';
import { CartService } from './cart.service';

@Injectable()
export class PaymentService {
    private readonly logger = new Logger(PaymentService.name);
    private razorpayClients: Map<string, any> = new Map();
    private stripeClients: Map<string, any> = new Map();

    constructor(
        @InjectRepository(Order)
        private orderRepository: Repository<Order>,
        @InjectRepository(OrderItem)
        private orderItemRepository: Repository<OrderItem>,
        @InjectRepository(Payment)
        private paymentRepository: Repository<Payment>,
        @InjectRepository(PaymentAttempt)
        private paymentAttemptRepository: Repository<PaymentAttempt>,
        private configService: ConfigService,
        @Inject(forwardRef(() => SettingsService))
        private settingsService: SettingsService,
        private storePaymentConfigService: StorePaymentConfigService,
        private systemGatewayConfigService: SystemGatewayConfigService,
        private emailService: EmailService,
        @InjectRepository(Store)
        private storeRepository: Repository<Store>,
        @Inject(forwardRef(() => CartService))
        private cartService: CartService,
    ) { }

    /**
     * Get or create a Stripe instance for a specific store
     */
    private async getStripeInstance(storeId: string): Promise<any | null> {
        let secretKey: string;
        let source = 'unknown';

        // 1. Try Store-specific config
        const storeConfig = await this.storePaymentConfigService.getRawConfig(storeId, 'stripe');
        if (storeConfig?.keySecret) {
            secretKey = storeConfig.keySecret;
            source = 'StorePaymentConfig';
        }

        // Check if credentials changed to clear cache
        if (this.stripeClients.has(storeId)) {
            const cachedInstance = this.stripeClients.get(storeId);
            const cachedSource = cachedInstance._sourceInfo || {};
            
            if (
                cachedSource.secretKeyLength === (secretKey ? secretKey.length : 0) &&
                cachedSource.source === source
            ) {
                return cachedInstance;
            }
            
            this.logger.log(`Stripe credentials changed for store ${storeId}. Reinitializing client.`);
            this.stripeClients.delete(storeId);
        }

        if (secretKey) {
            try {
                const stripe = new Stripe(secretKey);
                stripe._sourceInfo = { source, secretKeyLength: secretKey.length };
                this.stripeClients.set(storeId, stripe);
                return stripe;
            } catch (e) {
                this.logger.error(`Failed to initialize Stripe for store ${storeId} from ${source}: ${e.message}`);
                return null;
            }
        }

        return null;
    }

    /**
     * Get Stripe Key Secret for verification/webhooks
     */
    private async getStripeSecret(storeId: string): Promise<string | null> {
        const storeConfig = await this.storePaymentConfigService.getRawConfig(storeId, 'stripe');
        if (storeConfig?.keySecret) return storeConfig.keySecret;

        return null;
    }

    /**
     * Get Stripe Webhook Secret
     */
    async getStripeWebhookSecret(storeId: string): Promise<string | null> {
        const storeConfig = await this.storePaymentConfigService.getRawConfig(storeId, 'stripe');
        if (storeConfig?.webhookSecret) return storeConfig.webhookSecret;

        return null;
    }

    /**
     * Get Stripe Publishable Key for frontend
     */
    async getStripePublishableKey(storeId: string): Promise<string | null> {
        const storeConfig = await this.storePaymentConfigService.getRawConfig(storeId, 'stripe');
        if (storeConfig?.keyId) return storeConfig.keyId;

        return null;
    }

    /**
     * Check if amount meets Stripe's minimum requirements
     * Stripe requires at least $0.50 USD equivalent.
     */
    isAmountValidForStripe(amount: number, currency: string = 'inr'): boolean {
        const currencyLower = currency.toLowerCase();
        // For INR, we use a safe threshold of ₹50 ($0.50 is approx ₹42-45, so ₹50 is safe)
        if (currencyLower === 'inr') {
            return amount >= 50;
        }

        // For other currencies (USD, EUR, etc.), Stripe minimum is usually $0.50 or equivalent
        // $0.51 is a safe threshold for most major currencies
        return amount >= 0.51;
    }

    /**
     * Create a Stripe Checkout Session
     */
    async createStripeCheckoutSession(order: Order, storeId: string, successUrl: string, cancelUrl: string) {
        const stripe = await this.getStripeInstance(storeId);

        if (!stripe) {
            throw new BadRequestException('Stripe keys not configured for this store. Please add them in Payment Settings.');
        }

        const totalAmount = Number(order.totalAmount);
        const orderCurrency = order.currency?.toLowerCase() || 'inr';
        
        if (!this.isAmountValidForStripe(totalAmount, orderCurrency)) {
            const minAmount = orderCurrency === 'inr' ? '₹50' : `0.51 ${orderCurrency.toUpperCase()}`;
            throw new BadRequestException(`Order amount (${totalAmount} ${orderCurrency.toUpperCase()}) is too small for Stripe payment. Minimum required is ${minAmount}.`);
        }

        // Prepare line items
        const lineItems = order.items.map(item => {
            const unitPrice = Number(item.price);
            const unitTax = (Number(item.tax_amount || 0) / item.quantity);
            const unitAmountInclusive = Math.round((unitPrice + unitTax) * 100);

            return {
                price_data: {
                    currency: order.currency?.toLowerCase() || 'inr',
                    product_data: {
                        name: item.productName || 'Product',
                        description: item.variantInfo ? Object.values(item.variantInfo).join(' / ') : undefined,
                    },
                    unit_amount: unitAmountInclusive,
                },
                quantity: item.quantity,
            };
        });

        try {
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: lineItems,
                mode: 'payment',
                currency: order.currency?.toLowerCase() || 'inr',
                success_url: successUrl,
                cancel_url: cancelUrl,
                client_reference_id: order.id,
                metadata: {
                    orderId: order.id,
                    storeId: storeId,
                    orderNumber: order.orderNumber,
                },
                customer_email: order.billingAddress?.email || undefined,
            });

            return session;
        } catch (err: any) {
            this.logger.error(`Stripe session creation failed for store ${storeId}. Error: ${err.message}`);
            throw err;
        }
    }

    /**
     * Verify Stripe Session and update order
     */
    async verifyStripeSession(sessionId: string, storeId: string) {
        const stripe: any = await this.getStripeInstance(storeId);
        if (!stripe) throw new BadRequestException('Stripe not configured');

        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['payment_intent'],
        });

        if (session.payment_status === 'paid') {
            const orderId = session.metadata.orderId;
            const order = await this.orderRepository.findOne({ 
                where: { id: orderId, storeId },
                relations: ['items']
            });

            if (!order) throw new NotFoundException('Order not found');

            // If already processed, return
            if (order.paymentStatus === PaymentStatus.PAID) {
                return { success: true, order };
            }

            const paymentIntent = session.payment_intent as any; // Cast to any to avoid lint error if type is tricky

            // Update order
            order.status = OrderStatus.CONFIRMED;
            order.paymentStatus = PaymentStatus.PAID;
            order.paymentInfo = {
                ...order.paymentInfo,
                status: 'completed',
                transactionId: paymentIntent?.id || sessionId,
                paymentGateway: 'Stripe',
                method: 'credit_card', // Usually card for checkout
                paidAt: new Date(),
            };

            const savedOrder = await this.orderRepository.save(order);

            // Send Confirmation Email
            const store = await this.storeRepository.findOne({ where: { id: storeId } });
            this.emailService.sendOrderConfirmationEmail(savedOrder, store).catch(err => {
                this.logger.error('Failed to send Stripe payment confirmation email', err);
            });

            // Mark all order items as paid
            await this.orderItemRepository.update({ orderId: savedOrder.id }, { paymentStatus: 'paid' });

            // Log the payment
            const attempt = await this.paymentAttemptRepository.findOne({ where: { gateway_order_id: sessionId } });
            
            if (attempt) {
                attempt.payment_status = 'success';
                await this.paymentAttemptRepository.save(attempt);

                await this.paymentRepository.save(
                    this.paymentRepository.create({
                        payment_attempt_id: attempt.id,
                        store_id: storeId,
                        order_id: order.id,
                        customer_id: attempt.customer_id,
                        amount: Number(order.totalAmount),
                        currency: order.currency || 'INR',
                        payment_method: 'credit_card',
                        transaction_id: paymentIntent?.id || sessionId,
                        gateway_name: 'Stripe',
                        gateway_response: session,
                        status: 'success',
                        paid_at: new Date(),
                        payment_type: 'ORDER',
                    })
                );
            }

            // Clear the cart
            if (order.customerId) {
                await this.cartService.clearCart(storeId, order.customerId, undefined);
            }

            return { success: true, order: savedOrder };
        }

        return { success: false, status: session.payment_status };
    }

    /**
     * Get or create a Razorpay instance for a specific store
     */
    private async getRazorpayInstance(storeId: string) {
        let keyId: string;
        let keySecret: string;
        let source = 'unknown';

        // 1. Try Store-specific config (New table)
        const storeConfig = await this.storePaymentConfigService.getRawConfig(storeId, 'razorpay');
        if (storeConfig?.keyId && storeConfig?.keySecret) {
            keyId = storeConfig.keyId;
            keySecret = storeConfig.keySecret;
            source = 'StorePaymentConfig';
        } else {
            // 2. Try legacy settings (JSON blob)
            const settings = await this.settingsService.getSettings(storeId) as any;
            const razorpayConfig = (settings?.paymentGateways || []).find((pg: any) => pg.type === 'razorpay' && pg.isEnabled);
            
            if (razorpayConfig?.config?.keyId && razorpayConfig?.config?.keySecret) {
                keyId = razorpayConfig.config.keyId;
                keySecret = razorpayConfig.config.keySecret;
                source = 'SettingsService';
            }
        }

        // Check if credentials changed to clear cache
        if (this.razorpayClients.has(storeId)) {
            const cachedInstance = this.razorpayClients.get(storeId);
            const cachedSource = cachedInstance._sourceInfo || {};
            
            if (
                cachedSource.keyId === keyId && 
                cachedSource.keySecretLength === (keySecret ? keySecret.length : 0) &&
                cachedSource.source === source
            ) {
                return cachedInstance;
            }
            
            this.logger.log(`Razorpay credentials changed for store ${storeId}. Reinitializing client.`);
            this.razorpayClients.delete(storeId);
        }

        if (keyId && keySecret) {
            try {
                const Razorpay = require('razorpay');
                const instance = new Razorpay({
                    key_id: keyId,
                    key_secret: keySecret,
                });
                const secretPreview = keySecret.length > 4 
                    ? `${keySecret.slice(0, 2)}...${keySecret.slice(-2)}` 
                    : '***';
                instance._sourceInfo = { source, keyId, keySecretLength: keySecret.length, secretPreview }; // Store metadata for debugging
                this.razorpayClients.set(storeId, instance);
                return instance;
            } catch (e) {
                this.logger.error(`Failed to initialize Razorpay for store ${storeId} from ${source}: ${e.message}`);
                return null;
            }
        }

        return null;
    }

    /**
     * Get Razorpay Key Secret for verification
     */
    private async getRazorpaySecret(storeId: string): Promise<string | null> {
        // 1. Store config
        const storeConfig = await this.storePaymentConfigService.getRawConfig(storeId, 'razorpay');
        if (storeConfig?.keySecret) return storeConfig.keySecret;

        // 2. Legacy settings
        const settings = await this.settingsService.getSettings(storeId) as any;
        const razorpayConfig = (settings?.paymentGateways || []).find((pg: any) => pg.type === 'razorpay' && pg.isEnabled);
        if (razorpayConfig?.config?.keySecret) return razorpayConfig.config.keySecret;

        return null;
    }

    /**
     * Get Razorpay Key ID for frontend
     */
    async getRazorpayKeyId(storeId: string): Promise<string | null> {
        // 1. Store config
        const storeConfig = await this.storePaymentConfigService.getRawConfig(storeId, 'razorpay');
        if (storeConfig?.keyId) return storeConfig.keyId;

        // 2. Legacy settings
        const settings = await this.settingsService.getSettings(storeId) as any;
        const razorpayConfig = (settings?.paymentGateways || []).find((pg: any) => pg.type === 'razorpay' && pg.isEnabled);
        if (razorpayConfig?.config?.keyId) return razorpayConfig.config.keyId;

        return null;
    }

    /**
     * Create a Razorpay order (or mock one)
     */
    async createRazorpayOrder(amount: number, currency: string = 'INR', receipt: string, storeId: string, notes?: any) {
        const razorpay = await this.getRazorpayInstance(storeId);

        if (!razorpay) {
            throw new BadRequestException('Razorpay keys not configured for this store. Please add them in Payment Settings.');
        }

        const options = {
            amount: Math.round(amount * 100), // Amount in paise/subunit
            currency: currency.toUpperCase(),
            receipt,
            notes: notes || {},
        };

        this.logger.log(`Creating Razorpay Order: ${JSON.stringify({ ...options, amount_in_major: amount })}`);

        try {
            const razorpayOrder = await razorpay.orders.create(options);
            return razorpayOrder;
        } catch (err: any) {
            const source = razorpay._sourceInfo || {};
            const errorMessage = err.description || err.message || JSON.stringify(err);
            this.logger.error(`Razorpay order creation failed for store ${storeId}. Source: ${source.source}. Error: ${errorMessage}`);
            
            if (err.statusCode === 401) {
                this.logger.error(`AUTHENTICATION FAILED: Check Key ID and Secret for ${source.source}.`);
                this.logger.error(`Debug Info: KeyID=${source.keyId}, SecretLength=${source.keySecretLength || 0}, Preview=${source.secretPreview}`);
            }
            throw err;
        }
    }

    /**
     * Verify Razorpay payment signature and update order
     */
    async verifyPayment(
        orderId: string,
        razorpayPaymentId: string,
        razorpayOrderId: string,
        razorpaySignature: string,
        storeId: string,
    ) {
        // Find the order
        let order: Order;
        if (orderId) {
            order = await this.orderRepository.findOne({ where: { id: orderId, storeId }, relations: ['items'] });
        } else {
            // Look up by razorpay order ID stored in paymentInfo
            order = await this.orderRepository
                .createQueryBuilder('order')
                .where("order.storeId = :storeId", { storeId })
                .andWhere("order.paymentInfo->>'transactionId' = :razorpayOrderId", { razorpayOrderId })
                .leftJoinAndSelect('order.items', 'items') // Fetch items
                .getOne();
        }

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        const razorpay = await this.getRazorpayInstance(storeId);
        const keySecret = await this.getRazorpaySecret(storeId);

        if (razorpay && keySecret) {
            // Verify signature
            const generatedSignature = crypto
                .createHmac('sha256', keySecret)
                .update(`${razorpayOrderId}|${razorpayPaymentId}`)
                .digest('hex');

            if (generatedSignature !== razorpaySignature) {
                throw new BadRequestException('Invalid payment signature');
            }

            // Fetch payment details from Razorpay
            const payment = await razorpay.payments.fetch(razorpayPaymentId);

            // Update order
            order.status = OrderStatus.CONFIRMED;
            order.paymentStatus = PaymentStatus.PAID; // Ensure paymentStatus is updated
            order.paymentInfo = {
                ...order.paymentInfo,
                status: 'completed',
                transactionId: razorpayPaymentId,
                paymentGateway: 'Razorpay',
                method: this.mapRazorpayMethod(payment.method),
                paidAt: new Date(),
            };

            const savedOrder = await this.orderRepository.save(order);

            // Send Confirmation Email after successful payment
            const store = await this.storeRepository.findOne({ where: { id: storeId } });
            const emailOrder = await this.orderRepository.findOne({ where: { id: order.id }, relations: ['items'] });
            this.emailService.sendOrderConfirmationEmail(emailOrder, store).catch(err => {
                this.logger.error('Failed to send payment confirmation email', err);
            });

            // Mark all order items as paid
            await this.orderItemRepository.update({ orderId: savedOrder.id }, { paymentStatus: 'paid' });

            // Centrally log the payment success
            const attempt = await this.paymentAttemptRepository.findOne({ where: { gateway_order_id: razorpayOrderId } });
            if (attempt) {
                attempt.payment_status = 'success';
                await this.paymentAttemptRepository.save(attempt);

                await this.paymentRepository.save(
                    this.paymentRepository.create({
                        payment_attempt_id: attempt.id,
                        store_id: storeId,
                        order_id: attempt.order_id,
                        customer_id: attempt.customer_id,
                        amount: attempt.amount,
                        currency: attempt.currency,
                        payment_method: this.mapRazorpayMethod(payment.method),
                        transaction_id: razorpayPaymentId,
                        gateway_name: 'Razorpay',
                        gateway_response: payment, // Storing full Razorpay payment object
                        status: 'success',
                        paid_at: new Date(),
                        payment_type: 'ORDER',
                    })
                );
            }

            // Clear the cart after successful payment verification
            if (order.customerId) {
                await this.cartService.clearCart(storeId, order.customerId, undefined);
            }

            return { success: true, order: savedOrder, payment };
        } else {
            throw new BadRequestException('Payment verification failed - missing Razorpay configuration.');
        }
    }

    /**
     * Handle Razorpay webhook events
     * NOTE: Webhooks need storeId identification, usually via URL param or metadata
     */
    async handleWebhook(event: string, payload: any, storeId: string) {
        this.logger.log(`Processing webhook event for store ${storeId}: ${event}`);

        switch (event) {
            case 'payment.captured':
                await this.handlePaymentCaptured(payload, storeId);
                break;
            case 'payment.failed':
                await this.handlePaymentFailed(payload, storeId);
                break;
            case 'order.paid':
                await this.handleOrderPaid(payload, storeId);
                break;
            default:
                this.logger.log(`Unhandled webhook event: ${event}`);
        }
    }

    /**
     * Verify webhook signature
     */
    async verifyWebhookSignature(body: string, signature: string, storeId: string): Promise<boolean> {
        // Fetch webhook secret from settings
        const settings = await this.settingsService.getSettings(storeId) as any;
        const razorpayConfig = (settings?.paymentGateways || []).find((pg: any) => pg.type === 'razorpay' && pg.isEnabled);
        
        const webhookSecret = razorpayConfig?.config?.webhookSecret || 
                              this.configService.get<string>('RAZORPAY_WEBHOOK_SECRET') || '';
        
        const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(body)
            .digest('hex');

        return expectedSignature === signature;
    }

    /**
     * Upload payment proof (for bank transfer / manual payments)
     */
    async uploadPaymentProof(orderId: string, customerId: string, paymentProof: string, storeId: string, transactionDetails?: string) {
        const order = await this.orderRepository.findOne({ where: { id: orderId, storeId } });
        if (!order) {
            throw new NotFoundException('Order not found');
        }

        if (order.customerId !== customerId) {
            throw new BadRequestException('Not authorized to update this order');
        }

        order.paymentInfo = {
            ...order.paymentInfo,
            status: 'processing',
        };
        order.metadata = {
            ...order.metadata,
            paymentProof,
            adminNotes: transactionDetails || '',
        };

        return this.orderRepository.save(order);
    }

    /**
     * Admin: Update payment status
     */
    async updatePaymentStatus(orderId: string, paymentStatus: string, storeId: string, orderStatus?: string, adminNotes?: string) {
        const order = await this.orderRepository.findOne({ where: { id: orderId, storeId } });
        if (!order) {
            throw new NotFoundException('Order not found');
        }

        order.paymentInfo = {
            ...order.paymentInfo,
            status: paymentStatus,
        };

        if (paymentStatus === 'completed') {
            order.paymentInfo.paidAt = new Date();
        }

        if (orderStatus) {
            order.status = orderStatus as OrderStatus;
        }

        if (adminNotes) {
            order.metadata = { ...order.metadata, adminNotes };
        }

        return this.orderRepository.save(order);
    }

    /**
     * Initiate refund
     */
    async initiateRefund(orderId: string, storeId: string, amount?: number, reason?: string) {
        const order = await this.orderRepository.findOne({ where: { id: orderId, storeId } });
        if (!order) {
            throw new NotFoundException('Order not found');
        }

        if (order.paymentInfo?.status !== 'completed') {
            throw new BadRequestException('Cannot refund an incomplete payment');
        }

        if (!order.paymentInfo?.transactionId) {
            throw new BadRequestException('No transaction ID found for refund');
        }

        let refund: any = { _mock: true, status: 'processed' };
        const razorpay = await this.getRazorpayInstance(storeId);

        if (razorpay) {
            refund = await razorpay.payments.refund(order.paymentInfo.transactionId, {
                amount: amount ? Math.round(amount * 100) : undefined,
            });
        } else {
            this.logger.log(`[MOCK] Refund initiated for order ${orderId} in store ${storeId}`);
        }

        order.paymentInfo = {
            ...order.paymentInfo,
            status: amount ? 'partially_refunded' : 'refunded',
        };
        order.status = OrderStatus.REFUNDED;
        order.metadata = {
            ...order.metadata,
            refundAmount: amount || order.totalAmount,
            refundReason: reason,
            refundedAt: new Date(),
        };

        const savedOrder = await this.orderRepository.save(order);
        return { success: true, refund, order: savedOrder };
    }

    // --- Private helpers ---

    private async handlePaymentCaptured(payload: any, storeId: string) {
        const razorpayOrderId = payload?.order?.entity?.id;
        const razorpayPaymentId = payload?.payment?.entity?.id;

        if (!razorpayOrderId) return;

        const order = await this.orderRepository
            .createQueryBuilder('order')
            .where("order.storeId = :storeId", { storeId })
            .andWhere("order.paymentInfo->>'transactionId' = :razorpayOrderId", { razorpayOrderId })
            .getOne();

        if (order) {
            order.status = OrderStatus.CONFIRMED;
            order.paymentInfo = {
                ...order.paymentInfo,
                status: 'completed',
                transactionId: razorpayPaymentId,
                paidAt: new Date(),
            };
            await this.orderRepository.save(order);
            this.logger.log(`Payment captured for order: ${order.orderNumber}`);

            // Clear cart on payment capture
            if (order.customerId) {
                await this.cartService.clearCart(storeId, order.customerId, undefined);
            }
        }
    }

    private async handlePaymentFailed(payload: any, storeId: string) {
        const razorpayOrderId = payload?.payment?.entity?.order_id;
        if (!razorpayOrderId) return;

        const order = await this.orderRepository
            .createQueryBuilder('order')
            .where("order.storeId = :storeId", { storeId })
            .andWhere("order.paymentInfo->>'transactionId' = :razorpayOrderId", { razorpayOrderId })
            .getOne();

        if (order) {
            order.paymentInfo = { ...order.paymentInfo, status: 'failed' };
            order.status = OrderStatus.CANCELLED;
            await this.orderRepository.save(order);
            this.logger.log(`Payment failed for order: ${order.orderNumber}`);
        }
    }

    private async handleOrderPaid(payload: any, storeId: string) {
        const razorpayOrderId = payload?.order?.entity?.id;
        if (!razorpayOrderId) return;

        const order = await this.orderRepository
            .createQueryBuilder('order')
            .where("order.storeId = :storeId", { storeId })
            .andWhere("order.paymentInfo->>'transactionId' = :razorpayOrderId", { razorpayOrderId })
            .getOne();

        if (order && order.paymentInfo?.status !== 'completed') {
            order.paymentInfo = { ...order.paymentInfo, status: 'completed' };
            order.status = OrderStatus.CONFIRMED;
            await this.orderRepository.save(order);
            this.logger.log(`Order paid: ${order.orderNumber}`);

            // Clear cart on order paid event
            if (order.customerId) {
                await this.cartService.clearCart(storeId, order.customerId, undefined);
            }
        }
    }

    // --- Admin methods ---

    /**
     * Admin: Get all successful payments for the store
     */
    async getPaymentsForAdmin(role: string, storeId: string, limit: number = 20, offset: number = 0, startDate?: string, endDate?: string) {
        let where: any = {};

        if (role === 'super_admin' || role === 'super_sub_admin') {
            // Super admin sees only subscription payments (platform-level)
            where.payment_type = 'SUBSCRIPTION';
        } else {
            // Store admin sees only their own store ORDER payments
            if (!storeId) return { items: [], total: 0 };
            where.store_id = storeId;
            where.payment_type = 'ORDER';
        }

        if (startDate || endDate) {
            if (startDate && endDate) {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                where.created_at = Between(start, end);
            } else if (startDate) {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                where.created_at = MoreThanOrEqual(start);
            } else if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                where.created_at = LessThanOrEqual(end);
            }
        }

        const [items, total] = await this.paymentRepository.findAndCount({
            where,
            relations: role === 'super_admin' || role === 'super_sub_admin' ? ['store'] : [],
            order: { created_at: 'DESC' },
            take: limit,
            skip: offset,
        });

        return { items, total };
    }

    /**
     * Admin: Get all payment attempts (including failed) for the store
     */
    async getPaymentAttemptsForAdmin(role: string, storeId: string, limit: number = 20, offset: number = 0, startDate?: string, endDate?: string) {
        const query = this.paymentAttemptRepository.createQueryBuilder('attempt')
            .orderBy('attempt.created_at', 'DESC')
            .take(limit)
            .skip(offset);

        if (role === 'super_admin' || role === 'super_sub_admin') {
            // Super admin: only subscription attempts (plan_id is set, no order_id)
            query.where('(attempt.entity_type = :type OR attempt.plan_id IS NOT NULL)', { type: 'SUBSCRIPTION' });
        } else {
            // Store admin: only ORDER attempts belonging to this store
            if (!storeId) return { items: [], total: 0 };

            // Direct filter using the new store_id column
            query.where('attempt.store_id = :storeId AND attempt.entity_type = :type', { storeId, type: 'ORDER' });
        }

        if (startDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            query.andWhere('attempt.created_at >= :startDateVal', { startDateVal: start });
        }
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            query.andWhere('attempt.created_at <= :endDateVal', { endDateVal: end });
        }

        const [items, total] = await query.getManyAndCount();
        
        // Post-process to add store_name for subscriptions (since the column was removed)
        const mappedItems = items.map(item => {
            const data = item as any;
            if (data.entity_type === 'SUBSCRIPTION' && data.registration_data) {
                data.store_name = data.registration_data.storeName || data.registration_data.store_name || 'N/A';
            }
            return data;
        });

        return { items: mappedItems, total };
    }

    private mapRazorpayMethod(method: string): string {
        const mapping: Record<string, string> = {
            card: 'credit_card',
            netbanking: 'net_banking',
            wallet: 'wallet',
            upi: 'upi',
        };
        return mapping[method] || 'credit_card';
    }
}

