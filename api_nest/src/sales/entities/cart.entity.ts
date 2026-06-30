import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index, OneToMany, Relation, DeleteDateColumn } from 'typeorm';
import { Customer } from '../../customers/entities/customer.entity';
import { CartItem } from './cart-item.entity';


export enum CartStatus {
    ACTIVE = 'active',
    CONVERTED = 'converted',
    ABANDONED = 'abandoned',
    EXPIRED = 'expired',
}

export enum CartType {
    PURCHASE = 'purchase',
    QUOTE_REQUEST = 'quote_request',
}

@Entity('carts')
@Index(['customerId', 'status'])
@Index(['sessionId', 'status'])
export class Cart {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // Customer Association
    @ManyToOne(() => Customer, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'customerId' })
    customer: Customer;

    @Column({ nullable: true })
    customerId: string;

    @Column({ nullable: true })
    sessionId: string; // For guest users

    @OneToMany(() => CartItem, (item: CartItem) => item.cart)
    items: Relation<CartItem[]>;

    // Totals (stored as JSONB)
    @Column('jsonb', {
        default: {
            subtotal: 0,
            discount: 0,
            discountAmount: 0,
            tax: 0,
            shippingCharges: 0,
            total: 0,
            currency: 'INR',
        },
    })
    totals: {
        subtotal: number;
        discount: number; // General discount
        discountAmount: number; // Applied discount/coupon amount
        tax: number;
        shippingCharges: number;
        total: number;
        currency: string;
    };

    // Discount
    @Column({ nullable: true })
    appliedDiscountId: string;

    @Column({ nullable: true })
    discountCode: string;

    // Cart Type
    @Column({
        type: 'enum',
        enum: CartType,
        default: CartType.PURCHASE,
    })
    cartType: CartType;

    // Guest Info (for quote requests)
    @Column('jsonb', { nullable: true })
    guestInfo: {
        name?: string;
        email?: string;
        phone?: string;
        companyName?: string;
    };

    // Status
    @Column({
        type: 'enum',
        enum: CartStatus,
        default: CartStatus.ACTIVE,
    })
    status: CartStatus;

    @Column({ nullable: true })
    convertedToOrderId: string;

    // Expiry & Tracking
    @Column({ 
        type: 'timestamp',
        default: () => "NOW() + INTERVAL '7 days'"
    })
    expiresAt: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    lastUpdated: Date;

    // Analytics
    @Column({ type: 'timestamp', nullable: true })
    abandonedAt: Date;

    @Column({ default: false })
    reminderSent: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}

