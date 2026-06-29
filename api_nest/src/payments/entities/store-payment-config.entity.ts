import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Store } from '../../stores/entities/store.entity';

@Entity('store_payment_configs')
export class StorePaymentConfig {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    storeId: string;

    @ManyToOne(() => Store)
    @JoinColumn({ name: 'storeId' })
    store: Store;

    @Column({ type: 'varchar', length: 50 })
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
