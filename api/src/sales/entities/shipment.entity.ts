import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Order } from './order.entity';

@Entity('shipments')
export class Shipment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  shiprocketOrderId: string; // Shiprocket internal ID

  @Column({ nullable: true })
  shipmentId: string; // Most important for tracking/labels

  @Column({ nullable: true })
  awbCode: string; // Tracking number

  @Column({ nullable: true })
  courierName: string;

  @Column({ nullable: true })
  labelUrl: string;

  @Column({ default: 'MAPPED' })
  status: string;

  @OneToOne(() => Order, (order) => order.shipment)
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column()
  orderId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
