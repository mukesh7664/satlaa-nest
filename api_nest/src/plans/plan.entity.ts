import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('plans')
export class Plan {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    name: string;

    @Column({ type: 'varchar', nullable: true })
    category: 'page_builder' | 'ecommerce';

    @Column('numeric', { precision: 10, scale: 2, nullable: true, name: 'monthly_price' })
    monthlyPrice: number;

    @Column('numeric', { precision: 10, scale: 2, nullable: true, name: 'yearly_price' })
    yearlyPrice: number;

    @Column({ type: 'int', default: 0, name: 'page_limit' })
    pageLimit: number;

    @Column({ type: 'int', default: 0, name: 'product_limit' })
    productLimit: number;

    @Column({ type: 'int', default: 500, name: 'storage_mb' })
    storageMb: number;

    @Column({ type: 'int', default: 5, name: 'admin_limit' })
    adminLimit: number;

    @Column({ type: 'int', default: 0, name: 'custom_domain_limit' })
    customDomainLimit: number;

    @Column('jsonb', { nullable: true })
    features: any;

    @Column('jsonb', { nullable: true })
    allowedPages: string[];

    @Column({ default: true, name: 'is_active' })
    isActive: boolean;

    @Column({ default: 0 })
    trial_days: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
