import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Admin } from './admin.entity';
import { Store } from '../../stores/entities/store.entity';

@Entity('audit_logs')
export class AuditLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Admin, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'adminId', referencedColumnName: 'id', foreignKeyConstraintName: 'fk_audit_log_admin_id' })
    admin: Admin;

    @Column({ nullable: true })
    @Index()
    adminId: string;
    
    @Column({ nullable: true })
    adminName: string;

    @ManyToOne(() => Store, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'storeId' })
    store: Store;

    @Column({ nullable: true })
    @Index()
    storeId: string;

    @Column()
    @Index()
    action: string; // e.g., 'CREATE', 'UPDATE', 'DELETE'

    @Column({ nullable: true })
    @Index()
    resourceType: string; // e.g., 'Customer', 'Product'

    @Column({ nullable: true })
    @Index()
    resourceId: string;

    @Column({ nullable: true })
    resourceName: string;

    @Column({ nullable: true })
    actionDescription: string;

    @Column({ default: 'success' })
    status: string;

    @Column('jsonb', { nullable: true })
    changes: any;

    @Column('jsonb', { nullable: true })
    metadata: any;

    @Column({ nullable: true })
    ipAddress: string;

    @Column({ nullable: true })
    userAgent: string;

    @CreateDateColumn()
    @Index()
    createdAt: Date;
}
