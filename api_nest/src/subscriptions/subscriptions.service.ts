import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';
import { SystemGatewayConfigService } from '../payments/system-gateway-config.service';
import { StoreSubscription } from './entities/store-subscription.entity';
import { StoreInvoice } from './entities/store-invoice.entity';
import { PaymentAttempt } from '../payments/entities/payment-attempt.entity';
import { Payment } from '../payments/entities/payment.entity';
import { PlansService } from '../plans/plans.service';
import { TenantService } from '../tenant/tenant.service';
import { Admin, AdminRole } from '../admin/entities/admin.entity';
import { EmailService } from '../notifications/email.service';
import { S3Service } from '../cms/s3.service';
import { getFullS3Url } from '../common/utils/s3-url.util';
import { SubscriptionCouponService } from './subscription-coupon.service';

@Injectable()
export class SubscriptionsService {
    constructor(
        @InjectRepository(StoreSubscription)
        private storeSubscriptionRepository: Repository<StoreSubscription>,
        @InjectRepository(StoreInvoice)
        private storeInvoiceRepository: Repository<StoreInvoice>,
        @InjectRepository(PaymentAttempt)
        private paymentAttemptRepository: Repository<PaymentAttempt>,
        @InjectRepository(Payment)
        private paymentRepository: Repository<Payment>,
        @InjectRepository(Admin)
        private adminRepository: Repository<Admin>,
        private plansService: PlansService,
        private tenantService: TenantService,
        private configService: ConfigService,
        private systemGatewayConfigService: SystemGatewayConfigService,
        private emailService: EmailService,
        private s3Service: S3Service,
        private subscriptionCouponService: SubscriptionCouponService,
    ) { }

    private async getRazorpayInstance() {
        const config = await this.systemGatewayConfigService.getActiveConfig('razorpay');
        
        const key_id = config?.keyId || this.configService.get<string>('RAZORPAY_KEY_ID');
        const key_secret = config?.keySecret || this.configService.get<string>('RAZORPAY_KEY_SECRET');

        if (!key_id || !key_secret) {
            throw new BadRequestException('Razorpay credentials not configured in SystemGatewayConfig or .env');
        }

        return new Razorpay({
            key_id,
            key_secret,
        });
    }

    async createOrder(userId: string, planId: string, storeName: string, storeSlug: string, billingCycle: string = 'monthly') {
        const plan = await this.plansService.findOne(planId);
        if (!plan) throw new BadRequestException('Plan not found');

        const razorpay = await this.getRazorpayInstance();
        try {
            let price = billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
            if (price === null || price === undefined || String(price).trim() === '') {
                price = billingCycle === 'yearly' ? 19990 : 1999;
            }
            const amount = Math.round(Number(price) * 100);
            const order = await razorpay.orders.create({
                amount,
                currency: 'INR',
                receipt: `receipt_${Date.now()}`,
                notes: { planId, billingCycle }
            });

            const paymentAttempt = this.paymentAttemptRepository.create({
                entity_type: 'SUBSCRIPTION',
                customer_id: userId,
                plan_id: planId,
                billing_cycle: billingCycle,
                amount: Number(price),
                currency: 'INR',
                payment_gateway: 'razorpay',
                gateway_order_id: order.id,
                payment_status: 'pending',
                registration_data: { storeName, storeSlug }
            });
            await this.paymentAttemptRepository.save(paymentAttempt);

            const config = await this.systemGatewayConfigService.getActiveConfig('razorpay');
            const razorpayKey = config?.keyId || this.configService.get<string>('RAZORPAY_KEY_ID');

            return { order, attemptId: paymentAttempt.id, razorpayKey };
        } catch (error) {
            console.error('Razorpay Order Error:', error);
            throw new InternalServerErrorException('Failed to create payment order');
        }
    }

