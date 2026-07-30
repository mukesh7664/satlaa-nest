import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDocumentationDto {
    @ApiProperty({ description: 'Title of the documentation' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({ description: 'HTML content' })
    @IsString()
    @IsNotEmpty()
    content: string;

    @ApiProperty({ description: 'Category grouping' })
    @IsString()
    @IsNotEmpty()
    category: string;

    @ApiPropertyOptional({ description: 'Section title' })
    @IsString()
    @IsOptional()
    sectionTitle?: string;

    @ApiPropertyOptional({ description: 'Sorting order', default: 0 })
    @IsNumber()
    @IsOptional()
    order?: number;

    @ApiPropertyOptional({ description: 'Publish status', default: true })
    @IsBoolean()
    @IsOptional()
    isPublished?: boolean;
}
