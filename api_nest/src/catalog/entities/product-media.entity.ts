import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, AfterLoad } from 'typeorm';
import { getFullS3Url } from '../../common/utils/s3-url.util';
import { Product } from './product.entity';

@Entity('product_media')
export class ProductMedia {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    key: string;

    url: string; // Dynamically generated property

    @AfterLoad()
    populateUrl() {
        this.url = getFullS3Url(this.key);
    }

    @Column({ name: 'media_type', default: 'image' }) // image, video
    media_type: string;

    @Column({ name: 'sort_order', default: 0 })
    sort_order: number;

    @Column({ name: 'is_main', default: false })
    is_main: boolean;

    @Column({ nullable: true })
    altText: string;

    @ManyToOne(() => Product, (product) => product.media, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'productId' })
    product: Product;

    @Column()
    productId: string;

    @Column({ nullable: true })
    variantId: string;

    @CreateDateColumn()
    createdAt: Date;
}
