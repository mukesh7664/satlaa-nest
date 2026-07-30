import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CmsController } from './cms.controller';
import { CmsService } from './cms.service';
import { S3Service } from './s3.service';
import { UploadController } from './upload.controller';
import { Page } from './entities/page.entity';
import { PageSection } from './entities/page-section.entity';
import { Section } from './entities/section.entity';
import { Media } from './entities/media.entity';
import { HeaderSection } from './entities/header-section.entity';
import { FooterSection } from './entities/footer-section.entity';
import { GeneralSettings } from '../admin/entities/general-settings.entity';
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
        ]),
        AdminModule,
    ],
    providers: [CmsService, S3Service],
    controllers: [CmsController, UploadController],
    exports: [TypeOrmModule, CmsService, S3Service],
})
export class CmsModule { }
