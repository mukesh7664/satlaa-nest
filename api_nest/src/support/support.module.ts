import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HelpResource } from './entities/help-resource.entity';
import { SupportTicket } from './entities/support-ticket.entity';
import { TicketMessage } from './entities/ticket-message.entity';
import { Admin } from '../admin/entities/admin.entity';
import { SupportService } from './support.service';
import { SupportController } from './support.controller';
import { SupportAdminController } from './support-admin.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([HelpResource, SupportTicket, TicketMessage, Admin]),
    ],
    controllers: [SupportController, SupportAdminController],
    providers: [SupportService],
    exports: [SupportService],
})
export class SupportModule {}
