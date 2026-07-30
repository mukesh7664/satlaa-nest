import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Brackets } from 'typeorm';
import { Product } from '../catalog/entities/product.entity';
import { Courier } from '../sales/entities/courier.entity';
import { Order, SaleChannel } from '../sales/entities/order.entity';
import { Admin, AdminRole } from '../admin/entities/admin.entity';
import { Customer } from '../customers/entities/customer.entity';
import { OrderService } from '../sales/order.service';
import { CustomersService } from '../customers/customers.service';
import { CreatePosSaleDto } from './dto/create-pos-sale.dto';
import { CreateCourierDto, UpdateCourierDto } from './dto/courier.dto';

@Injectable()
export class PosService {
    constructor(
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
        @InjectRepository(Courier)
        private courierRepository: Repository<Courier>,
        @InjectRepository(Order)
        private orderRepository: Repository<Order>,
        @InjectRepository(Admin)
        private adminRepository: Repository<Admin>,
        @InjectRepository(Customer)
        private customerRepository: Repository<Customer>,
        private orderService: OrderService,
        private customersService: CustomersService,
    ) { }

    // ---------- Product search (per-variant sellable units) ----------
    async searchProducts(search: string) {
        const term = (search || '').trim();
        const qb = this.productRepository.createQueryBuilder('product')
            .leftJoinAndSelect('product.children', 'children')
            .where('product.isActive = :active', { active: true })
            .andWhere('product.parentId IS NULL');

        if (term.length >= 1) {
            qb.andWhere(new Brackets(w => {
                w.where('product.title ILIKE :s', { s: `%${term}%` })
                    .orWhere('product.sku ILIKE :s', { s: `%${term}%` });
            }));
        }

        const products = await qb.orderBy('product.title', 'ASC').take(30).getMany();

        // Flatten to sellable units: a variable product yields its variants; others yield themselves.
        const units: any[] = [];
        for (const p of products) {
            if (p.children && p.children.length > 0) {
                for (const v of p.children) {
                    if (v.isActive === false) continue;
                    units.push({
                        id: v.id,
                        productId: p.id,
                        variantId: v.id,
                        name: `${p.title} — ${v.title}`,
                        sku: v.sku || p.sku || '',
                        hsn_code: v.hsn_code || p.hsn_code || '',
                        price: Number(v.price ?? p.price ?? 0),
                        tax_rate: Number(v.tax_rate ?? p.tax_rate ?? 0),
                        stock: v.stock,
                        isVariant: true,
                    });
                }
            } else {
                units.push({
                    id: p.id,
                    productId: p.id,
                    variantId: null,
                    name: p.title,
                    sku: p.sku || '',
                    hsn_code: p.hsn_code || '',
                    price: Number(p.price ?? 0),
                    tax_rate: Number(p.tax_rate ?? 0),
                    stock: p.stock,
                    isVariant: false,
                });
            }
        }
        return units;
    }

    // ---------- Customer lookup / walk-in create ----------
    async lookupCustomerByPhone(phone: string) {
        const p = (phone || '').trim();
        if (!p) return null;
        return this.customerRepository.findOne({ where: { phone: p } });
    }

    async createWalkInCustomer(data: { name: string; phone?: string; city?: string; email?: string }) {
        if (!data.name) throw new BadRequestException('Customer name is required');

        // Dedupe walk-ins by phone.
        if (data.phone) {
            const existing = await this.customerRepository.findOne({ where: { phone: data.phone.trim() } });
            if (existing) {
                // Backfill city/name if newly provided.
                let dirty = false;
                if (data.city && !existing.city) { existing.city = data.city; dirty = true; }
                if (data.name && existing.name !== data.name) { existing.name = data.name; dirty = true; }
                if (dirty) await this.customerRepository.save(existing);
                return existing;
            }
        }

        const customer = this.customerRepository.create({
            name: data.name,
            phone: data.phone?.trim() || null,
            city: data.city || null,
            email: data.email?.trim() || null,
            isActive: true,
        });
        return this.customerRepository.save(customer);
    }

