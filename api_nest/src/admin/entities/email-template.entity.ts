import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Store } from '../../stores/entities/store.entity';

@Entity('email_templates')
export class EmailTemplate {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ nullable: true })
    @Index()
    key: string; // e.g., 'welcome', 'order_confirmation'

    @Column()
    subject: string;

    @Column('text')
    htmlContent: string;

    @Column('text', { nullable: true })
    plainTextContent: string;

    @Column('simple-array', { nullable: true })
    variables: string[]; // List of available variables for preview

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    // Tenant Relation
    @ManyToOne(() => Store, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'store_id' })
    store: Store;

    @Column({ name: 'store_id', nullable: true })
    storeId: string;
}
