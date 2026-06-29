import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AdminAuthService } from './admin-auth.service';
import { AdminAuthController } from './admin-auth.controller';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { PublicSettingsController } from './public-settings.controller';
import { ProductFlagController } from './product-flag.controller';
import { Admin } from './entities/admin.entity';
import { GeneralSettings } from './entities/general-settings.entity';
import { SeoSettings } from './entities/seo-settings.entity';
import { AuditLog } from './entities/audit-log.entity';
import { Tag } from './entities/tag.entity';
import { EmailTemplate } from './entities/email-template.entity';
import { Analytics } from './entities/analytics.entity';
import { AdminNotification } from './entities/admin-notification.entity';
import { ProductFlag } from './entities/product-flag.entity';
import { EmailSettings } from './entities/email-settings.entity';
import { Estimate } from '../sales/entities/estimate.entity';
import { Order } from '../sales/entities/order.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Invoice } from '../sales/entities/invoice.entity';
import { Product } from '../catalog/entities/product.entity';
import { Collection } from '../catalog/entities/collection.entity';
import { Inquiry } from '../communication/entities/inquiry.entity';
import { Store } from '../stores/entities/store.entity';
import { StoreDomain } from '../stores/entities/store-domain.entity';
import { Plan } from '../plans/plan.entity';
import { StoreSubscription } from '../subscriptions/entities/store-subscription.entity';
import { StoreInvoice } from '../subscriptions/entities/store-invoice.entity';
import { Section } from '../cms/entities/section.entity';
import { Page } from '../cms/entities/page.entity';
import { Address } from '../customers/entities/address.entity';
import { Payment } from '../payments/entities/payment.entity';
import { PaymentAttempt } from '../payments/entities/payment-attempt.entity';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { PaymentsModule } from '../payments/payments.module';
import { Media } from '../cms/entities/media.entity';
import { CatalogModule } from '../catalog/catalog.module';

import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { AuditLogInterceptor } from './audit-log.interceptor';
import { AuditLogService } from './audit-log.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Admin,
            GeneralSettings,
            SeoSettings,
            AuditLog,
            Tag,
            EmailTemplate,
            Analytics,
            AdminNotification,
            Order,
            Customer,
            Invoice,
            Product,
            Collection,
            ProductFlag,
            Estimate,
            Store,
            StoreDomain,
            Plan,
            StoreSubscription,
            StoreInvoice,
            Section,
            Page,
            Inquiry,
            Address,
            Payment,
            PaymentAttempt,
            EmailSettings,
            Media,
        ]),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET') || 'mukeshdfd',
                signOptions: { expiresIn: '7d' },
            }),
            inject: [ConfigService],
        }),
        forwardRef(() => SubscriptionsModule),
        forwardRef(() => PaymentsModule),
        forwardRef(() => CatalogModule),
    ],
    providers: [AdminService, AdminAuthService, SettingsService, DashboardService, AuditLogInterceptor, AuditLogService],
    controllers: [AdminController, AdminAuthController, SettingsController, PublicSettingsController, DashboardController, ProductFlagController],
    exports: [TypeOrmModule, AdminService, AdminAuthService, SettingsService, DashboardService, AuditLogService],
})
export class AdminModule { }