    async createRegistrationOrder(data: {
        planId: string,
        storeName: string,
        storeSlug: string,
        billingCycle: string,
        registrationData: any,
        couponCode?: string,
    }) {
        const { planId, storeName, storeSlug, billingCycle, registrationData, couponCode } = data;

        // Check if user already exists
        const existingAdmin = await this.adminRepository.findOne({ where: { email: registrationData.email } });
        if (existingAdmin) throw new BadRequestException('Email already registered');

        const plan = await this.plansService.findOne(planId);
        if (!plan) throw new BadRequestException('Plan not found');

        let price = billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
        if (price === null || price === undefined || String(price).trim() === '') {
            price = billingCycle === 'yearly' ? 19990 : 1999;
        }
        const originalPrice = Number(price);

        // Validate coupon if provided
        let finalAmount = originalPrice;
        let appliedCouponCode: string | null = null;
        let discountAmount = 0;

        if (couponCode) {
            const couponResult = await this.subscriptionCouponService.validateCoupon(couponCode, planId, originalPrice);
            if (!couponResult.valid) {
                throw new BadRequestException(couponResult.reason || 'Invalid coupon code');
            }
            finalAmount = couponResult.discountedAmount;
            discountAmount = couponResult.discountAmount;
            appliedCouponCode = couponCode.toUpperCase().trim();
        }

        // 100% coupon — skip Razorpay entirely
        if (finalAmount === 0) {
            const paymentAttempt = this.paymentAttemptRepository.create({
                entity_type: 'SUBSCRIPTION',
                plan_id: planId,
                billing_cycle: billingCycle,
                amount: 0,
                currency: 'INR',
                payment_gateway: 'coupon_free',
                gateway_order_id: `coupon_free_${Date.now()}`,
                payment_status: 'pending',
                registration_data: { ...registrationData, storeName, storeSlug, appliedCouponCode, originalPrice, discountAmount }
            });
            await this.paymentAttemptRepository.save(paymentAttempt);
            return { isFree: true, attemptId: paymentAttempt.id, amount: 0 };
        }

        // Paid (full price or partial discount) — create Razorpay order
        const razorpay = await this.getRazorpayInstance();
        try {
            const amount = Math.round(finalAmount * 100);
            const order = await razorpay.orders.create({
                amount,
                currency: 'INR',
                receipt: `reg_receipt_${Date.now()}`,
                notes: { planId, billingCycle, email: registrationData.email }
            });

            const paymentAttempt = this.paymentAttemptRepository.create({
                entity_type: 'SUBSCRIPTION',
                plan_id: planId,
                billing_cycle: billingCycle,
                amount: finalAmount,
                currency: 'INR',
                payment_gateway: 'razorpay',
                gateway_order_id: order.id,
                payment_status: 'pending',
                registration_data: { ...registrationData, storeName, storeSlug, appliedCouponCode, originalPrice, discountAmount }
            });
            await this.paymentAttemptRepository.save(paymentAttempt);

            const config = await this.systemGatewayConfigService.getActiveConfig('razorpay');
            const razorpayKey = config?.keyId || this.configService.get<string>('RAZORPAY_KEY_ID');

            return { isFree: false, order, attemptId: paymentAttempt.id, razorpayKey };
        } catch (error) {
            console.error('Razorpay Registration Order Error:', error);
            throw new InternalServerErrorException('Failed to create registration payment order');
        }
    }

    async verifyPayment(userId: string | null, paymentData: {
        razorpay_order_id?: string;
        razorpay_payment_id?: string;
        razorpay_signature?: string;
        attemptId: string;
        couponCode?: string;
    }): Promise<StoreSubscription> {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, attemptId, couponCode } = paymentData;

        const attempt = await this.paymentAttemptRepository.findOne({ where: { id: attemptId } });
        if (!attempt) throw new BadRequestException('Payment attempt not found');

        // ── PATH B: 100% coupon free activation ──────────────────────────────
        if (attempt.payment_gateway === 'coupon_free') {
            // Security: re-validate coupon on backend — never trust frontend isFree flag
            const regData = attempt.registration_data || {};
            const appliedCode = regData.appliedCouponCode || couponCode;
            if (!appliedCode) throw new BadRequestException('No coupon found for this free activation');

            const plan = await this.plansService.findOne(attempt.plan_id);
            if (!plan) throw new BadRequestException('Plan not found');

            let originalPrice = attempt.billing_cycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
            if (!originalPrice) originalPrice = attempt.billing_cycle === 'yearly' ? 19990 : 1999;

            const couponResult = await this.subscriptionCouponService.validateCoupon(appliedCode, attempt.plan_id, Number(originalPrice));
            if (!couponResult.valid || couponResult.discountedAmount !== 0) {
                throw new BadRequestException('Coupon validation failed for free activation');
            }

            attempt.payment_status = 'success';
            await this.paymentAttemptRepository.save(attempt);

            const payment = this.paymentRepository.create({
                payment_attempt_id: attempt.id,
                amount: 0,
                currency: 'INR',
                payment_method: 'coupon_free',
                transaction_id: `coupon_free_${Date.now()}`,
                gateway_name: 'coupon_free',
                gateway_response: { couponCode: appliedCode },
                status: 'success',
                paid_at: new Date(),
                payment_type: 'SUBSCRIPTION',
                customer_id: attempt.customer_id,
                applied_coupon_code: appliedCode,
                original_amount: Number(originalPrice),
                discount_amount: Number(originalPrice),
            });
            const savedPayment = await this.paymentRepository.save(payment);

            const savedSub = await this.provisionStoreForAttempt(userId, attempt, savedPayment);

            // Increment coupon usage only after successful provisioning
            await this.subscriptionCouponService.incrementUsage(appliedCode);

            this.generateAndSendStoreInvoice(savedSub).catch(err => {
                console.error('Failed to generate SaaS invoice in coupon free flow:', err);
            });
            return savedSub;
        }

