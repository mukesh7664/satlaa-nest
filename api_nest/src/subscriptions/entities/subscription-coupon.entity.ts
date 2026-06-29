import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum CouponDiscountType {
    PERCENTAGE = 'PERCENTAGE',
    FIXED = 'FIXED',
}

@Entity('subscription_coupons')
export class SubscriptionCoupon {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    code: string;

    @Column({ type: 'enum', enum: CouponDiscountType })
    discountType: CouponDiscountType;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    discountValue: number;

    @Column({ nullable: true, type: 'int' })
    maxUses: number;

    @Column({ type: 'int', default: 0 })
    usedCount: number;

    @Column({ nullable: true, type: 'timestamp' })
    expiresAt: Date;

    @Column({ type: 'simple-array', nullable: true })
    applicablePlanIds: string[];

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
