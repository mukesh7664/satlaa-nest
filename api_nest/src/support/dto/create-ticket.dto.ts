import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TicketPriority } from '../entities/support-ticket.entity';

export class CreateTicketDto {
    @ApiProperty({ description: 'Subject of the ticket' })
    @IsString()
    @IsNotEmpty()
    subject: string;

    @ApiProperty({ description: 'Detailed explanation/description' })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({ description: 'Category of the ticket' })
    @IsString()
    @IsNotEmpty()
    category: string;

    @ApiPropertyOptional({ description: 'Ticket Priority', enum: TicketPriority, default: TicketPriority.MEDIUM })
    @IsEnum(TicketPriority)
    @IsOptional()
    priority?: TicketPriority;
}
