import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../auth/guards/super-admin.guard';

import { PlanLimitsService } from './plan-limits.service';

@ApiTags('subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
    constructor(
        private readonly subscriptionsService: SubscriptionsService,
        private readonly planLimitsService: PlanLimitsService
    ) { }

    @ApiOperation({ summary: 'Create Razorpay Order' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post('create-order')
    createOrder(@Request() req, @Body() body: { planId: string, storeName: string, storeSlug: string, billingCycle: string }) {
        return this.subscriptionsService.createOrder(req.user.userId, body.planId, body.storeName, body.storeSlug, body.billingCycle || 'monthly');
    }

    @ApiOperation({ summary: 'Get Plan Change Preview (Proration)' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('change-preview')
    getPlanChangePreview(@Request() req, @Query('planId') planId: string, @Query('billingCycle') billingCycle: string) {
        return this.subscriptionsService.calculatePlanChangePreview(req.user.storeId, planId, billingCycle || 'monthly');
    }

    @ApiOperation({ summary: 'Get Subscription History' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('history')
    getHistory(@Request() req) {
        return this.subscriptionsService.getSubscriptionHistory(req.user.storeId);
    }

    @ApiOperation({ summary: 'Create Plan Change Razorpay Order' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post('plan-change-order')
    createPlanChangeOrder(@Request() req, @Body() body: { planId: string, billingCycle: string }) {
        return this.subscriptionsService.createPlanChangeOrder(req.user.userId, req.user.storeId, body.planId, body.billingCycle || 'monthly');
    }

    @ApiOperation({ summary: 'Request Plan Change for next cycle (Downgrade)' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post('request-plan-change')
    requestPlanChange(@Request() req, @Body() body: { planId: string, billingCycle: string }) {
        return this.subscriptionsService.requestPlanChange(req.user.storeId, body.planId, body.billingCycle || 'monthly');
    }

    @ApiOperation({ summary: 'Cancel Pending Plan Change' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post('cancel-plan-change')
    cancelPlanChange(@Request() req) {
        return this.subscriptionsService.cancelPendingPlanChange(req.user.storeId);
    }

    @ApiOperation({ summary: 'Create Razorpay Order for new registration (Public)' })
    @Post('register-order')
    registerOrder(@Body() body: { planId: string, storeName: string, storeSlug: string, billingCycle: string, registrationData: any }) {
        return this.subscriptionsService.createRegistrationOrder(body);
    }

    @ApiOperation({ summary: 'Verify Razorpay Payment and Provision Store' })
    @Post('verify-payment')
    verifyPayment(@Request() req, @Body() body: any) {
        // If user is authenticated, use their ID, otherwise it might be a new registration (handled inside service via attempt data)
        const userId = req.user?.userId || null;
        return this.subscriptionsService.verifyPayment(userId, body);
    }

    @ApiOperation({ summary: 'Get current store subscription' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('my')
    getMySubscription(@Request() req) {
        return this.subscriptionsService.getStoreSubscription(req.user.storeId);
    }

    @ApiOperation({ summary: 'Get current store plan usage' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('usage')
    getUsage(@Request() req) {
        return this.planLimitsService.getUsage(req.user.storeId);
    }


    @ApiOperation({ summary: 'Super Admin: Manually Provision Store' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, SuperAdminGuard)
    @Post('manual-provision')
    manualProvision(@Body() body: any) {
        return this.subscriptionsService.manualProvision(body);
    }

    @ApiOperation({ summary: 'Super Admin: Manually update store subscription' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, SuperAdminGuard)
    @Post('manual-update')
    manualUpdate(@Body() body: { storeId: string, planId: string, billingCycle?: string }) {
        return this.subscriptionsService.manualUpdateSubscription(body.storeId, body.planId, body.billingCycle || 'monthly');
    }

    @ApiOperation({ summary: 'Super Admin: Get all subscriptions' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, SuperAdminGuard)
    @Get()
    findAll() {
        return this.subscriptionsService.findAll();
    }

    @ApiOperation({ summary: 'Super Admin: Get all store invoices' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, SuperAdminGuard)
    @Get('invoices')
    async getInvoices(@Query() query: any) {
        return this.subscriptionsService.getAllStoreInvoices(query);
    }

    @ApiOperation({ summary: 'Super Admin: Resend store invoice' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, SuperAdminGuard)
    @Post('invoices/:id/resend')
    async resendInvoice(@Param('id') id: string) {
        return this.subscriptionsService.resendStoreInvoice(id);
    }

    @ApiOperation({ summary: 'Store Admin: Get store subscription invoices' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('store/invoices')
    async getStoreInvoices(@Request() req) {
        return this.subscriptionsService.getInvoicesByStore(req.user.storeId);
    }

    @ApiOperation({ summary: 'Super Admin: Generate invoice for active subscription if not exists' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, SuperAdminGuard)
    @Post('invoices/generate/:storeId')
    async generateActiveInvoice(@Param('storeId') storeId: string) {
        return this.subscriptionsService.generateInvoiceForActiveSub(storeId);
    }
}