        // ── PATH A: Normal Razorpay payment ──────────────────────────────────
        const config = await this.systemGatewayConfigService.getActiveConfig('razorpay');
        const secret = config?.keySecret || this.configService.get<string>('RAZORPAY_KEY_SECRET');

        if (!secret) throw new BadRequestException('Razorpay secret not configured');

        const generated_signature = crypto
            .createHmac('sha256', secret)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (generated_signature !== razorpay_signature) {
            attempt.payment_status = 'failed';
            attempt.failure_reason = 'Invalid signature';
            await this.paymentAttemptRepository.save(attempt);
            throw new BadRequestException('Invalid payment signature');
        }

        // 1. Update Payment Attempt
        attempt.payment_status = 'success';
        await this.paymentAttemptRepository.save(attempt);

        // 2. Create Payment Record
        const regData = attempt.registration_data || {};
        const payment = this.paymentRepository.create({
            payment_attempt_id: attempt.id,
            amount: attempt.amount,
            currency: attempt.currency,
            payment_method: 'razorpay',
            transaction_id: razorpay_payment_id,
            gateway_name: 'razorpay',
            gateway_response: paymentData,
            status: 'success',
            paid_at: new Date(),
            payment_type: 'SUBSCRIPTION',
            customer_id: attempt.customer_id,
            applied_coupon_code: regData.appliedCouponCode || null,
            original_amount: regData.originalPrice ? Number(regData.originalPrice) : null,
            discount_amount: regData.discountAmount ? Number(regData.discountAmount) : null,
        });
        const savedPayment = await this.paymentRepository.save(payment);

        // 3. Handle upgrade vs new registration
        const isUpgrade = attempt.registration_data?.type === 'upgrade';
        const storeIdFromAttempt = attempt.registration_data?.storeId;

        if (isUpgrade && storeIdFromAttempt) {
            const currentSub = await this.getStoreSubscription(storeIdFromAttempt);
            if (currentSub) {
                savedPayment.store_id = storeIdFromAttempt;
                await this.paymentRepository.save(savedPayment);

                return await this.updateSubscriptionToPlan(
                    storeIdFromAttempt,
                    attempt.plan_id,
                    savedPayment.id,
                    attempt.billing_cycle || 'monthly'
                );
            }
        }

