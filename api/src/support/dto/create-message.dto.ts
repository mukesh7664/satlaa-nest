import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMessageDto {
    @ApiProperty({ description: 'The text message content' })
    @IsString()
    @IsNotEmpty()
    message: string;

    @ApiPropertyOptional({ description: 'File/Image attachments URLs' })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    attachments?: string[];
}
