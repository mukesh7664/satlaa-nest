import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn, AfterLoad } from 'typeorm';
import { getFullS3Url } from '../../common/utils/s3-url.util';
import { Store } from '../../stores/entities/store.entity';

@Entity('sections')
@Index(['type'], { unique: true })
export class Section {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string; // Internal name for admin usage

    @Column()
    @Index()
    type: string; // e.g., 'Hero', 'Testimonials', 'UnlockPotential', 'Banner'


    @Column('jsonb', { default: {} })
    data: any; // Flexible data structure for the section content

    @Column('simple-array', { nullable: true })
    @Index()
    tags: string[]; // e.g., 'homepage', 'brand', 'service', 'campaign-xy'

    @Column({ nullable: true })
    thumbnailKey: string; // Optional preview image for the admin panel

    thumbnail: string; // Dynamically hydrated URL

    @AfterLoad()
    populateUrl() {
        if (this.thumbnailKey) {
            this.thumbnail = getFullS3Url(this.thumbnailKey);
        }
    }

    @Column({ default: true })
    @Index()
    isActive: boolean;

    @Column({
        type: 'enum',
        enum: ['header', 'footer', 'section', 'cart', 'checkout', 'product'],
        default: 'section'
    })
    @Index()
    category: string;

    @Column({
        type: 'varchar',
        length: 50,
        default: 'both'
    })
    @Index()
    scope: string; // 'page-builder', 'ecommerce', 'both'

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
