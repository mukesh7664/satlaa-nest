import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { CustomersService } from '../customers/customers.service';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../notifications/email.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from '../stores/entities/store.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private customersService: CustomersService,
        private jwtService: JwtService,
        private emailService: EmailService,
        @InjectRepository(Store)
        private storeRepository: Repository<Store>,
    ) { }

    async validateCustomer(email: string, pass: string, storeId?: string): Promise<any> {
        if (!storeId) {
            this.logger.warn(`Storefront login attempted for ${email} without storeId`);
            return null;
        }
        const customer = await this.customersService.findOneByEmail(email, storeId);
        if (customer && customer.password && await bcrypt.compare(pass, customer.password)) {
            const { password, ...result } = customer;
            return result;
        }
        return null;
    }

    async login(customer: any) {
        const payload = { email: customer.email, sub: customer.id, customerId: customer.id, role: 'customer', storeId: customer.storeId };
        return {
            token: this.jwtService.sign(payload),
            user: customer,
        };
    }

    async register(customerDto: any, storeId?: string) {
        if (!storeId) {
            throw new UnauthorizedException('Store ID is required for storefront registration.');
        }

        const name = `${customerDto.firstName || ''} ${customerDto.lastName || ''}`.trim() || customerDto.name || 'Unknown';

        let phoneStr = customerDto.phone;
        if (typeof phoneStr === 'object' && phoneStr?.number) {
            phoneStr = phoneStr.number;
        }

        const customer = await this.customersService.create({
            email: customerDto.email,
            password: customerDto.password,
            name,
            phone: phoneStr,
            storeId,
        });

        const payload = { email: customer.email, sub: customer.id, customerId: customer.id, role: 'customer', storeId: customer.storeId };

        // Send welcome email (non-blocking)
        this.storeRepository.findOne({ where: { id: customer.storeId } }).then(store => {
            this.emailService.sendWelcomeEmail(customer.email, customer.name, store).catch(err => {
                this.logger.error('Failed to send welcome email', err);
            });
        });

        return {
            token: this.jwtService.sign(payload),
            user: customer
        }
    }

    async updateProfile(userId: string, storeId: string, data: any) {
        const name = `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.name;
        
        let phone = data.phone;
        if (typeof phone === 'object' && phone?.number) {
            phone = phone.number;
        }

        const updateData: any = {};
        if (name) updateData.name = name;
        if (phone) updateData.phone = phone;

        const updated = await this.customersService.update(userId, storeId, updateData);
        const { password, ...result } = updated;
        return result;
    }

    async changePassword(userId: string, storeId: string, currentPass: string, newPass: string) {
        const customer = await this.customersService.findOneById(userId, storeId);
        if (!customer || !customer.password) {
            throw new UnauthorizedException('Invalid customer session or password not set');
        }

        const isMatch = await bcrypt.compare(currentPass, customer.password);
        if (!isMatch) {
            throw new UnauthorizedException('Current password does not match');
        }

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(newPass, salt);

        await this.customersService.update(userId, storeId, { password: hashedPassword });
        return { success: true, message: 'Password changed successfully' };
    }
}
