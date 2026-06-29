import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn, AfterLoad } from 'typeorm';
import { getFullS3Url } from '../../common/utils/s3-url.util';
import { Admin } from '../../admin/entities/admin.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { Order } from './order.entity';
import { Store } from '../../stores/entities/store.entity';

@Entity('estimates')
export class Estimate {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    @Index()
    estimateNumber: string;

    @Column('jsonb')
    customer: any;

    @Column('jsonb')
    items: any[];

    @Column('jsonb')
    pricing: {
        subtotal: number;
        discount: number;
        tax: number;
        total: number;
        currency: string;
    };

    @Column()
    @Index()
    validUntil: Date;

    @Column({
        type: 'varchar',
        default: 'draft',
    })
    @Index()
    status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired' | 'converted';

    @Column({ nullable: true })
    sentAt: Date;

    @Column({ nullable: true })
    viewedAt: Date;

    @Column({ nullable: true })
    acceptedAt: Date;

    @Column({ nullable: true })
    rejectedAt: Date;

    @Column({ type: 'text', nullable: true })
    rejectionReason: string;

    @ManyToOne(() => Order, { nullable: true })
    @JoinColumn({ name: 'convertedToOrderId' })
    convertedToOrder: Order;

    @Column({ nullable: true })
    convertedToOrderId: string;

    @Column({ nullable: true })
    convertedAt: Date;

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
    @JoinColumn({ name: 'userId' })
    customerEntity: Customer;

    @Column({ nullable: true })
    @Index()
    userId: string; // Customer ID

    @Column({ nullable: true })
    pdfUrl: string;

    @AfterLoad()
    resolvePdfUrl() {
        if (this.pdfUrl) {
            this.pdfUrl = getFullS3Url(this.pdfUrl);
        }
    }

    @CreateDateColumn()
    @Index()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Tenant Relation
    @ManyToOne(() => Store, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'storeId' })
    store: Store;

    @Column({ nullable: true })
    @Index()
    storeId: string;
}
