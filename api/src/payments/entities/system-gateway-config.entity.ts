import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('system_gateway_configs')
export class SystemGatewayConfig {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    provider: string; // e.g., 'razorpay'

    @Column()
    keyId: string;

    @Column()
    keySecret: string;

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
