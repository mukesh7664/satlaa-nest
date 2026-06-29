import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Store } from '../../stores/entities/store.entity';
import { Plan } from '../../plans/plan.entity';

@Entity('store_subscriptions')
export class StoreSubscription {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Store, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'store_id' })
    store: Store;

    @Column()
    store_id: string;

    @ManyToOne(() => Plan)
    @JoinColumn({ name: 'plan_id' })
    plan: Plan;

    @Column()
    plan_id: string;

    @Column({ nullable: true })
    payment_id: string;

    @Column({ type: 'timestamp' })
    start_date: Date;

    @Column({ type: 'timestamp' })
    expiry_date: Date;

    @Column({ default: 'active' })
    status: string;

    @Column({ nullable: true })
    pending_plan_id: string;

    @Column({ nullable: true })
    pending_billing_cycle: string;

    @CreateDateColumn()
    created_at: Date;
}
