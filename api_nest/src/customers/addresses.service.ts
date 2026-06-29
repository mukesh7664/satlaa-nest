import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './entities/address.entity';

import { Customer } from './entities/customer.entity';

@Injectable()
export class AddressesService implements OnModuleInit {
    constructor(
        @InjectRepository(Address)
        private addressRepository: Repository<Address>,
        @InjectRepository(Customer)
        private customerRepository: Repository<Customer>,
    ) { }

    async onModuleInit() {
        await this.migrateLegacyData();
    }

    private async migrateLegacyData() {
        try {
            const queryRunner = this.addressRepository.manager.connection.createQueryRunner();
            await queryRunner.connect();
            
            const table = await queryRunner.getTable('addresses');
            if (!table) {
                await queryRunner.release();
                return;
            }

            const legacyMappings = [
                { old: 'addressLine1', new: 'street' },
                { old: 'addressLine2', new: 'landmark' },
                { old: 'pinCode', new: 'pincode' },
                { old: 'name', new: 'fullName' }
            ];

            for (const mapping of legacyMappings) {
                if (table.findColumnByName(mapping.old)) {
                    // Copy data
                    await queryRunner.query(`
                        UPDATE addresses 
                        SET "${mapping.new}" = "${mapping.old}" 
                        WHERE "${mapping.new}" IS NULL AND "${mapping.old}" IS NOT NULL
                    `);
                    // Drop legacy column
                    await queryRunner.dropColumn('addresses', mapping.old);
                }
            }
            
            await queryRunner.release();
        } catch (error) {
            console.warn('Migration warning (expected if columns already cleaned):', error.message);
        }
    }

    async findAll(customerId: string): Promise<Address[]> {
        return this.addressRepository.find({
            where: { customerId },
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string, customerId: string): Promise<Address> {
        const address = await this.addressRepository.findOne({
            where: { id, customerId },
        });
        if (!address) {
            throw new NotFoundException('Address not found');
        }
        return address;
    }

    async create(customerId: string, data: Partial<Address>): Promise<Address> {
        const addressCount = await this.addressRepository.count({ where: { customerId } });
        
        // Auto-populate email if missing
        if (!data.email) {
            const customer = await this.customerRepository.findOne({ where: { id: customerId } });
            if (customer) {
                data.email = customer.email;
            }
        }

        const address = this.addressRepository.create({
            ...data,
            customerId,
            isDefault: addressCount === 0 ? true : data.isDefault || false,
        });

        if (address.isDefault) {
            await this.clearDefaults(customerId);
        }

        return this.addressRepository.save(address);
    }

    async update(id: string, customerId: string, data: Partial<Address>): Promise<Address> {
        const address = await this.findOne(id, customerId);

        if (data.isDefault && !address.isDefault) {
            await this.clearDefaults(customerId);
        }

        Object.assign(address, data);
        return this.addressRepository.save(address);
    }

    async delete(id: string, customerId: string): Promise<void> {
        const address = await this.findOne(id, customerId);
        await this.addressRepository.remove(address);

        // If we deleted the default address, set another one as default if exists
        if (address.isDefault) {
            const nextAddress = await this.addressRepository.findOne({
                where: { customerId },
                order: { createdAt: 'DESC' },
            });
            if (nextAddress) {
                nextAddress.isDefault = true;
                await this.addressRepository.save(nextAddress);
            }
        }
    }

    async setDefault(id: string, customerId: string): Promise<Address> {
        const address = await this.findOne(id, customerId);
        
        await this.clearDefaults(customerId);
        
        address.isDefault = true;
        return this.addressRepository.save(address);
    }

    private async clearDefaults(customerId: string): Promise<void> {
        await this.addressRepository.update(
            { customerId, isDefault: true },
            { isDefault: false },
        );
    }
}
