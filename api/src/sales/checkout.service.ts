import { Injectable, BadRequestException } from '@nestjs/common';
import { CartService } from './cart.service';
import { OrderService } from './order.service';
import { PaymentService } from './payment.service';

import { PaymentAttempt } from '../payments/entities/payment-attempt.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailService } from '../notifications/email.service';

@Injectable()
export class CheckoutService {
    constructor(
        private cartService: CartService,
        private orderService: OrderService,
        private paymentService: PaymentService,
        @InjectRepository(PaymentAttempt)
        private paymentAttemptRepository: Repository<PaymentAttempt>,
        private emailService: EmailService,
    ) { }

    /**
     * Pre-checkout validation: Verify stock, pricing, coupon validity
     */
    async validateCheckout(userId: string) {
        const cart = await this.cartService.findOrCreateCart(userId);
        if (!cart.items || cart.items.length === 0) {
            throw new BadRequestException('Cart is empty');
        }

        return {
            valid: true,
            cart,
            message: 'Checkout validation passed',
        };
    }

    /**
     * Create order + initiate payment (Razorpay order creation or Stripe Session)
     */
    async createOrder(userId: string, orderData: any, origin?: string) {
        // 1. Create the order
        let order;
        if (orderData.items && orderData.items.length > 0) {
            order = await this.orderService.createOrderDirectly(userId, orderData);
        } else {
            order = await this.orderService.createOrderFromCart(userId, orderData);
        }

        // For Quote Requests, we don't need to initiate a payment gateway order
        if (order.orderType === 'quote_request') {
             await this.cartService.clearCart(userId, undefined);
             this.emailService.sendOrderConfirmationEmail(order).catch(err => {
                 console.error('Failed to send order confirmation email for quote request', err);
             });
             return { order };
        }

        // 2. Check for active payment provider configuration
        // We prioritize Stripe if configured and active, otherwise Razorpay
        let stripeSkippedDueToAmount = false;

        // Check Stripe
        const stripePublishableKey = await this.paymentService.getStripePublishableKey();
        if (stripePublishableKey) {
            try {
                const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
                const host = process.env.FRONTEND_URL || 'localhost:3000';

                let successUrl: string;
                let cancelUrl: string;

                if (origin) {
                    // Use origin if available (from browser request)
                    successUrl = `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
                    cancelUrl = `${origin}/checkout`;
                 } else {
                    // Fallback to configured frontend URL
                    successUrl = `${protocol}://${host}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
                    cancelUrl = `${protocol}://${host}/checkout`;
                }

                // Check if amount is valid for Stripe
                const orderCurrency = order.currency?.toLowerCase() || 'inr';
                if (!this.paymentService.isAmountValidForStripe(Number(order.totalAmount), orderCurrency)) {
                    stripeSkippedDueToAmount = true;
                    const minText = orderCurrency === 'inr' ? '₹50' : `0.51 ${orderCurrency.toUpperCase()}`;
                    throw new Error(`Amount too small for Stripe (${order.totalAmount} ${orderCurrency.toUpperCase()}). Minimum required is ${minText}.`);
                }

                const stripeSession = await this.paymentService.createStripeCheckoutSession(
                    order,
                    successUrl,
                    cancelUrl
                );

                // Create central PaymentAttempt record
                await this.paymentAttemptRepository.save(
                    this.paymentAttemptRepository.create({
                        entity_type: 'ORDER',
                        customer_id: userId,
                        order_id: order.id,
                        amount: Number(order.totalAmount),
                        currency: order.currency || 'INR',
                        payment_gateway: 'stripe',
                        gateway_order_id: stripeSession.id,
                        payment_status: 'pending',
                        billing_cycle: 'one-time',
                    })
                );

                order.paymentInfo = {
                    ...order.paymentInfo,
                    transactionId: stripeSession.id,
                    paymentGateway: 'Stripe',
                };
                await this.orderService.updateStatus(order.id, order.status, order.paymentInfo);

                return {
                    order,
                    provider: 'stripe',
                    sessionId: stripeSession.id,
                    url: stripeSession.url,
                    publishableKey: stripePublishableKey,
                };
            } catch (err) {
                // Only log if it's NOT an expected skip due to amount
                if (!stripeSkippedDueToAmount) {
                    console.error('Failed to initiate Stripe payment, falling back to Razorpay if available', err);
                }
            }
        }

        // Check Razorpay
        const razorpayKeyId = await this.paymentService.getRazorpayKeyId();
        if (razorpayKeyId) {
            const razorpayOrder = await this.paymentService.createRazorpayOrder(
                Number(order.totalAmount),
                order.currency || 'INR',
                order.orderNumber,
                { orderId: order.id },
            );

            // Create central PaymentAttempt record
            await this.paymentAttemptRepository.save(
                this.paymentAttemptRepository.create({
                    entity_type: 'ORDER',
                    customer_id: userId,
                    order_id: order.id,
                    amount: Number(order.totalAmount),
                    currency: order.currency || 'INR',
                    payment_gateway: 'razorpay',
                    gateway_order_id: razorpayOrder.id,
                    payment_status: 'pending',
                    billing_cycle: 'one-time',
                })
            );

            order.paymentInfo = {
                ...order.paymentInfo,
                transactionId: razorpayOrder.id,
                paymentGateway: 'Razorpay',
            };
            await this.orderService.updateStatus(order.id, order.status, order.paymentInfo);

            return {
                order,
                provider: 'razorpay',
                key: razorpayKeyId,
                razorpayOrderId: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
            };
        }

        if (stripeSkippedDueToAmount) {
            const orderCurrency = order.currency?.toUpperCase() || 'INR';
            const minText = orderCurrency === 'INR' ? '₹50.00' : `0.51 ${orderCurrency}`;
            throw new BadRequestException(`Order amount (${Number(order.totalAmount).toFixed(2)} ${orderCurrency}) is too small for payment. Minimum ${minText} is required.`);
        }

        throw new BadRequestException(`No active payment gateway found. Please ensure keys are added and the "Active" status is toggled ON in Admin Payment Settings.`);
    }

    /**
     * Get user's orders (proxy to OrderService)
     */
    async getUserOrders(userId: string) {
        return this.orderService.findAllOrders(userId);
    }

    /**
     * Get specific order
     */
    async getOrder(userId: string, orderId: string) {
        return this.orderService.findOneOrder(orderId, userId);
    }
}
