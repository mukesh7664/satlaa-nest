import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, OneToMany } from 'typeorm';
import { PageSection } from './page-section.entity';

@Entity('pages')
@Index(['slug'], { unique: true })
export class Page {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column()
    slug: string;

    @Column('text', { nullable: true })
    content: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ nullable: true })
    icon: string;

    @Column({ default: true })
    @Index()
    isPublished: boolean;

    @Column({ default: false })
    @Index()
    is_homepage: boolean;

    @Column({ default: 'custom' })
    template: string;

    @Column({ default: 0 })
    viewCount: number;

    @Column({ default: false })
    showInHeader: boolean;

    @Column({ default: false })
    showInFooter: boolean;

    @Column({ default: 0 })
    sortOrder: number;

    // Relational Sections
    @OneToMany(() => PageSection, (pageSection) => pageSection.page)
    pageSections: PageSection[];

    @Column('jsonb', { nullable: true })
    legacyServiceSections: any;

    @Column('jsonb', { nullable: true })
    legacyStaticSections: any;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
