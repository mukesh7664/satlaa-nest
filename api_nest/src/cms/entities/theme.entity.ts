import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('themes')
export class Theme {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ nullable: true })
    previewImage: string;

    @Column('jsonb', { default: {} })
    content: {
        pages?: any[]; // For multi-page templates
        sections?: any[]; // Legacy or single-page fallback
        header?: any[];
        footer?: any[];
        settings?: {
            themeColors?: any;
            fonts?: any;
        };
    };

    @Column({ default: true })
    isActive: boolean;

    @Column({ default: 'ecommerce' })
    category: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
