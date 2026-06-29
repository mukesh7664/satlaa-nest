import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Admin } from './admin.entity';
import { Store } from '../../stores/entities/store.entity';

@Entity('admin_notifications')
@Index(['adminId', 'isRead', 'createdAt'])
export class AdminNotification {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Admin, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'adminId' })
    admin: Admin;

    @Column({ nullable: true })
    @Index()
    adminId: string; // If null, it's for all admins

    // Tenant Relation
    @ManyToOne(() => Store, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'storeId' })
    store: Store;

    @Column({ nullable: true })
    @Index()
    storeId: string; // If null, it's global or super_admin only

    @Column()
    type: string; // 'new_order', 'low_stock', 'new_user', 'system_error'

    @Column()
    title: string;

    @Column('text')
    message: string;

    @Column({ nullable: true })
    actionUrl: string;

    @Column({ default: false })
    @Index()
    isRead: boolean;

    @Column({ nullable: true })
    readAt: Date;

    @Column({
        type: 'varchar',
        default: 'medium',
    })
    priority: 'low' | 'medium' | 'high' | 'urgent';

    @CreateDateColumn()
    createdAt: Date;
}
