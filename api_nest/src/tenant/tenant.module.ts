import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { TenantService } from './tenant.service';
import { GeneralSettings } from '../admin/entities/general-settings.entity';
import { SeoSettings } from '../admin/entities/seo-settings.entity';
import { EmailTemplate } from '../admin/entities/email-template.entity';
import { EmailSettings } from '../admin/entities/email-settings.entity';
import { Page } from '../cms/entities/page.entity';
import { PageSection } from '../cms/entities/page-section.entity';
import { Section } from '../cms/entities/section.entity';

@Global() // Make it global so we don't need to import TenantModule everywhere
@Module({
    imports: [
        TypeOrmModule.forFeature([
            GeneralSettings,
            SeoSettings,
            EmailTemplate,
            EmailSettings,
            Page,
            PageSection,
            Section,
        ]),
        ScheduleModule,
    ],
    providers: [TenantService],
    exports: [TenantService], // Export so other modules can use it if needed manually
})
export class TenantModule { }
