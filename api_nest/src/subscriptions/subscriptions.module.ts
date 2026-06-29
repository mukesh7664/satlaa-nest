import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { StoreSubscription } from './entities/store-subscription.entity';
import { StoreInvoice } from './entities/store-invoice.entity';
import { PaymentAttempt } from '../payments/entities/payment-attempt.entity';
import { Payment } from '../payments/entities/payment.entity';
import { PlansModule } from '../plans/plans.module';
import { Admin } from '../admin/entities/admin.entity';
import { TenantModule } from '../tenant/tenant.module';
import { PlanLimitsService } from './plan-limits.service';
import { Product } from '../catalog/entities/product.entity';
import { Page } from '../cms/entities/page.entity';
import { StoreDomain } from '../stores/entities/store-domain.entity';
import { Media } from '../cms/entities/media.entity';
import { PaymentsModule } from '../payments/payments.module';
import { CmsModule } from '../cms/cms.module';
import { SubscriptionCoupon } from './entities/subscription-coupon.entity';
import { SubscriptionCouponService } from './subscription-coupon.service';
import { SubscriptionCouponController } from './subscription-coupon.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            StoreSubscription,
            StoreInvoice,
            PaymentAttempt,
            Payment,
            Admin,
            Product,
            Page,
            StoreDomain,
            Media,
            SubscriptionCoupon,
        ]),
        PlansModule,
        TenantModule,
        forwardRef(() => PaymentsModule),
        forwardRef(() => CmsModule),
    ],
    providers: [SubscriptionsService, PlanLimitsService, SubscriptionCouponService],
    controllers: [SubscriptionsController, SubscriptionCouponController],
    exports: [SubscriptionsService, PlanLimitsService, SubscriptionCouponService, TypeOrmModule],
})
export class SubscriptionsModule { }
