import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, BeforeInsert, BeforeUpdate, ManyToOne, JoinColumn, OneToMany, AfterLoad } from 'typeorm';
import { getFullS3Url } from '../../common/utils/s3-url.util';
import { CollectionProduct } from './collection-product.entity';
import { Product } from './product.entity';

export enum CollectionType {
    MANUAL = 'manual',
    AUTOMATIC = 'automatic',
}

export enum CollectionCondition {
    ALL = 'all',
    ANY = 'any',
}

@Entity('collections')
@Index(['slug'], { unique: true })
export class Collection {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 100 })
    name: string;

    @Column()
    @Index()
    slug: string;

    @Column({ length: 500, nullable: true })
    description: string;

    @Column({
        type: 'enum',
        enum: CollectionType,
        default: CollectionType.MANUAL,
    })
    type: CollectionType;

    @OneToMany(() => CollectionProduct, (cp) => cp.collection)
    collectionProducts: CollectionProduct[];

    // Automatic collection - rules
    @Column('jsonb', { nullable: true })
    rules: {
        tags?: string[]; // IDs of tags
        conditions?: CollectionCondition;
    };

    @Column({ nullable: true })
    imageKey: string;

    image: string;

    @Column({ nullable: true })
    iconKey: string;

    icon: string;

    @AfterLoad()
    populateUrls() {
        if (this.imageKey) this.image = getFullS3Url(this.imageKey);
        if (this.iconKey) this.icon = getFullS3Url(this.iconKey);
    }

    @Column({ default: true })
    showInSearchBar: boolean;

    @Column({ default: true })
    showInFilterBar: boolean;

    @Column({ default: true })
    isActive: boolean;

    @Column({ default: 0 })
    sortOrder: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @BeforeInsert()
    @BeforeUpdate()
    generateSlug() {
        if (this.name && !this.slug) {
            this.slug = this.name
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, "")
                .replace(/[\s_-]+/g, "-")
                .replace(/^-+|-+$/g, "");
        }
    }
}
