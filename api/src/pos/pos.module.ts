import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PosController } from './pos.controller';
import { PosService } from './pos.service';
import { Product } from '../catalog/entities/product.entity';
import { Courier } from '../sales/entities/courier.entity';
import { Order } from '../sales/entities/order.entity';
import { Admin } from '../admin/entities/admin.entity';
import { Customer } from '../customers/entities/customer.entity';
import { SalesModule } from '../sales/sales.module';
import { CustomersModule } from '../customers/customers.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Product, Courier, Order, Admin, Customer]),
        SalesModule,
        CustomersModule,
    ],
    controllers: [PosController],
    providers: [PosService],
    exports: [PosService],
})
export class PosModule { }
