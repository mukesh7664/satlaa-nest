import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CmsController } from './cms.controller';
import { CmsService } from './cms.service';
import { ThemeService } from './theme.service';
import { ThemeController } from './theme.controller';
import { S3Service } from './s3.service';
import { UploadController } from './upload.controller';
import { Page } from './entities/page.entity';
import { PageSection } from './entities/page-section.entity';
import { Section } from './entities/section.entity';
import { Media } from './entities/media.entity';
import { HeaderSection } from './entities/header-section.entity';
import { FooterSection } from './entities/footer-section.entity';
import { Theme } from './entities/theme.entity';
import { GeneralSettings } from '../admin/entities/general-settings.entity';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { AdminModule } from '../admin/admin.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Page,
            PageSection,
            Section,
            Media,
            GeneralSettings,
            HeaderSection,
            FooterSection,
            Theme,
        ]),
        forwardRef(() => SubscriptionsModule),
        AdminModule,
    ],
    providers: [CmsService, ThemeService, S3Service],
    controllers: [CmsController, ThemeController, UploadController],
    exports: [TypeOrmModule, CmsService, ThemeService, S3Service],
})
export class CmsModule { }
