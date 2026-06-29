import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionCoupon, CouponDiscountType } from './entities/subscription-coupon.entity';

export interface CouponValidationResult {
    valid: boolean;
    reason?: string;
    discountedAmount?: number;
    discountAmount?: number;
    discountLabel?: string;
    isFree?: boolean;
    coupon?: SubscriptionCoupon;
}

@Injectable()
export class SubscriptionCouponService {
    constructor(
        @InjectRepository(SubscriptionCoupon)
        private couponRepository: Repository<SubscriptionCoupon>,
    ) {}

    async validateCoupon(code: string, planId: string, originalAmount: number): Promise<CouponValidationResult> {
        const coupon = await this.couponRepository.findOne({ where: { code: code.toUpperCase().trim() } });

        if (!coupon) {
            return { valid: false, reason: 'Invalid coupon code' };
        }
        if (!coupon.isActive) {
            return { valid: false, reason: 'This coupon is no longer active' };
        }
        if (coupon.expiresAt && new Date() > new Date(coupon.expiresAt)) {
            return { valid: false, reason: 'This coupon has expired' };
        }
        if (coupon.maxUses !== null && coupon.maxUses !== undefined && coupon.usedCount >= coupon.maxUses) {
            return { valid: false, reason: 'This coupon has reached its usage limit' };
        }
        if (coupon.applicablePlanIds && coupon.applicablePlanIds.length > 0 && !coupon.applicablePlanIds.includes(planId)) {
            return { valid: false, reason: 'This coupon is not applicable for the selected plan' };
        }

        let discountAmount: number;
        let discountLabel: string;

        if (coupon.discountType === CouponDiscountType.PERCENTAGE) {
            discountAmount = (originalAmount * Number(coupon.discountValue)) / 100;
            discountLabel = `${coupon.discountValue}% off`;
        } else {
            discountAmount = Math.min(Number(coupon.discountValue), originalAmount);
            discountLabel = `₹${coupon.discountValue} off`;
        }

        const discountedAmount = Math.max(0, originalAmount - discountAmount);

        return {
            valid: true,
            discountAmount: Math.round(discountAmount * 100) / 100,
            discountedAmount: Math.round(discountedAmount * 100) / 100,
            discountLabel,
            isFree: discountedAmount === 0,
            coupon,
        };
    }

    async incrementUsage(code: string): Promise<void> {
        const coupon = await this.couponRepository.findOne({ where: { code: code.toUpperCase().trim() } });
        if (coupon) {
            coupon.usedCount += 1;
            await this.couponRepository.save(coupon);
        }
    }

    async create(dto: {
        code: string;
        discountType: CouponDiscountType;
        discountValue: number;
        maxUses?: number;
        expiresAt?: Date;
        applicablePlanIds?: string[];
        isActive?: boolean;
    }): Promise<SubscriptionCoupon> {
        const existing = await this.couponRepository.findOne({ where: { code: dto.code.toUpperCase().trim() } });
        if (existing) {
            throw new BadRequestException('A coupon with this code already exists');
        }
        const coupon = this.couponRepository.create({
            ...dto,
            code: dto.code.toUpperCase().trim(),
            isActive: dto.isActive !== undefined ? dto.isActive : true,
        });
        return this.couponRepository.save(coupon);
    }

    async findAll(): Promise<SubscriptionCoupon[]> {
        return this.couponRepository.find({ order: { createdAt: 'DESC' } });
    }

    async findOne(id: string): Promise<SubscriptionCoupon> {
        const coupon = await this.couponRepository.findOne({ where: { id } });
        if (!coupon) throw new NotFoundException('Coupon not found');
        return coupon;
    }

    async update(id: string, dto: Partial<{
        code: string;
        discountType: CouponDiscountType;
        discountValue: number;
        maxUses: number;
        expiresAt: Date;
        applicablePlanIds: string[];
        isActive: boolean;
    }>): Promise<SubscriptionCoupon> {
        const coupon = await this.findOne(id);
        if (dto.code) {
            const existing = await this.couponRepository.findOne({ where: { code: dto.code.toUpperCase().trim() } });
            if (existing && existing.id !== id) {
                throw new BadRequestException('A coupon with this code already exists');
            }
            dto.code = dto.code.toUpperCase().trim();
        }
        Object.assign(coupon, dto);
        return this.couponRepository.save(coupon);
    }

    async remove(id: string): Promise<void> {
        const coupon = await this.findOne(id);
        await this.couponRepository.remove(coupon);
    }
}
