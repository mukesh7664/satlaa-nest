import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index, Relation } from 'typeorm';
import { Product } from '../../catalog/entities/product.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { Store } from '../../stores/entities/store.entity';

@Entity('wishlists')
@Index(['storeId', 'userId', 'productId'], { unique: true })
export class Wishlist {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Store, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'storeId' })
    store: Store;

    @Column({ nullable: true })
    storeId: string;

    @ManyToOne(() => Customer, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    customer: Customer;

    @Column({ nullable: true })
    userId: string;

    @Column({ nullable: true })
    productId: string;

    @ManyToOne(() => Product)
    @JoinColumn({ name: 'productId' })
    product: Relation<Product>;

    @CreateDateColumn()
    createdAt: Date;
}

