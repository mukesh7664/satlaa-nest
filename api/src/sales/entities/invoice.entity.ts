import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn, AfterLoad } from 'typeorm';
import { getFullS3Url } from '../../common/utils/s3-url.util';
import { Admin } from '../../admin/entities/admin.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { Order } from './order.entity';
import { ColumnNumericTransformer } from '../../common/transformers/numeric.transformer';

@Entity('invoices')
export class Invoice {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    @Index()
    invoiceNumber: string;

    @ManyToOne(() => Order, { nullable: true })
    @JoinColumn({ name: 'orderId' })
    order: Order;

    @Column({ nullable: true })
    @Index()
    orderId: string;

    @Column('jsonb')
    customer: any;

    @Column('jsonb')
    items: any[];

    @Column('jsonb')
    pricing: {
        subtotal: number;
        discount: number;
        tax: number;
        shippingCharges: number;
        total: number;
        currency: string;
    };

    @Column('jsonb', { default: [] })
    payments: any[];

    @Column({ default: 'INR' })
    currency: string;

    @Column('decimal', { precision: 10, scale: 6, default: 1, transformer: new ColumnNumericTransformer() })
    exchangeRate: number;

    @Column('decimal', { precision: 12, scale: 2, default: 0, transformer: new ColumnNumericTransformer() })
    amountPaid: number;

    @Column('decimal', { precision: 12, scale: 2, default: 0, transformer: new ColumnNumericTransformer() })
    amountDue: number;

    @Column({
        type: 'varchar',
        default: 'draft',
    })
    @Index()
    status: 'draft' | 'sent' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled';

    @Column()
    @Index()
    invoiceDate: Date;

    @Column()
    @Index()
    dueDate: Date;

    @Column({ nullable: true })
    paidAt: Date;

    @Column({ nullable: true })
    sentAt: Date;

    @Column({ nullable: true })
    pdfUrl: string;

    @AfterLoad()
    resolvePdfUrl() {
        if (this.pdfUrl) {
            this.pdfUrl = getFullS3Url(this.pdfUrl);
        }
    }

    @Column({ type: 'text', nullable: true })
    notes: string;

    @Column({ type: 'text', nullable: true })
    termsAndConditions: string;

    @ManyToOne(() => Admin, { nullable: true })
    @JoinColumn({ name: 'createdById' })
    createdBy: Admin;

    @Column({ nullable: true })
    createdById: string;

    @ManyToOne(() => Customer, { nullable: true })
    @JoinColumn({ name: 'customerId' })
    customerEntity: Customer;

    @Column({ nullable: true })
    @Index()
    customerId: string; // Customer ID

    @CreateDateColumn()
    @Index()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
