import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, ManyToMany, JoinTable, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Store } from '../../stores/entities/store.entity';
import { BlogCategory } from './blog-category.entity';
import { BlogTag } from './blog-tag.entity';

export type BlogPostStatus = 'draft' | 'published';

@Entity('blog_posts')
@Index(['storeId', 'slug'], { unique: true })
export class BlogPost {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column()
    @Index()
    slug: string;

    @Column({ type: 'text', nullable: true })
    excerpt: string;

    @Column({ type: 'text', nullable: true })
    content: string;

    @Column({ nullable: true })
    coverImage: string;

    @Column({ nullable: true })
    coverImageAlt: string;

    @Column({ nullable: true })
    authorName: string;

    @Column({ type: 'varchar', default: 'draft' })
    @Index()
    status: BlogPostStatus;

    // Used for scheduling: a post is publicly visible only when
    // status = 'published' AND publishedAt <= now()
    @Column({ type: 'timestamp', nullable: true })
    publishedAt: Date;

    // { metaTitle, metaDescription, ogImage, keywords }
    @Column({ type: 'jsonb', nullable: true })
    seo: Record<string, any>;

    @ManyToMany(() => BlogCategory, { onDelete: 'CASCADE' })
    @JoinTable({ name: 'blog_post_categories' })
    categories: BlogCategory[];

    @ManyToMany(() => BlogTag, { onDelete: 'CASCADE' })
    @JoinTable({ name: 'blog_post_tags' })
    tags: BlogTag[];

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
