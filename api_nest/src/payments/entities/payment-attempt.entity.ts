import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('payment_attempts')
export class PaymentAttempt {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', default: 'ORDER' }) // 'SUBSCRIPTION' or 'ORDER'
    entity_type: string;

    @Column({ type: 'uuid', nullable: true })
    order_id: string;

    @Column({ type: 'uuid', nullable: true })
    customer_id: string;

    @Column({ type: 'uuid', nullable: true })
    plan_id: string;

    @Column({ nullable: true, default: 'monthly' })
    billing_cycle: string; // 'monthly', 'yearly', or 'one-time'

    @Column('numeric', { precision: 10, scale: 2, nullable: true })
    amount: number;

    @Column({ default: 'INR' })
    currency: string;

    @Column({ nullable: true })
    payment_gateway: string; // 'razorpay', 'stripe'

    @Column({ default: 'pending' })
    payment_status: string; // 'pending', 'success', 'failed'

    @Column({ nullable: true })
    gateway_order_id: string; // Razorpay Order ID

    @Column('text', { nullable: true })
    failure_reason: string;

    @Column('jsonb', { nullable: true })
    registration_data: any; // SaaS store signup details during payment

    @CreateDateColumn()
    created_at: Date;
}
