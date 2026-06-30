import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('email_settings')
export class EmailSettings {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'smtp_host', nullable: true })
    smtpHost: string;

    @Column({ name: 'smtp_port', type: 'int', nullable: true })
    smtpPort: number;

    @Column({ name: 'smtp_user', nullable: true })
    smtpUser: string;

    @Column({ name: 'smtp_password', nullable: true })
    smtpPassword: string;

    @Column({ name: 'from_email', nullable: true })
    fromEmail: string;

    @Column({ name: 'from_name', nullable: true })
    fromName: string;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
