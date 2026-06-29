import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('documentations')
export class Documentation {
    @ApiProperty({ description: 'The unique identifier of the documentation' })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ description: 'The title of the documentation' })
    @Column({ length: 255 })
    title: string;

    @ApiProperty({ description: 'The unique URL slug' })
    @Column({ unique: true, length: 255 })
    slug: string;

    @ApiProperty({ description: 'The HTML content of the documentation' })
    @Column({ type: 'text' })
    content: string;

    @ApiProperty({ description: 'The category for grouping (e.g., Getting Started)' })
    @Column({ length: 255 })
    category: string;

    @ApiProperty({ description: 'The section/subcategory title (optional)', required: false })
    @Column({ length: 255, nullable: true })
    sectionTitle: string;

    @ApiProperty({ description: 'Order index for sorting within category', default: 0 })
    @Column({ default: 0 })
    order: number;

    @ApiProperty({ description: 'Whether the document is published and visible', default: true })
    @Column({ default: true })
    isPublished: boolean;

    @ApiProperty({ description: 'Creation timestamp' })
    @CreateDateColumn()
    createdAt: Date;

    @ApiProperty({ description: 'Last update timestamp' })
    @UpdateDateColumn()
    updatedAt: Date;
}
