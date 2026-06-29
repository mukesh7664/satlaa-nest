import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { Store } from '../../stores/entities/store.entity';
import { ColumnNumericTransformer } from '../../common/transformers/numeric.transformer';

export enum ReturnRequestType {
    RETURN = 'RETURN',
    REPLACEMENT = 'REPLACEMENT',
}

export enum ReturnRequestStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    PICKED_UP = 'PICKED_UP',
    QC_PASSED = 'QC_PASSED',
    COMPLETED = 'COMPLETED',
    REJECTED = 'REJECTED',
}

@Entity('return_requests')
export class ReturnRequest {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Order)
    @JoinColumn({ name: 'orderId' })
    order: Order;

    @Column()
    orderId: string;

    @ManyToOne(() => OrderItem)
    @JoinColumn({ name: 'orderItemId' })
    orderItem: OrderItem;

    @Column()
    orderItemId: string;

    @ManyToOne(() => Customer)
    @JoinColumn({ name: 'customerId' })
    customer: Customer;

    @Column()
    customerId: string;

    @ManyToOne(() => Store)
    @JoinColumn({ name: 'storeId' })
    store: Store;

    @Column()
    storeId: string;

    @Column({
        type: 'enum',
        enum: ReturnRequestType,
    })
    type: ReturnRequestType;

    @Column('text')
    reason: string;

    @Column({
        type: 'enum',
        enum: ReturnRequestStatus,
        default: ReturnRequestStatus.PENDING,
    })
    status: ReturnRequestStatus;

    @Column('decimal', { precision: 10, scale: 2, default: 0, transformer: new ColumnNumericTransformer() })
    refundAmount: number;

    @Column({ nullable: true })
    newOrderId: string;

    @Column('jsonb', { nullable: true })
    images: string[];

    @Column('text', { nullable: true })
    customerNotes: string;

    @Column('text', { nullable: true })
    adminNotes: string;
    
    @Column({ nullable: true })
    replacementVariantId: string;

    @Column('jsonb', { nullable: true })
    replacementVariantInfo: any;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
