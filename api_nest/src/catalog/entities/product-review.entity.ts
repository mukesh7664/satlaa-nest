import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Product } from './product.entity';

@Entity('product_reviews')
@Index(['productId'])
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

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
