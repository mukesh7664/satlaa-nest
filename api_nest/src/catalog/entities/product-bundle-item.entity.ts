import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity('product_bundle_items')
export class ProductBundleItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Product, (p) => p.bundleItems, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'bundleId' })
    bundle: Product;

    @Column()
    bundleId: string;

    @ManyToOne(() => Product)
    @JoinColumn({ name: 'productId' })
    product: Product;

    @Column()
    productId: string;

    @Column('int')
    quantity: number;
}
