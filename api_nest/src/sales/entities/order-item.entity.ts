import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Order } from './order.entity';
import { ColumnNumericTransformer } from '../../common/transformers/numeric.transformer';

@Entity('order_items')
export class OrderItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'orderId' })
    order: Order;

    @Column({ nullable: true })
    orderId: string;
    
    @ManyToOne('Product')
    @JoinColumn({ name: 'productId' })
    product: any;

    @Column({ nullable: true })
    productId: string;

    @Column({ nullable: true })
    variantId: string;

    @Column()
    productName: string;

    @Column({ nullable: true })
    sku: string;

    @Column({ nullable: true })
    hsn_code: string;

    @Column('decimal', { precision: 10, scale: 2, transformer: new ColumnNumericTransformer() })
    price: number;

    @Column('decimal', { precision: 10, scale: 2, default: 0, transformer: new ColumnNumericTransformer() })
    costPrice: number;

    @Column('decimal', { precision: 5, scale: 2, default: 0, transformer: new ColumnNumericTransformer() })
    tax_rate: number;

    @Column('decimal', { precision: 10, scale: 2, default: 0, transformer: new ColumnNumericTransformer() })
    tax_amount: number;

    @Column({ default: 1 })
    quantity: number;

    @Column('decimal', { precision: 10, scale: 2, transformer: new ColumnNumericTransformer() })
    totalPrice: number;

    @Column('jsonb', { nullable: true })
    variantInfo: any;

    @Column('jsonb', { nullable: true })
    bundleSelections: Record<string, string>;

    @Column({ default: 'pending', nullable: true })
    paymentStatus: string;

    @Column({ default: false })
    isRefunded: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
