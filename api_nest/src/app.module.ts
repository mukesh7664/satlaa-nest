import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_FILTER } from '@nestjs/core';
import { SentryGlobalFilter, SentryModule } from '@sentry/nestjs/setup';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CatalogModule } from './catalog/catalog.module';
import { SalesModule } from './sales/sales.module';
import { CommunicationModule } from './communication/communication.module';
import { CmsModule } from './cms/cms.module';
import { AdminModule } from './admin/admin.module';
import { NotificationsModule } from './notifications/notifications.module';
import { TenantModule } from './tenant/tenant.module';
import { PaymentsModule } from './payments/payments.module';
import { CustomersModule } from './customers/customers.module';
import { ReportsModule } from './admin/reports/reports.module';
import { DocumentationModule } from './documentation/documentation.module';
import { CurrencyModule } from './common/currency/currency.module';
import { SupportModule } from './support/support.module';
import { BlogModule } from './blog/blog.module';

@Module({
    imports: [
        SentryModule.forRoot(),
        ScheduleModule.forRoot(),
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT, 10) || 5432,
            username: process.env.DB_USERNAME || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
            database: process.env.DB_DATABASE || 'inospire_nest',
            autoLoadEntities: true,
            synchronize: false,
        }),
        NotificationsModule, // Global — provides EmailService everywhere
        AuthModule,
        CatalogModule,
        SalesModule,
        CommunicationModule,
        CmsModule,
        AdminModule,
        TenantModule,
        PaymentsModule,
        CustomersModule,
        ReportsModule,
        DocumentationModule,
        CurrencyModule,
        SupportModule,
        BlogModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_FILTER,
            useClass: SentryGlobalFilter,
        },
    ],
})
export class AppModule {}
