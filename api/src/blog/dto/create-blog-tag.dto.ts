import { IsString, IsOptional } from 'class-validator';

export class CreateBlogTagDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    slug?: string;
}
