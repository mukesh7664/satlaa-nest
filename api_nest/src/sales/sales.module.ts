import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Discount } from './entities/discount.entity';
import { Invoice } from './entities/invoice.entity';
import { Estimate } from './entities/estimate.entity';
import { Store } from '../stores/entities/store.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Product } from '../catalog/entities/product.entity';
import { CartService } from './cart.service';
import { OrderService } from './order.service';
import { ReturnRequestService } from './return-request.service';
import { DiscountService } from './discount.service';
import { InvoiceService } from './invoice.service';
import { PaymentService } from './payment.service';
import { CheckoutService } from './checkout.service';
import { EstimateService } from './estimate.service';
import { CartController } from './cart.controller';
import { OrderController } from './order.controller';
import { InvoiceController } from './invoice.controller';
import { PaymentController } from './payment.controller';
import { ReturnRequestController } from './return-request.controller';
import { CheckoutController } from './checkout.controller';
import { DiscountController } from './discount.controller';
import { EstimateController } from './estimate.controller';
import { ShiprocketController } from './shiprocket.controller';
import { ShippingController } from './shipping.controller';
import { CatalogModule } from '../catalog/catalog.module';
import { AdminModule } from '../admin/admin.module';
import { PaymentsModule } from '../payments/payments.module';
import { PdfService } from './pdf.service';
import { ShiprocketService } from './shiprocket.service';
import { CmsModule } from '../cms/cms.module';
import { Shipment } from './entities/shipment.entity';
import { ReturnRequest } from './entities/return-request.entity';
import { GeneralSettings } from '../admin/entities/general-settings.entity';
import { ShippingConfig } from './entities/shipping-config.entity';
import { CryptoService } from '../common/crypto.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Cart,
            CartItem,
            Order,
            OrderItem,
            Discount,
            Invoice,
            Estimate,
            Store,
            Customer,
            Shipment,
            GeneralSettings,
            Product,
            ReturnRequest,
            ShippingConfig,
        ]),
        CatalogModule,
        AdminModule,
        PaymentsModule,
        CmsModule,
    ],

    controllers: [
        CartController,
        OrderController,
        InvoiceController,
        PaymentController,
        CheckoutController,
        DiscountController,
        EstimateController,
        ShiprocketController,
        ShippingController,
        ReturnRequestController,
    ],
    providers: [
        CartService,
        OrderService,
        DiscountService,
        InvoiceService,
        PaymentService,
        CheckoutService,
        EstimateService,
        PdfService,
        ShiprocketService,
        ReturnRequestService,
        CryptoService,
    ],
    exports: [
        OrderService,
        CartService,
        DiscountService,
        InvoiceService,
        PaymentService,
        CheckoutService,
        EstimateService,
        PdfService,
        ReturnRequestService,
    ],
})
export class SalesModule { }
