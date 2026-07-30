import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { PaymentAttempt } from './entities/payment-attempt.entity';
import { StorePaymentConfig } from './entities/store-payment-config.entity';
import { StorePaymentConfigService } from './store-payment-config.service';
import { StorePaymentConfigController } from './store-payment-config.controller';
import { SystemGatewayConfig } from './entities/system-gateway-config.entity';
import { SystemGatewayConfigService } from './system-gateway-config.service';
import { SystemGatewayConfigController } from './system-gateway-config.controller';
import { AdminModule } from '../admin/admin.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Payment, PaymentAttempt, StorePaymentConfig, SystemGatewayConfig]),
        forwardRef(() => AdminModule),
    ],
    providers: [StorePaymentConfigService, SystemGatewayConfigService],
    controllers: [StorePaymentConfigController, SystemGatewayConfigController],
    exports: [StorePaymentConfigService, SystemGatewayConfigService, TypeOrmModule],
})
export class PaymentsModule { }
