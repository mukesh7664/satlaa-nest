import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Store } from '../../stores/entities/store.entity';

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
  FREE_SHIPPING = 'FREE_SHIPPING',
  BOGO = 'BOGO', // Buy X Get Y Free
  BUY_X_GET_Y_PERCENT = 'BUY_X_GET_Y_PERCENT', // Buy X Get Y% off on Zth item
}

export enum ApplyTo {
  ALL_ORDERS = 'ALL_ORDERS',
  SPECIFIC_PRODUCTS = 'SPECIFIC_PRODUCTS',
  SPECIFIC_CATEGORIES = 'SPECIFIC_CATEGORIES',
  CUSTOMER_LOYALTY = 'CUSTOMER_LOYALTY', // Only for old customers
}

@Entity('discounts')
@Index(['code'], { unique: true, where: '"code" IS NOT NULL' })
@Index(['storeId'])
@Index(['is_active'])
@Index(['starts_at', 'ends_at'])
export class Discount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  storeId: string;

  @ManyToOne(() => Store, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'storeId' })
  store: Store;

  @Column()
  name: string;

  @Column({ nullable: true })
  code: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: DiscountType,
  })
  type: DiscountType;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  value: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  min_order_value: number;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  max_discount_cap: number;

  @Column({ type: 'int', nullable: true })
  usage_limit: number;

  @Column({ type: 'int', default: 1 })
  per_user_limit: number;

  @Column({ type: 'int', default: 0 })
  current_usage_count: number;

  @Column({ type: 'int', nullable: true })
  buy_qty: number;

  @Column({ type: 'int', nullable: true })
  get_qty: number;

  @Column({
    type: 'enum',
    enum: ApplyTo,
    default: ApplyTo.ALL_ORDERS,
  })
  apply_to: ApplyTo;

  // For SPECIFIC_PRODUCTS and SPECIFIC_CATEGORIES
  @Column('simple-array', { nullable: true })
  applicable_ids: string[];

  @Column({ type: 'timestamp' })
  starts_at: Date;

  @Column({ type: 'timestamp' })
  ends_at: Date;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
