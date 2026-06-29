import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailService } from './email.service';
import { EmailTemplate } from '../admin/entities/email-template.entity';
import { EmailSettings } from '../admin/entities/email-settings.entity';
import { Store } from '../stores/entities/store.entity';
import { CryptoService } from '../common/crypto.service';

@Global()
@Module({
    imports: [TypeOrmModule.forFeature([EmailTemplate, EmailSettings, Store])],
    providers: [EmailService, CryptoService],
    exports: [EmailService, CryptoService],
})
export class NotificationsModule { }
