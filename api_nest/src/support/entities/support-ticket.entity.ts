import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { TicketMessage } from './ticket-message.entity';

export enum TicketStatus {
    OPEN = 'open',
    IN_PROGRESS = 'in_progress',
    RESOLVED = 'resolved',
    CLOSED = 'closed',
}

export enum TicketPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    URGENT = 'urgent',
}

@Entity('support_tickets')
export class SupportTicket {
    @ApiProperty({ description: 'The unique identifier of the ticket' })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ description: 'The admin ID who created the ticket' })
    @Column()
    adminId: string;

    @ApiProperty({ description: 'Subject of the support ticket' })
    @Column({ length: 255 })
    subject: string;

    @ApiProperty({ description: 'Initial detailed description' })
    @Column({ type: 'text' })
    description: string;

    @ApiProperty({ description: 'Category (e.g. Billing, Technical, Bug Report)' })
    @Column({ length: 100 })
    category: string;

    @ApiProperty({ description: 'Current status of the ticket', enum: TicketStatus })
    @Column({
        type: 'varchar',
        default: TicketStatus.OPEN,
    })
    @Index()
    status: TicketStatus;

    @ApiProperty({ description: 'Priority level of the ticket', enum: TicketPriority })
    @Column({
        type: 'varchar',
        default: TicketPriority.MEDIUM,
    })
    @Index()
    priority: TicketPriority;

    @OneToMany(() => TicketMessage, (message) => message.ticket)
    messages: TicketMessage[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
