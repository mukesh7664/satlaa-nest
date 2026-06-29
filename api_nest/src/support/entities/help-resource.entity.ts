import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum HelpResourceType {
    FAQ = 'faq',
    VIDEO = 'video',
}

@Entity('help_resources')
export class HelpResource {
    @ApiProperty({ description: 'The unique identifier' })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ description: 'The resource type', enum: HelpResourceType })
    @Column({
        type: 'varchar',
        default: HelpResourceType.FAQ,
    })
    type: HelpResourceType;

    @ApiProperty({ description: 'The title/question of the resource' })
    @Column({ length: 500 })
    title: string;

    @ApiProperty({ description: 'The content/description/answer' })
    @Column({ type: 'text' })
    content: string;

    @ApiProperty({ description: 'The video URL (YouTube, Vimeo, etc.)', required: false })
    @Column({ length: 500, nullable: true })
    videoUrl: string;

    @ApiProperty({ description: 'Thumbnail URL for videos', required: false })
    @Column({ length: 500, nullable: true })
    thumbnailUrl: string;

    @ApiProperty({ description: 'The category grouping' })
    @Column({ length: 255 })
    category: string;

    @ApiProperty({ description: 'Whether the resource is published', default: true })
    @Column({ default: true })
    isPublished: boolean;

    @ApiProperty({ description: 'Order index for sorting', default: 0 })
    @Column({ default: 0 })
    order: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
