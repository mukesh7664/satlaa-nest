import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Customer } from '../../customers/entities/customer.entity';
import { ColumnNumericTransformer } from '../../common/transformers/numeric.transformer';
import { OrderItem } from './order-item.entity';
import { Shipment } from './shipment.entity';
import { ReturnRequest } from './return-request.entity';

export enum OrderStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    PROCESSING = 'processing',
    READY_TO_SHIP = 'ready_to_ship',
    SHIPPED = 'shipped',
    OUT_FOR_DELIVERY = 'out_for_delivery',
    DELIVERED = 'delivered',
    RETURN_REQUESTED = 'return_requested',
    REPLACEMENT_REQUESTED = 'replacement_requested',
    PARTIALLY_RETURNED = 'partially_returned',
    PARTIALLY_REPLACED = 'partially_replaced',
    CANCELLED = 'cancelled',
    RETURNED = 'returned',
    REFUNDED = 'refunded',
    FAILED = 'failed',
}

export enum PaymentStatus {
    UNPAID = 'unpaid',
    PAID = 'paid',
    FAILED = 'failed',
    REFUNDED = 'refunded',
}

@Entity('orders')
@Index(['customerId'])
@Index(['orderNumber'], { unique: true })
export class Order {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    orderNumber: string;

    @ManyToOne(() => Customer, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'customerId' })
    customer: Customer;

    @Column({ nullable: true })
    customerId: string;

    @Column({
        type: 'enum',
        enum: OrderStatus,
        default: OrderStatus.PENDING,
    })
    status: OrderStatus;

    @Column({
        type: 'enum',
        enum: PaymentStatus,
        default: PaymentStatus.UNPAID,
    })
    paymentStatus: PaymentStatus;

    @Column({ nullable: true })
    paymentMethod: string;

    @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
    items: OrderItem[];

    @OneToMany(() => ReturnRequest, (request) => request.order)
    returnRequests: ReturnRequest[];

    @Column('decimal', { precision: 10, scale: 2, transformer: new ColumnNumericTransformer() })
    totalAmount: number;

    @Column('decimal', { precision: 10, scale: 2, default: 0, transformer: new ColumnNumericTransformer() })
    subtotal: number;

    @Column('decimal', { precision: 10, scale: 2, default: 0, transformer: new ColumnNumericTransformer() })
    taxAmount: number;

    @Column('decimal', { precision: 10, scale: 2, default: 0, transformer: new ColumnNumericTransformer() })
    shippingCost: number;

    @Column('decimal', { precision: 10, scale: 2, default: 0, transformer: new ColumnNumericTransformer() })
    discountAmount: number;

    @Column({ default: 'INR' })
    currency: string;

    @Column('decimal', { precision: 10, scale: 6, default: 1, transformer: new ColumnNumericTransformer() })
    exchangeRate: number;

    @Column({ nullable: true })
    discountCode: string;

    @Column({ nullable: true })
    discountId: string;

    @Column('jsonb', { nullable: true })
    shippingAddress: any;

    @Column('jsonb', { nullable: true })
    billingAddress: any;

    @Column({ nullable: true })
    trackingId: string;

    @Column('text', { nullable: true })
    notes: string;

    @Column('jsonb', { nullable: true })
    paymentInfo: {
        method?: string;
        status?: string;
        transactionId?: string;
        paymentGateway?: string;
        paidAt?: Date;
    };

    @Column('jsonb', { nullable: true })
    metadata: Record<string, any>;

    @Column({ nullable: true })
    orderType: string;

    @OneToOne(() => Shipment, (shipment) => shipment.order)
    shipment: Shipment;

    @Column({ type: 'timestamp', nullable: true })
    cancelledAt: Date;

    @Column({ type: 'text', nullable: true })
    cancellationReason: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
