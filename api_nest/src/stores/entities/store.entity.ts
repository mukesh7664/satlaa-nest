import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { StoreDomain } from './store-domain.entity';
import { Customer } from '../../customers/entities/customer.entity';

@Entity('stores')
export class Store {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    owner_id: string;

    @Column({ unique: true, nullable: true })
    slug: string;

    @OneToMany(() => StoreDomain, domain => domain.store)
    domains: StoreDomain[];

    @OneToMany(() => Customer, customer => customer.store)
    customers: Customer[];

    @Column({ default: 'active' })
    status: string;

    @Column({ default: false })
    showInMarketplace: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
