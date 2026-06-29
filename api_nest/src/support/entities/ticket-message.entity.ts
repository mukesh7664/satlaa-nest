import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { SupportTicket } from './support-ticket.entity';

@Entity('ticket_messages')
export class TicketMessage {
    @ApiProperty({ description: 'The unique identifier of the message' })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ description: 'The ticket ID this message belongs to' })
    @Column()
    ticketId: string;

    @ManyToOne(() => SupportTicket, (ticket) => ticket.messages, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'ticketId' })
    ticket: SupportTicket;

    @ApiProperty({ description: 'The ID of the admin who sent the message' })
    @Column()
    senderId: string;

    @ApiProperty({ description: 'Role of the sender' })
    @Column()
    senderRole: string;

    @ApiProperty({ description: 'Message content' })
    @Column({ type: 'text' })
    message: string;

    @ApiProperty({ description: 'Message attachments' })
    @Column('simple-array', { nullable: true })
    attachments: string[];

    @CreateDateColumn()
    createdAt: Date;
}
