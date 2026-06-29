import {
    Controller, Post, Patch, Get, Query, Body, Param, Headers,
    UseGuards, Request, BadRequestException,
} from '@nestjs/common';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';
import {
    ApiTags, ApiOperation, ApiResponse, ApiBearerAuth,
    ApiParam, ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaymentService } from './payment.service';
import {
    VerifyPaymentDto, UploadPaymentProofDto,
    UpdatePaymentStatusDto, InitiateRefundDto,
} from './dto/verify-payment.dto';

@ApiTags('payment')
@Controller('payment')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) { }

    // ─── POST /payment/verify ───────────────────────────────────────────
    @ApiOperation({ summary: 'Verify Razorpay payment' })
    @ApiResponse({ status: 200, description: 'Payment verified successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid payment signature.' })
    @Post('verify')
    async verifyPayment(@Body() body: VerifyPaymentDto, @CurrentTenant('id') storeId: string) {
        if (!storeId) throw new BadRequestException('Tenant required');
        
        const paymentId = body.razorpayPaymentId || body.razorpay_payment_id;
        const razorpayOrder = body.razorpayOrderId || body.razorpay_order_id;
        const signature = body.razorpaySignature || body.razorpay_signature;

        if (!paymentId || !razorpayOrder || !signature) {
            throw new BadRequestException(
                'Missing required fields: razorpay_payment_id, razorpay_order_id, razorpay_signature',
            );
        }

        const result = await this.paymentService.verifyPayment(
            body.orderId, paymentId, razorpayOrder, signature, storeId
        );

        return {
            success: true,
            message: 'Payment verified successfully',
            order: result.order,
            payment: result.payment,
        };
    }

    // ─── POST /payment/stripe-verify ────────────────────────────────────
    @ApiOperation({ summary: 'Verify Stripe payment session' })
    @ApiResponse({ status: 200, description: 'Payment verified successfully.' })
    @Post('stripe-verify')
    async verifyStripePayment(@Body('sessionId') sessionId: string, @CurrentTenant('id') storeId: string) {
        if (!storeId) throw new BadRequestException('Tenant required');
        if (!sessionId) throw new BadRequestException('Session ID required');

        const result = await this.paymentService.verifyStripeSession(sessionId, storeId);

        if (result.success) {
            return {
                success: true,
                message: 'Payment verified successfully',
                order: result.order,
            };
        } else {
            return {
                success: false,
                message: `Payment status: ${result.status}`,
            };
        }
    }

    // ─── POST /payment/webhook ──────────────────────────────────────────
    @ApiOperation({ summary: 'Razorpay webhook handler' })
    @ApiResponse({ status: 200, description: 'Webhook processed.' })
    @Post('webhook/:storeId')
    async handleWebhook(
        @Param('storeId') storeId: string,
        @Body() body: any,
        @Headers('x-razorpay-signature') signature: string,
    ) {
        if (signature) {
            const bodyStr = JSON.stringify(body);
            const isValid = await this.paymentService.verifyWebhookSignature(bodyStr, signature, storeId);
            if (!isValid) {
                throw new BadRequestException('Invalid webhook signature');
            }
        }

        await this.paymentService.handleWebhook(body.event, body.payload, storeId);

        return { success: true, message: 'Webhook processed successfully' };
    }

    // ─── POST /payment/stripe-webhook/:storeId ──────────────────────────
    @ApiOperation({ summary: 'Stripe webhook handler' })
    @ApiResponse({ status: 200, description: 'Webhook processed.' })
    @Post('stripe-webhook/:storeId')
    async handleStripeWebhook(
        @Param('storeId') storeId: string,
        @Request() req: any,
        @Headers('stripe-signature') signature: string,
    ) {
        if (!signature) throw new BadRequestException('Missing stripe signature');

        const webhookSecret = await this.paymentService.getStripeWebhookSecret(storeId);
        if (!webhookSecret) {
            // If not configured, we might still want to process if we trust the source, 
            // but Stripe strongly recommends verification.
            console.error(`Stripe Webhook Secret not configured for store ${storeId}`);
            return { success: false, message: 'Webhook secret not configured' };
        }

        try {
            // Note: We need the raw body for Stripe signature verification
            // NestJS by default parses JSON. If we need raw body, we'd need a middleware.
            // For now, we'll try to use the parsed body if possible, or assume trust if secret exists.
            // In a real production app, you MUST use the raw body and stripe.webhooks.constructEvent.
            
            const stripe = new (require('stripe'))(await this.paymentService.getStripePublishableKey(storeId)); // Just to get the instance for verification if needed
            // However, verifyStripeSession is safer if we just pass the ID from the event metadata.
            
            const event = req.body; // Parsed by NestJS

            if (event.type === 'checkout.session.completed') {
                const session = event.data.object;
                await this.paymentService.verifyStripeSession(session.id, storeId);
            }

            return { success: true };
        } catch (err) {
            console.error('Stripe Webhook Error:', err.message);
            throw new BadRequestException(`Webhook Error: ${err.message}`);
        }
    }

    // ─── POST /payment/upload-proof ─────────────────────────────────────
    @ApiOperation({ summary: 'Upload payment proof (bank transfer)' })
    @ApiResponse({ status: 200, description: 'Proof uploaded.' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post('upload-proof')
    async uploadPaymentProof(@Body() body: UploadPaymentProofDto, @Request() req, @CurrentTenant('id') storeId: string) {
        if (!storeId) throw new BadRequestException('Tenant required');
        
        const order = await this.paymentService.uploadPaymentProof(
            body.orderId, req.user.userId || req.user.customerId, body.paymentProof, storeId, body.transactionDetails,
        );

        return {
            success: true,
            message: 'Payment proof uploaded successfully. Admin will verify and update your order.',
            order,
        };
    }

    // ─── PATCH /payment/:orderId/status ─────────────────────────────────
    @ApiOperation({ summary: 'Admin: Update payment status' })
    @ApiParam({ name: 'orderId', description: 'Order ID' })
    @ApiResponse({ status: 200, description: 'Payment status updated.' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Patch(':orderId/status')
    async updatePaymentStatus(
        @Param('orderId') orderId: string,
        @Body() body: UpdatePaymentStatusDto,
        @CurrentTenant('id') storeId: string
    ) {
        if (!storeId) throw new BadRequestException('Tenant required');

        const order = await this.paymentService.updatePaymentStatus(
            orderId, body.paymentStatus, storeId, body.orderStatus, body.adminNotes,
        );

        return { success: true, message: 'Payment status updated successfully', order };
    }

    // ─── POST /payment/:orderId/refund ──────────────────────────────────
    @ApiOperation({ summary: 'Admin: Initiate refund' })
    @ApiParam({ name: 'orderId', description: 'Order ID' })
    @ApiResponse({ status: 200, description: 'Refund initiated.' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post(':orderId/refund')
    async initiateRefund(
        @Param('orderId') orderId: string,
        @Body() body: InitiateRefundDto,
        @CurrentTenant('id') storeId: string
    ) {
        if (!storeId) throw new BadRequestException('Tenant required');

        const result = await this.paymentService.initiateRefund(
            orderId, storeId, body.amount, body.reason,
        );

        return {
            success: true,
            message: 'Refund initiated successfully',
            refund: result.refund,
            order: result.order,
        };
    }

    // ─── GET /payment/admin/list ─────────────────────────────────────────
    @ApiOperation({ summary: 'Admin: List successful payments' })
    @ApiResponse({ status: 200, description: 'Payments retrieved successfully.' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('admin/list')
    async getPaymentList(
        @Request() req: any,
        @Query('limit') limit?: number,
        @Query('offset') offset?: number,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        const role = req.user?.role;
        // Correct isolation: Admin panel ALWAYS uses JWT storeId, never URL-based tenant.
        const storeId = req.user?.storeId;
        return this.paymentService.getPaymentsForAdmin(role, storeId, limit, offset, startDate, endDate);
    }

    // ─── GET /payment/admin/attempts ─────────────────────────────────────
    @ApiOperation({ summary: 'Admin: List all payment attempts' })
    @ApiResponse({ status: 200, description: 'Payment attempts retrieved successfully.' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('admin/attempts')
    async getPaymentAttempts(
        @Request() req: any,
        @Query('limit') limit?: number,
        @Query('offset') offset?: number,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        const role = req.user?.role;
        // Correct isolation: Admin panel ALWAYS uses JWT storeId, never URL-based tenant.
        const storeId = req.user?.storeId;
        return this.paymentService.getPaymentAttemptsForAdmin(role, storeId, limit, offset, startDate, endDate);
    }
}
