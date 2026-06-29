import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Store } from '../../stores/entities/store.entity';

@Entity('email_settings')
export class EmailSettings {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'store_id', nullable: true })
    storeId: string;

    @ManyToOne(() => Store, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'store_id' })
    store: Store;

    @Column({ name: 'smtp_host', nullable: true })
    smtpHost: string;

    @Column({ name: 'smtp_port', type: 'int', nullable: true })
    smtpPort: number;

    @Column({ name: 'smtp_user', nullable: true })
    smtpUser: string;

    @Column({ name: 'smtp_password', nullable: true })
    smtpPassword: string;

    @Column({ name: 'from_email', nullable: true })
    fromEmail: string;

    @Column({ name: 'from_name', nullable: true })
    fromName: string;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
