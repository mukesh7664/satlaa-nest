import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class AddMessageDto {
    @IsNotEmpty()
    @IsString()
    message: string;

    @IsOptional()
    attachments?: Array<{
        fileName: string;
        fileUrl: string;
        fileType: string;
        fileSize: number;
    }>;

    @IsOptional()
    @IsBoolean()
    isInternal?: boolean;
}
