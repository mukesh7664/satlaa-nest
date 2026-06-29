import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum AdminRole {
    SUPER_ADMIN = 'super_admin',
    SUPER_SUB_ADMIN = 'super_sub_admin',
    STORE_ADMIN = 'store_admin',
    STORE_SUB_ADMIN = 'store_sub_admin',
}

@Entity('admins')
export class Admin {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ unique: true })
    @Index()
    email: string;

    @Column()
    password: string;

    @Column({
        type: 'varchar',
        default: AdminRole.STORE_ADMIN,
    })
    @Index()
    role: AdminRole;

    @Column({ nullable: true })
    phone: string;

    @Column({ nullable: true })
    avatar: string;

    @Column('simple-array', { nullable: true })
    permissions: string[];

    @Column('jsonb', {
        default: { language: 'en', timezone: 'UTC', emailNotifications: true }
    })
    preferences: {
        language: string;
        timezone: string;
        emailNotifications: boolean;
    };

    @Column({ nullable: true })
    passwordResetToken: string;

    @Column({ nullable: true })
    passwordResetExpires: Date;

    @Column({ default: 0 })
    passwordResetAttempts: number;

    @Column({ nullable: true })
    storeId: string;

    @Column({ nullable: true })
    @Index()
    parentId: string;

    @Column({ nullable: true })
    adminType: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
