import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index, Relation, DeleteDateColumn } from 'typeorm';
import { Cart } from './cart.entity';
import { Product } from '../../catalog/entities/product.entity';
import { ColumnNumericTransformer } from '../../common/transformers/numeric.transformer';

@Entity('cart_items')
@Index(['cartId'])
export class CartItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Cart, cart => cart.items, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'cartId' })
    cart: Relation<Cart>;

    @Column({ nullable: true })
    cartId: string;

    @ManyToOne(() => Product)
    @JoinColumn({ name: 'productId' })
    product: Relation<Product>;

    @Column({ nullable: true })
    productId: string;
    
    @Column({ nullable: true })
    variantId: string;



    @Column('decimal', { precision: 12, scale: 2, transformer: new ColumnNumericTransformer() })
    price: number;

    @Column({ default: 1 })
    quantity: number;

    @Column('jsonb', { nullable: true })
    selectedVariant: {
        userType?: string;
        planName?: string;
        planSlug?: string;
        billingCycle?: 'monthly' | 'yearly';
        pricePerUnit: number;
        numberOfUsers?: number;
        numberOfLicenses?: number;
    };

    @Column('jsonb', { nullable: true })
    bundleSelections: Record<string, string>;

    @Column('decimal', { precision: 12, scale: 2, transformer: new ColumnNumericTransformer() })
    subtotal: number;

    @Column('decimal', { precision: 12, scale: 2, default: 0, transformer: new ColumnNumericTransformer() })
    tax: number;

    @Column({ nullable: true })
    notes: string;

    @CreateDateColumn()
    addedAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}
