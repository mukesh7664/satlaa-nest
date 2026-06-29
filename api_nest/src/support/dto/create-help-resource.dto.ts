import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HelpResourceType } from '../entities/help-resource.entity';

export class CreateHelpResourceDto {
    @ApiProperty({ description: 'Resource Type', enum: HelpResourceType })
    @IsEnum(HelpResourceType)
    @IsNotEmpty()
    type: HelpResourceType;

    @ApiProperty({ description: 'Title or Question of the resource' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({ description: 'Content/Answer/Description of the resource' })
    @IsString()
    @IsNotEmpty()
    content: string;

    @ApiPropertyOptional({ description: 'Video embed link' })
    @IsString()
    @IsOptional()
    videoUrl?: string;

    @ApiPropertyOptional({ description: 'Video thumbnail image link' })
    @IsString()
    @IsOptional()
    thumbnailUrl?: string;

    @ApiProperty({ description: 'Resource Category' })
    @IsString()
    @IsNotEmpty()
    category: string;

    @ApiPropertyOptional({ description: 'Published status', default: true })
    @IsBoolean()
    @IsOptional()
    isPublished?: boolean;

    @ApiPropertyOptional({ description: 'Sorting order', default: 0 })
    @IsNumber()
    @IsOptional()
    order?: number;
}
