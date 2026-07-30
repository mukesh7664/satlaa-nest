import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateCourierDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    company?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

export class UpdateCourierDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    company?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