    // ---------- POS sale ----------
    async createSale(dto: CreatePosSaleDto, operatorId: string) {
        if (!dto.items || dto.items.length === 0) {
            throw new BadRequestException('At least one item is required');
        }

        if (dto.courierId) {
            const courier = await this.courierRepository.findOne({ where: { id: dto.courierId } });
            if (!courier) throw new BadRequestException('Selected courier not found');
        }

        // Resolve customer: existing id, else dedupe/create walk-in by phone, else anonymous.
        let customerId: string | null = null;
        const snap = { name: undefined as string | undefined, phone: undefined as string | undefined, city: undefined as string | undefined };
        if (dto.customer) {
            if (dto.customer.id) {
                const existing = await this.customerRepository.findOne({ where: { id: dto.customer.id } });
                if (existing) {
                    customerId = existing.id;
                    snap.name = existing.name; snap.phone = existing.phone; snap.city = existing.city;
                }
            }
            if (!customerId && (dto.customer.name || dto.customer.phone)) {
                const created = await this.createWalkInCustomer({
                    name: dto.customer.name || 'Walk-in Customer',
                    phone: dto.customer.phone,
                    city: dto.customer.city,
                    email: dto.customer.email,
                });
                customerId = created.id;
                snap.name = created.name; snap.phone = created.phone; snap.city = created.city;
            } else if (!customerId) {
                snap.name = dto.customer.name; snap.phone = dto.customer.phone; snap.city = dto.customer.city;
            }
        }

        // Minimal address block for order/invoice compatibility.
        const address = {
            fullName: snap.name || 'Walk-in Customer',
            phone: snap.phone || '',
            city: snap.city || '',
        };

        return this.orderService.createPosOrder(
            customerId,
            {
                items: dto.items,
                shippingAddress: address,
                billingAddress: address,
                paymentMethod: dto.paymentMethod,
            } as any,
            {
                saleChannel: dto.saleChannel,
                posOperatorId: operatorId,
                courierId: dto.courierId,
                paymentMethod: dto.paymentMethod,
                customerName: snap.name,
                customerPhone: snap.phone,
                customerCity: snap.city,
            },
        );
    }

    async listSales(filters: { channel?: SaleChannel; operatorId?: string; courierId?: string; from?: string; to?: string }) {
        const qb = this.orderRepository.createQueryBuilder('order')
            .leftJoinAndSelect('order.items', 'items')
            .leftJoinAndSelect('order.courier', 'courier')
            .where('order.orderType = :type', { type: 'pos_sale' })
            .orderBy('order.createdAt', 'DESC');

        if (filters.channel) qb.andWhere('order.saleChannel = :channel', { channel: filters.channel });
        if (filters.operatorId) qb.andWhere('order.posOperatorId = :op', { op: filters.operatorId });
        if (filters.courierId) qb.andWhere('order.courierId = :cid', { cid: filters.courierId });
        if (filters.from && filters.to) {
            qb.andWhere('order.createdAt BETWEEN :from AND :to', { from: filters.from, to: filters.to });
        }

        return qb.take(200).getMany();
    }

    // ---------- Courier CRUD ----------
    async listCouriers(includeInactive = false) {
        const where = includeInactive ? {} : { isActive: true };
        return this.courierRepository.find({ where, order: { name: 'ASC' } });
    }

    async createCourier(dto: CreateCourierDto) {
        const courier = this.courierRepository.create({ ...dto, isActive: dto.isActive ?? true });
        return this.courierRepository.save(courier);
    }

    async updateCourier(id: string, dto: UpdateCourierDto) {
        const courier = await this.courierRepository.findOne({ where: { id } });
        if (!courier) throw new NotFoundException('Courier not found');
        Object.assign(courier, dto);
        return this.courierRepository.save(courier);
    }

