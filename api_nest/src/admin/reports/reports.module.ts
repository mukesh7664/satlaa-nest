import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { Product } from '../../catalog/entities/product.entity';
import { Order } from '../../sales/entities/order.entity';
import { OrderItem } from '../../sales/entities/order-item.entity';
import { ReturnRequest } from '../../sales/entities/return-request.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { Invoice } from '../../sales/entities/invoice.entity';
import { Inquiry } from '../../communication/entities/inquiry.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      Order,
      OrderItem,
      ReturnRequest,
      Customer,
      Invoice,
      Inquiry,
    ]),
  ],
  controllers: [ReportsController, AnalyticsController],
  providers: [ReportsService, AnalyticsService],
})
export class ReportsModule {}

