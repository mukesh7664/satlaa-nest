import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Page } from './page.entity';
import { Section } from './section.entity';

@Entity('page_sections')
export class PageSection {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    pageId: string;

    @ManyToOne(() => Page, (page) => page.pageSections, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'pageId' })
    page: Page;

    @Column()
    sectionId: string;

    @ManyToOne(() => Section, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'sectionId' })
    section: Section;

    @Column({ default: 0 })
    position: number;

    @Column('jsonb', { default: {} })
    settings: any;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
