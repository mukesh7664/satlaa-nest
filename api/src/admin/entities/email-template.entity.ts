import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('email_templates')
export class EmailTemplate {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ nullable: true })
    @Index()
    key: string; // e.g., 'welcome', 'order_confirmation'

    @Column()
    subject: string;

    @Column('text')
    htmlContent: string;

    @Column('text', { nullable: true })
    plainTextContent: string;

    @Column('simple-array', { nullable: true })
    variables: string[]; // List of available variables for preview

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
