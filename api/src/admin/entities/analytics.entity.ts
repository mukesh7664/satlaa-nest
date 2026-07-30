import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('analytics')
@Index(['type', 'event', 'createdAt'])
export class Analytics {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    @Index()
    type: string; // 'page_view', 'click', 'search', 'conversion'

    @Column()
    @Index()
    event: string;

    @Column({ nullable: true })
    userId: string;

    @Column({ nullable: true })
    sessionId: string;

    @Column('jsonb', { nullable: true })
    data: any;

    @Column({ nullable: true })
    ipAddress: string;

    @Column({ nullable: true })
    userAgent: string;

    @Column({ nullable: true })
    referer: string;

    @CreateDateColumn()
    createdAt: Date;
}
