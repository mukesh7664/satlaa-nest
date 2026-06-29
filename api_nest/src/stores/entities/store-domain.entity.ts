import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Store } from './store.entity';

@Entity('store_domains')
export class StoreDomain {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    @Index()
    store_id: string;

    @ManyToOne(() => Store, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'store_id' })
    store: Store;

    @Column({ unique: true })
    @Index()
    domain: string;

    @Column({ type: 'varchar' }) // enum: 'subdomain', 'custom'
    type: string;

    @Column({ default: false })
    is_primary: boolean;

    @Column({ default: false })
    is_verified: boolean;

    @Column({ default: 'active' })
    status: string;

    @Column({ default: 'none' }) // 'none', 'pending', 'active', 'failed'
    ssl_status: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