        const savedSub = await this.provisionStoreForAttempt(userId, attempt, savedPayment);
        this.generateAndSendStoreInvoice(savedSub).catch(err => {
            console.error('Failed to generate SaaS invoice in verifySubscriptionPayment:', err);
        });
        return savedSub;
    }

    private async provisionStoreForAttempt(userId: string | null, attempt: PaymentAttempt, savedPayment: Payment): Promise<StoreSubscription> {
        let finalUserId = userId;
        let storeId: string | null = null;

        if (!finalUserId && attempt.registration_data) {
            const regData = attempt.registration_data;
            let admin = await this.adminRepository.findOne({ where: { email: regData.email } });
            if (!admin) {
                const hashedPassword = await bcrypt.hash(regData.password, 10);
                admin = this.adminRepository.create({
                    name: regData.name,
                    email: regData.email,
                    password: hashedPassword,
                    phone: regData.phone,
                    role: AdminRole.STORE_ADMIN,
                    adminType: 'store_owner',
                    permissions: ['*'],
                });
                admin = await this.adminRepository.save(admin);
            }
            finalUserId = admin.id;
        }

        if (!finalUserId) throw new BadRequestException('User identification failed');

        const admin = await this.adminRepository.findOne({ where: { id: finalUserId } });
        if (!admin) throw new BadRequestException('Admin not found');

        if (admin.storeId) {
            storeId = admin.storeId;
        }

        if (!storeId) {
            const storeName = attempt.registration_data?.storeName || attempt.registration_data?.store_name || `${admin.name || 'User'}'s Store`;
            let planCategory: 'page_builder' | 'ecommerce' = 'ecommerce';
            if (attempt.plan_id) {
                try {
                    const plan = await this.plansService.findOne(attempt.plan_id);
                    if (plan && plan.category) planCategory = plan.category;
                } catch (err) {
                    console.error('Failed to retrieve plan details during store provision:', err);
                }
            }
            const newStore = await this.tenantService.createStore(admin.id, storeName, planCategory);
            storeId = newStore.id;
            admin.storeId = storeId;
            admin.permissions = ['*'];
            await this.adminRepository.save(admin);
        }

        savedPayment.store_id = storeId;
        await this.paymentRepository.save(savedPayment);

        const startDate = new Date();
        const expiryDate = new Date();
        if (attempt.billing_cycle === 'yearly') {
            expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        } else {
            expiryDate.setDate(expiryDate.getDate() + 30);
        }

        const subscription = this.storeSubscriptionRepository.create({
            store_id: storeId,
            plan_id: attempt.plan_id,
            payment_id: savedPayment.id,
            start_date: startDate,
            expiry_date: expiryDate,
            status: 'active',
        });

        return this.storeSubscriptionRepository.save(subscription);
    }

    async calculatePlanChangePreview(storeId: string, newPlanId: string, billingCycle: string = 'monthly') {
        const currentSub = await this.getStoreSubscription(storeId);
        if (!currentSub) throw new BadRequestException('No active subscription found for plan change');

        const newPlan = await this.plansService.findOne(newPlanId);
        if (!newPlan) throw new BadRequestException('New plan not found');

        const now = new Date();
        const expiry = new Date(currentSub.expiry_date);
        const start = new Date(currentSub.start_date);

        // Calculate total days in current cycle and remaining days
        const totalCycleDays = Math.ceil((expiry.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) || 30;
        const remainingDays = Math.max(0, Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

        const currentPlanPrice = currentSub.plan.monthlyPrice; 
        const unusedCredit = remainingDays > 0 ? (Number(currentPlanPrice) / totalCycleDays) * remainingDays : 0;
        
        const newPlanFullPrice = billingCycle === 'yearly' ? newPlan.yearlyPrice : newPlan.monthlyPrice;
        
        // If it's a renewal (expired), charge full price. Otherwise charge prorated difference.
        const isRenewal = remainingDays <= 0;
        const newPlanCost = isRenewal ? Number(newPlanFullPrice) : (Number(newPlanFullPrice) / totalCycleDays) * remainingDays;

        const difference = newPlanCost - unusedCredit;
        const payableAmount = Math.max(0, difference);

        return {
            payableAmount: Math.round(payableAmount * 100) / 100,
            unusedCredit: Math.round(unusedCredit * 100) / 100,
            newPlanCost: Math.round(newPlanCost * 100) / 100,
            remainingDays,
            isUpgrade: difference > 0,
            isDowngrade: difference <= 0,
            isRenewal,
            shouldSchedule: difference < 0 && !isRenewal // Don't schedule if it's already expired
        };
    }

    async createPlanChangeOrder(userId: string, storeId: string, newPlanId: string, billingCycle: string = 'monthly') {
        const preview = await this.calculatePlanChangePreview(storeId, newPlanId, billingCycle);
        
        const razorpay = await this.getRazorpayInstance();
        try {
            const amount = Math.round(preview.payableAmount * 100);
            
            const order = await razorpay.orders.create({
                amount: amount || 100, // Min ₹1 for verification if 0?
                currency: 'INR',
                receipt: `upgrade_receipt_${Date.now()}`,
                notes: { planId: newPlanId, billingCycle, storeId, type: 'upgrade' }
            });

            const paymentAttempt = this.paymentAttemptRepository.create({
                entity_type: 'SUBSCRIPTION',
                store_id: storeId,
                customer_id: userId,
                plan_id: newPlanId,
                billing_cycle: billingCycle,
                amount: preview.payableAmount,
                currency: 'INR',
                payment_gateway: 'razorpay',
                gateway_order_id: order.id,
                payment_status: 'pending',
                registration_data: { type: 'upgrade', storeId, preview } 
            });
            await this.paymentAttemptRepository.save(paymentAttempt);

            const config = await this.systemGatewayConfigService.getActiveConfig('razorpay');
            const razorpayKey = config?.keyId || this.configService.get<string>('RAZORPAY_KEY_ID');

            return { order, attemptId: paymentAttempt.id, preview, razorpayKey };
        } catch (error) {
            console.error('Razorpay Upgrade Order Error:', error);
            throw new InternalServerErrorException('Failed to create upgrade payment order');
        }
    }

    async executeFreePlanChange(userId: string, storeId: string, newPlanId: string, billingCycle: string = 'monthly') {
        const preview = await this.calculatePlanChangePreview(storeId, newPlanId, billingCycle);
        if (preview.payableAmount > 0) {
            throw new BadRequestException('This plan change requires payment. Use the order creation flow.');
        }

        // 1. Create Free Payment Attempt
        const paymentAttempt = this.paymentAttemptRepository.create({
            entity_type: 'SUBSCRIPTION',
            store_id: storeId,
            customer_id: userId,
            plan_id: newPlanId,
            billing_cycle: billingCycle,
            amount: 0,
            currency: 'INR',
            payment_gateway: 'internal',
            gateway_order_id: `free_${Date.now()}`,
            payment_status: 'success',
            registration_data: { type: 'downgrade', storeId, preview }
        });
        await this.paymentAttemptRepository.save(paymentAttempt);

        // 2. Create Free Payment Record
        const payment = this.paymentRepository.create({
            payment_attempt_id: paymentAttempt.id,
            amount: 0,
            currency: 'INR',
            payment_method: 'internal',
            transaction_id: `free_tx_${Date.now()}`,
            gateway_name: 'internal',
            status: 'success',
            paid_at: new Date(),
            store_id: storeId,
            payment_type: 'SUBSCRIPTION'
        });
        await this.paymentRepository.save(payment);

        // 3. Update Subscription
        return await this.updateSubscriptionToPlan(storeId, newPlanId, payment.id, billingCycle);
    }

    async requestPlanChange(storeId: string, newPlanId: string, billingCycle: string = 'monthly') {
        const currentSub = await this.getStoreSubscription(storeId);
        if (!currentSub) throw new BadRequestException('No active subscription found');

        currentSub.pending_plan_id = newPlanId;
        currentSub.pending_billing_cycle = billingCycle;
        return await this.storeSubscriptionRepository.save(currentSub);
    }

    async cancelPendingPlanChange(storeId: string) {
        const currentSub = await this.getStoreSubscription(storeId);
        if (!currentSub) throw new BadRequestException('No active subscription found');

        currentSub.pending_plan_id = null;
        currentSub.pending_billing_cycle = null;
        return await this.storeSubscriptionRepository.save(currentSub);
    }

    private async updateSubscriptionToPlan(storeId: string, planId: string, paymentId: string, billingCycle: string = 'monthly') {
        const currentSub = await this.getStoreSubscription(storeId);
        
        let expiryDate = new Date();
        const isRenewal = currentSub ? new Date(currentSub.expiry_date) < new Date() : true;

        if (isRenewal) {
            // New 30 days or 1 year from now
            if (billingCycle === 'yearly') {
                expiryDate.setFullYear(expiryDate.getFullYear() + 1);
            } else {
                expiryDate.setDate(expiryDate.getDate() + 30);
            }
        } else {
            // Preserve existing expiry for prorated upgrades
            expiryDate = new Date(currentSub.expiry_date);
        }

        if (currentSub) {
            currentSub.status = 'expired';
            await this.storeSubscriptionRepository.save(currentSub);
        }

        const newSub = this.storeSubscriptionRepository.create({
            store_id: storeId,
            plan_id: planId,
            payment_id: paymentId,
            start_date: new Date(),
            expiry_date: expiryDate,
            status: 'active'
        });
        return await this.storeSubscriptionRepository.save(newSub);
    }


    async manualProvision(data: {
        email: string;
        password?: string;
        name: string;
        storeName: string;
        planId: string;
        billingCycle: string;
    }): Promise<StoreSubscription> {
        const { email, name, storeName, planId, billingCycle } = data;

        const userPassword = data.password || '123456';
        const hashedPassword = await bcrypt.hash(userPassword, 10);

        let storeId = null;
        let admin = await this.adminRepository.findOne({ where: { email } });
        
        if (!admin) {
            admin = this.adminRepository.create({
                email,
                password: hashedPassword,
                name,
                role: AdminRole.STORE_ADMIN,
                adminType: 'store_owner',
                permissions: ['*']
            });
            admin = await this.adminRepository.save(admin);
        }

        if (admin.storeId) {
            throw new BadRequestException('User already has a store associated with this email');
        }

        let planCategory: 'page_builder' | 'ecommerce' = 'ecommerce';
        if (planId) {
            try {
                const plan = await this.plansService.findOne(planId);
                if (plan && plan.category) {
                    planCategory = plan.category;
                }
            } catch (err) {
                console.error('Failed to retrieve plan details during manualProvision:', err);
            }
        }
        const newStore = await this.tenantService.createStore(admin.id, storeName, planCategory);
        storeId = newStore.id;

        admin.storeId = storeId;
        admin.permissions = ['*'];
        await this.adminRepository.save(admin);

        // Dummy Payment
        const payment = this.paymentRepository.create({
            amount: 0,
            currency: 'INR',
            payment_method: 'manual',
            transaction_id: `manual_${Date.now()}`,
            gateway_name: `${AdminRole.SUPER_ADMIN}_provision`,
            status: 'success',
            paid_at: new Date(),
            store_id: storeId,
            payment_type: 'SUBSCRIPTION'
        });
        const savedPayment = await this.paymentRepository.save(payment);

        // Subscription
        const startDate = new Date();
        const expiryDate = new Date();
        if (billingCycle === 'yearly') {
            expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        } else {
            expiryDate.setDate(expiryDate.getDate() + 30);
        }

        const subscription = this.storeSubscriptionRepository.create({
            store_id: storeId,
            plan_id: planId,
            payment_id: savedPayment.id,
            start_date: startDate,
            expiry_date: expiryDate,
            status: 'active'
        });

        const savedSub = await this.storeSubscriptionRepository.save(subscription);
        this.generateAndSendStoreInvoice(savedSub).catch(err => {
            console.error('Failed to generate SaaS invoice in manualProvision:', err);
        });
        return savedSub;
    }

    async manualUpdateSubscription(storeId: string, planId: string, billingCycle: string = 'monthly'): Promise<StoreSubscription> {
        const currentSub = await this.getStoreSubscription(storeId);
        
        const plan = await this.plansService.findOne(planId);
        if (!plan) {
            throw new BadRequestException('Plan not found');
        }

        // Create a dummy manual payment for subscription change tracking
        const payment = this.paymentRepository.create({
            amount: 0,
            currency: 'INR',
            payment_method: 'manual',
            transaction_id: `manual_update_${Date.now()}`,
            gateway_name: `${AdminRole.SUPER_ADMIN}_update`,
            status: 'success',
            paid_at: new Date(),
            store_id: storeId,
            payment_type: 'SUBSCRIPTION'
        });
        const savedPayment = await this.paymentRepository.save(payment);

        const startDate = new Date();
        const expiryDate = new Date();
        if (billingCycle === 'yearly') {
            expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        } else {
            expiryDate.setDate(expiryDate.getDate() + 30);
        }

        // Deactivate the old active subscription if it exists
        if (currentSub) {
            currentSub.status = 'expired';
            await this.storeSubscriptionRepository.save(currentSub);
        }

        const subscription = this.storeSubscriptionRepository.create({
            store_id: storeId,
            plan_id: planId,
            payment_id: savedPayment.id,
            start_date: startDate,
            expiry_date: expiryDate,
            status: 'active'
        });

        const savedSub = await this.storeSubscriptionRepository.save(subscription);
        this.generateAndSendStoreInvoice(savedSub).catch(err => {
            console.error('Failed to generate SaaS invoice in manualUpdateSubscription:', err);
        });
        return savedSub;
    }

    async getStoreSubscription(storeId: string): Promise<StoreSubscription> {
        return await this.storeSubscriptionRepository.findOne({
            where: { store_id: storeId },
            relations: ['plan'],
            order: { created_at: 'DESC' }
        });
    }

    async getSubscriptionHistory(storeId: string): Promise<StoreSubscription[]> {
        return await this.storeSubscriptionRepository.find({
            where: { store_id: storeId },
            relations: ['plan'],
            order: { created_at: 'DESC' }
        });
    }

    async findAll(): Promise<StoreSubscription[]> {
        return await this.storeSubscriptionRepository.find({
            relations: ['store', 'plan'],
            order: { created_at: 'DESC' }
        });
    }

    async generateAndSendStoreInvoice(subscription: StoreSubscription): Promise<StoreInvoice> {
        try {
            // 1. Fetch relations
            const store = await this.adminRepository.manager.getRepository('Store').findOne({
                where: { id: subscription.store_id }
            }) as any;
            if (!store) return null;

            const plan = await this.plansService.findOne(subscription.plan_id);
            if (!plan) return null;

            const payment = subscription.payment_id ? await this.paymentRepository.findOne({
                where: { id: subscription.payment_id }
            }) : null;

            // Find store owner admin email
            const admin = await this.adminRepository.findOne({
                where: [
                    { id: store.owner_id },
                    { storeId: store.id, role: AdminRole.STORE_ADMIN }
                ]
            });
            const ownerEmail = admin?.email || 'owner@inospire.com';
            const ownerName = admin?.name || 'Store Owner';

            // Generate invoice number
            const year = new Date().getFullYear();
            const random = Math.floor(1000 + Math.random() * 9000);
            const invoiceNumber = `INV-SAAS-${year}-${random}`;

            // Determine amount
            let amount = 0;
            let cycle = 'monthly';
            if (payment && Number(payment.amount) > 0) {
                amount = Number(payment.amount);
            } else {
                // Determine billing cycle from subscription duration or fallback to monthly
                const start = new Date(subscription.start_date);
                const end = new Date(subscription.expiry_date);
                const diffTime = Math.abs(end.getTime() - start.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays > 300) {
                    cycle = 'yearly';
                    amount = plan.yearlyPrice || 0;
                } else {
                    cycle = 'monthly';
                    amount = plan.monthlyPrice || 0;
                }
            }

            // Create invoice entity
            const invoice = this.storeInvoiceRepository.create({
                invoiceNumber,
                store_id: store.id,
                plan_id: plan.id,
                payment_id: payment?.id || null,
                billing_cycle: cycle,
                amount,
                currency: payment?.currency || 'INR',
                status: payment ? (payment.status === 'captured' || payment.status === 'success' ? 'paid' : 'pending') : 'paid',
                invoice_date: new Date(),
            });

            // Save basic entity to generate UUID
            const savedInvoice = await this.storeInvoiceRepository.save(invoice);

            // 2. Generate PDF Buffer
            const pdfBuffer = await this.generateStoreInvoicePdfBuffer(savedInvoice, store.name, ownerName, ownerEmail, plan.name);

            // 3. Try S3 Upload first
            let pdfUrl = '';
            let s3Uploaded = false;
            try {
                const s3Key = `global-assets/store-invoices/${invoiceNumber}.pdf`;
                const uploadedUrl = await this.s3Service.uploadBuffer(pdfBuffer, s3Key, 'application/pdf');
                if (uploadedUrl) {
                    pdfUrl = s3Key;
                    s3Uploaded = true;
                }
            } catch (s3Error) {
                console.warn(`S3 Upload failed for SaaS invoice: ${s3Error.message}. Using local path fallback.`);
            }

            // 4. Fallback to local storage only if S3 upload failed
            if (!s3Uploaded) {
                const fs = require('fs');
                const path = require('path');
                const dir = path.join(process.cwd(), 'uploads', 'store-invoices');
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
                const localPath = path.join(dir, `${invoiceNumber}.pdf`);
                fs.writeFileSync(localPath, pdfBuffer);
                pdfUrl = `/uploads/store-invoices/${invoiceNumber}.pdf`;
            }

            // Update invoice with PDF Url and sent status
            savedInvoice.pdf_url = pdfUrl;
            savedInvoice.sent_at = new Date();
            await this.storeInvoiceRepository.save(savedInvoice);

            // 5. Send SMTP Email with Attachment
            await this.emailService.sendStoreSubscriptionInvoiceEmail(
                { ...savedInvoice, plan },
                ownerEmail,
                ownerName,
                store.name,
                pdfBuffer
            );

            const invoiceResponse = { ...savedInvoice };
            invoiceResponse.pdf_url = invoiceResponse.pdf_url ? getFullS3Url(invoiceResponse.pdf_url) : null;
            return invoiceResponse as any;
        } catch (error) {
            console.error('Error generating SaaS store subscription invoice:', error);
            return null;
        }
    }

    private async generateStoreInvoicePdfBuffer(
        invoice: StoreInvoice, 
        storeName: string, 
        ownerName: string, 
        ownerEmail: string,
        planName: string
    ): Promise<Buffer> {
        const PDFDocument = require('pdfkit');
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 50 });
            const buffers: Buffer[] = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', reject);

            const primaryColor = '#4F46E5'; 
            const textColor = '#374151'; 
            const lightGray = '#F3F4F6';

            doc.fillColor(primaryColor)
               .fontSize(24)
               .text('EPxWEB SAAS PLATFORM', 50, 50, { bold: true });

            doc.fillColor(textColor)
               .fontSize(10)
               .text('EPxWEB E-Commerce SaaS Solutions', 50, 80)
               .text('Email: billing@epxweb.com', 50, 93)
               .text('Website: epxweb.com', 50, 106);

            doc.fillColor(primaryColor)
               .fontSize(18)
               .text('SUBSCRIPTION INVOICE', 50, 140, { align: 'right' });

            doc.strokeColor('#E5E7EB')
               .lineWidth(1)
               .moveTo(50, 175)
               .lineTo(550, 175)
               .stroke();

            doc.fillColor(textColor)
               .fontSize(10)
               .text(`Invoice Number: ${invoice.invoiceNumber}`, 50, 195)
               .text(`Invoice Date: ${new Date(invoice.invoice_date).toLocaleDateString()}`, 50, 208)
               .text(`Billing Cycle: ${invoice.billing_cycle.toUpperCase()}`, 50, 221)
               .text('Bill To (Store Owner):', 320, 195, { bold: true })
               .text(ownerName, 320, 208)
               .text(storeName, 320, 221)
               .text(ownerEmail, 320, 234);

            doc.rect(50, 275, 500, 25)
               .fill(lightGray);

            doc.fillColor(textColor)
               .fontSize(10)
               .text('Description', 60, 283, { bold: true })
               .text('Billing Cycle', 280, 283, { bold: true })
               .text('Amount', 450, 283, { align: 'right', bold: true });

            const bodyY = 320;
            doc.text(`SaaS Platform Subscription - ${planName} Plan`, 60, bodyY)
               .text(invoice.billing_cycle.toUpperCase(), 280, bodyY)
               .text(`${invoice.currency} ${Number(invoice.amount).toFixed(2)}`, 450, bodyY, { align: 'right' });

            doc.strokeColor('#E5E7EB')
               .lineWidth(1)
               .moveTo(50, 350)
               .lineTo(550, 350)
               .stroke();

            const totalY = 370;
            doc.fontSize(12)
               .fillColor(primaryColor)
               .text('Total Amount Paid:', 280, totalY, { bold: true })
               .text(`${invoice.currency} ${Number(invoice.amount).toFixed(2)}`, 450, totalY, { align: 'right', bold: true });

            doc.fontSize(10)
               .fillColor(textColor)
               .text(`Payment Status: ${invoice.status.toUpperCase()}`, 50, totalY + 30, { bold: true });

            doc.fontSize(9)
               .fillColor('#9CA3AF')
               .text('This is a computer-generated invoice, no signature is required.', 50, 680, { align: 'center', width: 500 })
               .text('Thank you for partnering with EPxWEB!', 50, 695, { align: 'center', width: 500 });

            doc.end();
        });
    }

    async getAllStoreInvoices(query: any = {}) {
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 10;
        const skip = (page - 1) * limit;

        const whereClause: any = {};
        if (query.storeId) {
            whereClause.store_id = query.storeId;
        }
        if (query.status) {
            whereClause.status = query.status;
        }

        const [data, total] = await this.storeInvoiceRepository.findAndCount({
            where: whereClause,
            relations: ['store', 'plan'],
            order: { created_at: 'DESC' },
            take: limit,
            skip: skip,
        });

        const mappedData = data.map(inv => ({
            ...inv,
            pdf_url: inv.pdf_url ? getFullS3Url(inv.pdf_url) : null
        }));

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

    async getInvoicesByStore(storeId: string) {
        const invoices = await this.storeInvoiceRepository.find({
            where: { store_id: storeId },
            relations: ['plan'],
            order: { created_at: 'DESC' }
        });
        return invoices.map(inv => ({
            ...inv,
            pdf_url: inv.pdf_url ? getFullS3Url(inv.pdf_url) : null
        }));
    }

    async resendStoreInvoice(id: string) {
        const invoice = await this.storeInvoiceRepository.findOne({
            where: { id },
            relations: ['plan', 'store']
        });
        if (!invoice) {
            throw new BadRequestException('Invoice not found');
        }

        // Find store owner admin email
        const admin = await this.adminRepository.findOne({
            where: [
                { id: invoice.store.owner_id },
                { storeId: invoice.store.id, role: AdminRole.STORE_ADMIN }
            ]
        });
        const ownerEmail = admin?.email || 'owner@inospire.com';
        const ownerName = admin?.name || 'Store Owner';

        // Generate PDF buffer again to send fresh attachment
        const pdfBuffer = await this.generateStoreInvoicePdfBuffer(
            invoice,
            invoice.store.name,
            ownerName,
            ownerEmail,
            invoice.plan.name
        );

        await this.emailService.sendStoreSubscriptionInvoiceEmail(
            invoice,
            ownerEmail,
            ownerName,
            invoice.store.name,
            pdfBuffer
        );

        invoice.sent_at = new Date();
        await this.storeInvoiceRepository.save(invoice);

        return { success: true, message: 'Invoice resent successfully' };
    }

    async generateInvoiceForActiveSub(storeId: string): Promise<StoreInvoice> {
        const activeSub = await this.getStoreSubscription(storeId);
        if (!activeSub) {
            throw new BadRequestException('No active subscription found for this store to generate invoice.');
        }

        // Check if invoice already exists for this payment (if payment exists)
        let existingInvoice = null;
        if (activeSub.payment_id) {
            existingInvoice = await this.storeInvoiceRepository.findOne({
                where: { payment_id: activeSub.payment_id }
            });
        }

        if (existingInvoice) {
            // Already generated, return it
            const res = { ...existingInvoice };
            res.pdf_url = res.pdf_url ? getFullS3Url(res.pdf_url) : null;
            return res as any;
        }

        // Generate invoice if not exists
        const invoice = await this.generateAndSendStoreInvoice(activeSub);
        if (!invoice) {
            throw new BadRequestException('Failed to generate invoice for active subscription');
        }
        return invoice;
    }
}