    async deleteCourier(id: string) {
        const courier = await this.courierRepository.findOne({ where: { id } });
        if (!courier) throw new NotFoundException('Courier not found');
        // Soft-delete so historical order attribution (FK) is preserved.
        courier.isActive = false;
        await this.courierRepository.save(courier);
        return { success: true };
    }

    // ---------- Reports ----------
    private dateRange(from?: string, to?: string) {
        const end = to ? new Date(to) : new Date();
        const start = from ? new Date(from) : new Date(end.getFullYear(), end.getMonth(), 1);
        return { start, end };
    }

    /** Staff-wise POS sales: order count, revenue, COD collected. */
    async staffReport(from?: string, to?: string) {
        const { start, end } = this.dateRange(from, to);
        const rows = await this.orderRepository.createQueryBuilder('order')
            .select('order.posOperatorId', 'operatorId')
            .addSelect('COUNT(order.id)', 'ordersCount')
            .addSelect('SUM(order.totalAmount)', 'revenue')
            .addSelect(`SUM(CASE WHEN order.paymentMethod = 'cash' THEN order.totalAmount ELSE 0 END)`, 'codCollected')
            .where('order.orderType = :type', { type: 'pos_sale' })
            .andWhere('order.posOperatorId IS NOT NULL')
            .andWhere('order.createdAt BETWEEN :start AND :end', { start, end })
            .groupBy('order.posOperatorId')
            .orderBy('revenue', 'DESC')
            .getRawMany();

        const ids = rows.map(r => r.operatorId).filter(Boolean);
        const staff = ids.length ? await this.adminRepository.find({ where: { id: In(ids) } }) : [];
        const nameMap = new Map(staff.map(s => [s.id, s.name]));

        return rows.map(r => ({
            operatorId: r.operatorId,
            operatorName: nameMap.get(r.operatorId) || 'Unknown',
            ordersCount: parseInt(r.ordersCount, 10) || 0,
            revenue: parseFloat(r.revenue) || 0,
            codCollected: parseFloat(r.codCollected) || 0,
        }));
    }

    /** Courier-wise POS sales: handling count, revenue, COD collected. */
    async courierReport(from?: string, to?: string) {
        const { start, end } = this.dateRange(from, to);
        const rows = await this.orderRepository.createQueryBuilder('order')
            .select('order.courierId', 'courierId')
            .addSelect('COUNT(order.id)', 'ordersCount')
            .addSelect('SUM(order.totalAmount)', 'revenue')
            .addSelect(`SUM(CASE WHEN order.paymentMethod = 'cash' THEN order.totalAmount ELSE 0 END)`, 'codCollected')
            .where('order.orderType = :type', { type: 'pos_sale' })
            .andWhere('order.courierId IS NOT NULL')
            .andWhere('order.createdAt BETWEEN :start AND :end', { start, end })
            .groupBy('order.courierId')
            .orderBy('revenue', 'DESC')
            .getRawMany();

        const ids = rows.map(r => r.courierId).filter(Boolean);
        const couriers = ids.length ? await this.courierRepository.find({ where: { id: In(ids) } }) : [];
        const nameMap = new Map(couriers.map(c => [c.id, c.name]));

        return rows.map(r => ({
            courierId: r.courierId,
            courierName: nameMap.get(r.courierId) || 'Unknown',
            ordersCount: parseInt(r.ordersCount, 10) || 0,
            revenue: parseFloat(r.revenue) || 0,
            codCollected: parseFloat(r.codCollected) || 0,
        }));
    }

    // ---------- Staff (operators) ----------
    async listStaff() {
        const staff = await this.adminRepository.find({
            where: { role: In([AdminRole.POS_USER, AdminRole.ADMIN, AdminRole.SUB_ADMIN]) },
            order: { name: 'ASC' },
        });
        return staff.map(s => ({ id: s.id, name: s.name, email: s.email, role: s.role }));
    }
}
