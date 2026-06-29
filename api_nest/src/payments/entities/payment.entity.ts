import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Store } from '../../stores/entities/store.entity';

@Entity('payments')
export class Payment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', nullable: true }) 
    payment_type: string; // 'SUBSCRIPTION' or 'ORDER'

    @ManyToOne(() => Store, { nullable: true })
    @JoinColumn({ name: 'store_id' })
    store: Store;

    @Column({ type: 'uuid', nullable: true })
    store_id: string;

    @Column({ type: 'uuid', nullable: true })
    order_id: string; // If type is ORDER

    @Column({ type: 'uuid', nullable: true })
    customer_id: string; // Store's customer

    @Column({ type: 'uuid', nullable: true })
    payment_attempt_id: string;

    @Column('numeric', { precision: 10, scale: 2, nullable: true })
    amount: number;

    @Column({ default: 'INR' })
    currency: string;

    @Column({ nullable: true })
    payment_method: string; // 'upi', 'card', 'netbanking'

    @Column()
    transaction_id: string; // Razorpay Payment ID (pay_XXXX)

    @Column({ nullable: true })
    gateway_name: string;

    @Column({ default: 'captured' })
    status: string;

    @Column('jsonb', { nullable: true })
    gateway_response: any; // Full Raw Response from Razorpay

    @Column({ type: 'timestamp', nullable: true })
    paid_at: Date;

    @Column({ nullable: true })
    applied_coupon_code: string;

    @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
    original_amount: number;

    @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
    discount_amount: number;

    @CreateDateColumn()
    created_at: Date;
}
