import { IsEnum, IsNotEmpty, IsOptional, IsString, IsEmail, IsObject } from 'class-validator';
import { InquiryType, InquiryStatus } from '../entities/inquiry.entity';

export class CreateInquiryDto {
    @IsEnum(InquiryType)
    type: InquiryType;

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    subject?: string;

    @IsNotEmpty()
    @IsString()
    message: string;

    @IsOptional()
    @IsObject()
    metadata?: Record<string, any>;

    @IsOptional()
    @IsEnum(InquiryStatus)
    status?: InquiryStatus;
}
