import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Store } from '../../stores/entities/store.entity';
import { Plan } from '../../plans/plan.entity';
import { Payment } from '../../payments/entities/payment.entity';

@Entity('store_invoices')
export class StoreInvoice {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    invoiceNumber: string;

    @ManyToOne(() => Store, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'store_id' })
    store: Store;

    @Column()
    store_id: string;

    @ManyToOne(() => Plan)
    @JoinColumn({ name: 'plan_id' })
    plan: Plan;

    @Column()
    plan_id: string;

    @ManyToOne(() => Payment, { nullable: true })
    @JoinColumn({ name: 'payment_id' })
    payment: Payment;

    @Column({ nullable: true })
    payment_id: string;

    @Column({ default: 'monthly' })
    billing_cycle: string;

    @Column('numeric', { precision: 10, scale: 2, default: 0 })
    amount: number;

    @Column({ default: 'INR' })
    currency: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    invoice_date: Date;

    @Column({ nullable: true })
    pdf_url: string;

    @Column({ default: 'paid' })
    status: string;

    @Column({ type: 'timestamp', nullable: true })
    sent_at: Date;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
