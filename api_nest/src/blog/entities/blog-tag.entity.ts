import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, Index, JoinColumn } from 'typeorm';
import { Store } from '../../stores/entities/store.entity';

@Entity('blog_tags')
@Index(['storeId', 'slug'], { unique: true })
export class BlogTag {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    @Index()
    slug: string;

    // Tenant Relation
    @ManyToOne(() => Store, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'storeId' })
    store: Store;

    @Column({ nullable: true })
    @Index()
    storeId: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
