import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Category } from './category.entity';
import { CollectionProduct } from './collection-product.entity';
import { Collection } from './collection.entity';
import { ProductMedia } from './product-media.entity';
import { ProductBundleItem } from './product-bundle-item.entity';
import { ColumnNumericTransformer } from '../../common/transformers/numeric.transformer';

@Entity('products')
@Index(['slug'], { unique: true })
@Index(['sku'], { unique: true, where: '"sku" IS NOT NULL' })
export class Product {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column()
    @Index()
    slug: string;

    @Column({ nullable: true })
    sku: string;

    @Column({ nullable: true })
    hsn_code: string;

    @Column('text', { nullable: true })
    description: string;

    @Column('decimal', { precision: 10, scale: 2, nullable: true, transformer: new ColumnNumericTransformer() })
    price: number;

    @Column('decimal', { precision: 10, scale: 2, default: 0, transformer: new ColumnNumericTransformer() })
    costPrice: number;

    @Column('decimal', { precision: 5, scale: 2, default: 0, transformer: new ColumnNumericTransformer() })
    tax_rate: number;

    // Collections (Junction Table)
    @OneToMany(() => CollectionProduct, (cp) => cp.product)
    productCollections: CollectionProduct[];

    @OneToMany(() => ProductMedia, (media) => media.product, { cascade: true })
    media: ProductMedia[];

    @ManyToOne(() => Product, (product) => product.children, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'parentId' })
    parent: Product;

    @Column({ nullable: true })
    parentId: string;

    @OneToMany(() => Product, (product) => product.parent)
    children: Product[];

    @Column({ default: false })
    is_variant: boolean;

    @Column({ default: true })
    isActive: boolean;

    @Column({ default: false })
    isFeatured: boolean;

    @Column({ default: false })
    showInMarketplace: boolean;

    // Category Relation
    @ManyToOne(() => Category, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'categoryId' })
    category: Category;

    @Column({ nullable: true })
    categoryId: string;

    @Column({ nullable: true })
    stock: number;

    @Column('jsonb', { nullable: true })
    tags: string[];

    @Column('jsonb', { nullable: true })
    flags: string[];

    @Column('jsonb', { default: {} })
    attributes: Record<string, any>;

    @Column('jsonb', { nullable: true })
    manualCurrencyPrices: Record<string, number>;

    @Column('jsonb', { nullable: true })
    product_details: any;

    @Column('jsonb', { nullable: true })
    seo_settings: Record<string, any>;

    @Column({ default: false })
    isBundle: boolean;

    @Column({ nullable: true })
    is_returnable: boolean;

    @Column({ nullable: true })
    is_replaceable: boolean;

    @Column({ nullable: true })
    return_window_days: number;

    @Column({ default: 'online' })
    purchaseType: string;

    @OneToMany(() => ProductBundleItem, (pbi) => pbi.bundle, { cascade: true })
    bundleItems: ProductBundleItem[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
