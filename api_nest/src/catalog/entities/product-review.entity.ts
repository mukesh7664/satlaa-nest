import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Product } from './product.entity';
import { Store } from '../../stores/entities/store.entity';

@Entity('product_reviews')
@Index(['storeId', 'productId'])
export class ProductReview {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    customerName: string;

    @Column({ nullable: true })
    customerEmail: string;

    @Column('int')
    rating: number;

    @Column('text')
    comment: string;

    @Column({ default: 'pending' }) // 'pending' | 'approved' | 'rejected'
    status: string;

    @ManyToOne(() => Product, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'productId' })
    product: Product;

    @Column()
    productId: string;

    @ManyToOne(() => Store, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'storeId' })
    store: Store;

    @Column()
    storeId: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
