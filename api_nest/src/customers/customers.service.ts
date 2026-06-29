import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class CustomersService {
    constructor(
        @InjectRepository(Customer)
        private customersRepository: Repository<Customer>,
    ) { }

    async create(data: Partial<Customer>): Promise<Customer> {
        const { email, storeId, password } = data;

        const existing = await this.customersRepository.findOne({ where: { email, storeId } });
        if (existing) {
            throw new BadRequestException('Customer with this email already exists in this store');
        }

        const newCustomer = this.customersRepository.create(data);

        if (password) {
            const salt = await bcrypt.genSalt();
            newCustomer.password = await bcrypt.hash(password, salt);
        }

        return this.customersRepository.save(newCustomer);
    }

    async findOneByEmail(email: string, storeId: string): Promise<Customer | undefined> {
        return this.customersRepository.findOne({ where: { email, storeId } });
    }

    async findOneById(id: string, storeId: string): Promise<Customer | undefined> {
        return this.customersRepository.findOne({ where: { id, storeId } });
    }

    async findAllForStore(storeId: string): Promise<Customer[]> {
        return this.customersRepository.find({
            where: { storeId },
            order: { createdAt: 'DESC' }
        });
    }
    
    async update(id: string, storeId: string, data: Partial<Customer>): Promise<Customer> {
        const customer = await this.findOneById(id, storeId);
        if (!customer) {
            throw new NotFoundException('Customer not found');
        }
        
        Object.assign(customer, data);
        return this.customersRepository.save(customer);
    }
}
