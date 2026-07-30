import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Customer } from './customer.entity';

export enum AddressType {
    SHIPPING = 'shipping',
    BILLING = 'billing',
    BOTH = 'both',
}

@Entity('addresses')
export class Address {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    fullName: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ nullable: true })
    email: string;

    @Column({ nullable: true })
    street: string;

    @Column({ nullable: true })
    city: string;

    @Column({ nullable: true })
    state: string;

    @Column({ nullable: true })
    country: string;

    @Column({ nullable: true })
    pincode: string;

    @Column({ nullable: true })
    landmark: string;

    @Column({ default: false })
    isDefault: boolean;

    @Column({
        type: 'enum',
        enum: AddressType,
        default: AddressType.BOTH,
    })
    type: AddressType;

    @ManyToOne(() => Customer, customer => customer.addresses, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'customerId' })
    customer: Customer;

    @Column({ name: 'customerId' })
    customerId: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
