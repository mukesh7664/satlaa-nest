import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum InquiryType {
    LEAD = 'lead',
    INQUIRY = 'inquiry',
    CONTACT_US = 'contact_us',
    QUOTE = 'quote',
}

export enum InquiryStatus {
    PENDING = 'pending',
    REPLIED = 'replied',
    CONVERTED = 'converted',
}

@Entity('inquiries')
export class Inquiry {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'enum',
        enum: InquiryType,
        default: InquiryType.INQUIRY,
    })
    @Index()
    type: InquiryType;

    // Contact Information
    @Column()
    name: string;

    @Column()
    @Index()
    email: string;

    @Column({ nullable: true })
    @Index()
    phone: string;

    // Inquiry Details
    @Column({ nullable: true })
    subject: string;

    @Column('text')
    message: string;

    // Extra Data (JSONB)
    @Column('jsonb', { nullable: true })
    metadata: Record<string, any>;

    // Status
    @Column({
        type: 'enum',
        enum: InquiryStatus,
        default: InquiryStatus.PENDING,
    })
    @Index()
    status: InquiryStatus;

    @CreateDateColumn()
    @Index()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
