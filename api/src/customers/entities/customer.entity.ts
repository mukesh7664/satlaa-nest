import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, OneToMany } from 'typeorm';
import { Address } from './address.entity';

@Entity('customers')
@Index(['email'], { unique: true })
export class Customer {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    email: string;

    @Column({ nullable: true })
    password?: string;

    @Column({ nullable: true })
    phone?: string;

    @Column({ default: true })
    isActive: boolean;

    @OneToMany(() => Address, address => address.customer)
    addresses: Address[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
