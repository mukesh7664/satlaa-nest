import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../auth/guards/super-admin.guard';
import { SubscriptionCouponService } from './subscription-coupon.service';
import { CouponDiscountType } from './entities/subscription-coupon.entity';

@ApiTags('subscription-coupons')
@Controller('subscription-coupons')
export class SubscriptionCouponController {
    constructor(private readonly couponService: SubscriptionCouponService) {}

    @ApiOperation({ summary: 'Validate a coupon code (Public)' })
    @Post('validate')
    validate(@Body() body: { code: string; planId: string; originalAmount: number }) {
        return this.couponService.validateCoupon(body.code, body.planId, body.originalAmount);
    }

    @ApiOperation({ summary: 'Super Admin: Create coupon' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, SuperAdminGuard)
    @Post()
    create(@Body() body: {
        code: string;
        discountType: CouponDiscountType;
        discountValue: number;
        maxUses?: number;
        expiresAt?: Date;
        applicablePlanIds?: string[];
        isActive?: boolean;
    }) {
        return this.couponService.create(body);
    }

    @ApiOperation({ summary: 'Super Admin: List all coupons' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, SuperAdminGuard)
    @Get()
    findAll() {
        return this.couponService.findAll();
    }

    @ApiOperation({ summary: 'Super Admin: Get single coupon' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, SuperAdminGuard)
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.couponService.findOne(id);
    }

    @ApiOperation({ summary: 'Super Admin: Update coupon' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, SuperAdminGuard)
    @Patch(':id')
    update(@Param('id') id: string, @Body() body: any) {
        return this.couponService.update(id, body);
    }

    @ApiOperation({ summary: 'Super Admin: Delete coupon' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, SuperAdminGuard)
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.couponService.remove(id);
    }
}
