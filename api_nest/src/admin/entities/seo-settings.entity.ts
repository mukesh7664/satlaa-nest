import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Store } from '../../stores/entities/store.entity';

@Entity('seo_settings')
export class SeoSettings {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('simple-array', { nullable: true })
    keywords: string[];

    @Column({ nullable: true })
    googleAnalyticsId: string;

    @Column({ nullable: true })
    googleTagManagerId: string;

    @Column({ nullable: true })
    facebookPixelId: string;

    @Column({ nullable: true })
    metaImage: string;

    @Column('jsonb', { nullable: true })
    customScripts: any; // { headerScripts: string, footerScripts: string }

    // Tenant Relation
    @ManyToOne(() => Store, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'storeId' })
    store: Store;

    @Column({ nullable: true })
    storeId: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
