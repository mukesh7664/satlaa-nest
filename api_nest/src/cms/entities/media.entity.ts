import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('media')
export class Media {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    @Index()
    name: string;

    @Column({ default: '' })
    alt: string;

    @Column({ unique: true })
    @Index()
    key: string; // S3 key


    @Column({ type: 'bigint' })
    size: number;

    @Column()
    mimeType: string;

    @Column()
    @Index()
    type: string; // 'image' or 'video'

    @Column('simple-array', { nullable: true })
    tags: string[]; // Using simple-array for now, can be changed to relation with Tag entity later

    @Column({ default: false })
    @Index()
    isGlobal: boolean;

    @Column({ default: 'uploads' })
    @Index()
    folder: string;

    @Column({ nullable: true })
    usageType: string; // e.g., 'product_image', 'banner', 'page_content'

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
