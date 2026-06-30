import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('store_payment_configs')
export class StorePaymentConfig {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 50, unique: true })
    provider: string; // 'razorpay', 'stripe', etc.

    @Column({ nullable: true })
    keyId: string;

    @Column({ nullable: true })
    keySecret: string; // To be encrypted

    @Column({ nullable: true })
    webhookSecret: string;

    @Column({ default: true })
    isActive: boolean;

    @Column({ default: false })
    isTestMode: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
