import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inquiry } from './entities/inquiry.entity';
import { AdminNotification } from '../admin/entities/admin-notification.entity';
import { InquiryService } from './inquiry.service';
import { InquiryController } from './inquiry.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Inquiry,
            AdminNotification,
        ]),
    ],
    providers: [InquiryService],
    controllers: [InquiryController],
    exports: [TypeOrmModule, InquiryService],
})
export class CommunicationModule { }
