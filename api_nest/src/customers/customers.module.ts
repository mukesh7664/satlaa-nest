import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from './entities/customer.entity';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { Address } from './entities/address.entity';
import { AddressesService } from './addresses.service';
import { AddressesController } from './addresses.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Customer, Address])],
    providers: [CustomersService, AddressesService],
    controllers: [CustomersController, AddressesController],
    exports: [CustomersService, AddressesService]
})
export class CustomersModule { }
