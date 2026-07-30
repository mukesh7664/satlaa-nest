import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Collection } from './collection.entity';
import { Product } from './product.entity';

@Entity('collection_products')
@Index(['collectionId', 'productId'], { unique: true })
export class CollectionProduct {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Collection, (collection) => collection.collectionProducts, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'collection_id' })
    collection: Collection;

    @Column({ name: 'collection_id' })
    collectionId: string;

    @ManyToOne(() => Product, (product) => product.productCollections, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'product_id' })
    product: Product;

    @Column({ name: 'product_id' })
    productId: string;

    @Column({ name: 'sort_order', type: 'integer', default: 0 })
    sortOrder: number;
}
