import { IsString, IsOptional, IsArray, IsIn, IsDateString, IsObject } from 'class-validator';

export class CreateBlogPostDto {
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    slug?: string;

    @IsOptional()
    @IsString()
    excerpt?: string;

    @IsOptional()
    @IsString()
    content?: string;

    @IsOptional()
    @IsString()
    coverImage?: string;

    @IsOptional()
    @IsString()
    coverImageAlt?: string;

    @IsOptional()
    @IsString()
    authorName?: string;

    @IsOptional()
    @IsIn(['draft', 'published'])
    status?: 'draft' | 'published';

    @IsOptional()
    @IsDateString()
    publishedAt?: string;

    @IsOptional()
    @IsObject()
    seo?: Record<string, any>;

    @IsOptional()
    @IsArray()
    categoryIds?: string[];

    @IsOptional()
    @IsArray()
    tagIds?: string[];
}
